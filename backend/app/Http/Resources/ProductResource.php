<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ReviewResource;

class ProductResource extends JsonResource
{
    
    private function resolveImageUrl(?string $path): ?string
    {
        if (!$path) return null;
        if (str_starts_with($path, 'http')) return $path;

        // Use Supabase public URL if configured
        $supabasePublicUrl = config('services.supabase.public_url');
        if ($supabasePublicUrl) {
            return rtrim($supabasePublicUrl, '/') . '/' . ltrim($path, '/');
        }

        
        /** @var \Illuminate\Contracts\Filesystem\Filesystem $disk */
        $disk = Storage::disk('public');
        return $disk->url($path);
    }


    private function resolveImageUrls(array $paths): array
    {
        return array_map(fn($p) => $this->resolveImageUrl($p) ?? $p, $paths);
    }

    public function toArray(Request $request): array
    {
        $locale = $request->query('locale', 'en');

        return [
            'id' => (string) $this->id,
            'name' => $locale === 'ar' ? ($this->name_ar ?: '') : ($this->name_en ?: ''),
            'name_en' => $this->name_en ?? '',
            'name_ar' => $this->name_ar ?? '',
            'description' => $locale === 'ar' ? ($this->description_ar ?? '') : ($this->description_en ?? ''),
            'description_en' => $this->description_en ?? '',
            'description_ar' => $this->description_ar ?? '',
            'slug' => $this->slug ?? '',
            'price' => (float) ($this->price ?? 0),
            'sale_price' => $this->sale_price ? (float) $this->sale_price : null,
            'effective_price' => (float) $this->effectivePrice(),
            'is_on_sale' => $this->isOnSale(),
            'image' => $this->resolveImageUrl($this->image),
            'images' => $this->resolveImageUrls($this->images ?? []),
            'sku' => $this->sku ?? '',
            'stock' => (int) ($this->stock ?? 0),
            'in_stock' => $this->isInStock(),
            'rating' => (float) ($this->rating ?? 0),
            'is_featured' => (bool) ($this->is_featured ?? false),
            'is_best_seller' => (bool) ($this->is_best_seller ?? false),
            'is_new' => (bool) ($this->is_new ?? false),
            'is_active' => (bool) ($this->is_active ?? true),
            'category_id' => $this->category_id ?? null,
            'category' => $this->whenLoaded('category', fn() => new CategoryResource($this->category)),
            'reviews_count' => $this->whenCounted('reviews') ?? 0,
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}