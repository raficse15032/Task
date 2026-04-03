<?php

namespace App\Services;

use App\Enums\CacheTTL;
use App\Models\Comment;
use App\Repositories\Contracts\CommentRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class CommentService
{
    protected CommentRepositoryInterface $commentRepository;

    public function __construct(CommentRepositoryInterface $commentRepository)
    {
        $this->commentRepository = $commentRepository;
    }

    public function getPostComments(int $postId, int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        $cacheKey = "post:{$postId}:comments:page:{$page}:per_page:{$perPage}";

        return Cache::tags(['comments', "comments:post:{$postId}"])->remember($cacheKey, now()->addMinutes(CacheTTL::LIST->value), function () use ($postId, $perPage) {
            return $this->commentRepository->getByPostPaginated($postId, $perPage);
        });
    }

    public function getReplies(int $parentId, int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        $cacheKey = "comment:{$parentId}:replies:page:{$page}:per_page:{$perPage}";

        return Cache::tags(['comments', "comments:parent:{$parentId}"])->remember($cacheKey, now()->addMinutes(CacheTTL::LIST->value), function () use ($parentId, $perPage) {
            return $this->commentRepository->getRepliesPaginated($parentId, $perPage);
        });
    }

    public function getComment(int $commentId): ?Comment
    {
        return Cache::tags(['comments'])->remember("comment:{$commentId}", now()->addMinutes(CacheTTL::DETAIL->value), function () use ($commentId) {
            return $this->commentRepository->findById($commentId);
        });
    }

    public function createComment(int $userId, int $postId, array $data, ?int $parentId = null): Comment
    {
        $commentData = [
            'user_id' => $userId,
            'post_id' => $postId,
            'content' => $data['content'],
        ];

        if ($parentId) {
            $commentData['parent_id'] = $parentId;
        }

        $comment = $this->commentRepository->create($commentData);

        $this->clearPostCommentCache($postId);
        if ($parentId) {
            Cache::tags(["comments:parent:{$parentId}"])->flush();
        }

        return $comment->load('user:id,first_name,last_name');
    }

    public function updateComment(Comment $comment, array $data): Comment
    {
        $comment = $this->commentRepository->update($comment, [
            'content' => $data['content'],
        ]);

        Cache::tags(['comments'])->forget("comment:{$comment->id}");
        $this->clearPostCommentCache($comment->post_id);
        if ($comment->parent_id) {
            Cache::tags(["comments:parent:{$comment->parent_id}"])->flush();
        }

        return $comment;
    }

    public function deleteComment(Comment $comment): bool
    {
        $postId = $comment->post_id;
        $commentId = $comment->id;
        $parentId = $comment->parent_id;

        $result = $this->commentRepository->delete($comment);

        Cache::tags(['comments'])->forget("comment:{$commentId}");
        $this->clearPostCommentCache($postId);
        if ($parentId) {
            Cache::tags(["comments:parent:{$parentId}"])->flush();
        }

        return $result;
    }

    protected function clearPostCommentCache(int $postId): void
    {
        Cache::tags(["comments:post:{$postId}"])->flush();
    }
}
