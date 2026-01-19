<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Request extends Model
{
    use HasFactory;

    public function client(){
        return $this->belongsTo(\App\Models\User::class,'client_id');
    }

    public function category(){
        return $this->belongsTo(\App\Models\Category::class);
    }

    public function city(){
        return $this->belongsTo(\App\Models\City::class);
    }

    public function media(){
        return $this->hasMany(\App\Models\RequestMedia::class);
    }

    public function offers(){
        return $this->hasMany(\App\Models\Offer::class);
    }

    public function chats(){
        return $this->hasMany(\App\Models\Chat::class);
    }
}
