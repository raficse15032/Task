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
            $table->json('user')->nullable()->after('user_id');
        });

        // Backfill existing rows from the users table
        DB::statement("
            UPDATE posts
            JOIN users ON users.id = posts.user_id
            SET posts.user = JSON_OBJECT(
                'id', users.id,
                'first_name', users.first_name,
                'last_name', users.last_name
            )
        ");
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn('user');
        });
    }
};
