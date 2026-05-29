<?php

namespace Database\Seeders;

use App\Models\Review;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $customers = User::where('role', 'customer')->get();

        $reviews = [
            // Red Rose Bunch reviews
            [
                'product_slug' => 'red-rose-bunch',
                'user_email' => 'user1@gmail.com',
                'rating' => 5,
                'title' => 'Absolutely stunning!',
                'comment' => 'The roses were fresh and beautifully arranged. My wife loved them!',
                'visibility' => 'visible',
            ],
            [
                'product_slug' => 'red-rose-bunch',
                'user_email' => 'user2@gmail.com',
                'rating' => 4,
                'title' => 'Great quality',
                'comment' => 'Beautiful flowers, delivery was on time. Would order again.',
                'visibility' => 'visible',
            ],
            [
                'product_slug' => 'red-rose-bunch',
                'user_email' => 'user3@gmail.com',
                'rating' => 3,
                'title' => 'Decent but...',
                'comment' => 'Flowers were nice but some petals were slightly damaged.',
                'visibility' => 'pending',
            ],

            // Sunshine Bouquet reviews
            [
                'product_slug' => 'sunshine-bouquet',
                'user_email' => 'user4@gmail.com',
                'rating' => 5,
                'title' => 'Perfect birthday gift',
                'comment' => 'Bright and cheerful! Exactly what I wanted for my friend birthday.',
                'visibility' => 'visible',
            ],

            // White Rose Box reviews
            [
                'product_slug' => 'white-rose-box',
                'user_email' => 'user5@gmail.com',
                'rating' => 5,
                'title' => 'Elegant and luxurious',
                'comment' => 'The box presentation was amazing. Perfect for special occasions.',
                'visibility' => 'visible',
            ],
            [
                'product_slug' => 'white-rose-box',
                'user_email' => 'user1@gmail.com',
                'rating' => 2,
                'title' => 'Not worth the price',
                'comment' => 'Expected more for the price. The box was smaller than shown in photos.',
                'visibility' => 'hidden',
            ],

            // Orchid in Pot reviews
            [
                'product_slug' => 'orchid-in-pot',
                'user_email' => 'user2@gmail.com',
                'rating' => 5,
                'title' => 'Lasted over a month!',
                'comment' => 'The orchid is still blooming after 5 weeks. Amazing quality.',
                'visibility' => 'visible',
            ],

            // 100 Red Roses Basket
            [
                'product_slug' => '100-red-roses-basket',
                'user_email' => 'user3@gmail.com',
                'rating' => 5,
                'title' => 'Showstopper!',
                'comment' => 'This basket made the entire event. Everyone was taking photos of it.',
                'visibility' => 'visible',
            ],
        ];

        foreach ($reviews as $review) {
            $product = Product::where('slug', $review['product_slug'])->first();
            $user = User::where('email', $review['user_email'])->first();

            if ($product && $user) {
                Review::create([
                    'product_id' => $product->id,
                    'user_id' => $user->id,
                    'rating' => $review['rating'],
                    'title' => $review['title'],
                    'comment' => $review['comment'],
                    'visibility' => $review['visibility'],
                ]);
            }
        }
    }
}