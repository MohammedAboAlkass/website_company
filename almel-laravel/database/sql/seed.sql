-- =============================================================================
-- Shamal Association - seed data (lookups + real homepage content)
-- Run AFTER schema.sql.  Safe to run once on an empty database.
-- Arabic text is copied from the static site / admin dashboard files.
-- Impact numbers: taken from the impact-map data (main.js SITE_CONTENT and
--   admin impact seed); 'distribution_points' comes from admin-data.js.
-- NOT seeded on purpose (sample/demo data only): projects, news, gallery items.
-- =============================================================================
USE `almel_association`;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Admin user (PLACEHOLDER - no real password hash) ---------------------------
-- status = 'invited' so nobody can log in until you set a real password:
--   php artisan tinker  ->  User::where('email','admin@shamal-society.org')->update(['password'=>Hash::make('...'),'status'=>'active']);
INSERT INTO users (name,email,password,role,status,job_title,created_at,updated_at) VALUES
('مدير المنصة','admin@shamal-society.org','__PLACEHOLDER_REPLACE_WITH_BCRYPT_HASH__','admin','invited','مسؤول النظام',NOW(),NOW());

-- 2. Programs (4 project categories) ---------------------------------------------
INSERT INTO programs (slug,name,icon,description,is_published,sort_order,created_at,updated_at) VALUES
('relief','برامج إغاثية','crisis_alert','الإطعام الطارئ وقوافل الطحين والسلال الغذائية لمراكز الإيواء.',1,1,NOW(),NOW()),
('construction','برامج إنشائية','construction','الخيام ومستلزمات الإيواء والأغطية العازلة للأسر النازحة.',1,2,NOW(),NOW()),
('development','برامج تنموية','diversity_3','التعليم المؤقت والتمكين الاقتصادي والدعم النفسي والاجتماعي.',1,3,NOW(),NOW()),
('health','برامج صحية','medical_services','العيادات الميدانية والأدوية المزمنة ومياه الشرب.',1,4,NOW(),NOW());

-- 3. Governorates (5) with impact-map numbers ------------------------------------
INSERT INTO governorates (slug,name,note,beneficiaries,meals,tents,water_points,distribution_points,is_published,sort_order,created_at,updated_at) VALUES
('north-gaza','شمال غزة','سلال غذائية وصهاريج مياه لمراكز الإيواء في جباليا وبيت لاهيا وبيت حانون.',38000,52000,900,14,11,1,1,NOW(),NOW()),
('gaza','غزة','مطابخ ميدانية وتعليم مؤقت للأطفال في مدارس الإيواء بمدينة غزة.',42000,61000,1100,18,14,1,2,NOW(),NOW()),
('deir-al-balah','دير البلح','استقبال العائلات النازحة وتوزيع الخيام والأغطية في مخيمات المحافظة الوسطى.',30000,44000,1400,12,9,1,3,NOW(),NOW()),
('khan-younis','خان يونس','نقاط طبية متنقلة وتوزيع مياه الشرب في مناطق النزوح بخان يونس.',40000,57000,1700,16,12,1,4,NOW(),NOW()),
('rafah','رفح','دعم الأسر النازحة بالخيام والسلال الغذائية في المناطق الجنوبية.',30000,39000,1300,10,8,1,5,NOW(),NOW());

-- 4. News categories & gallery albums ------------------------------------------
INSERT INTO article_categories (slug,name,sort_order,created_at,updated_at) VALUES
('statements','بيانات وتقارير',1,NOW(),NOW()),
('development','تنمية مجتمعية',2,NOW(),NOW()),
('field','توثيق الميدان',3,NOW(),NOW()),
('activities','أنشطة ميدانية',4,NOW(),NOW());

INSERT INTO gallery_albums (slug,name,is_published,sort_order,created_at,updated_at) VALUES
('field','توثيق الميدان',1,1,NOW(),NOW()),
('relief','الإغاثة',1,2,NOW(),NOW()),
('development','التعليم والتنمية',1,3,NOW(),NOW()),
('health','الصحة والمياه',1,4,NOW(),NOW());

