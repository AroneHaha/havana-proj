<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\CategoryResource;

class ProductResource extends JsonResource
{
    /**
     * Transform a stored image path into a full URL.
     * If the path is already a full URL (external image), return as-is.
     * If it's a relative path, use Supabase public URL if configured, otherwise local disk.
     */
    private function resolveImageUrl(?string $path): ?string
    {
        if (!$path) return null;
        if (str_starts_with($path, 'http')) return $path;

        // Use Supabase public URL if configured
        $supabasePublicUrl = config('services.supabase.public_url');
        if ($supabasePublicUrl) {
            return rtrim($supabasePublicUrl, '/') . '/' . ltrim($path, '/');
        }

        // Fallback to local public disk
        return Storage::disk('public')->url($path);
    }

    /**
     * Resolve an array of image paths to full URLs.
     */
    private function resolveImageUrls(array $paths): array
    {
        return array_map(fn($p) => $this->resolveImageUrl($p) ?? $p, $paths);
    }

    public function toArray(Request $request): array
    {
        $locale = $request->query('locale', 'en');

        return [
            'id' => $this->id,
            'name' => $locale === 'ar' ? $this->name_ar : $this->name_en,
            'name_en' => $this->name_en,
            'name_ar' => $this->name_ar,
            'description' => $locale === 'ar' ? $this->description_ar : $this->description_en,
            'description_en' => $this->description_en,
            'description_ar' => $this->description_ar,
            'slug' => $this->slug,
            'price' => (float) $this->price,
            'sale_price' => $this->sale_price ? (float) $this->sale_price : null,
            'effective_price' => (float) $this->effectivePrice(),
            'is_on_sale' => $this->isOnSale(),
            'image' => $this->resolveImageUrl($this->image),
            'images' => $this->resolveImageUrls($this->images ?? []),
            'sku' => $this->sku,
            'stock' => $this->stock,
            'in_stock' => $this->isInStock(),
            'rating' => (float) ($this->rating ?? 0),
            'is_featured' => $this->is_featured,
            'is_best_seller' => $this->is_best_seller,
            'is_new' => $this->is_new,
            'is_active' => $this->is_active,
            'category_id' => $this->category_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'reviews_count' => $this->whenCounted('reviews'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
