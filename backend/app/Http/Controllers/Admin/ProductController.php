<?php

namespace App\Http\Controllers\Admin;

use App\Http\Concerns\RespondsTrait;
use App\Http\Resources\Admin\ProductResource;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Admin ProductController — Full CRUD + stats for products.
 *
 * All methods are admin-only (enforced by route middleware).
 * Handles both JSON and FormData (multipart) for store/update.
 *
 * Image handling:
 *   - `image` field: single file upload → stored to public disk → URL saved in DB
 *   - `images` field: array of file uploads → stored to public disk → URLs saved in DB
 *   - `existing_images` field: array of URL strings to keep during update
 *   - When sending via FormData: use `image` as file, `images[]` as files
 *   - When sending via JSON: pass URL strings (backward compatible)
 */
class ProductController extends \App\Http\Controllers\Controller
{
    use RespondsTrait;

    /**
     * GET /api/admin/products/stats
     * Product statistics for the admin dashboard.
     */
    public function stats(): JsonResponse
    {
        $totalProducts = Product::count();
        $totalValue = Product::selectRaw('COALESCE(SUM(COALESCE(sale_price, price)), 0) as total_value')
            ->value('total_value');
        $lowStockCount = Product::where('stock', '>', 0)->where('stock', '<=', 10)->count();
        $outOfStockCount = Product::where('stock', '<=', 0)->count();

        return $this->respondWithStats([
            'total_products' => $totalProducts,
            'total_value' => bcmul((string) $totalValue, '1', 3),
            'low_stock_count' => $lowStockCount,
            'out_of_stock_count' => $outOfStockCount,
        ]);
    }

    /**
     * GET /api/admin/products
     * Paginated product list with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category');

        // Search by name, slug, or SKU
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $op = $this->ilike();
                $q->where('name_en', $op, "%{$search}%")
                    ->orWhere('name_ar', $op, "%{$search}%")
                    ->orWhere('slug', $op, "%{$search}%")
                    ->orWhere('sku', $op, "%{$search}%");
            });
        }

        // Filter by category
        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // Filter by featured flag
        if ($request->has('is_featured')) {
            $query->where('is_featured', filter_var($request->query('is_featured'), FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by best seller flag
        if ($request->has('is_best_seller')) {
            $query->where('is_best_seller', filter_var($request->query('is_best_seller'), FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by stock availability
        if ($request->has('in_stock')) {
            $inStock = filter_var($request->query('in_stock'), FILTER_VALIDATE_BOOLEAN);
            $inStock ? $query->where('stock', '>', 0) : $query->where('stock', '<=', 0);
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
     * POST /api/admin/products
     * Create a new product. Accepts JSON or FormData (multipart).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'uuid', Rule::exists('categories', 'id')],
            'name_en' => ['required', 'string', 'max:255'],
            'name_ar' => ['required', 'string', 'max:255'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('products', 'slug')],
            'price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0', 'lt:price'],
            'image' => ['nullable', 'image', 'max:5120'], // 5MB max, must be image
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:5120'], // Each image: 5MB max
            'sku' => ['nullable', 'string', 'max:100', Rule::unique('products', 'sku')],
            'stock' => ['required', 'integer', 'min:0'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'is_featured' => ['nullable', 'boolean'],
            'is_best_seller' => ['nullable', 'boolean'],
            'is_new' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        // Auto-generate slug from name_en if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = $this->generateUniqueSlug($validated['name_en']);
        }

        // Cast numeric fields to string for bcmul precision
        if (isset($validated['price'])) {
            $validated['price'] = bcmul((string) $validated['price'], '1', 3);
        }
        if (isset($validated['sale_price'])) {
            $validated['sale_price'] = bcmul((string) $validated['sale_price'], '1', 3);
        }

        // ── Handle image uploads ──
        // Single main image (file upload)
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        // Multiple images (file uploads)
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $imagePaths[] = $file->store('products', 'public');
            }
        }
        $validated['images'] = !empty($imagePaths) ? $imagePaths : null;

        $product = Product::create($validated);
        $product->load('category', 'reviews');

        return $this->respondCreated(new ProductResource($product), 'Product created successfully');
    }

    /**
     * GET /api/admin/products/{product}
     * Single product detail with category and reviews.
     */
    public function show(Product $product): JsonResponse
    {
        $product->load('category', 'reviews.product', 'reviews.user');

        return $this->respondWithData(new ProductResource($product));
    }

