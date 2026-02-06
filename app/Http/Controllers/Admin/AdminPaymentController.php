<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPaymentController extends Controller
{
    public function index(Request $request){
        $q = (string) $request->query('q', '');
        $status = (string) $request->query('status' ,''); 
        $type = (string) $request->query('type' , '');


        $query = Payment::query()
                ->with([
                    'booking:id,source,service_id,offer_id,client_id,provider_id,status,total_amount,currency',
                    'booking.client:id,name,email,avatar_path',
                    'booking.provider:id,name,email,avatar_path',
                ])
                ->latest();

        if($status !== ''){
            $query->where('status' ,$status);
        }

        if($type !== ''){
            $query->where('payment_type',$type);
        }

        if($q !== ''){
            $query->whereHas('booking.client' , function ($qq) use ($q) {
                $qq->where('name' , 'like' , "%{$q}%")
                    ->orWhere('email' , 'like' , "%{$q}%");
            })->orWhereHas('booking.provider' , function ($qq) use ($q) {
                $qq->where('name' , 'like' , "%{$q}%")
                    ->orWhere('email' , 'like' , "%{$q}%");
            });
        }

        $payments = $query->paginate(12)->withQueryString();

        return Inertia::render('Admin/Payments/Index' , [
            'payments'=> $payments,
            'filters' => [
                'status' => $status,
                'type' => $type,
                'q' => $q,
            ],
        ]);
    }

    public function show(Payment $payment){
        $payment->load([
            'booking:id,source,service_id,offer_id,client_id,provider_id,status,total_amount,currency',
            'booking.client:id,name,email,avatar_path',
            'booking.provider:id,name,email,avatar_path',
            'booking.service:id,title,slug',
            'booking.offer:id,request_id,proposed_price',
            'booking.offer.request:id,title',
        ]);

        return Inertia::render('Admin/Payments/Show' , [
            'payment' => $payment,
        ]);
    }
}
