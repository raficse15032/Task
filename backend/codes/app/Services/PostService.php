<?php

namespace App\Services;

use App\Enums\CacheTTL;
use App\Models\Post;
use App\Models\User;
use App\Repositories\Contracts\PostRepositoryInterface;
use App\Repositories\Contracts\ImageRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;

class PostService
{
    protected PostRepositoryInterface $postRepository;
    protected ImageRepositoryInterface $imageRepository;

    public function __construct(
        PostRepositoryInterface $postRepository,
        ImageRepositoryInterface $imageRepository
    ) {
        $this->postRepository = $postRepository;
        $this->imageRepository = $imageRepository;
    }

    public function getFeed(int $userId, int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return $this->postRepository->getFeedPaginated($userId, $perPage);

        // $cacheKey = "feed:user:{$userId}:page:{$page}:per_page:{$perPage}";

        // return Cache::tags(['feed', "feed:user:{$userId}"])->remember($cacheKey, now()->addMinutes(CacheTTL::LIST->value), function () use ($userId, $perPage) {
        //     return $this->postRepository->getFeedPaginated($userId, $perPage);
        // });
    }

    public function getPost(int $postId): ?Post
    {
        return Cache::tags(['posts'])->remember("post:{$postId}", now()->addMinutes(CacheTTL::DETAIL->value), function () use ($postId) {
            return $this->postRepository->findById($postId);
        });
    }

    public function createPost(int $userId, array $data, ?UploadedFile $image = null): Post
    {
        $author = User::select('id', 'first_name', 'last_name')->findOrFail($userId);

        $postData = [
            'user_id' => $userId,
            'user' => ['id' => $author->id, 'first_name' => $author->first_name, 'last_name' => $author->last_name],
            'content' => $data['content'],
            'visibility' => $data['visibility'] ?? 'private',
        ];

        if ($image) {
            $postData['image_path'] = $this->imageRepository->upload($image, 'posts');
        }

        $post = $this->postRepository->create($postData);

        $this->clearFeedCache();

        return $post;
    }

    public function updatePost(Post $post, array $data, ?UploadedFile $image = null): Post
    {
        $updateData = [];

        if (isset($data['content'])) {
            $updateData['content'] = $data['content'];
        }

        if (isset($data['visibility'])) {
            $updateData['visibility'] = $data['visibility'];
        }

        if ($image) {
            if ($post->image_path) {
                $this->imageRepository->delete($post->image_path);
            }
            $updateData['image_path'] = $this->imageRepository->upload($image, 'posts');
        }

        $post = $this->postRepository->update($post, $updateData);

        Cache::tags(['posts'])->forget("post:{$post->id}");
        $this->clearFeedCache();

        return $post;
    }

    public function deletePost(Post $post): bool
    {
        if ($post->image_path) {
            $this->imageRepository->delete($post->image_path);
        }

        $result = $this->postRepository->delete($post);

        Cache::tags(['posts'])->forget("post:{$post->id}");
        $this->clearFeedCache();

        return $result;
    }

    public function getUserPosts(int $userId, int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        $cacheKey = "user_posts:{$userId}:page:{$page}:per_page:{$perPage}";

        return Cache::tags(['feed', "feed:user:{$userId}"])->remember($cacheKey, now()->addMinutes(CacheTTL::LIST->value), function () use ($userId, $perPage) {
            return $this->postRepository->getUserPosts($userId, $perPage);
        });
    }

    protected function clearFeedCache(): void
    {
        Cache::tags(['feed'])->flush();
        Cache::tags(['posts'])->flush();
    }
}
