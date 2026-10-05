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
('كيف أتأكد أن تبرعي يصل إلى غزة فعلاً؟','نعمل عبر فرق ميدانية وشركاء داخل القطاع، ونوثّق التوزيعات بالصور والتقارير الدورية التي ننشرها في المركز الإعلامي، ويمكنك طلب تقرير عن الحملة التي ساهمت فيها.',1,1,NOW(),NOW()),
('هل يمكنني إخراج زكاة مالي عبر الجمعية؟','نعم، يمكنك تحديد أن مساهمتك زكاة عند التبرع لتُصرف في مصارفها الشرعية للأسر المستحقة داخل القطاع.',1,2,NOW(),NOW()),
('هل أحصل على إيصال بتبرعي؟','يصلك إيصال بتبرعك عبر البريد الإلكتروني أو الرسائل بعد تأكيد العملية، ويمكنك طلب نسخة منه في أي وقت عبر فريق خدمة المتبرعين.',1,3,NOW(),NOW()),
('كيف تضمن الجمعية الشفافية في صرف التبرعات؟','نعتمد على توثيق كل توزيع بالصورة، ونشر تقارير دورية بالإنجاز والإنفاق، ومراجعة الحسابات من جهة تدقيق مستقلة.',1,4,NOW(),NOW()),
('هل يمكنني تخصيص تبرعي لمشروع أو محافظة بعينها؟','يمكنك اختيار المشروع (السلال الغذائية، الخيام، المياه، العيادات الميدانية) عند التواصل معنا، وسنبذل جهدنا لتوجيهه إلى المحافظة التي تحددها وفق الاحتياج والظروف الميدانية.',1,5,NOW(),NOW()),
('ما وسائل التبرع المتاحة؟','تواصل مع فريق خدمة المتبرعين عبر الهاتف أو البريد الإلكتروني أو واتساب، وسيزوّدك بوسائل التبرع المعتمدة المتاحة في بلدك.',1,6,NOW(),NOW()),
('كيف يمكنني التطوع مع الجمعية؟','أرسل لنا بياناتك ومجال خبرتك عبر نموذج التواصل، وسنتواصل معك عند توفر فرص تطوع ميدانية أو عن بُعد (تصميم، ترجمة، تنسيق حملات).',1,7,NOW(),NOW()),
('هل يمكنني دعم مشروع بشكل شهري؟','نعم، يمكنك الاشتراك في التبرع الشهري لدعم البرامج الإغاثية والإنشائية والتنموية والصحية، مع تقارير دورية عن أثر تبرعك.',1,8,NOW(),NOW());

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
('contact.hotline','+20 100 774 9292','string','contact','Hotline phone',1,7,NOW(),NOW()),
('contact.hotline_note','متاح 24/7','string','contact','Hotline availability note',1,8,NOW(),NOW()),
('contact.whatsapp','201007749292','string','contact','WhatsApp number (digits only, for wa.me link)',1,9,NOW(),NOW()),
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
('projects','المشاريع والبرامج','list','projects','cases','المشاريع والبرامج — جمعية الشمال للتنمية والتطوير المجتمعي','مبادرات الإغاثة المعتمدة داخل قطاع غزة: المخابز، المياه، الإيواء، والتنمية المجتمعية — مع نسب التمويل.','published',3,NOW(),NOW(),NOW()),
('project','تفاصيل المشروع','template','project','volunteer_activism','تفاصيل المشروع — جمعية الشمال للتنمية والتطوير المجتمعي','تفاصيل مبادرة إغاثة داخل قطاع غزة: نسبة التمويل، ما تغطيه مساهمتك، الصور والتحديثات.','published',4,NOW(),NOW(),NOW()),
('news','الأخبار','list','news','newspaper','الأخبار — جمعية الشمال للتنمية والتطوير المجتمعي','آخر الأخبار وتقارير الشفافية من قطاع غزة: بيانات، تنمية مجتمعية، توثيق الميدان، وأنشطة ميدانية.','published',5,NOW(),NOW(),NOW()),
('article','صفحة الخبر','template','article','article','صفحة الخبر — جمعية الشمال للتنمية والتطوير المجتمعي','تفاصيل الخبر من المركز الإعلامي لجمعية الشمال للتنمية والتطوير المجتمعي.','published',6,NOW(),NOW(),NOW()),
('gallery','معرض الصور','static','gallery','perm_media','معرض الصور — جمعية الشمال للتنمية والتطوير المجتمعي','معرض التوثيق الميداني في غزة: صور وفيديو لوصول السلال والخيام والدواء إلى مستحقيها في مخيمات النزوح.','published',7,NOW(),NOW(),NOW()),
('contact','تواصل معنا','static','contact','contact_support','تواصل معنا — جمعية الشمال للتنمية والتطوير المجتمعي','تواصل مع فريق جمعية الشمال للتنمية والتطوير المجتمعي: الخط الساخن، واتساب، البريد الإلكتروني، وغرفة التنسيق في القاهرة.','published',8,NOW(),NOW(),NOW()),
('privacy','سياسة الخصوصية','static','privacy','shield_lock','سياسة الخصوصية — جمعية الشمال للتنمية والتطوير المجتمعي','كيف نجمع بيانات المتبرعين ونحميها ونستخدمها.','draft',9,NULL,NOW(),NOW()),
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
((SELECT id FROM pages WHERE slug='home'),'faq','dynamic','الأسئلة الشائعة','الأسئلة الشائعة','إجابات واضحة قبل أن تتبرع',1,14,'{"tone":"light","icon":"quiz","urgent":false}',NOW(),NOW());

