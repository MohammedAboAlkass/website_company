<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BackupRun;
use App\Support\Audit;
use App\Support\BackupService as BS;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

/** النسخ الاحتياطي: real export / import of the CMS data (permissions backup.view / backup.manage). */
class BackupController extends Controller
{
    public function index()
    {
        return view('admin.backup.index', ['groups' => $this->groups()]);
    }

    public function data(): JsonResponse
    {
        $runs = BackupRun::query()->with('user:id,name')->orderByDesc('id')->limit(40)->get()->map(fn (BackupRun $r) => $this->row($r))->values();

        return response()->json(['data' => ['groups' => $this->groups(), 'runs' => $runs]]);
    }

    public function export(Request $request): JsonResponse
    {
        $d = $request->validate(['groups' => ['required', 'array', 'min:1'], 'groups.*' => ['string'], 'note' => ['nullable', 'string', 'max:300']], ['groups.required' => 'اختر مجموعة واحدة على الأقل.', 'groups.min' => 'اختر مجموعة واحدة على الأقل.']);
        $groups = array_values(array_intersect(BS::groupKeys(), $d['groups']));
        if (! $groups) {
            return response()->json(['message' => 'المجموعات المختارة غير صالحة.'], 422);
        }
        try {
            $run = BS::export($groups, 'export', $d['note'] ?? null);
        } catch (\Throwable $e) {
            report($e);
            \App\Support\NotificationService::backupFailed($e->getMessage(), auth()->id());

            return response()->json(['message' => 'تعذّر إنشاء النسخة: '.$e->getMessage()], 500);
        }
        Audit::log('backup.export', 'إنشاء نسخة احتياطية ('.implode('، ', $groups).')', $run, ['file' => $run->filename, 'rows' => $run->rows_count]);
        \App\Support\NotificationService::backupDone((string) $run->filename, (int) $run->rows_count, auth()->id());

        return response()->json(['data' => $this->row($run->load('user:id,name')), 'url' => route('admin.backup.download', $run->id), 'message' => 'تم إنشاء النسخة الاحتياطية']);
    }

    public function download(int $run)
    {
        $r = BackupRun::findOrFail($run);
        $path = BS::pathOf($r);
        abort_unless($path, 404, 'ملف النسخة غير موجود.');
        Audit::log('backup.download', 'تنزيل نسخة احتياطية', $r, ['file' => $r->filename]);

        return response()->download($path, $r->filename, ['Content-Type' => 'application/json; charset=utf-8', 'Cache-Control' => 'no-store']);
    }

    /** Step 1 of an import: validate the uploaded file and return a preview (nothing is changed). */
    public function inspect(Request $request): JsonResponse
    {
        $request->validate(['file' => ['required', 'file', 'max:51200']], ['file.required' => 'اختر ملف النسخة الاحتياطية.', 'file.max' => 'حجم الملف أكبر من 50 ميغابايت.', 'file.file' => 'الملف غير صالح.']);
        $json = (string) file_get_contents($request->file('file')->getRealPath());
        $r = BS::inspect($json, $request->user()->isSuperAdmin());
        if ($r['errors'] || ! $r['doc']) {
            return response()->json(['message' => $r['errors'][0] ?? 'الملف غير صالح.', 'errors' => ['file' => $r['errors']], 'warnings' => $r['warnings']], 422);
        }
        BS::purgeTmp();
        $token = Str::lower(Str::random(40));
        file_put_contents(BS::tmpDir().DIRECTORY_SEPARATOR.$token.'.json', $json, LOCK_EX);
        $doc = $r['doc'];

        return response()->json(['data' => [
            'token' => $token, 'created_at' => $doc['created_at'] ?? null, 'groups' => $r['doc']['groups'],
            'tables' => array_map(fn ($t) => $t + ['label' => $t['table']], $r['tables']), 'warnings' => $r['warnings'],
            'file' => $request->file('file')->getClientOriginalName(),
        ]]);
    }

