<?php

namespace App\Console\Commands;

use App\Models\Activity;
use App\Models\Governorate;
use App\Models\MediaFile;
use App\Models\Program;
use App\Models\Project;
use App\Models\Story;
use App\Support\ContentSupport as CS;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Loads the demo projects, field stories and field activities of the static dashboard into the database.
 * Idempotent: a row is only inserted when no row (soft-deleted ones included) with the same slug / name / title exists.
 * Funding / donation figures of the old demo are NOT imported.
 */
class ImportDemoProjects extends Command
{
    protected $signature = 'almel:import-demo-projects';

    protected $description = 'Import the demo projects, stories and field activities into the database (safe to run twice)';

    private const GOV = ['north' => 'north-gaza', 'gaza' => 'gaza', 'middle' => 'deir-al-balah', 'khan' => 'khan-younis', 'rafah' => 'rafah'];

    public function handle(): int
    {
        $data = json_decode(self::DATA, true);
        if (! $data) {
            $this->error('Demo data could not be decoded.');

            return self::FAILURE;
        }
        $stats = ['projects' => 0, 'stories' => 0, 'activities' => 0, 'media' => 0];

        DB::transaction(function () use ($data, &$stats) {
            $order = (int) Project::withTrashed()->max('sort_order');
            foreach ($data['projects'] as $p) {
                if (Project::withTrashed()->where('slug', $p['slug'])->exists()) {
                    continue;
                }
                $program = Program::where('slug', $p['cat'])->first();
                if (! $program) {
                    continue;
                }
                $gov = Governorate::where('slug', self::GOV[$p['gov']] ?? '')->first();
                $media = $this->media($p['image'], $p['title'], $stats);
                $plain = trim($p['desc']);
                Project::create([
                    'program_id' => $program->id,
                    'governorate_id' => $gov?->id,
                    'slug' => $p['slug'],
                    'title' => $p['title'],
                    'summary' => mb_substr($plain, 0, 500),
                    'description' => '<p>'.e($plain).'</p>',
                    'location_text' => $p['loc'],
                    'status' => $p['status'],
                    'is_featured' => false,
                    'cover_media_id' => $media->id,
                    'cover_alt' => $p['title'],
                    'show_funding' => false,
                    'sort_order' => ++$order,
                    'published_at' => $p['status'] === 'draft' ? null : now(),
                ]);
                $stats['projects']++;
            }

            $order = (int) Story::withTrashed()->max('sort_order');
            foreach ($data['stories'] as $s) {
                if (Story::withTrashed()->where('person_name', $s['name'])->exists()) {
                    continue;
                }
                $media = $this->media($s['image'], $s['alt'], $stats);
                Story::create([
                    'person_name' => $s['name'], 'person_role' => $s['role'], 'tag_label' => $s['tag'], 'tag_icon' => $s['icon'],
                    'quote' => $s['quote'], 'image_media_id' => $media->id, 'image_alt' => $s['alt'], 'is_published' => true, 'sort_order' => ++$order,
                ]);
                $stats['stories']++;
            }

            $order = (int) Activity::withTrashed()->max('sort_order');
            foreach ($data['activities'] as $a) {
                if (Activity::withTrashed()->where('title', $a['title'])->exists()) {
                    continue;
                }
                $media = $this->media($a['image'], $a['alt'], $stats);
                Activity::create([
                    'title' => $a['title'], 'description' => $a['desc'], 'badge_text' => $a['badge'], 'badge_tone' => $a['tone'],
                    'image_media_id' => $media->id, 'image_alt' => $a['alt'], 'date_label' => $a['date'], 'place' => $a['place'],
                    'stat_label' => $a['stat'], 'stat_icon' => $a['stat_icon'], 'link_label' => $a['link_label'], 'link_url' => $a['link'],
                    'is_published' => true, 'sort_order' => ++$order,
                ]);
                $stats['activities']++;
            }
        });

        $this->info('Imported: '.json_encode($stats));
        $this->info('Totals: projects='.Project::count().' stories='.Story::count().' activities='.Activity::count().' media='.MediaFile::count());

        return self::SUCCESS;
    }

