<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use App\Support\Audit;
use App\Support\MenuSupport as MS;
use App\Support\PeopleSupport as PS;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** إدارة القائمة: header + footer menus (tables `menus`, `menu_items`), nested 2 levels, saved as a whole tree. */
class MenuController extends Controller
{
    private const MAX_ITEMS = 80;

    /** GET /admin/menu (named admin.menu) */
    public function page()
    {
        return view('admin.menu.index', ['boot' => $this->boot()]);
    }

    /** GET /admin/menus (JSON) */
    public function index(Request $request)
    {
        if (! $request->expectsJson()) {
            return redirect()->route('admin.menu');
        }

        return response()->json(['data' => $this->boot()]);
    }

    public function show(Request $request, string $menu)
    {
        return $request->expectsJson() ? response()->json(['data' => ['items' => MS::tree($this->find($menu))]]) : redirect()->route('admin.menu');
    }

    public function create()
    {
        return redirect()->route('admin.menu');
    }

    public function edit(string $menu)
    {
        return redirect()->route('admin.menu');
    }

    public function store(): JsonResponse
    {
        return response()->json(['message' => 'القائمتان (الرئيسية والتذييل) ثابتتان، عدّل عناصرهما فقط.'], 405);
    }

    public function destroy(): JsonResponse
    {
        return response()->json(['message' => 'لا يمكن حذف القوائم الأساسية.'], 405);
    }

    /** PUT /admin/menus/{menu} {items:[tree]} : replaces the menu items atomically. */
    public function update(Request $request, string $menu): JsonResponse
    {
        $m = $this->find($menu);
        $items = $request->input('items');
        if (! is_array($items)) {
            return response()->json(['message' => 'بيانات القائمة غير صالحة.'], 422);
        }
        $count = 0;
        foreach ($items as $it) {
            $count += 1 + (is_array($it['children'] ?? null) ? count($it['children']) : 0);
        }
        if ($count > self::MAX_ITEMS) {
            return response()->json(['message' => 'عدد عناصر القائمة كبير (الحد '.self::MAX_ITEMS.').'], 422);
        }
        $clean = [];
        foreach (array_values($items) as $i => $it) {
            $err = null;
            $row = $this->cleanItem($it, $m->slug === 'header', true, $err);
            if ($err) {
                return response()->json(['message' => 'العنصر '.($i + 1).': '.$err, 'errors' => ['items' => [$err]]], 422);
            }
            $kids = [];
            foreach (array_values((array) ($it['children'] ?? [])) as $j => $ch) {
                if (! empty($ch['children'])) {
                    return response()->json(['message' => 'القائمة تدعم مستويين فقط.'], 422);
                }
                $e2 = null;
                $kids[] = $this->cleanItem($ch, false, false, $e2) ?? null;
                if ($e2) {
                    return response()->json(['message' => 'العنصر الفرعي '.($j + 1).' ضمن «'.$row['label'].'»: '.$e2, 'errors' => ['items' => [$e2]]], 422);
                }
            }
            $row['children'] = $kids;
            if ($kids) {
                $row['is_button'] = false;
            }
            if (! $kids && $row['url'] === '') {
                return response()->json(['message' => 'العنصر «'.$row['label'].'» بلا رابط ولا عناصر فرعية.', 'errors' => ['items' => ['رابط مطلوب']]], 422);
            }
            $clean[] = $row;
        }

        DB::transaction(function () use ($m, $clean) {
            $existing = MenuItem::query()->where('menu_id', $m->id)->get()->keyBy('id');
            $keep = [];
            $o = 0;
            foreach ($clean as $row) {
                $top = $this->persist($m, $row, null, ++$o, $existing, $keep);
                $k = 0;
                foreach ($row['children'] as $ch) {
                    $this->persist($m, $ch, $top->id, ++$k, $existing, $keep);
                }
            }
            MenuItem::query()->where('menu_id', $m->id)->whereNotIn('id', $keep ?: [0])->delete();
        });
        Audit::log('menu.update', 'تحديث '.$m->name.' ('.$count.' عنصراً)', $m, ['items' => $count]);

        return response()->json(['data' => ['items' => MS::tree($m->fresh())], 'message' => 'تم حفظ '.$m->name]);
    }

