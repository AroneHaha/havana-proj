<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $ahmed = User::where('email', 'ahmed@example.com')->first();
        $fatima = User::where('email', 'fatima@example.com')->first();
        $omar = User::where('email', 'omar@example.com')->first();

        if (! $ahmed)  $this->command->warn('User ahmed@example.com not found — skipping their notifications.');
        if (! $fatima) $this->command->warn('User fatima@example.com not found — skipping their notifications.');
        if (! $omar)   $this->command->warn('User omar@example.com not found — skipping their notifications.');

        $notifications = [];

        // Customer notifications — Ahmed
        if ($ahmed) {
            $notifications = array_merge($notifications, [
                [
                    'user_id' => $ahmed->id,
                    'type' => 'order_confirmed',
                    'title_en' => 'Order Confirmed',
                    'title_ar' => 'تم تأكيد الطلب',
                    'body_en' => 'Your order HAV-2026-0001 has been confirmed and is being prepared.',
                    'body_ar' => 'تم تأكيد طلبك HAV-2026-0001 ويتم تحضيره الآن.',
                    'data' => ['order_number' => 'HAV-2026-0001'],
                    'is_read' => true,
                    'read_at' => now()->subDays(5),
                ],
                [
                    'user_id' => $ahmed->id,
                    'type' => 'order_delivered',
                    'title_en' => 'Order Delivered',
                    'title_ar' => 'تم توصيل الطلب',
                    'body_en' => 'Your order HAV-2026-0001 has been delivered. Enjoy your flowers!',
                    'body_ar' => 'تم توصيل طلبك HAV-2026-0001. استمتع بزهورك!',
                    'data' => ['order_number' => 'HAV-2026-0001'],
                    'is_read' => true,
                    'read_at' => now()->subDays(3),
                ],
                [
                    'user_id' => $ahmed->id,
                    'type' => 'order_cancelled',
                    'title_en' => 'Order Cancelled',
                    'title_ar' => 'تم إلغاء الطلب',
                    'body_en' => 'Your order HAV-2026-0004 has been cancelled. Refund will be processed within 3-5 business days.',
                    'body_ar' => 'تم إلغاء طلبك HAV-2026-0004. سيتم معالجة الاسترداد خلال 3-5 أيام عمل.',
                    'data' => ['order_number' => 'HAV-2026-0004'],
                    'is_read' => false,
                    'read_at' => null,
                ],
            ]);
        }

        // Customer notifications — Fatima
        if ($fatima) {
            $notifications = array_merge($notifications, [
                [
                    'user_id' => $fatima->id,
                    'type' => 'order_confirmed',
                    'title_en' => 'Order Confirmed',
                    'title_ar' => 'تم تأكيد الطلب',
                    'body_en' => 'Your order HAV-2026-0002 has been confirmed and is out for delivery.',
                    'body_ar' => 'تم تأكيد طلبك HAV-2026-0002 وهو في طريقه إليك.',
                    'data' => ['order_number' => 'HAV-2026-0002'],
                    'is_read' => true,
                    'read_at' => now()->subDay(),
                ],
                [
                    'user_id' => $fatima->id,
                    'type' => 'order_placed',
                    'title_en' => 'Order Placed',
                    'title_ar' => 'تم تقديم الطلب',
                    'body_en' => 'Your order HAV-2026-0005 has been placed successfully.',
                    'body_ar' => 'تم تقديم طلبك HAV-2026-0005 بنجاح.',
                    'data' => ['order_number' => 'HAV-2026-0005'],
                    'is_read' => false,
                    'read_at' => null,
                ],
            ]);
        }

        // Customer notifications — Omar
        if ($omar) {
            $notifications = array_merge($notifications, [
                [
                    'user_id' => $omar->id,
                    'type' => 'order_placed',
                    'title_en' => 'Order Placed',
                    'title_ar' => 'تم تقديم الطلب',
                    'body_en' => 'Your order HAV-2026-0003 has been placed. We will confirm it shortly.',
                    'body_ar' => 'تم تقديم طلبك HAV-2026-0003. سنقوم بتأكيده قريباً.',
                    'data' => ['order_number' => 'HAV-2026-0003'],
                    'is_read' => false,
                    'read_at' => null,
                ],
            ]);
        }

        // Admin broadcast notifications (user_id = null)
        $notifications = array_merge($notifications, [
            [
                'user_id' => null,
                'type' => 'new_review',
                'title_en' => 'New Review Submitted',
                'title_ar' => 'مراجعة جديدة',
                'body_en' => 'A new review has been submitted for Moonlit Saffron Bloom and is pending approval.',
                'body_ar' => 'تم تقديم مراجعة جديدة لإزهار الزعفران القمري وهي بانتظار الموافقة.',
                'data' => ['product_slug' => 'moonlit-saffron-bloom'],
                'is_read' => false,
                'read_at' => null,
            ],
            [
                'user_id' => null,
                'type' => 'low_stock',
                'title_en' => 'Low Stock Alert',
                'title_ar' => 'تنبيه مخزون منخفض',
                'body_en' => 'Ivory Vow Symphony is running low on stock (5 remaining).',
                'body_ar' => 'سيمفونية العهد العاجي ينخفض المخزون (5 متبقية).',
                'data' => ['product_slug' => 'ivory-vow-symphony', 'stock' => 5],
                'is_read' => false,
                'read_at' => null,
            ],
            [
                'user_id' => null,
                'type' => 'low_stock',
                'title_en' => 'Low Stock Alert',
                'title_ar' => 'تنبيه مخزون منخفض',
                'body_en' => 'Crimson Desire Bouquet is running low on stock (6 remaining).',
                'body_ar' => 'باقة الرغبة القرمزية ينخفض المخزون (6 متبقية).',
                'data' => ['product_slug' => 'crimson-desire-bouquet', 'stock' => 6],
                'is_read' => false,
                'read_at' => null,
            ],
            [
                'user_id' => null,
                'type' => 'system',
                'title_en' => 'System Update',
                'title_ar' => 'تحديث النظام',
                'body_en' => 'Havana platform has been updated with new features. Check the admin dashboard for details.',
                'body_ar' => 'تم تحديث منصة هافانا بميزات جديدة. تحقق من لوحة الإدارة للتفاصيل.',
                'data' => null,
                'is_read' => false,
                'read_at' => null,
            ],
        ]);

        $count = 0;
        foreach ($notifications as $notification) {
            Notification::create($notification);
            $count++;
        }

        $this->command->info("Created {$count} notifications.");
    }
}