-- 5. Media library rows for images referenced below (paths relative to site root)
INSERT INTO media_files (disk,path,original_name,mime_type,size_bytes,created_at,updated_at) VALUES
('public','img/gallery-children.jpg','gallery-children.jpg','image/jpeg',0,NOW(),NOW()),
('public','img/project-relief.jpg','project-relief.jpg','image/jpeg',0,NOW(),NOW()),
('public','img/project-orphan.jpg','project-orphan.jpg','image/jpeg',0,NOW(),NOW()),
('public','img/activity-medical.jpg','activity-medical.jpg','image/jpeg',0,NOW(),NOW()),
('public','img/activity-winter.jpg','activity-winter.jpg','image/jpeg',0,NOW(),NOW()),
('public','img/activity-graduate.jpg','activity-graduate.jpg','image/jpeg',0,NOW(),NOW()),
('public','img/partners/unicef.svg','unicef.svg','image/svg+xml',0,NOW(),NOW()),
('public','img/partners/unitednations.svg','unitednations.svg','image/svg+xml',0,NOW(),NOW()),
('public','img/partners/wfp.png','wfp.png','image/png',0,NOW(),NOW()),
('public','img/partners/who.svg','who.svg','image/svg+xml',0,NOW(),NOW()),
('public','img/partners/crescent.svg','crescent.svg','image/svg+xml',0,NOW(),NOW()),
('public','img/partners/icrc.svg','icrc.svg','image/svg+xml',0,NOW(),NOW()),
('public','img/gallery-convoy.jpg','gallery-convoy.jpg','image/jpeg',0,NOW(),NOW());

-- 6. Stories ------------------------------------------------------------------
INSERT INTO stories (person_name,person_role,tag_label,tag_icon,quote,image_media_id,image_alt,is_published,sort_order,created_at,updated_at) VALUES
('أم محمد','نازحة من جباليا إلى دير البلح','السلال الغذائية','shopping_basket','وصلتنا السلة في يوم لم يكن في الخيمة ما يكفي لعشاء الأطفال. شعرت أن أحداً ما زال يتذكرنا.',(SELECT id FROM media_files WHERE path='img/gallery-children.jpg' LIMIT 1),'أطفال يبتسمون في أحد مراكز الإيواء',1,1,NOW(),NOW()),
('أبو يوسف','متطوع توزيع — خان يونس','فرق التطوع','diversity_3','نبدأ قبل الفجر لتجهيز الطرود، وأجمل ما في يومنا أن نرى كل سلة تُسلَّم باليد وتوثَّق بالصورة.',(SELECT id FROM media_files WHERE path='img/project-relief.jpg' LIMIT 1),'متطوعون يجهزون طرود المساعدات',1,2,NOW(),NOW()),
('سارة، 11 عاماً','مدرسة إيواء — مدينة غزة','التعليم المؤقت','menu_book','صار عندنا صف في المدرسة التي نسكنها. أحب حصة القراءة، وأحلم أن أصبح معلّمة.',(SELECT id FROM media_files WHERE path='img/project-orphan.jpg' LIMIT 1),'كتب وأدوات مدرسية على طاولة',1,3,NOW(),NOW()),
('الممرضة ريم','نقطة طبية — رفح','الرعاية الصحية','medical_services','الدواء الذي يصلنا يعني أن مريض السكري لن ينتظر أسبوعاً آخر. كل شحنة تصنع فرقاً حقيقياً.',(SELECT id FROM media_files WHERE path='img/activity-medical.jpg' LIMIT 1),'كادر طبي في نقطة رعاية صحية',1,4,NOW(),NOW());

