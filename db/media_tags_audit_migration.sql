-- Media library + tags + audit log (additive, idempotent: safe to run more than once).
-- Run: mysql --default-character-set=utf8mb4 -uroot almel_association < media_tags_audit_migration.sql
-- (The project does not use Laravel migrations: tables come from schema.sql, so this file plays that role.)
SET NAMES utf8mb4;

-- 1) media_files.caption (library: title = display name, alt_text = alt, caption = optional caption)
SET @has := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'media_files' AND COLUMN_NAME = 'caption');
SET @sql := IF(@has = 0, 'ALTER TABLE `media_files` ADD COLUMN `caption` VARCHAR(500) NULL DEFAULT NULL COMMENT ''Optional caption shown under the file in the media library'' AFTER `alt_text`', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 2) audit_logs.subject_label (readable name of the affected record, survives deletion) + index on action
SET @has := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_logs' AND COLUMN_NAME = 'subject_label');
SET @sql := IF(@has = 0, 'ALTER TABLE `audit_logs` ADD COLUMN `subject_label` VARCHAR(255) NULL DEFAULT NULL COMMENT ''Readable name of the affected record'' AFTER `subject_id`', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @has := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_logs' AND INDEX_NAME = 'audit_logs_action_index');
SET @sql := IF(@has = 0, 'ALTER TABLE `audit_logs` ADD KEY `audit_logs_action_index` (`action`)', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 3) permissions: media.* and tags.* (INSERT IGNORE: never overwrites)
INSERT IGNORE INTO `permissions` (`perm_key`, `module`, `action`, `name_ar`, `sort_order`, `created_at`, `updated_at`) VALUES
('media.view',   'media', 'view',   'عرض مكتبة الوسائط',            76, NOW(), NOW()),
('media.create', 'media', 'create', 'رفع ملفات إلى مكتبة الوسائط',  77, NOW(), NOW()),
('media.edit',   'media', 'edit',   'تعديل بيانات ملفات الوسائط',   78, NOW(), NOW()),
('media.delete', 'media', 'delete', 'حذف ملفات الوسائط',            79, NOW(), NOW()),
('tags.view',    'tags',  'view',   'عرض الوسوم',                   80, NOW(), NOW()),
('tags.create',  'tags',  'create', 'إضافة وسوم',                   81, NOW(), NOW()),
('tags.edit',    'tags',  'edit',   'تعديل ودمج الوسوم',            82, NOW(), NOW()),
('tags.delete',  'tags',  'delete', 'حذف الوسوم',                   83, NOW(), NOW());

-- 4) roles: every role that holds gallery.<action> gets media.<action>; news.<action> gets tags.<action> (view/create/edit/delete)
INSERT IGNORE INTO `role_permission` (`role_id`, `permission_id`)
SELECT rp.role_id, np.id
FROM `role_permission` rp
JOIN `permissions` op ON op.id = rp.permission_id AND op.perm_key IN ('gallery.view', 'gallery.create', 'gallery.edit', 'gallery.delete')
JOIN `permissions` np ON np.perm_key = REPLACE(op.perm_key, 'gallery.', 'media.');

INSERT IGNORE INTO `role_permission` (`role_id`, `permission_id`)
SELECT rp.role_id, np.id
FROM `role_permission` rp
JOIN `permissions` op ON op.id = rp.permission_id AND op.perm_key IN ('news.view', 'news.create', 'news.edit', 'news.delete')
JOIN `permissions` np ON np.perm_key = REPLACE(op.perm_key, 'news.', 'tags.');

-- the locked super role keeps every permission row
INSERT IGNORE INTO `role_permission` (`role_id`, `permission_id`)
SELECT r.id, p.id FROM `roles` r JOIN `permissions` p WHERE r.role_key = 'admin';