    /**
     * PATCH /api/admin/products/{product}
     * Partial update. Accepts JSON or FormData (multipart with _method=PATCH spoofing).
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['sometimes', 'uuid', Rule::exists('categories', 'id')],
            'name_en' => ['sometimes', 'string', 'max:255'],
            'name_ar' => ['sometimes', 'string', 'max:255'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($product->id)],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'image' => ['nullable', 'image', 'max:5120'], // 5MB max
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:5120'], // Each image: 5MB max
            'existing_images' => ['nullable', 'array'],
            'existing_images.*' => ['string', 'max:500'], // URLs to keep
            'sku' => ['nullable', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($product->id)],
            'stock' => ['sometimes', 'integer', 'min:0'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'is_featured' => ['nullable', 'boolean'],
            'is_best_seller' => ['nullable', 'boolean'],
            'is_new' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        // Auto-generate slug from name_en if name_en changed and slug not provided
        if (isset($validated['name_en']) && !isset($validated['slug'])) {
            $validated['slug'] = $this->generateUniqueSlug($validated['name_en'], $product->id);
        }

        // Cast numeric fields to string for bcmul precision
        if (isset($validated['price'])) {
            $validated['price'] = bcmul((string) $validated['price'], '1', 3);
        }
        if (array_key_exists('sale_price', $validated) && $validated['sale_price'] !== null) {
            $validated['sale_price'] = bcmul((string) $validated['sale_price'], '1', 3);
        }

        // Validate sale_price < price only when sale_price is explicitly provided
        if (array_key_exists('sale_price', $validated) && $validated['sale_price'] !== null) {
            $effectivePrice = $validated['price'] ?? $product->price;
            if (bccomp((string) $validated['sale_price'], (string) $effectivePrice, 3) >= 0) {
                return $this->respondError('Sale price must be less than the regular price', 422);
            }
        }

        // When price is updated but sale_price is not, auto-clear sale_price if it conflicts
        if (isset($validated['price']) && !array_key_exists('sale_price', $validated)) {
            $currentSalePrice = $product->sale_price;
            if ($currentSalePrice !== null && bccomp((string) $currentSalePrice, (string) $validated['price'], 3) >= 0) {
                $validated['sale_price'] = null;
            }
        }

        // ── Handle image uploads ──
        // Single main image (file upload)
        if ($request->hasFile('image')) {
            // Delete old main image if it exists
            if ($product->image) {
                $this->deleteImageFile($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        // Multiple images: merge existing (kept) + newly uploaded
        $finalImages = [];

        // Keep existing images that the frontend says to preserve
        $existingImages = $request->input('existing_images', []);
        if (is_array($existingImages)) {
            $finalImages = array_values(array_filter($existingImages, fn($url) => is_string($url) && !empty($url)));
        }

        // Append newly uploaded files
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $finalImages[] = $file->store('products', 'public');
            }
        }

        // Only update images if any were provided (new or existing)
        if (!empty($finalImages) || $request->hasFile('images') || $request->has('existing_images')) {
            // Clean up old images that are no longer in the final list
            $oldImages = $product->images ?? [];
            foreach ($oldImages as $oldPath) {
                if (!in_array($oldPath, $finalImages)) {
                    $this->deleteImageFile($oldPath);
                }
            }
            $validated['images'] = $finalImages;
        }

        $product->update($validated);
        $product->load('category', 'reviews');

        return $this->respondWithData(new ProductResource($product), 'Product updated successfully');
    }

    /**
     * DELETE /api/admin/products/{product}
     * Soft delete a product.
     */
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return $this->respondWithMessage('Product deleted successfully');
    }

    /**
     * Generate a unique slug from the given name.
     */
    private function generateUniqueSlug(string $name, ?string $ignoreId = null): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        $query = Product::where('slug', $slug);
        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        while ($query->exists()) {
            $slug = "{$originalSlug}-{$counter}";
            $counter++;
            $query = Product::where('slug', $slug);
            if ($ignoreId) {
                $query->where('id', '!=', $ignoreId);
            }
        }

        return $slug;
    }

    /**
     * Delete an image file from the public disk.
     * Handles both relative paths (products/abc.jpg) and full URLs.
     */
    private function deleteImageFile(string $path): void
    {
        // If it's a full URL, extract the path part
        if (str_starts_with($path, 'http')) {
            $parsed = parse_url($path);
            $path = ltrim($parsed['path'] ?? '', '/storage/');
        }

        // Only delete if it's a local stored file (not an external URL)
        if ($path && !str_starts_with($path, 'http') && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
