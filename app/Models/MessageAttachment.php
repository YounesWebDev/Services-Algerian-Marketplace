<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MessageAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'path',
        'original_name',
        'type',
        'size_bytes',
    ];

    public function message()
    {
        return $this->belongsTo(\App\Models\Message::class);
    }
}
