<?php

namespace Tests\Feature\Customer;

use App\Models\CartItem;
use App\Models\Category;
use App\Models\Product;
use Tests\TestCase;

class CartItemControllerTest extends TestCase
{
    private function createProductWithCategory(array $overrides = []): Product
    {
        $category = Category::factory()->create();
        return Product::factory()->create(array_merge(['category_id' => $category->id], $overrides));
    }

    public function test_can_add_item_to_cart(): void
    {
        $user = $this->actingAsCustomer();
        $product = $this->createProductWithCategory(['stock' => 10, 'is_active' => true]);

        $this->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ])->assertCreated()
            ->assertJsonPath('data.product_id', $product->id)
            ->assertJsonPath('data.quantity', 2);
    }

    public function test_adding_same_product_increments_quantity(): void
    {
        $user = $this->actingAsCustomer();
        $product = $this->createProductWithCategory(['stock' => 20]);

        CartItem::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 3,
        ]);

        $this->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ])->assertOk();

        $this->assertEquals(5, $user->fresh()->cartItems()->first()->quantity);
    }

    public function test_cannot_add_out_of_stock_product(): void
    {
        $this->actingAsCustomer();
        $product = $this->createProductWithCategory(['stock' => 0]);

        $this->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertStatus(422);
    }

    public function test_cannot_add_more_than_stock(): void
    {
        $this->actingAsCustomer();
        $product = $this->createProductWithCategory(['stock' => 3]);

        $this->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 5,
        ])->assertStatus(422);
    }

    public function test_can_update_cart_item_quantity(): void
    {
        $user = $this->actingAsCustomer();
        $product = $this->createProductWithCategory(['stock' => 10]);
        $cartItem = CartItem::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $this->patchJson("/api/cart/items/{$cartItem->id}", [
            'quantity' => 5,
        ])->assertOk()
            ->assertJsonPath('data.quantity', 5);
    }

    public function test_cannot_update_other_users_cart_item(): void
    {
        $otherUser = $this->createCustomer();
        $product = $this->createProductWithCategory();
        $cartItem = CartItem::factory()->create([
            'user_id' => $otherUser->id,
            'product_id' => $product->id,
        ]);

        $this->actingAsCustomer();

        $this->patchJson("/api/cart/items/{$cartItem->id}", [
            'quantity' => 5,
        ])->assertStatus(403);
    }

    public function test_can_delete_cart_item(): void
    {
        $user = $this->actingAsCustomer();
        $product = $this->createProductWithCategory();
        $cartItem = CartItem::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $this->deleteJson("/api/cart/items/{$cartItem->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Item removed from cart');

        $this->assertDatabaseMissing('cart_items', ['id' => $cartItem->id]);
    }
}
