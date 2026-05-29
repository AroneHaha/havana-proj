<?php

namespace Tests\Feature\Customer;

use App\Models\CartItem;
use App\Models\Category;
use App\Models\Product;
use Tests\TestCase;

class CheckoutControllerTest extends TestCase
{
    private function createProductWithCategory(array $overrides = []): Product
    {
        $category = Category::factory()->create();
        return Product::factory()->create(array_merge(['category_id' => $category->id, 'is_active' => true], $overrides));
    }

    public function test_can_verify_checkout(): void
    {
        $user = $this->actingAsCustomer();
        $product = $this->createProductWithCategory(['stock' => 10, 'price' => '5.000']);

        CartItem::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $this->getJson('/api/checkout/verify')
            ->assertOk()
            ->assertJsonPath('data.available', true)
            ->assertJsonStructure([
                'data' => ['available', 'issues', 'summary' => ['subtotal', 'shipping_cost', 'total']],
            ]);
    }

    public function test_verify_detects_insufficient_stock(): void
    {
        $user = $this->actingAsCustomer();
        $product = $this->createProductWithCategory(['stock' => 1]);

        CartItem::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 5,
        ]);

        $this->getJson('/api/checkout/verify')
            ->assertOk()
            ->assertJsonPath('data.available', false);
    }

    public function test_verify_empty_cart_returns_error(): void
    {
        $this->actingAsCustomer();

        $this->getJson('/api/checkout/verify')
            ->assertStatus(422);
    }

    public function test_can_place_order(): void
    {
        $user = $this->actingAsCustomer();
        $product = $this->createProductWithCategory(['stock' => 10, 'price' => '5.000']);

        CartItem::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response = $this->postJson('/api/checkout', [
            'shipping_address' => '123 Main St, Kuwait City',
            'shipping_phone' => '+96512345678',
            'payment_method' => 'knet',
        ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'data' => ['id', 'order_number', 'status', 'total'],
                'message',
            ]);

        // Cart should be cleared after checkout
        $this->assertEquals(0, $user->fresh()->cartItems()->count());

        // Order should exist
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'status' => 'pending',
            'payment_method' => 'knet',
        ]);

        // Stock should be decremented
        $this->assertEquals(8, $product->fresh()->stock);
    }

    public function test_checkout_empty_cart_returns_error(): void
    {
        $this->actingAsCustomer();

        $this->postJson('/api/checkout', [
            'shipping_address' => '123 Main St',
            'shipping_phone' => '+96512345678',
            'payment_method' => 'knet',
        ])->assertStatus(422);
    }

    public function test_checkout_validates_required_fields(): void
    {
        $this->actingAsCustomer();

        $this->postJson('/api/checkout', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['shipping_address', 'shipping_phone', 'payment_method']);
    }

    public function test_free_shipping_over_10_kwd(): void
    {
        $user = $this->actingAsCustomer();
        $product = $this->createProductWithCategory(['stock' => 10, 'price' => '15.000']);

        CartItem::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $this->getJson('/api/checkout/verify')
            ->assertOk()
            ->assertJsonPath('data.summary.shipping_cost', '0.000');
    }

    public function test_shipping_cost_under_10_kwd(): void
    {
        $user = $this->actingAsCustomer();
        $product = $this->createProductWithCategory(['stock' => 10, 'price' => '5.000']);

        CartItem::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $this->getJson('/api/checkout/verify')
            ->assertOk()
            ->assertJsonPath('data.summary.shipping_cost', '1.000');
    }
}
