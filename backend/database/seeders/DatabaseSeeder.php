<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Order matters! Foreign keys require parent records first
        $this->call([
            UserSeeder::class,           // 1. Users first (everything references them)
            CategorySeeder::class,        // 2. Categories (products reference them)
            ProductSeeder::class,         // 3. Products (cart/reviews/orders reference them)
            DeliveryAddressSeeder::class, // 4. Delivery addresses (needs users)
            CartItemSeeder::class,        // 5. Cart items (needs users + products)
            ReviewSeeder::class,          // 6. Reviews (needs users + products)
            OrderSeeder::class,           // 7. Orders + items + status history (needs users + products)
            NotificationSeeder::class,    // 8. Notifications (needs users)
        ]);
    }
}