-- 14. Section blocks: hero stats (4) and relief pillars (4) -------------------
INSERT INTO page_section_blocks (page_section_id,type,icon,title,text,value,is_visible,sort_order,created_at,updated_at) VALUES
((SELECT ps.id FROM page_sections ps JOIN pages pg ON pg.id=ps.page_id WHERE pg.slug='home' AND ps.section_key='hero'),'stat','volunteer_activism','مستفيد في غزة',NULL,'180K+',1,1,NOW(),NOW()),
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
INSERT INTO menu_items (menu_id,parent_id,page_id,label,url,type,icon,is_button,is_visible,sort_order,created_at,updated_at) VALUES ((SELECT id FROM menus WHERE slug='header'),NULL,NULL,'ساهم في إغاثة غزة الآن','index.html#appeal','anchor','volunteer_activism',1,1,10,NOW(),NOW());

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

-- 16. System constants (admin dashboard Settings > «ثوابت النظام»). Source: admin/js/admin-constants.js defaults.
-- INSERT IGNORE: re-running never overwrites labels/order/active edited by the admin.
INSERT IGNORE INTO constant_groups (group_key,name_ar,description,ref_table,used_in,is_locked,sort_order,created_at,updated_at) VALUES
('project_status','حالات المشروع','حالة المشروع في قائمة المشاريع ونموذج المشروع.',NULL,'["المشاريع"]',0,1,NOW(),NOW()),
('project_category','فئات المشاريع (البرامج)','فئة المشروع في الفلاتر ونموذج المشروع.','programs','["المشاريع"]',0,2,NOW(),NOW()),
('governorate','المحافظات','محافظة المشروع في نموذج المشروع.','governorates','["المشاريع"]',0,3,NOW(),NOW()),
('news_category','تصنيفات الأخبار','تصنيف الخبر في فلتر الأخبار ومحرر الخبر.','article_categories','["الأخبار","تحرير خبر"]',0,4,NOW(),NOW()),
('article_status','حالات الخبر','حالة النشر في محرر الخبر. مفاتيحها مرتبطة بسلوك النشر، تُعدَّل تسميتها وترتيبها فقط.',NULL,'["تحرير خبر"]',1,5,NOW(),NOW()),
('page_status','حالات الصفحة','حالة الصفحة العامة في إدارة الصفحات. مفاتيحها مرتبطة بسلوك النشر، تُعدَّل تسميتها وترتيبها فقط.',NULL,'["الصفحات"]',1,6,NOW(),NOW()),
('visibility','حالة الظهور في الموقع','فلتر الظهور في القصص والأنشطة والشركاء والأسئلة والإعلانات وخريطة الأثر.',NULL,'["القصص","الأنشطة","الشركاء","الأسئلة الشائعة","نداء الإغاثة","خريطة الأثر"]',1,7,NOW(),NOW()),
('gallery_album','ألبومات المعرض','الألبوم في معرض الصور (نقل الصور وتفاصيل الصورة).','gallery_albums','["معرض الصور"]',0,8,NOW(),NOW()),
('section_anchor','أقسام الموقع (وجهات الروابط)','وجهة الرابط في القصص والأنشطة والإعلانات ونداء الإغاثة.',NULL,'["القصص","الأنشطة","نداء الإغاثة"]',0,9,NOW(),NOW()),
('icon','الأيقونات','قائمة الأيقونات في القصص والأنشطة والشركاء. المفتاح اسم أيقونة Material Symbols.',NULL,'["القصص","الأنشطة","الشركاء"]',0,10,NOW(),NOW()),
('badge_tone','ألوان وسم الصورة','لون الوسم في الأنشطة الميدانية.',NULL,'["الأنشطة"]',1,11,NOW(),NOW()),
('timezone','المناطق الزمنية','المنطقة الزمنية في الإعدادات العامة. المفتاح معرّف IANA.',NULL,'["الإعدادات"]',0,13,NOW(),NOW()),
('language','لغات اللوحة','لغة واجهة الإدارة. المفاتيح مرتبطة بالواجهة، تُعدَّل تسميتها وترتيبها فقط.',NULL,'["الإعدادات"]',1,14,NOW(),NOW()),
('date_format','تنسيقات التاريخ','تنسيق التاريخ في الإعدادات العامة. المفاتيح مرتبطة بدالة التنسيق، تُعدَّل تسميتها وترتيبها فقط.',NULL,'["الإعدادات"]',1,15,NOW(),NOW()),
('digest_frequency','تكرار الملخص والنسخ الاحتياطي','تكرار الملخص الدوري وجدولة النسخ الاحتياطي (قائمة مشتركة).',NULL,'["الإعدادات"]',1,16,NOW(),NOW()),
('digest_day','أيام إرسال الملخص','يوم إرسال الملخص الأسبوعي في الإشعارات.',NULL,'["الإعدادات"]',0,17,NOW(),NOW()),
('password_expiry','مدد انتهاء كلمة المرور','خيارات انتهاء الصلاحية في إعدادات الأمان.',NULL,'["الإعدادات"]',0,18,NOW(),NOW()),
('session_timeout','مهل الجلسة','خيارات مهلة الخروج التلقائي (بالدقائق) في إعدادات الأمان.',NULL,'["الإعدادات"]',0,19,NOW(),NOW()),
('audit_type','أنواع أحداث السجل','فلتر نوع الحدث في سجل النشاط. المفاتيح مرتبطة بالأحداث، تُعدَّل تسميتها وترتيبها فقط.',NULL,'["الإعدادات"]',1,20,NOW(),NOW());

