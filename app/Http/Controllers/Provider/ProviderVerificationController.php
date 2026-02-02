<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\ProviderVerification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProviderVerificationController extends Controller
{
    public function show(Request $request){
        $user = $request->user();

        if(!$user || $user->role !== 'provider'){
            abort(403);
        }

        $verification = ProviderVerification::query()
            ->where('provider_id' , $user->id)
            ->latest()
            ->first();

        return Inertia::render('Provider/Verification',[
            'verification' => $verification ? [
                'id' => $verification->id,
                'doc_type' => $verification->doc_type,
                'doc_number' => $verification->doc_number,
                'doc_path' => $verification->doc_path,
                'status' => $verification->status,
                'created_at' => $verification->created_at,
                'updated_at' => $verification->updated_at,
            ] : null , 
            'is_verified' => (bool) optional($user->profile)->verified_at,
        ]);
    }

    public function store(Request $request){
        $user = $request->user();

        // If already verified , no need to submit again
        if(optional($user->profile)->verified_at) {
            return redirect()->route('provider.verification.show');
        }

        $latest = ProviderVerification::query()
            ->where('provider_id',$user->id)
            ->latest()
            ->first();

        // block if there is already a pending submission
        if($latest && $latest->status === 'pending'){
            return back()->withErrors([
                'verification' => 'You already have a pending verification request',
            ]);
        }

        $data = $request->validate([
            'doc_type' => ['required' , 'string' , 'max:191'],
            'doc_number' => ['required' , 'string' , 'max:191'],
            'doc_file' => ['required' , 'file' , 'mimes:png,jpg,jpeg,webp,pdf' , 'max:4096'],
        ]);

        // Store document
        $file = $request->file('doc_file');
        $path = $file->store("verifications/providers/{$user->id}",'public');

        // If latest is rejected, we can update it or create new row
        // we will create a new row to keep history clean
        ProviderVerification::create([
            'provider_id' => $user->id,
            'doc_type' => $data['doc_type'],
            'doc_number' => $data['doc_number'],
            'doc_path' => $path,
            'status' => 'pending',
            'reviewed_by' => null,
        ]);

        return redirect()
            ->route('provider.verification.show')
            ->with('success' , 'Verification submitted. please wait for admin review.');
    }
}
