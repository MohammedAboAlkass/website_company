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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `announcements_is_published_sort_order_index` (`is_published`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Items of the scrolling announcements bar (bar on/off + label live in settings)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
INSERT INTO `announcements` VALUES (1,'وصول قافلة طحين جديدة إلى مراكز الإيواء في دير البلح','#news',1,NULL,NULL,1,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(2,'فتح باب التسجيل في برامج التمكين والتنمية المجتمعية لعام 2026','#projects',1,NULL,NULL,2,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(3,'حملة الشتاء: توزيع خيام وأغطية في خان يونس ورفح','#activities',1,NULL,NULL,3,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(4,'تشغيل نقطة مياه شرب إضافية في شمال القطاع','#impact-map',1,NULL,NULL,4,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL),(5,'تقرير الأثر الربعي متاح قريباً في المركز الإعلامي','#news',1,NULL,NULL,5,'2026-09-30 21:09:43','2026-09-30 21:09:43',NULL);
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Dashboard roles (admin, manager, editor, writer, viewer + custom)';
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

-- Dump completed on 2026-10-02 18:45:46
