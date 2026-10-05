<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\Audit;
use App\Support\HomeSections as H;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/** «الصفحة الرئيسية»: page + JSON API (GET data, PUT save, DELETE reset). Permissions: homepage.view / homepage.edit (route names homepage.*). */
class HomepageController extends Controller
{
    public function index()
    {
        return view('admin.homepage.index', ['boot' => H::payload()]);
    }

    public function data(): JsonResponse
    {
        return response()->json(['data' => H::payload()]);
    }

    public function save(Request $request): JsonResponse
    {
        $in = $request->json()->all() ?: $request->all();
        $errors = H::validate((array) $in);
        if ($errors) {
            throw ValidationException::withMessages($errors);
        }
        $before = H::load(true);
        $after = H::save((array) $in);
        Audit::log('homepage.update', $this->describe($before, $after), null, [
            'order' => $after['order'],
            'hidden' => $after['hidden'],
            'edited_sections' => array_keys($after['text']),
        ]);

        return response()->json(['data' => H::payload(true), 'message' => 'تم حفظ أقسام الصفحة الرئيسية.']);
    }

    /** DELETE /admin/homepage: back to the original order, visibility and texts. */
    public function reset(): JsonResponse
    {
        H::reset();
        Audit::log('homepage.reset', 'استعادة الصفحة الرئيسية للوضع الافتراضي (الترتيب والإظهار والنصوص)');

        return response()->json(['data' => H::payload(false), 'message' => 'تمت استعادة الصفحة الرئيسية الافتراضية.']);
    }

    private function describe(array $before, array $after): string
    {
        $parts = [];
        if ($before['order'] !== $after['order']) {
            $parts[] = 'تغيير الترتيب';
        }
        $hide = array_values(array_diff($after['hidden'], $before['hidden']));
        $show = array_values(array_diff($before['hidden'], $after['hidden']));
        if ($hide) {
            $parts[] = 'إخفاء: '.implode('، ', $hide);
        }
        if ($show) {
            $parts[] = 'إظهار: '.implode('، ', $show);
        }
        $changed = [];
        foreach (array_unique(array_merge(array_keys($before['text']), array_keys($after['text']))) as $id) {
            if (($before['text'][$id] ?? null) !== ($after['text'][$id] ?? null)) {
                $changed[] = $id;
            }
        }
        if ($changed) {
            $parts[] = 'تعديل نصوص: '.implode('، ', $changed);
        }

        return 'تحديث أقسام الصفحة الرئيسية'.($parts ? ' ('.implode(' — ', $parts).')' : ' (بدون تغيير)');
    }
}
