<?php

namespace Tests\Feature\Public;

use App\Models\Category;
use App\Models\Product;
use Tests\TestCase;

class ProductControllerTest extends TestCase
{
    public function test_can_list_active_products(): void
    {
        $category = Category::factory()->create();
        Product::factory()->count(3)->create(['category_id' => $category->id, 'is_active' => true]);
        Product::factory()->create(['category_id' => $category->id, 'is_active' => false]);

        $response = $this->getJson('/api/products');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    ['id', 'name_en', 'price', 'slug'],
                ],
                'meta' => ['current_page', 'total', 'per_page'],
            ]);

        // Only active products should be returned
        $this->assertCount(3, $response->json('data'));
    }

    public function test_can_show_active_product(): void
    {
        $product = Product::factory()->create(['is_active' => true]);

        $this->getJson("/api/products/{$product->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $product->id)
            ->assertJsonPath('data.name_en', $product->name_en);
    }

    public function test_cannot_show_inactive_product(): void
    {
        $product = Product::factory()->create(['is_active' => false]);

        $this->getJson("/api/products/{$product->id}")
            ->assertNotFound();
    }

    public function test_can_filter_featured_products(): void
    {
        $category = Category::factory()->create();
        Product::factory()->create(['category_id' => $category->id, 'is_featured' => true, 'is_active' => true]);
        Product::factory()->create(['category_id' => $category->id, 'is_featured' => false, 'is_active' => true]);

        $response = $this->getJson('/api/products?filter[is_featured]=true');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_can_filter_by_category(): void
    {
        $cat1 = Category::factory()->create();
        $cat2 = Category::factory()->create();
        Product::factory()->create(['category_id' => $cat1->id, 'is_active' => true]);
        Product::factory()->create(['category_id' => $cat2->id, 'is_active' => true]);

        $response = $this->getJson("/api/products?filter[category]={$cat1->id}");

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_products_pagination_works(): void
    {
        $category = Category::factory()->create();
        Product::factory()->count(20)->create(['category_id' => $category->id, 'is_active' => true]);

        $response = $this->getJson('/api/products?per_page=5');

        $response->assertOk()
            ->assertJsonPath('meta.per_page', 5)
            ->assertJsonPath('meta.total', 20);
    }
}
