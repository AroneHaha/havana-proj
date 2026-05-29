<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Product;
use App\Models\Review;
use Tests\TestCase;

class ReviewControllerTest extends TestCase
{
    public function test_admin_can_list_reviews(): void
    {
        $this->actingAsAdmin();
        $product = Product::factory()->create(['category_id' => Category::factory()->create()->id]);
        Review::factory()->count(5)->create(['product_id' => $product->id]);

        $this->getJson('/api/admin/reviews')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_admin_can_get_review_stats(): void
    {
        $this->actingAsAdmin();
        $product = Product::factory()->create(['category_id' => Category::factory()->create()->id]);
        Review::factory()->count(3)->create(['product_id' => $product->id]);

        $this->getJson('/api/admin/reviews/stats')
            ->assertOk()
            ->assertJsonStructure([
                'data' => ['average_rating', 'total_reviews', 'rating_distribution'],
            ]);
    }

    public function test_admin_can_show_review(): void
    {
        $this->actingAsAdmin();
        $review = Review::factory()->create();

        $this->getJson("/api/admin/reviews/{$review->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $review->id);
    }

    public function test_admin_can_update_review_visibility(): void
    {
        $this->actingAsAdmin();
        $review = Review::factory()->create(['visibility' => 'pending']);

        $this->patchJson("/api/admin/reviews/{$review->id}/status", [
            'visibility' => 'visible',
        ])->assertOk()
            ->assertJsonPath('data.visibility', 'visible');
    }

    public function test_admin_can_delete_review(): void
    {
        $this->actingAsAdmin();
        $review = Review::factory()->create();

        $this->deleteJson("/api/admin/reviews/{$review->id}")
            ->assertOk();

        $this->assertDatabaseMissing('reviews', ['id' => $review->id]);
    }

    public function test_non_admin_cannot_access_admin_reviews(): void
    {
        $this->actingAsCustomer();

        $this->getJson('/api/admin/reviews')
            ->assertStatus(403);
    }
}
