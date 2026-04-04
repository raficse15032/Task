<?php

namespace App\Repositories\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CommentLikeRepositoryInterface
{
    public function toggle(int $commentId, int $userId, string $type = 'like'): array;
    public function getLikersPaginated(int $commentId, int $perPage = 15, ?string $type = null): LengthAwarePaginator;
}
