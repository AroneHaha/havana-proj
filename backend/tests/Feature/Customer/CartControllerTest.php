<?php

namespace Tests\Feature\Customer;

use App\Models\CartItem;
use App\Models\Category;
use App\Models\Product;
use Tests\TestCase;

class CartControllerTest extends TestCase
{
    public function test_authenticated_user_can_view_cart(): void
    {
        $user = $this->actingAsCustomer();
        $product = Product::factory()->create(['category_id' => Category::factory()->create()->id]);

        CartItem::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $this->getJson('/api/cart')
            ->assertOk()
            ->assertJsonStructure([
                'data' => ['items', 'items_count', 'subtotal'],
            ])
            ->assertJsonPath('data.items_count', 1);
    }

    public function test_empty_cart_returns_zero_items(): void
    {
        $this->actingAsCustomer();

        $this->getJson('/api/cart')
            ->assertOk()
            ->assertJsonPath('data.items_count', 0)
            ->assertJsonPath('data.subtotal', '0.000');
    }

    public function test_user_can_clear_cart(): void
    {
        $user = $this->actingAsCustomer();
        $product = Product::factory()->create(['category_id' => Category::factory()->create()->id]);

        CartItem::factory()->count(3)->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $this->deleteJson('/api/cart')
            ->assertOk()
            ->assertJsonPath('message', 'Cart cleared successfully');

        $this->assertEquals(0, $user->fresh()->cartItems()->count());
    }

    public function test_unauthenticated_user_cannot_access_cart(): void
    {
        $this->getJson('/api/cart')
            ->assertUnauthorized();
    }
}
