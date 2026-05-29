<?php

namespace App\Http\Controllers;

use App\Http\Concerns\RespondsTrait;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;

/**
 * AuthController — Authentication for both admin web & Android customer app.
 *
 * Uses Sanctum API tokens with hvn_ prefix.
 * Access tokens: 24h expiry. Refresh tokens: 30d expiry.
 * Token storage: localStorage (havana-token, havana-refresh-token)
 *
 * IMPORTANT: We do NOT use UserResource inside respondWithData() because
 * JsonResource objects can fail silently when nested inside response()->json()
 * via the respondWithData() wrapper. Instead, we build user arrays manually.
 * UserResource is only used when returned DIRECTLY from a controller method.
 */
class AuthController extends Controller
{
    use RespondsTrait;

    /**
     * Build a consistent user array for auth responses.
     * Avoids JsonResource serialization issues when nested inside respondWithData().
     */
    private function userToArray(User $user): array
    {
        return [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'full_name' => $user->fullName(),
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'avatar' => $user->avatar,
            'is_admin' => $user->isAdmin(),
            'email_verified_at' => $user->email_verified_at?->toISOString(),
            'created_at' => $user->created_at?->toISOString(),
        ];
    }

    /**
     * POST /api/auth/login
     * Authenticate user and issue access + refresh token pair.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return $this->respondError('Invalid credentials', 401);
        }

        // Revoke all existing tokens for security (single-session per device strategy)
        $user->tokens()->delete();

        // Create access token (24h) and refresh token (30d)
        $accessToken = $user->createToken(
            'access-token',
            ['*'],
            now()->addHours(24)
        )->plainTextToken;

        $refreshToken = $user->createToken(
            'refresh-token',
            ['refresh'],
            now()->addDays(30)
        )->plainTextToken;

        return $this->respondWithData([
            'user' => $this->userToArray($user),
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type' => 'Bearer',
            'expires_in' => 86400, // 24h in seconds
        ]);
    }

    /**
     * POST /api/auth/register
     * Register a new customer account.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'role' => 'customer',
        ]);

        $accessToken = $user->createToken(
            'access-token',
            ['*'],
            now()->addHours(24)
        )->plainTextToken;

        $refreshToken = $user->createToken(
            'refresh-token',
            ['refresh'],
            now()->addDays(30)
        )->plainTextToken;

        return $this->respondCreated([
            'user' => $this->userToArray($user),
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type' => 'Bearer',
            'expires_in' => 86400,
        ], 'Registration successful');
    }

    /**
     * POST /api/auth/forgot-password
     * Send a password reset link to the user's email.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $status = Password::sendResetLink(['email' => $validated['email']]);

        if ($status === Password::RESET_LINK_SENT) {
            return $this->respondWithMessage('Password reset link sent to your email');
        }

        return $this->respondError('Unable to send reset link', 400);
    }

    /**
     * POST /api/auth/reset-password
     * Reset password using the token from the email link.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        $status = Password::reset(
            $validated,
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();

                // Revoke all tokens after password reset for security
                $user->tokens()->delete();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return $this->respondWithMessage('Password reset successfully');
        }

        return $this->respondError('Invalid or expired reset token', 400);
    }

    /**
     * GET /api/auth/me
     * Get the authenticated user's profile.
     */
    public function me(Request $request): JsonResponse
    {
        return $this->respondWithData($this->userToArray($request->user()));
    }

    /**
     * POST /api/auth/logout
     * Revoke the current access token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->respondWithMessage('Logged out successfully');
    }

    /**
     * POST /api/auth/refresh
     * Exchange a valid refresh token for a new access + refresh token pair.
     */
    public function refresh(Request $request): JsonResponse
    {
        $token = $request->user()->currentAccessToken();

        if (!$token || !in_array('refresh', $token->abilities ?? [])) {
            return $this->respondError('Invalid refresh token', 401);
        }

        $user = $request->user();

        // Delete old token pair
        $user->tokens()->delete();

        // Issue new token pair
        $accessToken = $user->createToken(
            'access-token',
            ['*'],
            now()->addHours(24)
        )->plainTextToken;

        $refreshToken = $user->createToken(
            'refresh-token',
            ['refresh'],
            now()->addDays(30)
        )->plainTextToken;

        return $this->respondWithData([
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type' => 'Bearer',
            'expires_in' => 86400,
        ]);
    }

    /**
     * PUT /api/auth/profile
     * Update the authenticated user's profile.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string', 'max:20'],
            'avatar' => ['nullable', 'string', 'max:500'],
        ]);

        $user->update($validated);

        return $this->respondWithData($this->userToArray($user), 'Profile updated successfully');
    }

    /**
     * PUT /api/auth/password
     * Change the authenticated user's password.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return $this->respondError('Current password is incorrect', 422);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Revoke all tokens except current for security
        $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();

        return $this->respondWithMessage('Password changed successfully');
    }
}
