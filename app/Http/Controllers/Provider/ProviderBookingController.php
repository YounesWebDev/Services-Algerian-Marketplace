<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProviderBookingController extends Controller
{
    public function index(Request $request){
        $user = $request->user();

        $status = (string) $request->query('status' , '');

        $query = Booking::query()
                ->where('provider_id' , $user->id)
                ->with([
                    'client:id,name,avatar_path',
                    'service:id,title,slug',
                    'offer:id,request_id,proposed_price,status',
                    'offer.request:id,title',
                    'payment:id,booking_id,status,payment_type,amount,platform_fee,provider_amount,paid_at',
                ])
                ->latest();
        if($status !== ''){
            $query->where('status' , $status);
        }

        $bookings = $query->paginate(12)->withQueryString();

        return Inertia::render('Provider/Bookings/Index' , [
            'bookings' => $bookings,
            'filters' => [
                'status' => $status,
            ],
        ]);
    }

    public function show(Request $request , Booking $booking){
        $user = $request->user();

        // only owner provider
        if($booking->provider_id !== $user->id){
            abort(403);
        }

        $booking->load([
            'client:id,name,avatar_path',
            'provider:id,name,avatar_path',
            'service:id,title,slug',
            'offer:id,request_id,proposed_price,status',
            'offer.request:id,title',
            'payment:id,booking_id,status,payment_type,amount,platform_fee,provider_amount,paid_at,metadata',
        ]);

        return Inertia::render('Provider/Bookings/Show',[
            'booking' => $booking,
        ]);
    }

    // provider pudates booking status
    // allowed transition : pending -> confirmed or cancelled       confirmed -> in progress or cancelled    in progress -> completed
    public function updateStatus(Request $request , Booking $booking){
        $user = $request->user();

        // only booking provider 
        if($booking->provider_id !== $user->id){
            abort(403);
        }

        $data = $request->validate([
            'status' => ['required' , 'in:confirmed,in_progress,completed,cancelled'],
        ]);

        $newStatus = $data['status'];
        $current = $booking->status;

        // Allowed transitions
        $allowed = [
            'pending' => ['confirmed' , 'cancelled'],
            'confirmed' => ['in_progress' , 'cancelled'],
            'in_progress' => ['completed'],
            'completed' => [],
            'cancelled' => [],
        ];

        if(!isset($allowed[$current]) || !in_array($newStatus , $allowed[$current] , true)){
            return back()->withErrors([
                'status' => "You can't change status from {$current} to {$newStatus}",
            ]);
        }

        if ($newStatus === 'in_progress') {
            $payment = Payment::where('booking_id', $booking->id)->first();

            if (! $payment || $payment->status !== 'paid') {
                return back()->withErrors([
                    'status' => 'Booking cannot start until the client completes payment.',
                ]);
            }
        }

        $booking->update([
            'status' => $newStatus,
        ]);

        if ($newStatus === 'cancelled' && $booking->source === 'request_offer') {
            $booking->loadMissing(['offer.request']);

            if ($booking->offer?->request) {
                $booking->offer->request->update([
                    'status' => 'open',
                ]);
            }
        }

        return back()->with('success' , 'Booking status updated');
    }

    // provider confirms cash payment
    public function confirmCash(Request $request , Booking $booking){
        $user = $request->user();

        // only booking provider
        if($booking->provider_id !== $user->id){
            abort(403);
        }

        $payment = Payment::where('booking_id' , $booking->id)->first();

        if(!$payment){
            return back()->withErrors([
                'payment' => 'Payment not found for this booking.',
            ]);
        }

        if($payment->payment_type !== 'cash'){
            return back()->withErrors([
                'payment' => 'This booking is not using cash payment',
            ]);
        }

        if($payment->status !== 'pending') {
            return back()->withErrors([
                'payment' => 'This cash payment is already confirmed',
            ]);
        }

        $payment->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        if($booking->status === 'pending') {
            $booking->update([
                'status' => 'confirmed',
            ]);
        }

        return back()->with('success' , 'Cash payment confirmed successfully');
    }
}
