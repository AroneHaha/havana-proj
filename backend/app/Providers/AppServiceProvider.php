<?php

namespace App\Providers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Observers\OrderObserver;
use App\Observers\ProductObserver;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\ServiceProvider;
use Illuminate\Http\Resources\Json\JsonResource;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Disable JsonResource's automatic { data: ... } wrapping.
        JsonResource::withoutWrapping();

        // ── Model Observers ──
        Order::observe(OrderObserver::class);
        Product::observe(ProductObserver::class);

        // FIX: Bust the cached admin ID list whenever a user's role is saved.
        // Both ProductObserver and OrderObserver share the 'admin_ids' cache key.
        // Without this, adding/removing admins would not be reflected until the
        // 1-hour TTL expires.
        User::saved(function (User $user) {
            if ($user->isDirty('role')) {
                Cache::forget('admin_ids');
            }
        });

        User::deleted(function (User $user) {
            // Bust on deletion too — a deleted admin should stop receiving notifications
            Cache::forget('admin_ids');
        });
    }
}
