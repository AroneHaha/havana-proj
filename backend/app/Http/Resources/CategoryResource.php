<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = $request->query('locale', 'en');

        return [
            'id' => (string) $this->id,
            'name' => $locale === 'ar' ? ($this->name_ar ?: '') : ($this->name_en ?: ''),
            'name_en' => $this->name_en ?? '',
            'name_ar' => $this->name_ar ?? '',
            'slug' => $this->slug ?? '',
            'image' => $this->image,
            'is_active' => (bool) ($this->is_active ?? true),
            'sort_order' => (int) ($this->sort_order ?? 0),
            'products_count' => $this->whenCounted('products'),
            'products' => $this->when(
                $this->relationLoaded('products'),
                fn() => ProductResource::collection($this->resource->products)
            ),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}