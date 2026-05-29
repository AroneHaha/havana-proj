<?php

namespace App\Http\Controllers;

use App\Http\Concerns\RespondsTrait;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Public ProductController — Customer-facing product browsing.
 *
 * No authentication required. Used by both web storefront and Android app.
 * Supports bilingual content via ?locale=en|ar query parameter.
 */
class ProductController extends Controller
{
    use RespondsTrait;

    /**
     * GET /api/products
     * List products with filters and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category')->where('is_active', true);

        // Filter by featured flag
        if ($request->has('filter.is_featured')) {
            $query->where('is_featured', filter_var($request->input('filter.is_featured'), FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by best seller flag
        if ($request->has('filter.is_best_seller')) {
            $query->where('is_best_seller', filter_var($request->input('filter.is_best_seller'), FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by category
        if ($categoryId = $request->input('filter.category')) {
            $query->where('category_id', $categoryId);
        }

        // Search by name
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name_en', 'LIKE', "%{$search}%")
                    ->orWhere('name_ar', 'LIKE', "%{$search}%");
            });
        }

        $perPage = (int) ($request->query('per_page', 15));
        $products = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'data' => ProductResource::collection($products->items()),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem(),
            ],
        ]);
    }

    /**
     * GET /api/products/{product}
     * Single product detail with category and visible reviews.
     */
    public function show(Product $product): JsonResponse
    {
        if (!$product->is_active) {
            return $this->respondNotFound('Product not found');
        }

        $product->load(['category', 'reviews' => function ($query) {
            $query->where('visibility', 'visible');
        }, 'reviews.user']);

        return $this->respondWithData(new ProductResource($product));
    }
}
