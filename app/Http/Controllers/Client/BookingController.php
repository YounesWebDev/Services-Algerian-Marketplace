<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $status = (string) $request->query('status' , '');

        $query = Booking::query()
                    ->where('client_id' , $user->id)
                    ->with([
                        'payment:id,booking_id,status',
                        'provider:id,name,avatar_path',
                        'offer:id,request_id,proposed_price,status',
                        'offer.request:id,title',
                        'service:id,title,slug',
                    ])
                    ->latest();

        if($status !== ''){
            $query->where('status',$status);
        }

        $bookings = $query->paginate(15)->withQueryString();

        return Inertia::render('Client/Bookings/Index',[
            'bookings' => $bookings,
            'filters' => [
                'status' => $status,
            ]
        ]);
    }
}
