<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'chat_id',
        'body',
        'attachment_path',
    ];

    public function chat(){
        return $this->belongsTo(\App\Models\Chat::class);
    }

    public function sender(){
        return $this->belongsTo(\App\Models\User::class, 'sender_id');
    }
}
