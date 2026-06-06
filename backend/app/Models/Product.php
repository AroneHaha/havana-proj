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

    /**
     * FIX: Removed 'reviews_count' from $appends.
     *
     * The original accessor fired a COUNT(*) query for EVERY product instance
     * whenever it was serialized — including in list endpoints, cart, and order
     * items. With 15 products per page that was 15 hidden queries, all without
     * an index.
     *
     * reviews_count is now loaded explicitly only where needed:
     *   - ProductController::show()  → $product->loadCount([...])  (already done)
     *   - Admin\ProductController::index() → withCount() on the query
     *   - Public ProductController::index() → withCount() on the query
     *
     * The 'name', 'description', 'effective_price', 'is_on_sale', 'in_stock'
     * appends are fine — they are pure PHP computations with zero DB queries.
     */
    protected $appends = [
        'name',
        'description',
        'effective_price',
        'is_on_sale',
        'in_stock',
    ];

    protected function casts(): array
    {
        return [
            'images'        => 'array',
            'is_featured'   => 'boolean',
            'is_best_seller' => 'boolean',
            'is_new'        => 'boolean',
            'is_active'     => 'boolean',
        ];
    }

    // ─── Accessors (appended to JSON) ──────────────────────────

    public function getNameAttribute(): string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? ($this->name_ar ?? '') : ($this->name_en ?? '');
    }

    public function getDescriptionAttribute(): string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? ($this->description_ar ?? '') : ($this->description_en ?? '');
    }

    public function getEffectivePriceAttribute(): float
    {
        return (float) ($this->sale_price ?? $this->price);
    }

    public function getIsOnSaleAttribute(): bool
    {
        return $this->sale_price !== null
            && (float) $this->sale_price < (float) $this->price;
    }

    public function getInStockAttribute(): bool
    {
        return $this->stock > 0;
    }

    // ─── Price/Rating as real numbers (not strings) ───────────

    protected function getPriceAttribute($value): float
    {
        return (float) $value;
    }

    protected function getSalePriceAttribute($value): ?float
    {
        return $value !== null ? (float) $value : null;
    }

    protected function getRatingAttribute($value): float
    {
        return (float) $value;
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

    // ─── Helpers (used by backend logic, not API) ────────────

    public function isOnSale(): bool
    {
        return !is_null($this->sale_price) && (float) $this->sale_price < (float) $this->price;
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