INSERT IGNORE INTO constant_items (group_id,item_key,label_ar,is_active,is_locked,sort_order,meta,created_at,updated_at) VALUES
((SELECT id FROM constant_groups WHERE group_key='project_status'),'active','نشط',1,0,0,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='project_status'),'urgent','عاجل',1,0,1,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='project_status'),'paused','متوقف مؤقتاً',1,0,2,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='project_status'),'draft','مسودة',1,0,3,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='project_status'),'completed','مكتمل',1,0,4,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='project_category'),'relief','برامج إغاثية',1,0,0,'{"ref_slug":"relief"}',NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='project_category'),'construction','برامج إنشائية',1,0,1,'{"ref_slug":"construction"}',NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='project_category'),'development','برامج تنموية',1,0,2,'{"ref_slug":"development"}',NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='project_category'),'health','برامج صحية',1,0,3,'{"ref_slug":"health"}',NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='governorate'),'north','شمال غزة',1,0,0,'{"ref_slug":"north-gaza"}',NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='governorate'),'gaza','غزة',1,0,1,'{"ref_slug":"gaza"}',NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='governorate'),'middle','دير البلح',1,0,2,'{"ref_slug":"deir-al-balah"}',NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='governorate'),'khan','خان يونس',1,0,3,'{"ref_slug":"khan-younis"}',NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='governorate'),'rafah','رفح',1,0,4,'{"ref_slug":"rafah"}',NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='news_category'),'statements','بيانات وتقارير',1,0,0,'{"ref_slug":"statements"}',NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='news_category'),'development','تنمية مجتمعية',1,0,1,'{"ref_slug":"development"}',NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='news_category'),'field','توثيق الميدان',1,0,2,'{"ref_slug":"field"}',NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='news_category'),'activities','أنشطة ميدانية',1,0,3,'{"ref_slug":"activities"}',NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='article_status'),'draft','مسودة',1,0,0,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='article_status'),'published','منشور',1,0,1,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='article_status'),'scheduled','مجدول',1,0,2,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='page_status'),'published','منشورة',1,0,0,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='page_status'),'draft','مسودة',1,0,1,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='page_status'),'hidden','مخفية',1,0,2,'{"note":"لا تظهر في القوائم والبحث"}',NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='visibility'),'visible','ظاهر في الموقع',1,0,0,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='visibility'),'hidden','مخفي',1,0,1,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='gallery_album'),'field','توثيق الميدان',1,0,0,'{"ref_slug":"field"}',NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='gallery_album'),'relief','الإغاثة',1,0,1,'{"ref_slug":"relief"}',NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='gallery_album'),'development','التعليم والتنمية',1,0,2,'{"ref_slug":"development"}',NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='gallery_album'),'health','الصحة والمياه',1,0,3,'{"ref_slug":"health"}',NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='section_anchor'),'#hero','الرئيسية',1,0,0,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='section_anchor'),'#about','من نحن',1,0,1,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='section_anchor'),'#projects','المشاريع',1,0,2,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='section_anchor'),'#stories','قصص من الميدان',1,0,3,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='section_anchor'),'#activities','الأنشطة الميدانية',1,0,4,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='section_anchor'),'#appeal','نداء الإغاثة',1,0,5,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='section_anchor'),'#impact-map','خريطة الأثر',1,0,6,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='section_anchor'),'#news','الأخبار',1,0,7,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='section_anchor'),'#partners','الشركاء',1,0,8,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='section_anchor'),'#gallery','معرض الصور',1,0,9,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='section_anchor'),'#contact','التواصل',1,0,10,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='section_anchor'),'#faq','الأسئلة الشائعة',1,0,11,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='icon'),'shopping_basket','سلة غذائية',1,0,0,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='icon'),'diversity_3','فرق التطوع',1,0,1,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='icon'),'menu_book','التعليم',1,0,2,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='icon'),'medical_services','الرعاية الطبية',1,0,3,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='icon'),'water_drop','المياه',1,0,4,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='icon'),'camping','الخيام',1,0,5,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='icon'),'restaurant','الوجبات',1,0,6,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='icon'),'groups','المستفيدون',1,0,7,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='icon'),'group','مجموعة',1,0,8,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='icon'),'school','المدرسة',1,0,9,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='icon'),'child_care','الأطفال',1,0,10,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='icon'),'public','دولي',1,0,11,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='icon'),'nutrition','الأمن الغذائي',1,0,12,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='icon'),'emergency','إغاثة عاجلة',1,0,13,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='icon'),'shield','حماية',1,0,14,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='icon'),'handshake','شراكة',1,0,15,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='icon'),'favorite','عطاء',1,0,16,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='icon'),'local_shipping','قوافل',1,0,17,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='icon'),'volunteer_activism','تبرع',1,0,18,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='icon'),'health_and_safety','السلامة الصحية',1,0,19,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='badge_tone'),'forest','أخضر داكن',1,0,0,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='badge_tone'),'gold','ذهبي',1,0,1,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='badge_tone'),'mid','أخضر متوسط',1,0,2,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='timezone'),'Asia/Gaza','غزة (GMT+3)',1,0,0,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='timezone'),'Asia/Hebron','الخليل (GMT+3)',1,0,1,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='timezone'),'Africa/Cairo','القاهرة (GMT+3)',1,0,2,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='timezone'),'Asia/Amman','عمّان (GMT+3)',1,0,3,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='timezone'),'Asia/Riyadh','الرياض (GMT+3)',1,0,4,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='timezone'),'Europe/Istanbul','إسطنبول (GMT+3)',1,0,5,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='timezone'),'Asia/Dubai','دبي (GMT+4)',1,0,6,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='timezone'),'Europe/London','لندن',1,0,7,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='timezone'),'UTC','التوقيت العالمي UTC',1,0,8,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='language'),'ar','العربية',1,0,0,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='language'),'en','English',1,0,1,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='date_format'),'long','طويل',1,0,0,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='date_format'),'short','مختصر',1,0,1,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='date_format'),'iso','رقمي',1,0,2,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='digest_frequency'),'off','متوقف',1,1,0,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='digest_frequency'),'daily','يومي',1,0,1,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='digest_frequency'),'weekly','أسبوعي',1,0,2,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='digest_frequency'),'monthly','شهري',1,0,3,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='digest_day'),'sat','السبت',1,0,0,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='digest_day'),'sun','الأحد',1,0,1,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='digest_day'),'mon','الاثنين',1,0,2,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='digest_day'),'thu','الخميس',1,0,3,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='password_expiry'),'never','لا تنتهي',1,1,0,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='password_expiry'),'30','كل 30 يوماً',1,0,1,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='password_expiry'),'60','كل 60 يوماً',1,0,2,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='password_expiry'),'90','كل 90 يوماً',1,0,3,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='password_expiry'),'180','كل 180 يوماً',1,0,4,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='session_timeout'),'15','15 دقيقة',1,0,0,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='session_timeout'),'30','30 دقيقة',1,0,1,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='session_timeout'),'60','ساعة',1,0,2,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='session_timeout'),'240','4 ساعات',1,0,3,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='session_timeout'),'480','8 ساعات',1,0,4,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='audit_type'),'settings','الإعدادات',1,0,0,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='audit_type'),'users','المستخدمون',1,0,1,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='audit_type'),'security','الأمان',1,0,2,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='audit_type'),'content','المحتوى',1,0,3,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='audit_type'),'integrations','التكاملات',1,0,4,NULL,NOW(),NOW()),
((SELECT id FROM constant_groups WHERE group_key='audit_type'),'backup','النسخ',1,0,5,NULL,NOW(),NOW());

