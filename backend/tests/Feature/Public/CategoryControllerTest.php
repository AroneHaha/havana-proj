<?php

namespace Tests\Feature\Public;

use App\Models\Category;
use App\Models\Product;
use Tests\TestCase;

class CategoryControllerTest extends TestCase
{
    public function test_can_list_active_categories(): void
    {
        Category::factory()->count(3)->create(['is_active' => true]);
        Category::factory()->create(['is_active' => false]);

        $response = $this->getJson('/api/categories');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    ['id', 'name_en', 'slug'],
                ],
            ]);

        $this->assertCount(3, $response->json('data'));
    }

    public function test_can_show_active_category_with_products(): void
    {
        $category = Category::factory()->create(['is_active' => true]);
        Product::factory()->count(2)->create(['category_id' => $category->id, 'is_active' => true]);

        $this->getJson("/api/categories/{$category->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $category->id)
            ->assertJsonPath('data.name_en', $category->name_en);
    }

    public function test_cannot_show_inactive_category(): void
    {
        $category = Category::factory()->create(['is_active' => false]);

        $this->getJson("/api/categories/{$category->id}")
            ->assertNotFound();
    }
}
