<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\UserResource;
use App\Http\Resources\OrderItemResource;
use App\Http\Resources\OrderStatusHistoryResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'subtotal' => (float) $this->subtotal,
            'shipping_cost' => (float) $this->shipping_cost,
            'discount' => (float) $this->discount,
            'total' => (float) $this->total,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'shipping_address' => $this->shipping_address,
            'shipping_phone' => $this->shipping_phone,
            'notes' => $this->notes,
            'is_paid' => $this->isPaid(),
            'is_delivered' => $this->isDelivered(),
            'is_cancelled' => $this->isCancelled(),
            'user' => new UserResource($this->whenLoaded('user')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'status_history' => OrderStatusHistoryResource::collection($this->whenLoaded('statusHistory')),
            'confirmed_at' => $this->confirmed_at?->toISOString(),
            'delivered_at' => $this->delivered_at?->toISOString(),
            'cancelled_at' => $this->cancelled_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
