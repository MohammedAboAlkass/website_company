<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ConstantGroup;
use App\Models\ConstantItem;
use App\Models\User;
use App\Support\Audit;
use App\Support\ConstantsStore;
use App\Support\HomeSections;
use App\Support\SettingsStore;
use App\Support\SiteTheme;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

/** General settings + «ثوابت النظام» JSON API (admin only; routes in routes/admin.php). */
class SettingsController extends Controller
{
    private const LABELS = [
        'general' => 'الإعدادات العامة', 'appearance' => 'المظهر', 'site_theme' => 'مظهر الموقع', 'users' => 'المستخدمون والصلاحيات',
        'security' => 'الأمان', 'notifications' => 'الإشعارات', 'seo' => 'محركات البحث والسوشال',
        'backup' => 'النسخ الاحتياطي', 'integrations' => 'التكاملات', 'api_keys' => 'مفاتيح API', 'twofa' => 'المصادقة الثنائية',
    ];

    public function index(Request $request)
    {
        return view('admin.settings.index', ['settingsBoot' => $this->payload($request)]);
    }

    public function data(Request $request): JsonResponse
    {
        return response()->json($this->payload($request));
    }

    private function payload(Request $request): array
    {
        return [
            'settings' => SettingsStore::all(),
            'constants' => ConstantsStore::groups(),
            'users' => $this->users($request),
            'roles' => \App\Models\Role::query()->ordered()->get(['role_key', 'name_ar'])->map(fn ($r) => ['id' => $r->role_key, 'label' => $r->name_ar])->all(),
            'sessions' => $this->sessions($request),
            'audit' => $this->audit(),
            'siteTheme' => SiteTheme::registry(),
        ];
    }

    private function users(Request $request): array
    {
        return User::query()->orderBy('id')->get()->map(function (User $u) use ($request) {
            $status = $u->status === 'disabled' || $u->status === 'inactive' ? 'disabled' : ($u->status === 'invited' ? 'invited' : 'active');

            return [
                'id' => 'u'.$u->id, 'name' => $u->name, 'email' => $u->email, 'role' => $u->role, 'status' => $status,
                'last' => $u->last_login_at ? max(0, (int) round(now()->diffInMinutes($u->last_login_at, true))) : null,
                'me' => $u->id === $request->user()->id,
            ];
        })->all();
    }

    private function sessions(Request $request): array
    {
        $now = time();
        $current = $request->session()->getId();

        return DB::table('sessions')->where('user_id', $request->user()->id)->orderByDesc('last_activity')->limit(30)->get()
            ->map(function ($s) use ($now, $current) {
                $ua = (string) $s->user_agent;
                $browser = str_contains($ua, 'Edg/') ? 'Edge' : (str_contains($ua, 'OPR/') || str_contains($ua, 'Opera') ? 'Opera' : (str_contains($ua, 'Firefox') ? 'Firefox' : (str_contains($ua, 'Chrome') ? 'Chrome' : (str_contains($ua, 'Safari') ? 'Safari' : 'متصفح'))));
                $os = str_contains($ua, 'Windows') ? 'Windows' : (str_contains($ua, 'iPhone') ? 'iPhone' : (str_contains($ua, 'iPad') ? 'iPad' : (str_contains($ua, 'Android') ? 'Android' : (str_contains($ua, 'Mac OS') ? 'macOS' : (str_contains($ua, 'Linux') ? 'Linux' : '')))));
                $device = in_array($os, ['iPhone', 'Android'], true) ? 'smartphone' : ($os === 'iPad' ? 'tablet' : ($os === 'macOS' ? 'laptop_mac' : 'computer'));
                $o = [
                    'id' => $s->id, 'device' => $device, 'name' => $browser.($os ? ' على '.$os : ''), 'place' => 'غير معروف',
                    'ip' => (string) $s->ip_address, 'mins' => $s->id === $current ? 0 : max(0, (int) floor(($now - (int) $s->last_activity) / 60)),
                ];
                if ($s->id === $current) {
                    $o['current'] = true;
                }

                return $o;
            })->all();
    }

