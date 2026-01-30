<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use Illuminate\Http\Request;

class OfferController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Filters : status sent | assigned | rejected
        $status = (string) $request->query('status', '');

        $query = Offer::query()
            ->whereHas('request', function ($q) use ($user) {
                $q->where('client_id', $user->id);
            })
            ->with([
                'provider:id,name,avatar_path',
                'request:id,title,status,client_id,city_id,category_id',
                'request.city:id,name',
                'request.category:id,name,slug',
            ])
            ->latest();

        if ($status !== '') {
            $query->where('status', $status);
        }

        $offers = $query->paginate(15)->withQueryString();

        return inertia('Client/Offers/Index', [
            'offers' => $offers,
            'filters' => [
                'status' => $status,
            ],
        ]);
    }
}
