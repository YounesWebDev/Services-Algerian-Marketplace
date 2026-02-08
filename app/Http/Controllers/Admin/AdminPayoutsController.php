<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payout;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPayoutsController extends Controller
{
    public function index(Request $request){
        $status = (string) $request->query('status' , '');
        $q = (string) $request->query('q' , '');

        $query = Payout::query()
            ->with([
                'provider:id,name,email,avatar_path',
            ])
            ->latest('id');
        if($status !== ''){
            $query->where('status' , $status);
        }

        if($q !== ''){
            $query->whereHas('provider', function ($qq) use ($q){
                $qq->where('name' , 'like' , "%{$q}%")
                ->orWhere('email' , 'like' , "%{$q}%");
            });
        }

        $payouts = $query->paginate(12)->withQueryString();

        return Inertia::render('Admin/Payouts/Index', [
            'payouts' => $payouts,
            'filters' => [
                'status' => $status,
                'q' => $q,
            ],
        ]);
    }

    public function show(Payout $payout){
        $payout->load([
            'provider:id,name,email,avatar_path',
        ]);

        return Inertia::render('Admin/Payouts/Show' , [
            'payout' => $payout,
        ]);
    }

    public function markSent(Request $request , Payout $payout){
        if($payout->status === 'sent'){
            return back();
        }

        $payout->loadMissing(['booking.dispute']);
        if ($payout->booking && $payout->booking->dispute && $payout->booking->dispute->status === 'open') {
            return back()->withErrors([
                'payout' => 'This payout is frozen until the dispute is resolved.',
            ]);
        }

        $data = $request->validate([
            'method' => ['required', 'string', 'in:bank_transfer,ccp'],
            'account_name' => ['nullable', 'string', 'max:191'],
            'account_number' => ['nullable', 'string', 'max:191'],
            'cle' => ['nullable', 'string', 'max:191'],
            'reference' => ['nullable','string' ,'max:191'],
        ]);

        if ($data['method'] === 'bank_transfer') {
            $request->validate([
                'account_name' => ['required', 'string', 'max:191'],
                'account_number' => ['required', 'string', 'max:191'],
            ]);
        }

        if ($data['method'] === 'ccp') {
            $request->validate([
                'account_name' => ['required', 'string', 'max:191'],
                'account_number' => ['required', 'string', 'max:191'],
                'cle' => ['required', 'string', 'max:191'],
            ]);
        }

        $meta = is_array($payout->metadata) ? $payout->metadata : (array) $payout->metadata;

        if(!empty($data['reference'])){
            $meta['reference'] = $data['reference'];
        }
        if (!empty($data['account_name'])) {
            $meta['account_name'] = $data['account_name'];
        }
        if (!empty($data['account_number'])) {
            $meta['account_number'] = $data['account_number'];
        }
        if (!empty($data['cle'])) {
            $meta['cle'] = $data['cle'];
        }

        $payout->update([
            'status' => 'sent',
            'sent_at' => now(),
            'method' => $data['method'],
            'metadata' => $meta,
        ]);

        return back()->with('success' , 'Payout sent successfully');
    }


}
