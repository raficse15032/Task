<?php

namespace App\Repositories;

use App\Models\Comment;
use App\Models\Post;
use App\Models\PostLike;
use App\Repositories\Contracts\PostRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PostRepository implements PostRepositoryInterface
{
    public function getFeedPaginated(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        // UNION ALL strategy: each branch uses its covering index, then merge top N from each
        $sql = "
            (
                SELECT *
                FROM posts
                WHERE visibility = 'public'
                ORDER BY created_at DESC
                LIMIT ?
            )
            UNION ALL
            (
                SELECT *
                FROM posts
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT ?
            )
            ORDER BY created_at DESC
            LIMIT ?
        ";

        $results = DB::select($sql, [$perPage, $userId, $perPage, $perPage]);
        
        // Hydrate into Post models
        $posts = Post::hydrate(collect($results)->map(fn($item) => (array)$item)->toArray());
        
        // For pagination, we need total count
        // Use UNION for distinct count (not UNION ALL)
        $countSql = "
            SELECT COUNT(*) as total FROM (
                SELECT id FROM posts WHERE visibility = 'public'
                UNION
                SELECT id FROM posts WHERE user_id = ?
            ) as combined
        ";
        
        $total = DB::selectOne($countSql, [$userId])->total;
        
        $page = \Illuminate\Pagination\Paginator::resolveCurrentPage('page');
        
        return new \Illuminate\Pagination\LengthAwarePaginator(
            $posts,
            $total,
            $perPage,
            $page,
            ['path' => \Illuminate\Pagination\Paginator::resolveCurrentPath()]
        );
    }

    public function findById(int $id): ?Post
    {
        return Post::find($id);
    }

    public function create(array $data): Post
    {
        return Post::create($data);
    }

    public function update(Post $post, array $data): Post
    {
        $post->update($data);
        return $post->fresh();
    }

    public function delete(Post $post): bool
    {
        return $post->delete();
    }

    public function getUserPosts(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return Post::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function syncCommentsCount(int $postId): void
    {
        Post::whereKey($postId)->update([
            'comments_count' => Comment::where('post_id', $postId)->count(),
        ]);
    }

    public function syncReactionCounts(int $postId): array
    {
        $counts = [
            'likes_count' => PostLike::where('post_id', $postId)->where('type', 'like')->count(),
            'dislikes_count' => PostLike::where('post_id', $postId)->where('type', 'dislike')->count(),
        ];

        Post::whereKey($postId)->update($counts);

        return $counts;
    }
}