    private function audit(): array
    {
        $icons = ['settings' => 'tune', 'users' => 'manage_accounts', 'security' => 'shield_lock', 'backup' => 'backup', 'integrations' => 'link', 'content' => 'edit_note'];

        return DB::table('audit_logs')->leftJoin('users', 'users.id', '=', 'audit_logs.user_id')
            ->orderByDesc('audit_logs.id')->limit(300)
            ->get(['audit_logs.action', 'audit_logs.description', 'audit_logs.ip_address', 'audit_logs.created_at', 'users.name as uname'])
            ->map(function ($a) use ($icons) {
                $p = strtolower((string) strtok((string) $a->action, '.'));
                $type = match (true) {
                    str_starts_with($p, 'setting') => 'settings',
                    str_starts_with($p, 'user') => 'users',
                    in_array($p, ['auth', 'login', 'logout', 'security', 'session'], true) => 'security',
                    $p === 'backup' => 'backup',
                    str_starts_with($p, 'integration') => 'integrations',
                    default => 'content',
                };

                return [
                    't' => $a->created_at ? strtotime($a->created_at) * 1000 : 0, 'by' => $a->uname ?: 'النظام', 'text' => (string) $a->description,
                    'type' => $type, 'icon' => $icons[$type], 'ip' => (string) $a->ip_address,
                ];
            })->all();
    }

    /* ------------------------------------------------------------------ settings sections */

