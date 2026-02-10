<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class PresenceController extends Controller
{
    // User is online if active in last 90 seconds.
    private int $onlineWindowSeconds = 90;

    // Called every 30s while tab is visible.
    public function ping(Request $request)
    {
        $user = $request->user();

        // Save current time as last activity.
        $user->last_seen_at = date('Y-m-d H:i:s');
        $user->save();

        return response()->json([
            'ok' => true,
        ]);
    }

    // Called on logout/tab close to make user offline immediately.
    public function offline(Request $request)
    {
        $user = $request->user();

        $forceOfflineTimestamp = time() - ($this->onlineWindowSeconds + 1);

        // Store an old timestamp so user is outside online window.
        $user->last_seen_at = date('Y-m-d H:i:s', $forceOfflineTimestamp);
        $user->save();

        return response()->json([
            'ok' => true,
        ]);
    }

    // Presence status endpoint.
    public function show(User $user)
    {
        $currentTimestamp = time();
        $lastSeenTimestamp = $user->last_seen_at?->timestamp;

        $isOnline = $lastSeenTimestamp !== null
            && ($currentTimestamp - $lastSeenTimestamp) <= $this->onlineWindowSeconds;

        $offlineForSeconds = null;

        if (! $isOnline && $lastSeenTimestamp !== null) {
            $offlineForSeconds = $currentTimestamp - $lastSeenTimestamp;
        }

        return response()->json([
            'user_id' => $user->id,
            'is_online' => $isOnline,
            'last_seen_at' => $user->last_seen_at?->toISOString(),
            'offline_for_seconds' => $offlineForSeconds,
        ]);
    }
}
