<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE INDEX idx_visibility_created ON posts (visibility, created_at DESC)');
        DB::statement('CREATE INDEX idx_visibility_created_cover ON posts (visibility, created_at DESC, id, user_id)');
        DB::statement('CREATE INDEX idx_user_created_cover ON posts (user_id, created_at DESC, id, visibility)');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX idx_visibility_created ON posts');
        DB::statement('DROP INDEX idx_visibility_created_cover ON posts');
        DB::statement('DROP INDEX idx_user_created_cover ON posts');
    }
};
