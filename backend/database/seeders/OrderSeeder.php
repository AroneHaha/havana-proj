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
        $ahmed  = User::where('email', 'ahmed@example.com')->first();
        $fatima = User::where('email', 'fatima@example.com')->first();
        $omar   = User::where('email', 'omar@example.com')->first();
        $admin  = User::where('role', 'admin')->first();

        if (! $admin) $this->command->warn('Admin user not found — status history will have no changed_by.');

        // ── Addresses & phones ──────────────────────────────────────
        $addresses = [
            'ahmed'  => 'Salmiya, Block 12, Street 5, Building 30, Floor 3, Apt 7',
            'fatima' => 'Kuwait City, Block 4, Street 10, Building 15, Floor 1, Apt 2',
            'omar'   => 'Hawally, Block 7, Street 3, Building 22, Floor 5, Apt 12',
        ];

        $phones = [
            'ahmed'  => '+965-5000-1001',
            'fatima' => '+965-5000-1002',
            'omar'   => '+965-5000-1003',
        ];

        // ── 5 ORDERS (various statuses) ─────────────────────────────
        $orders = [
            [
                'user' => $ahmed,
                'order_number' => 'HAV-2026-0001',
                'status' => 'delivered',
                'items' => [
                    ['slug' => 'moonlit-saffron-bloom', 'quantity' => 1],
                    ['slug' => 'crescent-velvet-garden', 'quantity' => 2],
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
                    ['slug' => 'ivory-vow-symphony', 'quantity' => 1],
                ],
                'shipping_address' => $addresses['omar'],
                'shipping_phone' => $phones['omar'],
                'notes' => 'Wedding gift — please include a card',
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
                    ['slug' => 'eternal-flame-roses', 'quantity' => 1],
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

        $this->command->info("Created {$orderCount} orders with items and status history.");
    }
}