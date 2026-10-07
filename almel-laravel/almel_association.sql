-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 05, 2026 at 08:36 AM
-- Server version: 8.0.31
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `almel_association`
--
CREATE DATABASE IF NOT EXISTS `almel_association` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `almel_association`;

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
CREATE TABLE IF NOT EXISTS `activities` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `governorate_id` bigint UNSIGNED DEFAULT NULL,
  `project_id` bigint UNSIGNED DEFAULT NULL COMMENT 'Optional related project',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `badge_text` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Label on the image',
  `badge_tone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'forest | gold | mid',
  `image_media_id` bigint UNSIGNED DEFAULT NULL,
  `image_alt` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_label` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Free-text date shown on the card, e.g. Oct 2024',
  `activity_date` date DEFAULT NULL COMMENT 'Real date for sorting (optional)',
  `place` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Free-text place',
  `stat_label` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Key figure, e.g. 45,200 beneficiaries',
  `stat_icon` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link_label` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activities_governorate_id_index` (`governorate_id`),
  KEY `activities_project_id_index` (`project_id`),
  KEY `activities_image_media_id_index` (`image_media_id`),
  KEY `activities_is_published_sort_order_index` (`is_published`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Documented field activities (homepage section)';

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `governorate_id`, `project_id`, `title`, `description`, `badge_text`, `badge_tone`, `image_media_id`, `image_alt`, `date_label`, `activity_date`, `place`, `stat_label`, `stat_icon`, `link_label`, `link_url`, `is_published`, `sort_order`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, NULL, NULL, 'توزيع 10,000 طرد شتوي وأغطية عازلة', 'إيصال حزم الدفء لحماية أكثر من 45 ألف نازح من برد الخيام في جنوب القطاع.', 'حملة دفء غزة', 'forest', 5, 'قافلة إغاثة شتوية', 'نوفمبر - ديسمبر 2024', NULL, 'مخيمات النزوح في رفح', '45,200 مستفيد', 'group', 'تقرير الفيديو', '#gallery', 1, 1, '2026-09-30 21:09:43', '2026-10-02 15:54:31', NULL),
(2, NULL, NULL, 'تسيير 3 عيادات ميدانية وإجراء 320 تدخلاً', 'عيادات خيام للجروح والأطفال والتوليد، وصرف أدوية مزمنة، وتحويلات عاجلة داخل وسط القطاع.', 'البرنامج الصحي في غزة', 'gold', 4, 'قافلة طبية ميدانية', 'أكتوبر 2024', NULL, 'دير البلح', '8,400 كشف', 'medical_services', 'تحميل التوثيق', '#contact', 1, 2, '2026-09-30 21:09:43', '2026-10-02 15:54:31', NULL),
(3, NULL, NULL, 'افتتاح الخيمة التعليمية السادسة لأطفال غزة', 'احتفاء بعودة 210 طفلاً نازحاً إلى حلقات تعلّم مؤقتة في القراءة والحساب والدعم النفسي.', 'تعليم النازحين', 'mid', 6, 'تخريج دفعة تمكين مهني', 'سبتمبر 2024', NULL, 'خان يونس', '210 طالب نازح', 'school', 'قصص النجاح', '#news', 1, 4, '2026-09-30 21:09:43', '2026-10-02 15:54:31', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `text` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Anchor or URL opened by the item',
  `details` text COLLATE utf8mb4_unicode_ci COMMENT 'Optional rich text (sanitised HTML) with the announcement details',
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `starts_at` timestamp NULL DEFAULT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `announcements_is_published_sort_order_index` (`is_published`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Items of the scrolling announcements bar (bar on/off + label live in settings)';

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `text`, `link_url`, `details`, `is_published`, `starts_at`, `ends_at`, `sort_order`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'وصول قافلة طحين جديدة إلى مراكز الإيواء في دير البلح', '#news', NULL, 1, NULL, NULL, 1, '2026-09-30 21:09:43', '2026-09-30 21:09:43', NULL),
(2, 'فتح باب التسجيل في برامج التمكين والتنمية المجتمعية لعام 2026', '#projects', NULL, 1, NULL, NULL, 2, '2026-09-30 21:09:43', '2026-09-30 21:09:43', NULL),
(3, 'حملة الشتاء: توزيع خيام وأغطية في خان يونس ورفح', '#activities', NULL, 1, NULL, NULL, 3, '2026-09-30 21:09:43', '2026-09-30 21:09:43', NULL),
(4, 'تشغيل نقطة مياه شرب إضافية في شمال القطاع', '#impact-map', NULL, 1, NULL, NULL, 4, '2026-09-30 21:09:43', '2026-09-30 21:09:43', NULL),
(5, 'تقرير الأثر الربعي متاح قريباً في المركز الإعلامي', '#news', NULL, 1, NULL, NULL, 5, '2026-09-30 21:09:43', '2026-09-30 21:09:43', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `appeals`
--

DROP TABLE IF EXISTS `appeals`;
CREATE TABLE IF NOT EXISTS `appeals` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
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
  `image_media_id` bigint UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Show the card on the homepage (keep one active)',
  `starts_at` timestamp NULL DEFAULT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `appeals_image_media_id_index` (`image_media_id`),
  KEY `appeals_is_active_index` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Urgent relief appeal card on the homepage (content only, no payments)';

--
-- Dumping data for table `appeals`
--

INSERT INTO `appeals` (`id`, `flag_label`, `chip_label`, `kicker`, `title_line1`, `title_line2`, `description`, `primary_cta_text`, `primary_cta_url`, `secondary_cta_text`, `secondary_cta_url`, `image_media_id`, `is_active`, `starts_at`, `ends_at`, `created_at`, `updated_at`) VALUES
(1, 'نداء إغاثة عاجل', 'قوافل يومية من الشمال إلى رفح', 'حملة السلال والخيام والمياه', 'خبز اليوم يصل للخيمة..', 'وماؤك لا ينقطع عن النازحين', 'قوافل الطحين والخيام وصهاريج المياه تتحرك داخل القطاع كل يوم. مساهمتك تتحوّل إلى وجبة ساخنة، خيمة عازلة، وصهريج شرب لعائلات نزحت من بيوتها.', 'ساهم في إغاثة غزة الآن', '#contact', 'مبادرات الإغاثة المعتمدة', '#projects', 13, 1, NULL, NULL, '2026-09-30 21:09:43', '2026-09-30 21:09:43');

-- --------------------------------------------------------

--
-- Table structure for table `articles`
--

DROP TABLE IF EXISTS `articles`;
CREATE TABLE IF NOT EXISTS `articles` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `article_category_id` bigint UNSIGNED NOT NULL,
  `author_id` bigint UNSIGNED DEFAULT NULL COMMENT 'Admin user who wrote/uploaded it',
  `project_id` bigint UNSIGNED DEFAULT NULL COMMENT 'Optional related project',
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body` longtext COLLATE utf8mb4_unicode_ci COMMENT 'Article body (HTML from the rich text editor)',
  `highlights` json DEFAULT NULL COMMENT 'Array of short bullet strings',
  `cover_media_id` bigint UNSIGNED DEFAULT NULL,
  `cover_alt` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `byline` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Shown author, e.g. media team',
  `desk` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Source desk / office',
  `reference_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Press release reference, e.g. PR-2024-88',
  `badge_text` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `read_minutes` tinyint UNSIGNED DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft' COMMENT 'draft | scheduled | published',
  `published_at` timestamp NULL DEFAULT NULL COMMENT 'Publish date; future date + scheduled = auto publish',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `views_count` int UNSIGNED NOT NULL DEFAULT '0',
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
  KEY `articles_status_published_at_index` (`status`,`published_at`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='News articles / press statements (news.html, article.html)';

--
-- Dumping data for table `articles`
--

INSERT INTO `articles` (`id`, `article_category_id`, `author_id`, `project_id`, `slug`, `title`, `excerpt`, `body`, `highlights`, `cover_media_id`, `cover_alt`, `byline`, `desk`, `reference_code`, `badge_text`, `read_minutes`, `status`, `published_at`, `is_featured`, `views_count`, `seo_title`, `seo_description`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, NULL, NULL, 'report-88', 'نشر تقرير الإغاثة الدوري لغزة وتوسيع مخابز الطوارئ في الجنوب', 'أعلن الفريق الميداني إقفال دورة التوزيع بنسبة توثيق 98.4%، مع تشغيل ثلاثة مخابز إضافية لخدمة النازحين في خان يونس ورفح.', '<p>أعلن الفريق الميداني إقفال دورة التوزيع بنسبة توثيق 98.4%، مع تشغيل ثلاثة مخابز إضافية لخدمة النازحين في خان يونس ورفح.</p><h2>أبرز ما جاء في الخبر</h2><ul><li>نسبة توثيق دورة التوزيع: 98.4%</li><li>تشغيل ثلاثة مخابز إضافية لخدمة النازحين في خان يونس ورفح</li></ul>', '[\"نسبة توثيق دورة التوزيع: 98.4%\", \"تشغيل ثلاثة مخابز إضافية لخدمة النازحين في خان يونس ورفح\"]', 14, 'إحاطة إعلامية عن إغاثة غزة', 'فريق الإعلام', 'مكتب توثيق القطاع', 'PR-2024-88', 'بيان من غزة', 4, 'published', '2026-09-24 07:00:00', 1, 4839, NULL, 'أعلن الفريق الميداني إقفال دورة التوزيع بنسبة توثيق 98.4%، مع تشغيل ثلاثة مخابز إضافية لخدمة النازحين في خان يونس ورفح.', '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(2, 2, NULL, NULL, 'development-500', 'إطلاق برنامج التمكين المجتمعي لـ 500 مستفيد من شمال غزة وجباليا', 'يشمل البرنامج التدريب المهني والتعليم المؤقت ودعم الأسر بمصادر دخل داخل مراكز الإيواء.', '<p>يشمل البرنامج التدريب المهني والتعليم المؤقت ودعم الأسر بمصادر دخل داخل مراكز الإيواء.</p><h2>أبرز ما جاء في الخبر</h2><ul><li>500 مستفيد من شمال غزة وجباليا</li><li>يشمل البرنامج التدريب المهني والتعليم المؤقت ودعم الأسر</li><li>آخر موعد: 30 يناير 2025</li></ul>', '[\"500 مستفيد من شمال غزة وجباليا\", \"يشمل البرنامج التدريب المهني والتعليم المؤقت ودعم الأسر\", \"آخر موعد: 30 يناير 2025\"]', 1, 'أطفال يبتسمون في أحد مراكز الإيواء', 'فريق الإعلام', NULL, NULL, 'تنمية مجتمعية', NULL, 'published', '2026-09-19 07:00:00', 0, 3913, NULL, 'يشمل البرنامج التدريب المهني والتعليم المؤقت ودعم الأسر بمصادر دخل داخل مراكز الإيواء.', '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(3, 3, NULL, NULL, 'tracking-map', 'إطلاق خريطة تتبع السلال داخل قطاع غزة', 'منظومة تتيح لأي جهة داعمة متابعة وصول كل سلة غذائية إلى العائلة النازحة وتوثيقها بالصورة من الخيمة.', '<p>منظومة تتيح لأي جهة داعمة متابعة وصول كل سلة غذائية إلى العائلة النازحة وتوثيقها بالصورة من الخيمة.</p><h2>أبرز ما جاء في الخبر</h2><ul><li>متابعة وصول كل سلة غذائية إلى العائلة النازحة</li><li>توثيق التسليم بالصورة من الخيمة</li></ul>', '[\"متابعة وصول كل سلة غذائية إلى العائلة النازحة\", \"توثيق التسليم بالصورة من الخيمة\"]', 15, 'شاشة حاسوب لمتابعة التوزيع', 'محرر المحتوى #2', 'غرفة عمليات غزة', NULL, 'توثيق الميدان', NULL, 'published', '2026-09-12 07:00:00', 0, 2752, NULL, 'منظومة تتيح لأي جهة داعمة متابعة وصول كل سلة غذائية إلى العائلة النازحة وتوثيقها بالصورة من الخيمة.', '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(4, 4, NULL, NULL, 'winter-campaign', 'توزيع 10,000 طرد شتوي وأغطية عازلة', 'إيصال حزم الدفء لحماية أكثر من 45 ألف نازح من برد الخيام في جنوب القطاع.', '<p>إيصال حزم الدفء لحماية أكثر من 45 ألف نازح من برد الخيام في جنوب القطاع.</p><h2>أبرز ما جاء في الخبر</h2><ul><li>10,000 طرد شتوي وأغطية عازلة</li><li>45,200 مستفيد</li><li>مخيمات النزوح في رفح</li></ul>', '[\"10,000 طرد شتوي وأغطية عازلة\", \"45,200 مستفيد\", \"مخيمات النزوح في رفح\"]', 5, 'قافلة إغاثة شتوية', 'محرر المحتوى #2', NULL, NULL, 'حملة دفء غزة', NULL, 'published', '2026-10-05 07:00:00', 0, 0, NULL, 'إيصال حزم الدفء لحماية أكثر من 45 ألف نازح من برد الخيام في جنوب القطاع.', '2026-10-02 14:14:19', '2026-10-05 08:25:00', NULL),
(5, 4, NULL, NULL, 'field-clinics', 'تسيير 3 عيادات ميدانية وإجراء 320 تدخلاً', 'عيادات خيام للجروح والأطفال والتوليد، وصرف أدوية مزمنة، وتحويلات عاجلة داخل وسط القطاع.', '<p>عيادات خيام للجروح والأطفال والتوليد، وصرف أدوية مزمنة، وتحويلات عاجلة داخل وسط القطاع.</p><h2>أبرز ما جاء في الخبر</h2><ul><li>3 عيادات ميدانية</li><li>320 تدخلاً</li><li>8,400 كشف</li><li>دير البلح</li></ul>', '[\"3 عيادات ميدانية\", \"320 تدخلاً\", \"8,400 كشف\", \"دير البلح\"]', 4, 'قافلة طبية ميدانية', 'فريق الإعلام', NULL, NULL, 'البرنامج الصحي في غزة', NULL, 'published', '2026-09-03 07:00:00', 0, 1984, NULL, 'عيادات خيام للجروح والأطفال والتوليد، وصرف أدوية مزمنة، وتحويلات عاجلة داخل وسط القطاع.', '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(6, 2, NULL, NULL, 'learning-tent', 'افتتاح الخيمة التعليمية السادسة لأطفال غزة', 'احتفاء بعودة 210 طفلاً نازحاً إلى حلقات تعلّم مؤقتة في القراءة والحساب والدعم النفسي.', '<p>احتفاء بعودة 210 طفلاً نازحاً إلى حلقات تعلّم مؤقتة في القراءة والحساب والدعم النفسي.</p><h2>أبرز ما جاء في الخبر</h2><ul><li>الخيمة التعليمية السادسة</li><li>210 طالب نازح</li><li>خان يونس</li></ul>', '[\"الخيمة التعليمية السادسة\", \"210 طالب نازح\", \"خان يونس\"]', 6, 'تخريج دفعة تمكين مهني', 'فريق الإعلام', NULL, NULL, 'تعليم النازحين', NULL, 'published', '2026-08-27 07:00:00', 0, 2216, NULL, 'احتفاء بعودة 210 طفلاً نازحاً إلى حلقات تعلّم مؤقتة في القراءة والحساب والدعم النفسي.', '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(7, 3, NULL, NULL, 'flour-convoy', 'وصول قافلة طحين جديدة إلى مراكز الإيواء في دير البلح', 'نص تجريبي: يُستبدل بملخص الخبر الرسمي عند نشره من المكتب الإعلامي.', '<p>نص تجريبي: يُستبدل بملخص الخبر الرسمي عند نشره من المكتب الإعلامي.</p>', NULL, 13, 'قافلة إغاثة', 'منسق ميداني #3', NULL, NULL, 'توثيق الميدان', NULL, 'draft', '2026-09-27 07:00:00', 0, 0, NULL, 'نص تجريبي: يُستبدل بملخص الخبر الرسمي عند نشره من المكتب الإعلامي.', '2026-10-02 14:14:19', '2026-10-02 15:30:15', '2026-10-02 15:30:15'),
(8, 4, NULL, NULL, 'water-point', 'تشغيل نقطة مياه شرب إضافية في شمال القطاع', 'نص تجريبي: يُستبدل بملخص الخبر الرسمي عند نشره من المكتب الإعلامي.', '<p>نص تجريبي: يُستبدل بملخص الخبر الرسمي عند نشره من المكتب الإعلامي.</p>', NULL, 16, 'مياه شرب', 'محرر المحتوى #2', NULL, NULL, 'أنشطة ميدانية', NULL, 'draft', '2026-09-26 07:00:00', 0, 0, NULL, 'نص تجريبي: يُستبدل بملخص الخبر الرسمي عند نشره من المكتب الإعلامي.', '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(9, 1, NULL, NULL, 'quarterly-report', 'تقرير الأثر الربعي متاح قريباً في المركز الإعلامي1', 'نص تجريبي: يُستبدل بملخص التقرير عند نشره من المكتب الإعلامي.', '<p>نص تجريبي: يُستبدل بملخص التقرير عند نشره من المكتب الإعلامي.</p>', NULL, 17, 'انتظار الوجبات في مراكز الإيواء', 'فريق الإعلام', NULL, NULL, 'بيانات وتقارير', 1, 'published', '2026-10-02 19:44:52', 0, 2, NULL, 'نص تجريبي: يُستبدل بملخص التقرير عند نشره من المكتب الإعلامي.', '2026-10-02 14:14:19', '2026-10-02 19:44:52', NULL),
(22, 2, 1, NULL, 'منشور-تجريبي-من-محمد-الشنطي', 'منشور تجريبي من محمد الشنطي', 'معلومة تم تطوير مولد النصوص ليساعدك في الحصول على نص جاهز لملئ فراغات التصميم، حيث في بعض الأحيان تحتاج إلى وضع بعض النصوص في التصاميم كنصوص تجريبية يمكن استبدالها في نفس المساحة، هذه الآداة تمكنك من فعل ذلك. عن أدوات نف', '<div><div><div><div><div><div><div><div>\n</div>\n\n</div>\n        </div>\n    </div>\n        <div>\n        <div>\n            <div>\n                <div>\n                    <p> معلومة </p>\n                    \n                </div>\n                <hr>\n                <div>\n                    <h4>\n                        تم تطوير مولد النصوص ليساعدك في الحصول على نص جاهز لملئ فراغات التصميم، حيث في بعض الأحيان تحتاج إلى وضع بعض النصوص في التصاميم كنصوص تجريبية يمكن استبدالها في نفس المساحة، هذه الآداة تمكنك من فعل ذلك.\n                    </h4>\n                </div>\n            </div>\n        </div>\n    </div>\n    </div>\n                \n            </div>\n        </div>\n    </div>\n    <div>\n        <div>\n            <div>\n                <div>\n                    <div>\n                        <p>\n                             عن أدوات نفذلي\n                        </p></div></div></div></div></div><p><br></p>', NULL, 29, NULL, 'مدير المنصة', NULL, NULL, NULL, 1, 'published', '2026-10-02 15:28:39', 0, 5, NULL, 'يليسقلبسقب مسقمبق سمقبسق سقلبقب', '2026-10-02 15:28:39', '2026-10-02 15:28:39', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `article_categories`
--

DROP TABLE IF EXISTS `article_categories`;
CREATE TABLE IF NOT EXISTS `article_categories` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `article_categories_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='News categories: statements, development, field documentation, activities';

--
-- Dumping data for table `article_categories`
--

INSERT INTO `article_categories` (`id`, `slug`, `name`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'statements', 'بيانات وتقارير', 1, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(2, 'development', 'تنمية مجتمعية', 2, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(3, 'field', 'توثيق الميدان', 3, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(4, 'activities', 'أنشطة ميدانية', 4, '2026-09-30 21:09:43', '2026-09-30 21:09:43');

-- --------------------------------------------------------

--
-- Table structure for table `article_tag`
--

DROP TABLE IF EXISTS `article_tag`;
CREATE TABLE IF NOT EXISTS `article_tag` (
  `article_id` bigint UNSIGNED NOT NULL,
  `tag_id` bigint UNSIGNED NOT NULL,
  PRIMARY KEY (`article_id`,`tag_id`),
  KEY `article_tag_tag_id_index` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pivot: articles <-> tags (many to many)';

--
-- Dumping data for table `article_tag`
--

INSERT INTO `article_tag` (`article_id`, `tag_id`) VALUES
(1, 1),
(9, 1),
(1, 2),
(2, 3),
(6, 3),
(2, 4),
(3, 5),
(4, 6),
(4, 7),
(5, 8),
(6, 9),
(7, 10),
(8, 11),
(22, 14),
(22, 15);

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED DEFAULT NULL COMMENT 'Who did it (NULL = system / deleted user)',
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'created | updated | deleted | published | login | ...',
  `subject_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Affected model class',
  `subject_id` bigint UNSIGNED DEFAULT NULL COMMENT 'Affected row id',
  `subject_label` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Readable name of the affected record',
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Human readable line for the dashboard activity feed',
  `properties` json DEFAULT NULL COMMENT 'Old/new values snapshot',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_logs_user_id_index` (`user_id`),
  KEY `audit_logs_subject_type_subject_id_index` (`subject_type`,`subject_id`),
  KEY `audit_logs_created_at_index` (`created_at`),
  KEY `audit_logs_action_index` (`action`)
) ENGINE=InnoDB AUTO_INCREMENT=966 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Activity / audit trail of admin actions (insert-only)';

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `subject_type`, `subject_id`, `subject_label`, `description`, `properties`, `ip_address`, `user_agent`, `created_at`) VALUES
(33, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', '2026-10-02 14:12:08'),
(57, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 14:18:21'),
(84, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 14:25:58'),
(85, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: المظهر', '{\"section\": \"appearance\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', '2026-10-02 14:39:49'),
(86, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 14:52:40'),
(173, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 15:01:38'),
(183, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 15:13:09'),
(184, 1, 'media.upload', 'App\\Models\\MediaFile', 29, NULL, 'رفع صورة غلاف: WhatsApp Image 2026-09-16 at 10.00.23 AM.jpeg', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', '2026-10-02 15:26:13'),
(185, 1, 'article.create', 'App\\Models\\Article', 22, NULL, 'إضافة خبر: منشور تجريبي من محمد الشنطي', '{\"status\": \"published\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', '2026-10-02 15:28:39'),
(186, 1, 'article.delete', 'App\\Models\\Article', 7, NULL, 'حذف خبر: وصول قافلة طحين جديدة إلى مراكز الإيواء في دير البلح', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', '2026-10-02 15:30:15'),
(187, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 15:35:56'),
(188, 1, 'media.upload', 'App\\Models\\MediaFile', 31, NULL, 'رفع صورة مشروع: p1.png', NULL, '127.0.0.1', 'curl/8.21.0', '2026-10-02 15:36:05'),
(189, 1, 'media.upload', 'App\\Models\\MediaFile', 32, NULL, 'رفع صورة مشروع: p2.png', NULL, '127.0.0.1', 'curl/8.21.0', '2026-10-02 15:36:05'),
(196, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 15:36:34'),
(197, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 15:38:51'),
(198, 1, 'media.upload', 'App\\Models\\MediaFile', 33, NULL, 'رفع صورة مشروع: p1.png', NULL, '127.0.0.1', 'curl/8.21.0', '2026-10-02 15:38:58'),
(199, 1, 'media.upload', 'App\\Models\\MediaFile', 34, NULL, 'رفع صورة مشروع: p2.png', NULL, '127.0.0.1', 'curl/8.21.0', '2026-10-02 15:38:58'),
(206, 1, 'media.upload', 'App\\Models\\MediaFile', 35, NULL, 'رفع صورة قصة: p1.png', NULL, '127.0.0.1', 'curl/8.21.0', '2026-10-02 15:39:08'),
(214, 1, 'media.upload', 'App\\Models\\MediaFile', 36, NULL, 'رفع صورة نشاط: p1.png', NULL, '127.0.0.1', 'curl/8.21.0', '2026-10-02 15:39:16'),
(244, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'node', '2026-10-02 15:47:45'),
(245, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'node', '2026-10-02 15:48:46'),
(252, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'node', '2026-10-02 15:50:39'),
(253, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'node', '2026-10-02 15:52:16'),
(267, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'node', '2026-10-02 15:53:35'),
(268, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'node', '2026-10-02 15:54:04'),
(282, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 15:55:07'),
(292, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 15:56:12'),
(293, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 15:57:39'),
(330, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 15:59:04'),
(332, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 15:59:22'),
(335, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 16:02:07'),
(372, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 16:03:33'),
(415, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 16:06:47'),
(416, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 16:11:35'),
(417, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 16:26:49'),
(418, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 16:30:34'),
(419, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 16:32:00'),
(430, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 16:32:28'),
(435, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 16:34:40'),
(445, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 16:35:53'),
(446, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 16:35:59'),
(451, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 16:37:42'),
(459, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 16:38:43'),
(467, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 16:39:20'),
(470, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 16:40:17'),
(485, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 16:40:41'),
(494, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 16:42:17'),
(499, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 16:43:03'),
(505, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 16:43:44'),
(507, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 16:46:00'),
(512, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 16:48:04'),
(513, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 16:49:16'),
(514, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 16:50:13'),
(515, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 17:29:31'),
(516, 1, 'reports.export', NULL, NULL, NULL, 'صدّر تقريراً (CSV): آخر 30 يوماً', NULL, '127.0.0.1', 'curl/8.21.0', '2026-10-02 17:29:34'),
(517, 1, 'newsletter.export', NULL, NULL, NULL, 'صدّر قائمة مشتركي النشرة (CSV)', NULL, '127.0.0.1', 'curl/8.21.0', '2026-10-02 17:29:34'),
(518, 1, 'messages.handle', 'App\\Models\\ContactMessage', 6, NULL, 'علّم رسالة كمُتابَعة: TTEST Two', NULL, '127.0.0.1', 'curl/8.21.0', '2026-10-02 17:30:51'),
(519, 1, 'messages.delete', 'App\\Models\\ContactMessage', 7, NULL, 'حذف رسالة من: TTEST Three', NULL, '127.0.0.1', 'curl/8.21.0', '2026-10-02 17:30:52'),
(520, NULL, 'auth.login', 'App\\Models\\User', 42, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 17:31:30'),
(521, NULL, 'auth.login', 'App\\Models\\User', 43, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 17:31:32'),
(522, 1, 'newsletter.toggle', 'App\\Models\\NewsletterSubscriber', 1, NULL, 'تم إيقاف الاشتراك. ttest.nl1@example.com', NULL, '127.0.0.1', 'curl/8.21.0', '2026-10-02 17:32:40'),
(523, 1, 'newsletter.toggle', 'App\\Models\\NewsletterSubscriber', 1, NULL, 'تم إيقاف الاشتراك. ttest.nl1@example.com', NULL, '127.0.0.1', 'curl/8.21.0', '2026-10-02 17:32:41'),
(524, 1, 'newsletter.export', NULL, NULL, NULL, 'صدّر قائمة مشتركي النشرة (CSV)', NULL, '127.0.0.1', 'curl/8.21.0', '2026-10-02 17:32:41'),
(525, 1, 'newsletter.delete', NULL, NULL, NULL, 'حذف مشترك من النشرة: ttest.nl1@example.com', NULL, '127.0.0.1', 'curl/8.21.0', '2026-10-02 17:32:41'),
(526, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: الإعدادات العامة', '{\"section\": \"general\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 17:34:41'),
(527, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 17:40:00'),
(528, 1, 'auth.logout', 'App\\Models\\User', 1, NULL, 'تسجيل خروج من لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', '2026-10-02 19:06:04'),
(529, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', '2026-10-02 19:06:09'),
(530, 1, 'profile.update', 'App\\Models\\User', 1, NULL, 'تعديل الملف الشخصي', '{\"type\": \"users\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', '2026-10-02 19:06:36'),
(531, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:18:12'),
(532, NULL, 'auth.login', 'App\\Models\\User', 44, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:18:13'),
(533, NULL, 'auth.login', 'App\\Models\\User', 45, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:18:14'),
(534, NULL, 'auth.login', 'App\\Models\\User', 46, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:18:15'),
(535, NULL, 'auth.login', 'App\\Models\\User', 47, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:18:16'),
(536, NULL, 'article.create', 'App\\Models\\Article', 28, NULL, 'إضافة خبر: TTEST draft article for notifications', '{\"status\": \"draft\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:19:54'),
(537, NULL, 'article.create', 'App\\Models\\Article', 29, NULL, 'إضافة خبر: TTEST published article for notifications', '{\"status\": \"published\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:19:56'),
(538, 1, 'user.create', 'App\\Models\\User', 48, NULL, 'إضافة مستخدم: ttest.newperson@example.com', '{\"role\": \"viewer\", \"type\": \"users\", \"status\": \"active\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:19:57'),
(539, NULL, 'auth.login_failed', NULL, NULL, NULL, 'محاولة دخول فاشلة', '{\"type\": \"security\", \"email\": \"ttest.nobody@example.com\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:20:18'),
(540, NULL, 'auth.login_failed', NULL, NULL, NULL, 'محاولة دخول فاشلة', '{\"type\": \"security\", \"email\": \"ttest.nobody@example.com\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:20:20'),
(541, NULL, 'auth.login_failed', NULL, NULL, NULL, 'محاولة دخول فاشلة', '{\"type\": \"security\", \"email\": \"ttest.nobody@example.com\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:20:21'),
(542, NULL, 'auth.login_failed', NULL, NULL, NULL, 'محاولة دخول فاشلة', '{\"type\": \"security\", \"email\": \"ttest.nobody@example.com\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:20:23'),
(543, NULL, 'auth.login_failed', NULL, NULL, NULL, 'محاولة دخول فاشلة', '{\"type\": \"security\", \"email\": \"ttest.nobody@example.com\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:20:24'),
(544, 1, 'backup.export', 'App\\Models\\BackupRun', 6, NULL, 'إنشاء نسخة احتياطية (settings)', '{\"file\": \"almel-backup-20261002-222050-qdmz.json\", \"rows\": 167}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:20:50'),
(545, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: الإشعارات', '{\"section\": \"notifications\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:20:51'),
(546, 1, 'backup.export', 'App\\Models\\BackupRun', 7, NULL, 'إنشاء نسخة احتياطية (settings)', '{\"file\": \"almel-backup-20261002-222052-mneh.json\", \"rows\": 167}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:20:52'),
(547, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: الإشعارات', '{\"section\": \"notifications\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:21:17'),
(548, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: الإشعارات', '{\"section\": \"notifications\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:21:19'),
(551, 1, 'maintenance.update', NULL, NULL, NULL, 'تفعيل وضع الصيانة', '{\"ips\": 0, \"from\": null, \"until\": null, \"enabled\": true}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:21:50'),
(552, 1, 'maintenance.update', NULL, NULL, NULL, 'إيقاف وضع الصيانة', '{\"ips\": 0, \"from\": null, \"until\": null, \"enabled\": false}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:21:51'),
(553, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: الإعدادات العامة', '{\"section\": \"general\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:21:52'),
(554, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: الإعدادات العامة', '{\"section\": \"general\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:21:53'),
(555, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: الإعدادات العامة', '{\"section\": \"general\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:21:54'),
(560, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 19:29:21'),
(606, 1, 'reports.export', NULL, NULL, NULL, 'صدّر تقريراً (CSV): آخر 30 يوماً', NULL, '127.0.0.1', '', '2026-10-02 19:37:03'),
(607, 1, 'newsletter.export', NULL, NULL, NULL, 'صدّر قائمة مشتركي النشرة (CSV)', NULL, '127.0.0.1', '', '2026-10-02 19:37:03'),
(614, 1, 'article.update', 'App\\Models\\Article', 9, NULL, 'تعديل خبر: تقرير الأثر الربعي متاح قريباً في المركز الإعلامي1', '{\"status\": \"draft\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', '2026-10-02 19:44:44'),
(615, 1, 'article.update', 'App\\Models\\Article', 9, NULL, 'تعديل خبر: تقرير الأثر الربعي متاح قريباً في المركز الإعلامي1', '{\"status\": \"draft\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', '2026-10-02 19:44:47'),
(616, 1, 'article.update', 'App\\Models\\Article', 9, NULL, 'تعديل خبر: تقرير الأثر الربعي متاح قريباً في المركز الإعلامي1', '{\"status\": \"published\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0', '2026-10-02 19:44:53'),
(620, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'QA-Audit/1.0', '2026-10-02 19:49:08'),
(621, 1, 'auth.login_failed', 'App\\Models\\User', 1, NULL, 'محاولة دخول فاشلة', '{\"type\": \"security\", \"email\": \"admin@shamal-society.org\"}', '127.0.0.1', 'QA-Audit/1.0', '2026-10-02 19:49:09'),
(622, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:49:42'),
(623, 1, 'user.create', 'App\\Models\\User', 52, NULL, 'إضافة مستخدم: ttest4.user@example.com', '{\"role\": \"viewer\", \"type\": \"users\", \"status\": \"active\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:50:47'),
(624, 1, 'messages.delete', 'App\\Models\\ContactMessage', 18, NULL, 'حذف رسالة من: TTEST4 confirm', NULL, '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:52:03'),
(625, 1, 'newsletter.delete', NULL, NULL, NULL, 'حذف مشترك من النشرة: ttest4sub@example.com', NULL, '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:52:03'),
(626, 1, 'user.delete', 'App\\Models\\User', 52, NULL, 'حذف مستخدم: ttest4.user@example.com', '{\"type\": \"users\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-02 19:52:04'),
(627, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 19:53:34'),
(733, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 's6-test', '2026-10-02 21:09:21'),
(734, 1, 'newsletter.export', NULL, NULL, NULL, 'صدّر قائمة مشتركي النشرة (CSV)', NULL, '127.0.0.1', 's6-test', '2026-10-02 21:09:34'),
(735, 1, 'reports.export', NULL, NULL, NULL, 'صدّر تقريراً (CSV): آخر 30 يوماً', NULL, '127.0.0.1', 's6-test', '2026-10-02 21:09:37'),
(736, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 's6-test', '2026-10-02 21:10:19'),
(737, 1, 'newsletter.export', NULL, NULL, NULL, 'صدّر قائمة مشتركي النشرة (CSV)', NULL, '127.0.0.1', 's6-test', '2026-10-02 21:10:35'),
(738, 1, 'reports.export', NULL, NULL, NULL, 'صدّر تقريراً (CSV): آخر 30 يوماً', NULL, '127.0.0.1', 's6-test', '2026-10-02 21:10:38'),
(739, 1, 'newsletter.export', NULL, NULL, NULL, 'صدّر قائمة مشتركي النشرة (CSV)', NULL, '127.0.0.1', 's6-test', '2026-10-02 21:10:51'),
(740, 1, 'reports.export', NULL, NULL, NULL, 'صدّر تقريراً (CSV): آخر 30 يوماً', NULL, '127.0.0.1', 's6-test', '2026-10-02 21:10:55'),
(741, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 's6-test', '2026-10-02 21:11:44'),
(742, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/154.0.0.0 Safari/537.36', '2026-10-02 21:20:58'),
(745, 1, 'auth.login', 'App\\Models\\User', 1, NULL, 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 's6-test', '2026-10-02 21:24:00'),
(771, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 's6-test', '2026-10-02 21:25:50'),
(777, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 's6-test', '2026-10-02 21:25:53'),
(778, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 's6-test', '2026-10-02 21:26:06'),
(779, 1, 'newsletter.export', NULL, NULL, NULL, 'صدّر قائمة مشتركي النشرة (CSV)', NULL, '127.0.0.1', 's6-test', '2026-10-02 21:26:07'),
(780, 1, 'reports.export', NULL, NULL, NULL, 'صدّر تقريراً (CSV): آخر 30 يوماً', NULL, '127.0.0.1', 's6-test', '2026-10-02 21:26:07'),
(781, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 's6-test', '2026-10-02 21:28:05'),
(782, 1, 'backup.export', 'App\\Models\\BackupRun', 10, NULL, 'إنشاء نسخة احتياطية (content، settings)', '{\"file\": \"almel-backup-20261003-002805-ggdt.json\", \"rows\": 354, \"changes\": {\"kind\": {\"new\": \"export\", \"old\": null}, \"note\": {\"new\": \"s6 test\", \"old\": null}, \"scope\": {\"new\": \"[\\\"content\\\",\\\"settings\\\"]\", \"old\": null}, \"status\": {\"new\": \"ok\", \"old\": null}, \"user_id\": {\"new\": 1, \"old\": null}, \"checksum\": {\"new\": \"14debac434391efa24a17f617b5a239d0f8dc7cac7013d8590473425a26e8ed9\", \"old\": null}, \"filename\": {\"new\": \"almel-backup-20261003-002805-ggdt.json\", \"old\": null}, \"rows_count\": {\"new\": 354, \"old\": null}, \"size_bytes\": {\"new\": 79648, \"old\": null}, \"tables_count\": {\"new\": 29, \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-02 21:28:05'),
(783, 1, 'backup.download', 'App\\Models\\BackupRun', 10, NULL, 'تنزيل نسخة احتياطية', '{\"file\": \"almel-backup-20261003-002805-ggdt.json\"}', '127.0.0.1', 's6-test', '2026-10-02 21:28:05'),
(784, 1, 'backup.restore_denied', NULL, NULL, NULL, 'رُفضت استعادة نسخة احتياطية: كلمة المرور غير صحيحة', '{\"type\": \"security\"}', '127.0.0.1', 's6-test', '2026-10-02 21:28:10'),
(785, 1, 'backup.restore', 'App\\Models\\BackupRun', 12, NULL, 'استعادة نسخة احتياطية (content)', '{\"rows\": 14, \"safety\": \"almel-backup-20261003-002811-1z6a.json\", \"changes\": {\"kind\": {\"new\": \"import\", \"old\": null}, \"note\": {\"new\": \"نسخة الأمان: almel-backup-20261003-002811-1z6a.json\", \"old\": null}, \"scope\": {\"new\": \"[\\\"content\\\"]\", \"old\": null}, \"status\": {\"new\": \"ok\", \"old\": null}, \"user_id\": {\"new\": 1, \"old\": null}, \"checksum\": {\"new\": \"4859c72fc9e136f0c6dc4fb6ac7867037de0e73ffa2156f19848d5036ed1f9dd\", \"old\": null}, \"rows_count\": {\"new\": 14, \"old\": null}, \"tables_count\": {\"new\": 1, \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-02 21:28:11'),
(786, 1, 'backup.restore', 'App\\Models\\BackupRun', 14, NULL, 'استعادة نسخة احتياطية (content)', '{\"rows\": 13, \"safety\": \"almel-backup-20261003-002812-3zvl.json\", \"changes\": {\"kind\": {\"new\": \"import\", \"old\": null}, \"note\": {\"new\": \"نسخة الأمان: almel-backup-20261003-002812-3zvl.json\", \"old\": null}, \"scope\": {\"new\": \"[\\\"content\\\"]\", \"old\": null}, \"status\": {\"new\": \"ok\", \"old\": null}, \"user_id\": {\"new\": 1, \"old\": null}, \"checksum\": {\"new\": \"3d6486cff29efc96f2f448d6a22bc353630a6895f25e8b498b8bbdf9127f8906\", \"old\": null}, \"rows_count\": {\"new\": 13, \"old\": null}, \"tables_count\": {\"new\": 1, \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-02 21:28:12'),
(793, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 's6-test', '2026-10-02 21:30:19'),
(794, 1, 'media.upload', 'App\\Models\\MediaFile', 65, 'up-trailing', 'رفع صورة من المحرر: up-trailing.jpg', '{\"changes\": {\"disk\": {\"new\": \"public\", \"old\": null}, \"path\": {\"new\": \"uploads/2026/10/22WPLya2k43M03mSTG73ic1v.jpg\", \"old\": null}, \"title\": {\"new\": \"up-trailing\", \"old\": null}, \"width\": {\"new\": 40, \"old\": null}, \"height\": {\"new\": 20, \"old\": null}, \"alt_text\": {\"new\": \"s6 test\", \"old\": null}, \"mime_type\": {\"new\": \"image/jpeg\", \"old\": null}, \"size_bytes\": {\"new\": 821, \"old\": null}, \"uploaded_by\": {\"new\": 1, \"old\": null}, \"original_name\": {\"new\": \"up-trailing.jpg\", \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-02 21:30:19'),
(795, 1, 'media.upload', 'App\\Models\\MediaFile', 66, 'up-com', 'رفع صورة من المحرر: up-com.jpg', '{\"changes\": {\"disk\": {\"new\": \"public\", \"old\": null}, \"path\": {\"new\": \"uploads/2026/10/DIbQCeohutBl5fBco6UnkAi3.jpg\", \"old\": null}, \"title\": {\"new\": \"up-com\", \"old\": null}, \"width\": {\"new\": 40, \"old\": null}, \"height\": {\"new\": 20, \"old\": null}, \"alt_text\": {\"new\": \"s6 test\", \"old\": null}, \"mime_type\": {\"new\": \"image/jpeg\", \"old\": null}, \"size_bytes\": {\"new\": 821, \"old\": null}, \"uploaded_by\": {\"new\": 1, \"old\": null}, \"original_name\": {\"new\": \"up-com.jpg\", \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-02 21:30:19'),
(796, 1, 'media.upload', 'App\\Models\\MediaFile', 67, 'up', 'رفع صورة من المحرر: up.png', '{\"changes\": {\"disk\": {\"new\": \"public\", \"old\": null}, \"path\": {\"new\": \"uploads/2026/10/xpgDNwGOYFnfUAZ71RvVLpe5.png\", \"old\": null}, \"title\": {\"new\": \"up\", \"old\": null}, \"width\": {\"new\": 40, \"old\": null}, \"height\": {\"new\": 20, \"old\": null}, \"alt_text\": {\"new\": \"s6 test\", \"old\": null}, \"mime_type\": {\"new\": \"image/png\", \"old\": null}, \"size_bytes\": {\"new\": 149, \"old\": null}, \"uploaded_by\": {\"new\": 1, \"old\": null}, \"original_name\": {\"new\": \"up.png\", \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-02 21:30:19'),
(797, 1, 'media.upload', 'App\\Models\\MediaFile', 68, 'up', 'رفع صورة من المحرر: up.gif', '{\"changes\": {\"disk\": {\"new\": \"public\", \"old\": null}, \"path\": {\"new\": \"uploads/2026/10/fwT9v7RiwF6wQ56ddjhYFzvM.gif\", \"old\": null}, \"title\": {\"new\": \"up\", \"old\": null}, \"width\": {\"new\": 40, \"old\": null}, \"height\": {\"new\": 20, \"old\": null}, \"alt_text\": {\"new\": \"s6 test\", \"old\": null}, \"mime_type\": {\"new\": \"image/gif\", \"old\": null}, \"size_bytes\": {\"new\": 77, \"old\": null}, \"uploaded_by\": {\"new\": 1, \"old\": null}, \"original_name\": {\"new\": \"up.gif\", \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-02 21:30:19'),
(798, 1, 'media.upload', 'App\\Models\\MediaFile', 69, 'up', 'رفع صورة من المحرر: up.webp', '{\"changes\": {\"disk\": {\"new\": \"public\", \"old\": null}, \"path\": {\"new\": \"uploads/2026/10/rPv8XobG3t8UE8pgXGiSsD2c.webp\", \"old\": null}, \"title\": {\"new\": \"up\", \"old\": null}, \"width\": {\"new\": 40, \"old\": null}, \"height\": {\"new\": 20, \"old\": null}, \"alt_text\": {\"new\": \"s6 test\", \"old\": null}, \"mime_type\": {\"new\": \"image/webp\", \"old\": null}, \"size_bytes\": {\"new\": 180, \"old\": null}, \"uploaded_by\": {\"new\": 1, \"old\": null}, \"original_name\": {\"new\": \"up.webp\", \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-02 21:30:19'),
(799, 1, 'media.upload', 'App\\Models\\MediaFile', 70, 'up-exif', 'رفع صورة من المحرر: up-exif.jpg', '{\"changes\": {\"disk\": {\"new\": \"public\", \"old\": null}, \"path\": {\"new\": \"uploads/2026/10/MtAsEAMENME17OoztyUG8f1m.jpg\", \"old\": null}, \"title\": {\"new\": \"up-exif\", \"old\": null}, \"width\": {\"new\": 20, \"old\": null}, \"height\": {\"new\": 40, \"old\": null}, \"alt_text\": {\"new\": \"s6 test\", \"old\": null}, \"mime_type\": {\"new\": \"image/jpeg\", \"old\": null}, \"size_bytes\": {\"new\": 854, \"old\": null}, \"uploaded_by\": {\"new\": 1, \"old\": null}, \"original_name\": {\"new\": \"up-exif.jpg\", \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-02 21:30:20'),
(808, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 's6-test', '2026-10-02 21:32:17'),
(809, 1, 'media.upload', 'App\\Models\\MediaFile', 75, 'up-trailing', 'رفع صورة من المحرر: up-trailing.jpg', '{\"changes\": {\"disk\": {\"new\": \"public\", \"old\": null}, \"path\": {\"new\": \"uploads/2026/10/MccwEdhsWUJQGA9FwgE6fY8c.jpg\", \"old\": null}, \"title\": {\"new\": \"up-trailing\", \"old\": null}, \"width\": {\"new\": 40, \"old\": null}, \"height\": {\"new\": 20, \"old\": null}, \"alt_text\": {\"new\": \"s6 test\", \"old\": null}, \"mime_type\": {\"new\": \"image/jpeg\", \"old\": null}, \"size_bytes\": {\"new\": 821, \"old\": null}, \"uploaded_by\": {\"new\": 1, \"old\": null}, \"original_name\": {\"new\": \"up-trailing.jpg\", \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-02 21:32:17'),
(810, 1, 'media.upload', 'App\\Models\\MediaFile', 76, 'up-com', 'رفع صورة من المحرر: up-com.jpg', '{\"changes\": {\"disk\": {\"new\": \"public\", \"old\": null}, \"path\": {\"new\": \"uploads/2026/10/X9YEWpcHcwnreBTqly1bo6HR.jpg\", \"old\": null}, \"title\": {\"new\": \"up-com\", \"old\": null}, \"width\": {\"new\": 40, \"old\": null}, \"height\": {\"new\": 20, \"old\": null}, \"alt_text\": {\"new\": \"s6 test\", \"old\": null}, \"mime_type\": {\"new\": \"image/jpeg\", \"old\": null}, \"size_bytes\": {\"new\": 821, \"old\": null}, \"uploaded_by\": {\"new\": 1, \"old\": null}, \"original_name\": {\"new\": \"up-com.jpg\", \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-02 21:32:18'),
(811, 1, 'media.upload', 'App\\Models\\MediaFile', 77, 'up', 'رفع صورة من المحرر: up.png', '{\"changes\": {\"disk\": {\"new\": \"public\", \"old\": null}, \"path\": {\"new\": \"uploads/2026/10/evB37MPMr78sBNckr5CQRShe.png\", \"old\": null}, \"title\": {\"new\": \"up\", \"old\": null}, \"width\": {\"new\": 40, \"old\": null}, \"height\": {\"new\": 20, \"old\": null}, \"alt_text\": {\"new\": \"s6 test\", \"old\": null}, \"mime_type\": {\"new\": \"image/png\", \"old\": null}, \"size_bytes\": {\"new\": 149, \"old\": null}, \"uploaded_by\": {\"new\": 1, \"old\": null}, \"original_name\": {\"new\": \"up.png\", \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-02 21:32:18'),
(812, 1, 'media.upload', 'App\\Models\\MediaFile', 78, 'up', 'رفع صورة من المحرر: up.gif', '{\"changes\": {\"disk\": {\"new\": \"public\", \"old\": null}, \"path\": {\"new\": \"uploads/2026/10/zrb7RyeSQSGQH57uhvgPTIQX.gif\", \"old\": null}, \"title\": {\"new\": \"up\", \"old\": null}, \"width\": {\"new\": 40, \"old\": null}, \"height\": {\"new\": 20, \"old\": null}, \"alt_text\": {\"new\": \"s6 test\", \"old\": null}, \"mime_type\": {\"new\": \"image/gif\", \"old\": null}, \"size_bytes\": {\"new\": 77, \"old\": null}, \"uploaded_by\": {\"new\": 1, \"old\": null}, \"original_name\": {\"new\": \"up.gif\", \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-02 21:32:18'),
(813, 1, 'media.upload', 'App\\Models\\MediaFile', 79, 'up', 'رفع صورة من المحرر: up.webp', '{\"changes\": {\"disk\": {\"new\": \"public\", \"old\": null}, \"path\": {\"new\": \"uploads/2026/10/Zf70ExkkJ8BX03OJlQ0d9oPK.webp\", \"old\": null}, \"title\": {\"new\": \"up\", \"old\": null}, \"width\": {\"new\": 40, \"old\": null}, \"height\": {\"new\": 20, \"old\": null}, \"alt_text\": {\"new\": \"s6 test\", \"old\": null}, \"mime_type\": {\"new\": \"image/webp\", \"old\": null}, \"size_bytes\": {\"new\": 180, \"old\": null}, \"uploaded_by\": {\"new\": 1, \"old\": null}, \"original_name\": {\"new\": \"up.webp\", \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-02 21:32:18'),
(814, 1, 'media.upload', 'App\\Models\\MediaFile', 80, 'up-exif', 'رفع صورة من المحرر: up-exif.jpg', '{\"changes\": {\"disk\": {\"new\": \"public\", \"old\": null}, \"path\": {\"new\": \"uploads/2026/10/1pQJXmETWa59vuzzsHgV3LRg.jpg\", \"old\": null}, \"title\": {\"new\": \"up-exif\", \"old\": null}, \"width\": {\"new\": 20, \"old\": null}, \"height\": {\"new\": 40, \"old\": null}, \"alt_text\": {\"new\": \"s6 test\", \"old\": null}, \"mime_type\": {\"new\": \"image/jpeg\", \"old\": null}, \"size_bytes\": {\"new\": 854, \"old\": null}, \"uploaded_by\": {\"new\": 1, \"old\": null}, \"original_name\": {\"new\": \"up-exif.jpg\", \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-02 21:32:18'),
(860, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-02 21:43:30'),
(861, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 's6-test', '2026-10-03 06:32:52'),
(862, 1, 'audit.export', NULL, NULL, NULL, 'صدّر سجل العمليات (CSV)', '{\"type\": \"security\"}', '127.0.0.1', 's6-test', '2026-10-03 06:33:00'),
(863, 1, 'newsletter.export', NULL, NULL, NULL, 'صدّر قائمة مشتركي النشرة (CSV)', NULL, '127.0.0.1', 's6-test', '2026-10-03 06:33:21'),
(864, 1, 'reports.export', NULL, NULL, NULL, 'صدّر تقريراً (CSV): آخر 30 يوماً', NULL, '127.0.0.1', 's6-test', '2026-10-03 06:33:31'),
(865, 1, 'audit.export', NULL, NULL, NULL, 'صدّر سجل العمليات (CSV)', '{\"type\": \"security\"}', '127.0.0.1', 's6-test', '2026-10-03 06:33:50'),
(866, 1, 'newsletter.export', NULL, NULL, NULL, 'صدّر قائمة مشتركي النشرة (CSV)', NULL, '127.0.0.1', 's6-test', '2026-10-03 06:34:10'),
(867, 1, 'reports.export', NULL, NULL, NULL, 'صدّر تقريراً (CSV): آخر 30 يوماً', NULL, '127.0.0.1', 's6-test', '2026-10-03 06:34:19'),
(868, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 's6-test', '2026-10-03 06:34:57'),
(869, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/154.0.0.0 Safari/537.36', '2026-10-03 06:35:32'),
(870, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 's6-test', '2026-10-03 06:38:04'),
(871, 1, 'media.upload', 'App\\Models\\MediaFile', 83, 'up-trailing', 'رفع صورة من المحرر: up-trailing.jpg', '{\"changes\": {\"disk\": {\"new\": \"public\", \"old\": null}, \"path\": {\"new\": \"uploads/2026/10/qfSRjbD4LXBiCtYiIf1tcdFf.jpg\", \"old\": null}, \"title\": {\"new\": \"up-trailing\", \"old\": null}, \"width\": {\"new\": 40, \"old\": null}, \"height\": {\"new\": 20, \"old\": null}, \"alt_text\": {\"new\": \"s6 test\", \"old\": null}, \"mime_type\": {\"new\": \"image/jpeg\", \"old\": null}, \"size_bytes\": {\"new\": 821, \"old\": null}, \"uploaded_by\": {\"new\": 1, \"old\": null}, \"original_name\": {\"new\": \"up-trailing.jpg\", \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-03 06:38:06'),
(872, 1, 'media.upload', 'App\\Models\\MediaFile', 84, 'up-com', 'رفع صورة من المحرر: up-com.jpg', '{\"changes\": {\"disk\": {\"new\": \"public\", \"old\": null}, \"path\": {\"new\": \"uploads/2026/10/oGYtKqHuypwW81Cd6CLVAyxu.jpg\", \"old\": null}, \"title\": {\"new\": \"up-com\", \"old\": null}, \"width\": {\"new\": 40, \"old\": null}, \"height\": {\"new\": 20, \"old\": null}, \"alt_text\": {\"new\": \"s6 test\", \"old\": null}, \"mime_type\": {\"new\": \"image/jpeg\", \"old\": null}, \"size_bytes\": {\"new\": 821, \"old\": null}, \"uploaded_by\": {\"new\": 1, \"old\": null}, \"original_name\": {\"new\": \"up-com.jpg\", \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-03 06:38:06'),
(873, 1, 'media.upload', 'App\\Models\\MediaFile', 85, 'up', 'رفع صورة من المحرر: up.png', '{\"changes\": {\"disk\": {\"new\": \"public\", \"old\": null}, \"path\": {\"new\": \"uploads/2026/10/5MpMu9rN3cgQvP1MYX2Z7WYa.png\", \"old\": null}, \"title\": {\"new\": \"up\", \"old\": null}, \"width\": {\"new\": 40, \"old\": null}, \"height\": {\"new\": 20, \"old\": null}, \"alt_text\": {\"new\": \"s6 test\", \"old\": null}, \"mime_type\": {\"new\": \"image/png\", \"old\": null}, \"size_bytes\": {\"new\": 149, \"old\": null}, \"uploaded_by\": {\"new\": 1, \"old\": null}, \"original_name\": {\"new\": \"up.png\", \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-03 06:38:07'),
(874, 1, 'media.upload', 'App\\Models\\MediaFile', 86, 'up', 'رفع صورة من المحرر: up.gif', '{\"changes\": {\"disk\": {\"new\": \"public\", \"old\": null}, \"path\": {\"new\": \"uploads/2026/10/9VvyC6Qq5TOsAs6mQqdyqCoO.gif\", \"old\": null}, \"title\": {\"new\": \"up\", \"old\": null}, \"width\": {\"new\": 40, \"old\": null}, \"height\": {\"new\": 20, \"old\": null}, \"alt_text\": {\"new\": \"s6 test\", \"old\": null}, \"mime_type\": {\"new\": \"image/gif\", \"old\": null}, \"size_bytes\": {\"new\": 77, \"old\": null}, \"uploaded_by\": {\"new\": 1, \"old\": null}, \"original_name\": {\"new\": \"up.gif\", \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-03 06:38:07'),
(875, 1, 'media.upload', 'App\\Models\\MediaFile', 87, 'up', 'رفع صورة من المحرر: up.webp', '{\"changes\": {\"disk\": {\"new\": \"public\", \"old\": null}, \"path\": {\"new\": \"uploads/2026/10/vogirzmjVCmFKfeHJvEGXM7w.webp\", \"old\": null}, \"title\": {\"new\": \"up\", \"old\": null}, \"width\": {\"new\": 40, \"old\": null}, \"height\": {\"new\": 20, \"old\": null}, \"alt_text\": {\"new\": \"s6 test\", \"old\": null}, \"mime_type\": {\"new\": \"image/webp\", \"old\": null}, \"size_bytes\": {\"new\": 180, \"old\": null}, \"uploaded_by\": {\"new\": 1, \"old\": null}, \"original_name\": {\"new\": \"up.webp\", \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-03 06:38:08'),
(876, 1, 'media.upload', 'App\\Models\\MediaFile', 88, 'up-exif', 'رفع صورة من المحرر: up-exif.jpg', '{\"changes\": {\"disk\": {\"new\": \"public\", \"old\": null}, \"path\": {\"new\": \"uploads/2026/10/OAZPNOXQ9MugGOUjHZHV320M.jpg\", \"old\": null}, \"title\": {\"new\": \"up-exif\", \"old\": null}, \"width\": {\"new\": 20, \"old\": null}, \"height\": {\"new\": 40, \"old\": null}, \"alt_text\": {\"new\": \"s6 test\", \"old\": null}, \"mime_type\": {\"new\": \"image/jpeg\", \"old\": null}, \"size_bytes\": {\"new\": 854, \"old\": null}, \"uploaded_by\": {\"new\": 1, \"old\": null}, \"original_name\": {\"new\": \"up-exif.jpg\", \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-03 06:38:09'),
(877, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 's6-test', '2026-10-03 06:38:12'),
(878, 1, 'backup.export', 'App\\Models\\BackupRun', 15, NULL, 'إنشاء نسخة احتياطية (content، settings)', '{\"file\": \"almel-backup-20261003-093814-jioj.json\", \"rows\": 354, \"changes\": {\"kind\": {\"new\": \"export\", \"old\": null}, \"note\": {\"new\": \"s6 test\", \"old\": null}, \"scope\": {\"new\": \"[\\\"content\\\",\\\"settings\\\"]\", \"old\": null}, \"status\": {\"new\": \"ok\", \"old\": null}, \"user_id\": {\"new\": 1, \"old\": null}, \"checksum\": {\"new\": \"14debac434391efa24a17f617b5a239d0f8dc7cac7013d8590473425a26e8ed9\", \"old\": null}, \"filename\": {\"new\": \"almel-backup-20261003-093814-jioj.json\", \"old\": null}, \"rows_count\": {\"new\": 354, \"old\": null}, \"size_bytes\": {\"new\": 79648, \"old\": null}, \"tables_count\": {\"new\": 29, \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-03 06:38:14'),
(879, 1, 'backup.download', 'App\\Models\\BackupRun', 15, NULL, 'تنزيل نسخة احتياطية', '{\"file\": \"almel-backup-20261003-093814-jioj.json\"}', '127.0.0.1', 's6-test', '2026-10-03 06:38:14'),
(880, 1, 'backup.restore_denied', NULL, NULL, NULL, 'رُفضت استعادة نسخة احتياطية: كلمة المرور غير صحيحة', '{\"type\": \"security\"}', '127.0.0.1', 's6-test', '2026-10-03 06:38:31'),
(881, 1, 'backup.restore', 'App\\Models\\BackupRun', 17, NULL, 'استعادة نسخة احتياطية (content)', '{\"rows\": 14, \"safety\": \"almel-backup-20261003-093834-p9lu.json\", \"changes\": {\"kind\": {\"new\": \"import\", \"old\": null}, \"note\": {\"new\": \"نسخة الأمان: almel-backup-20261003-093834-p9lu.json\", \"old\": null}, \"scope\": {\"new\": \"[\\\"content\\\"]\", \"old\": null}, \"status\": {\"new\": \"ok\", \"old\": null}, \"user_id\": {\"new\": 1, \"old\": null}, \"checksum\": {\"new\": \"3d6900bb07ea9b18e8696e645f036a70da5ce69831173fbda881d55d0fce7865\", \"old\": null}, \"rows_count\": {\"new\": 14, \"old\": null}, \"tables_count\": {\"new\": 1, \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-03 06:38:34'),
(882, 1, 'backup.restore', 'App\\Models\\BackupRun', 19, NULL, 'استعادة نسخة احتياطية (content)', '{\"rows\": 13, \"safety\": \"almel-backup-20261003-093838-zfsm.json\", \"changes\": {\"kind\": {\"new\": \"import\", \"old\": null}, \"note\": {\"new\": \"نسخة الأمان: almel-backup-20261003-093838-zfsm.json\", \"old\": null}, \"scope\": {\"new\": \"[\\\"content\\\"]\", \"old\": null}, \"status\": {\"new\": \"ok\", \"old\": null}, \"user_id\": {\"new\": 1, \"old\": null}, \"checksum\": {\"new\": \"3d6486cff29efc96f2f448d6a22bc353630a6895f25e8b498b8bbdf9127f8906\", \"old\": null}, \"rows_count\": {\"new\": 13, \"old\": null}, \"tables_count\": {\"new\": 1, \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-03 06:38:38'),
(883, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 's6-test', '2026-10-03 06:39:23'),
(884, 1, 'media.upload', 'App\\Models\\MediaFile', 89, 'm', 'رفع ملف إلى مكتبة الوسائط: m.jpg', '{\"kind\": \"image\", \"size\": 704, \"type\": \"media\", \"changes\": {\"disk\": {\"new\": \"public\", \"old\": null}, \"path\": {\"new\": \"uploads/2026/10/h9UAcjIvoFhRBlY2gJZ8euLh.jpg\", \"old\": null}, \"title\": {\"new\": \"m\", \"old\": null}, \"width\": {\"new\": 30, \"old\": null}, \"height\": {\"new\": 30, \"old\": null}, \"mime_type\": {\"new\": \"image/jpeg\", \"old\": null}, \"size_bytes\": {\"new\": 704, \"old\": null}, \"uploaded_by\": {\"new\": 1, \"old\": null}, \"original_name\": {\"new\": \"m.jpg\", \"old\": null}}}', '127.0.0.1', 's6-test', '2026-10-03 06:39:24'),
(885, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-03 06:44:31'),
(886, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-03 06:50:47'),
(887, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-03 07:01:34'),
(888, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-03 08:25:07'),
(889, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-03 08:47:09'),
(890, 1, 'profile.update', 'App\\Models\\User', 1, 'محمد الشنطي', 'تعديل الملف الشخصي', '{\"type\": \"users\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-03 09:32:29'),
(891, 1, 'profile.avatar', 'App\\Models\\User', 1, 'محمد الشنطي', 'رفع صورة شخصية', '{\"type\": \"users\", \"changes\": {\"avatar_path\": {\"new\": \"uploads/avatars/u1-0jrl5IMATUSfXleZVXny.webp\", \"old\": null}}, \"source_kb\": 370, \"stored_kb\": 5, \"source_mime\": \"image/png\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-03 10:07:58'),
(892, 1, 'profile.update', 'App\\Models\\User', 1, 'محمد الشنطي', 'تعديل الملف الشخصي', '{\"type\": \"users\", \"changes\": {\"phone\": {\"new\": \"0592945557\", \"old\": null}}}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-03 10:08:17'),
(893, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-03 10:45:58'),
(894, 1, 'profile.avatar', 'App\\Models\\User', 1, 'محمد الشنطي', 'استبدال الصورة الشخصية', '{\"type\": \"users\", \"changes\": {\"avatar_path\": {\"new\": \"uploads/avatars/u1-AFkai75zzBdemSSGbJIr.webp\", \"old\": \"uploads/avatars/u1-0jrl5IMATUSfXleZVXny.webp\"}}, \"source_kb\": 370, \"stored_kb\": 5, \"source_mime\": \"image/png\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-03 10:46:48'),
(895, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-03 10:51:15'),
(896, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-03 10:56:28'),
(897, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-03 10:56:43'),
(898, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-03 11:11:40'),
(899, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-03 11:16:59'),
(900, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-03 11:50:36'),
(901, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0', '2026-10-03 11:51:03'),
(902, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-03 11:54:24'),
(903, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-03 15:21:10'),
(904, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-03 15:23:44'),
(905, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-03 15:25:24'),
(906, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: مظهر الموقع — قالب «أسود»', '{\"section\": \"site_theme\", \"gradient\": false, \"template\": \"black\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-03 15:31:20'),
(907, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: مظهر الموقع — قالب «كحلي»', '{\"section\": \"site_theme\", \"gradient\": false, \"template\": \"navy\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-03 15:31:43'),
(908, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: مظهر الموقع — ألوان مخصصة (#0F3B75 / #7C5CD6)', '{\"section\": \"site_theme\", \"gradient\": false, \"template\": \"custom\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-03 15:32:25'),
(909, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: مظهر الموقع — ألوان مخصصة (#0F3B75 / #7C5CD6) مع تدرّج لوني', '{\"section\": \"site_theme\", \"gradient\": true, \"template\": \"custom\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-03 15:34:31');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `subject_type`, `subject_id`, `subject_label`, `description`, `properties`, `ip_address`, `user_agent`, `created_at`) VALUES
(910, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: مظهر الموقع — ألوان مخصصة (#0F3B75 / #7C5CD6)', '{\"section\": \"site_theme\", \"gradient\": false, \"template\": \"custom\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-03 15:35:32'),
(911, 1, 'hero.update', NULL, NULL, NULL, 'تعديل إعدادات الهيرو (1 شريحة)', '{\"before\": 1, \"slides\": 1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-03 15:38:15'),
(912, 1, 'hero.update', NULL, NULL, NULL, 'تعديل إعدادات الهيرو (1 شريحة)', '{\"before\": 1, \"slides\": 1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-03 16:03:54'),
(913, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-03 16:16:29'),
(914, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-03 16:18:12'),
(915, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-03 21:26:07'),
(916, 1, 'hero.update', NULL, NULL, NULL, 'تعديل إعدادات الهيرو (1 شريحة)', '{\"before\": 1, \"slides\": 1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-03 21:33:52'),
(917, 1, 'hero.update', NULL, NULL, NULL, 'تعديل إعدادات الهيرو (1 شريحة)', '{\"before\": 1, \"slides\": 1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-03 21:35:05'),
(918, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: مظهر الموقع — قالب «كحلي وأخضر»', '{\"section\": \"site_theme\", \"gradient\": false, \"template\": \"navy-green\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-03 21:36:21'),
(919, 1, 'media.upload', 'App\\Models\\MediaFile', 90, 'hf_20260927_083820_b04ad05a-807a-49fc-8814-1db428a69b14', 'رفع صورة مشروع: hf_20260927_083820_b04ad05a-807a-49fc-8814-1db428a69b14.png', '{\"changes\": {\"disk\": {\"new\": \"public\", \"old\": null}, \"path\": {\"new\": \"uploads/2026/10/vhpkG07XW1Fx2miCjOuqN5Ul.png\", \"old\": null}, \"title\": {\"new\": \"hf_20260927_083820_b04ad05a-807a-49fc-8814-1db428a69b14\", \"old\": null}, \"width\": {\"new\": 864, \"old\": null}, \"height\": {\"new\": 1184, \"old\": null}, \"mime_type\": {\"new\": \"image/png\", \"old\": null}, \"size_bytes\": {\"new\": 1660277, \"old\": null}, \"uploaded_by\": {\"new\": 1, \"old\": null}, \"original_name\": {\"new\": \"hf_20260927_083820_b04ad05a-807a-49fc-8814-1db428a69b14.png\", \"old\": null}}}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-03 21:38:20'),
(920, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-04 07:20:53'),
(921, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-04 07:22:03'),
(922, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-04 07:27:36'),
(923, 1, 'homepage.update', NULL, NULL, NULL, 'تحديث أقسام الصفحة الرئيسية (إخفاء: about)', '{\"order\": [\"hero\", \"announcements\", \"about\", \"projects\", \"stories\", \"pillars\", \"activities\", \"appeal\", \"impact-map\", \"news\", \"partners\", \"gallery\", \"contact\", \"faq\"], \"hidden\": [\"about\"], \"edited_sections\": []}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-04 07:35:59'),
(924, 1, 'homepage.update', NULL, NULL, NULL, 'تحديث أقسام الصفحة الرئيسية (إخفاء: projects، stories، pillars، activities، appeal، impact-map، news، partners، gallery، contact، faq)', '{\"order\": [\"hero\", \"announcements\", \"about\", \"projects\", \"stories\", \"pillars\", \"activities\", \"appeal\", \"impact-map\", \"news\", \"partners\", \"gallery\", \"contact\", \"faq\"], \"hidden\": [\"about\", \"projects\", \"stories\", \"pillars\", \"activities\", \"appeal\", \"impact-map\", \"news\", \"partners\", \"gallery\", \"contact\", \"faq\"], \"edited_sections\": []}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-04 07:36:17'),
(925, 1, 'homepage.update', NULL, NULL, NULL, 'تحديث أقسام الصفحة الرئيسية (تغيير الترتيب — إظهار: about، projects، stories)', '{\"order\": [\"hero\", \"announcements\", \"about\", \"stories\", \"projects\", \"pillars\", \"activities\", \"appeal\", \"impact-map\", \"news\", \"partners\", \"gallery\", \"contact\", \"faq\"], \"hidden\": [\"pillars\", \"activities\", \"appeal\", \"impact-map\", \"news\", \"partners\", \"gallery\", \"contact\", \"faq\"], \"edited_sections\": []}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-04 07:36:45'),
(926, 1, 'homepage.reset', NULL, NULL, NULL, 'استعادة الصفحة الرئيسية للوضع الافتراضي (الترتيب والإظهار والنصوص)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-04 07:37:08'),
(927, 1, 'hero.update', NULL, NULL, NULL, 'تعديل إعدادات الهيرو (2 شريحة)', '{\"before\": 1, \"slides\": 2}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-04 07:40:38'),
(928, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: مظهر الموقع — قالب «أخضر عميق»', '{\"section\": \"site_theme\", \"gradient\": false, \"template\": \"green-deep\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-04 07:41:05'),
(929, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: مظهر الموقع — قالب «أسود»', '{\"section\": \"site_theme\", \"gradient\": false, \"template\": \"black\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-04 07:41:14'),
(930, 1, 'homepage.update', NULL, NULL, NULL, 'تحديث أقسام الصفحة الرئيسية (تغيير الترتيب — إخفاء: partners، gallery، contact، faq)', '{\"order\": [\"hero\", \"announcements\", \"projects\", \"about\", \"stories\", \"pillars\", \"activities\", \"appeal\", \"impact-map\", \"news\", \"partners\", \"gallery\", \"contact\", \"faq\"], \"hidden\": [\"partners\", \"gallery\", \"contact\", \"faq\"], \"edited_sections\": []}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-04 07:42:08'),
(931, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: مظهر الموقع — قالب «كحلي»', '{\"section\": \"site_theme\", \"gradient\": false, \"template\": \"navy\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-04 07:45:57'),
(932, 1, 'hero.update', NULL, NULL, NULL, 'تعديل إعدادات الهيرو (2 شريحة)', '{\"before\": 2, \"slides\": 2}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-04 07:48:51'),
(933, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-04 07:52:00'),
(934, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: مظهر الموقع — قالب «الأخضر (الحالي)»', '{\"section\": \"site_theme\", \"gradient\": false, \"template\": \"green\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-04 07:54:28'),
(935, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-04 07:56:07'),
(936, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-04 07:58:16'),
(937, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: مظهر الموقع — قالب «أسود»', '{\"section\": \"site_theme\", \"gradient\": false, \"template\": \"black\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-04 07:58:40'),
(938, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-04 08:00:04'),
(939, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-04 08:00:35'),
(940, 1, 'auth.logout', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل خروج من لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-04 08:00:41'),
(941, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-04 08:03:11'),
(942, 1, 'audit.export', NULL, NULL, NULL, 'صدّر سجل العمليات (CSV)', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-04 08:03:14'),
(943, 1, 'newsletter.export', NULL, NULL, NULL, 'صدّر قائمة مشتركي النشرة (CSV)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-04 08:03:20'),
(944, 1, 'reports.export', NULL, NULL, NULL, 'صدّر تقريراً (CSV): آخر 30 يوماً', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-04 08:03:22'),
(945, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-04 08:03:44'),
(946, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-04 08:05:29'),
(947, 1, 'audit.export', NULL, NULL, NULL, 'صدّر سجل العمليات (CSV)', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-04 08:05:32'),
(948, 1, 'newsletter.export', NULL, NULL, NULL, 'صدّر قائمة مشتركي النشرة (CSV)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-04 08:05:40'),
(949, 1, 'reports.export', NULL, NULL, NULL, 'صدّر تقريراً (CSV): آخر 30 يوماً', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-04 08:05:42'),
(950, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-04 08:15:36'),
(951, 1, 'hero.update', NULL, NULL, NULL, 'تعديل إعدادات الهيرو (2 شريحة)', '{\"before\": 2, \"slides\": 2}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-04 08:16:39'),
(952, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'curl/8.21.0', '2026-10-04 08:27:47'),
(953, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', '2026-10-04 08:35:37'),
(954, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0', '2026-10-04 09:43:40'),
(955, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-05 08:21:59'),
(956, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: المظهر', '{\"section\": \"appearance\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-05 08:22:40'),
(957, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: مظهر الموقع — قالب «الأخضر (الحالي)»', '{\"section\": \"site_theme\", \"gradient\": false, \"template\": \"green\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-05 08:22:40'),
(958, 1, 'settings.update', NULL, NULL, NULL, 'حدّث الإعدادات: مظهر الموقع — قالب «أسود»', '{\"section\": \"site_theme\", \"gradient\": false, \"template\": \"black\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-05 08:22:53'),
(959, 1, 'partner.visibility', 'App\\Models\\Partner', 1, 'منظمة يونيسف', 'إخفاء شريك: منظمة يونيسف', '{\"changes\": {\"is_published\": {\"new\": false, \"old\": 1}}}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-05 08:25:24'),
(960, 1, 'partner.reorder', NULL, NULL, NULL, 'تغيير ترتيب الشركاء', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-05 08:25:25'),
(961, 1, 'homepage.update', NULL, NULL, NULL, 'تحديث أقسام الصفحة الرئيسية (إخفاء: announcements)', '{\"order\": [\"hero\", \"announcements\", \"projects\", \"about\", \"stories\", \"pillars\", \"activities\", \"appeal\", \"impact-map\", \"news\", \"partners\", \"gallery\", \"contact\", \"faq\"], \"hidden\": [\"announcements\", \"partners\", \"gallery\", \"contact\", \"faq\"], \"edited_sections\": []}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-05 08:25:45'),
(962, 1, 'homepage.update', NULL, NULL, NULL, 'تحديث أقسام الصفحة الرئيسية (إخفاء: projects، about، stories، pillars، activities، appeal، impact-map، news)', '{\"order\": [\"hero\", \"announcements\", \"projects\", \"about\", \"stories\", \"pillars\", \"activities\", \"appeal\", \"impact-map\", \"news\", \"partners\", \"gallery\", \"contact\", \"faq\"], \"hidden\": [\"announcements\", \"projects\", \"about\", \"stories\", \"pillars\", \"activities\", \"appeal\", \"impact-map\", \"news\", \"partners\", \"gallery\", \"contact\", \"faq\"], \"edited_sections\": []}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-05 08:25:58'),
(963, 1, 'homepage.reset', NULL, NULL, NULL, 'استعادة الصفحة الرئيسية للوضع الافتراضي (الترتيب والإظهار والنصوص)', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-05 08:26:05'),
(964, 1, 'auth.logout', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل خروج من لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-05 08:29:42'),
(965, 1, 'auth.login', 'App\\Models\\User', 1, 'محمد الشنطي', 'تسجيل دخول إلى لوحة التحكم', '{\"type\": \"security\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-05 08:29:56');

-- --------------------------------------------------------

--
-- Table structure for table `backup_runs`
--

DROP TABLE IF EXISTS `backup_runs`;
CREATE TABLE IF NOT EXISTS `backup_runs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `kind` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'export' COMMENT 'export | scheduled | pre_restore | import',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ok' COMMENT 'ok | failed',
  `filename` varchar(190) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'File under storage/app/backups (NULL for import rows)',
  `size_bytes` bigint UNSIGNED NOT NULL DEFAULT '0',
  `scope` json DEFAULT NULL COMMENT 'Backup groups included: content | settings | messages | access',
  `tables_count` int UNSIGNED NOT NULL DEFAULT '0',
  `rows_count` int UNSIGNED NOT NULL DEFAULT '0',
  `checksum` char(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'SHA-256 of the tables payload',
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `note` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `backup_runs_kind_created_at_index` (`kind`,`created_at`),
  KEY `backup_runs_user_id_index` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='History of database backups / restores made from the admin panel (the dumps are files in storage/app/backups)';

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Laravel default: database cache store';

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_356a192b7913b04c54574d18c28d46e6395428ab', 'i:1;', 1791024468),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_356a192b7913b04c54574d18c28d46e6395428ab:timer', 'i:1791024468;', 1791024468),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_5c785c036466adea360111aa28563bfd556b5fba', 'i:6;', 1790974141),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1790974141;', 1790974141),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_97a04325c357cd5ff0205e5cf1a814a4', 'i:1;', 1791099441),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_97a04325c357cd5ff0205e5cf1a814a4:timer', 'i:1791099441;', 1791099441),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login-ip|127.0.0.1:timer', 'i:1790976903;', 1790976903),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|nobody-s8@example.test|127.0.0.1', 'i:1;', 1790976903),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|nobody-s8@example.test|127.0.0.1:timer', 'i:1790976903;', 1790976903),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-nope0@test.local|127.0.0.1', 'i:1;', 1790972253),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-nope0@test.local|127.0.0.1:timer', 'i:1790972253;', 1790972253),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-nope1@test.local|127.0.0.1', 'i:1;', 1790972256),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-nope1@test.local|127.0.0.1:timer', 'i:1790972256;', 1790972256),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-nope2@test.local|127.0.0.1', 'i:1;', 1790972258),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-nope2@test.local|127.0.0.1:timer', 'i:1790972258;', 1790972258),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray0@test.local|127.0.0.1', 'i:1;', 1790972268),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray0@test.local|127.0.0.1:timer', 'i:1790972268;', 1790972268),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray1@test.local|127.0.0.1', 'i:1;', 1790972270),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray1@test.local|127.0.0.1:timer', 'i:1790972270;', 1790972270),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray10@test.local|127.0.0.1', 'i:1;', 1790972281),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray10@test.local|127.0.0.1:timer', 'i:1790972281;', 1790972281),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray11@test.local|127.0.0.1', 'i:1;', 1790972282),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray11@test.local|127.0.0.1:timer', 'i:1790972282;', 1790972282),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray12@test.local|127.0.0.1', 'i:1;', 1790972283),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray12@test.local|127.0.0.1:timer', 'i:1790972283;', 1790972283),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray13@test.local|127.0.0.1', 'i:1;', 1790972284),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray13@test.local|127.0.0.1:timer', 'i:1790972284;', 1790972284),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray14@test.local|127.0.0.1', 'i:1;', 1790972285),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray14@test.local|127.0.0.1:timer', 'i:1790972285;', 1790972285),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray15@test.local|127.0.0.1', 'i:1;', 1790972287),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray15@test.local|127.0.0.1:timer', 'i:1790972287;', 1790972287),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray16@test.local|127.0.0.1', 'i:1;', 1790972288),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray16@test.local|127.0.0.1:timer', 'i:1790972288;', 1790972288),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray17@test.local|127.0.0.1', 'i:1;', 1790972288),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray17@test.local|127.0.0.1:timer', 'i:1790972288;', 1790972288),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray18@test.local|127.0.0.1', 'i:1;', 1790972289),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray18@test.local|127.0.0.1:timer', 'i:1790972289;', 1790972289),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray19@test.local|127.0.0.1', 'i:1;', 1790972289),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray19@test.local|127.0.0.1:timer', 'i:1790972289;', 1790972289),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray2@test.local|127.0.0.1', 'i:1;', 1790972271),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray2@test.local|127.0.0.1:timer', 'i:1790972271;', 1790972271),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray20@test.local|127.0.0.1', 'i:1;', 1790972290),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray20@test.local|127.0.0.1:timer', 'i:1790972290;', 1790972290),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray21@test.local|127.0.0.1', 'i:1;', 1790972291),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray21@test.local|127.0.0.1:timer', 'i:1790972291;', 1790972291),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray22@test.local|127.0.0.1', 'i:1;', 1790972291),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray22@test.local|127.0.0.1:timer', 'i:1790972291;', 1790972291),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray23@test.local|127.0.0.1', 'i:1;', 1790972292),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray23@test.local|127.0.0.1:timer', 'i:1790972292;', 1790972292),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray24@test.local|127.0.0.1', 'i:1;', 1790972293),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray24@test.local|127.0.0.1:timer', 'i:1790972293;', 1790972293),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray25@test.local|127.0.0.1', 'i:1;', 1790972293),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray25@test.local|127.0.0.1:timer', 'i:1790972293;', 1790972293),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray26@test.local|127.0.0.1', 'i:1;', 1790972294),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray26@test.local|127.0.0.1:timer', 'i:1790972294;', 1790972294),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray27@test.local|127.0.0.1', 'i:1;', 1790972295),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray27@test.local|127.0.0.1:timer', 'i:1790972294;', 1790972295),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray28@test.local|127.0.0.1', 'i:1;', 1790972295),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray28@test.local|127.0.0.1:timer', 'i:1790972295;', 1790972295),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray29@test.local|127.0.0.1', 'i:1;', 1790972296),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray29@test.local|127.0.0.1:timer', 'i:1790972296;', 1790972296),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray3@test.local|127.0.0.1', 'i:1;', 1790972272),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray3@test.local|127.0.0.1:timer', 'i:1790972272;', 1790972272),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray4@test.local|127.0.0.1', 'i:1;', 1790972274),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray4@test.local|127.0.0.1:timer', 'i:1790972274;', 1790972274),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray5@test.local|127.0.0.1', 'i:1;', 1790972275),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray5@test.local|127.0.0.1:timer', 'i:1790972275;', 1790972275),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray6@test.local|127.0.0.1', 'i:1;', 1790972276),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray6@test.local|127.0.0.1:timer', 'i:1790972276;', 1790972276),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray7@test.local|127.0.0.1', 'i:1;', 1790972277),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray7@test.local|127.0.0.1:timer', 'i:1790972277;', 1790972277),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray8@test.local|127.0.0.1', 'i:1;', 1790972279),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray8@test.local|127.0.0.1:timer', 'i:1790972278;', 1790972279),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray9@test.local|127.0.0.1', 'i:1;', 1790972280),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-spray9@test.local|127.0.0.1:timer', 'i:1790972280;', 1790972280),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-throttle@test.local|127.0.0.1', 'i:5;', 1790972259),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|stest-throttle@test.local|127.0.0.1:timer', 'i:1790972259;', 1790972259),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|ttest.nobody@example.com|127.0.0.1', 'i:5;', 1790968878),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_admin-login|ttest.nobody@example.com|127.0.0.1:timer', 'i:1790968878;', 1790968878),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_notif-login-failed-ip|127.0.0.1', 'i:1;', 1790976651),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_notif-login-failed|admin-login|s6-thr-1@example.org|127.0.0.1', 'i:1;', 1790976411),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_notif-login-failed|admin-login|stest-throttle@test.local|127.0.0.1', 'i:1;', 1790972262),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_notif-login-failed|admin-login|stest-victim@test.local|127.0.0.1', 'i:1;', 1790972257),
('gmaay_alshmal_lltnmy_oalttoyr_almgtmaay_cache_notif-login-failed|admin-login|ttest.nobody@example.com|127.0.0.1', 'i:1;', 1790968881);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Laravel default: atomic cache locks';

