<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Offer extends Model
{
    use HasFactory;

    public function request(){
        return $this->belongsTo(\App\Models\Request::class);
    }

    public function provider(){
        return $this->belongsTo(\App\Models\User::class,'provider_id');
    }

    public function booking(){
        return $this->hasOne(\App\Models\Booking::class);
    }
}
