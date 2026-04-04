<?php

namespace App\Repositories\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PostLikeRepositoryInterface
{
    public function toggle(int $postId, int $userId, string $type = 'like'): array;
    public function getLikersPaginated(int $postId, int $perPage = 15, ?string $type = null): LengthAwarePaginator;
}
