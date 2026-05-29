<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    // ─── REGISTER ───────────────────────────────────────────────

    public function test_customer_can_register(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'phone' => '+96512345678',
        ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'first_name', 'last_name', 'email', 'role'],
                    'access_token',
                    'refresh_token',
                    'token_type',
                    'expires_in',
                ],
                'message',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'role' => 'customer',
        ]);
    }

    public function test_register_validates_required_fields(): void
    {
        $this->postJson('/api/auth/register', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['first_name', 'last_name', 'email', 'password']);
    }

    public function test_register_prevents_duplicate_email(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $this->postJson('/api/auth/register', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'taken@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    // ─── LOGIN ──────────────────────────────────────────────────

    public function test_user_can_login(): void
    {
        User::factory()->create([
            'email' => 'login@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'login@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'email'],
                    'access_token',
                    'refresh_token',
                ],
            ]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'wrong@example.com',
            'password' => Hash::make('password123'),
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'wrong@example.com',
            'password' => 'wrongpassword',
        ])->assertStatus(401);
    }

    public function test_login_fails_with_nonexistent_email(): void
    {
        $this->postJson('/api/auth/login', [
            'email' => 'nobody@example.com',
            'password' => 'password123',
        ])->assertStatus(401);
    }

    public function test_login_validates_required_fields(): void
    {
        $this->postJson('/api/auth/login', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    }

    // ─── ME ─────────────────────────────────────────────────────

    public function test_authenticated_user_can_get_profile(): void
    {
        $user = $this->actingAsCustomer();

        $this->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', $user->email);
    }

    public function test_unauthenticated_user_cannot_get_profile(): void
    {
        $this->getJson('/api/auth/me')
            ->assertUnauthorized();
    }

    // ─── LOGOUT ─────────────────────────────────────────────────

    public function test_user_can_logout(): void
    {
        $this->actingAsCustomer();

        $this->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logged out successfully');
    }

    // ─── UPDATE PROFILE ─────────────────────────────────────────

    public function test_user_can_update_profile(): void
    {
        $this->actingAsCustomer();

        $this->putJson('/api/auth/profile', [
            'first_name' => 'Updated',
            'last_name' => 'Name',
        ])->assertOk()
            ->assertJsonPath('data.first_name', 'Updated')
            ->assertJsonPath('data.last_name', 'Name');
    }

    // ─── CHANGE PASSWORD ────────────────────────────────────────

    public function test_user_can_change_password(): void
    {
        $user = $this->actingAsCustomer([
            'password' => Hash::make('oldpassword'),
        ]);

        $this->putJson('/api/auth/password', [
            'current_password' => 'oldpassword',
            'password' => 'NewSecure123!',
            'password_confirmation' => 'NewSecure123!',
        ])->assertOk()
            ->assertJsonPath('message', 'Password changed successfully');
    }

    public function test_change_password_rejects_wrong_current(): void
    {
        $this->actingAsCustomer();

        $this->putJson('/api/auth/password', [
            'current_password' => 'wrongpassword',
            'password' => 'NewSecure123!',
            'password_confirmation' => 'NewSecure123!',
        ])->assertStatus(422);
    }

    // ─── FORGOT PASSWORD ────────────────────────────────────────

    public function test_forgot_password_accepts_valid_email(): void
    {
        User::factory()->create(['email' => 'reset@example.com']);

        $this->postJson('/api/auth/forgot-password', [
            'email' => 'reset@example.com',
        ])->assertOk();
    }

    public function test_forgot_password_validates_email(): void
    {
        $this->postJson('/api/auth/forgot-password', [
            'email' => 'not-an-email',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }
}
