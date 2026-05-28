<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'category_id',
        'name_en',
        'name_ar',
        'description_en',
        'description_ar',
        'slug',
        'price',
        'sale_price',
        'image',
        'images',
        'sku',
        'stock',
        'rating',
        'is_featured',
        'is_best_seller',
        'is_new',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:3',
            'sale_price' => 'decimal:3',
            'images' => 'array',
            'rating' => 'decimal:1',
            'is_featured' => 'boolean',
            'is_best_seller' => 'boolean',
            'is_new' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    // ─── Relationships ───────────────────────────────────────

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    // ─── Helpers ─────────────────────────────────────────────

    public function isOnSale(): bool
    {
        return !is_null($this->sale_price) && $this->sale_price < $this->price;
    }

    public function effectivePrice(): string
    {
        return $this->isOnSale() ? $this->sale_price : $this->price;
    }

    public function isInStock(): bool
    {
        return $this->stock > 0;
    }

    public function averageRating(): float
    {
        return $this->reviews()->where('visibility', 'visible')->avg('rating') ?? 0.0;
    }
}
