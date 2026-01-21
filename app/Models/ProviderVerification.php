<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProviderVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'doc_type',
        'doc_number',
        'doc_path',
    ];

    public function provider(){
        return $this->belongsTo(\App\Models\User::class,'provider_id');
    }

    public function reviewer(){
        return $this->belongsTo(\App\Models\User::class, 'reviewed_by');
    }
}
