<?php

namespace Tests\Feature\Admin;

use App\Models\Notification;
use App\Models\User;
use Tests\TestCase;

class NotificationControllerTest extends TestCase
{
    public function test_admin_can_send_notification_to_user(): void
    {
        $this->actingAsAdmin();
        $user = User::factory()->create();

        $this->postJson('/api/admin/notifications', [
            'user_id' => $user->id,
            'type' => 'order',
            'title_en' => 'Order Confirmed',
            'title_ar' => 'تم تأكيد الطلب',
            'body_en' => 'Your order has been confirmed.',
            'body_ar' => 'تم تأكيد طلبك.',
        ])->assertCreated()
            ->assertJsonPath('data.title_en', 'Order Confirmed');

        $this->assertDatabaseHas('notifications', ['user_id' => $user->id]);
    }

    public function test_admin_can_broadcast_notification(): void
    {
        $this->actingAsAdmin();
        User::factory()->count(3)->create(['role' => 'customer']);

        $this->postJson('/api/admin/notifications/broadcast', [
            'type' => 'promotion',
            'title_en' => 'Spring Sale!',
            'title_ar' => 'تخفيضات الربيع!',
            'body_en' => 'Get 20% off all bouquets.',
            'body_ar' => 'خصم 20% على جميع الباقات.',
        ])->assertOk()
            ->assertJsonPath('data.sent_count', 3);
    }

    public function test_admin_can_list_notifications(): void
    {
        $this->actingAsAdmin();
        $user = User::factory()->create();
        Notification::factory()->count(5)->create(['user_id' => $user->id]);

        $this->getJson('/api/admin/notifications')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_admin_can_delete_notification(): void
    {
        $this->actingAsAdmin();
        $notification = Notification::factory()->create();

        $this->deleteJson("/api/admin/notifications/{$notification->id}")
            ->assertOk();

        $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
    }

    public function test_non_admin_cannot_access_admin_notifications(): void
    {
        $this->actingAsCustomer();

        $this->getJson('/api/admin/notifications')
            ->assertStatus(403);
    }
}
