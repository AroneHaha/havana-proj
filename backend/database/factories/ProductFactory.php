<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $nameEn = fake()->unique()->words(3, true);
        $price = fake()->randomFloat(3, 1, 50);
        $hasSale = fake()->boolean(30);
        $salePrice = $hasSale ? bcsub((string) $price, (string) fake()->randomFloat(3, 0.5, 10), 3) : null;

        return [
            'category_id' => \App\Models\Category::factory(),
            'name_en' => ucfirst($nameEn),
            'name_ar' => 'زهور ' . ucfirst($nameEn),
            'description_en' => fake()->paragraph(),
            'description_ar' => fake()->paragraph(),
            'slug' => Str::slug($nameEn),
            'price' => bcmul((string) $price, '1', 3),
            'sale_price' => $salePrice ? bcmul((string) $salePrice, '1', 3) : null,
            'image' => fake()->imageUrl(640, 480, 'flowers'),
            'images' => fake()->optional()->randomElements([
                fake()->imageUrl(640, 480, 'flowers'),
                fake()->imageUrl(640, 480, 'bouquet'),
            ], 2),
            'sku' => 'SKU-' . strtoupper(Str::random(8)),
            'stock' => fake()->numberBetween(0, 100),
            'rating' => fake()->randomFloat(1, 0, 5),
            'is_featured' => fake()->boolean(20),
            'is_best_seller' => fake()->boolean(15),
            'is_new' => fake()->boolean(25),
            'is_active' => true,
        ];
    }
}
