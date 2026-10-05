-- Roles & permissions migration (additive). Run: mysql --default-character-set=utf8mb4 -uroot almel_association < roles_permissions_migration.sql
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================================
-- 12. ROLES & PERMISSIONS  (dashboard: «الأدوار والصلاحيات»  /admin/roles)
-- =============================================================================
-- users.role (VARCHAR(20)) holds roles.role_key  (no FK on purpose, like other constant-style columns).
-- role_permission: pivot, deleted automatically with the role / permission.
CREATE TABLE IF NOT EXISTS `roles` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_key`    VARCHAR(20) NOT NULL COMMENT 'Stored in users.role: admin, manager, editor, ... (a-z, 0-9, _)',
  `name_ar`     VARCHAR(100) NOT NULL COMMENT 'Arabic name shown in the dashboard',
  `description` VARCHAR(500) NULL,
  `is_system`   TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = built-in role: cannot be deleted. Role admin is also locked (always all permissions)',
  `is_active`   TINYINT(1) NOT NULL DEFAULT 1 COMMENT '0 = users with this role cannot sign in / use the dashboard',
  `sort_order`  INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at`  TIMESTAMP NULL DEFAULT NULL,
  `updated_at`  TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_role_key_unique` (`role_key`),
  KEY `roles_sort_order_index` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Dashboard roles (admin, manager, editor, writer, viewer + custom)';

CREATE TABLE IF NOT EXISTS `permissions` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `perm_key`   VARCHAR(60) NOT NULL COMMENT '<module>.<action>, e.g. news.publish',
  `module`     VARCHAR(40) NOT NULL COMMENT 'dashboard, news, gallery, users, ...',
  `action`     VARCHAR(30) NOT NULL COMMENT 'view, create, edit, delete, publish, export, manage',
  `name_ar`    VARCHAR(150) NOT NULL,
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_perm_key_unique` (`perm_key`),
  KEY `permissions_module_index` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='All permissions of the dashboard (module.action)';

