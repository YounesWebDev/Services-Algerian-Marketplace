<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\Request as JobRequest;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request){
        $status = (string) $request->query('status' , 'open');

        $query = Report::query()
                ->with(['reporter:id,name,avatar_path'])
                ->latest();

        if($status !== ''){
            $query->where('status' , $status);
        }

        $reports = $query->paginate(12)->withQueryString();

        //Attach target titles
        $reports->getCollection()->transform(function($r){
            $r->target_title = $this->targetTitle($r->target_type,(int) $r->target_id);
            return $r;
        });

        return Inertia::render('Admin/Reports/Index' , [
            'reports' => $reports,
            'filters' => [
                'status' => $status,
            ],
        ]);
    }

    public function show(Report $report){
        $report->load(['reporter:id,name,avatar_path']);

        $targetTitle = $this->targetTitle($report->target_type,(int) $report->target_id);

        return Inertia::render('Admin/Reports/Show' , [
            'report' => $report,
            'targetTitle' => $targetTitle,
        ]);
    }

    public function close(Request $request , Report $report){
        if($report->status !== 'open'){
            return back()->withErrors([
                'report' => 'This report is already closed',
            ]);
        }

        $report->update([
            'status' => 'closed',
        ]);

        return back()->with('success' , 'Report Closed');
    }

    public function targetTitle(string $type , int $id){
        if($type === 'service')
            return Service::query()->whereKey($id)->value('title');

        if($type === 'provider')
            return User::query()->whereKey($id)->value('name');

        if($type === 'request')
            return JobRequest::query()->whereKey($id)->value('title');

        return null;

    }
}
