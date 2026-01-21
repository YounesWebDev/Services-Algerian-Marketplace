<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'payment_type',
        'online_provider',
        'metadata',
    ];

    public function booking(){
        return $this->belongsTo(\App\Models\Booking::class);
    }

    public function payer(){
        return $this->belongsTo(\App\Models\User::class, 'payer_id');
    }
}
