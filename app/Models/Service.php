<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'category_id',
        'city_id',
        'title',
        'slug',
        'description',
        'base_price',
        'pricing_type',
        'payment_type',
        'status',
        'featured_until',
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
        return $this->hasMany(\App\Models\ServiceMedia::class,'service_id');
    }

    public function coverMedia(){
        return $this->hasOne(\App\Models\ServiceMedia::class)->orderBy('position');
    }

    public function booking(){
        return $this->hasMany(\App\Models\Booking::class);
    }

    public function reviews(){
        return $this->hasMany(\App\Models\Review::class);
    }
}
