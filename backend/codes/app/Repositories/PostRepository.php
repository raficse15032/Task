<?php

namespace App\Repositories;

use App\Models\Comment;
use App\Models\Post;
use App\Models\PostLike;
use App\Repositories\Contracts\PostRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PostRepository implements PostRepositoryInterface
{
    public function getFeedPaginated(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return Post::where(function ($query) use ($userId) {
                $query->where('visibility', 'public')
                    ->orWhere('user_id', $userId);
            })
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function findById(int $id): ?Post
    {
        return Post::find($id);
    }

    public function create(array $data): Post
    {
        return Post::create($data);
    }

    public function update(Post $post, array $data): Post
    {
        $post->update($data);
        return $post->fresh();
    }

    public function delete(Post $post): bool
    {
        return $post->delete();
    }

    public function getUserPosts(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return Post::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function syncCommentsCount(int $postId): void
    {
        Post::whereKey($postId)->update([
            'comments_count' => Comment::where('post_id', $postId)->count(),
        ]);
    }

    public function syncReactionCounts(int $postId): array
    {
        $counts = [
            'likes_count' => PostLike::where('post_id', $postId)->where('type', 'like')->count(),
            'dislikes_count' => PostLike::where('post_id', $postId)->where('type', 'dislike')->count(),
        ];

        Post::whereKey($postId)->update($counts);

        return $counts;
    }
}
