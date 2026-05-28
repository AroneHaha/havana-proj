<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name_en' => 'Roses',
                'name_ar' => 'ورود',
                'slug' => 'roses',
                'image' => 'categories/roses.jpg',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name_en' => 'Bouquets',
                'name_ar' => 'باقات زهور',
                'slug' => 'bouquets',
                'image' => 'categories/bouquets.jpg',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name_en' => 'Occasions',
                'name_ar' => 'مناسبات',
                'slug' => 'occasions',
                'image' => 'categories/occasions.jpg',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name_en' => 'Plants',
                'name_ar' => 'نباتات',
                'slug' => 'plants',
                'image' => 'categories/plants.jpg',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'name_en' => 'Luxury',
                'name_ar' => 'فاخر',
                'slug' => 'luxury',
                'image' => 'categories/luxury.jpg',
                'is_active' => true,
                'sort_order' => 5,
            ],
            [
                'name_en' => 'Gifts',
                'name_ar' => 'هدايا',
                'slug' => 'gifts',
                'image' => 'categories/gifts.jpg',
                'is_active' => true,
                'sort_order' => 6,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
