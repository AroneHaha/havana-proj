<?php

use Laravel\Sanctum\Sanctum;

return [

    /*
    |--------------------------------------------------------------------------
    | Sanctum Configuration — Havana API Token Authentication
    |--------------------------------------------------------------------------
    |
    | Havana uses Sanctum for API token authentication (NOT SPA cookie auth).
    | Both the Next.js admin dashboard and the Android customer app
    | authenticate via Bearer tokens in the Authorization header.
    |
    | Key difference from SPA mode:
    |   - SPA mode: Uses cookies + CSRF, requires session middleware
    |   - API token mode: Uses Authorization header, stateless
    |
    | We explicitly disable SPA-related features since we're token-only.
    |
    */

    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', '')),

    'guard' => ['web'], // Fallback guard for authentication

    'expiration' => env('SANCTUM_TOKEN_EXPIRATION', null), // null = tokens never expire (use refresh instead)

    'token_prefix' => 'hvn_', // Havana token prefix for identification

    /*
    |--------------------------------------------------------------------------
    | Sanctum Middleware
    |--------------------------------------------------------------------------
    |
    | Since Havana is API-only (no SPA cookie auth), we don't need
    | the EnsureFrontendRequestsAreStateful middleware. The auth:sanctum
    | guard works with API tokens out of the box for /api routes.
    |
    */

];