-- 17. Roles & permissions (admin dashboard «الأدوار والصلاحيات»). INSERT IGNORE: re-running never overwrites edits.
-- 71 permissions, 5 roles. Role admin = all permissions (also enforced in code as super admin).
INSERT IGNORE INTO permissions (perm_key,module,action,name_ar,sort_order,created_at,updated_at) VALUES
('dashboard.view','dashboard','view','عرض لوحة التحكم',0,NOW(),NOW()),
('reports.view','reports','view','عرض التقارير والإحصائيات',1,NOW(),NOW()),
('reports.export','reports','export','تصدير التقارير',2,NOW(),NOW()),
('homepage.view','homepage','view','عرض الصفحة الرئيسية',3,NOW(),NOW()),
('homepage.edit','homepage','edit','تعديل الصفحة الرئيسية',4,NOW(),NOW()),
('projects.view','projects','view','عرض المشاريع',5,NOW(),NOW()),
('projects.create','projects','create','إضافة المشاريع',6,NOW(),NOW()),
('projects.edit','projects','edit','تعديل المشاريع',7,NOW(),NOW()),
('projects.delete','projects','delete','حذف المشاريع',8,NOW(),NOW()),
('projects.publish','projects','publish','نشر المشاريع',9,NOW(),NOW()),
('news.view','news','view','عرض الأخبار',10,NOW(),NOW()),
('news.create','news','create','إضافة الأخبار',11,NOW(),NOW()),
('news.edit','news','edit','تعديل الأخبار',12,NOW(),NOW()),
('news.delete','news','delete','حذف الأخبار',13,NOW(),NOW()),
('news.publish','news','publish','نشر الأخبار',14,NOW(),NOW()),
('gallery.view','gallery','view','عرض معرض الصور',15,NOW(),NOW()),
('gallery.create','gallery','create','إضافة معرض الصور',16,NOW(),NOW()),
('gallery.edit','gallery','edit','تعديل معرض الصور',17,NOW(),NOW()),
('gallery.delete','gallery','delete','حذف معرض الصور',18,NOW(),NOW()),
('gallery.publish','gallery','publish','نشر معرض الصور',19,NOW(),NOW()),
('stories.view','stories','view','عرض قصص الميدان',20,NOW(),NOW()),
('stories.create','stories','create','إضافة قصص الميدان',21,NOW(),NOW()),
('stories.edit','stories','edit','تعديل قصص الميدان',22,NOW(),NOW()),
('stories.delete','stories','delete','حذف قصص الميدان',23,NOW(),NOW()),
('stories.publish','stories','publish','نشر قصص الميدان',24,NOW(),NOW()),
('activities.view','activities','view','عرض الأنشطة الميدانية',25,NOW(),NOW()),
('activities.create','activities','create','إضافة الأنشطة الميدانية',26,NOW(),NOW()),
('activities.edit','activities','edit','تعديل الأنشطة الميدانية',27,NOW(),NOW()),
('activities.delete','activities','delete','حذف الأنشطة الميدانية',28,NOW(),NOW()),
('partners.view','partners','view','عرض الشركاء',29,NOW(),NOW()),
('partners.create','partners','create','إضافة الشركاء',30,NOW(),NOW()),
('partners.edit','partners','edit','تعديل الشركاء',31,NOW(),NOW()),
('partners.delete','partners','delete','حذف الشركاء',32,NOW(),NOW()),
('faq.view','faq','view','عرض الأسئلة الشائعة',33,NOW(),NOW()),
('faq.create','faq','create','إضافة الأسئلة الشائعة',34,NOW(),NOW()),
('faq.edit','faq','edit','تعديل الأسئلة الشائعة',35,NOW(),NOW()),
('faq.delete','faq','delete','حذف الأسئلة الشائعة',36,NOW(),NOW()),
('appeal.view','appeal','view','عرض نداء الإغاثة والإعلانات',37,NOW(),NOW()),
('appeal.create','appeal','create','إضافة نداء الإغاثة والإعلانات',38,NOW(),NOW()),
('appeal.edit','appeal','edit','تعديل نداء الإغاثة والإعلانات',39,NOW(),NOW()),
('appeal.delete','appeal','delete','حذف نداء الإغاثة والإعلانات',40,NOW(),NOW()),
('impact.view','impact','view','عرض خريطة الأثر',41,NOW(),NOW()),
('impact.edit','impact','edit','تعديل خريطة الأثر',42,NOW(),NOW()),
('pages.view','pages','view','عرض الصفحات',43,NOW(),NOW()),
('pages.create','pages','create','إضافة الصفحات',44,NOW(),NOW()),
('pages.edit','pages','edit','تعديل الصفحات',45,NOW(),NOW()),
('pages.delete','pages','delete','حذف الصفحات',46,NOW(),NOW()),
('pages.publish','pages','publish','نشر الصفحات',47,NOW(),NOW()),
('menu.view','menu','view','عرض القائمة',48,NOW(),NOW()),
('menu.create','menu','create','إضافة القائمة',49,NOW(),NOW()),
('menu.edit','menu','edit','تعديل القائمة',50,NOW(),NOW()),
('menu.delete','menu','delete','حذف القائمة',51,NOW(),NOW()),
('messages.view','messages','view','عرض الرسائل والطلبات',52,NOW(),NOW()),
('messages.edit','messages','edit','معالجة الرسائل (قراءة وأرشفة)',53,NOW(),NOW()),
('messages.delete','messages','delete','حذف الرسائل والطلبات',54,NOW(),NOW()),
('users.view','users','view','عرض مستخدمو النظام',55,NOW(),NOW()),
('users.create','users','create','إضافة مستخدمو النظام',56,NOW(),NOW()),
('users.edit','users','edit','تعديل مستخدمو النظام',57,NOW(),NOW()),
('users.delete','users','delete','حذف مستخدمو النظام',58,NOW(),NOW()),
('roles.view','roles','view','عرض الأدوار والصلاحيات',59,NOW(),NOW()),
('roles.create','roles','create','إضافة الأدوار والصلاحيات',60,NOW(),NOW()),
('roles.edit','roles','edit','تعديل الأدوار والصلاحيات',61,NOW(),NOW()),
('roles.delete','roles','delete','حذف الأدوار والصلاحيات',62,NOW(),NOW()),
('settings.view','settings','view','عرض الإعدادات العامة',63,NOW(),NOW()),
('settings.edit','settings','edit','تعديل الإعدادات العامة',64,NOW(),NOW()),
('constants.view','constants','view','عرض ثوابت النظام',65,NOW(),NOW()),
('constants.manage','constants','manage','إدارة ثوابت النظام (إضافة وتعديل وحذف)',66,NOW(),NOW()),
('backup.view','backup','view','عرض النسخ الاحتياطي',67,NOW(),NOW()),
('backup.manage','backup','manage','إدارة النسخ الاحتياطي',68,NOW(),NOW()),
('audit.view','audit','view','عرض سجل النشاط',69,NOW(),NOW()),
('audit.export','audit','export','تصدير سجل النشاط',70,NOW(),NOW());