-- --------------------------------------------------------

--
-- Table structure for table `constant_groups`
--

DROP TABLE IF EXISTS `constant_groups`;
CREATE TABLE IF NOT EXISTS `constant_groups` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `group_key` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Stable code name, e.g. project_status, user_role, timezone',
  `name_ar` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Arabic title shown in Settings > System constants',
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Help text under the group title',
  `ref_table` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Existing table that owns the same list (programs, governorates, ...); NULL = constants are the only source',
  `used_in` json DEFAULT NULL COMMENT 'Dashboard pages that use the list, e.g. ["المشاريع"]',
  `is_locked` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 = keys are tied to code behaviour: items cannot be added or deleted, only label / order / active edited',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `constant_groups_group_key_unique` (`group_key`),
  KEY `constant_groups_sort_order_index` (`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Editable dropdown lists of the admin dashboard (one row per list)';

--
-- Dumping data for table `constant_groups`
--

INSERT INTO `constant_groups` (`id`, `group_key`, `name_ar`, `description`, `ref_table`, `used_in`, `is_locked`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'project_status', 'حالات المشروع', 'حالة المشروع في قائمة المشاريع ونموذج المشروع.', NULL, '[\"المشاريع\"]', 0, 1, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(2, 'project_category', 'فئات المشاريع (البرامج)', 'فئة المشروع في الفلاتر ونموذج المشروع.', 'programs', '[\"المشاريع\"]', 0, 2, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(3, 'governorate', 'المحافظات', 'محافظة المشروع في نموذج المشروع.', 'governorates', '[\"المشاريع\"]', 0, 3, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(4, 'news_category', 'تصنيفات الأخبار', 'تصنيف الخبر في فلتر الأخبار ومحرر الخبر.', 'article_categories', '[\"الأخبار\", \"تحرير خبر\"]', 0, 4, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(5, 'article_status', 'حالات الخبر', 'حالة النشر في محرر الخبر. مفاتيحها مرتبطة بسلوك النشر، تُعدَّل تسميتها وترتيبها فقط.', NULL, '[\"تحرير خبر\"]', 1, 5, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(6, 'page_status', 'حالات الصفحة', 'حالة الصفحة العامة في إدارة الصفحات. مفاتيحها مرتبطة بسلوك النشر، تُعدَّل تسميتها وترتيبها فقط.', NULL, '[\"الصفحات\"]', 1, 6, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(7, 'visibility', 'حالة الظهور في الموقع', 'فلتر الظهور في القصص والأنشطة والشركاء والأسئلة والإعلانات وخريطة الأثر.', NULL, '[\"القصص\", \"الأنشطة\", \"الشركاء\", \"الأسئلة الشائعة\", \"نداء الإغاثة\", \"خريطة الأثر\"]', 1, 7, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(8, 'gallery_album', 'ألبومات المعرض', 'الألبوم في معرض الصور (نقل الصور وتفاصيل الصورة).', 'gallery_albums', '[\"معرض الصور\"]', 0, 8, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(9, 'section_anchor', 'أقسام الموقع (وجهات الروابط)', 'وجهة الرابط في القصص والأنشطة والإعلانات ونداء الإغاثة.', NULL, '[\"القصص\", \"الأنشطة\", \"نداء الإغاثة\"]', 0, 9, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(10, 'icon', 'الأيقونات', 'قائمة الأيقونات في القصص والأنشطة والشركاء. المفتاح اسم أيقونة Material Symbols.', NULL, '[\"القصص\", \"الأنشطة\", \"الشركاء\"]', 0, 10, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(11, 'badge_tone', 'ألوان وسم الصورة', 'لون الوسم في الأنشطة الميدانية.', NULL, '[\"الأنشطة\"]', 1, 11, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(13, 'timezone', 'المناطق الزمنية', 'المنطقة الزمنية في الإعدادات العامة. المفتاح معرّف IANA.', NULL, '[\"الإعدادات\"]', 0, 13, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(14, 'language', 'لغات اللوحة', 'لغة واجهة الإدارة. المفاتيح مرتبطة بالواجهة، تُعدَّل تسميتها وترتيبها فقط.', NULL, '[\"الإعدادات\"]', 1, 14, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(15, 'date_format', 'تنسيقات التاريخ', 'تنسيق التاريخ في الإعدادات العامة. المفاتيح مرتبطة بدالة التنسيق، تُعدَّل تسميتها وترتيبها فقط.', NULL, '[\"الإعدادات\"]', 1, 15, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(16, 'digest_frequency', 'تكرار الملخص والنسخ الاحتياطي', 'تكرار الملخص الدوري وجدولة النسخ الاحتياطي (قائمة مشتركة).', NULL, '[\"الإعدادات\"]', 1, 16, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(17, 'digest_day', 'أيام إرسال الملخص', 'يوم إرسال الملخص الأسبوعي في الإشعارات.', NULL, '[\"الإعدادات\"]', 0, 17, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(18, 'password_expiry', 'مدد انتهاء كلمة المرور', 'خيارات انتهاء الصلاحية في إعدادات الأمان.', NULL, '[\"الإعدادات\"]', 0, 18, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(19, 'session_timeout', 'مهل الجلسة', 'خيارات مهلة الخروج التلقائي (بالدقائق) في إعدادات الأمان.', NULL, '[\"الإعدادات\"]', 0, 19, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(20, 'audit_type', 'أنواع أحداث السجل', 'فلتر نوع الحدث في سجل النشاط. المفاتيح مرتبطة بالأحداث، تُعدَّل تسميتها وترتيبها فقط.', NULL, '[\"الإعدادات\"]', 1, 20, '2026-10-01 10:50:04', '2026-10-01 10:50:04');

-- --------------------------------------------------------

--
-- Table structure for table `constant_items`
--

DROP TABLE IF EXISTS `constant_items`;
CREATE TABLE IF NOT EXISTS `constant_items` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `group_id` bigint UNSIGNED NOT NULL,
  `item_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Value stored in other tables (e.g. urgent, Asia/Gaza, #about, 30); unique per group',
  `label_ar` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Arabic label shown in dropdowns',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0 = hidden from dropdowns, old records still show the label',
  `is_locked` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 = system item (key used by code, e.g. admin / off / never): cannot be deleted',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `meta` json DEFAULT NULL COMMENT 'Optional extras: {"note":"..."} help text, {"ref_slug":"..."} slug in the group ref_table',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `constant_items_group_id_item_key_unique` (`group_id`,`item_key`),
  KEY `constant_items_group_id_sort_order_index` (`group_id`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=113 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Options of each constants group (label, order, enabled, locked)';

--
-- Dumping data for table `constant_items`
--

INSERT INTO `constant_items` (`id`, `group_id`, `item_key`, `label_ar`, `is_active`, `is_locked`, `sort_order`, `meta`, `created_at`, `updated_at`) VALUES
(1, 1, 'active', 'نشط', 1, 0, 0, NULL, '2026-10-01 10:50:04', '2026-10-02 14:17:00'),
(2, 1, 'urgent', 'عاجل', 1, 0, 1, NULL, '2026-10-01 10:50:04', '2026-10-02 14:16:59'),
(3, 1, 'paused', 'متوقف مؤقتاً', 1, 0, 2, NULL, '2026-10-01 10:50:04', '2026-10-02 14:16:59'),
(5, 1, 'completed', 'مكتمل', 1, 0, 4, NULL, '2026-10-01 10:50:04', '2026-10-02 14:17:00'),
(6, 2, 'relief', 'برامج إغاثية', 1, 0, 0, '{\"ref_slug\": \"relief\"}', '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(7, 2, 'construction', 'برامج إنشائية', 1, 0, 1, '{\"ref_slug\": \"construction\"}', '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(8, 2, 'development', 'برامج تنموية', 1, 0, 2, '{\"ref_slug\": \"development\"}', '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(9, 2, 'health', 'برامج صحية', 1, 0, 3, '{\"ref_slug\": \"health\"}', '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(10, 3, 'north', 'شمال غزة', 1, 0, 0, '{\"ref_slug\": \"north-gaza\"}', '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(11, 3, 'gaza', 'غزة', 1, 0, 1, '{\"ref_slug\": \"gaza\"}', '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(12, 3, 'middle', 'دير البلح', 1, 0, 2, '{\"ref_slug\": \"deir-al-balah\"}', '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(13, 3, 'khan', 'خان يونس', 1, 0, 3, '{\"ref_slug\": \"khan-younis\"}', '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(14, 3, 'rafah', 'رفح', 1, 0, 4, '{\"ref_slug\": \"rafah\"}', '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(15, 4, 'statements', 'بيانات وتقارير', 1, 0, 0, '{\"ref_slug\": \"statements\"}', '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(16, 4, 'development', 'تنمية مجتمعية', 1, 0, 1, '{\"ref_slug\": \"development\"}', '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(17, 4, 'field', 'توثيق الميدان', 1, 0, 2, '{\"ref_slug\": \"field\"}', '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(18, 4, 'activities', 'أنشطة ميدانية', 1, 0, 3, '{\"ref_slug\": \"activities\"}', '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(19, 5, 'draft', 'مسودة', 1, 0, 0, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(20, 5, 'published', 'منشور', 1, 0, 1, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(21, 5, 'scheduled', 'مجدول', 1, 0, 2, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(22, 6, 'published', 'منشورة', 1, 0, 0, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(23, 6, 'draft', 'مسودة', 1, 0, 1, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(24, 6, 'hidden', 'مخفية', 1, 0, 2, '{\"note\": \"لا تظهر في القوائم والبحث\"}', '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(25, 7, 'visible', 'ظاهر في الموقع', 1, 0, 0, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(26, 7, 'hidden', 'مخفي', 1, 0, 1, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(27, 8, 'field', 'توثيق الميدان', 1, 0, 0, '{\"ref_slug\": \"field\"}', '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(28, 8, 'relief', 'الإغاثة', 1, 0, 1, '{\"ref_slug\": \"relief\"}', '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(29, 8, 'development', 'التعليم والتنمية', 1, 0, 2, '{\"ref_slug\": \"development\"}', '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(30, 8, 'health', 'الصحة والمياه', 1, 0, 3, '{\"ref_slug\": \"health\"}', '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(31, 9, '#hero', 'الرئيسية', 1, 0, 0, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(32, 9, '#about', 'من نحن', 1, 0, 1, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(33, 9, '#projects', 'المشاريع', 1, 0, 2, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(34, 9, '#stories', 'قصص من الميدان', 1, 0, 3, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(35, 9, '#activities', 'الأنشطة الميدانية', 1, 0, 4, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(36, 9, '#appeal', 'نداء الإغاثة', 1, 0, 5, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(37, 9, '#impact-map', 'خريطة الأثر', 1, 0, 6, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(38, 9, '#news', 'الأخبار', 1, 0, 7, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(39, 9, '#partners', 'الشركاء', 1, 0, 8, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(40, 9, '#gallery', 'معرض الصور', 1, 0, 9, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(41, 9, '#contact', 'التواصل', 1, 0, 10, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(42, 9, '#faq', 'الأسئلة الشائعة', 1, 0, 11, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(43, 10, 'shopping_basket', 'سلة غذائية', 1, 0, 0, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(44, 10, 'diversity_3', 'فرق التطوع', 1, 0, 1, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(45, 10, 'menu_book', 'التعليم', 1, 0, 2, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(46, 10, 'medical_services', 'الرعاية الطبية', 1, 0, 3, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(47, 10, 'water_drop', 'المياه', 1, 0, 4, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(48, 10, 'camping', 'الخيام', 1, 0, 5, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(49, 10, 'restaurant', 'الوجبات', 1, 0, 6, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(50, 10, 'groups', 'المستفيدون', 1, 0, 7, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(51, 10, 'group', 'مجموعة', 1, 0, 8, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(52, 10, 'school', 'المدرسة', 1, 0, 9, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(53, 10, 'child_care', 'الأطفال', 1, 0, 10, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(54, 10, 'public', 'دولي', 1, 0, 11, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(55, 10, 'nutrition', 'الأمن الغذائي', 1, 0, 12, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(56, 10, 'emergency', 'إغاثة عاجلة', 1, 0, 13, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(57, 10, 'shield', 'حماية', 1, 0, 14, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(58, 10, 'handshake', 'شراكة', 1, 0, 15, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(59, 10, 'favorite', 'عطاء', 1, 0, 16, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(60, 10, 'local_shipping', 'قوافل', 1, 0, 17, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(62, 10, 'health_and_safety', 'السلامة الصحية', 1, 0, 19, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(63, 11, 'forest', 'أخضر داكن', 1, 0, 0, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(64, 11, 'gold', 'ذهبي', 1, 0, 1, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(65, 11, 'mid', 'أخضر متوسط', 1, 0, 2, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(70, 13, 'Asia/Gaza', 'غزة (GMT+3)', 1, 0, 0, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(71, 13, 'Asia/Hebron', 'الخليل (GMT+3)', 1, 0, 1, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(72, 13, 'Africa/Cairo', 'القاهرة (GMT+3)', 1, 0, 2, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(73, 13, 'Asia/Amman', 'عمّان (GMT+3)', 1, 0, 3, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(74, 13, 'Asia/Riyadh', 'الرياض (GMT+3)', 1, 0, 4, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(75, 13, 'Europe/Istanbul', 'إسطنبول (GMT+3)', 1, 0, 5, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(76, 13, 'Asia/Dubai', 'دبي (GMT+4)', 1, 0, 6, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(77, 13, 'Europe/London', 'لندن', 1, 0, 7, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(78, 13, 'UTC', 'التوقيت العالمي UTC', 1, 0, 8, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(79, 14, 'ar', 'العربية', 1, 0, 0, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(80, 14, 'en', 'English', 1, 0, 1, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(81, 15, 'long', 'طويل', 1, 0, 0, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(82, 15, 'short', 'مختصر', 1, 0, 1, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(83, 15, 'iso', 'رقمي', 1, 0, 2, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(84, 16, 'off', 'متوقف', 1, 1, 0, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(85, 16, 'daily', 'يومي', 1, 0, 1, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(86, 16, 'weekly', 'أسبوعي', 1, 0, 2, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(87, 16, 'monthly', 'شهري', 1, 0, 3, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(88, 17, 'sat', 'السبت', 1, 0, 0, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(89, 17, 'sun', 'الأحد', 1, 0, 1, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(90, 17, 'mon', 'الاثنين', 1, 0, 2, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(91, 17, 'thu', 'الخميس', 1, 0, 3, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(92, 18, 'never', 'لا تنتهي', 1, 1, 0, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(93, 18, '30', 'كل 30 يوماً', 1, 0, 1, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(94, 18, '60', 'كل 60 يوماً', 1, 0, 2, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(95, 18, '90', 'كل 90 يوماً', 1, 0, 3, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(96, 18, '180', 'كل 180 يوماً', 1, 0, 4, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(97, 19, '15', '15 دقيقة', 1, 0, 0, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(98, 19, '30', '30 دقيقة', 1, 0, 1, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(99, 19, '60', 'ساعة', 1, 0, 2, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(100, 19, '240', '4 ساعات', 1, 0, 3, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(101, 19, '480', '8 ساعات', 1, 0, 4, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(102, 20, 'settings', 'الإعدادات', 1, 0, 0, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(103, 20, 'users', 'المستخدمون', 1, 0, 1, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(104, 20, 'security', 'الأمان', 1, 0, 2, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(105, 20, 'content', 'المحتوى', 1, 0, 3, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(106, 20, 'integrations', 'التكاملات', 1, 0, 4, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(107, 20, 'backup', 'النسخ', 1, 0, 5, NULL, '2026-10-01 10:50:04', '2026-10-01 10:50:04'),
(110, 1, 'draft', 'مسودة', 1, 0, 3, NULL, '2026-10-02 14:17:00', '2026-10-02 14:17:00');

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
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
  `handled_by` bigint UNSIGNED DEFAULT NULL COMMENT 'Admin user who answered / owns it',
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
  KEY `contact_messages_email_index` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Messages and requests from the contact form (includes volunteer requests via type)';

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `type`, `name`, `email`, `phone`, `subject`, `message`, `consent_given`, `is_read`, `is_starred`, `is_archived`, `read_at`, `handled_by`, `handled_at`, `internal_note`, `ip_address`, `user_agent`, `created_at`, `updated_at`, `deleted_at`) VALUES
(30, 'partnership', 'ئسقلبئسقلب', 'mohammedalshantti2000@gmail.com', '5929455557', NULL, 'sdtgedetgs', 1, 1, 0, 1, '2026-10-05 08:31:28', NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-04 07:27:21', '2026-10-05 08:31:29', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Laravel default: failed queue jobs';

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

DROP TABLE IF EXISTS `faqs`;
CREATE TABLE IF NOT EXISTS `faqs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `question` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `faqs_is_published_sort_order_index` (`is_published`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Frequently asked questions';

--
-- Dumping data for table `faqs`
--

INSERT INTO `faqs` (`id`, `question`, `answer`, `is_published`, `sort_order`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'كيف أتأكد أن تبرعي يصل إلى غزة فعلاً؟', 'نعمل عبر فرق ميدانية وشركاء داخل القطاع، ونوثّق التوزيعات بالصور والتقارير الدورية التي ننشرها في المركز الإعلامي، ويمكنك طلب تقرير عن الحملة التي ساهمت فيها.', 1, 1, '2026-09-30 21:09:43', '2026-10-02 17:29:00', '2026-10-02 17:29:00'),
(2, 'هل يمكنني إخراج زكاة مالي عبر الجمعية؟', 'نعم، يمكنك تحديد أن مساهمتك زكاة عند التبرع لتُصرف في مصارفها الشرعية للأسر المستحقة داخل القطاع.', 1, 2, '2026-09-30 21:09:43', '2026-10-02 17:29:00', '2026-10-02 17:29:00'),
(3, 'هل أحصل على إيصال بتبرعي؟', 'يصلك إيصال بتبرعك عبر البريد الإلكتروني أو الرسائل بعد تأكيد العملية، ويمكنك طلب نسخة منه في أي وقت عبر فريق خدمة المتبرعين.', 1, 3, '2026-09-30 21:09:43', '2026-10-02 17:29:00', '2026-10-02 17:29:00'),
(4, 'كيف تضمن الجمعية الشفافية في صرف التبرعات؟', 'نعتمد على توثيق كل توزيع بالصورة، ونشر تقارير دورية بالإنجاز والإنفاق، ومراجعة الحسابات من جهة تدقيق مستقلة.', 1, 4, '2026-09-30 21:09:43', '2026-10-02 17:29:00', '2026-10-02 17:29:00'),
(5, 'هل يمكنني تخصيص تبرعي لمشروع أو محافظة بعينها؟', 'يمكنك اختيار المشروع (السلال الغذائية، الخيام، المياه، العيادات الميدانية) عند التواصل معنا، وسنبذل جهدنا لتوجيهه إلى المحافظة التي تحددها وفق الاحتياج والظروف الميدانية.', 1, 5, '2026-09-30 21:09:43', '2026-10-02 17:29:00', '2026-10-02 17:29:00'),
(6, 'ما وسائل التبرع المتاحة؟', 'تواصل مع فريق خدمة المتبرعين عبر الهاتف أو البريد الإلكتروني أو واتساب، وسيزوّدك بوسائل التبرع المعتمدة المتاحة في بلدك.', 1, 6, '2026-09-30 21:09:43', '2026-10-02 17:29:00', '2026-10-02 17:29:00'),
(7, 'كيف يمكنني التطوع مع الجمعية؟', 'أرسل لنا بياناتك ومجال خبرتك عبر نموذج التواصل، وسنتواصل معك عند توفر فرص تطوع ميدانية أو عن بُعد (تصميم، ترجمة، تنسيق حملات).', 1, 7, '2026-09-30 21:09:43', '2026-09-30 21:09:43', NULL),
(8, 'هل يمكنني دعم مشروع بشكل شهري؟', 'نعم، يمكنك الاشتراك في التبرع الشهري لدعم البرامج الإغاثية والإنشائية والتنموية والصحية، مع تقارير دورية عن أثر تبرعك.', 1, 8, '2026-09-30 21:09:43', '2026-10-02 17:29:00', '2026-10-02 17:29:00');

-- --------------------------------------------------------

--
-- Table structure for table `gallery_albums`
--

DROP TABLE IF EXISTS `gallery_albums`;
CREATE TABLE IF NOT EXISTS `gallery_albums` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cover_media_id` bigint UNSIGNED DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gallery_albums_slug_unique` (`slug`),
  KEY `gallery_albums_cover_media_id_index` (`cover_media_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Gallery albums / filter chips (field documentation, relief, education, health)';

--
-- Dumping data for table `gallery_albums`
--

INSERT INTO `gallery_albums` (`id`, `slug`, `name`, `description`, `cover_media_id`, `is_published`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'field', 'توثيق الميدان', NULL, NULL, 1, 1, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(2, 'relief', 'الإغاثة', NULL, NULL, 1, 2, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(3, 'development', 'التعليم والتنمية', NULL, NULL, 1, 3, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(4, 'health', 'الصحة والمياه', NULL, NULL, 1, 4, '2026-09-30 21:09:43', '2026-09-30 21:09:43');

-- --------------------------------------------------------

--
-- Table structure for table `gallery_items`
--

DROP TABLE IF EXISTS `gallery_items`;
CREATE TABLE IF NOT EXISTS `gallery_items` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `gallery_album_id` bigint UNSIGNED DEFAULT NULL,
  `media_id` bigint UNSIGNED NOT NULL COMMENT 'Image file (or video poster)',
  `project_id` bigint UNSIGNED DEFAULT NULL COMMENT 'Optional related project',
  `governorate_id` bigint UNSIGNED DEFAULT NULL COMMENT 'Optional place',
  `type` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'image' COMMENT 'image | video',
  `video_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Only for type=video',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `caption` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alt_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `taken_at` date DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `gallery_items_gallery_album_id_index` (`gallery_album_id`),
  KEY `gallery_items_media_id_index` (`media_id`),
  KEY `gallery_items_project_id_index` (`project_id`),
  KEY `gallery_items_governorate_id_index` (`governorate_id`),
  KEY `gallery_items_is_published_sort_order_index` (`is_published`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Photos / videos in the public gallery';

--
-- Dumping data for table `gallery_items`
--

INSERT INTO `gallery_items` (`id`, `gallery_album_id`, `media_id`, `project_id`, `governorate_id`, `type`, `video_url`, `title`, `caption`, `alt_text`, `taken_at`, `is_published`, `sort_order`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 2, 13, NULL, NULL, 'image', NULL, 'قافلة الإغاثة الكبرى', NULL, 'شاحنات قافلة الإغاثة تصل إلى جباليا', NULL, 1, 1, '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(2, 3, 1, NULL, NULL, 'image', NULL, 'أطفال غزة والحقائب المدرسية', NULL, 'أطفال يبتسمون بعد استلام الحقائب المدرسية', NULL, 1, 2, '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(3, 4, 18, NULL, NULL, 'image', NULL, 'العيادة الميدانية', NULL, 'طاقم طبي داخل عيادة خيمة ميدانية', NULL, 1, 3, '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(4, 4, 16, NULL, NULL, 'image', NULL, 'نقطة مياه الشرب', NULL, 'نازحون يملؤون عبوات المياه من صهريج', NULL, 1, 4, '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(5, 1, 15, NULL, NULL, 'image', NULL, 'نقطة توزيع السلال', NULL, 'فريق يجهز السلال الغذائية في نقطة توزيع', NULL, 1, 5, '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(6, 2, 19, NULL, NULL, 'image', NULL, 'حزم الدفء الشتوية', NULL, 'توزيع أغطية شتوية على الأسر النازحة', NULL, 1, 6, '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(7, 3, 20, NULL, NULL, 'image', NULL, 'خيم التعلّم', NULL, 'أطفال في حلقة تعلّم داخل خيمة مدرسية', NULL, 1, 7, '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(8, 1, 2, NULL, NULL, 'image', NULL, 'توزيع المساعدات الغذائية', NULL, 'توزيع مساعدات غذائية في شمال غزة', NULL, 1, 8, '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(9, 4, 4, NULL, NULL, 'image', NULL, 'فريق العيادات', NULL, 'فريق طبي يقدم الرعاية للأطفال', NULL, 1, 9, '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(10, 4, 21, NULL, NULL, 'image', NULL, 'صهاريج خان يونس', NULL, 'توزيع مياه صالحة للشرب في خان يونس', NULL, 1, 10, '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(11, 3, 6, NULL, NULL, 'image', NULL, 'الخيمة التعليمية السادسة', NULL, 'أطفال في افتتاح الخيمة التعليمية', NULL, 1, 11, '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(12, 1, 17, NULL, NULL, 'image', NULL, 'مراكز الإيواء', NULL, 'انتظار الوجبات الساخنة في مراكز الإيواء', NULL, 1, 12, '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `governorates`
--

DROP TABLE IF EXISTS `governorates`;
CREATE TABLE IF NOT EXISTS `governorates` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'north-gaza | gaza | deir-al-balah | khan-younis | rafah',
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Arabic display name',
  `note` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Short text shown on the impact map panel',
  `beneficiaries` int UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Impact map: people reached',
  `meals` int UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Impact map: meals delivered',
  `tents` int UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Impact map: tents distributed',
  `water_points` int UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Impact map: water points running',
  `distribution_points` int UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Field distribution points (dashboard overview)',
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `governorates_slug_unique` (`slug`),
  KEY `governorates_is_published_sort_order_index` (`is_published`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='The 5 Gaza governorates with their impact-map numbers (fixed list, edited not added)';

--
-- Dumping data for table `governorates`
--

INSERT INTO `governorates` (`id`, `slug`, `name`, `note`, `beneficiaries`, `meals`, `tents`, `water_points`, `distribution_points`, `is_published`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'north-gaza', 'شمال غزة', 'سلال غذائية وصهاريج مياه لمراكز الإيواء في جباليا وبيت لاهيا وبيت حانون.', 38000, 52000, 900, 14, 11, 1, 1, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(2, 'gaza', 'غزة', 'مطابخ ميدانية وتعليم مؤقت للأطفال في مدارس الإيواء بمدينة غزة.', 42000, 61000, 1100, 18, 14, 1, 2, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(3, 'deir-al-balah', 'دير البلح', 'استقبال العائلات النازحة وتوزيع الخيام والأغطية في مخيمات المحافظة الوسطى.', 30000, 44000, 1400, 12, 9, 1, 3, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(4, 'khan-younis', 'خان يونس', 'نقاط طبية متنقلة وتوزيع مياه الشرب في مناطق النزوح بخان يونس.', 40000, 57000, 1700, 16, 12, 1, 4, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(5, 'rafah', 'رفح', 'دعم الأسر النازحة بالخيام والسلال الغذائية في المناطق الجنوبية.', 30000, 39000, 1300, 10, 8, 1, 5, '2026-09-30 21:09:43', '2026-09-30 21:09:43');

-- --------------------------------------------------------

--
-- Table structure for table `hero_settings`
--

DROP TABLE IF EXISTS `hero_settings`;
CREATE TABLE IF NOT EXISTS `hero_settings` (
  `id` tinyint UNSIGNED NOT NULL DEFAULT '1' COMMENT 'Single row (id = 1)',
  `config` json NOT NULL COMMENT 'Global hero settings: enabled, height_mode/height_value/height_unit, autoplay, interval (s), arrows, dots, loop, pause_hover, scroll_hint, transition (fade|slide), speed (ms)',
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Global settings of the homepage hero slider (one row)';

--
-- Dumping data for table `hero_settings`
--

INSERT INTO `hero_settings` (`id`, `config`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, '{\"dots\": true, \"loop\": true, \"speed\": 800, \"arrows\": true, \"enabled\": true, \"autoplay\": true, \"interval\": 6, \"transition\": \"fade\", \"height_mode\": \"full\", \"height_unit\": \"vh\", \"pause_hover\": true, \"scroll_hint\": true, \"height_value\": 80, \"theme_follow\": true}', 1, '2026-10-02 16:31:52', '2026-10-04 08:16:39');

-- --------------------------------------------------------

--
-- Table structure for table `hero_slides`
--

DROP TABLE IF EXISTS `hero_slides`;
CREATE TABLE IF NOT EXISTS `hero_slides` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `is_visible` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0 = hidden on the public site',
  `label` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT 'Admin-only name of the slide',
  `duration_seconds` smallint UNSIGNED NOT NULL DEFAULT '0' COMMENT '0 = use the global interval',
  `bg_type` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'image' COMMENT 'image | video | color | gradient (copy of background.type, for filtering)',
  `content` json NOT NULL COMMENT 'badge, badge2, eyebrow, title, subtitle, btn1{visible,label,url,style,icon,new_tab}, btn2{...}',
  `style` json NOT NULL COMMENT 'v (top|middle|bottom), h (right|center|left), align, title_color, text_color, eyebrow_color, accent_color, title_size %, text_size %',
  `background` json NOT NULL COMMENT 'type, image{url,id}, video{url,poster,id}, color, gradient{type,angle,stops[]}, fit, focus_x, focus_y, zoom, grayscale, motion, overlay{mode,color,opacity,gradient}',
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hero_slides_visible_sort_index` (`is_visible`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Slides of the homepage hero (ordered by sort_order)';

--
-- Dumping data for table `hero_slides`
--

INSERT INTO `hero_slides` (`id`, `sort_order`, `is_visible`, `label`, `duration_seconds`, `bg_type`, `content`, `style`, `background`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(15, 0, 1, 'الشريحة الرئيسية', 0, 'video', '{\"btn1\": {\"url\": \"#gallery\", \"icon\": \"play_arrow\", \"label\": \"شاهد الوثائقي الميداني من غزة\", \"style\": \"gold\", \"new_tab\": false, \"visible\": true}, \"btn2\": {\"url\": \"#activities\", \"icon\": \"photo_library\", \"label\": \"أرشيف التقارير المصورة\", \"style\": \"glass\", \"new_tab\": false, \"visible\": true}, \"badge\": \"توثيق حي ومباشر من غزة\", \"title\": \"معاً نروي صمود غزة..\\n[[ونوثق الأثر الإنساني]] لحظة بلحظة\", \"badge2\": \"رصد يومي من جباليا إلى رفح\", \"eyebrow\": \"المنصة الوثائقية لإغاثة قطاع غزة\", \"subtitle\": \"من قلب القطاع، نسجّل بالصوت والصورة وصول الغذاء والدواء والمأوى إلى العائلات النازحة. هنا تُحفظ كرامة أهل غزة وتُروى قصص صمودهم يوماً بيوم.\"}', '{\"h\": \"center\", \"v\": \"middle\", \"align\": \"right\", \"text_size\": 100, \"text_color\": \"#0C7845\", \"title_size\": 100, \"title_color\": \"#0C7845\", \"accent_color\": \"#FF7000\", \"eyebrow_color\": \"#0C7845\"}', '{\"fit\": \"cover\", \"type\": \"video\", \"zoom\": 100, \"color\": \"#D9D6D2\", \"image\": {\"id\": null, \"url\": \"/assets/site/img/hero-poster.jpg\"}, \"video\": {\"id\": null, \"url\": \"/assets/site/img/video/hero.mp4\", \"poster\": \"/assets/site/img/hero-poster.jpg\"}, \"motion\": true, \"focus_x\": 26, \"focus_y\": 40, \"overlay\": {\"mode\": \"gradient\", \"color\": \"#DEDEDE\", \"opacity\": 40, \"gradient\": {\"type\": \"linear\", \"angle\": 270, \"stops\": [{\"pos\": 0, \"alpha\": 92, \"color\": \"#DEDEDE\"}, {\"pos\": 35, \"alpha\": 80, \"color\": \"#E8E2DC\"}, {\"pos\": 65, \"alpha\": 25, \"color\": \"#E4E4E4\"}, {\"pos\": 100, \"alpha\": 0, \"color\": \"#E2E2E2\"}]}}, \"gradient\": {\"type\": \"linear\", \"angle\": 135, \"stops\": [{\"pos\": 0, \"alpha\": 100, \"color\": \"#0C7845\"}, {\"pos\": 100, \"alpha\": 100, \"color\": \"#FF7000\"}]}, \"grayscale\": 100}', NULL, 1, '2026-10-02 16:46:40', '2026-10-04 08:16:39'),
(16, 1, 1, 'الشريحة الرئيسية (نسخة)', 0, 'image', '{\"btn1\": {\"url\": \"#gallery\", \"icon\": \"play_arrow\", \"label\": \"شاهد الوثائقي الميداني من غزة\", \"style\": \"gold\", \"new_tab\": false, \"visible\": true}, \"btn2\": {\"url\": \"#activities\", \"icon\": \"photo_library\", \"label\": \"أرشيف التقارير المصورة\", \"style\": \"glass\", \"new_tab\": false, \"visible\": true}, \"badge\": \"توثيق حي ومباشر من غزة\", \"title\": \"معاً نروي صمود غزة..\\n[[ونوثق الأثر الإنساني]] لحظة بلحظة\", \"badge2\": \"رصد يومي من جباليا إلى رفح\", \"eyebrow\": \"المنصة الوثائقية لإغاثة قطاع غزة\", \"subtitle\": \"من قلب القطاع، نسجّل بالصوت والصورة وصول الغذاء والدواء والمأوى إلى العائلات النازحة. هنا تُحفظ كرامة أهل غزة وتُروى قصص صمودهم يوماً بيوم.\"}', '{\"h\": \"center\", \"v\": \"middle\", \"align\": \"right\", \"text_size\": 100, \"text_color\": \"#0C7845\", \"title_size\": 100, \"title_color\": \"#0C7845\", \"accent_color\": \"#FF7000\", \"eyebrow_color\": \"#0C7845\"}', '{\"fit\": \"cover\", \"type\": \"image\", \"zoom\": 100, \"color\": \"#D9D6D2\", \"image\": {\"id\": null, \"url\": \"/assets/site/img/hero-poster.jpg\"}, \"video\": {\"id\": null, \"url\": \"/assets/site/img/video/hero.mp4\", \"poster\": \"/assets/site/img/hero-poster.jpg\"}, \"motion\": true, \"focus_x\": 35, \"focus_y\": 73, \"overlay\": {\"mode\": \"gradient\", \"color\": \"#DEDEDE\", \"opacity\": 40, \"gradient\": {\"type\": \"linear\", \"angle\": 270, \"stops\": [{\"pos\": 0, \"alpha\": 92, \"color\": \"#DEDEDE\"}, {\"pos\": 35, \"alpha\": 80, \"color\": \"#E8E2DC\"}, {\"pos\": 65, \"alpha\": 25, \"color\": \"#E4E4E4\"}, {\"pos\": 100, \"alpha\": 0, \"color\": \"#E2E2E2\"}]}}, \"gradient\": {\"type\": \"linear\", \"angle\": 135, \"stops\": [{\"pos\": 0, \"alpha\": 100, \"color\": \"#0C7845\"}, {\"pos\": 100, \"alpha\": 100, \"color\": \"#FF7000\"}]}, \"grayscale\": 100}', 1, 1, '2026-10-04 07:40:38', '2026-10-04 08:16:39');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Laravel default: queued jobs (e.g. sending emails)';

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE IF NOT EXISTS `job_batches` (
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

-- --------------------------------------------------------

--
-- Table structure for table `media_files`
--

DROP TABLE IF EXISTS `media_files`;
CREATE TABLE IF NOT EXISTS `media_files` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `disk` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'public' COMMENT 'Laravel filesystem disk',
  `path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Path relative to the disk root',
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size_bytes` bigint UNSIGNED NOT NULL DEFAULT '0',
  `width` int UNSIGNED DEFAULT NULL COMMENT 'Pixels (images)',
  `height` int UNSIGNED DEFAULT NULL COMMENT 'Pixels (images)',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alt_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Default alt text for accessibility',
  `caption` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Optional caption shown under the file in the media library',
  `uploaded_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `media_files_disk_path_index` (`disk`,`path`(191)),
  KEY `media_files_mime_type_index` (`mime_type`),
  KEY `media_files_uploaded_by_index` (`uploaded_by`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Media library: every uploaded image/file is one row, other tables point here via *_media_id';

--
-- Dumping data for table `media_files`
--

INSERT INTO `media_files` (`id`, `disk`, `path`, `original_name`, `mime_type`, `size_bytes`, `width`, `height`, `title`, `alt_text`, `caption`, `uploaded_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'public', 'img/gallery-children.jpg', 'gallery-children.jpg', 'image/jpeg', 187550, 1200, 800, NULL, NULL, NULL, NULL, '2026-09-30 21:09:43', '2026-10-02 14:14:19', NULL),
(2, 'public', 'img/project-relief.jpg', 'project-relief.jpg', 'image/jpeg', 195254, 1200, 800, NULL, NULL, NULL, NULL, '2026-09-30 21:09:43', '2026-10-02 14:14:19', NULL),
(3, 'public', 'img/project-orphan.jpg', 'project-orphan.jpg', 'image/jpeg', 74724, 1200, 847, NULL, NULL, NULL, NULL, '2026-09-30 21:09:43', '2026-10-02 15:28:09', NULL),
(4, 'public', 'img/activity-medical.jpg', 'activity-medical.jpg', 'image/jpeg', 93417, 1200, 800, NULL, NULL, NULL, NULL, '2026-09-30 21:09:43', '2026-10-02 14:14:19', NULL),
(5, 'public', 'img/activity-winter.jpg', 'activity-winter.jpg', 'image/jpeg', 49684, 1200, 795, NULL, NULL, NULL, NULL, '2026-09-30 21:09:43', '2026-10-02 14:14:19', NULL),
(6, 'public', 'img/activity-graduate.jpg', 'activity-graduate.jpg', 'image/jpeg', 188801, 1200, 800, NULL, NULL, NULL, NULL, '2026-09-30 21:09:43', '2026-10-02 14:14:19', NULL),
(7, 'public', 'img/partners/unicef.svg', 'unicef.svg', 'image/svg+xml', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-30 21:09:43', '2026-09-30 21:09:43', NULL),
(8, 'public', 'img/partners/unitednations.svg', 'unitednations.svg', 'image/svg+xml', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-30 21:09:43', '2026-09-30 21:09:43', NULL),
(9, 'public', 'img/partners/wfp.png', 'wfp.png', 'image/png', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-30 21:09:43', '2026-09-30 21:09:43', NULL),
(10, 'public', 'img/partners/who.svg', 'who.svg', 'image/svg+xml', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-30 21:09:43', '2026-09-30 21:09:43', NULL),
(11, 'public', 'img/partners/crescent.svg', 'crescent.svg', 'image/svg+xml', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-30 21:09:43', '2026-09-30 21:09:43', NULL),
(12, 'public', 'img/partners/icrc.svg', 'icrc.svg', 'image/svg+xml', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-30 21:09:43', '2026-09-30 21:09:43', NULL),
(13, 'public', 'img/gallery-convoy.jpg', 'gallery-convoy.jpg', 'image/jpeg', 296893, 1600, 1067, NULL, NULL, NULL, NULL, '2026-09-30 21:09:43', '2026-10-02 14:14:19', NULL),
(14, 'public', 'img/news-conference.jpg', 'news-conference.jpg', 'image/jpeg', 268568, 1600, 1068, NULL, 'إحاطة إعلامية عن إغاثة غزة', NULL, NULL, '2026-10-02 14:14:18', '2026-10-02 14:14:18', NULL),
(15, 'public', 'img/gallery-lab.jpg', 'gallery-lab.jpg', 'image/jpeg', 57984, 800, 533, NULL, 'شاشة حاسوب لمتابعة التوزيع', NULL, NULL, '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(16, 'public', 'img/gallery-water.jpg', 'gallery-water.jpg', 'image/jpeg', 119315, 800, 1200, NULL, 'مياه شرب', NULL, NULL, '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(17, 'public', 'img/project-parallax.jpg', 'project-parallax.jpg', 'image/jpeg', 124137, 1024, 683, NULL, 'انتظار الوجبات في مراكز الإيواء', NULL, NULL, '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(18, 'public', 'img/gallery-clinic.jpg', 'gallery-clinic.jpg', 'image/jpeg', 47326, 800, 533, NULL, 'طاقم طبي داخل عيادة خيمة ميدانية', NULL, NULL, '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(19, 'public', 'img/gallery-winter.jpg', 'gallery-winter.jpg', 'image/jpeg', 339898, 1600, 1068, NULL, 'توزيع أغطية شتوية على الأسر النازحة', NULL, NULL, '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(20, 'public', 'img/gallery-campus.jpg', 'gallery-campus.jpg', 'image/jpeg', 188801, 1200, 800, NULL, 'أطفال في حلقة تعلّم داخل خيمة مدرسية', NULL, NULL, '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(21, 'public', 'img/project-water.jpg', 'project-water.jpg', 'image/jpeg', 130449, 1200, 1796, NULL, 'توزيع مياه صالحة للشرب في خان يونس', NULL, NULL, '2026-10-02 14:14:19', '2026-10-02 14:14:19', NULL),
(29, 'public', 'uploads/2026/10/JgogpHKlgGMMHQUUuh3oZyaj.jpg', 'WhatsApp Image 2026-09-16 at 10.00.23 AM.jpeg', 'image/jpeg', 284496, 1254, 1254, 'WhatsApp Image 2026-09-16 at 10.00.23 AM', NULL, NULL, 1, '2026-10-02 15:26:13', '2026-10-02 15:26:13', NULL),
(30, 'public', 'img/project-empower.jpg', 'project-empower.jpg', 'image/jpeg', 110207, 1200, 800, NULL, 'خيام ومستلزمات الإيواء في رفح', NULL, NULL, '2026-10-02 15:28:09', '2026-10-02 15:28:09', NULL),
(90, 'public', 'uploads/2026/10/vhpkG07XW1Fx2miCjOuqN5Ul.png', 'hf_20260927_083820_b04ad05a-807a-49fc-8814-1db428a69b14.png', 'image/png', 1660277, 864, 1184, 'hf_20260927_083820_b04ad05a-807a-49fc-8814-1db428a69b14', NULL, NULL, 1, '2026-10-03 21:38:20', '2026-10-03 21:38:20', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
CREATE TABLE IF NOT EXISTS `menus` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'header | footer',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `menus_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Navigation menus (header, footer)';

--
-- Dumping data for table `menus`
--

INSERT INTO `menus` (`id`, `slug`, `name`, `created_at`, `updated_at`) VALUES
(1, 'header', 'القائمة الرئيسية', '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(2, 'footer', 'قائمة التذييل', '2026-09-30 21:09:43', '2026-09-30 21:09:43');

-- --------------------------------------------------------

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
CREATE TABLE IF NOT EXISTS `menu_items` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `menu_id` bigint UNSIGNED NOT NULL,
  `parent_id` bigint UNSIGNED DEFAULT NULL COMMENT 'Parent item for nested (2-level) menus',
  `page_id` bigint UNSIGNED DEFAULT NULL COMMENT 'Set when type = page',
  `label` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Used when type is anchor/custom (or as fallback)',
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'custom' COMMENT 'page | anchor | custom',
  `icon` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_button` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Render as highlighted call-to-action button',
  `open_in_new_tab` tinyint(1) NOT NULL DEFAULT '0',
  `is_visible` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `menu_items_menu_id_parent_id_sort_order_index` (`menu_id`,`parent_id`,`sort_order`),
  KEY `menu_items_parent_id_index` (`parent_id`),
  KEY `menu_items_page_id_index` (`page_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Menu links; self-referencing parent_id gives nested dropdowns';

--
-- Dumping data for table `menu_items`
--

INSERT INTO `menu_items` (`id`, `menu_id`, `parent_id`, `page_id`, `label`, `url`, `type`, `icon`, `is_button`, `open_in_new_tab`, `is_visible`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 1, 'الرئيسية', 'index.html', 'page', 'home', 0, 0, 1, 1, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(2, 1, NULL, 2, 'من نحن', 'about.html', 'page', 'account_balance', 0, 0, 1, 2, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(3, 1, 2, NULL, 'الرؤية والرسالة', 'about.html#vision', 'custom', 'visibility', 0, 0, 1, 1, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(4, 1, NULL, 3, 'المشاريع', 'projects.html', 'page', 'cases', 0, 0, 1, 3, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(5, 1, 4, NULL, 'التنمية المجتمعية', 'project.html?id=development', 'custom', 'diversity_3', 0, 0, 1, 1, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(6, 1, 4, NULL, 'الإطعام الطارئ ومخابز غزة', 'project.html?id=relief', 'custom', 'bakery_dining', 0, 0, 1, 2, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(7, 1, NULL, NULL, 'الأنشطة', 'index.html#activities', 'anchor', 'verified', 0, 0, 1, 4, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(8, 1, NULL, 5, 'الأخبار', 'news.html', 'page', 'newspaper', 0, 0, 1, 5, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(9, 1, NULL, NULL, 'الشركاء', 'index.html#partners', 'anchor', 'handshake', 0, 0, 1, 6, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(10, 1, NULL, 7, 'المعرض', 'gallery.html', 'page', 'perm_media', 0, 0, 1, 7, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(11, 1, NULL, NULL, 'بوابة الإدارة', 'admin/login.html', 'custom', 'admin_panel_settings', 0, 0, 1, 8, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(12, 1, NULL, 8, 'تواصل معنا', 'contact.html', 'page', 'contact_support', 0, 0, 1, 9, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(13, 1, NULL, NULL, 'ساهم في إغاثة غزة الآن', 'index.html#appeal', 'anchor', 'favorite', 1, 0, 1, 10, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(14, 2, NULL, NULL, 'روابط سريعة', NULL, 'custom', NULL, 0, 0, 1, 1, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(15, 2, 14, NULL, 'الرؤية والرسالة', 'about.html#vision', 'custom', NULL, 0, 0, 1, 1, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(16, 2, 14, NULL, 'التنمية المجتمعية', 'project.html?id=development', 'custom', NULL, 0, 0, 1, 2, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(17, 2, 14, NULL, 'تقارير إغاثة القطاع', 'index.html#activities', 'anchor', NULL, 0, 0, 1, 3, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(18, 2, 14, 5, 'المركز الإعلامي', 'news.html', 'page', NULL, 0, 0, 1, 4, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(19, 2, 14, 7, 'معرض الصور', 'gallery.html', 'page', NULL, 0, 0, 1, 5, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(20, 2, 14, NULL, 'الأسئلة الشائعة', 'index.html#faq', 'anchor', NULL, 0, 0, 1, 6, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(21, 2, 14, 8, 'تواصل معنا', 'contact.html', 'page', NULL, 0, 0, 1, 7, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(22, 2, NULL, NULL, 'سياسة الخصوصية', '#', 'custom', NULL, 0, 0, 1, 2, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(23, 2, NULL, NULL, 'لوائح الحوكمة', '#', 'custom', NULL, 0, 0, 1, 3, '2026-09-30 21:09:44', '2026-09-30 21:09:44'),
(24, 2, NULL, NULL, 'بوابة الموظفين', 'admin/login.html', 'custom', NULL, 0, 0, 1, 4, '2026-09-30 21:09:44', '2026-09-30 21:09:44');

-- --------------------------------------------------------

--
-- Table structure for table `newsletter_subscribers`
--

DROP TABLE IF EXISTS `newsletter_subscribers`;
CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Footer newsletter sign-ups (email only)';

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID (Laravel database notifications)',
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Notification class name',
  `notifiable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Polymorphic owner type (App\\Models\\User)',
  `notifiable_id` bigint UNSIGNED NOT NULL COMMENT 'Polymorphic owner id',
  `data` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'JSON payload: icon, title, text, url, tone',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Admin dashboard bell notifications (Laravel notifications table)';

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES
('a2e64505-28cb-40f2-beda-9fdfa50c98ee', 'admin.message_new', 'App\\Models\\User', 1, '{\"event\":\"message_new\",\"title\":\"رسالة جديدة من ئسقلبئسقلب\",\"body\":\"sdtgedetgs\",\"icon\":\"mail\",\"tone\":\"info\",\"module\":\"messages\",\"url\":\"/admin/messages?id=30\",\"meta\":null}', '2026-10-04 07:29:34', '2026-10-04 07:27:21', '2026-10-04 07:29:34');

-- --------------------------------------------------------

--
-- Table structure for table `pages`
--

DROP TABLE IF EXISTS `pages`;
CREATE TABLE IF NOT EXISTS `pages` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `author_id` bigint UNSIGNED DEFAULT NULL,
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'home for the homepage; otherwise about, projects, news, ...',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kind` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'static' COMMENT 'home | static | list | template',
  `template` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Blade view / layout name',
  `icon` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` varchar(320) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_media_id` bigint UNSIGNED DEFAULT NULL COMMENT 'Social share image',
  `body` longtext COLLATE utf8mb4_unicode_ci COMMENT 'Free rich content for simple pages (e.g. privacy policy)',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft' COMMENT 'published | draft | hidden',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pages_slug_unique` (`slug`),
  KEY `pages_author_id_index` (`author_id`),
  KEY `pages_og_media_id_index` (`og_media_id`),
  KEY `pages_status_sort_order_index` (`status`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CMS pages with SEO fields (home, about, projects, news, gallery, contact, privacy, ...)';

--
-- Dumping data for table `pages`
--

INSERT INTO `pages` (`id`, `author_id`, `slug`, `title`, `kind`, `template`, `icon`, `seo_title`, `meta_description`, `og_media_id`, `body`, `status`, `sort_order`, `published_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, NULL, 'home', 'الرئيسية', 'home', 'index', 'home', 'جمعية الشمال للتنمية والتطوير المجتمعي', 'مؤسسة إنسانية تعمل على إغاثة أهل غزة: برامج إغاثية وإنشائية وتنموية وصحية وفق معايير الحوكمة والشفافية.', NULL, NULL, 'published', 1, '2026-09-30 21:09:43', '2026-09-30 21:09:43', '2026-10-02 16:40:41', NULL),
(2, NULL, 'about', 'من نحن', 'static', 'about', 'account_balance', 'من نحن — جمعية الشمال للتنمية والتطوير المجتمعي', 'تعرّف على جمعية الشمال للتنمية والتطوير المجتمعي: قصتنا ومسيرتنا، رؤيتنا ورسالتنا وقيمنا، وكيف نعمل داخل القطاع.', NULL, NULL, 'published', 2, '2026-09-30 21:09:43', '2026-09-30 21:09:43', '2026-10-02 16:40:41', NULL),
(3, NULL, 'projects', 'المشاريع والبرامج', 'list', 'projects', 'cases', 'المشاريع والبرامج — جمعية الشمال للتنمية والتطوير المجتمعي', 'مبادرات الإغاثة المعتمدة داخل قطاع غزة: المخابز، المياه، الإيواء، والتنمية المجتمعية — مع تفاصيل التنفيذ.', NULL, NULL, 'published', 3, '2026-09-30 21:09:43', '2026-09-30 21:09:43', '2026-10-02 16:40:41', NULL),
(4, NULL, 'project', 'تفاصيل المشروع', 'template', 'project', 'favorite', 'تفاصيل المشروع — جمعية الشمال للتنمية والتطوير المجتمعي', 'تفاصيل مبادرة إغاثة داخل قطاع غزة: نطاق التنفيذ، ما يغطيه المشروع، الصور والتحديثات.', NULL, NULL, 'published', 4, '2026-09-30 21:09:43', '2026-09-30 21:09:43', '2026-10-02 16:40:41', NULL),
(5, NULL, 'news', 'الأخبار', 'list', 'news', 'newspaper', 'الأخبار — جمعية الشمال للتنمية والتطوير المجتمعي', 'آخر الأخبار وتقارير الشفافية من قطاع غزة: بيانات، تنمية مجتمعية، توثيق الميدان، وأنشطة ميدانية.', NULL, NULL, 'published', 5, '2026-09-30 21:09:43', '2026-09-30 21:09:43', '2026-10-02 16:40:41', NULL),
(6, NULL, 'article', 'صفحة الخبر', 'template', 'article', 'article', 'صفحة الخبر — جمعية الشمال للتنمية والتطوير المجتمعي', 'تفاصيل الخبر من المركز الإعلامي لجمعية الشمال للتنمية والتطوير المجتمعي.', NULL, NULL, 'published', 6, '2026-09-30 21:09:43', '2026-09-30 21:09:43', '2026-10-02 16:40:41', NULL),
(7, NULL, 'gallery', 'معرض الصور', 'static', 'gallery', 'perm_media', 'معرض الصور — جمعية الشمال للتنمية والتطوير المجتمعي', 'معرض التوثيق الميداني في غزة: صور وفيديو لوصول السلال والخيام والدواء إلى مستحقيها في مخيمات النزوح.', NULL, NULL, 'published', 7, '2026-09-30 21:09:43', '2026-09-30 21:09:43', '2026-10-02 16:40:41', NULL),
(8, NULL, 'contact', 'تواصل معنا', 'static', 'contact', 'contact_support', 'تواصل معنا — جمعية الشمال للتنمية والتطوير المجتمعي', 'تواصل مع فريق جمعية الشمال للتنمية والتطوير المجتمعي: الخط الساخن، واتساب، البريد الإلكتروني، وغرفة التنسيق في القاهرة.', NULL, NULL, 'published', 8, '2026-09-30 21:09:43', '2026-09-30 21:09:43', '2026-10-02 16:40:41', NULL),
(9, NULL, 'privacy', 'سياسة الخصوصية', 'static', 'privacy', 'shield_lock', 'سياسة الخصوصية — جمعية الشمال للتنمية والتطوير المجتمعي', 'كيف نجمع بيانات المستخدمين ونحميها ونستخدمها.', NULL, NULL, 'draft', 9, NULL, '2026-09-30 21:09:43', '2026-10-02 16:40:41', NULL),
(10, NULL, 'governance', 'لوائح الحوكمة', 'static', 'governance', 'gavel', 'لوائح الحوكمة والشفافية — جمعية الشمال للتنمية والتطوير المجتمعي', 'اللوائح الداخلية وسياسات الحوكمة والتدقيق المالي لجمعية الشمال للتنمية والتطوير المجتمعي، وآلية الإفصاح عن التقارير السنوية.', NULL, NULL, 'hidden', 10, NULL, '2026-09-30 21:09:43', '2026-10-02 16:40:41', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `page_sections`
--

DROP TABLE IF EXISTS `page_sections`;
CREATE TABLE IF NOT EXISTS `page_sections` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `page_id` bigint UNSIGNED NOT NULL,
  `section_key` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Anchor id on the page: hero, about, projects, stories, ...',
  `type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'content' COMMENT 'hero | content | cards | list | dynamic (filled from another table)',
  `label` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Admin-only name of the section',
  `eyebrow` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Small heading above the title',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Main heading',
  `subtitle` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body` text COLLATE utf8mb4_unicode_ci,
  `media_id` bigint UNSIGNED DEFAULT NULL COMMENT 'Background / section image',
  `settings` json DEFAULT NULL COMMENT 'Extra layout options (tone, limits, ...)',
  `is_visible` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Show/hide switch in the admin',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Drag-and-drop order',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `page_sections_page_id_section_key_unique` (`page_id`,`section_key`),
  KEY `page_sections_media_id_index` (`media_id`),
  KEY `page_sections_page_id_sort_order_index` (`page_id`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ordered sections of a page; the homepage sections manager edits these rows';

--
-- Dumping data for table `page_sections`
--

INSERT INTO `page_sections` (`id`, `page_id`, `section_key`, `type`, `label`, `eyebrow`, `title`, `subtitle`, `body`, `media_id`, `settings`, `is_visible`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 1, 'hero', 'hero', 'الواجهة الرئيسية', 'المنصة الوثائقية لإغاثة قطاع غزة', 'معاً نروي صمود غزة.. ونوثق الأثر الإنساني لحظة بلحظة', NULL, NULL, NULL, '{\"icon\": \"wallpaper\", \"tone\": \"dark\", \"urgent\": false}', 1, 1, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(2, 1, 'announcements', 'dynamic', 'شريط الإعلانات', NULL, 'آخر الإعلانات', NULL, NULL, NULL, '{\"icon\": \"campaign\", \"tone\": \"amber\", \"urgent\": false}', 1, 2, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(3, 1, 'about', 'content', 'من نحن', 'التعريف والمسيرة في غزة', 'سنوات من العمل لإغاثة أهل غزة وصون كرامتهم', NULL, NULL, NULL, '{\"icon\": \"account_balance\", \"tone\": \"light\", \"urgent\": false}', 1, 3, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(4, 1, 'projects', 'dynamic', 'المشاريع والمبادرات', 'مشاريع وبرامج غزة', 'مبادرات الإغاثة المعتمدة داخل القطاع', NULL, NULL, NULL, '{\"icon\": \"cases\", \"tone\": \"sand\", \"urgent\": false}', 1, 4, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(5, 1, 'stories', 'dynamic', 'قصص من الميدان', 'قصص من الميدان', 'أصوات من خيام النزوح.. حكايات تصنعها مساهمتك', NULL, NULL, NULL, '{\"icon\": \"auto_stories\", \"tone\": \"light\", \"urgent\": false}', 1, 5, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(6, 1, 'pillars', 'cards', 'ركائز الإغاثة', NULL, 'ركائز الإغاثة داخل قطاع غزة', NULL, NULL, NULL, '{\"icon\": \"foundation\", \"tone\": \"dark\", \"urgent\": false}', 1, 6, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(7, 1, 'activities', 'dynamic', 'الأنشطة الميدانية', 'غزة تتكلم من الميدان', 'أنشطة ميدانية موثّقة داخل القطاع', NULL, NULL, NULL, '{\"icon\": \"verified\", \"tone\": \"light\", \"urgent\": false}', 1, 7, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(8, 1, 'appeal', 'dynamic', 'نداء الإغاثة العاجل', 'حملة السلال والخيام والمياه', 'خبز اليوم يصل للخيمة.. وماؤك لا ينقطع عن النازحين', NULL, NULL, NULL, '{\"icon\": \"e911_emergency\", \"tone\": \"urgent\", \"urgent\": true}', 1, 8, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(9, 1, 'impact-map', 'dynamic', 'خريطة الأثر', 'خريطة الأثر', 'أثر الإغاثة في محافظات القطاع الخمس', NULL, NULL, NULL, '{\"icon\": \"map\", \"tone\": \"dark\", \"urgent\": false}', 1, 9, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(10, 1, 'news', 'dynamic', 'آخر الأخبار', 'بيانات إغاثة غزة', 'آخر الأخبار وتقارير الشفافية من القطاع', NULL, NULL, NULL, '{\"icon\": \"newspaper\", \"tone\": \"sand\", \"urgent\": false}', 1, 10, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(11, 1, 'partners', 'dynamic', 'الشركاء', 'شركاء إغاثة غزة', 'تحالفات الخير لأهل القطاع', NULL, NULL, NULL, '{\"icon\": \"handshake\", \"tone\": \"dark\", \"urgent\": false}', 1, 11, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(12, 1, 'gallery', 'dynamic', 'معرض الصور', 'مرئيات من قطاع غزة', 'معرض التوثيق الميداني في غزة', NULL, NULL, NULL, '{\"icon\": \"perm_media\", \"tone\": \"light\", \"urgent\": false}', 1, 12, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(13, 1, 'contact', 'content', 'تواصل معنا', 'التواصل لدعم إغاثة غزة', 'نحن في خدمتك لكل استفسار عن القطاع', NULL, NULL, NULL, '{\"icon\": \"contact_support\", \"tone\": \"sand\", \"urgent\": false}', 1, 13, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(14, 1, 'faq', 'dynamic', 'الأسئلة الشائعة', 'الأسئلة الشائعة', 'إجابات واضحة قبل أن تتبرع', NULL, NULL, NULL, '{\"icon\": \"quiz\", \"tone\": \"light\", \"urgent\": false}', 1, 14, '2026-09-30 21:09:43', '2026-09-30 21:09:43');

-- --------------------------------------------------------

--
-- Table structure for table `page_section_blocks`
--

DROP TABLE IF EXISTS `page_section_blocks`;
CREATE TABLE IF NOT EXISTS `page_section_blocks` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `page_section_id` bigint UNSIGNED NOT NULL,
  `type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'card' COMMENT 'card | stat | text | link | timeline_item | ...',
  `icon` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `text` text COLLATE utf8mb4_unicode_ci,
  `value` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Big number for stat blocks, e.g. 180K+',
  `media_id` bigint UNSIGNED DEFAULT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data` json DEFAULT NULL COMMENT 'Extra per-block options',
  `is_visible` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `page_section_blocks_page_section_id_sort_order_index` (`page_section_id`,`sort_order`),
  KEY `page_section_blocks_media_id_index` (`media_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Small repeatable items inside a section (hero stats, pillar cards, about timeline, ...)';

--
-- Dumping data for table `page_section_blocks`
--

INSERT INTO `page_section_blocks` (`id`, `page_section_id`, `type`, `icon`, `title`, `text`, `value`, `media_id`, `url`, `data`, `is_visible`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 1, 'stat', 'favorite', 'مستفيد في غزة', NULL, '180K+', NULL, NULL, NULL, 1, 1, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(2, 1, 'stat', 'verified', 'محافظات القطاع', NULL, '5', NULL, NULL, NULL, 1, 2, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(3, 1, 'stat', '4k', 'مقطع موثّق من غزة', NULL, '+2,500', NULL, NULL, NULL, 1, 3, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(4, 1, 'stat', 'shield', 'نسبة الشفافية والتدقيق', NULL, '98.4%', NULL, NULL, NULL, 1, 4, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(5, 6, 'card', 'crisis_alert', 'الإغاثة العاجلة والحرجة', 'فرق ميدانية داخل غزة لإيصال الطحين والوجبات والخيام إلى مراكز الإيواء في أوقات القصف والنزوح.', NULL, NULL, NULL, NULL, 1, 1, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(6, 6, 'card', 'school', 'تعليم أطفال غزة', 'خيم تعليمية وحقائب مدرسية ودعم نفسي للأيتام النازحين بعد تعطّل المدارس في القطاع.', NULL, NULL, NULL, NULL, 1, 2, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(7, 6, 'card', 'night_shelter', 'إيواء الأسر النازحة', 'توفير الخيام والأغطية ومستلزمات النظافة للعائلات التي نزحت من الشمال إلى وسط وجنوب القطاع.', NULL, NULL, NULL, NULL, 1, 3, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(8, 6, 'card', 'health_and_safety', 'الصحة والمياه في غزة', 'عيادات ميدانية، أدوية مزمنة، وصهاريج مياه صالحة للشرب لمخيمات النزوح وشبكات الإيواء.', NULL, NULL, NULL, NULL, 1, 4, '2026-09-30 21:09:43', '2026-09-30 21:09:43');

-- --------------------------------------------------------

--
-- Table structure for table `partners`
--

DROP TABLE IF EXISTS `partners`;
CREATE TABLE IF NOT EXISTS `partners` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tag_label` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Partnership type, e.g. international partner',
  `tag_icon` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_media_id` bigint UNSIGNED DEFAULT NULL,
  `website_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `partners_logo_media_id_index` (`logo_media_id`),
  KEY `partners_is_published_sort_order_index` (`is_published`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Partner organizations with logo';

--
-- Dumping data for table `partners`
--

INSERT INTO `partners` (`id`, `name`, `tag_label`, `tag_icon`, `description`, `logo_media_id`, `website_url`, `is_published`, `sort_order`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'منظمة يونيسف', 'شريك دولي', 'child_care', 'نتعاون مع اليونيسف لتوفير الحماية والتعليم الطارئ لأطفال غزة، ودعم برامج التغذية والمياه النظيفة.', 7, NULL, 0, 2, '2026-09-30 21:09:43', '2026-10-05 08:25:25', NULL),
(2, 'الأمم المتحدة', 'هيئة أممية', 'public', 'بالتنسيق مع الأمم المتحدة نوثّق الاحتياجات الإنسانية وننسّق قوافل الإغاثة الداخلة إلى القطاع.', 8, NULL, 1, 1, '2026-09-30 21:09:43', '2026-10-05 08:25:25', NULL),
(3, 'برنامج الغذاء العالمي', 'أمن غذائي', 'nutrition', 'نشارك برنامج الغذاء العالمي في توزيع السلال الغذائية والوجبات الجاهزة على العائلات النازحة.', 9, NULL, 1, 3, '2026-09-30 21:09:43', '2026-10-05 08:25:25', NULL),
(4, 'منظمة الصحة العالمية', 'رعاية صحية', 'medical_services', 'ندعم مع منظمة الصحة العالمية تشغيل النقاط الطبية الميدانية وتأمين الأدوية الأساسية.', 10, NULL, 1, 4, '2026-09-30 21:09:43', '2026-10-05 08:25:25', NULL),
(5, 'الهلال الأحمر', 'إغاثة عاجلة', 'emergency', 'نتكامل مع فرق الهلال الأحمر في الإخلاء الطبي وتوزيع الإغاثة العاجلة داخل غزة.', 11, NULL, 1, 5, '2026-09-30 21:09:43', '2026-10-05 08:25:25', NULL),
(6, 'اللجنة الدولية للصليب الأحمر', 'حماية إنسانية', 'shield', 'نتعاون مع اللجنة الدولية لتسهيل دخول المساعدات وحماية المدنيين وفق القانون الدولي الإنساني.', 12, NULL, 1, 6, '2026-09-30 21:09:43', '2026-10-05 08:25:25', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Laravel default: password reset tokens';

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `perm_key` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '<module>.<action>, e.g. news.publish',
  `module` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'dashboard, news, gallery, users, ...',
  `action` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'view, create, edit, delete, publish, export, manage',
  `name_ar` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_perm_key_unique` (`perm_key`),
  KEY `permissions_module_index` (`module`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='All permissions of the dashboard (module.action)';

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `perm_key`, `module`, `action`, `name_ar`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'dashboard.view', 'dashboard', 'view', 'عرض لوحة التحكم', 0, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(2, 'reports.view', 'reports', 'view', 'عرض التقارير والإحصائيات', 1, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(3, 'reports.export', 'reports', 'export', 'تصدير التقارير', 2, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(4, 'homepage.view', 'homepage', 'view', 'عرض الصفحة الرئيسية', 3, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(5, 'homepage.edit', 'homepage', 'edit', 'تعديل الصفحة الرئيسية', 4, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(6, 'projects.view', 'projects', 'view', 'عرض المشاريع', 5, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(7, 'projects.create', 'projects', 'create', 'إضافة المشاريع', 6, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(8, 'projects.edit', 'projects', 'edit', 'تعديل المشاريع', 7, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(9, 'projects.delete', 'projects', 'delete', 'حذف المشاريع', 8, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(10, 'projects.publish', 'projects', 'publish', 'نشر المشاريع', 9, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(11, 'news.view', 'news', 'view', 'عرض الأخبار', 10, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(12, 'news.create', 'news', 'create', 'إضافة الأخبار', 11, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(13, 'news.edit', 'news', 'edit', 'تعديل الأخبار', 12, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(14, 'news.delete', 'news', 'delete', 'حذف الأخبار', 13, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(15, 'news.publish', 'news', 'publish', 'نشر الأخبار', 14, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(16, 'gallery.view', 'gallery', 'view', 'عرض معرض الصور', 15, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(17, 'gallery.create', 'gallery', 'create', 'إضافة معرض الصور', 16, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(18, 'gallery.edit', 'gallery', 'edit', 'تعديل معرض الصور', 17, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(19, 'gallery.delete', 'gallery', 'delete', 'حذف معرض الصور', 18, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(20, 'gallery.publish', 'gallery', 'publish', 'نشر معرض الصور', 19, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(21, 'stories.view', 'stories', 'view', 'عرض قصص الميدان', 20, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(22, 'stories.create', 'stories', 'create', 'إضافة قصص الميدان', 21, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(23, 'stories.edit', 'stories', 'edit', 'تعديل قصص الميدان', 22, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(24, 'stories.delete', 'stories', 'delete', 'حذف قصص الميدان', 23, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(25, 'stories.publish', 'stories', 'publish', 'نشر قصص الميدان', 24, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(26, 'activities.view', 'activities', 'view', 'عرض الأنشطة الميدانية', 25, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(27, 'activities.create', 'activities', 'create', 'إضافة الأنشطة الميدانية', 26, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(28, 'activities.edit', 'activities', 'edit', 'تعديل الأنشطة الميدانية', 27, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(29, 'activities.delete', 'activities', 'delete', 'حذف الأنشطة الميدانية', 28, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(30, 'partners.view', 'partners', 'view', 'عرض الشركاء', 29, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(31, 'partners.create', 'partners', 'create', 'إضافة الشركاء', 30, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(32, 'partners.edit', 'partners', 'edit', 'تعديل الشركاء', 31, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(33, 'partners.delete', 'partners', 'delete', 'حذف الشركاء', 32, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(34, 'faq.view', 'faq', 'view', 'عرض الأسئلة الشائعة', 33, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(35, 'faq.create', 'faq', 'create', 'إضافة الأسئلة الشائعة', 34, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(36, 'faq.edit', 'faq', 'edit', 'تعديل الأسئلة الشائعة', 35, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(37, 'faq.delete', 'faq', 'delete', 'حذف الأسئلة الشائعة', 36, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(38, 'appeal.view', 'appeal', 'view', 'عرض نداء الإغاثة', 37, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(39, 'appeal.create', 'appeal', 'create', 'إضافة نداء الإغاثة', 38, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(40, 'appeal.edit', 'appeal', 'edit', 'تعديل نداء الإغاثة', 39, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(41, 'appeal.delete', 'appeal', 'delete', 'حذف نداء الإغاثة', 40, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(42, 'impact.view', 'impact', 'view', 'عرض خريطة الأثر', 41, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(43, 'impact.edit', 'impact', 'edit', 'تعديل خريطة الأثر', 42, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(44, 'pages.view', 'pages', 'view', 'عرض الصفحات', 43, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(45, 'pages.create', 'pages', 'create', 'إضافة الصفحات', 44, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(46, 'pages.edit', 'pages', 'edit', 'تعديل الصفحات', 45, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(47, 'pages.delete', 'pages', 'delete', 'حذف الصفحات', 46, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(48, 'pages.publish', 'pages', 'publish', 'نشر الصفحات', 47, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(49, 'menu.view', 'menu', 'view', 'عرض القائمة', 48, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(50, 'menu.create', 'menu', 'create', 'إضافة القائمة', 49, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(51, 'menu.edit', 'menu', 'edit', 'تعديل القائمة', 50, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(52, 'menu.delete', 'menu', 'delete', 'حذف القائمة', 51, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(53, 'messages.view', 'messages', 'view', 'عرض الرسائل والطلبات', 52, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(54, 'messages.edit', 'messages', 'edit', 'معالجة الرسائل (قراءة وأرشفة)', 53, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(55, 'messages.delete', 'messages', 'delete', 'حذف الرسائل والطلبات', 54, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(56, 'users.view', 'users', 'view', 'عرض مستخدمو النظام', 55, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(57, 'users.create', 'users', 'create', 'إضافة مستخدمو النظام', 56, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(58, 'users.edit', 'users', 'edit', 'تعديل مستخدمو النظام', 57, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(59, 'users.delete', 'users', 'delete', 'حذف مستخدمو النظام', 58, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(60, 'roles.view', 'roles', 'view', 'عرض الأدوار والصلاحيات', 59, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(61, 'roles.create', 'roles', 'create', 'إضافة الأدوار والصلاحيات', 60, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(62, 'roles.edit', 'roles', 'edit', 'تعديل الأدوار والصلاحيات', 61, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(63, 'roles.delete', 'roles', 'delete', 'حذف الأدوار والصلاحيات', 62, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(64, 'settings.view', 'settings', 'view', 'عرض الإعدادات العامة', 63, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(65, 'settings.edit', 'settings', 'edit', 'تعديل الإعدادات العامة', 64, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(66, 'constants.view', 'constants', 'view', 'عرض ثوابت النظام', 65, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(67, 'constants.manage', 'constants', 'manage', 'إدارة ثوابت النظام (إضافة وتعديل وحذف)', 66, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(68, 'backup.view', 'backup', 'view', 'عرض النسخ الاحتياطي', 67, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(69, 'backup.manage', 'backup', 'manage', 'إدارة النسخ الاحتياطي', 68, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(70, 'audit.view', 'audit', 'view', 'عرض سجل النشاط', 69, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(71, 'audit.export', 'audit', 'export', 'تصدير سجل النشاط', 70, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(72, 'announcements.view', 'announcements', 'view', 'عرض الإعلانات', 72, '2026-10-02 15:46:08', '2026-10-02 15:46:08'),
(73, 'announcements.create', 'announcements', 'create', 'إضافة إعلان', 73, '2026-10-02 15:46:08', '2026-10-02 15:46:08'),
(74, 'announcements.edit', 'announcements', 'edit', 'تعديل الإعلانات', 74, '2026-10-02 15:46:08', '2026-10-02 15:46:08'),
(75, 'announcements.delete', 'announcements', 'delete', 'حذف إعلان', 75, '2026-10-02 15:46:08', '2026-10-02 15:46:08'),
(76, 'media.view', 'media', 'view', 'عرض مكتبة الوسائط', 76, '2026-10-02 21:23:25', '2026-10-02 21:23:25'),
(77, 'media.create', 'media', 'create', 'رفع ملفات إلى مكتبة الوسائط', 77, '2026-10-02 21:23:25', '2026-10-02 21:23:25'),
(78, 'media.edit', 'media', 'edit', 'تعديل بيانات ملفات الوسائط', 78, '2026-10-02 21:23:25', '2026-10-02 21:23:25'),
(79, 'media.delete', 'media', 'delete', 'حذف ملفات الوسائط', 79, '2026-10-02 21:23:25', '2026-10-02 21:23:25'),
(80, 'tags.view', 'tags', 'view', 'عرض الوسوم', 80, '2026-10-02 21:23:25', '2026-10-02 21:23:25'),
(81, 'tags.create', 'tags', 'create', 'إضافة وسوم', 81, '2026-10-02 21:23:25', '2026-10-02 21:23:25'),
(82, 'tags.edit', 'tags', 'edit', 'تعديل ودمج الوسوم', 82, '2026-10-02 21:23:25', '2026-10-02 21:23:25'),
(83, 'tags.delete', 'tags', 'delete', 'حذف الوسوم', 83, '2026-10-02 21:23:25', '2026-10-02 21:23:25'),
(84, 'vision.view', 'vision', 'view', 'عرض الرؤية والرسالة والقيم', 84, '2026-10-03 06:48:21', '2026-10-03 06:48:21'),
(85, 'vision.edit', 'vision', 'edit', 'تعديل الرؤية والرسالة والقيم', 85, '2026-10-03 06:48:21', '2026-10-03 06:48:21');

-- --------------------------------------------------------

--
-- Table structure for table `programs`
--

DROP TABLE IF EXISTS `programs`;
CREATE TABLE IF NOT EXISTS `programs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'relief | construction | development | health',
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Arabic display name',
  `icon` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Material Symbols icon name',
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `programs_slug_unique` (`slug`),
  KEY `programs_is_published_sort_order_index` (`is_published`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='The 4 program areas (categories of projects): relief, construction, development, health';

--
-- Dumping data for table `programs`
--

INSERT INTO `programs` (`id`, `slug`, `name`, `icon`, `description`, `is_published`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'relief', 'برامج إغاثية', 'crisis_alert', 'الإطعام الطارئ وقوافل الطحين والسلال الغذائية لمراكز الإيواء.', 1, 1, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(2, 'construction', 'برامج إنشائية', 'construction', 'الخيام ومستلزمات الإيواء والأغطية العازلة للأسر النازحة.', 1, 2, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(3, 'development', 'برامج تنموية', 'diversity_3', 'التعليم المؤقت والتمكين الاقتصادي والدعم النفسي والاجتماعي.', 1, 3, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(4, 'health', 'برامج صحية', 'medical_services', 'العيادات الميدانية والأدوية المزمنة ومياه الشرب.', 1, 4, '2026-09-30 21:09:43', '2026-09-30 21:09:43');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
CREATE TABLE IF NOT EXISTS `projects` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `program_id` bigint UNSIGNED NOT NULL COMMENT 'Program / category',
  `governorate_id` bigint UNSIGNED DEFAULT NULL COMMENT 'Main governorate (extra places go in location_text)',
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `summary` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Short description for cards',
  `description` longtext COLLATE utf8mb4_unicode_ci COMMENT 'Full description (HTML/markdown)',
  `location_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Free-text place, e.g. North Gaza - Jabalia',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft' COMMENT 'draft | active | urgent | paused | completed (draft = not public)',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Show in homepage projects section',
  `cover_media_id` bigint UNSIGNED DEFAULT NULL,
  `cover_alt` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `badge_text` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Small label on the card, e.g. top priority',
  `badge_tone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'urgent | forest | light | mid | gold',
  `badge_icon` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `beneficiaries_count` int UNSIGNED DEFAULT NULL COMMENT 'People benefiting (number only)',
  `show_funding` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Show funding progress bar (this is NOT a donation system)',
  `funding_goal` decimal(12,2) DEFAULT NULL COMMENT 'Budget target in USD (display only)',
  `funding_raised` decimal(12,2) DEFAULT NULL COMMENT 'Amount covered so far in USD, entered manually',
  `progress_percent` tinyint UNSIGNED DEFAULT NULL COMMENT 'Funding/completion % 0-100 shown on the bar',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` varchar(320) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
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
  KEY `projects_is_featured_index` (`is_featured`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Relief / development projects shown on projects.html and project.html';

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `program_id`, `governorate_id`, `slug`, `title`, `summary`, `description`, `location_text`, `status`, `is_featured`, `cover_media_id`, `cover_alt`, `badge_text`, `badge_tone`, `badge_icon`, `beneficiaries_count`, `show_funding`, `funding_goal`, `funding_raised`, `progress_percent`, `start_date`, `end_date`, `seo_title`, `seo_description`, `sort_order`, `published_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, 'relief', 'برنامج الإطعام الطارئ ومخابز غزة', 'تأمين الطحين والوقود لتشغيل 4 مخابز خيرية وتوزيع وجبات ساخنة يومية على النازحين.', '<p>تأمين الطحين والوقود لتشغيل 4 مخابز خيرية وتوزيع وجبات ساخنة يومية على النازحين.</p>', 'شمال غزة — جباليا', 'urgent', 0, 2, 'برنامج الإطعام الطارئ ومخابز غزة', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-10-02 15:28:09', '2026-10-02 15:28:09', '2026-10-02 15:28:09', NULL),
(2, 3, 2, 'development', 'برنامج التمكين والتنمية المجتمعية', 'كفالة متكاملة للطعام والكساء والتعلّم في خيم مدرسية داخل مراكز الإيواء.', '<p>كفالة متكاملة للطعام والكساء والتعلّم في خيم مدرسية داخل مراكز الإيواء.</p>', 'مخيم الشاطئ', 'active', 0, 3, 'برنامج التمكين والتنمية المجتمعية', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2026-10-02 15:28:09', '2026-10-02 15:28:09', '2026-10-02 15:28:09', NULL),
(3, 4, 4, 'water', 'صهاريج مياه الشرب لمخيمات النزوح', 'تشغيل محطات تحلية متنقلة وصهاريج يومية لنقاط الإيواء.', '<p>تشغيل محطات تحلية متنقلة وصهاريج يومية لنقاط الإيواء.</p>', 'خان يونس ودير البلح', 'active', 0, 21, 'صهاريج مياه الشرب لمخيمات النزوح', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, '2026-10-02 15:28:09', '2026-10-02 15:28:09', '2026-10-02 15:28:09', NULL),
(4, 2, 5, 'shelter', 'خيام ومستلزمات الإيواء في رفح', 'توفير خيام عائلية ومستلزمات إيواء أساسية للأسر النازحة.', '<p>توفير خيام عائلية ومستلزمات إيواء أساسية للأسر النازحة.</p>', 'رفح', 'active', 0, 30, 'خيام ومستلزمات الإيواء في رفح', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4, '2026-10-02 15:28:09', '2026-10-02 15:28:09', '2026-10-02 15:28:09', NULL),
(5, 4, 3, 'clinics', 'العيادات الميدانية والأدوية المزمنة', 'عيادات خيام للجروح والأطفال والتوليد وصرف أدوية مزمنة.', '<p>عيادات خيام للجروح والأطفال والتوليد وصرف أدوية مزمنة.</p>', 'دير البلح', 'paused', 0, 4, 'العيادات الميدانية والأدوية المزمنة', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 5, '2026-10-02 15:28:09', '2026-10-02 15:28:09', '2026-10-02 15:28:09', NULL),
(6, 2, 5, 'winter', 'حملة دفء غزة الشتوية', 'حزم دفء وأغطية عازلة لحماية النازحين من برد الخيام.', '<p>حزم دفء وأغطية عازلة لحماية النازحين من برد الخيام.</p>', 'مخيمات النزوح في رفح', 'draft', 0, 5, 'حملة دفء غزة الشتوية', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6, NULL, '2026-10-02 15:28:09', '2026-10-02 15:28:09', NULL),
(7, 3, 2, 'learning', 'الخيمة التعليمية السادسة لأطفال غزة', 'حلقات تعلّم مؤقتة في القراءة والحساب والدعم النفسي.', '<p>حلقات تعلّم مؤقتة في القراءة والحساب والدعم النفسي.</p>', 'غزة — حي الرمال', 'completed', 0, 6, 'الخيمة التعليمية السادسة لأطفال غزة', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 7, '2026-10-02 15:28:09', '2026-10-02 15:28:09', '2026-10-02 15:28:09', NULL),
(8, 1, 3, 'convoy', 'قوافل الطحين لمراكز الإيواء', 'نقل الطحين والسلال الغذائية إلى مراكز الإيواء في الوسطى.', '<p>نقل الطحين والسلال الغذائية إلى مراكز الإيواء في الوسطى.</p>', 'دير البلح', 'active', 0, 13, 'قوافل الطحين لمراكز الإيواء', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 8, '2026-10-02 15:28:09', '2026-10-02 15:28:09', '2026-10-02 15:28:09', NULL),
(9, 4, 1, 'waterpt', 'نقطة مياه شرب إضافية في الشمال', 'تشغيل نقطة تعبئة مياه شرب إضافية في شمال القطاع.', '<p>تشغيل نقطة تعبئة مياه شرب إضافية في شمال القطاع.</p>', 'بيت لاهيا', 'active', 0, 16, 'نقطة مياه شرب إضافية في الشمال', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 9, '2026-10-02 15:28:09', '2026-10-02 15:28:09', '2026-10-02 15:28:09', NULL),
(10, 3, 4, 'kits', 'الحقيبة المدرسية للأطفال النازحين', 'حقائب وقرطاسية للأطفال في خيم التعلّم.', '<p>حقائب وقرطاسية للأطفال في خيم التعلّم.</p>', 'خان يونس', 'completed', 0, 1, 'الحقيبة المدرسية للأطفال النازحين', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 10, '2026-10-02 15:28:09', '2026-10-02 15:28:09', '2026-10-02 15:28:09', NULL),
(11, 4, 4, 'meds', 'أدوية الأمراض المزمنة لكبار السن', 'صرف شهري لأدوية الضغط والسكري للمرضى النازحين.', '<p>صرف شهري لأدوية الضغط والسكري للمرضى النازحين.</p>', 'خان يونس — المواصي', 'urgent', 0, 18, 'أدوية الأمراض المزمنة لكبار السن', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 11, '2026-10-02 15:28:09', '2026-10-02 15:28:09', '2026-10-02 15:28:09', NULL),
(12, 2, 1, 'blankets', 'أغطية عازلة لمراكز الإيواء', 'أغطية وفرشات عازلة للأسر في مراكز الإيواء.', '<p>أغطية وفرشات عازلة للأسر في مراكز الإيواء.</p>', 'جباليا', 'draft', 0, 19, 'أغطية عازلة لمراكز الإيواء', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 12, NULL, '2026-10-02 15:28:09', '2026-10-02 15:28:09', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `project_components`
--

DROP TABLE IF EXISTS `project_components`;
CREATE TABLE IF NOT EXISTS `project_components` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id` bigint UNSIGNED NOT NULL,
  `icon` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Material Symbols icon name',
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_components_project_id_sort_order_index` (`project_id`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='What the project covers (icon cards on project page)';

-- --------------------------------------------------------

--
-- Table structure for table `project_facts`
--

DROP TABLE IF EXISTS `project_facts`;
CREATE TABLE IF NOT EXISTS `project_facts` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id` bigint UNSIGNED NOT NULL,
  `label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Fact title, e.g. Scope / Beneficiaries',
  `value` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Fact value, e.g. 4 central bakeries',
  `is_accent` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Highlight this fact visually',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_facts_project_id_sort_order_index` (`project_id`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Key facts list on a project (label/value pairs)';

-- --------------------------------------------------------

--
-- Table structure for table `project_images`
--

DROP TABLE IF EXISTS `project_images`;
CREATE TABLE IF NOT EXISTS `project_images` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id` bigint UNSIGNED NOT NULL,
  `media_id` bigint UNSIGNED NOT NULL,
  `caption` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_images_project_id_media_id_unique` (`project_id`,`media_id`),
  KEY `project_images_media_id_index` (`media_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Project photo gallery (ordered, with caption)';

-- --------------------------------------------------------

--
-- Table structure for table `project_updates`
--

DROP TABLE IF EXISTS `project_updates`;
CREATE TABLE IF NOT EXISTS `project_updates` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id` bigint UNSIGNED NOT NULL,
  `author_id` bigint UNSIGNED DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `published_at` timestamp NULL DEFAULT NULL COMMENT 'Date shown in the updates timeline',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_updates_project_id_published_at_index` (`project_id`,`published_at`),
  KEY `project_updates_author_id_index` (`author_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Timeline of progress updates on a project';

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_key` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Stored in users.role: admin, manager, editor, ... (a-z, 0-9, _)',
  `name_ar` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Arabic name shown in the dashboard',
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_system` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 = built-in role: cannot be deleted. Role admin is also locked (always all permissions)',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0 = users with this role cannot sign in / use the dashboard',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_role_key_unique` (`role_key`),
  KEY `roles_sort_order_index` (`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Dashboard roles (admin, manager, editor, writer, viewer + custom)';

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `role_key`, `name_ar`, `description`, `is_system`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'مدير النظام', 'صلاحيات كاملة على كل أقسام لوحة التحكم، بما فيها المستخدمون والأدوار والإعدادات. دور محمي ولا يمكن تعديله أو تعطيله أو حذفه.', 1, 1, 0, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(2, 'manager', 'مدير المحتوى', 'يدير كل أقسام المحتوى والرسائل والتقارير (إضافة وتعديل ونشر وحذف) بدون الإعدادات والمستخدمين والأدوار.', 1, 1, 1, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(3, 'editor', 'محرر', 'يضيف ويعدّل الأخبار والمعرض والقصص والأنشطة والشركاء والأسئلة الشائعة والصفحات، بدون حذف أو نشر. يطّلع على الرسائل والمشاريع.', 1, 1, 2, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(4, 'writer', 'كاتب', 'يكتب الأخبار ويعدّلها كمسودات فقط، بدون نشر أو حذف ولا وصول لباقي الأقسام.', 1, 1, 3, '2026-10-02 14:43:41', '2026-10-02 14:43:41'),
(5, 'viewer', 'مشاهد', 'اطّلاع فقط على لوحة التحكم والتقارير وأقسام المحتوى والرسائل، بدون أي إضافة أو تعديل أو حذف.', 1, 1, 4, '2026-10-02 14:43:41', '2026-10-02 14:43:41');

-- --------------------------------------------------------

--
-- Table structure for table `role_permission`
--

DROP TABLE IF EXISTS `role_permission`;
CREATE TABLE IF NOT EXISTS `role_permission` (
  `role_id` bigint UNSIGNED NOT NULL,
  `permission_id` bigint UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `role_permission_permission_id_index` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Which permissions each role has';

--
-- Dumping data for table `role_permission`
--

INSERT INTO `role_permission` (`role_id`, `permission_id`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1),
(1, 2),
(2, 2),
(5, 2),
(1, 3),
(2, 3),
(1, 4),
(2, 4),
(3, 4),
(5, 4),
(1, 5),
(2, 5),
(1, 6),
(2, 6),
(3, 6),
(5, 6),
(1, 7),
(2, 7),
(1, 8),
(2, 8),
(1, 9),
(2, 9),
(1, 10),
(2, 10),
(1, 11),
(2, 11),
(3, 11),
(4, 11),
(5, 11),
(1, 12),
(2, 12),
(3, 12),
(4, 12),
(1, 13),
(2, 13),
(3, 13),
(4, 13),
(1, 14),
(2, 14),
(1, 15),
(2, 15),
(1, 16),
(2, 16),
(3, 16),
(5, 16),
(1, 17),
(2, 17),
(3, 17),
(1, 18),
(2, 18),
(3, 18),
(1, 19),
(2, 19),
(1, 20),
(2, 20),
(1, 21),
(2, 21),
(3, 21),
(5, 21),
(1, 22),
(2, 22),
(3, 22),
(1, 23),
(2, 23),
(3, 23),
(1, 24),
(2, 24),
(1, 25),
(2, 25),
(1, 26),
(2, 26),
(3, 26),
(5, 26),
(1, 27),
(2, 27),
(3, 27),
(1, 28),
(2, 28),
(3, 28),
(1, 29),
(2, 29),
(1, 30),
(2, 30),
(3, 30),
(5, 30),
(1, 31),
(2, 31),
(3, 31),
(1, 32),
(2, 32),
(3, 32),
(1, 33),
(2, 33),
(1, 34),
(2, 34),
(3, 34),
(5, 34),
(1, 35),
(2, 35),
(3, 35),
(1, 36),
(2, 36),
(3, 36),
(1, 37),
(2, 37),
(1, 38),
(2, 38),
(5, 38),
(1, 39),
(2, 39),
(1, 40),
(2, 40),
(1, 41),
(2, 41),
(1, 42),
(2, 42),
(5, 42),
(1, 43),
(2, 43),
(1, 44),
(2, 44),
(3, 44),
(5, 44),
(1, 45),
(2, 45),
(3, 45),
(1, 46),
(2, 46),
(3, 46),
(1, 47),
(2, 47),
(1, 48),
(2, 48),
(1, 49),
(2, 49),
(5, 49),
(1, 50),
(2, 50),
(1, 51),
(2, 51),
(1, 52),
(2, 52),
(1, 53),
(2, 53),
(3, 53),
(5, 53),
(1, 54),
(2, 54),
(1, 55),
(2, 55),
(1, 56),
(1, 57),
(1, 58),
(1, 59),
(1, 60),
(1, 61),
(1, 62),
(1, 63),
(1, 64),
(1, 65),
(1, 66),
(1, 67),
(1, 68),
(1, 69),
(1, 70),
(1, 71),
(1, 72),
(2, 72),
(5, 72),
(1, 73),
(2, 73),
(1, 74),
(2, 74),
(1, 75),
(2, 75),
(1, 76),
(2, 76),
(3, 76),
(5, 76),
(1, 77),
(2, 77),
(3, 77),
(1, 78),
(2, 78),
(3, 78),
(1, 79),
(2, 79),
(1, 80),
(2, 80),
(3, 80),
(4, 80),
(5, 80),
(1, 81),
(2, 81),
(3, 81),
(4, 81),
(1, 82),
(2, 82),
(3, 82),
(4, 82),
(1, 83),
(2, 83),
(1, 84),
(2, 84),
(3, 84),
(5, 84),
(1, 85),
(2, 85),
(3, 85);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL COMMENT 'Laravel default: indexed, no FK (guests have NULL)',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Laravel default: database session driver';

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('KEbVhlrHLKeWt0l9y83VAls8kHnHpsL3Nvu5KuAp', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieHZnRFJVYWNlc3VPcUlhYnFLbGN5SFdESDhhbXN0RDZ3aXpmRndubyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5MCI7czo1OiJyb3V0ZSI7czo0OiJob21lIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791188548),
('tzXgoM6I7xZWTeLZmIRXuaTHZeDZUPJlvbcRpzim', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoib0FzUHJ3RW9FSllQT3c3VW5Mb3NpMnVBdnQ0dGFkU2Vod3RrSlNBbiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzY6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5MC9hZG1pbi9tZXNzYWdlcyI7czo1OiJyb3V0ZSI7czoyMDoiYWRtaW4ubWVzc2FnZXMuaW5kZXgiO31zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxO3M6MTc6InBhc3N3b3JkX2hhc2hfd2ViIjtzOjY0OiI1MGFhMDNkNGIxY2I3YWNjZjQ3ZmYyNTQxYTVjNjgwMWY3ZjAxOWYzYzUzMGRiMWEzZjZlM2Q4ODhlNWM3MGNlIjt9', 1791189355);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
CREATE TABLE IF NOT EXISTS `settings` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Dotted key, e.g. org.email, site.brand_color',
  `value` text COLLATE utf8mb4_unicode_ci COMMENT 'Value stored as text; cast using `type`',
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string' COMMENT 'string | text | int | bool | json | url | color | email',
  `section` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general' COMMENT 'Settings tab: general | org | contact | seo | announcement_bar | ...',
  `label` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Label shown in the admin form (English note)',
  `is_public` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1 = safe to expose to the front-end',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_unique` (`key`),
  KEY `settings_section_sort_order_index` (`section`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=176 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Key/value site settings (org info, contact channels, SEO defaults, announcement bar)';

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `key`, `value`, `type`, `section`, `label`, `is_public`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'org.name', 'جمعية الشمال للتنمية والتطوير المجتمعي', 'string', 'org', 'Association name', 1, 1, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(2, 'org.tagline', 'لإغاثة أهل غزة ودعم صمودهم', 'string', 'org', 'Tagline', 1, 2, '2026-09-30 21:09:43', '2026-10-02 14:16:53'),
(3, 'org.license', 'HRSD-77492', 'string', 'org', 'License number', 1, 3, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(4, 'org.website', 'https://shamal-society.org', 'url', 'org', 'Public website URL', 1, 4, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(5, 'org.address', 'مكتب إغاثة غزة — القاهرة (تنسيق دخول المساعدات)', 'string', 'org', 'Coordination office address', 1, 5, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(6, 'contact.email', 'info@shamal-society.org', 'email', 'contact', 'Public email', 1, 6, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(7, 'contact.hotline', '0592945557', 'string', 'contact', 'Hotline phone', 1, 7, '2026-09-30 21:09:43', '2026-10-02 20:46:41'),
(8, 'contact.hotline_note', 'متاح 24/7', 'string', 'contact', 'Hotline availability note', 1, 8, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(9, 'contact.whatsapp', '972592945557', 'string', 'contact', 'WhatsApp number (digits only, for wa.me link)', 1, 9, '2026-09-30 21:09:43', '2026-10-02 20:46:41'),
(10, 'contact.email_response_note', 'الرد خلال ساعتين', 'string', 'contact', 'Email response time note', 1, 10, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(11, 'contact.field_points', 'جباليا وبيت حانون • غزة المدينة والشاطئ • دير البلح • خان يونس ورفح', 'string', 'contact', 'Field points line in footer', 1, 11, '2026-09-30 21:09:43', '2026-10-03 08:24:10'),
(12, 'site.brand_color', '#3D4247', 'color', 'general', 'Brand green', 1, 12, '2026-09-30 21:09:43', '2026-10-05 08:22:53'),
(13, 'site.locale', 'ar', 'string', 'general', 'Default language (site is Arabic only)', 1, 13, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(14, 'site.direction', 'rtl', 'string', 'general', 'Text direction', 1, 14, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(15, 'site.domain', 'shamal-society.org', 'string', 'general', 'Domain name', 1, 15, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(16, 'seo.default_title', 'جمعية الشمال للتنمية والتطوير المجتمعي', 'string', 'seo', 'Default browser title', 1, 16, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(17, 'seo.default_description', 'مؤسسة إنسانية تعمل على إغاثة أهل غزة: برامج إغاثية وإنشائية وتنموية وصحية وفق معايير الحوكمة والشفافية.', 'text', 'seo', 'Default meta description', 1, 17, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(18, 'seo.title_suffix', ' — جمعية الشمال للتنمية والتطوير المجتمعي', 'string', 'seo', 'Suffix added to page titles', 1, 18, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(19, 'announcement_bar.visible', '1', 'bool', 'announcement_bar', 'Show announcements bar', 1, 19, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(20, 'announcement_bar.label', 'آخر الإعلانات', 'string', 'announcement_bar', 'Bar label', 1, 20, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(21, 'footer.newsletter_title', 'النشرة البريدية', 'string', 'footer', 'Newsletter box title', 1, 21, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(22, 'footer.newsletter_text', 'اشترك لتصلك تقارير الأثر من غزة والحملات الطارئة.', 'text', 'footer', 'Newsletter box text', 1, 22, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(23, 'mail.notify_new_message', '1', 'bool', 'notifications', 'Email admins on new contact message', 0, 23, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(24, 'mail.digest_frequency', 'daily', 'string', 'notifications', 'Digest frequency: off | daily | weekly', 0, 24, '2026-09-30 21:09:43', '2026-09-30 21:09:43'),
(25, 'org.logo', '', 'string', 'org', 'logo', 1, 6, '2026-10-02 14:12:08', '2026-10-02 14:12:08'),
(26, 'org.favicon', '', 'string', 'org', 'favicon', 1, 7, '2026-10-02 14:12:08', '2026-10-02 14:12:08'),
(27, 'site.timezone', 'Asia/Gaza', 'string', 'general', 'timezone', 1, 16, '2026-10-02 14:12:08', '2026-10-02 14:12:08'),
(28, 'site.date_format', 'long', 'string', 'general', 'dateFormat', 1, 17, '2026-10-02 14:12:08', '2026-10-02 14:12:08'),
(29, 'site.maintenance', '0', 'bool', 'general', 'maintenance', 1, 18, '2026-10-02 14:12:08', '2026-10-02 19:34:28'),
(30, 'site.maintenance_message', 'نجري تحديثات لتحسين تجربتك، وسنعود خلال وقت قصير. شكراً لصبركم.', 'text', 'general', 'maintenanceMsg', 1, 19, '2026-10-02 14:12:08', '2026-10-02 19:34:28'),
(31, 'seo.title_template', '%s — جمعية الشمال للتنمية والتطوير المجتمعي', 'string', 'seo', 'titleTpl', 1, 19, '2026-10-02 14:12:08', '2026-10-02 14:12:08'),
(32, 'seo.index', '1', 'bool', 'seo', 'index', 1, 20, '2026-10-02 14:12:08', '2026-10-02 14:12:08'),
(33, 'seo.sitemap', '1', 'bool', 'seo', 'sitemap', 1, 21, '2026-10-02 14:12:08', '2026-10-02 14:12:08'),
(34, 'seo.og_image', '/assets/site/img/hero-poster.jpg', 'string', 'seo', 'ogImage', 1, 22, '2026-10-02 14:12:08', '2026-10-02 14:12:08'),
(35, 'seo.social', '{\"facebook\":\"facebook.com/shamal.society\",\"x\":\"x.com/shamal_society\",\"instagram\":\"instagram.com/shamal.society\",\"youtube\":\"youtube.com/@shamalsociety\",\"telegram\":null,\"whatsapp\":\"wa.me/972592945557\"}', 'json', 'seo', 'social', 1, 23, '2026-10-02 14:12:08', '2026-10-02 20:46:41'),
(36, 'seo.analytics_id', '', 'string', 'seo', 'analyticsId', 1, 24, '2026-10-02 14:12:08', '2026-10-02 14:12:08'),
(37, 'seo.anonymize_ip', '1', 'bool', 'seo', 'anonymizeIp', 1, 25, '2026-10-02 14:12:08', '2026-10-02 14:12:08'),
(38, 'seo.cookie_banner', '1', 'bool', 'seo', 'cookieBanner', 1, 26, '2026-10-02 14:12:08', '2026-10-02 14:12:08'),
(39, 'mail.matrix', '{\"weekly\": {\"app\": false, \"sms\": false, \"email\": true}, \"volunteer\": {\"app\": true, \"sms\": false, \"email\": false}, \"backup_done\": {\"app\": false, \"sms\": false, \"email\": true}, \"message_new\": {\"app\": true, \"sms\": false, \"email\": true}, \"project_goal\": {\"app\": true, \"sms\": false, \"email\": false}, \"news_scheduled\": {\"app\": true, \"sms\": false, \"email\": false}, \"project_urgent\": {\"app\": true, \"sms\": false, \"email\": true}, \"security_login\": {\"app\": true, \"sms\": true, \"email\": true}}', 'json', 'notifications', 'matrix', 0, 25, '2026-10-02 14:12:08', '2026-10-02 19:21:19'),
(40, 'mail.quiet', '1', 'bool', 'notifications', 'quiet', 0, 26, '2026-10-02 14:12:08', '2026-10-02 14:12:08'),
(41, 'mail.quiet_from', '22:00', 'string', 'notifications', 'quietFrom', 0, 27, '2026-10-02 14:12:08', '2026-10-02 14:12:08'),
(42, 'mail.quiet_to', '07:00', 'string', 'notifications', 'quietTo', 0, 28, '2026-10-02 14:12:08', '2026-10-02 14:12:08'),
(43, 'mail.digest_day', 'sun', 'string', 'notifications', 'digestDay', 0, 29, '2026-10-02 14:12:08', '2026-10-02 14:12:08'),
(44, 'mail.digest_email', 'admin@shamal-society.org', 'email', 'notifications', 'digestEmail', 0, 30, '2026-10-02 14:12:08', '2026-10-02 14:12:08'),
(45, 'admin.users', '{\"custom\": [], \"matrix\": {\"admin\": {\"backup_run\": true, \"pages_edit\": true, \"news_publish\": true, \"users_manage\": true, \"projects_edit\": true, \"projects_view\": true, \"settings_edit\": true, \"messages_reply\": true, \"reports_export\": true}, \"editor\": {\"backup_run\": false, \"pages_edit\": true, \"news_publish\": true, \"users_manage\": false, \"projects_edit\": true, \"projects_view\": true, \"settings_edit\": false, \"messages_reply\": true, \"reports_export\": true}, \"viewer\": {\"backup_run\": false, \"pages_edit\": false, \"news_publish\": false, \"users_manage\": false, \"projects_edit\": false, \"projects_view\": true, \"settings_edit\": false, \"messages_reply\": false, \"reports_export\": false}, \"writer\": {\"backup_run\": false, \"pages_edit\": false, \"news_publish\": true, \"users_manage\": false, \"projects_edit\": false, \"projects_view\": true, \"settings_edit\": false, \"messages_reply\": true, \"reports_export\": false}}}', 'json', 'admin', 'users', 0, 1, '2026-10-02 14:12:08', '2026-10-02 14:12:08'),
(46, 'admin.security', '{\"minLength\":10,\"upper\":true,\"number\":true,\"symbol\":false,\"reuse\":5,\"expiry\":\"90\",\"lockout\":5,\"enforce2fa\":\"admins\",\"alertNewDevice\":true,\"alertFailed\":true,\"alertCountry\":true,\"timeout\":\"60\",\"ipAllow\":false,\"ips\":[\"203.0.113.0/24\",\"198.51.100.24\"]}', 'json', 'admin', 'security', 0, 2, '2026-10-02 14:12:08', '2026-10-02 14:12:08'),
(47, 'admin.backup', '{\"schedule\":\"weekly\",\"time\":\"03:00\",\"keep\":10,\"incContent\":true,\"incSettings\":true,\"incMedia\":false,\"dest\":\"local\"}', 'json', 'admin', 'backup', 0, 3, '2026-10-02 14:12:08', '2026-10-02 14:12:08'),
(52, 'admin.appearance', '{\"theme\":\"light\",\"accent\":\"#5f8a1f\",\"scale\":\"sm\",\"density\":\"compact\",\"sidebar\":\"navy\",\"radius\":\"sharp\"}', 'json', 'admin', 'appearance', 0, 4, '2026-10-02 14:39:49', '2026-10-05 08:22:40'),
(164, 'site.hours', 'الأحد - الخميس • 8:00 ص - 4:00 م', 'string', 'general', 'hoursText', 1, 20, '2026-10-03 08:24:10', '2026-10-03 08:24:10'),
(165, 'site.hero_stat1_value', '180K+', 'string', 'general', 'heroStat1Value', 1, 21, '2026-10-03 08:24:10', '2026-10-03 08:24:10'),
(166, 'site.hero_stat1_label', 'مستفيد في غزة', 'string', 'general', 'heroStat1Label', 1, 22, '2026-10-03 08:24:10', '2026-10-03 08:24:10'),
(167, 'site.hero_stat2_value', '5', 'string', 'general', 'heroStat2Value', 1, 23, '2026-10-03 08:24:10', '2026-10-03 08:24:10'),
(168, 'site.hero_stat2_label', 'محافظات القطاع', 'string', 'general', 'heroStat2Label', 1, 24, '2026-10-03 08:24:10', '2026-10-03 08:24:10'),
(169, 'site.hero_stat3_value', '+2,500', 'string', 'general', 'heroStat3Value', 1, 25, '2026-10-03 08:24:10', '2026-10-03 08:24:10'),
(170, 'site.hero_stat3_label', 'مقطع موثّق من غزة', 'string', 'general', 'heroStat3Label', 1, 26, '2026-10-03 08:24:10', '2026-10-03 08:24:10'),
(171, 'site.hero_stat4_value', '98.4%', 'string', 'general', 'heroStat4Value', 1, 27, '2026-10-03 08:24:10', '2026-10-03 08:24:10'),
(172, 'site.hero_stat4_label', 'نسبة الشفافية والتدقيق', 'string', 'general', 'heroStat4Label', 1, 28, '2026-10-03 08:24:10', '2026-10-03 08:24:10'),
(173, 'site.theme', '{\"template\":\"black\",\"primary\":\"#3D4247\",\"accent\":\"#F9B006\",\"gradient\":{\"on\":false,\"from\":\"#3D4247\",\"to\":\"#2C2B59\",\"dir\":\"to-left\"}}', 'json', 'general', 'site_theme', 1, 29, '2026-10-03 15:31:20', '2026-10-05 08:22:53');

-- --------------------------------------------------------

--
-- Table structure for table `stories`
--

DROP TABLE IF EXISTS `stories`;
CREATE TABLE IF NOT EXISTS `stories` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Name of the person telling the story',
  `person_role` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Location / role line',
  `tag_label` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Small tag, e.g. food baskets',
  `tag_icon` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quote` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'The testimony text',
  `image_media_id` bigint UNSIGNED DEFAULT NULL,
  `image_alt` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `stories_image_media_id_index` (`image_media_id`),
  KEY `stories_is_published_sort_order_index` (`is_published`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stories from the field (homepage testimonials)';

--
-- Dumping data for table `stories`
--

INSERT INTO `stories` (`id`, `person_name`, `person_role`, `tag_label`, `tag_icon`, `quote`, `image_media_id`, `image_alt`, `is_published`, `sort_order`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'أم محمد', 'نازحة من جباليا إلى دير البلح', 'السلال الغذائية', 'shopping_basket', 'وصلتنا السلة في يوم لم يكن في الخيمة ما يكفي لعشاء الأطفال. شعرت أن أحداً ما زال يتذكرنا.', 1, 'أطفال يبتسمون في أحد مراكز الإيواء', 1, 1, '2026-09-30 21:09:43', '2026-10-02 15:54:15', NULL),
(2, 'أبو يوسف', 'متطوع توزيع — خان يونس', 'فرق التطوع', 'diversity_3', 'نبدأ قبل الفجر لتجهيز الطرود، وأجمل ما في يومنا أن نرى كل سلة تُسلَّم باليد وتوثَّق بالصورة.', 2, 'متطوعون يجهزون طرود المساعدات', 1, 2, '2026-09-30 21:09:43', '2026-10-02 15:54:15', NULL),
(3, 'سارة، 11 عاماً', 'مدرسة إيواء — مدينة غزة', 'التعليم المؤقت', 'menu_book', 'صار عندنا صف في المدرسة التي نسكنها. أحب حصة القراءة، وأحلم أن أصبح معلّمة.', 3, 'كتب وأدوات مدرسية على طاولة', 1, 3, '2026-09-30 21:09:43', '2026-10-02 15:54:15', NULL),
(4, 'الممرضة ريم', 'نقطة طبية — رفح', 'الرعاية الصحية', 'medical_services', 'الدواء الذي يصلنا يعني أن مريض السكري لن ينتظر أسبوعاً آخر. كل شحنة تصنع فرقاً حقيقياً.', 4, 'كادر طبي في نقطة رعاية صحية', 1, 5, '2026-09-30 21:09:43', '2026-10-02 15:54:15', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
CREATE TABLE IF NOT EXISTS `tags` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tags_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=9007 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Free tags for articles';

--
-- Dumping data for table `tags`
--

INSERT INTO `tags` (`id`, `slug`, `name`, `created_at`, `updated_at`) VALUES
(1, 'تقارير', 'تقارير', '2026-10-02 14:14:19', '2026-10-02 14:14:19'),
(2, 'مخابز', 'مخابز', '2026-10-02 14:14:19', '2026-10-02 14:14:19'),
(3, 'تنمية', 'تنمية', '2026-10-02 14:14:19', '2026-10-02 14:14:19'),
(4, 'كفالة', 'كفالة', '2026-10-02 14:14:19', '2026-10-02 14:14:19'),
(5, 'شفافية', 'شفافية', '2026-10-02 14:14:19', '2026-10-02 14:14:19'),
(6, 'شتاء', 'شتاء', '2026-10-02 14:14:19', '2026-10-02 14:14:19'),
(7, 'إيواء', 'إيواء', '2026-10-02 14:14:19', '2026-10-02 14:14:19'),
(8, 'صحة', 'صحة', '2026-10-02 14:14:19', '2026-10-02 14:14:19'),
(9, 'تعليم', 'تعليم', '2026-10-02 14:14:19', '2026-10-02 14:14:19'),
(10, 'قوافل', 'قوافل', '2026-10-02 14:14:19', '2026-10-02 14:14:19'),
(11, 'مياه', 'مياه', '2026-10-02 14:14:19', '2026-10-02 14:14:19'),
(14, 'تيت', 'تيت', '2026-10-02 15:28:39', '2026-10-02 15:28:39'),
(15, 'كيب', 'كيب', '2026-10-02 15:28:39', '2026-10-02 15:28:39');

-- --------------------------------------------------------

--
-- Table structure for table `translations`
--

DROP TABLE IF EXISTS `translations`;
CREATE TABLE IF NOT EXISTS `translations` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `translatable_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Polymorphic model class',
  `translatable_id` bigint UNSIGNED NOT NULL COMMENT 'Polymorphic row id',
  `locale` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'en, tr, ...',
  `field` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Column being translated, e.g. title',
  `value` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `translations_type_id_locale_field_unique` (`translatable_type`,`translatable_id`,`locale`,`field`),
  KEY `translations_locale_index` (`locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Optional polymorphic translations for future languages (empty for now)';

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
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
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Admin dashboard accounts (admin / editor)';

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `status`, `phone`, `job_title`, `avatar_path`, `last_login_at`, `remember_token`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'محمد الشنطي', 'admin@shamal-society.org', '2026-10-01 11:11:47', '$2y$12$GR0kEePR8M5L3TbKcdXG2evi3kWyDbFhzCmItTP3Sx5LhOZeiM/4G', 'admin', 'active', '0592945557', 'مسؤول النظام', 'uploads/avatars/u1-AFkai75zzBdemSSGbJIr.webp', '2026-10-05 08:29:56', 'GJosmi1U3jzw0T9AZV4gbAAfNWs1iteXAL5LJWf6WAOqVXgHQPvlHcvZ0vAK', '2026-09-30 21:09:43', '2026-10-05 08:29:56', NULL);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `activities_governorate_id_foreign` FOREIGN KEY (`governorate_id`) REFERENCES `governorates` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `activities_image_media_id_foreign` FOREIGN KEY (`image_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `activities_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `appeals`
--
ALTER TABLE `appeals`
  ADD CONSTRAINT `appeals_image_media_id_foreign` FOREIGN KEY (`image_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `articles`
--
ALTER TABLE `articles`
  ADD CONSTRAINT `articles_article_category_id_foreign` FOREIGN KEY (`article_category_id`) REFERENCES `article_categories` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `articles_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `articles_cover_media_id_foreign` FOREIGN KEY (`cover_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `articles_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `article_tag`
--
ALTER TABLE `article_tag`
  ADD CONSTRAINT `article_tag_article_id_foreign` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `article_tag_tag_id_foreign` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `backup_runs`
--
ALTER TABLE `backup_runs`
  ADD CONSTRAINT `backup_runs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `constant_items`
--
ALTER TABLE `constant_items`
  ADD CONSTRAINT `constant_items_group_id_foreign` FOREIGN KEY (`group_id`) REFERENCES `constant_groups` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD CONSTRAINT `contact_messages_handled_by_foreign` FOREIGN KEY (`handled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `gallery_albums`
--
ALTER TABLE `gallery_albums`
  ADD CONSTRAINT `gallery_albums_cover_media_id_foreign` FOREIGN KEY (`cover_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `gallery_items`
--
ALTER TABLE `gallery_items`
  ADD CONSTRAINT `gallery_items_gallery_album_id_foreign` FOREIGN KEY (`gallery_album_id`) REFERENCES `gallery_albums` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `gallery_items_governorate_id_foreign` FOREIGN KEY (`governorate_id`) REFERENCES `governorates` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `gallery_items_media_id_foreign` FOREIGN KEY (`media_id`) REFERENCES `media_files` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `gallery_items_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `media_files`
--
ALTER TABLE `media_files`
  ADD CONSTRAINT `media_files_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD CONSTRAINT `menu_items_menu_id_foreign` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `menu_items_page_id_foreign` FOREIGN KEY (`page_id`) REFERENCES `pages` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `menu_items_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pages`
--
ALTER TABLE `pages`
  ADD CONSTRAINT `pages_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `pages_og_media_id_foreign` FOREIGN KEY (`og_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `page_sections`
--
ALTER TABLE `page_sections`
  ADD CONSTRAINT `page_sections_media_id_foreign` FOREIGN KEY (`media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `page_sections_page_id_foreign` FOREIGN KEY (`page_id`) REFERENCES `pages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `page_section_blocks`
--
ALTER TABLE `page_section_blocks`
  ADD CONSTRAINT `page_section_blocks_media_id_foreign` FOREIGN KEY (`media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `page_section_blocks_page_section_id_foreign` FOREIGN KEY (`page_section_id`) REFERENCES `page_sections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `partners`
--
ALTER TABLE `partners`
  ADD CONSTRAINT `partners_logo_media_id_foreign` FOREIGN KEY (`logo_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_cover_media_id_foreign` FOREIGN KEY (`cover_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `projects_governorate_id_foreign` FOREIGN KEY (`governorate_id`) REFERENCES `governorates` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `projects_program_id_foreign` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `project_components`
--
ALTER TABLE `project_components`
  ADD CONSTRAINT `project_components_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `project_facts`
--
ALTER TABLE `project_facts`
  ADD CONSTRAINT `project_facts_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `project_images`
--
ALTER TABLE `project_images`
  ADD CONSTRAINT `project_images_media_id_foreign` FOREIGN KEY (`media_id`) REFERENCES `media_files` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `project_images_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `project_updates`
--
ALTER TABLE `project_updates`
  ADD CONSTRAINT `project_updates_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `project_updates_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD CONSTRAINT `role_permission_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permission_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stories`
--
ALTER TABLE `stories`
  ADD CONSTRAINT `stories_image_media_id_foreign` FOREIGN KEY (`image_media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL;
