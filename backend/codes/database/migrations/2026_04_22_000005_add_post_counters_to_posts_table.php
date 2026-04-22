<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->unsignedInteger('comments_count')->default(0)->after('visibility');
            $table->unsignedInteger('likes_count')->default(0)->after('comments_count');
            $table->unsignedInteger('dislikes_count')->default(0)->after('likes_count');
        });

        DB::table('posts')->update([
            'comments_count' => DB::raw('(select count(*) from comments where comments.post_id = posts.id)'),
            'likes_count' => DB::raw("(select count(*) from post_likes where post_likes.post_id = posts.id and post_likes.type = 'like')"),
            'dislikes_count' => DB::raw("(select count(*) from post_likes where post_likes.post_id = posts.id and post_likes.type = 'dislike')"),
        ]);
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['comments_count', 'likes_count', 'dislikes_count']);
        });
    }
};