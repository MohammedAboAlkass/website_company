-- Home-page audit, Batch 1 + Batch 2  (safe to run more than once: every statement is guarded)
-- 1) the editable defaults of the opening hours + the four hero stats (shown in الإعدادات العامة, read by the public site)
-- 2) contact.field_points: the seeded text differs from the points the site really shows; it is aligned ONLY while it still holds the untouched seed value
-- Batch 2 itself needs NO table: the order / visibility / texts live in ONE settings row `home.sections`, created on the first save.
SET NAMES utf8mb4;

SET @m := (SELECT COALESCE(MAX(sort_order), 0) FROM settings WHERE section = 'general');
INSERT INTO settings (`key`, `value`, `type`, `section`, `label`, `is_public`, `sort_order`, `created_at`, `updated_at`)
SELECT 'site.hours', 'الأحد - الخميس • 8:00 ص - 4:00 م', 'string', 'general', 'hoursText', 1, @m + 1, NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE `key` = 'site.hours');
INSERT INTO settings (`key`, `value`, `type`, `section`, `label`, `is_public`, `sort_order`, `created_at`, `updated_at`)
SELECT 'site.hero_stat1_value', '180K+', 'string', 'general', 'heroStat1Value', 1, @m + 2, NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE `key` = 'site.hero_stat1_value');
INSERT INTO settings (`key`, `value`, `type`, `section`, `label`, `is_public`, `sort_order`, `created_at`, `updated_at`)
SELECT 'site.hero_stat1_label', 'مستفيد في غزة', 'string', 'general', 'heroStat1Label', 1, @m + 3, NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE `key` = 'site.hero_stat1_label');
INSERT INTO settings (`key`, `value`, `type`, `section`, `label`, `is_public`, `sort_order`, `created_at`, `updated_at`)
SELECT 'site.hero_stat2_value', '5', 'string', 'general', 'heroStat2Value', 1, @m + 4, NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE `key` = 'site.hero_stat2_value');
INSERT INTO settings (`key`, `value`, `type`, `section`, `label`, `is_public`, `sort_order`, `created_at`, `updated_at`)
SELECT 'site.hero_stat2_label', 'محافظات القطاع', 'string', 'general', 'heroStat2Label', 1, @m + 5, NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE `key` = 'site.hero_stat2_label');
INSERT INTO settings (`key`, `value`, `type`, `section`, `label`, `is_public`, `sort_order`, `created_at`, `updated_at`)
SELECT 'site.hero_stat3_value', '+2,500', 'string', 'general', 'heroStat3Value', 1, @m + 6, NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE `key` = 'site.hero_stat3_value');
INSERT INTO settings (`key`, `value`, `type`, `section`, `label`, `is_public`, `sort_order`, `created_at`, `updated_at`)
SELECT 'site.hero_stat3_label', 'مقطع موثّق من غزة', 'string', 'general', 'heroStat3Label', 1, @m + 7, NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE `key` = 'site.hero_stat3_label');
INSERT INTO settings (`key`, `value`, `type`, `section`, `label`, `is_public`, `sort_order`, `created_at`, `updated_at`)
SELECT 'site.hero_stat4_value', '98.4%', 'string', 'general', 'heroStat4Value', 1, @m + 8, NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE `key` = 'site.hero_stat4_value');
INSERT INTO settings (`key`, `value`, `type`, `section`, `label`, `is_public`, `sort_order`, `created_at`, `updated_at`)
SELECT 'site.hero_stat4_label', 'نسبة الشفافية والتدقيق', 'string', 'general', 'heroStat4Label', 1, @m + 9, NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE `key` = 'site.hero_stat4_label');

UPDATE settings
   SET `value` = 'جباليا وبيت حانون • غزة المدينة والشاطئ • دير البلح • خان يونس ورفح', `updated_at` = NOW()
 WHERE `key` = 'contact.field_points' AND `value` = 'جباليا • الشاطئ • دير البلح • خان يونس';
