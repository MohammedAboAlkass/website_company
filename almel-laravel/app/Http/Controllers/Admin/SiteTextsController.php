<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\Audit;
use App\Support\ContentSupport;
use App\Support\PeopleSupport as PS;
use App\Support\SiteTexts as S;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * «نصوص الموقع»: page + JSON API (GET data, PUT save, PUT reset, POST image).
 * Permissions: pages.view / pages.edit (route names site-texts.* -> `pages` module in config/permissions.php).
 */
class SiteTextsController extends Controller
{
    public function index()
    {
        return view('admin.site-texts.index', ['boot' => S::payload()]);
    }

    public function data(): JsonResponse
    {
        return response()->json(['data' => S::payload()]);
    }

    public function save(Request $request): JsonResponse
    {
        // ConvertEmptyStringsToNull turns "" into null: optional fields that were left empty must stay empty strings
        $in = $this->nullsToEmpty((array) ($request->json()->all() ?: $request->all()));
        $errors = S::validate($in);
        if ($errors) {
            throw ValidationException::withMessages($errors);
        }
        $before = S::load(true);
        $after = S::save($in);
        Audit::log('site_texts.update', $this->describe($before, $after), null, [
            'edited_texts' => count($after['text']),
            'edited_lists' => array_keys($after['lists']),
            'changed' => $this->changedKeys($before, $after),
        ]);

        return response()->json(['data' => S::payload(), 'message' => 'تم حفظ نصوص الموقع.']);
    }

    /** PUT /admin/site-texts/reset {scope?}: back to the original texts of one tab, or of everything. */
    public function reset(Request $request): JsonResponse
    {
        $scope = $request->input('scope');
        if ($scope !== null && $scope !== 'all' && ! in_array($scope, S::sectionIds(), true)) {
            throw ValidationException::withMessages(['scope' => ['القسم غير معروف.']]);
        }
        $scope = ($scope === null || $scope === 'all') ? null : (string) $scope;
        S::reset($scope);
        $label = $scope === null ? 'كل نصوص الموقع' : 'نصوص قسم «'.collect(\App\Support\SiteTextsRegistry::SECTIONS)->firstWhere('id', $scope)['label'].'»';
        Audit::log('site_texts.reset', 'استعادة '.$label.' للوضع الافتراضي', null, ['scope' => $scope ?? 'all']);

        return response()->json(['data' => S::payload(), 'message' => 'تمت استعادة النصوص الافتراضية.']);
    }

    /** POST /admin/site-texts/image (multipart "file"): validated + sanitised upload; returns the path the setting stores. */
    public function image(Request $request): JsonResponse
    {
        $m = PS::upload($request, 'صورة الخريطة');
        $url = ContentSupport::mediaUrl($m);

        return response()->json(['data' => ['id' => $m->id, 'url' => $url, 'path' => ltrim((string) $url, '/')]], 201);
    }

    private function nullsToEmpty(array $a): array
    {
        foreach ($a as $k => $v) {
            $a[$k] = $v === null ? '' : (is_array($v) ? $this->nullsToEmpty($v) : $v);
        }

        return $a;
    }

    private function changedKeys(array $before, array $after): array
    {
        $keys = [];
        foreach (array_unique(array_merge(array_keys($before['text']), array_keys($after['text']))) as $k) {
            if (($before['text'][$k] ?? null) !== ($after['text'][$k] ?? null)) {
                $keys[] = $k;
            }
        }
        foreach (array_unique(array_merge(array_keys($before['lists']), array_keys($after['lists']))) as $k) {
            if (($before['lists'][$k] ?? null) !== ($after['lists'][$k] ?? null)) {
                $keys[] = $k;
            }
        }

        return $keys;
    }

    private function describe(array $before, array $after): string
    {
        $changed = $this->changedKeys($before, $after);
        if (! $changed) {
            return 'تحديث نصوص الموقع (بدون تغيير)';
        }
        $tabs = [];
        foreach (\App\Support\SiteTextsRegistry::SECTIONS as $s) {
            [$keys, $lists] = S::keysOf($s['id']);
            if (array_intersect($changed, array_merge($keys, $lists))) {
                $tabs[] = $s['label'];
            }
        }

        return 'تحديث نصوص الموقع ('.count($changed).' عنصراً — '.implode('، ', $tabs).')';
    }
}
