<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'first_name' => 'Havana',
            'last_name' => 'Admin',
            'email' => 'admin@gmail.com',
            'password' => 'password',
            'phone' => '+965-0000-0001',
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $customers = [
            ['first_name' => 'Ahmed', 'last_name' => 'Al-Sabah', 'email' => 'ahmed@example.com', 'phone' => '+965-5000-1001'],
            ['first_name' => 'Fatima', 'last_name' => 'Hassan', 'email' => 'fatima@example.com', 'phone' => '+965-5000-1002'],
            ['first_name' => 'Omar', 'last_name' => 'Al-Ali', 'email' => 'omar@example.com', 'phone' => '+965-5000-1003'],
            ['first_name' => 'Noor', 'last_name' => 'Khalid', 'email' => 'noor@example.com', 'phone' => '+965-5000-1004'],
            ['first_name' => 'Sara', 'last_name' => 'Mohammed', 'email' => 'sara@example.com', 'phone' => '+965-5000-1005'],
            ['first_name' => 'Layla', 'last_name' => 'Al-Rashidi', 'email' => 'layla@example.com', 'phone' => '+965-5000-1006'],
            ['first_name' => 'Youssef', 'last_name' => 'Al-Harbi', 'email' => 'youssef@example.com', 'phone' => '+965-5000-1007'],
            ['first_name' => 'Maryam', 'last_name' => 'Al-Otaibi', 'email' => 'maryam@example.com', 'phone' => '+965-5000-1008'],
            ['first_name' => 'Khalid', 'last_name' => 'Al-Mutairi', 'email' => 'khalid@example.com', 'phone' => '+965-5000-1009'],
            ['first_name' => 'Huda', 'last_name' => 'Al-Shammari', 'email' => 'huda@example.com', 'phone' => '+965-5000-1010'],
        ];

        foreach ($customers as $customer) {
            User::create([
                'first_name' => $customer['first_name'],
                'last_name' => $customer['last_name'],
                'email' => $customer['email'],
                'password' => 'password',
                'phone' => $customer['phone'],
                'role' => 'customer',
                'email_verified_at' => now(),
            ]);
        }

        $this->command->info('Created 1 admin + 10 customers = 11 users.');
    }
}
