<?php

namespace App\Http\Controllers\Chat;

use App\Events\ChatUpdated;
use App\Events\MessageSeen;
use App\Events\MessageSent;
use App\Events\NewMessageAlert;
use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Message;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Throwable;

class ChatController extends Controller
{
    // create/open chat from a service page
    public function contactFromService(Request $request, Service $service)
    {
        $user = $request->user();

        if ($user->role !== 'client') {
            abort(403);
        }

        if ((int) $service->provider_id === (int) $user->id) {
            abort(403);
        }

        $chat = Chat::query()
            ->where('client_id', $user->id)
            ->where('provider_id', $service->provider_id)
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->first();

        if (! $chat) {
            $chat = Chat::query()->create([
                'type' => 'service',
                'service_id' => $service->id,
                'request_id' => null,
                'client_id' => $user->id,
                'provider_id' => $service->provider_id,
                'last_message_at' => null,
            ]);
        }

        return to_route('my.chats.show', $chat);
    }

    // chat list page
    public function index(Request $request)
    {
        $user = $request->user();

        $chats = Chat::query()
            ->where(function ($query) use ($user) {
                $query->where('client_id', $user->id)
                    ->orWhere('provider_id', $user->id);
            })
            ->with([
                'client:id,name,avatar_path',
                'provider:id,name,avatar_path',
                'messages' => function ($query) {
                    $query->latest()->limit(1);
                },
            ])
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->get()
            // Keep one row per conversation (prevents duplicate chats in list).
            ->unique(function ($chat) {
                $left = min((int) $chat->client_id, (int) $chat->provider_id);
                $right = max((int) $chat->client_id, (int) $chat->provider_id);

                return implode(':', [
                    $left,
                    $right,
                ]);
            })
            ->values()
            ->map(function ($chat) use ($user) {
                $last = $chat->messages->first();
                $other = (int) $chat->client_id === (int) $user->id ? $chat->provider : $chat->client;

                return [
                    'id' => $chat->id,
                    'type' => $chat->type,
                    'last_message_at' => $chat->last_message_at,
                    'last_message_preview' => $last?->body,
                    'other_user' => $other ? [
                        'id' => $other->id,
                        'name' => $other->name,
                        'avatar_path' => $other->avatar_path,
                    ] : null,
                ];
            });

        return Inertia::render('Chats/Index', [
            'chats' => $chats,
        ]);
    }

    // one chat page
    public function show(Request $request, Chat $chat)
    {
        $user = $request->user();

        // only participants can open chat
        if ((int) $chat->client_id !== (int) $user->id && (int) $chat->provider_id !== (int) $user->id) {
            abort(403);
        }

        // Find unread incoming messages first, so we can broadcast exactly what changed.
        $unreadMessageIds = Message::query()
            ->where('chat_id', $chat->id)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->pluck('id')
            ->all();

        if (! empty($unreadMessageIds)) {
            $seenAt = now();

            // Save seen timestamp in database.
            Message::query()
                ->whereIn('id', $unreadMessageIds)
                ->update([
                    'read_at' => $seenAt,
                ]);

            // Realtime update so sender sees "Seen" without refresh.
            // Keep this best-effort: chat page should still work if broadcast is down.
            try {
                broadcast(new MessageSeen($chat->id, $unreadMessageIds, $seenAt->toISOString()))->toOthers();
            } catch (Throwable $exception) {
                report($exception);
            }
        }

        $chat->load([
            'client:id,name,avatar_path',
            'provider:id,name,avatar_path',
        ]);

        $messages = Message::query()
            ->where('chat_id', $chat->id)
            ->with('sender:id,name,avatar_path')
            ->oldest()
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'chat_id' => $m->chat_id,
                'body' => $m->body,
                'sender_id' => $m->sender_id,
                'sender_name' => $m->sender?->name,
                'sender_avatar_path' => $m->sender?->avatar_path,
                'read_at' => $m->read_at?->toISOString(),
                'created_at' => $m->created_at?->toISOString(),
            ]);

        $other = (int) $chat->client_id === (int) $user->id ? $chat->provider : $chat->client;

        return Inertia::render('Chats/Show', [
            'chat' => [
                'id' => $chat->id,
                'type' => $chat->type,
                'other_user' => $other ? [
                    'id' => $other->id,
                    'name' => $other->name,
                    'avatar_path' => $other->avatar_path,
                ] : null,
            ],
            'messages' => $messages,
        ]);
    }

    // send message
    public function store(Request $request, Chat $chat)
    {
        $user = $request->user();

        // only participants can send
        if ((int) $chat->client_id !== (int) $user->id && (int) $chat->provider_id !== (int) $user->id) {
            abort(403);
        }

        $data = $request->validate([
            'body' => ['required', 'string', 'min:1', 'max:5000'],
        ]);

        $message = Message::query()->create([
            'chat_id' => $chat->id,
            'sender_id' => $user->id,
            'body' => $data['body'],
            'attachment_path' => null,
            'read_at' => null,
        ]);

        $message->load('sender:id,name,avatar_path');

        // keep chats sorted by latest activity
        $chat->update(['last_message_at' => now()]);

        // Realtime events are best-effort so message sending never fails.
        try {
            broadcast(new MessageSent($message))->toOthers();
            broadcast(new ChatUpdated($chat, $message))->toOthers();

            // Send small global alert only to recipient user channel.
            $recipientId = (int) $chat->client_id === (int) $user->id
                ? (int) $chat->provider_id
                : (int) $chat->client_id;

            broadcast(new NewMessageAlert($message, $recipientId))->toOthers();
        } catch (Throwable $exception) {
            report($exception);
        }

        // When frontend sends AJAX, return JSON so page does not re-render.
        if ($request->expectsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
            return response()->json([
                'message' => [
                    'id' => $message->id,
                    'chat_id' => $message->chat_id,
                    'body' => $message->body,
                    'sender_id' => $message->sender_id,
                    'sender_name' => $message->sender?->name,
                    'sender_avatar_path' => $message->sender?->avatar_path,
                    'read_at' => $message->read_at?->toISOString(),
                    'created_at' => $message->created_at?->toISOString(),
                ],
            ]);
        }

        return back();
    }
}
