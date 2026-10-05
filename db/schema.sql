-- =============================================================================
-- Shamal Association (Gaza) - website + admin dashboard database
-- Target: MySQL 8 (also runs on MariaDB 10.6+ / 11.x)   Engine: InnoDB
-- Charset: utf8mb4 / utf8mb4_unicode_ci      Laravel 12 conventions
--
-- Notes
--  * NO donation / payment tables: the website does not take donations.
--  * Site is Arabic-only for now. Optional `translations` table at the end
--    lets you add other languages later without changing the main tables.
--  * Foreign keys use Laravel default names: <table>_<column>_foreign
--  * Pivot tables: singular_singular alphabetical (article_tag).
--  * Soft deletes (deleted_at) only on tables where "undo delete" makes sense.
--  * To reset: DROP DATABASE almel_association; then run this file again.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `almel_association`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `almel_association`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================================
-- 1. USERS & LARAVEL SYSTEM TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`              VARCHAR(255) NOT NULL COMMENT 'Display name',
  `email`             VARCHAR(255) NOT NULL COMMENT 'Login email',
  `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `password`          VARCHAR(255) NOT NULL COMMENT 'Bcrypt/Argon hash (Laravel Hash::make)',
  `role`              VARCHAR(20) NOT NULL DEFAULT 'editor' COMMENT 'admin | editor (simple roles; cast to a PHP enum in Laravel)',
  `status`            VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT 'active | invited | disabled',
  `phone`             VARCHAR(30) NULL DEFAULT NULL,
  `job_title`         VARCHAR(120) NULL DEFAULT NULL COMMENT 'Shown in the admin team list',
  `avatar_path`       VARCHAR(500) NULL DEFAULT NULL COMMENT 'Profile picture path on the public disk',
  `last_login_at`     TIMESTAMP NULL DEFAULT NULL,
  `remember_token`    VARCHAR(100) NULL DEFAULT NULL,
  `created_at`        TIMESTAMP NULL DEFAULT NULL,
  `updated_at`        TIMESTAMP NULL DEFAULT NULL,
  `deleted_at`        TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_status_index` (`role`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Admin dashboard accounts (admin / editor)';

CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email`      VARCHAR(255) NOT NULL,
  `token`      VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Laravel default: password reset tokens';

