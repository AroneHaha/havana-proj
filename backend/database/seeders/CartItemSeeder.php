<?php

namespace Database\Seeders;

use App\Models\CartItem;
use App\Models\User;
use App\Models\Product;
use Illuminate\Database\Seeder;

class CartItemSeeder extends Seeder
{
    public function run(): void
    {
        // Use Ahmed (first customer) for cart items
        $ahmed = User::where('email', 'ahmed@example.com')->first();

        $products = Product::inRandomOrder()->take(3)->get();

        $cartItems = [
            ['product' => Product::where('slug', 'red-rose-bunch')->first(), 'quantity' => 2],
            ['product' => Product::where('slug', 'sunshine-bouquet')->first(), 'quantity' => 1],
            ['product' => Product::where('slug', 'orchid-in-pot')->first(), 'quantity' => 1],
        ];

        foreach ($cartItems as $item) {
            if ($item['product']) {
                CartItem::create([
                    'user_id' => $ahmed->id,
                    'product_id' => $item['product']->id,
                    'quantity' => $item['quantity'],
                ]);
            }
        }
    }
}
