<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\CategoryResource;

class ProductResource extends JsonResource
{
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
            'image' => $this->image ? (str_starts_with($this->image, 'http') ? $this->image : Storage::disk('public')->url($this->image)) : null,
            'images' => array_map(fn($p) => str_starts_with($p, 'http') ? $p : Storage::disk('public')->url($p), $this->images ?? []),
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