-- 7. Activities -----------------------------------------------------------------
INSERT INTO activities (title,description,badge_text,badge_tone,image_media_id,image_alt,date_label,place,stat_label,stat_icon,link_label,link_url,is_published,sort_order,created_at,updated_at) VALUES
('توزيع 10,000 طرد شتوي وأغطية عازلة','إيصال حزم الدفء لحماية أكثر من 45 ألف نازح من برد الخيام في جنوب القطاع.','حملة دفء غزة','forest',(SELECT id FROM media_files WHERE path='img/activity-winter.jpg' LIMIT 1),'قافلة إغاثة شتوية','نوفمبر - ديسمبر 2024','مخيمات النزوح في رفح','45,200 مستفيد','group','تقرير الفيديو','#gallery',1,1,NOW(),NOW()),
('تسيير 3 عيادات ميدانية وإجراء 320 تدخلاً','عيادات خيام للجروح والأطفال والتوليد، وصرف أدوية مزمنة، وتحويلات عاجلة داخل وسط القطاع.','البرنامج الصحي في غزة','gold',(SELECT id FROM media_files WHERE path='img/activity-medical.jpg' LIMIT 1),'قافلة طبية ميدانية','أكتوبر 2024','دير البلح','8,400 كشف','medical_services','تحميل التوثيق','#contact',1,2,NOW(),NOW()),
('افتتاح الخيمة التعليمية السادسة لأطفال غزة','احتفاء بعودة 210 طفلاً نازحاً إلى حلقات تعلّم مؤقتة في القراءة والحساب والدعم النفسي.','تعليم النازحين','mid',(SELECT id FROM media_files WHERE path='img/activity-graduate.jpg' LIMIT 1),'تخريج دفعة تمكين مهني','سبتمبر 2024','خان يونس','210 طالب نازح','school','قصص النجاح','#news',1,3,NOW(),NOW());

-- 8. Partners -----------------------------------------------------------------
INSERT INTO partners (name,tag_label,tag_icon,description,logo_media_id,is_published,sort_order,created_at,updated_at) VALUES
('منظمة يونيسف','شريك دولي','child_care','نتعاون مع اليونيسف لتوفير الحماية والتعليم الطارئ لأطفال غزة، ودعم برامج التغذية والمياه النظيفة.',(SELECT id FROM media_files WHERE path='img/partners/unicef.svg' LIMIT 1),1,1,NOW(),NOW()),
('الأمم المتحدة','هيئة أممية','public','بالتنسيق مع الأمم المتحدة نوثّق الاحتياجات الإنسانية وننسّق قوافل الإغاثة الداخلة إلى القطاع.',(SELECT id FROM media_files WHERE path='img/partners/unitednations.svg' LIMIT 1),1,2,NOW(),NOW()),
('برنامج الغذاء العالمي','أمن غذائي','nutrition','نشارك برنامج الغذاء العالمي في توزيع السلال الغذائية والوجبات الجاهزة على العائلات النازحة.',(SELECT id FROM media_files WHERE path='img/partners/wfp.png' LIMIT 1),1,3,NOW(),NOW()),
('منظمة الصحة العالمية','رعاية صحية','medical_services','ندعم مع منظمة الصحة العالمية تشغيل النقاط الطبية الميدانية وتأمين الأدوية الأساسية.',(SELECT id FROM media_files WHERE path='img/partners/who.svg' LIMIT 1),1,4,NOW(),NOW()),
('الهلال الأحمر','إغاثة عاجلة','emergency','نتكامل مع فرق الهلال الأحمر في الإخلاء الطبي وتوزيع الإغاثة العاجلة داخل غزة.',(SELECT id FROM media_files WHERE path='img/partners/crescent.svg' LIMIT 1),1,5,NOW(),NOW()),
('اللجنة الدولية للصليب الأحمر','حماية إنسانية','shield','نتعاون مع اللجنة الدولية لتسهيل دخول المساعدات وحماية المدنيين وفق القانون الدولي الإنساني.',(SELECT id FROM media_files WHERE path='img/partners/icrc.svg' LIMIT 1),1,6,NOW(),NOW());

-- 9. FAQ -------------------------------------------------------------------------
INSERT INTO faqs (question,answer,is_published,sort_order,created_at,updated_at) VALUES
('كيف يمكنني التطوع مع الجمعية؟','أرسل لنا بياناتك ومجال خبرتك عبر نموذج التواصل، وسنتواصل معك عند توفر فرص تطوع ميدانية أو عن بُعد (تصميم، ترجمة، تنسيق حملات).',1,7,NOW(),NOW());

