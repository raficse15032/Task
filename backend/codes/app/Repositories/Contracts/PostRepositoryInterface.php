<?php

namespace App\Repositories\Contracts;

use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PostRepositoryInterface
{
    public function getFeedPaginated(int $userId, int $perPage = 15): LengthAwarePaginator;
    public function findById(int $id): ?Post;
    public function create(array $data): Post;
    public function update(Post $post, array $data): Post;
    public function delete(Post $post): bool;
    public function getUserPosts(int $userId, int $perPage = 15): LengthAwarePaginator;
}
