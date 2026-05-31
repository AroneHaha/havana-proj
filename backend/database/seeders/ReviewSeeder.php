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
        // All customer emails from UserSeeder (excluding admin@gmail.com)
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

        // 10 reviews per product. Each review maps to a customer by index (0-9).
        // Structure: [rating, title, comment, visibility]
        $reviewTemplates = [
            // Rating 5 reviews (3 per product)
            [5, null, 'Absolutely stunning! Exceeded all my expectations. The flowers were incredibly fresh and the arrangement was picture-perfect. Will definitely order again!', 'visible'],
            [5, 'Pure luxury!', 'The quality is unmatched. Every detail from the wrapping to the flower selection shows real craftsmanship. Perfect for special occasions.', 'visible'],
            [5, null, 'Ordered this for a loved one and they were overjoyed. The fragrance filled the entire room. Havana never disappoints with their arrangements!', 'visible'],

            // Rating 4 reviews (3 per product)
            [4, 'Beautiful but slight issue', 'The arrangement was gorgeous and the flowers were fresh. Only reason for 4 stars is the delivery was about 20 minutes late. The product itself was perfect though.', 'visible'],
            [4, null, 'Really lovely product overall. The flowers lasted well over a week which is impressive. Would have loved a slightly larger size option but still very satisfied.', 'visible'],
            [4, 'Great choice', 'You can never go wrong with this one. The quality is consistent and the presentation is elegant. Perfect gift for any occasion. Highly recommend!', 'visible'],

            // Rating 3 reviews (2 per product)
            [3, 'Good but expected more', 'The flowers were nice but the arrangement felt a bit sparse compared to the product photo. For the price, I expected a fuller look. Quality is there though.', 'visible'],
            [3, null, 'Decent product but nothing extraordinary. The flowers were fresh which is great, but the overall presentation felt average. Good for casual gifting.', 'visible'],

            // Rating 2 review (1 per product)
            [2, 'Disappointed', 'The flowers arrived slightly wilted and some petals were already falling off. Expected much better quality for the price. Customer service was helpful though.', 'visible'],

            // Rating 1 or mixed visibility (1 per product)
            [1, 'Not what I expected', 'The arrangement looked nothing like the photo. Very disappointed with the presentation. I have contacted support for a resolution.', 'hidden'],
        ];

        // Category-specific comment overrides to make reviews feel authentic
        $categoryComments = [
            // Eid products
            'moonlit-saffron-bloom' => [
                [5, 'Perfect for Eid!', 'The saffron tones were so warm and elegant. This was the centerpiece of our Eid table and every guest complimented it. Truly a special arrangement!', 'visible'],
                [5, null, 'Ordered this for my mother for Eid and she absolutely loved it. The warm golden hues are so fitting for the occasion. Havana nailed the festive spirit!', 'visible'],
                [5, 'Eid magic!', 'This arrangement made our Eid celebration feel so luxurious. The fragrance and colors are perfectly balanced. Already planning to order again next Eid!', 'visible'],
                [4, 'Beautiful but smaller', 'Gorgeous arrangement but slightly smaller than expected. The saffron colors are stunning though and the flowers were very fresh. Good value overall.', 'visible'],
                [4, null, 'Really pretty Eid centerpiece. The warm tones matched our decor perfectly. Delivery was on time. Just wish the arrangement was a bit fuller.', 'visible'],
                [4, 'Solid choice', 'Great for Eid gifting. The presentation is elegant and the flowers lasted over a week. Reliable quality from Havana as always.', 'visible'],
                [3, 'Okay for the price', 'The arrangement was decent but I expected more volume for the price. Colors were nice but it felt a bit sparse. Still, the recipient liked it.', 'visible'],
                [3, null, 'Nice flowers but the arrangement could have been better. The saffron theme is lovely though. Average experience overall.', 'visible'],
                [2, 'Wilted on arrival', 'Some of the flowers were already drooping when delivered. Not what I expected from Havana. Hope they improve their packaging for deliveries.', 'visible'],
                [1, 'Very disappointing', 'Looked completely different from the website photo. The colors were dull and the arrangement was messy. Requested a replacement.', 'hidden'],
            ],
            'crescent-velvet-garden' => [
                [5, 'Magnificent!', 'The velvet-textured petals are so unique and luxurious. This was the star of our Eid celebration. Absolutely worth every fils!', 'visible'],
                [5, null, 'The deep jewel tones are breathtaking. Perfect for adding elegance to any festive occasion. My family was amazed by the quality.', 'visible'],
                [5, 'Showstopper!', 'Every guest at our Eid gathering asked where this arrangement came from. The velvet finish on the petals is unlike anything I have seen before.', 'visible'],
                [4, 'Elegant arrangement', 'The velvet garden is stunning in person. Only giving 4 stars because delivery was a bit late. The flowers themselves were perfect though.', 'visible'],
                [4, null, 'Beautiful and unique. The deep colors are very regal and perfect for festive settings. Would love a larger size option.', 'visible'],
                [4, 'Impressive', 'The velvet texture of the petals really sets this apart from other arrangements. Great for making a statement at any event.', 'visible'],
                [3, 'Nice but pricey', 'The arrangement is pretty but I am not sure it justifies the premium price. Unique concept though and the flowers were fresh.', 'visible'],
                [3, null, 'Interesting design but the velvet effect was less pronounced in person. Still a nice arrangement, just not as striking as the photos suggest.', 'visible'],
                [2, 'Underwhelming', 'Expected more drama and texture based on the description. The arrangement felt ordinary despite the velvet theme.', 'visible'],
                [1, 'Not worth it', 'The velvet effect was barely noticeable and the arrangement was sparse. Disappointed given the premium pricing.', 'pending'],
            ],
            'noor-al-zahra-basket' => [
                [5, 'Stunning Eid centerpiece!', 'The basket was absolutely beautiful and made our Eid gathering so special. The sunflowers and orchids were fresh and vibrant.', 'visible'],
                [5, null, 'This basket brought so much light and joy to our home. The mix of sunflowers and orchids is brilliant. Noor Al-Zahra is the perfect name!', 'visible'],
                [5, 'Radiant!', 'The basket arrangement is even more beautiful in person. The combination of flowers creates such a warm, inviting atmosphere. Perfect for Eid!', 'visible'],
                [4, 'Lovely basket', 'Really gorgeous basket arrangement. The flowers were fresh and the presentation was excellent. Only wish the basket was slightly larger.', 'visible'],
                [4, null, 'Great for gifting during Eid. The basket is beautifully woven and the flowers complement it perfectly. Delivery was prompt too.', 'visible'],
                [4, 'Solid choice', 'A reliable and beautiful choice for any occasion. The basket adds a nice rustic touch. Flowers lasted over a week.', 'visible'],
                [3, 'Good but smaller', 'The basket was smaller than it appeared in photos. The flowers were nice but I expected more volume. Quality is decent though.', 'visible'],
                [3, null, 'Pretty arrangement but the basket felt a bit flimsy. The flowers were fresh and vibrant though. Average experience.', 'visible'],
                [2, 'Disappointing quality', 'Some flowers were already wilting upon delivery. The basket itself was nice but the flower quality did not meet my expectations.', 'visible'],
                [1, 'Not as pictured', 'The arrangement looked sparse and cheap compared to the photos. Very disappointed. I hope they can improve the quality.', 'hidden'],
            ],
            'golden-lantern-petals' => [
                [5, 'Warm and cheerful!', 'The yellow chrysanthemums really do look like glowing lanterns. Great value for the price. Added such a warm vibe to our Eid celebration!', 'visible'],
                [5, null, 'The golden tones are perfect for Eid! The chrysanthemums were huge and radiant. This arrangement literally glows with warmth.', 'visible'],
                [5, 'Festive perfection!', 'Like little lanterns of joy! The golden yellow flowers brought so much happiness to our home. My mother-in-law was thrilled with this gift.', 'visible'],
                [4, 'Great value', 'Beautiful arrangement at a reasonable price. The golden chrysanthemums are long-lasting and cheerful. Perfect for festive occasions.', 'visible'],
                [4, null, 'Really lovely warm-toned arrangement. The lantern concept is creative and well-executed. Fast delivery too!', 'visible'],
                [4, 'Reliable choice', 'You can always count on this arrangement for a warm, festive feel. The yellow flowers are so cheerful and uplifting.', 'visible'],
                [3, 'Nice but ordinary', 'The chrysanthemums were nice but the arrangement felt a bit plain. Could use some contrasting filler flowers for more visual interest.', 'visible'],
                [3, null, 'Good value for money but nothing extraordinary. The golden color is pretty. Decent for casual gifting.', 'visible'],
                [2, 'Dull colors', 'The golden yellow was more like a pale yellow in person. Not as vibrant as shown. Disappointing for a festive arrangement.', 'visible'],
                [1, 'Poor quality', 'Several chrysanthemums were brown around the edges when delivered. Not acceptable for the price. Requested a refund.', 'pending'],
            ],
            'desert-pearl-ensemble' => [
                [5, 'Pure Arabian luxury', 'The champagne roses with silver foliage looked incredible. Perfect for gifting VIP guests during Eid. This arrangement screams sophistication!', 'visible'],
                [5, null, 'The most elegant arrangement I have ever sent. The champagne roses are so refined and the silver accents add a touch of Arabian luxury. Stunning!', 'visible'],
                [5, 'VIP worthy!', 'Sent this to our biggest client for Eid and they were blown away. The pearl-toned roses are exquisite. A true premium product.', 'visible'],
                [4, 'Sophisticated', 'Very refined arrangement. The champagne color is subtle and classy. Only giving 4 stars because I wished for more roses in the bunch.', 'visible'],
                [4, null, 'Beautiful ensemble that looks very premium. The silver foliage is a wonderful touch. Perfect for formal Eid gifting.', 'visible'],
                [4, 'Classy choice', 'The desert pearl is perfect for anyone who appreciates understated elegance. Not flashy but very sophisticated. Great for business gifting.', 'visible'],
                [3, 'Pricey for what you get', 'The roses were beautiful but the arrangement felt a bit small for the premium price. Quality is undeniable but quantity was lacking.', 'visible'],
                [3, null, 'Nice arrangement but I expected more wow factor for the price. The champagne color is lovely though. Good for formal settings.', 'visible'],
                [2, 'Overpriced', 'You are paying for the concept more than the flowers. Nice but not worth the premium price tag. Could get similar quality elsewhere for less.', 'visible'],
                [1, 'Not premium at all', 'The arrangement looked cheap compared to the photos. The silver foliage was already browning. Not what I expected at this price point.', 'hidden'],
            ],

            // Wedding products
            'ivory-vow-symphony' => [
                [5, 'Dream bridal bouquet!', 'The peonies and baby\'s breath combination was pure elegance. Exactly what I envisioned for my wedding. Havana made our day perfect!', 'visible'],
                [5, null, 'Every bride needs this bouquet. The ivory peonies are so romantic and the baby\'s breath adds the perfect fairy-tale touch. Absolutely dreamy!', 'visible'],
                [5, 'Wedding perfection!', 'The bouquet was the highlight of our wedding photos. The ivory tones matched our theme perfectly. Worth every fils for your special day!', 'visible'],
                [4, 'Beautiful bouquet', 'Gorgeous bridal bouquet that looked amazing in photos. Only giving 4 stars because a couple of peonies were still closed. They opened beautifully the next day though.', 'visible'],
                [4, null, 'Really elegant bridal bouquet. The ivory and white combination is timeless. Delivery was right on time for our ceremony.', 'visible'],
                [4, 'Classic choice', 'You cannot go wrong with the Ivory Vow for a wedding. It is classic, elegant, and the quality is consistent. Our florist did an amazing job.', 'visible'],
                [3, 'Smaller than expected', 'The bouquet was pretty but felt a bit small for a bridal arrangement. The flowers were fresh but I expected more volume for the price.', 'visible'],
                [3, null, 'Nice bouquet but some petals were slightly bruised. Still looked good overall. Average experience for a wedding arrangement.', 'visible'],
                [2, 'Disappointing', 'Several peonies arrived damaged. Not acceptable for a bridal bouquet. Havana replaced it quickly but the stress was unnecessary.', 'visible'],
                [1, 'Ruined my wedding morning', 'The bouquet arrived late and looked nothing like the photo. Very upsetting on your wedding day. They did refund me but the damage was done.', 'hidden'],
            ],
            'forever-silk-garden' => [
                [5, 'Eternal beauty!', 'The silk-like petals are incredibly realistic. This garden arrangement brought such elegance to our wedding reception. Guests could not believe they were real!', 'visible'],
                [5, null, 'The forever silk garden is the perfect wedding centerpiece. The delicate petals look like they will last forever. Absolutely breathtaking arrangement!', 'visible'],
                [5, 'Reception showstopper!', 'Every table at our wedding had one of these and the photos turned out amazing. The silk-like quality of the flowers is unreal. Best decision we made!', 'visible'],
                [4, 'Gorgeous arrangement', 'The flowers are beautiful and the silk-like texture is unique. Only minor issue was the delivery timing. Otherwise perfect for weddings.', 'visible'],
                [4, null, 'Really elegant garden-style arrangement. The mix of flowers creates a romantic, dreamy atmosphere. Perfect for wedding venues.', 'visible'],
                [4, 'Great for events', 'We used these for our engagement party and they were a hit. The silk-like quality makes them look premium and sophisticated.', 'visible'],
                [3, 'Pretty but delicate', 'The flowers were beautiful but very delicate. A few petals fell off during setup. Handle with care. Nice arrangement otherwise.', 'visible'],
                [3, null, 'Good quality flowers but the arrangement was a bit different from the photo. Still pretty but not exactly what I ordered.', 'visible'],
                [2, 'Too fragile', 'Multiple petals fell off during transport. Not ideal for a wedding where everything needs to be perfect. Disappointing.', 'visible'],
                [1, 'Not as described', 'The silk-like quality was nowhere to be found. The flowers looked ordinary. Overpriced for what you actually get.', 'pending'],
            ],
            'velvet-chapel-bloom' => [
                [5, 'Chapel perfection!', 'The deep velvet tones created such a romantic atmosphere in our wedding chapel. Every guest was in awe. The most beautiful arrangement we have ever seen!', 'visible'],
                [5, null, 'The velvet textures and rich colors are made for a chapel setting. Our ceremony felt like a fairy tale thanks to this stunning arrangement.', 'visible'],
                [5, 'Divine!', 'The rich velvet blooms transformed our wedding venue into something magical. The deep colors are so romantic and the quality is exceptional.', 'visible'],
                [4, 'Beautiful ceremony flowers', 'Gorgeous deep-toned arrangement perfect for church weddings. The velvet petals add such a luxurious touch. Highly recommend for formal ceremonies.', 'visible'],
                [4, null, 'Really stunning arrangement. The deep reds and purples created a wonderfully romantic setting. Just wish we had ordered more for the entrance.', 'visible'],
                [4, 'Elegant choice', 'The velvet chapel bloom is perfect for traditional weddings. The rich tones and velvet textures are sophisticated and timeless.', 'visible'],
                [3, 'Nice but dark', 'The arrangement was beautiful but the colors were darker than expected. Make sure your venue has good lighting. Quality is good though.', 'visible'],
                [3, null, 'Decent arrangement for a chapel setting. The velvet look is interesting. Not as full as I expected but still pretty.', 'visible'],
                [2, 'Too dark', 'The colors were much darker than the photos suggested. The arrangement felt heavy and gloomy rather than romantic. Not for bright venues.', 'visible'],
                [1, 'Completely different', 'The arrangement we received looked nothing like the photo. The velvet effect was barely visible. Very disappointing for our wedding.', 'hidden'],
            ],
            'celestial-promise-bouquet' => [
                [5, 'Heavenly!', 'The celestial theme is executed perfectly. The ethereal white and silver combination made our wedding feel like a dream. Absolutely magical!', 'visible'],
                [5, null, 'Like holding a piece of heaven. The white flowers with silver accents are so pure and elegant. The perfect bouquet for exchanging vows.', 'visible'],
                [5, 'Divine bouquet!', 'The celestial promise bouquet was the most beautiful thing at our wedding. The silver accents catch the light beautifully. Truly ethereal!', 'visible'],
                [4, 'Ethereal beauty', 'The white and silver combination is stunning. Only giving 4 stars because the silver accents were slightly different from the photo. Still gorgeous though.', 'visible'],
                [4, null, 'Very elegant bouquet with a celestial quality. The white flowers are pristine and the silver details add a magical touch. Perfect for weddings.', 'visible'],
                [4, 'Lovely concept', 'The celestial theme is unique and well-executed. Great for couples who want something different from traditional wedding flowers.', 'visible'],
                [3, 'Pretty but not celestial', 'Nice white bouquet but I did not really get the celestial vibe from it. The silver accents were minimal. Still a pretty arrangement though.', 'visible'],
                [3, null, 'Good quality flowers but the arrangement could be more dramatic. The celestial concept needs more impact. Decent for the price.', 'visible'],
                [2, 'Understated to a fault', 'The bouquet was so understated it looked almost plain. Expected more drama and celestial elements. Not worth the premium.', 'visible'],
                [1, 'Boring', 'Looked like a basic white bouquet with a few silver leaves. Nothing celestial about it. Very overpriced for what you get.', 'pending'],
            ],
            'royal-union-fleur' => [
                [5, 'Worth every fils!', 'The premium imported roses with the pearl wrap were absolutely breathtaking. Made our wedding unforgettable. This is THE bouquet for a royal wedding feel!', 'visible'],
                [5, null, 'The most luxurious wedding bouquet I have ever seen. The imported roses are perfect and the pearl wrap adds such a regal touch. Havana exceeded all expectations!', 'visible'],
                [5, 'Royal treatment!', 'If you want to feel like royalty on your wedding day, this is the bouquet. The pearl-wrapped roses are exquisite. Every detail is perfection!', 'visible'],
                [4, 'Premium quality', 'The imported roses are clearly superior to local ones. The pearl wrap is elegant. Only giving 4 stars because it is quite expensive, but you get what you pay for.', 'visible'],
                [4, null, 'Stunning bouquet that looks even better in person. The roses are huge and the pearl wrap adds sophistication. Perfect for a luxury wedding.', 'visible'],
                [4, 'Impressive', 'The royal union is worth the splurge for your special day. The imported roses are flawless and the presentation is top-notch.', 'visible'],
                [3, 'Nice but overpriced', 'The roses were beautiful but I am not sure the premium price is justified. You are paying for the brand more than the flowers. Still a nice bouquet.', 'visible'],
                [3, null, 'Good quality bouquet but I expected more roses for the price. The pearl wrap is pretty. Decent for a luxury wedding.', 'visible'],
                [2, 'Not worth the premium', 'Expected to be blown away but it was just an okay bouquet with a pearl wrap. Not worth the luxury price tag.', 'visible'],
                [1, 'Huge letdown', 'For the most expensive bouquet, I expected perfection. Instead, some roses had brown edges. Very disappointing for our wedding day.', 'hidden'],
            ],

            // Birthday products
            'sunset-confetti-bloom' => [
                [5, 'Birthday energy in a bouquet!', 'The orange roses and yellow tulips combination is so cheerful. My sister loved it for her birthday! The colors literally look like a sunset celebration.', 'visible'],
                [5, null, 'This bouquet screams birthday! The bright orange and yellow colors are so fun and energetic. Perfect for making someone smile on their special day.', 'visible'],
                [5, 'Party in flowers!', 'The sunset confetti bloom is like a birthday party in a bouquet. The vibrant colors are so festive and the flowers were incredibly fresh. A must for birthdays!', 'visible'],
                [4, 'Fun and vibrant', 'Love the colorful mix. The orange and yellow combination is perfect for birthday celebrations. Just wish the tulips lasted a bit longer.', 'visible'],
                [4, null, 'Really cheerful bouquet that brought immediate joy. The confetti-like mix of colors is creative and fun. Great birthday gift.', 'visible'],
                [4, 'Reliable birthday gift', 'My go-to for birthday flowers. The sunset colors are always a hit and the quality is consistent. Never disappoints!', 'visible'],
                [3, 'Nice colors but small', 'The color combination is great for birthdays but the bouquet felt small. Expected more flowers for the price. Still, the recipient liked it.', 'visible'],
                [3, null, 'Pretty birthday bouquet but some tulips were already drooping. The orange roses were beautiful though. Average experience.', 'visible'],
                [2, 'Wilting tulips', 'The tulips did not survive the delivery well. The roses were fine but the overall look was deflated. Not great for a birthday surprise.', 'visible'],
                [1, 'Sad birthday flowers', 'The bouquet arrived looking tired and wilted. Definitely not the birthday surprise I was going for. They did send a replacement eventually.', 'pending'],
            ],
            'velvet-wish-petals' => [
                [5, 'Make a wish!', 'The velvet petals are so soft and luxurious. This bouquet made my daughter\'s birthday feel so special. The deep colors are gorgeous!', 'visible'],
                [5, null, 'Sent this for my best friend\'s birthday and she was thrilled. The velvet texture of the petals is so unique and the arrangement is stunning.', 'visible'],
                [5, 'Birthday luxury!', 'If you want to make someone feel special on their birthday, this is the one. The velvet petals are unlike anything else. Premium quality!', 'visible'],
                [4, 'Unique and beautiful', 'The velvet petals are a nice touch that makes this bouquet stand out. Perfect for someone who appreciates unique gifts. Good birthday choice.', 'visible'],
                [4, null, 'Really pretty arrangement with the velvet petal theme. The colors are rich and the flowers were fresh. Great for birthday gifting.', 'visible'],
                [4, 'Solid birthday option', 'The velvet wish petals are a step above regular bouquets. The texture is interesting and the arrangement is well-composed.', 'visible'],
                [3, 'Nice but nothing special', 'The velvet effect was subtle. Nice bouquet for a birthday but not as dramatic as I expected. Still, the recipient was happy.', 'visible'],
                [3, null, 'Good quality flowers but the velvet theme did not come through strongly. Average birthday bouquet with a nice concept.', 'visible'],
                [2, 'Underwhelming', 'Could barely tell the petals were supposed to be velvet. Just an average bouquet with a fancy name. Not worth the extra cost.', 'visible'],
                [1, 'Misleading', 'The velvet effect was non-existent. Regular flowers with a premium price tag. Very disappointing birthday gift.', 'hidden'],
            ],
            'golden-spark-bouquet' => [
                [5, 'Sparkling birthday!', 'The golden accents really do sparkle! This bouquet made our friend\'s birthday celebration so much more festive. The yellow roses are radiant!', 'visible'],
                [5, null, 'Like giving someone a bouquet of sunshine and sparkles! The golden details catch the light beautifully. Perfect for milestone birthdays!', 'visible'],
                [5, 'Showstopper!', 'The golden spark bouquet was the talk of the birthday party. Everyone wanted to know where we got it. The sparkly accents are such a fun touch!', 'visible'],
                [4, 'Fun and sparkly', 'The golden accents are a great idea for birthday celebrations. The flowers were fresh and the sparkle effect is lovely. Nice presentation too.', 'visible'],
                [4, null, 'Really cheerful bouquet with fun golden details. The yellow roses are beautiful and the sparkles add a festive touch. Great birthday choice.', 'visible'],
                [4, 'Good birthday option', 'The golden spark is perfect for birthday celebrations. The sparkle effect is subtle but noticeable. Quality flowers and fun presentation.', 'visible'],
                [3, 'Sparkles fall off', 'The bouquet is pretty but the golden sparkles shed everywhere. The flowers themselves are nice but the glitter mess was annoying.', 'visible'],
                [3, null, 'Decent birthday bouquet. The golden accents are a nice idea but not as impressive in person. Still, a fun concept.', 'visible'],
                [2, 'Messy glitter', 'The golden sparkles made a mess everywhere. The flowers were okay but cleaning up glitter was not fun. Would not order again.', 'visible'],
                [1, 'Tacky not classy', 'The golden accents looked cheap rather than sparkly. Not the elegant birthday gift I envisioned. Disappointing.', 'pending'],
            ],
            'lavender-frost-garden' => [
                [5, 'Cool and calming!', 'The lavender tones are so serene and the frost-like accents are magical. Perfect for a winter birthday! The arrangement is absolutely enchanting.', 'visible'],
                [5, null, 'The lavender frost garden is like a winter wonderland in a bouquet. The cool purple tones are so elegant and the frosted details are exquisite.', 'visible'],
                [5, 'Frosty perfection!', 'My wife loved this for her December birthday. The lavender and frost combination is so unique and beautiful. A truly special arrangement!', 'visible'],
                [4, 'Unique and elegant', 'The lavender frost theme is creative and well-done. The cool tones are refreshing and the frosted accents add a magical touch. Great for winter birthdays.', 'visible'],
                [4, null, 'Beautiful arrangement with a unique frost theme. The lavender flowers are lovely and the icy accents are a nice touch. Perfect for December birthdays.', 'visible'],
                [4, 'Winter birthday favorite', 'This is the perfect bouquet for anyone with a winter birthday. The cool lavender tones and frost details create such a magical atmosphere.', 'visible'],
                [3, 'Nice but frost melts', 'The arrangement is pretty but the frost effect does not last long in Kuwait\'s heat. The lavender flowers themselves are beautiful though.', 'visible'],
                [3, null, 'Good concept but the frost details were already melting when delivered. The lavender flowers are nice. Decent overall.', 'visible'],
                [2, 'Frost effect failed', 'The frost completely melted by the time it was delivered. Just looked like a regular lavender bouquet. Not what I paid for.', 'visible'],
                [1, 'No frost at all', 'There was zero frost effect when it arrived. Just a plain lavender bouquet. Very disappointing for a premium-priced product.', 'hidden'],
            ],
            'cherry-glow-ensemble' => [
                [5, 'Glowing with joy!', 'The cherry pink tones are so warm and inviting. This ensemble made our birthday celebration feel so special. The glow effect is stunning!', 'visible'],
                [5, null, 'The cherry glow is the perfect birthday arrangement. The pink tones are so cheerful and the arrangement has a warm, radiant quality. Love it!', 'visible'],
                [5, 'Birthday bliss!', 'Sent this for my mother\'s birthday and she was overjoyed. The cherry pink flowers are gorgeous and the arrangement has such a warm glow.', 'visible'],
                [4, 'Warm and pretty', 'The cherry pink tones are beautiful and warm. The glow effect is subtle but nice. A lovely birthday arrangement.', 'visible'],
                [4, null, 'Really pretty ensemble with gorgeous cherry tones. Perfect for birthday celebrations. The flowers were fresh and the arrangement was well-composed.', 'visible'],
                [4, 'Great birthday choice', 'You cannot go wrong with the cherry glow for a birthday. The pink tones are universally flattering and the arrangement is always a hit.', 'visible'],
                [3, 'Pretty but pale', 'The cherry color was more pale pink than expected. Still pretty but not as vibrant as the photos. Good quality flowers though.', 'visible'],
                [3, null, 'Nice arrangement but the glow effect was barely noticeable. The cherry pink flowers are pretty. Average experience.', 'visible'],
                [2, 'No glow', 'The glow effect was completely absent. Just a regular pink arrangement. Expected more for the price.', 'visible'],
                [1, 'False advertising', 'The photos show a warm glowing effect that simply does not exist in the real product. Very misleading. Just regular pink flowers.', 'pending'],
            ],

            // Anniversary products
            'eternal-flame-roses' => [
                [5, 'Spoke louder than words!', 'The deep red roses with silver accents were the perfect anniversary gift. My wife was speechless. These roses truly embody eternal love!', 'visible'],
                [5, null, 'Sent these for our 10th anniversary and they were absolutely perfect. The deep red is so romantic and the silver accents add a touch of forever.', 'visible'],
                [5, 'Eternal love!', 'The eternal flame roses are the ultimate anniversary gift. The deep red blooms are passionate and the arrangement is breathtaking. Worth every fils!', 'visible'],
                [4, 'Romantic choice', 'Beautiful deep red roses perfect for anniversaries. The silver accents are elegant. Only giving 4 stars because I wished for a few more roses in the bunch.', 'visible'],
                [4, null, 'Really romantic arrangement that made our anniversary special. The deep red roses are stunning and the presentation is top-notch.', 'visible'],
                [4, 'Anniversary essential', 'The eternal flame is our go-to anniversary gift. The quality is consistent and the deep red roses always make an impression.', 'visible'],
                [3, 'Nice but fewer roses', 'The roses were beautiful but there were fewer than expected. The silver accents are pretty. Good but not great for an anniversary splurge.', 'visible'],
                [3, null, 'Decent anniversary bouquet. The deep red is romantic but the arrangement could have been fuller. The recipient was still happy though.', 'visible'],
                [2, 'Not impressive', 'For an anniversary arrangement, I expected more wow factor. The roses were okay but the overall presentation was underwhelming.', 'visible'],
                [1, 'Anniversary disappointment', 'Some roses were already wilting. Not the romantic surprise I planned for our anniversary. They did replace it but the moment was ruined.', 'hidden'],
            ],
            'champagne-love-garden' => [
                [5, 'Effervescent love!', 'The champagne-toned roses are so elegant and romantic. This garden-style arrangement made our anniversary feel like a celebration. Simply beautiful!', 'visible'],
                [5, null, 'The champagne love garden is sophistication in a bouquet. The warm golden tones are so romantic and the garden-style arrangement is lush and gorgeous.', 'visible'],
                [5, 'Toast to love!', 'Like raising a glass of champagne to our love! The golden roses are exquisite and the arrangement is overflowing with romance. Perfect anniversary gift!', 'visible'],
                [4, 'Elegant arrangement', 'The champagne roses are stunning and the garden style is lovely. Only giving 4 stars because the arrangement was slightly different from the photo. Still gorgeous.', 'visible'],
                [4, null, 'Really beautiful anniversary bouquet. The champagne tones are warm and sophisticated. The garden-style arrangement feels lush and abundant.', 'visible'],
                [4, 'Sophisticated choice', 'The champagne love garden is perfect for couples who appreciate understated elegance. The golden roses are so classy.', 'visible'],
                [3, 'Nice but expected more', 'The arrangement was pretty but I expected more roses for the price. The champagne color is lovely though. Good for an anniversary.', 'visible'],
                [3, null, 'Decent arrangement but some filler flowers dominated. The champagne roses were nice. Average experience for the price.', 'visible'],
                [2, 'Sparse arrangement', 'Expected more roses for 34 KWD. The arrangement looked sparse compared to the product photo. Disappointing for our anniversary.', 'visible'],
                [1, 'Not worth it', 'Very few champagne roses for the price. Mostly filler flowers. Not the anniversary surprise I was hoping for. Overpriced.', 'hidden'],
            ],
            'velvet-promise-bouquet' => [
                [5, 'A promise of forever!', 'The velvet-textured roses are so romantic and luxurious. This bouquet perfectly captured the promise of our anniversary. Absolutely breathtaking!', 'visible'],
                [5, null, 'The velvet promise bouquet is the most romantic arrangement I have ever received. The soft petals and deep colors are pure luxury. My husband chose well!', 'visible'],
                [5, 'Pure romance!', 'The velvet texture of the roses adds such a unique and intimate feel. Perfect for expressing your everlasting promise. Our anniversary was magical thanks to this!', 'visible'],
                [4, 'Unique and romantic', 'The velvet roses are a wonderful touch for an anniversary. The texture is so soft and the deep color is romantic. Great choice for celebrating love.', 'visible'],
                [4, null, 'Really romantic bouquet with the velvet theme. The soft petals are gorgeous and the arrangement is well-composed. Perfect for an anniversary celebration.', 'visible'],
                [4, 'Lovely concept', 'The velvet promise is a thoughtful anniversary gift. The texture of the roses makes it feel extra special and intimate.', 'visible'],
                [3, 'Nice but subtle', 'The velvet effect is subtle. Nice bouquet for an anniversary but not as dramatic as I hoped. The roses were fresh and the colors were deep.', 'visible'],
                [3, null, 'Good anniversary bouquet. The velvet texture is interesting but hard to notice. Still a romantic choice.', 'visible'],
                [2, 'Barely velvet', 'Could not really tell the petals were velvet. Just seemed like regular roses. Nice color but not what was advertised.', 'visible'],
                [1, 'No velvet effect', 'Regular roses marketed as velvet. The texture was no different from any other rose. Misleading and overpriced.', 'pending'],
            ],
            'moonstone-romance-bloom' => [
                [5, 'Moonlit magic!', 'The moonstone-like quality of the white flowers is so ethereal and romantic. This arrangement made our anniversary dinner feel like a fairy tale!', 'visible'],
                [5, null, 'The moonstone romance bloom is pure magic. The iridescent white petals catch the light beautifully and the arrangement is dreamy and romantic.', 'visible'],
                [5, 'Enchanted evening!', 'Like having moonlight in a vase! The white blooms have an almost magical quality. Our anniversary celebration was so special with this arrangement.', 'visible'],
                [4, 'Dreamy arrangement', 'The moonstone effect is beautiful in soft lighting. The white flowers are pristine and the arrangement is very romantic. Perfect for an intimate anniversary.', 'visible'],
                [4, null, 'Really unique arrangement with a romantic, moonlit quality. The white flowers are elegant and the subtle shimmer is lovely.', 'visible'],
                [4, 'Romantic choice', 'The moonstone theme is perfect for an anniversary. The white blooms are classic and the iridescent quality adds a unique romantic touch.', 'visible'],
                [3, 'Pretty but not moonstone', 'Nice white arrangement but the moonstone effect was not very noticeable. The flowers were beautiful though. Good for an anniversary.', 'visible'],
                [3, null, 'Decent arrangement. The white flowers are pretty but the moonstone shimmer is hard to see. Still a nice anniversary gift.', 'visible'],
                [2, 'No shimmer', 'The moonstone shimmer effect was completely invisible. Just white flowers. Disappointing for a premium product.', 'visible'],
                [1, 'Plain white flowers', 'Nothing moonstone or romantic about it. Just a basic white arrangement with a fancy name. Not worth the premium.', 'hidden'],
            ],
            'sapphire-heart-ensemble' => [
                [5, 'Heart of sapphire!', 'The deep blue-purple tones are so rich and romantic. This ensemble made our anniversary feel truly special. The sapphire colors are mesmerizing!', 'visible'],
                [5, null, 'The sapphire heart is the most unique anniversary arrangement I have seen. The deep blue tones are captivating and the heart-shaped design is so thoughtful.', 'visible'],
                [5, 'Jewel-toned perfection!', 'Like receiving a bouquet of precious sapphires! The deep blue-purple flowers are stunning and the arrangement is luxurious. Best anniversary gift ever!', 'visible'],
                [4, 'Unique and romantic', 'The blue tones are so unusual and romantic. The heart-shaped arrangement is a lovely touch for an anniversary. Very creative concept.', 'visible'],
                [4, null, 'Gorgeous deep blue arrangement that really stands out. The sapphire tones are beautiful and the heart concept is sweet. Perfect for an anniversary.', 'visible'],
                [4, 'Impressive', 'The sapphire heart is a showstopper. The deep blue flowers are so unique and the arrangement is beautifully crafted. Great anniversary surprise!', 'visible'],
                [3, 'Blue is interesting', 'The blue flowers are unique but the color was less saturated than the photos. Still a nice anniversary arrangement with a creative concept.', 'visible'],
                [3, null, 'Interesting concept with the blue tones. Not as vibrant in person. The heart shape is a nice touch for an anniversary.', 'visible'],
                [2, 'Faded sapphire', 'The blue color was much more purple and faded than expected. Not the rich sapphire I was hoping for. Decent arrangement but not as pictured.', 'visible'],
                [1, 'Not sapphire at all', 'The flowers were more lavender than sapphire blue. The heart shape was barely noticeable. Very disappointing for our anniversary.', 'pending'],
            ],

            // Graduation products
            'golden-triumph-bouquet' => [
                [5, 'Graduation glory!', 'The golden tones are perfect for celebrating achievement! This bouquet made my daughter\'s graduation feel even more special. The triumph theme is spot on!', 'visible'],
                [5, null, 'Like holding a trophy of flowers! The golden blooms are so proud and celebratory. The perfect way to say congratulations on graduation day!', 'visible'],
                [5, 'Winner!', 'The golden triumph bouquet is THE graduation gift. The gold tones symbolize achievement perfectly and the arrangement is stunning. My son was thrilled!', 'visible'],
                [4, 'Celebratory', 'Great bouquet for graduation celebrations. The golden colors are festive and the arrangement is well put together. Perfect way to celebrate success.', 'visible'],
                [4, null, 'Really nice graduation bouquet. The golden tones are cheerful and the arrangement looks premium. A great way to honor academic achievement.', 'visible'],
                [4, 'Solid graduation gift', 'The golden triumph is our go-to for graduation gifts. The quality is reliable and the celebratory theme is always appreciated.', 'visible'],
                [3, 'Nice but small', 'The bouquet was pretty but felt small for a graduation gift. The golden colors are nice. Could use more volume for the price.', 'visible'],
                [3, null, 'Decent graduation bouquet. The gold theme is appropriate. Not as impressive as I hoped but the recipient liked it.', 'visible'],
                [2, 'Underwhelming', 'Expected more flowers for a celebration arrangement. The golden theme is nice but the bouquet was too sparse for a major milestone.', 'visible'],
                [1, 'Not celebratory enough', 'Looked like a regular yellow bouquet, not a triumph celebration. Very basic for the price. Expected much more for a graduation.', 'pending'],
            ],
            'scholars-bloom-basket' => [
                [5, 'Scholarly elegance!', 'The basket arrangement is so refined and thoughtful. Perfect for a graduation gift. The flowers are beautiful and the basket adds a scholarly touch.', 'visible'],
                [5, null, 'Sent this for my son\'s medical school graduation and it was perfect. The scholarly theme is well-executed and the basket is beautifully crafted.', 'visible'],
                [5, 'Academic excellence!', 'The scholars bloom basket is the most thoughtful graduation gift. The arrangement is elegant and the basket presentation is classy. Top marks!', 'visible'],
                [4, 'Great graduation gift', 'Beautiful basket arrangement perfect for academic achievements. The flowers are fresh and the basket is well-made. Great presentation.', 'visible'],
                [4, null, 'Really nice graduation basket. The flowers are elegant and the scholarly theme comes through. A step above typical graduation flowers.', 'visible'],
                [4, 'Thoughtful choice', 'The scholars bloom is a more thoughtful alternative to typical graduation gifts. The basket is practical and the flowers are beautiful.', 'visible'],
                [3, 'Nice basket', 'The basket is nice but the arrangement could be fuller. Good graduation gift but not as impressive as the photos suggest.', 'visible'],
                [3, null, 'Decent graduation basket. The scholarly theme is subtle. The flowers are pretty but the overall impact could be stronger.', 'visible'],
                [2, 'Small basket', 'The basket was much smaller than expected. Not enough flowers for the price. Looked a bit sad for a graduation celebration.', 'visible'],
                [1, 'Poor presentation', 'The basket looked cheap and the flowers were sparse. Not worthy of a graduation celebration. Very disappointing.', 'hidden'],
            ],
            'victory-petal-ensemble' => [
                [5, 'Victory lap!', 'The vibrant colors perfectly capture the excitement of graduation. This ensemble made our celebration feel like a true victory! Amazing quality!', 'visible'],
                [5, null, 'Like a celebration in flowers! The victory petals are bright, bold, and beautiful. The perfect arrangement for honoring hard-earned success!', 'visible'],
                [5, 'Champion!', 'The victory petal ensemble is as triumphant as the name suggests! The bold colors and lush arrangement are perfect for celebrating a major achievement.', 'visible'],
                [4, 'Festive arrangement', 'The victory theme comes through with bold, celebratory colors. Perfect for graduation parties. The flowers are fresh and vibrant.', 'visible'],
                [4, null, 'Really festive arrangement for graduation. The bold colors are eye-catching and the ensemble is well-composed. Great for photos too!', 'visible'],
                [4, 'Celebration worthy', 'The victory petal is perfect for marking academic achievements. The colors are bold and the arrangement is lush. A great celebration piece.', 'visible'],
                [3, 'Colorful but small', 'The colors are vibrant but the ensemble was smaller than expected. Still a nice graduation gift. Good quality flowers.', 'visible'],
                [3, null, 'Decent arrangement for a graduation. The victory theme is there but not as impactful as I hoped. Still a nice gift.', 'visible'],
                [2, 'Underwhelming', 'Not as bold or vibrant as the photos. The arrangement felt small for a victory celebration. Could use more flowers.', 'visible'],
                [1, 'Not victory-worthy', 'A sad arrangement for a proud moment. Looked nothing like the vibrant celebration shown online. Very disappointing.', 'pending'],
            ],
            'future-horizon-garden' => [
                [5, 'Bright future!', 'The arrangement symbolizes hope and new beginnings perfectly. The best graduation gift for someone starting their next chapter. Beautiful and meaningful!', 'visible'],
                [5, null, 'The future horizon garden is such a meaningful graduation gift. The arrangement symbolizes looking forward to bright possibilities. Truly special!', 'visible'],
                [5, 'New beginnings!', 'This garden-style arrangement perfectly captures the excitement of graduation and new beginnings. The flowers are gorgeous and the meaning behind it is beautiful.', 'visible'],
                [4, 'Meaningful gift', 'The horizon theme is perfect for a graduate. The arrangement is beautiful and the symbolic meaning adds a special touch. Great presentation.', 'visible'],
                [4, null, 'Really thoughtful arrangement for graduation. The garden style is lush and the future-forward theme is inspiring. A meaningful gift.', 'visible'],
                [4, 'Inspiring choice', 'The future horizon is a more thoughtful graduation gift than typical bouquets. The arrangement is beautiful and the symbolism is meaningful.', 'visible'],
                [3, 'Nice but vague theme', 'The arrangement is pretty but the horizon theme is hard to see. Nice flowers though. Good for graduation.', 'visible'],
                [3, null, 'Decent graduation arrangement. The future theme is subtle. The flowers are pretty and fresh. Average experience.', 'visible'],
                [2, 'Generic arrangement', 'Could not see the horizon theme at all. Just a generic garden arrangement. Nice flowers but not what was described.', 'visible'],
                [1, 'No theme present', 'Just regular flowers with no horizon or future theme visible. Felt like any basic bouquet. Not worth the premium for the theme.', 'hidden'],
            ],
            'prestige-laurel-bloom' => [
                [5, 'Laurel of honor!', 'The laurel concept is brilliant for graduation. Like receiving a crown of flowers for academic achievement! The most prestigious graduation arrangement!', 'visible'],
                [5, null, 'The prestige laurel bloom makes any graduate feel like a champion. The arrangement is lush, elegant, and perfectly themed for academic success!', 'visible'],
                [5, 'Honor and glory!', 'The laurel wreath-inspired design is so creative and meaningful. My daughter felt truly honored receiving this for her graduation. Outstanding quality!', 'visible'],
                [4, 'Prestigious arrangement', 'The laurel theme is perfect for graduation. The arrangement is elegant and well-crafted. A prestigious gift for a prestigious achievement.', 'visible'],
                [4, null, 'Really impressive arrangement with the laurel theme. The flowers are top quality and the presentation is sophisticated. Great for honoring top students.', 'visible'],
                [4, 'Honor roll worthy', 'The prestige laurel is the perfect gift for a top graduate. The laurel theme adds meaning and the arrangement is beautiful.', 'visible'],
                [3, 'Nice but not laurel-like', 'The arrangement is pretty but the laurel shape was not very distinct. Still a nice graduation gift with quality flowers.', 'visible'],
                [3, null, 'Good graduation flowers but the laurel concept is hard to see. Just looks like a nice round arrangement. Decent quality.', 'visible'],
                [2, 'No laurel shape', 'Expected a laurel wreath-inspired design but it was just a regular bouquet. The theme was completely absent. Overpriced for what you get.', 'visible'],
                [1, 'Misleading product', 'There was nothing laurel or wreath-like about this arrangement. Just a basic bouquet with a fancy name. Very disappointing for graduation.', 'pending'],
            ],

            // Mother's Day products
            'velvet-embrace-bouquet' => [
                [5, 'Mothers embrace!', 'The soft velvet petals feel just like a mother\'s hug. This bouquet made my mom cry happy tears on Mother\'s Day. The most meaningful gift!', 'visible'],
                [5, null, 'The velvet embrace is the most touching Mother\'s Day gift. The soft petals symbolize a mother\'s gentle touch. My mother was deeply moved.', 'visible'],
                [5, 'Heartfelt gift!', 'Nothing says I love you Mom like the velvet embrace bouquet. The soft texture is so fitting for Mother\'s Day. Absolutely beautiful and meaningful!', 'visible'],
                [4, 'Touching arrangement', 'The velvet petals are a wonderful metaphor for a mother\'s love. The bouquet is beautiful and the sentiment is perfect for Mother\'s Day.', 'visible'],
                [4, null, 'Really beautiful Mother\'s Day bouquet. The velvet texture adds a special touch that makes it feel more intimate and thoughtful.', 'visible'],
                [4, 'Mom loved it', 'The velvet embrace was a hit with my mother. The soft petals and warm colors are perfect for expressing gratitude and love.', 'visible'],
                [3, 'Nice but velvet subtle', 'Pretty bouquet for Mother\'s Day but the velvet effect was hard to notice. The flowers were fresh and the colors were warm though.', 'visible'],
                [3, null, 'Good Mother\'s Day flowers. The velvet theme is there but subtle. Still a nice way to show appreciation.', 'visible'],
                [2, 'Regular flowers', 'Could not feel any velvet texture. Just a regular soft-petaled bouquet. Nice but not what was advertised.', 'visible'],
                [1, 'No velvet feel', 'Regular flowers marketed as velvet. My mom liked them but I felt misled by the description. Not worth the premium.', 'hidden'],
            ],
            'pearl-garden-grace' => [
                [5, 'Graceful as a mother!', 'The pearl-like white blooms are so elegant and graceful. This garden arrangement made my mother feel truly cherished on her special day!', 'visible'],
                [5, null, 'The pearl garden grace is sophistication and love in a bouquet. The white flowers are pristine and the garden style is lush. Perfect for Mother\'s Day!', 'visible'],
                [5, 'Elegant tribute!', 'Like giving my mother a garden of pearls! The white blooms are so elegant and the arrangement is overflowing with grace. She was absolutely delighted!', 'visible'],
                [4, 'Sophisticated', 'The pearl theme is perfect for a sophisticated mother. The white flowers are beautiful and the arrangement is well-composed. Great Mother\'s Day choice.', 'visible'],
                [4, null, 'Really elegant Mother\'s Day bouquet. The white flowers symbolize purity and the garden style is abundant. My mother loved it.', 'visible'],
                [4, 'Classic choice', 'The pearl garden grace is a classic Mother\'s Day gift. The white blooms are timeless and the arrangement is sophisticated.', 'visible'],
                [3, 'Pretty but not pearl-like', 'Nice white flowers but the pearl effect was not really visible. Still a pretty Mother\'s Day arrangement.', 'visible'],
                [3, null, 'Good Mother\'s Day flowers. The white arrangement is pretty. Not as pearl-like as expected but still nice.', 'visible'],
                [2, 'Basic white bouquet', 'Nothing pearl-like about it. Just a white bouquet. Pretty but not the premium product described. Overpriced.', 'visible'],
                [1, 'Plain and overpriced', 'A basic white arrangement with a fancy name. My mom liked the flowers but I felt the pearl theme was completely absent.', 'pending'],
            ],
            'blush-harmony-bloom' => [
                [5, 'Blushing beauty!', 'The soft pink tones are so warm and loving. Perfect for Mother\'s Day! The blush colors harmonize beautifully and the arrangement is gorgeous.', 'visible'],
                [5, null, 'The blush harmony bloom is the most beautiful Mother\'s Day arrangement. The soft pink tones are so feminine and the arrangement is perfectly balanced.', 'visible'],
                [5, 'Mom adored it!', 'My mother was in love with the soft blush tones. The harmony of colors is so pleasing and the arrangement is stunning. Best Mother\'s Day gift!', 'visible'],
                [4, 'Soft and lovely', 'The blush pink tones are so soft and feminine. Perfect for Mother\'s Day. The arrangement is well-balanced and the flowers are fresh.', 'visible'],
                [4, null, 'Really pretty Mother\'s Day bouquet. The blush colors are warm and the harmony of tones is pleasing. Great way to show love and appreciation.', 'visible'],
                [4, 'Sweet arrangement', 'The blush harmony is a sweet and thoughtful Mother\'s Day gift. The soft pinks are universally flattering and the quality is good.', 'visible'],
                [3, 'Nice but pale', 'The blush color was paler than expected. Still a pretty Mother\'s Day arrangement. The flowers were fresh and the composition was nice.', 'visible'],
                [3, null, 'Decent Mother\'s Day flowers. The blush theme is there but could be more vibrant. Still a nice gift.', 'visible'],
                [2, 'Too pale', 'The colors were so pale they looked washed out. Expected warmer blush tones. Not as impressive as the photos.', 'visible'],
                [1, 'Faded colors', 'The blush looked more like faded pink. Not the warm, harmonious arrangement I ordered. Disappointing for Mother\'s Day.', 'hidden'],
            ],
            'golden-motherlight-basket' => [
                [5, 'Golden mother!', 'The golden basket is such a warm and fitting tribute to motherhood. The flowers are radiant and the basket is beautifully crafted. Best Mother\'s Day gift ever!', 'visible'],
                [5, null, 'The golden motherlight basket made my mother feel like the queen she is! The golden tones are warm and the basket presentation is so thoughtful.', 'visible'],
                [5, 'Radiant love!', 'Like capturing a mother\'s warm glow in a basket! The golden flowers are so cheerful and the arrangement is generous. My mom was overjoyed!', 'visible'],
                [4, 'Warm and beautiful', 'The golden tones are so warm and perfect for Mother\'s Day. The basket is well-made and the flowers are fresh. A lovely tribute to mom.', 'visible'],
                [4, null, 'Really nice Mother\'s Day basket. The golden flowers are cheerful and the basket adds a special touch. Great presentation.', 'visible'],
                [4, 'Thoughtful gift', 'The golden motherlight basket is a more thoughtful Mother\'s Day gift than typical bouquets. The basket is practical and the flowers are beautiful.', 'visible'],
                [3, 'Nice basket but small', 'The basket is nice but could be larger. The golden flowers are pretty. Good Mother\'s Day gift but not as impressive as expected.', 'visible'],
                [3, null, 'Decent Mother\'s Day basket. The golden theme is warm. Not as large as the photos suggest. Still a nice gift.', 'visible'],
                [2, 'Small basket', 'The basket was surprisingly small. Not enough flowers for a Mother\'s Day centerpiece. Expected more for the price.', 'visible'],
                [1, 'Tiny and disappointing', 'Way too small for the price. The golden flowers were nice but few. Not the impressive Mother\'s Day gift I had in mind.', 'pending'],
            ],
            'queens-affection-ensemble' => [
                [5, 'Queen for a day!', 'Made my mother feel like royalty on Mother\'s Day! The arrangement is luxurious and the queen theme is perfectly executed. She deserves nothing less!', 'visible'],
                [5, null, 'The queens affection ensemble is the ultimate Mother\'s Day gift. The arrangement is grand and the flowers are regal. My mom felt truly special!', 'visible'],
                [5, 'Royal treatment!', 'Every mother deserves to feel like a queen and this arrangement delivers! The flowers are exquisite and the presentation is royal. Best Mother\'s Day ever!', 'visible'],
                [4, 'Regal arrangement', 'The queen theme comes through beautifully. The flowers are premium quality and the arrangement is grand. A fitting tribute for a special mother.', 'visible'],
                [4, null, 'Really impressive Mother\'s Day arrangement. The regal theme is elegant and the flowers are top quality. Great for making mom feel special.', 'visible'],
                [4, 'Majestic choice', 'The queens affection is the perfect way to honor your mother. The arrangement is sophisticated and the quality is excellent.', 'visible'],
                [3, 'Nice but not queen-sized', 'The arrangement is pretty but not as grand as expected for a queen theme. Good quality flowers though. Still a nice Mother\'s Day gift.', 'visible'],
                [3, null, 'Decent Mother\'s Day flowers. The queen theme is there but could be more dramatic. Nice arrangement overall.', 'visible'],
                [2, 'Not queen-worthy', 'Expected a grand, regal arrangement but got a medium-sized bouquet. Not the royal experience I paid for.', 'visible'],
                [1, 'Peasant not queen', 'A small, basic arrangement with a fancy name. My mom liked the flowers but it was not the queen treatment I was promised.', 'hidden'],
            ],

            // Love & Romance products
            'crimson-desire-bouquet' => [
                [5, 'The black wrap is everything!', 'Such a bold and unique presentation! The black wrap with silver leaves made these red roses stand out. The most romantic bouquet I have ever received!', 'visible'],
                [5, null, 'The crimson desire is pure passion in a bouquet. The deep red roses with the dramatic black wrap are absolutely stunning. My partner was speechless!', 'visible'],
                [5, 'Desire incarnate!', 'The crimson roses are so passionate and the black wrap adds a seductive, mysterious quality. This bouquet is the ultimate expression of desire!', 'visible'],
                [4, 'Bold and beautiful', 'The black wrap is such a unique touch. The red roses are vibrant and the silver leaves add elegance. A bold romantic gesture.', 'visible'],
                [4, null, 'Really striking bouquet with the black wrap. The crimson roses are beautiful and the presentation is dramatic. Perfect for expressing passionate love.', 'visible'],
                [4, 'Dramatic choice', 'The crimson desire is not for the faint-hearted. The black wrap makes a bold statement. Great for a passionate, dramatic romantic gesture.', 'visible'],
                [3, 'Nice but wrap tears', 'The bouquet is pretty but the black wrap tore during delivery. The roses were fine. Still a nice romantic gift.', 'visible'],
                [3, null, 'Good romantic bouquet. The black wrap is interesting but not as refined as expected. The red roses are beautiful though.', 'visible'],
                [2, 'Wrap fell apart', 'The black wrap disintegrated during delivery. Just got red roses without the dramatic presentation. Defeats the purpose.', 'visible'],
                [1, 'Wrap ruined it', 'The black wrap was crumpled and torn. Looked terrible. The roses were okay but the whole point was the dramatic presentation. Very disappointing.', 'pending'],
            ],
            'midnight-serenade-bloom' => [
                [5, 'Midnight magic!', 'The deep purple tones are so mysterious and romantic. This bloom feels like a love song under the stars. The most romantic arrangement I have ever seen!', 'visible'],
                [5, null, 'The midnight serenade is like poetry in flowers. The deep purple blooms are so romantic and the arrangement has an enchanting quality. Pure magic!', 'visible'],
                [5, 'Enchanting!', 'Like a serenade under the midnight sky! The deep purple flowers are so romantic and the arrangement is breathtaking. My partner was completely enchanted!', 'visible'],
                [4, 'Romantic and deep', 'The purple tones are so deep and romantic. The arrangement has a mysterious quality that is perfect for a romantic evening. Beautiful flowers.', 'visible'],
                [4, null, 'Really romantic arrangement with gorgeous deep purple flowers. The midnight theme is well-executed. Perfect for a romantic dinner.', 'visible'],
                [4, 'Sensual choice', 'The midnight serenade is perfect for a romantic occasion. The deep colors are sensual and the arrangement is sophisticated.', 'visible'],
                [3, 'Nice purple bouquet', 'The purple flowers are pretty but the midnight theme was not as dramatic as expected. Still a nice romantic arrangement.', 'visible'],
                [3, null, 'Decent romantic bouquet. The purple is deep but not as mesmerizing as the photos suggest. Good quality flowers.', 'visible'],
                [2, 'Dull not deep', 'The purple was more dull than deep midnight. Expected rich, saturated color but got a washed-out version. Not very romantic.', 'visible'],
                [1, 'Not midnight at all', 'The color was more lavender than midnight purple. Not the dramatic, romantic arrangement I ordered. Very disappointing.', 'hidden'],
            ],
            'blushing-heart-garden' => [
                [5, 'Heart full of love!', 'The heart-shaped arrangement is so romantic and the blush tones are perfect. This garden of love made our anniversary absolutely special!', 'visible'],
                [5, null, 'The blushing heart garden is the most romantic arrangement ever. The heart shape is beautiful and the blush pink flowers are so tender and loving.', 'visible'],
                [5, 'Love in bloom!', 'The heart-shaped design with blushing pink flowers is pure romance. My partner was so touched by this thoughtful arrangement. Love in every petal!', 'visible'],
                [4, 'Sweet and romantic', 'The heart shape is a lovely touch and the blush pinks are so romantic. Great for Valentine\'s Day or an anniversary. Beautiful flowers.', 'visible'],
                [4, null, 'Really romantic arrangement with a sweet heart design. The blush tones are soft and loving. Perfect for expressing your feelings.', 'visible'],
                [4, 'Love gesture', 'The blushing heart is a beautiful way to say I love you. The heart shape is well-crafted and the pink flowers are gorgeous.', 'visible'],
                [3, 'Heart barely visible', 'The arrangement is pretty but the heart shape was not very clear. Nice pink flowers though. Still a romantic gesture.', 'visible'],
                [3, null, 'Decent romantic bouquet. The heart concept is there but hard to see. The blush colors are pretty. Good for a casual romantic gift.', 'visible'],
                [2, 'No heart shape', 'Could not see a heart shape at all. Just a round pink arrangement. Disappointing when you are paying for a heart design.', 'visible'],
                [1, 'Round not heart', 'Completely round arrangement with zero heart shape. False advertising. The flowers were okay but not what I ordered for our anniversary.', 'pending'],
            ],
            'eternal-kiss-ensemble' => [
                [5, 'Kiss of a lifetime!', 'The eternal kiss ensemble is pure romance. The arrangement is lush and the flowers seem to whisper eternal love. The most passionate bouquet!', 'visible'],
                [5, null, 'Like a kiss that lasts forever! The arrangement is so romantic and the flowers are breathtaking. Perfect for saying you will love them eternally.', 'visible'],
                [5, 'Forever love!', 'The eternal kiss is the most romantic arrangement I have ever gifted. The flowers are gorgeous and the sentiment is beautiful. True love in a bouquet!', 'visible'],
                [4, 'Romantic ensemble', 'Very romantic arrangement with beautiful flowers. The eternal kiss theme comes through nicely. Great for a special romantic occasion.', 'visible'],
                [4, null, 'Really beautiful romantic arrangement. The flowers are fresh and the presentation is elegant. Perfect for expressing eternal love.', 'visible'],
                [4, 'Passionate choice', 'The eternal kiss is perfect for when you want to make a grand romantic gesture. The arrangement is lush and the flowers are premium.', 'visible'],
                [3, 'Nice but not eternal', 'Pretty arrangement but I did not get the eternal love vibe from it. Nice flowers though. Good for a romantic occasion.', 'visible'],
                [3, null, 'Decent romantic bouquet. The flowers are pretty. The eternal theme is subtle. Still a nice gift for your partner.', 'visible'],
                [2, 'Generic romantic', 'Just a regular bouquet with a romantic name. Nothing about it says eternal or special. Overpriced for what you get.', 'visible'],
                [1, 'Nothing special', 'A basic arrangement that anyone could put together. Not the passionate, eternal love statement I was promised. Very disappointing.', 'hidden'],
            ],
            'rosewood-passion-fleur' => [
                [5, 'Passion personified!', 'The rosewood tones are so warm and passionate. This arrangement is like a love letter written in flowers. The most romantic gift I have ever given!', 'visible'],
                [5, null, 'The rosewood passion is pure fire and romance. The warm, deep tones are so passionate and the arrangement is stunning. My partner was overwhelmed with love!', 'visible'],
                [5, 'Burning passion!', 'The deep rosewood tones are the color of passion itself. This arrangement speaks louder than words ever could. The most passionate gift from Havana!', 'visible'],
                [4, 'Warm and passionate', 'The rosewood tones are so warm and romantic. The arrangement is beautiful and the passion theme comes through. Great for expressing deep love.', 'visible'],
                [4, null, 'Really romantic arrangement with gorgeous warm tones. The rosewood color is unique and passionate. Perfect for a romantic evening.', 'visible'],
                [4, 'Unique color', 'The rosewood tone is unusual and striking. Great for someone who appreciates unique romantic gestures. The flowers are beautiful.', 'visible'],
                [3, 'Nice warm tones', 'The rosewood color is interesting but not as deep as expected. Still a pretty romantic arrangement. Good quality flowers.', 'visible'],
                [3, null, 'Decent arrangement. The warm tones are nice for a romantic gift. Not as passionate as the name suggests but still pretty.', 'visible'],
                [2, 'Color off', 'The rosewood was more brown than passionate red. Not the romantic color I expected. The flowers were okay but the color was wrong.', 'visible'],
                [1, 'Brown not rosewood', 'The arrangement looked brown rather than rosewood. Not romantic at all. Very disappointing for a passion-themed product.', 'pending'],
            ],

            // Sympathy products
            'silent-ivory-grace' => [
                [5, 'Dignified tribute', 'The ivory arrangement was the most dignified and respectful tribute. The white flowers brought comfort during a difficult time. Thank you Havana for such grace.', 'visible'],
                [5, null, 'The silent ivory grace was the perfect arrangement for expressing condolences. The white flowers are so pure and peaceful. A beautiful way to show respect.', 'visible'],
                [5, 'Peaceful and respectful', 'The ivory arrangement brought peace and comfort to our grieving family. The flowers are so elegant and the arrangement is dignified. Thank you.', 'visible'],
                [4, 'Elegant sympathy flowers', 'The ivory arrangement is so tasteful and respectful. Perfect for expressing condolences. The white flowers are pristine and the arrangement is dignified.', 'visible'],
                [4, null, 'Really beautiful sympathy arrangement. The ivory tones are so peaceful and the flowers are fresh. A respectful way to show you care.', 'visible'],
                [4, 'Thoughtful choice', 'The silent ivory grace is the most appropriate sympathy arrangement. The white flowers are dignified and the arrangement is tasteful.', 'visible'],
                [3, 'Nice but small', 'The arrangement was pretty but smaller than expected for a sympathy piece. The ivory flowers were beautiful though. Decent quality.', 'visible'],
                [3, null, 'Good sympathy arrangement. The white flowers are appropriate. Could be a bit larger for the price. Still a nice gesture.', 'visible'],
                [2, 'Too small for the occasion', 'Sympathy arrangements should be generous. This felt too small and sparse. The flowers were nice but the arrangement lacked presence.', 'visible'],
                [1, 'Inadequate', 'Too small and sparse for a sympathy arrangement. Not appropriate for the gravity of the occasion. Expected more from Havana.', 'hidden'],
            ],
            'heavenly-calm-bouquet' => [
                [5, 'Heavenly peace', 'The arrangement brought such a sense of calm and peace to the memorial service. The soft colors are so comforting. Truly heavenly flowers.', 'visible'],
                [5, null, 'The heavenly calm bouquet was exactly what our family needed during a difficult time. The soft colors bring comfort and the arrangement is peaceful and beautiful.', 'visible'],
                [5, 'Comforting beauty', 'The most comforting arrangement for a time of loss. The soft colors are like a gentle embrace. Thank you Havana for creating something so meaningful.', 'visible'],
                [4, 'Comforting arrangement', 'The soft colors are so comforting during difficult times. The flowers are beautiful and the arrangement is peaceful. Perfect for expressing sympathy.', 'visible'],
                [4, null, 'Really comforting arrangement. The gentle colors bring peace and the flowers are fresh. A thoughtful way to show you care.', 'visible'],
                [4, 'Peaceful choice', 'The heavenly calm is the perfect sympathy bouquet. The soft colors are soothing and the arrangement is tasteful and dignified.', 'visible'],
                [3, 'Nice but could be softer', 'The arrangement was pretty but the colors could be softer for a sympathy piece. Still a nice gesture. The flowers were fresh.', 'visible'],
                [3, null, 'Decent sympathy bouquet. The colors are calm but could be more muted. Good quality flowers overall.', 'visible'],
                [2, 'Colors too bright', 'For a sympathy arrangement, the colors were too vibrant. Expected softer, more muted tones. Not appropriate for the occasion.', 'visible'],
                [1, 'Wrong for sympathy', 'The colors were too cheerful for a sympathy arrangement. Not the calming, peaceful bouquet I ordered. Inappropriate for the occasion.', 'pending'],
            ],
            'gentle-farewell-bloom' => [
                [5, 'Gentle goodbye', 'The most gentle and respectful farewell arrangement. The flowers are so soft and the arrangement brings comfort. A beautiful way to say goodbye.', 'visible'],
                [5, null, 'The gentle farewell bloom helped us honor our loved one with grace and beauty. The soft flowers are so appropriate and the arrangement is dignified.', 'visible'],
                [5, 'Rest in peace', 'The arrangement was so gentle and beautiful. It brought comfort to everyone at the service. A fitting tribute to a beautiful life.', 'visible'],
                [4, 'Respectful tribute', 'The arrangement is tasteful and respectful. The soft flowers are appropriate for a farewell. The presentation is dignified and the quality is good.', 'visible'],
                [4, null, 'Really appropriate farewell arrangement. The gentle colors are comforting and the flowers are fresh. A thoughtful way to pay respects.', 'visible'],
                [4, 'Dignified choice', 'The gentle farewell is a dignified and respectful sympathy arrangement. The soft tones are appropriate and the flowers are beautiful.', 'visible'],
                [3, 'Nice but could be larger', 'The arrangement is pretty but could be more substantial for a farewell piece. The flowers were nice and the sentiment was there.', 'visible'],
                [3, null, 'Decent farewell arrangement. The flowers are soft and appropriate. Could be fuller for the price. Still a respectful choice.', 'visible'],
                [2, 'Too small for farewell', 'Expected a more substantial arrangement for a farewell. The flowers were nice but the overall presence was lacking. Not fitting for the occasion.', 'visible'],
                [1, 'Inadequate tribute', 'Too small and sparse for a farewell arrangement. Did not feel like an appropriate tribute. Disappointing from Havana.', 'hidden'],
            ],
            'eternal-peace-garden' => [
                [5, 'Eternal rest', 'The garden-style arrangement brought such peace to the memorial. The lush greens and whites create a serene, eternal feeling. A beautiful tribute.', 'visible'],
                [5, null, 'The eternal peace garden is the most fitting arrangement for honoring a loved one. The garden style is lush and the peace it brings is immeasurable.', 'visible'],
                [5, 'Peaceful garden', 'Like a peaceful garden for eternal rest. The arrangement is so serene and beautiful. It brought comfort to our entire family during a difficult time.', 'visible'],
                [4, 'Serene tribute', 'The garden-style arrangement is so serene and peaceful. The greens and whites are perfect for a sympathy piece. Beautiful and dignified.', 'visible'],
                [4, null, 'Really peaceful arrangement. The garden style is lush and the white and green combination is calming. Perfect for a memorial service.', 'visible'],
                [4, 'Comforting garden', 'The eternal peace garden is a comforting tribute. The lush arrangement brings peace and the flowers are beautiful and appropriate.', 'visible'],
                [3, 'Nice garden style', 'The garden arrangement is pretty but could use more white flowers. The greens dominate. Still a nice sympathy piece.', 'visible'],
                [3, null, 'Decent garden-style arrangement. The peace theme comes through. Good quality but could be more balanced between green and white.', 'visible'],
                [2, 'Too much green', 'The arrangement was mostly green foliage with few flowers. Expected a better balance. Not as peaceful as it could be.', 'visible'],
                [1, 'All greenery', 'Barely any flowers, mostly just green plants. Not the eternal peace garden I envisioned. Very disappointing for a memorial.', 'pending'],
            ],
            'dove-serenity-ensemble' => [
                [5, 'Peace like a dove', 'The white dove-inspired arrangement is so pure and peaceful. It brought serenity to our memorial service. The most comforting arrangement possible.', 'visible'],
                [5, null, 'The dove serenity ensemble is the most peaceful and comforting arrangement. The pure white flowers symbolize peace and the arrangement is beautiful.', 'visible'],
                [5, 'Serenity now', 'Like a dove bringing peace, this arrangement brought comfort to our grieving hearts. The white flowers are so pure and the arrangement is absolutely serene.', 'visible'],
                [4, 'Peaceful arrangement', 'The dove theme is so appropriate for a sympathy arrangement. The white flowers are pure and the ensemble is peaceful and dignified.', 'visible'],
                [4, null, 'Really peaceful white arrangement. The serenity theme is well-executed and the flowers are beautiful. A comforting presence during difficult times.', 'visible'],
                [4, 'Comforting choice', 'The dove serenity is the perfect sympathy arrangement. The pure white flowers bring comfort and the arrangement is dignified and respectful.', 'visible'],
                [3, 'Nice white arrangement', 'The white flowers are pretty and appropriate for sympathy. The dove theme is subtle. Good quality arrangement overall.', 'visible'],
                [3, null, 'Decent sympathy arrangement. The white flowers are peaceful. Not as dove-inspired as expected but still appropriate for the occasion.', 'visible'],
                [2, 'Basic white', 'Just a basic white arrangement. Nothing dove-like or serene about it beyond the color. Overpriced for what you get.', 'visible'],
                [1, 'No dove design', 'Expected a dove-inspired arrangement but got a standard white bouquet. The theme was completely absent. Not the tribute I wanted to send.', 'hidden'],
            ],
        ];

        $count = 0;
        $skipped = 0;

        foreach ($categoryComments as $productSlug => $reviews) {
            $product = Product::where('slug', $productSlug)->first();

            if (! $product) {
                $skipped++;
                $this->command->warn("Skipped product: '{$productSlug}' not found.");
                continue;
            }

            foreach ($reviews as $i => $review) {
                $customerEmail = $customers[$i % count($customers)];

                $user = User::where('email', $customerEmail)->first();
                if (! $user) {
                    $skipped++;
                    continue;
                }

                // Skip if this user already reviewed this product
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
