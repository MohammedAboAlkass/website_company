<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\GalleryAlbum;
use App\Models\GalleryItem;
use App\Models\MediaFile;
use App\Models\Tag;
use App\Support\ContentSupport as CS;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/** Loads the demo news + gallery of the static dashboard into the database. Idempotent (insert-if-missing by slug / media+title). */
class ImportDemoContent extends Command
{
    protected $signature = 'almel:import-demo-content';

    protected $description = 'Import the demo news articles, gallery albums and gallery photos into the database (safe to run twice)';

    public function handle(): int
    {
        $data = json_decode(self::DATA, true);
        if (! $data) {
            $this->error('Demo data could not be decoded.');

            return self::FAILURE;
        }
        $stats = ['categories' => 0, 'albums' => 0, 'media' => 0, 'tags' => 0, 'articles' => 0, 'items' => 0];

        DB::transaction(function () use ($data, &$stats) {
            foreach ($data['categories'] as $i => $c) {
                $row = ArticleCategory::firstOrCreate(['slug' => $c['id']], ['name' => $c['label'], 'sort_order' => $i + 1]);
                $stats['categories'] += $row->wasRecentlyCreated ? 1 : 0;
            }
            foreach ($data['albums'] as $i => $a) {
                $row = GalleryAlbum::firstOrCreate(['slug' => $a['id']], ['name' => $a['label'], 'is_published' => true, 'sort_order' => $i + 1]);
                $stats['albums'] += $row->wasRecentlyCreated ? 1 : 0;
            }

            foreach ($data['news'] as $n) {
                if (Article::withTrashed()->where('slug', $n['slug'])->exists()) {
                    continue;
                }
                $media = $this->media($n['image'], $n['alt'] ?? null, $stats);
                $cat = ArticleCategory::where('slug', $n['cat'])->first();
                $body = '<p>'.e($n['excerpt']).'</p>';
                if (! empty($n['highlights'])) {
                    $body .= '<h2>أبرز ما جاء في الخبر</h2><ul>'.implode('', array_map(fn ($h) => '<li>'.e($h).'</li>', $n['highlights'])).'</ul>';
                }
                $a = Article::create([
                    'article_category_id' => $cat->id,
                    'author_id' => null,
                    'slug' => $n['slug'],
                    'title' => $n['title'],
                    'excerpt' => $n['excerpt'] ?: null,
                    'body' => $body,
                    'highlights' => $n['highlights'] ?: null,
                    'cover_media_id' => $media->id,
                    'cover_alt' => $n['alt'] ?? null,
                    'byline' => $n['byline'] ?? null,
                    'desk' => $n['desk'] ?: null,
                    'reference_code' => $n['ref'] ?: null,
                    'badge_text' => $n['badge'] ?: null,
                    'read_minutes' => $n['read'] ?: null,
                    'status' => $n['status'],
                    'published_at' => Carbon::parse($n['date'].' 10:00:00', config('app.timezone')),
                    'is_featured' => $n['slug'] === 'report-88',
                    'views_count' => (int) $n['views'],
                    'seo_description' => $n['excerpt'] ? mb_substr($n['excerpt'], 0, 160) : null,
                ]);
                $ids = [];
                foreach ($n['tags'] as $name) {
                    $slug = CS::slugify($name, 'tag');
                    $tag = Tag::where('slug', $slug)->first();
                    if (! $tag) {
                        $tag = Tag::create(['slug' => $slug, 'name' => $name]);
                        $stats['tags']++;
                    }
                    $ids[] = $tag->id;
                }
                $a->tags()->sync($ids);
                $stats['articles']++;
            }

            foreach ($data['gallery'] as $g) {
                $media = $this->media($g['image'], $g['alt'], $stats);
                $album = GalleryAlbum::where('slug', $g['album'])->first();
                $exists = GalleryItem::withTrashed()->where('media_id', $media->id)->where('title', $g['title'])->exists();
                if ($exists) {
                    continue;
                }
                GalleryItem::create([
                    'gallery_album_id' => $album?->id,
                    'media_id' => $media->id,
                    'type' => 'image',
                    'title' => $g['title'],
                    'alt_text' => $g['alt'],
                    'is_published' => true,
                    'sort_order' => $g['order'],
                ]);
                $stats['items']++;
            }
        });

        $this->info('Imported: '.json_encode($stats));
        $this->info('Totals: articles='.Article::count().' tags='.Tag::count().' albums='.GalleryAlbum::count().' gallery_items='.GalleryItem::count().' media='.MediaFile::count());

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
            $m->forceFill([
                'size_bytes' => filesize($file),
                'width' => $dims[0] ?: null,
                'height' => $dims[1] ?: null,
                'mime_type' => $dims['mime'] ?? $m->mime_type,
            ])->save();
        }

