<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    public function definition(): array
    {
        $nameEn = fake()->unique()->words(2, true);

        return [
            'name_en' => ucfirst($nameEn),
            'name_ar' => 'فئة ' . ucfirst($nameEn),
            'slug' => Str::slug($nameEn),
            'image' => fake()->optional()->imageUrl(640, 480, 'flowers'),
            'is_active' => true,
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }
}
