<?php

namespace App\Services;

use App\Enums\CacheTTL;
use App\Repositories\Contracts\PostLikeRepositoryInterface;
use App\Repositories\Contracts\PostRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class PostLikeService
{
    protected PostLikeRepositoryInterface $postLikeRepository;
    protected PostRepositoryInterface $postRepository;

    public function __construct(
        PostLikeRepositoryInterface $postLikeRepository,
        PostRepositoryInterface $postRepository
    ) {
        $this->postLikeRepository = $postLikeRepository;
        $this->postRepository = $postRepository;
    }

    public function toggleLike(int $postId, int $userId, string $type = 'like'): array
    {
        $result = $this->postLikeRepository->toggle($postId, $userId, $type);
        $counts = $this->postRepository->syncReactionCounts($postId);

        Cache::tags(["post_likes:{$postId}"])->flush();
        Cache::tags(['posts'])->forget("post:{$postId}");
        Cache::tags(['feed'])->flush();

        return [
            'action' => $result['action'],
            'likes_count' => $counts['likes_count'],
            'dislikes_count' => $counts['dislikes_count'],
        ];
    }

    public function getLikers(int $postId, int $perPage = 15, ?string $type = null): LengthAwarePaginator
    {
        $page = request()->get('page', 1);
        $cacheKey = "post_likes:{$postId}:likers:type:{$type}:per_page:{$perPage}:page:{$page}";

        return Cache::tags(['post_likes', "post_likes:{$postId}"])->remember($cacheKey, now()->addMinutes(CacheTTL::LIST->value), function () use ($postId, $perPage, $type) {
            return $this->postLikeRepository->getLikersPaginated($postId, $perPage, $type);
        });
    }
}
