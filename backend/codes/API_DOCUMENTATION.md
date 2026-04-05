# API Documentation

## Overview
This is a JWT-based social feed API with user authentication, posts, comments, reactions, and image serving. The API follows RESTful conventions and uses API versioning (v1).

## Base URL
```
http://localhost:8830/api/v1
```

## Endpoints

### 1. Register User
Create a new user account.

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

**Success Response (201):**
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": 1,
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com"
        },
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "token_type": "bearer",
        "expires_in": 3600
    }
}
```

**Validation Rules:**
- `first_name`: required, string, max 255 characters
- `last_name`: required, string, max 255 characters
- `email`: required, valid email, unique in database
- `password`: required, minimum 8 characters, must be confirmed

---

### 2. Login
Authenticate a user and get access token.

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
    "email": "john.doe@example.com",
    "password": "password123"
}
```

**Success Response (200):**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 1,
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com"
        },
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "token_type": "bearer",
        "expires_in": 3600
    }
}
```

**Error Response (401):**
```json
{
    "success": false,
    "message": "Invalid credentials"
}
```

---

### 3. Logout
Invalidate the current access token.

**Endpoint:** `POST /api/v1/auth/logout`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
    "success": true,
    "message": "Successfully logged out"
}
```

---

## Architecture

### Design Pattern: Service-Repository Pattern

The implementation follows a clean architecture with separation of concerns:

1. **Repository Layer** (`app/Repositories/`)
   - `UserRepositoryInterface`: Defines contract for user data operations
   - `UserRepository`: Implements data access logic
   - `PostRepository`, `CommentRepository`, `PostLikeRepository`, `CommentLikeRepository`, `ImageRepository`: Data access for each domain

2. **Service Layer** (`app/Services/`)
   - `AuthService`: Authentication business logic
   - `PostService`, `CommentService`, `PostLikeService`, `CommentLikeService`, `ImageService`: Business logic for each domain

3. **Controller Layer** (`app/Http/Controllers/Api/V1/`)
   - `AuthController`, `PostController`, `CommentController`, `FeedController`, `ImageController`

4. **Model** (`app/Models/`)
   - `User`, `Post`, `Comment`, `PostLike`, `CommentLike`

### Directory Structure
```
app/
├── Enums/
│   ├── CacheTTL.php
│   ├── HttpStatus.php
│   └── ResponseMessage.php
├── Http/
│   └── Controllers/
│       └── Api/
│           └── V1/
│               ├── AuthController.php
│               ├── PostController.php
│               ├── CommentController.php
│               ├── FeedController.php
│               └── ImageController.php
├── Models/
│   ├── User.php
│   ├── Post.php
│   ├── Comment.php
│   ├── PostLike.php
│   └── CommentLike.php
├── Repositories/
│   ├── Contracts/
│   │   ├── UserRepositoryInterface.php
│   │   ├── PostRepositoryInterface.php
│   │   ├── CommentRepositoryInterface.php
│   │   └── ImageRepositoryInterface.php
│   ├── UserRepository.php
│   ├── PostRepository.php
│   ├── CommentRepository.php
│   ├── PostLikeRepository.php
│   ├── CommentLikeRepository.php
│   └── ImageRepository.php
├── Services/
│   ├── AuthService.php
│   ├── PostService.php
│   ├── CommentService.php
│   ├── PostLikeService.php
│   ├── CommentLikeService.php
│   └── ImageService.php
└── Providers/
    └── AppServiceProvider.php
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:8830/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8830/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

### Logout
```bash
curl -X POST http://localhost:8830/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Security Features

1. **JWT Authentication**: Stateless token-based authentication
2. **Password Hashing**: Automatic password hashing using bcrypt
3. **Token Expiration**: Access tokens expire after 60 minutes (configurable)
4. **Email Validation**: Ensures valid email format and uniqueness
5. **Password Confirmation**: Required during registration
6. **Protected Routes**: Middleware protection for authenticated endpoints

---

## Configuration

### JWT Settings
Configuration file: `config/jwt.php`

Key settings:
- Token TTL: 60 minutes (default)
- Refresh TTL: 20160 minutes (2 weeks)
- Algorithm: HS256

### Environment Variables
Make sure these are set in your `.env` file:
```env
JWT_SECRET=your-secret-key
JWT_TTL=60
JWT_REFRESH_TTL=20160
```

---

## Error Handling

All endpoints return standardized error responses:

**Validation Error (422):**
```json
{
    "success": false,
    "message": "Validation error",
    "errors": {
        "email": ["The email has already been taken."],
        "password": ["The password must be at least 8 characters."]
    }
}
```

**Authentication Error (401):**
```json
{
    "success": false,
    "message": "Invalid credentials"
}
```

