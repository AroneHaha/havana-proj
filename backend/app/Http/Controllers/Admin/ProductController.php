<?php

namespace App\Http\Controllers\Admin;

use App\Http\Concerns\RespondsTrait;
use App\Http\Resources\Admin\ProductResource;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
 *   - `image` field: single file upload → stored to Supabase Storage → path saved in DB
 *   - `images` field: array of file uploads → stored to Supabase Storage → paths saved in DB
 *   - `existing_images` field: array of URL strings to keep during update
 *   - When sending via FormData: use `image` as file, `images[]` as files
 *   - When sending via JSON: pass URL strings (backward compatible)
 *   - Uses Supabase S3-compatible storage; falls back to local public disk if not configured
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
        $disk = $this->storageDisk();

        Log::info('Product store: disk determined', ['disk' => $disk]);

        // Single main image (file upload)
        if ($request->hasFile('image')) {
            try {
                $path = $request->file('image')->store('products', $disk);
                Log::info('Product store: main image uploaded', ['path' => $path, 'disk' => $disk]);
                $validated['image'] = $path;
            } catch (\Throwable $e) {
                Log::error('Product store: main image upload FAILED', [
                    'disk' => $disk,
                    'error' => $e->getMessage(),
                    'class' => get_class($e),
                    'trace' => $e->getTraceAsString(),
                ]);
                return $this->respondError('Image upload failed: ' . $e->getMessage(), 500);
            }
        }

        // Multiple images (file uploads)
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $i => $file) {
                try {
                    $path = $file->store('products', $disk);
                    Log::info('Product store: gallery image uploaded', ['index' => $i, 'path' => $path, 'disk' => $disk]);
                    if ($path) $imagePaths[] = $path;
                } catch (\Throwable $e) {
                    Log::error('Product store: gallery image upload FAILED', [
                        'index' => $i,
                        'disk' => $disk,
                        'error' => $e->getMessage(),
                        'class' => get_class($e),
                    ]);
                    return $this->respondError('Image upload failed: ' . $e->getMessage(), 500);
                }
            }
        }
        $validated['images'] = !empty($imagePaths) ? $imagePaths : null;

        // Auto-set main image from first gallery image if not explicitly provided
        if (empty($validated['image']) && !empty($validated['images'])) {
            $validated['image'] = $validated['images'][0];
        }

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
        $disk = $this->storageDisk();

        Log::info('Product update: disk determined', ['disk' => $disk]);

        // Single main image (file upload)
        if ($request->hasFile('image')) {
            // Delete old main image if it exists
            if ($product->image) {
                $this->deleteImageFile($product->image);
            }
            try {
                $path = $request->file('image')->store('products', $disk);
                Log::info('Product update: main image uploaded', ['path' => $path, 'disk' => $disk]);
                $validated['image'] = $path;
            } catch (\Throwable $e) {
                Log::error('Product update: main image upload FAILED', [
                    'disk' => $disk,
                    'error' => $e->getMessage(),
                    'class' => get_class($e),
                ]);
                return $this->respondError('Image upload failed: ' . $e->getMessage(), 500);
            }
        }

        // Multiple images: merge existing (kept) + newly uploaded
        $finalImages = [];

        // Keep existing images that the frontend says to preserve
        // Normalize URLs to relative paths for consistent storage
        $existingImages = $request->input('existing_images', []);
        if (is_array($existingImages)) {
            $finalImages = array_values(array_filter(
                array_map(fn($url) => $this->normalizeImagePath($url), $existingImages),
                fn($path) => !empty($path)
            ));
        }

        // Append newly uploaded files
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $i => $file) {
                try {
                    $path = $file->store('products', $disk);
                    Log::info('Product update: gallery image uploaded', ['index' => $i, 'path' => $path, 'disk' => $disk]);
                    if ($path) $finalImages[] = $path;
                } catch (\Throwable $e) {
                    Log::error('Product update: gallery image upload FAILED', [
                        'index' => $i,
                        'disk' => $disk,
                        'error' => $e->getMessage(),
                        'class' => get_class($e),
                    ]);
                    return $this->respondError('Image upload failed: ' . $e->getMessage(), 500);
                }
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

            // Auto-set main image from first gallery image if not explicitly provided
            if (empty($validated['image']) && !empty($finalImages)) {
                $validated['image'] = $finalImages[0];
            }
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
     * Get the active storage disk (Supabase if configured, otherwise local public).
     */
    private function storageDisk(): string
    {
        $endpoint = config('filesystems.disks.supabase.endpoint');
        $disk = $endpoint ? 'supabase' : 'public';

        if (!$endpoint) {
            Log::warning('Supabase endpoint not configured — falling back to local public disk. Check SUPABASE_ENDPOINT in .env and run: php artisan config:clear');
        }

        return $disk;
    }

    /**
     * Normalize an image path to a relative path for consistent DB storage.
     * Handles full Supabase URLs, local storage URLs, and already-relative paths.
     */
    private function normalizeImagePath(?string $path): ?string
    {
        if (empty($path)) return null;

        // Already a relative path
        if (!str_starts_with($path, 'http')) return $path;

        // Supabase public URL: extract path after bucket name
        // e.g. https://xxx.supabase.co/storage/v1/object/public/products/products/abc.jpg → products/abc.jpg
        if (str_contains($path, 'supabase.co')) {
            $parsed = parse_url($path);
            $pathPart = $parsed['path'] ?? '';
            if (preg_match('#^/storage/v1/object/public/[^/]+/(.+)$#', $pathPart, $matches)) {
                return $matches[1];
            }
        }

        // Local storage URL: http://localhost/storage/products/abc.jpg → products/abc.jpg
        if (str_contains($path, '/storage/')) {
            $parsed = parse_url($path);
            $pathPart = ltrim($parsed['path'] ?? '', '/');
            if (str_starts_with($pathPart, 'storage/')) {
                return substr($pathPart, strlen('storage/'));
            }
        }

        // External URL (Unsplash, etc.) — return as-is
        return $path;
    }

    /**
     * Delete an image file from the active storage disk.
     * Handles both relative paths (products/abc.jpg) and full URLs.
     */
    private function deleteImageFile(string $path): void
    {
        $disk = $this->storageDisk();

        // Normalize to relative path
        $relativePath = $this->normalizeImagePath($path);

        // Don't delete external URLs (Unsplash, etc.)
        if ($relativePath && str_starts_with($relativePath, 'http')) return;

        // Delete from the appropriate disk
        if ($relativePath && Storage::disk($disk)->exists($relativePath)) {
            Storage::disk($disk)->delete($relativePath);
        }

        // Also try the other disk (migration fallback)
        $fallbackDisk = $disk === 'supabase' ? 'public' : 'supabase';
        if ($relativePath && Storage::disk($fallbackDisk)->exists($relativePath)) {
            Storage::disk($fallbackDisk)->delete($relativePath);
        }
    }
}
