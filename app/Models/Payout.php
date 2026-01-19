<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payout extends Model
{
    use HasFactory;

    public function provider(){
        return $this->belongsTo(\App\Models\User::class,'provider_id');
    }
}
