<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;

class AdminCustomNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $type,
        public string $titleEn,
        public string $titleAr,
        public string $bodyEn,
        public string $bodyAr,
        public array $data = [],
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): DatabaseMessage
    {
        return new DatabaseMessage([
            'type' => $this->type,
            'title' => $this->titleEn,
            'title_en' => $this->titleEn,
            'title_ar' => $this->titleAr,
            'body' => $this->bodyEn,
            'body_en' => $this->bodyEn,
            'body_ar' => $this->bodyAr,
            'data' => $this->data,
        ]);
    }
}