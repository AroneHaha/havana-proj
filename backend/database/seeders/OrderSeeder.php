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
        $ahmed = User::where('email', 'user1@gmail.com')->first();
        $fatima = User::where('email', 'user2@gmail.com')->first();
        $omar = User::where('email', 'user3@gmail.com')->first();

        $orders = [
            // Order 1: Ahmed — Delivered (Eid gift)
            [
                'user' => $ahmed,
                'order_number' => 'HAV-2026-0001',
                'status' => 'delivered',
                'items' => [
                    ['slug' => 'noor-al-zahra-basket', 'quantity' => 1],
                    ['slug' => 'golden-lantern-petals', 'quantity' => 2],
                ],
                'shipping_address' => 'Salmiya, Block 12, Street 5, Building 30, Floor 3, Apt 7',
                'shipping_phone' => '+965-5000-1001',
                'notes' => null,
                'payment_method' => 'cash_on_delivery',
                'payment_status' => 'paid',
                'confirmed_at' => now()->subDays(6),
                'delivered_at' => now()->subDays(3),
                'cancelled_at' => null,
                'status_trail' => ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'],
            ],

            // Order 2: Fatima — Out for delivery (Romance gift)
            [
                'user' => $fatima,
                'order_number' => 'HAV-2026-0002',
                'status' => 'out_for_delivery',
                'items' => [
                    ['slug' => 'crimson-desire-bouquet', 'quantity' => 1],
                    ['slug' => 'velvet-embrace-bouquet', 'quantity' => 1],
                ],
                'shipping_address' => 'Kuwait City, Block 4, Street 10, Building 15, Floor 1, Apt 2',
                'shipping_phone' => '+965-5000-1002',
                'notes' => 'Please ring the doorbell twice',
                'payment_method' => 'cash_on_delivery',
                'payment_status' => 'paid',
                'confirmed_at' => now()->subDays(1),
                'delivered_at' => null,
                'cancelled_at' => null,
                'status_trail' => ['pending', 'confirmed', 'preparing', 'out_for_delivery'],
            ],

            // Order 3: Omar — Pending (Wedding)
            [
                'user' => $omar,
                'order_number' => 'HAV-2026-0003',
                'status' => 'pending',
                'items' => [
                    ['slug' => 'royal-union-fleur', 'quantity' => 1],
                ],
                'shipping_address' => 'Hawally, Block 7, Street 3, Building 22, Floor 5, Apt 12',
                'shipping_phone' => '+965-5000-1003',
                'notes' => 'Anniversary gift — please include a card',
                'payment_method' => 'cash_on_delivery',
                'payment_status' => 'pending',
                'confirmed_at' => null,
                'delivered_at' => null,
                'cancelled_at' => null,
                'status_trail' => ['pending'],
            ],

            // Order 4: Ahmed — Cancelled (Birthday)
            [
                'user' => $ahmed,
                'order_number' => 'HAV-2026-0004',
                'status' => 'cancelled',
                'items' => [
                    ['slug' => 'sunset-confetti-bloom', 'quantity' => 1],
                ],
                'shipping_address' => 'Salmiya, Block 12, Street 5, Building 30, Floor 3, Apt 7',
                'shipping_phone' => '+965-5000-1001',
                'notes' => null,
                'payment_method' => 'cash_on_delivery',
                'payment_status' => 'refunded',
                'confirmed_at' => null,
                'delivered_at' => null,
                'cancelled_at' => now()->subDays(2),
                'status_trail' => ['pending', 'cancelled'],
            ],

            // Order 5: Fatima — Preparing (Sympathy)
            [
                'user' => $fatima,
                'order_number' => 'HAV-2026-0005',
                'status' => 'preparing',
                'items' => [
                    ['slug' => 'silent-ivory-grace', 'quantity' => 1],
                    ['slug' => 'gentle-farewell-bloom', 'quantity' => 1],
                ],
                'shipping_address' => 'Kuwait City, Block 4, Street 10, Building 15, Floor 1, Apt 2',
                'shipping_phone' => '+965-5000-1002',
                'notes' => 'Please deliver before 10 AM if possible',
                'payment_method' => 'cash_on_delivery',
                'payment_status' => 'pending',
                'confirmed_at' => now()->subHours(5),
                'delivered_at' => null,
                'cancelled_at' => null,
                'status_trail' => ['pending', 'confirmed', 'preparing'],
            ],
        ];

        foreach ($orders as $orderData) {
            // Calculate totals
            $subtotal = 0;
            $orderItems = [];

            foreach ($orderData['items'] as $item) {
                $product = Product::where('slug', $item['slug'])->first();
                if ($product) {
                    $price = $product->effectivePrice();
                    $itemTotal = bcmul($price, (string) $item['quantity'], 3);
                    $subtotal = bcadd($subtotal, $itemTotal, 3);

                    $orderItems[] = [
                        'product' => $product,
                        'quantity' => $item['quantity'],
                        'price' => $price,
                    ];
                }
            }

            $shippingCost = '2.000';
            $discount = '0.000';
            $total = bcadd($subtotal, $shippingCost, 3);

            // Create order
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

            // Create order items (snapshot data)
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

            // Create status history trail
            $admin = User::where('role', 'admin')->first();
            foreach ($orderData['status_trail'] as $index => $status) {
                OrderStatusHistory::create([
                    'order_id' => $order->id,
                    'status' => $status,
                    'changed_by' => $status === 'pending' ? null : $admin->id,
                    'note' => $status === 'pending' ? 'Order placed by customer' : "Status updated to {$status}",
                    'created_at' => now()->subDays(count($orderData['status_trail']) - $index),
                ]);
            }
        }
    }
}
