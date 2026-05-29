<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(3, 5, 200);
        $shipping = bccomp((string) $subtotal, '10.000', 3) >= 0 ? '0.000' : '1.000';

        return [
            'user_id' => \App\Models\User::factory(),
            'order_number' => 'HVN-' . strtoupper(Str::random(8)),
            'status' => 'pending',
            'subtotal' => bcmul((string) $subtotal, '1', 3),
            'shipping_cost' => $shipping,
            'discount' => '0.000',
            'total' => bcadd(bcadd((string) $subtotal, $shipping, 3), '0.000', 3),
            'payment_method' => fake()->randomElement(['cash_on_delivery', 'knet', 'card']),
            'payment_status' => 'pending',
            'shipping_address' => fake()->address(),
            'shipping_phone' => fake()->phoneNumber(),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
