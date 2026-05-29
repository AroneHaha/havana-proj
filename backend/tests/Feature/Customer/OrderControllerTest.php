<?php

namespace Tests\Feature\Customer;

use App\Models\Order;
use App\Models\OrderItem;
use Tests\TestCase;

class OrderControllerTest extends TestCase
{
    public function test_customer_can_list_their_orders(): void
    {
        $user = $this->actingAsCustomer();
        Order::factory()->count(3)->create(['user_id' => $user->id]);

        $this->getJson('/api/orders')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'order_number', 'status']],
                'meta' => ['current_page', 'total'],
            ]);
    }

    public function test_customer_cannot_see_other_users_orders(): void
    {
        $user = $this->actingAsCustomer();
        $otherUser = $this->createCustomer();

        Order::factory()->count(3)->create(['user_id' => $user->id]);
        Order::factory()->count(2)->create(['user_id' => $otherUser->id]);

        $response = $this->getJson('/api/orders');

        $response->assertOk();
        $this->assertEquals(3, $response->json('meta.total'));
    }

    public function test_customer_can_show_their_order(): void
    {
        $user = $this->actingAsCustomer();
        $order = Order::factory()->create(['user_id' => $user->id]);

        $this->getJson("/api/orders/{$order->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $order->id);
    }

    public function test_customer_cannot_show_other_users_order(): void
    {
        $this->actingAsCustomer();
        $otherUser = $this->createCustomer();
        $order = Order::factory()->create(['user_id' => $otherUser->id]);

        $this->getJson("/api/orders/{$order->id}")
            ->assertStatus(403);
    }

    public function test_customer_can_cancel_pending_order(): void
    {
        $user = $this->actingAsCustomer();
        $order = Order::factory()->create(['user_id' => $user->id, 'status' => 'pending']);

        $this->postJson("/api/orders/{$order->id}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertEquals('cancelled', $order->fresh()->status);
    }

    public function test_customer_cannot_cancel_delivered_order(): void
    {
        $user = $this->actingAsCustomer();
        $order = Order::factory()->create(['user_id' => $user->id, 'status' => 'delivered']);

        $this->postJson("/api/orders/{$order->id}/cancel")
            ->assertStatus(422);
    }

    public function test_customer_can_filter_orders_by_status(): void
    {
        $user = $this->actingAsCustomer();
        Order::factory()->count(2)->create(['user_id' => $user->id, 'status' => 'pending']);
        Order::factory()->create(['user_id' => $user->id, 'status' => 'delivered']);

        $response = $this->getJson('/api/orders?status=pending');

        $response->assertOk();
        $this->assertEquals(2, $response->json('meta.total'));
    }
}
