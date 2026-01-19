<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    use HasFactory;

    public function client(){
        return $this->belongsTo(\App\Models\User::class,'client_id');
    }

    public function provider(){
        return $this->belongsTo(\App\Models\User::class,'provider_id');
    }

    public function service(){
        return $this->belongsTo(\App\Models\Service::class);
    }

    public function request(){
        return $this->belongsTo(\App\Models\Request::class);
    }

    public function messages(){
        return $this->hasMany(\App\Models\Message::class);
    }
}
