<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'target_type',
        'target_id',
        'reason',
    ];


    public function reporter(){
        return $this->belongsTo(\App\Models\User::class,'reporter_id');
    }
}
