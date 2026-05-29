<?php

namespace Tests\Feature\Customer;

use App\Models\DeliveryAddress;
use Tests\TestCase;

class AddressControllerTest extends TestCase
{
    public function test_user_can_list_their_addresses(): void
    {
        $user = $this->actingAsCustomer();
        DeliveryAddress::factory()->count(3)->create(['user_id' => $user->id]);

        $this->getJson('/api/addresses')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_user_can_add_address(): void
    {
        $this->actingAsCustomer();

        $this->postJson('/api/addresses', [
            'full_address' => 'Block 5, Street 3, Salmiya',
            'area' => 'Salmiya',
            'block' => '5',
            'street' => '3',
            'building' => '12',
            'floor' => '3',
            'apartment' => '7',
        ])->assertCreated()
            ->assertJsonPath('data.full_address', 'Block 5, Street 3, Salmiya');
    }

    public function test_first_address_becomes_default(): void
    {
        $user = $this->actingAsCustomer();

        $this->postJson('/api/addresses', [
            'full_address' => 'First address',
        ])->assertCreated();

        $this->assertTrue($user->fresh()->deliveryAddresses()->first()->is_default);
    }

    public function test_user_can_update_address(): void
    {
        $user = $this->actingAsCustomer();
        $address = DeliveryAddress::factory()->create(['user_id' => $user->id]);

        $this->putJson("/api/addresses/{$address->id}", [
            'full_address' => 'Updated address',
        ])->assertOk()
            ->assertJsonPath('data.full_address', 'Updated address');
    }

    public function test_user_can_delete_address(): void
    {
        $user = $this->actingAsCustomer();
        $address = DeliveryAddress::factory()->create(['user_id' => $user->id]);

        $this->deleteJson("/api/addresses/{$address->id}")
            ->assertOk();

        $this->assertDatabaseMissing('delivery_addresses', ['id' => $address->id]);
    }

    public function test_user_cannot_access_other_users_address(): void
    {
        $this->actingAsCustomer();
        $otherUser = $this->createCustomer();
        $address = DeliveryAddress::factory()->create(['user_id' => $otherUser->id]);

        $this->putJson("/api/addresses/{$address->id}", [
            'full_address' => 'Hacked address',
        ])->assertStatus(403);
    }

    public function test_user_can_set_default_address(): void
    {
        $user = $this->actingAsCustomer();
        $address1 = DeliveryAddress::factory()->create(['user_id' => $user->id, 'is_default' => true]);
        $address2 = DeliveryAddress::factory()->create(['user_id' => $user->id, 'is_default' => false]);

        $this->patchJson("/api/addresses/{$address2->id}/default")
            ->assertOk();

        $this->assertTrue($address2->fresh()->is_default);
        $this->assertFalse($address1->fresh()->is_default);
    }

    public function test_address_validates_required_fields(): void
    {
        $this->actingAsCustomer();

        $this->postJson('/api/addresses', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['full_address']);
    }
}
