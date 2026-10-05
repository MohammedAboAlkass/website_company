<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Support\Audit;
use App\Support\ContentSupport as CS;
use App\Support\PeopleSupport as PS;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/** Frequently asked questions (table `faqs`, soft delete). The answer is rich text (sanitised HTML). */
class FaqController extends Controller
{
    /** GET /admin/faqs : redirect to the page (HTML) or the list (JSON). */
    public function index(Request $request)
    {
        if (! $request->expectsJson()) {
            return redirect()->route('admin.faq');
        }

        return response()->json(['data' => Faq::orderBy('sort_order')->orderBy('id')->get()->map(fn (Faq $f) => $this->row($f))->values()]);
    }

    public function show(Request $request, string $id)
    {
        if (! $request->expectsJson()) {
            return redirect()->route('admin.faq');
        }
        $f = Faq::find($id);

        return $f ? response()->json(['data' => $this->row($f)]) : response()->json(['message' => 'السؤال غير موجود.'], 404);
    }

    public function create()
    {
        return redirect()->route('admin.faq');
    }

    public function edit(string $id)
    {
        return redirect()->route('admin.faq');
    }

    public function store(Request $request): JsonResponse
    {
        $d = $this->validated($request);
        $f = new Faq();
        $this->fill($f, $d);
        $f->sort_order = PS::nextOrder(Faq::class);
        $f->is_published = array_key_exists('is_published', $d) ? (bool) $d['is_published'] : true;
        $f->save();
        Audit::log('faq.create', 'إضافة سؤال شائع: '.mb_substr($f->question, 0, 80), $f);

        return response()->json(['data' => $this->row($f->fresh()), 'message' => 'تمت إضافة السؤال'], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $f = Faq::findOrFail($id);
        $d = $this->validated($request);
        $this->fill($f, $d);
        if (array_key_exists('is_published', $d)) {
            $f->is_published = (bool) $d['is_published'];
        }
        $f->save();
        Audit::log('faq.update', 'تعديل سؤال شائع: '.mb_substr($f->question, 0, 80), $f);

        return response()->json(['data' => $this->row($f->fresh()), 'message' => 'تم حفظ التغييرات']);
    }

    public function destroy(Request $request, string $id)
    {
        $f = Faq::findOrFail($id);
        $q = mb_substr($f->question, 0, 80);
        $f->delete();
        Audit::log('faq.delete', 'حذف سؤال شائع: '.$q, $f);

        return $request->expectsJson() ? response()->json(['message' => 'تم حذف السؤال']) : redirect()->route('admin.faq');
    }

    public function toggle(Request $request, string $id): JsonResponse
    {
        $f = Faq::findOrFail($id);
        $f->is_published = $request->has('visible') ? $request->boolean('visible') : ! $f->is_published;
        $f->save();
        Audit::log('faq.visibility', ($f->is_published ? 'إظهار سؤال شائع: ' : 'إخفاء سؤال شائع: ').mb_substr($f->question, 0, 80), $f);

        return response()->json(['data' => $this->row($f->fresh()), 'message' => $f->is_published ? 'أصبح السؤال ظاهراً' : 'تم إخفاء السؤال']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $data = $request->validate(['ids' => ['required', 'array', 'max:500'], 'ids.*' => ['integer']], ['ids.required' => 'قائمة الترتيب مطلوبة.']);
        PS::reorder(Faq::class, $data['ids']);
        Audit::log('faq.reorder', 'تغيير ترتيب الأسئلة الشائعة');

        return response()->json(['message' => 'تم حفظ الترتيب']);
    }

    // ------------------------------------------------------------------

    private function validated(Request $request): array
    {
        $v = Validator::make($request->all(), [
            'question' => ['required', 'string', 'max:1000'],
            'answer' => ['required', 'string', 'max:60000'],
            'is_published' => ['nullable', 'boolean'],
        ], [
            'question.required' => 'نص السؤال مطلوب.',
            'answer.required' => 'نص الإجابة مطلوب.',
            'answer.max' => 'الإجابة طويلة جداً.',
        ]);
        $v->after(function ($v) use ($request) {
            $q = (string) PS::text($request->input('question'));
            if ($q === '') {
                $v->errors()->add('question', 'نص السؤال مطلوب.');
            } elseif (mb_strlen($q) < 5) {
                $v->errors()->add('question', 'السؤال قصير جداً (5 أحرف على الأقل).');
            } elseif (mb_strlen($q) > 255) {
                $v->errors()->add('question', 'السؤال يجب ألا يتجاوز 255 حرفاً.');
            }
            $a = CS::plainText(CS::cleanHtml((string) $request->input('answer')));
            if ($a === '') {
                $v->errors()->add('answer', 'نص الإجابة مطلوب.');
            } elseif (mb_strlen($a) > 5000) {
                $v->errors()->add('answer', 'الإجابة يجب ألا تتجاوز 5000 حرف.');
            }
        });

        return $v->validate();
    }

    private function fill(Faq $f, array $d): void
    {
        $f->question = mb_substr((string) PS::text($d['question']), 0, 255);
        $f->answer = (string) CS::cleanHtml($d['answer']);
    }

    private function row(Faq $f): array
    {
        return ['id' => $f->id, 'question' => $f->question, 'answer' => $f->answer, 'visible' => (bool) $f->is_published, 'sort_order' => (int) $f->sort_order];
    }
}
