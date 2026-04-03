<?php

namespace App\Repositories\Contracts;

use Illuminate\Http\UploadedFile;

interface ImageRepositoryInterface
{
    /**
     * Upload an image to MinIO.
     *
     * @param UploadedFile $file
     * @param string $folder
     * @return string  Stored path
     */
    public function upload(UploadedFile $file, string $folder = 'images'): string;

    /**
     * Get the file content from MinIO.
     *
     * @param string $path
     * @return string|null
     */
    public function get(string $path): ?string;

    /**
     * Check if a file exists in MinIO.
     *
     * @param string $path
     * @return bool
     */
    public function exists(string $path): bool;

    /**
     * Get the MIME type of a file.
     *
     * @param string $path
     * @return string|null
     */
    public function mimeType(string $path): ?string;

    /**
     * Delete an image from MinIO.
     *
     * @param string $path
     * @return bool
     */
    public function delete(string $path): bool;
}
