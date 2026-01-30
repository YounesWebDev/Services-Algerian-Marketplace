<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\FeeSetting;
use App\Models\Payment;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                        'provider:id,name,avatar_path',
                        'offer:id,request_id,proposed_price,status',
                        'offer.request:id,title',
                        'service:id,title,slug',
                        'payment:id,booking_id,status,payment_type,amount,platform_fee,provider_amount,paid_at',
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

    public function show(Request $request , Booking $booking)
    {
        $user = $request->user();

        // only owner client
        if($booking->client_id !== $user->id){
            abort(403);
        }

        $booking->load([
            'provider:id,name,avatar_path',
            'offer:id,request_id,proposed_price,status',
            'offer.request:id,title',
            'service:id,title,slug',
            'payment:id,booking_id,status,payment_type,amount,platform_fee,provider_amount,paid_at,metadata',
        ]);

        // fee settings for showing calculated values 
        $fee = FeeSetting::query()->where('active' , 1)->latest()->first();

        return Inertia::render('Client/Bookings/Show',[
            'booking' => $booking,
            'fee' => $fee ? [
                'commission_rate' => (string) $fee->commission_rate,
                'fixed_fee' => $fee->fixed_fee !== null ? (string) $fee->fixed_fee : null ,
            ] : null,
        ]);
    }

    //  Client books from a Service
    public function storeFromService(Request $request, Service $service)
    {
        $user = $request->user();

        // Only approved services can be booked
        if ($service->status !== 'approved') {
            return back()->withErrors([
                'booking' => 'This service is not available for booking yet.',
            ]);
        }

        // Optional schedule
        $data = $request->validate([
            'scheduled_at' => ['nullable', 'date'],
        ]);

        Booking::create([
            'source' => 'service',
            'service_id' => $service->id,
            'offer_id' => null,
            'client_id' => $user->id,
            'provider_id' => $service->provider_id,
            'scheduled_at' => $data['scheduled_at'] ?? null,
            'status' => 'pending',
            'total_amount' => $service->base_price ?? 0, // if quote
            'currency' => 'DZD',
        ]);

        return redirect()
            ->route('client.bookings.index')
            ->with('success', 'Booking created.');
    }

    // client chooses payment type: 
    //     online => create pending payment and ask for OTP(000000) ON confirm
    //     cash create pending payment but provider must confirm later
    public function payment(Request $request , Booking $booking)
    {
        $user = $request->user();

        // only owner client 
        if($booking->client_id !== $user->id){
            abort(403);
        }

        //only pending/confirmed bookings can be paid 
        if(!in_array($booking->status,['pending' , 'confirmed'] , true)) {
            return back()->withErrors([
                'payment' => 'This booking cannot be paid in its current status',
            ]);
        }

        if (Payment::where('booking_id', $booking->id)->exists()) {
            return back()->withErrors([
                'payment' => 'Payment already exists for this booking',
            ]);
        }

        $data = $request->validate([
            'payment_type' => ['required', 'in:cash,online'],
            'card_number' => ['nullable', 'string', 'digits:16'],
            'expiry_month' => ['nullable', 'integer', 'min:1', 'max:12'],
            'expiry_year' => ['nullable', 'integer', 'min:2026', 'max:2100'],
            'cvc' => ['nullable', 'string', 'digits:3'],
        ]);

        // if online , require the card fields
        if($data['payment_type'] === 'online'){
            if(
                empty($data['card_number']) ||
                empty($data['expiry_month']) ||
                empty($data['expiry_year']) ||
                empty($data['cvc'])
            ){
                return back()->withErrors([
                    'payment' => 'All fields are required',
                ])->withInput();
            }
        }

        $fee = FeeSetting::query()->where('active', 1)->latest()->first();
        $commission = $fee ? (float) $fee->commission_rate : 0.0;
        $fixed = $fee && $fee->fixed_fee !== null ? (float) $fee->fixed_fee : 0.0;

        $amount = (float) $booking->total_amount;
        $platformFee = round(($amount * $commission) + $fixed, 2);
        if ($platformFee < 0) $platformFee = 0;

        $providerAmount = round($amount - $platformFee, 2);
        if ($providerAmount < 0) $providerAmount = 0;


        DB::transaction(function () use ($booking, $data, $amount, $platformFee, $providerAmount): void {
            // one payment per booking
            $payment = Payment::where('booking_id', $booking->id)->first();

            if ($payment) {
                return;
            }

            $metadata = [];

            if($data['payment_type'] === 'online'){
                $metadata = [
                    'card_number' => $data['card_number'],
                    'expiry_month' => $data['expiry_month'],
                    'expiry_year' => $data['expiry_year'],
                    'cvc' => $data['cvc'],
                    'phone' => '+0000000000',
                ];
            }else{
                $metadata = [
                    'cash_note' => 'Waiting provider confirmation',
                ];
            }

            Payment::create([
                'booking_id' => $booking->id,
                'payer_id' => $booking->client_id,
                'payment_type' => $data['payment_type'], // cash | online
                'online_provider' => $data['payment_type'] === 'online' ? 'fake_getway' : null,
                'amount' => $amount,
                'platform_fee' => $platformFee,
                'provider_amount' => $providerAmount,
                'status' => 'pending',
                'paid_at' => null,
                'metadata' => $metadata,
            ]);
        });

        // if online => go to confirm step (OTP screen)
        //if cash => just show message
        if($data['payment_type'] !== 'online'){
            return redirect()
                    ->route('client.bookings.show', $booking->id)
                    ->with('success' , 'confirmation code sent to +0000000000 . Enter it to confirm');
        }

        return redirect()
                ->route('client.bookings.show', $booking->id)
                ->with('success' , 'Waiting for provider to confirm cash payment.');
    }

    // online otp confirm 
    // otp always : 000000

    public function confirmPayment(Request $request , Booking $booking)
    {
        $user = $request->user();

        if($booking->client_id !== $user->id){
            abort(403);
        }

        $data = $request->validate([
            'otp' => ['required' , 'string', 'size:6'],
        ]);

        $payment = Payment::where('booking_id', $booking->id)->first();

        if(!$payment){
            return back()->withErrors([
                'payment' => 'Payment not found for this booking',
            ]);
        }
        
        if($payment->payment_type !== 'online'){
            return back()->withErrors([
                'payment' => 'This booking is not using online payment',
            ]);
        }

        if($data['otp'] !== '000000'){
            return back()->withErrors([
                'otp' => 'Invalid code',
            ])->withInput();
        }

        $payment->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        // auto confirm booking after successful online payment
        if($booking->status === 'pending'){
            $booking->update(['status' => 'confirmed']);
        }

        return redirect()
                ->route('client.bookings.show' , $booking->id)
                ->with('success' , 'Payment confirmed successfully');
    }
}

