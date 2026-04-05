# AppifyLab Project

**Live URL:** http://37.60.248.4:5170/

## Overview

A social feed application with a Laravel API backend and React (Vite) frontend, both containerized with Docker. Users can register, log in, create posts (with optional images, public or private visibility), like/dislike posts and comments, and engage in threaded comment discussions. The feed displays all public posts along with the authenticated user's own private posts. Images are stored in MinIO (S3-compatible) and served through Laravel, with Redis powering the cache layer for performance.

## Architecture

- **Backend:** Laravel 12, PHP 8.2, MySQL 8.0, JWT authentication (`php-open-source-saver/jwt-auth`), MinIO (S3-compatible) for image storage, Redis for caching, rate limiting
- **Frontend:** React 18 + Vite, Axios for API calls, React Router, React Toastify for notifications
- **Infrastructure:** Docker Compose for both backend (PHP-FPM + Nginx + MySQL + Redis + MinIO) and frontend (Node dev server)
- **Pattern:** Repository → Service → Controller with interface bindings via the service container

## Caching (Redis)

The application uses **Redis 7.4** as the cache store, configured via `CACHE_STORE=redis` in `.env`. The `phpredis` client connects to a Docker Redis service on port 6379. Redis is required because the codebase uses `Cache::tags()` extensively, which is not supported by file or database drivers.

### Cache Strategy

| Resource | Tags | TTL | Invalidation |
|----------|------|-----|-------------|
| Feed (paginated) | `feed`, `feed:user:{id}` | 5 min | Flushed on post create/update/delete |
| Post comments | `comments`, `comments:post:{id}` | 5 min | Flushed on comment create/update/delete |
| Comment replies | `comments`, `comments:parent:{id}` | 5 min | Flushed on reply create/update/delete |
| Post likes list | `post_likes`, `post_likes:{id}` | 5 min | Flushed on like toggle |
| Comment likes list | `comment_likes`, `comment_likes:{id}` | 5 min | Flushed on like toggle |

TTL values are defined in `App\Enums\CacheTTL` — `LIST = 5 min`, `DETAIL = 10 min`. Every CRUD operation invalidates the relevant cache tags to ensure consistency.

## Image Storage (MinIO)

Images are stored in **MinIO** (S3-compatible object storage) running as a Docker service. The Laravel `s3` driver is configured as a custom `minio` disk with `use_path_style_endpoint: true`.


### How It Works

- **Upload:** `ImageRepository::upload()` generates a UUID filename, stores raw file content via `Storage::disk('minio')->put()` into a configurable folder (default `images/`).
- **Serving:** Images are **proxied through Laravel** via `GET /api/v1/images?path=` — the controller reads file content from MinIO and returns it with the correct `Content-Type` header and a 1-hour cache header. No presigned URLs are exposed.
- **Deletion:** Files are removed from MinIO via `Storage::disk('minio')->delete()`. Post deletion also cleans up associated images through `PostService`.
- **Persistence:** MinIO data is stored in a Docker named volume (`minio_data`), so images survive container restarts.

## Database (MySQL)

The application uses **MySQL 8.0** running as a Docker service with persistent storage via a named volume (`mysql_data`). All tables use `ON DELETE CASCADE` foreign keys to ensure referential integrity.

### Schema & Indexing

**users**
| Column | Type | Index |
|--------|------|-------|
| id | bigint (PK) | Primary |
| email | varchar | Unique |
| first_name, last_name | varchar | — |
| password | varchar | — |

**posts**
| Column | Type | Index |
|--------|------|-------|
| id | bigint (PK) | Primary |
| user_id | bigint (FK → users) | Composite: `(user_id, created_at)` |
| content | text | — |
| image_path | varchar (nullable) | — |
| visibility | enum (public/private) | Composite: `(visibility, created_at)` |

**comments**
| Column | Type | Index |
|--------|------|-------|
| id | bigint (PK) | Primary |
| user_id | bigint (FK → users) | — |
| post_id | bigint (FK → posts) | Composite: `(post_id, created_at)` |
| parent_id | bigint (FK → comments, nullable) | Composite: `(parent_id, created_at)` |
| content | text | — |

**post_likes**
| Column | Type | Index |
|--------|------|-------|
| id | bigint (PK) | Primary |
| user_id | bigint (FK → users) | Unique: `(user_id, post_id)` |
| post_id | bigint (FK → posts) | Index: `post_id` |
| type | enum (like/dislike) | — |

**comment_likes**
| Column | Type | Index |
|--------|------|-------|
| id | bigint (PK) | Primary |
| user_id | bigint (FK → users) | Unique: `(user_id, comment_id)` |
| comment_id | bigint (FK → comments) | Index: `comment_id` |
| type | enum (like/dislike) | — |

