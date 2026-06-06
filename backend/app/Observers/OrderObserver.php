<?php

namespace App\Observers;

use App\Models\Notification;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

/**
 * OrderObserver — automatically creates notifications on order events.
 *
 * Registered in AppServiceProvider::boot().
 *
 * FIX: Caches admin IDs (same cache key as ProductObserver) to avoid hitting
 * the users table on every new order.
 *
 * FIX: Uses Notification::insert() to create all admin notifications in a
 * single query instead of N individual INSERTs inside a loop.
 */
class OrderObserver
{
    /**
     * How long to cache the admin ID list (seconds).
     * Must match ProductObserver::ADMIN_IDS_TTL so they share the same key.
     */
    private const ADMIN_IDS_TTL = 3600;

    /**
     * Handle the Order "created" event.
     */
    public function created(Order $order): void
    {
        if ($order->status !== 'pending') {
            return;
        }

        // FIX: Use cached admin IDs
        $adminIds = $this->getAdminIds();

        if ($adminIds->isEmpty()) {
            return;
        }

        $customerName = trim(($order->user->first_name ?? '') . ' ' . ($order->user->last_name ?? ''));

        $titleEn = "New Order #{$order->order_number}";
        $titleAr = "طلب جديد #{$order->order_number}";
        $bodyEn  = "Customer {$customerName} placed a new order for {$order->total} KWD.";
        $bodyAr  = "قام العميل {$customerName} بطلب جديد بقيمة {$order->total} د.ك.";

        $now  = now()->toDateTimeString();
        $data = json_encode([
            'order_id'      => $order->id,
            'order_number'  => $order->order_number,
            'customer_name' => $customerName,
            'total'         => (float) $order->total,
        ]);

        // FIX: Batch-insert all admin notifications in one query
        $rows = $adminIds->map(fn($adminId) => [
            'id'         => (string) \Illuminate\Support\Str::uuid(),
            'user_id'    => $adminId,
            'type'       => 'order_placed',
            'title_en'   => $titleEn,
            'title_ar'   => $titleAr,
            'body_en'    => $bodyEn,
            'body_ar'    => $bodyAr,
            'data'       => $data,
            'is_read'    => false,
            'read_at'    => null,
            'created_at' => $now,
            'updated_at' => $now,
        ])->toArray();

        Notification::insert($rows);
    }

    /**
     * Return cached admin IDs.
     * Shares the same cache key as ProductObserver so both benefit from one warm entry.
     */
    private function getAdminIds(): \Illuminate\Support\Collection
    {
        return Cache::remember('admin_ids', self::ADMIN_IDS_TTL, function () {
            return User::where('role', 'admin')->pluck('id');
        });
    }
}
