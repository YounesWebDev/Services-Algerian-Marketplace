<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Request as JobRequest;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function create(Request $request){
        $type = (string) $request->query('type' , '');
        $id = (int) $request->query('id' , 0);

        if(!in_array($type,['service','provider' , 'request'],true) || $id <= 0){
            abort(403);
        }

        // load the target
        $targetTitle = null;

        if($type === 'service'){
            $service = Service::query()->select('id' , 'title')->findOrFail($id);
            $targetTitle = $service->title;
        }elseif($type === 'provider'){
                $provider = User::query()
                        ->select('id' , 'name' , 'role')
                        ->where('role' , 'provider')
                        ->findOrFail($id);
                $targetTitle = $provider->name;
            }else{
                $job = JobRequest::query()->select('id','title')->findOrFail($id);
                $targetTitle = $job->title;
            }

            return Inertia::render('Reports/Create',[
                'target' => [
                    'type' => $type,
                    'id' => $id,
                    'title' => $targetTitle,
                ],
            ]);
        }

    public function store(Request $request){
        $user = $request->user();

        $data = $request->validate([
            'target_type' => ['required' , 'in:service,provider,request'],
            'target_id' => ['required' , 'integer' , 'min:1'],
            'reason' => ['required' , 'string' , 'max:191'],
            'description' => ['nullable' , 'string' , 'max:3000'],
            ]);

            // avoid spam duplicates
            $alreadyOpen = Report::query()
                ->where('reporter_id' , $user->id)
                ->where('target_type' , $data['target_type'])
                ->where('target_id' , $data['target_id'])
                ->where('status','open')
                ->exists();

            if($alreadyOpen){
                return back()->withErrors([
                    'report' => 'You already reported this. Waiting for review',
                ]);
            }

            Report::create([
                'reporter_id' => $user->id,
                'target_type' => $data['target_type'], 
                'target_id' => $data['target_id'], 
                'reason' => $data['reason'], 
                'description' => $data['description'] ?? null,
                'status' => 'open',
            ]);

            return redirect()->route('dashboard')
                    ->with('success','Report submitted successfully waiting for out team to review it');
        }
}
