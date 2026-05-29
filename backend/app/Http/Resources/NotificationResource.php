<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = $request->query('locale', 'en');

        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $locale === 'ar' ? $this->title_ar : $this->title_en,
            'title_en' => $this->title_en,
            'title_ar' => $this->title_ar,
            'body' => $locale === 'ar' ? $this->body_ar : $this->body_en,
            'body_en' => $this->body_en,
            'body_ar' => $this->body_ar,
            'data' => $this->data,
            'is_read' => $this->is_read,
            'read_at' => $this->read_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
