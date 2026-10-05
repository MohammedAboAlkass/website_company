# almel_association — database design

MySQL 8 · utf8mb4 / utf8mb4_unicode_ci · InnoDB · Laravel 12 naming conventions.
The website has **no donations**, so there are no donation/payment tables.
Site is Arabic only: Arabic text lives directly in the main tables. An empty
`translations` table is included so other languages can be added later.

## Files
| File | What it is |
|------|------------|
| `schema.sql` | Creates the database `almel_association` and all 44 tables (41 foreign keys). |
| `seed.sql` | Lookup data + real homepage content (programs, 5 governorates + impact numbers, settings, menus, pages/sections, stories, activities, partners, FAQ, appeal, announcements) a placeholder admin user and the 19 system-constant groups (103 items), 5 dashboard roles with 71 permissions. |
| `erd.png` / `erd.svg` | ER diagram drawn from the real imported database. |
| `erd.md` | Same relationships as a Mermaid diagram. |
| `backup-before-constants.sql` | mysqldump of the 39-table database taken before the constants tables were added (restore point). |

## Tables by area
- **Users & system:** `users` (`role` = `roles.role_key`), `password_reset_tokens`, `sessions`, `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`, `notifications` (bell), `audit_logs` (activity log)
- **Settings & media:** `settings` (key/value), `media_files` (upload library), `translations` (optional, empty)
- **Roles & permissions:** `roles`, `permissions`, `role_permission` (see below)
- **System constants:** `constant_groups`, `constant_items` (all editable dropdown lists, see below)
- **Lookups:** `programs` (relief, construction, development, health), `governorates` (5, with impact numbers)
- **Projects:** `projects`, `project_facts`, `project_components`, `project_images`, `project_updates`
- **News:** `article_categories`, `articles`, `tags`, `article_tag`
- **Gallery:** `gallery_albums`, `gallery_items`
- **Homepage blocks:** `stories`, `activities`, `partners`, `faqs`, `appeals` (urgent card), `announcements` (bar items)
- **CMS & menus:** `pages`, `page_sections`, `page_section_blocks`, `menus`, `menu_items` (nested via `parent_id`)
- **Inbox:** `contact_messages` (type: contact / volunteer / partnership / media / inquiry / other), `newsletter_subscribers`

## System constants (dropdown lists editable from the dashboard)
Dashboard: Settings > **ثوابت النظام**. Replaces the browser-only `localStorage` key `almel-admin-constants`.

| Table | Purpose |
|-------|---------|
| `constant_groups` | One row per dropdown list: `group_key` (unique, e.g. `project_status`), `name_ar`, `description`, `ref_table` (existing table that owns the same list, or NULL), `used_in` (JSON list of dashboard pages), `is_locked`, `sort_order`. |
| `constant_items` | One row per option: `group_id` (FK, **ON DELETE CASCADE**), `item_key` (the stored value, unique per group), `label_ar`, `is_active`, `is_locked`, `sort_order`, `meta` (JSON: `note` help text, `ref_slug` link to the existing table row), timestamps. Index `(group_id, sort_order)`. |

- **`constant_groups.is_locked = 1`**: keys are tied to code behaviour, so items cannot be added or deleted; only `label_ar`, `sort_order`, `is_active` are editable.
- **`constant_items.is_locked = 1`**: system item that cannot be deleted (and should not be disabled): `admin`, `off`, `never`.
- Columns that store a constant (`projects.status`, `users.role` = `roles.role_key`, ...) stay plain `VARCHAR` holding the `item_key`. There is **no foreign key** on purpose: a disabled/deleted option never breaks old records (the dashboard falls back to the stored key / seed label). No existing table or column was changed or altered (all were already `VARCHAR`, no `ENUM` in the schema).
- Lists that already have their own table are **not duplicated**: the constants group only stores the dropdown label/order/enabled flag and `ref_table` names the owning table. `meta.ref_slug` gives the matching row (`governorate` items use the governorate slug: `north` -> `north-gaza`, `middle` -> `deir-al-balah`, `khan` -> `khan-younis`; the other three use identical slugs). Business data (impact numbers, descriptions, covers) stays in the existing tables.
- No donation-related constants or tables exist.
- Seed: `seed.sql` section 16 uses `INSERT IGNORE`, so re-running never overwrites admin edits. Total: **19 groups, 103 items** (8 locked groups, 2 system items). The old `user_role` group was removed: roles now live in the `roles` table (see "Roles & permissions").

