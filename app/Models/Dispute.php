<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dispute extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'reason',
        'description',
    ];


    public function booking(){
        return $this->belongsTo(\App\Models\Booking::class);
    }

    public function opener(){
        return $this->belongsTo(\App\Models\User::class,'opened_by');
    }

    public function resolver(){
        return $this->belongsTo(\App\Models\User::class,'resolved_by');
    }
}
