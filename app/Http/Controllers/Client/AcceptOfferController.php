<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Offer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AcceptOfferController extends Controller
{
    public function __invoke(Request $request, Offer $offer)
    {
        $user = $request->user();
        // load request for ownership
        $offer->load('request');

        if (!$offer->request) {
            abort(404);
        }
        // only the owner client can accept offers
        if ($offer->request->client_id !== $user->id) {
            abort(403);
        }

        // request must be open
        if ($offer->request->status !== 'open') {
            return back()->withErrors(['offer' => 'This request is not open anymore.']);
        }

        // avoid double accept
        if ($offer->status === 'assigned') {
            return back();
        }

        DB::transaction(function () use ($offer) {
            // 1) mark this offer as assigned
            $offer->update(['status' => 'assigned']);

            // 2) reject other offers for same request
            Offer::where('request_id', $offer->request_id)
                ->where('id', '!=', $offer->id)
                ->where('status', 'sent')
                ->update(['status' => 'rejected']);

            // 3) mark request as assigned
            $offer->request->update(['status' => 'assigned']);

            // 4) create Booking
            Booking::create([
                'source' => 'request_offer',
                'service_id' => null,
                'offer_id' => $offer->id,
                'client_id' => $offer->request->client_id,
                'provider_id' => $offer->provider_id,
                'scheduled_at' => null,
                'status' => 'pending',
                'total_amount' => $offer->proposed_price,
                'currency' => 'DZD',
            ]);
        });

        return back()->with('success', 'Offer accepted Booking created!');
    }
}