| # | group_key | Arabic name | Items | Locked group | System items | Existing table | Stored in |
|---|-----------|-------------|-------|--------------|--------------|----------------|-----------|
| 1 | `project_status` | حالات المشروع | 5 | no | - | - | `projects.status` |
| 2 | `project_category` | فئات المشاريع (البرامج) | 4 | no | - | `programs` | `projects.program_id` (FK to `programs`) |
| 3 | `governorate` | المحافظات | 5 | no | - | `governorates` | `projects.governorate_id` (FK to `governorates`) |
| 4 | `news_category` | تصنيفات الأخبار | 4 | no | - | `article_categories` | `articles.article_category_id` (FK to `article_categories`) |
| 5 | `article_status` | حالات الخبر | 3 | yes (no add/delete) | - | - | `articles.status` |
| 6 | `page_status` | حالات الصفحة | 3 | yes (no add/delete) | - | - | `pages.status` |
| 7 | `visibility` | حالة الظهور في الموقع | 2 | yes (no add/delete) | - | - | `is_published` / `is_visible` flags (boolean) |
| 8 | `gallery_album` | ألبومات المعرض | 4 | no | - | `gallery_albums` | `gallery_items.gallery_album_id` (FK to `gallery_albums`) |
| 9 | `section_anchor` | أقسام الموقع (وجهات الروابط) | 12 | no | - | - | `link_url` / `url` columns (stories, activities, appeals...) |
| 10 | `icon` | الأيقونات | 20 | no | - | - | `icon` columns (stories, activities, partners...) |
| 11 | `badge_tone` | ألوان وسم الصورة | 3 | yes (no add/delete) | - | - | `activities.badge_tone`, `projects.badge_tone` |
| 12 | `timezone` | المناطق الزمنية | 9 | no | - | - | `settings` key (general section) |
| 13 | `language` | لغات اللوحة | 2 | yes (no add/delete) | - | - | `settings` key (admin language) |
| 14 | `date_format` | تنسيقات التاريخ | 3 | yes (no add/delete) | - | - | `settings` key |
| 15 | `digest_frequency` | تكرار الملخص والنسخ الاحتياطي | 4 | yes (no add/delete) | `off` | - | `settings` `mail.digest_frequency` + backup schedule |
| 16 | `digest_day` | أيام إرسال الملخص | 4 | no | - | - | `settings` key |
| 17 | `password_expiry` | مدد انتهاء كلمة المرور | 5 | no | `never` | - | `settings` key |
| 18 | `session_timeout` | مهل الجلسة | 5 | no | - | - | `settings` key |
| 19 | `audit_type` | أنواع أحداث السجل | 6 | yes (no add/delete) | - | - | `audit_logs.action` filter |

### How Laravel uses it (models `ConstantGroup`, `ConstantItem` in `app/Models`)
```php
// dropdown options (active only, in order)
ConstantItem::active()->ordered()->whereHas('group', fn($q) => $q->key('project_status'))->get();
// or
ConstantGroup::key('icon')->first()->activeItems;
// label of a stored value (also for disabled items)
ConstantItem::whereHas('group', fn($q) => $q->key('project_status'))->where('item_key', $project->status)->value('label_ar');
```
Edit rules to enforce in the controller (later): if `group.is_locked` reject create/delete; if `item.is_locked` reject delete; validate `item_key` unique per group; on save of a group reindex `sort_order` 0..n.