-- 10. Announcements bar items & urgent appeal ---------------------------------
INSERT INTO announcements (text,link_url,is_published,sort_order,created_at,updated_at) VALUES
('وصول قافلة طحين جديدة إلى مراكز الإيواء في دير البلح','#news',1,1,NOW(),NOW()),
('فتح باب التسجيل في برامج التمكين والتنمية المجتمعية لعام 2026','#projects',1,2,NOW(),NOW()),
('حملة الشتاء: توزيع خيام وأغطية في خان يونس ورفح','#activities',1,3,NOW(),NOW()),
('تشغيل نقطة مياه شرب إضافية في شمال القطاع','#impact-map',1,4,NOW(),NOW()),
('تقرير الأثر الربعي متاح قريباً في المركز الإعلامي','#news',1,5,NOW(),NOW());

INSERT INTO appeals (flag_label,chip_label,kicker,title_line1,title_line2,description,primary_cta_text,primary_cta_url,secondary_cta_text,secondary_cta_url,image_media_id,is_active,created_at,updated_at) VALUES
('نداء إغاثة عاجل','قوافل يومية من الشمال إلى رفح','حملة السلال والخيام والمياه','خبز اليوم يصل للخيمة..','وماؤك لا ينقطع عن النازحين','قوافل الطحين والخيام وصهاريج المياه تتحرك داخل القطاع كل يوم. مساهمتك تتحوّل إلى وجبة ساخنة، خيمة عازلة، وصهريج شرب لعائلات نزحت من بيوتها.','ساهم في إغاثة غزة الآن','#contact','مبادرات الإغاثة المعتمدة','#projects',(SELECT id FROM media_files WHERE path='img/gallery-convoy.jpg' LIMIT 1),1,NOW(),NOW());

-- 11. Settings (key/value) ------------------------------------------------------
INSERT INTO settings (`key`,`value`,`type`,`section`,`label`,is_public,sort_order,created_at,updated_at) VALUES
('org.name','جمعية الشمال للتنمية والتطوير المجتمعي','string','org','Association name',1,1,NOW(),NOW()),
('org.tagline','لإغاثة أهل غزة ودعم صمودهم','string','org','Tagline',1,2,NOW(),NOW()),
('org.license','HRSD-77492','string','org','License number',1,3,NOW(),NOW()),
('org.website','https://shamal-society.org','url','org','Public website URL',1,4,NOW(),NOW()),
('org.address','مكتب إغاثة غزة — القاهرة (تنسيق دخول المساعدات)','string','org','Coordination office address',1,5,NOW(),NOW()),
('contact.email','info@shamal-society.org','email','contact','Public email',1,6,NOW(),NOW()),
('contact.hotline','0592945557','string','contact','Hotline phone',1,7,NOW(),NOW()),
('contact.hotline_note','متاح 24/7','string','contact','Hotline availability note',1,8,NOW(),NOW()),
('contact.whatsapp','972592945557','string','contact','WhatsApp number (digits only, for wa.me link)',1,9,NOW(),NOW()),
('contact.email_response_note','الرد خلال ساعتين','string','contact','Email response time note',1,10,NOW(),NOW()),
('contact.field_points','جباليا • الشاطئ • دير البلح • خان يونس','string','contact','Field points line in footer',1,11,NOW(),NOW()),
('site.brand_color','#0C7845','color','general','Brand green',1,12,NOW(),NOW()),
('site.locale','ar','string','general','Default language (site is Arabic only)',1,13,NOW(),NOW()),
('site.direction','rtl','string','general','Text direction',1,14,NOW(),NOW()),
('site.domain','shamal-society.org','string','general','Domain name',1,15,NOW(),NOW()),
('seo.default_title','جمعية الشمال للتنمية والتطوير المجتمعي','string','seo','Default browser title',1,16,NOW(),NOW()),
('seo.default_description','مؤسسة إنسانية تعمل على إغاثة أهل غزة: برامج إغاثية وإنشائية وتنموية وصحية وفق معايير الحوكمة والشفافية.','text','seo','Default meta description',1,17,NOW(),NOW()),
('seo.title_suffix',' — جمعية الشمال للتنمية والتطوير المجتمعي','string','seo','Suffix added to page titles',1,18,NOW(),NOW()),
('announcement_bar.visible','1','bool','announcement_bar','Show announcements bar',1,19,NOW(),NOW()),
('announcement_bar.label','آخر الإعلانات','string','announcement_bar','Bar label',1,20,NOW(),NOW()),
('footer.newsletter_title','النشرة البريدية','string','footer','Newsletter box title',1,21,NOW(),NOW()),
('footer.newsletter_text','اشترك لتصلك تقارير الأثر من غزة والحملات الطارئة.','text','footer','Newsletter box text',1,22,NOW(),NOW()),
('mail.notify_new_message','1','bool','notifications','Email admins on new contact message',0,23,NOW(),NOW()),
('mail.digest_frequency','daily','string','notifications','Digest frequency: off | daily | weekly',0,24,NOW(),NOW());

