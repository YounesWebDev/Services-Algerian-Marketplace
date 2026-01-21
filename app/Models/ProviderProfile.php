<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProviderProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'bio',
        'address',
        'company_name',
    ];

    public function user(){
        return $this->belongsTo(\App\Models\User::class);
    }
}
