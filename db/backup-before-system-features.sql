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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-02 19:22:09
