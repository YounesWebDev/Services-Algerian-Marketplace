<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Dispute;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DisputeController extends Controller
{
    public function create(Request $request, Booking $booking)
    {
        $user = $request->user();

        // 1) Only the booking owner (client)
        if ($booking->client_id !== $user->id) {
            abort(403);
        }

        // 2) Only allow dispute for these statuses
        $allowed = ['confirmed', 'in_progress', 'completed'];
        if (! in_array($booking->status, $allowed, true)) {
            return back()->withErrors([
                'dispute' => 'You can open a dispute only after confirmation.',
            ]);
        }

        // 3) one dispute per booking
        if ($booking->dispute()->exists()) {
            return redirect()
                ->route('client.bookings.show', $booking)
                ->withErrors(['dispute' => 'This booking already has a dispute']);
        }

        $booking->load([
            'service:id,title,slug',
            'provider:id,name,avatar_path',
            'offer:id,request_id,proposed_price',
            'offer.request:id,title',
        ]);

        return Inertia::render('Client/Disputes/Create', [
            'booking' => $booking,
        ]);
    }

    public function store(Request $request, Booking $booking)
    {
        $user = $request->user();

        if ($booking->client_id !== $user->id) {
            abort(403);
        }

        $allowed = ['confirmed', 'in_progress', 'completed'];
        if (! in_array($booking->status, $allowed, true)) {
            return back()->withErrors([
                'dispute' => 'You can a dispute only after confirmation',
            ]);
        }

        if ($booking->dispute()->exists()) {
            return back()->withErrors([
                'dispute' => 'This booking already has a dispute',
            ]);
        }

        $data = $request->validate([
            'reason' => ['required', 'string', 'max:191'],
            'description' => ['nullable', 'string', 'max:3000'],
        ]);

        Dispute::create([
            'booking_id' => $booking->id,
            'opened_by' => $user->id,
            'reason' => $data['reason'],
            'description' => $data['description'] ?? null,
            'status' => 'open',
            'resolution_note' => null,
            'resolved_by' => null,
        ]);

        return redirect()
            ->route('client.bookings.show', $booking)
            ->with('success', 'Dispute opened waiting for solution');
    }
}