    // ------------------------------------------------------------------

    private function find(string $menu): Menu
    {
        return Menu::query()->where('slug', $menu)->orWhere('id', ctype_digit($menu) ? (int) $menu : 0)->firstOrFail();
    }

    private function boot(): array
    {
        $menus = [];
        foreach (Menu::query()->get() as $m) {
            $menus[$m->slug] = ['id' => $m->id, 'name' => $m->name, 'items' => MS::tree($m)];
        }
        $pages = Page::query()->orderBy('sort_order')->orderBy('id')->get()->map(fn (Page $p) => [
            'id' => (string) $p->id, 'title' => $p->title, 'slug' => $p->slug, 'file' => MS::pagePath($p), 'icon' => $p->icon ?: ($p->slug === 'home' ? 'home' : 'description'), 'status' => $p->status,
        ])->values()->all();

        return ['menus' => $menus, 'pages' => $pages];
    }

    /** @return array|null normalised item (null + $err on failure) */
    private function cleanItem(mixed $it, bool $buttonOk, bool $top, ?string &$err): ?array
    {
        if (! is_array($it)) {
            $err = 'عنصر غير صالح.';

            return null;
        }
        $label = (string) PS::text((string) ($it['label'] ?? ''));
        if ($label === '') {
            $err = 'نص العنصر مطلوب.';

            return null;
        }
        if (mb_strlen($label) > 150) {
            $err = 'نص العنصر طويل (150 حرفاً كحد أقصى).';

            return null;
        }
        $type = in_array($it['type'] ?? '', ['page', 'anchor', 'custom'], true) ? $it['type'] : 'custom';
        $url = MS::cleanUrl((string) ($it['url'] ?? ''));
        $pageId = null;
        if ($type === 'page') {
            $pid = $it['pageId'] ?? null;
            $page = is_numeric($pid) ? Page::query()->find((int) $pid) : null;
            if ($page) {
                $pageId = $page->id;
                $url = MS::pagePath($page);
            } else {
                $type = 'custom';
            }
        }
        if ($url !== '' && $url !== '#' && ! PS::validLink($url)) { // a bare # is an allowed placeholder (item without destination)
            $err = 'الرابط «'.mb_substr($url, 0, 60).'» غير صالح (مسموح: /مسار، #قسم، https://، mailto:، tel:).';

            return null;
        }
        $icon = (string) ($it['icon'] ?? '');
        if ($icon !== '' && ! preg_match('/^[a-z0-9_]{1,60}$/', $icon)) {
            $icon = '';
        }

        return [
            'id' => $it['id'] ?? null, 'label' => $label, 'url' => $url, 'type' => $type, 'page_id' => $pageId, 'icon' => $icon ?: null,
            'is_button' => $buttonOk && $top && ! empty($it['button']), 'open_in_new_tab' => ! empty($it['newTab']), 'is_visible' => ! array_key_exists('visible', $it) || (bool) $it['visible'],
        ];
    }

    private function persist(Menu $m, array $row, ?int $parent, int $order, $existing, array &$keep): MenuItem
    {
        $id = is_string($row['id']) && preg_match('/^db(\d+)$/', $row['id'], $mm) ? (int) $mm[1] : null;
        $item = $id && $existing->has($id) ? $existing[$id] : new MenuItem(['menu_id' => $m->id]);
        $item->menu_id = $m->id;
        $item->parent_id = $parent;
        $item->page_id = $row['page_id'];
        $item->label = $row['label'];
        $item->url = $row['url'] === '' ? null : $row['url'];
        $item->type = $row['type'];
        $item->icon = $row['icon'];
        $item->is_button = $row['is_button'];
        $item->open_in_new_tab = $row['open_in_new_tab'];
        $item->is_visible = $row['is_visible'];
        $item->sort_order = $order;
        $item->save();
        $keep[] = $item->id;

        return $item;
    }
}
