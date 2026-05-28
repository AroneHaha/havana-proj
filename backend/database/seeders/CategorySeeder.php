<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name_en' => 'Eid',
                'name_ar' => 'عيد',
                'slug' => 'eid',
                'image' => 'categories/eid.jpg',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name_en' => 'Weddings',
                'name_ar' => 'أعراس',
                'slug' => 'weddings',
                'image' => 'categories/weddings.jpg',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name_en' => 'Birthday',
                'name_ar' => 'عيد ميلاد',
                'slug' => 'birthday',
                'image' => 'categories/birthday.jpg',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name_en' => 'Anniversary',
                'name_ar' => 'ذكرى سنوية',
                'slug' => 'anniversary',
                'image' => 'categories/anniversary.jpg',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'name_en' => 'Graduation',
                'name_ar' => 'تخرج',
                'slug' => 'graduation',
                'image' => 'categories/graduation.jpg',
                'is_active' => true,
                'sort_order' => 5,
            ],
            [
                'name_en' => "Mother's Day",
                'name_ar' => 'عيد الأم',
                'slug' => 'mothers-day',
                'image' => 'categories/mothers-day.jpg',
                'is_active' => true,
                'sort_order' => 6,
            ],
            [
                'name_en' => 'Love & Romance',
                'name_ar' => 'حب ورومانسية',
                'slug' => 'love-romance',
                'image' => 'categories/love-romance.jpg',
                'is_active' => true,
                'sort_order' => 7,
            ],
            [
                'name_en' => 'Sympathy',
                'name_ar' => 'تعازي',
                'slug' => 'sympathy',
                'image' => 'categories/sympathy.jpg',
                'is_active' => true,
                'sort_order' => 8,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
