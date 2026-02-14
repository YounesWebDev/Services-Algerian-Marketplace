<?php

namespace App\Events;

use App\Models\Chat;
use App\Models\Message;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class ChatUpdated implements ShouldBroadcastNow
{
    use Dispatchable,SerializesModels;

    public Chat $chat;

    public Message $message;

    public function __construct(Chat $chat, Message $message)
    {
        $this->chat = $chat;
        $this->message = $message;
    }

    // send this event to both chat participants
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('private-user.'.$this->chat->client_id),
            new PrivateChannel('private-user.'.$this->chat->provider_id),
        ];
    }

    // event name for frontend listener
    public function broadcastAs(): string
    {
        return 'ChatUpdated';
    }

    // Data used by chat list page
    public function broadcastWith(): array
    {
        $preview = $this->message->body !== ''
            ? Str::limit($this->message->body, 80)
            : ($this->message->attachments()->exists() ? 'Sent an attachment' : '');

        return [
            'chat_id' => $this->chat->id,
            'last_message_preview' => $preview,
            'last_message_at' => $this->chat->last_message_at?->toISOString(),
            'sender_id' => $this->message->sender_id,
            'message_id' => $this->message->id,
        ];
    }
}
