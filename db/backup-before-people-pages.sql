-- MySQL dump 10.13  Distrib 8.0.31, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: almel_association
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
INSERT INTO `article_tag` VALUES (1,1),(9,1),(1,2),(2,3),(6,3),(2,4),(3,5),(4,6),(4,7),(5,8),(6,9),(7,10),(8,11);
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='News articles / press statements (news.html, article.html)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles`
--

LOCK TABLES `articles` WRITE;
/*!40000 ALTER TABLE `articles` DISABLE KEYS */;
INSERT INTO `articles` VALUES (1,1,NULL,NULL,'report-88','نشر تقرير الإغاثة الدوري لغزة وتوسيع مخابز الطوارئ في الجنوب','أعلن الفريق الميداني إقفال دورة التوزيع بنسبة توثيق 98.4%، مع تشغيل ثلاثة مخابز إضافية لخدمة النازحين في خان يونس ورفح.','<p>أعلن الفريق الميداني إقفال دورة التوزيع بنسبة توثيق 98.4%، مع تشغيل ثلاثة مخابز إضافية لخدمة النازحين في خان يونس ورفح.</p><h2>أبرز ما جاء في الخبر</h2><ul><li>نسبة توثيق دورة التوزيع: 98.4%</li><li>تشغيل ثلاثة مخابز إضافية لخدمة النازحين في خان يونس ورفح</li></ul>','[\"نسبة توثيق دورة التوزيع: 98.4%\", \"تشغيل ثلاثة مخابز إضافية لخدمة النازحين في خان يونس ورفح\"]',14,'إحاطة إعلامية عن إغاثة غزة','فريق الإعلام','مكتب توثيق القطاع','PR-2024-88','بيان من غزة',4,'published','2026-09-24 07:00:00',1,4820,NULL,'أعلن الفريق الميداني إقفال دورة التوزيع بنسبة توثيق 98.4%، مع تشغيل ثلاثة مخابز إضافية لخدمة النازحين في خان يونس ورفح.','2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(2,2,NULL,NULL,'development-500','إطلاق برنامج التمكين المجتمعي لـ 500 مستفيد من شمال غزة وجباليا','يشمل البرنامج التدريب المهني والتعليم المؤقت ودعم الأسر بمصادر دخل داخل مراكز الإيواء.','<p>يشمل البرنامج التدريب المهني والتعليم المؤقت ودعم الأسر بمصادر دخل داخل مراكز الإيواء.</p><h2>أبرز ما جاء في الخبر</h2><ul><li>500 مستفيد من شمال غزة وجباليا</li><li>يشمل البرنامج التدريب المهني والتعليم المؤقت ودعم الأسر</li><li>آخر موعد: 30 يناير 2025</li></ul>','[\"500 مستفيد من شمال غزة وجباليا\", \"يشمل البرنامج التدريب المهني والتعليم المؤقت ودعم الأسر\", \"آخر موعد: 30 يناير 2025\"]',1,'أطفال يبتسمون في أحد مراكز الإيواء','فريق الإعلام',NULL,NULL,'تنمية مجتمعية',NULL,'published','2026-09-19 07:00:00',0,3910,NULL,'يشمل البرنامج التدريب المهني والتعليم المؤقت ودعم الأسر بمصادر دخل داخل مراكز الإيواء.','2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(3,3,NULL,NULL,'tracking-map','إطلاق خريطة تتبع السلال داخل قطاع غزة','منظومة تتيح للمتبرع متابعة وصول كل سلة غذائية إلى العائلة النازحة وتوثيقها بالصورة من الخيمة.','<p>منظومة تتيح للمتبرع متابعة وصول كل سلة غذائية إلى العائلة النازحة وتوثيقها بالصورة من الخيمة.</p><h2>أبرز ما جاء في الخبر</h2><ul><li>متابعة وصول كل سلة غذائية إلى العائلة النازحة</li><li>توثيق التسليم بالصورة من الخيمة</li></ul>','[\"متابعة وصول كل سلة غذائية إلى العائلة النازحة\", \"توثيق التسليم بالصورة من الخيمة\"]',15,'شاشة حاسوب لمتابعة التوزيع','محرر المحتوى #2','غرفة عمليات غزة',NULL,'توثيق الميدان',NULL,'published','2026-09-12 07:00:00',0,2750,NULL,'منظومة تتيح للمتبرع متابعة وصول كل سلة غذائية إلى العائلة النازحة وتوثيقها بالصورة من الخيمة.','2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(4,4,NULL,NULL,'winter-campaign','توزيع 10,000 طرد شتوي وأغطية عازلة','إيصال حزم الدفء لحماية أكثر من 45 ألف نازح من برد الخيام في جنوب القطاع.','<p>إيصال حزم الدفء لحماية أكثر من 45 ألف نازح من برد الخيام في جنوب القطاع.</p><h2>أبرز ما جاء في الخبر</h2><ul><li>10,000 طرد شتوي وأغطية عازلة</li><li>45,200 مستفيد</li><li>مخيمات النزوح في رفح</li></ul>','[\"10,000 طرد شتوي وأغطية عازلة\", \"45,200 مستفيد\", \"مخيمات النزوح في رفح\"]',5,'قافلة إغاثة شتوية','محرر المحتوى #2',NULL,NULL,'حملة دفء غزة',NULL,'scheduled','2026-10-05 07:00:00',0,0,NULL,'إيصال حزم الدفء لحماية أكثر من 45 ألف نازح من برد الخيام في جنوب القطاع.','2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(5,4,NULL,NULL,'field-clinics','تسيير 3 عيادات ميدانية وإجراء 320 تدخلاً','عيادات خيام للجروح والأطفال والتوليد، وصرف أدوية مزمنة، وتحويلات عاجلة داخل وسط القطاع.','<p>عيادات خيام للجروح والأطفال والتوليد، وصرف أدوية مزمنة، وتحويلات عاجلة داخل وسط القطاع.</p><h2>أبرز ما جاء في الخبر</h2><ul><li>3 عيادات ميدانية</li><li>320 تدخلاً</li><li>8,400 كشف</li><li>دير البلح</li></ul>','[\"3 عيادات ميدانية\", \"320 تدخلاً\", \"8,400 كشف\", \"دير البلح\"]',4,'قافلة طبية ميدانية','فريق الإعلام',NULL,NULL,'البرنامج الصحي في غزة',NULL,'published','2026-09-03 07:00:00',0,1980,NULL,'عيادات خيام للجروح والأطفال والتوليد، وصرف أدوية مزمنة، وتحويلات عاجلة داخل وسط القطاع.','2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(6,2,NULL,NULL,'learning-tent','افتتاح الخيمة التعليمية السادسة لأطفال غزة','احتفاء بعودة 210 طفلاً نازحاً إلى حلقات تعلّم مؤقتة في القراءة والحساب والدعم النفسي.','<p>احتفاء بعودة 210 طفلاً نازحاً إلى حلقات تعلّم مؤقتة في القراءة والحساب والدعم النفسي.</p><h2>أبرز ما جاء في الخبر</h2><ul><li>الخيمة التعليمية السادسة</li><li>210 طالب نازح</li><li>خان يونس</li></ul>','[\"الخيمة التعليمية السادسة\", \"210 طالب نازح\", \"خان يونس\"]',6,'تخريج دفعة تمكين مهني','فريق الإعلام',NULL,NULL,'تعليم النازحين',NULL,'published','2026-08-27 07:00:00',0,2210,NULL,'احتفاء بعودة 210 طفلاً نازحاً إلى حلقات تعلّم مؤقتة في القراءة والحساب والدعم النفسي.','2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(7,3,NULL,NULL,'flour-convoy','وصول قافلة طحين جديدة إلى مراكز الإيواء في دير البلح','نص تجريبي: يُستبدل بملخص الخبر الرسمي عند نشره من المكتب الإعلامي.','<p>نص تجريبي: يُستبدل بملخص الخبر الرسمي عند نشره من المكتب الإعلامي.</p>',NULL,13,'قافلة إغاثة','منسق ميداني #3',NULL,NULL,'توثيق الميدان',NULL,'draft','2026-09-27 07:00:00',0,0,NULL,'نص تجريبي: يُستبدل بملخص الخبر الرسمي عند نشره من المكتب الإعلامي.','2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(8,4,NULL,NULL,'water-point','تشغيل نقطة مياه شرب إضافية في شمال القطاع','نص تجريبي: يُستبدل بملخص الخبر الرسمي عند نشره من المكتب الإعلامي.','<p>نص تجريبي: يُستبدل بملخص الخبر الرسمي عند نشره من المكتب الإعلامي.</p>',NULL,16,'مياه شرب','محرر المحتوى #2',NULL,NULL,'أنشطة ميدانية',NULL,'draft','2026-09-26 07:00:00',0,0,NULL,'نص تجريبي: يُستبدل بملخص الخبر الرسمي عند نشره من المكتب الإعلامي.','2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(9,1,NULL,NULL,'quarterly-report','تقرير الأثر الربعي متاح قريباً في المركز الإعلامي','نص تجريبي: يُستبدل بملخص التقرير عند نشره من المكتب الإعلامي.','<p>نص تجريبي: يُستبدل بملخص التقرير عند نشره من المكتب الإعلامي.</p>',NULL,17,'انتظار الوجبات في مراكز الإيواء','فريق الإعلام',NULL,NULL,'بيانات وتقارير',NULL,'scheduled','2026-10-12 07:00:00',0,0,NULL,'نص تجريبي: يُستبدل بملخص التقرير عند نشره من المكتب الإعلامي.','2026-10-02 14:14:19','2026-10-02 14:14:19',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=184 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Activity / audit trail of admin actions (insert-only)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (33,1,'auth.login','App\\Models\\User',1,'تسجيل دخول إلى لوحة التحكم','{\"type\": \"security\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0','2026-10-02 14:12:08'),(57,1,'auth.login','App\\Models\\User',1,'تسجيل دخول إلى لوحة التحكم','{\"type\": \"security\"}','127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','2026-10-02 14:18:21'),(84,1,'auth.login','App\\Models\\User',1,'تسجيل دخول إلى لوحة التحكم','{\"type\": \"security\"}','127.0.0.1','curl/8.21.0','2026-10-02 14:25:58'),(85,1,'settings.update',NULL,NULL,'حدّث الإعدادات: المظهر','{\"section\": \"appearance\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0','2026-10-02 14:39:49'),(86,1,'auth.login','App\\Models\\User',1,'تسجيل دخول إلى لوحة التحكم','{\"type\": \"security\"}','127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','2026-10-02 14:52:40'),(173,1,'auth.login','App\\Models\\User',1,'تسجيل دخول إلى لوحة التحكم','{\"type\": \"security\"}','127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','2026-10-02 15:01:38'),(183,1,'auth.login','App\\Models\\User',1,'تسجيل دخول إلى لوحة التحكم','{\"type\": \"security\"}','127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','2026-10-02 15:13:09');
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
-- Table structure for table `constant_groups`
--

DROP TABLE IF EXISTS `constant_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `constant_groups` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `group_key` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Stable code name, e.g. project_status, user_role, timezone',
  `name_ar` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Arabic title shown in Settings > System constants',
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Help text under the group title',
  `ref_table` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Existing table that owns the same list (programs, governorates, ...); NULL = constants are the only source',
  `used_in` json DEFAULT NULL COMMENT 'Dashboard pages that use the list, e.g. ["المشاريع"]',
  `is_locked` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 = keys are tied to code behaviour: items cannot be added or deleted, only label / order / active edited',
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `constant_groups_group_key_unique` (`group_key`),
  KEY `constant_groups_sort_order_index` (`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Editable dropdown lists of the admin dashboard (one row per list)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `constant_groups`
--

LOCK TABLES `constant_groups` WRITE;
/*!40000 ALTER TABLE `constant_groups` DISABLE KEYS */;
INSERT INTO `constant_groups` VALUES (1,'project_status','حالات المشروع','حالة المشروع في قائمة المشاريع ونموذج المشروع.',NULL,'[\"المشاريع\"]',0,1,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(2,'project_category','فئات المشاريع (البرامج)','فئة المشروع في الفلاتر ونموذج المشروع.','programs','[\"المشاريع\"]',0,2,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(3,'governorate','المحافظات','محافظة المشروع في نموذج المشروع.','governorates','[\"المشاريع\"]',0,3,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(4,'news_category','تصنيفات الأخبار','تصنيف الخبر في فلتر الأخبار ومحرر الخبر.','article_categories','[\"الأخبار\", \"تحرير خبر\"]',0,4,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(5,'article_status','حالات الخبر','حالة النشر في محرر الخبر. مفاتيحها مرتبطة بسلوك النشر، تُعدَّل تسميتها وترتيبها فقط.',NULL,'[\"تحرير خبر\"]',1,5,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(6,'page_status','حالات الصفحة','حالة الصفحة العامة في إدارة الصفحات. مفاتيحها مرتبطة بسلوك النشر، تُعدَّل تسميتها وترتيبها فقط.',NULL,'[\"الصفحات\"]',1,6,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(7,'visibility','حالة الظهور في الموقع','فلتر الظهور في القصص والأنشطة والشركاء والأسئلة والإعلانات وخريطة الأثر.',NULL,'[\"القصص\", \"الأنشطة\", \"الشركاء\", \"الأسئلة الشائعة\", \"نداء الإغاثة\", \"خريطة الأثر\"]',1,7,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(8,'gallery_album','ألبومات المعرض','الألبوم في معرض الصور (نقل الصور وتفاصيل الصورة).','gallery_albums','[\"معرض الصور\"]',0,8,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(9,'section_anchor','أقسام الموقع (وجهات الروابط)','وجهة الرابط في القصص والأنشطة والإعلانات ونداء الإغاثة.',NULL,'[\"القصص\", \"الأنشطة\", \"نداء الإغاثة\"]',0,9,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(10,'icon','الأيقونات','قائمة الأيقونات في القصص والأنشطة والشركاء. المفتاح اسم أيقونة Material Symbols.',NULL,'[\"القصص\", \"الأنشطة\", \"الشركاء\"]',0,10,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(11,'badge_tone','ألوان وسم الصورة','لون الوسم في الأنشطة الميدانية.',NULL,'[\"الأنشطة\"]',1,11,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(13,'timezone','المناطق الزمنية','المنطقة الزمنية في الإعدادات العامة. المفتاح معرّف IANA.',NULL,'[\"الإعدادات\"]',0,13,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(14,'language','لغات اللوحة','لغة واجهة الإدارة. المفاتيح مرتبطة بالواجهة، تُعدَّل تسميتها وترتيبها فقط.',NULL,'[\"الإعدادات\"]',1,14,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(15,'date_format','تنسيقات التاريخ','تنسيق التاريخ في الإعدادات العامة. المفاتيح مرتبطة بدالة التنسيق، تُعدَّل تسميتها وترتيبها فقط.',NULL,'[\"الإعدادات\"]',1,15,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(16,'digest_frequency','تكرار الملخص والنسخ الاحتياطي','تكرار الملخص الدوري وجدولة النسخ الاحتياطي (قائمة مشتركة).',NULL,'[\"الإعدادات\"]',1,16,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(17,'digest_day','أيام إرسال الملخص','يوم إرسال الملخص الأسبوعي في الإشعارات.',NULL,'[\"الإعدادات\"]',0,17,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(18,'password_expiry','مدد انتهاء كلمة المرور','خيارات انتهاء الصلاحية في إعدادات الأمان.',NULL,'[\"الإعدادات\"]',0,18,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(19,'session_timeout','مهل الجلسة','خيارات مهلة الخروج التلقائي (بالدقائق) في إعدادات الأمان.',NULL,'[\"الإعدادات\"]',0,19,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(20,'audit_type','أنواع أحداث السجل','فلتر نوع الحدث في سجل النشاط. المفاتيح مرتبطة بالأحداث، تُعدَّل تسميتها وترتيبها فقط.',NULL,'[\"الإعدادات\"]',1,20,'2026-10-01 10:50:04','2026-10-01 10:50:04');
/*!40000 ALTER TABLE `constant_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `constant_items`
--

DROP TABLE IF EXISTS `constant_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `constant_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `group_id` bigint unsigned NOT NULL,
  `item_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Value stored in other tables (e.g. urgent, Asia/Gaza, #about, 30); unique per group',
  `label_ar` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Arabic label shown in dropdowns',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0 = hidden from dropdowns, old records still show the label',
  `is_locked` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 = system item (key used by code, e.g. admin / off / never): cannot be deleted',
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `meta` json DEFAULT NULL COMMENT 'Optional extras: {"note":"..."} help text, {"ref_slug":"..."} slug in the group ref_table',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `constant_items_group_id_item_key_unique` (`group_id`,`item_key`),
  KEY `constant_items_group_id_sort_order_index` (`group_id`,`sort_order`),
  CONSTRAINT `constant_items_group_id_foreign` FOREIGN KEY (`group_id`) REFERENCES `constant_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=113 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Options of each constants group (label, order, enabled, locked)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `constant_items`
--

LOCK TABLES `constant_items` WRITE;
/*!40000 ALTER TABLE `constant_items` DISABLE KEYS */;
INSERT INTO `constant_items` VALUES (1,1,'active','نشط',1,0,0,NULL,'2026-10-01 10:50:04','2026-10-02 14:17:00'),(2,1,'urgent','عاجل',1,0,1,NULL,'2026-10-01 10:50:04','2026-10-02 14:16:59'),(3,1,'paused','متوقف مؤقتاً',1,0,2,NULL,'2026-10-01 10:50:04','2026-10-02 14:16:59'),(5,1,'completed','مكتمل',1,0,4,NULL,'2026-10-01 10:50:04','2026-10-02 14:17:00'),(6,2,'relief','برامج إغاثية',1,0,0,'{\"ref_slug\": \"relief\"}','2026-10-01 10:50:04','2026-10-01 10:50:04'),(7,2,'construction','برامج إنشائية',1,0,1,'{\"ref_slug\": \"construction\"}','2026-10-01 10:50:04','2026-10-01 10:50:04'),(8,2,'development','برامج تنموية',1,0,2,'{\"ref_slug\": \"development\"}','2026-10-01 10:50:04','2026-10-01 10:50:04'),(9,2,'health','برامج صحية',1,0,3,'{\"ref_slug\": \"health\"}','2026-10-01 10:50:04','2026-10-01 10:50:04'),(10,3,'north','شمال غزة',1,0,0,'{\"ref_slug\": \"north-gaza\"}','2026-10-01 10:50:04','2026-10-01 10:50:04'),(11,3,'gaza','غزة',1,0,1,'{\"ref_slug\": \"gaza\"}','2026-10-01 10:50:04','2026-10-01 10:50:04'),(12,3,'middle','دير البلح',1,0,2,'{\"ref_slug\": \"deir-al-balah\"}','2026-10-01 10:50:04','2026-10-01 10:50:04'),(13,3,'khan','خان يونس',1,0,3,'{\"ref_slug\": \"khan-younis\"}','2026-10-01 10:50:04','2026-10-01 10:50:04'),(14,3,'rafah','رفح',1,0,4,'{\"ref_slug\": \"rafah\"}','2026-10-01 10:50:04','2026-10-01 10:50:04'),(15,4,'statements','بيانات وتقارير',1,0,0,'{\"ref_slug\": \"statements\"}','2026-10-01 10:50:04','2026-10-01 10:50:04'),(16,4,'development','تنمية مجتمعية',1,0,1,'{\"ref_slug\": \"development\"}','2026-10-01 10:50:04','2026-10-01 10:50:04'),(17,4,'field','توثيق الميدان',1,0,2,'{\"ref_slug\": \"field\"}','2026-10-01 10:50:04','2026-10-01 10:50:04'),(18,4,'activities','أنشطة ميدانية',1,0,3,'{\"ref_slug\": \"activities\"}','2026-10-01 10:50:04','2026-10-01 10:50:04'),(19,5,'draft','مسودة',1,0,0,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(20,5,'published','منشور',1,0,1,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(21,5,'scheduled','مجدول',1,0,2,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(22,6,'published','منشورة',1,0,0,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(23,6,'draft','مسودة',1,0,1,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(24,6,'hidden','مخفية',1,0,2,'{\"note\": \"لا تظهر في القوائم والبحث\"}','2026-10-01 10:50:04','2026-10-01 10:50:04'),(25,7,'visible','ظاهر في الموقع',1,0,0,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(26,7,'hidden','مخفي',1,0,1,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(27,8,'field','توثيق الميدان',1,0,0,'{\"ref_slug\": \"field\"}','2026-10-01 10:50:04','2026-10-01 10:50:04'),(28,8,'relief','الإغاثة',1,0,1,'{\"ref_slug\": \"relief\"}','2026-10-01 10:50:04','2026-10-01 10:50:04'),(29,8,'development','التعليم والتنمية',1,0,2,'{\"ref_slug\": \"development\"}','2026-10-01 10:50:04','2026-10-01 10:50:04'),(30,8,'health','الصحة والمياه',1,0,3,'{\"ref_slug\": \"health\"}','2026-10-01 10:50:04','2026-10-01 10:50:04'),(31,9,'#hero','الرئيسية',1,0,0,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(32,9,'#about','من نحن',1,0,1,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(33,9,'#projects','المشاريع',1,0,2,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(34,9,'#stories','قصص من الميدان',1,0,3,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(35,9,'#activities','الأنشطة الميدانية',1,0,4,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(36,9,'#appeal','نداء الإغاثة',1,0,5,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(37,9,'#impact-map','خريطة الأثر',1,0,6,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(38,9,'#news','الأخبار',1,0,7,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(39,9,'#partners','الشركاء',1,0,8,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(40,9,'#gallery','معرض الصور',1,0,9,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(41,9,'#contact','التواصل',1,0,10,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(42,9,'#faq','الأسئلة الشائعة',1,0,11,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(43,10,'shopping_basket','سلة غذائية',1,0,0,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(44,10,'diversity_3','فرق التطوع',1,0,1,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(45,10,'menu_book','التعليم',1,0,2,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(46,10,'medical_services','الرعاية الطبية',1,0,3,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(47,10,'water_drop','المياه',1,0,4,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(48,10,'camping','الخيام',1,0,5,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(49,10,'restaurant','الوجبات',1,0,6,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(50,10,'groups','المستفيدون',1,0,7,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(51,10,'group','مجموعة',1,0,8,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(52,10,'school','المدرسة',1,0,9,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(53,10,'child_care','الأطفال',1,0,10,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(54,10,'public','دولي',1,0,11,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(55,10,'nutrition','الأمن الغذائي',1,0,12,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(56,10,'emergency','إغاثة عاجلة',1,0,13,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(57,10,'shield','حماية',1,0,14,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(58,10,'handshake','شراكة',1,0,15,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(59,10,'favorite','عطاء',1,0,16,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(60,10,'local_shipping','قوافل',1,0,17,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(61,10,'volunteer_activism','تبرع',1,0,18,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(62,10,'health_and_safety','السلامة الصحية',1,0,19,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(63,11,'forest','أخضر داكن',1,0,0,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(64,11,'gold','ذهبي',1,0,1,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(65,11,'mid','أخضر متوسط',1,0,2,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(70,13,'Asia/Gaza','غزة (GMT+3)',1,0,0,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(71,13,'Asia/Hebron','الخليل (GMT+3)',1,0,1,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(72,13,'Africa/Cairo','القاهرة (GMT+3)',1,0,2,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(73,13,'Asia/Amman','عمّان (GMT+3)',1,0,3,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(74,13,'Asia/Riyadh','الرياض (GMT+3)',1,0,4,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(75,13,'Europe/Istanbul','إسطنبول (GMT+3)',1,0,5,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(76,13,'Asia/Dubai','دبي (GMT+4)',1,0,6,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(77,13,'Europe/London','لندن',1,0,7,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(78,13,'UTC','التوقيت العالمي UTC',1,0,8,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(79,14,'ar','العربية',1,0,0,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(80,14,'en','English',1,0,1,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(81,15,'long','طويل',1,0,0,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(82,15,'short','مختصر',1,0,1,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(83,15,'iso','رقمي',1,0,2,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(84,16,'off','متوقف',1,1,0,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(85,16,'daily','يومي',1,0,1,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(86,16,'weekly','أسبوعي',1,0,2,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(87,16,'monthly','شهري',1,0,3,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(88,17,'sat','السبت',1,0,0,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(89,17,'sun','الأحد',1,0,1,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(90,17,'mon','الاثنين',1,0,2,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(91,17,'thu','الخميس',1,0,3,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(92,18,'never','لا تنتهي',1,1,0,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(93,18,'30','كل 30 يوماً',1,0,1,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(94,18,'60','كل 60 يوماً',1,0,2,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(95,18,'90','كل 90 يوماً',1,0,3,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(96,18,'180','كل 180 يوماً',1,0,4,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(97,19,'15','15 دقيقة',1,0,0,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(98,19,'30','30 دقيقة',1,0,1,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(99,19,'60','ساعة',1,0,2,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(100,19,'240','4 ساعات',1,0,3,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(101,19,'480','8 ساعات',1,0,4,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(102,20,'settings','الإعدادات',1,0,0,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(103,20,'users','المستخدمون',1,0,1,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(104,20,'security','الأمان',1,0,2,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(105,20,'content','المحتوى',1,0,3,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(106,20,'integrations','التكاملات',1,0,4,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(107,20,'backup','النسخ',1,0,5,NULL,'2026-10-01 10:50:04','2026-10-01 10:50:04'),(110,1,'draft','مسودة',1,0,3,NULL,'2026-10-02 14:17:00','2026-10-02 14:17:00');
/*!40000 ALTER TABLE `constant_items` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Gallery albums / filter chips (field documentation, relief, education, health)';
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Photos / videos in the public gallery';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gallery_items`
--

LOCK TABLES `gallery_items` WRITE;
/*!40000 ALTER TABLE `gallery_items` DISABLE KEYS */;
INSERT INTO `gallery_items` VALUES (1,2,13,NULL,NULL,'image',NULL,'قافلة الإغاثة الكبرى',NULL,'شاحنات قافلة الإغاثة تصل إلى جباليا',NULL,1,1,'2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(2,3,1,NULL,NULL,'image',NULL,'أطفال غزة والحقائب المدرسية',NULL,'أطفال يبتسمون بعد استلام الحقائب المدرسية',NULL,1,2,'2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(3,4,18,NULL,NULL,'image',NULL,'العيادة الميدانية',NULL,'طاقم طبي داخل عيادة خيمة ميدانية',NULL,1,3,'2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(4,4,16,NULL,NULL,'image',NULL,'نقطة مياه الشرب',NULL,'نازحون يملؤون عبوات المياه من صهريج',NULL,1,4,'2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(5,1,15,NULL,NULL,'image',NULL,'نقطة توزيع السلال',NULL,'فريق يجهز السلال الغذائية في نقطة توزيع',NULL,1,5,'2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(6,2,19,NULL,NULL,'image',NULL,'حزم الدفء الشتوية',NULL,'توزيع أغطية شتوية على الأسر النازحة',NULL,1,6,'2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(7,3,20,NULL,NULL,'image',NULL,'خيم التعلّم',NULL,'أطفال في حلقة تعلّم داخل خيمة مدرسية',NULL,1,7,'2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(8,1,2,NULL,NULL,'image',NULL,'توزيع المساعدات الغذائية',NULL,'توزيع مساعدات غذائية في شمال غزة',NULL,1,8,'2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(9,4,4,NULL,NULL,'image',NULL,'فريق العيادات',NULL,'فريق طبي يقدم الرعاية للأطفال',NULL,1,9,'2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(10,4,21,NULL,NULL,'image',NULL,'صهاريج خان يونس',NULL,'توزيع مياه صالحة للشرب في خان يونس',NULL,1,10,'2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(11,3,6,NULL,NULL,'image',NULL,'الخيمة التعليمية السادسة',NULL,'أطفال في افتتاح الخيمة التعليمية',NULL,1,11,'2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(12,1,17,NULL,NULL,'image',NULL,'مراكز الإيواء',NULL,'انتظار الوجبات الساخنة في مراكز الإيواء',NULL,1,12,'2026-10-02 14:14:19','2026-10-02 14:14:19',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Media library: every uploaded image/file is one row, other tables point here via *_media_id';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_files`
--

LOCK TABLES `media_files` WRITE;
/*!40000 ALTER TABLE `media_files` DISABLE KEYS */;
INSERT INTO `media_files` VALUES (1,'public','img/gallery-children.jpg','gallery-children.jpg','image/jpeg',187550,1200,800,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-10-02 14:14:19',NULL),(2,'public','img/project-relief.jpg','project-relief.jpg','image/jpeg',195254,1200,800,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-10-02 14:14:19',NULL),(3,'public','img/project-orphan.jpg','project-orphan.jpg','image/jpeg',0,NULL,NULL,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(4,'public','img/activity-medical.jpg','activity-medical.jpg','image/jpeg',93417,1200,800,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-10-02 14:14:19',NULL),(5,'public','img/activity-winter.jpg','activity-winter.jpg','image/jpeg',49684,1200,795,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-10-02 14:14:19',NULL),(6,'public','img/activity-graduate.jpg','activity-graduate.jpg','image/jpeg',188801,1200,800,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-10-02 14:14:19',NULL),(7,'public','img/partners/unicef.svg','unicef.svg','image/svg+xml',0,NULL,NULL,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(8,'public','img/partners/unitednations.svg','unitednations.svg','image/svg+xml',0,NULL,NULL,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(9,'public','img/partners/wfp.png','wfp.png','image/png',0,NULL,NULL,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(10,'public','img/partners/who.svg','who.svg','image/svg+xml',0,NULL,NULL,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(11,'public','img/partners/crescent.svg','crescent.svg','image/svg+xml',0,NULL,NULL,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(12,'public','img/partners/icrc.svg','icrc.svg','image/svg+xml',0,NULL,NULL,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(13,'public','img/gallery-convoy.jpg','gallery-convoy.jpg','image/jpeg',296893,1600,1067,NULL,NULL,NULL,'2026-09-30 21:09:43','2026-10-02 14:14:19',NULL),(14,'public','img/news-conference.jpg','news-conference.jpg','image/jpeg',268568,1600,1068,NULL,'إحاطة إعلامية عن إغاثة غزة',NULL,'2026-10-02 14:14:18','2026-10-02 14:14:18',NULL),(15,'public','img/gallery-lab.jpg','gallery-lab.jpg','image/jpeg',57984,800,533,NULL,'شاشة حاسوب لمتابعة التوزيع',NULL,'2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(16,'public','img/gallery-water.jpg','gallery-water.jpg','image/jpeg',119315,800,1200,NULL,'مياه شرب',NULL,'2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(17,'public','img/project-parallax.jpg','project-parallax.jpg','image/jpeg',124137,1024,683,NULL,'انتظار الوجبات في مراكز الإيواء',NULL,'2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(18,'public','img/gallery-clinic.jpg','gallery-clinic.jpg','image/jpeg',47326,800,533,NULL,'طاقم طبي داخل عيادة خيمة ميدانية',NULL,'2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(19,'public','img/gallery-winter.jpg','gallery-winter.jpg','image/jpeg',339898,1600,1068,NULL,'توزيع أغطية شتوية على الأسر النازحة',NULL,'2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(20,'public','img/gallery-campus.jpg','gallery-campus.jpg','image/jpeg',188801,1200,800,NULL,'أطفال في حلقة تعلّم داخل خيمة مدرسية',NULL,'2026-10-02 14:14:19','2026-10-02 14:14:19',NULL),(21,'public','img/project-water.jpg','project-water.jpg','image/jpeg',130449,1200,1796,NULL,'توزيع مياه صالحة للشرب في خان يونس',NULL,'2026-10-02 14:14:19','2026-10-02 14:14:19',NULL);
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
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `perm_key` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '<module>.<action>, e.g. news.publish',
  `module` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'dashboard, news, gallery, users, ...',
  `action` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'view, create, edit, delete, publish, export, manage',
  `name_ar` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_perm_key_unique` (`perm_key`),
  KEY `permissions_module_index` (`module`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='All permissions of the dashboard (module.action)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'dashboard.view','dashboard','view','عرض لوحة التحكم',0,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(2,'reports.view','reports','view','عرض التقارير والإحصائيات',1,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(3,'reports.export','reports','export','تصدير التقارير',2,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(4,'homepage.view','homepage','view','عرض الصفحة الرئيسية',3,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(5,'homepage.edit','homepage','edit','تعديل الصفحة الرئيسية',4,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(6,'projects.view','projects','view','عرض المشاريع',5,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(7,'projects.create','projects','create','إضافة المشاريع',6,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(8,'projects.edit','projects','edit','تعديل المشاريع',7,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(9,'projects.delete','projects','delete','حذف المشاريع',8,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(10,'projects.publish','projects','publish','نشر المشاريع',9,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(11,'news.view','news','view','عرض الأخبار',10,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(12,'news.create','news','create','إضافة الأخبار',11,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(13,'news.edit','news','edit','تعديل الأخبار',12,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(14,'news.delete','news','delete','حذف الأخبار',13,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(15,'news.publish','news','publish','نشر الأخبار',14,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(16,'gallery.view','gallery','view','عرض معرض الصور',15,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(17,'gallery.create','gallery','create','إضافة معرض الصور',16,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(18,'gallery.edit','gallery','edit','تعديل معرض الصور',17,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(19,'gallery.delete','gallery','delete','حذف معرض الصور',18,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(20,'gallery.publish','gallery','publish','نشر معرض الصور',19,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(21,'stories.view','stories','view','عرض قصص الميدان',20,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(22,'stories.create','stories','create','إضافة قصص الميدان',21,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(23,'stories.edit','stories','edit','تعديل قصص الميدان',22,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(24,'stories.delete','stories','delete','حذف قصص الميدان',23,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(25,'stories.publish','stories','publish','نشر قصص الميدان',24,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(26,'activities.view','activities','view','عرض الأنشطة الميدانية',25,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(27,'activities.create','activities','create','إضافة الأنشطة الميدانية',26,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(28,'activities.edit','activities','edit','تعديل الأنشطة الميدانية',27,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(29,'activities.delete','activities','delete','حذف الأنشطة الميدانية',28,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(30,'partners.view','partners','view','عرض الشركاء',29,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(31,'partners.create','partners','create','إضافة الشركاء',30,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(32,'partners.edit','partners','edit','تعديل الشركاء',31,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(33,'partners.delete','partners','delete','حذف الشركاء',32,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(34,'faq.view','faq','view','عرض الأسئلة الشائعة',33,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(35,'faq.create','faq','create','إضافة الأسئلة الشائعة',34,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(36,'faq.edit','faq','edit','تعديل الأسئلة الشائعة',35,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(37,'faq.delete','faq','delete','حذف الأسئلة الشائعة',36,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(38,'appeal.view','appeal','view','عرض نداء الإغاثة والإعلانات',37,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(39,'appeal.create','appeal','create','إضافة نداء الإغاثة والإعلانات',38,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(40,'appeal.edit','appeal','edit','تعديل نداء الإغاثة والإعلانات',39,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(41,'appeal.delete','appeal','delete','حذف نداء الإغاثة والإعلانات',40,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(42,'impact.view','impact','view','عرض خريطة الأثر',41,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(43,'impact.edit','impact','edit','تعديل خريطة الأثر',42,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(44,'pages.view','pages','view','عرض الصفحات',43,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(45,'pages.create','pages','create','إضافة الصفحات',44,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(46,'pages.edit','pages','edit','تعديل الصفحات',45,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(47,'pages.delete','pages','delete','حذف الصفحات',46,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(48,'pages.publish','pages','publish','نشر الصفحات',47,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(49,'menu.view','menu','view','عرض القائمة',48,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(50,'menu.create','menu','create','إضافة القائمة',49,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(51,'menu.edit','menu','edit','تعديل القائمة',50,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(52,'menu.delete','menu','delete','حذف القائمة',51,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(53,'messages.view','messages','view','عرض الرسائل والطلبات',52,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(54,'messages.edit','messages','edit','معالجة الرسائل (قراءة وأرشفة)',53,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(55,'messages.delete','messages','delete','حذف الرسائل والطلبات',54,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(56,'users.view','users','view','عرض مستخدمو النظام',55,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(57,'users.create','users','create','إضافة مستخدمو النظام',56,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(58,'users.edit','users','edit','تعديل مستخدمو النظام',57,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(59,'users.delete','users','delete','حذف مستخدمو النظام',58,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(60,'roles.view','roles','view','عرض الأدوار والصلاحيات',59,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(61,'roles.create','roles','create','إضافة الأدوار والصلاحيات',60,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(62,'roles.edit','roles','edit','تعديل الأدوار والصلاحيات',61,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(63,'roles.delete','roles','delete','حذف الأدوار والصلاحيات',62,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(64,'settings.view','settings','view','عرض الإعدادات العامة',63,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(65,'settings.edit','settings','edit','تعديل الإعدادات العامة',64,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(66,'constants.view','constants','view','عرض ثوابت النظام',65,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(67,'constants.manage','constants','manage','إدارة ثوابت النظام (إضافة وتعديل وحذف)',66,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(68,'backup.view','backup','view','عرض النسخ الاحتياطي',67,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(69,'backup.manage','backup','manage','إدارة النسخ الاحتياطي',68,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(70,'audit.view','audit','view','عرض سجل النشاط',69,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(71,'audit.export','audit','export','تصدير سجل النشاط',70,'2026-10-02 14:43:41','2026-10-02 14:43:41');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
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
-- Table structure for table `role_permission`
--

DROP TABLE IF EXISTS `role_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permission` (
  `role_id` bigint unsigned NOT NULL,
  `permission_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `role_permission_permission_id_index` (`permission_id`),
  CONSTRAINT `role_permission_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permission_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Which permissions each role has';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permission`
--

LOCK TABLES `role_permission` WRITE;
/*!40000 ALTER TABLE `role_permission` DISABLE KEYS */;
INSERT INTO `role_permission` VALUES (1,1),(2,1),(3,1),(4,1),(5,1),(1,2),(2,2),(5,2),(1,3),(2,3),(1,4),(2,4),(3,4),(5,4),(1,5),(2,5),(1,6),(2,6),(3,6),(5,6),(1,7),(2,7),(1,8),(2,8),(1,9),(2,9),(1,10),(2,10),(1,11),(2,11),(3,11),(4,11),(5,11),(1,12),(2,12),(3,12),(4,12),(1,13),(2,13),(3,13),(4,13),(1,14),(2,14),(1,15),(2,15),(1,16),(2,16),(3,16),(5,16),(1,17),(2,17),(3,17),(1,18),(2,18),(3,18),(1,19),(2,19),(1,20),(2,20),(1,21),(2,21),(3,21),(5,21),(1,22),(2,22),(3,22),(1,23),(2,23),(3,23),(1,24),(2,24),(1,25),(2,25),(1,26),(2,26),(3,26),(5,26),(1,27),(2,27),(3,27),(1,28),(2,28),(3,28),(1,29),(2,29),(1,30),(2,30),(3,30),(5,30),(1,31),(2,31),(3,31),(1,32),(2,32),(3,32),(1,33),(2,33),(1,34),(2,34),(3,34),(5,34),(1,35),(2,35),(3,35),(1,36),(2,36),(3,36),(1,37),(2,37),(1,38),(2,38),(5,38),(1,39),(2,39),(1,40),(2,40),(1,41),(2,41),(1,42),(2,42),(5,42),(1,43),(2,43),(1,44),(2,44),(3,44),(5,44),(1,45),(2,45),(3,45),(1,46),(2,46),(3,46),(1,47),(2,47),(1,48),(2,48),(1,49),(2,49),(5,49),(1,50),(2,50),(1,51),(2,51),(1,52),(2,52),(1,53),(2,53),(3,53),(5,53),(1,54),(2,54),(1,55),(2,55),(1,56),(1,57),(1,58),(1,59),(1,60),(1,61),(1,62),(1,63),(1,64),(1,65),(1,66),(1,67),(1,68),(1,69),(1,70),(1,71);
/*!40000 ALTER TABLE `role_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `role_key` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Stored in users.role: admin, manager, editor, ... (a-z, 0-9, _)',
  `name_ar` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Arabic name shown in the dashboard',
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_system` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 = built-in role: cannot be deleted. Role admin is also locked (always all permissions)',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0 = users with this role cannot sign in / use the dashboard',
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_role_key_unique` (`role_key`),
  KEY `roles_sort_order_index` (`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Dashboard roles (admin, manager, editor, writer, viewer + custom)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','مدير النظام','صلاحيات كاملة على كل أقسام لوحة التحكم، بما فيها المستخدمون والأدوار والإعدادات. دور محمي ولا يمكن تعديله أو تعطيله أو حذفه.',1,1,0,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(2,'manager','مدير المحتوى','يدير كل أقسام المحتوى والرسائل والتقارير (إضافة وتعديل ونشر وحذف) بدون الإعدادات والمستخدمين والأدوار.',1,1,1,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(3,'editor','محرر','يضيف ويعدّل الأخبار والمعرض والقصص والأنشطة والشركاء والأسئلة الشائعة والصفحات، بدون حذف أو نشر. يطّلع على الرسائل والمشاريع.',1,1,2,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(4,'writer','كاتب','يكتب الأخبار ويعدّلها كمسودات فقط، بدون نشر أو حذف ولا وصول لباقي الأقسام.',1,1,3,'2026-10-02 14:43:41','2026-10-02 14:43:41'),(5,'viewer','مشاهد','اطّلاع فقط على لوحة التحكم والتقارير وأقسام المحتوى والرسائل، بدون أي إضافة أو تعديل أو حذف.',1,1,4,'2026-10-02 14:43:41','2026-10-02 14:43:41');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
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
INSERT INTO `sessions` VALUES ('27Xkh62WU8GIt2qLYzCMS5zwLoR3djBQJpne9kzw',1,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiYVNFZE9DZzFCVU9GazlhYmphcndON2luMFpWNzZva3pWNHpmcnYyNCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzM6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5NC9hZG1pbi9wYWdlcyI7czo1OiJyb3V0ZSI7czoxNzoiYWRtaW4ucGFnZXMuaW5kZXgiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxO3M6MTc6InBhc3N3b3JkX2hhc2hfd2ViIjtzOjY0OiI1MGFhMDNkNGIxY2I3YWNjZjQ3ZmYyNTQxYTVjNjgwMWY3ZjAxOWYzYzUzMGRiMWEzZjZlM2Q4ODhlNWM3MGNlIjt9',1790950710),('6vXvEVz3J24ND63LFliKjoTIj34xsQa5lyyuT3fY',18,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiSlB4SzBodVc1VDgwRFo4d0JPeDNJeDltRndBMktBZXB2Q1N5aHQ3MiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9wcm9maWxlIjtzOjU6InJvdXRlIjtzOjE4OiJhZG1pbi5wcm9maWxlLmVkaXQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxODtzOjE3OiJwYXNzd29yZF9oYXNoX3dlYiI7czo2NDoiZTBkOWNhZTM1M2U5MzkxOTRiMWJiMGM4NDNjNjBmZTkwNTA1OGZkMzgyOTBkYTM0Yzg3ODg2ZmRiYWViZjg5NSI7fQ==',1790953183),('8tcSQyIJzkTO7c8igBWGASWiVQOb2yJ94YItKUqb',19,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiWHdyNW5pU1o1U0Jyb1FhbE91VmJ0SlZKemdSbmU2WW9JNzFyT09EVSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbiI7czo1OiJyb3V0ZSI7czoxNToiYWRtaW4uZGFzaGJvYXJkIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTk7czoxNzoicGFzc3dvcmRfaGFzaF93ZWIiO3M6NjQ6IjY3Yjk5MzU1OGU4YWYwMmNkN2Q4ZDI5Y2Q1ZDVhOWU5ODFhNmRjOWMxNjhkODZkZTZjYzA4ZDE5YWFhM2FlODQiO30=',1790953180),('9QufxvHRZgtsjI16DxlF8Nwi3HxYMJTAoV35wZHH',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTozOntzOjY6Il90b2tlbiI7czo0MDoiWkw5Q1F2SXJydkdCZEtWN0tpbFN6bEw3a0ZUUW1ObnpURlp0ZUU0SCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzM6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9sb2dpbiI7czo1OiJyb3V0ZSI7czoxMToiYWRtaW4ubG9naW4iO319',1790952891),('ADWMQQQGfSzrzhZYcpPb0ZcLLrfiXgHzEOYGck2n',16,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiU3QxTEs2MkVlUldacTBJZWtVZWw0N3VoZkVWaExJamNoazJTZGdzdiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9wcm9maWxlIjtzOjU6InJvdXRlIjtzOjE4OiJhZG1pbi5wcm9maWxlLmVkaXQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxNjtzOjE3OiJwYXNzd29yZF9oYXNoX3dlYiI7czo2NDoiMmEzMDRlZWQ0MjgxYzRiYWNjMjc4ZjBjZTU2ZTUyM2VkNzhhNGY2NGU1MjAwMDRjMzEzNmY3MTIxYzliMDAwMiI7fQ==',1790953175),('aJso7gwpfRFooklurFZ4EUgVuggn7618lSgRz7Gl',14,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoialJ4ak5XbnJEUWQ0VFY5Q1hjSnJ5d2x1elliZDNkdTYwTGg0NkxJdiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9wcm9maWxlIjtzOjU6InJvdXRlIjtzOjE4OiJhZG1pbi5wcm9maWxlLmVkaXQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxNDtzOjE3OiJwYXNzd29yZF9oYXNoX3dlYiI7czo2NDoiZTZlNWE4MjFiNzU2NDMzNzAxMjQ0OTQ3MGNkODlkYWNmNzgyMTNiZTM0OWUyODAzNWE0NDA0NTU4N2M0ZmM0NSI7fQ==',1790953123),('bW7iRzIrOawl82lPV2Yi7Ua4v5ys1RRs7CQyqfNp',8,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiZUJNbWc5NGRWWXB0V1ZjUTJJNVhudGdvMjVKbURnVzFZMkNIT2NhQSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9wcm9maWxlIjtzOjU6InJvdXRlIjtzOjE4OiJhZG1pbi5wcm9maWxlLmVkaXQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aTo4O3M6MTc6InBhc3N3b3JkX2hhc2hfd2ViIjtzOjY0OiI3NjcyZGEzMjUxZjRmMjhiZTQ3YjdjNmM2YmZhODEzOTgyODY5NzczYzllNDg2MzgzOGEyYWZhMGJlNTc2ZjExIjt9',1790952888),('c6JlIwNoGaY90LCE2PvskttVPXRQnUENf7esS9KW',17,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiNWV5NHJ0dk80aVpDQlNtU2l2NGdNVENlTXN5dzhDSklRbGQ2OURtNyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9wcm9maWxlIjtzOjU6InJvdXRlIjtzOjE4OiJhZG1pbi5wcm9maWxlLmVkaXQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxNztzOjE3OiJwYXNzd29yZF9oYXNoX3dlYiI7czo2NDoiNDdjM2ZkY2Q2NTdlODViNDQ1OTcyYzNlNTRlMjA3YzZiY2Y2NjJmZjhmZjIzYTVkNWYyZTk5YjM5NzFiNWM0OCI7fQ==',1790953175),('calFM5EHXck56VRdtjdCP1gok5wtxhKmwz4pXSgx',12,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoicXNSbnBxSlR5VDU2aXRic1gzNnR2TnpRbkxDYUp5T2Rucm81NnZVaiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9wcm9maWxlIjtzOjU6InJvdXRlIjtzOjE4OiJhZG1pbi5wcm9maWxlLmVkaXQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxMjtzOjE3OiJwYXNzd29yZF9oYXNoX3dlYiI7czo2NDoiN2RiNzk1N2Q3YmE1NGEyZDFiMGI5M2U3YjRjZGE5NGYzNTgyYzk2NTY5MTU1YTNhYjVjYjhiYmRjMzNmMDYyMiI7fQ==',1790953124),('CTiLVNy29eh6qXCNY85apCbZZBV42CNBwEmpMLcF',1,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiVU9Ya0FocTYyYzg2djZMTU9jVWg2ajMxUkNTakFkQ2x3R2ZPYXhxRCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzM6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi91c2VycyI7czo1OiJyb3V0ZSI7czoxNzoiYWRtaW4udXNlcnMuaW5kZXgiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxO3M6MTc6InBhc3N3b3JkX2hhc2hfd2ViIjtzOjY0OiI1MGFhMDNkNGIxY2I3YWNjZjQ3ZmYyNTQxYTVjNjgwMWY3ZjAxOWYzYzUzMGRiMWEzZjZlM2Q4ODhlNWM3MGNlIjt9',1790952893),('d68A8HLGvJX6ojjnrh9PC0kdn4sdRuc0dkiPTWWq',19,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiN1Nsb05DZktkR0xtaG9KUmJxVEFuMFNBRVVBS1NhU3FaN3lUanU5YiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9wcm9maWxlIjtzOjU6InJvdXRlIjtzOjE4OiJhZG1pbi5wcm9maWxlLmVkaXQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxOTtzOjE3OiJwYXNzd29yZF9oYXNoX3dlYiI7czo2NDoiNjdiOTkzNTU4ZThhZjAyY2Q3ZDhkMjljZDVkNWE5ZTk4MWE2ZGM5YzE2OGQ4NmRlNmNjMDhkMTlhYWEzYWU4NCI7fQ==',1790953173),('dtAMu0gZOZkYohJAfdPl7N607RbOtFVrd4obbAVM',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo0OntzOjY6Il90b2tlbiI7czo0MDoiQnllVXZrOHdkSUI2WU9lZFc1UnBFV1VQNUwyNHpnMUdGMUozTHJTSiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzM6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9sb2dpbiI7czo1OiJyb3V0ZSI7czoxMToiYWRtaW4ubG9naW4iO31zOjM6InVybCI7YToxOntzOjg6ImludGVuZGVkIjtzOjI3OiJodHRwOi8vMTI3LjAuMC4xOjgwOTYvYWRtaW4iO319',1790953129),('DwkqLVGFHg9yemRYc87f9hjWiWyDdEol51Km1oTo',1,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiQnQ2TldtSGdneG15amY2YXdsUjdtRmpsVTdsWGhOQlRwbUZYVnJicCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9wcm9maWxlIjtzOjU6InJvdXRlIjtzOjE4OiJhZG1pbi5wcm9maWxlLmVkaXQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxO3M6MTc6InBhc3N3b3JkX2hhc2hfd2ViIjtzOjY0OiI1MGFhMDNkNGIxY2I3YWNjZjQ3ZmYyNTQxYTVjNjgwMWY3ZjAxOWYzYzUzMGRiMWEzZjZlM2Q4ODhlNWM3MGNlIjt9',1790952765),('egliuN5950MhZlOne21GxWXQe9D8uAFucR9vZFrl',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTozOntzOjY6Il90b2tlbiI7czo0MDoiQ0JLS2JNNWpFb2JlZTNreE1NNjhCaHRlSHpwNXBRNTRKU016RGtSYyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzM6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9sb2dpbiI7czo1OiJyb3V0ZSI7czoxMToiYWRtaW4ubG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1790952758),('EHK0ib6iltc9rjt4MuNoAAY1wGKeqZOo7azTyIAE',11,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoicEFnTFoxZUZhbjJ5MTc0VjB1M2hwUmc5NmlOZDFVcE10SDQwVmtrcSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbiI7czo1OiJyb3V0ZSI7czoxNToiYWRtaW4uZGFzaGJvYXJkIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTE7czoxNzoicGFzc3dvcmRfaGFzaF93ZWIiO3M6NjQ6ImQ0YzBmZmVmNmM0MDQ0MWYxNTViNTBhMWU3YmJlOWJjNjY3NDE4ZWVkZTI0MmRlYWYxOGFkZjI1ZjMxMWU2ZDUiO30=',1790952892),('GTfcFJIKMmwAzVqnDIUaeATOgbHHXdCjUGIiowSu',11,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiazJvYWtFNTRUaUp0bDJ6YVZyRUJ1bFY1R1JzRm1VM0g1eXFjMjdlSyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9wcm9maWxlIjtzOjU6InJvdXRlIjtzOjE4OiJhZG1pbi5wcm9maWxlLmVkaXQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxMTtzOjE3OiJwYXNzd29yZF9oYXNoX3dlYiI7czo2NDoiZDRjMGZmZWY2YzQwNDQxZjE1NWI1MGExZTdiYmU5YmM2Njc0MThlZWRlMjQyZGVhZjE4YWRmMjVmMzExZTZkNSI7fQ==',1790952886),('iS7KqebONzZ87t37D8X0PkRqvUn4mzonNIcfx3cV',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo0OntzOjY6Il90b2tlbiI7czo0MDoiMzFGUEcza1pxMmxZb1RMTDU4UktEbmE4bGlmczVpQkdiZFhWVHFJRSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzM6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9sb2dpbiI7czo1OiJyb3V0ZSI7czoxMToiYWRtaW4ubG9naW4iO31zOjM6InVybCI7YToxOntzOjg6ImludGVuZGVkIjtzOjI3OiJodHRwOi8vMTI3LjAuMC4xOjgwOTYvYWRtaW4iO319',1790953179),('Lmchvhr4Od06uqPbXpY7bq3vzRQRd7i8Qajs6jWV',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo0OntzOjY6Il90b2tlbiI7czo0MDoiQlpGaVpqYjVnc2hkcDNoUEVOeXltT0R3b0lDRUo3SkxnMUN5SzNOSSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzM6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9sb2dpbiI7czo1OiJyb3V0ZSI7czoxMToiYWRtaW4ubG9naW4iO31zOjM6InVybCI7YToxOntzOjg6ImludGVuZGVkIjtzOjI3OiJodHRwOi8vMTI3LjAuMC4xOjgwOTYvYWRtaW4iO319',1790952892),('MEVgEP92F57Du4BIZTLKS9Sub3PjlZFabZX2vEDz',14,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiNEJNN3pObEdDekp3UUtjbTk5T2F0aFFMM1JjWHp0bUFKejZrUXllNyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9wcm9maWxlIjtzOjU6InJvdXRlIjtzOjE4OiJhZG1pbi5wcm9maWxlLmVkaXQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxNDtzOjE3OiJwYXNzd29yZF9oYXNoX3dlYiI7czo2NDoiZTZlNWE4MjFiNzU2NDMzNzAxMjQ0OTQ3MGNkODlkYWNmNzgyMTNiZTM0OWUyODAzNWE0NDA0NTU4N2M0ZmM0NSI7fQ==',1790953132),('nMTe0afPpVynZSZ1JzwV93v803FFkCwfVPpCDEQk',1,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiMXRuWHBtV0FLbTQ2ZmFPd255Z1R4M1VsaDR4NkJkWHU1ZmFZSkhyMCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5NC9hZG1pbi9wcm9maWxlIjtzOjU6InJvdXRlIjtzOjE4OiJhZG1pbi5wcm9maWxlLmVkaXQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxO3M6MTc6InBhc3N3b3JkX2hhc2hfd2ViIjtzOjY0OiI1MGFhMDNkNGIxY2I3YWNjZjQ3ZmYyNTQxYTVjNjgwMWY3ZjAxOWYzYzUzMGRiMWEzZjZlM2Q4ODhlNWM3MGNlIjt9',1790950621),('O8Vgam2B7SyLiFTEvzc4vBuyB1tqbOMUCcviOPGz',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTozOntzOjY6Il90b2tlbiI7czo0MDoiaDhqekZmQjVBVkhKR2hyd3hjd1h6ZmpGUlplQmNYZGVKVU9FakhEaSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzM6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9sb2dpbiI7czo1OiJyb3V0ZSI7czoxMToiYWRtaW4ubG9naW4iO319',1790953128),('P3OvCjwAUBbVicvMm5QeTbaoJ6CehKT1kWQZWZ2M',13,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiRlZoRU5pTVBJeGJrVGdpTFlRT0lQUFlpTk0yYWhaaDNDNTNDQWVCZSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9wcm9maWxlIjtzOjU6InJvdXRlIjtzOjE4OiJhZG1pbi5wcm9maWxlLmVkaXQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxMztzOjE3OiJwYXNzd29yZF9oYXNoX3dlYiI7czo2NDoiNzI0ZDRhODcyNjQ5MzBjODYwMmRlYzM5MmY0NThiMTU1MmNjMTk1ZGZmY2FjN2ZkMzliMWM5NzMzZDk5MWI5OCI7fQ==',1790953124),('pEQ0PVaAwYUIKe0zgSyXIxXZ95rYa8SPrhQJ06GF',10,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiUnpLaWlKY09XZ0VMS1dYMnUxdHdGWU9Yd05vSkx4MEVodUkxYmozZCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9wcm9maWxlIjtzOjU6InJvdXRlIjtzOjE4OiJhZG1pbi5wcm9maWxlLmVkaXQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxMDtzOjE3OiJwYXNzd29yZF9oYXNoX3dlYiI7czo2NDoiZmI1YjdkNGRjY2JhMTkwZWZmYmI4NDZjY2EwNWQzZjgwZTVmZGRiMDM2ZWY3ZGEwOTA1NzVhYTZjMjYzM2I2ZSI7fQ==',1790952887),('PetVvVZQPaQxZFSJFwSPzus1ha2NHkJ0vwzn10xJ',15,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiamVEUXhxZmdoV1hKQnV2d1Z6bTZCbVhoeG42Y3V0bFFDcWxqbTdsciI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbiI7czo1OiJyb3V0ZSI7czoxNToiYWRtaW4uZGFzaGJvYXJkIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTU7czoxNzoicGFzc3dvcmRfaGFzaF93ZWIiO3M6NjQ6ImNhZmM4NTgxM2Q2ZTViNTg2ZjY0NjA4Yzk2NGE1ZjU3ODRjZmI0ZjNiY2Y1ZmE0NjdlMTExYzk5MmJmNTExMzkiO30=',1790953130),('u29yGsuEYiuhdEWipIxyKo1jcXfjybdboEBZI6wE',18,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiWlRLakliWk9iSEN1TjIwaVlERlRIZXlSc0lSalpHYllDTnVqYk1EeCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9wcm9maWxlIjtzOjU6InJvdXRlIjtzOjE4OiJhZG1pbi5wcm9maWxlLmVkaXQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxODtzOjE3OiJwYXNzd29yZF9oYXNoX3dlYiI7czo2NDoiZTBkOWNhZTM1M2U5MzkxOTRiMWJiMGM4NDNjNjBmZTkwNTA1OGZkMzgyOTBkYTM0Yzg3ODg2ZmRiYWViZjg5NSI7fQ==',1790953174),('wBj5rkOq7QBpy0y3FphKu13PgTBAprT5jiz7DgJG',15,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiNzhmWFBIVFJGcUs1dmlxUlNIQm1yWmduUnFqdnhFTGdtaTVjU2loNSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9wcm9maWxlIjtzOjU6InJvdXRlIjtzOjE4OiJhZG1pbi5wcm9maWxlLmVkaXQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxNTtzOjE3OiJwYXNzd29yZF9oYXNoX3dlYiI7czo2NDoiY2FmYzg1ODEzZDZlNWI1ODZmNjQ2MDhjOTY0YTVmNTc4NGNmYjRmM2JjZjVmYTQ2N2UxMTFjOTkyYmY1MTEzOSI7fQ==',1790953122),('WD40AMZay2PXKd8w48NvSP0DumLsoFREuoihfxk0',1,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiYWxKUDZjcEhKcXhOVEo2cldWWTBEY1lYeU9UMHRMS2h0bjVEaVF1WiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzM6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi91c2VycyI7czo1OiJyb3V0ZSI7czoxNzoiYWRtaW4udXNlcnMuaW5kZXgiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxO3M6MTc6InBhc3N3b3JkX2hhc2hfd2ViIjtzOjY0OiI1MGFhMDNkNGIxY2I3YWNjZjQ3ZmYyNTQxYTVjNjgwMWY3ZjAxOWYzYzUzMGRiMWEzZjZlM2Q4ODhlNWM3MGNlIjt9',1790953181),('X9jBJvOXPAQWbjmB3OuAsY8JCoWBQOtSw48r7xWo',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTozOntzOjY6Il90b2tlbiI7czo0MDoiV0V0VjdMdXN1UTJQZ2hLdktLQXdiZGtyWExKQ2hyeFJTejRnampxSyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzM6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9sb2dpbiI7czo1OiJyb3V0ZSI7czoxMToiYWRtaW4ubG9naW4iO319',1790953179),('XTraqo0OjRaGATVnjdWxtLDdFZcDzvybz0pNi0WQ',10,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiVWZQQTFzRGREbDA1VjBubllxYzR5VXZnck5iMU0xcXpVS2RDcW9FSSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9wcm9maWxlIjtzOjU6InJvdXRlIjtzOjE4OiJhZG1pbi5wcm9maWxlLmVkaXQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxMDtzOjE3OiJwYXNzd29yZF9oYXNoX3dlYiI7czo2NDoiZmI1YjdkNGRjY2JhMTkwZWZmYmI4NDZjY2EwNWQzZjgwZTVmZGRiMDM2ZWY3ZGEwOTA1NzVhYTZjMjYzM2I2ZSI7fQ==',1790952895),('yf4O4d4VsCh1R5pBadUHZU0OJ2LBecPqYt1sO30V',9,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoieUpZZXMxM1U4MmZtNHltWTdDZ2c3NVZ0YjdQT0V6MElMQnFLTkRwUiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi9wcm9maWxlIjtzOjU6InJvdXRlIjtzOjE4OiJhZG1pbi5wcm9maWxlLmVkaXQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aTo5O3M6MTc6InBhc3N3b3JkX2hhc2hfd2ViIjtzOjY0OiI3YzQxODEzMTVkMzAxMGVmODVhNGM0YTEzN2RjNWQ0ZGY1ODc4ZjdjZmYxMmM1MjE2NmU5MmU4ZjA3ZGRmY2M5Ijt9',1790952887),('zciui30Gt1zOQLDmxw9yd1UlkLfmUopybjKQb9h9',1,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875','YTo1OntzOjY6Il90b2tlbiI7czo0MDoibXdreHBESUhlZWhZRWdxWUVjRndhcEtoZ01OQktMVE5oR3Zyb2JSaSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzM6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5Ni9hZG1pbi91c2VycyI7czo1OiJyb3V0ZSI7czoxNzoiYWRtaW4udXNlcnMuaW5kZXgiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxO3M6MTc6InBhc3N3b3JkX2hhc2hfd2ViIjtzOjY0OiI1MGFhMDNkNGIxY2I3YWNjZjQ3ZmYyNTQxYTVjNjgwMWY3ZjAxOWYzYzUzMGRiMWEzZjZlM2Q4ODhlNWM3MGNlIjt9',1790953130);
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
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Key/value site settings (org info, contact channels, SEO defaults, announcement bar)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'org.name','جمعية الشمال للتنمية والتطوير المجتمعي','string','org','Association name',1,1,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(2,'org.tagline','لإغاثة أهل غزة ودعم صمودهم','string','org','Tagline',1,2,'2026-09-30 21:09:43','2026-10-02 14:16:53'),(3,'org.license','HRSD-77492','string','org','License number',1,3,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(4,'org.website','https://shamal-society.org','url','org','Public website URL',1,4,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(5,'org.address','مكتب إغاثة غزة — القاهرة (تنسيق دخول المساعدات)','string','org','Coordination office address',1,5,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(6,'contact.email','info@shamal-society.org','email','contact','Public email',1,6,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(7,'contact.hotline','+20 100 774 9292','string','contact','Hotline phone',1,7,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(8,'contact.hotline_note','متاح 24/7','string','contact','Hotline availability note',1,8,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(9,'contact.whatsapp','201007749292','string','contact','WhatsApp number (digits only, for wa.me link)',1,9,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(10,'contact.email_response_note','الرد خلال ساعتين','string','contact','Email response time note',1,10,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(11,'contact.field_points','جباليا • الشاطئ • دير البلح • خان يونس','string','contact','Field points line in footer',1,11,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(12,'site.brand_color','#0C7845','color','general','Brand green',1,12,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(13,'site.locale','ar','string','general','Default language (site is Arabic only)',1,13,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(14,'site.direction','rtl','string','general','Text direction',1,14,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(15,'site.domain','shamal-society.org','string','general','Domain name',1,15,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(16,'seo.default_title','جمعية الشمال للتنمية والتطوير المجتمعي','string','seo','Default browser title',1,16,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(17,'seo.default_description','مؤسسة إنسانية تعمل على إغاثة أهل غزة: برامج إغاثية وإنشائية وتنموية وصحية وفق معايير الحوكمة والشفافية.','text','seo','Default meta description',1,17,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(18,'seo.title_suffix',' — جمعية الشمال للتنمية والتطوير المجتمعي','string','seo','Suffix added to page titles',1,18,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(19,'announcement_bar.visible','1','bool','announcement_bar','Show announcements bar',1,19,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(20,'announcement_bar.label','آخر الإعلانات','string','announcement_bar','Bar label',1,20,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(21,'footer.newsletter_title','النشرة البريدية','string','footer','Newsletter box title',1,21,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(22,'footer.newsletter_text','اشترك لتصلك تقارير الأثر من غزة والحملات الطارئة.','text','footer','Newsletter box text',1,22,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(23,'mail.notify_new_message','1','bool','notifications','Email admins on new contact message',0,23,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(24,'mail.digest_frequency','daily','string','notifications','Digest frequency: off | daily | weekly',0,24,'2026-09-30 21:09:43','2026-09-30 21:09:43'),(25,'org.logo','','string','org','logo',1,6,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(26,'org.favicon','','string','org','favicon',1,7,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(27,'site.timezone','Asia/Gaza','string','general','timezone',1,16,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(28,'site.date_format','long','string','general','dateFormat',1,17,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(29,'site.maintenance','0','bool','general','maintenance',1,18,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(30,'site.maintenance_message','نجري تحديثات لتحسين تجربتك، وسنعود خلال وقت قصير. شكراً لصبركم.','text','general','maintenanceMsg',1,19,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(31,'seo.title_template','%s — جمعية الشمال للتنمية والتطوير المجتمعي','string','seo','titleTpl',1,19,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(32,'seo.index','1','bool','seo','index',1,20,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(33,'seo.sitemap','1','bool','seo','sitemap',1,21,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(34,'seo.og_image','/assets/site/img/hero-poster.jpg','string','seo','ogImage',1,22,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(35,'seo.social','{\"facebook\":\"facebook.com/shamal.society\",\"x\":\"x.com/shamal_society\",\"instagram\":\"instagram.com/shamal.society\",\"youtube\":\"youtube.com/@shamalsociety\",\"telegram\":null,\"whatsapp\":\"wa.me/201007749292\"}','json','seo','social',1,23,'2026-10-02 14:12:08','2026-10-02 14:16:54'),(36,'seo.analytics_id','','string','seo','analyticsId',1,24,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(37,'seo.anonymize_ip','1','bool','seo','anonymizeIp',1,25,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(38,'seo.cookie_banner','1','bool','seo','cookieBanner',1,26,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(39,'mail.matrix','{\"donation_new\":{\"email\":true,\"app\":true,\"sms\":false},\"donation_big\":{\"email\":true,\"app\":true,\"sms\":true},\"message_new\":{\"email\":true,\"app\":true,\"sms\":false},\"volunteer\":{\"email\":false,\"app\":true,\"sms\":false},\"project_goal\":{\"email\":false,\"app\":true,\"sms\":false},\"project_urgent\":{\"email\":true,\"app\":true,\"sms\":false},\"news_scheduled\":{\"email\":false,\"app\":true,\"sms\":false},\"security_login\":{\"email\":true,\"app\":true,\"sms\":true},\"backup_done\":{\"email\":true,\"app\":false,\"sms\":false},\"weekly\":{\"email\":true,\"app\":false,\"sms\":false}}','json','notifications','matrix',0,25,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(40,'mail.quiet','1','bool','notifications','quiet',0,26,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(41,'mail.quiet_from','22:00','string','notifications','quietFrom',0,27,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(42,'mail.quiet_to','07:00','string','notifications','quietTo',0,28,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(43,'mail.digest_day','sun','string','notifications','digestDay',0,29,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(44,'mail.digest_email','admin@shamal-society.org','email','notifications','digestEmail',0,30,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(45,'admin.users','{\"matrix\":{\"admin\":{\"projects_view\":true,\"projects_edit\":true,\"news_publish\":true,\"pages_edit\":true,\"messages_reply\":true,\"donations_view\":true,\"reports_export\":true,\"users_manage\":true,\"settings_edit\":true,\"backup_run\":true},\"editor\":{\"projects_view\":true,\"projects_edit\":true,\"news_publish\":true,\"pages_edit\":true,\"messages_reply\":true,\"donations_view\":false,\"reports_export\":true,\"users_manage\":false,\"settings_edit\":false,\"backup_run\":false},\"writer\":{\"projects_view\":true,\"projects_edit\":false,\"news_publish\":true,\"pages_edit\":false,\"messages_reply\":true,\"donations_view\":false,\"reports_export\":false,\"users_manage\":false,\"settings_edit\":false,\"backup_run\":false},\"viewer\":{\"projects_view\":true,\"projects_edit\":false,\"news_publish\":false,\"pages_edit\":false,\"messages_reply\":false,\"donations_view\":true,\"reports_export\":false,\"users_manage\":false,\"settings_edit\":false,\"backup_run\":false}},\"custom\":[]}','json','admin','users',0,1,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(46,'admin.security','{\"minLength\":10,\"upper\":true,\"number\":true,\"symbol\":false,\"reuse\":5,\"expiry\":\"90\",\"lockout\":5,\"enforce2fa\":\"admins\",\"alertNewDevice\":true,\"alertFailed\":true,\"alertCountry\":true,\"timeout\":\"60\",\"ipAllow\":false,\"ips\":[\"203.0.113.0/24\",\"198.51.100.24\"]}','json','admin','security',0,2,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(47,'admin.backup','{\"schedule\":\"weekly\",\"time\":\"03:00\",\"keep\":10,\"incContent\":true,\"incSettings\":true,\"incMedia\":false,\"dest\":\"local\"}','json','admin','backup',0,3,'2026-10-02 14:12:08','2026-10-02 14:12:08'),(52,'admin.appearance','{\"theme\":\"light\",\"accent\":\"#f28c14\",\"scale\":\"sm\",\"density\":\"compact\",\"sidebar\":\"navy\",\"radius\":\"sharp\"}','json','admin','appearance',0,4,'2026-10-02 14:39:49','2026-10-02 14:39:49');
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Free tags for articles';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (1,'تقارير','تقارير','2026-10-02 14:14:19','2026-10-02 14:14:19'),(2,'مخابز','مخابز','2026-10-02 14:14:19','2026-10-02 14:14:19'),(3,'تنمية','تنمية','2026-10-02 14:14:19','2026-10-02 14:14:19'),(4,'كفالة','كفالة','2026-10-02 14:14:19','2026-10-02 14:14:19'),(5,'شفافية','شفافية','2026-10-02 14:14:19','2026-10-02 14:14:19'),(6,'شتاء','شتاء','2026-10-02 14:14:19','2026-10-02 14:14:19'),(7,'إيواء','إيواء','2026-10-02 14:14:19','2026-10-02 14:14:19'),(8,'صحة','صحة','2026-10-02 14:14:19','2026-10-02 14:14:19'),(9,'تعليم','تعليم','2026-10-02 14:14:19','2026-10-02 14:14:19'),(10,'قوافل','قوافل','2026-10-02 14:14:19','2026-10-02 14:14:19'),(11,'مياه','مياه','2026-10-02 14:14:19','2026-10-02 14:14:19');
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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Admin dashboard accounts (admin / editor)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'مدير المنصة','admin@shamal-society.org','2026-10-01 11:11:47','$2y$12$GR0kEePR8M5L3TbKcdXG2evi3kWyDbFhzCmItTP3Sx5LhOZeiM/4G','admin','active',NULL,'مسؤول النظام',NULL,'2026-10-02 15:13:09','8n9yufEFZM9lRyIimV7LDijP2YFBRQOIqtkcQXUm2I2Vl4zx0Rig05RWV97G','2026-09-30 21:09:43','2026-10-02 15:13:09',NULL);
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

-- Dump completed on 2026-10-02 18:19:46
