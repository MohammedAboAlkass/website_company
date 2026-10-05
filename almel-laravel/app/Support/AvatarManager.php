<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Http\File as HttpFile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Profile photos («حسابي»). Every upload is validated hard and then REBUILT, never stored as received:
 *  - allow-list: jpg / jpeg / png / webp, at most 2 MB; double extensions such as shell.php.jpg are refused;
 *  - the real type is read from the file content (finfo + getimagesize) and must agree with the extension;
 *  - the pixels are decoded with GD (what GD cannot decode is refused, not stored), the EXIF orientation is applied,
 *    the image is cropped to a centred square and scaled to 256×256, then re-encoded as WebP (JPEG if WebP is unavailable).
 *    Metadata (EXIF / XMP / comments) and anything appended to the original file are therefore dropped;
 *  - stored on the public disk under uploads/avatars/u{id}-{random}.webp (random name, so the old photo never stays cached).
 * The caller only ever passes the signed-in user: nobody can change another user's photo through this class' controller.
 */
class AvatarManager
{
    public const DIR = 'uploads/avatars';
    public const SIZE = 256;
    public const MAX_BYTES = 2097152; // 2 MB
    private const MIN_SIDE = 32;
    private const MAX_PIXELS = 12000000;
    private const EXT = ['jpg' => IMAGETYPE_JPEG, 'jpeg' => IMAGETYPE_JPEG, 'png' => IMAGETYPE_PNG, 'webp' => IMAGETYPE_WEBP];
    private const MIME = ['image/jpeg' => IMAGETYPE_JPEG, 'image/png' => IMAGETYPE_PNG, 'image/webp' => IMAGETYPE_WEBP];
    private const BLOCKED_PART = '/^(php\d*|phtml|pht|phar|phps|exe|dll|bat|cmd|com|msi|scr|sh|bash|zsh|js|mjs|jse|jsp|jspx|asp|aspx|cgi|pl|py|rb|vbs|vbe|ps1|jar|war|htaccess|htpasswd|html?|xhtml|svg|svgz|xml|swf|hta|lnk|reg|so)$/i';

    /** @return string|null Arabic error message, or null when the upload is acceptable */
    public static function check(?UploadedFile $file): ?string
    {
        if (! $file) {
            return 'اختر صورة أولاً.';
        }
        if (! $file->isValid()) {
            return match ($file->getError()) {
                UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'حجم الصورة أكبر من 2 ميغابايت.',
                UPLOAD_ERR_PARTIAL => 'لم يكتمل رفع الصورة، حاول مرة أخرى.',
                UPLOAD_ERR_NO_FILE => 'اختر صورة أولاً.',
                default => 'تعذّر رفع الصورة، حاول مرة أخرى.',
            };
        }
        $name = (string) $file->getClientOriginalName();
        $parts = array_values(array_filter(explode('.', $name), fn ($p) => $p !== ''));
        $ext = count($parts) > 1 ? strtolower((string) end($parts)) : '';
        foreach (array_slice($parts, 1) as $p) {
            if (preg_match(self::BLOCKED_PART, trim($p))) {
                return 'نوع الملف غير مسموح لأسباب أمنية.';
            }
        }
        if ($ext === '' || ! isset(self::EXT[$ext])) {
            return 'صيغة الصورة غير مدعومة. المسموح: JPG وPNG وWEBP فقط.';
        }
        $path = (string) $file->getRealPath();
        $size = (int) $file->getSize();
        if ($path === '' || ! is_file($path) || $size <= 0) {
            return 'الملف فارغ أو غير قابل للقراءة.';
        }
        if ($size > self::MAX_BYTES) {
            return 'حجم الصورة أكبر من 2 ميغابايت.';
        }
        $mime = self::detectMime($path);
        if (! isset(self::MIME[$mime]) || self::MIME[$mime] !== self::EXT[$ext]) {
            return 'محتوى الملف لا يطابق صيغة صورة مسموحة (JPG أو PNG أو WEBP)، تم رفضه.';
        }
        $info = @getimagesize($path);
        if (! $info || $info[2] !== self::MIME[$mime]) {
            return 'الملف ليس صورة صالحة.';
        }
        if ($info[0] < self::MIN_SIDE || $info[1] < self::MIN_SIDE) {
            return 'الصورة صغيرة جداً (الحد الأدنى '.self::MIN_SIDE.'×'.self::MIN_SIDE.' بكسل).';
        }
        if ($info[0] * $info[1] > self::MAX_PIXELS) {
            return 'أبعاد الصورة كبيرة جداً، اختر صورة أصغر.';
        }
        if (! ImageSanitizer::available()) {
            return 'معالجة الصور غير متاحة على الخادم حالياً.';
        }

        return null;
    }

