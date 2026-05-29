<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Password reset route — required by Laravel's ResetPassword notification
// to generate the reset URL. The actual reset is handled by the API endpoint.
Route::get('/reset-password/{token}', function () {
    // This route exists solely so route('password.reset') resolves.
    // The Android app / frontend handles the actual password reset UI.
})->name('password.reset');
