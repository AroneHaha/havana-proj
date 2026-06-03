<?php

namespace App\Observers;

use App\Models\Notification;
use App\Models\Product;
use App\Models\User;

/**
 * ProductObserver — automatically creates "low_stock" notifications.
 *
 * Registered in AppServiceProvider::boot().
 * Fires whenever a Product's "stock" column is updated (e.g. after checkout).
 */
class ProductObserver
{
    /**
     * The stock threshold below which a "low_stock" notification is sent.
     */
    private const LOW_STOCK_THRESHOLD = 5;

    /**
     * Handle the Product "updated" event.
     *
     * If the stock just dropped to (or below) the threshold and wasn't
     * already low before this update, notify all admin users.
     */
    public function updated(Product $product): void
    {
        // Only react to stock changes
        if ($product->isDirty('stock') === false) {
            return;
        }

        $newStock  = (int) $product->stock;
        $oldStock  = (int) $product->getOriginal('stock');

        // Only fire when stock drops TO or BELOW threshold
        // AND it was ABOVE threshold before (avoids duplicate spam)
        if ($newStock > self::LOW_STOCK_THRESHOLD) {
            return;
        }

        if ($oldStock > self::LOW_STOCK_THRESHOLD) {
            // Stock just crossed the threshold — notify admins
            $statusText = $newStock === 0 ? 'Out of stock' : "Low stock ({$newStock} left)";
            $statusTextAr = $newStock === 0 ? 'نفد المخزون' : "مخزون منخفض (متبقي {$newStock})";

            $titleEn = "Low Stock Alert: {$product->name_en}";
            $titleAr = "تنبيه مخزون منخفض: {$product->name_ar}";
            $bodyEn  = "{$product->name_en} is now {$statusText}.";
            $bodyAr  = "{$product->name_ar} أصبح {$statusTextAr}.";

            $adminIds = User::where('role', 'admin')->pluck('id');

            foreach ($adminIds as $adminId) {
                Notification::create([
                    'user_id' => $adminId,
                    'type'    => 'low_stock',
                    'title_en' => $titleEn,
                    'title_ar' => $titleAr,
                    'body_en'  => $bodyEn,
                    'body_ar'  => $bodyAr,
                    'data'     => [
                        'product_id'   => $product->id,
                        'product_name' => $product->name_en,
                        'stock'        => $newStock,
                        'threshold'    => self::LOW_STOCK_THRESHOLD,
                    ],
                    'is_read' => false,
                ]);
            }
        }
    }
}