    public function update(Request $request, string $group): JsonResponse
    {
        if (! in_array($group, array_keys(self::LABELS), true)) {
            return $this->fail('قسم الإعدادات غير معروف.', 404);
        }
        $v = Validator::make($request->all(), $this->rules($group), $this->messages(), $this->attributes());
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()], 422);
        }
        $data = $request->input('data');
        if ($group === 'general' && ! empty($data['maintenance']) && mb_strlen(trim((string) ($data['maintenanceMsg'] ?? ''))) < 10) {
            return $this->fail('اكتب رسالة للزوار (10 أحرف على الأقل).');
        }
        if ($group === 'site_theme') {
            $problems = SiteTheme::problems($request->input('data'));
            if ($problems) {
                return response()->json(['message' => (string) reset($problems), 'errors' => array_map(fn ($m) => [$m], $problems)], 422);
            }
        }
        $siteChanged = [];
        if ($group === 'general') {
            $cleaned = $this->cleanSiteTexts($data);
            if (is_string($cleaned)) {
                return $this->fail($cleaned);
            }
            $data = $cleaned;
            unset($data['brandColor']); // «لون الهوية» is now the primary colour of «مظهر الموقع» (saved there)
            $siteChanged = $this->siteTextChanges($data);
        }
        if ($group === 'users') {
            $data = $this->cleanUsers($data);
        } elseif (isset(SettingsStore::MAP[$group])) {
            $data = array_intersect_key($data, SettingsStore::MAP[$group]);
        }
        if (strlen(json_encode($data)) > 200000) {
            return $this->fail('حجم البيانات أكبر من المسموح.', 422);
        }
        $maintBefore = $group === 'general' ? (bool) \App\Models\Setting::query()->where('key', 'site.maintenance')->value('value') : null;
        if ($group === 'site_theme') {
            $before = SiteTheme::forAdmin();
            $saved = SiteTheme::save($data);
            $siteChanged = ['theme' => SiteTheme::describe($saved)];
            Audit::log('settings.update', 'حدّث الإعدادات: مظهر الموقع — '.SiteTheme::describe($saved).($before == $saved ? ' (دون تغيير)' : ''), null, ['section' => $group, 'template' => $saved['template'], 'gradient' => $saved['gradient']['on']]);

            return response()->json(['ok' => true, 'saved_at' => now()->timestamp * 1000, 'settings' => $saved, 'audit' => $this->audit()]);
        }
        SettingsStore::save($group, $data);
        if ($group === 'notifications') {
            \App\Support\NotificationService::forgetCache();
        }
        if ($group === 'general') {
            $maintAfter = (bool) \App\Models\Setting::query()->where('key', 'site.maintenance')->value('value');
            if ($maintBefore !== $maintAfter) {
                \App\Support\NotificationService::maintenanceToggled($maintAfter, $request->user()->id);
            }
        }
        if (! in_array($group, ['twofa'], true)) {
            Audit::log('settings.update', 'حدّث الإعدادات: '.self::LABELS[$group].($siteChanged ? ' — '.implode('، ', array_values($siteChanged)) : ''), null, ['section' => $group] + ($siteChanged ? ['fields' => array_keys($siteChanged)] : []));
        } else {
            Audit::log('security.twofa', ! empty($data['on']) ? 'فعّل المصادقة الثنائية' : 'أوقف المصادقة الثنائية', null, ['section' => $group]);
        }

        return response()->json(['ok' => true, 'saved_at' => now()->timestamp * 1000, 'settings' => SettingsStore::all()[$group] ?? $data, 'audit' => $this->audit()]);
    }

    /** Public-site texts added to «الإعدادات العامة» (contact notes, field points, newsletter box, brand colour). */
    private const SITE_TEXTS = [
        'hotlineNote' => ['ملاحظة الخط الساخن', 80],
        'emailNote' => ['ملاحظة البريد', 80],
        'fieldPoints' => ['نقاط الميدان', 600],
        'newsletterTitle' => ['عنوان النشرة البريدية', 80],
        'newsletterText' => ['نص النشرة البريدية', 300],
    ];

    /**
     * Sanitise the new public texts (plain text only: tags removed, entities decoded, whitespace collapsed),
     * normalise the field points to "a • b • c" and the brand colour to #RRGGBB. Returns the data, or an Arabic error message.
     */
    private function cleanSiteTexts(array $data): array|string
    {
        foreach (self::SITE_TEXTS as $k => [$label, $max]) {
            if (! array_key_exists($k, $data)) {
                continue;
            }
            $raw = (string) ($data[$k] ?? '');
            if ($k === 'fieldPoints') {
                $items = array_values(array_filter(array_map(fn ($x) => HomeSections::clean($x, 1000), preg_split('/[•\r\n]+/u', $raw) ?: []), fn ($x) => $x !== ''));
                if (count($items) > 8) {
                    return 'نقاط الميدان: 8 نقاط كحد أقصى (الحالي '.count($items).').';
                }
                foreach ($items as $it) {
                    if (mb_strlen($it) > 60) {
                        return 'نقاط الميدان: كل نقطة 60 حرفاً كحد أقصى («'.mb_substr($it, 0, 20).'…»).';
                    }
                }
                $data[$k] = implode(' • ', $items);
                continue;
            }
            $v = HomeSections::clean($raw, 100000);
            if (mb_strlen($v) > $max) {
                return '«'.$label.'» طويل جداً ('.$max.' حرفاً كحد أقصى).';
            }
            $data[$k] = $v;
        }
        if (array_key_exists('brandColor', $data)) {
            $c = trim((string) ($data['brandColor'] ?? ''));
            $data['brandColor'] = $c === '' ? '' : strtoupper($c);
        }

        return $data;
    }

    /** @return array<string, string> path => Arabic label of the new public texts whose stored value differs from the submitted one */
    private function siteTextChanges(array $data): array
    {
        $labels = [];
        foreach (self::SITE_TEXTS as $k => [$label]) {
            $labels[$k] = $label;
        }
        $out = [];
        foreach ($labels as $k => $label) {
            if (! array_key_exists($k, $data) || ! isset(SettingsStore::MAP['general'][$k])) {
                continue;
            }
            $key = SettingsStore::MAP['general'][$k][0];
            $old = (string) (\App\Models\Setting::query()->where('key', $key)->value('value') ?? '');
            if ($old !== (string) ($data[$k] ?? '')) {
                $out[$k] = $label;
            }
        }

        return $out;
    }

    private function cleanUsers(array $d): array
    {
        $matrix = [];
        foreach ((array) ($d['matrix'] ?? []) as $role => $perms) {
            if (is_string($role) && preg_match('/^[A-Za-z0-9_-]{1,20}$/', $role) && is_array($perms)) {
                $matrix[$role] = array_map('boolval', $perms);
            }
        }
        $matrix['admin'] = array_map(fn () => true, $matrix['admin'] ?? []);
        $custom = [];
        foreach ((array) ($d['custom'] ?? []) as $c) {
            $custom[] = ['id' => $c['id'], 'label' => trim($c['label']), 'custom' => true];
        }

        return ['matrix' => $matrix, 'custom' => $custom];
    }

    private function rules(string $group): array
    {
        $in = fn (string $g) => Rule::in(ConstantsStore::keys($g));
        $b = 'boolean';
        $base = ['data' => 'required|array'];

        return match ($group) {
            'general' => [
                'data.orgName' => 'required|string|min:2|max:150',
                'data.tagline' => 'nullable|string|max:255',
                'data.license' => 'nullable|string|max:100',
                'data.website' => ['nullable', 'string', 'max:255', 'regex:/^https?:\/\/[^\s.]+\.[^\s]{2,}$/'],
                'data.email' => 'required|email|max:190',
                'data.phone' => ['nullable', 'string', 'regex:/^[+\d\s()-]{6,22}$/'],
                'data.address' => 'nullable|string|max:255',
                'data.logo' => 'nullable|string|max:700000',
                'data.favicon' => 'nullable|string|max:700000',
                'data.timezone' => ['required', 'string', $in('timezone')],
                'data.language' => ['required', 'string', $in('language')],
                'data.dateFormat' => ['required', 'string', $in('date_format')],
                'data.maintenance' => $b,
                'data.maintenanceMsg' => 'nullable|string|max:1000',
                'data.hoursText' => 'nullable|string|max:80',
                'data.heroStat1Value' => 'nullable|string|max:20', 'data.heroStat1Label' => 'nullable|string|max:40',
                'data.heroStat2Value' => 'nullable|string|max:20', 'data.heroStat2Label' => 'nullable|string|max:40',
                'data.heroStat3Value' => 'nullable|string|max:20', 'data.heroStat3Label' => 'nullable|string|max:40',
                'data.heroStat4Value' => 'nullable|string|max:20', 'data.heroStat4Label' => 'nullable|string|max:40',
                'data.hotlineNote' => 'nullable|string|max:80',
                'data.emailNote' => 'nullable|string|max:80',
                'data.fieldPoints' => 'nullable|string|max:600',
                'data.newsletterTitle' => 'nullable|string|max:80',
                'data.newsletterText' => 'nullable|string|max:300',
                'data.brandColor' => ['nullable', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            ],
            'appearance' => [
                'data.theme' => 'required|in:light,dark',
                'data.accent' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
                'data.scale' => 'required|string|max:10',
                'data.density' => 'required|string|max:20',
                'data.sidebar' => 'required|string|max:20',
                'data.radius' => 'required|string|max:10',
            ],
            'users' => [
                'data.matrix' => 'required|array|max:12',
                'data.matrix.*' => 'array|max:30',
                'data.matrix.*.*' => $b,
                'data.custom' => 'nullable|array|max:4',
                'data.custom.*.id' => ['required', 'regex:/^[a-z0-9]{1,12}$/'],
                'data.custom.*.label' => 'required|string|min:2|max:20',
            ],
            'security' => [
                'data.minLength' => 'required|integer|between:6,64', 'data.upper' => $b, 'data.number' => $b, 'data.symbol' => $b,
                'data.reuse' => 'required|integer|between:0,24',
                'data.expiry' => ['required', 'string', $in('password_expiry')],
                'data.lockout' => 'required|integer|between:0,100',
                'data.enforce2fa' => 'required|string|max:20',
                'data.alertNewDevice' => $b, 'data.alertFailed' => $b, 'data.alertCountry' => $b,
                'data.timeout' => ['required', 'string', $in('session_timeout')],
                'data.ipAllow' => $b,
                'data.ips' => 'nullable|array|max:50',
                'data.ips.*' => ['string', 'regex:/^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}(\/([0-9]|[12]\d|3[0-2]))?$/'],
            ],
            'notifications' => [
                'data.matrix' => 'required|array|max:30',
                'data.matrix.*.email' => $b, 'data.matrix.*.app' => $b, 'data.matrix.*.sms' => $b,
                'data.quiet' => $b,
                'data.quietFrom' => 'required|date_format:H:i', 'data.quietTo' => 'required|date_format:H:i',
                'data.digest' => ['required', 'string', $in('digest_frequency')],
                'data.digestDay' => ['required', 'string', $in('digest_day')],
                'data.digestEmail' => 'nullable|email|max:190|required_unless:data.digest,off',
            ],
            'seo' => [
                'data.titleTpl' => ['required', 'string', 'max:200', 'regex:/%s/'],
                'data.metaDesc' => 'nullable|string|max:500',
                'data.index' => $b, 'data.sitemap' => $b,
                'data.ogImage' => 'nullable|string|max:500',
                'data.social' => 'nullable|array|max:12',
                'data.social.*' => 'nullable|string|max:200',
                'data.analyticsId' => ['nullable', 'regex:/^G-[A-Z0-9]{6,12}$/'],
                'data.anonymizeIp' => $b, 'data.cookieBanner' => $b,
            ],
            'backup' => [
                'data.schedule' => ['required', 'string', $in('digest_frequency')],
                'data.time' => 'required|date_format:H:i',
                'data.keep' => 'required|integer|between:1,100',
                'data.incContent' => $b, 'data.incSettings' => $b, 'data.incMedia' => $b,
                'data.dest' => 'required|string|max:20',
            ],
            'integrations' => ['data' => 'required|array|max:30'],
            'api_keys' => ['data' => 'present|array|max:50', 'data.*.id' => 'required|string|max:40', 'data.*.name' => 'required|string|max:80'],
            'twofa' => ['data.on' => 'required|boolean'],
            default => [],
        } + $base;
    }

    private function messages(): array
    {
        return [
            'required' => 'الحقل «:attribute» مطلوب.',
            'required_if' => 'اكتب رسالة للزوار (10 أحرف على الأقل).',
            'required_unless' => 'أدخل بريداً صالحاً لاستلام الملخص.',
            'string' => 'قيمة «:attribute» غير صالحة.',
            'array' => 'قيمة «:attribute» غير صالحة.',
            'boolean' => 'قيمة «:attribute» يجب أن تكون نعم أو لا.',
            'integer' => 'قيمة «:attribute» يجب أن تكون رقماً صحيحاً.',
            'email' => 'أدخل بريداً إلكترونياً صالحاً.',
            'regex' => 'صيغة «:attribute» غير صحيحة.',
            'in' => 'القيمة المختارة في «:attribute» غير موجودة في ثوابت النظام.',
            'min.string' => '«:attribute» قصير جداً (:min أحرف على الأقل).',
            'max.string' => '«:attribute» طويل جداً (:max حرفاً كحد أقصى).',
            'between.numeric' => '«:attribute» يجب أن يكون بين :min و :max.',
            'date_format' => 'صيغة الوقت في «:attribute» غير صحيحة.',
            'max.array' => 'عدد العناصر في «:attribute» أكبر من المسموح.',
            'data.titleTpl.regex' => 'يجب أن يحتوي القالب على %s مكان اسم الصفحة.',
            'data.website.regex' => 'يجب أن يبدأ الرابط بـ https://',
            'data.brandColor.regex' => 'اللون يجب أن يكون بصيغة #RRGGBB (مثال: #0C7845).',
            'data.hotlineNote.max' => 'ملاحظة الخط الساخن: 80 حرفاً كحد أقصى.',
            'data.emailNote.max' => 'ملاحظة البريد: 80 حرفاً كحد أقصى.',
            'data.fieldPoints.max' => 'نقاط الميدان طويلة جداً (600 حرف كحد أقصى).',
            'data.newsletterTitle.max' => 'عنوان النشرة البريدية: 80 حرفاً كحد أقصى.',
            'data.newsletterText.max' => 'نص النشرة البريدية: 300 حرف كحد أقصى.',
            'data.phone.regex' => 'رقم الهاتف غير صالح.',
            'data.analyticsId.regex' => 'المعرّف يبدأ بـ G- متبوعاً بأحرف كبيرة وأرقام.',
            'data.orgName.required' => 'اسم الجمعية مطلوب.',
            'data.orgName.min' => 'اسم الجمعية مطلوب.',
            'data.ips.*.regex' => 'عنوان IP غير صالح.',
        ];
    }

    private function attributes(): array
    {
        return [
            'data' => 'البيانات', 'data.orgName' => 'اسم الجمعية', 'data.email' => 'البريد الإلكتروني', 'data.phone' => 'الهاتف', 'data.website' => 'الموقع',
            'data.timezone' => 'المنطقة الزمنية', 'data.language' => 'اللغة', 'data.dateFormat' => 'تنسيق التاريخ', 'data.maintenanceMsg' => 'رسالة الصيانة',
            'data.minLength' => 'الحد الأدنى للطول', 'data.expiry' => 'انتهاء كلمة المرور', 'data.timeout' => 'مهلة الجلسة', 'data.lockout' => 'حد القفل',
            'data.digest' => 'تكرار الملخص', 'data.digestDay' => 'يوم الملخص', 'data.digestEmail' => 'بريد الملخص',
            'data.hotlineNote' => 'ملاحظة الخط الساخن', 'data.emailNote' => 'ملاحظة البريد', 'data.fieldPoints' => 'نقاط الميدان',
            'data.newsletterTitle' => 'عنوان النشرة البريدية', 'data.newsletterText' => 'نص النشرة البريدية', 'data.brandColor' => 'لون الهوية',
            'data.titleTpl' => 'قالب العنوان', 'data.analyticsId' => 'معرّف التحليلات', 'data.schedule' => 'جدولة النسخ', 'data.time' => 'الوقت', 'data.keep' => 'عدد النسخ',
            'data.theme' => 'السمة', 'data.accent' => 'لون التمييز', 'data.matrix' => 'المصفوفة', 'data.custom' => 'الأدوار المخصصة',
            'data.quietFrom' => 'بداية الهدوء', 'data.quietTo' => 'نهاية الهدوء',
        ];
    }

    /* ------------------------------------------------------------------ sessions */

    public function revokeSession(Request $request, string $id): JsonResponse
    {
        if ($id === $request->session()->getId()) {
            return $this->fail('لا يمكن إنهاء الجلسة الحالية من هنا.', 422);
        }
        $n = DB::table('sessions')->where('id', $id)->where('user_id', $request->user()->id)->delete();
        if ($n) {
            Audit::log('security.session', 'أنهى جلسة أخرى لحسابه');
        }

        return response()->json(['ok' => (bool) $n, 'sessions' => $this->sessions($request), 'audit' => $this->audit()]);
    }

    public function revokeOtherSessions(Request $request): JsonResponse
    {
        $n = DB::table('sessions')->where('user_id', $request->user()->id)->where('id', '!=', $request->session()->getId())->delete();
        Audit::log('security.session', 'أنهى كل الجلسات الأخرى', null, ['count' => $n]);

        return response()->json(['ok' => true, 'sessions' => $this->sessions($request), 'audit' => $this->audit()]);
    }

    /* ------------------------------------------------------------------ constants */

    private function group(string $key): ?ConstantGroup
    {
        return ConstantGroup::query()->key($key)->first();
    }

    private function done(ConstantGroup $g, string $audit): JsonResponse
    {
        ConstantsStore::resequence($g);
        Audit::log('settings.constants', 'ثوابت النظام — '.$g->name_ar.': '.$audit, $g, ['group' => $g->group_key]);

        return response()->json(['ok' => true, 'group' => $g->group_key, 'items' => ConstantsStore::itemsOf($g)]);
    }

    private function fail(string $msg, int $code = 422): JsonResponse
    {
        return response()->json(['message' => $msg], $code);
    }

    public function constantAdd(Request $request, string $group): JsonResponse
    {
        $g = $this->group($group);
        if (! $g) {
            return $this->fail('المجموعة غير موجودة.', 404);
        }
        if ($g->is_locked) {
            return $this->fail('مفاتيح هذه المجموعة مرتبطة بسلوك اللوحة، لا يمكن إضافة قيم إليها.');
        }
        $needKey = in_array($g->group_key, ['timezone', 'icon', 'section_anchor', 'password_expiry', 'session_timeout'], true);
        $v = Validator::make($request->all(), [
            'label' => 'required|string|max:60',
            'key' => [$needKey ? 'required' : 'nullable', 'string', 'max:100', 'regex:/^[^\s<>"\'\\\\]+$/u'],
            'note' => 'nullable|string|max:150',
        ], [
            'label.required' => 'أدخل تسمية للقيمة الجديدة.', 'label.max' => 'التسمية طويلة (60 حرفاً كحد أقصى).',
            'key.required' => 'هذه المجموعة تحتاج مفتاحاً.', 'key.regex' => 'المفتاح يجب ألا يحتوي مسافات أو رموزاً غير مسموحة.', 'key.max' => 'المفتاح طويل جداً.',
        ]);
        if ($v->fails()) {
            return $this->fail($v->errors()->first());
        }
        $label = trim((string) $request->input('label'));
        $key = trim((string) $request->input('key', ''));
        if (ConstantItem::query()->where('group_id', $g->id)->where('label_ar', $label)->exists()) {
            return $this->fail('توجد قيمة بنفس التسمية.');
        }
        if ($key !== '' && ConstantItem::query()->where('group_id', $g->id)->where('item_key', $key)->exists()) {
            return $this->fail('المفتاح مستخدم من قبل.');
        }
        if ($key === '') {
            do {
                $key = 'c'.base_convert((string) (int) (microtime(true) * 1000), 10, 36).random_int(0, 9);
            } while (ConstantItem::query()->where('group_id', $g->id)->where('item_key', $key)->exists());
        }
        $max = ConstantItem::query()->where('group_id', $g->id)->max('sort_order');
        $note = trim((string) $request->input('note', ''));
        ConstantItem::query()->create([
            'group_id' => $g->id, 'item_key' => $key, 'label_ar' => $label, 'is_active' => true, 'is_locked' => false,
            'sort_order' => $max === null ? 0 : $max + 1, 'meta' => $note !== '' ? ['note' => $note] : null,
        ]);

        return $this->done($g, 'أُضيفت القيمة «'.$label.'»');
    }

    public function constantUpdate(Request $request, string $group): JsonResponse
    {
        $key = (string) $request->input('key', '');
        $g = $this->group($group);
        $item = $g ? ConstantItem::query()->where('group_id', $g->id)->where('item_key', $key)->first() : null;
        if (! $item) {
            return $this->fail('القيمة غير موجودة.', 404);
        }
        $v = Validator::make($request->all(), ['label' => 'sometimes|required|string|max:60', 'active' => 'sometimes|boolean', 'note' => 'sometimes|nullable|string|max:150'], [
            'label.required' => 'التسمية لا يمكن أن تكون فارغة.', 'label.max' => 'التسمية طويلة (60 حرفاً كحد أقصى).', 'active.boolean' => 'قيمة التفعيل غير صالحة.',
        ]);
        if ($v->fails()) {
            return $this->fail($v->errors()->first());
        }
        $msg = [];
        if ($request->has('label')) {
            $label = trim((string) $request->input('label'));
            if ($label === '') {
                return $this->fail('التسمية لا يمكن أن تكون فارغة.');
            }
            if ($label !== $item->label_ar && ConstantItem::query()->where('group_id', $g->id)->where('label_ar', $label)->where('id', '!=', $item->id)->exists()) {
                return $this->fail('توجد قيمة بنفس التسمية.');
            }
            if ($label !== $item->label_ar) {
                $msg[] = 'عدّل «'.$item->label_ar.'» إلى «'.$label.'»';
                $item->label_ar = $label;
            }
        }
        if ($request->has('active')) {
            $active = $request->boolean('active');
            if ($active !== (bool) $item->is_active) {
                if (! $active && $item->is_locked) {
                    return $this->fail('هذه القيمة أساسية ولا يمكن تعطيلها.');
                }
                if (! $active && ConstantItem::query()->where('group_id', $g->id)->where('is_active', true)->where('id', '!=', $item->id)->doesntExist()) {
                    return $this->fail('يجب أن تبقى قيمة واحدة مفعّلة على الأقل.');
                }
                $item->is_active = $active;
                $msg[] = ($active ? 'فُعّلت' : 'عُطّلت').' القيمة «'.$item->label_ar.'»';
            }
        }
        if ($request->has('note')) {
            $meta = is_array($item->meta) ? $item->meta : [];
            $note = trim((string) $request->input('note', ''));
            if ($note !== '') {
                $meta['note'] = $note;
            } else {
                unset($meta['note']);
            }
            $item->meta = $meta ?: null;
        }
        $item->save();

        return $this->done($g, $msg ? implode('، ', $msg) : 'تحديث قيمة');
    }

    public function constantDelete(Request $request, string $group): JsonResponse
    {
        $key = (string) $request->input('key', '');
        $g = $this->group($group);
        $item = $g ? ConstantItem::query()->where('group_id', $g->id)->where('item_key', $key)->first() : null;
        if (! $item) {
            return $this->fail('القيمة غير موجودة.', 404);
        }
        if ($g->is_locked) {
            return $this->fail('مفاتيح هذه المجموعة مرتبطة بسلوك اللوحة، لا يمكن حذف قيم منها.');
        }
        if ($item->is_locked) {
            return $this->fail('هذه القيمة أساسية في النظام ولا يمكن حذفها.');
        }
        if ($item->is_active && ConstantItem::query()->where('group_id', $g->id)->where('is_active', true)->where('id', '!=', $item->id)->doesntExist()) {
            return $this->fail('يجب أن تبقى قيمة واحدة مفعّلة على الأقل.');
        }
        $label = $item->label_ar;
        $item->delete();

        return $this->done($g, 'حُذفت القيمة «'.$label.'»');
    }

    public function constantReorder(Request $request, string $group): JsonResponse
    {
        $g = $this->group($group);
        if (! $g) {
            return $this->fail('المجموعة غير موجودة.', 404);
        }
        $keys = array_map('strval', (array) $request->input('keys', []));
        $cur = ConstantsStore::keys($group);
        if (count($keys) !== count($cur) || array_diff($keys, $cur) || array_diff($cur, $keys)) {
            return $this->fail('قائمة الترتيب غير مطابقة لقيم المجموعة.');
        }
        foreach ($keys as $n => $k) {
            ConstantItem::query()->where('group_id', $g->id)->where('item_key', $k)->update(['sort_order' => $n]);
        }

        return $this->done($g, 'غُيّر ترتيب القيم');
    }

    public function constantReset(string $group): JsonResponse
    {
        $g = $this->group($group);
        if (! $g) {
            return $this->fail('المجموعة غير موجودة.', 404);
        }
        if (! collect(config('constants_defaults', []))->firstWhere('key', $g->group_key)) {
            return $this->fail('لا توجد قيم افتراضية لهذه المجموعة.');
        }
        DB::transaction(fn () => ConstantsStore::reset($g));

        return $this->done($g, 'أُعيدت المجموعة إلى الافتراضي');
    }
}
