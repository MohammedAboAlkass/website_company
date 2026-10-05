-- Additive migration: backup history (النسخ الاحتياطي). Safe to run more than once.
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
