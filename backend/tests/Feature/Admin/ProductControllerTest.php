<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Product;
use Tests\TestCase;

class ProductControllerTest extends TestCase
{
    public function test_admin_can_list_products(): void
    {
        $this->actingAsAdmin();
        $category = Category::factory()->create();
        Product::factory()->count(5)->create(['category_id' => $category->id]);

        $this->getJson('/api/admin/products')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'name_en', 'price', 'stock']],
                'meta' => ['current_page', 'total'],
            ]);
    }

    public function test_admin_can_get_product_stats(): void
    {
        $this->actingAsAdmin();
        $category = Category::factory()->create();
        Product::factory()->count(3)->create(['category_id' => $category->id, 'stock' => 5]);
        Product::factory()->create(['category_id' => $category->id, 'stock' => 0]);

        $this->getJson('/api/admin/products/stats')
            ->assertOk()
            ->assertJsonStructure([
                'data' => ['total_products', 'total_value', 'low_stock_count', 'out_of_stock_count'],
            ]);
    }

    public function test_admin_can_create_product(): void
    {
        $this->actingAsAdmin();
        $category = Category::factory()->create();

        $this->postJson('/api/admin/products', [
            'category_id' => $category->id,
            'name_en' => 'Rose Bouquet',
            'name_ar' => 'باقة ورد',
            'description_en' => 'Beautiful red roses',
            'description_ar' => 'ورود حمراء جميلة',
            'price' => 15.500,
            'stock' => 20,
        ])->assertCreated()
            ->assertJsonPath('data.name_en', 'Rose Bouquet');

        $this->assertDatabaseHas('products', ['name_en' => 'Rose Bouquet']);
    }

    public function test_admin_can_show_product(): void
    {
        $this->actingAsAdmin();
        $product = Product::factory()->create(['category_id' => Category::factory()->create()->id]);

        $this->getJson("/api/admin/products/{$product->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $product->id);
    }

    public function test_admin_can_update_product(): void
    {
        $this->actingAsAdmin();
        $product = Product::factory()->create(['category_id' => Category::factory()->create()->id, 'price' => '10.000']);

        $this->patchJson("/api/admin/products/{$product->id}", [
            'price' => 12.500,
        ])->assertOk()
            ->assertJsonPath('data.price', 12.5);
    }

    public function test_admin_can_delete_product(): void
    {
        $this->actingAsAdmin();
        $product = Product::factory()->create(['category_id' => Category::factory()->create()->id]);

        $this->deleteJson("/api/admin/products/{$product->id}")
            ->assertOk();

        // Soft delete — should still exist in DB
        $this->assertDatabaseHas('products', ['id' => $product->id]);
        $this->assertNotNull($product->fresh()->deleted_at);
    }

    public function test_admin_can_search_products(): void
    {
        $this->actingAsAdmin();
        $category = Category::factory()->create();
        Product::factory()->create(['category_id' => $category->id, 'name_en' => 'Red Rose']);
        Product::factory()->create(['category_id' => $category->id, 'name_en' => 'White Lily']);

        $response = $this->getJson('/api/admin/products?search=Red');

        $response->assertOk();
        $this->assertEquals(1, $response->json('meta.total'));
    }

    public function test_non_admin_cannot_access_admin_products(): void
    {
        $this->actingAsCustomer();

        $this->getJson('/api/admin/products')
            ->assertStatus(403);
    }

    public function test_product_create_validates_required_fields(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/admin/products', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['category_id', 'name_en', 'name_ar', 'price', 'stock']);
    }
}