-- 12. Pages ---------------------------------------------------------------------
INSERT INTO pages (slug,title,kind,template,icon,seo_title,meta_description,status,sort_order,published_at,created_at,updated_at) VALUES
('home','الرئيسية','home','index','home','جمعية الشمال للتنمية والتطوير المجتمعي','مؤسسة إنسانية تعمل على إغاثة أهل غزة: برامج إغاثية وإنشائية وتنموية وصحية وفق معايير الحوكمة والشفافية.','published',1,NOW(),NOW(),NOW()),
('about','من نحن','static','about','account_balance','من نحن — جمعية الشمال للتنمية والتطوير المجتمعي','تعرّف على جمعية الشمال للتنمية والتطوير المجتمعي: قصتنا ومسيرتنا، رؤيتنا ورسالتنا وقيمنا، وكيف نعمل داخل القطاع.','published',2,NOW(),NOW(),NOW()),
('projects','المشاريع والبرامج','list','projects','cases','المشاريع والبرامج — جمعية الشمال للتنمية والتطوير المجتمعي','مبادرات الإغاثة المعتمدة داخل قطاع غزة: المخابز، المياه، الإيواء، والتنمية المجتمعية — مع تفاصيل التنفيذ.','published',3,NOW(),NOW(),NOW()),
('project','تفاصيل المشروع','template','project','favorite','تفاصيل المشروع — جمعية الشمال للتنمية والتطوير المجتمعي','تفاصيل مبادرة إغاثة داخل قطاع غزة: نطاق التنفيذ، ما يغطيه المشروع، الصور والتحديثات.','published',4,NOW(),NOW(),NOW()),
('news','الأخبار','list','news','newspaper','الأخبار — جمعية الشمال للتنمية والتطوير المجتمعي','آخر الأخبار وتقارير الشفافية من قطاع غزة: بيانات، تنمية مجتمعية، توثيق الميدان، وأنشطة ميدانية.','published',5,NOW(),NOW(),NOW()),
('article','صفحة الخبر','template','article','article','صفحة الخبر — جمعية الشمال للتنمية والتطوير المجتمعي','تفاصيل الخبر من المركز الإعلامي لجمعية الشمال للتنمية والتطوير المجتمعي.','published',6,NOW(),NOW(),NOW()),
('gallery','معرض الصور','static','gallery','perm_media','معرض الصور — جمعية الشمال للتنمية والتطوير المجتمعي','معرض التوثيق الميداني في غزة: صور وفيديو لوصول السلال والخيام والدواء إلى مستحقيها في مخيمات النزوح.','published',7,NOW(),NOW(),NOW()),
('contact','تواصل معنا','static','contact','contact_support','تواصل معنا — جمعية الشمال للتنمية والتطوير المجتمعي','تواصل مع فريق جمعية الشمال للتنمية والتطوير المجتمعي: الخط الساخن، واتساب، البريد الإلكتروني، وغرفة التنسيق في القاهرة.','published',8,NOW(),NOW(),NOW()),
('privacy','سياسة الخصوصية','static','privacy','shield_lock','سياسة الخصوصية — جمعية الشمال للتنمية والتطوير المجتمعي','كيف نجمع بيانات المستخدمين ونحميها ونستخدمها.','draft',9,NULL,NOW(),NOW()),
('governance','لوائح الحوكمة','static','governance','gavel','لوائح الحوكمة والشفافية — جمعية الشمال للتنمية والتطوير المجتمعي','اللوائح الداخلية وسياسات الحوكمة والتدقيق المالي لجمعية الشمال للتنمية والتطوير المجتمعي، وآلية الإفصاح عن التقارير السنوية.','hidden',10,NULL,NOW(),NOW());

