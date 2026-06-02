<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\User;
use Illuminate\Console\Command;

class CreateTestOrder extends Command
{
    protected $signature = 'order:create-test
                                {--status=pending : Order status (pending, confirmed, preparing, out_for_delivery, delivered, cancelled)}
                                {--user= : User email (random if omitted)}
                                {--count=1 : Number of orders to create}';

    protected $description = 'Create a test order with random or specific data for debugging.';

    public function handle(): int
    {
        $count = (int) $this->option('count');
        $status = $this->option('status');
        $validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

        if (! in_array($status, $validStatuses)) {
            $this->error("Invalid status '{$status}'. Use: " . implode(', ', $validStatuses));
            return self::FAILURE;
        }

        $customers = User::where('role', 'customer')->get();
        if ($customers->isEmpty()) {
            $this->error('No customer users found. Run db:seed first.');
            return self::FAILURE;
        }

        $products = Product::where('is_active', true)->get();
        if ($products->isEmpty()) {
            $this->error('No active products found. Run db:seed first.');
            return self::FAILURE;
        }

        // Get the highest order number to generate the next one
        $lastOrderNumber = Order::orderByDesc('created_at')->value('order_number');
        $nextNumber = 1;
        if ($lastOrderNumber && preg_match('/(\d+)$/', $lastOrderNumber, $matches)) {
            $nextNumber = (int) $matches[1] + 1;
        }

        // Status trail for each status
        $statusTrails = [
            'pending'          => ['pending'],
            'confirmed'        => ['pending', 'confirmed'],
            'preparing'        => ['pending', 'confirmed', 'preparing'],
            'out_for_delivery' => ['pending', 'confirmed', 'preparing', 'out_for_delivery'],
            'delivered'        => ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'],
            'cancelled'        => ['pending', 'cancelled'],
        ];

        $addresses = [
            'Salmiya, Block 12, Street 5, Building 30, Floor 3, Apt 7',
            'Kuwait City, Block 4, Street 10, Building 15, Floor 1, Apt 2',
            'Hawally, Block 7, Street 3, Building 22, Floor 5, Apt 12',
            'Mishref, Block 4, Street 6, Building 18, Floor 2, Apt 5',
            'Bayan, Block 5, Street 12, Building 7, Floor 4, Apt 9',
        ];

        $admin = User::where('role', 'admin')->first();

        for ($i = 0; $i < $count; $i++) {
            $user = null;

            if ($this->option('user')) {
                $user = User::where('email', $this->option('user'))->first();
                if (! $user) {
                    $this->warn("User '{$this->option('user')}' not found, using random customer.");
                    $user = $customers->random();
                }
            } else {
                $user = $customers->random();
            }

            // Pick 1-3 random products
            $itemCount = rand(1, 3);
            $selectedProducts = $products->random(min($itemCount, $products->count()));
            $orderItems = [];
            $subtotal = '0';

            foreach ($selectedProducts as $product) {
                $qty = rand(1, 3);
                $price = $product->effectivePrice();
                $itemTotal = bcmul($price, (string) $qty, 3);
                $subtotal = bcadd($subtotal, $itemTotal, 3);
                $orderItems[] = [
                    'product' => $product,
                    'quantity' => $qty,
                    'price' => $price,
                ];
            }

            $shippingCost = '2.000';
            $discount = '0.000';
            $total = bcadd($subtotal, $shippingCost, 3);

            $orderNumber = 'HAV-2026-' . str_pad($nextNumber + $i, 4, '0', STR_PAD_LEFT);
            $address = $addresses[array_rand($addresses)];
            $phone = '+965-5000-' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT);
            $notes = rand(0, 3) === 0 ? 'Test order — please handle with care' : null;

            // Timestamps based on status
            $confirmedAt = null;
            $deliveredAt = null;
            $cancelledAt = null;
            if (in_array($status, ['confirmed', 'preparing', 'out_for_delivery', 'delivered'])) {
                $confirmedAt = now()->subHours(rand(1, 48));
            }
            if ($status === 'delivered') {
                $deliveredAt = now()->subHours(rand(1, 12));
            }
            if ($status === 'cancelled') {
                $cancelledAt = now()->subHours(rand(1, 24));
            }

            $order = Order::create([
                'user_id'         => $user->id,
                'order_number'    => $orderNumber,
                'status'          => $status,
                'subtotal'        => $subtotal,
                'shipping_cost'   => $shippingCost,
                'discount'        => $discount,
                'total'           => $total,
                'payment_method'  => 'cash_on_delivery',
                'payment_status'  => $status === 'delivered' ? 'paid' : 'pending',
                'shipping_address' => $address,
                'shipping_phone'  => $phone,
                'notes'           => $notes,
                'confirmed_at'    => $confirmedAt,
                'delivered_at'    => $deliveredAt,
                'cancelled_at'    => $cancelledAt,
            ]);

            // Create order items
            foreach ($orderItems as $itemData) {
                OrderItem::create([
                    'order_id'      => $order->id,
                    'product_id'    => $itemData['product']->id,
                    'product_name'  => $itemData['product']->name_en,
                    'product_image' => $itemData['product']->image,
                    'price'         => $itemData['price'],
                    'quantity'      => $itemData['quantity'],
                ]);
            }

            // Create status history trail
            $trail = $statusTrails[$status];
            foreach ($trail as $idx => $trailStatus) {
                OrderStatusHistory::create([
                    'order_id'   => $order->id,
                    'status'     => $trailStatus,
                    'changed_by' => $trailStatus === 'pending' ? null : $admin?->id,
                    'note'       => $trailStatus === 'pending'
                        ? 'Order placed by customer'
                        : "Status updated to {$trailStatus}",
                    'created_at' => now()->subHours(count($trail) - $idx),
                ]);
            }

            $this->info("✅ Order #{$orderNumber} created");
            $this->line("   Customer: {$user->full_name} ({$user->email})");
            $this->line("   Status:   {$status}");
            $this->line("   Items:    " . count($orderItems) . ' product(s)');
            $this->line("   Subtotal: {$subtotal} KWD");
            $this->line("   Shipping: {$shippingCost} KWD");
            $this->line("   Total:    {$total} KWD");
            if ($notes) {
                $this->line("   Notes:    {$notes}");
            }
            $this->newLine();
        }

        $this->info("Created {$count} order(s). Go to the admin Orders page to test.");

        return self::SUCCESS;
    }
}