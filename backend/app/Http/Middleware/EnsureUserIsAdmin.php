<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * EnsureUserIsAdmin — Redirects/blocks non-admin users.
 *
 * Used as route middleware alias 'admin' in bootstrap/app.php.
 * Applied to all /api/admin/* routes to restrict access to admin users only.
 *
 * Expects the authenticated user to have an is_admin flag or role = 'admin'.
 * Returns 403 JSON for API requests (no redirect since this is an API-only app).
 */
class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->isAdmin()) {
            return response()->json([
                'message' => 'Access denied. Admin privileges required.',
            ], 403);
        }

        return $next($request);
    }
}
