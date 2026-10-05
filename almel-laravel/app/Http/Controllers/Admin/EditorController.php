<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MediaFile;
use App\Support\Audit;
use App\Support\ContentSupport as CS;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/** Endpoints used by the shared rich-text editor (public/assets/admin/js/admin-editor.js). */
class EditorController extends Controller
{
    private const VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/ogg'];

    /** GET /admin/editor/media?q=&page= — image library (media_files), newest first, 24 per page. */
    public function media(Request $request): JsonResponse
    {
        $per = 24;
        $q = MediaFile::query()->where('mime_type', 'like', 'image/%');
        if ($s = trim(\App\Support\Req::str($request, 'q', ''))) {
            $like = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $s).'%';
            $q->where(fn ($w) => $w->where('original_name', 'like', $like)->orWhere('title', 'like', $like)->orWhere('alt_text', 'like', $like));
        }
        $total = (clone $q)->count();
        $last = max(1, (int) ceil($total / $per));
        $page = min(max(1, (int) $request->query('page', 1)), $last);
        $rows = $q->orderByDesc('id')->forPage($page, $per)->get();

        return response()->json([
            'data' => $rows->map(fn (MediaFile $m) => $this->row($m))->values(),
            'meta' => ['page' => $page, 'last' => $last, 'total' => $total],
        ]);
    }

    /** POST /admin/editor/upload (multipart: file, alt?) — stores the image + a media_files row. */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'image', 'mimes:'.implode(',', CS::IMAGE_MIMES), 'max:'.CS::maxUploadKb()],
            'alt' => ['nullable', 'string', 'max:255'],
        ], [
            'file.required' => 'اختر صورة أولاً.',
            'file.image' => 'الملف المرفوع ليس صورة صالحة.',
            'file.mimes' => 'الصيغ المدعومة: JPG، PNG، WebP، GIF.',
            'file.max' => 'حجم الصورة أكبر من الحد المسموح ('.CS::maxUploadMb().' ميغابايت).',
            'file.uploaded' => 'حجم الصورة أكبر من الحد المسموح ('.CS::maxUploadMb().' ميغابايت).',
        ]);
        $m = CS::storeImage($request->file('file'), $request->input('alt'));
        Audit::log('media.upload', 'رفع صورة من المحرر: '.$m->original_name, $m);

        return response()->json(['data' => $this->row($m)], 201);
    }

    /** POST /admin/editor/video (multipart: file) — mp4 / webm upload. */
    public function video(Request $request): JsonResponse
    {
        $kb = $this->videoMaxKb();
        $mb = rtrim(rtrim(number_format($kb / 1024, 1, '.', ''), '0'), '.');
        $request->validate([
            'file' => ['required', 'file', 'mimetypes:'.implode(',', self::VIDEO_MIMES), 'max:'.$kb],
        ], [
            'file.required' => 'اختر ملف فيديو أولاً.',
            'file.mimetypes' => 'الصيغ المدعومة للفيديو: MP4 أو WebM.',
            'file.max' => 'حجم الفيديو أكبر من الحد المسموح ('.$mb.' ميغابايت). يمكنك استخدام رابط YouTube أو Vimeo بدلاً من الرفع.',
            'file.uploaded' => 'حجم الفيديو أكبر من الحد المسموح ('.$mb.' ميغابايت). يمكنك استخدام رابط YouTube أو Vimeo بدلاً من الرفع.',
        ]);
        $file = $request->file('file');
        $mime = (string) $file->getMimeType();
        $ext = match ($mime) {
            'video/webm' => 'webm',
            'video/ogg' => 'ogv',
            default => 'mp4',
        };
        $original = mb_substr($file->getClientOriginalName(), 0, 255);
        $size = (int) $file->getSize();
        $path = $file->storeAs('uploads/videos/'.date('Y/m'), Str::random(24).'.'.$ext, 'public');
        $m = MediaFile::create([
            'disk' => 'public',
            'path' => $path,
            'original_name' => $original,
            'mime_type' => $mime,
            'size_bytes' => $size,
            'title' => mb_substr(pathinfo($original, PATHINFO_FILENAME), 0, 255),
            'uploaded_by' => auth()->id(),
        ]);
        Audit::log('media.upload', 'رفع فيديو من المحرر: '.$m->original_name, $m);

        return response()->json(['data' => ['id' => $m->id, 'url' => CS::mediaUrl($m), 'name' => $m->original_name, 'mime' => $mime]], 201);
    }

    /** GET /admin/editor/limits — what the editor may upload on this server. */
    public function limits(): JsonResponse
    {
        return response()->json(['data' => ['image_kb' => CS::maxUploadKb(), 'image_mb' => CS::maxUploadMb(), 'video_kb' => $this->videoMaxKb()]]);
    }

    private function row(MediaFile $m): array
    {
        $url = CS::mediaUrl($m);

        return [
            'id' => $m->id,
            'url' => $url,
            'name' => $m->original_name ?: $m->title,
            'alt' => $m->alt_text ?? '',
            'width' => $m->width,
            'height' => $m->height,
            'size' => CS::fmtSize((int) $m->size_bytes),
        ];
    }

    /** 50 MB, but never more than the PHP upload_max_filesize / post_max_size of this server. */
    private function videoMaxKb(): int
    {
        $limit = 50 * 1024;
        foreach (['upload_max_filesize', 'post_max_size'] as $k) {
            $v = trim((string) ini_get($k));
            if ($v === '' || $v === '0') {
                continue;
            }
            $n = (int) $v;
            $unit = strtolower(substr($v, -1));
            $kb = match ($unit) {
                'g' => $n * 1024 * 1024,
                'm' => $n * 1024,
                'k' => $n,
                default => (int) ($n / 1024),
            };
            $limit = min($limit, max(1, $kb));
        }

        return $limit;
    }
}
