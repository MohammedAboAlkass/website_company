<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MediaFile;
use App\Support\Audit;
use App\Support\ContentSupport as CS;
use App\Support\MediaManager;
use App\Support\Req;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * مكتبة الوسائط (/admin/media): every uploaded image / video / PDF / document is a row of `media_files`.
 * Permissions (route name -> module `media`, see config/permissions.php): media.view (page, usage) / media.create (upload)
 * / media.edit (name, alt, caption) / media.delete (delete, bulk delete). Files that are in use are never deleted.
 */
class MediaController extends Controller
{
    private const PER_PAGE = 24;
    private const MAX_FILES = 20;

    public function index(Request $request)
    {
        $q = mb_substr(trim(Req::str($request, 'q', '')), 0, 80);
        $type = in_array(Req::str($request, 'type', ''), ['image', 'video', 'pdf', 'document'], true) ? Req::str($request, 'type') : '';
        $view = Req::str($request, 'view', 'grid') === 'list' ? 'list' : 'grid';

        $query = MediaFile::query()->with('uploader:id,name');
        if ($q !== '') {
            $like = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $q).'%';
            $query->where(fn ($w) => $w->where('title', 'like', $like)->orWhere('original_name', 'like', $like)
                ->orWhere('alt_text', 'like', $like)->orWhere('caption', 'like', $like));
        }
        $this->typeFilter($query, $type);
        $files = $query->orderByDesc('id')->paginate(self::PER_PAGE)->withQueryString();

        $counts = MediaFile::query()->selectRaw("
            COUNT(*) total,
            SUM(mime_type LIKE 'image/%') images,
            SUM(mime_type LIKE 'video/%') videos,
            SUM(mime_type = 'application/pdf') pdfs,
            COALESCE(SUM(size_bytes),0) bytes")->first();
        $total = (int) $counts->total;
        $images = (int) $counts->images;
        $videos = (int) $counts->videos;
        $pdfs = (int) $counts->pdfs;

        return view('admin.media.index', [
            'files' => $files,
            'rows' => $files->getCollection()->map(fn (MediaFile $m) => $this->row($m))->values()->all(),
            'q' => $q,
            'type' => $type,
            'view' => $view,
            'stats' => ['total' => $total, 'images' => $images, 'videos' => $videos, 'docs' => max(0, $total - $images - $videos), 'pdfs' => $pdfs, 'bytes' => (int) $counts->bytes],
            'limits' => ['image' => MediaManager::limitLabel('image'), 'video' => MediaManager::limitLabel('video'), 'document' => MediaManager::limitLabel('document')],
            'accept' => MediaManager::accept(),
            'kindLabels' => MediaManager::KIND_LABELS,
            'kindIcons' => MediaManager::KIND_ICONS,
        ]);
    }

    /** POST /admin/media (multipart: files[]) — one request can carry several files; each is checked on its own. */
    public function store(Request $request)
    {
        $files = $request->file('files', $request->file('file'));
        $files = $files instanceof \Illuminate\Http\UploadedFile ? [$files] : array_values(array_filter((array) $files));
        if (! $files) {
            $msg = $request->server('CONTENT_LENGTH') && (int) $request->server('CONTENT_LENGTH') > 0 && empty($_FILES)
                ? 'حجم الرفع أكبر من الحد المسموح في إعدادات الخادم.' : 'اختر ملفاً واحداً على الأقل.';

            return $this->fail($request, $msg, 422);
        }
        if (count($files) > self::MAX_FILES) {
            return $this->fail($request, 'الحد الأقصى '.self::MAX_FILES.' ملفاً في كل مرة.', 422);
        }
        $done = [];
        $errors = [];
        foreach ($files as $file) {
            $verdict = MediaManager::inspect($file);
            if (is_string($verdict)) {
                $errors[] = $verdict;
                continue;
            }
            try {
                $m = MediaManager::store($file, $verdict, (int) $request->user()->id);
            } catch (\Throwable $e) {
                report($e);
                $errors[] = '«'.mb_substr((string) $file->getClientOriginalName(), 0, 60).'»: تعذّر حفظ الملف.';
                continue;
            }
            Audit::log('media.upload', 'رفع ملف إلى مكتبة الوسائط: '.$m->original_name, $m, ['type' => 'media', 'kind' => $m->kind(), 'size' => (int) $m->size_bytes]);
            $done[] = $m;
        }
        if ($request->expectsJson()) {
            return response()->json([
                'uploaded' => array_map(fn (MediaFile $m) => $this->row($m), $done),
                'errors' => $errors,
                'message' => $done ? 'تم رفع '.count($done).' ملف.' : ($errors[0] ?? 'تعذّر الرفع.'),
            ], $done ? 201 : 422);
        }
        $back = redirect()->route('admin.media.index');
        if ($done) {
            $back->with('success', 'تم رفع '.count($done).' ملف.'.($errors ? ' تعذّر رفع '.count($errors).': '.implode(' ', $errors) : ''));
        } else {
            $back->with('error', implode(' ', $errors));
        }

        return $back;
    }

