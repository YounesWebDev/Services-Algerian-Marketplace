<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Payout;
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

        return Inertia::render('Provider/Payouts/Index'  , [
            'payouts' => $payouts,
            'filters' => [
                'status' => $status,
                'q' => $q,
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
