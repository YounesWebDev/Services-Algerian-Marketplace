<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public Message $message;

    public function __construct(Message $message)
    {
        $message->load('sender:id,name,avatar_path');
        $this->message = $message;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('private-chat.'.$this->message->chat_id),
        ];
    }

    // Event name used in frontend listener.
    public function broadcastAs(): string
    {
        return 'MessageSent';
    }

    // Data sent to frontend.
    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'chat_id' => $this->message->chat_id,
            'body' => $this->message->body,
            'sender_id' => $this->message->sender_id,
            'sender_name' => $this->message->sender?->name,
            'sender_avatar_path' => $this->message->sender?->avatar_path,
            'read_at' => $this->message->read_at?->toISOString(),
            'created_at' => $this->message->created_at?->toISOString(),
        ];
    }
}