    /**
     * Validates, rebuilds and stores the photo of $user; removes the previous one.
     *
     * @return array{path:string,url:string,bytes:int,mime:string,source_mime:string,source_bytes:int,had_avatar:bool}
     *
     * @throws \InvalidArgumentException with an Arabic message when the file is refused
     */
    public static function save(User $user, UploadedFile $file): array
    {
        if ($err = self::check($file)) {
            throw new \InvalidArgumentException($err);
        }
        $src = (string) $file->getRealPath();
        $sourceMime = self::detectMime($src);
        $raw = @file_get_contents($src);
        $img = $raw === false ? false : @imagecreatefromstring($raw);
        if (! $img) {
            throw new \InvalidArgumentException('تعذّر قراءة الصورة. جرّب صورة أخرى بصيغة JPG أو PNG أو WEBP.');
        }
        $img = self::orient($img, $src, $sourceMime);
        $w = imagesx($img);
        $h = imagesy($img);
        $side = min($w, $h);
        $dst = imagecreatetruecolor(self::SIZE, self::SIZE);
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        imagefill($dst, 0, 0, imagecolorallocatealpha($dst, 255, 255, 255, 127));
        imagecopyresampled($dst, $img, 0, 0, intdiv($w - $side, 2), intdiv($h - $side, 2), self::SIZE, self::SIZE, $side, $side);
        imagedestroy($img);

        $tmp = tempnam(sys_get_temp_dir(), 'avt');
        if ($tmp === false) {
            imagedestroy($dst);
            throw new \RuntimeException('tmp failed');
        }
        try {
            if (function_exists('imagewebp')) {
                $ok = imagewebp($dst, $tmp, 88);
                $ext = 'webp';
                $mime = 'image/webp';
            } else {
                $flat = imagecreatetruecolor(self::SIZE, self::SIZE);
                imagefill($flat, 0, 0, imagecolorallocate($flat, 255, 255, 255));
                imagealphablending($flat, true);
                imagecopy($flat, $dst, 0, 0, 0, 0, self::SIZE, self::SIZE);
                $ok = imagejpeg($flat, $tmp, 90);
                imagedestroy($flat);
                $ext = 'jpg';
                $mime = 'image/jpeg';
            }
        } finally {
            imagedestroy($dst);
        }
        if (! $ok || ! is_file($tmp) || filesize($tmp) < 16 || ! @getimagesize($tmp)) {
            @unlink($tmp);
            throw new \RuntimeException('encode failed');
        }
        $bytes = (int) filesize($tmp);
        $name = 'u'.$user->id.'-'.Str::random(20).'.'.$ext;
        $path = Storage::disk('public')->putFileAs(self::DIR, new HttpFile($tmp), $name);
        @unlink($tmp);
        if (! $path) {
            throw new \RuntimeException('storage failed');
        }
        $old = $user->avatar_path;
        $user->avatar_path = $path;
        $user->save();
        self::deleteFile($user, $old);

        return ['path' => $path, 'url' => self::url($path), 'bytes' => $bytes, 'mime' => $mime, 'source_mime' => $sourceMime, 'source_bytes' => (int) $file->getSize(), 'had_avatar' => (bool) $old];
    }

    /** Clears the photo of $user and deletes the file when it is one of this class' own files. Returns true when there was a photo. */
    public static function remove(User $user): bool
    {
        $old = $user->avatar_path;
        if (! $old) {
            return false;
        }
        $user->avatar_path = null;
        $user->save();
        self::deleteFile($user, $old);

        return true;
    }

    /** Public URL of a stored avatar path (null when empty or unsafe). */
    public static function url(?string $path): ?string
    {
        $path = trim((string) $path);
        if ($path === '' || str_contains($path, '..') || str_contains($path, "\0")) {
            return null;
        }
        if (preg_match('#^https?://#i', $path)) {
            return $path;
        }

        return '/storage/'.ltrim($path, '/');
    }

    /** Only files this class created (uploads/avatars/u{id}-…) are ever deleted from disk. */
    private static function deleteFile(User $user, ?string $path): void
    {
        $path = (string) $path;
        if ($path !== '' && preg_match('#^'.preg_quote(self::DIR, '#').'/u'.(int) $user->id.'-[A-Za-z0-9]+\.(webp|jpg)$#', $path)) {
            try {
                Storage::disk('public')->delete($path);
            } catch (\Throwable $e) {
                report($e);
            }
        }
    }

    private static function detectMime(string $path): string
    {
        if (function_exists('finfo_open')) {
            $f = @finfo_open(FILEINFO_MIME_TYPE);
            if ($f) {
                $m = @finfo_file($f, $path);
                finfo_close($f);
                if (is_string($m)) {
                    return strtolower($m);
                }
            }
        }

        return (string) (@getimagesize($path)['mime'] ?? '');
    }

    private static function orient($img, string $path, string $mime)
    {
        if ($mime !== 'image/jpeg' || ! function_exists('exif_read_data')) {
            return $img;
        }
        $o = (int) (@exif_read_data($path)['Orientation'] ?? 1);
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