INSERT IGNORE INTO roles (role_key,name_ar,description,is_system,is_active,sort_order,created_at,updated_at) VALUES
('admin','مدير النظام','صلاحيات كاملة على كل أقسام لوحة التحكم، بما فيها المستخدمون والأدوار والإعدادات. دور محمي ولا يمكن تعديله أو تعطيله أو حذفه.',1,1,0,NOW(),NOW()),
('manager','مدير المحتوى','يدير كل أقسام المحتوى والرسائل والتقارير (إضافة وتعديل ونشر وحذف) بدون الإعدادات والمستخدمين والأدوار.',1,1,1,NOW(),NOW()),
('editor','محرر','يضيف ويعدّل الأخبار والمعرض والقصص والأنشطة والشركاء والأسئلة الشائعة والصفحات، بدون حذف أو نشر. يطّلع على الرسائل والمشاريع.',1,1,2,NOW(),NOW()),
('writer','كاتب','يكتب الأخبار ويعدّلها كمسودات فقط، بدون نشر أو حذف ولا وصول لباقي الأقسام.',1,1,3,NOW(),NOW()),
('viewer','مشاهد','اطّلاع فقط على لوحة التحكم والتقارير وأقسام المحتوى والرسائل، بدون أي إضافة أو تعديل أو حذف.',1,1,4,NOW(),NOW());

