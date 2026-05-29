<?php

namespace Tests\Feature\Customer;

use App\Models\Notification;
use Tests\TestCase;

class NotificationControllerTest extends TestCase
{
    public function test_user_can_list_their_notifications(): void
    {
        $user = $this->actingAsCustomer();
        Notification::factory()->count(5)->create(['user_id' => $user->id]);

        $this->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_user_can_filter_unread_notifications(): void
    {
        $user = $this->actingAsCustomer();
        Notification::factory()->count(3)->create(['user_id' => $user->id, 'is_read' => false]);
        Notification::factory()->count(2)->create(['user_id' => $user->id, 'is_read' => true]);

        $response = $this->getJson('/api/notifications?unread_only=true');

        $response->assertOk();
        $this->assertEquals(3, $response->json('meta.total'));
    }

    public function test_user_can_mark_notification_as_read(): void
    {
        $user = $this->actingAsCustomer();
        $notification = Notification::factory()->create(['user_id' => $user->id, 'is_read' => false]);

        $this->patchJson("/api/notifications/{$notification->id}/read")
            ->assertOk();

        $this->assertTrue($notification->fresh()->is_read);
    }

    public function test_user_can_mark_all_as_read(): void
    {
        $user = $this->actingAsCustomer();
        Notification::factory()->count(5)->create(['user_id' => $user->id, 'is_read' => false]);

        $this->postJson('/api/notifications/read-all')
            ->assertOk();

        $this->assertEquals(0, $user->fresh()->notifications()->where('is_read', false)->count());
    }

    public function test_user_can_get_unread_count(): void
    {
        $user = $this->actingAsCustomer();
        Notification::factory()->count(3)->create(['user_id' => $user->id, 'is_read' => false]);
        Notification::factory()->count(2)->create(['user_id' => $user->id, 'is_read' => true]);

        $this->getJson('/api/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.unread_count', 3);
    }

    public function test_user_cannot_read_other_users_notification(): void
    {
        $this->actingAsCustomer();
        $otherUser = $this->createCustomer();
        $notification = Notification::factory()->create(['user_id' => $otherUser->id]);

        $this->patchJson("/api/notifications/{$notification->id}/read")
            ->assertStatus(403);
    }
}
