<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\HtmlString;

/**
 * «الصفحة الرئيسية» (control panel) -> public home page: section order, visibility and the texts of every section.
 * Stored as ONE settings row `home.sections` = {"order":[ids],"hidden":[ids],"text":{id:{eyebrow,title,lead,button}}}.
 * Only differences from the built-in defaults are stored, so an empty / missing row renders exactly the original page.
 */
class HomeSections
{
    public const KEY = 'home.sections';

    /** Section ids in their original page order (the id is also the <section id> / anchor). */
    public const IDS = ['hero', 'announcements', 'about', 'projects', 'stories', 'pillars', 'activities', 'appeal', 'impact-map', 'news', 'partners', 'gallery', 'contact', 'faq'];

    /** Exact visible texts of the original page (kept in sync with resources/views/site/home/*.blade.php). */
    public const TEXT = [
        'about' => [
            'eyebrow' => 'التعريف والمسيرة في غزة',
            'title' => 'سنوات من العمل لإغاثة أهل غزة وصون كرامتهم',
            'lead' => 'تأسست جمعية الشمال للتنمية والتطوير المجتمعي ككيان إنساني غير ربحي للاستجابة العاجلة في قطاع غزة: الغذاء والدواء والمأوى والتعليم، من النزوح في الشمال حتى رفح.',
            'button' => 'تعرّف على قصتنا ومسيرتنا',
        ],
        'projects' => [
            'eyebrow' => 'مشاريع وبرامج غزة',
            'title' => 'مبادرات الإغاثة المعتمدة داخل القطاع',
            'lead' => 'برامج إغاثية وإنشائية وتنموية وصحية من الشمال إلى الجنوب: المخابز، المياه، الإيواء، والعيادات الميدانية.',
            'button' => 'مشاهدة المزيد من المشاريع',
        ],
        'stories' => [
            'eyebrow' => 'قصص من الميدان',
            'title' => 'أصوات من خيام النزوح.. حكايات من قلب الميدان',
            'lead' => 'شهادات من عائلات ومتطوعين داخل القطاع عن الأثر اليومي للسلة والخيمة والدواء.',
        ],
        'pillars' => [
            'title' => 'ركائز الإغاثة داخل قطاع غزة',
            'lead' => 'أربعة برامج رئيسية: إغاثي وإنشائي وتنموي وصحي، تغطي احتياج العائلات النازحة في القطاع',
        ],
        'activities' => [
            'eyebrow' => 'غزة تتكلم من الميدان',
            'title' => 'أنشطة ميدانية موثّقة داخل القطاع',
            'lead' => 'فرقنا والمتطوعون يوثّقون وصول السلال والخيام والدواء إلى مخيمات النزوح في غزة على مدار الساعة.',
            'button' => 'مشاهدة الأرشيف الميداني المصور',
        ],
        'impact-map' => [
            'eyebrow' => 'خريطة الأثر',
            'title' => 'أثر الإغاثة في محافظات القطاع الخمس',
            'lead' => 'مرّر المؤشر أو اضغط على أي محافظة في الخريطة أو القائمة لعرض مؤشرات الأثر فيها.',
        ],
        'news' => [
            'eyebrow' => 'بيانات إغاثة غزة',
            'title' => 'آخر الأخبار وتقارير الشفافية من القطاع',
            'button' => 'كل الأخبار',
        ],
        'partners' => [
            'eyebrow' => 'شركاء إغاثة غزة',
            'title' => 'شركاء الجمعية',
            'lead' => 'نعتز بالتعاون مع هيئات أممية وهلال أحمر وصناديق زكاة لإيصال الإغاثة إلى غزة بشفافية كاملة.',
        ],
        'gallery' => [
            'eyebrow' => 'مرئيات من قطاع غزة',
            'title' => 'معرض التوثيق الميداني في غزة',
            'lead' => 'أرشيف حي يوثّق وصول السلال والخيام والدواء إلى مستحقيها في مخيمات النزوح بكرامة.',
            'button' => 'مشاهدة المزيد',
        ],
        'contact' => [
            'eyebrow' => 'التواصل مع الجمعية',
            'title' => 'نحن في خدمتك لكل استفسار عن القطاع',
            'lead' => 'فريق الجمعية لاستقبال الاستفسارات وطلبات الشراكة والتطوع والبرامج الإنشائية والتنموية والصحية.',
        ],
        'faq' => [
            'eyebrow' => 'الأسئلة الشائعة',
            'title' => 'إجابات واضحة على أكثر ما تسأل عنه',
            'lead' => 'أكثر ما يسألنا عنه الأهالي والشركاء حول وصول المساعدات إلى غزة والتطوع والشراكات.',
            'button' => 'تواصل معنا',
        ],
    ];

