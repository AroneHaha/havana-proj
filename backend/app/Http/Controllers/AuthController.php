<?php

namespace App\Http\Controllers;

use App\Http\Concerns\RespondsTrait;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    use RespondsTrait;

    private const ACCESS_TOKEN_EXPIRY_MINUTES = 60 * 24; // 24 hours
    private const REFRESH_TOKEN_EXPIRY_DAYS = 30;

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

        $user->tokens()->delete();

        $tokenPair = $this->createTokenPair($user);

        // IMPORTANT: Use response()->json() directly (NOT respondWithData)
        // Frontend expects flat { user, token, refresh_token }
        return response()->json([
            'user' => new UserResource($user),
            'token' => $tokenPair['access'],
            'refresh_token' => $tokenPair['refresh'],
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'password' => $validated['password'],  // hashed cast auto-hashes
            'phone' => $validated['phone'] ?? null,
            'role' => 'customer',
        ]);

        $tokenPair = $this->createTokenPair($user);

        return response()->json([
            'user' => new UserResource($user),
            'token' => $tokenPair['access'],
            'refresh_token' => $tokenPair['refresh'],
        ], 201);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        // Store a reset token (email sending not configured yet)
        $token = Str::random(64);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $validated['email']],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        return $this->respondWithMessage('Password reset link sent to your email');
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', 'string', 'min:8'],
        ]);

        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $validated['email'])->first();

        if (!$resetRecord || !Hash::check($validated['token'], $resetRecord->token)) {
            return $this->respondError('Invalid or expired reset token', 400);
        }

        $user = User::where('email', $validated['email'])->first();
        if ($user) {
            $user->update(['password' => $validated['password']]);  // hashed cast auto-hashes
            $user->tokens()->delete();
        }

        DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();

        return $this->respondWithMessage('Password reset successfully');
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $currentToken = $request->user()->currentAccessToken();
        if ($currentToken) {
            if ($currentToken->can('access')) {
                $request->user()->tokens()->delete();
            } else {
                $currentToken->delete();
            }
        }
        return $this->respondWithMessage('Logged out successfully');
    }

    public function refresh(Request $request): JsonResponse
    {
        $token = $request->user()->currentAccessToken();

        if (!$token || !in_array('refresh', $token->abilities ?? [])) {
            return $this->respondError('Invalid refresh token', 401);
        }

        $user = $request->user();
        $user->tokens()->delete();

        $tokenPair = $this->createTokenPair($user);

        return response()->json([
            'token' => $tokenPair['access'],
            'refresh_token' => $tokenPair['refresh'],
        ]);
    }

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

        return response()->json([
            'user' => new UserResource($user->fresh()),
            'message' => 'Profile updated successfully',
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', 'string', 'min:8'],
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return $this->respondError('Current password is incorrect', 422);
        }

        $user->update(['password' => $validated['password']]);  // hashed cast auto-hashes

        $currentTokenId = $user->currentAccessToken()?->id;
        $user->tokens()->when($currentTokenId, function ($query, $currentTokenId) {
            $query->where('id', '!=', $currentTokenId);
        })->delete();

        return $this->respondWithMessage('Password changed successfully');
    }

    private function createTokenPair(User $user): array
    {
        $accessToken = $user->createToken(
            'access-token',
            ['access'],
            now()->addMinutes(self::ACCESS_TOKEN_EXPIRY_MINUTES)
        )->plainTextToken;

        $refreshToken = $user->createToken(
            'refresh-token',
            ['refresh'],
            now()->addDays(self::REFRESH_TOKEN_EXPIRY_DAYS)
        )->plainTextToken;

        return [
            'access' => $accessToken,
            'refresh' => $refreshToken,
        ];
    }
}