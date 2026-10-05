<?php

namespace App\Support;

use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;

/** Menus («إدارة القائمة»): url normalisation + tree (de)serialisation shared by the admin controller and the public site. */
class MenuSupport
{
    /** Legacy static-site links (about.html, index.html#faq, project.html?id=x) -> application URLs. */
    public static function cleanUrl(?string $u): string
    {
        $u = trim((string) $u);
        if ($u === '') {
            return '';
        }
        if (preg_match('~^(?:\./)?([a-z0-9_\-/]+)\.html(\?[^#]*)?(#.*)?$~i', $u, $m)) {
            $name = $m[1];
            $q = $m[2] ?? '';
            $frag = $m[3] ?? '';
            if ($name === 'index') {
                // the home-page «الشركاء» section now has its own page (/partners)
                return $frag === '#partners' ? '/partners' : '/'.$frag;
            }
            if ($name === 'project' && preg_match('~^\?id=([A-Za-z0-9_\-]+)$~', $q, $mm)) {
                return '/projects/'.$mm[1].$frag;
            }
            if ($name === 'admin/login') {
                return '/admin/login';
            }

            return '/'.$name.$q.$frag;
        }

        return $u;
    }

    public static function pagePath(Page $p): string
    {
        return $p->slug === 'home' ? '/' : '/'.$p->slug;
    }

    /** @return array<int,array> nested items ready for the admin JS / the public nav */
    public static function tree(Menu $menu, bool $onlyVisible = false): array
    {
        $items = MenuItem::query()->where('menu_id', $menu->id)->with(['page' => fn ($q) => $q])->orderBy('sort_order')->orderBy('id')->get();
        $by = $items->groupBy(fn ($i) => $i->parent_id ?? 0);
        $build = function ($parent) use (&$build, $by, $onlyVisible) {
            $out = [];
            foreach ($by->get($parent ?? 0, collect()) as $i) {
                if ($onlyVisible && ! $i->is_visible) {
                    continue;
                }
                if ($onlyVisible && $i->type === 'page' && $i->page_id && ! $i->page) {
                    continue; // linked page was deleted
                }
                if ($onlyVisible && $i->type === 'page' && $i->page && $i->page->status !== 'published') {
                    continue;
                }
                $url = $i->type === 'page' && $i->page ? self::pagePath($i->page) : self::cleanUrl($i->url);
                $row = [
                    'id' => 'db'.$i->id, 'label' => $i->label, 'url' => $url, 'type' => $i->type, 'icon' => (string) $i->icon,
                    'newTab' => (bool) $i->open_in_new_tab, 'button' => (bool) $i->is_button, 'visible' => (bool) $i->is_visible,
                    'pageId' => $i->page_id ? (string) $i->page_id : null,
                ];
                $kids = $build($i->id);
                if ($kids) {
                    $row['children'] = $kids;
                }
                $out[] = $row;
            }

            return $out;
        };

        return $build(null);
    }

    /** Header menu for the public site (null when the table is empty / unreadable so the static nav stays in use). */
    public static function publicTree(string $slug): ?array
    {
        try {
            $menu = Menu::query()->where('slug', $slug)->first();
            if (! $menu) {
                return null;
            }
            $t = self::tree($menu, true);

            return $t ?: null;
        } catch (\Throwable $e) {
            report($e);

            return null;
        }
    }
}
