<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServicesController extends Controller
{
    public function index(Request $request)
    {
        $q = (string) $request->query('q', '');
        $status = (string) $request->query('status', '');
        $paymentType = (string) $request->query('payment_type', '');
        $pricingType = (string) $request->query('pricing_type', '');

        $query = Service::query()
            ->with([
                'provider:id,name,email,status,avatar_path',
                'category:id,name,slug',
                'city:id,name',
                'media:id,service_id,path,type,position',
            ])
            ->latest();

        if ($q !== '') {
            $query->where(function ($w) use ($q) {
                $w->where('title', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%")
                    ->orWhereHas('provider', function ($p) use ($q) {
                        $p->where('name', 'like', "%{$q}%")
                            ->orWhere('email', 'like', "%{$q}%");
                    });
            });
        }

        if ($status !== '') {
            $query->where('status', $status);
        }

        if ($paymentType !== '') {
            $query->where('payment_type', $paymentType);
        }

        if ($pricingType !== '') {
            $query->where('pricing_type', $pricingType);
        }


        $services = $query->paginate(12)->withQueryString();

        return Inertia::render('Admin/Services/Index', [
            'services' => $services,
            'filters' => [
                'q' => $q,
                'status' => $status,
                'payment_type' => $paymentType,
                'pricing_type' => $pricingType,
            ],
        ]);
    }

    public function show(Request $request, Service $service)
    {
        $service->load([
            'provider:id,name,email,status,avatar_path',
            'category:id,name,slug',
            'city:id,name',
            'media:id,service_id,path,type,position',
        ]);

        return Inertia::render('Admin/Services/Show', [
            'service' => $service,
        ]);
    }

    public function approve(Request $request, Service $service)
    {
        if ($service->provider && $service->provider->status !== 'active') {
            return back()->withErrors([
                'service' => 'Cannot approve , provider is inactive',
            ]);
        }

        $service->update(['status' => 'approved']);

        return back()->with('success', 'Service approved');
    }

    public function reject(Request $request, Service $service)
    {
        $service->update(['status' => 'rejected']);

        return back()->with('success', 'Service rejected');
    }

    public function hide(Request $request, Service $service)
    {
        $service->update(['status' => 'hidden']);

        return back()->with('success', 'Service hidden');
    }
}
