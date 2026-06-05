<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\Admin\ReviewResource;

class ProductResource extends JsonResource
{
    private function resolveImageUrl(?string $path, Request $request): ?string
    {
        if (!$path) return null;
        if (str_starts_with($path, 'http')) return $path;

        $supabasePublicUrl = config('services.supabase.public_url');
        if ($supabasePublicUrl) {
            return rtrim($supabasePublicUrl, '/') . '/' . ltrim($path, '/');
        }

        $baseUrl = $request->schemeAndHttpHost();
        return $baseUrl . '/storage/' . ltrim($path, '/');
    }

    private function resolveImageUrls(array $paths, Request $request): array
    {
        return array_map(fn($p) => $this->resolveImageUrl($p, $request) ?? $p, $paths);
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'name_en' => $this->name_en,
            'name_ar' => $this->name_ar,
            'description_en' => $this->description_en,
            'description_ar' => $this->description_ar,
            'slug' => $this->slug,
            'price' => (float) $this->price,
            'sale_price' => $this->sale_price ? (float) $this->sale_price : null,
            'effective_price' => (float) $this->effectivePrice(),
            'is_on_sale' => $this->isOnSale(),
            'image' => $this->resolveImageUrl($this->image, $request),
            'images' => $this->resolveImageUrls($this->images ?? [], $request),
            'sku' => $this->sku,
            'stock' => $this->stock,
            'in_stock' => $this->isInStock(),
            'rating' => (float) ($this->rating ?? 0),
            'is_featured' => $this->is_featured,
            'is_best_seller' => $this->is_best_seller,
            'is_new' => $this->is_new,
            'is_active' => $this->is_active,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
            'reviews_count' => $this->whenCounted('reviews'),
            'deleted_at' => $this->deleted_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}