<?php

namespace App\Http\Controllers\Admin;

use App\Http\Concerns\RespondsTrait;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Admin CategoryController — Full CRUD for categories.
 *
 * All methods are admin-only (enforced by route middleware).
 * Slug is auto-generated from name_en if not provided.
 */
class CategoryController extends \App\Http\Controllers\Controller
{
    use RespondsTrait;

    /**
     * GET /api/admin/categories
     * List categories with search and products count.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Category::withCount('products');

        // Search by name
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name_en', 'ilike', "%{$search}%")
                    ->orWhere('name_ar', 'ilike', "%{$search}%")
                    ->orWhere('slug', 'ilike', "%{$search}%");
            });
        }

        $perPage = (int) ($request->query('per_page', 15));
        $categories = $query->orderBy('sort_order')->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'data' => CategoryResource::collection($categories->items()),
            'meta' => [
                'current_page' => $categories->currentPage(),
                'last_page' => $categories->lastPage(),
                'per_page' => $categories->perPage(),
                'total' => $categories->total(),
                'from' => $categories->firstItem(),
                'to' => $categories->lastItem(),
            ],
        ]);
    }

    /**
     * POST /api/admin/categories
     * Create a new category. Auto-generates slug from name_en.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name_en' => ['required', 'string', 'max:255'],
            'name_ar' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('categories', 'slug')],
            'image' => ['nullable', 'string', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        // Auto-generate slug from name_en if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = $this->generateUniqueSlug($validated['name_en']);
        }

        // Set default sort_order if not provided
        if (!isset($validated['sort_order'])) {
            $validated['sort_order'] = Category::max('sort_order') + 1 ?? 0;
        }

        $category = Category::create($validated);
        $category->loadCount('products');

        return $this->respondCreated(new CategoryResource($category), 'Category created successfully');
    }

    /**
     * GET /api/admin/categories/{category}
     * Single category detail with products.
     */
    public function show(Category $category): JsonResponse
    {
        $category->load('products');
        $category->loadCount('products');

        return $this->respondWithData(new CategoryResource($category));
    }

    /**
     * PATCH /api/admin/categories/{category}
     * Partial update of a category.
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name_en' => ['sometimes', 'string', 'max:255'],
            'name_ar' => ['sometimes', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('categories', 'slug')->ignore($category->id)],
            'image' => ['nullable', 'string', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        // Auto-regenerate slug from name_en if name_en changed and slug not provided
        if (isset($validated['name_en']) && !isset($validated['slug'])) {
            $validated['slug'] = $this->generateUniqueSlug($validated['name_en'], $category->id);
        }

        $category->update($validated);
        $category->loadCount('products');

        return $this->respondWithData(new CategoryResource($category), 'Category updated successfully');
    }

    /**
     * DELETE /api/admin/categories/{category}
     * Soft delete a category.
     */
    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return $this->respondWithMessage('Category deleted successfully');
    }

    /**
     * Generate a unique slug from the given name.
     */
    private function generateUniqueSlug(string $name, ?string $ignoreId = null): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        $query = Category::where('slug', $slug);
        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        while ($query->exists()) {
            $slug = "{$originalSlug}-{$counter}";
            $counter++;
            $query = Category::where('slug', $slug);
            if ($ignoreId) {
                $query->where('id', '!=', $ignoreId);
            }
        }

        return $slug;
    }
}
