<?php

namespace App\Http\Controllers;

use App\Http\Concerns\RespondsTrait;
use App\Http\Resources\DeliveryAddressResource;
use App\Models\DeliveryAddress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * AddressController — Delivery address management for authenticated users.
 *
 * Used primarily by the Android customer app.
 * Users can have multiple addresses, with one marked as default.
 */
class AddressController extends Controller
{
    use RespondsTrait;

    /**
     * GET /api/addresses
     * List the authenticated user's delivery addresses.
     */
    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()
            ->deliveryAddresses()
            ->orderByDesc('is_default')
            ->orderByDesc('created_at')
            ->get();

        return $this->respondWithData(DeliveryAddressResource::collection($addresses));
    }

    /**
     * POST /api/addresses
     * Add a new delivery address.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'full_address' => ['required', 'string', 'max:1000'],
            'area' => ['nullable', 'string', 'max:255'],
            'block' => ['nullable', 'string', 'max:50'],
            'street' => ['nullable', 'string', 'max:255'],
            'building' => ['nullable', 'string', 'max:100'],
            'floor' => ['nullable', 'string', 'max:50'],
            'apartment' => ['nullable', 'string', 'max:50'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        // If this is the user's first address, make it default
        $isFirstAddress = $request->user()->deliveryAddresses()->count() === 0;
        if ($isFirstAddress) {
            $validated['is_default'] = true;
        }

        $address = $request->user()->deliveryAddresses()->create($validated);

        // If set as default, unset others
        if ($address->is_default) {
            $address->setAsDefault();
        }

        return $this->respondCreated(new DeliveryAddressResource($address), 'Address added successfully');
    }

    /**
     * PUT /api/addresses/{address}
     * Update a delivery address.
     */
    public function update(Request $request, DeliveryAddress $address): JsonResponse
    {
        if ($address->user_id !== $request->user()->id) {
            return $this->respondForbidden('This address does not belong to you');
        }

        $validated = $request->validate([
            'full_address' => ['sometimes', 'string', 'max:1000'],
            'area' => ['nullable', 'string', 'max:255'],
            'block' => ['nullable', 'string', 'max:50'],
            'street' => ['nullable', 'string', 'max:255'],
            'building' => ['nullable', 'string', 'max:100'],
            'floor' => ['nullable', 'string', 'max:50'],
            'apartment' => ['nullable', 'string', 'max:50'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        $address->update($validated);

        // If set as default, unset others
        if (isset($validated['is_default']) && $validated['is_default']) {
            $address->setAsDefault();
        }

        return $this->respondWithData(new DeliveryAddressResource($address), 'Address updated successfully');
    }

    /**
     * DELETE /api/addresses/{address}
     * Delete a delivery address.
     */
    public function destroy(Request $request, DeliveryAddress $address): JsonResponse
    {
        if ($address->user_id !== $request->user()->id) {
            return $this->respondForbidden('This address does not belong to you');
        }

        $wasDefault = $address->is_default;
        $address->delete();

        // If deleted address was default, set the most recent one as default
        if ($wasDefault) {
            $newDefault = $request->user()->deliveryAddresses()->first();
            if ($newDefault) {
                $newDefault->setAsDefault();
            }
        }

        return $this->respondWithMessage('Address deleted successfully');
    }

    /**
     * PATCH /api/addresses/{address}/default
     * Set an address as the default.
     */
    public function setDefault(Request $request, DeliveryAddress $address): JsonResponse
    {
        if ($address->user_id !== $request->user()->id) {
            return $this->respondForbidden('This address does not belong to you');
        }

        $address->setAsDefault();

        return $this->respondWithData(new DeliveryAddressResource($address), 'Default address updated');
    }
}
