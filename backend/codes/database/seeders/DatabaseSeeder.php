<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\CommentLike;
use App\Models\Post;
use App\Models\PostLike;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // 20 users
        $users = User::factory(20)->create();
        $userIds = $users->pluck('id');

        // 100 posts, each owned by a random user
        $posts = Post::factory(100)->create([
            'user_id' => fn () => $userIds->random(),
            'visibility' => 'public',
        ]);

        foreach ($posts as $post) {
            // 20 comments per post, each by a random user
            $comments = Comment::factory(20)->create([
                'post_id' => $post->id,
                'user_id' => fn () => $userIds->random(),
            ]);

            // 10 likes + 10 dislikes per post (20 distinct users, no duplicates)
            $shuffledForPost = $userIds->shuffle();
            $likerIds    = $shuffledForPost->slice(0, 10);
            $dislikerIds = $shuffledForPost->slice(10, 10);

            $postLikes = [];
            foreach ($likerIds as $uid) {
                $postLikes[] = ['user_id' => $uid, 'post_id' => $post->id, 'type' => 'like', 'created_at' => now(), 'updated_at' => now()];
            }
            foreach ($dislikerIds as $uid) {
                $postLikes[] = ['user_id' => $uid, 'post_id' => $post->id, 'type' => 'dislike', 'created_at' => now(), 'updated_at' => now()];
            }
            PostLike::insert($postLikes);

            // 10 likes + 10 dislikes per comment (20 distinct users, no duplicates)
            foreach ($comments as $comment) {
                $shuffledForComment = $userIds->shuffle();
                $commentLikerIds    = $shuffledForComment->slice(0, 10);
                $commentDislikerIds = $shuffledForComment->slice(10, 10);

                $commentLikes = [];
                foreach ($commentLikerIds as $uid) {
                    $commentLikes[] = ['user_id' => $uid, 'comment_id' => $comment->id, 'type' => 'like', 'created_at' => now(), 'updated_at' => now()];
                }
                foreach ($commentDislikerIds as $uid) {
                    $commentLikes[] = ['user_id' => $uid, 'comment_id' => $comment->id, 'type' => 'dislike', 'created_at' => now(), 'updated_at' => now()];
                }
                CommentLike::insert($commentLikes);
            }
        }
    }
}