    /** Max length (characters) of each editable field. */
    public const LIMITS = ['eyebrow' => 60, 'title' => 120, 'lead' => 300, 'button' => 40];

    public const FIELD_LABELS = ['eyebrow' => 'العنوان الفرعي الصغير', 'title' => 'العنوان الرئيسي', 'lead' => 'النص التمهيدي', 'button' => 'نص الزر'];

    private static ?array $cache = null;

    /** @return array{order: string[], hidden: string[], text: array<string, array<string, string>>} */
    public static function load(bool $fresh = false): array
    {
        if (self::$cache !== null && ! $fresh) {
            return self::$cache;
        }
        $stored = [];
        try {
            $raw = Setting::query()->where('key', self::KEY)->value('value');
            if (is_string($raw) && $raw !== '') {
                $j = json_decode($raw, true);
                $stored = is_array($j) ? $j : [];
            }
        } catch (\Throwable $e) {
            $stored = []; // table missing / DB down: the original page
        }

        return self::$cache = self::normalize($stored);
    }

    /** Clean a stored / submitted structure: unknown ids and fields dropped, order completed, texts stripped, defaults not stored. */
    public static function normalize(array $in): array
    {
        $order = [];
        foreach ((array) ($in['order'] ?? []) as $id) {
            if (is_string($id) && in_array($id, self::IDS, true) && ! in_array($id, $order, true)) {
                $order[] = $id;
            }
        }
        foreach (self::IDS as $id) {
            if (! in_array($id, $order, true)) {
                $order[] = $id;
            }
        }
        $hidden = [];
        foreach ((array) ($in['hidden'] ?? []) as $id) {
            if (is_string($id) && in_array($id, self::IDS, true) && ! in_array($id, $hidden, true)) {
                $hidden[] = $id;
            }
        }
        $text = [];
        foreach ((array) ($in['text'] ?? []) as $id => $fields) {
            if (! is_string($id) || ! isset(self::TEXT[$id]) || ! is_array($fields)) {
                continue;
            }
            foreach (self::TEXT[$id] as $f => $def) {
                if (! isset($fields[$f]) || ! is_string($fields[$f])) {
                    continue;
                }
                $v = self::clean($fields[$f], self::LIMITS[$f]);
                if ($v !== '' && $v !== $def) {
                    $text[$id][$f] = $v;
                }
            }
        }

        return ['order' => $order, 'hidden' => $hidden, 'text' => $text];
    }

    /** Plain text: tags removed, entities decoded, whitespace collapsed, cut to $max characters. */
    public static function clean(string $v, int $max): string
    {
        $v = strip_tags($v);
        $v = html_entity_decode($v, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $v = strip_tags($v);
        $v = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $v) ?? '';
        $v = trim(preg_replace('/\s+/u', ' ', $v) ?? '');

        return mb_substr($v, 0, $max);
    }

