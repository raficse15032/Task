<?php

namespace App\Repositories\Contracts;

use App\Models\Comment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CommentRepositoryInterface
{
    public function getByPostPaginated(int $postId, int $perPage = 15): LengthAwarePaginator;
    public function getRepliesPaginated(int $parentId, int $perPage = 15): LengthAwarePaginator;
    public function findById(int $id): ?Comment;
    public function create(array $data): Comment;
    public function update(Comment $comment, array $data): Comment;
    public function delete(Comment $comment): bool;
}
