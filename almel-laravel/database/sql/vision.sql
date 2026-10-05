-- «الرؤية والرسالة والقيم» (admin/vision): permissions + role grants. Idempotent: safe to run more than once.
-- Content itself lives in `settings` (key content.vision_cards, created on the first save in the dashboard);
-- until then the site renders the built-in defaults (App\Support\VisionSupport::defaults()).
-- Run:  mysql -u root --default-character-set=utf8mb4 <database> < database/sql/vision.sql
SET NAMES utf8mb4;

INSERT INTO permissions (perm_key, module, action, name_ar, sort_order, created_at, updated_at)
SELECT 'vision.view', 'vision', 'view', 'عرض الرؤية والرسالة والقيم', (SELECT COALESCE(MAX(p2.sort_order), 0) + 1 FROM permissions p2), NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE perm_key = 'vision.view');

INSERT INTO permissions (perm_key, module, action, name_ar, sort_order, created_at, updated_at)
SELECT 'vision.edit', 'vision', 'edit', 'تعديل الرؤية والرسالة والقيم', (SELECT COALESCE(MAX(p2.sort_order), 0) + 1 FROM permissions p2), NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE perm_key = 'vision.edit');

-- admin (super admin, always has everything), manager and editor: view + edit; viewer: view only; writer: none
INSERT IGNORE INTO role_permission (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.perm_key IN ('vision.view', 'vision.edit')
WHERE r.role_key IN ('admin', 'manager', 'editor');

INSERT IGNORE INTO role_permission (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.perm_key = 'vision.view'
WHERE r.role_key = 'viewer';
