<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

use App\Http\Resources\UserResource;

class OrderStatusHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'changed_by' => $this->changed_by,
            'note' => $this->note,
            'changed_by_user' => new UserResource($this->whenLoaded('changedByUser')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
