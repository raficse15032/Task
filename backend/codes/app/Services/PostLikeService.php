<?php

namespace App\Services;

use App\Enums\CacheTTL;
use App\Repositories\Contracts\PostLikeRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class PostLikeService
{
    protected PostLikeRepositoryInterface $postLikeRepository;

    public function __construct(PostLikeRepositoryInterface $postLikeRepository)
    {
        $this->postLikeRepository = $postLikeRepository;
    }

    public function toggleLike(int $postId, int $userId, string $type = 'like'): array
    {
        $result = $this->postLikeRepository->toggle($postId, $userId, $type);

        Cache::tags(["post_likes:{$postId}"])->flush();

        return $result;
    }

    public function getLikers(int $postId, int $perPage = 15): LengthAwarePaginator
    {
        $page = request()->get('page', 1);
        $cacheKey = "post_likes:{$postId}:likers:per_page:{$perPage}:page:{$page}";

        return Cache::tags(['post_likes', "post_likes:{$postId}"])->remember($cacheKey, now()->addMinutes(CacheTTL::LIST->value), function () use ($postId, $perPage) {
            return $this->postLikeRepository->getLikersPaginated($postId, $perPage);
        });
    }
}
