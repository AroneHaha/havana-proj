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
        $ahmed = User::where('email', 'ahmed@example.com')->first();

        if (! $ahmed) {
            $this->command->warn('User ahmed@example.com not found — skipping cart items.');
            return;
        }

        $cartItems = [
            ['slug' => 'noor-al-zahra-basket', 'quantity' => 1],
            ['slug' => 'golden-spark-bouquet', 'quantity' => 2],
            ['slug' => 'velvet-embrace-bouquet', 'quantity' => 1],
        ];

        $count = 0;
        foreach ($cartItems as $item) {
            $product = Product::where('slug', $item['slug'])->first();
            if ($product) {
                CartItem::create([
                    'user_id' => $ahmed->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                ]);
                $count++;
            } else {
                $this->command->warn("Product slug '{$item['slug']}' not found — skipping cart item.");
            }
        }

        $this->command->info("Created {$count} cart items for Ahmed.");
    }
}
