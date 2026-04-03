<?php

namespace App\Services;

use App\Enums\CacheTTL;
use App\Repositories\Contracts\CommentLikeRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class CommentLikeService
{
    protected CommentLikeRepositoryInterface $commentLikeRepository;

    public function __construct(CommentLikeRepositoryInterface $commentLikeRepository)
    {
        $this->commentLikeRepository = $commentLikeRepository;
    }

    public function toggleLike(int $commentId, int $userId, string $type = 'like'): array
    {
        $result = $this->commentLikeRepository->toggle($commentId, $userId, $type);

        Cache::tags(["comment_likes:{$commentId}"])->flush();

        return $result;
    }

    public function getLikers(int $commentId, int $perPage = 15): LengthAwarePaginator
    {
        $page = request()->get('page', 1);
        $cacheKey = "comment_likes:{$commentId}:likers:per_page:{$perPage}:page:{$page}";

        return Cache::tags(['comment_likes', "comment_likes:{$commentId}"])->remember($cacheKey, now()->addMinutes(CacheTTL::LIST->value), function () use ($commentId, $perPage) {
            return $this->commentLikeRepository->getLikersPaginated($commentId, $perPage);
        });
    }
}
