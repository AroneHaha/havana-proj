<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authentication Routes — Havana Flower Shop
|--------------------------------------------------------------------------
|
| These routes handle all authentication flows used by both the web admin
| dashboard and the Android customer app. Rate limiting is applied to
| sensitive endpoints to prevent brute-force attacks.
|
| Frontend source: services/auth-service.ts
| Token storage:   localStorage (havana-token, havana-refresh-token)
| Auth header:     Authorization: Bearer {token}
|
*/

Route::prefix('auth')->group(function () {

    // ─── Debug / Health Check (no auth) ─────────────────────────────
    // Simple endpoint to verify API connectivity and CORS — remove in production
    Route::get('/ping', function () {
        return response()->json([
            'data' => [
                'message' => 'Havana API is running',
                'timestamp' => now()->toISOString(),
            ],
        ]);
    });

    // ─── Public (no auth required) ────────────────────────────────────
    // Throttled to prevent abuse on login/forgot-password

    Route::middleware('throttle:auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])
            ->name('auth.login');

        // DISABLED: Public registration closed — admin-only app.
        // Route::post('/register', [AuthController::class, 'register'])
        //     ->name('auth.register');

        Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
            ->name('auth.forgot-password');

        Route::post('/reset-password', [AuthController::class, 'resetPassword'])
            ->name('auth.reset-password');
    });

    // ─── Authenticated (Sanctum token required) ──────────────────────

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me'])
            ->name('auth.me');

        Route::post('/logout', [AuthController::class, 'logout'])
            ->name('auth.logout');

        Route::post('/refresh', [AuthController::class, 'refresh'])
            ->name('auth.refresh');

        // Profile update — needed for Android customer app
        Route::put('/profile', [AuthController::class, 'updateProfile'])
            ->name('auth.profile.update');

        // Password change — needed for both admin & customer
        Route::put('/password', [AuthController::class, 'changePassword'])
            ->name('auth.password.change');
    });
});