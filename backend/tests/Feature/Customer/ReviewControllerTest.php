<?php

namespace Tests\Feature\Customer;

use App\Models\Category;
use App\Models\Product;
use App\Models\Review;
use Tests\TestCase;

class ReviewControllerTest extends TestCase
{
    public function test_customer_can_submit_review(): void
    {
        $user = $this->actingAsCustomer();
        $product = Product::factory()->create(['category_id' => Category::factory()->create()->id]);

        $this->postJson('/api/reviews', [
            'product_id' => $product->id,
            'rating' => 5,
            'title' => 'Amazing flowers!',
            'comment' => 'The bouquet was absolutely beautiful.',
        ])->assertCreated()
            ->assertJsonPath('data.rating', 5)
            ->assertJsonPath('data.title', 'Amazing flowers!');
    }

    public function test_customer_cannot_review_same_product_twice(): void
    {
        $user = $this->actingAsCustomer();
        $product = Product::factory()->create(['category_id' => Category::factory()->create()->id]);

        Review::factory()->create(['user_id' => $user->id, 'product_id' => $product->id]);

        $this->postJson('/api/reviews', [
            'product_id' => $product->id,
            'rating' => 4,
        ])->assertStatus(422);
    }

    public function test_review_validates_rating_range(): void
    {
        $this->actingAsCustomer();
        $product = Product::factory()->create(['category_id' => Category::factory()->create()->id]);

        $this->postJson('/api/reviews', [
            'product_id' => $product->id,
            'rating' => 6,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['rating']);
    }

    public function test_customer_can_list_their_reviews(): void
    {
        $user = $this->actingAsCustomer();
        $product = Product::factory()->create(['category_id' => Category::factory()->create()->id]);

        Review::factory()->count(3)->create(['user_id' => $user->id, 'product_id' => $product->id]);

        $this->getJson('/api/reviews')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_customer_can_delete_their_review(): void
    {
        $user = $this->actingAsCustomer();
        $review = Review::factory()->create(['user_id' => $user->id]);

        $this->deleteJson("/api/reviews/{$review->id}")
            ->assertOk();

        $this->assertDatabaseMissing('reviews', ['id' => $review->id]);
    }

    public function test_customer_cannot_delete_other_users_review(): void
    {
        $this->actingAsCustomer();
        $otherUser = $this->createCustomer();
        $review = Review::factory()->create(['user_id' => $otherUser->id]);

        $this->deleteJson("/api/reviews/{$review->id}")
            ->assertStatus(403);
    }
}