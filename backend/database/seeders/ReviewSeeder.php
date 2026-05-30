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
        $reviews = [
            // Eid products
            [
                'product_slug' => 'noor-al-zahra-basket',
                'user_email' => 'ahmed@example.com',
                'rating' => 5,
                'title' => 'Stunning Eid centerpiece!',
                'comment' => 'The basket was absolutely beautiful and made our Eid gathering so special. The sunflowers and orchids were fresh and vibrant.',
                'visibility' => 'visible',
            ],
            [
                'product_slug' => 'desert-pearl-ensemble',
                'user_email' => 'fatima@example.com',
                'rating' => 5,
                'title' => 'Pure Arabian luxury',
                'comment' => 'The champagne roses with silver foliage looked incredible. Perfect for gifting VIP guests during Eid.',
                'visibility' => 'visible',
            ],
            [
                'product_slug' => 'golden-lantern-petals',
                'user_email' => 'omar@example.com',
                'rating' => 4,
                'title' => 'Warm and cheerful',
                'comment' => 'The yellow chrysanthemums really do look like glowing lanterns. Great value for the price.',
                'visibility' => 'visible',
            ],
            [
                'product_slug' => 'moonlit-saffron-bloom',
                'user_email' => 'noor@example.com',
                'rating' => 3,
                'title' => 'Nice but smaller than expected',
                'comment' => 'The flowers were beautiful but the arrangement was smaller than what was shown in the photos.',
                'visibility' => 'pending',
            ],

            // Wedding products
            [
                'product_slug' => 'royal-union-fleur',
                'user_email' => 'sara@example.com',
                'rating' => 5,
                'title' => 'Worth every fils',
                'comment' => 'The premium imported roses with the pearl wrap were absolutely breathtaking. Made our wedding unforgettable.',
                'visibility' => 'visible',
            ],
            [
                'product_slug' => 'ivory-vow-symphony',
                'user_email' => 'fatima@example.com',
                'rating' => 5,
                'title' => 'Dream bridal bouquet',
                'comment' => 'The peonies and baby\'s breath combination was pure elegance. Exactly what I envisioned for my wedding.',
                'visibility' => 'visible',
            ],

            // Birthday products
            [
                'product_slug' => 'sunset-confetti-bloom',
                'user_email' => 'ahmed@example.com',
                'rating' => 4,
                'title' => 'Birthday energy in a bouquet!',
                'comment' => 'The orange roses and yellow tulips combination is so cheerful. My sister loved it for her birthday!',
                'visibility' => 'visible',
            ],

            // Anniversary products
            [
                'product_slug' => 'eternal-flame-roses',
                'user_email' => 'omar@example.com',
                'rating' => 5,
                'title' => 'Spoke louder than words',
                'comment' => 'The deep red roses with silver accents were the perfect anniversary gift. My wife was speechless.',
                'visibility' => 'visible',
            ],
            [
                'product_slug' => 'champagne-love-garden',
                'user_email' => 'ahmed@example.com',
                'rating' => 2,
                'title' => 'Disappointing for the price',
                'comment' => 'Expected more roses for 34 KWD. The arrangement looked sparse compared to the product photo.',
                'visibility' => 'hidden',
            ],

            // Love & Romance products
            [
                'product_slug' => 'crimson-desire-bouquet',
                'user_email' => 'noor@example.com',
                'rating' => 5,
                'title' => 'The black wrap is everything',
                'comment' => 'Such a bold and unique presentation! The black wrap with silver leaves made these red roses stand out.',
                'visibility' => 'visible',
            ],
        ];

        $count = 0;
        $skipped = 0;
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
                $count++;
            } else {
                $skipped++;
                $reason = [];
                if (! $product) $reason[] = "product '{$review['product_slug']}' not found";
                if (! $user) $reason[] = "user '{$review['user_email']}' not found";
                $this->command->warn('Skipped review: ' . implode(', ', $reason) . '.');
            }
        }

        $this->command->info("Created {$count} reviews" . ($skipped ? ", skipped {$skipped}." : '.'));
    }
}
