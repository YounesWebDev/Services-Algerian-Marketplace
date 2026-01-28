<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingShowController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request , Booking $booking)
    {
        $user = $request->user();

        // Only client can view
        if($booking->client_id !== $user->id){
            abort(403);
        }

        $booking->load([
            'payment:id,booking_id,status,paid_at',
            'provider:id,name,avatar_path',
            'offer:id,request_id,proposed_price,status',
            'offer.request:id,title,status',
            'service:id,title,slug',
        ]);

        return Inertia::render('Client/Bookings/Show',[
            'booking' => $booking,
            'payment' =>$booking->payment,
        ]);
    }
}