    /** Validation for PUT /admin/homepage: [field => [messages]] (Arabic). */
    public static function validate(array $in): array
    {
        $err = [];
        if (! isset($in['order']) || ! is_array($in['order'])) {
            $err['order'][] = 'ترتيب الأقسام مطلوب.';
        } else {
            $ids = array_values(array_filter($in['order'], 'is_string'));
            if (count($ids) !== count($in['order']) || count(array_unique($ids)) !== count($ids) || array_diff($ids, self::IDS) || array_diff(self::IDS, $ids)) {
                $err['order'][] = 'ترتيب الأقسام غير صالح: يجب أن يتضمن كل قسم من أقسام الصفحة مرة واحدة فقط.';
            }
        }
        if (isset($in['hidden'])) {
            if (! is_array($in['hidden']) || array_diff(array_map('strval', $in['hidden']), self::IDS) || count(array_filter($in['hidden'], 'is_string')) !== count($in['hidden'])) {
                $err['hidden'][] = 'قائمة الأقسام المخفية غير صالحة.';
            } elseif (count(array_unique($in['hidden'])) >= count(self::IDS)) {
                $err['hidden'][] = 'لا يمكن إخفاء جميع الأقسام.';
            }
        }
        if (isset($in['text'])) {
            if (! is_array($in['text'])) {
                $err['text'][] = 'نصوص الأقسام غير صالحة.';
            } else {
                foreach ($in['text'] as $id => $fields) {
                    if (! is_string($id) || ! isset(self::TEXT[$id])) {
                        $err["text.$id"][] = 'قسم غير معروف.';
                        continue;
                    }
                    if (! is_array($fields)) {
                        $err["text.$id"][] = 'بيانات القسم غير صالحة.';
                        continue;
                    }
                    foreach ($fields as $f => $v) {
                        if (! isset(self::TEXT[$id][$f])) {
                            $err["text.$id.$f"][] = 'حقل غير معروف.';
                            continue;
                        }
                        if (! is_string($v)) {
                            $err["text.$id.$f"][] = 'القيمة يجب أن تكون نصاً.';
                            continue;
                        }
                        $plain = self::clean($v, 100000);
                        if ($plain === '') {
                            $err["text.$id.$f"][] = 'حقل «'.self::FIELD_LABELS[$f].'» مطلوب.';
                        } elseif (mb_strlen($plain) > self::LIMITS[$f]) {
                            $err["text.$id.$f"][] = 'حقل «'.self::FIELD_LABELS[$f].'» يجب ألا يتجاوز '.self::LIMITS[$f].' حرفاً.';
                        }
                    }
                }
            }
        }

        return $err;
    }

    /** Persist (validated input) and return the normalised store. */
    public static function save(array $in): array
    {
        $clean = self::normalize($in);
        $row = Setting::query()->where('key', self::KEY)->first() ?: new Setting(['key' => self::KEY]);
        $row->fill([
            'value' => json_encode($clean, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'type' => 'json',
            'section' => 'content',
            'label' => 'أقسام الصفحة الرئيسية: الترتيب والإظهار والنصوص',
            'is_public' => true,
            'sort_order' => $row->exists ? (int) $row->sort_order : 0,
        ])->save();
        self::$cache = null;

        return self::load(true);
    }

    /** Remove the stored row (everything back to the original page). */
    public static function reset(): void
    {
        Setting::query()->where('key', self::KEY)->delete();
        self::$cache = null;
    }

    public static function forget(): void
    {
        self::$cache = null;
    }

    // ------------------------------------------------------------------ public helpers

    /** Section ids in the order the public page renders them. */
    public static function order(): array
    {
        return self::load()['order'];
    }

    public static function visible(string $id): bool
    {
        return ! in_array($id, self::load()['hidden'], true);
    }

    /** Text of a section field: the saved override, else the original text. */
    public static function t(string $id, string $field): string
    {
        $o = self::load()['text'][$id][$field] ?? null;

        return $o !== null && $o !== '' ? $o : (self::TEXT[$id][$field] ?? '');
    }

    /** Partners headline: the last word is shown in gold ("شركاء <span>الجمعية</span>"). Escaped; safe to print with {!! !!}. */
    public static function goldTitle(string $id): HtmlString
    {
        $t = self::t($id, 'title');
        $pos = mb_strrpos($t, ' ');
        if ($pos === false) {
            return new HtmlString('<span class="text-gradient-gold">'.e($t).'</span>');
        }

        return new HtmlString(e(mb_substr($t, 0, $pos + 1)).'<span class="text-gradient-gold">'.e(mb_substr($t, $pos + 1)).'</span>');
    }

    /** Payload for the control panel page. */
    public static function payload(?bool $saved = null): array
    {
        $s = self::load();

        return [
            'order' => $s['order'],
            'hidden' => $s['hidden'],
            'text' => $s['text'],
            'defaults' => self::TEXT,
            'limits' => self::LIMITS,
            'labels' => self::FIELD_LABELS,
            'saved' => $saved ?? (bool) Setting::query()->where('key', self::KEY)->exists(),
            'site_url' => url('/'),
        ];
    }
}