    /** media_files row for /assets/site/img/x.jpg stored as path "img/x.jpg" (file stays where it is, nothing is copied). */
    private function media(string $url, ?string $alt, array &$stats): MediaFile
    {
        $path = ltrim(preg_replace('#^/?assets/site/#', '', $url), '/');
        $m = MediaFile::withTrashed()->where('disk', 'public')->where('path', $path)->first();
        if (! $m) {
            $m = MediaFile::create(['disk' => 'public', 'path' => $path, 'original_name' => basename($path), 'mime_type' => 'image/jpeg', 'size_bytes' => 0, 'alt_text' => $alt]);
            $stats['media']++;
        }
        $file = public_path('assets/site/'.$path);
        if (is_file($file) && (int) $m->size_bytes === 0) {
            $dims = @getimagesize($file) ?: [null, null];
            $m->forceFill(['size_bytes' => filesize($file), 'width' => $dims[0] ?: null, 'height' => $dims[1] ?: null, 'mime_type' => $dims['mime'] ?? $m->mime_type])->save();
        }

        return $m;
    }

    private const DATA = <<<'JSON'
{
 "projects": [
  {
   "slug": "relief",
   "title": "برنامج الإطعام الطارئ ومخابز غزة",
   "cat": "relief",
   "gov": "north",
   "loc": "شمال غزة — جباليا",
   "status": "urgent",
   "image": "/assets/site/img/project-relief.jpg",
   "desc": "تأمين الطحين والوقود لتشغيل 4 مخابز خيرية وتوزيع وجبات ساخنة يومية على النازحين."
  },
  {
   "slug": "development",
   "title": "برنامج التمكين والتنمية المجتمعية",
   "cat": "development",
   "gov": "gaza",
   "loc": "مخيم الشاطئ",
   "status": "active",
   "image": "/assets/site/img/project-orphan.jpg",
   "desc": "كفالة متكاملة للطعام والكساء والتعلّم في خيم مدرسية داخل مراكز الإيواء."
  },
  {
   "slug": "water",
   "title": "صهاريج مياه الشرب لمخيمات النزوح",
   "cat": "health",
   "gov": "khan",
   "loc": "خان يونس ودير البلح",
   "status": "active",
   "image": "/assets/site/img/project-water.jpg",
   "desc": "تشغيل محطات تحلية متنقلة وصهاريج يومية لنقاط الإيواء."
  },
  {
   "slug": "shelter",
   "title": "خيام ومستلزمات الإيواء في رفح",
   "cat": "construction",
   "gov": "rafah",
   "loc": "رفح",
   "status": "active",
   "image": "/assets/site/img/project-empower.jpg",
   "desc": "توفير خيام عائلية ومستلزمات إيواء أساسية للأسر النازحة."
  },
  {
   "slug": "clinics",
   "title": "العيادات الميدانية والأدوية المزمنة",
   "cat": "health",
   "gov": "middle",
   "loc": "دير البلح",
   "status": "paused",
   "image": "/assets/site/img/activity-medical.jpg",
   "desc": "عيادات خيام للجروح والأطفال والتوليد وصرف أدوية مزمنة."
  },
  {
   "slug": "winter",
   "title": "حملة دفء غزة الشتوية",
   "cat": "construction",
   "gov": "rafah",
   "loc": "مخيمات النزوح في رفح",
   "status": "draft",
   "image": "/assets/site/img/activity-winter.jpg",
   "desc": "حزم دفء وأغطية عازلة لحماية النازحين من برد الخيام."
  },
  {
   "slug": "learning",
   "title": "الخيمة التعليمية السادسة لأطفال غزة",
   "cat": "development",
   "gov": "gaza",
   "loc": "غزة — حي الرمال",
   "status": "completed",
   "image": "/assets/site/img/activity-graduate.jpg",
   "desc": "حلقات تعلّم مؤقتة في القراءة والحساب والدعم النفسي."
  },
  {
   "slug": "convoy",
   "title": "قوافل الطحين لمراكز الإيواء",
   "cat": "relief",
   "gov": "middle",
   "loc": "دير البلح",
   "status": "active",
   "image": "/assets/site/img/gallery-convoy.jpg",
   "desc": "نقل الطحين والسلال الغذائية إلى مراكز الإيواء في الوسطى."
  },
  {
   "slug": "waterpt",
   "title": "نقطة مياه شرب إضافية في الشمال",
   "cat": "health",
   "gov": "north",
   "loc": "بيت لاهيا",
   "status": "active",
   "image": "/assets/site/img/gallery-water.jpg",
   "desc": "تشغيل نقطة تعبئة مياه شرب إضافية في شمال القطاع."
  },
  {
   "slug": "kits",
   "title": "الحقيبة المدرسية للأطفال النازحين",
   "cat": "development",
   "gov": "khan",
   "loc": "خان يونس",
   "status": "completed",
   "image": "/assets/site/img/gallery-children.jpg",
   "desc": "حقائب وقرطاسية للأطفال في خيم التعلّم."
  },
  {
   "slug": "meds",
   "title": "أدوية الأمراض المزمنة لكبار السن",
   "cat": "health",
   "gov": "khan",
   "loc": "خان يونس — المواصي",
   "status": "urgent",
   "image": "/assets/site/img/gallery-clinic.jpg",
   "desc": "صرف شهري لأدوية الضغط والسكري للمرضى النازحين."
  },
  {
   "slug": "blankets",
   "title": "أغطية عازلة لمراكز الإيواء",
   "cat": "construction",
   "gov": "north",
   "loc": "جباليا",
   "status": "draft",
   "image": "/assets/site/img/gallery-winter.jpg",
   "desc": "أغطية وفرشات عازلة للأسر في مراكز الإيواء."
  }
 ],
 "stories": [
  {
   "name": "أم محمد",
   "role": "نازحة من جباليا إلى دير البلح",
   "tag": "السلال الغذائية",
   "icon": "shopping_basket",
   "quote": "وصلتنا السلة في يوم لم يكن في الخيمة ما يكفي لعشاء الأطفال. شعرت أن أحداً ما زال يتذكرنا.",
   "image": "img/gallery-children.jpg",
   "alt": "أطفال يبتسمون في أحد مراكز الإيواء"
  },
  {
   "name": "أبو يوسف",
   "role": "متطوع توزيع — خان يونس",
   "tag": "فرق التطوع",
   "icon": "diversity_3",
   "quote": "نبدأ قبل الفجر لتجهيز الطرود، وأجمل ما في يومنا أن نرى كل سلة تُسلَّم باليد وتوثَّق بالصورة.",
   "image": "img/project-relief.jpg",
   "alt": "متطوعون يجهزون طرود المساعدات"
  },
  {
   "name": "سارة، 11 عاماً",
   "role": "مدرسة إيواء — مدينة غزة",
   "tag": "التعليم المؤقت",
   "icon": "menu_book",
   "quote": "صار عندنا صف في المدرسة التي نسكنها. أحب حصة القراءة، وأحلم أن أصبح معلّمة.",
   "image": "img/project-orphan.jpg",
   "alt": "كتب وأدوات مدرسية على طاولة"
  },
  {
   "name": "الممرضة ريم",
   "role": "نقطة طبية — رفح",
   "tag": "الرعاية الصحية",
   "icon": "medical_services",
   "quote": "الدواء الذي يصلنا يعني أن مريض السكري لن ينتظر أسبوعاً آخر. كل شحنة تصنع فرقاً حقيقياً.",
   "image": "img/activity-medical.jpg",
   "alt": "كادر طبي في نقطة رعاية صحية"
  }
 ],
 "activities": [
  {
   "title": "توزيع 10,000 طرد شتوي وأغطية عازلة",
   "desc": "إيصال حزم الدفء لحماية أكثر من 45 ألف نازح من برد الخيام في جنوب القطاع.",
   "badge": "حملة دفء غزة",
   "tone": "forest",
   "image": "img/activity-winter.jpg",
   "alt": "قافلة إغاثة شتوية",
   "date": "نوفمبر - ديسمبر 2024",
   "place": "مخيمات النزوح في رفح",
   "stat": "45,200 مستفيد",
   "stat_icon": "group",
   "link_label": "تقرير الفيديو",
   "link": "#gallery"
  },
  {
   "title": "تسيير 3 عيادات ميدانية وإجراء 320 تدخلاً",
   "desc": "عيادات خيام للجروح والأطفال والتوليد، وصرف أدوية مزمنة، وتحويلات عاجلة داخل وسط القطاع.",
   "badge": "البرنامج الصحي في غزة",
   "tone": "gold",
   "image": "img/activity-medical.jpg",
   "alt": "قافلة طبية ميدانية",
   "date": "أكتوبر 2024",
   "place": "دير البلح",
   "stat": "8,400 كشف",
   "stat_icon": "medical_services",
   "link_label": "تحميل التوثيق",
   "link": "#contact"
  },
  {
   "title": "افتتاح الخيمة التعليمية السادسة لأطفال غزة",
   "desc": "احتفاء بعودة 210 طفلاً نازحاً إلى حلقات تعلّم مؤقتة في القراءة والحساب والدعم النفسي.",
   "badge": "تعليم النازحين",
   "tone": "mid",
   "image": "img/activity-graduate.jpg",
   "alt": "تخريج دفعة تمكين مهني",
   "date": "سبتمبر 2024",
   "place": "خان يونس",
   "stat": "210 طالب نازح",
   "stat_icon": "school",
   "link_label": "قصص النجاح",
   "link": "#news"
  }
 ]
}
JSON;
}
