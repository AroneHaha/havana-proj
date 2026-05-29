<?php

use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Support\Facades\RateLimiter;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // ─── Middleware Aliases ─────────────────────────────────────
        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
        ]);

        // ─── API Middleware Group ───────────────────────────────────
        // Ensure JSON responses for API routes (no /api fallback to web)
        $middleware->api(prepend: [
            HandleCors::class,  // CORS for cross-origin requests (Next.js → Laravel)
        ]);

        // ─── Global Middleware ─────────────────────────────────────
        // Sanctum already handles API token auth via auth:sanctum guard
        // No need to add it globally — applied per-route-group
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // API exception handling — always return JSON for /api routes
        $exceptions->shouldRenderJsonWhen(fn () => true);
    })
    ->booted(function () {
        // ─── Rate Limiter Configuration ────────────────────────────

        // Auth endpoints: 5 requests per minute per IP
        // Prevents brute-force on login/register/forgot-password
        RateLimiter::for('auth', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(5)
                ->by($request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Too many attempts. Please try again in a minute.',
                    ], 429);
                });
        });

        // General API: 60 requests per minute per user (or per IP if unauthenticated)
        RateLimiter::for('api', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(60)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Too many requests. Please slow down.',
                    ], 429);
                });
        });
    })
    ->create();
