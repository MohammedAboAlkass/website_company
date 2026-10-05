<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\Audit;
use App\Support\ContentSupport;
use App\Support\PeopleSupport as PS;
use App\Support\VisionSupport as V;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/** «الرؤية والرسالة والقيم»: page + JSON API (GET data, PUT save, POST image). Permissions: vision.view / vision.edit (route names vision.*). */
class VisionController extends Controller
{
    public function index()
    {
        return view('admin.vision.index', ['boot' => $this->payload()]);
    }

    public function data(): JsonResponse
    {
        return response()->json(['data' => $this->payload()]);
    }

    public function save(Request $request): JsonResponse
    {
        $payload = $request->json()->all() ?: $request->all();
        $errors = V::validate((array) $payload);
        if ($errors) {
            throw ValidationException::withMessages($errors);
        }
        $cards = V::save((array) $payload, auth()->id());
        Audit::log('vision.update', 'تعديل بطاقات الرؤية والرسالة والقيم ('.count(array_filter($cards, fn ($c) => $c['visible'])).' ظاهرة من '.count($cards).')', null, ['visible' => array_column(array_filter($cards, fn ($c) => $c['visible']), 'id')]);

        return response()->json(['data' => $this->payload($cards, true), 'message' => 'تم حفظ بطاقات الرؤية والرسالة والقيم.']);
    }

    /** POST /admin/vision/image (multipart "file"): validated + sanitised upload; returns the path the card stores. */
    public function image(Request $request): JsonResponse
    {
        $m = PS::upload($request, 'صورة بطاقة الرؤية والرسالة والقيم');
        $url = ContentSupport::mediaUrl($m);

        return response()->json(['data' => ['id' => $m->id, 'url' => $url, 'path' => ltrim((string) $url, '/')]], 201);
    }

    private function payload(?array $cards = null, ?bool $saved = null): array
    {
        $all = V::loadAll();

        return [
            'cards' => $cards ?? $all['cards'],
            'defaults' => V::defaults(),
            'icons' => V::icons(),
            'max' => V::MAX,
            'saved' => $saved ?? (bool) $all['from_db'],
            'image_max_mb' => (float) ContentSupport::maxUploadMb(),
            'site_url' => url('/'),
        ];
    }
}
