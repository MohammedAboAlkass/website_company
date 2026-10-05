-- =============================================================================
-- Partners / FAQ / Announcements+Appeal / Impact-map pages become database backed.
-- Additive and idempotent: only adds the soft-delete column `deleted_at` to `faqs` and `announcements`
-- (the other tables - partners, appeals, governorates, settings, media_files - already had what the pages need).
-- Restore point (taken before this change): backup-before-people-pages.sql
-- Run:  mysql --default-character-set=utf8mb4 -uroot almel_association < people_pages_migration.sql
-- =============================================================================
SET @s := (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `faqs` ADD COLUMN `deleted_at` TIMESTAMP NULL DEFAULT NULL AFTER `updated_at`', 'SELECT 1')
           FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'faqs' AND COLUMN_NAME = 'deleted_at');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

SET @s := (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `announcements` ADD COLUMN `deleted_at` TIMESTAMP NULL DEFAULT NULL AFTER `updated_at`', 'SELECT 1')
           FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'announcements' AND COLUMN_NAME = 'deleted_at');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- =============================================================================
-- Announcements get their OWN dashboard page (/admin/announcements) next to the relief-appeal page (/admin/appeal):
--  * new nullable rich-text column announcements.details (sanitised HTML written by the shared rich editor)
--  * own permission module nnouncements (view/create/edit/delete); roles that already had appeal.<action> get
--    announcements.<action> once (only while nobody holds an announcements.* permission yet), so nobody loses access.
--  * the ppeal permission names now read "relief appeal".
-- Restore point (taken before this change): backup-before-announcements-split.sql
-- =============================================================================
SET @s := (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `announcements` ADD COLUMN `details` TEXT NULL COMMENT ''Optional rich text (sanitised HTML) with the announcement details'' AFTER `link_url`', 'SELECT 1')
           FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'announcements' AND COLUMN_NAME = 'details');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

INSERT IGNORE INTO `permissions` (`perm_key`, `module`, `action`, `name_ar`, `sort_order`, `created_at`, `updated_at`) VALUES
 ('announcements.view',   'announcements', 'view',   CONVERT(UNHEX('D8B9D8B1D8B620D8A7D984D8A5D8B9D984D8A7D986D8A7D8AA') USING utf8mb4),   72, NOW(), NOW()),
 ('announcements.create', 'announcements', 'create', CONVERT(UNHEX('D8A5D8B6D8A7D981D8A920D8A5D8B9D984D8A7D986') USING utf8mb4), 73, NOW(), NOW()),
 ('announcements.edit',   'announcements', 'edit',   CONVERT(UNHEX('D8AAD8B9D8AFD98AD98420D8A7D984D8A5D8B9D984D8A7D986D8A7D8AA') USING utf8mb4),   74, NOW(), NOW()),
 ('announcements.delete', 'announcements', 'delete', CONVERT(UNHEX('D8ADD8B0D98120D8A5D8B9D984D8A7D986') USING utf8mb4), 75, NOW(), NOW());

INSERT IGNORE INTO `role_permission` (`role_id`, `permission_id`)
SELECT rp.role_id, pn.id
FROM `role_permission` rp
JOIN `permissions` po ON po.id = rp.permission_id AND po.module = 'appeal'
JOIN `permissions` pn ON pn.perm_key = CONCAT('announcements.', po.action)
WHERE NOT EXISTS (SELECT 1 FROM `permissions` px JOIN `role_permission` rx ON rx.permission_id = px.id WHERE px.module = 'announcements');

UPDATE `permissions` SET `name_ar` = CONVERT(UNHEX('D8B9D8B1D8B620D986D8AFD8A7D8A120D8A7D984D8A5D8BAD8A7D8ABD8A9') USING utf8mb4)   WHERE `perm_key` = 'appeal.view';
UPDATE `permissions` SET `name_ar` = CONVERT(UNHEX('D8A5D8B6D8A7D981D8A920D986D8AFD8A7D8A120D8A7D984D8A5D8BAD8A7D8ABD8A9') USING utf8mb4) WHERE `perm_key` = 'appeal.create';
UPDATE `permissions` SET `name_ar` = CONVERT(UNHEX('D8AAD8B9D8AFD98AD98420D986D8AFD8A7D8A120D8A7D984D8A5D8BAD8A7D8ABD8A9') USING utf8mb4)   WHERE `perm_key` = 'appeal.edit';
UPDATE `permissions` SET `name_ar` = CONVERT(UNHEX('D8ADD8B0D98120D986D8AFD8A7D8A120D8A7D984D8A5D8BAD8A7D8ABD8A9') USING utf8mb4) WHERE `perm_key` = 'appeal.delete';