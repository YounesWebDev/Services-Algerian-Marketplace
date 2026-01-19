<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    public function booking(){
        return $this->belongsTo(\App\Models\Booking::class,);
    }

    public function service(){
        return $this->belongsTo(\App\Models\Service::class);
    }

    public function client(){
        return $this->belongsTo(\App\Models\User::class, 'client_id');
    }

    public function provider(){
        return $this->belongsTo(\App\Models\User::class,'provider_id');
    }
}
