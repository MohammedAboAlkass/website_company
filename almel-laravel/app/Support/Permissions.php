<?php

namespace App\Support;

use Illuminate\Http\Request;

/** Permission catalog helpers + the route -> required permission resolver used by the `perm` middleware. */
class Permissions
{
    /** @return array<int,array{key:string,label:string,modules:array}> */
    public static function groups(): array
    {
        return (array) config('permissions.groups', []);
    }

    /** @return array<string,string> action => Arabic label */
    public static function actions(): array
    {
        return (array) config('permissions.actions', []);
    }

    /** @return string[] every <module>.<action> key of the catalog */
    public static function allKeys(): array
    {
        $out = [];
        foreach (self::groups() as $g) {
            foreach ($g['modules'] as $m) {
                foreach ($m['actions'] as $a) {
                    $out[] = $m['key'].'.'.$a;
                }
            }
        }

        return $out;
    }

    public static function moduleActions(string $module): array
    {
        foreach (self::groups() as $g) {
            foreach ($g['modules'] as $m) {
                if ($m['key'] === $module) {
                    return $m['actions'];
                }
            }
        }

        return [];
    }

    /**
     * What the current route needs.
     *
     * @return array{free?:bool,super?:bool,all?:string[],any?:string[]}
     */
    public static function required(Request $request): array
    {
        $route = $request->route();
        $name = $route ? (string) $route->getName() : '';
        if ($name === '') {
            return ['super' => true]; // unnamed route: fail closed
        }
        $name = (string) preg_replace('/^admin\./', '', $name);
        $seg = explode('.', $name);
        $first = $seg[0];
        $last = end($seg);
        if (in_array($first, (array) config('permissions.free_routes', []), true)) {
            return ['free' => true];
        }
        if ($first === 'editor') { // shared rich-text editor (media library + uploads): anyone who can create / edit content
            $any = [];
            foreach (['news', 'gallery', 'projects', 'stories', 'activities', 'partners', 'faq', 'appeal', 'announcements', 'pages', 'homepage'] as $m) {
                foreach (['create', 'edit'] as $a) {
                    $any[] = $m.'.'.$a;
                }
            }

            return ['any' => $any];
        }
        $module = config('permissions.route_modules.'.$first);
        if (! $module) {
            return ['super' => true]; // unknown area: only the super admin
        }
        $method = $request->method();
        $read = in_array($method, ['GET', 'HEAD'], true);

        // ---- explicit cases
        if ($module === 'dashboard') {
            return ['all' => ['dashboard.view']];
        }
        if ($name === 'news.edit') {
            return ['any' => ['news.create', 'news.edit']];
        }
        if ($first === 'roles') {
            if ($name === 'roles.assign') {
                return ['all' => ['roles.edit', 'users.edit']];
            }

            return ['all' => ['roles.'.self::crud($last, $method)]];
        }
        if ($first === 'settings') {
            if (in_array($name, ['settings.index', 'settings.data'], true)) {
                return ['all' => ['settings.view']];
            }
            if (($seg[1] ?? '') === 'constants') {
                return ['all' => ['constants.manage']];
            }
            if ($name === 'settings.update') {
                $group = (string) ($route->parameter('group') ?? '');

                return ['all' => [$group === 'backup' ? 'backup.manage' : 'settings.edit']];
            }

            return ['all' => ['settings.edit']]; // sessions.* etc.
        }
        if ($first === 'backup') { // backup page + history: backup.view; export / download / import / delete: backup.manage
            return ['all' => [($read && $name !== 'backup.download') ? 'backup.view' : 'backup.manage']];
        }
        if ($first === 'audit-logs') { // read-only: list + details need audit.view, the CSV export also audit.export; nothing else exists
            if (! $read) {
                return ['super' => true];
            }

            return ['all' => $last === 'export' ? ['audit.view', 'audit.export'] : ['audit.view']];
        }

        // ---- generic
        $actions = self::moduleActions($module);
        $special = [
            'publish' => 'publish', 'unpublish' => 'publish',
            'reorder' => 'edit', 'bulk-move' => 'edit', 'toggle' => 'edit', 'password' => 'edit', 'read' => 'edit', 'archive' => 'edit',
            'bulk-status' => 'edit', 'bulk-delete' => 'delete', 'restore' => 'delete', 'export' => 'export', 'merge' => 'delete',
        ];
        if (in_array($last, ['cover', 'logo', 'image'], true)) {
            $cand = ['any' => [$module.'.create', $module.'.edit']];

            return $cand;
        }
        if (isset($special[$last])) {
            $action = $special[$last];
        } elseif (count($seg) >= 3 && ! $read) {
            $action = 'edit'; // nested resources (page sections/blocks, menu items)
        } elseif ($last === 'create') {
            $action = 'create';
        } elseif ($last === 'edit') {
            $action = 'edit';
        } else {
            $action = $read ? 'view' : match ($method) {
                'POST' => 'create',
                'PUT', 'PATCH' => 'edit',
                'DELETE' => 'delete',
                default => 'edit',
            };
        }
        if (! in_array($action, $actions, true)) {
            if (in_array('edit', $actions, true) && $action !== 'view') {
                $action = 'edit'; // modules without create/delete/publish (homepage, impact, messages...)
            } elseif ($action !== 'view') {
                return ['super' => true];
            }
        }
        $need = [$module.'.'.$action];

        // Saving a record as "published" needs the publish permission too
        if (! $read && in_array($action, ['create', 'edit'], true) && in_array('publish', $actions, true) && self::publishes($request)) {
            $need[] = $module.'.publish';
        }

        return ['all' => $need];
    }

    private static function crud(string $last, string $method): string
    {
        if (in_array($method, ['GET', 'HEAD'], true)) {
            return 'view';
        }

        return match ($method) {
            'POST' => 'create',
            'PUT', 'PATCH' => 'edit',
            'DELETE' => 'delete',
            default => 'edit',
        };
    }

    /** True when the request tries to publish something that is not already published. */
    private static function publishes(Request $request): bool
    {
        $wants = false;
        $status = $request->input('status');
        if (is_string($status) && in_array($status, ['published', 'scheduled'], true)) {
            $wants = true;
            $field = 'status';
            $val = $status;
        } elseif ($request->has('is_published') && filter_var($request->input('is_published'), FILTER_VALIDATE_BOOLEAN)) {
            $wants = true;
            $field = 'is_published';
            $val = true;
        }
        if (! $wants) {
            return false;
        }
        // an unchanged value of the existing record (e.g. editing an already published article) is not a new publish
        $models = ['article' => \App\Models\Article::class, 'gallery_item' => \App\Models\GalleryItem::class, 'gallery_album' => \App\Models\GalleryAlbum::class,
            'project' => \App\Models\Project::class, 'page' => \App\Models\Page::class, 'story' => \App\Models\Story::class];
        foreach ((array) optional($request->route())->parameters() as $name => $p) {
            if (is_scalar($p) && isset($models[$name]) && class_exists($models[$name])) {
                try {
                    $p = $models[$name]::query()->find($p);
                } catch (\Throwable $e) {
                    $p = null;
                }
            }
            if ($p instanceof \Illuminate\Database\Eloquent\Model && array_key_exists($field, $p->getAttributes())) {
                $old = $p->getAttribute($field);
                if ($field === 'status' ? ($old === $val) : (bool) $old === true) {
                    return false;
                }
            }
        }

        return true;
    }
}