    /** Step 2: replace the selected groups with the file content (safety copy first, one transaction). */
    public function restore(Request $request): JsonResponse
    {
        $d = $request->validate([
            'token' => ['required', 'string', 'regex:/^[a-z0-9]{40}$/'],
            'groups' => ['required', 'array', 'min:1'], 'groups.*' => ['string'],
            'confirm' => ['required', 'string'],
            'password' => ['required', 'string', 'max:255'],
        ], ['groups.required' => 'اختر مجموعة واحدة على الأقل للاستعادة.', 'groups.min' => 'اختر مجموعة واحدة على الأقل للاستعادة.', 'confirm.required' => 'اكتب كلمة التأكيد.', 'password.required' => 'أدخل كلمة مرورك الحالية لتأكيد الاستعادة.']);
        if (trim($d['confirm']) !== 'استعادة') {
            return response()->json(['message' => 'اكتب كلمة «استعادة» بالضبط لتأكيد العملية.', 'errors' => ['confirm' => ['اكتب كلمة «استعادة» بالضبط.']]], 422);
        }
        // re-authentication: the restore replaces live data, so the current password is required (5 wrong tries / 10 min lock it)
        $me = $request->user();
        $pwKey = 'backup-restore-pw|'.$me->id.'|'.$request->ip();
        if (RateLimiter::tooManyAttempts($pwKey, 5)) {
            return response()->json(['message' => 'محاولات كثيرة بكلمة مرور خاطئة. أعد المحاولة بعد '.RateLimiter::availableIn($pwKey).' ثانية.'], 429);
        }
        if (! Hash::check($d['password'], (string) $me->password)) {
            RateLimiter::hit($pwKey, 600);
            Audit::log('backup.restore_denied', 'رُفضت استعادة نسخة احتياطية: كلمة المرور غير صحيحة', null, ['type' => 'security']);

            return response()->json(['message' => 'كلمة المرور غير صحيحة.', 'errors' => ['password' => ['كلمة المرور غير صحيحة.']]], 422);
        }
        RateLimiter::clear($pwKey);
        $canAccess = $me->isSuperAdmin();
        $file = BS::tmpDir().DIRECTORY_SEPARATOR.$d['token'].'.json';
        if (! is_file($file)) {
            return response()->json(['message' => 'انتهت صلاحية الملف المرفوع. ارفعه من جديد.'], 410);
        }
        $r = BS::inspect((string) file_get_contents($file), $canAccess);
        if ($r['errors'] || ! $r['doc']) {
            return response()->json(['message' => $r['errors'][0] ?? 'الملف غير صالح.'], 422);
        }
        $groups = array_values(array_intersect($d['groups'], $r['doc']['groups']));
        if (! $groups) {
            return response()->json(['message' => 'المجموعات المختارة غير موجودة في الملف.'], 422);
        }
        try {
            $safety = BS::export($groups, 'pre_restore', 'نسخة أمان تلقائية قبل الاستعادة');
        } catch (\Throwable $e) {
            report($e);

            return response()->json(['message' => 'تعذّر إنشاء نسخة الأمان، لم يتم تغيير شيء: '.$e->getMessage()], 500);
        }
        try {
            $done = BS::restore($r['doc'], $groups, $canAccess);
        } catch (\Throwable $e) {
            report($e);
            BackupRun::create(['kind' => 'import', 'status' => 'failed', 'scope' => $groups, 'user_id' => auth()->id(), 'note' => mb_substr($e->getMessage(), 0, 480), 'created_at' => now()]);
            \App\Support\NotificationService::backupFailed('فشلت استعادة نسخة احتياطية: '.mb_substr($e->getMessage(), 0, 150), auth()->id());
            Audit::log('backup.restore_failed', 'فشلت استعادة نسخة احتياطية (لم يتغيّر شيء)', null, ['error' => mb_substr($e->getMessage(), 0, 300)]);

            return response()->json(['message' => 'فشلت الاستعادة وتم التراجع عن كل التغييرات: '.mb_substr($e->getMessage(), 0, 250)], 422);
        }
        @unlink($file);
        $run = BackupRun::create([
            'kind' => 'import', 'status' => 'ok', 'scope' => $groups, 'tables_count' => count($done), 'rows_count' => array_sum($done),
            'checksum' => $r['doc']['checksum'] ?? null, 'user_id' => auth()->id(), 'note' => 'نسخة الأمان: '.$safety->filename, 'created_at' => now(),
        ]);
        Audit::log('backup.restore', 'استعادة نسخة احتياطية ('.implode('، ', $groups).')', $run, ['rows' => array_sum($done), 'safety' => $safety->filename]);

        return response()->json(['message' => 'تمت الاستعادة بنجاح ('.array_sum($done).' صفاً في '.count($done).' جدولاً). نسخة الأمان محفوظة في السجل.', 'data' => ['tables' => $done, 'safety_id' => $safety->id]]);
    }

    public function destroy(int $run): JsonResponse
    {
        $r = BackupRun::findOrFail($run);
        if ($p = BS::pathOf($r)) {
            @unlink($p);
        }
        $r->delete();
        Audit::log('backup.delete', 'حذف سجل نسخة احتياطية', null, ['file' => $r->filename]);

        return response()->json(['message' => 'تم حذف النسخة من السجل']);
    }

    private function groups(): array
    {
        $out = [];
        foreach (BS::GROUPS as $k => $g) {
            $tables = BS::tablesOf([$k]);
            $out[] = ['key' => $k, 'label' => $g['label'], 'hint' => $g['hint'], 'default' => $g['default'], 'sensitive' => $g['sensitive'], 'tables' => count($tables), 'rows' => array_sum(BS::liveCounts([$k]))];
        }

        return $out;
    }

    private function row(BackupRun $r): array
    {
        return [
            'id' => $r->id, 'kind' => $r->kind, 'status' => $r->status, 'filename' => $r->filename, 'size' => (int) $r->size_bytes,
            'scope' => $r->scope ?? [], 'tables' => (int) $r->tables_count, 'rows' => (int) $r->rows_count, 'note' => $r->note,
            'user' => $r->user?->name, 'created_at' => $r->created_at?->toIso8601String(), 'available' => (bool) BS::pathOf($r),
        ];
    }
}
