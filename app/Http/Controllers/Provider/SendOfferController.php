<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use App\Models\Request as JobRequest;
use Illuminate\Http\Request;

class SendOfferController extends Controller
{
    public function __invoke(Request $httpRequest, JobRequest $request)
    {
        $user = $httpRequest->user();

        // only open requests can receive offers
        if ($request->status !== 'open') {
            return back()->withErrors([
                'offer' => 'This request is not open anymore.',
            ]);
        }

        // Validate offer form
        $data = $httpRequest->validate([
            'message' => ['required', 'string', 'min:5'],
            'proposed_price' => ['required', 'numeric', 'min:0'],
            'estimated_days' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);

        // one offer per provider per request
        Offer::updateOrCreate(
            [
                'request_id' => $request->id,
                'provider_id' => $user->id,
            ],
            [
                'message' => $data['message'],
                'proposed_price' => $data['proposed_price'],
                'estimated_days' => $data['estimated_days'] ?: null,
                'status' => 'sent',
            ]
        );

        return back()->with('success', 'Offer sent successfully.');
    }
}