        return $m;
    }

    private const DATA = <<<'JSON'
{
 "news": [
  {
   "slug": "report-88",
   "title": "نشر تقرير الإغاثة الدوري لغزة وتوسيع مخابز الطوارئ في الجنوب",
   "cat": "statements",
   "status": "published",
   "date": "2026-09-24",
   "views": 4820,
   "image": "/assets/site/img/news-conference.jpg",
   "byline": "فريق الإعلام",
   "tags": [
    "تقارير",
    "مخابز"
   ],
   "excerpt": "أعلن الفريق الميداني إقفال دورة التوزيع بنسبة توثيق 98.4%، مع تشغيل ثلاثة مخابز إضافية لخدمة النازحين في خان يونس ورفح.",
   "highlights": [
    "نسبة توثيق دورة التوزيع: 98.4%",
    "تشغيل ثلاثة مخابز إضافية لخدمة النازحين في خان يونس ورفح"
   ],
   "badge": "بيان من غزة",
   "desk": "مكتب توثيق القطاع",
   "ref": "PR-2024-88",
   "alt": "إحاطة إعلامية عن إغاثة غزة",
   "read": 4,
   "sample": false
  },
  {
   "slug": "development-500",
   "title": "إطلاق برنامج التمكين المجتمعي لـ 500 مستفيد من شمال غزة وجباليا",
   "cat": "development",
   "status": "published",
   "date": "2026-09-19",
   "views": 3910,
   "image": "/assets/site/img/gallery-children.jpg",
   "byline": "فريق الإعلام",
   "tags": [
    "تنمية",
    "كفالة"
   ],
   "excerpt": "يشمل البرنامج التدريب المهني والتعليم المؤقت ودعم الأسر بمصادر دخل داخل مراكز الإيواء.",
   "highlights": [
    "500 مستفيد من شمال غزة وجباليا",
    "يشمل البرنامج التدريب المهني والتعليم المؤقت ودعم الأسر",
    "آخر موعد: 30 يناير 2025"
   ],
   "badge": "تنمية مجتمعية",
   "desk": null,
   "ref": null,
   "alt": "أطفال يبتسمون في أحد مراكز الإيواء",
   "read": null,
   "sample": false
  },
  {
   "slug": "tracking-map",
   "title": "إطلاق خريطة تتبع السلال داخل قطاع غزة",
   "cat": "field",
   "status": "published",
   "date": "2026-09-12",
   "views": 2750,
   "image": "/assets/site/img/gallery-lab.jpg",
   "byline": "محرر المحتوى #2",
   "tags": [
    "شفافية"
   ],
   "excerpt": "منظومة تتيح للمتبرع متابعة وصول كل سلة غذائية إلى العائلة النازحة وتوثيقها بالصورة من الخيمة.",
   "highlights": [
    "متابعة وصول كل سلة غذائية إلى العائلة النازحة",
    "توثيق التسليم بالصورة من الخيمة"
   ],
   "badge": "توثيق الميدان",
   "desk": "غرفة عمليات غزة",
   "ref": null,
   "alt": "شاشة حاسوب لمتابعة التوزيع",
   "read": null,
   "sample": false
  },
  {
   "slug": "winter-campaign",
   "title": "توزيع 10,000 طرد شتوي وأغطية عازلة",
   "cat": "activities",
   "status": "scheduled",
   "date": "2026-10-05",
   "views": 0,
   "image": "/assets/site/img/activity-winter.jpg",
   "byline": "محرر المحتوى #2",
   "tags": [
    "شتاء",
    "إيواء"
   ],
   "excerpt": "إيصال حزم الدفء لحماية أكثر من 45 ألف نازح من برد الخيام في جنوب القطاع.",
   "highlights": [
    "10,000 طرد شتوي وأغطية عازلة",
    "45,200 مستفيد",
    "مخيمات النزوح في رفح"
   ],
   "badge": "حملة دفء غزة",
   "desk": null,
   "ref": null,
   "alt": "قافلة إغاثة شتوية",
   "read": null,
   "sample": false
  },
  {
   "slug": "field-clinics",
   "title": "تسيير 3 عيادات ميدانية وإجراء 320 تدخلاً",
   "cat": "activities",
   "status": "published",
   "date": "2026-09-03",
   "views": 1980,
   "image": "/assets/site/img/activity-medical.jpg",
   "byline": "فريق الإعلام",
   "tags": [
    "صحة"
   ],
   "excerpt": "عيادات خيام للجروح والأطفال والتوليد، وصرف أدوية مزمنة، وتحويلات عاجلة داخل وسط القطاع.",
   "highlights": [
    "3 عيادات ميدانية",
    "320 تدخلاً",
    "8,400 كشف",
    "دير البلح"
   ],
   "badge": "البرنامج الصحي في غزة",
   "desk": null,
   "ref": null,
   "alt": "قافلة طبية ميدانية",
   "read": null,
   "sample": false
  },
  {
   "slug": "learning-tent",
   "title": "افتتاح الخيمة التعليمية السادسة لأطفال غزة",
   "cat": "development",
   "status": "published",
   "date": "2026-08-27",
   "views": 2210,
   "image": "/assets/site/img/activity-graduate.jpg",
   "byline": "فريق الإعلام",
   "tags": [
    "تعليم",
    "تنمية"
   ],
   "excerpt": "احتفاء بعودة 210 طفلاً نازحاً إلى حلقات تعلّم مؤقتة في القراءة والحساب والدعم النفسي.",
   "highlights": [
    "الخيمة التعليمية السادسة",
    "210 طالب نازح",
    "خان يونس"
   ],
   "badge": "تعليم النازحين",
   "desk": null,
   "ref": null,
   "alt": "تخريج دفعة تمكين مهني",
   "read": null,
   "sample": false
  },
  {
   "slug": "flour-convoy",
   "title": "وصول قافلة طحين جديدة إلى مراكز الإيواء في دير البلح",
   "cat": "field",
   "status": "draft",
   "date": "2026-09-27",
   "views": 0,
   "image": "/assets/site/img/gallery-convoy.jpg",
   "byline": "منسق ميداني #3",
   "tags": [
    "قوافل"
   ],
   "excerpt": "نص تجريبي: يُستبدل بملخص الخبر الرسمي عند نشره من المكتب الإعلامي.",
   "highlights": [],
   "badge": "توثيق الميدان",
   "desk": null,
   "ref": null,
   "alt": "قافلة إغاثة",
   "read": null,
   "sample": true
  },
  {
   "slug": "water-point",
   "title": "تشغيل نقطة مياه شرب إضافية في شمال القطاع",
   "cat": "activities",
   "status": "draft",
   "date": "2026-09-26",
   "views": 0,
   "image": "/assets/site/img/gallery-water.jpg",
   "byline": "محرر المحتوى #2",
   "tags": [
    "مياه"
   ],
   "excerpt": "نص تجريبي: يُستبدل بملخص الخبر الرسمي عند نشره من المكتب الإعلامي.",
   "highlights": [],
   "badge": "أنشطة ميدانية",
   "desk": null,
   "ref": null,
   "alt": "مياه شرب",
   "read": null,
   "sample": true
  },
  {
   "slug": "quarterly-report",
   "title": "تقرير الأثر الربعي متاح قريباً في المركز الإعلامي",
   "cat": "statements",
   "status": "scheduled",
   "date": "2026-10-12",
   "views": 0,
   "image": "/assets/site/img/project-parallax.jpg",
   "byline": "فريق الإعلام",
   "tags": [
    "تقارير"
   ],
   "excerpt": "نص تجريبي: يُستبدل بملخص التقرير عند نشره من المكتب الإعلامي.",
   "highlights": [],
   "badge": "بيانات وتقارير",
   "desk": null,
   "ref": null,
   "alt": "انتظار الوجبات في مراكز الإيواء",
   "read": null,
   "sample": true
  }
 ],
 "gallery": [
  {
   "title": "قافلة الإغاثة الكبرى",
   "alt": "شاحنات قافلة الإغاثة تصل إلى جباليا",
   "album": "relief",
   "image": "/assets/site/img/gallery-convoy.jpg",
   "order": 1
  },
  {
   "title": "أطفال غزة والحقائب المدرسية",
   "alt": "أطفال يبتسمون بعد استلام الحقائب المدرسية",
   "album": "development",
   "image": "/assets/site/img/gallery-children.jpg",
   "order": 2
  },
  {
   "title": "العيادة الميدانية",
   "alt": "طاقم طبي داخل عيادة خيمة ميدانية",
   "album": "health",
   "image": "/assets/site/img/gallery-clinic.jpg",
   "order": 3
  },
  {
   "title": "نقطة مياه الشرب",
   "alt": "نازحون يملؤون عبوات المياه من صهريج",
   "album": "health",
   "image": "/assets/site/img/gallery-water.jpg",
   "order": 4
  },
  {
   "title": "نقطة توزيع السلال",
   "alt": "فريق يجهز السلال الغذائية في نقطة توزيع",
   "album": "field",
   "image": "/assets/site/img/gallery-lab.jpg",
   "order": 5
  },
  {
   "title": "حزم الدفء الشتوية",
   "alt": "توزيع أغطية شتوية على الأسر النازحة",
   "album": "relief",
   "image": "/assets/site/img/gallery-winter.jpg",
   "order": 6
  },
  {
   "title": "خيم التعلّم",
   "alt": "أطفال في حلقة تعلّم داخل خيمة مدرسية",
   "album": "development",
   "image": "/assets/site/img/gallery-campus.jpg",
   "order": 7
  },
  {
   "title": "توزيع المساعدات الغذائية",
   "alt": "توزيع مساعدات غذائية في شمال غزة",
   "album": "field",
   "image": "/assets/site/img/project-relief.jpg",
   "order": 8
  },
  {
   "title": "فريق العيادات",
   "alt": "فريق طبي يقدم الرعاية للأطفال",
   "album": "health",
   "image": "/assets/site/img/activity-medical.jpg",
   "order": 9
  },
  {
   "title": "صهاريج خان يونس",
   "alt": "توزيع مياه صالحة للشرب في خان يونس",
   "album": "health",
   "image": "/assets/site/img/project-water.jpg",
   "order": 10
  },
  {
   "title": "الخيمة التعليمية السادسة",
   "alt": "أطفال في افتتاح الخيمة التعليمية",
   "album": "development",
   "image": "/assets/site/img/activity-graduate.jpg",
   "order": 11
  },
  {
   "title": "مراكز الإيواء",
   "alt": "انتظار الوجبات الساخنة في مراكز الإيواء",
   "album": "field",
   "image": "/assets/site/img/project-parallax.jpg",
   "order": 12
  }
 ],
 "albums": [
  {
   "id": "field",
   "label": "توثيق الميدان"
  },
  {
   "id": "relief",
   "label": "الإغاثة"
  },
  {
   "id": "development",
   "label": "التعليم والتنمية"
  },
  {
   "id": "health",
   "label": "الصحة والمياه"
  }
 ],
 "categories": [
  {
   "id": "statements",
   "label": "بيانات وتقارير"
  },
  {
   "id": "development",
   "label": "تنمية مجتمعية"
  },
  {
   "id": "field",
   "label": "توثيق الميدان"
  },
  {
   "id": "activities",
   "label": "أنشطة ميدانية"
  }
 ]
}
JSON;
}
