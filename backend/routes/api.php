<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Havana Flower Shop
|--------------------------------------------------------------------------
|
| This file serves as the orchestrator for all API route definitions.
| Routes are split into domain-specific files for maintainability:
|
|   routes/api/auth.php     → Authentication (login, register, token refresh)
|   routes/api/public.php   → Public storefront (products, categories)
|   routes/api/customer.php → Customer actions (cart, checkout, orders, reviews)
|   routes/api/admin.php    → Admin dashboard (CRUD, stats, management)
|
| All routes are auto-prefixed with /api by Laravel.
| Rate limiting and middleware are configured per-group in each file.
|
*/

// Load domain-specific route files
Route::middleware('api')->group(function () {
    require __DIR__ . '/api/auth.php';
    require __DIR__ . '/api/public.php';
    require __DIR__ . '/api/customer.php';
    require __DIR__ . '/api/admin.php';
});
