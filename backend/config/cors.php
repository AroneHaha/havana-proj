<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Havana is an API-only backend serving:
    |   - Next.js web admin dashboard (http://localhost:3000)
    |   - Android customer app (API token auth)
    |
    | These settings allow the frontend to make authenticated cross-origin
    | requests to the Laravel API. Adjust allowed_origins for production.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'up'],

    'allowed_methods' => ['*'],

    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:3000')),

    'allowed_origins_patterns' => ['/localhost:\d+/'], // Allow any localhost port for dev

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400, // 24 hours — cache preflight for a full day

    'supports_credentials' => true, // Required for Sanctum token auth with Authorization header

];
