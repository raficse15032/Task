<?php

namespace App\Repositories;

use App\Models\CommentLike;
use App\Repositories\Contracts\CommentLikeRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CommentLikeRepository implements CommentLikeRepositoryInterface
{
    public function toggle(int $commentId, int $userId, string $type = 'like'): array
    {
        $existing = CommentLike::where('comment_id', $commentId)->where('user_id', $userId)->first();

        if ($existing) {
            if ($existing->type === $type) {
                $existing->delete();
                $action = $type === 'like' ? 'unliked' : 'undisliked';
            } else {
                $existing->update(['type' => $type]);
                $action = $type === 'like' ? 'liked' : 'disliked';
            }
        } else {
            CommentLike::create(['comment_id' => $commentId, 'user_id' => $userId, 'type' => $type]);
            $action = $type === 'like' ? 'liked' : 'disliked';
        }

        return [
            'action'          => $action,
            'likes_count'     => CommentLike::where('comment_id', $commentId)->where('type', 'like')->count(),
            'dislikes_count'  => CommentLike::where('comment_id', $commentId)->where('type', 'dislike')->count(),
        ];
    }

    public function getLikersPaginated(int $commentId, int $perPage = 15): LengthAwarePaginator
    {
        return CommentLike::with('user:id,first_name,last_name')
            ->where('comment_id', $commentId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