-- 13. Homepage sections (order = drag&drop order in the admin) ------------------
INSERT INTO page_sections (page_id,section_key,type,label,eyebrow,title,is_visible,sort_order,settings,created_at,updated_at) VALUES
((SELECT id FROM pages WHERE slug='home'),'hero','hero','الواجهة الرئيسية','المنصة الوثائقية لإغاثة قطاع غزة','معاً نروي صمود غزة.. ونوثق الأثر الإنساني لحظة بلحظة',1,1,'{"tone":"dark","icon":"wallpaper","urgent":false}',NOW(),NOW()),
((SELECT id FROM pages WHERE slug='home'),'announcements','dynamic','شريط الإعلانات',NULL,'آخر الإعلانات',1,2,'{"tone":"amber","icon":"campaign","urgent":false}',NOW(),NOW()),
((SELECT id FROM pages WHERE slug='home'),'about','content','من نحن','التعريف والمسيرة في غزة','سنوات من العمل لإغاثة أهل غزة وصون كرامتهم',1,3,'{"tone":"light","icon":"account_balance","urgent":false}',NOW(),NOW()),
((SELECT id FROM pages WHERE slug='home'),'projects','dynamic','المشاريع والمبادرات','مشاريع وبرامج غزة','مبادرات الإغاثة المعتمدة داخل القطاع',1,4,'{"tone":"sand","icon":"cases","urgent":false}',NOW(),NOW()),
((SELECT id FROM pages WHERE slug='home'),'stories','dynamic','قصص من الميدان','قصص من الميدان','أصوات من خيام النزوح.. حكايات تصنعها مساهمتك',1,5,'{"tone":"light","icon":"auto_stories","urgent":false}',NOW(),NOW()),
((SELECT id FROM pages WHERE slug='home'),'pillars','cards','ركائز الإغاثة',NULL,'ركائز الإغاثة داخل قطاع غزة',1,6,'{"tone":"dark","icon":"foundation","urgent":false}',NOW(),NOW()),
((SELECT id FROM pages WHERE slug='home'),'activities','dynamic','الأنشطة الميدانية','غزة تتكلم من الميدان','أنشطة ميدانية موثّقة داخل القطاع',1,7,'{"tone":"light","icon":"verified","urgent":false}',NOW(),NOW()),
((SELECT id FROM pages WHERE slug='home'),'appeal','dynamic','نداء الإغاثة العاجل','حملة السلال والخيام والمياه','خبز اليوم يصل للخيمة.. وماؤك لا ينقطع عن النازحين',1,8,'{"tone":"urgent","icon":"e911_emergency","urgent":true}',NOW(),NOW()),
((SELECT id FROM pages WHERE slug='home'),'impact-map','dynamic','خريطة الأثر','خريطة الأثر','أثر الإغاثة في محافظات القطاع الخمس',1,9,'{"tone":"dark","icon":"map","urgent":false}',NOW(),NOW()),
((SELECT id FROM pages WHERE slug='home'),'news','dynamic','آخر الأخبار','بيانات إغاثة غزة','آخر الأخبار وتقارير الشفافية من القطاع',1,10,'{"tone":"sand","icon":"newspaper","urgent":false}',NOW(),NOW()),
((SELECT id FROM pages WHERE slug='home'),'partners','dynamic','الشركاء','شركاء إغاثة غزة','تحالفات الخير لأهل القطاع',1,11,'{"tone":"dark","icon":"handshake","urgent":false}',NOW(),NOW()),
((SELECT id FROM pages WHERE slug='home'),'gallery','dynamic','معرض الصور','مرئيات من قطاع غزة','معرض التوثيق الميداني في غزة',1,12,'{"tone":"light","icon":"perm_media","urgent":false}',NOW(),NOW()),
((SELECT id FROM pages WHERE slug='home'),'contact','content','تواصل معنا','التواصل لدعم إغاثة غزة','نحن في خدمتك لكل استفسار عن القطاع',1,13,'{"tone":"sand","icon":"contact_support","urgent":false}',NOW(),NOW()),
((SELECT id FROM pages WHERE slug='home'),'faq','dynamic','الأسئلة الشائعة','الأسئلة الشائعة','إجابات واضحة عن أكثر الأسئلة تكراراً',1,14,'{"tone":"light","icon":"quiz","urgent":false}',NOW(),NOW());

