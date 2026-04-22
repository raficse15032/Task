<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'user',
        'content',
        'image_path',
        'visibility',
    ];

    protected function casts(): array
    {
        return [
            'user' => 'array',
            'comments_count' => 'integer',
            'likes_count' => 'integer',
            'dislikes_count' => 'integer',
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(PostLike::class)->where('type', 'like');
    }

    public function dislikes(): HasMany
    {
        return $this->hasMany(PostLike::class)->where('type', 'dislike');
    }
}
