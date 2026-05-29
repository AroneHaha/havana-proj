<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DeliveryAddress>
 */
class DeliveryAddressFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'full_address' => fake()->address(),
            'area' => fake()->optional()->city(),
            'block' => fake()->optional()->numberBetween(1, 50),
            'street' => fake()->optional()->streetName(),
            'building' => fake()->optional()->numberBetween(1, 100),
            'floor' => fake()->optional()->numberBetween(1, 20),
            'apartment' => fake()->optional()->numberBetween(1, 50),
            'latitude' => fake()->optional()->latitude(29.0, 29.5),
            'longitude' => fake()->optional()->longitude(47.5, 48.0),
            'is_default' => false,
        ];
    }
}
