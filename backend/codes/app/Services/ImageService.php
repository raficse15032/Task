<?php

namespace App\Services;

use App\Repositories\Contracts\ImageRepositoryInterface;
use Illuminate\Http\UploadedFile;

class ImageService
{
    protected ImageRepositoryInterface $imageRepository;

    public function __construct(ImageRepositoryInterface $imageRepository)
    {
        $this->imageRepository = $imageRepository;
    }

    /**
     * Upload an image to MinIO.
     *
     * @param UploadedFile $file
     * @param string $folder
     * @return array
     */
    public function upload(UploadedFile $file, string $folder = 'images'): array
    {
        $path = $this->imageRepository->upload($file, $folder);

        return [
            'path' => $path,
        ];
    }

    /**
     * Get the image content and mime type.
     *
     * @param string $path
     * @return array{content: string, mime: string}|null
     */
    public function getImage(string $path): ?array
    {
        if (!$this->imageRepository->exists($path)) {
            return null;
        }

        return [
            'content' => $this->imageRepository->get($path),
            'mime'    => $this->imageRepository->mimeType($path) ?? 'application/octet-stream',
        ];
    }

    /**
     * Delete an image from MinIO.
     *
     * @param string $path
     * @return bool
     */
    public function delete(string $path): bool
    {
        return $this->imageRepository->delete($path);
    }
}
