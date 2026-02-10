<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSeen implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(public int $chatId, public array $messageIds, public string $seenAt) {}

    // Send to this chat private channel only.
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('private-chat.'.$this->chatId),
        ];
    }

    // Event name used by frontend listener.
    public function broadcastAs(): string
    {
        return 'MessageSeen';
    }

    // Simple data for frontend.
    public function broadcastWith(): array
    {
        return [
            'message_ids' => $this->messageIds,
            'seen_at' => $this->seenAt,
        ];
    }
}
