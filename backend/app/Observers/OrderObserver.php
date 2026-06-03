<?php

namespace App\Observers;

use App\Models\Notification;
use App\Models\Order;
use App\Models\User;

/**
 * OrderObserver — automatically creates notifications on order events.
 *
 * Registered in AppServiceProvider::boot().
 */
class OrderObserver
{
    /**
     * Handle the Order "created" event.
     * Fires when a customer places a new order via CheckoutController.
     *
     * Creates an "order_placed" notification for ALL admin users.
     */
    public function created(Order $order): void
    {
        // Only fire on real checkouts (status = pending), not seeder/manual creates
        if ($order->status !== 'pending') {
            return;
        }

        $customerName = trim(($order->user->first_name ?? '') . ' ' . ($order->user->last_name ?? ''));

        $titleEn = "New Order #{$order->order_number}";
        $titleAr = "طلب جديد #{$order->order_number}";
        $bodyEn  = "Customer {$customerName} placed a new order for {$order->total} KWD.";
        $bodyAr  = "قام العميل {$customerName} بطلب جديد بقيمة {$order->total} د.ك.";

        // Send to ALL admin users so they see it in the notification dropdown
        $adminIds = User::where('role', 'admin')->pluck('id');

        foreach ($adminIds as $adminId) {
            Notification::create([
                'user_id' => $adminId,
                'type'    => 'order_placed',
                'title_en' => $titleEn,
                'title_ar' => $titleAr,
                'body_en'  => $bodyEn,
                'body_ar'  => $bodyAr,
                'data'     => [
                    'order_id'      => $order->id,
                    'order_number'  => $order->order_number,
                    'customer_name' => $customerName,
                    'total'         => (float) $order->total,
                ],
                'is_read' => false,
            ]);
        }
    }
}