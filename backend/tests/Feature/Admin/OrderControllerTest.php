<?php

namespace Tests\Feature\Admin;

use App\Models\Order;
use Tests\TestCase;

class OrderControllerTest extends TestCase
{
    public function test_admin_can_list_orders(): void
    {
        $this->actingAsAdmin();
        Order::factory()->count(3)->create();

        $this->getJson('/api/admin/orders')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_admin_can_get_order_stats(): void
    {
        $this->actingAsAdmin();
        Order::factory()->create(['status' => 'pending', 'total' => '25.000']);
        Order::factory()->create(['status' => 'delivered', 'total' => '50.000']);

        $this->getJson('/api/admin/orders/stats')
            ->assertOk()
            ->assertJsonStructure([
                'data' => ['total_revenue', 'average_order_value', 'status_counts'],
            ]);
    }

    public function test_admin_can_show_order(): void
    {
        $this->actingAsAdmin();
        $order = Order::factory()->create();

        $this->getJson("/api/admin/orders/{$order->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $order->id);
    }

    public function test_admin_can_update_order_status(): void
    {
        $this->actingAsAdmin();
        $order = Order::factory()->create(['status' => 'pending']);

        $this->patchJson("/api/admin/orders/{$order->id}/status", [
            'status' => 'confirmed',
        ])->assertOk()
            ->assertJsonPath('data.status', 'confirmed');

        $this->assertNotNull($order->fresh()->confirmed_at);
    }

    public function test_admin_cannot_make_invalid_status_transition(): void
    {
        $this->actingAsAdmin();
        $order = Order::factory()->create(['status' => 'pending']);

        // Cannot go from pending directly to delivered
        $this->patchJson("/api/admin/orders/{$order->id}/status", [
            'status' => 'delivered',
        ])->assertStatus(422);
    }

    public function test_admin_can_cancel_pending_order(): void
    {
        $this->actingAsAdmin();
        $order = Order::factory()->create(['status' => 'pending']);

        $this->patchJson("/api/admin/orders/{$order->id}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');
    }

    public function test_admin_can_cancel_out_for_delivery_order(): void
    {
        $this->actingAsAdmin();
        $order = Order::factory()->create(['status' => 'out_for_delivery']);

        $this->patchJson("/api/admin/orders/{$order->id}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');
    }

    public function test_admin_cannot_cancel_confirmed_order(): void
    {
        $this->actingAsAdmin();
        $order = Order::factory()->create(['status' => 'confirmed']);

        $this->patchJson("/api/admin/orders/{$order->id}/cancel")
            ->assertStatus(422);
    }

    public function test_admin_cannot_cancel_preparing_order(): void
    {
        $this->actingAsAdmin();
        $order = Order::factory()->create(['status' => 'preparing']);

        $this->patchJson("/api/admin/orders/{$order->id}/cancel")
            ->assertStatus(422);
    }

    public function test_admin_can_filter_orders_by_status(): void
    {
        $this->actingAsAdmin();
        Order::factory()->count(2)->create(['status' => 'pending']);
        Order::factory()->create(['status' => 'delivered']);

        $response = $this->getJson('/api/admin/orders?status=pending');

        $response->assertOk();
        $this->assertEquals(2, $response->json('meta.total'));
    }

    public function test_non_admin_cannot_access_admin_orders(): void
    {
        $this->actingAsCustomer();

        $this->getJson('/api/admin/orders')
            ->assertStatus(403);
    }
}
