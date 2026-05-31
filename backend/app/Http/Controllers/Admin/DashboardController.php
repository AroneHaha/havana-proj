<?php

namespace App\Http\Controllers\Admin;

use App\Http\Concerns\RespondsTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\OrderResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

/**
 * DashboardController — Combined dashboard summary endpoint.
 *
 * Replaces 5 separate API calls with 1 call, reducing Supabase
 * cold-start penalties from 5×3-6s to just 1×3-6s.
 *
 * GET /api/admin/dashboard/summary
 */
class DashboardController extends Controller
{
    use RespondsTrait;

    /**
     * GET /api/admin/dashboard/summary
     * Returns all dashboard data in a single response.
     */
    public function summary(): JsonResponse
    {
        // ─── Order Stats ──────────────────────────────────────────────
        $totalRevenue = Order::whereNotIn('status', ['cancelled'])
            ->selectRaw('COALESCE(SUM(total), 0) as total_revenue')
            ->value('total_revenue');

        $averageOrderValue = Order::whereNotIn('status', ['cancelled'])
            ->selectRaw('COALESCE(AVG(total), 0) as average_order_value')
            ->value('average_order_value');

        $statusCounts = Order::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $allStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
        $statusCounts = array_merge(array_fill_keys($allStatuses, 0), $statusCounts);

        $recentOrders = Order::with(['user', 'items'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // ─── Product Stats ────────────────────────────────────────────
        $totalProducts = Product::count();
        $totalValue = Product::selectRaw('COALESCE(SUM(COALESCE(sale_price, price)), 0) as total_value')
            ->value('total_value');
        $lowStockCount = Product::where('stock', '>', 0)->where('stock', '<=', 10)->count();
        $outOfStockCount = Product::where('stock', '<=', 0)->count();

        $alertProducts = Product::where('stock', '<=', 10)
            ->orderBy('stock')
            ->limit(5)
            ->get();

        // ─── Review Stats ─────────────────────────────────────────────
        $averageRating = Review::avg('rating') ?? 0;
        $totalReviews = Review::count();

        $ratingDistribution = Review::select('rating', DB::raw('COUNT(*) as count'))
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        $ratingDistribution = array_merge(
            [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0],
            $ratingDistribution
        );
        ksort($ratingDistribution);

        $recentReviews = Review::with(['user', 'product'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // ─── Build response ───────────────────────────────────────────
        return response()->json([
            'data' => [
                'orders' => [
                    'stats' => [
                        'total_revenue' => bcmul((string) $totalRevenue, '1', 3),
                        'average_order_value' => bcmul((string) $averageOrderValue, '1', 3),
                        'status_counts' => $statusCounts,
                    ],
                    'recent' => OrderResource::collection($recentOrders),
                ],
                'products' => [
                    'stats' => [
                        'total_products' => $totalProducts,
                        'total_value' => bcmul((string) $totalValue, '1', 3),
                        'low_stock_count' => $lowStockCount,
                        'out_of_stock_count' => $outOfStockCount,
                    ],
                    'alerts' => $alertProducts->map(function ($p) {
                        return [
                            'id' => $p->id,
                            'slug' => $p->slug,
                            'name' => $p->name_en ?? $p->name,
                            'name_en' => $p->name_en,
                            'name_ar' => $p->name_ar,
                            'description' => $p->description_en ?? $p->description,
                            'description_en' => $p->description_en,
                            'description_ar' => $p->description_ar,
                            'price' => (float) $p->price,
                            'sale_price' => $p->sale_price ? (float) $p->sale_price : null,
                            'effective_price' => (float) ($p->sale_price ?? $p->price),
                            'is_on_sale' => $p->sale_price !== null,
                            'image' => $p->image,
                            'images' => $p->images ?? [],
                            'stock' => $p->stock,
                            'rating' => (float) ($p->rating ?? 0),
                            'reviews_count' => $p->reviews_count ?? 0,
                            'in_stock' => $p->stock > 0,
                            'is_featured' => (bool) $p->is_featured,
                            'is_best_seller' => (bool) $p->is_best_seller,
                            'is_new' => (bool) ($p->is_new ?? false),
                            'is_active' => (bool) $p->is_active,
                            'category_id' => $p->category_id,
                            'category' => $p->category ? [
                                'id' => $p->category->id,
                                'name' => $p->category->name_en ?? $p->category->name,
                                'slug' => $p->category->slug,
                            ] : null,
                            'created_at' => $p->created_at?->toIso8601String(),
                        ];
                    }),
                ],
                'reviews' => [
                    'stats' => [
                        'average_rating' => round((float) $averageRating, 1),
                        'total_reviews' => $totalReviews,
                        'rating_distribution' => $ratingDistribution,
                    ],
                    'recent' => $recentReviews->map(function ($r) {
                        return [
                            'id' => $r->id,
                            'product_id' => $r->product_id,
                            'user_id' => $r->user_id,
                            'rating' => $r->rating,
                            'title' => $r->title,
                            'comment' => $r->comment,
                            'visibility' => $r->visibility,
                            'user' => $r->user ? [
                                'id' => $r->user->id,
                                'first_name' => $r->user->first_name,
                                'last_name' => $r->user->last_name,
                                'email' => $r->user->email,
                            ] : null,
                            'product' => $r->product ? [
                                'id' => $r->product->id,
                                'name' => $r->product->name_en ?? $r->product->name,
                                'name_en' => $r->product->name_en,
                                'image' => $r->product->image,
                                'slug' => $r->product->slug,
                                'price' => (float) $r->product->price,
                            ] : null,
                            'created_at' => $r->created_at?->toIso8601String(),
                            'updated_at' => $r->updated_at?->toIso8601String(),
                        ];
                    }),
                ],
            ],
        ]);
    }
}
