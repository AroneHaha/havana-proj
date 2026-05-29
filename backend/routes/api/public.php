<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes — Browse storefront without authentication
|--------------------------------------------------------------------------
|
| These routes serve the public-facing storefront. Both the web frontend
| and the Android app consume these for browsing products and categories.
| No authentication is required — uses publicFetch in the frontend.
|
| Frontend source: services/product-service.ts (publicFetch)
| Note: All endpoints accept ?locale=en|ar for bilingual content
|
*/

// ─── Products ─────────────────────────────────────────────────────────
// Frontend source: product-service.ts

Route::prefix('products')->group(function () {
    // GET /api/products — list with filters
    // Supported filters: filter[is_featured], filter[is_best_seller],
    //                    filter[category], page, per_page, locale
    Route::get('/', [ProductController::class, 'index'])
        ->name('products.index');

    // GET /api/products/{product} — single product detail (route model binding)
    Route::get('/{product}', [ProductController::class, 'show'])
        ->name('products.show');
});

// ─── Categories ───────────────────────────────────────────────────────
// Used by Android app for category browsing & product filtering
// Web frontend filters by category via products endpoint

Route::prefix('categories')->group(function () {
    // GET /api/categories — list all categories
    // Accepts: ?locale=en|ar
    Route::get('/', [CategoryController::class, 'index'])
        ->name('categories.index');

    // GET /api/categories/{category} — single category with products
    Route::get('/{category}', [CategoryController::class, 'show'])
        ->name('categories.show');
});