**Server Error (400):**
```json
{
    "success": false,
    "message": "Error message here"
}
```

---

---

# Images API

## Base URL
```
http://localhost:8830/api/v1/images
```

---

### 4. Get Image
Serve an image by its storage path. Public endpoint.

**Endpoint:** `GET /api/v1/images?path={path}`

**Query Parameters:**
- `path` (required): Storage path returned from upload, e.g. `images/filename.jpg`

**Success Response (200):** Raw image binary with appropriate `Content-Type` header and 1-hour cache.

```bash
curl -X GET "http://localhost:8830/api/v1/images?path=images/filename.jpg" \
  -H "Accept: application/json"
```

---

---

# Feed API

---

### 5. Get Feed
Get a paginated list of public posts. Requires authentication.

**Endpoint:** `GET /api/v1/feed`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `per_page` (optional): Items per page (default: 15)
- `page` (optional): Page number (default: 1)

**Success Response (200):**
```json
{
    "success": true,
    "message": "Feed fetched successfully",
    "data": {
        "current_page": 1,
        "data": [ ... ],
        "per_page": 15,
        "total": 100
    }
}
```

```bash
curl -X GET "http://localhost:8830/api/v1/feed?per_page=15&page=1" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

---

# Posts API

## Base URL
```
http://localhost:8830/api/v1/posts
```

All post endpoints require authentication.

---

### 6. Create Post
Create a new post, optionally with an image.

**Endpoint:** `POST /api/v1/posts`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Form Fields:**
- `content` (required): string, max 5000 characters
- `visibility` (optional): `public` or `private` (default: `public`)
- `image` (optional): Image file — jpeg, png, jpg, gif, webp — max 5MB

**Success Response (201):**
```json
{
    "success": true,
    "message": "Post created successfully",
    "data": { ... }
}
```

```bash
# Without image (JSON)
curl -X POST http://localhost:8830/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "content": "Post content here",
    "visibility": "public"
  }'

# With image (multipart)
curl -X POST http://localhost:8830/api/v1/posts \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "content=Post content here" \
  -F "visibility=public" \
  -F "image=@/path/to/image.jpg"
```

---

### 7. Update Post
Update an existing post. Only the post owner can update it.

**Endpoint:** `PUT /api/v1/posts/{post}`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Form Fields:** (all optional, at least one required)
- `content`: string, max 5000 characters
- `visibility`: `public` or `private`
- `image`: Image file — jpeg, png, jpg, gif, webp — max 5MB

**Success Response (200):**
```json
{
    "success": true,
    "message": "Post updated successfully",
    "data": { ... }
}
```

```bash
# Without image (JSON)
curl -X PUT http://localhost:8830/api/v1/posts/1 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "content": "Updated content",
    "visibility": "private"
  }'
```

---

### 8. Delete Post
Delete a post. Only the post owner can delete it.

**Endpoint:** `DELETE /api/v1/posts/{post}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
    "success": true,
    "message": "Post deleted successfully"
}
```

```bash
curl -X DELETE http://localhost:8830/api/v1/posts/1 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 9. Toggle Post Like / Dislike
Like, unlike, dislike, or undislike a post.

**Endpoint:** `POST /api/v1/posts/{post}/like`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
    "type": "like"
}
```

**Fields:**
- `type` (optional): `like` (default) or `dislike`

**Success Response (200):**
```json
{
    "success": true,
    "message": "Liked",
    "data": {
        "action": "liked"
    }
}
```

Possible `action` values: `liked`, `unliked`, `disliked`, `undisliked`

```bash
# Like a post
curl -X POST http://localhost:8830/api/v1/posts/1/like \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"type": "like"}'

# Dislike a post
curl -X POST http://localhost:8830/api/v1/posts/1/like \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"type": "dislike"}'
```

---

### 10. Get Post Likers
Get a paginated list of users who reacted to a post, optionally filtered by reaction type.

**Endpoint:** `GET /api/v1/posts/{post}/likers`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `type`    | string | No       | Filter by reaction type: `like` or `dislike`. Omit to get all reactions. |
| `page`    | int    | No       | Page number (default: 1) |

**Success Response (200):**
```json
{
    "success": true,
    "message": "Likers retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "post_id": 1,
                "user_id": 2,
                "type": "like",
                "created_at": "2026-04-04T10:00:00.000000Z",
                "updated_at": "2026-04-04T10:00:00.000000Z",
                "user": {
                    "id": 2,
                    "first_name": "John",
                    "last_name": "Doe"
                }
            }
        ],
        "last_page": 1,
        "per_page": 15,
        "total": 1
    }
}
```

**Error Response (422) — invalid type:**
```json
{
    "success": false,
    "message": "Invalid type. Must be like or dislike."
}
```

```bash
# All reactions
curl -X GET http://localhost:8830/api/v1/posts/1/likers \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Only likers
curl -X GET "http://localhost:8830/api/v1/posts/1/likers?type=like" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Only dislikers
curl -X GET "http://localhost:8830/api/v1/posts/1/likers?type=dislike" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