CREATE TABLE IF NOT EXISTS `role_permission` (
  `role_id`       BIGINT UNSIGNED NOT NULL,
  `permission_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  KEY `role_permission_permission_id_index` (`permission_id`),
  CONSTRAINT `role_permission_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permission_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Which permissions each role has';

SET FOREIGN_KEY_CHECKS = 1;

-- 17. Roles & permissions (admin dashboard «الأدوار والصلاحيات»). INSERT IGNORE: re-running never overwrites edits.
-- 71 permissions, 5 roles. Role admin = all permissions (also enforced in code as super admin).
INSERT IGNORE INTO permissions (perm_key,module,action,name_ar,sort_order,created_at,updated_at) VALUES
('dashboard.view','dashboard','view','عرض لوحة التحكم',0,NOW(),NOW()),
('reports.view','reports','view','عرض التقارير والإحصائيات',1,NOW(),NOW()),
('reports.export','reports','export','تصدير التقارير',2,NOW(),NOW()),
('homepage.view','homepage','view','عرض الصفحة الرئيسية',3,NOW(),NOW()),
('homepage.edit','homepage','edit','تعديل الصفحة الرئيسية',4,NOW(),NOW()),
('projects.view','projects','view','عرض المشاريع',5,NOW(),NOW()),
('projects.create','projects','create','إضافة المشاريع',6,NOW(),NOW()),
('projects.edit','projects','edit','تعديل المشاريع',7,NOW(),NOW()),
('projects.delete','projects','delete','حذف المشاريع',8,NOW(),NOW()),
('projects.publish','projects','publish','نشر المشاريع',9,NOW(),NOW()),
('news.view','news','view','عرض الأخبار',10,NOW(),NOW()),
('news.create','news','create','إضافة الأخبار',11,NOW(),NOW()),
('news.edit','news','edit','تعديل الأخبار',12,NOW(),NOW()),
('news.delete','news','delete','حذف الأخبار',13,NOW(),NOW()),
('news.publish','news','publish','نشر الأخبار',14,NOW(),NOW()),
('gallery.view','gallery','view','عرض معرض الصور',15,NOW(),NOW()),
('gallery.create','gallery','create','إضافة معرض الصور',16,NOW(),NOW()),
('gallery.edit','gallery','edit','تعديل معرض الصور',17,NOW(),NOW()),
('gallery.delete','gallery','delete','حذف معرض الصور',18,NOW(),NOW()),
('gallery.publish','gallery','publish','نشر معرض الصور',19,NOW(),NOW()),
('stories.view','stories','view','عرض قصص الميدان',20,NOW(),NOW()),
('stories.create','stories','create','إضافة قصص الميدان',21,NOW(),NOW()),
('stories.edit','stories','edit','تعديل قصص الميدان',22,NOW(),NOW()),
('stories.delete','stories','delete','حذف قصص الميدان',23,NOW(),NOW()),
('stories.publish','stories','publish','نشر قصص الميدان',24,NOW(),NOW()),
('activities.view','activities','view','عرض الأنشطة الميدانية',25,NOW(),NOW()),
('activities.create','activities','create','إضافة الأنشطة الميدانية',26,NOW(),NOW()),
('activities.edit','activities','edit','تعديل الأنشطة الميدانية',27,NOW(),NOW()),
('activities.delete','activities','delete','حذف الأنشطة الميدانية',28,NOW(),NOW()),
('partners.view','partners','view','عرض الشركاء',29,NOW(),NOW()),
('partners.create','partners','create','إضافة الشركاء',30,NOW(),NOW()),
('partners.edit','partners','edit','تعديل الشركاء',31,NOW(),NOW()),
('partners.delete','partners','delete','حذف الشركاء',32,NOW(),NOW()),
('faq.view','faq','view','عرض الأسئلة الشائعة',33,NOW(),NOW()),
('faq.create','faq','create','إضافة الأسئلة الشائعة',34,NOW(),NOW()),
('faq.edit','faq','edit','تعديل الأسئلة الشائعة',35,NOW(),NOW()),
('faq.delete','faq','delete','حذف الأسئلة الشائعة',36,NOW(),NOW()),
('appeal.view','appeal','view','عرض نداء الإغاثة والإعلانات',37,NOW(),NOW()),
('appeal.create','appeal','create','إضافة نداء الإغاثة والإعلانات',38,NOW(),NOW()),
('appeal.edit','appeal','edit','تعديل نداء الإغاثة والإعلانات',39,NOW(),NOW()),
('appeal.delete','appeal','delete','حذف نداء الإغاثة والإعلانات',40,NOW(),NOW()),
('impact.view','impact','view','عرض خريطة الأثر',41,NOW(),NOW()),
('impact.edit','impact','edit','تعديل خريطة الأثر',42,NOW(),NOW()),
('pages.view','pages','view','عرض الصفحات',43,NOW(),NOW()),
('pages.create','pages','create','إضافة الصفحات',44,NOW(),NOW()),
('pages.edit','pages','edit','تعديل الصفحات',45,NOW(),NOW()),
('pages.delete','pages','delete','حذف الصفحات',46,NOW(),NOW()),
('pages.publish','pages','publish','نشر الصفحات',47,NOW(),NOW()),
('menu.view','menu','view','عرض القائمة',48,NOW(),NOW()),
('menu.create','menu','create','إضافة القائمة',49,NOW(),NOW()),
('menu.edit','menu','edit','تعديل القائمة',50,NOW(),NOW()),
('menu.delete','menu','delete','حذف القائمة',51,NOW(),NOW()),
('messages.view','messages','view','عرض الرسائل والطلبات',52,NOW(),NOW()),
('messages.edit','messages','edit','معالجة الرسائل (قراءة وأرشفة)',53,NOW(),NOW()),
('messages.delete','messages','delete','حذف الرسائل والطلبات',54,NOW(),NOW()),
('users.view','users','view','عرض مستخدمو النظام',55,NOW(),NOW()),
('users.create','users','create','إضافة مستخدمو النظام',56,NOW(),NOW()),
('users.edit','users','edit','تعديل مستخدمو النظام',57,NOW(),NOW()),
('users.delete','users','delete','حذف مستخدمو النظام',58,NOW(),NOW()),
('roles.view','roles','view','عرض الأدوار والصلاحيات',59,NOW(),NOW()),
('roles.create','roles','create','إضافة الأدوار والصلاحيات',60,NOW(),NOW()),
('roles.edit','roles','edit','تعديل الأدوار والصلاحيات',61,NOW(),NOW()),
('roles.delete','roles','delete','حذف الأدوار والصلاحيات',62,NOW(),NOW()),
('settings.view','settings','view','عرض الإعدادات العامة',63,NOW(),NOW()),
('settings.edit','settings','edit','تعديل الإعدادات العامة',64,NOW(),NOW()),
('constants.view','constants','view','عرض ثوابت النظام',65,NOW(),NOW()),
('constants.manage','constants','manage','إدارة ثوابت النظام (إضافة وتعديل وحذف)',66,NOW(),NOW()),
('backup.view','backup','view','عرض النسخ الاحتياطي',67,NOW(),NOW()),
('backup.manage','backup','manage','إدارة النسخ الاحتياطي',68,NOW(),NOW()),
('audit.view','audit','view','عرض سجل النشاط',69,NOW(),NOW()),
('audit.export','audit','export','تصدير سجل النشاط',70,NOW(),NOW());

INSERT IGNORE INTO roles (role_key,name_ar,description,is_system,is_active,sort_order,created_at,updated_at) VALUES
('admin','مدير النظام','صلاحيات كاملة على كل أقسام لوحة التحكم، بما فيها المستخدمون والأدوار والإعدادات. دور محمي ولا يمكن تعديله أو تعطيله أو حذفه.',1,1,0,NOW(),NOW()),
('manager','مدير المحتوى','يدير كل أقسام المحتوى والرسائل والتقارير (إضافة وتعديل ونشر وحذف) بدون الإعدادات والمستخدمين والأدوار.',1,1,1,NOW(),NOW()),
('editor','محرر','يضيف ويعدّل الأخبار والمعرض والقصص والأنشطة والشركاء والأسئلة الشائعة والصفحات، بدون حذف أو نشر. يطّلع على الرسائل والمشاريع.',1,1,2,NOW(),NOW()),
('writer','كاتب','يكتب الأخبار ويعدّلها كمسودات فقط، بدون نشر أو حذف ولا وصول لباقي الأقسام.',1,1,3,NOW(),NOW()),
('viewer','مشاهد','اطّلاع فقط على لوحة التحكم والتقارير وأقسام المحتوى والرسائل، بدون أي إضافة أو تعديل أو حذف.',1,1,4,NOW(),NOW());

INSERT IGNORE INTO role_permission (role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.role_key='admin';
INSERT IGNORE INTO role_permission (role_id,permission_id) SELECT r.id,p.id FROM roles r JOIN permissions p ON p.perm_key IN ('dashboard.view','reports.view','reports.export','homepage.view','homepage.edit','projects.view','projects.create','projects.edit','projects.delete','projects.publish','news.view','news.create','news.edit','news.delete','news.publish','gallery.view','gallery.create','gallery.edit','gallery.delete','gallery.publish','stories.view','stories.create','stories.edit','stories.delete','stories.publish','activities.view','activities.create','activities.edit','activities.delete','partners.view','partners.create','partners.edit','partners.delete','faq.view','faq.create','faq.edit','faq.delete','appeal.view','appeal.create','appeal.edit','appeal.delete','impact.view','impact.edit','pages.view','pages.create','pages.edit','pages.delete','pages.publish','menu.view','menu.create','menu.edit','menu.delete','messages.view','messages.edit','messages.delete') WHERE r.role_key='manager';
INSERT IGNORE INTO role_permission (role_id,permission_id) SELECT r.id,p.id FROM roles r JOIN permissions p ON p.perm_key IN ('dashboard.view','homepage.view','projects.view','messages.view','news.view','news.create','news.edit','gallery.view','gallery.create','gallery.edit','stories.view','stories.create','stories.edit','activities.view','activities.create','activities.edit','partners.view','partners.create','partners.edit','faq.view','faq.create','faq.edit','pages.view','pages.create','pages.edit') WHERE r.role_key='editor';
INSERT IGNORE INTO role_permission (role_id,permission_id) SELECT r.id,p.id FROM roles r JOIN permissions p ON p.perm_key IN ('dashboard.view','news.view','news.create','news.edit') WHERE r.role_key='writer';
INSERT IGNORE INTO role_permission (role_id,permission_id) SELECT r.id,p.id FROM roles r JOIN permissions p ON p.perm_key IN ('dashboard.view','reports.view','homepage.view','projects.view','news.view','gallery.view','stories.view','activities.view','partners.view','faq.view','appeal.view','impact.view','pages.view','menu.view','messages.view') WHERE r.role_key='viewer';

-- Roles are no longer a dropdown constant: remove the old «user_role» constants group (its items cascade).
DELETE FROM constant_groups WHERE group_key='user_role';
