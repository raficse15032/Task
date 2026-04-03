<?php

namespace App\Repositories;

use App\Models\Comment;
use App\Repositories\Contracts\CommentRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CommentRepository implements CommentRepositoryInterface
{
    public function getByPostPaginated(int $postId, int $perPage = 15): LengthAwarePaginator
    {
        return Comment::with(['user:id,first_name,last_name'])
            ->withCount('likes', 'dislikes', 'replies')
            ->where('post_id', $postId)
            ->whereNull('parent_id')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function getRepliesPaginated(int $parentId, int $perPage = 15): LengthAwarePaginator
    {
        return Comment::with(['user:id,first_name,last_name'])
            ->withCount('likes', 'dislikes', 'replies')
            ->where('parent_id', $parentId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function findById(int $id): ?Comment
    {
        return Comment::with(['user:id,first_name,last_name'])
            ->withCount('likes', 'dislikes', 'replies')
            ->find($id);
    }

    public function create(array $data): Comment
    {
        return Comment::create($data);
    }

    public function update(Comment $comment, array $data): Comment
    {
        $comment->update($data);
        return $comment->fresh(['user:id,first_name,last_name']);
    }

    public function delete(Comment $comment): bool
    {
        return $comment->delete();
    }
}