    /** GET /admin/media/{media}/usage — where the file is used (shown in the details drawer before deleting). */
    public function usage(string $media): JsonResponse
    {
        $m = MediaFile::findOrFail($media);
        $usages = MediaManager::usages($m);

        return response()->json(['used' => $usages !== [], 'usages' => $usages, 'protected' => ! MediaManager::isUpload($m)]);
    }

    public function update(Request $request, string $media)
    {
        $m = MediaFile::findOrFail($media);
        $d = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'caption' => ['nullable', 'string', 'max:500'],
        ], [
            'title.max' => 'الاسم طويل جداً (الحد 255 حرفاً).',
            'alt_text.max' => 'النص البديل طويل جداً (الحد 255 حرفاً).',
            'caption.max' => 'التعليق طويل جداً (الحد 500 حرف).',
        ]);
        $clean = fn (?string $v) => ($v !== null && trim(preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $v)) !== '') ? trim(preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $v)) : null;
        // only the fields that were sent are touched (a partial request never wipes the other fields)
        if (array_key_exists('title', $d)) {
            $m->title = $clean($d['title']) ?? mb_substr(trim((string) pathinfo((string) $m->original_name, PATHINFO_FILENAME)), 0, 255) ?: null;
        }
        if (array_key_exists('alt_text', $d)) {
            $m->alt_text = $clean($d['alt_text']);
        }
        if (array_key_exists('caption', $d)) {
            $m->caption = $clean($d['caption']);
        }
        $m->save();
        if ($m->wasChanged()) {
            Audit::log('media.update', 'تعديل بيانات ملف: '.($m->title ?: $m->original_name), $m, ['type' => 'media']);
        }
        if ($request->expectsJson()) {
            return response()->json(['data' => $this->row($m->fresh('uploader:id,name')), 'message' => 'تم حفظ التعديلات.']);
        }

        return redirect()->back()->with('success', 'تم حفظ بيانات الملف.');
    }

    public function destroy(Request $request, string $media)
    {
        $m = MediaFile::findOrFail($media);
        $name = $m->title ?: $m->original_name;
        if (! MediaManager::isUpload($m)) {
            return $this->fail($request, 'هذا الملف جزء من تصميم الموقع ولا يمكن حذفه من المكتبة.', 422);
        }
        $usages = MediaManager::usages($m, 3);
        if ($usages) {
            return $this->fail($request, 'لا يمكن حذف «'.$name.'» لأنه مستخدم في: '.$this->usageText($usages).'. أزله من هناك أولاً.', 422);
        }
        if (! MediaManager::delete($m)) {
            return $this->fail($request, 'تعذّر حذف الملف.', 422);
        }
        Audit::log('media.delete', 'حذف ملف من مكتبة الوسائط: '.$name, $m, ['type' => 'media']);
        if ($request->expectsJson()) {
            return response()->json(['message' => 'تم حذف الملف.', 'deleted' => (int) $media]);
        }

        return redirect()->back()->with('success', 'تم حذف الملف «'.$name.'».');
    }

    /** POST /admin/media/bulk-delete (ids[]) — deletes the unused uploads, skips the rest and says why. */
    public function bulkDelete(Request $request)
    {
        $v = $request->validate(['ids' => ['required', 'array', 'min:1', 'max:100'], 'ids.*' => ['integer']], [
            'ids.required' => 'حدّد ملفاً واحداً على الأقل.', 'ids.min' => 'حدّد ملفاً واحداً على الأقل.', 'ids.max' => 'الحد الأقصى 100 ملف في كل مرة.',
        ]);
        $deleted = [];
        $used = 0;
        $protected = 0;
        foreach (MediaFile::query()->whereIn('id', $v['ids'])->get() as $m) {
            $name = $m->title ?: $m->original_name;
            if (! MediaManager::isUpload($m)) {
                $protected++;
            } elseif (MediaManager::isUsed($m)) {
                $used++;
            } elseif (MediaManager::delete($m)) {
                $deleted[] = $name;
            }
        }
        if ($deleted) {
            Audit::log('media.bulk-delete', 'حذف '.count($deleted).' ملف من مكتبة الوسائط', null, ['type' => 'media', 'count' => count($deleted), 'files' => array_slice($deleted, 0, 20), 'skipped_in_use' => $used, 'skipped_protected' => $protected]);
        }
        $msg = 'تم حذف '.count($deleted).' ملف.'.($used ? ' تم تخطّي '.$used.' لأنها مستخدمة.' : '').($protected ? ' تم تخطّي '.$protected.' من ملفات تصميم الموقع.' : '');
        if ($request->expectsJson()) {
            return response()->json(['message' => $msg, 'deleted' => count($deleted), 'skipped_in_use' => $used, 'skipped_protected' => $protected], $deleted ? 200 : 422);
        }

        return redirect()->back()->with($deleted ? 'success' : 'error', $msg);
    }

    // ------------------------------------------------------------------

    private function typeFilter($query, string $type): void
    {
        match ($type) {
            'image' => $query->where('mime_type', 'like', 'image/%'),
            'video' => $query->where('mime_type', 'like', 'video/%'),
            'pdf' => $query->where('mime_type', 'application/pdf'),
            'document' => $query->where(fn ($w) => $w->whereNull('mime_type')->orWhere(fn ($x) => $x->where('mime_type', 'not like', 'image/%')
                ->where('mime_type', 'not like', 'video/%')->where('mime_type', '!=', 'application/pdf'))),
            default => null,
        };
    }

    /** @param array<int,array{label:string,title:?string}> $usages */
    private function usageText(array $usages): string
    {
        return implode('، ', array_map(fn ($u) => $u['label'].($u['title'] ? ' «'.mb_substr($u['title'], 0, 40).'»' : ''), array_slice($usages, 0, 3)));
    }

    private function fail(Request $request, string $message, int $status)
    {
        if ($request->expectsJson()) {
            return response()->json(['message' => $message], $status);
        }

        return redirect()->back()->with('error', $message);
    }

    private function row(MediaFile $m): array
    {
        $url = CS::mediaUrl($m);
        $kind = $m->kind();

        return [
            'id' => $m->id,
            'kind' => $kind,
            'kind_label' => MediaManager::KIND_LABELS[$kind] ?? 'ملف',
            'icon' => MediaManager::KIND_ICONS[$kind] ?? 'draft',
            'url' => $url,
            'thumb' => MediaManager::thumbUrl($m) ?: ($kind === 'image' ? $url : null),
            'title' => $m->title ?: $m->original_name,
            'name' => $m->original_name,
            'mime' => $m->mime_type,
            'size' => CS::fmtSize((int) $m->size_bytes),
            'dims' => ($m->width && $m->height) ? $m->width.'×'.$m->height : null,
            'alt' => (string) $m->alt_text,
            'caption' => (string) $m->caption,
            'by' => $m->uploader?->name,
            'date' => $m->created_at?->format('Y-m-d H:i'),
            'upload' => MediaManager::isUpload($m),
        ];
    }
}
