<?php

namespace App\Support;

use App\Models\MediaFile;
use Illuminate\Http\File as HttpFile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Media library (/admin/media): validation + safe storage of uploads, file kinds, and "where is this file used".
 *
 * Upload rules: an allow-list of extensions; the real content type is read with finfo (the browser-sent type and the
 * file name are never trusted); documents also need the right magic bytes; images must be real images and are
 * re-encoded through GD (ImageSanitizer); files get a random name and the extension of the DETECTED type;
 * php / executable / script names are refused even as a middle extension (shell.php.jpg).
 */
class MediaManager
{
    public const KIND_LABELS = ['image' => 'صورة', 'video' => 'فيديو', 'pdf' => 'PDF', 'document' => 'مستند', 'other' => 'ملف'];
    public const KIND_ICONS = ['image' => 'image', 'video' => 'movie', 'pdf' => 'picture_as_pdf', 'document' => 'description', 'other' => 'draft'];

    /** ext => [kind, accepted finfo types, canonical extension] */
    private const ALLOWED = [
        'jpg' => ['image', ['image/jpeg'], 'jpg'], 'jpeg' => ['image', ['image/jpeg'], 'jpg'],
        'png' => ['image', ['image/png'], 'png'], 'webp' => ['image', ['image/webp'], 'webp'], 'gif' => ['image', ['image/gif'], 'gif'],
        'mp4' => ['video', ['video/mp4'], 'mp4'], 'webm' => ['video', ['video/webm'], 'webm'],
        'pdf' => ['pdf', ['application/pdf'], 'pdf'],
        'doc' => ['document', ['application/msword', 'application/vnd.ms-office', 'application/x-ole-storage', 'application/CDFV2', 'application/octet-stream'], 'doc'],
        'xls' => ['document', ['application/vnd.ms-excel', 'application/vnd.ms-office', 'application/x-ole-storage', 'application/CDFV2', 'application/octet-stream'], 'xls'],
        'ppt' => ['document', ['application/vnd.ms-powerpoint', 'application/vnd.ms-office', 'application/x-ole-storage', 'application/CDFV2', 'application/octet-stream'], 'ppt'],
        'docx' => ['document', ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/octet-stream'], 'docx'],
        'xlsx' => ['document', ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip', 'application/octet-stream'], 'xlsx'],
        'pptx' => ['document', ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/zip', 'application/octet-stream'], 'pptx'],
        'txt' => ['document', ['text/plain'], 'txt'], 'csv' => ['document', ['text/csv', 'text/plain', 'application/csv'], 'csv'],
    ];

    /** Any dotted part of the file name that is executable / scriptable / active content => refused. */
    private const BLOCKED_PART = '/^(php\d*|phtml|pht|phar|phps|exe|dll|bat|cmd|com|msi|scr|sh|bash|zsh|js|mjs|jse|jsp|jspx|asp|aspx|cgi|pl|py|rb|vbs|vbe|ps1|jar|war|htaccess|htpasswd|html?|xhtml|svg|svgz|xml|swf|hta|lnk|reg|so)$/i';

    /** @return string[] extensions the library accepts (for the file input / messages) */
    public static function extensions(): array
    {
        return array_keys(self::ALLOWED);
    }

    public static function accept(): string
    {
        return implode(',', array_map(fn ($e) => '.'.$e, self::extensions()));
    }

    public static function kindOf(?string $mime): string
    {
        $m = strtolower((string) $mime);
        if (str_starts_with($m, 'image/')) {
            return 'image';
        }
        if (str_starts_with($m, 'video/')) {
            return 'video';
        }
        if ($m === 'application/pdf') {
            return 'pdf';
        }
        if ($m === '') {
            return 'other';
        }
        if (str_starts_with($m, 'text/') || str_contains($m, 'msword') || str_contains($m, 'officedocument') || str_contains($m, 'ms-excel') || str_contains($m, 'ms-powerpoint') || $m === 'application/zip') {
            return 'document';
        }

        return 'other';
    }

    /** Upload limit in KB for a kind: 10 MB images, 50 MB video, 20 MB documents - never above php.ini upload_max_filesize / post_max_size. */
    public static function limitKb(string $kind): int
    {
        $cap = match ($kind) {
            'image' => 10 * 1024,
            'video' => 50 * 1024,
            default => 20 * 1024,
        };
        foreach (['upload_max_filesize', 'post_max_size'] as $k) {
            $kb = self::iniKb((string) ini_get($k));
            if ($kb > 0) {
                $cap = min($cap, $kb);
            }
        }

        return max(1, $cap);
    }

    public static function limitLabel(string $kind): string
    {
        $mb = self::limitKb($kind) / 1024;

        return rtrim(rtrim(number_format($mb, 1, '.', ''), '0'), '.').' ميغابايت';
    }

    private static function iniKb(string $v): int
    {
        $v = trim($v);
        if ($v === '' || $v === '0' || $v === '-1') {
            return 0;
        }
        $n = (float) $v;
        $bytes = match (strtolower(substr($v, -1))) {
            'g' => $n * 1073741824,
            'm' => $n * 1048576,
            'k' => $n * 1024,
            default => $n,
        };

        return (int) floor($bytes / 1024);
    }

    /**
     * Checks one uploaded file.
     *
     * @return array{kind:string,mime:string,ext:string}|string  the verdict, or an Arabic error message
     */
    public static function inspect(UploadedFile $file): array|string
    {
        $name = (string) $file->getClientOriginalName();
        $label = $name !== '' ? '«'.mb_substr($name, 0, 60).'»: ' : '';
        if (! $file->isValid()) {
            return match ($file->getError()) {
                UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => $label.'حجم الملف أكبر من الحد المسموح في إعدادات الخادم.',
                UPLOAD_ERR_PARTIAL => $label.'لم يكتمل رفع الملف، حاول مرة أخرى.',
                default => $label.'تعذّر رفع الملف.',
            };
        }
        $parts = array_values(array_filter(explode('.', $name), fn ($p) => $p !== ''));
        $ext = count($parts) > 1 ? strtolower((string) end($parts)) : '';
        foreach (array_slice($parts, 1) as $p) { // every extension-like part, not only the last
            if (preg_match(self::BLOCKED_PART, trim($p))) {
                return $label.'نوع الملف غير مسموح لأسباب أمنية.';
            }
        }
        if ($ext === '' || ! isset(self::ALLOWED[$ext])) {
            return $label.'نوع الملف غير مدعوم. الأنواع المسموحة: '.implode('، ', array_map('strtoupper', ['jpg', 'png', 'webp', 'gif', 'mp4', 'webm', 'pdf', 'docx', 'xlsx', 'pptx', 'doc', 'xls', 'ppt', 'txt', 'csv'])).'.';
        }
        [$kind, $mimes, $canon] = self::ALLOWED[$ext];
        $path = (string) $file->getRealPath();
        $size = (int) $file->getSize();
        if ($size <= 0 || $path === '' || ! is_file($path)) {
            return $label.'الملف فارغ أو غير قابل للقراءة.';
        }
        if ($size > self::limitKb($kind) * 1024) {
            return $label.'حجم الملف أكبر من الحد المسموح لهذا النوع ('.self::limitLabel($kind).').';
        }
        $mime = self::detectMime($path);
        if (! in_array($mime, $mimes, true)) {
            return $label.'محتوى الملف لا يطابق امتداده، تم رفضه.';
        }
        $head = (string) @file_get_contents($path, false, null, 0, 4096);
        if ($kind === 'image') {
            $info = @getimagesize($path);
            $want = ['image/jpeg' => IMAGETYPE_JPEG, 'image/png' => IMAGETYPE_PNG, 'image/gif' => IMAGETYPE_GIF, 'image/webp' => IMAGETYPE_WEBP][$mime] ?? null;
            if (! $info || $want === null || $info[2] !== $want) {
                return $label.'الملف ليس صورة صالحة.';
            }
        } elseif ($kind === 'pdf') {
            if (! str_contains(substr($head, 0, 1024), '%PDF-')) {
                return $label.'الملف ليس PDF صالحاً.';
            }
        } elseif (in_array($ext, ['doc', 'xls', 'ppt'], true)) {
            if (! str_starts_with($head, "\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1")) {
                return $label.'الملف ليس مستند Office صالحاً.';
            }
        } elseif (in_array($ext, ['docx', 'xlsx', 'pptx'], true)) {
            if (! str_starts_with($head, "PK\x03\x04") || ! self::isOoxml($path, $ext)) {
                return $label.'الملف ليس مستند Office صالحاً.';
            }
        } elseif (in_array($ext, ['txt', 'csv'], true)) {
            if (preg_match('/<\?(php|=)|<script\b/i', (string) @file_get_contents($path, false, null, 0, 262144))) {
                return $label.'محتوى الملف النصي غير مسموح.';
            }
        } elseif ($kind === 'video') {
            if ($ext === 'mp4' && ! str_contains(substr($head, 0, 64), 'ftyp')) {
                return $label.'الملف ليس فيديو MP4 صالحاً.';
            }
            if ($ext === 'webm' && ! str_starts_with($head, "\x1A\x45\xDF\xA3")) {
                return $label.'الملف ليس فيديو WebM صالحاً.';
            }
        }
        if (in_array($kind, ['video', 'pdf', 'document'], true) && preg_match('/<\?php/i', $head)) {
            return $label.'محتوى الملف غير مسموح.';
        }

        return ['kind' => $kind, 'mime' => $mime, 'ext' => $canon];
    }

    /** Stores an inspected upload: random name, images re-encoded, row in media_files. */
    public static function store(UploadedFile $file, array $verdict, ?int $userId = null): MediaFile
    {
        $kind = $verdict['kind'];
        $mime = $verdict['mime'];
        $ext = $verdict['ext'];
        $original = mb_substr((string) $file->getClientOriginalName(), 0, 255);
        $dir = match ($kind) {
            'video' => 'uploads/videos/'.date('Y/m'),
            'image' => 'uploads/'.date('Y/m'),
            default => 'uploads/files/'.date('Y/m'),
        };
        $name = Str::random(24).'.'.$ext;
        $size = (int) $file->getSize();
        $w = $h = null;
        if ($kind === 'image') {
            $dims = @getimagesize($file->getRealPath()) ?: [null, null];
            $clean = ImageSanitizer::clean($file->getRealPath(), $mime);
            if ($clean) {
                $path = Storage::disk('public')->putFileAs($dir, new HttpFile($clean['path']), $name);
                $size = (int) filesize($clean['path']);
                $mime = $clean['mime'];
                $dims = @getimagesize($clean['path']) ?: $dims;
                @unlink($clean['path']);
            } else {
                $path = Storage::disk('public')->putFileAs($dir, new HttpFile($file->getRealPath()), $name);
            }
            $w = $dims[0] ?: null;
            $h = $dims[1] ?: null;
        } else {
            $path = Storage::disk('public')->putFileAs($dir, new HttpFile($file->getRealPath()), $name);
        }
        if (! $path) {
            throw new \RuntimeException('storage failed');
        }
        if ($kind === 'image') {
            self::makeThumb(Storage::disk('public')->path($path), $path);
        }

        return MediaFile::create([
            'disk' => 'public',
            'path' => $path,
            'original_name' => $original,
            'mime_type' => $mime,
            'size_bytes' => $size,
            'width' => $w,
            'height' => $h,
            'title' => mb_substr(trim((string) pathinfo($original, PATHINFO_FILENAME)), 0, 255) ?: null,
            'uploaded_by' => $userId ?? auth()->id(),
        ]);
    }

    // ------------------------------------------------------------------ thumbnails

    /** Library thumbnail of an uploaded image (small WebP, made at upload time; older uploads simply have none). */
    public static function thumbRel(string $path): string
    {
        return 'uploads/thumbs/'.pathinfo($path, PATHINFO_FILENAME).'.webp';
    }

    /** Public URL of the thumbnail when it exists on disk, else null. */
    public static function thumbUrl(MediaFile $m): ?string
    {
        if (! self::isUpload($m) || $m->kind() !== 'image') {
            return null;
        }
        $rel = self::thumbRel((string) $m->path);
        try {
            return Storage::disk($m->disk ?: 'public')->exists($rel) ? '/storage/'.$rel : null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    private static function makeThumb(string $abs, string $path): void
    {
        try {
            if (! ImageSanitizer::available() || ! function_exists('imagewebp')) {
                return;
            }
            $info = @getimagesize($abs);
            if (! $info || $info[0] < 1 || $info[1] < 1 || ($info[0] * $info[1]) > 36000000 || $info[2] === IMAGETYPE_GIF) {
                return; // animated GIFs keep the original as their preview
            }
            $img = match ($info[2]) {
                IMAGETYPE_JPEG => @imagecreatefromjpeg($abs),
                IMAGETYPE_PNG => @imagecreatefrompng($abs),
                IMAGETYPE_WEBP => @imagecreatefromwebp($abs),
                default => false,
            };
            if (! $img) {
                return;
            }
            $r = min(1, 480 / max($info[0], $info[1]));
            $nw = max(1, (int) round($info[0] * $r));
            $nh = max(1, (int) round($info[1] * $r));
            $dst = imagecreatetruecolor($nw, $nh);
            imagealphablending($dst, false);
            imagesavealpha($dst, true);
            imagefill($dst, 0, 0, imagecolorallocatealpha($dst, 0, 0, 0, 127));
            imagecopyresampled($dst, $img, 0, 0, 0, 0, $nw, $nh, $info[0], $info[1]);
            $tmp = tempnam(sys_get_temp_dir(), 'thm');
            if ($tmp !== false && imagewebp($dst, $tmp, 80) && filesize($tmp) > 0) {
                Storage::disk('public')->putFileAs('uploads/thumbs', new HttpFile($tmp), basename(self::thumbRel($path)));
            }
            if ($tmp !== false) {
                @unlink($tmp);
            }
            imagedestroy($img);
            imagedestroy($dst);
        } catch (\Throwable $e) {
            report($e);
        }
    }

    private static function detectMime(string $path): string
    {
        if (function_exists('finfo_open')) {
            $f = @finfo_open(FILEINFO_MIME_TYPE);
            if ($f) {
                $m = @finfo_file($f, $path);
                finfo_close($f);
                if (is_string($m) && $m !== '') {
                    return strtolower($m);
                }
            }
        }

        return 'application/octet-stream';
    }

    private static function isOoxml(string $path, string $ext): bool
    {
        if (! class_exists(\ZipArchive::class)) {
            return true; // magic bytes already checked
        }
        $z = new \ZipArchive;
        if ($z->open($path) !== true) {
            return false;
        }
        $prefix = ['docx' => 'word/', 'xlsx' => 'xl/', 'pptx' => 'ppt/'][$ext];
        $ok = $z->locateName('[Content_Types].xml') !== false && self::zipHasPrefix($z, $prefix);
        $z->close();

        return $ok;
    }

    private static function zipHasPrefix(\ZipArchive $z, string $prefix): bool
    {
        for ($i = 0, $n = min($z->numFiles, 400); $i < $n; $i++) {
            if (str_starts_with((string) $z->getNameIndex($i), $prefix)) {
                return true;
            }
        }

        return false;
    }

    /** Files that belong to the site itself (demo images under assets/site/img): editable metadata, never deleted. */
    public static function isUpload(MediaFile $m): bool
    {
        return str_starts_with((string) $m->path, 'uploads/');
    }

    // ------------------------------------------------------------------ usage

    /** table, column, label, title column (null = none) , soft deletes */
    private const FK_REFS = [
        ['projects', 'cover_media_id', 'غلاف مشروع', 'title', true],
        ['project_images', 'media_id', 'صورة ضمن مشروع', null, false],
        ['articles', 'cover_media_id', 'غلاف خبر', 'title', true],
        ['gallery_albums', 'cover_media_id', 'غلاف ألبوم', 'name', false],
        ['gallery_items', 'media_id', 'عنصر في المعرض', 'title', true],
        ['stories', 'image_media_id', 'قصة ميدانية', 'person_name', true],
        ['activities', 'image_media_id', 'نشاط ميداني', 'title', true],
        ['partners', 'logo_media_id', 'شعار شريك', 'name', true],
        ['appeals', 'image_media_id', 'نداء الإغاثة', null, false],
        ['pages', 'og_media_id', 'صورة مشاركة صفحة', 'title', true],
        ['page_sections', 'media_id', 'قسم في صفحة', 'title', false],
        ['page_section_blocks', 'media_id', 'عنصر في قسم', 'title', false],
    ];

    /** table, column, label, title column, soft deletes - columns that can hold the file's URL inside text / JSON */
    private const TEXT_REFS = [
        ['articles', 'body', 'نص خبر', 'title', true],
        ['projects', 'description', 'وصف مشروع', 'title', true],
        ['project_updates', 'body', 'تحديث مشروع', null, false],
        ['pages', 'body', 'نص صفحة', 'title', true],
        ['page_sections', 'body', 'قسم في صفحة', 'title', false],
        ['page_sections', 'settings', 'إعدادات قسم', 'title', false],
        ['page_section_blocks', 'text', 'عنصر في قسم', 'title', false],
        ['page_section_blocks', 'data', 'عنصر في قسم', 'title', false],
        ['announcements', 'details', 'إعلان', null, false],
        ['appeals', 'description', 'نداء الإغاثة', null, false],
        ['faqs', 'answer', 'سؤال شائع', null, false],
        ['programs', 'description', 'برنامج', null, false],
        ['hero_slides', 'background', 'شريحة الواجهة', 'label', false],
        ['hero_slides', 'content', 'شريحة الواجهة', 'label', false],
        ['hero_slides', 'style', 'شريحة الواجهة', 'label', false],
        ['hero_settings', 'config', 'إعدادات الواجهة', null, false],
        ['settings', 'value', 'إعدادات الموقع', null, false],
        ['gallery_items', 'video_url', 'فيديو في المعرض', 'title', true],
        ['users', 'avatar_path', 'صورة مستخدم', 'name', true],
    ];

    /**
     * Records that use the file: foreign keys + the file's URL inside text / JSON (editor bodies, hero, settings).
     *
     * @return array<int,array{label:string,title:?string}>
     */
    public static function usages(MediaFile $m, int $max = 40): array
    {
        $out = [];
        foreach (self::FK_REFS as [$table, $col, $label, $titleCol, $soft]) {
            try {
                $q = DB::table($table)->where($col, $m->id);
                if ($soft) {
                    $q->whereNull('deleted_at');
                }
                foreach ($q->limit(5)->get() as $row) {
                    $out[] = ['label' => $label, 'title' => $titleCol ? ($row->{$titleCol} ?? null) : null];
                }
            } catch (\Throwable $e) {
                // table or column missing in this install
            }
        }
        $needle = self::needle($m);
        if ($needle !== null) {
            $like = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $needle).'%';
            foreach (self::TEXT_REFS as [$table, $col, $label, $titleCol, $soft]) {
                try {
                    $q = DB::table($table)->where($col, 'like', $like);
                    if ($soft) {
                        $q->whereNull('deleted_at');
                    }
                    foreach ($q->limit(5)->get() as $row) {
                        $out[] = ['label' => $label, 'title' => $titleCol ? ($row->{$titleCol} ?? null) : null];
                    }
                } catch (\Throwable $e) {
                    // ignore
                }
            }
        }
        // the same record can match several columns: show it once
        $seen = [];
        $uniq = [];
        foreach ($out as $u) {
            $k = $u['label'].'|'.$u['title'];
            if (! isset($seen[$k])) {
                $seen[$k] = true;
                $uniq[] = $u;
            }
        }

        return array_slice($uniq, 0, $max);
    }

    public static function isUsed(MediaFile $m): bool
    {
        return self::usages($m, 1) !== [];
    }

    /** The random file name is unique, so it finds the file whatever the URL prefix or slash escaping around it. */
    private static function needle(MediaFile $m): ?string
    {
        $base = basename((string) $m->path);

        return strlen($base) >= 8 ? $base : null;
    }

    /** Removes the file + row of an unused upload. Returns false (nothing removed) when the file is in use or protected. */
    public static function delete(MediaFile $m): bool
    {
        if (! self::isUpload($m) || self::isUsed($m)) {
            return false;
        }
        try {
            $disk = Storage::disk($m->disk ?: 'public');
            $disk->delete($m->path);
            $disk->delete(self::thumbRel((string) $m->path));
        } catch (\Throwable $e) {
            report($e);
        }

        return (bool) $m->forceDelete();
    }
}
