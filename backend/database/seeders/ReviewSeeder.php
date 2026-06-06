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
        $customers = [
            'ahmed@example.com',
            'fatima@example.com',
            'omar@example.com',
            'noor@example.com',
            'sara@example.com',
            'layla@example.com',
            'youssef@example.com',
            'maryam@example.com',
            'khalid@example.com',
            'huda@example.com',
        ];

        // 3 reviews per product: [rating, title, comment, visibility]
        // Customer index rotates so each user reviews multiple products
        $productReviews = [
            // ── EID ──────────────────────────────────────────
            'moonlit-saffron-bloom' => [
                [5, 'Perfect for Eid!', 'The saffron tones were so warm and elegant. This was the centerpiece of our Eid table and every guest complimented it. Truly a special arrangement!', 'visible'],
                [4, 'Beautiful but smaller', 'Gorgeous arrangement but slightly smaller than expected. The saffron colors are stunning though and the flowers were very fresh. Good value overall.', 'visible'],
                [3, 'Okay for the price', 'The arrangement was decent but I expected more volume for the price. Colors were nice but it felt a bit sparse. Still, the recipient liked it.', 'visible'],
            ],
            'crescent-velvet-garden' => [
                [5, 'Magnificent!', 'The velvet-textured petals are so unique and luxurious. This was the star of our Eid celebration. Absolutely worth every fils!', 'visible'],
                [4, 'Elegant arrangement', 'The velvet garden is stunning in person. Only giving 4 stars because delivery was a bit late. The flowers themselves were perfect though.', 'visible'],
                [3, 'Nice but pricey', 'The arrangement is pretty but I am not sure it justifies the premium price. Unique concept though and the flowers were fresh.', 'visible'],
            ],

            // ── WEDDINGS ─────────────────────────────────────
            'ivory-vow-symphony' => [
                [5, 'Dream bridal bouquet!', "The peonies and baby's breath combination was pure elegance. Exactly what I envisioned for my wedding. Havana made our day perfect!", 'visible'],
                [4, 'Beautiful bouquet', 'Gorgeous bridal bouquet that looked amazing in photos. Only giving 4 stars because a couple of peonies were still closed. They opened beautifully the next day though.', 'visible'],
                [3, 'Smaller than expected', 'The bouquet was pretty but felt a bit small for a bridal arrangement. The flowers were fresh but I expected more volume for the price.', 'visible'],
            ],
            'forever-silk-garden' => [
                [5, 'Eternal beauty!', 'The silk-like petals are incredibly realistic. This garden arrangement brought such elegance to our wedding reception. Guests could not believe they were real!', 'visible'],
                [4, 'Gorgeous arrangement', 'The flowers are beautiful and the silk-like texture is unique. Only minor issue was the delivery timing. Otherwise perfect for weddings.', 'visible'],
                [3, 'Pretty but delicate', 'The flowers were beautiful but very delicate. A few petals fell off during setup. Handle with care. Nice arrangement otherwise.', 'visible'],
            ],

            // ── BIRTHDAY ─────────────────────────────────────
            'sunset-confetti-bloom' => [
                [5, 'Birthday energy in a bouquet!', 'The orange roses and yellow tulips combination is so cheerful. My sister loved it for her birthday! The colors literally look like a sunset celebration.', 'visible'],
                [4, 'Fun and vibrant', 'Love the colorful mix. The orange and yellow combination is perfect for birthday celebrations. Just wish the tulips lasted a bit longer.', 'visible'],
                [3, 'Nice colors but small', 'The color combination is great for birthdays but the bouquet felt small. Expected more flowers for the price. Still, the recipient liked it.', 'visible'],
            ],
            'velvet-wish-petals' => [
                [5, 'Make a wish!', "The velvet petals are so soft and luxurious. This bouquet made my daughter's birthday feel so special. The deep colors are gorgeous!", 'visible'],
                [4, 'Unique and beautiful', 'The velvet petals are a nice touch that makes this bouquet stand out. Perfect for someone who appreciates unique gifts. Good birthday choice.', 'visible'],
                [3, 'Nice but nothing special', 'The velvet effect was subtle. Nice bouquet for a birthday but not as dramatic as I expected. Still, the recipient was happy.', 'visible'],
            ],

            // ── ANNIVERSARY ─────────────────────────────────
            'eternal-flame-roses' => [
                [5, 'Spoke louder than words!', 'The deep red roses with silver accents were the perfect anniversary gift. My wife was speechless. These roses truly embody eternal love!', 'visible'],
                [4, 'Romantic choice', 'Beautiful deep red roses perfect for anniversaries. The silver accents are elegant. Only giving 4 stars because I wished for a few more roses in the bunch.', 'visible'],
                [3, 'Nice but fewer roses', 'The roses were beautiful but there were fewer than expected. The silver accents are pretty. Good but not great for an anniversary splurge.', 'visible'],
            ],
            'champagne-love-garden' => [
                [5, 'Effervescent love!', 'The champagne-toned roses are so elegant and romantic. This garden-style arrangement made our anniversary feel like a celebration. Simply beautiful!', 'visible'],
                [4, 'Elegant arrangement', 'The champagne roses are stunning and the garden style is lovely. Only giving 4 stars because the arrangement was slightly different from the photo. Still gorgeous.', 'visible'],
                [3, 'Nice but expected more', 'The arrangement was pretty but I expected more roses for the price. The champagne color is lovely though. Good for an anniversary.', 'visible'],
            ],

            // ── GRADUATION ───────────────────────────────────
            'golden-triumph-bouquet' => [
                [5, 'Graduation glory!', "The golden tones are perfect for celebrating achievement! This bouquet made my daughter's graduation feel even more special. The triumph theme is spot on!", 'visible'],
                [4, 'Celebratory', 'Great bouquet for graduation celebrations. The golden colors are festive and the arrangement is well put together. Perfect way to celebrate success.', 'visible'],
                [3, 'Nice but small', 'The bouquet was pretty but felt small for a graduation gift. The golden colors are nice. Could use more volume for the price.', 'visible'],
            ],
            'scholars-bloom-basket' => [
                [5, 'Scholarly elegance!', "The basket arrangement is so refined and thoughtful. Perfect for a graduation gift. The flowers are beautiful and the basket adds a scholarly touch.", 'visible'],
                [4, 'Great graduation gift', 'Beautiful basket arrangement perfect for academic achievements. The flowers are fresh and the basket is well-made. Great presentation.', 'visible'],
                [3, 'Nice basket', 'The basket is nice but the arrangement could be fuller. Good graduation gift but not as impressive as the photos suggest.', 'visible'],
            ],

            // ── MOTHER'S DAY ──────────────────────────────────
            'velvet-embrace-bouquet' => [
                [5, "Mother's embrace!", "The soft velvet petals feel just like a mother's hug. This bouquet made my mom cry happy tears on Mother's Day. The most meaningful gift!", 'visible'],
                [4, 'Touching arrangement', "The velvet petals are a wonderful metaphor for a mother's love. The bouquet is beautiful and the sentiment is perfect for Mother's Day.", 'visible'],
                [3, 'Nice but velvet subtle', "Pretty bouquet for Mother's Day but the velvet effect was hard to notice. The flowers were fresh and the colors were warm though.", 'visible'],
            ],

            // ── LOVE & ROMANCE ────────────────────────────────
            'crimson-desire-bouquet' => [
                [5, 'The black wrap is everything!', 'Such a bold and unique presentation! The black wrap with silver leaves made these red roses stand out. The most romantic bouquet I have ever received!', 'visible'],
                [4, 'Bold and beautiful', 'The black wrap is such a unique touch. The red roses are vibrant and the silver leaves add elegance. A bold romantic gesture.', 'visible'],
                [3, 'Nice but wrap tears', 'The bouquet is pretty but the black wrap tore during delivery. The roses were fine. Still a nice romantic gift.', 'visible'],
            ],
            'midnight-serenade-bloom' => [
                [5, 'Midnight magic!', 'The deep purple tones are so mysterious and romantic. This bloom feels like a love song under the stars. The most romantic arrangement I have ever seen!', 'visible'],
                [4, 'Romantic and deep', 'The purple tones are so deep and romantic. The arrangement has a mysterious quality that is perfect for a romantic evening. Beautiful flowers.', 'visible'],
                [3, 'Nice purple bouquet', 'The purple flowers are pretty but the midnight theme was not as dramatic as expected. Still a nice romantic arrangement.', 'visible'],
            ],

            // ── SYMPATHY ─────────────────────────────────────
            'silent-ivory-grace' => [
                [5, 'Dignified tribute', 'The ivory arrangement was the most dignified and respectful tribute. The white flowers brought comfort during a difficult time. Thank you Havana for such grace.', 'visible'],
                [4, 'Elegant sympathy flowers', 'The ivory arrangement is so tasteful and respectful. Perfect for expressing condolences. The white flowers are pristine and the arrangement is dignified.', 'visible'],
                [3, 'Nice but small', 'The arrangement was pretty but smaller than expected for a sympathy piece. The ivory flowers were beautiful though. Decent quality.', 'visible'],
            ],
        ];

        $count = 0;
        $skipped = 0;
        $customerIndex = 0;

        foreach ($productReviews as $productSlug => $reviews) {
            $product = Product::where('slug', $productSlug)->first();

            if (! $product) {
                $skipped++;
                $this->command->warn("Skipped product: '{$productSlug}' not found.");
                continue;
            }

            foreach ($reviews as $review) {
                $customerEmail = $customers[$customerIndex % count($customers)];
                $customerIndex++;

                $user = User::where('email', $customerEmail)->first();
                if (! $user) {
                    $skipped++;
                    continue;
                }

                $exists = Review::where('product_id', $product->id)
                    ->where('user_id', $user->id)
                    ->exists();

                if ($exists) {
                    $skipped++;
                    continue;
                }

                Review::create([
                    'product_id' => $product->id,
                    'user_id' => $user->id,
                    'rating' => $review[0],
                    'title' => $review[1],
                    'comment' => $review[2],
                    'visibility' => $review[3],
                ]);
                $count++;
            }
        }

        $this->command->info("Created {$count} reviews" . ($skipped ? ", skipped {$skipped}." : '.'));
    }
}
