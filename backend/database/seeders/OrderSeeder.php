<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\User;
use App\Models\Product;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        // ── Load users ──────────────────────────────────────────────
        $ahmed   = User::where('email', 'ahmed@example.com')->first();
        $fatima  = User::where('email', 'fatima@example.com')->first();
        $omar    = User::where('email', 'omar@example.com')->first();
        $noor    = User::where('email', 'noor@example.com')->first();
        $sara    = User::where('email', 'sara@example.com')->first();
        $layla   = User::where('email', 'layla@example.com')->first();
        $youssef = User::where('email', 'youssef@example.com')->first();
        $maryam  = User::where('email', 'maryam@example.com')->first();
        $khalid  = User::where('email', 'khalid@example.com')->first();
        $huda    = User::where('email', 'huda@example.com')->first();
        $admin   = User::where('role', 'admin')->first();

        $allUsers = array_filter([
            $ahmed, $fatima, $omar, $noor, $sara,
            $layla, $youssef, $maryam, $khalid, $huda,
        ]);

        if (! $admin) $this->command->warn('Admin user not found — status history will have no changed_by.');

        // ── Shipping addresses by user (used for both legacy & pending orders) ──
        $addresses = [
            'ahmed'   => 'Salmiya, Block 12, Street 5, Building 30, Floor 3, Apt 7',
            'fatima'  => 'Kuwait City, Block 4, Street 10, Building 15, Floor 1, Apt 2',
            'omar'    => 'Hawally, Block 7, Street 3, Building 22, Floor 5, Apt 12',
            'noor'    => 'Mishref, Block 4, Street 6, Building 18, Floor 2, Apt 5',
            'sara'    => 'Bayan, Block 5, Street 12, Building 7, Floor 4, Apt 9',
            'layla'   => 'Sharq, Block 2, Street 7, Building 11, Floor 6, Apt 14',
            'youssef' => 'Kaifan, Block 3, Street 9, Building 20, Floor 1, Apt 3',
            'maryam'  => 'Salmiya, Block 8, Street 14, Building 25, Floor 2, Apt 8',
            'khalid'  => 'Jabriya, Block 5, Street 11, Building 14, Floor 4, Apt 10',
            'huda'    => 'Hawally, Block 9, Street 6, Building 33, Floor 7, Apt 15',
        ];

        $phones = [
            'ahmed'   => '+965-5000-1001',
            'fatima'  => '+965-5000-1002',
            'omar'    => '+965-5000-1003',
            'noor'    => '+965-5000-1004',
            'sara'    => '+965-5000-1005',
            'layla'   => '+965-5000-1006',
            'youssef' => '+965-5000-1007',
            'maryam'  => '+965-5000-1008',
            'khalid'  => '+965-5000-1009',
            'huda'    => '+965-5000-1010',
        ];

        // ── LEGACY ORDERS (various statuses) ────────────────────────
        $orders = [
            [
                'user' => $ahmed,
                'order_number' => 'HAV-2026-0001',
                'status' => 'delivered',
                'items' => [
                    ['slug' => 'noor-al-zahra-basket', 'quantity' => 1],
                    ['slug' => 'golden-lantern-petals', 'quantity' => 2],
                ],
                'shipping_address' => $addresses['ahmed'],
                'shipping_phone' => $phones['ahmed'],
                'notes' => null,
                'payment_method' => 'cash_on_delivery',
                'payment_status' => 'paid',
                'confirmed_at' => now()->subDays(6),
                'delivered_at' => now()->subDays(3),
                'cancelled_at' => null,
                'status_trail' => ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'],
            ],
            [
                'user' => $fatima,
                'order_number' => 'HAV-2026-0002',
                'status' => 'out_for_delivery',
                'items' => [
                    ['slug' => 'crimson-desire-bouquet', 'quantity' => 1],
                    ['slug' => 'velvet-embrace-bouquet', 'quantity' => 1],
                ],
                'shipping_address' => $addresses['fatima'],
                'shipping_phone' => $phones['fatima'],
                'notes' => 'Please ring the doorbell twice',
                'payment_method' => 'cash_on_delivery',
                'payment_status' => 'pending',
                'confirmed_at' => now()->subDays(1),
                'delivered_at' => null,
                'cancelled_at' => null,
                'status_trail' => ['pending', 'confirmed', 'preparing', 'out_for_delivery'],
            ],
            [
                'user' => $omar,
                'order_number' => 'HAV-2026-0003',
                'status' => 'pending',
                'items' => [
                    ['slug' => 'royal-union-fleur', 'quantity' => 1],
                ],
                'shipping_address' => $addresses['omar'],
                'shipping_phone' => $phones['omar'],
                'notes' => 'Anniversary gift — please include a card',
                'payment_method' => 'cash_on_delivery',
                'payment_status' => 'pending',
                'confirmed_at' => null,
                'delivered_at' => null,
                'cancelled_at' => null,
                'status_trail' => ['pending'],
            ],
            [
                'user' => $ahmed,
                'order_number' => 'HAV-2026-0004',
                'status' => 'cancelled',
                'items' => [
                    ['slug' => 'sunset-confetti-bloom', 'quantity' => 1],
                ],
                'shipping_address' => $addresses['ahmed'],
                'shipping_phone' => $phones['ahmed'],
                'notes' => null,
                'payment_method' => 'cash_on_delivery',
                'payment_status' => 'pending',
                'confirmed_at' => null,
                'delivered_at' => null,
                'cancelled_at' => now()->subDays(2),
                'status_trail' => ['pending', 'cancelled'],
            ],
            [
                'user' => $fatima,
                'order_number' => 'HAV-2026-0005',
                'status' => 'preparing',
                'items' => [
                    ['slug' => 'silent-ivory-grace', 'quantity' => 1],
                    ['slug' => 'gentle-farewell-bloom', 'quantity' => 1],
                ],
                'shipping_address' => $addresses['fatima'],
                'shipping_phone' => $phones['fatima'],
                'notes' => 'Please deliver before 10 AM if possible',
                'payment_method' => 'cash_on_delivery',
                'payment_status' => 'pending',
                'confirmed_at' => now()->subHours(5),
                'delivered_at' => null,
                'cancelled_at' => null,
                'status_trail' => ['pending', 'confirmed', 'preparing'],
            ],
        ];

        // ── 15 PENDING ORDERS ───────────────────────────────────────
        $pendingOrders = [
            [
                'user_key' => 'ahmed',
                'order_number' => 'HAV-2026-0006',
                'items' => [
                    ['slug' => 'crimson-desire-bouquet', 'quantity' => 1],
                ],
                'notes' => 'Leave at the door please',
            ],
            [
                'user_key' => 'noor',
                'order_number' => 'HAV-2026-0007',
                'items' => [
                    ['slug' => 'moonlit-saffron-bloom', 'quantity' => 2],
                    ['slug' => 'desert-pearl-ensemble', 'quantity' => 1],
                ],
                'notes' => null,
            ],
            [
                'user_key' => 'sara',
                'order_number' => 'HAV-2026-0008',
                'items' => [
                    ['slug' => 'velvet-embrace-bouquet', 'quantity' => 1],
                    ['slug' => 'pearl-garden-grace', 'quantity' => 1],
                ],
                'notes' => 'For my mother, please add a thank you card',
            ],
            [
                'user_key' => 'layla',
                'order_number' => 'HAV-2026-0009',
                'items' => [
                    ['slug' => 'ivory-vow-symphony', 'quantity' => 1],
                ],
                'notes' => 'Wedding centerpiece — handle with care',
            ],
            [
                'user_key' => 'youssef',
                'order_number' => 'HAV-2026-0010',
                'items' => [
                    ['slug' => 'golden-triumph-bouquet', 'quantity' => 1],
                    ['slug' => 'scholars-bloom-basket', 'quantity' => 1],
                ],
                'notes' => 'Graduation gift for my brother',
            ],
            [
                'user_key' => 'maryam',
                'order_number' => 'HAV-2026-0011',
                'items' => [
                    ['slug' => 'blush-harmony-bloom', 'quantity' => 3],
                ],
                'notes' => null,
            ],
            [
                'user_key' => 'khalid',
                'order_number' => 'HAV-2026-0012',
                'items' => [
                    ['slug' => 'eternal-flame-roses', 'quantity' => 1],
                    ['slug' => 'champagne-love-garden', 'quantity' => 1],
                ],
                'notes' => 'Anniversary surprise — call before delivery',
            ],
            [
                'user_key' => 'huda',
                'order_number' => 'HAV-2026-0013',
                'items' => [
                    ['slug' => 'silent-ivory-grace', 'quantity' => 2],
                ],
                'notes' => 'Sympathy arrangement for the Al-Sabah family',
            ],
            [
                'user_key' => 'ahmed',
                'order_number' => 'HAV-2026-0014',
                'items' => [
                    ['slug' => 'golden-spark-bouquet', 'quantity' => 1],
                    ['slug' => 'sunset-confetti-bloom', 'quantity' => 1],
                ],
                'notes' => 'Birthday party decoration — needs to arrive by 4 PM',
            ],
            [
                'user_key' => 'fatima',
                'order_number' => 'HAV-2026-0015',
                'items' => [
                    ['slug' => 'moonstone-romance-bloom', 'quantity' => 1],
                ],
                'notes' => null,
            ],
            [
                'user_key' => 'omar',
                'order_number' => 'HAV-2026-0016',
                'items' => [
                    ['slug' => 'rosewood-passion-fleur', 'quantity' => 1],
                    ['slug' => 'midnight-serenade-bloom', 'quantity' => 1],
                ],
                'notes' => 'Engagement gift, premium wrapping please',
            ],
            [
                'user_key' => 'noor',
                'order_number' => 'HAV-2026-0017',
                'items' => [
                    ['slug' => 'queens-affection-ensemble', 'quantity' => 1],
                    ['slug' => 'golden-motherlight-basket', 'quantity' => 1],
                ],
                'notes' => "Mother's Day surprise",
            ],
            [
                'user_key' => 'youssef',
                'order_number' => 'HAV-2026-0018',
                'items' => [
                    ['slug' => 'prestige-laurel-bloom', 'quantity' => 1],
                ],
                'notes' => 'Graduation ceremony — deliver to university entrance',
            ],
            [
                'user_key' => 'layla',
                'order_number' => 'HAV-2026-0019',
                'items' => [
                    ['slug' => 'crescent-velvet-garden', 'quantity' => 2],
                    ['slug' => 'golden-lantern-petals', 'quantity' => 1],
                ],
                'notes' => 'Eid decorations for the living room',
            ],
            [
                'user_key' => 'khalid',
                'order_number' => 'HAV-2026-0020',
                'items' => [
                    ['slug' => 'heavenly-calm-bouquet', 'quantity' => 1],
                    ['slug' => 'gentle-farewell-bloom', 'quantity' => 1],
                ],
                'notes' => 'Condolence delivery to Al-Shuwaikh area',
            ],
        ];

        // Build pending order data from the simplified definitions
        foreach ($pendingOrders as $pending) {
            $orders[] = [
                'user' => ${$pending['user_key']} ?? null,
                'order_number' => $pending['order_number'],
                'status' => 'pending',
                'items' => $pending['items'],
                'shipping_address' => $addresses[$pending['user_key']] ?? 'Kuwait City, Block 1, Street 1, Building 1',
                'shipping_phone' => $phones[$pending['user_key']] ?? '+965-5000-0000',
                'notes' => $pending['notes'],
                'payment_method' => 'cash_on_delivery',
                'payment_status' => 'pending',
                'confirmed_at' => null,
                'delivered_at' => null,
                'cancelled_at' => null,
                'status_trail' => ['pending'],
            ];
        }

        // ── Create all orders ───────────────────────────────────────
        $orderCount = 0;

        foreach ($orders as $orderData) {
            if (! $orderData['user']) {
                $this->command->warn("Skipping order {$orderData['order_number']} — user not found.");
                continue;
            }

            $subtotal = 0;
            $orderItems = [];

            foreach ($orderData['items'] as $item) {
                $product = Product::where('slug', $item['slug'])->first();
                if ($product) {
                    $price = $product->effectivePrice();
                    $itemTotal = bcmul($price, (string) $item['quantity'], 3);
                    $subtotal = bcadd($subtotal, $itemTotal, 3);
                    $orderItems[] = ['product' => $product, 'quantity' => $item['quantity'], 'price' => $price];
                } else {
                    $this->command->warn("Product '{$item['slug']}' not found — skipping in order {$orderData['order_number']}.");
                }
            }

            if (empty($orderItems)) {
                $this->command->warn("Skipping order {$orderData['order_number']} — no valid items.");
                continue;
            }

            $shippingCost = '2.000';
            $discount = '0.000';
            $total = bcadd($subtotal, $shippingCost, 3);

            $order = Order::create([
                'user_id' => $orderData['user']->id,
                'order_number' => $orderData['order_number'],
                'status' => $orderData['status'],
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'discount' => $discount,
                'total' => $total,
                'payment_method' => $orderData['payment_method'],
                'payment_status' => $orderData['payment_status'],
                'shipping_address' => $orderData['shipping_address'],
                'shipping_phone' => $orderData['shipping_phone'],
                'notes' => $orderData['notes'],
                'confirmed_at' => $orderData['confirmed_at'],
                'delivered_at' => $orderData['delivered_at'],
                'cancelled_at' => $orderData['cancelled_at'],
            ]);

            foreach ($orderItems as $itemData) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $itemData['product']->id,
                    'product_name' => $itemData['product']->name_en,
                    'product_image' => $itemData['product']->image,
                    'price' => $itemData['price'],
                    'quantity' => $itemData['quantity'],
                ]);
            }

            foreach ($orderData['status_trail'] as $index => $status) {
                OrderStatusHistory::create([
                    'order_id' => $order->id,
                    'status' => $status,
                    'changed_by' => $status === 'pending' ? null : $admin?->id,
                    'note' => $status === 'pending' ? 'Order placed by customer' : "Status updated to {$status}",
                    'created_at' => now()->subDays(count($orderData['status_trail']) - $index),
                ]);
            }

            $orderCount++;
        }

        $pendingCount = count($pendingOrders);
        $this->command->info("Created {$orderCount} orders total (5 legacy + {$pendingCount} pending) with items and status history.");
    }
}
