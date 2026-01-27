<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'source',
        'service_id',
        'offer_id',
        'client_id',
        'provider_id',
        'scheduled_at',
        'status',
        'total_amount',
        'currency',
    ];

    public function client()
    {
        return $this->belongsTo(\App\Models\User::class, 'client_id');
    }

    public function provider()
    {
        return $this->belongsTo(\App\Models\User::class, 'provider_id');
    }

    public function service()
    {
        return $this->belongsTo(\App\Models\Service::class);
    }

    public function offer()
    {
        return $this->belongsTo(\App\Models\Offer::class);
    }

    public function payment()
    {
        return $this->hasOne(\App\Models\Payment::class);
    }

    public function review()
    {
        return $this->hasOne(\App\Models\Review::class);
    }

    public function dispute()
    {
        return $this->hasOne(\App\Models\Dispute::class);
    }
}
