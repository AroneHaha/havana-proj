<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Defaults — Havana Flower Shop
    |--------------------------------------------------------------------------
    |
    | Havana uses Laravel Sanctum for API token authentication.
    | The 'web' guard is the default for session-based fallback
    | (rarely used since we're API-only, but required by Sanctum).
    |
    | The 'sanctum' guard is used for API token auth on /api routes.
    |
    */

    'defaults' => [
        'guard' => 'web',
        'passwords' => 'users',
    ],

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],

        'sanctum' => [
            'driver' => 'sanctum',
            'provider' => 'users',
        ],
    ],

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => App\Models\User::class,
        ],
    ],

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => 'password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => 10800,

];
