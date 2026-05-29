<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::create([
            'first_name' => 'Havana',
            'last_name' => 'Admin',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password'),
            'phone' => '+965-0000-0001',
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Customer users
        $customers = [
            ['first_name' => 'Ahmed', 'last_name' => 'Al-Sabah', 'phone' => '+965-5000-1001'],
            ['first_name' => 'Fatima', 'last_name' => 'Hassan', 'phone' => '+965-5000-1002'],
            ['first_name' => 'Omar', 'last_name' => 'Al-Ali', 'phone' => '+965-5000-1003'],
            ['first_name' => 'Noor', 'last_name' => 'Khalid', 'phone' => '+965-5000-1004'],
            ['first_name' => 'Sara', 'last_name' => 'Mohammed', 'phone' => '+965-5000-1005'],
        ];

        foreach ($customers as $i => $customer) {
            User::create([
                'first_name' => $customer['first_name'],
                'last_name' => $customer['last_name'],
                'email' => 'user' . ($i + 1) . '@gmail.com',
                'password' => Hash::make('password'),
                'phone' => $customer['phone'],
                'role' => 'customer',
                'email_verified_at' => now(),
            ]);
        }
    }
}