### Applying to an existing database (additive only)
`schema.sql` and `seed.sql` are idempotent for these tables (`CREATE TABLE IF NOT EXISTS`, `INSERT IGNORE`). To add them to an already-imported database without touching anything else, run the "11. SYSTEM CONSTANTS" part of `schema.sql` and section 16 of `seed.sql`:
`mysql --default-character-set=utf8mb4 -uroot almel_association < file.sql`.
Restore point: `backup-before-constants.sql`.

## Roles & permissions (dashboard: «الأدوار والصلاحيات» `/admin/roles`)
Replaces the old `user_role` constants list and the browser-only permission matrix. Enforced on the server (middleware `perm`) and reflected in the UI (menus, buttons).

| Table | Purpose |
|-------|---------|
| `roles` | `role_key` (unique, stored in `users.role`), `name_ar`, `description`, `is_system` (built-in: cannot be deleted), `is_active` (0 = its users cannot sign in), `sort_order`. |
| `permissions` | `perm_key` = `<module>.<action>` (unique, e.g. `news.publish`), `module`, `action` (view / create / edit / delete / publish / export / manage), `name_ar`, `sort_order`. 71 rows over 21 modules. |
| `role_permission` | Pivot `(role_id, permission_id)` primary key; both FKs **ON DELETE CASCADE**. |

- `users.role` stays a plain `VARCHAR(20)` holding `roles.role_key` (no FK, no ALTER on `users`).
- Role **`admin`** is the locked super role: always all permissions (also hard-coded in Laravel), cannot be edited, disabled or deleted.
- Seeded roles (all `is_system = 1`): `admin` 71 permissions, `manager` «مدير المحتوى» 55, `editor` «محرر» 25, `writer` «كاتب» 4, `viewer` «مشاهد» 15 = 170 rows in `role_permission`.
- Laravel: models `Role`, `Permission`; `User::hasPermission('news.edit')`, `Gate::allows('news.edit')`. The permission list and the route-to-permission mapping live in `config/permissions.php` (`App\Support\Permissions`).
- Seed: `seed.sql` section 17 uses `INSERT IGNORE` (never overwrites edits made in the dashboard).

### Applying to an existing database (additive only)
`mysql --default-character-set=utf8mb4 -uroot almel_association < roles_permissions_migration.sql` (creates the 3 tables if missing, inserts permissions/roles/links with `INSERT IGNORE`, then removes the obsolete `user_role` constants group; nothing else is touched).
Restore point: `backup-before-permissions.sql` (mysqldump taken before the change).

## Partners, FAQ, relief appeal, announcements and impact map (database backed dashboard pages)
Dashboard pages `/admin/partners`, `/admin/faq`, `/admin/appeal` (relief appeal card), `/admin/announcements` (announcements bar) and `/admin/impact` read and write the existing tables (no localStorage any more):

| Page | Table(s) | Notes |
|------|----------|-------|
| Partners | `partners` (+ `media_files` for the logo) | soft delete, drag & drop order = `sort_order`, show/hide = `is_published`; logos are uploaded to `storage/app/public/uploads/...` and registered in `media_files`. |
| FAQ | `faqs` | **new column `deleted_at`** (soft delete); answer = sanitised HTML (shared rich-text editor, `HtmlSanitizer`). |
| Relief appeal | `appeals`, `media_files` | one appeal card (content only, no payments): title, rich text, 2 buttons, image upload, optional `starts_at` / `ends_at`, show/hide. |
| Announcements | `announcements`, `settings` (`announcement_bar.visible`, `announcement_bar.label`) | **new columns `announcements.deleted_at` (soft delete) and `announcements.details`** (optional sanitised rich text); drag & drop order, show/hide, optional schedule; own permission module `announcements`. |
| Impact map | `governorates` | the 5 fixed governorates are edited (numbers, note), re-ordered and shown/hidden - never added or deleted. |

