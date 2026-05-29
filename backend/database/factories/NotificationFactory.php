<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
    public function definition(): array
    {
        $type = fake()->randomElement(['order', 'promotion', 'system']);

        return [
            'user_id' => \App\Models\User::factory(),
            'type' => $type,
            'title_en' => fake()->sentence(4),
            'title_ar' => 'إشعار ' . fake()->sentence(4),
            'body_en' => fake()->paragraph(),
            'body_ar' => fake()->paragraph(),
            'data' => fake()->optional()->randomElements(['key' => 'value'], 1),
            'is_read' => fake()->boolean(30),
            'read_at' => null,
        ];
    }
}
