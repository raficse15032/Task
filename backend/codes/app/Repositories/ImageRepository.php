<?php

namespace App\Repositories;

use App\Repositories\Contracts\ImageRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageRepository implements ImageRepositoryInterface
{
    /**
     * Upload an image to MinIO.
     *
     * @param UploadedFile $file
     * @param string $folder
     * @return string  Stored path
     */
    public function upload(UploadedFile $file, string $folder = 'images'): string
    {
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $folder . '/' . $filename;

        Storage::disk('minio')->put($path, file_get_contents($file->getRealPath()));

        return $path;
    }

    /**
     * Get the file content from MinIO.
     *
     * @param string $path
     * @return string|null
     */
    public function get(string $path): ?string
    {
        return Storage::disk('minio')->get($path);
    }

    /**
     * Check if a file exists in MinIO.
     *
     * @param string $path
     * @return bool
     */
    public function exists(string $path): bool
    {
        return Storage::disk('minio')->exists($path);
    }

    /**
     * Get the MIME type of a file.
     *
     * @param string $path
     * @return string|null
     */
    public function mimeType(string $path): ?string
    {
        return Storage::disk('minio')->mimeType($path);
    }

    /**
     * Delete an image from MinIO.
     *
     * @param string $path
     * @return bool
     */
    public function delete(string $path): bool
    {
        return Storage::disk('minio')->delete($path);
    }
}
