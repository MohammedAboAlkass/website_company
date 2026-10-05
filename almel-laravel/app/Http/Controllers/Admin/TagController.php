<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use App\Support\Audit;
use App\Support\ContentSupport as CS;
use App\Support\Req;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * الوسوم (/admin/tags): CRUD, usage counts, merge. Tags are attached to articles in the news editor (tags + article_tag).
 * Permissions (module `tags`): view / create (add) / edit (rename, merge) / delete (delete, merge).
 */
class TagController extends Controller
{
    private const PER_PAGE = 20;

    public function index(Request $request)
    {
        $q = mb_substr(trim(Req::str($request, 'q', '')), 0, 80);
        $sort = in_array(Req::str($request, 'sort', ''), ['usage', 'name', 'new'], true) ? Req::str($request, 'sort') : 'usage';
        $usage = fn (bool $publishedOnly) => DB::table('article_tag')->join('articles', 'articles.id', '=', 'article_tag.article_id')
            ->whereColumn('article_tag.tag_id', 'tags.id')->whereNull('articles.deleted_at')
            ->when($publishedOnly, fn ($x) => $x->where('articles.status', 'published'))->selectRaw('COUNT(*)');

        $query = Tag::query()->select('tags.*')->selectSub($usage(false), 'uses')->selectSub($usage(true), 'published_uses');
        if ($q !== '') {
            $like = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $q).'%';
            $query->where(fn ($w) => $w->where('name', 'like', $like)->orWhere('slug', 'like', $like));
        }
        match ($sort) {
            'name' => $query->orderBy('name'),
            'new' => $query->orderByDesc('id'),
            default => $query->orderByDesc('uses')->orderBy('name'),
        };
        $tags = $query->paginate(self::PER_PAGE)->withQueryString();

        $total = Tag::query()->count();
        $usedIds = DB::table('article_tag')->join('articles', 'articles.id', '=', 'article_tag.article_id')->whereNull('articles.deleted_at')->distinct()->count('article_tag.tag_id');
        $top = Tag::query()->select('tags.name')->selectSub($usage(false), 'uses')->orderByDesc('uses')->orderBy('name')->first();

