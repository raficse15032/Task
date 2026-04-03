<?php

namespace App\Repositories;

use App\Models\Post;
use App\Repositories\Contracts\PostRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PostRepository implements PostRepositoryInterface
{
    public function getFeedPaginated(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return Post::with(['user:id,first_name,last_name'])
            ->withCount('likes', 'dislikes', 'comments')
            ->where(function ($query) use ($userId) {
                $query->where('visibility', 'public')
                    ->orWhere('user_id', $userId);
            })
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function findById(int $id): ?Post
    {
        return Post::with(['user:id,first_name,last_name'])
            ->withCount('likes', 'dislikes', 'comments')
            ->find($id);
    }

    public function create(array $data): Post
    {
        return Post::create($data);
    }

    public function update(Post $post, array $data): Post
    {
        $post->update($data);
        return $post->fresh(['user:id,first_name,last_name']);
    }

    public function delete(Post $post): bool
    {
        return $post->delete();
    }

    public function getUserPosts(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return Post::with(['user:id,first_name,last_name'])
            ->withCount('likes', 'dislikes', 'comments')
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
