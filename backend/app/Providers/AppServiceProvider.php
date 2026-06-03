<?php

namespace App\Providers;

use App\Models\Order;
use App\Models\Product;
use App\Observers\OrderObserver;
use App\Observers\ProductObserver;
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
        // Havana uses respondWithData() which adds its own { data: ... } wrapper.
        // Without this, resources returned directly from controllers would get
        // double-wrapped: { data: { data: { ... } } }.
        JsonResource::withoutWrapping();

        // ── Model Observers ──
        // Auto-fire notifications when orders are placed or stock drops low.
        Order::observe(OrderObserver::class);
        Product::observe(ProductObserver::class);
    }
}