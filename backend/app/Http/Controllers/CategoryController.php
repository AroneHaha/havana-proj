<?php

namespace App\Http\Controllers;

use App\Http\Concerns\RespondsTrait;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Public CategoryController — Customer-facing category browsing.
 *
 * No authentication required. Used by both web storefront and Android app.
 * Supports bilingual content via ?locale=en|ar query parameter.
 */
class CategoryController extends Controller
{
    use RespondsTrait;

    /**
     * GET /api/categories
     * List all active categories.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Category::where('is_active', true)->withCount('products');

        // Search by name
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name_en', 'LIKE', "%{$search}%")
                    ->orWhere('name_ar', 'LIKE', "%{$search}%");
            });
        }

        $categories = $query->orderBy('sort_order')->orderByDesc('created_at')->get();

        return $this->respondWithData(CategoryResource::collection($categories));
    }

    /**
     * GET /api/categories/{category}
     * Single category with its active products.
     */
    public function show(Category $category): JsonResponse
    {
        if (!$category->is_active) {
            return $this->respondNotFound('Category not found');
        }

        $category->load(['products' => function ($query) {
            $query->where('is_active', true);
        }]);
        $category->loadCount('products');

        return $this->respondWithData(new CategoryResource($category));
    }
}
