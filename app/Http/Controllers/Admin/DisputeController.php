<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dispute;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DisputeController extends Controller
{
    public function index(Request $request){
        $status = (string) $request->query('status' , 'open');

        $query = Dispute::query()
            ->with([
                'booking:id,source,service_id,offer_id,client_id,provider_id,status,total_amount,currency,created_at',
                'booking.service:id,title,slug',
                'booking.offer:id,request_id,proposed_price',
                'booking.offer.request:id,title',
                'booking.client:id,name,avatar_path',
                'booking.provider:id,name,avatar_path',
                'opener:id,name,avatar_path',
            ])
            ->latest();

            if($status !== ''){
                $query->where('status' , $status);
            }

            $disputes = $query->paginate(12)->withQueryString();

            return Inertia::render('Admin/Disputes/Index' , [
                'disputes' => $disputes,
                'filters' => [
                    'status' => $status,
                ],
            ]);
    }

    public function show(Dispute $dispute){
        $dispute->load([
            'booking:id,source,service_id,offer_id,client_id,provider_id,status,total_amount,currency,created_at',
            'booking.service:id,title,slug',
            'booking.offer:id,request_id,proposed_price',
            'booking.offer.request:id,title',
            'booking.client:id,name,avatar_path',
            'booking.provider:id,name,avatar_path',
            'opener:id,name,avatar_path',
            'resolver:id,name,avatar_path',
        ]);

        return Inertia::render('Admin/Disputes/Show',[
            'dispute' => $dispute,
        ]);
    }

    public function resolve(Request $request , Dispute $dispute){
        // only open disputes can be resolved
        if($dispute->status !== 'open'){
            return back()->withErrors([
                'dispute' => 'This dispute is already resolved',
            ]);
        }

        $data = $request->validate([
            'resolution_note' => ['required' , 'string' , 'max:3000'],
        ]);

        $dispute->update([
            'status' => 'resolved' , 
            'resolution_note' => $data['resolution_note'],
            'resolved_by' => $request->user()->id,
        ]);

        return back()->with('success','Dispute resolved');
    }
}
