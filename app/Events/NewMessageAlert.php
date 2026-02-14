<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class NewMessageAlert implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public Message $message;

    public int $recipientId;

    public function __construct(Message $message, int $recipientId)
    {
        $message->load('sender:id,name,avatar_path');

        $this->message = $message;
        $this->recipientId = $recipientId;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('private-user.'.$this->recipientId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'NewMessageAlert';
    }

    public function broadcastWith(): array
    {
        return [
            'chat_id' => $this->message->chat_id,
            'sender_id' => $this->message->sender_id,
            'sender_name' => $this->message->sender?->name,
            'sender_avatar_path' => $this->message->sender?->avatar_path,
            'preview' => Str::limit($this->message->body, 80),
        ];
    }
}
