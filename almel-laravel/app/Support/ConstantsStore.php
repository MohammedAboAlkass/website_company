<?php

namespace App\Support;

use App\Models\ConstantGroup;
use App\Models\ConstantItem;

/** «ثوابت النظام» read/write helper over constant_groups / constant_items. */
class ConstantsStore
{
    public static function itemsOf(ConstantGroup $g): array
    {
        return ConstantItem::query()->where('group_id', $g->id)->orderBy('sort_order')->orderBy('id')->get()
            ->map(function (ConstantItem $i, int $n) {
                $o = ['key' => $i->item_key, 'label' => $i->label_ar, 'active' => (bool) $i->is_active, 'order' => $n];
                $note = is_array($i->meta) ? ($i->meta['note'] ?? null) : null;
                if ($note) {
                    $o['note'] = (string) $note;
                }

                return $o;
            })->all();
    }

    /** Groups in the shape the JS (admin-constants.js) expects. */
    public static function groups(): array
    {
        $groups = ConstantGroup::query()->ordered()->get();
        $items = ConstantItem::query()->orderBy('sort_order')->orderBy('id')->get()->groupBy('group_id');
        $out = [];
        foreach ($groups as $g) {
            $list = [];
            $lock = [];
            foreach ($items->get($g->id, collect()) as $n => $i) {
                $o = ['key' => $i->item_key, 'label' => $i->label_ar, 'active' => (bool) $i->is_active, 'order' => $n];
                $note = is_array($i->meta) ? ($i->meta['note'] ?? null) : null;
                if ($note) {
                    $o['note'] = (string) $note;
                }
                $list[] = $o;
                if ($i->is_locked) {
                    $lock[] = $i->item_key;
                }
            }
            $out[] = [
                'key' => $g->group_key,
                'label' => $g->name_ar,
                'desc' => (string) $g->description,
                'pages' => array_values((array) $g->used_in),
                'fixed' => (bool) $g->is_locked,
                'lock' => $lock,
                'items' => $list,
            ];
        }

        return $out;
    }

    /** Safe version for the layout: never breaks a page. */
    public static function groupsOrNull(): ?array
    {
        try {
            $g = self::groups();

            return $g ?: null;
        } catch (\Throwable $e) {
            report($e);

            return null;
        }
    }

    public static function keys(string $group): array
    {
        $g = ConstantGroup::query()->key($group)->first();

        return $g ? ConstantItem::query()->where('group_id', $g->id)->pluck('item_key')->map(fn ($k) => (string) $k)->all() : [];
    }

    public static function resequence(ConstantGroup $g): void
    {
        $n = 0;
        foreach (ConstantItem::query()->where('group_id', $g->id)->orderBy('sort_order')->orderBy('id')->get() as $i) {
            if ((int) $i->sort_order !== $n) {
                $i->sort_order = $n;
                $i->save();
            }
            $n++;
        }
    }

    /** Restore a group to config('constants_defaults'). Existing ref_slug meta of a kept key is preserved. */
    public static function reset(ConstantGroup $g): void
    {
        $def = collect(config('constants_defaults', []))->firstWhere('key', $g->group_key);
        if (! $def) {
            return;
        }
        $lock = (array) ($def['lock'] ?? []);
        $existing = ConstantItem::query()->where('group_id', $g->id)->get()->keyBy('item_key');
        $keys = [];
        foreach ($def['items'] as $n => $d) {
            $keys[] = (string) $d['key'];
            $row = $existing->get((string) $d['key']) ?? new ConstantItem(['group_id' => $g->id, 'item_key' => (string) $d['key']]);
            $meta = is_array($row->meta) ? $row->meta : [];
            unset($meta['note']);
            if (! empty($d['note'])) {
                $meta['note'] = $d['note'];
            }
            $row->label_ar = $d['label'];
            $row->is_active = true;
            $row->is_locked = in_array((string) $d['key'], array_map('strval', $lock), true);
            $row->sort_order = $n;
            $row->meta = $meta ?: null;
            $row->save();
        }
        ConstantItem::query()->where('group_id', $g->id)->whereNotIn('item_key', $keys)->delete();
    }
}
