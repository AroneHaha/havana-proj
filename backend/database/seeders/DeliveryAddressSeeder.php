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
        $noor = User::where('email', 'noor@example.com')->first();
        $sara = User::where('email', 'sara@example.com')->first();
        $layla = User::where('email', 'layla@example.com')->first();
        $youssef = User::where('email', 'youssef@example.com')->first();
        $maryam = User::where('email', 'maryam@example.com')->first();
        $khalid = User::where('email', 'khalid@example.com')->first();
        $huda = User::where('email', 'huda@example.com')->first();

        $addresses = [
            // Ahmed
            ['user' => $ahmed, 'full_address' => 'Salmiya, Block 12, Street 5, Building 30, Floor 3, Apt 7', 'area' => 'Salmiya', 'block' => '12', 'street' => '5', 'building' => '30', 'floor' => '3', 'apartment' => '7', 'latitude' => '29.338', 'longitude' => '48.077', 'is_default' => true],
            ['user' => $ahmed, 'full_address' => 'Salmiya, Block 10, Street 2, Building 15, Floor 1', 'area' => 'Salmiya', 'block' => '10', 'street' => '2', 'building' => '15', 'floor' => '1', 'apartment' => null, 'latitude' => '29.335', 'longitude' => '48.074', 'is_default' => false],

            // Fatima
            ['user' => $fatima, 'full_address' => 'Kuwait City, Block 4, Street 10, Building 15, Floor 1, Apt 2', 'area' => 'Kuwait City', 'block' => '4', 'street' => '10', 'building' => '15', 'floor' => '1', 'apartment' => '2', 'latitude' => '29.376', 'longitude' => '47.977', 'is_default' => true],

            // Omar
            ['user' => $omar, 'full_address' => 'Hawally, Block 7, Street 3, Building 22, Floor 5, Apt 12', 'area' => 'Hawally', 'block' => '7', 'street' => '3', 'building' => '22', 'floor' => '5', 'apartment' => '12', 'latitude' => '29.333', 'longitude' => '48.023', 'is_default' => true],
            ['user' => $omar, 'full_address' => 'Jabriya, Block 3, Street 8, Building 9, Floor 2, Apt 4', 'area' => 'Jabriya', 'block' => '3', 'street' => '8', 'building' => '9', 'floor' => '2', 'apartment' => '4', 'latitude' => '29.327', 'longitude' => '48.008', 'is_default' => false],

            // Noor
            ['user' => $noor, 'full_address' => 'Mishref, Block 4, Street 6, Building 18, Floor 2, Apt 5', 'area' => 'Mishref', 'block' => '4', 'street' => '6', 'building' => '18', 'floor' => '2', 'apartment' => '5', 'latitude' => '29.324', 'longitude' => '48.055', 'is_default' => true],

            // Sara
            ['user' => $sara, 'full_address' => 'Bayan, Block 5, Street 12, Building 7, Floor 4, Apt 9', 'area' => 'Bayan', 'block' => '5', 'street' => '12', 'building' => '7', 'floor' => '4', 'apartment' => '9', 'latitude' => '29.313', 'longitude' => '47.968', 'is_default' => true],

            // Layla
            ['user' => $layla, 'full_address' => 'Sharq, Block 2, Street 7, Building 11, Floor 6, Apt 14', 'area' => 'Sharq', 'block' => '2', 'street' => '7', 'building' => '11', 'floor' => '6', 'apartment' => '14', 'latitude' => '29.368', 'longitude' => '47.968', 'is_default' => true],

            // Youssef
            ['user' => $youssef, 'full_address' => 'Kaifan, Block 3, Street 9, Building 20, Floor 1, Apt 3', 'area' => 'Kaifan', 'block' => '3', 'street' => '9', 'building' => '20', 'floor' => '1', 'apartment' => '3', 'latitude' => '29.345', 'longitude' => '47.988', 'is_default' => true],
            ['user' => $youssef, 'full_address' => 'Dasman, Block 1, Street 4, Building 8, Floor 3, Apt 6', 'area' => 'Dasman', 'block' => '1', 'street' => '4', 'building' => '8', 'floor' => '3', 'apartment' => '6', 'latitude' => '29.372', 'longitude' => '47.985', 'is_default' => false],

            // Maryam
            ['user' => $maryam, 'full_address' => 'Salmiya, Block 8, Street 14, Building 25, Floor 2, Apt 8', 'area' => 'Salmiya', 'block' => '8', 'street' => '14', 'building' => '25', 'floor' => '2', 'apartment' => '8', 'latitude' => '29.340', 'longitude' => '48.082', 'is_default' => true],

            // Khalid
            ['user' => $khalid, 'full_address' => 'Jabriya, Block 5, Street 11, Building 14, Floor 4, Apt 10', 'area' => 'Jabriya', 'block' => '5', 'street' => '11', 'building' => '14', 'floor' => '4', 'apartment' => '10', 'latitude' => '29.329', 'longitude' => '48.005', 'is_default' => true],

            // Huda
            ['user' => $huda, 'full_address' => 'Hawally, Block 9, Street 6, Building 33, Floor 7, Apt 15', 'area' => 'Hawally', 'block' => '9', 'street' => '6', 'building' => '33', 'floor' => '7', 'apartment' => '15', 'latitude' => '29.331', 'longitude' => '48.030', 'is_default' => true],
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