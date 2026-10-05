<?php

namespace App\Support;

/**
 * Re-encodes an uploaded raster image through GD so that anything appended to the file (PHP code, archives, EXIF/XMP junk)
 * is dropped. JPEG orientation is applied first (EXIF is stripped by the re-encode). Not touched: animated GIFs (would lose the
 * animation), images that GD cannot read, very large images (memory). In those cases null is returned and the original is stored.
 */
class ImageSanitizer
{
    private const MAX_PIXELS = 36000000;

    public static function available(): bool
    {
        return extension_loaded('gd') && function_exists('imagecreatefromstring');
    }

    /**
     * @return array{path:string,mime:string}|null temp file with the clean image (caller deletes it), or null = keep the original
     */
    public static function clean(string $path, ?string $mime): ?array
    {
        if (! self::available() || ! is_file($path)) {
            return null;
        }
        $info = @getimagesize($path);
        if (! $info || ($info[0] * $info[1]) > self::MAX_PIXELS || ($info[0] * $info[1]) < 1) {
            return null;
        }
        $type = $info[2];
        if (! in_array($type, [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_GIF, IMAGETYPE_WEBP], true)) {
            return null;
        }
        $raw = @file_get_contents($path);
        if ($raw === false || $raw === '') {
            return null;
        }
        if ($type === IMAGETYPE_GIF && preg_match_all('/\x21\xF9\x04/', $raw) > 1) {
            return null; // animated
        }
        if ($type === IMAGETYPE_WEBP && substr($raw, 12, 4) === 'VP8X' && (ord($raw[20] ?? "\0") & 0x02)) {
            return null; // animated WebP
        }
        if ($type === IMAGETYPE_PNG && str_contains(substr($raw, 0, 4096), 'acTL')) {
            return null; // animated PNG
        }
        if ($type === IMAGETYPE_JPEG && function_exists('exif_read_data') && in_array((int) (@exif_read_data($path)['Orientation'] ?? 1), [2, 4, 5, 7], true)) {
            return null; // mirrored orientations are kept as uploaded
        }
        $img = @imagecreatefromstring($raw);
        if (! $img) {
            return null;
        }
        $tmp = tempnam(sys_get_temp_dir(), 'img');
        if ($tmp === false) {
            imagedestroy($img);

            return null;
        }
        try {
            if ($type === IMAGETYPE_JPEG) {
                $img = self::orient($img, $path);
                $ok = imagejpeg($img, $tmp, 90);
                $outMime = 'image/jpeg';
            } elseif ($type === IMAGETYPE_PNG) {
                imagealphablending($img, false);
                imagesavealpha($img, true);
                $ok = imagepng($img, $tmp, 6);
                $outMime = 'image/png';
            } elseif ($type === IMAGETYPE_GIF) {
                $ok = imagegif($img, $tmp);
                $outMime = 'image/gif';
            } else {
                imagealphablending($img, false);
                imagesavealpha($img, true);
                $ok = imagewebp($img, $tmp, 90);
                $outMime = 'image/webp';
            }
        } catch (\Throwable $e) {
            $ok = false;
        }
        imagedestroy($img);
        if (! $ok || ! is_file($tmp) || filesize($tmp) < 16 || ! @getimagesize($tmp)) {
            @unlink($tmp);

            return null;
        }

        return ['path' => $tmp, 'mime' => $outMime];
    }

    private static function orient($img, string $path)
    {
        if (! function_exists('exif_read_data')) {
            return $img;
        }
        $exif = @exif_read_data($path);
        $o = (int) ($exif['Orientation'] ?? 1);
        $angle = [3 => 180, 6 => -90, 8 => 90][$o] ?? 0;
        if ($angle !== 0 && function_exists('imagerotate')) {
            $r = imagerotate($img, $angle, 0);
            if ($r) {
                imagedestroy($img);
                $img = $r;
            }
        }

        return $img;
    }
}
