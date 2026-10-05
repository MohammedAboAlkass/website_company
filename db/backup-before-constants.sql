-- MySQL dump 10.13  Distrib 8.0.31, for Win64 (x86_64)
--
-- Host: localhost    Database: almel_association
-- ------------------------------------------------------
-- Server version	8.0.31

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activities` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `governorate_id` bigint unsigned DEFAULT NULL,
  `project_id` bigint unsigned DEFAULT NULL COMMENT 'Optional related project',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `badge_text` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Label on the image',
  `badge_tone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'forest | gold | mid',
  `image_media_id` bigint unsigned DEFAULT NULL,
  `image_alt` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_label` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Free-text date shown on the card, e.g. Oct 2024',
  `activity_date` date DEFAULT NULL COMMENT 'Real date for sorting (optional)',
  `place` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Free-text place',
  `stat_label` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Key figure, e.g. 45,200 beneficiaries',
  `stat_icon` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link_label` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activities_governorate_id_index` (`governorate_id`),
  KEY `activities_project_id_index` (`project_id`),
  KEY `activities_image_media_id_index` (`image_media_id`),
  KEY `activities_is_published_sort_order_index` (`is_published`,`sort_order`),
  CONSTRAINT `activities_governorate_id_foreign` FOREIGN KEY (`governorate_id`) REFERENCES `governorates` (`id`) ON DELETE SET NULL,
  CONSTRAINT `activities_image_media_id_foreign` FOREIGN KEY (`image_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL,
  CONSTRAINT `activities_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Documented field activities (homepage section)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activities`
--

