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
        // Ahmed's cart
        $ahmed = User::where('email', 'ahmed@example.com')->first();

        $cartItems = [
            ['slug' => 'noor-al-zahra-basket', 'quantity' => 1],
            ['slug' => 'golden-spark-bouquet', 'quantity' => 2],
            ['slug' => 'velvet-embrace-bouquet', 'quantity' => 1],
        ];

        foreach ($cartItems as $item) {
            $product = Product::where('slug', $item['slug'])->first();
            if ($product) {
                CartItem::create([
                    'user_id' => $ahmed->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                ]);
            }
        }
    }
}
