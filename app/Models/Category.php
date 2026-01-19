<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    public function parent(){
        return $this->belongsTo(self::class,'parent_id');
    }

    public function children(){
        return $this->hasMany(self::class,'parent_id');
    }

    public function services(){
        return $this->hasMany(\App\Models\Service::class);
    }

    public function requests(){
        return $this->hasMany(\App\Models\Request::class);
    }
}