### Indexing Decisions

- **Composite indexes on `(visibility, created_at)` and `(user_id, created_at)` on posts** — optimizes feed queries that filter by visibility and sort by recency.
- **Composite indexes on `(post_id, created_at)` and `(parent_id, created_at)` on comments** — supports paginated comment/reply listing sorted by time.
- **Unique constraint on `(user_id, post_id)` / `(user_id, comment_id)` on likes** — enforces one reaction per user per post/comment at the database level.
- **Single-column index on `post_id` / `comment_id` on likes** — speeds up counting likes for a specific post or comment.

## Rate Limiting

Rate limiting is enforced at two levels using Laravel's built-in `throttle` middleware:

| Limiter | Scope | Limit | Key |
|---------|-------|-------|-----|
| `api` | All API routes (global) | 60 req/min | User ID or IP |
| `auth` | Login & Register only | 5 req/min | IP address |

- Limits are configurable via `.env` (`RATE_LIMIT_AUTH_ATTEMPTS`, `RATE_LIMIT_API_ATTEMPTS`).

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | No | Register a new user (rate limited) |
| POST | `/api/v1/auth/login` | No | Login and receive JWT (rate limited) |
| POST | `/api/v1/auth/logout` | Yes | Invalidate JWT |
| GET | `/api/v1/feed` | Yes | Paginated feed of posts |
| POST | `/api/v1/posts` | Yes | Create a post (with optional image) |
| PUT | `/api/v1/posts/{id}` | Yes | Update own post |
| DELETE | `/api/v1/posts/{id}` | Yes | Delete own post (ownership enforced) |
| POST | `/api/v1/posts/{id}/like` | Yes | Toggle like/dislike on a post |
| GET | `/api/v1/posts/{id}/likers` | Yes | List users who liked/disliked a post |
| GET | `/api/v1/posts/{id}/comments` | Yes | Paginated comments on a post |
| POST | `/api/v1/posts/{id}/comments` | Yes | Create a comment or reply |
| PUT | `/api/v1/posts/{id}/comments/{cid}` | Yes | Update own comment |
| DELETE | `/api/v1/posts/{id}/comments/{cid}` | Yes | Delete own comment |
| GET | `/api/v1/posts/{id}/comments/{cid}/replies` | Yes | Paginated replies to a comment |
| POST | `/api/v1/posts/{id}/comments/{cid}/like` | Yes | Toggle like/dislike on a comment |
| GET | `/api/v1/posts/{id}/comments/{cid}/likers` | Yes | List users who liked/disliked a comment |
| GET | `/api/v1/images?path=` | No | Serve an image from MinIO (public, cached 1hr) |

## Features Built

- **Authentication:** Register, login, and logout with JWT-based auth (rate limited on public endpoints)
- **Posts:** Create posts with optional image upload, edit own posts, delete own posts (ownership enforced)
- **Comments:** Comment on posts, reply to comments (threaded/nested)
- **Reactions:** Like and dislike posts and comments (toggle-based)
- **Social:** View list of likers/dislikers on posts and comments, see commenters and repliers
- **Feed:** Paginated feed with scroll and load more, real-time UI updates on create/edit/delete without page reload. Shows all public posts and the authenticated user's own private posts.
- **Validation:** Field-level validation error messages displayed in toast notifications


## Running

### Backend

```bash
# 1. Configure Docker environment
cd backend/docker
cp .env.example .env
# Edit .env and set values

# 2. Configure Laravel environment
cd ../codes
cp .env.example .env
# Edit .env and set values

# 3. Start containers
cd ../docker
sudo docker compose up -d --build

# 4. Create MinIO bucket
sudo docker compose exec minio mc alias set local http://127.0.0.1:9000 MINIO_ROOT_USER MINIO_ROOT_PASSWORD
sudo docker compose exec minio mc mb local/appifylab-bucket 2>&1

# 5. Install dependencies and setup Laravel
sudo docker compose exec app composer install
sudo docker compose exec app php artisan key:generate
sudo docker compose exec app php artisan jwt:secret
sudo docker compose exec app php artisan migrate
sudo docker compose exec app php artisan db:seed
sudo docker compose exec app php artisan optimize

# 6. Set file permissions
sudo docker compose exec app chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache
sudo docker compose exec app chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
```

### Frontend

```bash
# 1. Configure environment
cd frontend/codes
cp .env.example .env
# Edit .env and set values

# 2. Build and start container
cd ../docker
sudo docker compose build
sudo docker compose run --rm app npm install
sudo docker compose up -d
```
