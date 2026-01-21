<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'wilaya_code',
    ];

    public function services(){
        return $this->hasMany(\App\models\Service::class);
    }

    public function requests(){
        return $this->hasMany(\App\Models\Request::class);
    }
}
