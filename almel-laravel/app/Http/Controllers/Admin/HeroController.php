<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
use App\Support\Audit;
use App\Support\HeroSupport as H;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/** «إعدادات الهيرو»: page + JSON API (GET data, PUT save). Permissions: homepage.view / homepage.edit (route names hero.*). */
class HeroController extends Controller
{
    public function index()
    {
        return view('admin.hero.index', ['boot' => $this->payload()]);
    }

    public function data(): JsonResponse
    {
        return response()->json(['data' => $this->payload()]);
    }

    public function save(Request $request): JsonResponse
    {
        $payload = $request->json()->all() ?: $request->all();
        $errors = H::validate((array) $payload);
        if ($errors) {
            throw ValidationException::withMessages($errors);
        }
        $before = HeroSlide::query()->count();
        $all = H::save((array) $payload, auth()->id());
        Audit::log('hero.update', 'تعديل إعدادات الهيرو ('.count($all['slides']).' شريحة)', null, ['slides' => count($all['slides']), 'before' => $before]);

        return response()->json(['data' => $this->payload($all), 'message' => 'تم حفظ إعدادات الهيرو.']);
    }

    private function payload(?array $all = null): array
    {
        $all ??= H::loadAll();

        return [
            'settings' => $all['settings'],
            'slides' => $all['slides'],
            'saved' => (bool) $all['from_db'],
            'blank' => H::blankSlide(),
            'max_slides' => H::MAX_SLIDES,
            'site_url' => url('/'),
        ];
    }
}
