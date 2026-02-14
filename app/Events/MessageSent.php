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
        $message->load([
            'sender:id,name,avatar_path',
            'attachments:id,message_id,path,original_name,type,size_bytes',
        ]);
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
            'attachments' => $this->message->attachments->map(fn ($attachment) => [
                'id' => $attachment->id,
                'path' => $attachment->path,
                'original_name' => $attachment->original_name,
                'type' => $attachment->type,
                'size_bytes' => $attachment->size_bytes,
            ])->values()->all(),
            'read_at' => $this->message->read_at?->toISOString(),
            'created_at' => $this->message->created_at?->toISOString(),
        ];
    }
}
