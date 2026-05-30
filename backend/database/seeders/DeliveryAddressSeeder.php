<?php

namespace Database\Seeders;

use App\Models\DeliveryAddress;
use App\Models\User;
use Illuminate\Database\Seeder;

class DeliveryAddressSeeder extends Seeder
{
    public function run(): void
    {
        $ahmed = User::where('email', 'ahmed@example.com')->first();
        $fatima = User::where('email', 'fatima@example.com')->first();
        $omar = User::where('email', 'omar@example.com')->first();

        if (! $ahmed)  $this->command->warn('User ahmed@example.com not found — skipping their addresses.');
        if (! $fatima) $this->command->warn('User fatima@example.com not found — skipping their addresses.');
        if (! $omar)   $this->command->warn('User omar@example.com not found — skipping their addresses.');

        $addresses = [
            ['user' => $ahmed, 'full_address' => 'Salmiya, Block 12, Street 5, Building 30, Floor 3, Apt 7', 'area' => 'Salmiya', 'block' => '12', 'street' => '5', 'building' => '30', 'floor' => '3', 'apartment' => '7', 'latitude' => '29.338', 'longitude' => '48.077', 'is_default' => true],
            ['user' => $ahmed, 'full_address' => 'Salmiya, Block 10, Street 2, Building 15, Floor 1', 'area' => 'Salmiya', 'block' => '10', 'street' => '2', 'building' => '15', 'floor' => '1', 'apartment' => null, 'latitude' => '29.335', 'longitude' => '48.074', 'is_default' => false],
            ['user' => $fatima, 'full_address' => 'Kuwait City, Block 4, Street 10, Building 15, Floor 1, Apt 2', 'area' => 'Kuwait City', 'block' => '4', 'street' => '10', 'building' => '15', 'floor' => '1', 'apartment' => '2', 'latitude' => '29.376', 'longitude' => '47.977', 'is_default' => true],
            ['user' => $omar, 'full_address' => 'Hawally, Block 7, Street 3, Building 22, Floor 5, Apt 12', 'area' => 'Hawally', 'block' => '7', 'street' => '3', 'building' => '22', 'floor' => '5', 'apartment' => '12', 'latitude' => '29.333', 'longitude' => '48.023', 'is_default' => true],
            ['user' => $omar, 'full_address' => 'Jabriya, Block 3, Street 8, Building 9, Floor 2, Apt 4', 'area' => 'Jabriya', 'block' => '3', 'street' => '8', 'building' => '9', 'floor' => '2', 'apartment' => '4', 'latitude' => '29.327', 'longitude' => '48.008', 'is_default' => false],
        ];

        $count = 0;
        foreach ($addresses as $address) {
            $user = $address['user'];
            unset($address['user']);

            if (! $user) {
                continue;
            }

            DeliveryAddress::create(array_merge(['user_id' => $user->id], $address));
            $count++;
        }

        $this->command->info("Created {$count} delivery addresses.");
    }
}