<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\Audit;
use App\Support\Maintenance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/** Maintenance mode of the public site (settings.view / settings.edit). Page = /admin/maintenance (static status view + a control card for authorised users). */
class MaintenanceController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json(['data' => $this->payload()]);
    }

    public function update(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'enabled' => ['required', 'boolean'],
            'message' => ['nullable', 'string', 'max:1000'],
            'ips' => ['nullable', 'string', 'max:2000'],
            'from' => ['nullable', 'string', 'max:20'],
            'until' => ['nullable', 'string', 'max:20'],
        ], [
            'enabled.required' => 'حدّد حالة وضع الصيانة.',
            'message.max' => 'رسالة الصيانة طويلة جداً (1000 حرف كحد أقصى).',
        ]);
        $v->after(function ($v) use ($request) {
            $msg = trim((string) $request->input('message'));
            if ($request->boolean('enabled') && mb_strlen($msg) < 10) {
                $v->errors()->add('message', 'اكتب رسالة للزوار (10 أحرف على الأقل).');
            }
            $bad = [];
            foreach (preg_split('/[\s,;]+/u', (string) $request->input('ips'), -1, PREG_SPLIT_NO_EMPTY) ?: [] as $p) {
                if (! Maintenance::validIp($p)) {
                    $bad[] = $p;
                }
            }
            if ($bad) {
                $v->errors()->add('ips', 'عناوين IP غير صالحة: '.implode('، ', array_slice($bad, 0, 3)));
            }
            foreach (['from' => 'وقت البدء', 'until' => 'وقت الانتهاء'] as $f => $label) {
                if (trim((string) $request->input($f)) !== '' && Maintenance::normDate($request->input($f)) === null) {
                    $v->errors()->add($f, $label.' غير صالح.');
                }
            }
            $from = Maintenance::normDate($request->input('from'));
            $until = Maintenance::normDate($request->input('until'));
            if ($from && $until && $until <= $from) {
                $v->errors()->add('until', 'وقت الانتهاء يجب أن يكون بعد وقت البدء.');
            }
        });
        $d = $v->validate();

        $before = Maintenance::load();
        Maintenance::save([
            'enabled' => (bool) $d['enabled'],
            'message' => trim((string) ($d['message'] ?? '')) !== '' ? trim((string) $d['message']) : Maintenance::DEFAULT_MESSAGE,
            'ips' => Maintenance::parseIps((string) ($d['ips'] ?? '')),
            'from' => Maintenance::normDate($d['from'] ?? '') ?? '',
            'until' => Maintenance::normDate($d['until'] ?? '') ?? '',
        ]);
        $after = Maintenance::load();
        $word = $after['enabled'] ? 'تفعيل' : 'إيقاف';
        Audit::log('maintenance.update', ($before['enabled'] !== $after['enabled'] ? $word.' وضع الصيانة' : 'تعديل إعدادات وضع الصيانة'),
            null, ['enabled' => $after['enabled'], 'ips' => count($after['ips']), 'from' => $after['from'], 'until' => $after['until']]);
        if ($before['enabled'] !== $after['enabled']) {
            \App\Support\NotificationService::maintenanceToggled((bool) $after['enabled'], $request->user()->id);
        }

        return response()->json(['data' => $this->payload(), 'message' => $after['enabled'] ? 'وضع الصيانة مفعّل للزوار الآن' : 'تم إيقاف وضع الصيانة']);
    }

    private function payload(): array
    {
        $c = Maintenance::load();

        return [
            'enabled' => $c['enabled'],
            'status' => Maintenance::status($c),
            'message' => $c['message'],
            'ips' => implode("\n", $c['ips']),
            'from' => $c['from'] ? str_replace(' ', 'T', $c['from']) : '',
            'until' => $c['until'] ? str_replace(' ', 'T', $c['until']) : '',
            'my_ip' => request()->ip(),
        ];
    }
}
