/* =========================================================================
   الإعدادات — settings.html (settings center, front-end only, demo data)
   • 10 sections, hash deep links (#section or #section/setting)
   • search across every setting (combobox, highlight, jump + flash)
   • one state object → sticky save bar (save / discard), per-section reset,
     Ctrl+S, leave warning, toasts
   • Appearance is applied for real on every admin page through
     window.AdminAppearance (admin.js) + localStorage "almel-admin-appearance"
   • Backup: real export / import (validated, diff preview) of almel-admin-*
   User-entered text is never written with innerHTML: dynamic lists are built
   with DOM nodes + textContent, form values are set through .value.
   ========================================================================= */
(function () {
  'use strict';
  function start() {
    var UI = window.AdminUI, AP = window.AdminAppearance, root = document.getElementById('st-sections');
    if (!UI || !AP || !root) return;
    var D = window.ADMIN_DATA || {};
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var esc = UI.esc, icon = UI.icon, toast = UI.toast, modal = UI.modal;
    var ACN = window.AdminConstants; /* ثوابت النظام: كل القوائم تقرأ من admin-constants.js */
    function CP(group, cur) { return ACN ? ACN.pairs(group, cur) : []; }
    var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
    /* ---- المصدر: قاعدة البيانات عبر window.__ALMEL_SETTINGS (يحقنه layouts/admin.blade.php) + واجهة /admin/settings/*. بدونه: localStorage (التصميم الثابت) ---- */
    var SRV = window.__ALMEL_SETTINGS || null, BASE = '/admin/settings', DONATIONS_KEY = 'almel-admin-settings-donations';
    function lread(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
    function lwrite(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
    function csrf() { var m = document.querySelector('meta[name="csrf-token"]'); return m ? m.getAttribute('content') : ''; }
    function http(method, url, body) {
      return fetch(url, { method: method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrf(), 'X-Requested-With': 'XMLHttpRequest' }, body: body === undefined ? undefined : JSON.stringify(body) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, j: j || {} }; }); });
    }
    function failText(x) { return (x && x.j && x.j.message) || (x && x.status === 419 ? 'انتهت الجلسة، أعد تحميل الصفحة.' : x && x.status === 403 ? 'ليست لديك صلاحية لتعديل الإعدادات.' : 'تعذّر الاتصال بالخادم.'); }
    function srvToastErr(x) { if (window.AdminUI) window.AdminUI.toast('تعذّر الحفظ', { text: failText(x), tone: 'danger', icon: 'error' }); }
    var SRV_STATE = { twofa: 'twofa', integ: 'integrations', keys: 'api_keys' }; /* مفاتيح الحالة الثانوية → قسم في الخادم */
    function read(k, d) {
      if (!SRV) return lread(k, d);
      var st = SRV.settings || {};
      if (k === K.settings) { var raw = {}; Object.keys(st).forEach(function (sec) { raw[sec] = st[sec]; }); raw.donations = lread(DONATIONS_KEY, undefined); return raw; }
      if (k === K.twofa) return st.twofa || d;
      if (k === K.integ) return st.integrations || d;
      if (k === K.keys) return st.api_keys || d;
      if (k === K.users || k === K.sessions || k === K.audit) return d;
      return lread(k, d);
    }
    function write(k, v) {
      if (!SRV) return lwrite(k, v);
      var sec = k === K.twofa ? 'twofa' : k === K.integ ? 'integrations' : k === K.keys ? 'api_keys' : null;
      if (sec) {
        SRV.settings = SRV.settings || {}; SRV.settings[sec] = v;
        http('PUT', BASE + '/' + sec, { data: v }).then(function (x) { if (!x.ok) srvToastErr(x); else if (x.j.audit) { SRV.audit = x.j.audit; if (typeof renderAudit === 'function') renderAudit(); } }, function () { srvToastErr(null); });
        return true;
      }
      if (k === K.users || k === K.sessions || k === K.audit || k === K.settings) return true;
      return lwrite(k, v);
    }
    function h(tag, attrs, kids) {
      var el = document.createElement(tag);
      Object.keys(attrs || {}).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'class') el.className = v; else if (k === 'text') el.textContent = v;
        else if (k.indexOf('on') === 0) el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      });
      [].concat(kids || []).forEach(function (c) { if (c == null || c === false) return; el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
      return el;
    }
    function ic(n) { return h('span', { class: 'material-symbols-outlined', 'aria-hidden': 'true', text: n }); }
    var live = $('#st-live');
    function announce(t) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 30); }
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var ME = (D.user && D.user.name) || 'مدير المنصة';

    /* ---------- keys & sections ---------- */
    var K = { settings: 'almel-admin-settings', users: 'almel-admin-users', sessions: 'almel-admin-sessions', integ: 'almel-admin-integrations', keys: 'almel-admin-api-keys', audit: 'almel-admin-audit', twofa: 'almel-admin-2fa' };
    var SECTIONS = [
      { id: 'general', label: 'الإعدادات العامة', icon: 'tune', desc: 'هوية الجمعية وبيانات التواصل والمنطقة الزمنية ووضع الصيانة.' },
      { id: 'constants', label: 'ثوابت النظام', icon: 'list_alt', desc: 'القوائم المنسدلة وخيارات الاختيار في اللوحة: أضف قيماً أو عدّل تسمياتها أو رتّبها أو عطّلها من مكان واحد.' },
      { id: 'appearance', label: 'المظهر', icon: 'palette', desc: 'السمة ولون التمييز والكثافة وشكل القائمة الجانبية — تُطبّق على كل صفحات اللوحة.' },
      { id: 'site_theme', label: 'مظهر الموقع', icon: 'web', desc: 'شكل الموقع العام: قوالب جاهزة وألوان مخصصة وتدرّج لوني اختياري — تُطبَّق على صفحات الموقع للزوار.' },
      { id: 'security', label: 'الأمان', icon: 'shield_lock', desc: 'سياسة كلمات المرور والمصادقة الثنائية والجلسات وقيود الوصول.' },
      { id: 'notifications', label: 'الإشعارات', icon: 'notifications', desc: 'ما يصلك من تنبيهات وعبر أي قناة، وأوقات الهدوء والملخص الدوري.' },
      { id: 'seo', label: 'محركات البحث والسوشال', icon: 'travel_explore', desc: 'البيانات الوصفية وصورة المشاركة وحسابات التواصل والتحليلات.' },
      { id: 'integrations', label: 'التكاملات', icon: 'extension', desc: 'ربط الخدمات الخارجية ومفاتيح الوصول البرمجي (API).' },
      { id: 'backup', label: 'النسخ الاحتياطي', icon: 'backup', desc: 'تصدير واستيراد بيانات اللوحة والجدولة وإعادة الضبط الكاملة.' },
      { id: 'audit', label: 'سجل النشاط', icon: 'history', desc: 'كل ما يحدث في اللوحة: من فعل ماذا ومتى.' }
    ];
    var SEC = {}; SECTIONS.forEach(function (s) { SEC[s.id] = s; });
    var STATEFUL = ['general', 'appearance', 'site_theme', 'users', 'security', 'notifications', 'donations', 'seo', 'backup'];

    /* ---------- defaults ---------- */
    var ROLES = [{ id: 'admin', label: 'مدير' }, { id: 'editor', label: 'محرر' }, { id: 'writer', label: 'كاتب' }, { id: 'viewer', label: 'مشاهد' }];
    var PERMS = [
      { g: 'المحتوى', items: [['projects_view', 'عرض المشاريع'], ['projects_edit', 'إنشاء المشاريع وتعديلها'], ['news_publish', 'نشر الأخبار والصور'], ['pages_edit', 'الصفحات والقائمة والرئيسية']] },
      { g: 'التواصل والتقارير', items: [['messages_reply', 'الرد على الرسائل والطلبات'], ['reports_export', 'تصدير التقارير']] },
      { g: 'النظام', items: [['users_manage', 'إدارة المستخدمين والأدوار'], ['settings_edit', 'تعديل الإعدادات'], ['backup_run', 'النسخ الاحتياطي والاستعادة']] }
    ];
    var ALLP = []; PERMS.forEach(function (g) { g.items.forEach(function (i) { ALLP.push(i[0]); }); });
    function permSet(list) { var o = {}; ALLP.forEach(function (p) { o[p] = list === true || list.indexOf(p) >= 0; }); return o; }
    var EVENTS = [
      ['message_new', 'رسالة أو طلب جديد', 'رسائل صفحة التواصل'], ['volunteer', 'طلب تطوع', 'عند تسجيل متطوع جديد'],
      ['project_goal', 'مشروع يقترب من هدفه', 'عند تجاوز التمويل 90%'], ['project_urgent', 'مشروع عاجل متأخر', 'تمويل أقل من 30% لأسبوعين'],
      ['news_scheduled', 'نشر خبر مجدول', 'عند نشر خبر تلقائياً'], ['security_login', 'دخول من جهاز جديد', 'تنبيه أمني لحسابك'],
      ['backup_done', 'اكتمال النسخ الاحتياطي', 'نجاح نسخة احتياطية يدوية أو مجدولة'], ['weekly', 'التقرير الأسبوعي', 'ملخص الأداء كل أحد'],
      ['newsletter_new', 'مشترك جديد في النشرة', 'اشتراك جديد من نموذج الموقع'], ['news_draft', 'مسودة خبر جديدة', 'عند إنشاء خبر كمسودة'],
      ['user_new', 'مستخدم جديد', 'عند إضافة حساب في اللوحة'], ['backup_failed', 'فشل النسخ الاحتياطي', 'فشل إنشاء نسخة أو استعادتها'],
      ['maintenance_toggle', 'وضع الصيانة', 'عند تفعيله أو إيقافه'], ['login_failed', 'محاولات دخول فاشلة', 'تكرار إدخال بيانات خاطئة']
    ];
    var CHANNELS = [['email', 'البريد', 'mail'], ['app', 'داخل اللوحة', 'notifications'], ['sms', 'رسالة نصية', 'sms']];
    function nMatrix() {
      var on = { message_new: 'ea', volunteer: 'a', project_goal: 'a', project_urgent: 'ea', news_scheduled: 'a', security_login: 'eas', backup_done: 'ea', weekly: 'e', newsletter_new: 'a', news_draft: 'a', user_new: 'a', backup_failed: 'ea', maintenance_toggle: 'a', login_failed: 'ea' }, o = {};
      EVENTS.forEach(function (e) { var f = on[e[0]] || ''; o[e[0]] = { email: f.indexOf('e') >= 0, app: f.indexOf('a') >= 0, sms: f.indexOf('s') >= 0 }; });
      return o;
    }
    var CURRENCIES = [['USD', 'دولار أمريكي', '$'], ['EUR', 'يورو', '€'], ['GBP', 'جنيه إسترليني', '£'], ['EGP', 'جنيه مصري', 'ج.م'], ['SAR', 'ريال سعودي', 'ر.س'], ['AED', 'درهم إماراتي', 'د.إ'], ['KWD', 'دينار كويتي', 'د.ك'], ['QAR', 'ريال قطري', 'ر.ق'], ['JOD', 'دينار أردني', 'د.أ'], ['TRY', 'ليرة تركية', '₺']];
    var CUR = {}; CURRENCIES.forEach(function (c) { CUR[c[0]] = c; });
    var METHODS = [
      ['card', 'البطاقات البنكية', 'فيزا وماستركارد عبر بوابة دفع', 'credit_card'], ['paypal', 'PayPal', 'دفع سريع لحاملي حسابات PayPal', 'account_balance_wallet'],
      ['applepay', 'Apple Pay و Google Pay', 'دفع بلمسة من الهاتف', 'contactless'], ['bank', 'التحويل البنكي', 'تُعرض بيانات الحساب بعد ربطها من الخادم', 'account_balance'],
      ['wallet', 'المحافظ الإلكترونية', 'محافظ الهاتف المحلية', 'smartphone']
    ];
    var OG_IMAGES = [['/assets/site/img/hero-poster.jpg', 'غلاف الرئيسية'], ['/assets/site/img/gallery-convoy.jpg', 'قافلة الإغاثة'], ['/assets/site/img/project-relief.jpg', 'توزيع المساعدات'], ['/assets/site/img/gallery-children.jpg', 'أطفال غزة'], ['/assets/site/img/activity-winter.jpg', 'حملة الشتاء'], ['/assets/site/img/footer-hardship.jpg', 'صمود']];
    var SOCIAL = [['facebook', 'فيسبوك', 'public', 'facebook.com/shamal.society'], ['x', 'إكس (تويتر)', 'alternate_email', 'x.com/shamal_society'], ['instagram', 'إنستغرام', 'photo_camera', 'instagram.com/shamal.society'], ['youtube', 'يوتيوب', 'smart_display', 'youtube.com/@shamalsociety'], ['telegram', 'تيليجرام', 'send', ''], ['whatsapp', 'واتساب', 'chat', 'wa.me/972592945557']];
    var ACCENTS = [['#f28c14', 'كهرماني (الافتراضي)'], ['#d9a21b', 'ذهبي'], ['#e8603c', 'مرجاني'], ['#5f8a1f', 'زيتوني'], ['#0f9f8f', 'فيروزي'], ['#2f6fde', 'أزرق'], ['#7c5cd6', 'بنفسجي'], ['#d6457a', 'وردي']];
    var storedTheme = UI.store.get('almel-admin-theme', null);
    var DEF = {
      general: { orgName: 'جمعية الشمال للتنمية والتطوير المجتمعي', tagline: 'لإغاثة أهل غزة ودعم صمودهم', license: 'GZA-77492', website: 'https://shamal-society.org', email: 'info@shamal-society.org', phone: '0592945557', address: 'مكتب إغاثة غزة — القاهرة (تنسيق دخول المساعدات)', logo: '', favicon: '', timezone: 'Asia/Gaza', language: 'ar', dateFormat: 'long', maintenance: false, maintenanceMsg: 'نجري تحديثات لتحسين تجربتك، وسنعود خلال وقت قصير. شكراً لصبركم.', hoursText: 'الأحد - الخميس • 8:00 ص - 4:00 م', heroStat1Value: '180K+', heroStat1Label: 'مستفيد في غزة', heroStat2Value: '5', heroStat2Label: 'محافظات القطاع', heroStat3Value: '+2,500', heroStat3Label: 'مقطع موثّق من غزة', heroStat4Value: '98.4%', heroStat4Label: 'نسبة الشفافية والتدقيق', hotlineNote: 'متاح 24/7', emailNote: 'الرد خلال ساعتين', fieldPoints: 'جباليا وبيت حانون • غزة المدينة والشاطئ • دير البلح • خان يونس ورفح', newsletterTitle: 'النشرة البريدية', newsletterText: 'اشترك لتصلك تقارير الأثر من غزة والحملات الطارئة.', brandColor: '' },
      appearance: { theme: 'light', accent: AP.DEF.accent, scale: 'md', density: 'comfortable', sidebar: 'navy', radius: 'md' },
      users: { matrix: { admin: permSet(true), editor: permSet(['projects_view', 'projects_edit', 'news_publish', 'pages_edit', 'messages_reply', 'reports_export']), writer: permSet(['projects_view', 'news_publish', 'messages_reply']), viewer: permSet(['projects_view']) }, custom: [] },
      security: { minLength: 10, upper: true, number: true, symbol: false, reuse: 5, expiry: '90', lockout: 5, enforce2fa: 'admins', alertNewDevice: true, alertFailed: true, alertCountry: true, timeout: '60', ipAllow: false, ips: ['203.0.113.0/24', '198.51.100.24'] },
      notifications: { matrix: nMatrix(), quiet: true, quietFrom: '22:00', quietTo: '07:00', digest: 'weekly', digestDay: 'sun', digestEmail: 'admin@shamal-society.org' },
      donations: { currency: 'USD', currencies: ['USD', 'EUR', 'EGP', 'SAR'], amounts: [10, 25, 50, 100, 250], defaultAmount: 50, customAmount: true, recurring: true, coverFees: true, methods: { card: true, paypal: false, applepay: false, bank: true, wallet: false }, receiptPrefix: 'ALM-', receiptNext: 1049, receiptAuto: true, receiptNote: true, receiptFooter: 'شكراً لمساهمتك في إغاثة أهل غزة. هذا إيصال إلكتروني لا يحتاج إلى توقيع.', zakat: true, zakatSeparate: true },
      seo: { titleTpl: '%s — جمعية الشمال للتنمية والتطوير المجتمعي', metaDesc: 'مؤسسة إنسانية تعمل على إغاثة أهل غزة: الغذاء والدواء والمأوى ورعاية الأيتام وفق معايير الحوكمة والشفافية.', index: true, sitemap: true, ogImage: OG_IMAGES[0][0], social: {}, analyticsId: '', anonymizeIp: true, cookieBanner: true },
      backup: { schedule: 'weekly', time: '03:00', keep: 10, incContent: true, incSettings: true, incMedia: false, dest: 'local' }
    };
    DEF.site_theme = clone(((SRV && SRV.siteTheme) || {}).defaults || { template: 'green', primary: '#0C7845', accent: '#FF7000', gradient: { on: false, from: '#0C7845', to: '#1E7A5A', dir: 'to-left' } });
    SOCIAL.forEach(function (s) { DEF.seo.social[s[0]] = s[3]; });
    function merge(def, v) {
      if (Array.isArray(def)) return Array.isArray(v) ? v : clone(def);
      if (def && typeof def === 'object') { var o = {}; var src = v && typeof v === 'object' && !Array.isArray(v) ? v : {}; Object.keys(def).forEach(function (k) { o[k] = merge(def[k], src[k]); }); if (def === DEF.users.matrix || def === DEF.notifications.matrix) Object.keys(src).forEach(function (k) { if (!(k in o)) o[k] = src[k]; }); return o; }
      return typeof v === typeof def ? v : def;
    }
    function load() {
      var raw = read(K.settings, {}), s = {};
      STATEFUL.forEach(function (k) { s[k] = merge(DEF[k], raw[k]); });
      var ap = AP.read(); ['accent', 'scale', 'density', 'sidebar', 'radius'].forEach(function (k) { s.appearance[k] = ap[k]; });
      s.appearance.theme = storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : 'light';
      (s.users.custom || []).forEach(function (r) { if (!s.users.matrix[r.id]) s.users.matrix[r.id] = permSet([]); });
      return s;
    }
    var S = load(), SAVED = clone(S);
    var rolesAll = function () { var base = (SRV && SRV.roles && SRV.roles.length) ? SRV.roles : ROLES; return base.concat(S.users.custom || []); }; // real roles come from the `roles` table (page «الأدوار والصلاحيات»)

    /* ---------- paths ---------- */
    function getP(path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, S); }
    function setP(path, v) { var ks = path.split('.'), o = S; for (var i = 0; i < ks.length - 1; i++) o = o[ks[i]]; o[ks[ks.length - 1]] = v; }
    var pid = function (path) { return 'f-' + path.replace(/\./g, '-'); };

    /* ---------- audit log ---------- */
    function audit(text, type, ic2) {
      if (SRV) return; /* السجل يُكتب من الخادم (audit_logs) */
      var list = read(K.audit, []);
      list.unshift({ t: Date.now(), by: ME, text: String(text).slice(0, 200), type: type || 'settings', icon: ic2 || 'tune', ip: '198.51.100.24' });
      write(K.audit, list.slice(0, 200));
      if (typeof renderAudit === 'function') renderAudit();
    }

    /* ---------- field builders (static labels only; values bound later) ---------- */
    function row(sec, key, title, hint, body, kw) {
      return '<div class="set-row st-row" id="set-' + sec + '-' + key + '" data-sec="' + sec + '" data-kw="' + esc(kw || '') + '"><div class="st-row-head"><h3>' + esc(title) + '</h3>' + (hint ? '<p class="hint">' + esc(hint) + '</p>' : '') + '</div><div class="fields">' + body + '</div></div>';
    }
    function card(sec, key, title, sub, body, head) {
      return '<section class="card st-card" id="card-' + sec + '-' + key + '" aria-labelledby="ct-' + sec + '-' + key + '"><div class="card-head bordered"><div><h3 class="card-title" id="ct-' + sec + '-' + key + '">' + esc(title) + '</h3>' + (sub ? '<p class="card-sub">' + esc(sub) + '</p>' : '') + '</div>' + (head || '') + '</div><div class="card-body">' + body + '</div></section>';
    }
    function text(path, label, o) {
      o = o || {}; var id = pid(path);
      var ctl = o.area ? '<textarea class="textarea" id="' + id + '" data-path="' + path + '" rows="' + (o.rows || 3) + '"' + (o.max ? ' maxlength="' + o.max + '"' : '') + ' aria-describedby="' + id + '-err' + (o.hint ? ' ' + id + '-hint' : '') + '"></textarea>'
        : '<input class="input" id="' + id + '" data-path="' + path + '" type="' + (o.type || 'text') + '"' + (o.dir ? ' dir="' + o.dir + '"' : '') + (o.max ? ' maxlength="' + o.max + '"' : '') + (o.min != null ? ' min="' + o.min + '"' : '') + (o.num ? ' data-num="1" inputmode="numeric"' : '') + (o.auto ? ' autocomplete="' + o.auto + '"' : ' autocomplete="off"') + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + ' aria-describedby="' + id + '-err' + (o.hint ? ' ' + id + '-hint' : '') + '"' + (o.req ? ' aria-required="true"' : '') + '>';
      if (o.iconName) ctl = '<span class="input-icon"><span class="material-symbols-outlined" aria-hidden="true">' + o.iconName + '</span>' + ctl + '</span>';
      return '<div class="field"><label class="label" for="' + id + '"><span>' + esc(label) + (o.req ? ' <span class="req" aria-hidden="true">*</span>' : '') + '</span>' + (o.max && o.counter ? '<span class="counter" data-counter="' + path + '" data-max="' + o.max + '"></span>' : '') + '</label>' + ctl +
        (o.hint ? '<p class="hint" id="' + id + '-hint">' + esc(o.hint) + '</p>' : '') + '<p class="error" id="' + id + '-err" hidden>' + icon('error') + '<span></span></p></div>';
    }
    function select(path, label, opts, o) {
      o = o || {}; var id = pid(path); if (o.group) opts = CP(o.group, getP(path));
      return '<div class="field"><label class="label" for="' + id + '">' + esc(label) + '</label><select class="select" id="' + id + '" data-path="' + path + '"' + (o.group ? ' data-const="' + o.group + '"' : '') + '>' + opts.map(function (x) { return '<option value="' + esc(x[0]) + '">' + esc(x[1]) + '</option>'; }).join('') + '</select>' + (o.hint ? '<p class="hint">' + esc(o.hint) + '</p>' : '') + '</div>';
    }
    function toggle(path, label, hint) {
      var id = pid(path);
      return '<div class="st-toggle"><div><strong id="' + id + '-l">' + esc(label) + '</strong>' + (hint ? '<span class="hint" id="' + id + '-h">' + esc(hint) + '</span>' : '') + '</div><button type="button" class="switch" role="switch" id="' + id + '" data-path="' + path + '" aria-checked="false" aria-labelledby="' + id + '-l"' + (hint ? ' aria-describedby="' + id + '-h"' : '') + '></button></div>';
    }
    function seg(path, label, opts, o) {
      o = o || {}; var id = pid(path); if (o.group) opts = CP(o.group, getP(path));
      return '<div class="field"><span class="label" id="' + id + '-l">' + esc(label) + '</span><div class="seg st-seg' + (o.wide ? ' is-wide' : '') + '" role="group" aria-labelledby="' + id + '-l" data-path="' + path + '">' + opts.map(function (x) { return '<button type="button" data-value="' + esc(x[0]) + '" aria-pressed="false">' + (x[2] ? icon(x[2]) : '') + esc(x[1]) + '</button>'; }).join('') + '</div>' + (o.hint ? '<p class="hint">' + esc(o.hint) + '</p>' : '') + '</div>';
    }
    function range(path, label, min, max, step, unit, hint) {
      var id = pid(path);
      return '<div class="field st-range"><label class="label" for="' + id + '"><span>' + esc(label) + '</span><output class="st-out" for="' + id + '" data-out="' + path + '" data-unit="' + esc(unit || '') + '"></output></label><input type="range" id="' + id + '" data-path="' + path + '" data-num="1" min="' + min + '" max="' + max + '" step="' + (step || 1) + '">' + (hint ? '<p class="hint">' + esc(hint) + '</p>' : '') + '</div>';
    }
    var cols = function (a, b) { return '<div class="field-row">' + a + b + '</div>'; };

    /* ---------- binding ---------- */
    function bind(scope) {
      $$('[data-path]', scope).forEach(function (el) {
        var v = getP(el.getAttribute('data-path'));
        if (el.classList.contains('switch')) el.setAttribute('aria-checked', String(!!v));
        else if (el.classList.contains('seg')) $$('button', el).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-value') === String(v))); });
        else if (el.type === 'checkbox') el.checked = !!v;
        else if (el.tagName === 'SELECT' && el.hasAttribute('data-const') && ACN) { ACN.setValue(el, v); }
        else if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') { if (String(el.value) !== String(v == null ? '' : v)) el.value = v == null ? '' : v; }
      });
      $$('[data-out]', scope).forEach(function (o) { o.textContent = getP(o.getAttribute('data-out')) + (o.getAttribute('data-unit') ? ' ' + o.getAttribute('data-unit') : ''); });
      $$('[data-counter]', scope).forEach(function (c) { var n = String(getP(c.getAttribute('data-counter')) || '').length, m = +c.getAttribute('data-max'); c.textContent = n + ' / ' + m; c.classList.toggle('over', n >= m); });
    }
    var hooks = {};
    function changed(path, el) {
      var sec = path.split('.')[0];
      $$('[data-out="' + path + '"],[data-counter="' + path + '"]').forEach(function (n) { bind(n.parentNode); });
      var err = document.getElementById(pid(path) + '-err'); if (err && !err.hidden) { err.hidden = true; if (el) el.removeAttribute('aria-invalid'); }
      if (hooks[sec]) hooks[sec](path);
      syncDirty();
    }
    root.addEventListener('input', function (e) {
      var el = e.target; if (!el.hasAttribute('data-path') || el.type === 'checkbox') return;
      var v = el.value; if (el.hasAttribute('data-num')) v = v === '' ? 0 : +v;
      setP(el.getAttribute('data-path'), v); changed(el.getAttribute('data-path'), el);
    });
    root.addEventListener('change', function (e) {
      var el = e.target; if (!el.hasAttribute('data-path')) return;
      if (el.type === 'checkbox') { setP(el.getAttribute('data-path'), el.checked); changed(el.getAttribute('data-path'), el); }
      else if (el.tagName === 'SELECT') { setP(el.getAttribute('data-path'), el.value); changed(el.getAttribute('data-path'), el); }
    });
    document.addEventListener('switch', function (e) {
      var el = e.target; if (!el.hasAttribute || !el.hasAttribute('data-path') || !root.contains(el)) return;
      setP(el.getAttribute('data-path'), e.detail.on); changed(el.getAttribute('data-path'), el);
    });
    root.addEventListener('click', function (e) {
      var b = e.target.closest('.seg[data-path] button'); if (!b) return;
      var g = b.closest('.seg'), path = g.getAttribute('data-path');
      $$('button', g).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      setP(path, b.getAttribute('data-value')); changed(path, b);
    });

    /* ---------- dirty state / save bar ---------- */
    function dirtySections() { return STATEFUL.filter(function (k) { return JSON.stringify(S[k]) !== JSON.stringify(SAVED[k]); }); }
    var lastSaved = read('almel-admin-settings-saved-at', 0);
    function syncDirty() {
      var d = dirtySections(), bar = $('#st-savebar');
      bar.hidden = !d.length; document.body.classList.toggle('st-has-bar', !!d.length);
      $('#st-dirty-list').textContent = d.length ? 'في: ' + d.map(function (k) { return (SEC[k] || { label: k }).label; }).join('، ') : '';
      $$('.st-nav a').forEach(function (a) { var dot = $('.st-nav-dirty', a); if (dot) dot.hidden = d.indexOf(a.getAttribute('data-sec')) < 0; });
      $$('[data-reset]').forEach(function (b) { var k = b.getAttribute('data-reset'); b.disabled = JSON.stringify(S[k]) === JSON.stringify(DEF[k]) && k !== 'appearance' ? true : false; });
      var st = $('#st-state');
      st.innerHTML = d.length ? '<span class="dirty-dot" aria-hidden="true"></span><span>تغييرات غير محفوظة</span>' : icon('cloud_done') + '<span>' + (lastSaved ? 'آخر حفظ ' + esc(UI.ago(Math.max(0, Math.round((Date.now() - lastSaved) / 60000)))) : 'كل الإعدادات محفوظة') + '</span>';
      st.classList.toggle('is-dirty', !!d.length);
    }
    function validate() {
      var errs = [];
      function need(path, ok, msg) { if (!ok) errs.push({ path: path, msg: msg }); }
      var g = S.general, s = S.seo, dn = S.donations, n = S.notifications;
      need('general.orgName', String(g.orgName).trim().length >= 2, 'اسم الجمعية مطلوب.');
      need('general.email', EMAIL.test(String(g.email).trim()), 'أدخل بريداً إلكترونياً صالحاً.');
      need('general.phone', !g.phone || /^[+\d\s()-]{6,22}$/.test(g.phone), 'رقم الهاتف غير صالح.');
      need('general.website', !g.website || /^https?:\/\/[^\s.]+\.[^\s]{2,}$/.test(g.website), 'يجب أن يبدأ الرابط بـ https://');
      need('general.maintenanceMsg', !g.maintenance || String(g.maintenanceMsg).trim().length >= 10, 'اكتب رسالة للزوار (10 أحرف على الأقل).');
      need('general.hotlineNote', String(g.hotlineNote || '').length <= 80, 'ملاحظة الخط الساخن: 80 حرفاً كحد أقصى.');
      need('general.emailNote', String(g.emailNote || '').length <= 80, 'ملاحظة البريد: 80 حرفاً كحد أقصى.');
      (function () {
        var pts = String(g.fieldPoints || '').split(/[•\r\n]+/).map(function (x) { return x.trim(); }).filter(Boolean);
        need('general.fieldPoints', pts.length <= 8, 'نقاط الميدان: 8 نقاط كحد أقصى (الحالي ' + pts.length + ').');
        need('general.fieldPoints', pts.every(function (x) { return x.length <= 60; }), 'نقاط الميدان: كل نقطة 60 حرفاً كحد أقصى.');
      })();
      need('general.newsletterTitle', String(g.newsletterTitle || '').length <= 80, 'عنوان النشرة البريدية: 80 حرفاً كحد أقصى.');
      need('general.newsletterText', String(g.newsletterText || '').length <= 300, 'نص النشرة البريدية: 300 حرف كحد أقصى.');
      (function () {
        var t = S.site_theme, gr = t.gradient, white = '#FFFFFF';
        need('site_theme.primary', TC.ok(t.primary), 'اللون الأساسي يجب أن يكون بصيغة #RRGGBB (مثال: #0C7845).');
        if (TC.ok(t.primary) && t.template === 'custom') need('site_theme.primary', TC.contrast(t.primary, white) >= 3, 'اللون الأساسي فاتح جداً: النص الأبيض عليه غير مقروء (التباين ' + TC.contrast(t.primary, white).toFixed(1) + ':1 والحد الأدنى 3:1). اختر لوناً أغمق.');
        need('site_theme.accent', TC.ok(t.accent), 'لون التمييز يجب أن يكون بصيغة #RRGGBB (مثال: #FF7000).');
        need('site_theme.gradient', TC.ok(gr.from) && TC.ok(gr.to), 'ألوان التدرّج يجب أن تكون بصيغة #RRGGBB.');
        if (gr.on && TC.ok(gr.from) && TC.ok(gr.to)) need('site_theme.gradient', TC.contrast(gr.from, white) >= 3 && TC.contrast(gr.to, white) >= 3, 'أحد لوني التدرّج فاتح جداً: النص الأبيض عليه غير مقروء (الحد الأدنى للتباين 3:1). اختر لونين أغمق.');
        need('site_theme.gradient', !!TH_DIR[gr.dir], 'اتجاه التدرّج غير مسموح.');
      })();
      need('seo.titleTpl', String(s.titleTpl).indexOf('%s') >= 0, 'يجب أن يحتوي القالب على %s مكان اسم الصفحة.');
      need('seo.analyticsId', !s.analyticsId || /^G-[A-Z0-9]{6,12}$/.test(s.analyticsId), 'المعرّف يبدأ بـ G- متبوعاً بأحرف كبيرة وأرقام.');
      need('donations.receiptPrefix', /^[A-Za-z0-9-]{0,8}$/.test(dn.receiptPrefix), 'أحرف لاتينية وأرقام وشرطة فقط (حتى 8).');
      need('donations.receiptNext', Number.isInteger(+dn.receiptNext) && +dn.receiptNext >= 1, 'رقم صحيح أكبر من صفر.');
      need('notifications.digestEmail', n.digest === 'off' || EMAIL.test(String(n.digestEmail).trim()), 'أدخل بريداً صالحاً لاستلام الملخص.');
      return errs;
    }
    function save() {
      var d = dirtySections(); if (!d.length) { toast('لا توجد تغييرات للحفظ', { tone: 'info', icon: 'info', duration: 2200 }); return false; }
      var errs = validate();
      $$('.error[id^="f-"]').forEach(function (e) { e.hidden = true; });
      if (errs.length) {
        errs.forEach(function (x) { var el = document.getElementById(pid(x.path)), er = document.getElementById(pid(x.path) + '-err'); if (el) el.setAttribute('aria-invalid', 'true'); if (er) { er.hidden = false; $('span:last-child', er).textContent = x.msg; } });
        var sec = errs[0].path.split('.')[0]; go(sec, null, true);
        var f = document.getElementById(pid(errs[0].path)); if (f) { f.scrollIntoView({ block: 'center', behavior: UI.reduceMotion ? 'auto' : 'smooth' }); f.focus({ preventScroll: true }); }
        toast('راجع الحقول المظللة', { text: errs.length === 1 ? errs[0].msg : errs.length + ' حقول تحتاج إلى تصحيح.', tone: 'danger', icon: 'error' });
        return false;
      }
      function finish() {
        var ap = AP.clean(S.appearance), apDef = JSON.stringify(ap) === JSON.stringify(AP.clean(null));
        try { if (apDef) localStorage.removeItem(AP.KEY); else localStorage.setItem(AP.KEY, JSON.stringify(ap)); } catch (e) { /* ignore */ }
        UI.setThemeMode(S.appearance.theme);
        SAVED = clone(S); lastSaved = Date.now(); lwrite('almel-admin-settings-saved-at', lastSaved);
        audit('حدّث الإعدادات: ' + d.map(function (k) { return (SEC[k] || { label: k }).label; }).join('، '), 'settings', 'tune');
        syncDirty();
        toast('تم حفظ الإعدادات', { text: d.map(function (k) { return (SEC[k] || { label: k }).label; }).join('، ') + (d.indexOf('appearance') >= 0 ? ' — المظهر مطبّق الآن على كل الصفحات.' : ''), icon: 'cloud_done' });
      }
      if (SRV) {
        if (d.indexOf('donations') >= 0) lwrite(DONATIONS_KEY, S.donations); /* التبرعات: معاينة محلية فقط */
        var secs = d.filter(function (k) { return k !== 'donations'; }), btn = $('#st-save'), snapshot = clone(S);
        if (btn) btn.disabled = true;
        Promise.all(secs.map(function (k) { return http('PUT', BASE + '/' + k, { data: snapshot[k] }).then(function (x) { x.sec = k; return x; }); })).then(function (res) {
          if (btn) btn.disabled = false;
          var bad = res.filter(function (x) { return !x.ok; });
          res.forEach(function (x) { if (x.ok) { SRV.settings = SRV.settings || {}; SRV.settings[x.sec] = snapshot[x.sec]; if (x.j.audit) SRV.audit = x.j.audit; } });
          if (bad.length) {
            var first = bad[0], errs = (first.j && first.j.errors) || {}, ek = Object.keys(errs)[0], path = null;
            if (ek) { var parts = ek.replace(/^data\.?/, '').split('.'); path = first.sec + '.' + parts[0]; }
            var el = path && document.getElementById(pid(path)), er = path && document.getElementById(pid(path) + '-err');
            if (el) el.setAttribute('aria-invalid', 'true'); if (er) { er.hidden = false; $('span:last-child', er).textContent = failText(first); }
            if (el) { go(first.sec, null, true); el.scrollIntoView({ block: 'center', behavior: UI.reduceMotion ? 'auto' : 'smooth' }); }
            toast('تعذّر الحفظ', { text: failText(first), tone: 'danger', icon: 'error' });
            res.forEach(function (x) { if (x.ok) SAVED[x.sec] = clone(snapshot[x.sec]); });
            syncDirty(); if (typeof renderAudit === 'function') renderAudit();
            return;
          }
          finish(); if (typeof renderAudit === 'function') renderAudit();
        }, function () { if (btn) btn.disabled = false; toast('تعذّر الحفظ', { text: 'تعذّر الاتصال بالخادم.', tone: 'danger', icon: 'error' }); });
        return true;
      }
      var out = {}; STATEFUL.forEach(function (k) { out[k] = S[k]; });
      out.appearance = { theme: S.appearance.theme };
      if (!write(K.settings, out)) { toast('تعذّر الحفظ', { text: 'مساحة التخزين غير متاحة.', tone: 'danger', icon: 'error' }); return false; }
      finish();
      return true;
    }
    function discard() {
      var d = dirtySections(); S = clone(SAVED);
      d.forEach(function (k) { renderSection(k); });
      applyLive(); syncDirty();
      toast('تم تجاهل التغييرات', { text: 'عادت الإعدادات إلى آخر نسخة محفوظة.', tone: 'info', icon: 'undo' });
    }
    $('#st-save').addEventListener('click', save);
    $('#st-discard').addEventListener('click', discard);
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 's' || e.key === 'S')) { e.preventDefault(); save(); }
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '') && !document.querySelector('.modal')) { e.preventDefault(); $('#st-search').focus(); }
    });
    window.addEventListener('beforeunload', function (e) { if (dirtySections().length) { e.preventDefault(); e.returnValue = ''; } });
    function resetSection(k) {
      modal({ title: 'إعادة ضبط «' + (SEC[k] || { label: k }).label + '»؟', text: 'ستعود إعدادات هذا القسم إلى القيم الافتراضية. لن يُطبَّق ذلك حتى تضغط «حفظ التغييرات».', icon: 'restart_alt', tone: 'warn', confirmText: 'إعادة الضبط' }).then(function (ok) {
        if (!ok) return;
        S[k] = clone(DEF[k]); renderSection(k); if (k === 'appearance') applyLive(); syncDirty();
        toast('أُعيد ضبط القسم', { text: (SEC[k] || { label: k }).label + ' — احفظ لتطبيقه.', tone: 'info', icon: 'restart_alt' });
      });
    }

    /* =================== SECTION RENDERERS =================== */
    var R = {}, INIT = {};
    var TZ = [['Asia/Gaza', 'غزة (GMT+3)'], ['Asia/Hebron', 'الخليل (GMT+3)'], ['Africa/Cairo', 'القاهرة (GMT+3)'], ['Asia/Amman', 'عمّان (GMT+3)'], ['Asia/Riyadh', 'الرياض (GMT+3)'], ['Europe/Istanbul', 'إسطنبول (GMT+3)'], ['Asia/Dubai', 'دبي (GMT+4)'], ['Europe/London', 'لندن'], ['UTC', 'التوقيت العالمي UTC']];
    function uploader(key, label, hint) {
      return '<div class="st-upload" data-upload="' + key + '"><span class="st-upload-prev st-up-' + key + '" aria-hidden="true"></span><div class="st-upload-meta"><div class="st-upload-btns"><label class="btn btn-secondary btn-sm file-btn">' + icon('upload') + esc(label) + '<input type="file" class="sr-only" accept="image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon" data-file="' + key + '"></label><button type="button" class="btn btn-ghost btn-sm" data-unset="' + key + '">' + icon('delete') + 'إزالة</button></div><p class="hint">' + esc(hint) + '</p></div></div>';
    }
    R.general = function () {
      return card('general', 'identity', 'هوية الجمعية', 'تظهر في رأس الموقع وتذييله والإيصالات والتقارير.',
          row('general', 'name', 'الاسم والشعار النصي', 'كما ورد في شهادة الترخيص.', cols(text('general.orgName', 'اسم الجمعية', { req: true, max: 60, counter: true }), text('general.tagline', 'الشعار النصي', { max: 90, counter: true })) + cols(text('general.license', 'رقم الترخيص', { dir: 'ltr', max: 30 }), text('general.website', 'الموقع الإلكتروني', { dir: 'ltr', type: 'url', iconName: 'language' })), 'اسم الجمعية شعار ترخيص موقع') +
          row('general', 'logo', 'الشعار', 'SVG أو PNG بخلفية شفافة. يُحفظ في المتصفح إذا كان أصغر من 200 KB.', uploader('logo', 'رفع الشعار', 'مربع 512×512 بكسل يعطي أفضل نتيجة.'), 'logo شعار صورة رفع') +
          row('general', 'favicon', 'أيقونة المتصفح', 'تظهر في تبويب المتصفح والمفضلة.', uploader('favicon', 'رفع الأيقونة', 'PNG أو ICO بحجم 64×64 بكسل.') + '<div class="st-tab-mock" aria-hidden="true"><span class="st-tab-fav st-up-favicon"></span><span class="st-tab-title" data-live="orgName"></span><span class="material-symbols-outlined">close</span></div>', 'favicon أيقونة تبويب') +
          row('general', 'brand', 'لون الهوية', 'هو اللون الأساسي لمظهر الموقع ويُضبط من قسم «مظهر الموقع»، ويُستخدم أيضاً للون شريط المتصفح في الجوال.', '<div class="field"><div class="st-custom-color"><span class="st-brand-dot" data-live="themePrimary" aria-hidden="true"></span><strong class="st-hex-read" dir="ltr" data-live="themePrimary"></strong><a class="btn btn-secondary btn-sm" href="#site_theme/colors">' + icon('palette') + 'تغيير من «مظهر الموقع»</a></div></div>', 'لون الهوية اللون الأساسي أخضر brand color theme-color')) +
        card('general', 'contact', 'بيانات التواصل', 'تُستخدم في صفحة «تواصل معنا» والإيصالات.',
          row('general', 'contact', 'البريد والهاتف', 'قنوات التواصل الرسمية مع المتبرعين.', cols(text('general.email', 'البريد العام', { req: true, type: 'email', dir: 'ltr', iconName: 'mail', auto: 'email' }), text('general.phone', 'الخط الساخن', { type: 'tel', dir: 'ltr', iconName: 'call', auto: 'tel' })), 'بريد ايميل هاتف جوال تواصل') +
          row('general', 'address', 'العنوان', 'يظهر في التذييل وصفحة التواصل.', text('general.address', 'العنوان', { area: true, rows: 2, max: 160 }), 'عنوان مكتب') +
          row('general', 'contactnotes', 'ملاحظات بطاقات التواصل', 'تظهر أسفل الخط الساخن والبريد في الرئيسية وصفحة «تواصل معنا». اترك الحقل فارغاً لاستعادة القيمة الافتراضية.', cols(text('general.hotlineNote', 'ملاحظة الخط الساخن', { max: 80, counter: true, ph: 'متاح 24/7' }), text('general.emailNote', 'ملاحظة البريد', { max: 80, counter: true, ph: 'الرد خلال ساعتين' })), 'ملاحظة الخط الساخن البريد الرد ساعات متاح') +
          row('general', 'fieldpoints', 'نقاط الميدان داخل غزة', 'تظهر في الرئيسية وصفحة «تواصل معنا». افصل بين النقاط بالرمز • (حتى 8 نقاط، وكل نقطة 60 حرفاً كحد أقصى). اترك الحقل فارغاً لاستعادة الافتراضي.', text('general.fieldPoints', 'نقاط الميدان', { area: true, rows: 2, max: 600, counter: true }), 'نقاط الميدان مناطق جباليا خان يونس رفح دير البلح')) +
        card('general', 'locale', 'المنطقة واللغة', null,
          row('general', 'timezone', 'المنطقة الزمنية', 'تُستخدم لمواعيد النشر والتقارير.', select('general.timezone', 'المنطقة الزمنية', TZ, { group: 'timezone' }), 'توقيت منطقة زمنية ساعة') +
          row('general', 'language', 'لغة اللوحة', 'اللغة الافتراضية لواجهة الإدارة.', seg('general.language', 'اللغة', [['ar', 'العربية'], ['en', 'English']], { group: 'language' }), 'لغة عربي انجليزي') +
          row('general', 'date', 'تنسيق التاريخ', null, seg('general.dateFormat', 'التنسيق', [['long', 'طويل'], ['short', 'مختصر'], ['iso', 'رقمي']], { group: 'date_format' }) + '<p class="st-example">' + icon('event') + '<span>مثال: </span><strong id="st-date-example"></strong></p>', 'تاريخ تنسيق')) +
        card('general', 'sitecards', 'بطاقات الموقع العام', 'تظهر في الصفحة الرئيسية وصفحة «تواصل معنا». اترك الحقل فارغاً لاستعادة القيمة الافتراضية.',
          row('general', 'hours', 'ساعات الدوام', 'يُفصل اليوم عن الوقت بالرمز • (مثال: الأحد - الخميس • 8:00 ص - 4:00 م).', text('general.hoursText', 'ساعات الدوام', { max: 80 }), 'دوام ساعات مواعيد عمل') +
          row('general', 'herostats', 'بطاقات الأرقام في الواجهة', 'أربع بطاقات أسفل العنوان الرئيسي: الرقم (مثل 180K+ أو 98.4%) ثم الوصف.', cols(text('general.heroStat1Value', 'الرقم ١', { dir: 'ltr', max: 20 }), text('general.heroStat1Label', 'الوصف ١', { max: 40 })) + cols(text('general.heroStat2Value', 'الرقم ٢', { dir: 'ltr', max: 20 }), text('general.heroStat2Label', 'الوصف ٢', { max: 40 })) + cols(text('general.heroStat3Value', 'الرقم ٣', { dir: 'ltr', max: 20 }), text('general.heroStat3Label', 'الوصف ٣', { max: 40 })) + cols(text('general.heroStat4Value', 'الرقم ٤', { dir: 'ltr', max: 20 }), text('general.heroStat4Label', 'الوصف ٤', { max: 40 })), 'ارقام احصائيات بطاقات الرئيسية')) +
        card('general', 'footer', 'تذييل الموقع', 'صندوق النشرة البريدية في أسفل كل صفحات الموقع. اترك الحقل فارغاً لاستعادة القيمة الافتراضية.',
          row('general', 'newsletter', 'صندوق النشرة البريدية', 'العنوان والنص القصير فوق نموذج الاشتراك.', text('general.newsletterTitle', 'عنوان النشرة', { max: 80, counter: true, ph: 'النشرة البريدية' }) + text('general.newsletterText', 'نص النشرة', { area: true, rows: 2, max: 300, counter: true, ph: 'اشترك لتصلك تقارير الأثر من غزة والحملات الطارئة.' }), 'النشرة البريدية اشتراك التذييل newsletter footer')) +
        card('general', 'maintenance', 'وضع الصيانة', 'يعرض للزوار رسالة مؤقتة بدل الموقع أثناء التحديثات.',
          row('general', 'maintenance', 'تفعيل وضع الصيانة', 'يبقى الوصول متاحاً للمسؤولين.', toggle('general.maintenance', 'إيقاف الموقع مؤقتاً للزوار', 'عند التفعيل يرى الزوار صفحة صيانة (503) ويبقى الوصول متاحاً لمسؤولي اللوحة.') +
            '<p class="hint"><a href="/admin/maintenance">إعدادات متقدمة: عناوين IP المسموحة والجدولة الزمنية</a></p><div class="st-when" data-when="general.maintenance">' + text('general.maintenanceMsg', 'رسالة الصيانة', { area: true, rows: 3, max: 220, counter: true }) + '<div class="st-maint-prev" aria-hidden="true"><span class="material-symbols-outlined">construction</span><div><strong>الموقع تحت الصيانة</strong><span data-live="maintenanceMsg"></span></div></div></div>', 'صيانة ايقاف رسالة maintenance'));
    };
    INIT.general = function () { hooks.general(); };
    hooks.general = function () {
      var g = S.general;
      $$('[data-live="orgName"]').forEach(function (n) { n.textContent = g.orgName || 'جمعية الشمال للتنمية والتطوير المجتمعي'; });
      $$('[data-live="maintenanceMsg"]').forEach(function (n) { n.textContent = g.maintenanceMsg; });
      $$('[data-when="general.maintenance"]').forEach(function (n) { n.hidden = !g.maintenance; });
      if (hooks.site_theme && S.site_theme) $$('[data-live="themePrimary"]').forEach(function (n) { n.textContent = String(S.site_theme.primary).toUpperCase(); n.style.setProperty('--sw', S.site_theme.primary); });
      ['logo', 'favicon'].forEach(function (k) {
        $$('.st-up-' + k).forEach(function (box) {
          box.textContent = '';
          var src = temp[k] || g[k];
          if (src && /^data:image\//.test(src)) box.appendChild(h('img', { src: src, alt: '' }));
          else box.appendChild(ic(k === 'logo' ? 'water_drop' : 'public'));
        });
        var rm = $('[data-unset="' + k + '"]'); if (rm) rm.disabled = !(temp[k] || g[k]);
      });
      var ex = $('#st-date-example');
      if (ex) {
        var d = new Date(), o = g.dateFormat === 'long' ? { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' } : g.dateFormat === 'short' ? { day: 'numeric', month: 'short', year: 'numeric' } : { year: 'numeric', month: '2-digit', day: '2-digit' };
        try { o.timeZone = g.timezone; ex.textContent = new Intl.DateTimeFormat(g.language === 'en' ? 'en-GB' : 'ar-EG-u-nu-latn', o).format(d); } catch (e) { ex.textContent = d.toDateString(); }
      }
    };
    var temp = {};
    root.addEventListener('change', function (e) {
      var inp = e.target.closest('[data-file]'); if (!inp) return;
      var k = inp.getAttribute('data-file'), f = inp.files && inp.files[0]; inp.value = '';
      if (!f) return;
      if (!/^image\//.test(f.type)) { toast('نوع الملف غير مدعوم', { text: 'اختر صورة PNG أو JPG أو SVG.', tone: 'danger', icon: 'error' }); return; }
      UI.readFileAsDataURL(f).then(function (src) {
        if (f.size <= 200 * 1024) { temp[k] = null; S.general[k] = src; toast(k === 'logo' ? 'تم تحديث الشعار' : 'تم تحديث الأيقونة', { text: f.name + ' — ' + UI.fmtSize(f.size) + '. احفظ لتثبيته.', icon: 'image' }); }
        else { temp[k] = src; toast('الصورة كبيرة للحفظ في المتصفح', { text: UI.fmtSize(f.size) + ' — تُعرض كمعاينة فقط (الحد 200 KB).', tone: 'info', icon: 'info' }); }
        hooks.general(); syncDirty();
      });
    });
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-unset]'); if (!b) return;
      var k = b.getAttribute('data-unset'); temp[k] = null; S.general[k] = ''; hooks.general(); syncDirty();
      toast('أُزيلت الصورة', { tone: 'info', icon: 'hide_image', duration: 2200 });
    });

    /* ----- appearance ----- */
    R.appearance = function () {
      var themes = [['light', 'فاتح', 'light_mode'], ['dark', 'داكن', 'dark_mode'], ['auto', 'تلقائي', 'contrast']];
      var sb = [['navy', 'كحلي', 'الافتراضي'], ['midnight', 'ليلي', 'أغمق وأهدأ'], ['glow', 'متوهج', 'بلمسة من لون التمييز']];
      var controls =
        card('appearance', 'theme', 'السمة', 'تنطبق على كل صفحات اللوحة وتُحفظ في هذا المتصفح.',
          row('appearance', 'theme', 'وضع العرض', '«تلقائي» يتبع إعدادات جهازك.', '<div class="st-choice st-theme-choice" role="group" aria-label="وضع العرض" data-path="appearance.theme">' + themes.map(function (t) { return '<button type="button" class="st-choice-card" data-value="' + t[0] + '" aria-pressed="false"><span class="st-theme-art is-' + t[0] + '" aria-hidden="true"><i></i><b></b></span><span class="st-choice-label">' + icon(t[2]) + t[1] + '</span></button>'; }).join('') + '</div>', 'سمة داكن فاتح تلقائي dark light theme') +
          row('appearance', 'accent', 'لون التمييز', 'يُستخدم للأزرار المميزة والمؤشرات. نضبط درجات النص تلقائياً لتبقى مقروءة.', '<div class="st-swatches" role="group" aria-label="ألوان جاهزة">' + ACCENTS.map(function (a) { return '<button type="button" class="st-swatch" data-accent="' + a[0] + '" aria-pressed="false" style="--sw:' + a[0] + '"><span class="sr-only">' + esc(a[1]) + '</span></button>'; }).join('') + '</div>' +
            '<div class="st-custom-color"><label class="st-color-btn" for="st-accent-picker"><input type="color" id="st-accent-picker"><span>لون مخصص</span></label><label class="sr-only" for="st-accent-hex">رمز اللون</label><input class="input sm st-hex" id="st-accent-hex" dir="ltr" maxlength="7" spellcheck="false" autocomplete="off"><span class="st-contrast" id="st-contrast"></span></div>', 'لون تمييز accent color لون')) +
        card('appearance', 'layout', 'الخط والكثافة والشكل', null,
          row('appearance', 'scale', 'حجم الخط', 'يكبّر أو يصغّر محتوى الصفحات.', seg('appearance.scale', 'حجم الخط', [['sm', 'صغير'], ['md', 'افتراضي'], ['lg', 'كبير'], ['xl', 'أكبر']]), 'حجم خط تكبير font size') +
          row('appearance', 'density', 'الكثافة', 'المضغوط يعرض بيانات أكثر في الشاشة.', seg('appearance.density', 'الكثافة', [['comfortable', 'مريح', 'density_large'], ['compact', 'مضغوط', 'density_small']]), 'كثافة مضغوط مريح density') +
          row('appearance', 'sidebar', 'القائمة الجانبية', null, '<div class="st-choice st-sb-choice" role="group" aria-label="نمط القائمة الجانبية" data-path="appearance.sidebar">' + sb.map(function (t) { return '<button type="button" class="st-choice-card" data-value="' + t[0] + '" aria-pressed="false"><span class="st-sb-art is-' + t[0] + '" aria-hidden="true"><i></i><i></i><i></i></span><span class="st-choice-label">' + t[1] + '<small>' + t[2] + '</small></span></button>'; }).join('') + '</div>', 'قائمة جانبية sidebar شريط') +
          row('appearance', 'radius', 'استدارة الزوايا', null, seg('appearance.radius', 'الاستدارة', [['sharp', 'حادة'], ['md', 'متوسطة'], ['round', 'دائرية']]), 'زوايا استدارة radius'));
      var preview = '<section class="card st-card st-preview-card" aria-labelledby="ap-prev-t"><div class="card-head bordered"><div><h3 class="card-title" id="ap-prev-t">معاينة حية</h3><p class="card-sub">تتغير فوراً مع كل اختيار.</p></div></div><div class="card-body"><div class="ap-prev" id="ap-prev" aria-hidden="true">' +
        '<div class="ap-sb"><span class="ap-brand"><i></i></span><span class="ap-link is-on"><i></i><b></b></span><span class="ap-link"><i></i><b></b></span><span class="ap-link"><i></i><b></b></span><span class="ap-link"><i></i><b></b></span></div>' +
        '<div class="ap-main"><div class="ap-top"><b></b><span class="ap-badge">بيانات تجريبية</span></div><div class="ap-body"><p class="ap-title">نظرة عامة</p><div class="ap-stats"><div class="ap-stat"><small>التبرعات</small><strong>$42,850</strong><em>+18%</em></div><div class="ap-stat"><small>المشاريع</small><strong>48</strong><em>نشط</em></div></div>' +
        '<div class="ap-table"><span><i></i><em class="ap-pill">منشور</em></span><span><i></i><em class="ap-pill is-muted">مسودة</em></span><span><i></i><em class="ap-pill">منشور</em></span></div><div class="ap-actions"><span class="ap-btn">حفظ</span><span class="ap-btn is-accent">تبرّع الآن</span><span class="ap-switch"></span></div></div></div></div>' +
        '<p class="hint st-prev-note">' + icon('info') + 'تُطبَّق التغييرات على هذه الصفحة فوراً للتجربة، وعلى كل الصفحات بعد الحفظ.</p></div></section>';
      return '<div class="st-split"><div class="st-split-main">' + controls + '</div><div class="st-split-side">' + preview + '</div></div>';
    };
    INIT.appearance = function () { hooks.appearance(); };
    hooks.appearance = function () {
      var a = S.appearance, pv = $('#ap-prev');
      $$('.st-choice[data-path]').forEach(function (g) { var v = getP(g.getAttribute('data-path')); $$('button', g).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-value') === v)); }); });
      $$('.st-swatch').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-accent') === a.accent)); });
      var pk = $('#st-accent-picker'), hx = $('#st-accent-hex');
      if (pk && pk.value !== a.accent) pk.value = a.accent;
      if (hx && document.activeElement !== hx) hx.value = a.accent.toUpperCase();
      var d = AP.derive(a.accent), c = $('#st-contrast');
      if (c) { var r = AP.contrast(d.text, '#ffffff'); c.textContent = 'تباين النص ' + r.toFixed(1) + ':1 — ' + (r >= 4.5 ? 'مطابق لمعيار AA' : 'منخفض'); c.className = 'st-contrast ' + (r >= 4.5 ? 'is-ok' : 'is-bad'); }
      if (pv) {
        var dark = a.theme === 'dark' || (a.theme === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
        pv.classList.toggle('is-dark', dark); pv.classList.toggle('is-compact', a.density === 'compact');
        pv.setAttribute('data-sb', a.sidebar); pv.setAttribute('data-radius', a.radius);
        pv.style.setProperty('--pa', d.base); pv.style.setProperty('--pa-text', dark ? d.textDark : d.text); pv.style.setProperty('--pa-tint', dark ? d.tintDark : d.s50);
        pv.style.setProperty('--pa-on', d.onAccent); pv.style.setProperty('--pa-300', a.accent === AP.DEF.accent ? '#fdba5c' : d.s300);
        pv.style.setProperty('--pscale', AP.SCALES[a.scale]);
      }
      applyLive();
    };
    function applyLive() {
      var a = S.appearance;
      var dark = a.theme === 'dark' || (a.theme === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', dark);
      AP.apply(a);
    }
    root.addEventListener('click', function (e) {
      var ch = e.target.closest('.st-choice[data-path] button');
      if (ch) { var g = ch.closest('.st-choice'); setP(g.getAttribute('data-path'), ch.getAttribute('data-value')); changed(g.getAttribute('data-path')); return; }
      var sw = e.target.closest('.st-swatch');
      if (sw) { S.appearance.accent = sw.getAttribute('data-accent'); changed('appearance.accent'); announce('لون التمييز: ' + $('.sr-only', sw).textContent); }
    });
    root.addEventListener('input', function (e) {
      if (e.target.id === 'st-accent-picker') { S.appearance.accent = e.target.value.toLowerCase(); changed('appearance.accent'); }
      if (e.target.id === 'st-accent-hex') { var v = e.target.value.trim(); if (/^#[0-9a-f]{6}$/i.test(v)) { S.appearance.accent = v.toLowerCase(); changed('appearance.accent'); } }
    });
    // the topbar theme button writes the theme immediately: keep settings in sync
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.theme-toggle')) return;
      setTimeout(function () { var t = UI.store.get('almel-admin-theme', null); S.appearance.theme = SAVED.appearance.theme = t || 'light'; hooks.appearance(); syncDirty(); }, 0);
    });

    /* ----- مظهر الموقع (الواجهة العامة): قوالب جاهزة + ألوان مخصصة + تدرّج اختياري. يُحفظ في الإعداد site.theme ويُطبَّق على الموقع عبر متغيرات CSS ----- */
    var TC = {
      rgb: function (x) { x = String(x).replace('#', ''); return [parseInt(x.substr(0, 2), 16), parseInt(x.substr(2, 2), 16), parseInt(x.substr(4, 2), 16)]; },
      hex: function (c) { return '#' + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join('').toUpperCase(); },
      ok: function (v) { return /^#[0-9a-fA-F]{6}$/.test(String(v || '')); },
      mix: function (a, b, t) { var x = TC.rgb(a), y = TC.rgb(b); return TC.hex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); },
      hsl: function (hex) {
        var c = TC.rgb(hex).map(function (v) { return v / 255; }), r = c[0], g = c[1], b = c[2], max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
        if (max === min) return [0, 0, l];
        var d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min), hh;
        if (max === r) hh = (g - b) / d + (g < b ? 6 : 0); else if (max === g) hh = (b - r) / d + 2; else hh = (r - g) / d + 4;
        return [hh * 60, s, l];
      },
      fromHsl: function (h, s, l) {
        h = (((h % 360) + 360) % 360) / 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
        if (s === 0) return TC.hex([l * 255, l * 255, l * 255]);
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
        function f(t) { t = t < 0 ? t + 1 : (t > 1 ? t - 1 : t); if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; }
        return TC.hex([f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255]);
      },
      lum: function (hex) { var c = TC.rgb(hex).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; },
      contrast: function (a, b) { var x = TC.lum(a), y = TC.lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); },
      analog: function (p) {
        var v = TC.hsl(p), c = TC.fromHsl(v[0] + 32, Math.min(Math.max(v[1], 0.35), 0.85), v[2]);
        for (var i = 0; i < 12 && TC.contrast(c, '#FFFFFF') < 3.4; i++) c = TC.mix(c, '#000000', 0.08);
        return c;
      },
      palette: function (primary, accent) {
        var p = primary.toUpperCase(), v = TC.hsl(p), f = Math.max(0.15, Math.min(1, v[1] / 0.6));
        var tint = TC.fromHsl(v[0], 0.36 * f, 0.94), line = TC.fromHsl(v[0], 0.16 * f, 0.88), gtext = p;
        for (var i = 0; i < 14 && TC.contrast(gtext, tint) < 4.5; i++) gtext = TC.mix(gtext, '#000000', 0.07);
        var acc = accent.toUpperCase(), ink = TC.fromHsl(v[0], 0.25 * f, 0.11);
        return {
          p: p, m: TC.mix(p, '#000000', 0.22), d: TC.mix(p, '#000000', 0.49), x: TC.mix(p, '#000000', 0.64), tint: tint, g400: TC.fromHsl(v[0], 0.36 * f, 0.83), gtext: gtext,
          canvas: TC.fromHsl(v[0], 0.25 * f, 0.97), line: line, ink: ink, muted: TC.fromHsl(v[0], 0.12 * f, 0.34), donate: acc,
          ink_on_donate: TC.contrast(acc, ink) >= TC.contrast(acc, '#FFFFFF') ? ink : '#FFFFFF'
        };
      }
    };
    var THR = (SRV && SRV.siteTheme) || { templates: [], dirs: [{ key: 'to-left', label: 'نحو اليسار', css: 'to left' }], defaults: { template: 'green', primary: '#0C7845', accent: '#FF7000', gradient: { on: false, from: '#0C7845', to: '#1E7A5A', dir: 'to-left' } } };
    var TH_TPL = {}; THR.templates.forEach(function (t) { TH_TPL[t.key] = t; });
    var TH_DIR = {}; THR.dirs.forEach(function (d) { TH_DIR[d.key] = d; });
    var TH_PRIMARIES = ['#0C7845', '#0F3B75', '#116673', '#3D4247', '#7A1F3D', '#5B3A8C', '#7A4B1E', '#1F5F8B'];
    var TH_ACCENTS = ['#FF7000', '#F9B006', '#FFAE00', '#E8603C', '#1E88E5', '#2E9E6B', '#D6457A', '#7C5CD6'];
    function thPalette(t) {
      if (t.template !== 'custom' && TH_TPL[t.template]) return TH_TPL[t.template].palette;
      var pal = TC.palette(TC.ok(t.primary) ? t.primary : DEF.site_theme.primary, TC.ok(t.accent) ? t.accent : DEF.site_theme.accent); return pal;
    }
    function thFlat(t) { return t.template === 'green'; }
    function thDir(g) { return (TH_DIR[g.dir] || THR.dirs[0] || { css: 'to left' }).css; }
    function thGrad(g, k) { var f = TC.ok(g.from) ? g.from : '#0C7845', o = TC.ok(g.to) ? g.to : f; return 'linear-gradient(' + thDir(g) + ',' + TC.mix(f, '#000000', k) + ',' + TC.mix(o, '#000000', k) + ')'; }
    /* متغيرات المعاينة (كلها ألوان محقّقة #RRGGBB أو تدرّجات مبنية منها) */
    function thVars(t) {
      var pal = thPalette(t), g = t.gradient, on = !!g.on, flat = thFlat(t);
      var fp = on ? thGrad(g, 0) : pal.p, fd = on ? thGrad(g, flat ? 0 : 0.49) : (flat ? pal.p : pal.d), fx = on ? thGrad(g, flat ? 0 : 0.64) : (flat ? pal.p : pal.x);
      var ov = on ? 'linear-gradient(' + thDir(g) + ',' + TC.mix(g.from, '#FFFFFF', 0.8) + ',' + TC.mix(g.to, '#FFFFFF', 0.8) + ')' : 'linear-gradient(to left,#DEDEDE,#E8E2DC)';
      return '--th-p:' + pal.p + ';--th-fp:' + fp + ';--th-fd:' + fd + ';--th-fx:' + fx + ';--th-tint:' + pal.tint + ';--th-canvas:' + pal.canvas + ';--th-ink:' + pal.ink + ';--th-line:' + pal.line + ';--th-a:' + pal.donate + ';--th-ai:' + pal.ink_on_donate + ';--th-gt:' + (flat ? pal.p : pal.gtext) + ';--th-ov:' + ov;
    }
    function thMini(t) {
      return '<span class="th-mock" aria-hidden="true" style="' + esc(thVars(t)) + '"><span class="th-m-head"><i class="th-m-logo"></i><i class="th-m-nav"></i><i class="th-m-nav"></i><i class="th-m-btn"></i></span>' +
        '<span class="th-m-hero"><b class="th-m-t1"></b><b class="th-m-t2"></b><i class="th-m-cta"></i></span><span class="th-m-cards"><i></i><i></i><i></i></span><span class="th-m-foot"></span></span>';
    }
    function thBadge(r, kind) {
      var cls = r >= 4.5 ? 'is-ok' : r >= 3 ? 'is-warn' : 'is-bad';
      var txt = kind === 'accent' ? '' : (r >= 4.5 ? 'مطابق لمعيار AA' : r >= 3 ? 'مقبول للعناوين الكبيرة فقط' : 'غير مقروء — اختر لوناً أغمق');
      return [cls, txt];
    }
    function thColorRow(id, label, pathKey, presets) {
      return '<div class="field"><span class="label" id="th-' + id + '-l">' + esc(label) + '</span>' +
        (presets ? '<div class="st-swatches" role="group" aria-labelledby="th-' + id + '-l">' + presets.map(function (c) { return '<button type="button" class="th-swatch" data-th-sw="' + id + '" data-color="' + c + '" aria-pressed="false" style="--sw:' + c + '"><span class="sr-only">' + c + '</span></button>'; }).join('') + '</div>' : '') +
        '<div class="st-custom-color"><label class="st-color-btn" for="th-' + id + '-picker"><input type="color" id="th-' + id + '-picker" data-th-in="' + id + '"><span>لون مخصص</span></label><label class="sr-only" for="' + pathKey + '">رمز اللون</label>' +
        '<input class="input sm st-hex" id="' + pathKey + '" data-th-hex="' + id + '" dir="ltr" maxlength="7" spellcheck="false" autocomplete="off"><span class="st-contrast" id="th-' + id + '-contrast"></span></div>' +
        '<p class="error" id="' + pathKey + '-err" hidden>' + icon('error') + '<span></span></p></div>';
    }
    R.site_theme = function () {
      var tpls = THR.templates.map(function (t) {
        return '<button type="button" class="th-tpl" data-th-tpl="' + esc(t.key) + '" aria-pressed="false">' + thMini({ template: t.key, primary: t.primary, accent: t.accent, gradient: { on: false, from: t.primary, to: t.primary, dir: 'to-left' } }) +
          '<span class="th-tpl-name">' + esc(t.label) + '</span><span class="th-tpl-hint">' + esc(t.hint) + '</span></button>';
      }).join('') + '<button type="button" class="th-tpl" data-th-tpl="custom" aria-pressed="false"><span class="th-mini-slot" id="th-custom-mini"></span><span class="th-tpl-name">ألوان مخصصة</span><span class="th-tpl-hint">اختر اللون الأساسي ولون التمييز بنفسك.</span></button>';
      var dirs = THR.dirs.map(function (d) {
        return '<button type="button" class="st-choice-card th-dir" data-value="' + esc(d.key) + '" aria-pressed="false"><span class="th-dir-art" data-th-dir="' + esc(d.key) + '" aria-hidden="true"></span><span class="st-choice-label">' + esc(d.label) + '</span></button>';
      }).join('');
      var controls =
        card('site_theme', 'templates', 'القوالب الجاهزة', 'اختر مظهراً جاهزاً للموقع. المظهر الأخضر الحالي هو الافتراضي ولا يتغيّر شيء حتى تحفظ اختياراً آخر.',
          row('site_theme', 'template', 'قالب الموقع', 'المعاينة الصغيرة تعرض الترويسة والهيرو والبطاقات والتذييل بألوان كل قالب.', '<div class="th-tpls" role="group" aria-label="قوالب الموقع">' + tpls + '</div><p class="hint" id="th-tpl-note"></p>', 'قالب قوالب جاهزة ثيم مظهر الموقع أسود كحلي بترولي أخضر template')) +
        card('site_theme', 'colors', 'الألوان', 'لون الهوية هو اللون الأساسي هنا، ويُستخدم أيضاً للون شريط المتصفح في الجوال. نشتق درجات النص والخلفيات تلقائياً لتبقى مقروءة.',
          row('site_theme', 'primary', 'اللون الأساسي (لون الهوية)', 'الأزرار والعناوين والأقسام الداكنة والتذييل. تعديله ينقلك إلى «ألوان مخصصة».', thColorRow('p', 'اللون الأساسي', 'f-site_theme-primary', TH_PRIMARIES), 'لون اساسي لون الهوية brand primary colour theme-color') +
          row('site_theme', 'accent', 'لون التمييز', 'الأزرار البارزة (مثل «تبرّع الآن») وبعض المؤشرات. تعديله ينقلك إلى «ألوان مخصصة».', thColorRow('a', 'لون التمييز', 'f-site_theme-accent', TH_ACCENTS), 'لون تمييز زر التبرع accent')) +
        card('site_theme', 'gradient', 'التدرّج اللوني', 'اختياري ومُطفأ افتراضياً. عند تفعيله يُطبَّق على الأزرار والشارات والأقسام الداكنة وعلى الهيرو أيضاً.',
          row('site_theme', 'gradient', 'تفعيل التدرّج', 'يستبدل اللون الأساسي المسطّح بتدرّج بين لونين في كل مكان يُستخدم فيه.', toggle('site_theme.gradient.on', 'تدرّج لوني في الموقع كله', 'عند الإيقاف يعود الموقع إلى اللون الأساسي الموحّد.') +
            '<div class="st-when th-when" data-when="site_theme.gradient.on">' +
            '<div class="th-gcols"><div class="field"><span class="label" id="th-gf-l">اللون الأول</span><div class="st-custom-color"><label class="st-color-btn" for="th-gf-picker"><input type="color" id="th-gf-picker" data-th-in="gf"><span>اختيار</span></label><label class="sr-only" for="f-site_theme-gradient">رمز اللون الأول</label><input class="input sm st-hex" id="f-site_theme-gradient" data-th-hex="gf" dir="ltr" maxlength="7" spellcheck="false" autocomplete="off"><span class="st-contrast" id="th-gf-contrast"></span></div></div>' +
            '<div class="field"><span class="label" id="th-gt-l">اللون الثاني</span><div class="st-custom-color"><label class="st-color-btn" for="th-gt-picker"><input type="color" id="th-gt-picker" data-th-in="gt"><span>اختيار</span></label><label class="sr-only" for="f-site_theme-gradient-to">رمز اللون الثاني</label><input class="input sm st-hex" id="f-site_theme-gradient-to" data-th-hex="gt" dir="ltr" maxlength="7" spellcheck="false" autocomplete="off"><span class="st-contrast" id="th-gt-contrast"></span></div></div></div>' +
            '<p class="error" id="f-site_theme-gradient-err" hidden>' + icon('error') + '<span></span></p>' +
            '<div class="th-gtools"><button type="button" class="btn btn-ghost btn-sm" id="th-g-primary">' + icon('colors') + 'اللون الأول = اللون الأساسي</button><button type="button" class="btn btn-ghost btn-sm" id="th-g-analog">' + icon('auto_fix_high') + 'اقترح لوناً ثانياً منسجماً</button><button type="button" class="btn btn-ghost btn-sm" id="th-g-swap">' + icon('swap_horiz') + 'تبديل اللونين</button></div>' +
            '<div class="field"><span class="label" id="th-dir-l">اتجاه التدرّج</span><div class="st-choice th-dirs" role="group" aria-labelledby="th-dir-l" data-path="site_theme.gradient.dir">' + dirs + '</div></div>' +
            '<div class="th-gbar" id="th-gbar" aria-hidden="true"><span class="th-gbar-btn">زر بالتدرّج</span></div></div>', 'تدرج لوني gradient تدرّج اتجاه')) +
        card('site_theme', 'hero', 'ألوان الهيرو', null,
          row('site_theme', 'hero', 'الهيرو في الصفحة الرئيسية', 'الهيرو يتبع المظهر والتدرّج افتراضياً. لتخصيص ألوانه منفصلة عن الموقع: غيّر ألوان الشرائح أو أوقف «اتباع مظهر الموقع» من إعدادات الهيرو.', '<p class="hint"><a href="/admin/hero">فتح إعدادات الهيرو</a></p>', 'هيرو ألوان الهيرو hero'));
      var preview = '<section class="card st-card st-preview-card" aria-labelledby="th-prev-t"><div class="card-head bordered"><div><h3 class="card-title" id="th-prev-t">معاينة حية</h3><p class="card-sub">تتغير فوراً مع كل اختيار قبل الحفظ.</p></div></div><div class="card-body"><div class="th-prev" id="th-prev" aria-hidden="true">' +
        '<div class="th-p-head"><span class="th-p-logo"></span><b>جمعية الشمال</b><span class="th-p-nav"><i></i><i></i><i></i></span><span class="th-p-cta">تبرّع</span></div>' +
        '<div class="th-p-hero"><span class="th-p-ov"></span><div class="th-p-copy"><small class="th-p-badge">برامجنا</small><h4>معاً نصنع الأثر</h4><p>نص تجريبي يوضح قراءة الألوان.</p><span class="th-p-btns"><i class="th-p-b1">اعرف المزيد</i><i class="th-p-b2">تبرّع الآن</i></span></div></div>' +
        '<div class="th-p-cards"><span><b></b><i></i></span><span><b></b><i></i></span></div><div class="th-p-foot"><b></b><i></i><i></i></div></div>' +
        '<p class="hint st-prev-note">' + icon('info') + 'المعاينة تقريبية؛ الشكل النهائي يظهر على الموقع بعد الحفظ.</p></div></section>';
      return '<div class="st-split"><div class="st-split-main">' + controls + '</div><div class="st-split-side">' + preview + '</div></div>';
    };
    INIT.site_theme = function () { hooks.site_theme(); };
    function thPick(v) { return (v || '').toString().toLowerCase(); }
    hooks.site_theme = function () {
      var t = S.site_theme, g = t.gradient, pal = thPalette(t);
      $$('[data-th-tpl]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-th-tpl') === t.template)); });
      $$('[data-th-sw]').forEach(function (b) { var id = b.getAttribute('data-th-sw'), cur = id === 'p' ? t.primary : t.accent; b.setAttribute('aria-pressed', String(String(cur).toUpperCase() === b.getAttribute('data-color'))); });
      var vals = { p: t.primary, a: t.accent, gf: g.from, gt: g.to };
      Object.keys(vals).forEach(function (id) {
        var pk = $('#th-' + id + '-picker'), hx = $('[data-th-hex="' + id + '"]');
        if (pk && TC.ok(vals[id]) && pk.value !== thPick(vals[id])) pk.value = thPick(vals[id]);
        if (hx && document.activeElement !== hx) { hx.value = String(vals[id]).toUpperCase(); hx.removeAttribute('aria-invalid'); }
        var c = $('#th-' + id + '-contrast'); if (!c || !TC.ok(vals[id])) return;
        if (id === 'a') { var r2 = TC.contrast(vals[id], pal.ink_on_donate); c.textContent = 'نص الزر ' + (pal.ink_on_donate === '#FFFFFF' ? 'أبيض' : 'داكن') + ' — تباين ' + r2.toFixed(1) + ':1'; c.className = 'st-contrast ' + (r2 >= 4.5 ? 'is-ok' : r2 >= 3 ? 'is-warn' : 'is-bad'); }
        else { var r = TC.contrast(vals[id], '#FFFFFF'), b = thBadge(r); c.textContent = 'تباين النص الأبيض ' + r.toFixed(1) + ':1 — ' + b[1]; c.className = 'st-contrast ' + b[0]; }
      });
      $$('[data-when="site_theme.gradient.on"]').forEach(function (n) { n.hidden = !g.on; });
      $$('.th-dir').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-value') === g.dir)); });
      $$('[data-th-dir]').forEach(function (n) { var d = TH_DIR[n.getAttribute('data-th-dir')]; if (d) n.style.backgroundImage = 'linear-gradient(' + d.css + ',' + (TC.ok(g.from) ? g.from : '#0C7845') + ',' + (TC.ok(g.to) ? g.to : '#0C7845') + ')'; });
      var gb = $('#th-gbar'); if (gb) gb.style.backgroundImage = thGrad(g, 0);
      var cm = $('#th-custom-mini'); if (cm) cm.innerHTML = thMini({ template: 'custom', primary: t.primary, accent: t.accent, gradient: { on: false, from: t.primary, to: t.primary, dir: g.dir } });
      var note = $('#th-tpl-note'); if (note) note.textContent = t.template === 'custom' ? 'ألوان مخصصة: عدّلها من قسم «الألوان» أدناه.' : 'قالب جاهز: ألوانه ثابتة. عدّل أي لون في قسم «الألوان» ليتحوّل إلى «ألوان مخصصة».';
      var pv = $('#th-prev'); if (pv) pv.setAttribute('style', thVars(t));
      $$('[data-live="themePrimary"]').forEach(function (n) { n.textContent = String(t.primary).toUpperCase(); n.style.setProperty('--sw', TC.ok(t.primary) ? t.primary : '#0C7845'); });
    };
    function thSetColor(which, v) {
      var t = S.site_theme; v = String(v).toUpperCase();
      if (which === 'p') { t.template = 'custom'; t.primary = v; if (!t.gradient.on && TC.ok(v)) { t.gradient.from = v; t.gradient.to = TC.analog(v); } }
      else if (which === 'a') { t.template = 'custom'; t.accent = v; }
      else if (which === 'gf') t.gradient.from = v; else if (which === 'gt') t.gradient.to = v;
      changed(which === 'p' ? 'site_theme.primary' : which === 'a' ? 'site_theme.accent' : 'site_theme.gradient');
    }
    root.addEventListener('click', function (e) {
      var tb = e.target.closest('[data-th-tpl]');
      if (tb) {
        var key = tb.getAttribute('data-th-tpl'), t = S.site_theme;
        if (key === 'custom') t.template = 'custom';
        else if (TH_TPL[key]) {
          t.template = key; t.primary = TH_TPL[key].primary; t.accent = TH_TPL[key].accent;
          if (!t.gradient.on) { t.gradient.from = t.primary; t.gradient.to = TC.analog(t.primary); }
        }
        changed('site_theme.template'); announce('القالب: ' + $('.th-tpl-name', tb).textContent); return;
      }
      var sw = e.target.closest('[data-th-sw]');
      if (sw) { thSetColor(sw.getAttribute('data-th-sw'), sw.getAttribute('data-color')); return; }
      var id = e.target.closest('button') && e.target.closest('button').id, g = S.site_theme.gradient;
      if (id === 'th-g-primary') { g.from = S.site_theme.primary; changed('site_theme.gradient'); }
      else if (id === 'th-g-analog') { g.to = TC.analog(g.from); changed('site_theme.gradient'); }
      else if (id === 'th-g-swap') { var x = g.from; g.from = g.to; g.to = x; changed('site_theme.gradient'); }
    });
    root.addEventListener('input', function (e) {
      var pk = e.target.getAttribute && e.target.getAttribute('data-th-in'), hx = e.target.getAttribute && e.target.getAttribute('data-th-hex');
      if (pk) { thSetColor(pk, e.target.value); return; }
      if (hx) {
        var v = e.target.value.trim(); if (v && v.charAt(0) !== '#') { v = '#' + v; e.target.value = v; }
        if (TC.ok(v)) { e.target.removeAttribute('aria-invalid'); var er = document.getElementById(e.target.id + '-err'); if (er) er.hidden = true; thSetColor(hx, v); }
        else e.target.setAttribute('aria-invalid', 'true');
      }
    });
    root.addEventListener('focusout', function (e) {
      var hx = e.target.getAttribute && e.target.getAttribute('data-th-hex'); if (!hx) return;
      var t = S.site_theme, cur = { p: t.primary, a: t.accent, gf: t.gradient.from, gt: t.gradient.to }[hx]; e.target.value = String(cur).toUpperCase(); e.target.removeAttribute('aria-invalid');
    });

    /* ----- security (static parts; dynamic lists built in INIT) ----- */
    R.security = function () {
      return card('security', 'password', 'سياسة كلمات المرور', 'تُطبَّق على كل أعضاء الفريق عند تغيير كلمة المرور.',
          row('security', 'length', 'الطول والتعقيد', null, range('security.minLength', 'أقل طول', 8, 32, 1, 'حرفاً') + '<div class="st-toggles">' + toggle('security.upper', 'حرف كبير واحد على الأقل (A–Z)') + toggle('security.number', 'رقم واحد على الأقل') + toggle('security.symbol', 'رمز خاص واحد على الأقل (!@#)') + '</div>', 'كلمة المرور طول تعقيد رموز password') +
          row('security', 'rotation', 'التجديد والحظر', null, range('security.reuse', 'منع إعادة استخدام آخر', 0, 24, 1, 'كلمات') + cols(select('security.expiry', 'انتهاء الصلاحية', [['never', 'لا تنتهي'], ['30', 'كل 30 يوماً'], ['60', 'كل 60 يوماً'], ['90', 'كل 90 يوماً'], ['180', 'كل 180 يوماً']], { group: 'password_expiry' }), range('security.lockout', 'قفل الحساب بعد', 3, 10, 1, 'محاولات')), 'انتهاء صلاحية قفل محاولات') +
          row('security', 'strength', 'قوة السياسة', 'جرّب كلمة مرور لترى هل تطابق السياسة (لا تُحفظ).', '<div class="st-meter" id="st-policy"><div class="st-meter-bar"><span></span></div><strong></strong></div><div class="field"><label class="label" for="st-pw-test">تجربة كلمة مرور</label><input class="input" id="st-pw-test" type="password" autocomplete="new-password" dir="ltr"></div><ul class="st-rules" id="st-rules" aria-live="polite"></ul>', 'قوة اختبار')) +
        card('security', '2fa', 'المصادقة الثنائية', 'طبقة حماية إضافية عند تسجيل الدخول.',
          row('security', '2fa', 'حسابك', 'رمز من تطبيق المصادقة عند كل دخول.', '<div id="st-2fa"></div>', 'مصادقة ثنائية 2fa رمز تطبيق') +
          row('security', 'enforce', 'الإلزام للفريق', null, seg('security.enforce2fa', 'إلزام المصادقة الثنائية', [['off', 'اختياري'], ['admins', 'للمديرين'], ['all', 'للجميع']]), 'الزام فريق')) +
        card('security', 'sessions', 'الجلسات النشطة', 'الأجهزة المسجّل دخولها حالياً إلى حسابك (بيانات تجريبية).', '<ul class="st-sessions" id="st-sessions"></ul>', '<button type="button" class="btn btn-ghost btn-sm" id="st-revoke-all">' + icon('logout') + 'إنهاء الجلسات الأخرى</button>') +
        card('security', 'access', 'التنبيهات وقيود الوصول', null,
          row('security', 'alerts', 'تنبيهات الدخول', null, toggle('security.alertNewDevice', 'دخول من جهاز أو متصفح جديد') + toggle('security.alertFailed', 'محاولات دخول فاشلة متكررة') + toggle('security.alertCountry', 'دخول من دولة غير معتادة'), 'تنبيه دخول فاشل') +
          row('security', 'timeout', 'مهلة الجلسة', 'تسجيل الخروج تلقائياً بعد عدم النشاط.', select('security.timeout', 'المهلة', [['15', '15 دقيقة'], ['30', '30 دقيقة'], ['60', 'ساعة'], ['240', '4 ساعات'], ['480', '8 ساعات']], { group: 'session_timeout' }), 'مهلة خروج تلقائي') +
          row('security', 'ip', 'قائمة عناوين IP المسموحة', 'اقصر الدخول إلى اللوحة على عناوين أو نطاقات محددة.', toggle('security.ipAllow', 'تفعيل القائمة المسموحة', 'تجريبي: لا يُطبَّق فعلياً في النسخة الثابتة.') + '<div class="st-chips" id="st-ips" aria-label="العناوين المسموحة"></div><div class="st-add"><label class="sr-only" for="st-ip-input">أضف عنوان IP أو نطاق CIDR</label><input class="input" id="st-ip-input" dir="ltr" placeholder="203.0.113.10 أو 203.0.113.0/24" aria-describedby="st-ip-err" autocomplete="off"><button type="button" class="btn btn-secondary" id="st-ip-add">' + icon('add') + 'إضافة</button></div><p class="error" id="st-ip-err" hidden>' + icon('error') + '<span></span></p>', 'ip عناوين مسموحة allowlist'));
    };
    function policyScore() { var s = S.security; var sc = (s.minLength - 8) * 3 + (s.upper ? 12 : 0) + (s.number ? 12 : 0) + (s.symbol ? 16 : 0) + Math.min(s.reuse, 10) * 1.5 + (s.expiry !== 'never' ? 6 : 0); return Math.max(8, Math.min(100, Math.round(sc + 14))); }
    hooks.security = function () {
      var m = $('#st-policy'); if (!m) return;
      var sc = policyScore(), lbl = sc >= 70 ? 'قوية' : sc >= 45 ? 'متوسطة' : 'ضعيفة';
      $('.st-meter-bar span', m).style.width = sc + '%'; m.setAttribute('data-level', sc >= 70 ? 'high' : sc >= 45 ? 'mid' : 'low');
      $('strong', m).textContent = 'سياسة ' + lbl + ' · ' + sc + '/100';
      var pw = $('#st-pw-test').value, s = S.security, rules = [['الطول ' + s.minLength + ' أحرف على الأقل', pw.length >= s.minLength, true]];
      if (s.upper) rules.push(['حرف كبير', /[A-Z]/.test(pw), true]); if (s.number) rules.push(['رقم', /\d/.test(pw), true]); if (s.symbol) rules.push(['رمز خاص', /[^A-Za-z0-9]/.test(pw), true]);
      var ul = $('#st-rules'); ul.textContent = '';
      rules.forEach(function (r) { ul.appendChild(h('li', { class: pw ? (r[1] ? 'is-ok' : 'is-bad') : '' }, [ic(pw ? (r[1] ? 'check_circle' : 'cancel') : 'radio_button_unchecked'), r[0]])); });
    };
    root.addEventListener('input', function (e) { if (e.target.id === 'st-pw-test') hooks.security(); });

    /* ----- notifications ----- */
    R.notifications = function () {
      var head = '<tr><th scope="col">الحدث</th>' + CHANNELS.map(function (c) { return '<th scope="col" class="st-mx-col"><label class="st-mx-all">' + icon(c[2]) + '<span>' + c[1] + '</span><input type="checkbox" class="checkbox" data-all="' + c[0] + '" aria-label="تحديد كل أحداث ' + c[1] + '"></label></th>'; }).join('') + '</tr>';
      var body = EVENTS.map(function (ev) { return '<tr><th scope="row"><strong>' + esc(ev[1]) + '</strong><span class="hint">' + esc(ev[2]) + '</span></th>' + CHANNELS.map(function (c) { return '<td class="st-mx-cell"><input type="checkbox" class="checkbox" data-path="notifications.matrix.' + ev[0] + '.' + c[0] + '" aria-label="' + esc(ev[1]) + ' — ' + c[1] + '"></td>'; }).join('') + '</tr>'; }).join('');
      return card('notifications', 'matrix', 'مصفوفة الإشعارات', 'اختر القنوات لكل حدث. الرسائل النصية تتطلب ربط خدمة SMS من «التكاملات».', '<div class="table-wrap st-mx" tabindex="0" role="region" aria-label="جدول قنوات الإشعارات"><table class="table compact"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>') +
        card('notifications', 'quiet', 'أوقات الهدوء', 'لا تُرسل تنبيهات غير عاجلة خلال هذه الفترة. التنبيهات الأمنية تُرسل دائماً.',
          row('notifications', 'quiet', 'فترة الهدوء', null, toggle('notifications.quiet', 'تفعيل أوقات الهدوء') + '<div class="st-when" data-when="notifications.quiet">' + cols(text('notifications.quietFrom', 'من', { type: 'time', dir: 'ltr' }), text('notifications.quietTo', 'إلى', { type: 'time', dir: 'ltr' })) + '</div>', 'هدوء ازعاج ليل')) +
        card('notifications', 'digest', 'الملخص الدوري', 'رسالة بريد تجمع أهم المؤشرات.',
          row('notifications', 'digest', 'التكرار', null, seg('notifications.digest', 'تكرار الملخص', [['off', 'متوقف'], ['daily', 'يومي'], ['weekly', 'أسبوعي'], ['monthly', 'شهري']], { group: 'digest_frequency' }) + '<div class="st-when" data-when="notifications.digest">' + cols(select('notifications.digestDay', 'يوم الإرسال', [['sat', 'السبت'], ['sun', 'الأحد'], ['mon', 'الاثنين'], ['thu', 'الخميس']], { group: 'digest_day' }), text('notifications.digestEmail', 'يُرسل إلى', { type: 'email', dir: 'ltr', iconName: 'mail' })) + '</div>', 'ملخص تقرير دوري digest'));
    };
    hooks.notifications = function () {
      CHANNELS.forEach(function (c) {
        var all = $('[data-all="' + c[0] + '"]'); if (!all) return;
        var n = EVENTS.filter(function (ev) { return S.notifications.matrix[ev[0]][c[0]]; }).length;
        all.checked = n === EVENTS.length; all.indeterminate = n > 0 && n < EVENTS.length;
      });
      $$('[data-when="notifications.quiet"]').forEach(function (n) { n.hidden = !S.notifications.quiet; });
      $$('[data-when="notifications.digest"]').forEach(function (n) { n.hidden = S.notifications.digest === 'off'; });
    };
    INIT.notifications = function () { hooks.notifications(); };
    root.addEventListener('change', function (e) {
      var a = e.target.closest('[data-all]'); if (!a) return;
      var ch = a.getAttribute('data-all');
      EVENTS.forEach(function (ev) { S.notifications.matrix[ev[0]][ch] = a.checked; });
      bind($('#sec-notifications')); hooks.notifications(); syncDirty();
    });

    /* ----- donations ----- */
    R.donations = function () {
      return card('donations', 'currency', 'العملات', null,
          row('donations', 'currency', 'العملة الافتراضية', 'تُعرض أولاً في نموذج التبرع.', select('donations.currency', 'العملة الافتراضية', CURRENCIES.map(function (c) { return [c[0], c[1] + ' (' + c[0] + ')']; })), 'عملة دولار') +
          row('donations', 'currencies', 'العملات المتاحة', 'يستطيع المتبرع الاختيار بينها.', '<div class="st-toggle-chips" id="st-currencies" role="group" aria-label="العملات المتاحة">' + CURRENCIES.map(function (c) { return '<button type="button" class="st-tchip" data-cur="' + c[0] + '" aria-pressed="false"><b dir="ltr">' + c[0] + '</b>' + esc(c[1]) + '</button>'; }).join('') + '</div>', 'عملات متاحة')) +
        card('donations', 'amounts', 'المبالغ المقترحة', 'أزرار سريعة تظهر في نموذج التبرع.',
          row('donations', 'amounts', 'المبالغ', 'حتى 8 مبالغ.', '<div class="st-chips" id="st-amounts" aria-label="المبالغ المقترحة"></div><div class="st-add"><label class="sr-only" for="st-amount-input">أضف مبلغاً</label><input class="input" id="st-amount-input" type="number" min="1" max="100000" dir="ltr" placeholder="500" aria-describedby="st-amount-err"><button type="button" class="btn btn-secondary" id="st-amount-add">' + icon('add') + 'إضافة</button></div><p class="error" id="st-amount-err" hidden>' + icon('error') + '<span></span></p>' +
            '<div class="field"><label class="label" for="st-default-amount">المبلغ المحدد مسبقاً</label><select class="select" id="st-default-amount"></select></div>' + toggle('donations.customAmount', 'السماح بمبلغ مخصص') + toggle('donations.recurring', 'التبرع الشهري المتكرر') + toggle('donations.coverFees', 'اقتراح تغطية رسوم المعاملة على المتبرع'), 'مبالغ مقترحة') +
          row('donations', 'preview', 'معاينة النموذج', null, '<div class="st-donate-prev" id="st-donate-prev" aria-hidden="true"></div>', 'معاينة')) +
        card('donations', 'methods', 'وسائل الدفع', 'عرض تجريبي: لا تُحفظ أي بيانات حسابات، ويتم الربط الفعلي من الخادم.', '<div class="st-methods">' + METHODS.map(function (m) { return '<div class="st-method" data-method="' + m[0] + '"><span class="st-method-ico" aria-hidden="true">' + icon(m[3]) + '</span><div class="st-method-meta"><strong id="pm-' + m[0] + '">' + esc(m[1]) + '</strong><span class="hint">' + esc(m[2]) + '</span><span class="pill pill-neutral st-nc">' + icon('link_off') + 'غير مربوط (تجريبي)</span></div><button type="button" class="switch" role="switch" data-path="donations.methods.' + m[0] + '" aria-checked="false" aria-labelledby="pm-' + m[0] + '"></button></div>'; }).join('') + '</div>') +
        card('donations', 'receipts', 'الإيصالات', null,
          row('donations', 'receipt', 'ترقيم الإيصالات', null, cols(text('donations.receiptPrefix', 'البادئة', { dir: 'ltr', max: 8 }), text('donations.receiptNext', 'الرقم التالي', { type: 'number', dir: 'ltr', num: true, min: 1 })) + toggle('donations.receiptAuto', 'إرسال الإيصال تلقائياً بالبريد') + toggle('donations.receiptNote', 'إضافة ملاحظة الزكاة/الإعفاء الضريبي'), 'ايصال ترقيم بادئة receipt') +
          row('donations', 'receiptText', 'نص تذييل الإيصال', null, text('donations.receiptFooter', 'التذييل', { area: true, rows: 2, max: 200, counter: true }) + '<div class="st-receipt" aria-hidden="true"><div class="st-receipt-head"><strong data-live="orgName"></strong><span dir="ltr" id="st-receipt-no"></span></div><div class="st-receipt-line"><span>المبلغ</span><b dir="ltr" id="st-receipt-amt"></b></div><p id="st-receipt-foot"></p></div>', 'تذييل نص')) +
        card('donations', 'zakat', 'الزكاة', null,
          row('donations', 'zakat', 'خيارات الزكاة', 'تُصرف أموال الزكاة في مصارفها الشرعية.', toggle('donations.zakat', 'إظهار خيار «هذا التبرع زكاة»') + toggle('donations.zakatSeparate', 'حساب مستقل لأموال الزكاة في التقارير'), 'زكاة'));
    };
    function sym() { return (CUR[S.donations.currency] || CUR.USD)[2]; }
    hooks.donations = function () {
      var d = S.donations; if (!$('#st-amounts')) return;
      if (d.currencies.indexOf(d.currency) < 0) d.currencies.push(d.currency);
      $$('[data-cur]').forEach(function (b) { var c = b.getAttribute('data-cur'); b.setAttribute('aria-pressed', String(d.currencies.indexOf(c) >= 0)); b.disabled = c === d.currency; });
      var box = $('#st-amounts'); box.textContent = '';
      d.amounts.forEach(function (a, i) { box.appendChild(h('span', { class: 'chip st-chip' }, [h('span', { dir: 'ltr', text: sym() + ' ' + a.toLocaleString('en-US') }), h('button', { type: 'button', 'aria-label': 'حذف المبلغ ' + a, 'data-rm-amount': i }, [ic('close')])])); });
      var sel = $('#st-default-amount'); sel.textContent = '';
      d.amounts.forEach(function (a) { sel.appendChild(h('option', { value: a, text: sym() + ' ' + a.toLocaleString('en-US') })); });
      if (d.amounts.indexOf(+d.defaultAmount) < 0) d.defaultAmount = d.amounts[0] || 0;
      sel.value = String(d.defaultAmount);
      var pv = $('#st-donate-prev'); pv.textContent = '';
      pv.appendChild(h('p', { class: 'st-dp-title', text: 'اختر مبلغ تبرعك' }));
      var grid = h('div', { class: 'st-dp-grid' });
      d.amounts.forEach(function (a) { grid.appendChild(h('span', { class: 'st-dp-amt' + (a === +d.defaultAmount ? ' is-on' : ''), dir: 'ltr', text: sym() + a.toLocaleString('en-US') })); });
      if (d.customAmount) grid.appendChild(h('span', { class: 'st-dp-amt is-custom', text: 'مبلغ آخر' }));
      pv.appendChild(grid);
      var opts = h('div', { class: 'st-dp-opts' });
      if (d.recurring) opts.appendChild(h('span', {}, [ic('autorenew'), 'شهرياً']));
      if (d.zakat) opts.appendChild(h('span', {}, [ic('mosque'), 'زكاة']));
      if (d.coverFees) opts.appendChild(h('span', {}, [ic('add_card'), 'تغطية الرسوم']));
      pv.appendChild(opts);
      $('#st-receipt-no').textContent = (d.receiptPrefix || '') + String(d.receiptNext).padStart(6, '0');
      $('#st-receipt-amt').textContent = sym() + ' ' + (+d.defaultAmount || 0).toLocaleString('en-US');
      $('#st-receipt-foot').textContent = d.receiptFooter;
      $$('[data-live="orgName"]').forEach(function (n) { n.textContent = S.general.orgName; });
    };
    INIT.donations = function () { hooks.donations(); };
    root.addEventListener('click', function (e) {
      var c = e.target.closest('[data-cur]');
      if (c) { var d = S.donations, k = c.getAttribute('data-cur'), i = d.currencies.indexOf(k); if (i >= 0) d.currencies.splice(i, 1); else d.currencies.push(k); hooks.donations(); syncDirty(); return; }
      var rm = e.target.closest('[data-rm-amount]');
      if (rm) { if (S.donations.amounts.length <= 1) { toast('يجب إبقاء مبلغ واحد على الأقل', { tone: 'info', icon: 'info' }); return; } S.donations.amounts.splice(+rm.getAttribute('data-rm-amount'), 1); hooks.donations(); syncDirty(); var f = $('#st-amount-input'); if (f) f.focus(); return; }
      if (e.target.closest('#st-amount-add')) addAmount();
    });
    root.addEventListener('change', function (e) { if (e.target.id === 'st-default-amount') { S.donations.defaultAmount = +e.target.value; hooks.donations(); syncDirty(); } });
    function addAmount() {
      var inp = $('#st-amount-input'), v = Math.round(+inp.value), err = $('#st-amount-err'), d = S.donations, msg = '';
      if (!v || v < 1 || v > 100000) msg = 'أدخل مبلغاً بين 1 و 100,000.'; else if (d.amounts.indexOf(v) >= 0) msg = 'هذا المبلغ موجود بالفعل.'; else if (d.amounts.length >= 8) msg = 'الحد الأقصى 8 مبالغ.';
      err.hidden = !msg; $('span:last-child', err).textContent = msg; inp.setAttribute('aria-invalid', String(!!msg));
      if (msg) { inp.focus(); return; }
      d.amounts.push(v); d.amounts.sort(function (a, b) { return a - b; }); inp.value = ''; hooks.donations(); syncDirty(); inp.focus();
      announce('أضيف المبلغ ' + v);
    }
    root.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      if (e.target.id === 'st-amount-input') { e.preventDefault(); addAmount(); }
      if (e.target.id === 'st-ip-input') { e.preventDefault(); addIp(); }
    });

    /* ----- seo ----- */
    R.seo = function () {
      var controls = card('seo', 'meta', 'البيانات الافتراضية', 'تُستخدم عندما لا تحدد الصفحة عنواناً أو وصفاً خاصاً.',
          row('seo', 'title', 'قالب العنوان', '%s يُستبدل باسم الصفحة.', text('seo.titleTpl', 'قالب العنوان', { max: 80, counter: true }), 'عنوان قالب title') +
          row('seo', 'desc', 'الوصف الافتراضي', 'بين 70 و 160 حرفاً.', text('seo.metaDesc', 'الوصف', { area: true, rows: 3, max: 300, counter: true }), 'وصف ميتا meta description') +
          row('seo', 'index', 'الفهرسة', null, toggle('seo.index', 'السماح لمحركات البحث بالفهرسة') + toggle('seo.sitemap', 'إنشاء خريطة الموقع sitemap.xml'), 'فهرسة robots sitemap')) +
        card('seo', 'og', 'صورة المشاركة', 'تظهر عند مشاركة روابط الموقع على الشبكات الاجتماعية.',
          '<div class="st-og-grid" role="group" aria-label="صورة المشاركة">' + OG_IMAGES.map(function (o) { return '<button type="button" class="st-og" data-og="' + o[0] + '" aria-pressed="false"><img src="' + o[0] + '" alt="" loading="lazy"><span>' + esc(o[1]) + '</span></button>'; }).join('') + '</div>') +
        card('seo', 'social', 'حسابات التواصل', 'تظهر في تذييل الموقع وبيانات المشاركة.', '<div class="st-social">' + SOCIAL.map(function (s) { return text('seo.social.' + s[0], s[1], { dir: 'ltr', iconName: s[2], max: 80, ph: s[0] + '.com/…' }); }).join('') + '</div>') +
        card('seo', 'analytics', 'التحليلات', null,
          row('seo', 'ga', 'Google Analytics', 'معرّف القياس يبدأ بـ G-.', text('seo.analyticsId', 'معرّف القياس', { dir: 'ltr', max: 16, ph: 'G-XXXXXXXXXX' }) + toggle('seo.anonymizeIp', 'إخفاء عناوين IP للزوار') + toggle('seo.cookieBanner', 'إظهار شريط موافقة ملفات الارتباط'), 'تحليلات analytics google'));
      var prev = '<section class="card st-card st-preview-card" aria-labelledby="og-prev-t"><div class="card-head bordered"><div><h3 class="card-title" id="og-prev-t">معاينة المشاركة</h3><p class="card-sub">كما تظهر في فيسبوك وواتساب.</p></div></div><div class="card-body"><div class="st-share" aria-hidden="true"><img id="st-share-img" alt=""><div class="st-share-meta"><span dir="ltr">SHAMAL-SOCIETY.ORG</span><strong id="st-share-title"></strong><p id="st-share-desc"></p></div></div>' +
        '<div class="st-serp" aria-hidden="true"><span class="st-serp-url" dir="ltr">shamal-society.org</span><strong id="st-serp-title"></strong><p id="st-serp-desc"></p></div></div></section>';
      return '<div class="st-split"><div class="st-split-main">' + controls + '</div><div class="st-split-side">' + prev + '</div></div>';
    };
    hooks.seo = function () {
      var s = S.seo; if (!$('#st-share-img')) return;
      $$('.st-og').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-og') === s.ogImage)); });
      var t = String(s.titleTpl || '%s').replace('%s', 'الرئيسية');
      $('#st-share-img').src = OG_IMAGES.some(function (o) { return o[0] === s.ogImage; }) ? s.ogImage : OG_IMAGES[0][0];
      $('#st-share-title').textContent = t; $('#st-serp-title').textContent = t;
      $('#st-share-desc').textContent = s.metaDesc; $('#st-serp-desc').textContent = s.metaDesc.length > 160 ? s.metaDesc.slice(0, 157) + '…' : s.metaDesc;
    };
    INIT.seo = function () { hooks.seo(); };
    root.addEventListener('click', function (e) { var b = e.target.closest('[data-og]'); if (!b) return; S.seo.ogImage = b.getAttribute('data-og'); hooks.seo(); syncDirty(); });

    /* ----- users & roles ----- */
    var USTATUS = { active: ['نشط', 'info'], invited: ['مدعو', 'warn'], disabled: ['معطّل', 'neutral'] };
    var roleMap = { admin: 'admin', editor: 'editor', field: 'writer', finance: 'viewer', viewer: 'viewer' };
    var USERS_URL = '/admin/users';
    var users = (SRV && SRV.users) || read(K.users, null) || (D.users || []).map(function (u, i) { return { id: 'u' + (i + 1), name: u.name, email: u.email, role: roleMap[u.role] || 'viewer', status: u.status, last: u.last, me: i === 0 }; });
    function saveUsers() { write(K.users, users); }
    function roleLabel(id) { var r = rolesAll().filter(function (x) { return x.id === id; })[0]; return r ? r.label : id; }
    R.users = function () {
      return card('users', 'team', 'أعضاء الفريق', null,
          '<div class="st-toolbar"><label class="input-icon st-grow"><span class="sr-only">ابحث في الأعضاء</span><span class="material-symbols-outlined" aria-hidden="true">search</span><input class="input sm" id="st-user-q" type="search" placeholder="ابحث بالاسم أو البريد…" autocomplete="off"></label><label class="sr-only" for="st-user-role">تصفية حسب الدور</label><select class="select sm auto" id="st-user-role"></select></div>' +
          '<div class="table-wrap" tabindex="0" role="region" aria-label="جدول أعضاء الفريق"><table class="table compact st-users"><thead><tr><th scope="col">العضو</th><th scope="col">الدور</th><th scope="col">الحالة</th><th scope="col">آخر نشاط</th><th scope="col" class="col-actions"><span class="sr-only">إجراءات</span></th></tr></thead><tbody id="st-users-body"></tbody></table></div>',
          '<button type="button" class="btn btn-primary btn-sm" id="st-invite">' + icon('person_add') + 'دعوة عضو</button>') +
        card('users', 'roles', 'الأدوار والصلاحيات', 'تُدار الأدوار وصلاحيات كل دور من صفحة مخصصة، وتُطبَّق على الخادم وعلى القوائم والأزرار.',
          '<p class="muted" style="margin:0 0 12px">الأدوار الحالية: <strong>' + rolesAll().map(function (r) { return esc(r.label); }).join('، ') + '</strong>.</p><p class="muted" style="margin:0">أنشئ دوراً جديداً، انسخ دوراً، وعدّل مصفوفة الصلاحيات (عرض، إضافة، تعديل، حذف، نشر، تصدير، إدارة) لكل قسم.</p>',
          '<a class="btn btn-primary btn-sm" href="/admin/roles" data-perm="roles.view">' + icon('admin_panel_settings') + 'فتح الأدوار والصلاحيات</a>');
    };
    function renderUsers() {
      var body = $('#st-users-body'); if (!body) return;
      var q = UI.normalize($('#st-user-q').value), rf = $('#st-user-role').value;
      body.textContent = '';
      var list = users.filter(function (u) { return (!q || UI.normalize(u.name + ' ' + u.email).indexOf(q) >= 0) && (rf === 'all' || u.role === rf); });
      list.forEach(function (u) {
        var st = USTATUS[u.status] || USTATUS.active;
        var sel = h('select', { class: 'select sm auto', 'aria-label': 'دور ' + u.name, disabled: (u.me || SRV) ? true : null, title: SRV && !u.me ? 'يُدار من صفحة مستخدمي النظام' : null }, rolesAll().map(function (r) { return h('option', { value: r.id, text: r.label }); }));
        if (!rolesAll().some(function (r) { return r.id === u.role; })) { var ox = h('option', { value: u.role, text: roleLabel(u.role), disabled: true }); sel.appendChild(ox); }
        sel.value = u.role;
        sel.addEventListener('change', function () { var old = roleLabel(u.role); u.role = sel.value; saveUsers(); audit('غيّر دور ' + u.name + ' من «' + old + '» إلى «' + roleLabel(u.role) + '»', 'users', 'manage_accounts'); toast('تم تغيير الدور', { text: u.name + ' ← ' + roleLabel(u.role), icon: 'manage_accounts' }); renderRoles(); });
        var menu = u.me ? h('span', { class: 'sr-only', text: 'لا إجراءات لحسابك' }) : h('button', { type: 'button', class: 'icon-btn sm', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-label': 'إجراءات: ' + u.name }, [ic('more_horiz')]);
        if (!u.me) menu.addEventListener('click', function () { if (SRV) { toast('تُدار الحسابات من صفحة مستخدمي النظام', { text: 'جارٍ فتح الصفحة…', tone: 'info', icon: 'group' }); setTimeout(function () { location.href = USERS_URL; }, 500); return; } userMenu(menu, u); });
        body.appendChild(h('tr', { 'data-user': u.id }, [
          h('td', {}, [h('div', { class: 'cell-media' }, [h('span', { class: 'avatar' + (u.me ? '' : ' navy'), 'aria-hidden': 'true', text: UI.initials(u.name) }), h('div', { style: 'min-width:0' }, [h('span', { class: 't' }, [u.name, u.me ? h('span', { class: 'muted st-me', text: ' (أنت)' }) : null]), h('span', { class: 's ltr', text: u.email })])])]),
          h('td', {}, [sel]),
          h('td', {}, [h('span', { class: 'pill pill-' + st[1], text: st[0] })]),
          h('td', { class: 'muted st-nowrap', text: u.last === 0 ? 'متصل الآن' : UI.ago(u.last) }),
          h('td', { class: 'col-actions' }, [menu])
        ]));
      });
      if (!list.length) body.appendChild(h('tr', {}, [h('td', { colspan: '5', class: 'muted st-empty', text: 'لا يوجد أعضاء مطابقون.' })]));
      var ct = $('#ct-users-team + .card-sub') || h('p', { class: 'card-sub' });
      if (!ct.parentNode) $('#ct-users-team').parentNode.appendChild(ct);
      ct.textContent = users.length + ' أعضاء · ' + users.filter(function (u) { return u.status === 'active'; }).length + ' نشطون · ' + users.filter(function (u) { return u.status === 'invited'; }).length + ' دعوات معلقة';
    }
    function userMenu(btn, u) {
      UI.rowMenu(btn, [
        u.status === 'invited' ? { icon: 'forward_to_inbox', label: 'إعادة إرسال الدعوة', action: function () { toast('أُعيد إرسال الدعوة', { text: u.email, icon: 'forward_to_inbox' }); audit('أعاد إرسال دعوة ' + u.email, 'users', 'forward_to_inbox'); } }
          : { icon: u.status === 'disabled' ? 'person_check' : 'person_off', label: u.status === 'disabled' ? 'إعادة تفعيل الحساب' : 'تعطيل الحساب', action: function () {
            var to = u.status === 'disabled' ? 'active' : 'disabled';
            var go2 = function () { u.status = to; saveUsers(); renderUsers(); audit((to === 'disabled' ? 'عطّل حساب ' : 'أعاد تفعيل حساب ') + u.name, 'users', 'person_off'); toast(to === 'disabled' ? 'تم تعطيل الحساب' : 'تم تفعيل الحساب', { text: u.name, tone: 'info', icon: 'person' }); };
            if (to === 'disabled') modal({ title: 'تعطيل حساب ' + u.name + '؟', text: 'لن يتمكن من تسجيل الدخول حتى تعيد تفعيله. تبقى بياناته محفوظة.', icon: 'person_off', tone: 'warn', confirmText: 'تعطيل' }).then(function (ok) { if (ok) go2(); }); else go2();
          } },
        '-',
        { icon: 'person_remove', label: 'حذف العضو', danger: true, action: function () { UI.confirmDelete('العضو «' + u.name + '»', 'ستُلغى صلاحيات الوصول لهذا الحساب نهائياً (في هذه المعاينة).').then(function (ok) { if (!ok) return; users.splice(users.indexOf(u), 1); saveUsers(); renderUsers(); renderRoles(); audit('حذف العضو ' + u.name, 'users', 'person_remove'); toast('تم حذف العضو', { text: u.name, tone: 'danger' }); }); } }
      ]);
    }
    function renderRoles() {
      var wrap = $('#st-roles'); if (!wrap) return;
      var rs = rolesAll(); wrap.textContent = '';
      var tr = h('tr', {}, [h('th', { scope: 'col', text: 'الصلاحية' })]);
      rs.forEach(function (r) {
        var n = users.filter(function (u) { return u.role === r.id; }).length;
        var th = h('th', { scope: 'col', class: 'st-mx-col' }, [h('span', { class: 'st-role-h' }, [h('strong', { text: r.label }), h('small', { text: n + ' أعضاء' })])]);
        if (r.custom) { var del = h('button', { type: 'button', class: 'icon-btn sm st-role-del', 'aria-label': 'حذف الدور ' + r.label }, [ic('close')]); del.addEventListener('click', function () { deleteRole(r); }); th.firstChild.appendChild(del); }
        tr.appendChild(th);
      });
      var tbody = h('tbody');
      PERMS.forEach(function (g) {
        tbody.appendChild(h('tr', { class: 'st-mx-group' }, [h('th', { scope: 'colgroup', colspan: String(rs.length + 1), text: g.g })]));
        g.items.forEach(function (p) {
          var row2 = h('tr', {}, [h('th', { scope: 'row', text: p[1] })]);
          rs.forEach(function (r) {
            var cb = h('input', { type: 'checkbox', class: 'checkbox', 'data-path': 'users.matrix.' + r.id + '.' + p[0], 'aria-label': p[1] + ' — ' + r.label, disabled: r.id === 'admin' ? true : null });
            cb.checked = !!(S.users.matrix[r.id] || {})[p[0]];
            row2.appendChild(h('td', { class: 'st-mx-cell' }, [cb]));
          });
          tbody.appendChild(row2);
        });
      });
      wrap.appendChild(h('table', { class: 'table compact' }, [h('thead', {}, [tr]), tbody]));
      var sel = $('#st-user-role'); if (sel) { var v = sel.value || 'all'; sel.textContent = ''; sel.appendChild(h('option', { value: 'all', text: 'كل الأدوار' })); rs.forEach(function (r) { sel.appendChild(h('option', { value: r.id, text: r.label })); }); sel.value = rs.some(function (r) { return r.id === v; }) ? v : 'all'; }
    }
    function deleteRole(r) {
      var n = users.filter(function (u) { return u.role === r.id; }).length;
      modal({ title: 'حذف الدور «' + r.label + '»؟', text: n ? 'سيتحول ' + n + ' أعضاء إلى دور «مشاهد».' : 'لا يوجد أعضاء بهذا الدور.', icon: 'delete', danger: true, confirmText: 'حذف الدور' }).then(function (ok) {
        if (!ok) return;
        S.users.custom = S.users.custom.filter(function (x) { return x.id !== r.id; }); delete S.users.matrix[r.id];
        users.forEach(function (u) { if (u.role === r.id) u.role = 'viewer'; }); saveUsers();
        renderRoles(); renderUsers(); syncDirty(); toast('حُذف الدور', { text: r.label + ' — احفظ لتثبيت التغيير.', tone: 'danger' });
      });
    }
    INIT.users = function () { renderRoles(); renderUsers(); };
    root.addEventListener('input', function (e) { if (e.target.id === 'st-user-q') renderUsers(); });
    root.addEventListener('change', function (e) { if (e.target.id === 'st-user-role') renderUsers(); if (e.target.matches('#st-roles input')) renderRoles(); });
    root.addEventListener('click', function (e) {
      if (e.target.closest('#st-invite')) inviteUser();
      if (e.target.closest('#st-add-role')) addRole();
    });
    function roleOpts(sel) { return rolesAll().map(function (r) { return '<option value="' + esc(r.id) + '"' + (r.id === sel ? ' selected' : '') + '>' + esc(r.label) + '</option>'; }).join(''); }
    function inviteUser() {
      if (SRV) { location.href = USERS_URL; return; }
      modal({ title: 'دعوة عضو جديد', icon: 'person_add', size: 'lg', confirmText: 'إرسال الدعوة', focus: '#inv-name',
        body: '<p class="modal-text">سيصل إلى العضو رابط لتفعيل حسابه (واجهة تجريبية).</p><div class="field-row mt-16"><div class="field"><label class="label" for="inv-name">الاسم <span class="req" aria-hidden="true">*</span></label><input class="input" id="inv-name" maxlength="40" aria-describedby="inv-name-err" autocomplete="off"><p class="error" id="inv-name-err" hidden>' + icon('error') + '<span>الاسم مطلوب.</span></p></div><div class="field"><label class="label" for="inv-email">البريد الإلكتروني <span class="req" aria-hidden="true">*</span></label><input class="input" id="inv-email" type="email" dir="ltr" placeholder="name@shamal-society.org" aria-describedby="inv-email-err" autocomplete="off"><p class="error" id="inv-email-err" hidden>' + icon('error') + '<span>أدخل بريداً صالحاً غير مستخدم.</span></p></div></div><div class="field mt-16"><label class="label" for="inv-role">الدور</label><select class="select" id="inv-role">' + roleOpts('editor') + '</select></div>',
        validate: function (d) {
          var n = $('#inv-name', d), m = $('#inv-email', d), okN = n.value.trim().length >= 2, v = m.value.trim().toLowerCase(), okM = EMAIL.test(v) && !users.some(function (u) { return u.email.toLowerCase() === v; });
          n.setAttribute('aria-invalid', String(!okN)); $('#inv-name-err', d).hidden = okN; m.setAttribute('aria-invalid', String(!okM)); $('#inv-email-err', d).hidden = okM;
          if (!okN) n.focus(); else if (!okM) m.focus(); return okN && okM;
        },
        getValue: function (d) { return { name: $('#inv-name', d).value.trim(), email: $('#inv-email', d).value.trim(), role: $('#inv-role', d).value }; } })
        .then(function (v) { if (!v) return; users.push({ id: 'u' + Date.now(), name: v.name, email: v.email, role: v.role, status: 'invited', last: null }); saveUsers(); renderUsers(); renderRoles(); audit('دعا ' + v.name + ' (' + v.email + ') بدور «' + roleLabel(v.role) + '»', 'users', 'person_add'); toast('تم إرسال الدعوة', { text: v.email, icon: 'mail' }); });
    }
    function addRole() {
      if ((S.users.custom || []).length >= 4) { toast('الحد الأقصى 4 أدوار مخصصة', { tone: 'info', icon: 'info' }); return; }
      modal({ title: 'إنشاء دور مخصص', icon: 'add_moderator', confirmText: 'إنشاء', focus: '#role-name',
        body: '<div class="field mt-16"><label class="label" for="role-name">اسم الدور <span class="req" aria-hidden="true">*</span></label><input class="input" id="role-name" maxlength="20" placeholder="مثال: منسق ميداني" aria-describedby="role-name-err" autocomplete="off"><p class="error" id="role-name-err" hidden>' + icon('error') + '<span>اسم فريد من حرفين على الأقل.</span></p></div><div class="field mt-16"><label class="label" for="role-base">ابدأ بصلاحيات</label><select class="select" id="role-base">' + roleOpts('writer') + '</select></div>',
        validate: function (d) { var i = $('#role-name', d), v = i.value.trim(), ok = v.length >= 2 && !rolesAll().some(function (r) { return r.label === v; }); i.setAttribute('aria-invalid', String(!ok)); $('#role-name-err', d).hidden = ok; if (!ok) i.focus(); return ok; },
        getValue: function (d) { return { label: $('#role-name', d).value.trim(), base: $('#role-base', d).value }; } })
        .then(function (v) { if (!v) return; var id = 'c' + Date.now().toString(36); S.users.custom = (S.users.custom || []).concat([{ id: id, label: v.label, custom: true }]); S.users.matrix[id] = clone(S.users.matrix[v.base] || permSet([])); renderRoles(); renderUsers(); syncDirty(); toast('أُنشئ الدور «' + v.label + '»', { text: 'عدّل صلاحياته ثم احفظ.', icon: 'add_moderator' }); });
    }

    /* ----- security dynamic parts ----- */
    var sessions = (SRV && SRV.sessions) || read(K.sessions, null) || [
      { id: 's1', device: 'computer', name: 'Chrome على Windows', place: 'القاهرة، مصر', ip: '198.51.100.24', mins: 0, current: true },
      { id: 's2', device: 'smartphone', name: 'Safari على iPhone', place: 'القاهرة، مصر', ip: '198.51.100.61', mins: 95 },
      { id: 's3', device: 'laptop_mac', name: 'Firefox على macOS', place: 'عمّان، الأردن', ip: '203.0.113.42', mins: 1440 * 2 },
      { id: 's4', device: 'tablet', name: 'Chrome على Android', place: 'إسطنبول، تركيا', ip: '192.0.2.18', mins: 1440 * 6 }
    ];
    function renderSessions() {
      var ul = $('#st-sessions'); if (!ul) return; ul.textContent = '';
      sessions.forEach(function (s) {
        var btn = s.current ? h('span', { class: 'pill pill-info', text: 'هذا الجهاز' }) : h('button', { type: 'button', class: 'btn btn-ghost btn-sm st-danger-text', 'aria-label': 'إنهاء جلسة ' + s.name }, [ic('logout'), 'إنهاء']);
        if (!s.current) btn.addEventListener('click', function () { modal({ title: 'إنهاء هذه الجلسة؟', text: s.name + ' — ' + s.place + '. سيُطلب تسجيل الدخول من جديد على هذا الجهاز.', icon: 'logout', tone: 'warn', confirmText: 'إنهاء الجلسة' }).then(function (ok) { if (!ok) return; if (SRV) { http('DELETE', BASE + '/sessions/' + encodeURIComponent(s.id)).then(function (x) { if (!x.ok) { srvToastErr(x); return; } sessions = x.j.sessions || sessions; SRV.sessions = sessions; if (x.j.audit) SRV.audit = x.j.audit; renderSessions(); toast('تم إنهاء الجلسة', { text: s.name, tone: 'info', icon: 'logout' }); }, function () { srvToastErr(null); }); return; } sessions = sessions.filter(function (x) { return x !== s; }); write(K.sessions, sessions); renderSessions(); audit('أنهى جلسة ' + s.name + ' (' + s.ip + ')', 'security', 'logout'); toast('تم إنهاء الجلسة', { text: s.name, tone: 'info', icon: 'logout' }); }); });
        ul.appendChild(h('li', { class: 'st-session' + (s.current ? ' is-current' : '') }, [h('span', { class: 'st-session-ico', 'aria-hidden': 'true' }, [ic(s.device)]), h('div', { class: 'st-session-meta' }, [h('strong', { text: s.name }), h('span', { class: 'hint' }, [s.place + ' · ', h('span', { dir: 'ltr', text: s.ip }), ' · ' + (s.mins === 0 ? 'نشط الآن' : UI.ago(s.mins))])]), btn]));
      });
      var all = $('#st-revoke-all'); if (all) all.disabled = sessions.length <= 1;
    }
    root.addEventListener('click', function (e) {
      if (!e.target.closest('#st-revoke-all')) return;
      modal({ title: 'إنهاء كل الجلسات الأخرى؟', text: 'سيُسجَّل الخروج من ' + (sessions.length - 1) + ' أجهزة أخرى.', icon: 'logout', tone: 'warn', confirmText: 'إنهاء الكل' }).then(function (ok) { if (!ok) return; if (SRV) { http('DELETE', BASE + '/sessions').then(function (x) { if (!x.ok) { srvToastErr(x); return; } sessions = x.j.sessions || sessions; SRV.sessions = sessions; if (x.j.audit) SRV.audit = x.j.audit; renderSessions(); toast('تم إنهاء الجلسات الأخرى', { tone: 'info', icon: 'logout' }); }, function () { srvToastErr(null); }); return; } sessions = sessions.filter(function (s) { return s.current; }); write(K.sessions, sessions); renderSessions(); audit('أنهى كل الجلسات الأخرى', 'security', 'logout'); toast('تم إنهاء الجلسات الأخرى', { tone: 'info', icon: 'logout' }); });
    });
    var IPRE = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}(\/([0-9]|[12]\d|3[0-2]))?$/;
    function renderIps() {
      var box = $('#st-ips'); if (!box) return; box.textContent = '';
      S.security.ips.forEach(function (ip, i) { box.appendChild(h('span', { class: 'chip st-chip' }, [h('span', { dir: 'ltr', text: ip }), h('button', { type: 'button', 'aria-label': 'حذف ' + ip, 'data-rm-ip': i }, [ic('close')])])); });
      if (!S.security.ips.length) box.appendChild(h('span', { class: 'hint', text: 'لا توجد عناوين بعد.' }));
    }
    function addIp() {
      var inp = $('#st-ip-input'), v = inp.value.trim(), err = $('#st-ip-err'), msg = '';
      if (!IPRE.test(v)) msg = 'صيغة غير صالحة. مثال: 203.0.113.10 أو 203.0.113.0/24'; else if (S.security.ips.indexOf(v) >= 0) msg = 'العنوان موجود بالفعل.'; else if (S.security.ips.length >= 20) msg = 'الحد الأقصى 20 عنواناً.';
      err.hidden = !msg; $('span:last-child', err).textContent = msg; inp.setAttribute('aria-invalid', String(!!msg));
      if (msg) { inp.focus(); return; }
      S.security.ips.push(v); inp.value = ''; renderIps(); syncDirty(); inp.focus(); announce('أضيف ' + v);
    }
    root.addEventListener('click', function (e) {
      if (e.target.closest('#st-ip-add')) addIp();
      var rm = e.target.closest('[data-rm-ip]'); if (rm) { S.security.ips.splice(+rm.getAttribute('data-rm-ip'), 1); renderIps(); syncDirty(); $('#st-ip-input').focus(); }
    });
    // 2FA (demo enrolment)
    var twofa = read(K.twofa, { on: false });
    function qrSvg(seed) {
      var n = 25, cell = 6, s = seed, rects = '';
      function rnd() { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }
      function finder(x, y) { return '<rect x="' + x * cell + '" y="' + y * cell + '" width="' + 7 * cell + '" height="' + 7 * cell + '" fill="currentColor"/><rect x="' + (x + 1) * cell + '" y="' + (y + 1) * cell + '" width="' + 5 * cell + '" height="' + 5 * cell + '" fill="#fff"/><rect x="' + (x + 2) * cell + '" y="' + (y + 2) * cell + '" width="' + 3 * cell + '" height="' + 3 * cell + '" fill="currentColor"/>'; }
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) { var inF = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9); if (!inF && rnd() > 0.52) rects += '<rect x="' + x * cell + '" y="' + y * cell + '" width="' + cell + '" height="' + cell + '"/>'; }
      return '<svg viewBox="0 0 ' + n * cell + ' ' + n * cell + '" width="150" height="150" role="img" aria-label="رمز QR تجريبي — لا يعمل مع تطبيقات المصادقة"><rect width="100%" height="100%" fill="#fff"/><g fill="currentColor">' + rects + '</g>' + finder(0, 0) + finder(n - 7, 0) + finder(0, n - 7) + '</svg>';
    }
    function render2fa(step) {
      var box = $('#st-2fa'); if (!box) return;
      if (twofa.on) {
        box.innerHTML = '<div class="st-2fa-on"><span class="st-2fa-badge" aria-hidden="true">' + icon('verified_user') + '</span><div><strong>المصادقة الثنائية مفعّلة</strong><span class="hint">عبر تطبيق المصادقة · 8 رموز احتياطية متبقية (تجريبي)</span></div><button type="button" class="btn btn-ghost btn-sm st-danger-text" id="st-2fa-off">إيقاف</button></div>';
        return;
      }
      if (!step) { box.innerHTML = '<div class="st-2fa-off"><span class="st-2fa-badge is-off" aria-hidden="true">' + icon('lock_open') + '</span><div><strong>غير مفعّلة</strong><span class="hint">ننصح بتفعيلها لكل الحسابات الإدارية.</span></div><button type="button" class="btn btn-primary btn-sm" id="st-2fa-start">' + icon('qr_code_2') + 'إعداد المصادقة</button></div>'; return; }
      box.innerHTML = '<ol class="st-steps"><li class="is-on"><b>1</b>امسح الرمز</li><li><b>2</b>أدخل الرمز</li><li><b>3</b>احفظ الرموز الاحتياطية</li></ol>' +
        '<div class="st-2fa-setup"><div class="st-qr">' + qrSvg(20260929) + '<span class="pill pill-warn">' + icon('science') + 'رمز تجريبي</span></div><div class="st-2fa-form"><p class="hint">امسح الرمز بتطبيق المصادقة أو أدخل المفتاح يدوياً:</p><code class="st-secret" dir="ltr">DEMO-4F7Q-ALML-2026</code>' +
        '<div class="field"><label class="label" for="st-2fa-code">رمز التحقق المكوّن من 6 أرقام</label><input class="input st-otp" id="st-2fa-code" inputmode="numeric" maxlength="6" dir="ltr" autocomplete="one-time-code" aria-describedby="st-2fa-err st-2fa-hint"><p class="hint" id="st-2fa-hint">في هذه المعاينة يُقبل أي 6 أرقام.</p><p class="error" id="st-2fa-err" hidden>' + icon('error') + '<span>أدخل 6 أرقام.</span></p></div>' +
        '<div class="st-2fa-actions"><button type="button" class="btn btn-ghost btn-sm" id="st-2fa-cancel">إلغاء</button><button type="button" class="btn btn-primary btn-sm" id="st-2fa-verify">' + icon('check') + 'تحقق وفعّل</button></div></div></div>';
    }
    root.addEventListener('click', function (e) {
      if (e.target.closest('#st-2fa-start')) { render2fa(1); $('#st-2fa-code').focus(); }
      if (e.target.closest('#st-2fa-cancel')) { render2fa(); $('#st-2fa-start').focus(); }
      if (e.target.closest('#st-2fa-verify')) {
        var c = $('#st-2fa-code'), ok = /^\d{6}$/.test(c.value); $('#st-2fa-err').hidden = ok; c.setAttribute('aria-invalid', String(!ok));
        if (!ok) { c.focus(); return; }
        twofa = { on: true, at: Date.now() }; write(K.twofa, twofa);
        var codes = []; for (var i = 0; i < 8; i++) codes.push(Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase());
        modal({ title: 'تم تفعيل المصادقة الثنائية', icon: 'verified_user', text: 'احفظ هذه الرموز الاحتياطية في مكان آمن. كل رمز يُستخدم مرة واحدة (رموز تجريبية).', body: '<ul class="st-codes" dir="ltr">' + codes.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>', confirmText: 'حفظتها', cancelText: 'إغلاق' })
          .then(function () { render2fa(); });
        audit('فعّل المصادقة الثنائية لحسابه', 'security', 'verified_user');
      }
      if (e.target.closest('#st-2fa-off')) modal({ title: 'إيقاف المصادقة الثنائية؟', text: 'سيصبح حسابك أقل أماناً.', icon: 'lock_open', danger: true, confirmText: 'إيقاف' }).then(function (ok) { if (!ok) return; twofa = { on: false }; write(K.twofa, twofa); render2fa(); audit('أوقف المصادقة الثنائية لحسابه', 'security', 'lock_open'); toast('أُوقفت المصادقة الثنائية', { tone: 'danger', icon: 'lock_open' }); });
    });
    INIT.security = function () { hooks.security(); renderSessions(); renderIps(); render2fa(); };

    /* ----- integrations ----- */
    var INTEG = [
      ['email', 'خدمة البريد', 'إرسال الإيصالات والإشعارات عبر SMTP', 'forward_to_inbox', 'اسم المضيف (SMTP host)'], ['sms', 'الرسائل النصية', 'تنبيهات SMS للمتبرعين والفريق', 'sms', 'معرّف المرسل'],
      ['whatsapp', 'واتساب للأعمال', 'الرد على المتبرعين وإرسال التحديثات', 'chat', 'رقم الحساب التجاري'], ['maps', 'الخرائط', 'خرائط المشاريع ونقاط التوزيع', 'map', 'مفتاح الخرائط'],
      ['analytics', 'Google Analytics', 'قياس الزيارات والتحويلات', 'monitoring', 'معرّف القياس'], ['storage', 'التخزين السحابي', 'حفظ الصور والنسخ الاحتياطية', 'cloud', 'اسم الحاوية'],
      ['payments', 'بوابة الدفع', 'استقبال التبرعات بالبطاقات', 'credit_card', 'معرّف التاجر'], ['webhooks', 'Webhooks', 'إشعار أنظمتك عند كل تبرع', 'webhook', 'رابط الاستقبال']
    ];
    var integ = read(K.integ, null) || { email: { on: true, at: Date.now() - 86400000 * 12, label: 'smtp.shamal-society.org' } };
    var apiKeys = read(K.keys, null) || [{ id: 'k1', name: 'تطبيق التقارير الداخلي', scope: 'read', last4: '7Q2m', created: Date.now() - 86400000 * 40, used: 180 }];
    R.integrations = function () {
      return card('integrations', 'services', 'الخدمات المرتبطة', 'اتصالات تجريبية: لا تُرسل أي بيانات فعلياً.', '<div class="st-integ" id="st-integ"></div>') +
        card('integrations', 'api', 'مفاتيح API', 'للوصول البرمجي إلى بيانات اللوحة. يظهر المفتاح كاملاً مرة واحدة عند إنشائه فقط.', '<div class="table-wrap" tabindex="0" role="region" aria-label="جدول مفاتيح API"><table class="table compact"><thead><tr><th scope="col">الاسم</th><th scope="col">المفتاح</th><th scope="col">الصلاحية</th><th scope="col">آخر استخدام</th><th scope="col" class="col-actions"><span class="sr-only">إجراءات</span></th></tr></thead><tbody id="st-keys"></tbody></table></div>', '<button type="button" class="btn btn-primary btn-sm" id="st-key-new">' + icon('key') + 'إنشاء مفتاح</button>');
    };
    function renderInteg() {
      var box = $('#st-integ'); if (!box) return; box.textContent = '';
      INTEG.forEach(function (it) {
        var st = integ[it[0]] || { on: false }, btn;
        btn = h('button', { type: 'button', class: 'btn btn-sm ' + (st.on ? 'btn-ghost st-danger-text' : 'btn-secondary'), 'aria-label': (st.on ? 'قطع الاتصال بـ ' : 'ربط ') + it[1] }, [ic(st.on ? 'link_off' : 'link'), st.on ? 'قطع الاتصال' : 'ربط']);
        btn.addEventListener('click', function () { st.on ? disconnect(it) : connect(it); });
        box.appendChild(h('div', { class: 'st-integ-card' + (st.on ? ' is-on' : '') }, [
          h('div', { class: 'st-integ-top' }, [h('span', { class: 'st-integ-ico', 'aria-hidden': 'true' }, [ic(it[3])]), h('span', { class: 'pill ' + (st.on ? 'pill-info' : 'pill-neutral') }, [h('span', { class: 'dot', 'aria-hidden': 'true' }), st.on ? 'متصل' : 'غير متصل'])]),
          h('strong', { text: it[1] }), h('p', { class: 'hint', text: it[2] }),
          h('div', { class: 'st-integ-foot' }, [h('span', { class: 'hint st-integ-meta', text: st.on ? (st.label ? st.label + ' · ' : '') + 'مزامنة ' + UI.ago(Math.round((Date.now() - st.at) / 60000)) : 'لم يتم الربط' }), btn])
        ]));
      });
    }
    function connect(it) {
      modal({ title: 'ربط ' + it[1], icon: it[3], confirmText: 'ربط (تجريبي)', focus: '#int-val', text: 'أدخل بيانات تجريبية — لا يتم أي اتصال حقيقي.',
        body: '<div class="field mt-16"><label class="label" for="int-val">' + esc(it[4]) + ' <span class="req" aria-hidden="true">*</span></label><input class="input" id="int-val" dir="ltr" maxlength="60" autocomplete="off" aria-describedby="int-err"><p class="error" id="int-err" hidden>' + icon('error') + '<span>هذا الحقل مطلوب.</span></p></div>',
        validate: function (d) { var i = $('#int-val', d), ok = i.value.trim().length >= 3; i.setAttribute('aria-invalid', String(!ok)); $('#int-err', d).hidden = ok; if (!ok) i.focus(); return ok; },
        getValue: function (d) { return $('#int-val', d).value.trim(); } })
        .then(function (v) { if (!v) return; integ[it[0]] = { on: true, at: Date.now(), label: v.slice(0, 40) }; write(K.integ, integ); renderInteg(); audit('ربط خدمة ' + it[1], 'integrations', 'link'); toast('تم الربط', { text: it[1] + ' (اتصال تجريبي)', icon: 'link' }); });
    }
    function disconnect(it) {
      modal({ title: 'قطع الاتصال بـ ' + it[1] + '؟', text: 'ستتوقف الميزات المعتمدة على هذه الخدمة.', icon: 'link_off', danger: true, confirmText: 'قطع الاتصال' }).then(function (ok) { if (!ok) return; delete integ[it[0]]; write(K.integ, integ); renderInteg(); audit('قطع الاتصال بخدمة ' + it[1], 'integrations', 'link_off'); toast('تم قطع الاتصال', { text: it[1], tone: 'info', icon: 'link_off' }); });
    }
    function renderKeys() {
      var body = $('#st-keys'); if (!body) return; body.textContent = '';
      apiKeys.forEach(function (k) {
        var rv = h('button', { type: 'button', class: 'btn btn-ghost btn-sm st-danger-text', 'aria-label': 'إلغاء المفتاح ' + k.name }, [ic('block'), 'إلغاء']);
        rv.addEventListener('click', function () { modal({ title: 'إلغاء المفتاح «' + k.name + '»؟', text: 'ستتوقف أي تطبيقات تستخدمه فوراً.', icon: 'key_off', danger: true, confirmText: 'إلغاء المفتاح' }).then(function (ok) { if (!ok) return; apiKeys = apiKeys.filter(function (x) { return x !== k; }); write(K.keys, apiKeys); renderKeys(); audit('ألغى مفتاح API «' + k.name + '»', 'integrations', 'key_off'); toast('أُلغي المفتاح', { text: k.name, tone: 'danger', icon: 'key_off' }); }); });
        body.appendChild(h('tr', {}, [h('td', {}, [h('span', { class: 't', text: k.name })]), h('td', {}, [h('code', { class: 'st-key', dir: 'ltr', text: 'alm_demo_••••••••' + k.last4 })]), h('td', {}, [h('span', { class: 'pill ' + (k.scope === 'write' ? 'pill-warn' : 'pill-info'), text: k.scope === 'write' ? 'قراءة وكتابة' : 'قراءة فقط' })]), h('td', { class: 'muted st-nowrap', text: k.used == null ? 'لم يُستخدم' : UI.ago(k.used) }), h('td', { class: 'col-actions' }, [rv])]));
      });
      if (!apiKeys.length) body.appendChild(h('tr', {}, [h('td', { colspan: '5', class: 'muted st-empty', text: 'لا توجد مفاتيح. أنشئ مفتاحاً للوصول البرمجي.' })]));
    }
    root.addEventListener('click', function (e) {
      if (!e.target.closest('#st-key-new')) return;
      modal({ title: 'إنشاء مفتاح API', icon: 'key', confirmText: 'إنشاء', focus: '#key-name',
        body: '<div class="field mt-16"><label class="label" for="key-name">اسم المفتاح <span class="req" aria-hidden="true">*</span></label><input class="input" id="key-name" maxlength="40" placeholder="مثال: تطبيق الجوال" aria-describedby="key-err" autocomplete="off"><p class="error" id="key-err" hidden>' + icon('error') + '<span>الاسم مطلوب.</span></p></div><div class="field mt-16"><label class="label" for="key-scope">الصلاحية</label><select class="select" id="key-scope"><option value="read">قراءة فقط</option><option value="write">قراءة وكتابة</option></select></div>',
        validate: function (d) { var i = $('#key-name', d), ok = i.value.trim().length >= 2; i.setAttribute('aria-invalid', String(!ok)); $('#key-err', d).hidden = ok; if (!ok) i.focus(); return ok; },
        getValue: function (d) { return { name: $('#key-name', d).value.trim(), scope: $('#key-scope', d).value }; } })
        .then(function (v) {
          if (!v) return;
          var bytes = new Uint8Array(18); (window.crypto || window.msCrypto).getRandomValues(bytes);
          var raw = Array.prototype.map.call(bytes, function (b) { return 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 57]; }).join('');
          var full = 'alm_demo_' + raw;
          apiKeys.unshift({ id: 'k' + Date.now(), name: v.name, scope: v.scope, last4: raw.slice(-4), created: Date.now(), used: null }); write(K.keys, apiKeys); renderKeys();
          audit('أنشأ مفتاح API «' + v.name + '»', 'integrations', 'key');
          modal({ title: 'انسخ المفتاح الآن', icon: 'key', text: 'لن يظهر هذا المفتاح كاملاً مرة أخرى. هذا مفتاح تجريبي لا يمنح أي وصول.', body: '<div class="st-keyshow"><label class="sr-only" for="key-full">المفتاح</label><input class="input" id="key-full" dir="ltr" readonly><button type="button" class="btn btn-secondary" id="key-copy">' + icon('content_copy') + 'نسخ</button></div>', confirmText: 'تم', cancelText: 'إغلاق', focus: '#key-copy',
            onOpen: function (d) { var inp = $('#key-full', d); inp.value = full; $('#key-copy', d).addEventListener('click', function () { var done = function () { toast('نُسخ المفتاح', { icon: 'content_copy', duration: 2000 }); }; if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(full).then(done, function () { inp.select(); done(); }); else { inp.select(); try { document.execCommand('copy'); } catch (e2) { /* ignore */ } done(); } }); } });
        });
    });
    INIT.integrations = function () { renderInteg(); renderKeys(); };

    /* ----- backup ----- */
    R.backup = function () {
      return card('backup', 'export', 'النسخ الاحتياطي لقاعدة البيانات', 'تصدير واستيراد حقيقيان لمحتوى الموقع والإعدادات، مع فحص وسلامة قبل الاستعادة.',
          row('backup', 'export', 'إدارة النسخ', 'إنشاء نسخة وتنزيلها، استعادة نسخة سابقة بعد المعاينة، وسجل العمليات.', '<a class="btn btn-primary" href="/admin/backup">' + icon('backup') + 'فتح صفحة النسخ الاحتياطي</a>', 'تصدير استيراد نسخة احتياطي backup')) +
        card('backup', 'schedule', 'النسخ المجدول', 'التشغيل التلقائي يتطلب جدولة الأمر php artisan almel:backup على الخادم (Task Scheduler أو cron).',
          row('backup', 'schedule', 'الجدولة', null, seg('backup.schedule', 'التكرار', [['off', 'متوقف'], ['daily', 'يومي'], ['weekly', 'أسبوعي'], ['monthly', 'شهري']], { group: 'digest_frequency' }) + cols(text('backup.time', 'وقت التشغيل', { type: 'time', dir: 'ltr' }), select('backup.dest', 'الوجهة', [['local', 'تنزيل محلي'], ['cloud', 'التخزين السحابي (غير متصل)'], ['email', 'البريد الإلكتروني']])) + range('backup.keep', 'الاحتفاظ بآخر', 3, 30, 1, 'نسخ'), 'جدولة مجدول تلقائي') +
          row('backup', 'include', 'محتوى النسخة', null, '<div class="st-checks"><label class="check-label"><input type="checkbox" class="checkbox" data-path="backup.incContent">المحتوى (الصفحات، القائمة، الأخبار)</label><label class="check-label"><input type="checkbox" class="checkbox" data-path="backup.incSettings">الإعدادات والمستخدمون</label><label class="check-label"><input type="checkbox" class="checkbox" data-path="backup.incMedia">الوسائط (يزيد الحجم)</label></div>', 'محتوى وسائط') +
          row('backup', 'history', 'آخر النسخ', null, '<a class="btn" href="/admin/backup#history">' + icon('history') + 'عرض سجل النسخ</a>', 'سجل نسخ')) +
        '<section class="card st-card st-danger" aria-labelledby="ct-danger"><div class="card-head bordered"><div><h3 class="card-title" id="ct-danger">' + icon('warning') + 'منطقة الخطر</h3><p class="card-sub">إجراءات لا يمكن التراجع عنها.</p></div></div><div class="card-body">' +
          row('backup', 'reset', 'إعادة ضبط كل بيانات اللوحة', 'يحذف كل ما حُفظ في هذا المتصفح (الصفحات، القائمة، الإعدادات، المستخدمون…) ويعيد البيانات التجريبية الأصلية. صدّر نسخة أولاً.', '<button type="button" class="btn btn-danger" id="st-wipe">' + icon('delete_forever') + 'إعادة ضبط كل البيانات</button>', 'حذف اعادة ضبط كل البيانات خطر reset') + '</div></section>';
    };
    function adminKeys() { var out = []; try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf('almel-admin-') === 0) out.push(k); } } catch (e) { /* ignore */ } return out.sort(); }
    function renderBackupStat() {
      var b = $('#st-backup-stat'); if (!b) return;
      var ks = adminKeys(), size = ks.reduce(function (n, k) { return n + (localStorage.getItem(k) || '').length; }, 0);
      b.textContent = '';
      b.appendChild(h('span', {}, [ic('database'), h('strong', { text: String(ks.length) }), ' مفتاحاً محفوظاً']));
      b.appendChild(h('span', {}, [ic('straighten'), h('strong', { dir: 'ltr', text: UI.fmtSize(size * 2) }), ' تقريباً']));
    }
    root.addEventListener('click', function (e) {
      if (!e.target.closest('#st-export')) return;
      var data = {}; adminKeys().forEach(function (k) { data[k] = localStorage.getItem(k); });
      var payload = { app: 'almel-admin', version: 1, exportedAt: new Date().toISOString(), keys: Object.keys(data).length, data: data };
      var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      var a = h('a', { href: URL.createObjectURL(blob), download: 'almel-admin-backup-' + localDay() + '.json' });
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      audit('صدّر نسخة احتياطية (' + payload.keys + ' مفتاحاً)', 'backup', 'download');
      toast('تم تنزيل النسخة الاحتياطية', { text: payload.keys + ' مفتاحاً · ' + a.download, icon: 'download' });
    });
    function localDay() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
    var pending = null;
    function parseBackup(txt) {
      var o; try { o = JSON.parse(txt); } catch (e) { return { err: 'الملف ليس JSON صالحاً.' }; }
      if (!o || o.app !== 'almel-admin' || typeof o.data !== 'object' || Array.isArray(o.data)) return { err: 'هذا الملف ليس نسخة من لوحة جمعية الشمال للتنمية والتطوير المجتمعي.' };
      var keys = Object.keys(o.data);
      if (!keys.length) return { err: 'النسخة فارغة.' };
      if (keys.length > 200) return { err: 'عدد المفاتيح أكبر من المسموح.' };
      for (var i = 0; i < keys.length; i++) {
        if (!/^almel-admin-[a-z0-9-]{1,60}$/.test(keys[i])) return { err: 'مفتاح غير مسموح: ' + keys[i].slice(0, 60) };
        if (typeof o.data[keys[i]] !== 'string' || o.data[keys[i]].length > 2000000) return { err: 'قيمة غير صالحة للمفتاح ' + keys[i] };
      }
      return { data: o.data, at: o.exportedAt };
    }
    function showImport(res, name) {
      var box = $('#st-import-prev'); box.hidden = false; box.textContent = '';
      if (res.err) { pending = null; box.appendChild(h('p', { class: 'error st-import-err' }, [ic('error'), res.err])); return; }
      pending = res.data;
      var cur = {}; adminKeys().forEach(function (k) { cur[k] = localStorage.getItem(k); });
      var rows = [], c = { add: 0, chg: 0, same: 0, del: 0 };
      Object.keys(res.data).sort().forEach(function (k) { var st = !(k in cur) ? 'add' : cur[k] === res.data[k] ? 'same' : 'chg'; c[st]++; rows.push([k, st]); });
      Object.keys(cur).forEach(function (k) { if (!(k in res.data)) { c.del++; rows.push([k, 'del']); } });
      var LBL = { add: ['جديد', 'info'], chg: ['سيتغير', 'warn'], same: ['مطابق', 'neutral'], del: ['غير موجود في النسخة', 'neutral'] };
      box.appendChild(h('div', { class: 'st-import-head' }, [ic('description'), h('div', {}, [h('strong', { text: name }), h('span', { class: 'hint', text: (res.at ? 'صُدّرت ' + String(res.at).slice(0, 10) + ' · ' : '') + c.add + ' جديد · ' + c.chg + ' سيتغير · ' + c.same + ' مطابق' })])]));
      var tb = h('tbody');
      rows.forEach(function (r) { tb.appendChild(h('tr', { 'data-diff': r[1] }, [h('td', {}, [h('code', { dir: 'ltr', text: r[0] })]), h('td', {}, [h('span', { class: 'pill pill-' + LBL[r[1]][1], text: LBL[r[1]][0] })])])); });
      box.appendChild(h('div', { class: 'table-wrap st-diff', tabindex: '0', role: 'region', 'aria-label': 'فروقات الاستيراد' }, [h('table', { class: 'table compact' }, [h('thead', {}, [h('tr', {}, [h('th', { scope: 'col', text: 'المفتاح' }), h('th', { scope: 'col', text: 'الحالة' })])]), tb])]));
      var mode = h('div', { class: 'seg', role: 'group', 'aria-label': 'طريقة الاستيراد', id: 'st-import-mode' }, [h('button', { type: 'button', 'data-value': 'merge', 'aria-pressed': 'true', text: 'دمج (الإبقاء على غير الموجود)' }), h('button', { type: 'button', 'data-value': 'replace', 'aria-pressed': 'false', text: 'استبدال كامل' })]);
      mode.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; $$('button', mode).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); });
      var apply = h('button', { type: 'button', class: 'btn btn-primary', id: 'st-import-apply' }, [ic('restore'), 'تطبيق الاستيراد']);
      var cancel = h('button', { type: 'button', class: 'btn btn-ghost', text: 'إلغاء' });
      cancel.addEventListener('click', function () { pending = null; box.hidden = true; box.textContent = ''; });
      apply.addEventListener('click', function () {
        var replace = $('[aria-pressed="true"]', mode).getAttribute('data-value') === 'replace';
        modal({ title: replace ? 'استبدال كل بيانات اللوحة؟' : 'دمج النسخة مع البيانات الحالية؟', text: 'ستُعاد تحميل الصفحة بعد التطبيق.', icon: 'restore', tone: 'warn', confirmText: 'تطبيق' }).then(function (ok) {
          if (!ok || !pending) return;
          try { if (replace) adminKeys().forEach(function (k) { localStorage.removeItem(k); }); Object.keys(pending).forEach(function (k) { localStorage.setItem(k, pending[k]); }); } catch (err) { toast('تعذّر الاستيراد', { text: 'مساحة التخزين غير كافية.', tone: 'danger', icon: 'error' }); return; }
          audit('استورد نسخة احتياطية (' + Object.keys(pending).length + ' مفتاحاً، ' + (replace ? 'استبدال' : 'دمج') + ')', 'backup', 'restore');
          SAVED = clone(S); // no leave warning
          toast('تم الاستيراد', { text: 'جارٍ إعادة التحميل…', icon: 'restore' });
          setTimeout(function () { location.reload(); }, 700);
        });
      });
      box.appendChild(h('div', { class: 'st-import-actions' }, [mode, h('span', { class: 'st-grow' }), cancel, apply]));
    }
    function handleImportFile(f) {
      if (!f) return;
      if (f.size > 5 * 1024 * 1024) { showImport({ err: 'الملف أكبر من 5 MB.' }, f.name); return; }
      var r = new FileReader(); r.onload = function () { showImport(parseBackup(String(r.result)), f.name); }; r.readAsText(f);
    }
    root.addEventListener('change', function (e) { if (e.target.id === 'st-import') { handleImportFile(e.target.files[0]); e.target.value = ''; } });
    root.addEventListener('dragover', function (e) { var d = e.target.closest && e.target.closest('#st-drop'); if (d) { e.preventDefault(); d.classList.add('is-over'); } });
    root.addEventListener('dragleave', function (e) { var d = e.target.closest && e.target.closest('#st-drop'); if (d) d.classList.remove('is-over'); });
    root.addEventListener('drop', function (e) { var d = e.target.closest && e.target.closest('#st-drop'); if (!d) return; e.preventDefault(); d.classList.remove('is-over'); handleImportFile(e.dataTransfer.files[0]); });
    root.addEventListener('click', function (e) {
      if (!e.target.closest('#st-wipe')) return;
      var PHRASE = 'إعادة الضبط';
      modal({ title: 'إعادة ضبط كل بيانات اللوحة؟', danger: true, icon: 'delete_forever', text: 'سيُحذف ' + adminKeys().length + ' مفتاحاً محفوظاً في هذا المتصفح نهائياً.', confirmText: 'احذف كل البيانات',
        body: '<div class="field mt-16"><label class="label" for="wipe-confirm">للتأكيد اكتب: «' + PHRASE + '»</label><input class="input" id="wipe-confirm" autocomplete="off" aria-describedby="wipe-err"><p class="error" id="wipe-err" hidden>' + icon('error') + '<span>النص غير مطابق.</span></p></div>',
        onOpen: function (d) { var ok = $('[data-act="ok"]', d), inp = $('#wipe-confirm', d); ok.disabled = true; inp.addEventListener('input', function () { ok.disabled = inp.value.trim() !== PHRASE; }); },
        validate: function (d) { var ok = $('#wipe-confirm', d).value.trim() === PHRASE; $('#wipe-err', d).hidden = ok; return ok; } })
        .then(function (ok) {
          if (!ok) return;
          adminKeys().forEach(function (k) { localStorage.removeItem(k); });
          SAVED = clone(S);
          toast('تمت إعادة ضبط كل البيانات', { text: 'جارٍ إعادة التحميل…', tone: 'danger', icon: 'delete_forever' });
          setTimeout(function () { location.reload(); }, 700);
        });
    });
    INIT.backup = function () { renderBackupStat(); };

    /* ----- audit log ----- */
    var TYPES = { settings: ['الإعدادات', 'neutral'], users: ['المستخدمون', 'info'], security: ['الأمان', 'danger'], content: ['المحتوى', 'info'], integrations: ['التكاملات', 'neutral'], backup: ['النسخ', 'warn'] };
    function seedAudit() {
      var names = (D.users || []).map(function (u) { return u.name; }).slice(0, 4), acts = [
        ['content', 'edit_note', 'حدّث نسبة إنجاز «برنامج الإطعام الطارئ»'], ['content', 'newspaper', 'نشر خبر «إطلاق خريطة تتبع السلال»'], ['content', 'photo_library', 'أضاف 6 صور إلى ألبوم «توثيق الميدان»'],
        ['security', 'login', 'سجّل الدخول من جهاز جديد'], ['security', 'password', 'غيّر كلمة المرور'], ['users', 'person_add', 'دعا عضواً جديداً بدور «كاتب»'], ['settings', 'tune', 'حدّث بيانات التواصل'],
        ['content', 'web', 'غيّر ترتيب أقسام الصفحة الرئيسية'], ['content', 'menu_open', 'حدّث القائمة الرئيسية'], ['backup', 'download', 'صدّر نسخة احتياطية'], ['security', 'gpp_bad', 'محاولة دخول فاشلة'], ['integrations', 'link', 'ربط خدمة البريد']
      ], out = [], now = Date.now(), seed = 7;
      for (var i = 0; i < 46; i++) { seed = (seed * 9301 + 49297) % 233280; var a = acts[seed % acts.length]; out.push({ t: now - (i * 7.3 + (seed % 5)) * 3600000, by: a[0] === 'security' && seed % 3 === 0 ? 'النظام' : names[seed % names.length], text: a[2], type: a[0], icon: a[1], ip: '198.51.100.' + (10 + seed % 90), demo: true }); }
      return out;
    }
    var auditSeed = seedAudit(), auditShown = 12;
    R.audit = function () {
      return card('audit', 'log', 'كل الأحداث', SRV ? 'الأحداث الفعلية المسجّلة في قاعدة البيانات (سجل التدقيق).' : 'بيانات تجريبية مع الأحداث الفعلية التي تنفذها في هذه المعاينة.',
        '<div class="st-toolbar st-audit-tools"><label class="input-icon st-grow"><span class="sr-only">ابحث في السجل</span><span class="material-symbols-outlined" aria-hidden="true">search</span><input class="input sm" id="au-q" type="search" placeholder="ابحث في الأحداث…" autocomplete="off"></label>' +
        '<label class="sr-only" for="au-user">المستخدم</label><select class="select sm auto" id="au-user"></select><label class="sr-only" for="au-type">النوع</label><select class="select sm auto" id="au-type"><option value="all">كل الأنواع</option>' + Object.keys(TYPES).map(function (k) { return [k, TYPES[k][0]]; }).concat([]).map(function (p) { return p; }).map(function (p) { var k = p[0]; return '<option value="' + k + '">' + esc(ACN ? (ACN.label('audit_type', k) || p[1]) : p[1]) + '</option>'; }).join('') + '</select>' +
        '<label class="st-date"><span>من</span><input class="input sm" type="date" id="au-from" dir="ltr"></label><label class="st-date"><span>إلى</span><input class="input sm" type="date" id="au-to" dir="ltr"></label><button type="button" class="btn btn-ghost btn-sm" id="au-clear">مسح</button></div>' +
        '<div class="table-wrap" tabindex="0" role="region" aria-label="جدول أحداث السجل"><table class="table compact"><thead><tr><th scope="col">الحدث</th><th scope="col">المستخدم</th><th scope="col">النوع</th><th scope="col">الوقت</th><th scope="col">IP</th></tr></thead><tbody id="au-body"></tbody></table></div>' +
        '<div class="st-audit-foot"><span class="hint" id="au-count" aria-live="polite"></span><button type="button" class="btn btn-secondary btn-sm" id="au-more">عرض المزيد</button></div>',
        '<button type="button" class="btn btn-secondary btn-sm" id="au-csv">' + icon('download') + 'تصدير CSV</button>');
    };
    function auditAll() { return SRV ? (SRV.audit || []) : read(K.audit, []).concat(auditSeed); }
    function auditFiltered() {
      var q = UI.normalize(($('#au-q') || {}).value || ''), u = ($('#au-user') || {}).value || 'all', ty = ($('#au-type') || {}).value || 'all';
      var from = ($('#au-from') || {}).value, to = ($('#au-to') || {}).value;
      var f0 = from ? new Date(from + 'T00:00:00').getTime() : -Infinity, t0 = to ? new Date(to + 'T23:59:59').getTime() : Infinity;
      return auditAll().filter(function (e) { return (!q || UI.normalize(e.text + ' ' + e.by).indexOf(q) >= 0) && (u === 'all' || e.by === u) && (ty === 'all' || e.type === ty) && e.t >= f0 && e.t <= t0; });
    }
    var fmtTime = function (t) { try { return new Intl.DateTimeFormat('ar-EG-u-nu-latn', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(t)); } catch (e) { return new Date(t).toLocaleString(); } };
    function renderAudit() {
      var body = $('#au-body'); if (!body) return;
      var us = $('#au-user'), cur = us.value || 'all', names = {}; auditAll().forEach(function (e) { names[e.by] = 1; });
      us.textContent = ''; us.appendChild(h('option', { value: 'all', text: 'كل المستخدمين' })); Object.keys(names).forEach(function (n) { us.appendChild(h('option', { value: n, text: n })); }); us.value = names[cur] ? cur : 'all';
      var list = auditFiltered(); body.textContent = '';
      list.slice(0, auditShown).forEach(function (e) {
        var t = TYPES[e.type] || TYPES.settings;
        body.appendChild(h('tr', {}, [h('td', {}, [h('span', { class: 'st-au-ev' }, [h('span', { class: 'st-au-ico', 'aria-hidden': 'true' }, [ic(e.icon || 'history')]), h('span', { text: e.text })])]), h('td', { class: 'st-nowrap', text: e.by }), h('td', {}, [h('span', { class: 'pill pill-' + t[1], text: t[0] })]), h('td', { class: 'muted st-nowrap', text: fmtTime(e.t) }), h('td', { class: 'muted' }, [h('span', { dir: 'ltr', text: e.ip || '—' })])]));
      });
      if (!list.length) body.appendChild(h('tr', {}, [h('td', { colspan: '5', class: 'muted st-empty', text: 'لا توجد أحداث مطابقة للتصفية.' })]));
      $('#au-count').textContent = 'عرض ' + Math.min(auditShown, list.length) + ' من ' + list.length + ' حدثاً';
      $('#au-more').hidden = list.length <= auditShown;
    }
    root.addEventListener('input', function (e) { if (/^au-/.test(e.target.id)) { auditShown = 12; renderAudit(); } });
    root.addEventListener('change', function (e) { if (/^au-/.test(e.target.id)) { auditShown = 12; renderAudit(); } });
    root.addEventListener('click', function (e) {
      if (e.target.closest('#au-more')) { auditShown += 12; renderAudit(); }
      if (e.target.closest('#au-clear')) { ['au-q', 'au-from', 'au-to'].forEach(function (id) { $('#' + id).value = ''; }); $('#au-user').value = 'all'; $('#au-type').value = 'all'; auditShown = 12; renderAudit(); }
      if (e.target.closest('#au-csv')) {
        var list = auditFiltered(), q = function (v) { v = String(v == null ? '' : v); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
        var csv = '\ufeff' + ['الوقت', 'المستخدم', 'الحدث', 'النوع', 'IP'].map(q).join(',') + '\r\n' + list.map(function (e2) { return [new Date(e2.t).toISOString(), e2.by, e2.text, (TYPES[e2.type] || TYPES.settings)[0], e2.ip].map(q).join(','); }).join('\r\n');
        var a = h('a', { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })), download: 'almel-audit-' + localDay() + '.csv' });
        document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
        toast('تم تصدير السجل', { text: list.length + ' حدثاً · CSV', icon: 'download' });
      }
    });
    INIT.audit = function () { renderAudit(); };

    /* =================== ثوابت النظام (System constants) =================== */
    var AC = window.AdminConstants;
    var NEEDKEY = ['timezone', 'icon', 'section_anchor', 'password_expiry', 'session_timeout'];
    var ct = { g: AC ? AC.groups()[0].key : '', q: '' };
    R.constants = function () {
      if (!AC) return card('constants', 'editor', 'ثوابت النظام', null, '<p class="muted">تعذّر تحميل ملف الثوابت (admin-constants.js).</p>');
      return card('constants', 'editor', 'ثوابت النظام', 'كل قائمة منسدلة في اللوحة هي ثابت من ثوابت الموقع. أي تعديل هنا ينعكس فوراً على القوائم في كل الصفحات.',
        '<div class="ct-wrap"><aside class="ct-groups" aria-label="مجموعات الثوابت"><label class="input-icon ct-gq"><span class="sr-only">ابحث في الثوابت</span><span class="material-symbols-outlined" aria-hidden="true">search</span><input class="input sm" id="ct-q" type="search" placeholder="ابحث في الثوابت…" autocomplete="off"></label><ul class="ct-glist" id="ct-glist"></ul></aside><div class="ct-editor" id="ct-editor"></div></div>');
    };
    function ctGroupCount(g) { var a = AC.all(g.key); return a.filter(function (x) { return x.active; }).length + '/' + a.length; }
    function ctRenderGroups() {
      var ul = $('#ct-glist'); if (!ul) return; var q = UI.normalize(ct.q); ul.textContent = '';
      AC.groups().forEach(function (g) {
        var hay = UI.normalize(g.label + ' ' + g.desc + ' ' + g.pages.join(' ') + ' ' + AC.all(g.key).map(function (x) { return x.label; }).join(' '));
        if (q && hay.indexOf(q) < 0) return;
        var b = h('button', { type: 'button', class: 'ct-g' + (g.key === ct.g ? ' is-on' : ''), 'data-ct-group': g.key, 'aria-pressed': String(g.key === ct.g) }, [h('span', { class: 'ct-g-name', text: g.label }), h('span', { class: 'ct-g-n', text: ctGroupCount(g), title: 'الفعّال / الكل' })]);
        ul.appendChild(h('li', {}, [b]));
      });
      if (!ul.children.length) ul.appendChild(h('li', { class: 'muted st-empty', text: 'لا توجد مجموعات مطابقة.' }));
    }
    function ctRenderEditor() {
      var box = $('#ct-editor'); if (!box) return; var g = AC.group(ct.g) || AC.groups()[0]; ct.g = g.key;
      var items = AC.all(g.key), lock = g.lock || [], act = items.filter(function (x) { return x.active; }).length;
      box.textContent = '';
      var head = h('div', { class: 'ct-head' }, [
        h('div', { class: 'ct-head-t' }, [h('h4', { text: g.label }), h('p', { class: 'hint', text: g.desc }), h('p', { class: 'ct-pages' }, [ic('web'), h('span', { text: 'تُستخدم في: ' + g.pages.join('، ') })])]),
        h('button', { type: 'button', class: 'btn btn-ghost btn-sm', 'data-ct-reset': g.key, disabled: AC.isCustom(g.key) ? null : true }, [ic('restart_alt'), 'إعادة الافتراضي'])
      ]);
      box.appendChild(head);
      if (g.fixed) box.appendChild(h('p', { class: 'ct-note' }, [ic('info'), h('span', { text: 'مفاتيح هذه المجموعة مرتبطة بسلوك اللوحة، لذلك يمكنك تعديل التسميات والترتيب والتفعيل فقط (بدون إضافة أو حذف).' })]));
      var tbody = h('tbody');
      items.forEach(function (x, i) {
        var locked = lock.indexOf(x.key) >= 0;
        var inp = h('input', { class: 'input sm ct-label', value: x.label, maxlength: '60', 'data-ct-label': x.key, 'aria-label': 'تسمية ' + x.label });
        var sw = h('button', { type: 'button', class: 'switch', role: 'switch', 'aria-checked': String(x.active), 'data-ct-toggle': x.key, 'aria-label': 'تفعيل ' + x.label, disabled: (locked || (x.active && act <= 1)) ? true : null });
        var up = h('button', { type: 'button', class: 'icon-btn sm', 'data-ct-up': x.key, 'aria-label': 'رفع ' + x.label, disabled: i === 0 ? true : null }, [ic('keyboard_arrow_up')]);
        var dn = h('button', { type: 'button', class: 'icon-btn sm', 'data-ct-down': x.key, 'aria-label': 'خفض ' + x.label, disabled: i === items.length - 1 ? true : null }, [ic('keyboard_arrow_down')]);
        var del = g.fixed || locked ? h('span', { class: 'sr-only', text: 'لا يمكن حذفه' }) : h('button', { type: 'button', class: 'icon-btn sm st-danger-text', 'data-ct-del': x.key, 'aria-label': 'حذف ' + x.label }, [ic('delete')]);
        tbody.appendChild(h('tr', { class: x.active ? '' : 'is-off' }, [
          h('td', { class: 'ct-c-n', text: String(i + 1) }), h('td', {}, [inp]), h('td', { class: 'ct-c-k' }, [h('code', { class: 'ltr', text: x.key })]),
          h('td', { class: 'ct-c-s' }, [sw]), h('td', { class: 'ct-c-a' }, [h('div', { class: 'ct-acts' }, [up, dn, del])])
        ]));
      });
      box.appendChild(h('div', { class: 'table-wrap', tabindex: '0', role: 'region', 'aria-label': 'قيم ' + g.label }, [h('table', { class: 'table compact ct-table' }, [
        h('thead', {}, [h('tr', {}, [h('th', { text: '#' }), h('th', { text: 'التسمية (تظهر في القائمة)' }), h('th', { text: 'المفتاح' }), h('th', { text: 'مفعّل' }), h('th', { class: 'col-actions', text: 'ترتيب / حذف' })])]), tbody])]));
      if (!g.fixed) {
        var needKey = NEEDKEY.indexOf(g.key) >= 0;
        var f = h('form', { class: 'ct-add', id: 'ct-add', novalidate: true }, [
          h('div', { class: 'field' }, [h('label', { class: 'label', for: 'ct-new-label', text: 'قيمة جديدة' }), h('input', { class: 'input sm', id: 'ct-new-label', maxlength: '60', placeholder: 'التسمية بالعربية', autocomplete: 'off' })]),
          h('div', { class: 'field' }, [h('label', { class: 'label', for: 'ct-new-key', text: needKey ? 'المفتاح (مطلوب)' : 'المفتاح (اختياري)' }), h('input', { class: 'input sm', id: 'ct-new-key', dir: 'ltr', maxlength: '40', placeholder: needKey ? 'مثال: Asia/Beirut' : 'يُولَّد تلقائياً', autocomplete: 'off' })]),
          h('button', { type: 'submit', class: 'btn btn-primary btn-sm' }, [ic('add'), 'إضافة'])
        ]);
        box.appendChild(f);
        box.appendChild(h('p', { class: 'ct-err', id: 'ct-err', hidden: true, role: 'alert' }));
      }
      box.appendChild(h('p', { class: 'hint ct-foot', text: 'عند تعطيل قيمة أو حذفها تختفي من القوائم، أما السجلات المحفوظة مسبقاً فتبقى تعرض تسميتها كما هي.' }));
    }
    function ctSaved(msg, tone, icn) { audit(msg, 'settings', 'tune'); toast('تم حفظ التغيير', { text: msg, tone: tone || 'success', icon: icn || 'check', duration: 2200 }); }
    function ctRender(keepFocus) { ctRenderGroups(); ctRenderEditor(); }
    INIT.constants = function () { ctRender(); };
    function ctErr(t) { var e = $('#ct-err'); if (!e) return; e.textContent = t; e.hidden = !t; }
    root.addEventListener('input', function (e) { if (e.target.id === 'ct-q') { ct.q = e.target.value; ctRenderGroups(); } });
    root.addEventListener('change', function (e) {
      var k = e.target.getAttribute && e.target.getAttribute('data-ct-label'); if (!k) return;
      var v = e.target.value.trim(), old = AC.label(ct.g, k);
      if (!v) { e.target.value = old; toast('التسمية لا يمكن أن تكون فارغة', { tone: 'danger', icon: 'error' }); return; }
      if (v === old) return;
      AC.update(ct.g, k, { label: v }); ctSaved('عدّل «' + old + '» إلى «' + v + '»'); ctRender();
    });
    root.addEventListener('submit', function (e) {
      if (e.target.id !== 'ct-add') return; e.preventDefault();
      var l = $('#ct-new-label').value.trim(), k = $('#ct-new-key').value.trim();
      if (l.length < 1) { ctErr('أدخل تسمية للقيمة الجديدة.'); $('#ct-new-label').focus(); return; }
      if (NEEDKEY.indexOf(ct.g) >= 0 && !k) { ctErr('هذه المجموعة تحتاج مفتاحاً.'); $('#ct-new-key').focus(); return; }
      if (k && AC.all(ct.g).some(function (x) { return x.key === k; })) { ctErr('المفتاح مستخدم من قبل.'); $('#ct-new-key').focus(); return; }
      if (AC.all(ct.g).some(function (x) { return x.label === l; })) { ctErr('توجد قيمة بنفس التسمية.'); $('#ct-new-label').focus(); return; }
      AC.add(ct.g, { label: l, key: k }); ctSaved('أُضيفت القيمة «' + l + '»'); ctRender(); var n = $('#ct-new-label'); if (n) n.focus();
    });
    root.addEventListener('click', function (e) {
      var b;
      if ((b = e.target.closest('[data-ct-group]'))) { ct.g = b.getAttribute('data-ct-group'); ctRender(); return; }
      if ((b = e.target.closest('[data-ct-toggle]'))) { var k = b.getAttribute('data-ct-toggle'), x = AC.all(ct.g).filter(function (y) { return y.key === k; })[0]; if (!x) return; AC.update(ct.g, k, { active: !x.active }); ctSaved((x.active ? 'عُطّلت' : 'فُعّلت') + ' القيمة «' + x.label + '»', 'info', 'toggle_on'); ctRender(); return; }
      if ((b = e.target.closest('[data-ct-up]'))) { AC.move(ct.g, b.getAttribute('data-ct-up'), -1); ctSaved('غُيّر ترتيب القيم', 'info', 'swap_vert'); ctRender(); var f1 = $('[data-ct-up="' + b.getAttribute('data-ct-up') + '"]:not([disabled])') || $('[data-ct-down="' + b.getAttribute('data-ct-up') + '"]'); if (f1) f1.focus(); return; }
      if ((b = e.target.closest('[data-ct-down]'))) { AC.move(ct.g, b.getAttribute('data-ct-down'), 1); ctSaved('غُيّر ترتيب القيم', 'info', 'swap_vert'); ctRender(); var f2 = $('[data-ct-down="' + b.getAttribute('data-ct-down') + '"]:not([disabled])') || $('[data-ct-up="' + b.getAttribute('data-ct-down') + '"]'); if (f2) f2.focus(); return; }
      if ((b = e.target.closest('[data-ct-del]'))) {
        var key = b.getAttribute('data-ct-del'), lab = AC.label(ct.g, key);
        UI.confirmDelete('القيمة «' + lab + '»', 'ستختفي من القوائم. السجلات المحفوظة التي تستخدمها تبقى تعرض تسميتها.').then(function (ok) { if (!ok) return; AC.remove(ct.g, key); ctSaved('حُذفت القيمة «' + lab + '»', 'danger', 'delete'); ctRender(); });
        return;
      }
      if ((b = e.target.closest('[data-ct-reset]'))) {
        var gk = b.getAttribute('data-ct-reset'), gg = AC.group(gk);
        modal({ title: 'إعادة «' + gg.label + '» إلى الافتراضي؟', text: 'ستُستبدل القيم الحالية بالقيم الأصلية وبترتيبها الأصلي.', icon: 'restart_alt', tone: 'warn', confirmText: 'إعادة الافتراضي' }).then(function (ok) { if (!ok) return; AC.reset(gk); ctSaved('أُعيدت المجموعة «' + gg.label + '» إلى الافتراضي', 'info', 'restart_alt'); ctRender(); });
      }
    });
    if (AC) AC.subscribe(function () { if ($('#ct-editor') && !document.activeElement.matches('input')) ctRender(); });

    /* constants changed elsewhere: refresh sections whose lists come from them */
    if (ACN) ACN.subscribe(function () { ['general', 'security', 'notifications', 'backup', 'users', 'audit'].forEach(function (k) { if (document.getElementById('sec-' + k) && !R[k].__busy) { var a = document.activeElement; if (a && a.closest && a.closest('#sec-' + k)) return; renderSection(k); } }); });

    /* =================== LAYOUT: nav, sections, search =================== */
    var nav = $('#st-nav');
    SECTIONS.forEach(function (s) {
      nav.appendChild(h('a', { href: '#' + s.id, 'data-sec': s.id, class: 'st-nav-link' }, [ic(s.icon), h('span', { class: 'st-nav-label', text: s.label }), h('span', { class: 'st-nav-dirty', hidden: true, title: 'تغييرات غير محفوظة' }, [h('span', { class: 'sr-only', text: ' (تغييرات غير محفوظة)' })])]));
      var sec = h('section', { class: 'st-section', id: 'sec-' + s.id, 'data-section': s.id, 'aria-labelledby': 'sec-' + s.id + '-t', hidden: true });
      sec.innerHTML = '<div class="st-sec-head"><span class="st-sec-ico" aria-hidden="true">' + icon(s.icon) + '</span><div><h2 id="sec-' + s.id + '-t">' + esc(s.label) + '</h2><p>' + esc(s.desc) + '</p></div>' + (STATEFUL.indexOf(s.id) >= 0 ? '<button type="button" class="btn btn-ghost btn-sm st-reset" data-reset="' + s.id + '">' + icon('restart_alt') + (s.id === 'site_theme' ? 'إعادة الافتراضي' : 'إعادة ضبط القسم') + '</button>' : '') + '</div><div class="st-sec-body"></div>';
      root.appendChild(sec);
    });
    function renderSection(id) {
      var body = $('#sec-' + id + ' .st-sec-body'); body.innerHTML = R[id]();
      bind(body); if (INIT[id]) INIT[id]();
    }
    SECTIONS.forEach(function (s) { renderSection(s.id); });
    root.addEventListener('click', function (e) { var b = e.target.closest('[data-reset]'); if (b) resetSection(b.getAttribute('data-reset')); });

    var current = null;
    function go(id, setting, silent) {
      if (!SEC[id]) id = 'general';
      if (current !== id) {
        $$('.st-section').forEach(function (s) { s.hidden = s.getAttribute('data-section') !== id; });
        $$('.st-nav-link').forEach(function (a) { var on = a.getAttribute('data-sec') === id; if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
        current = id;
        var act = $('.st-nav-link[aria-current]'); if (act && act.scrollIntoView && matchMedia('(max-width: 1023px)').matches) act.scrollIntoView({ inline: 'center', block: 'nearest' });
        if (id === 'backup') renderBackupStat();
        if (id === 'audit') renderAudit();
      }
      var hash = '#' + id + (setting ? '/' + setting : '');
      if (location.hash !== hash) history.replaceState(null, '', hash);
      if (setting) {
        var el = document.getElementById('set-' + id + '-' + setting) || document.getElementById('card-' + id + '-' + setting);
        if (el) {
          el.scrollIntoView({ block: 'center', behavior: UI.reduceMotion ? 'auto' : 'smooth' });
          el.classList.remove('is-found'); void el.offsetWidth; el.classList.add('is-found');
          var f = $('input:not([type=hidden]):not([disabled]), select, textarea, button.switch, .seg button, .st-choice-card', el);
          setTimeout(function () { if (f) f.focus({ preventScroll: true }); }, silent ? 0 : 350);
        }
      } else if (!silent) { var top = $('#sec-' + id); var y = top.getBoundingClientRect().top + scrollY - 88; if (scrollY > y) scrollTo({ top: Math.max(0, y), behavior: UI.reduceMotion ? 'auto' : 'smooth' }); }
    }
    nav.addEventListener('click', function (e) { var a = e.target.closest('a[data-sec]'); if (!a) return; e.preventDefault(); go(a.getAttribute('data-sec')); $('#sec-' + a.getAttribute('data-sec') + '-t').setAttribute('tabindex', '-1'); });
    window.addEventListener('hashchange', function () { var p = location.hash.slice(1).split('/'); go(p[0], p[1]); });

    // search index
    var INDEX = [];
    $$('.st-row').forEach(function (r) {
      var sec = r.getAttribute('data-sec'), t = $('h3', r).textContent, hint = ($('.st-row-head .hint', r) || {}).textContent || '';
      var labels = $$('label.label, .st-toggle strong, .label', r).map(function (l) { return l.textContent; }).join(' ');
      INDEX.push({ el: r, sec: sec, key: r.id.replace('set-' + sec + '-', ''), title: t, hint: hint, hay: UI.normalize([t, hint, labels, r.getAttribute('data-kw'), SEC[sec].label].join(' ')) });
    });
    $$('.st-card[id^="card-"]').forEach(function (c) { var sec = c.id.split('-')[1]; if (!$('.st-row', c)) { var t = $('.card-title', c).textContent; INDEX.push({ el: c, sec: sec, key: c.id.replace('card-' + sec + '-', ''), title: t, hint: ($('.card-sub', c) || {}).textContent || '', hay: UI.normalize(t + ' ' + c.textContent.slice(0, 400)) }); } });
    var sInput = $('#st-search'), sList = $('#st-results'), sActive = -1, sItems = [];
    function markText(str, q) {
      var frag = document.createDocumentFragment(), i = q ? str.toLowerCase().indexOf(q.toLowerCase()) : -1;
      if (i < 0) { frag.appendChild(document.createTextNode(str)); return frag; }
      frag.appendChild(document.createTextNode(str.slice(0, i))); frag.appendChild(h('mark', { text: str.slice(i, i + q.length) })); frag.appendChild(document.createTextNode(str.slice(i + q.length)));
      return frag;
    }
    function search() {
      var raw = sInput.value.trim(), q = UI.normalize(raw);
      sList.textContent = ''; sActive = -1; sItems = [];
      if (!q) { closeSearch(); return; }
      var words = q.split(/\s+/);
      var hits = INDEX.map(function (x) { var sc = 0; words.forEach(function (w) { if (x.hay.indexOf(w) >= 0) sc += 1; if (UI.normalize(x.title).indexOf(w) >= 0) sc += 2; }); return { x: x, sc: sc }; }).filter(function (r) { return r.sc >= words.length; }).sort(function (a, b) { return b.sc - a.sc; }).slice(0, 8);
      if (!hits.length) sList.appendChild(h('li', { class: 'st-res-empty', role: 'presentation', text: 'لا توجد إعدادات مطابقة لـ «' + raw + '»' }));
      hits.forEach(function (r, i) {
        var li = h('li', { role: 'option', id: 'st-res-' + i, 'aria-selected': 'false', class: 'st-res' }, [h('span', { class: 'st-res-ico', 'aria-hidden': 'true' }, [ic(SEC[r.x.sec].icon)]), h('span', { class: 'st-res-text' }, [h('strong', {}, [markText(r.x.title, raw)]), h('small', {}, [SEC[r.x.sec].label + (r.x.hint ? ' · ' : ''), markText(r.x.hint.slice(0, 70), raw)])])]);
        li.addEventListener('mousedown', function (e) { e.preventDefault(); pick(i); });
        sList.appendChild(li); sItems.push(r.x);
      });
      sList.hidden = false; sInput.setAttribute('aria-expanded', 'true');
      if (hits.length) setActive(0);
      announce(hits.length ? hits.length + ' نتائج' : 'لا توجد نتائج');
    }
    function setActive(i) { sActive = i; $$('.st-res', sList).forEach(function (li, k) { li.setAttribute('aria-selected', String(k === i)); if (k === i) li.scrollIntoView({ block: 'nearest' }); }); if (i >= 0) sInput.setAttribute('aria-activedescendant', 'st-res-' + i); else sInput.removeAttribute('aria-activedescendant'); }
    function closeSearch() { sList.hidden = true; sInput.setAttribute('aria-expanded', 'false'); sInput.removeAttribute('aria-activedescendant'); }
    function pick(i) { var x = sItems[i]; if (!x) return; closeSearch(); sInput.value = ''; go(x.sec, x.key); }
    sInput.addEventListener('input', search);
    sInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' && sItems.length) { e.preventDefault(); setActive((sActive + 1) % sItems.length); }
      else if (e.key === 'ArrowUp' && sItems.length) { e.preventDefault(); setActive((sActive - 1 + sItems.length) % sItems.length); }
      else if (e.key === 'Enter') { e.preventDefault(); if (sActive >= 0) pick(sActive); }
      else if (e.key === 'Escape' && !sList.hidden) { e.stopPropagation(); closeSearch(); }
    });
    sInput.addEventListener('blur', function () { setTimeout(closeSearch, 120); });
    sInput.addEventListener('focus', function () { if (sInput.value.trim()) search(); });

    var p0 = location.hash.slice(1).split('/');
    go(SEC[p0[0]] ? p0[0] : 'general', p0[1], true);
    syncDirty();
    setInterval(function () { if (!dirtySections().length) syncDirty(); }, 60000);
    window.__settings = { go: go, state: function () { return S; } };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