---

# Comments API

## Base URL
```
http://localhost:8830/api/v1/posts/{post}/comments
```

All comment endpoints require authentication.

---

### 11. Get Comments
Get top-level comments for a post.

**Endpoint:** `GET /api/v1/posts/{post}/comments`

**Headers:**
```
Authorization: Bearer {access_token}
```

```bash
curl -X GET http://localhost:8830/api/v1/posts/1/comments \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 12. Create Comment / Reply
Add a comment to a post. Pass `parent_id` to create a reply.

**Endpoint:** `POST /api/v1/posts/{post}/comments`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
    "content": "This is a comment",
    "parent_id": null
}
```

**Fields:**
- `content` (required): string, max 2000 characters
- `parent_id` (optional): ID of the parent comment to reply to

**Success Response (201):**
```json
{
    "success": true,
    "message": "Comment created successfully",
    "data": { ... }
}
```

```bash
# Create a top-level comment
curl -X POST http://localhost:8830/api/v1/posts/1/comments \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"content": "This is a comment"}'

# Reply to a comment
curl -X POST http://localhost:8830/api/v1/posts/1/comments \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"content": "This is a reply", "parent_id": 5}'
```

---

### 13. Update Comment
Update a comment. Only the comment owner can update it.

**Endpoint:** `PUT /api/v1/posts/{post}/comments/{comment}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
    "content": "Updated comment text"
}
```

**Success Response (200):**
```json
{
    "success": true,
    "message": "Comment updated successfully",
    "data": { ... }
}
```

```bash
curl -X PUT http://localhost:8830/api/v1/posts/1/comments/5 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"content": "Updated comment text"}'
```

---

### 14. Delete Comment
Delete a comment. Only the comment owner can delete it.

**Endpoint:** `DELETE /api/v1/posts/{post}/comments/{comment}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
    "success": true,
    "message": "Comment deleted successfully"
}
```

```bash
curl -X DELETE http://localhost:8830/api/v1/posts/1/comments/5 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 15. Get Comment Replies
Get replies for a specific comment.

**Endpoint:** `GET /api/v1/posts/{post}/comments/{comment}/replies`

**Headers:**
```
Authorization: Bearer {access_token}
```

```bash
curl -X GET http://localhost:8830/api/v1/posts/1/comments/5/replies \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 16. Toggle Comment Like / Dislike
Like, unlike, dislike, or undislike a comment.

**Endpoint:** `POST /api/v1/posts/{post}/comments/{comment}/like`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
    "type": "like"
}
```

**Fields:**
- `type` (optional): `like` (default) or `dislike`

**Success Response (200):**
```json
{
    "success": true,
    "message": "Liked",
    "data": {
        "action": "liked"
    }
}
```

```bash
# Like a comment
curl -X POST http://localhost:8830/api/v1/posts/1/comments/5/like \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"type": "like"}'

# Dislike a comment
curl -X POST http://localhost:8830/api/v1/posts/1/comments/5/like \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"type": "dislike"}'
```

---

### 17. Get Comment Likers
Get a paginated list of users who reacted to a comment, optionally filtered by reaction type.

**Endpoint:** `GET /api/v1/posts/{post}/comments/{comment}/likers`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `type`    | string | No       | Filter by reaction type: `like` or `dislike`. Omit to get all reactions. |
| `page`    | int    | No       | Page number (default: 1) |

**Success Response (200):**
```json
{
    "success": true,
    "message": "Likers retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "comment_id": 5,
                "user_id": 2,
                "type": "like",
                "created_at": "2026-04-04T10:00:00.000000Z",
                "updated_at": "2026-04-04T10:00:00.000000Z",
                "user": {
                    "id": 2,
                    "first_name": "John",
                    "last_name": "Doe"
                }
            }
        ],
        "last_page": 1,
        "per_page": 15,
        "total": 1
    }
}
```

**Error Response (422) — invalid type:**
```json
{
    "success": false,
    "message": "Invalid type. Must be like or dislike."
}
```

```bash
# All reactions
curl -X GET http://localhost:8830/api/v1/posts/1/comments/5/likers \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Only likers
curl -X GET "http://localhost:8830/api/v1/posts/1/comments/5/likers?type=like" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Only dislikers
curl -X GET "http://localhost:8830/api/v1/posts/1/comments/5/likers?type=dislike" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