-- 14. Section blocks: hero stats (4) and relief pillars (4) -------------------
INSERT INTO page_section_blocks (page_section_id,type,icon,title,text,value,is_visible,sort_order,created_at,updated_at) VALUES
((SELECT ps.id FROM page_sections ps JOIN pages pg ON pg.id=ps.page_id WHERE pg.slug='home' AND ps.section_key='hero'),'stat','favorite','مستفيد في غزة',NULL,'180K+',1,1,NOW(),NOW()),
((SELECT ps.id FROM page_sections ps JOIN pages pg ON pg.id=ps.page_id WHERE pg.slug='home' AND ps.section_key='hero'),'stat','verified','محافظات القطاع',NULL,'5',1,2,NOW(),NOW()),
((SELECT ps.id FROM page_sections ps JOIN pages pg ON pg.id=ps.page_id WHERE pg.slug='home' AND ps.section_key='hero'),'stat','4k','مقطع موثّق من غزة',NULL,'+2,500',1,3,NOW(),NOW()),
((SELECT ps.id FROM page_sections ps JOIN pages pg ON pg.id=ps.page_id WHERE pg.slug='home' AND ps.section_key='hero'),'stat','shield','نسبة الشفافية والتدقيق',NULL,'98.4%',1,4,NOW(),NOW()),
((SELECT ps.id FROM page_sections ps JOIN pages pg ON pg.id=ps.page_id WHERE pg.slug='home' AND ps.section_key='pillars'),'card','crisis_alert','الإغاثة العاجلة والحرجة','فرق ميدانية داخل غزة لإيصال الطحين والوجبات والخيام إلى مراكز الإيواء في أوقات القصف والنزوح.',NULL,1,1,NOW(),NOW()),
((SELECT ps.id FROM page_sections ps JOIN pages pg ON pg.id=ps.page_id WHERE pg.slug='home' AND ps.section_key='pillars'),'card','school','تعليم أطفال غزة','خيم تعليمية وحقائب مدرسية ودعم نفسي للأيتام النازحين بعد تعطّل المدارس في القطاع.',NULL,1,2,NOW(),NOW()),
((SELECT ps.id FROM page_sections ps JOIN pages pg ON pg.id=ps.page_id WHERE pg.slug='home' AND ps.section_key='pillars'),'card','night_shelter','إيواء الأسر النازحة','توفير الخيام والأغطية ومستلزمات النظافة للعائلات التي نزحت من الشمال إلى وسط وجنوب القطاع.',NULL,1,3,NOW(),NOW()),
((SELECT ps.id FROM page_sections ps JOIN pages pg ON pg.id=ps.page_id WHERE pg.slug='home' AND ps.section_key='pillars'),'card','health_and_safety','الصحة والمياه في غزة','عيادات ميدانية، أدوية مزمنة، وصهاريج مياه صالحة للشرب لمخيمات النزوح وشبكات الإيواء.',NULL,1,4,NOW(),NOW());

