<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'path',
        'type',
        'position',
    ];

    public function service(){
        return $this->belongsTo(\App\Models\Service::class);
    }
}
