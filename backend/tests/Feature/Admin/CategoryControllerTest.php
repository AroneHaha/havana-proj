<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use Tests\TestCase;

class CategoryControllerTest extends TestCase
{
    public function test_admin_can_list_categories(): void
    {
        $this->actingAsAdmin();
        Category::factory()->count(3)->create();

        $this->getJson('/api/admin/categories')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_admin_can_create_category(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/admin/categories', [
            'name_en' => 'Roses',
            'name_ar' => 'ورود',
        ])->assertCreated()
            ->assertJsonPath('data.name_en', 'Roses');

        $this->assertDatabaseHas('categories', ['name_en' => 'Roses']);
    }

    public function test_admin_can_show_category(): void
    {
        $this->actingAsAdmin();
        $category = Category::factory()->create();

        $this->getJson("/api/admin/categories/{$category->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $category->id);
    }

    public function test_admin_can_update_category(): void
    {
        $this->actingAsAdmin();
        $category = Category::factory()->create(['name_en' => 'Old Name']);

        $this->patchJson("/api/admin/categories/{$category->id}", [
            'name_en' => 'New Name',
        ])->assertOk()
            ->assertJsonPath('data.name_en', 'New Name');
    }

    public function test_admin_can_delete_category(): void
    {
        $this->actingAsAdmin();
        $category = Category::factory()->create();

        $this->deleteJson("/api/admin/categories/{$category->id}")
            ->assertOk();

        $this->assertNotNull($category->fresh()->deleted_at);
    }

    public function test_category_slug_auto_generated(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/admin/categories', [
            'name_en' => 'Sunflowers',
            'name_ar' => 'دوار شمس',
        ])->assertCreated();

        $this->assertDatabaseHas('categories', ['slug' => 'sunflowers']);
    }

    public function test_non_admin_cannot_access_admin_categories(): void
    {
        $this->actingAsCustomer();

        $this->getJson('/api/admin/categories')
            ->assertStatus(403);
    }
}