INSERT IGNORE INTO role_permission (role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.role_key='admin';
INSERT IGNORE INTO role_permission (role_id,permission_id) SELECT r.id,p.id FROM roles r JOIN permissions p ON p.perm_key IN ('dashboard.view','reports.view','reports.export','homepage.view','homepage.edit','projects.view','projects.create','projects.edit','projects.delete','projects.publish','news.view','news.create','news.edit','news.delete','news.publish','gallery.view','gallery.create','gallery.edit','gallery.delete','gallery.publish','stories.view','stories.create','stories.edit','stories.delete','stories.publish','activities.view','activities.create','activities.edit','activities.delete','partners.view','partners.create','partners.edit','partners.delete','faq.view','faq.create','faq.edit','faq.delete','appeal.view','appeal.create','appeal.edit','appeal.delete','impact.view','impact.edit','pages.view','pages.create','pages.edit','pages.delete','pages.publish','menu.view','menu.create','menu.edit','menu.delete','messages.view','messages.edit','messages.delete') WHERE r.role_key='manager';
INSERT IGNORE INTO role_permission (role_id,permission_id) SELECT r.id,p.id FROM roles r JOIN permissions p ON p.perm_key IN ('dashboard.view','homepage.view','projects.view','messages.view','news.view','news.create','news.edit','gallery.view','gallery.create','gallery.edit','stories.view','stories.create','stories.edit','activities.view','activities.create','activities.edit','partners.view','partners.create','partners.edit','faq.view','faq.create','faq.edit','pages.view','pages.create','pages.edit') WHERE r.role_key='editor';
INSERT IGNORE INTO role_permission (role_id,permission_id) SELECT r.id,p.id FROM roles r JOIN permissions p ON p.perm_key IN ('dashboard.view','news.view','news.create','news.edit') WHERE r.role_key='writer';
INSERT IGNORE INTO role_permission (role_id,permission_id) SELECT r.id,p.id FROM roles r JOIN permissions p ON p.perm_key IN ('dashboard.view','reports.view','homepage.view','projects.view','news.view','gallery.view','stories.view','activities.view','partners.view','faq.view','appeal.view','impact.view','pages.view','menu.view','messages.view') WHERE r.role_key='viewer';

-- 18. Media library (media.*) and tags (tags.*) permissions, added with the media / tags / audit-log modules. INSERT IGNORE again.
-- gallery.<x> holders get media.<x>, news.<x> holders get tags.<x>, admin gets everything. Must run after section 17.
INSERT IGNORE INTO permissions (perm_key, module, action, name_ar, sort_order, created_at, updated_at) VALUES
('media.view','media','view','عرض مكتبة الوسائط',            76,NOW(),NOW()),
('media.create','media','create','رفع ملفات إلى مكتبة الوسائط',  77,NOW(),NOW()),
('media.edit','media','edit','تعديل بيانات ملفات الوسائط',   78,NOW(),NOW()),
('media.delete','media','delete','حذف ملفات الوسائط',            79,NOW(),NOW()),
('tags.view','tags','view','عرض الوسوم',                   80,NOW(),NOW()),
('tags.create','tags','create','إضافة وسوم',                   81,NOW(),NOW()),
('tags.edit','tags','edit','تعديل ودمج الوسوم',            82,NOW(),NOW()),
('tags.delete','tags','delete','حذف الوسوم',                   83,NOW(),NOW());

-- roles: every role that holds gallery.<action> gets media.<action>; news.<action> gets tags.<action> (view/create/edit/delete)
INSERT IGNORE INTO role_permission (role_id, permission_id)
SELECT rp.role_id, np.id
FROM role_permission rp
JOIN permissions op ON op.id = rp.permission_id AND op.perm_key IN ('gallery.view', 'gallery.create', 'gallery.edit', 'gallery.delete')
JOIN permissions np ON np.perm_key = REPLACE(op.perm_key, 'gallery.', 'media.');

INSERT IGNORE INTO role_permission (role_id, permission_id)
SELECT rp.role_id, np.id
FROM role_permission rp
JOIN permissions op ON op.id = rp.permission_id AND op.perm_key IN ('news.view', 'news.create', 'news.edit', 'news.delete')
JOIN permissions np ON np.perm_key = REPLACE(op.perm_key, 'news.', 'tags.');

-- the locked super role keeps every permission row
INSERT IGNORE INTO role_permission (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p WHERE r.role_key = 'admin';

SET FOREIGN_KEY_CHECKS = 1;
