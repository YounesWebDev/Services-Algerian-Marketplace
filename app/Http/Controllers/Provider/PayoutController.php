<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Payout;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayoutController extends Controller
{
    public function index(Request $request){
        $user = $request->user();

        $status = (string) $request->query('status', ''); // pending|sent
        $q = (string) $request->query('q' , '');

        $query = Payout::query()
            ->where('provider_id' , $user->id)
            ->latest('id');
        
        if($status !== ''){
            $query->where('status' , $status);
        }
        
        if($q !== ''){
            $query->where(function ($qq) use ($q){
                $qq->where('method' , 'like' , "%{$q}%")
                    ->orWhere('metadata->reference' , 'like' , "%{$q}%");
            });
        }

        $payouts = $query->paginate(12)->withQueryString();

        $earningsQuery = Payment::query()
            ->where('status', 'paid')
            ->whereHas('booking', function ($qq) use ($user) {
                $qq->where('provider_id', $user->id)
                   ->where('status', 'completed');
            });

        $onlineEarnings = (clone $earningsQuery)
            ->where('payment_type', 'online')
            ->sum('provider_amount');

        $cashEarnings = (clone $earningsQuery)
            ->where('payment_type', 'cash')
            ->sum('provider_amount');

        $totalEarnings = $onlineEarnings + $cashEarnings;

        return Inertia::render('Provider/Payouts/Index'  , [
            'payouts' => $payouts,
            'filters' => [
                'status' => $status,
                'q' => $q,
            ],
            'earnings' => [
                'online' => $onlineEarnings,
                'cash' => $cashEarnings,
                'total' => $totalEarnings,
            ],
        ]);
    }

    public function show(Request $request , Payout $payout){
        $user = $request->user();

        if((int) $payout->provider_id !== (int) $user->id){
            abort(403);
        }

        return Inertia::render('Provider/Payouts/Show',[
            'payout' => $payout,
        ]);                                                                         
    }
}
