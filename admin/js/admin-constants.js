/* =========================================================================
   ثوابت النظام — window.AdminConstants
   كل قائمة منسدلة في اللوحة تقرأ خياراتها من هنا. تُحرَّر من
   الإعدادات ← «ثوابت النظام». التخزين: localStorage "almel-admin-constants"
   كل عنصر: { key, label, active, order } (+ note اختياري).
   - عنصر معطّل/محذوف لا يظهر في القوائم، لكن السجلات المحفوظة تعرض تسميتها.
   - لا يوجد أي ثابت متعلق بالتبرعات.
   ========================================================================= */
(function () {
  'use strict';
  var KEY = 'almel-admin-constants';
  var EVT = 'almel-constants';
  var GROUPS = [
    { "key": "project_status", "label": "حالات المشروع", "desc": "حالة المشروع في قائمة المشاريع ونموذج المشروع.", "pages": [ "المشاريع" ], "fixed": false, "lock": [], "items": [ [ "active", "نشط" ], [ "urgent", "عاجل" ], [ "paused", "متوقف مؤقتاً" ], [ "draft", "مسودة" ], [ "completed", "مكتمل" ] ] },
    {"key": "project_category", "label": "فئات المشاريع (البرامج)", "desc": "فئة المشروع في الفلاتر ونموذج المشروع.", "pages": [ "المشاريع" ], "fixed": false, "lock": [], "items": [ [ "relief", "برامج إغاثية" ], [ "construction", "برامج إنشائية" ], [ "development", "برامج تنموية" ], [ "health", "برامج صحية" ] ] },
    {"key": "governorate", "label": "المحافظات", "desc": "محافظة المشروع في نموذج المشروع.", "pages": [ "المشاريع" ], "fixed": false, "lock": [], "items": [ [ "north", "شمال غزة" ], [ "gaza", "غزة" ], [ "middle", "دير البلح" ], [ "khan", "خان يونس" ], [ "rafah", "رفح" ] ] },
    {"key": "news_category", "label": "تصنيفات الأخبار", "desc": "تصنيف الخبر في فلتر الأخبار ومحرر الخبر.", "pages": [ "الأخبار", "تحرير خبر" ], "fixed": false, "lock": [], "items": [ [ "statements", "بيانات وتقارير" ], [ "development", "تنمية مجتمعية" ], [ "field", "توثيق الميدان" ], [ "activities", "أنشطة ميدانية" ] ] },
    {"key": "article_status", "label": "حالات الخبر", "desc": "حالة النشر في محرر الخبر. مفاتيحها مرتبطة بسلوك النشر، تُعدَّل تسميتها وترتيبها فقط.", "pages": [ "تحرير خبر" ], "fixed": true, "lock": [], "items": [ [ "draft", "مسودة" ], [ "published", "منشور" ], [ "scheduled", "مجدول" ] ] },
    {"key": "page_status", "label": "حالات الصفحة", "desc": "حالة الصفحة العامة في إدارة الصفحات. مفاتيحها مرتبطة بسلوك النشر، تُعدَّل تسميتها وترتيبها فقط.", "pages": [ "الصفحات" ], "fixed": true, "lock": [], "items": [ [ "published", "منشورة" ], [ "draft", "مسودة" ], [ "hidden", "مخفية", "لا تظهر في القوائم والبحث" ] ] },
    {"key": "visibility", "label": "حالة الظهور في الموقع", "desc": "فلتر الظهور في القصص والأنشطة والشركاء والأسئلة والإعلانات وخريطة الأثر.", "pages": [ "القصص", "الأنشطة", "الشركاء", "الأسئلة الشائعة", "نداء الإغاثة", "خريطة الأثر" ], "fixed": true, "lock": [], "items": [ [ "visible", "ظاهر في الموقع" ], [ "hidden", "مخفي" ] ] },
    {"key": "gallery_album", "label": "ألبومات المعرض", "desc": "الألبوم في معرض الصور (نقل الصور وتفاصيل الصورة).", "pages": [ "معرض الصور" ], "fixed": false, "lock": [], "items": [ [ "field", "توثيق الميدان" ], [ "relief", "الإغاثة" ], [ "development", "التعليم والتنمية" ], [ "health", "الصحة والمياه" ] ] },
    {"key": "section_anchor", "label": "أقسام الموقع (وجهات الروابط)", "desc": "وجهة الرابط في القصص والأنشطة والإعلانات ونداء الإغاثة.", "pages": [ "القصص", "الأنشطة", "نداء الإغاثة" ], "fixed": false, "lock": [], "items": [ [ "#hero", "الرئيسية" ], [ "#about", "من نحن" ], [ "#projects", "المشاريع" ], [ "#stories", "قصص من الميدان" ], [ "#activities", "الأنشطة الميدانية" ], [ "#appeal", "نداء الإغاثة" ], [ "#impact-map", "خريطة الأثر" ], [ "#news", "الأخبار" ], [ "#partners", "الشركاء" ], [ "#gallery", "معرض الصور" ], [ "#contact", "التواصل" ], [ "#faq", "الأسئلة الشائعة" ] ] },
    {"key": "icon", "label": "الأيقونات", "desc": "قائمة الأيقونات في القصص والأنشطة والشركاء. المفتاح اسم أيقونة Material Symbols.", "pages": [ "القصص", "الأنشطة", "الشركاء" ], "fixed": false, "lock": [], "items": [ [ "shopping_basket", "سلة غذائية" ], [ "diversity_3", "فرق التطوع" ], [ "menu_book", "التعليم" ], [ "medical_services", "الرعاية الطبية" ], [ "water_drop", "المياه" ], [ "camping", "الخيام" ], [ "restaurant", "الوجبات" ], [ "groups", "المستفيدون" ], [ "group", "مجموعة" ], [ "school", "المدرسة" ], [ "child_care", "الأطفال" ], [ "public", "دولي" ], [ "nutrition", "الأمن الغذائي" ], [ "emergency", "إغاثة عاجلة" ], [ "shield", "حماية" ], [ "handshake", "شراكة" ], [ "favorite", "عطاء" ], [ "local_shipping", "قوافل" ], [ "volunteer_activism", "تبرع" ], [ "health_and_safety", "السلامة الصحية" ] ] },
    {"key": "badge_tone", "label": "ألوان وسم الصورة", "desc": "لون الوسم في الأنشطة الميدانية.", "pages": [ "الأنشطة" ], "fixed": true, "lock": [], "items": [ [ "forest", "أخضر داكن" ], [ "gold", "ذهبي" ], [ "mid", "أخضر متوسط" ] ] },
    {"key": "user_role", "label": "أدوار المستخدمين", "desc": "الدور في فريق العمل والدعوات ومصفوفة الصلاحيات.", "pages": [ "الإعدادات" ], "fixed": false, "lock": [ "admin" ], "items": [ [ "admin", "مدير" ], [ "editor", "محرر" ], [ "writer", "كاتب" ], [ "viewer", "مشاهد" ] ] },
    {"key": "timezone", "label": "المناطق الزمنية", "desc": "المنطقة الزمنية في الإعدادات العامة. المفتاح معرّف IANA.", "pages": [ "الإعدادات" ], "fixed": false, "lock": [], "items": [ [ "Asia/Gaza", "غزة (GMT+3)" ], [ "Asia/Hebron", "الخليل (GMT+3)" ], [ "Africa/Cairo", "القاهرة (GMT+3)" ], [ "Asia/Amman", "عمّان (GMT+3)" ], [ "Asia/Riyadh", "الرياض (GMT+3)" ], [ "Europe/Istanbul", "إسطنبول (GMT+3)" ], [ "Asia/Dubai", "دبي (GMT+4)" ], [ "Europe/London", "لندن" ], [ "UTC", "التوقيت العالمي UTC" ] ] },
    {"key": "language", "label": "لغات اللوحة", "desc": "لغة واجهة الإدارة. المفاتيح مرتبطة بالواجهة، تُعدَّل تسميتها وترتيبها فقط.", "pages": [ "الإعدادات" ], "fixed": true, "lock": [], "items": [ [ "ar", "العربية" ], [ "en", "English" ] ] },
    {"key": "date_format", "label": "تنسيقات التاريخ", "desc": "تنسيق التاريخ في الإعدادات العامة. المفاتيح مرتبطة بدالة التنسيق، تُعدَّل تسميتها وترتيبها فقط.", "pages": [ "الإعدادات" ], "fixed": true, "lock": [], "items": [ [ "long", "طويل" ], [ "short", "مختصر" ], [ "iso", "رقمي" ] ] },
    {"key": "digest_frequency", "label": "تكرار الملخص والنسخ الاحتياطي", "desc": "تكرار الملخص الدوري وجدولة النسخ الاحتياطي (قائمة مشتركة).", "pages": [ "الإعدادات" ], "fixed": true, "lock": [ "off" ], "items": [ [ "off", "متوقف" ], [ "daily", "يومي" ], [ "weekly", "أسبوعي" ], [ "monthly", "شهري" ] ] },
    {"key": "digest_day", "label": "أيام إرسال الملخص", "desc": "يوم إرسال الملخص الأسبوعي في الإشعارات.", "pages": [ "الإعدادات" ], "fixed": false, "lock": [], "items": [ [ "sat", "السبت" ], [ "sun", "الأحد" ], [ "mon", "الاثنين" ], [ "thu", "الخميس" ] ] },
    {"key": "password_expiry", "label": "مدد انتهاء كلمة المرور", "desc": "خيارات انتهاء الصلاحية في إعدادات الأمان.", "pages": [ "الإعدادات" ], "fixed": false, "lock": [ "never" ], "items": [ [ "never", "لا تنتهي" ], [ "30", "كل 30 يوماً" ], [ "60", "كل 60 يوماً" ], [ "90", "كل 90 يوماً" ], [ "180", "كل 180 يوماً" ] ] },
    {"key": "session_timeout", "label": "مهل الجلسة", "desc": "خيارات مهلة الخروج التلقائي (بالدقائق) في إعدادات الأمان.", "pages": [ "الإعدادات" ], "fixed": false, "lock": [], "items": [ [ "15", "15 دقيقة" ], [ "30", "30 دقيقة" ], [ "60", "ساعة" ], [ "240", "4 ساعات" ], [ "480", "8 ساعات" ] ] },
    {"key": "audit_type", "label": "أنواع أحداث السجل", "desc": "فلتر نوع الحدث في سجل النشاط. المفاتيح مرتبطة بالأحداث، تُعدَّل تسميتها وترتيبها فقط.", "pages": [ "الإعدادات" ], "fixed": true, "lock": [], "items": [ [ "settings", "الإعدادات" ], [ "users", "المستخدمون" ], [ "security", "الأمان" ], [ "content", "المحتوى" ], [ "integrations", "التكاملات" ], [ "backup", "النسخ" ] ] } ];
  var BY = {}; GROUPS.forEach(function (g) { BY[g.key] = g; });

  function read() { try { var v = JSON.parse(localStorage.getItem(KEY)); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch (e) { return {}; } }
  function write(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); return true; } catch (e) { return false; } }
  function seedItems(g) { return g.items.map(function (x, i) { var o = { key: x[0], label: x[1], active: true, order: i }; if (x[2]) o.note = x[2]; return o; }); }
  function clean(arr) {
    var seen = {}, out = [];
    (Array.isArray(arr) ? arr : []).forEach(function (x) {
      if (!x || typeof x !== 'object' || typeof x.key !== 'string' || !x.key || typeof x.label !== 'string' || seen[x.key]) return;
      seen[x.key] = 1; var o = { key: x.key, label: x.label, active: x.active !== false, order: typeof x.order === 'number' ? x.order : out.length }; if (x.note) o.note = String(x.note); out.push(o);
    });
    out.sort(function (a, b) { return a.order - b.order; });
    return out.map(function (x, i) { x.order = i; return x; });
  }
  function all(group) { var g = BY[group]; if (!g) return []; var s = read(); return s[group] ? clean(s[group]) : seedItems(g); }
  function get(group) { return all(group).filter(function (x) { return x.active; }); }
  function seedLabel(group, key) { var g = BY[group]; if (!g) return null; for (var i = 0; i < g.items.length; i++) if (g.items[i][0] === key) return g.items[i][1]; return null; }
  function label(group, key) {
    var a = all(group); for (var i = 0; i < a.length; i++) if (a[i].key === key) return a[i].label;
    return seedLabel(group, key);
  }
  function labels(group) { var o = {}; all(group).forEach(function (x) { o[x.key] = x.label; }); return o; }
  function pairs(group, current) {
    var a = get(group).map(function (x) { return [x.key, x.label]; });
    if (current != null && current !== '' && !a.some(function (p) { return p[0] === String(current); })) a.push([String(current), label(group, String(current)) || String(current)]);
    return a;
  }
  function emit() { try { window.dispatchEvent(new CustomEvent(EVT)); } catch (e) { /* old browser */ } }
  function save(group, arr) { var s = read(); s[group] = clean(arr); var ok = write(s); emit(); return ok; }
  function uniqKey(group, base) { var a = all(group), k = base, n = 2; while (a.some(function (x) { return x.key === k; })) k = base + '-' + (n++); return k; }
  function add(group, o) {
    var a = all(group), key = String(o.key || '').trim() || ('c' + Date.now().toString(36)); key = uniqKey(group, key);
    a.push({ key: key, label: String(o.label).trim(), active: true, order: a.length }); save(group, a); return key;
  }
  function update(group, key, patch) { var a = all(group); a.forEach(function (x) { if (x.key === key) Object.keys(patch).forEach(function (k) { x[k] = patch[k]; }); }); save(group, a); }
  function remove(group, key) { save(group, all(group).filter(function (x) { return x.key !== key; })); }
  function move(group, key, dir) {
    var a = all(group), i = -1; a.forEach(function (x, n) { if (x.key === key) i = n; });
    var j = i + dir; if (i < 0 || j < 0 || j >= a.length) return false;
    var t = a[i]; a[i] = a[j]; a[j] = t; a.forEach(function (x, n) { x.order = n; }); save(group, a); return true;
  }
  function reset(group) { var s = read(); delete s[group]; write(s); emit(); }
  function isCustom(group) { return !!read()[group]; }

  /* ---- DOM helpers ---- */
  function optEl(value, text, disabled) { var o = document.createElement('option'); o.value = value; o.textContent = text; if (disabled) { o.disabled = true; o.hidden = true; } return o; }
  function fill(sel, group, opts) {
    if (!sel) return sel; opts = opts || {};
    var prev = opts.selected != null ? String(opts.selected) : sel.value;
    var ph = opts.placeholder; if (typeof ph === 'string') ph = { value: '', label: ph };
    sel.textContent = '';
    if (ph) sel.appendChild(optEl(ph.value, ph.label));
    var shown = {};
    all(group).forEach(function (x) {
      var t = x.label + (opts.notes && x.note ? ' (' + x.note + ')' : '');
      sel.appendChild(optEl(x.key, t, !x.active)); shown[x.key] = 1;
    });
    if (prev != null && prev !== '' && !shown[prev] && !(ph && String(ph.value) === prev)) sel.appendChild(optEl(prev, label(group, prev) || prev, true));
    var has = Array.prototype.some.call(sel.options, function (o) { return o.value === prev && !o.hidden; });
    if (prev != null && prev !== '' && Array.prototype.some.call(sel.options, function (o) { return o.value === prev; })) sel.value = prev;
    else if (!ph && sel.options.length) { for (var i = 0; i < sel.options.length; i++) if (!sel.options[i].hidden) { sel.selectedIndex = i; break; } }
    return sel;
  }
  function fillAttr(sel) {
    var g = sel.getAttribute('data-const'); if (!g || !BY[g]) return;
    var o = { notes: sel.hasAttribute('data-notes') };
    if (sel.hasAttribute('data-ph-label')) o.placeholder = { value: sel.getAttribute('data-ph-value') || '', label: sel.getAttribute('data-ph-label') };
    fill(sel, g, o);
  }
  function refresh(root) { Array.prototype.forEach.call((root || document).querySelectorAll('select[data-const]'), fillAttr); }
  /* set a value even if the option was disabled/deleted (keeps the stored record readable) */
  function setValue(sel, val) {
    if (!sel) return; val = val == null ? '' : String(val);
    if (val !== '' && !Array.prototype.some.call(sel.options, function (o) { return o.value === val; })) sel.appendChild(optEl(val, label(sel.getAttribute('data-const'), val) || val, true));
    sel.value = val;
  }
  function subscribe(fn) { window.addEventListener(EVT, fn); window.addEventListener('storage', function (e) { if (e.key === KEY || e.key === null) fn(); }); }

  window.AdminConstants = {
    KEY: KEY, EVENT: EVT, groups: function () { return GROUPS; }, group: function (k) { return BY[k]; },
    all: all, get: get, labels: labels, label: label, pairs: pairs, fill: fill, refresh: refresh, setValue: setValue, subscribe: subscribe,
    save: save, add: add, update: update, remove: remove, move: move, reset: reset, isCustom: isCustom
  };

  refresh(document);
  subscribe(function () { refresh(document); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { refresh(document); });
})();
