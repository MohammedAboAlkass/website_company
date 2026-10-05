-- Hero settings (additive; safe to run more than once).
-- Admin page: /admin/hero  - public hero: resources/views/components/site/hero.blade.php
CREATE TABLE IF NOT EXISTS `hero_settings` (
  `id` tinyint unsigned NOT NULL DEFAULT 1 COMMENT 'Single row (id = 1)',
  `config` json NOT NULL COMMENT 'Global hero settings: enabled, height_mode/height_value/height_unit, autoplay, interval (s), arrows, dots, loop, pause_hover, scroll_hint, transition (fade|slide), speed (ms)',
  `updated_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Global settings of the homepage hero slider (one row)';

CREATE TABLE IF NOT EXISTS `hero_slides` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sort_order` int unsigned NOT NULL DEFAULT 0,
  `is_visible` tinyint(1) NOT NULL DEFAULT 1 COMMENT '0 = hidden on the public site',
  `label` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT 'Admin-only name of the slide',
  `duration_seconds` smallint unsigned NOT NULL DEFAULT 0 COMMENT '0 = use the global interval',
  `bg_type` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'image' COMMENT 'image | video | color | gradient (copy of background.type, for filtering)',
  `content` json NOT NULL COMMENT 'badge, badge2, eyebrow, title, subtitle, btn1{visible,label,url,style,icon,new_tab}, btn2{...}',
  `style` json NOT NULL COMMENT 'v (top|middle|bottom), h (right|center|left), align, title_color, text_color, eyebrow_color, accent_color, title_size %, text_size %',
  `background` json NOT NULL COMMENT 'type, image{url,id}, video{url,poster,id}, color, gradient{type,angle,stops[]}, fit, focus_x, focus_y, zoom, grayscale, motion, overlay{mode,color,opacity,gradient}',
  `created_by` bigint unsigned DEFAULT NULL,
  `updated_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hero_slides_visible_sort_index` (`is_visible`,`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Slides of the homepage hero (ordered by sort_order)';