CREATE TABLE IF NOT EXISTS `sessions` (
  `id`            VARCHAR(255) NOT NULL,
  `user_id`       BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Laravel default: indexed, no FK (guests have NULL)',
  `ip_address`    VARCHAR(45) NULL DEFAULT NULL,
  `user_agent`    TEXT NULL,
  `payload`       LONGTEXT NOT NULL,
  `last_activity` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Laravel default: database session driver';

CREATE TABLE IF NOT EXISTS `cache` (
  `key`        VARCHAR(255) NOT NULL,
  `value`      MEDIUMTEXT NOT NULL,
  `expiration` INT NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Laravel default: database cache store';

CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key`        VARCHAR(255) NOT NULL,
  `owner`      VARCHAR(255) NOT NULL,
  `expiration` INT NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Laravel default: atomic cache locks';

CREATE TABLE IF NOT EXISTS `jobs` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue`        VARCHAR(255) NOT NULL,
  `payload`      LONGTEXT NOT NULL,
  `attempts`     TINYINT UNSIGNED NOT NULL,
  `reserved_at`  INT UNSIGNED NULL DEFAULT NULL,
  `available_at` INT UNSIGNED NOT NULL,
  `created_at`   INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Laravel default: queued jobs (e.g. sending emails)';

CREATE TABLE IF NOT EXISTS `job_batches` (
  `id`             VARCHAR(255) NOT NULL,
  `name`           VARCHAR(255) NOT NULL,
  `total_jobs`     INT NOT NULL,
  `pending_jobs`   INT NOT NULL,
  `failed_jobs`    INT NOT NULL,
  `failed_job_ids` LONGTEXT NOT NULL,
  `options`        MEDIUMTEXT NULL,
  `cancelled_at`   INT NULL DEFAULT NULL,
  `created_at`     INT NOT NULL,
  `finished_at`    INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Laravel default: job batches';

CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid`       VARCHAR(255) NOT NULL,
  `connection` TEXT NOT NULL,
  `queue`      TEXT NOT NULL,
  `payload`    LONGTEXT NOT NULL,
  `exception`  LONGTEXT NOT NULL,
  `failed_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Laravel default: failed queue jobs';

CREATE TABLE IF NOT EXISTS `notifications` (
  `id`              CHAR(36) NOT NULL COMMENT 'UUID (Laravel database notifications)',
  `type`            VARCHAR(255) NOT NULL COMMENT 'Notification class name',
  `notifiable_type` VARCHAR(255) NOT NULL COMMENT 'Polymorphic owner type (App\\Models\\User)',
  `notifiable_id`   BIGINT UNSIGNED NOT NULL COMMENT 'Polymorphic owner id',
  `data`            TEXT NOT NULL COMMENT 'JSON payload: icon, title, text, url, tone',
  `read_at`         TIMESTAMP NULL DEFAULT NULL,
  `created_at`      TIMESTAMP NULL DEFAULT NULL,
  `updated_at`      TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`, `notifiable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Admin dashboard bell notifications (Laravel notifications table)';

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`      BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Who did it (NULL = system / deleted user)',
  `action`       VARCHAR(50) NOT NULL COMMENT 'created | updated | deleted | published | login | ...',
  `subject_type` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Affected model class',
  `subject_id`   BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Affected row id',
  `subject_label` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Readable name of the affected record (survives deletion)',
  `description`  VARCHAR(500) NULL DEFAULT NULL COMMENT 'Human readable line for the dashboard activity feed',
  `properties`   JSON NULL COMMENT 'Old/new values snapshot',
  `ip_address`   VARCHAR(45) NULL DEFAULT NULL,
  `user_agent`   VARCHAR(255) NULL DEFAULT NULL,
  `created_at`   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_logs_user_id_index` (`user_id`),
  KEY `audit_logs_subject_type_subject_id_index` (`subject_type`, `subject_id`),
  KEY `audit_logs_created_at_index` (`created_at`),
  KEY `audit_logs_action_index` (`action`),
  CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Activity / audit trail of admin actions (insert-only)';

-- =============================================================================
-- 2. SITE SETTINGS & MEDIA LIBRARY
-- =============================================================================

CREATE TABLE IF NOT EXISTS `settings` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key`        VARCHAR(100) NOT NULL COMMENT 'Dotted key, e.g. org.email, site.brand_color',
  `value`      TEXT NULL COMMENT 'Value stored as text; cast using `type`',
  `type`       VARCHAR(20) NOT NULL DEFAULT 'string' COMMENT 'string | text | int | bool | json | url | color | email',
  `section`    VARCHAR(50) NOT NULL DEFAULT 'general' COMMENT 'Settings tab: general | org | contact | seo | announcement_bar | ...',
  `label`      VARCHAR(150) NULL DEFAULT NULL COMMENT 'Label shown in the admin form (English note)',
  `is_public`  TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = safe to expose to the front-end',
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_unique` (`key`),
  KEY `settings_section_sort_order_index` (`section`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Key/value site settings (org info, contact channels, SEO defaults, announcement bar)';

CREATE TABLE IF NOT EXISTS `media_files` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `disk`          VARCHAR(30) NOT NULL DEFAULT 'public' COMMENT 'Laravel filesystem disk',
  `path`          VARCHAR(500) NOT NULL COMMENT 'Path relative to the disk root',
  `original_name` VARCHAR(255) NULL DEFAULT NULL,
  `mime_type`     VARCHAR(100) NULL DEFAULT NULL,
  `size_bytes`    BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `width`         INT UNSIGNED NULL DEFAULT NULL COMMENT 'Pixels (images)',
  `height`        INT UNSIGNED NULL DEFAULT NULL COMMENT 'Pixels (images)',
  `title`         VARCHAR(255) NULL DEFAULT NULL,
  `alt_text`      VARCHAR(255) NULL DEFAULT NULL COMMENT 'Default alt text for accessibility',
  `caption`       VARCHAR(500) NULL DEFAULT NULL COMMENT 'Optional caption shown under the file in the media library',
  `uploaded_by`   BIGINT UNSIGNED NULL DEFAULT NULL,
  `created_at`    TIMESTAMP NULL DEFAULT NULL,
  `updated_at`    TIMESTAMP NULL DEFAULT NULL,
  `deleted_at`    TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `media_files_disk_path_index` (`disk`, `path`(191)),
  KEY `media_files_mime_type_index` (`mime_type`),
  KEY `media_files_uploaded_by_index` (`uploaded_by`),
  CONSTRAINT `media_files_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Media library: every uploaded image/file is one row, other tables point here via *_media_id';

-- =============================================================================
-- 3. LOOKUPS: PROGRAMS & GOVERNORATES
-- =============================================================================

CREATE TABLE IF NOT EXISTS `programs` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`        VARCHAR(100) NOT NULL COMMENT 'relief | construction | development | health',
  `name`        VARCHAR(150) NOT NULL COMMENT 'Arabic display name',
  `icon`        VARCHAR(60) NULL DEFAULT NULL COMMENT 'Material Symbols icon name',
  `description` TEXT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order`  INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at`  TIMESTAMP NULL DEFAULT NULL,
  `updated_at`  TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `programs_slug_unique` (`slug`),
  KEY `programs_is_published_sort_order_index` (`is_published`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='The 4 program areas (categories of projects): relief, construction, development, health';

CREATE TABLE IF NOT EXISTS `governorates` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`             VARCHAR(100) NOT NULL COMMENT 'north-gaza | gaza | deir-al-balah | khan-younis | rafah',
  `name`             VARCHAR(150) NOT NULL COMMENT 'Arabic display name',
  `note`             VARCHAR(500) NULL DEFAULT NULL COMMENT 'Short text shown on the impact map panel',
  `beneficiaries`    INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Impact map: people reached',
  `meals`            INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Impact map: meals delivered',
  `tents`            INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Impact map: tents distributed',
  `water_points`     INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Impact map: water points running',
  `distribution_points` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Field distribution points (dashboard overview)',
  `is_published`     TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order`       INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at`       TIMESTAMP NULL DEFAULT NULL,
  `updated_at`       TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `governorates_slug_unique` (`slug`),
  KEY `governorates_is_published_sort_order_index` (`is_published`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='The 5 Gaza governorates with their impact-map numbers (fixed list, edited not added)';

-- =============================================================================
-- 4. PROJECTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS `projects` (
  `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `program_id`         BIGINT UNSIGNED NOT NULL COMMENT 'Program / category',
  `governorate_id`     BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Main governorate (extra places go in location_text)',
  `slug`               VARCHAR(150) NOT NULL,
  `title`              VARCHAR(255) NOT NULL,
  `summary`            VARCHAR(500) NULL DEFAULT NULL COMMENT 'Short description for cards',
  `description`        LONGTEXT NULL COMMENT 'Full description (HTML/markdown)',
  `location_text`      VARCHAR(255) NULL DEFAULT NULL COMMENT 'Free-text place, e.g. North Gaza - Jabalia',
  `status`             VARCHAR(20) NOT NULL DEFAULT 'draft' COMMENT 'draft | active | urgent | paused | completed (draft = not public)',
  `is_featured`        TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Show in homepage projects section',
  `cover_media_id`     BIGINT UNSIGNED NULL DEFAULT NULL,
  `cover_alt`          VARCHAR(255) NULL DEFAULT NULL,
  `badge_text`         VARCHAR(60) NULL DEFAULT NULL COMMENT 'Small label on the card, e.g. top priority',
  `badge_tone`         VARCHAR(20) NULL DEFAULT NULL COMMENT 'urgent | forest | light | mid | gold',
  `badge_icon`         VARCHAR(60) NULL DEFAULT NULL,
  `beneficiaries_count` INT UNSIGNED NULL DEFAULT NULL COMMENT 'People benefiting (number only)',
  `show_funding`       TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Show funding progress bar (this is NOT a donation system)',
  `funding_goal`       DECIMAL(12,2) NULL DEFAULT NULL COMMENT 'Budget target in USD (display only)',
  `funding_raised`     DECIMAL(12,2) NULL DEFAULT NULL COMMENT 'Amount covered so far in USD, entered manually',
  `progress_percent`   TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'Funding/completion % 0-100 shown on the bar',
  `start_date`         DATE NULL DEFAULT NULL,
  `end_date`           DATE NULL DEFAULT NULL,
  `seo_title`          VARCHAR(255) NULL DEFAULT NULL,
  `seo_description`    VARCHAR(320) NULL DEFAULT NULL,
  `sort_order`         INT UNSIGNED NOT NULL DEFAULT 0,
  `published_at`       TIMESTAMP NULL DEFAULT NULL,
  `created_at`         TIMESTAMP NULL DEFAULT NULL,
  `updated_at`         TIMESTAMP NULL DEFAULT NULL,
  `deleted_at`         TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `projects_slug_unique` (`slug`),
  KEY `projects_program_id_index` (`program_id`),
  KEY `projects_governorate_id_index` (`governorate_id`),
  KEY `projects_cover_media_id_index` (`cover_media_id`),
  KEY `projects_status_sort_order_index` (`status`, `sort_order`),
  KEY `projects_is_featured_index` (`is_featured`),
  CONSTRAINT `projects_program_id_foreign` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `projects_governorate_id_foreign` FOREIGN KEY (`governorate_id`) REFERENCES `governorates` (`id`) ON DELETE SET NULL,
  CONSTRAINT `projects_cover_media_id_foreign` FOREIGN KEY (`cover_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Relief / development projects shown on projects.html and project.html';

CREATE TABLE IF NOT EXISTS `project_facts` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id` BIGINT UNSIGNED NOT NULL,
  `label`      VARCHAR(100) NOT NULL COMMENT 'Fact title, e.g. Scope / Beneficiaries',
  `value`      VARCHAR(150) NOT NULL COMMENT 'Fact value, e.g. 4 central bakeries',
  `is_accent`  TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Highlight this fact visually',
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_facts_project_id_sort_order_index` (`project_id`, `sort_order`),
  CONSTRAINT `project_facts_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Key facts list on a project (label/value pairs)';

CREATE TABLE IF NOT EXISTS `project_components` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id` BIGINT UNSIGNED NOT NULL,
  `icon`       VARCHAR(60) NULL DEFAULT NULL COMMENT 'Material Symbols icon name',
  `title`      VARCHAR(150) NOT NULL,
  `text`       VARCHAR(500) NULL DEFAULT NULL,
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_components_project_id_sort_order_index` (`project_id`, `sort_order`),
  CONSTRAINT `project_components_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='What the project covers (icon cards on project page)';

CREATE TABLE IF NOT EXISTS `project_images` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id` BIGINT UNSIGNED NOT NULL,
  `media_id`   BIGINT UNSIGNED NOT NULL,
  `caption`    VARCHAR(255) NULL DEFAULT NULL,
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_images_project_id_media_id_unique` (`project_id`, `media_id`),
  KEY `project_images_media_id_index` (`media_id`),
  CONSTRAINT `project_images_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_images_media_id_foreign` FOREIGN KEY (`media_id`) REFERENCES `media_files` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Project photo gallery (ordered, with caption)';

CREATE TABLE IF NOT EXISTS `project_updates` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id`   BIGINT UNSIGNED NOT NULL,
  `author_id`    BIGINT UNSIGNED NULL DEFAULT NULL,
  `title`        VARCHAR(255) NOT NULL,
  `body`         TEXT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `published_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Date shown in the updates timeline',
  `created_at`   TIMESTAMP NULL DEFAULT NULL,
  `updated_at`   TIMESTAMP NULL DEFAULT NULL,
  `deleted_at`   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_updates_project_id_published_at_index` (`project_id`, `published_at`),
  KEY `project_updates_author_id_index` (`author_id`),
  CONSTRAINT `project_updates_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_updates_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Timeline of progress updates on a project';

-- =============================================================================
-- 5. NEWS
-- =============================================================================

CREATE TABLE IF NOT EXISTS `article_categories` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`       VARCHAR(100) NOT NULL,
  `name`       VARCHAR(150) NOT NULL,
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `article_categories_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='News categories: statements, development, field documentation, activities';

CREATE TABLE IF NOT EXISTS `articles` (
  `id`                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `article_category_id` BIGINT UNSIGNED NOT NULL,
  `author_id`           BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Admin user who wrote/uploaded it',
  `project_id`          BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Optional related project',
  `slug`                VARCHAR(191) NOT NULL,
  `title`               VARCHAR(255) NOT NULL,
  `excerpt`             VARCHAR(500) NULL DEFAULT NULL,
  `body`                LONGTEXT NULL COMMENT 'Article body (HTML from the rich text editor)',
  `highlights`          JSON NULL COMMENT 'Array of short bullet strings',
  `cover_media_id`      BIGINT UNSIGNED NULL DEFAULT NULL,
  `cover_alt`           VARCHAR(255) NULL DEFAULT NULL,
  `byline`              VARCHAR(150) NULL DEFAULT NULL COMMENT 'Shown author, e.g. media team',
  `desk`                VARCHAR(150) NULL DEFAULT NULL COMMENT 'Source desk / office',
  `reference_code`      VARCHAR(50) NULL DEFAULT NULL COMMENT 'Press release reference, e.g. PR-2024-88',
  `badge_text`          VARCHAR(60) NULL DEFAULT NULL,
  `read_minutes`        TINYINT UNSIGNED NULL DEFAULT NULL,
  `status`              VARCHAR(20) NOT NULL DEFAULT 'draft' COMMENT 'draft | scheduled | published',
  `published_at`        TIMESTAMP NULL DEFAULT NULL COMMENT 'Publish date; future date + scheduled = auto publish',
  `is_featured`         TINYINT(1) NOT NULL DEFAULT 0,
  `views_count`         INT UNSIGNED NOT NULL DEFAULT 0,
  `seo_title`           VARCHAR(255) NULL DEFAULT NULL,
  `seo_description`     VARCHAR(320) NULL DEFAULT NULL,
  `created_at`          TIMESTAMP NULL DEFAULT NULL,
  `updated_at`          TIMESTAMP NULL DEFAULT NULL,
  `deleted_at`          TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `articles_slug_unique` (`slug`),
  KEY `articles_article_category_id_index` (`article_category_id`),
  KEY `articles_author_id_index` (`author_id`),
  KEY `articles_project_id_index` (`project_id`),
  KEY `articles_cover_media_id_index` (`cover_media_id`),
  KEY `articles_status_published_at_index` (`status`, `published_at`),
  CONSTRAINT `articles_article_category_id_foreign` FOREIGN KEY (`article_category_id`) REFERENCES `article_categories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `articles_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `articles_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `articles_cover_media_id_foreign` FOREIGN KEY (`cover_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='News articles / press statements (news.html, article.html)';

CREATE TABLE IF NOT EXISTS `tags` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`       VARCHAR(100) NOT NULL,
  `name`       VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tags_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Free tags for articles';

CREATE TABLE IF NOT EXISTS `article_tag` (
  `article_id` BIGINT UNSIGNED NOT NULL,
  `tag_id`     BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`article_id`, `tag_id`),
  KEY `article_tag_tag_id_index` (`tag_id`),
  CONSTRAINT `article_tag_article_id_foreign` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `article_tag_tag_id_foreign` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Pivot: articles <-> tags (many to many)';

-- =============================================================================
-- 6. GALLERY
-- =============================================================================

CREATE TABLE IF NOT EXISTS `gallery_albums` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`           VARCHAR(100) NOT NULL,
  `name`           VARCHAR(150) NOT NULL,
  `description`    VARCHAR(500) NULL DEFAULT NULL,
  `cover_media_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `is_published`   TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order`     INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at`     TIMESTAMP NULL DEFAULT NULL,
  `updated_at`     TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gallery_albums_slug_unique` (`slug`),
  KEY `gallery_albums_cover_media_id_index` (`cover_media_id`),
  CONSTRAINT `gallery_albums_cover_media_id_foreign` FOREIGN KEY (`cover_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Gallery albums / filter chips (field documentation, relief, education, health)';

CREATE TABLE IF NOT EXISTS `gallery_items` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `gallery_album_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `media_id`         BIGINT UNSIGNED NOT NULL COMMENT 'Image file (or video poster)',
  `project_id`       BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Optional related project',
  `governorate_id`   BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Optional place',
  `type`             VARCHAR(10) NOT NULL DEFAULT 'image' COMMENT 'image | video',
  `video_url`        VARCHAR(500) NULL DEFAULT NULL COMMENT 'Only for type=video',
  `title`            VARCHAR(255) NULL DEFAULT NULL,
  `caption`          VARCHAR(500) NULL DEFAULT NULL,
  `alt_text`         VARCHAR(255) NULL DEFAULT NULL,
  `taken_at`         DATE NULL DEFAULT NULL,
  `is_published`     TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order`       INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at`       TIMESTAMP NULL DEFAULT NULL,
  `updated_at`       TIMESTAMP NULL DEFAULT NULL,
  `deleted_at`       TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `gallery_items_gallery_album_id_index` (`gallery_album_id`),
  KEY `gallery_items_media_id_index` (`media_id`),
  KEY `gallery_items_project_id_index` (`project_id`),
  KEY `gallery_items_governorate_id_index` (`governorate_id`),
  KEY `gallery_items_is_published_sort_order_index` (`is_published`, `sort_order`),
  CONSTRAINT `gallery_items_gallery_album_id_foreign` FOREIGN KEY (`gallery_album_id`) REFERENCES `gallery_albums` (`id`) ON DELETE SET NULL,
  CONSTRAINT `gallery_items_media_id_foreign` FOREIGN KEY (`media_id`) REFERENCES `media_files` (`id`) ON DELETE CASCADE,
  CONSTRAINT `gallery_items_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `gallery_items_governorate_id_foreign` FOREIGN KEY (`governorate_id`) REFERENCES `governorates` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Photos / videos in the public gallery';

-- =============================================================================
-- 7. HOMEPAGE CONTENT BLOCKS (stories, activities, partners, FAQ, appeal, bar)
-- =============================================================================

CREATE TABLE IF NOT EXISTS `stories` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_name`  VARCHAR(100) NOT NULL COMMENT 'Name of the person telling the story',
  `person_role`  VARCHAR(150) NULL DEFAULT NULL COMMENT 'Location / role line',
  `tag_label`    VARCHAR(60) NULL DEFAULT NULL COMMENT 'Small tag, e.g. food baskets',
  `tag_icon`     VARCHAR(60) NULL DEFAULT NULL,
  `quote`        TEXT NOT NULL COMMENT 'The testimony text',
  `image_media_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `image_alt`    VARCHAR(255) NULL DEFAULT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order`   INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at`   TIMESTAMP NULL DEFAULT NULL,
  `updated_at`   TIMESTAMP NULL DEFAULT NULL,
  `deleted_at`   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `stories_image_media_id_index` (`image_media_id`),
  KEY `stories_is_published_sort_order_index` (`is_published`, `sort_order`),
  CONSTRAINT `stories_image_media_id_foreign` FOREIGN KEY (`image_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Stories from the field (homepage testimonials)';

CREATE TABLE IF NOT EXISTS `activities` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `governorate_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `project_id`     BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Optional related project',
  `title`          VARCHAR(255) NOT NULL,
  `description`    VARCHAR(500) NULL DEFAULT NULL,
  `badge_text`     VARCHAR(60) NULL DEFAULT NULL COMMENT 'Label on the image',
  `badge_tone`     VARCHAR(20) NULL DEFAULT NULL COMMENT 'forest | gold | mid',
  `image_media_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `image_alt`      VARCHAR(255) NULL DEFAULT NULL,
  `date_label`     VARCHAR(60) NULL DEFAULT NULL COMMENT 'Free-text date shown on the card, e.g. Oct 2024',
  `activity_date`  DATE NULL DEFAULT NULL COMMENT 'Real date for sorting (optional)',
  `place`          VARCHAR(100) NULL DEFAULT NULL COMMENT 'Free-text place',
  `stat_label`     VARCHAR(60) NULL DEFAULT NULL COMMENT 'Key figure, e.g. 45,200 beneficiaries',
  `stat_icon`      VARCHAR(60) NULL DEFAULT NULL,
  `link_label`     VARCHAR(60) NULL DEFAULT NULL,
  `link_url`       VARCHAR(500) NULL DEFAULT NULL,
  `is_published`   TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order`     INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at`     TIMESTAMP NULL DEFAULT NULL,
  `updated_at`     TIMESTAMP NULL DEFAULT NULL,
  `deleted_at`     TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activities_governorate_id_index` (`governorate_id`),
  KEY `activities_project_id_index` (`project_id`),
  KEY `activities_image_media_id_index` (`image_media_id`),
  KEY `activities_is_published_sort_order_index` (`is_published`, `sort_order`),
  CONSTRAINT `activities_governorate_id_foreign` FOREIGN KEY (`governorate_id`) REFERENCES `governorates` (`id`) ON DELETE SET NULL,
  CONSTRAINT `activities_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `activities_image_media_id_foreign` FOREIGN KEY (`image_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Documented field activities (homepage section)';

CREATE TABLE IF NOT EXISTS `partners` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(150) NOT NULL,
  `tag_label`     VARCHAR(60) NULL DEFAULT NULL COMMENT 'Partnership type, e.g. international partner',
  `tag_icon`      VARCHAR(60) NULL DEFAULT NULL,
  `description`   VARCHAR(500) NULL DEFAULT NULL,
  `logo_media_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `website_url`   VARCHAR(500) NULL DEFAULT NULL,
  `is_published`  TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order`    INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at`    TIMESTAMP NULL DEFAULT NULL,
  `updated_at`    TIMESTAMP NULL DEFAULT NULL,
  `deleted_at`    TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `partners_logo_media_id_index` (`logo_media_id`),
  KEY `partners_is_published_sort_order_index` (`is_published`, `sort_order`),
  CONSTRAINT `partners_logo_media_id_foreign` FOREIGN KEY (`logo_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Partner organizations with logo';

CREATE TABLE IF NOT EXISTS `faqs` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `question`     VARCHAR(255) NOT NULL,
  `answer`       TEXT NOT NULL COMMENT 'Sanitised HTML (rich text editor) or plain text',
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order`   INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at`   TIMESTAMP NULL DEFAULT NULL,
  `updated_at`   TIMESTAMP NULL DEFAULT NULL,
  `deleted_at`   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `faqs_is_published_sort_order_index` (`is_published`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Frequently asked questions';

CREATE TABLE IF NOT EXISTS `appeals` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `flag_label`     VARCHAR(60) NULL DEFAULT NULL COMMENT 'Tag on the image, e.g. urgent relief appeal',
  `chip_label`     VARCHAR(100) NULL DEFAULT NULL COMMENT 'Small top chip',
  `kicker`         VARCHAR(120) NULL DEFAULT NULL COMMENT 'Sub-heading above the title',
  `title_line1`    VARCHAR(120) NOT NULL,
  `title_line2`    VARCHAR(120) NULL DEFAULT NULL COMMENT 'Highlighted second line',
  `description`    TEXT NULL,
  `primary_cta_text`   VARCHAR(80) NULL DEFAULT NULL,
  `primary_cta_url`    VARCHAR(500) NULL DEFAULT NULL COMMENT 'Usually a contact link (no donation flow)',
  `secondary_cta_text` VARCHAR(80) NULL DEFAULT NULL,
  `secondary_cta_url`  VARCHAR(500) NULL DEFAULT NULL,
  `image_media_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `is_active`      TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Show the card on the homepage (keep one active)',
  `starts_at`      TIMESTAMP NULL DEFAULT NULL,
  `ends_at`        TIMESTAMP NULL DEFAULT NULL,
  `created_at`     TIMESTAMP NULL DEFAULT NULL,
  `updated_at`     TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `appeals_image_media_id_index` (`image_media_id`),
  KEY `appeals_is_active_index` (`is_active`),
  CONSTRAINT `appeals_image_media_id_foreign` FOREIGN KEY (`image_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Urgent relief appeal card on the homepage (content only, no payments)';

CREATE TABLE IF NOT EXISTS `announcements` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `text`         VARCHAR(255) NOT NULL,
  `link_url`     VARCHAR(500) NULL DEFAULT NULL COMMENT 'Anchor or URL opened by the item',
  `details`      TEXT NULL COMMENT 'Optional rich text (sanitised HTML) with the announcement details',
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `starts_at`    TIMESTAMP NULL DEFAULT NULL,
  `ends_at`      TIMESTAMP NULL DEFAULT NULL,
  `sort_order`   INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at`   TIMESTAMP NULL DEFAULT NULL,
  `updated_at`   TIMESTAMP NULL DEFAULT NULL,
  `deleted_at`   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `announcements_is_published_sort_order_index` (`is_published`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Items of the scrolling announcements bar (bar on/off + label live in settings)';

-- =============================================================================
-- 8. CMS: PAGES, SECTIONS, BLOCKS, MENUS
-- =============================================================================

CREATE TABLE IF NOT EXISTS `pages` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `author_id`        BIGINT UNSIGNED NULL DEFAULT NULL,
  `slug`             VARCHAR(150) NOT NULL COMMENT 'home for the homepage; otherwise about, projects, news, ...',
  `title`            VARCHAR(255) NOT NULL,
  `kind`             VARCHAR(20) NOT NULL DEFAULT 'static' COMMENT 'home | static | list | template',
  `template`         VARCHAR(100) NULL DEFAULT NULL COMMENT 'Blade view / layout name',
  `icon`             VARCHAR(60) NULL DEFAULT NULL,
  `seo_title`        VARCHAR(255) NULL DEFAULT NULL,
  `meta_description` VARCHAR(320) NULL DEFAULT NULL,
  `og_media_id`      BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Social share image',
  `body`             LONGTEXT NULL COMMENT 'Free rich content for simple pages (e.g. privacy policy)',
  `status`           VARCHAR(20) NOT NULL DEFAULT 'draft' COMMENT 'published | draft | hidden',
  `sort_order`       INT UNSIGNED NOT NULL DEFAULT 0,
  `published_at`     TIMESTAMP NULL DEFAULT NULL,
  `created_at`       TIMESTAMP NULL DEFAULT NULL,
  `updated_at`       TIMESTAMP NULL DEFAULT NULL,
  `deleted_at`       TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pages_slug_unique` (`slug`),
  KEY `pages_author_id_index` (`author_id`),
  KEY `pages_og_media_id_index` (`og_media_id`),
  KEY `pages_status_sort_order_index` (`status`, `sort_order`),
  CONSTRAINT `pages_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `pages_og_media_id_foreign` FOREIGN KEY (`og_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='CMS pages with SEO fields (home, about, projects, news, gallery, contact, privacy, ...)';

CREATE TABLE IF NOT EXISTS `page_sections` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `page_id`     BIGINT UNSIGNED NOT NULL,
  `section_key` VARCHAR(60) NOT NULL COMMENT 'Anchor id on the page: hero, about, projects, stories, ...',
  `type`        VARCHAR(30) NOT NULL DEFAULT 'content' COMMENT 'hero | content | cards | list | dynamic (filled from another table)',
  `label`       VARCHAR(150) NULL DEFAULT NULL COMMENT 'Admin-only name of the section',
  `eyebrow`     VARCHAR(100) NULL DEFAULT NULL COMMENT 'Small heading above the title',
  `title`       VARCHAR(255) NULL DEFAULT NULL COMMENT 'Main heading',
  `subtitle`    VARCHAR(500) NULL DEFAULT NULL,
  `body`        TEXT NULL,
  `media_id`    BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Background / section image',
  `settings`    JSON NULL COMMENT 'Extra layout options (tone, limits, ...)',
  `is_visible`  TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Show/hide switch in the admin',
  `sort_order`  INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Drag-and-drop order',
  `created_at`  TIMESTAMP NULL DEFAULT NULL,
  `updated_at`  TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `page_sections_page_id_section_key_unique` (`page_id`, `section_key`),
  KEY `page_sections_media_id_index` (`media_id`),
  KEY `page_sections_page_id_sort_order_index` (`page_id`, `sort_order`),
  CONSTRAINT `page_sections_page_id_foreign` FOREIGN KEY (`page_id`) REFERENCES `pages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `page_sections_media_id_foreign` FOREIGN KEY (`media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Ordered sections of a page; the homepage sections manager edits these rows';

CREATE TABLE IF NOT EXISTS `page_section_blocks` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `page_section_id` BIGINT UNSIGNED NOT NULL,
  `type`            VARCHAR(30) NOT NULL DEFAULT 'card' COMMENT 'card | stat | text | link | timeline_item | ...',
  `icon`            VARCHAR(60) NULL DEFAULT NULL,
  `title`           VARCHAR(255) NULL DEFAULT NULL,
  `text`            TEXT NULL,
  `value`           VARCHAR(50) NULL DEFAULT NULL COMMENT 'Big number for stat blocks, e.g. 180K+',
  `media_id`        BIGINT UNSIGNED NULL DEFAULT NULL,
  `url`             VARCHAR(500) NULL DEFAULT NULL,
  `data`            JSON NULL COMMENT 'Extra per-block options',
  `is_visible`      TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order`      INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at`      TIMESTAMP NULL DEFAULT NULL,
  `updated_at`      TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `page_section_blocks_page_section_id_sort_order_index` (`page_section_id`, `sort_order`),
  KEY `page_section_blocks_media_id_index` (`media_id`),
  CONSTRAINT `page_section_blocks_page_section_id_foreign` FOREIGN KEY (`page_section_id`) REFERENCES `page_sections` (`id`) ON DELETE CASCADE,
  CONSTRAINT `page_section_blocks_media_id_foreign` FOREIGN KEY (`media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Small repeatable items inside a section (hero stats, pillar cards, about timeline, ...)';

CREATE TABLE IF NOT EXISTS `menus` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`       VARCHAR(50) NOT NULL COMMENT 'header | footer',
  `name`       VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `menus_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Navigation menus (header, footer)';

CREATE TABLE IF NOT EXISTS `menu_items` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `menu_id`       BIGINT UNSIGNED NOT NULL,
  `parent_id`     BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Parent item for nested (2-level) menus',
  `page_id`       BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Set when type = page',
  `label`         VARCHAR(150) NOT NULL,
  `url`           VARCHAR(500) NULL DEFAULT NULL COMMENT 'Used when type is anchor/custom (or as fallback)',
  `type`          VARCHAR(20) NOT NULL DEFAULT 'custom' COMMENT 'page | anchor | custom',
  `icon`          VARCHAR(60) NULL DEFAULT NULL,
  `is_button`     TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Render as highlighted call-to-action button',
  `open_in_new_tab` TINYINT(1) NOT NULL DEFAULT 0,
  `is_visible`    TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order`    INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at`    TIMESTAMP NULL DEFAULT NULL,
  `updated_at`    TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `menu_items_menu_id_parent_id_sort_order_index` (`menu_id`, `parent_id`, `sort_order`),
  KEY `menu_items_parent_id_index` (`parent_id`),
  KEY `menu_items_page_id_index` (`page_id`),
  CONSTRAINT `menu_items_menu_id_foreign` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE,
  CONSTRAINT `menu_items_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `menu_items_page_id_foreign` FOREIGN KEY (`page_id`) REFERENCES `pages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Menu links; self-referencing parent_id gives nested dropdowns';

-- =============================================================================
-- 9. INBOX: CONTACT MESSAGES & NEWSLETTER
-- =============================================================================

CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `type`          VARCHAR(30) NOT NULL DEFAULT 'contact' COMMENT 'contact | volunteer | partnership | media | inquiry | other (no donation type)',
  `name`          VARCHAR(150) NOT NULL,
  `email`         VARCHAR(255) NOT NULL,
  `phone`         VARCHAR(30) NULL DEFAULT NULL,
  `subject`       VARCHAR(255) NULL DEFAULT NULL,
  `message`       TEXT NOT NULL,
  `consent_given` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Privacy consent checkbox on the form',
  `is_read`       TINYINT(1) NOT NULL DEFAULT 0,
  `is_starred`    TINYINT(1) NOT NULL DEFAULT 0,
  `is_archived`   TINYINT(1) NOT NULL DEFAULT 0,
  `read_at`       TIMESTAMP NULL DEFAULT NULL,
  `handled_by`    BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Admin user who answered / owns it',
  `handled_at`    TIMESTAMP NULL DEFAULT NULL,
  `internal_note` TEXT NULL COMMENT 'Private staff note',
  `ip_address`    VARCHAR(45) NULL DEFAULT NULL,
  `user_agent`    VARCHAR(255) NULL DEFAULT NULL,
  `created_at`    TIMESTAMP NULL DEFAULT NULL,
  `updated_at`    TIMESTAMP NULL DEFAULT NULL,
  `deleted_at`    TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contact_messages_handled_by_index` (`handled_by`),
  KEY `contact_messages_type_index` (`type`),
  KEY `contact_messages_is_read_is_archived_index` (`is_read`, `is_archived`),
  KEY `contact_messages_created_at_index` (`created_at`),
  KEY `contact_messages_email_index` (`email`),
  CONSTRAINT `contact_messages_handled_by_foreign` FOREIGN KEY (`handled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Messages and requests from the contact form (includes volunteer requests via type)';

CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email`           VARCHAR(255) NOT NULL,
  `status`          VARCHAR(20) NOT NULL DEFAULT 'subscribed' COMMENT 'subscribed | unsubscribed',
  `unsubscribe_token` VARCHAR(64) NULL DEFAULT NULL,
  `subscribed_at`   TIMESTAMP NULL DEFAULT NULL,
  `unsubscribed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at`      TIMESTAMP NULL DEFAULT NULL,
  `updated_at`      TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `newsletter_subscribers_email_unique` (`email`),
  UNIQUE KEY `newsletter_subscribers_unsubscribe_token_unique` (`unsubscribe_token`),
  KEY `newsletter_subscribers_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Footer newsletter sign-ups (email only)';

-- =============================================================================
-- 10. OPTIONAL: TRANSLATIONS (not used while the site is Arabic-only)
-- =============================================================================
-- Arabic stays in the main tables. When English is added, store translated
-- values here instead of duplicating columns, e.g.
--   ('App\\Models\\Project', 12, 'en', 'title', 'Emergency feeding program').

CREATE TABLE IF NOT EXISTS `translations` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `translatable_type` VARCHAR(100) NOT NULL COMMENT 'Polymorphic model class',
  `translatable_id`   BIGINT UNSIGNED NOT NULL COMMENT 'Polymorphic row id',
  `locale`            VARCHAR(10) NOT NULL COMMENT 'en, tr, ...',
  `field`             VARCHAR(60) NOT NULL COMMENT 'Column being translated, e.g. title',
  `value`             LONGTEXT NULL,
  `created_at`        TIMESTAMP NULL DEFAULT NULL,
  `updated_at`        TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `translations_type_id_locale_field_unique` (`translatable_type`, `translatable_id`, `locale`, `field`),
  KEY `translations_locale_index` (`locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Optional polymorphic translations for future languages (empty for now)';

-- =============================================================================
-- 11. SYSTEM CONSTANTS (admin Settings > "System constants" / ثوابت النظام)
-- =============================================================================
-- Every editable dropdown list of the dashboard lives here: one row per list in
-- `constant_groups`, one row per option in `constant_items`.
-- Columns that hold a constant value (projects.status, users.role, ...) keep
-- storing the item_key as plain VARCHAR - no foreign key, so removing or
-- disabling an option never breaks saved records (they keep showing their label).
-- Lists that already have their own table (programs, governorates,
-- article_categories, gallery_albums) are NOT duplicated: the group only holds
-- the dropdown labels/order and points to that table through `ref_table`.
-- No donation-related constants exist.

CREATE TABLE IF NOT EXISTS `constant_groups` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `group_key`   VARCHAR(60) NOT NULL COMMENT 'Stable code name, e.g. project_status, icon, timezone',
  `name_ar`     VARCHAR(150) NOT NULL COMMENT 'Arabic title shown in Settings > System constants',
  `description` VARCHAR(500) NULL DEFAULT NULL COMMENT 'Help text under the group title',
  `ref_table`   VARCHAR(60) NULL DEFAULT NULL COMMENT 'Existing table that owns the same list (programs, governorates, ...); NULL = constants are the only source',
  `used_in`     JSON NULL COMMENT 'Dashboard pages that use the list, e.g. ["المشاريع"]',
  `is_locked`   TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = keys are tied to code behaviour: items cannot be added or deleted, only label / order / active edited',
  `sort_order`  INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at`  TIMESTAMP NULL DEFAULT NULL,
  `updated_at`  TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `constant_groups_group_key_unique` (`group_key`),
  KEY `constant_groups_sort_order_index` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Editable dropdown lists of the admin dashboard (one row per list)';

CREATE TABLE IF NOT EXISTS `constant_items` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `group_id`   BIGINT UNSIGNED NOT NULL,
  `item_key`   VARCHAR(100) NOT NULL COMMENT 'Value stored in other tables (e.g. urgent, Asia/Gaza, #about, 30); unique per group',
  `label_ar`   VARCHAR(255) NOT NULL COMMENT 'Arabic label shown in dropdowns',
  `is_active`  TINYINT(1) NOT NULL DEFAULT 1 COMMENT '0 = hidden from dropdowns, old records still show the label',
  `is_locked`  TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = system item (key used by code, e.g. admin / off / never): cannot be deleted',
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `meta`       JSON NULL COMMENT 'Optional extras: {"note":"..."} help text, {"ref_slug":"..."} slug in the group ref_table',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `constant_items_group_id_item_key_unique` (`group_id`, `item_key`),
  KEY `constant_items_group_id_sort_order_index` (`group_id`, `sort_order`),
  CONSTRAINT `constant_items_group_id_foreign` FOREIGN KEY (`group_id`) REFERENCES `constant_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Options of each constants group (label, order, enabled, locked)';

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

-- =============================================================================
-- 9. BACKUP HISTORY (admin: Backup page, added with the system features batch)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `backup_runs` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `kind`         VARCHAR(20)  NOT NULL DEFAULT 'export' COMMENT 'export | scheduled | pre_restore | import',
  `status`       VARCHAR(20)  NOT NULL DEFAULT 'ok' COMMENT 'ok | failed',
  `filename`     VARCHAR(190) NULL DEFAULT NULL COMMENT 'File under storage/app/backups (NULL for import rows)',
  `size_bytes`   BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `scope`        JSON NULL COMMENT 'Backup groups included: content | settings | messages | access',
  `tables_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `rows_count`   INT UNSIGNED NOT NULL DEFAULT 0,
  `checksum`     CHAR(64) NULL DEFAULT NULL COMMENT 'SHA-256 of the tables payload',
  `user_id`      BIGINT UNSIGNED NULL DEFAULT NULL,
  `note`         VARCHAR(500) NULL DEFAULT NULL,
  `created_at`   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `backup_runs_kind_created_at_index` (`kind`, `created_at`),
  KEY `backup_runs_user_id_index` (`user_id`),
  CONSTRAINT `backup_runs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='History of database backups / restores made from the admin panel (the dumps are files in storage/app/backups)';


-- ============================================================
-- Hero settings (admin: /admin/hero). Added additively; seed with: php artisan hero:seed [--force]
-- ============================================================
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
