<?php

namespace Tests;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Testing\TestResponse;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication, RefreshDatabase;
    /**
     * Create a customer user and return it.
     */
    protected function createCustomer(array $overrides = []): User
    {
        return User::factory()->create(array_merge([
            'role' => 'customer',
        ], $overrides));
    }

    /**
     * Create an admin user and return it.
     */
    protected function createAdmin(array $overrides = []): User
    {
        return User::factory()->create(array_merge([
            'role' => 'admin',
        ], $overrides));
    }

    /**
     * Act as a customer user.
     */
    protected function actingAsCustomer(array $overrides = []): User
    {
        $user = $this->createCustomer($overrides);
        $this->actingAs($user, 'sanctum');

        return $user;
    }

    /**
     * Act as an admin user.
     */
    protected function actingAsAdmin(array $overrides = []): User
    {
        $user = $this->createAdmin($overrides);
        $this->actingAs($user, 'sanctum');

        return $user;
    }

    /**
     * Create a category for testing.
     */
    protected function createCategory(array $overrides = []): Category
    {
        return Category::factory()->create($overrides);
    }

    /**
     * Assert the response JSON has a specific structure for paginated data.
     */
    protected function assertPaginatedStructure(TestResponse $response, string $dataKey = 'data'): void
    {
        $response->assertJsonStructure([
            $dataKey,
            'meta' => [
                'current_page',
                'last_page',
                'per_page',
                'total',
            ],
        ]);
    }
}
