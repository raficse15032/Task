<?php

namespace App\Repositories;

use App\Models\PostLike;
use App\Repositories\Contracts\PostLikeRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PostLikeRepository implements PostLikeRepositoryInterface
{
    public function toggle(int $postId, int $userId, string $type = 'like'): array
    {
        $existing = PostLike::where('post_id', $postId)->where('user_id', $userId)->first();

        if ($existing) {
            if ($existing->type === $type) {
                $existing->delete();
                $action = $type === 'like' ? 'unliked' : 'undisliked';
            } else {
                $existing->update(['type' => $type]);
                $action = $type === 'like' ? 'liked' : 'disliked';
            }
        } else {
            PostLike::create(['post_id' => $postId, 'user_id' => $userId, 'type' => $type]);
            $action = $type === 'like' ? 'liked' : 'disliked';
        }

        return [
            'action'          => $action,
            'likes_count'     => PostLike::where('post_id', $postId)->where('type', 'like')->count(),
            'dislikes_count'  => PostLike::where('post_id', $postId)->where('type', 'dislike')->count(),
        ];
    }

    public function getLikersPaginated(int $postId, int $perPage = 15, ?string $type = null): LengthAwarePaginator
    {
        $query = PostLike::with('user:id,first_name,last_name')
            ->where('post_id', $postId);

        if ($type !== null) {
            $query->where('type', $type);
        }

        return $query->orderByDesc('created_at')->paginate($perPage);
    }
}
