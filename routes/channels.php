<?php

use App\Models\Chat;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('private-user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('private-chat.{chatId}', function ($user, $chatId) {
    $chat = Chat::query()
        ->select('id', 'client_id', 'provider_id')
        ->find($chatId);

    if (! $chat) {
        return false;
    }

    return (int) $user->id === (int) $chat->client_id || (int) $user->id === (int) $chat->provider_id;
});
