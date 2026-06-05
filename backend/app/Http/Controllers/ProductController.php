<?php

namespace App\Http\Controllers;

use App\Http\Concerns\RespondsTrait;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use RespondsTrait;

    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category')->where('is_active', true);

        if ($request->has('filter.is_featured')) {
            $query->where('is_featured', filter_var($request->input('filter.is_featured'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('filter.is_best_seller')) {
            $query->where('is_best_seller', filter_var($request->input('filter.is_best_seller'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($categoryId = $request->input('filter.category')) {
            $query->where('category_id', $categoryId);
        }

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

    public function show(Product $product): JsonResponse
    {
        if (!$product->is_active) {
            return $this->respondNotFound('Product not found');
        }

        $product->loadCount(['reviews' => function ($query) {
            $query->where('visibility', 'visible');
        }]);
        $product->load(['category', 'reviews' => function ($query) {
            $query->where('visibility', 'visible');
        }, 'reviews.user']);

        return $this->respondWithData(new ProductResource($product));
    }
}