- Migration for an existing database (additive, idempotent, adds `deleted_at` to `faqs` and `announcements`, `announcements.details`, and the `announcements.*` permissions copied from `appeal.*` to the same roles): `people_pages_migration.sql` - also run it once after `seed.sql` on a fresh database. Restore points taken before: `backup-before-people-pages.sql`, `backup-before-announcements-split.sql`.
- `php artisan almel:import-people-content` loads the starting content (partners, impact numbers, FAQ, announcements, appeal card, bar settings). Idempotent: partners are matched by name, governorates by slug, FAQ / announcements / appeal are only created while their table is empty.
- Every create / update / delete / re-order / show-hide writes a row to `audit_logs` (`partner.*`, `faq.*`, `announcement.*`, `appeal.*`, `impact.*`).

## Main relationships (plain language)
- A **project** belongs to one **program** and (optionally) one **governorate**; it has many facts, components, images and updates.
- An **article** belongs to one **category**, has one author (**user**), many **tags** (via `article_tag`), and can link to a project.
- **Gallery items** point to a file in `media_files`, belong to an album, and can link to a project / governorate.
- **Pages** have ordered **sections**; sections have small **blocks** (hero stats, pillar cards...).
- **Menu items** belong to a menu (header/footer), can have a parent item, and can point to a page.
- Every image in the site is a row in `media_files`; other tables only store its id (`*_media_id`).

## Run in DBeaver
1. **Database > New Database Connection > MySQL** > Next. Host `localhost`, port `3306`, user `root` + your password. Finish (download the driver if asked).
   (Tick *Allow Public Key Retrieval* in Driver properties if you get an auth error on MySQL 8.)
2. Open a SQL editor: **SQL Editor > New SQL script** (or Ctrl+]).
3. Open `schema.sql` (File > Open File), put it in the editor and run the whole script with **Alt+X**.
4. Open `seed.sql` the same way and run it with **Alt+X**.
5. Right-click **Databases > almel_association** (press F5 to refresh) > **Tables** > select all tables > right-click > **View Diagram** (or open the database > *ER Diagram* tab).

To start again: `DROP DATABASE almel_association;` then re-run both files.

## Notes
- Placeholder admin: `admin@shamal-society.org`, password `__PLACEHOLDER_REPLACE_WITH_BCRYPT_HASH__`, status `invited` (cannot log in until you set a real hash).
- Projects, news and gallery items are **not** seeded (the admin files only contain demo data for them).
- Laravel migrations are not created yet; ask when you want them.


## Hero (hero_settings, hero_slides)
Managed from /admin/hero (permissions: homepage.view / homepage.edit). hero_settings holds one row (id=1, JSON config); hero_slides holds ordered slides with JSON content/style/background. Create: database/sql/hero.sql (idempotent). Seed the default slide (equal to the original hero): php artisan hero:seed [--force]. Public site falls back to built-in defaults when hero_slides is empty.


## Backup, maintenance mode, quick search, pages and menus (system features)

- New table `backup_runs` (history of exports / imports / pre-restore safety copies); see `system_migration.sql` and the end of `schema.sql`. Backup files are JSON (`almel-backup` v1, sha256 checksum) in `storage/app/backups`; users, password hashes, sessions, audit log and secret-like settings are never exported. Scheduled copy: `php artisan almel:backup` (add it to Windows Task Scheduler / cron).
- Maintenance mode uses the existing `settings` rows `site.maintenance` and `site.maintenance_message` plus new optional keys created on first save: `site.maintenance_ips` (allowed IPs / CIDR), `site.maintenance_from`, `site.maintenance_until`. `seed.sql` is unchanged.
- Pages (`pages`): CMS pages are served at `/{slug}` when `status = published`; deleting a page is a soft delete (slug renamed to `slug~del<id>` and restored on undelete). The 8 system pages cannot be deleted. Menus (`menus`, `menu_items`) are edited in `/admin/menu`; the public navigation is still the static header/footer markup.