-- 15. Menus & nested items -------------------------------------------------------
INSERT INTO menus (slug,name,created_at,updated_at) VALUES ('header','القائمة الرئيسية',NOW(),NOW()),('footer','قائمة التذييل',NOW(),NOW());

INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='header'),NULL,(SELECT id FROM pages WHERE slug='home'),'الرئيسية','index.html','page','home',0,1,1,NOW(),NOW());
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='header'),NULL,(SELECT id FROM pages WHERE slug='about'),'من نحن','about.html','page','account_balance',0,1,2,NOW(),NOW());
SET @parent_id = LAST_INSERT_ID();
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='header'),@parent_id,NULL,'الرؤية والرسالة','about.html#vision','custom','visibility',0,1,1,NOW(),NOW());
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='header'),NULL,(SELECT id FROM pages WHERE slug='projects'),'المشاريع','projects.html','page','cases',0,1,3,NOW(),NOW());
SET @parent_id = LAST_INSERT_ID();
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='header'),@parent_id,NULL,'التنمية المجتمعية','project.html?id=development','custom','diversity_3',0,1,1,NOW(),NOW());
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='header'),@parent_id,NULL,'الإطعام الطارئ ومخابز غزة','project.html?id=relief','custom','bakery_dining',0,1,2,NOW(),NOW());
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='header'),NULL,NULL,'الأنشطة','index.html#activities','anchor','verified',0,1,4,NOW(),NOW());
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='header'),NULL,(SELECT id FROM pages WHERE slug='news'),'الأخبار','news.html','page','newspaper',0,1,5,NOW(),NOW());
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='header'),NULL,NULL,'الشركاء','index.html#partners','anchor','handshake',0,1,6,NOW(),NOW());
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='header'),NULL,(SELECT id FROM pages WHERE slug='gallery'),'المعرض','gallery.html','page','perm_media',0,1,7,NOW(),NOW());
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='header'),NULL,NULL,'بوابة الإدارة','admin/login.html','custom','admin_panel_settings',0,1,8,NOW(),NOW());
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='header'),NULL,(SELECT id FROM pages WHERE slug='contact'),'تواصل معنا','contact.html','page','contact_support',0,1,9,NOW(),NOW());
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='header'),NULL,NULL,'ساهم في إغاثة غزة الآن','index.html#appeal','anchor','favorite',1,1,10,NOW(),NOW());

INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='footer'),NULL,NULL,'روابط سريعة',NULL,'custom',NULL,0,1,1,NOW(),NOW());
SET @parent_id = LAST_INSERT_ID();
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='footer'),@parent_id,NULL,'الرؤية والرسالة','about.html#vision','custom',NULL,0,1,1,NOW(),NOW());
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='footer'),@parent_id,NULL,'التنمية المجتمعية','project.html?id=development','custom',NULL,0,1,2,NOW(),NOW());
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='footer'),@parent_id,NULL,'تقارير إغاثة القطاع','index.html#activities','anchor',NULL,0,1,3,NOW(),NOW());
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='footer'),@parent_id,(SELECT id FROM pages WHERE slug='news'),'المركز الإعلامي','news.html','page',NULL,0,1,4,NOW(),NOW());
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='footer'),@parent_id,(SELECT id FROM pages WHERE slug='gallery'),'معرض الصور','gallery.html','page',NULL,0,1,5,NOW(),NOW());
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='footer'),@parent_id,NULL,'الأسئلة الشائعة','index.html#faq','anchor',NULL,0,1,6,NOW(),NOW());
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='footer'),@parent_id,(SELECT id FROM pages WHERE slug='contact'),'تواصل معنا','contact.html','page',NULL,0,1,7,NOW(),NOW());
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='footer'),NULL,NULL,'سياسة الخصوصية','#','custom',NULL,0,1,2,NOW(),NOW());
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='footer'),NULL,NULL,'لوائح الحوكمة','#','custom',NULL,0,1,3,NOW(),NOW());
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='footer'),NULL,NULL,'بوابة الموظفين','admin/login.html','custom',NULL,0,1,4,NOW(),NOW());

SET FOREIGN_KEY_CHECKS = 1;
