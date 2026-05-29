<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Review>
 */
class ReviewFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => \App\Models\Product::factory(),
            'user_id' => \App\Models\User::factory(),
            'rating' => fake()->numberBetween(1, 5),
            'title' => fake()->optional()->sentence(4),
            'comment' => fake()->paragraph(),
            'visibility' => fake()->randomElement(['visible', 'hidden', 'pending']),
        ];
    }
}