        return view('admin.tags.index', [
            'tags' => $tags,
            'q' => $q,
            'sort' => $sort,
            'stats' => ['total' => $total, 'used' => $usedIds, 'unused' => max(0, $total - $usedIds), 'top' => ($top && (int) $top->uses > 0) ? $top->name.' ('.$top->uses.')' : '—'],
            'mergeTargets' => Tag::query()->orderBy('name')->limit(1000)->get(['id', 'name'])->map(fn ($t) => ['id' => $t->id, 'name' => $t->name])->all(),
        ]);
    }

    public function store(Request $request)
    {
        $v = $this->validator($request, null);
        if ($v->fails()) {
            return redirect()->route('admin.tags.index')->withErrors($v)->withInput()->with('tag_form', ['mode' => 'create']);
        }
        $name = $this->cleanName((string) $request->input('name'));
        $slugIn = trim((string) $request->input('slug', ''));
        $slug = CS::slugify($slugIn !== '' ? $slugIn : $name, 'tag');
        $slug = CS::uniqueSlug(Tag::class, $slug, null, 'slug', 100);
        $tag = Tag::create(['name' => $name, 'slug' => $slug]);
        Audit::log('tag.create', 'إضافة وسم: '.$tag->name, $tag, ['type' => 'tags']);

        return redirect()->route('admin.tags.index')->with('success', 'تمت إضافة الوسم «'.$tag->name.'».');
    }

    public function update(Request $request, string $tag)
    {
        $t = Tag::findOrFail($tag);
        $v = $this->validator($request, $t);
        if ($v->fails()) {
            return redirect()->back()->withErrors($v)->withInput()->with('tag_form', ['mode' => 'edit', 'id' => $t->id]);
        }
        $t->name = $this->cleanName((string) $request->input('name'));
        $slugIn = trim((string) $request->input('slug', ''));
        if ($slugIn !== '') {
            $t->slug = CS::uniqueSlug(Tag::class, CS::slugify($slugIn, 'tag'), $t->id, 'slug', 100);
        }
        $t->save();
        if ($t->wasChanged()) {
            Audit::log('tag.update', 'تعديل وسم: '.$t->name, $t, ['type' => 'tags']);
        }

        return redirect()->back()->with('success', 'تم حفظ الوسم «'.$t->name.'».');
    }

    public function destroy(string $tag)
    {
        $t = Tag::findOrFail($tag);
        $name = $t->name;
        $uses = $this->uses($t->id);
        DB::transaction(fn () => $t->delete()); // article_tag rows cascade; the articles themselves are untouched
        Audit::log('tag.delete', 'حذف وسم: '.$name, $t, ['type' => 'tags', 'articles' => $uses]);

        return redirect()->back()->with('success', 'تم حذف الوسم «'.$name.'»'.($uses ? ' وإزالته من '.$uses.' خبر.' : '.'));
    }

    /** POST /admin/tags/{tag}/merge (target_id): moves every article of this tag to the target tag, then deletes this tag. */
    public function merge(Request $request, string $tag)
    {
        abort_unless($request->user()->hasPermission('tags.edit'), 403, 'دمج الوسوم يحتاج صلاحية تعديل الوسوم وحذفها.');
        $src = Tag::findOrFail($tag);
        $targetId = (int) $request->input('target_id');
        if ($targetId <= 0) {
            return redirect()->back()->with('error', 'اختر الوسم الذي سيُدمج فيه.');
        }
        if ($targetId === $src->id) {
            return redirect()->back()->with('error', 'لا يمكن دمج الوسم في نفسه.');
        }
        if (! Tag::query()->whereKey($targetId)->exists()) {
            return redirect()->back()->with('error', 'الوسم المختار غير موجود.');
        }
        $dst = Tag::findOrFail($targetId);
        $moved = 0;
        DB::transaction(function () use ($src, $dst, &$moved) {
            $moved = DB::affectingStatement('INSERT IGNORE INTO article_tag (article_id, tag_id) SELECT article_id, ? FROM article_tag WHERE tag_id = ?', [$dst->id, $src->id]);
            $src->delete();
        });
        Audit::log('tag.merge', 'دمج الوسم «'.$src->name.'» في «'.$dst->name.'»', $dst, ['type' => 'tags', 'from' => $src->name, 'into' => $dst->name, 'articles_moved' => $moved]);

        return redirect()->back()->with('success', 'تم دمج «'.$src->name.'» في «'.$dst->name.'».');
    }

    // ------------------------------------------------------------------

    private function uses(int $tagId): int
    {
        return (int) DB::table('article_tag')->join('articles', 'articles.id', '=', 'article_tag.article_id')
            ->where('article_tag.tag_id', $tagId)->whereNull('articles.deleted_at')->count();
    }

    private function cleanName(string $s): string
    {
        $s = strip_tags($s);
        $s = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $s);
        $s = trim((string) preg_replace('/\s+/u', ' ', $s));
        $s = trim(ltrim($s, '#'));

        return mb_substr($s, 0, 100);
    }

    private function validator(Request $request, ?Tag $tag)
    {
        $v = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:100'],
        ], [
            'name.required' => 'اسم الوسم مطلوب.',
            'name.max' => 'اسم الوسم طويل جداً (الحد 100 حرف).',
            'slug.max' => 'الرابط المختصر طويل جداً (الحد 100 حرف).',
        ]);
        $v->after(function ($v) use ($request, $tag) {
            if ($v->errors()->isNotEmpty()) {
                return;
            }
            $name = $this->cleanName((string) $request->input('name'));
            if (mb_strlen($name) < 2) {
                $v->errors()->add('name', 'اسم الوسم يجب أن يكون حرفين على الأقل.');

                return;
            }
            if (mb_strlen($name) > 100) {
                $v->errors()->add('name', 'اسم الوسم طويل جداً (الحد 100 حرف).');

                return;
            }
            $slugIn = trim((string) $request->input('slug', ''));
            $slugCand = CS::slugify($slugIn !== '' ? $slugIn : $name, 'tag');
            $dup = Tag::query()->where(fn ($w) => $w->where('name', $name)->orWhere('slug', CS::slugify($name, 'tag')))
                ->when($tag, fn ($w) => $w->where('id', '!=', $tag->id))->exists();
            if ($dup) {
                $v->errors()->add('name', 'يوجد وسم بنفس الاسم. يمكنك دمج الوسمين بدلاً من تكراره.');
            } elseif ($slugIn !== '' && Tag::query()->where('slug', $slugCand)->when($tag, fn ($w) => $w->where('id', '!=', $tag->id))->exists()) {
                $v->errors()->add('slug', 'هذا الرابط المختصر مستخدم لوسم آخر.');
            }
        });

        return $v;
    }
}
