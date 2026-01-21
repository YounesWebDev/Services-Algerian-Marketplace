<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
    'category_id',
    'city_id',
    'title',
    'slug',
    'description',
    'base_price',
    'pricing_type',
    ];


    public function provider(){
        return $this->belogsTo(\App\Models\User::class,'provder_id');
    }

    public function category(){
        return $this->belongsTo(\App\Models\Category::class);
    }

    public function city(){
        return $this->belongsTo(\App\models\City::class);
    }

    public function media(){
        return $this->belongsTo(\App\Models\ServiceMedia::class);
    }

    public function booking(){
        return $this->hasMany(\App\Models\Booking::class);
    }

    public function reviews(){
        return $this->hasMany(\App\Models\Review::class);
    }
}