LOCK TABLES `activities` WRITE;
/*!40000 ALTER TABLE `activities` DISABLE KEYS */;
INSERT INTO `activities` VALUES (1,NULL,NULL,'توزيع 10,000 طرد شتوي وأغطية عازلة','إيصال حزم الدفء لحماية أكثر من 45 ألف نازح من برد الخيام في جنوب القطاع.','حملة دفء غزة','forest',5,'قافلة إغاثة شتوية','نوفمبر - ديسمبر 2024',NULL,'مخيمات النزوح في رفح','45,200 مستفيد','group','تقرير الفيديو','#gallery',1,1,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(2,NULL,NULL,'تسيير 3 عيادات ميدانية وإجراء 320 تدخلاً','عيادات خيام للجروح والأطفال والتوليد، وصرف أدوية مزمنة، وتحويلات عاجلة داخل وسط القطاع.','البرنامج الصحي في غزة','gold',4,'قافلة طبية ميدانية','أكتوبر 2024',NULL,'دير البلح','8,400 كشف','medical_services','تحميل التوثيق','#contact',1,2,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(3,NULL,NULL,'افتتاح الخيمة التعليمية السادسة لأطفال غزة','احتفاء بعودة 210 طفلاً نازحاً إلى حلقات تعلّم مؤقتة في القراءة والحساب والدعم النفسي.','تعليم النازحين','mid',6,'تخريج دفعة تمكين مهني','سبتمبر 2024',NULL,'خان يونس','210 طالب نازح','school','قصص النجاح','#news',1,3,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL);
/*!40000 ALTER TABLE `activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `text` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Anchor or URL opened by the item',
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `starts_at` timestamp NULL DEFAULT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `announcements_is_published_sort_order_index` (`is_published`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Items of the scrolling announcements bar (bar on/off + label live in settings)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
INSERT INTO `announcements` VALUES (1,'وصول قافلة طحين جديدة إلى مراكز الإيواء في دير البلح','#news',1,NULL,NULL,1,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(2,'فتح باب التسجيل في برامج التمكين والتنمية المجتمعية لعام 2026','#projects',1,NULL,NULL,2,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(3,'حملة الشتاء: توزيع خيام وأغطية في خان يونس ورفح','#activities',1,NULL,NULL,3,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(4,'تشغيل نقطة مياه شرب إضافية في شمال القطاع','#impact-map',1,NULL,NULL,4,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(5,'تقرير الأثر الربعي متاح قريباً في المركز الإعلامي','#news',1,NULL,NULL,5,'2026-09-30 21:09:43','2026-09-30 21:09:43');
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appeals`
--

DROP TABLE IF EXISTS `appeals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appeals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `flag_label` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tag on the image, e.g. urgent relief appeal',
  `chip_label` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Small top chip',
  `kicker` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Sub-heading above the title',
  `title_line1` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_line2` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Highlighted second line',
  `description` text COLLATE utf8mb4_unicode_ci,
  `primary_cta_text` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primary_cta_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Usually a contact link (no donation flow)',
  `secondary_cta_text` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `secondary_cta_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_media_id` bigint unsigned DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Show the card on the homepage (keep one active)',
  `starts_at` timestamp NULL DEFAULT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `appeals_image_media_id_index` (`image_media_id`),
  KEY `appeals_is_active_index` (`is_active`),
  CONSTRAINT `appeals_image_media_id_foreign` FOREIGN KEY (`image_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Urgent relief appeal card on the homepage (content only, no payments)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appeals`
--

LOCK TABLES `appeals` WRITE;
/*!40000 ALTER TABLE `appeals` DISABLE KEYS */;
INSERT INTO `appeals` VALUES (1,'نداء إغاثة عاجل','قوافل يومية من الشمال إلى رفح','حملة السلال والخيام والمياه','خبز اليوم يصل للخيمة..','وماؤك لا ينقطع عن النازحين','قوافل الطحين والخيام وصهاريج المياه تتحرك داخل القطاع كل يوم. مساهمتك تتحوّل إلى وجبة ساخنة، خيمة عازلة، وصهريج شرب لعائلات نزحت من بيوتها.','ساهم في إغاثة غزة الآن','#contact','مبادرات الإغاثة المعتمدة','#projects',13,1,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43');
/*!40000 ALTER TABLE `appeals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `article_categories`
--

DROP TABLE IF EXISTS `article_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `article_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `article_categories_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='News categories: statements, development, field documentation, activities';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `article_categories`
--

LOCK TABLES `article_categories` WRITE;
/*!40000 ALTER TABLE `article_categories` DISABLE KEYS */;
INSERT INTO `article_categories` VALUES (1,'statements','بيانات وتقارير',1,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(2,'development','تنمية مجتمعية',2,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(3,'field','توثيق الميدان',3,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(4,'activities','أنشطة ميدانية',4,'2026-09-30 21:09:43','2026-09-30 21:09:43');
/*!40000 ALTER TABLE `article_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `article_tag`
--

DROP TABLE IF EXISTS `article_tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `article_tag` (
  `article_id` bigint unsigned NOT NULL,
  `tag_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`article_id`,`tag_id`),
  KEY `article_tag_tag_id_index` (`tag_id`),
  CONSTRAINT `article_tag_article_id_foreign` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `article_tag_tag_id_foreign` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pivot: articles <-> tags (many to many)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `article_tag`
--

LOCK TABLES `article_tag` WRITE;
/*!40000 ALTER TABLE `article_tag` DISABLE KEYS */;
/*!40000 ALTER TABLE `article_tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `articles`
--

DROP TABLE IF EXISTS `articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `article_category_id` bigint unsigned NOT NULL,
  `author_id` bigint unsigned DEFAULT NULL COMMENT 'Admin user who wrote/uploaded it',
  `project_id` bigint unsigned DEFAULT NULL COMMENT 'Optional related project',
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body` longtext COLLATE utf8mb4_unicode_ci COMMENT 'Article body (HTML from the rich text editor)',
  `highlights` json DEFAULT NULL COMMENT 'Array of short bullet strings',
  `cover_media_id` bigint unsigned DEFAULT NULL,
  `cover_alt` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `byline` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Shown author, e.g. media team',
  `desk` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Source desk / office',
  `reference_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Press release reference, e.g. PR-2024-88',
  `badge_text` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `read_minutes` tinyint unsigned DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft' COMMENT 'draft | scheduled | published',
  `published_at` timestamp NULL DEFAULT NULL COMMENT 'Publish date; future date + scheduled = auto publish',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `views_count` int unsigned NOT NULL DEFAULT '0',
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` varchar(320) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `articles_slug_unique` (`slug`),
  KEY `articles_article_category_id_index` (`article_category_id`),
  KEY `articles_author_id_index` (`author_id`),
  KEY `articles_project_id_index` (`project_id`),
  KEY `articles_cover_media_id_index` (`cover_media_id`),
  KEY `articles_status_published_at_index` (`status`,`published_at`),
  CONSTRAINT `articles_article_category_id_foreign` FOREIGN KEY (`article_category_id`) REFERENCES `article_categories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `articles_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `articles_cover_media_id_foreign` FOREIGN KEY (`cover_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL,
  CONSTRAINT `articles_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='News articles / press statements (news.html, article.html)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles`
--

LOCK TABLES `articles` WRITE;
/*!40000 ALTER TABLE `articles` DISABLE KEYS */;
/*!40000 ALTER TABLE `articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL COMMENT 'Who did it (NULL = system / deleted user)',
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'created | updated | deleted | published | login | ...',
  `subject_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Affected model class',
  `subject_id` bigint unsigned DEFAULT NULL COMMENT 'Affected row id',
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Human readable line for the dashboard activity feed',
  `properties` json DEFAULT NULL COMMENT 'Old/new values snapshot',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_logs_user_id_index` (`user_id`),
  KEY `audit_logs_subject_type_subject_id_index` (`subject_type`,`subject_id`),
  KEY `audit_logs_created_at_index` (`created_at`),
  CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Activity / audit trail of admin actions (insert-only)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Laravel default: database cache store';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Laravel default: atomic cache locks';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'contact' COMMENT 'contact | volunteer | partnership | media | inquiry | other (no donation type)',
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `consent_given` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Privacy consent checkbox on the form',
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `is_starred` tinyint(1) NOT NULL DEFAULT '0',
  `is_archived` tinyint(1) NOT NULL DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `handled_by` bigint unsigned DEFAULT NULL COMMENT 'Admin user who answered / owns it',
  `handled_at` timestamp NULL DEFAULT NULL,
  `internal_note` text COLLATE utf8mb4_unicode_ci COMMENT 'Private staff note',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contact_messages_handled_by_index` (`handled_by`),
  KEY `contact_messages_type_index` (`type`),
  KEY `contact_messages_is_read_is_archived_index` (`is_read`,`is_archived`),
  KEY `contact_messages_created_at_index` (`created_at`),
  KEY `contact_messages_email_index` (`email`),
  CONSTRAINT `contact_messages_handled_by_foreign` FOREIGN KEY (`handled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Messages and requests from the contact form (includes volunteer requests via type)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Laravel default: failed queue jobs';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faqs`
--

DROP TABLE IF EXISTS `faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faqs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `question` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `faqs_is_published_sort_order_index` (`is_published`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Frequently asked questions';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faqs`
--

LOCK TABLES `faqs` WRITE;
/*!40000 ALTER TABLE `faqs` DISABLE KEYS */;
INSERT INTO `faqs` VALUES (1,'كيف أتأكد أن تبرعي يصل إلى غزة فعلاً؟','نعمل عبر فرق ميدانية وشركاء داخل القطاع، ونوثّق التوزيعات بالصور والتقارير الدورية التي ننشرها في المركز الإعلامي، ويمكنك طلب تقرير عن الحملة التي ساهمت فيها.',1,1,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(2,'هل يمكنني إخراج زكاة مالي عبر الجمعية؟','نعم، يمكنك تحديد أن مساهمتك زكاة عند التبرع لتُصرف في مصارفها الشرعية للأسر المستحقة داخل القطاع.',1,2,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(3,'هل أحصل على إيصال بتبرعي؟','يصلك إيصال بتبرعك عبر البريد الإلكتروني أو الرسائل بعد تأكيد العملية، ويمكنك طلب نسخة منه في أي وقت عبر فريق خدمة المتبرعين.',1,3,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(4,'كيف تضمن الجمعية الشفافية في صرف التبرعات؟','نعتمد على توثيق كل توزيع بالصورة، ونشر تقارير دورية بالإنجاز والإنفاق، ومراجعة الحسابات من جهة تدقيق مستقلة.',1,4,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(5,'هل يمكنني تخصيص تبرعي لمشروع أو محافظة بعينها؟','يمكنك اختيار المشروع (السلال الغذائية، الخيام، المياه، العيادات الميدانية) عند التواصل معنا، وسنبذل جهدنا لتوجيهه إلى المحافظة التي تحددها وفق الاحتياج والظروف الميدانية.',1,5,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(6,'ما وسائل التبرع المتاحة؟','تواصل مع فريق خدمة المتبرعين عبر الهاتف أو البريد الإلكتروني أو واتساب، وسيزوّدك بوسائل التبرع المعتمدة المتاحة في بلدك.',1,6,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(7,'كيف يمكنني التطوع مع الجمعية؟','أرسل لنا بياناتك ومجال خبرتك عبر نموذج التواصل، وسنتواصل معك عند توفر فرص تطوع ميدانية أو عن بُعد (تصميم، ترجمة، تنسيق حملات).',1,7,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(8,'هل يمكنني دعم مشروع بشكل شهري؟','نعم، يمكنك الاشتراك في التبرع الشهري لدعم البرامج الإغاثية والإنشائية والتنموية والصحية، مع تقارير دورية عن أثر تبرعك.',1,8,'2026-09-30 21:09:43','2026-09-30 21:09:43');
/*!40000 ALTER TABLE `faqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gallery_albums`
--

DROP TABLE IF EXISTS `gallery_albums`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gallery_albums` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cover_media_id` bigint unsigned DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gallery_albums_slug_unique` (`slug`),
  KEY `gallery_albums_cover_media_id_index` (`cover_media_id`),
  CONSTRAINT `gallery_albums_cover_media_id_foreign` FOREIGN KEY (`cover_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Gallery albums / filter chips (field documentation, relief, education, health)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gallery_albums`
--

LOCK TABLES `gallery_albums` WRITE;
/*!40000 ALTER TABLE `gallery_albums` DISABLE KEYS */;
INSERT INTO `gallery_albums` VALUES (1,'field','توثيق الميدان',NULL,NULL,1,1,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(2,'relief','الإغاثة',NULL,NULL,1,2,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(3,'development','التعليم والتنمية',NULL,NULL,1,3,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(4,'health','الصحة والمياه',NULL,NULL,1,4,'2026-09-30 21:09:43','2026-09-30 21:09:43');
/*!40000 ALTER TABLE `gallery_albums` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gallery_items`
--

DROP TABLE IF EXISTS `gallery_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gallery_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `gallery_album_id` bigint unsigned DEFAULT NULL,
  `media_id` bigint unsigned NOT NULL COMMENT 'Image file (or video poster)',
  `project_id` bigint unsigned DEFAULT NULL COMMENT 'Optional related project',
  `governorate_id` bigint unsigned DEFAULT NULL COMMENT 'Optional place',
  `type` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'image' COMMENT 'image | video',
  `video_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Only for type=video',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `caption` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alt_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `taken_at` date DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `gallery_items_gallery_album_id_index` (`gallery_album_id`),
  KEY `gallery_items_media_id_index` (`media_id`),
  KEY `gallery_items_project_id_index` (`project_id`),
  KEY `gallery_items_governorate_id_index` (`governorate_id`),
  KEY `gallery_items_is_published_sort_order_index` (`is_published`,`sort_order`),
  CONSTRAINT `gallery_items_gallery_album_id_foreign` FOREIGN KEY (`gallery_album_id`) REFERENCES `gallery_albums` (`id`) ON DELETE SET NULL,
  CONSTRAINT `gallery_items_governorate_id_foreign` FOREIGN KEY (`governorate_id`) REFERENCES `governorates` (`id`) ON DELETE SET NULL,
  CONSTRAINT `gallery_items_media_id_foreign` FOREIGN KEY (`media_id`) REFERENCES `media_files` (`id`) ON DELETE CASCADE,
  CONSTRAINT `gallery_items_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Photos / videos in the public gallery';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gallery_items`
--

LOCK TABLES `gallery_items` WRITE;
/*!40000 ALTER TABLE `gallery_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `gallery_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `governorates`
--

DROP TABLE IF EXISTS `governorates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `governorates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'north-gaza | gaza | deir-al-balah | khan-younis | rafah',
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Arabic display name',
  `note` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Short text shown on the impact map panel',
  `beneficiaries` int unsigned NOT NULL DEFAULT '0' COMMENT 'Impact map: people reached',
  `meals` int unsigned NOT NULL DEFAULT '0' COMMENT 'Impact map: meals delivered',
  `tents` int unsigned NOT NULL DEFAULT '0' COMMENT 'Impact map: tents distributed',
  `water_points` int unsigned NOT NULL DEFAULT '0' COMMENT 'Impact map: water points running',
  `distribution_points` int unsigned NOT NULL DEFAULT '0' COMMENT 'Field distribution points (dashboard overview)',
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `governorates_slug_unique` (`slug`),
  KEY `governorates_is_published_sort_order_index` (`is_published`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='The 5 Gaza governorates with their impact-map numbers (fixed list, edited not added)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `governorates`
--

LOCK TABLES `governorates` WRITE;
/*!40000 ALTER TABLE `governorates` DISABLE KEYS */;
INSERT INTO `governorates` VALUES (1,'north-gaza','شمال غزة','سلال غذائية وصهاريج مياه لمراكز الإيواء في جباليا وبيت لاهيا وبيت حانون.',38000,52000,900,14,11,1,1,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(2,'gaza','غزة','مطابخ ميدانية وتعليم مؤقت للأطفال في مدارس الإيواء بمدينة غزة.',42000,61000,1100,18,14,1,2,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(3,'deir-al-balah','دير البلح','استقبال العائلات النازحة وتوزيع الخيام والأغطية في مخيمات المحافظة الوسطى.',30000,44000,1400,12,9,1,3,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(4,'khan-younis','خان يونس','نقاط طبية متنقلة وتوزيع مياه الشرب في مناطق النزوح بخان يونس.',40000,57000,1700,16,12,1,4,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(5,'rafah','رفح','دعم الأسر النازحة بالخيام والسلال الغذائية في المناطق الجنوبية.',30000,39000,1300,10,8,1,5,'2026-09-30 21:09:43','2026-09-30 21:09:43');
/*!40000 ALTER TABLE `governorates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Laravel default: job batches';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Laravel default: queued jobs (e.g. sending emails)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_files`
--

DROP TABLE IF EXISTS `media_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_files` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `disk` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'public' COMMENT 'Laravel filesystem disk',
  `path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Path relative to the disk root',
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size_bytes` bigint unsigned NOT NULL DEFAULT '0',
  `width` int unsigned DEFAULT NULL COMMENT 'Pixels (images)',
  `height` int unsigned DEFAULT NULL COMMENT 'Pixels (images)',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alt_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Default alt text for accessibility',
  `uploaded_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `media_files_disk_path_index` (`disk`,`path`(191)),
  KEY `media_files_mime_type_index` (`mime_type`),
  KEY `media_files_uploaded_by_index` (`uploaded_by`),
  CONSTRAINT `media_files_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Media library: every uploaded image/file is one row, other tables point here via *_media_id';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_files`
--

LOCK TABLES `media_files` WRITE;
/*!40000 ALTER TABLE `media_files` DISABLE KEYS */;
INSERT INTO `media_files` VALUES (1,'public','img/gallery-children.jpg','gallery-children.jpg','image/jpeg',0,NULL,NULL,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(2,'public','img/project-relief.jpg','project-relief.jpg','image/jpeg',0,NULL,NULL,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(3,'public','img/project-orphan.jpg','project-orphan.jpg','image/jpeg',0,NULL,NULL,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(4,'public','img/activity-medical.jpg','activity-medical.jpg','image/jpeg',0,NULL,NULL,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(5,'public','img/activity-winter.jpg','activity-winter.jpg','image/jpeg',0,NULL,NULL,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(6,'public','img/activity-graduate.jpg','activity-graduate.jpg','image/jpeg',0,NULL,NULL,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(7,'public','img/partners/unicef.svg','unicef.svg','image/svg+xml',0,NULL,NULL,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(8,'public','img/partners/unitednations.svg','unitednations.svg','image/svg+xml',0,NULL,NULL,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(9,'public','img/partners/wfp.png','wfp.png','image/png',0,NULL,NULL,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(10,'public','img/partners/who.svg','who.svg','image/svg+xml',0,NULL,NULL,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(11,'public','img/partners/crescent.svg','crescent.svg','image/svg+xml',0,NULL,NULL,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(12,'public','img/partners/icrc.svg','icrc.svg','image/svg+xml',0,NULL,NULL,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(13,'public','img/gallery-convoy.jpg','gallery-convoy.jpg','image/jpeg',0,NULL,NULL,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL);
/*!40000 ALTER TABLE `media_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `menu_id` bigint unsigned NOT NULL,
  `parent_id` bigint unsigned DEFAULT NULL COMMENT 'Parent item for nested (2-level) menus',
  `page_id` bigint unsigned DEFAULT NULL COMMENT 'Set when type = page',
  `label` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Used when type is anchor/custom (or as fallback)',
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'custom' COMMENT 'page | anchor | custom',
  `icon` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_button` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Render as highlighted call-to-action button',
  `open_in_new_tab` tinyint(1) NOT NULL DEFAULT '0',
  `is_visible` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `menu_items_menu_id_parent_id_sort_order_index` (`menu_id`,`parent_id`,`sort_order`),
  KEY `menu_items_parent_id_index` (`parent_id`),
  KEY `menu_items_page_id_index` (`page_id`),
  CONSTRAINT `menu_items_menu_id_foreign` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE,
  CONSTRAINT `menu_items_page_id_foreign` FOREIGN KEY (`page_id`) REFERENCES `pages` (`id`) ON DELETE SET NULL,
  CONSTRAINT `menu_items_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Menu links; self-referencing parent_id gives nested dropdowns';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_items`
--

LOCK TABLES `menu_items` WRITE;
/*!40000 ALTER TABLE `menu_items` DISABLE KEYS */;
INSERT INTO `menu_items` VALUES (1,1,NULL,1,'الرئيسية','index.html','page','home',0,0,1,1,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(2,1,NULL,2,'من نحن','about.html','page','account_balance',0,0,1,2,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(3,1,2,NULL,'الرؤية والرسالة','about.html#vision','custom','visibility',0,0,1,1,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(4,1,NULL,3,'المشاريع','projects.html','page','cases',0,0,1,3,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(5,1,4,NULL,'التنمية المجتمعية','project.html?id=development','custom','diversity_3',0,0,1,1,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(6,1,4,NULL,'الإطعام الطارئ ومخابز غزة','project.html?id=relief','custom','bakery_dining',0,0,1,2,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(7,1,NULL,NULL,'الأنشطة','index.html#activities','anchor','verified',0,0,1,4,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(8,1,NULL,5,'الأخبار','news.html','page','newspaper',0,0,1,5,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(9,1,NULL,NULL,'الشركاء','index.html#partners','anchor','handshake',0,0,1,6,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(10,1,NULL,7,'المعرض','gallery.html','page','perm_media',0,0,1,7,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(11,1,NULL,NULL,'بوابة الإدارة','admin/login.html','custom','admin_panel_settings',0,0,1,8,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(12,1,NULL,8,'تواصل معنا','contact.html','page','contact_support',0,0,1,9,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(13,1,NULL,NULL,'ساهم في إغاثة غزة الآن','index.html#appeal','anchor','volunteer_activism',1,0,1,10,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(14,2,NULL,NULL,'روابط سريعة',NULL,'custom',NULL,0,0,1,1,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(15,2,14,NULL,'الرؤية والرسالة','about.html#vision','custom',NULL,0,0,1,1,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(16,2,14,NULL,'التنمية المجتمعية','project.html?id=development','custom',NULL,0,0,1,2,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(17,2,14,NULL,'تقارير إغاثة القطاع','index.html#activities','anchor',NULL,0,0,1,3,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(18,2,14,5,'المركز الإعلامي','news.html','page',NULL,0,0,1,4,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(19,2,14,7,'معرض الصور','gallery.html','page',NULL,0,0,1,5,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(20,2,14,NULL,'الأسئلة الشائعة','index.html#faq','anchor',NULL,0,0,1,6,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(21,2,14,8,'تواصل معنا','contact.html','page',NULL,0,0,1,7,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(22,2,NULL,NULL,'سياسة الخصوصية','#','custom',NULL,0,0,1,2,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(23,2,NULL,NULL,'لوائح الحوكمة','#','custom',NULL,0,0,1,3,'2026-09-30 21:09:44','2026-09-30 21:09:44'),(24,2,NULL,NULL,'بوابة الموظفين','admin/login.html','custom',NULL,0,0,1,4,'2026-09-30 21:09:44','2026-09-30 21:09:44');
/*!40000 ALTER TABLE `menu_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menus` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'header | footer',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `menus_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Navigation menus (header, footer)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menus`
--

LOCK TABLES `menus` WRITE;
/*!40000 ALTER TABLE `menus` DISABLE KEYS */;
INSERT INTO `menus` VALUES (1,'header','القائمة الرئيسية','2026-09-30 21:09:43','2026-09-30 21:09:43'),(2,'footer','قائمة التذييل','2026-09-30 21:09:43','2026-09-30 21:09:43');
/*!40000 ALTER TABLE `menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_subscribers`
--

DROP TABLE IF EXISTS `newsletter_subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_subscribers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'subscribed' COMMENT 'subscribed | unsubscribed',
  `unsubscribe_token` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subscribed_at` timestamp NULL DEFAULT NULL,
  `unsubscribed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `newsletter_subscribers_email_unique` (`email`),
  UNIQUE KEY `newsletter_subscribers_unsubscribe_token_unique` (`unsubscribe_token`),
  KEY `newsletter_subscribers_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Footer newsletter sign-ups (email only)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_subscribers`
--

LOCK TABLES `newsletter_subscribers` WRITE;
/*!40000 ALTER TABLE `newsletter_subscribers` DISABLE KEYS */;
/*!40000 ALTER TABLE `newsletter_subscribers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID (Laravel database notifications)',
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Notification class name',
  `notifiable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Polymorphic owner type (App\\Models\\User)',
  `notifiable_id` bigint unsigned NOT NULL COMMENT 'Polymorphic owner id',
  `data` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'JSON payload: icon, title, text, url, tone',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Admin dashboard bell notifications (Laravel notifications table)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `page_section_blocks`
--

DROP TABLE IF EXISTS `page_section_blocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `page_section_blocks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `page_section_id` bigint unsigned NOT NULL,
  `type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'card' COMMENT 'card | stat | text | link | timeline_item | ...',
  `icon` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `text` text COLLATE utf8mb4_unicode_ci,
  `value` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Big number for stat blocks, e.g. 180K+',
  `media_id` bigint unsigned DEFAULT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data` json DEFAULT NULL COMMENT 'Extra per-block options',
  `is_visible` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `page_section_blocks_page_section_id_sort_order_index` (`page_section_id`,`sort_order`),
  KEY `page_section_blocks_media_id_index` (`media_id`),
  CONSTRAINT `page_section_blocks_media_id_foreign` FOREIGN KEY (`media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL,
  CONSTRAINT `page_section_blocks_page_section_id_foreign` FOREIGN KEY (`page_section_id`) REFERENCES `page_sections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Small repeatable items inside a section (hero stats, pillar cards, about timeline, ...)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page_section_blocks`
--

LOCK TABLES `page_section_blocks` WRITE;
/*!40000 ALTER TABLE `page_section_blocks` DISABLE KEYS */;
INSERT INTO `page_section_blocks` VALUES (1,1,'stat','volunteer_activism','مستفيد في غزة',NULL,'180K+',NULL,NULL,NULL,1,1,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(2,1,'stat','verified','محافظات القطاع',NULL,'5',NULL,NULL,NULL,1,2,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(3,1,'stat','4k','مقطع موثّق من غزة',NULL,'+2,500',NULL,NULL,NULL,1,3,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(4,1,'stat','shield','نسبة الشفافية والتدقيق',NULL,'98.4%',NULL,NULL,NULL,1,4,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(5,6,'card','crisis_alert','الإغاثة العاجلة والحرجة','فرق ميدانية داخل غزة لإيصال الطحين والوجبات والخيام إلى مراكز الإيواء في أوقات القصف والنزوح.',NULL,NULL,NULL,NULL,1,1,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(6,6,'card','school','تعليم أطفال غزة','خيم تعليمية وحقائب مدرسية ودعم نفسي للأيتام النازحين بعد تعطّل المدارس في القطاع.',NULL,NULL,NULL,NULL,1,2,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(7,6,'card','night_shelter','إيواء الأسر النازحة','توفير الخيام والأغطية ومستلزمات النظافة للعائلات التي نزحت من الشمال إلى وسط وجنوب القطاع.',NULL,NULL,NULL,NULL,1,3,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(8,6,'card','health_and_safety','الصحة والمياه في غزة','عيادات ميدانية، أدوية مزمنة، وصهاريج مياه صالحة للشرب لمخيمات النزوح وشبكات الإيواء.',NULL,NULL,NULL,NULL,1,4,'2026-09-30 21:09:43','2026-09-30 21:09:43');
/*!40000 ALTER TABLE `page_section_blocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `page_sections`
--

DROP TABLE IF EXISTS `page_sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `page_sections` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `page_id` bigint unsigned NOT NULL,
  `section_key` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Anchor id on the page: hero, about, projects, stories, ...',
  `type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'content' COMMENT 'hero | content | cards | list | dynamic (filled from another table)',
  `label` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Admin-only name of the section',
  `eyebrow` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Small heading above the title',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Main heading',
  `subtitle` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body` text COLLATE utf8mb4_unicode_ci,
  `media_id` bigint unsigned DEFAULT NULL COMMENT 'Background / section image',
  `settings` json DEFAULT NULL COMMENT 'Extra layout options (tone, limits, ...)',
  `is_visible` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Show/hide switch in the admin',
  `sort_order` int unsigned NOT NULL DEFAULT '0' COMMENT 'Drag-and-drop order',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `page_sections_page_id_section_key_unique` (`page_id`,`section_key`),
  KEY `page_sections_media_id_index` (`media_id`),
  KEY `page_sections_page_id_sort_order_index` (`page_id`,`sort_order`),
  CONSTRAINT `page_sections_media_id_foreign` FOREIGN KEY (`media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL,
  CONSTRAINT `page_sections_page_id_foreign` FOREIGN KEY (`page_id`) REFERENCES `pages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ordered sections of a page; the homepage sections manager edits these rows';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page_sections`
--

LOCK TABLES `page_sections` WRITE;
/*!40000 ALTER TABLE `page_sections` DISABLE KEYS */;
INSERT INTO `page_sections` VALUES (1,1,'hero','hero','الواجهة الرئيسية','المنصة الوثائقية لإغاثة قطاع غزة','معاً نروي صمود غزة.. ونوثق الأثر الإنساني لحظة بلحظة',NULL,NULL,NULL,'{\"icon\": \"wallpaper\", \"tone\": \"dark\", \"urgent\": false}',1,1,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(2,1,'announcements','dynamic','شريط الإعلانات',NULL,'آخر الإعلانات',NULL,NULL,NULL,'{\"icon\": \"campaign\", \"tone\": \"amber\", \"urgent\": false}',1,2,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(3,1,'about','content','من نحن','التعريف والمسيرة في غزة','سنوات من العمل لإغاثة أهل غزة وصون كرامتهم',NULL,NULL,NULL,'{\"icon\": \"account_balance\", \"tone\": \"light\", \"urgent\": false}',1,3,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(4,1,'projects','dynamic','المشاريع والمبادرات','مشاريع وبرامج غزة','مبادرات الإغاثة المعتمدة داخل القطاع',NULL,NULL,NULL,'{\"icon\": \"cases\", \"tone\": \"sand\", \"urgent\": false}',1,4,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(5,1,'stories','dynamic','قصص من الميدان','قصص من الميدان','أصوات من خيام النزوح.. حكايات تصنعها مساهمتك',NULL,NULL,NULL,'{\"icon\": \"auto_stories\", \"tone\": \"light\", \"urgent\": false}',1,5,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(6,1,'pillars','cards','ركائز الإغاثة',NULL,'ركائز الإغاثة داخل قطاع غزة',NULL,NULL,NULL,'{\"icon\": \"foundation\", \"tone\": \"dark\", \"urgent\": false}',1,6,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(7,1,'activities','dynamic','الأنشطة الميدانية','غزة تتكلم من الميدان','أنشطة ميدانية موثّقة داخل القطاع',NULL,NULL,NULL,'{\"icon\": \"verified\", \"tone\": \"light\", \"urgent\": false}',1,7,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(8,1,'appeal','dynamic','نداء الإغاثة العاجل','حملة السلال والخيام والمياه','خبز اليوم يصل للخيمة.. وماؤك لا ينقطع عن النازحين',NULL,NULL,NULL,'{\"icon\": \"e911_emergency\", \"tone\": \"urgent\", \"urgent\": true}',1,8,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(9,1,'impact-map','dynamic','خريطة الأثر','خريطة الأثر','أثر الإغاثة في محافظات القطاع الخمس',NULL,NULL,NULL,'{\"icon\": \"map\", \"tone\": \"dark\", \"urgent\": false}',1,9,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(10,1,'news','dynamic','آخر الأخبار','بيانات إغاثة غزة','آخر الأخبار وتقارير الشفافية من القطاع',NULL,NULL,NULL,'{\"icon\": \"newspaper\", \"tone\": \"sand\", \"urgent\": false}',1,10,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(11,1,'partners','dynamic','الشركاء','شركاء إغاثة غزة','تحالفات الخير لأهل القطاع',NULL,NULL,NULL,'{\"icon\": \"handshake\", \"tone\": \"dark\", \"urgent\": false}',1,11,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(12,1,'gallery','dynamic','معرض الصور','مرئيات من قطاع غزة','معرض التوثيق الميداني في غزة',NULL,NULL,NULL,'{\"icon\": \"perm_media\", \"tone\": \"light\", \"urgent\": false}',1,12,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(13,1,'contact','content','تواصل معنا','التواصل لدعم إغاثة غزة','نحن في خدمتك لكل استفسار عن القطاع',NULL,NULL,NULL,'{\"icon\": \"contact_support\", \"tone\": \"sand\", \"urgent\": false}',1,13,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(14,1,'faq','dynamic','الأسئلة الشائعة','الأسئلة الشائعة','إجابات واضحة قبل أن تتبرع',NULL,NULL,NULL,'{\"icon\": \"quiz\", \"tone\": \"light\", \"urgent\": false}',1,14,'2026-09-30 21:09:43','2026-09-30 21:09:43');
/*!40000 ALTER TABLE `page_sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pages`
--

DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `author_id` bigint unsigned DEFAULT NULL,
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'home for the homepage; otherwise about, projects, news, ...',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kind` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'static' COMMENT 'home | static | list | template',
  `template` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Blade view / layout name',
  `icon` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` varchar(320) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_media_id` bigint unsigned DEFAULT NULL COMMENT 'Social share image',
  `body` longtext COLLATE utf8mb4_unicode_ci COMMENT 'Free rich content for simple pages (e.g. privacy policy)',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft' COMMENT 'published | draft | hidden',
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pages_slug_unique` (`slug`),
  KEY `pages_author_id_index` (`author_id`),
  KEY `pages_og_media_id_index` (`og_media_id`),
  KEY `pages_status_sort_order_index` (`status`,`sort_order`),
  CONSTRAINT `pages_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `pages_og_media_id_foreign` FOREIGN KEY (`og_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CMS pages with SEO fields (home, about, projects, news, gallery, contact, privacy, ...)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pages`
--

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
INSERT INTO `pages` VALUES (1,NULL,'home','الرئيسية','home','index','home','جمعية الشمال للتنمية والتطوير المجتمعي','مؤسسة إنسانية تعمل على إغاثة أهل غزة: برامج إغاثية وإنشائية وتنموية وصحية وفق معايير الحوكمة والشفافية.',NULL,NULL,'published',1,'2026-09-30 21:09:43','2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(2,NULL,'about','من نحن','static','about','account_balance','من نحن — جمعية الشمال للتنمية والتطوير المجتمعي','تعرّف على جمعية الشمال للتنمية والتطوير المجتمعي: قصتنا ومسيرتنا، رؤيتنا ورسالتنا وقيمنا، وكيف نعمل داخل القطاع.',NULL,NULL,'published',2,'2026-09-30 21:09:43','2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(3,NULL,'projects','المشاريع والبرامج','list','projects','cases','المشاريع والبرامج — جمعية الشمال للتنمية والتطوير المجتمعي','مبادرات الإغاثة المعتمدة داخل قطاع غزة: المخابز، المياه، الإيواء، والتنمية المجتمعية — مع نسب التمويل.',NULL,NULL,'published',3,'2026-09-30 21:09:43','2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(4,NULL,'project','تفاصيل المشروع','template','project','volunteer_activism','تفاصيل المشروع — جمعية الشمال للتنمية والتطوير المجتمعي','تفاصيل مبادرة إغاثة داخل قطاع غزة: نسبة التمويل، ما تغطيه مساهمتك، الصور والتحديثات.',NULL,NULL,'published',4,'2026-09-30 21:09:43','2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(5,NULL,'news','الأخبار','list','news','newspaper','الأخبار — جمعية الشمال للتنمية والتطوير المجتمعي','آخر الأخبار وتقارير الشفافية من قطاع غزة: بيانات، تنمية مجتمعية، توثيق الميدان، وأنشطة ميدانية.',NULL,NULL,'published',5,'2026-09-30 21:09:43','2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(6,NULL,'article','صفحة الخبر','template','article','article','صفحة الخبر — جمعية الشمال للتنمية والتطوير المجتمعي','تفاصيل الخبر من المركز الإعلامي لجمعية الشمال للتنمية والتطوير المجتمعي.',NULL,NULL,'published',6,'2026-09-30 21:09:43','2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(7,NULL,'gallery','معرض الصور','static','gallery','perm_media','معرض الصور — جمعية الشمال للتنمية والتطوير المجتمعي','معرض التوثيق الميداني في غزة: صور وفيديو لوصول السلال والخيام والدواء إلى مستحقيها في مخيمات النزوح.',NULL,NULL,'published',7,'2026-09-30 21:09:43','2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(8,NULL,'contact','تواصل معنا','static','contact','contact_support','تواصل معنا — جمعية الشمال للتنمية والتطوير المجتمعي','تواصل مع فريق جمعية الشمال للتنمية والتطوير المجتمعي: الخط الساخن، واتساب، البريد الإلكتروني، وغرفة التنسيق في القاهرة.',NULL,NULL,'published',8,'2026-09-30 21:09:43','2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(9,NULL,'privacy','سياسة الخصوصية','static','privacy','shield_lock','سياسة الخصوصية — جمعية الشمال للتنمية والتطوير المجتمعي','كيف نجمع بيانات المتبرعين ونحميها ونستخدمها.',NULL,NULL,'draft',9,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(10,NULL,'governance','لوائح الحوكمة','static','governance','gavel','لوائح الحوكمة والشفافية — جمعية الشمال للتنمية والتطوير المجتمعي','اللوائح الداخلية وسياسات الحوكمة والتدقيق المالي لجمعية الشمال للتنمية والتطوير المجتمعي، وآلية الإفصاح عن التقارير السنوية.',NULL,NULL,'hidden',10,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL);
/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partners`
--

DROP TABLE IF EXISTS `partners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partners` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tag_label` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Partnership type, e.g. international partner',
  `tag_icon` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_media_id` bigint unsigned DEFAULT NULL,
  `website_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `partners_logo_media_id_index` (`logo_media_id`),
  KEY `partners_is_published_sort_order_index` (`is_published`,`sort_order`),
  CONSTRAINT `partners_logo_media_id_foreign` FOREIGN KEY (`logo_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Partner organizations with logo';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partners`
--

LOCK TABLES `partners` WRITE;
/*!40000 ALTER TABLE `partners` DISABLE KEYS */;
INSERT INTO `partners` VALUES (1,'منظمة يونيسف','شريك دولي','child_care','نتعاون مع اليونيسف لتوفير الحماية والتعليم الطارئ لأطفال غزة، ودعم برامج التغذية والمياه النظيفة.',7,NULL,1,1,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(2,'الأمم المتحدة','هيئة أممية','public','بالتنسيق مع الأمم المتحدة نوثّق الاحتياجات الإنسانية وننسّق قوافل الإغاثة الداخلة إلى القطاع.',8,NULL,1,2,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(3,'برنامج الغذاء العالمي','أمن غذائي','nutrition','نشارك برنامج الغذاء العالمي في توزيع السلال الغذائية والوجبات الجاهزة على العائلات النازحة.',9,NULL,1,3,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(4,'منظمة الصحة العالمية','رعاية صحية','medical_services','ندعم مع منظمة الصحة العالمية تشغيل النقاط الطبية الميدانية وتأمين الأدوية الأساسية.',10,NULL,1,4,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(5,'الهلال الأحمر','إغاثة عاجلة','emergency','نتكامل مع فرق الهلال الأحمر في الإخلاء الطبي وتوزيع الإغاثة العاجلة داخل غزة.',11,NULL,1,5,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(6,'اللجنة الدولية للصليب الأحمر','حماية إنسانية','shield','نتعاون مع اللجنة الدولية لتسهيل دخول المساعدات وحماية المدنيين وفق القانون الدولي الإنساني.',12,NULL,1,6,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL);
/*!40000 ALTER TABLE `partners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Laravel default: password reset tokens';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programs`
--

DROP TABLE IF EXISTS `programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'relief | construction | development | health',
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Arabic display name',
  `icon` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Material Symbols icon name',
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `programs_slug_unique` (`slug`),
  KEY `programs_is_published_sort_order_index` (`is_published`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='The 4 program areas (categories of projects): relief, construction, development, health';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programs`
--

LOCK TABLES `programs` WRITE;
/*!40000 ALTER TABLE `programs` DISABLE KEYS */;
INSERT INTO `programs` VALUES (1,'relief','برامج إغاثية','crisis_alert','الإطعام الطارئ وقوافل الطحين والسلال الغذائية لمراكز الإيواء.',1,1,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(2,'construction','برامج إنشائية','construction','الخيام ومستلزمات الإيواء والأغطية العازلة للأسر النازحة.',1,2,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(3,'development','برامج تنموية','diversity_3','التعليم المؤقت والتمكين الاقتصادي والدعم النفسي والاجتماعي.',1,3,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(4,'health','برامج صحية','medical_services','العيادات الميدانية والأدوية المزمنة ومياه الشرب.',1,4,'2026-09-30 21:09:43','2026-09-30 21:09:43');
/*!40000 ALTER TABLE `programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_components`
--

DROP TABLE IF EXISTS `project_components`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_components` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `project_id` bigint unsigned NOT NULL,
  `icon` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Material Symbols icon name',
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_components_project_id_sort_order_index` (`project_id`,`sort_order`),
  CONSTRAINT `project_components_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='What the project covers (icon cards on project page)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_components`
--

LOCK TABLES `project_components` WRITE;
/*!40000 ALTER TABLE `project_components` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_components` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_facts`
--

DROP TABLE IF EXISTS `project_facts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_facts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `project_id` bigint unsigned NOT NULL,
  `label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Fact title, e.g. Scope / Beneficiaries',
  `value` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Fact value, e.g. 4 central bakeries',
  `is_accent` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Highlight this fact visually',
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_facts_project_id_sort_order_index` (`project_id`,`sort_order`),
  CONSTRAINT `project_facts_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Key facts list on a project (label/value pairs)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_facts`
--

LOCK TABLES `project_facts` WRITE;
/*!40000 ALTER TABLE `project_facts` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_facts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_images`
--

DROP TABLE IF EXISTS `project_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `project_id` bigint unsigned NOT NULL,
  `media_id` bigint unsigned NOT NULL,
  `caption` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_images_project_id_media_id_unique` (`project_id`,`media_id`),
  KEY `project_images_media_id_index` (`media_id`),
  CONSTRAINT `project_images_media_id_foreign` FOREIGN KEY (`media_id`) REFERENCES `media_files` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_images_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Project photo gallery (ordered, with caption)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_images`
--

LOCK TABLES `project_images` WRITE;
/*!40000 ALTER TABLE `project_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_updates`
--

DROP TABLE IF EXISTS `project_updates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_updates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `project_id` bigint unsigned NOT NULL,
  `author_id` bigint unsigned DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `published_at` timestamp NULL DEFAULT NULL COMMENT 'Date shown in the updates timeline',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_updates_project_id_published_at_index` (`project_id`,`published_at`),
  KEY `project_updates_author_id_index` (`author_id`),
  CONSTRAINT `project_updates_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `project_updates_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Timeline of progress updates on a project';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_updates`
--

LOCK TABLES `project_updates` WRITE;
/*!40000 ALTER TABLE `project_updates` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_updates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `program_id` bigint unsigned NOT NULL COMMENT 'Program / category',
  `governorate_id` bigint unsigned DEFAULT NULL COMMENT 'Main governorate (extra places go in location_text)',
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `summary` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Short description for cards',
  `description` longtext COLLATE utf8mb4_unicode_ci COMMENT 'Full description (HTML/markdown)',
  `location_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Free-text place, e.g. North Gaza - Jabalia',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft' COMMENT 'draft | active | urgent | paused | completed (draft = not public)',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Show in homepage projects section',
  `cover_media_id` bigint unsigned DEFAULT NULL,
  `cover_alt` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `badge_text` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Small label on the card, e.g. top priority',
  `badge_tone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'urgent | forest | light | mid | gold',
  `badge_icon` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `beneficiaries_count` int unsigned DEFAULT NULL COMMENT 'People benefiting (number only)',
  `show_funding` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Show funding progress bar (this is NOT a donation system)',
  `funding_goal` decimal(12,2) DEFAULT NULL COMMENT 'Budget target in USD (display only)',
  `funding_raised` decimal(12,2) DEFAULT NULL COMMENT 'Amount covered so far in USD, entered manually',
  `progress_percent` tinyint unsigned DEFAULT NULL COMMENT 'Funding/completion % 0-100 shown on the bar',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` varchar(320) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `projects_slug_unique` (`slug`),
  KEY `projects_program_id_index` (`program_id`),
  KEY `projects_governorate_id_index` (`governorate_id`),
  KEY `projects_cover_media_id_index` (`cover_media_id`),
  KEY `projects_status_sort_order_index` (`status`,`sort_order`),
  KEY `projects_is_featured_index` (`is_featured`),
  CONSTRAINT `projects_cover_media_id_foreign` FOREIGN KEY (`cover_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL,
  CONSTRAINT `projects_governorate_id_foreign` FOREIGN KEY (`governorate_id`) REFERENCES `governorates` (`id`) ON DELETE SET NULL,
  CONSTRAINT `projects_program_id_foreign` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Relief / development projects shown on projects.html and project.html';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL COMMENT 'Laravel default: indexed, no FK (guests have NULL)',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Laravel default: database session driver';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Dotted key, e.g. org.email, site.brand_color',
  `value` text COLLATE utf8mb4_unicode_ci COMMENT 'Value stored as text; cast using `type`',
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string' COMMENT 'string | text | int | bool | json | url | color | email',
  `section` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general' COMMENT 'Settings tab: general | org | contact | seo | announcement_bar | ...',
  `label` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Label shown in the admin form (English note)',
  `is_public` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1 = safe to expose to the front-end',
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_unique` (`key`),
  KEY `settings_section_sort_order_index` (`section`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Key/value site settings (org info, contact channels, SEO defaults, announcement bar)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'org.name','جمعية الشمال للتنمية والتطوير المجتمعي','string','org','Association name',1,1,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(2,'org.tagline','لإغاثة أهل غزة ودعم صمودهم','string','org','Tagline',1,2,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(3,'org.license','HRSD-77492','string','org','License number',1,3,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(4,'org.website','https://shamal-society.org','url','org','Public website URL',1,4,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(5,'org.address','مكتب إغاثة غزة — القاهرة (تنسيق دخول المساعدات)','string','org','Coordination office address',1,5,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(6,'contact.email','info@shamal-society.org','email','contact','Public email',1,6,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(7,'contact.hotline','+20 100 774 9292','string','contact','Hotline phone',1,7,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(8,'contact.hotline_note','متاح 24/7','string','contact','Hotline availability note',1,8,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(9,'contact.whatsapp','201007749292','string','contact','WhatsApp number (digits only, for wa.me link)',1,9,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(10,'contact.email_response_note','الرد خلال ساعتين','string','contact','Email response time note',1,10,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(11,'contact.field_points','جباليا • الشاطئ • دير البلح • خان يونس','string','contact','Field points line in footer',1,11,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(12,'site.brand_color','#0C7845','color','general','Brand green',1,12,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(13,'site.locale','ar','string','general','Default language (site is Arabic only)',1,13,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(14,'site.direction','rtl','string','general','Text direction',1,14,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(15,'site.domain','shamal-society.org','string','general','Domain name',1,15,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(16,'seo.default_title','جمعية الشمال للتنمية والتطوير المجتمعي','string','seo','Default browser title',1,16,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(17,'seo.default_description','مؤسسة إنسانية تعمل على إغاثة أهل غزة: برامج إغاثية وإنشائية وتنموية وصحية وفق معايير الحوكمة والشفافية.','text','seo','Default meta description',1,17,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(18,'seo.title_suffix',' — جمعية الشمال للتنمية والتطوير المجتمعي','string','seo','Suffix added to page titles',1,18,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(19,'announcement_bar.visible','1','bool','announcement_bar','Show announcements bar',1,19,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(20,'announcement_bar.label','آخر الإعلانات','string','announcement_bar','Bar label',1,20,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(21,'footer.newsletter_title','النشرة البريدية','string','footer','Newsletter box title',1,21,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(22,'footer.newsletter_text','اشترك لتصلك تقارير الأثر من غزة والحملات الطارئة.','text','footer','Newsletter box text',1,22,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(23,'mail.notify_new_message','1','bool','notifications','Email admins on new contact message',0,23,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(24,'mail.digest_frequency','daily','string','notifications','Digest frequency: off | daily | weekly',0,24,'2026-09-30 21:09:43','2026-09-30 21:09:43');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stories`
--

DROP TABLE IF EXISTS `stories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `person_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Name of the person telling the story',
  `person_role` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Location / role line',
  `tag_label` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Small tag, e.g. food baskets',
  `tag_icon` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quote` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'The testimony text',
  `image_media_id` bigint unsigned DEFAULT NULL,
  `image_alt` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `stories_image_media_id_index` (`image_media_id`),
  KEY `stories_is_published_sort_order_index` (`is_published`,`sort_order`),
  CONSTRAINT `stories_image_media_id_foreign` FOREIGN KEY (`image_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stories from the field (homepage testimonials)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stories`
--

LOCK TABLES `stories` WRITE;
/*!40000 ALTER TABLE `stories` DISABLE KEYS */;
INSERT INTO `stories` VALUES (1,'أم محمد','نازحة من جباليا إلى دير البلح','السلال الغذائية','shopping_basket','وصلتنا السلة في يوم لم يكن في الخيمة ما يكفي لعشاء الأطفال. شعرت أن أحداً ما زال يتذكرنا.',1,'أطفال يبتسمون في أحد مراكز الإيواء',1,1,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(2,'أبو يوسف','متطوع توزيع — خان يونس','فرق التطوع','diversity_3','نبدأ قبل الفجر لتجهيز الطرود، وأجمل ما في يومنا أن نرى كل سلة تُسلَّم باليد وتوثَّق بالصورة.',2,'متطوعون يجهزون طرود المساعدات',1,2,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(3,'سارة، 11 عاماً','مدرسة إيواء — مدينة غزة','التعليم المؤقت','menu_book','صار عندنا صف في المدرسة التي نسكنها. أحب حصة القراءة، وأحلم أن أصبح معلّمة.',3,'كتب وأدوات مدرسية على طاولة',1,3,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(4,'الممرضة ريم','نقطة طبية — رفح','الرعاية الصحية','medical_services','الدواء الذي يصلنا يعني أن مريض السكري لن ينتظر أسبوعاً آخر. كل شحنة تصنع فرقاً حقيقياً.',4,'كادر طبي في نقطة رعاية صحية',1,4,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL);
/*!40000 ALTER TABLE `stories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tags_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Free tags for articles';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `translations`
--

DROP TABLE IF EXISTS `translations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `translations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `translatable_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Polymorphic model class',
  `translatable_id` bigint unsigned NOT NULL COMMENT 'Polymorphic row id',
  `locale` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'en, tr, ...',
  `field` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Column being translated, e.g. title',
  `value` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `translations_type_id_locale_field_unique` (`translatable_type`,`translatable_id`,`locale`,`field`),
  KEY `translations_locale_index` (`locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Optional polymorphic translations for future languages (empty for now)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `translations`
--

LOCK TABLES `translations` WRITE;
/*!40000 ALTER TABLE `translations` DISABLE KEYS */;
/*!40000 ALTER TABLE `translations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Display name',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Login email',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Bcrypt/Argon hash (Laravel Hash::make)',
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'editor' COMMENT 'admin | editor (simple roles; cast to a PHP enum in Laravel)',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT 'active | invited | disabled',
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `job_title` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Shown in the admin team list',
  `avatar_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Profile picture path on the public disk',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_status_index` (`role`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Admin dashboard accounts (admin / editor)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'مدير المنصة','admin@shamal-society.org',NULL,'__PLACEHOLDER_REPLACE_WITH_BCRYPT_HASH__','admin','invited',NULL,'مسؤول النظام',NULL,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'almel_association'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-01 13:49:29
