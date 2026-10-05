<?php

namespace App\Console\Commands;

use App\Models\Announcement;
use App\Models\Appeal;
use App\Models\Faq;
use App\Models\Governorate;
use App\Models\MediaFile;
use App\Models\Partner;
use App\Models\Setting;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Loads the starting content of the Partners, FAQ, Announcements/Appeal and Impact-map pages (the content of the old
 * static dashboard) into the database. Idempotent: partners are matched by name, governorates by slug, FAQ / announcements
 * / appeal are only created while their table is empty; nothing that already exists is changed. No donation content.
 */
class ImportPeopleContent extends Command
{
    protected $signature = 'almel:import-people-content';

    protected $description = 'Import the demo partners, FAQ, announcements, appeal card and impact-map numbers into the database (safe to run twice)';

    public function handle(): int
    {
        $n = ['partners' => 0, 'governorates' => 0, 'faqs' => 0, 'announcements' => 0, 'appeals' => 0, 'settings' => 0, 'media' => 0];

        DB::transaction(function () use (&$n) {
            foreach ([
                ['منظمة يونيسف', 'شريك دولي', 'child_care', 'img/partners/unicef.svg', 'نتعاون مع اليونيسف لتوفير الحماية والتعليم الطارئ لأطفال غزة، ودعم برامج التغذية والمياه النظيفة.'],
                ['الأمم المتحدة', 'هيئة أممية', 'public', 'img/partners/unitednations.svg', 'بالتنسيق مع الأمم المتحدة نوثّق الاحتياجات الإنسانية وننسّق قوافل الإغاثة الداخلة إلى القطاع.'],
                ['برنامج الغذاء العالمي', 'أمن غذائي', 'nutrition', 'img/partners/wfp.png', 'نشارك برنامج الغذاء العالمي في توزيع السلال الغذائية والوجبات الجاهزة على العائلات النازحة.'],
                ['منظمة الصحة العالمية', 'رعاية صحية', 'medical_services', 'img/partners/who.svg', 'ندعم مع منظمة الصحة العالمية تشغيل النقاط الطبية الميدانية وتأمين الأدوية الأساسية.'],
                ['الهلال الأحمر', 'إغاثة عاجلة', 'emergency', 'img/partners/crescent.svg', 'نتكامل مع فرق الهلال الأحمر في الإخلاء الطبي وتوزيع الإغاثة العاجلة داخل غزة.'],
                ['اللجنة الدولية للصليب الأحمر', 'حماية إنسانية', 'shield', 'img/partners/icrc.svg', 'نتعاون مع اللجنة الدولية لتسهيل دخول المساعدات وحماية المدنيين وفق القانون الدولي الإنساني.'],
            ] as $i => [$name, $tag, $ic, $logo, $desc]) {
                if (Partner::withTrashed()->where('name', $name)->exists()) {
                    continue;
                }
                Partner::create(['name' => $name, 'tag_label' => $tag, 'tag_icon' => $ic, 'description' => $desc, 'logo_media_id' => $this->media($logo, $name, $n)->id, 'is_published' => true, 'sort_order' => $i + 1]);
                $n['partners']++;
            }

            foreach ([
                ['north-gaza', 'شمال غزة', 'سلال غذائية وصهاريج مياه لمراكز الإيواء في جباليا وبيت لاهيا وبيت حانون.', 38000, 52000, 900, 14, 11],
                ['gaza', 'غزة', 'مطابخ ميدانية وتعليم مؤقت للأطفال في مدارس الإيواء بمدينة غزة.', 42000, 61000, 1100, 18, 14],
                ['deir-al-balah', 'دير البلح', 'استقبال العائلات النازحة وتوزيع الخيام والأغطية في مخيمات المحافظة الوسطى.', 30000, 44000, 1400, 12, 9],
                ['khan-younis', 'خان يونس', 'نقاط طبية متنقلة وتوزيع مياه الشرب في مناطق النزوح بخان يونس.', 40000, 57000, 1700, 16, 12],
                ['rafah', 'رفح', 'دعم الأسر النازحة بالخيام والسلال الغذائية في المناطق الجنوبية.', 30000, 39000, 1300, 10, 8],
            ] as $i => [$slug, $name, $note, $b, $m, $t, $w, $d]) {
                if (Governorate::where('slug', $slug)->exists()) {
                    continue;
                }
                Governorate::create(['slug' => $slug, 'name' => $name, 'note' => $note, 'beneficiaries' => $b, 'meals' => $m, 'tents' => $t, 'water_points' => $w, 'distribution_points' => $d, 'is_published' => true, 'sort_order' => $i + 1]);
                $n['governorates']++;
            }

            if (! Faq::withTrashed()->exists()) {
                foreach ([
                    ['كيف يمكنني التطوع مع الجمعية؟', 'أرسل لنا بياناتك ومجال خبرتك عبر نموذج التواصل، وسنتواصل معك عند توفر فرص تطوع ميدانية أو عن بُعد (تصميم، ترجمة، تنسيق حملات).'],
                    ['كيف تُوثَّق أعمال الجمعية؟', 'نوثّق كل توزيع بالصور والتقارير الدورية التي ننشرها في المركز الإعلامي، ويمكنك طلب تقرير عن أي برنامج عبر نموذج التواصل.'],
                    ['أين تعمل الجمعية؟', 'تعمل فرقنا الميدانية في محافظات القطاع الخمس: شمال غزة وغزة ودير البلح وخان يونس ورفح، وتجد أرقام الأثر لكل محافظة في قسم «خريطة الأثر».'],
                    ['كيف يمكن لمؤسستنا أن تصبح شريكة للجمعية؟', 'راسلنا عبر نموذج التواصل واختر «شراكة»، وسيتواصل معك فريق الشراكات لمناقشة مجالات التعاون.'],
                    ['كيف أتواصل مع الجمعية؟', 'يمكنك مراسلتنا عبر نموذج التواصل في الموقع أو عبر الهاتف والبريد الإلكتروني المنشورين في صفحة «تواصل معنا».'],
                ] as $i => [$q, $a]) {
                    Faq::create(['question' => $q, 'answer' => $a, 'is_published' => true, 'sort_order' => $i + 1]);
                    $n['faqs']++;
                }
            }

            if (! Announcement::withTrashed()->exists()) {
                foreach ([
                    ['وصول قافلة طحين جديدة إلى مراكز الإيواء في دير البلح', '#news'],
                    ['فتح باب التسجيل في برامج التمكين والتنمية المجتمعية لعام 2026', '#projects'],
                    ['حملة الشتاء: توزيع خيام وأغطية في خان يونس ورفح', '#activities'],
                    ['تشغيل نقطة مياه شرب إضافية في شمال القطاع', '#impact-map'],
                    ['تقرير الأثر الربعي متاح قريباً في المركز الإعلامي', '#news'],
                ] as $i => [$text, $link]) {
                    Announcement::create(['text' => $text, 'link_url' => $link, 'is_published' => true, 'sort_order' => $i + 1]);
                    $n['announcements']++;
                }
            }

            if (! Appeal::exists()) {
                Appeal::create([
                    'flag_label' => 'نداء إغاثة عاجل', 'chip_label' => 'قوافل يومية من الشمال إلى رفح', 'kicker' => 'حملة السلال والخيام والمياه',
                    'title_line1' => 'خبز اليوم يصل للخيمة..', 'title_line2' => 'وماؤك لا ينقطع عن النازحين',
                    'description' => 'قوافل الطحين والخيام وصهاريج المياه تتحرك داخل القطاع كل يوم لتصل إلى عائلات نزحت من بيوتها.',
                    'primary_cta_text' => 'تواصل مع الجمعية', 'primary_cta_url' => '#contact', 'secondary_cta_text' => 'مبادرات الإغاثة', 'secondary_cta_url' => '#projects',
                    'image_media_id' => $this->media('img/gallery-convoy.jpg', 'قافلة إغاثة', $n)->id, 'is_active' => true,
                ]);
                $n['appeals']++;
            }

            foreach (['announcement_bar.visible' => ['1', 'bool', 'Show announcements bar'], 'announcement_bar.label' => ['آخر الإعلانات', 'string', 'Bar label']] as $k => [$v, $type, $label]) {
                if (! Setting::where('key', $k)->exists()) {
                    Setting::create(['key' => $k, 'value' => $v, 'type' => $type, 'section' => 'announcement_bar', 'label' => $label, 'is_public' => true, 'sort_order' => 0]);
                    $n['settings']++;
                }
            }
        });

        $this->info('Imported: '.collect($n)->map(fn ($v, $k) => "$k=$v")->implode(', '));

        return self::SUCCESS;
    }

    private function media(string $path, string $alt, array &$n): MediaFile
    {
        $m = MediaFile::where('path', $path)->first();
        if (! $m) {
            $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
            $m = MediaFile::create([
                'disk' => 'public', 'path' => $path, 'original_name' => basename($path),
                'mime_type' => ['svg' => 'image/svg+xml', 'png' => 'image/png', 'jpg' => 'image/jpeg', 'webp' => 'image/webp'][$ext] ?? 'image/jpeg',
                'size_bytes' => 0, 'title' => pathinfo($path, PATHINFO_FILENAME), 'alt_text' => $alt,
            ]);
            $n['media']++;
        }

        return $m;
    }
}
