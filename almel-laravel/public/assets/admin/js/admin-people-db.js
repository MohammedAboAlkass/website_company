/* =========================================================================
   Partners · FAQ · Announcements + Appeal card · Impact map — 100% database backed.
   Loaded after admin.js on /admin/partners, /admin/faq, /admin/appeal, /admin/impact
   (window.__DB_PAGES makes admin.js skip its demo logic). Laravel JSON API:
     /admin/partners · /admin/faqs · /admin/announcements (+ /bar) · /admin/appeals · /admin/impact
   List UI = the same drawer / drag & drop / switch design as the old demo; persistence = server.
   ========================================================================= */
(function () {
  'use strict';
  var U = window.AdminUI, DnD = window.AdminDnD;
  var PAGE = document.body.getAttribute('data-page');
  if (!U || !DnD || ['partners', 'faq', 'appeal', 'announcements', 'impact'].indexOf(PAGE) < 0) return;

  var OPTS = window.__PEOPLE_OPTS || {};
  var ICONS = OPTS.icons || [], ANCHORS = OPTS.anchors || [], MAXMB = OPTS.maxMb || 10;
  var esc = U.esc, icon = U.icon, toast = U.toast, normalize = U.normalize;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function can(k) { return window.AdminPerm ? window.AdminPerm.can(k) : true; }
  function norm(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
  var fmtN = function (n) { return Number(n || 0).toLocaleString('en-US'); };
  var pl = function (v) { v = v == null ? '' : v; return window.AdminEditor ? window.AdminEditor.plain(v) : String(v).replace(/<[^>]*>/g, ' '); };
  var rich = function (v) { return window.AdminEditor ? window.AdminEditor.render(v) : esc(String(v == null ? '' : v)); };
  var cut = function (s, n) { s = pl(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  var sumOf = function (a, k) { return a.reduce(function (x, y) { return x + (+y[k] || 0); }, 0); };
  function uniq(a, k) { var m = {}; a.forEach(function (x) { if (x[k]) m[x[k]] = 1; }); return Object.keys(m).length; }
  function anchorLabel(h) { if (!h) return 'بدون رابط'; for (var i = 0; i < ANCHORS.length; i++) if (ANCHORS[i].key === h) return ANCHORS[i].label; return h; }
  function fmtDt(s) { return s ? String(s).replace('T', ' ') : ''; }

  /* ---------- API ---------- */
  function csrf() { var m = document.querySelector('meta[name="csrf-token"]'); return m ? m.getAttribute('content') : ''; }
  function api(method, url, body) {
    var opt = { method: method, credentials: 'same-origin', headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': csrf() } };
    if (body instanceof FormData) opt.body = body;
    else if (body !== undefined) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
    return fetch(url, opt).then(function (r) {
      return r.text().then(function (t) {
        var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) { j = null; }
        if (r.ok) return j || {};
        var err = { status: r.status, message: (j && j.message) || '', errors: (j && j.errors) || {} };
        if (r.status === 419) err.message = 'انتهت الجلسة. أعد تحميل الصفحة ثم حاول مجدداً.';
        else if (r.status === 401) { err.message = 'انتهت جلسة الدخول.'; setTimeout(function () { location.href = '/admin/login'; }, 800); }
        else if (r.status === 403) err.message = 'ليست لديك صلاحية لهذا الإجراء.';
        else if (r.status === 404) err.message = err.message || 'العنصر غير موجود (ربما حُذف من مستخدم آخر).';
        else if (r.status >= 500) err.message = 'تعذّر الاتصال بالخادم. حاول مرة أخرى.';
        else if (r.status === 413) err.message = 'حجم الملف أكبر من المسموح.';
        throw err;
      });
    }, function () { throw { status: 0, message: 'تعذّر الاتصال بالخادم. تحقق من الإنترنت.', errors: {} }; });
  }
  function firstError(e) {
    if (e && e.errors) { var k = Object.keys(e.errors); if (k.length && e.errors[k[0]] && e.errors[k[0]][0]) return e.errors[k[0]][0]; }
    return (e && e.message) || 'حدث خطأ غير متوقع.';
  }
  function fail(e, title) { toast(title || 'تعذّر تنفيذ العملية', { text: firstError(e), tone: 'danger', icon: 'error' }); }
  var live = document.createElement('p'); live.className = 'sr-only'; live.setAttribute('aria-live', 'assertive'); document.getElementById('main').appendChild(live);
  function announce(t) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 30); }
  function flashSaved(el, text) {
    if (!el) return;
    el.classList.remove('is-dirty');
    el.innerHTML = icon('cloud_done') + '<span>' + esc(text || 'حُفظ الآن') + '</span>';
    el.classList.remove('is-pulse'); void el.offsetWidth; el.classList.add('is-pulse');
  }

  /* ---------- fields ---------- */
  function T(k, label, o) { return Object.assign({ k: k, label: label, type: 'text' }, o || {}); }
  var F = {
    partners: [
      T('name', 'اسم الشريك', { req: 1, max: 150 }),
      T('tag_label', 'تصنيف الشراكة', { req: 1, max: 60, half: 1 }),
      T('tag_icon', 'أيقونة التصنيف', { type: 'select', src: 'icons', blank: 'بدون أيقونة', half: 1 }),
      T('description', 'وصف الشراكة', { type: 'textarea', req: 1, max: 500, rows: 4 }),
      T('website_url', 'رابط موقع الشريك', { opt: 1, max: 500, dir: 'ltr', hint: 'اختياري — يبدأ بـ https://' }),
      T('logo_media_id', 'الشعار', { type: 'image', item: 'logo', upload: '/admin/partners/logo', logo: 1, hint: 'ارفع شعاراً (JPG أو PNG أو WebP أو GIF حتى ' + MAXMB + ' ميغابايت) أو اخترْه من مكتبة الوسائط.' })
    ],
    faq: [
      T('question', 'السؤال', { req: 1, max: 255 }),
      T('answer', 'الإجابة', { type: 'rich', req: 1, max: 5000, rows: 8 })
    ],
    announcements: [
      T('text', 'نص الإعلان', { type: 'textarea', req: 1, max: 255, rows: 3 }),
      T('details', 'تفاصيل الإعلان', { type: 'rich', opt: 1, max: 5000, rows: 6, hint: 'اختياري — نص منسّق (عناوين وقوائم وروابط وصور) يشرح الإعلان.' }),
      T('link_url', 'القسم الذي يفتحه الإعلان', { type: 'select', src: 'anchors', blank: 'بدون رابط' }),
      T('starts_at', 'يبدأ عرضه في', { type: 'datetime', opt: 1, half: 1, hint: 'اتركه فارغاً ليظهر فوراً.' }),
      T('ends_at', 'ينتهي عرضه في', { type: 'datetime', opt: 1, half: 1, hint: 'اتركه فارغاً ليبقى ظاهراً.' })
    ],
    impact: [
      T('name', 'اسم المحافظة', { req: 1, max: 150 }),
      T('note', 'وصف مختصر للجهود', { type: 'textarea', req: 1, max: 500, rows: 4 }),
      T('beneficiaries', 'المستفيدون', { type: 'number', req: 1, half: 1 }),
      T('meals', 'الوجبات', { type: 'number', req: 1, half: 1 }),
      T('tents', 'الخيام', { type: 'number', req: 1, half: 1 }),
      T('water_points', 'نقاط المياه', { type: 'number', req: 1, half: 1 }),
      T('distribution_points', 'نقاط التوزيع الميدانية', { type: 'number', req: 1 })
    ],
    appeal: [
      T('flag_label', 'وسم الصورة', { opt: 1, max: 60, half: 1 }),
      T('chip_label', 'الشارة العلوية', { opt: 1, max: 100, half: 1 }),
      T('kicker', 'العنوان الفرعي', { opt: 1, max: 120 }),
      T('title_line1', 'العنوان — السطر الأول', { req: 1, max: 120 }),
      T('title_line2', 'العنوان — السطر الثاني (مميّز)', { opt: 1, max: 120 }),
      T('description', 'نص النداء', { type: 'rich', req: 1, max: 2000, rows: 5 }),
      T('primary_cta_text', 'نص الزر الرئيسي', { opt: 1, max: 80, half: 1 }),
      T('primary_cta_url', 'وجهة الزر الرئيسي', { type: 'select', src: 'anchors', blank: 'بدون رابط', half: 1 }),
      T('secondary_cta_text', 'نص الزر الثانوي', { opt: 1, max: 80, half: 1 }),
      T('secondary_cta_url', 'وجهة الزر الثانوي', { type: 'select', src: 'anchors', blank: 'بدون رابط', half: 1 }),
      T('image_media_id', 'صورة النداء', { type: 'image', item: 'image', upload: '/admin/appeals/image', hint: 'ارفع صورة أو اخترها من مكتبة الوسائط (حتى ' + MAXMB + ' ميغابايت).' }),
      T('starts_at', 'يبدأ عرض البطاقة في', { type: 'datetime', opt: 1, half: 1, hint: 'اتركه فارغاً لتظهر فوراً.' }),
      T('ends_at', 'ينتهي عرض البطاقة في', { type: 'datetime', opt: 1, half: 1, hint: 'اتركه فارغاً لتبقى ظاهرة.' })
    ]
  };

  function optionList(f, v) {
    var list = (f.src === 'icons' ? ICONS : ANCHORS).slice(), h = '';
    if (f.blank) h += '<option value=""' + (!v ? ' selected' : '') + '>' + esc(f.blank) + '</option>';
    var found = !v;
    list.forEach(function (o) { if (o.key === v) found = true; h += '<option value="' + esc(o.key) + '"' + (o.key === v ? ' selected' : '') + '>' + esc(o.label) + '</option>'; });
    if (!found) h += '<option value="' + esc(v) + '" selected>' + esc(v) + '</option>';
    return h;
  }
  function imageHTML(f, v, id) {
    var url = v && v.url ? v.url : '';
    return '<div class="pp-img' + (f.logo ? ' is-logo' : '') + '" data-img="' + id + '"><span class="pp-img-prev" aria-hidden="true">' + (url ? '<img alt="" src="' + esc(url) + '">' : icon('image')) + '</span>' +
      '<div class="pp-img-act"><button type="button" class="btn btn-secondary btn-sm" data-img-up>' + icon('upload') + 'رفع صورة</button><button type="button" class="btn btn-ghost btn-sm" data-img-lib>' + icon('photo_library') + 'من المكتبة</button><button type="button" class="btn btn-ghost btn-sm" data-img-rm' + (url ? '' : ' hidden') + '>' + icon('delete') + 'إزالة</button></div>' +
      '<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden data-img-file>' +
      '<input type="hidden" id="' + id + '" data-k="' + f.k + '" value="' + esc(v && v.id ? v.id : '') + '"></div>' +
      '<div class="pp-lib" data-lib hidden><div class="pp-lib-grid" data-lib-grid></div><div class="pp-lib-foot"><span data-lib-info></span><button type="button" class="btn btn-ghost btn-sm" data-lib-more hidden>تحميل المزيد</button></div></div>';
  }
  function fieldHTML(f, item, pre) {
    var id = pre + '-' + f.k, v = f.type === 'image' ? item[f.item] : item[f.k], val = v == null ? '' : v;
    var len = f.type === 'rich' ? pl(val).length : norm(val).length;
    var counter = f.max && (f.type === 'text' || f.type === 'textarea' || f.type === 'rich') ? '<span class="counter" data-counter="' + id + '">' + len + ' / ' + f.max + '</span>' : '';
    var h = '<div class="field"><label class="label" for="' + id + '"><span>' + esc(f.label) + (f.req ? ' <span class="req" aria-hidden="true">*</span>' : f.opt ? ' <span class="opt">اختياري</span>' : '') + '</span>' + counter + '</label>';
    var d = ' id="' + id + '" data-k="' + f.k + '" aria-describedby="' + id + '-err"';
    if (f.type === 'rich') h += '<textarea class="textarea" rows="' + (f.rows || 4) + '"' + d + ' data-rich style="min-height:0">' + esc(val) + '</textarea>';
    else if (f.type === 'textarea') h += '<textarea class="textarea" rows="' + (f.rows || 3) + '"' + d + (f.max ? ' maxlength="' + f.max + '"' : '') + ' style="min-height:0">' + esc(val) + '</textarea>';
    else if (f.type === 'select') h += '<select class="select"' + d + '>' + optionList(f, val) + '</select>';
    else if (f.type === 'number') h += '<input class="input num" type="number" min="0" max="999999999" step="1" inputmode="numeric" dir="ltr"' + d + ' value="' + esc(val) + '">';
    else if (f.type === 'datetime') h += '<input class="input" type="datetime-local" dir="ltr"' + d + ' value="' + esc(val) + '">';
    else if (f.type === 'image') h += imageHTML(f, v, id);
    else h += '<input class="input"' + (f.dir ? ' dir="' + f.dir + '"' : '') + d + (f.max ? ' maxlength="' + f.max + '"' : '') + ' value="' + esc(val) + '">';
    if (f.hint) h += '<p class="hint">' + esc(f.hint) + '</p>';
    return h + '<p class="error" id="' + id + '-err" hidden>' + icon('error') + '<span>هذا الحقل مطلوب.</span></p></div>';
  }
  function fieldsHTML(fields, item, pre) {
    var h = '', i = 0;
    while (i < fields.length) {
      var f = fields[i];
      if (f.half && fields[i + 1] && fields[i + 1].half) { h += '<div class="field-row">' + fieldHTML(f, item, pre) + fieldHTML(fields[i + 1], item, pre) + '</div>'; i += 2; }
      else { h += fieldHTML(f, item, pre); i++; }
    }
    return h;
  }
  function readFields(fields, root, pre) {
    var o = {};
    fields.forEach(function (f) {
      var el = $('#' + pre + '-' + f.k, root), v = el ? el.value : '';
      if (f.type === 'number') o[f.k] = v === '' ? '' : Math.max(0, Math.round(+v));
      else if (f.type === 'image') o[f.k] = v ? +v : null;
      else if (f.type === 'rich') o[f.k] = String(v).trim();
      else if (f.type === 'textarea') o[f.k] = norm(v);
      else o[f.k] = norm(v);
    });
    return o;
  }
  function setErr(el, err, ok, msg) {
    if (el) { el.classList.toggle('is-invalid', !ok); if (ok) el.removeAttribute('aria-invalid'); else el.setAttribute('aria-invalid', 'true'); }
    if (err) { err.hidden = ok; if (!ok) $('span:last-child', err).textContent = msg; }
  }
  function validate(fields, root, pre) {
    var bad = [];
    fields.forEach(function (f) {
      var el = $('#' + pre + '-' + f.k, root), err = $('#' + pre + '-' + f.k + '-err', root), v = el.value, ok = true, msg = 'هذا الحقل مطلوب.';
      if (f.req && f.type !== 'image' && !(f.type === 'rich' ? pl(v) : norm(v))) ok = false;
      if (ok && f.max && (f.type === 'rich' ? pl(v).length : norm(v).length) > f.max) { ok = false; msg = 'النص أطول من الحد المسموح (' + f.max + ' حرفاً).'; }
      if (ok && f.type === 'number' && v !== '' && !(+v >= 0 && +v <= 999999999)) { ok = false; msg = 'أدخل رقماً صحيحاً بين 0 و999,999,999.'; }
      if (ok && f.type === 'datetime') { /* both-or-order check below */ }
      setErr(el, err, ok, msg);
      if (!ok) bad.push(el);
    });
    var s = $('#' + pre + '-starts_at', root), e = $('#' + pre + '-ends_at', root);
    if (s && e && s.value && e.value && e.value <= s.value) { setErr(e, $('#' + pre + '-ends_at-err', root), false, 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء.'); bad.push(e); }
    return bad;
  }
  function showServerErrors(errors, root, pre) {
    var first = null;
    Object.keys(errors || {}).forEach(function (k) {
      var el = $('#' + pre + '-' + k, root), er = $('#' + pre + '-' + k + '-err', root);
      if (el && er) { setErr(el, er, false, errors[k][0]); if (!first && el.type !== 'hidden') first = el; }
    });
    if (first) first.focus();
  }
  function mountRich(fields, root, pre) {
    if (!window.AdminEditor) return;
    fields.forEach(function (f) {
      if (f.type !== 'rich') return;
      var ta = $('#' + pre + '-' + f.k, root); if (ta) window.AdminEditor.enhance(ta, { compact: true, hint: '', minHeight: Math.max(110, (f.rows || 4) * 28) });
    });
  }
  function wireFields(fields, root, pre, onChange) {
    fields.forEach(function (f) {
      var el = $('#' + pre + '-' + f.k, root); if (!el || f.type === 'image') return;
      el.addEventListener('input', function () {
        if (f.type === 'textarea' && /\n/.test(el.value)) el.value = el.value.replace(/\n+/g, ' ');
        var c = $('[data-counter="' + el.id + '"]', root);
        if (c) { var n = f.type === 'rich' ? pl(el.value).length : norm(el.value).length; c.textContent = n + ' / ' + f.max; c.classList.toggle('over', n >= f.max); }
        if (f.type === 'rich' ? pl(el.value) : norm(el.value)) { el.classList.remove('is-invalid'); el.removeAttribute('aria-invalid'); var er = $('#' + el.id + '-err', root); if (er) er.hidden = true; }
        if (onChange) onChange();
      });
      el.addEventListener('change', function () { if (onChange) onChange(); });
    });
  }

  /* ---------- image field: upload + media library ---------- */
  function wireImage(f, root, pre, onChange) {
    if (f.type !== 'image') return;
    var id = pre + '-' + f.k, wrap = $('[data-img="' + id + '"]', root); if (!wrap) return;
    var hidden = $('#' + id, root), prev = $('.pp-img-prev', wrap), file = $('[data-img-file]', wrap), rm = $('[data-img-rm]', wrap);
    var lib = $('[data-lib]', wrap.parentNode), grid = $('[data-lib-grid]', lib), info = $('[data-lib-info]', lib), more = $('[data-lib-more]', lib), page = 0, last = 1;
    function set(m) {
      hidden.value = m ? m.id : ''; prev.innerHTML = m ? '<img alt="" src="' + esc(m.url) + '">' : icon('image'); rm.hidden = !m;
      var er = $('#' + id + '-err', root); if (er) er.hidden = true;
      if (onChange) onChange(m);
    }
    $('[data-img-up]', wrap).addEventListener('click', function () { file.click(); });
    rm.addEventListener('click', function () { set(null); });
    file.addEventListener('change', function () {
      var fl = file.files && file.files[0]; file.value = ''; if (!fl) return;
      if (!/^image\/(jpeg|png|webp|gif)$/.test(fl.type)) { toast('ملف غير مدعوم', { text: 'الصيغ المسموحة: JPG وPNG وWebP وGIF.', tone: 'danger', icon: 'error' }); return; }
      if (fl.size > MAXMB * 1048576) { toast('الصورة كبيرة', { text: 'الحد الأقصى ' + MAXMB + ' ميغابايت.', tone: 'danger', icon: 'error' }); return; }
      var fd = new FormData(); fd.append('file', fl); wrap.classList.add('is-busy');
      api('POST', f.upload, fd).then(function (j) { set(j.data); toast('تم رفع الصورة', { icon: 'cloud_done', duration: 2200 }); }, function (e) { fail(e, 'تعذّر رفع الصورة'); }).then(function () { wrap.classList.remove('is-busy'); });
    });
    function loadLib(reset) {
      if (reset) { page = 0; grid.innerHTML = ''; }
      info.textContent = 'جارٍ التحميل…';
      api('GET', '/admin/editor/media?page=' + (page + 1)).then(function (j) {
        page = j.meta.page; last = j.meta.last;
        grid.insertAdjacentHTML('beforeend', (j.data || []).map(function (m) { return '<button type="button" class="pp-lib-item" data-id="' + m.id + '" data-url="' + esc(m.url) + '" title="' + esc(m.name || '') + '"><img alt="' + esc(m.alt || m.name || '') + '" loading="lazy" src="' + esc(m.url) + '"></button>'; }).join(''));
        info.textContent = j.meta.total ? j.meta.total + ' صورة في المكتبة' : 'المكتبة فارغة';
        more.hidden = page >= last;
      }, function (e) { info.textContent = firstError(e); });
    }
    $('[data-img-lib]', wrap).addEventListener('click', function () { lib.hidden = !lib.hidden; if (!lib.hidden && !grid.children.length) loadLib(true); });
    more.addEventListener('click', function () { loadLib(false); });
    grid.addEventListener('click', function (e) { var b = e.target.closest('.pp-lib-item'); if (!b) return; set({ id: +b.getAttribute('data-id'), url: b.getAttribute('data-url') }); lib.hidden = true; });
  }

  /* ---------- list pages ---------- */
  var CFG = {
    partners: { prefix: 'pt', base: '/admin/partners', perm: 'partners', fields: F.partners, the: 'الشريك',
      title: function (i) { return i.name; }, sub: function (i) { return cut(i.description, 110); }, thumb: 'logo', tag: function (i) { return i.tag_label ? { icon: i.tag_icon, text: i.tag_label } : null; },
      stats: function (a) { var v = a.filter(function (x) { return x.visible; }).length; return [['إجمالي الشركاء', a.length], ['ظاهرون في الموقع', v], ['مخفيون', a.length - v], ['تصنيفات الشراكة', uniq(a, 'tag_label')]]; },
      addLabel: 'شريك جديد', emptyText: 'أضف شريكاً جديداً ليظهر في قسم «الشركاء».' },
    faq: { prefix: 'fq', base: '/admin/faqs', perm: 'faq', fields: F.faq, the: 'السؤال',
      title: function (i) { return i.question; }, sub: function (i) { return cut(i.answer, 120); }, thumb: 'icon', icon: 'help', tag: null,
      stats: function (a) { var v = a.filter(function (x) { return x.visible; }).length; return [['إجمالي الأسئلة', a.length], ['ظاهرة في الموقع', v], ['مخفية', a.length - v], ['متوسط طول الإجابة', a.length ? Math.round(a.reduce(function (s, x) { return s + pl(x.answer).length; }, 0) / a.length) + ' حرفاً' : '—']]; },
      addLabel: 'سؤال جديد', emptyText: 'أضف سؤالاً وإجابة ليظهرا في قسم «الأسئلة الشائعة».' },
    announcements: { prefix: 'an', base: '/admin/announcements', perm: 'announcements', fields: F.announcements, the: 'الإعلان',
      title: function (i) { return i.text; }, sub: function (i) { return 'يفتح قسم: ' + anchorLabel(i.link_url) + (i.starts_at || i.ends_at ? ' — ' + (i.starts_at ? 'من ' + fmtDt(i.starts_at) : '') + (i.ends_at ? ' إلى ' + fmtDt(i.ends_at) : '') : ''); }, thumb: 'icon', icon: 'campaign', tag: null,
      stats: function (a) { var v = a.filter(function (x) { return x.visible; }).length; return [['إجمالي الإعلانات', a.length], ['ظاهرة في الشريط', v], ['مخفية', a.length - v], ['أقسام مرتبطة', uniq(a, 'link_url')]]; },
      addLabel: 'إعلان جديد', emptyText: 'أضف إعلاناً ليظهر في شريط «آخر الإعلانات».' },
    impact: { prefix: 'im', base: '/admin/impact', list: '/admin/impact/data', perm: 'impact', fields: F.impact, fixed: true, the: 'المحافظة',
      title: function (i) { return i.name; }, sub: function (i) { return cut(i.note, 100); }, thumb: 'icon', icon: 'location_on', tag: function (i) { return { icon: 'groups', text: fmtN(i.beneficiaries) + ' مستفيد' }; },
      stats: function (a) { return [['إجمالي المستفيدين', fmtN(sumOf(a, 'beneficiaries'))], ['إجمالي الوجبات', fmtN(sumOf(a, 'meals'))], ['إجمالي الخيام', fmtN(sumOf(a, 'tents'))], ['نقاط المياه', fmtN(sumOf(a, 'water_points'))]]; },
      emptyText: '' }
  };

  function List(cfg, hooks) {
    hooks = hooks || {};
    var p = cfg.prefix, list = document.getElementById(p + '-list'); if (!list) return null;
    var drawer = document.getElementById(p + '-drawer');
    var st = { q: '', f: 'all' }, items = [], editing = null, flashId = null, dragId = null, busy = false, state = 'loading';
    var canEdit = can(cfg.perm + '.edit'), canAdd = !cfg.fixed && can(cfg.perm + '.create'), canDel = !cfg.fixed && can(cfg.perm + '.delete');

    function byId(id) { for (var i = 0; i < items.length; i++) if (String(items[i].id) === String(id)) return items[i]; return null; }
    function filtering() { return !!(normalize(st.q) || st.f !== 'all'); }
    function matches(it) {
      if (st.f === 'visible' && !it.visible) return false;
      if (st.f === 'hidden' && it.visible) return false;
      var q = normalize(st.q); if (!q) return true;
      return normalize(cfg.fields.map(function (f) { return f.type === 'image' ? '' : pl(it[f.k]); }).join(' ')).indexOf(q) > -1;
    }
    function thumbHTML(it) {
      if (cfg.thumb === 'logo') {
        var u = it.logo && it.logo.url;
        return u ? '<span class="ct-thumb is-logo" aria-hidden="true"><img src="' + esc(u) + '" alt="" loading="lazy"></span>' : '<span class="ct-thumb is-initial" aria-hidden="true">' + esc(String(it.name || '؟').charAt(0)) + '</span>';
      }
      return '<span class="sec-ico tone-light" aria-hidden="true">' + icon(cfg.icon) + '</span>';
    }
    function rowHTML(it) {
      var pos = items.indexOf(it), n = items.length, off = filtering() || !canEdit;
      var tg = cfg.tag ? cfg.tag(it) : null, ttl = cfg.title(it);
      return '<li data-id="' + esc(it.id) + '" data-depth="0" class="sec-row ct-row' + (it.visible ? '' : ' is-off') + (flashId === it.id ? ' is-dropped' : '') + '">' +
        '<div class="sec-item">' +
        '<button type="button" class="dnd-handle" aria-label="سحب لإعادة ترتيب ' + esc(cfg.the) + ' «' + esc(cut(ttl, 40)) + '»، الموضع ' + (pos + 1) + ' من ' + n + '"' + (off ? ' aria-disabled="true" disabled title="' + (canEdit ? 'أزل البحث أو التصفية لإعادة الترتيب' : 'لا تملك صلاحية التعديل') + '"' : '') + '>' + icon('drag_indicator') + '</button>' +
        '<span class="sec-num" aria-hidden="true">' + (pos + 1) + '</span>' + thumbHTML(it) +
        '<div class="sec-text"><strong>' + esc(cut(ttl, 90)) + '</strong><span class="sec-note">' + esc(cfg.sub(it)) + '</span></div>' +
        (tg ? '<span class="tag ct-tag">' + icon(tg.icon || 'sell') + esc(cut(tg.text, 28)) + '</span>' : '') +
        '<span class="sec-flag" aria-hidden="true">' + (it.visible ? '' : icon('visibility_off') + 'مخفي') + '</span>' +
        (canEdit ? '<button type="button" class="btn btn-ghost btn-sm" data-edit="' + esc(it.id) + '" aria-label="تعديل ' + esc(cfg.the) + ' «' + esc(cut(ttl, 40)) + '»">' + icon('edit') + '<span>تعديل</span></button>' : '') +
        '<button type="button" class="switch" role="switch" data-vis="' + esc(it.id) + '" aria-checked="' + it.visible + '"' + (canEdit ? '' : ' disabled') + ' aria-label="إظهار ' + esc(cfg.the) + ' «' + esc(cut(ttl, 40)) + '» في الموقع"></button>' +
        (canEdit ? '<div class="sec-move"><button type="button" class="icon-btn sm" data-up="' + esc(it.id) + '" aria-label="تحريك لأعلى"' + (off || pos === 0 ? ' disabled' : '') + '>' + icon('arrow_upward') + '</button>' +
          '<button type="button" class="icon-btn sm" data-down="' + esc(it.id) + '" aria-label="تحريك لأسفل"' + (off || pos === n - 1 ? ' disabled' : '') + '>' + icon('arrow_downward') + '</button></div>' : '') +
        (canDel ? '<button type="button" class="icon-btn sm ct-del" data-del="' + esc(it.id) + '" aria-label="حذف ' + esc(cfg.the) + ' «' + esc(cut(ttl, 40)) + '»" title="حذف">' + icon('delete') + '</button>' : '') +
        '</div></li>';
    }
    function renderStats() {
      var el = document.getElementById(p + '-stats'); if (!el) return;
      el.innerHTML = state === 'ready' ? cfg.stats(items).map(function (s) { return '<div><dt>' + esc(s[0]) + '</dt><dd><b>' + esc(s[1]) + '</b></dd></div>'; }).join('') : '';
    }
    function render() {
      var cnt = document.getElementById(p + '-count');
      renderStats();
      if (state === 'loading') {
        list.classList.remove('sec-list'); if (cnt) cnt.textContent = '';
        list.innerHTML = '<li class="pp-skel-row" aria-hidden="true"></li><li class="pp-skel-row" aria-hidden="true"></li><li class="pp-skel-row" aria-hidden="true"></li><li class="sr-only">جارٍ تحميل القائمة…</li>'; return;
      }
      if (state === 'error') {
        list.classList.remove('sec-list'); if (cnt) cnt.textContent = '';
        list.innerHTML = '<li class="ct-empty">' + U.emptyState('cloud_off', 'تعذّر تحميل القائمة', st.err || 'حدث خطأ أثناء الاتصال بالخادم.', '<button type="button" class="btn btn-secondary" data-retry>' + icon('refresh') + 'إعادة المحاولة</button>') + '</li>';
        $('[data-retry]', list).addEventListener('click', load); return;
      }
      var shown = items.filter(matches);
      if (cnt) cnt.textContent = shown.length + ' من ' + items.length;
      if (!shown.length) {
        list.classList.remove('sec-list');
        if (!items.length) {
          list.innerHTML = '<li class="ct-empty">' + U.emptyState('inbox', 'لا توجد عناصر بعد', cfg.fixed ? 'لم تُحمَّل المحافظات من قاعدة البيانات.' : cfg.emptyText, canAdd ? '<button type="button" class="btn btn-primary" data-empty-add>' + icon('add') + esc(cfg.addLabel) + '</button>' : '') + '</li>';
          var ea = $('[data-empty-add]', list); if (ea) ea.addEventListener('click', function () { openDrawer(null); });
        } else {
          list.innerHTML = '<li class="ct-empty">' + U.emptyState('search_off', 'لا توجد نتائج مطابقة', 'غيّر كلمات البحث أو عامل التصفية.', '<button type="button" class="btn btn-secondary" data-clear>' + icon('filter_alt_off') + 'مسح البحث</button>') + '</li>';
          $('[data-clear]', list).addEventListener('click', function () { st.q = ''; st.f = 'all'; var s = document.getElementById(p + '-search'); if (s) { s.value = ''; s.focus(); } var f = document.getElementById(p + '-filter'); if (f) f.value = 'all'; render(); });
        }
        return;
      }
      list.classList.add('sec-list');
      list.innerHTML = shown.map(rowHTML).join('');
      flashId = null;
    }
    function load() {
      state = 'loading'; render();
      return api('GET', cfg.list || cfg.base).then(function (j) {
        items = (j.data || []).slice(); state = 'ready'; if (hooks.onLoad) hooks.onLoad(j); render();
      }, function (e) { state = 'error'; st.err = firstError(e); render(); });
    }

    function saveOrder(id) {
      return api('POST', cfg.base + '/reorder', { ids: items.map(function (x) { return x.id; }) }).then(function () {
        flashSaved(document.getElementById(p + '-saved'), 'حُفظ الترتيب الآن');
      }, function (e) { fail(e, 'تعذّر حفظ الترتيب'); load(); });
    }
    function move(id, to, how) {
      var from = items.findIndex(function (x) { return String(x.id) === String(id); });
      if (from < 0 || to < 0 || to >= items.length || to === from) return false;
      var it = items.splice(from, 1)[0]; items.splice(to, 0, it);
      flashId = it.id; render(); saveOrder(it.id);
      announce('نُقل «' + cut(cfg.title(it), 40) + '» إلى الموضع ' + (to + 1) + ' من ' + items.length);
      if (how === 'drag') toast('تم تغيير الترتيب', { text: 'الموضع الجديد: ' + (to + 1) + ' من ' + items.length, icon: 'reorder', duration: 2400 });
      return true;
    }
    list.addEventListener('click', function (e) {
      var ed = e.target.closest('[data-edit]');
      if (ed) { openDrawer(byId(ed.getAttribute('data-edit')), ed); return; }
      var del = e.target.closest('[data-del]');
      if (del) { removeItem(byId(del.getAttribute('data-del'))); return; }
      var b = e.target.closest('[data-up],[data-down]'); if (!b) return;
      var up = b.hasAttribute('data-up'), id = b.getAttribute(up ? 'data-up' : 'data-down');
      var from = items.findIndex(function (x) { return String(x.id) === String(id); });
      if (move(id, from + (up ? -1 : 1))) {
        var nb = $('[data-' + (up ? 'up' : 'down') + '="' + id + '"]', list);
        if (nb && nb.disabled) nb = $('li[data-id="' + id + '"] .dnd-handle', list);
        if (nb) nb.focus();
      }
    });
    list.addEventListener('keydown', function (e) {
      var h = e.target.closest('.dnd-handle'); if (!h || h.disabled) return;
      var id = h.closest('li').getAttribute('data-id'), from = items.findIndex(function (x) { return String(x.id) === String(id); }), to = null;
      if (e.key === 'ArrowUp') to = from - 1; else if (e.key === 'ArrowDown') to = from + 1;
      else if (e.key === 'Home') to = 0; else if (e.key === 'End') to = items.length - 1;
      if (to === null) return;
      e.preventDefault();
      if (move(id, to)) { var nh = $('li[data-id="' + id + '"] .dnd-handle', list); if (nh) nh.focus(); }
    });
    document.addEventListener('switch', function (e) {
      var sw = e.target; if (!sw.hasAttribute || !sw.hasAttribute('data-vis') || !list.contains(sw)) return;
      var it = byId(sw.getAttribute('data-vis')); if (!it) return;
      api('PATCH', cfg.base + '/' + it.id + '/toggle', { visible: e.detail.on }).then(function (j) {
        Object.assign(it, j.data); render();
        var n = $('[data-vis="' + it.id + '"]', list); if (n) n.focus();
        announce((it.visible ? 'أصبح ظاهراً: ' : 'أُخفي: ') + cut(cfg.title(it), 40));
        toast(it.visible ? 'أصبح العنصر ظاهراً' : 'تم إخفاء العنصر', { text: cut(cfg.title(it), 60), icon: it.visible ? 'visibility' : 'visibility_off', tone: 'info', duration: 2400 });
        flashSaved(document.getElementById(p + '-saved'), 'حُفظت التغييرات الآن');
      }, function (er) { fail(er, 'تعذّر تغيير الظهور'); render(); });
    });
    DnD.Sortable(list, {
      maxDepth: 0,
      onStart: function (r) { dragId = r.id; },
      onDrop: function (r) {
        var id = dragId; dragId = null;
        if (!r.changed) { render(); return; }
        move(id, r.index, 'drag');
        var h = $('li[data-id="' + id + '"] .dnd-handle', list); if (h) h.focus({ preventScroll: true });
      },
      onCancel: function () { dragId = null; render(); announce('أُلغي السحب'); }
    });

    function removeItem(it) {
      if (!it || !canDel) return;
      U.confirmDelete(cfg.the, '«' + cut(cfg.title(it), 70) + '» — سيُحذف من القائمة ومن الموقع.').then(function (ok) {
        if (!ok) return;
        api('DELETE', cfg.base + '/' + it.id).then(function () {
          items = items.filter(function (x) { return x !== it; }); render();
          toast('تم الحذف', { text: cut(cfg.title(it), 60), tone: 'danger' });
          flashSaved(document.getElementById(p + '-saved'), 'حُفظت التغييرات الآن');
        }, function (e) { fail(e, 'تعذّر الحذف'); if (e.status === 404) load(); });
      });
    }

    function openDrawer(it, trigger) {
      if (!drawer || (it ? !canEdit : !canAdd)) return;
      editing = it || null;
      var vals = it || {};
      drawer.innerHTML = '<form id="' + p + '-form" novalidate style="display:contents">' +
        '<div class="drawer-head"><div><h2 id="' + p + '-dt">' + (it ? 'تعديل ' + esc(cfg.the) : esc(cfg.addLabel)) + '</h2><p id="' + p + '-ds">' + (it ? 'حدّث البيانات ثم احفظ التغييرات.' : 'أدخل البيانات لإضافتها إلى القائمة.') + '</p></div>' +
        '<button type="button" class="icon-btn" data-close-drawer aria-label="إغلاق">' + icon('close') + '</button></div>' +
        '<div class="drawer-body">' + fieldsHTML(cfg.fields, vals, p + 'f') + '</div>' +
        '<div class="drawer-foot"><button type="button" class="btn btn-secondary" data-close-drawer>إلغاء</button><button type="submit" class="btn btn-primary" data-save>' + icon('save') + 'حفظ</button></div></form>';
      drawer.setAttribute('aria-labelledby', p + '-dt'); drawer.setAttribute('aria-describedby', p + '-ds');
      var form = $('#' + p + '-form', drawer);
      wireFields(cfg.fields, form, p + 'f'); mountRich(cfg.fields, form, p + 'f');
      cfg.fields.forEach(function (f) { wireImage(f, form, p + 'f'); });
      form.addEventListener('submit', function (e) {
        e.preventDefault(); if (busy) return;
        var bad = validate(cfg.fields, form, p + 'f');
        if (bad.length) { bad[0].focus(); toast('يرجى تصحيح الحقول المظللة', { tone: 'danger', icon: 'error' }); return; }
        var data = readFields(cfg.fields, form, p + 'f'), was = !!editing, btn = $('[data-save]', form);
        data.is_published = was ? editing.visible : true;
        busy = true; btn.disabled = true; btn.classList.add('is-busy');
        api(was ? 'PUT' : 'POST', cfg.base + (was ? '/' + editing.id : ''), data).then(function (j) {
          if (was) { Object.assign(editing, j.data); flashId = editing.id; } else { items.push(j.data); flashId = j.data.id; }
          U.Drawer.close(drawer); render();
          toast(was ? 'تم حفظ التغييرات' : 'تمت الإضافة', { text: cut(cfg.title(j.data), 60) });
          flashSaved(document.getElementById(p + '-saved'), 'حُفظت التغييرات الآن');
        }, function (er) {
          if (er.status === 422) { showServerErrors(er.errors, form, p + 'f'); toast('تعذّر الحفظ', { text: firstError(er), tone: 'danger', icon: 'error' }); }
          else { fail(er, 'تعذّر الحفظ'); if (er.status === 404) { U.Drawer.close(drawer); load(); } }
        }).then(function () { busy = false; btn.disabled = false; btn.classList.remove('is-busy'); });
      });
      U.Drawer.open(drawer, { focus: '#' + p + 'f-' + cfg.fields[0].k, returnFocus: trigger });
    }
    var add = document.getElementById(p + '-add'); if (add) add.addEventListener('click', function () { openDrawer(null, add); });
    var search = document.getElementById(p + '-search'), filter = document.getElementById(p + '-filter'), t;
    if (search) search.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { st.q = search.value; render(); }, 120); });
    if (filter) filter.addEventListener('change', function () { st.f = filter.value; render(); });
    load();
    return { render: render, load: load, openAdd: function () { openDrawer(null, add); } };
  }

  /* ---------- announcements bar settings ---------- */
  function AnnBar(bar) {
    var input = document.getElementById('bar-label'), sw = document.getElementById('bar-visible'), sv = document.getElementById('an-saved'); if (!input) return;
    var okEdit = can('announcements.edit'), cur = { label: 'آخر الإعلانات', visible: true };
    function show(b) { cur = { label: b.label, visible: !!b.visible }; input.value = b.label; sw.setAttribute('aria-checked', String(!!b.visible)); count(); }
    function count() { var c = document.getElementById('bar-label-count'); if (c) c.textContent = norm(input.value).length + ' / 30'; }
    if (!okEdit) { input.disabled = true; sw.disabled = true; }
    function persist() {
      var label = norm(input.value), vis = sw.getAttribute('aria-checked') === 'true';
      if (!label) { toast('عنوان الشريط مطلوب', { tone: 'danger', icon: 'error' }); input.value = cur.label; count(); return; }
      if (label === cur.label && vis === cur.visible) return;
      api('PUT', '/admin/announcements/bar', { label: label, visible: vis }).then(function (j) {
        show(j.bar); flashSaved(sv, 'حُفظت التغييرات الآن'); toast(j.bar.visible ? 'تم حفظ إعدادات الشريط' : 'تم إخفاء الشريط', { icon: 'campaign', tone: 'info', duration: 2400 });
      }, function (e) { fail(e, 'تعذّر حفظ إعدادات الشريط'); show(cur); });
    }
    input.addEventListener('change', persist);
    input.addEventListener('input', count);
    document.addEventListener('switch', function (e) { if (e.target === sw) persist(); });
    if (bar) show(bar);
  }

  /* ---------- appeal card ---------- */
  function Appeal() {
    var form = document.getElementById('ap-form'); if (!form) return;
    var fields = F.appeal, pre = 'apf', sw = document.getElementById('ap-visible'), stEl = document.getElementById('ap-state'), saveBtn = document.getElementById('ap-save'), undoBtn = document.getElementById('ap-reset');
    var card = null, saved = '', imageUrl = '', busy = false, okEdit = can('appeal.edit'), loaded = false;
    form.innerHTML = '<div class="pp-state" id="ap-loading">جارٍ تحميل بطاقة النداء…</div>';
    function collect() { var o = readFields(fields, form, pre); o.visible = sw.getAttribute('aria-checked') === 'true'; return o; }
    function key(o) { return JSON.stringify(o); }
    function preview() {
      var d = collect(), el = document.getElementById('ap-preview');
      el.classList.toggle('is-off', !d.visible);
      el.innerHTML = '<div class="ap-media">' + (imageUrl ? '<img src="' + esc(imageUrl) + '" alt="">' : '') + (d.flag_label ? '<span class="ap-flag">' + esc(d.flag_label) + '</span>' : '') + '</div>' +
        '<div class="ap-body">' + (d.chip_label ? '<span class="ap-chip">' + esc(d.chip_label) + '</span>' : '') + (d.kicker ? '<p class="ap-kicker">' + esc(d.kicker) + '</p>' : '') +
        '<h3 class="ap-title">' + esc(d.title_line1) + (d.title_line2 ? '<br><span>' + esc(d.title_line2) + '</span>' : '') + '</h3><div class="ap-desc ed-content">' + rich(d.description) + '</div>' +
        '<div class="ap-btns">' + (d.primary_cta_text ? '<span class="ap-btn is-main">' + esc(d.primary_cta_text) + '</span>' : '') + (d.secondary_cta_text ? '<span class="ap-btn">' + esc(d.secondary_cta_text) + '</span>' : '') + '</div></div>' +
        (d.visible ? '' : '<div class="ap-off">' + icon('visibility_off') + 'البطاقة مخفية عن الزوار</div>');
    }
    function sync() {
      if (!loaded) return false;
      var dirty = key(collect()) !== saved; preview();
      stEl.classList.toggle('is-dirty', dirty);
      stEl.innerHTML = dirty ? '<span class="dirty-dot" aria-hidden="true"></span><span>تغييرات غير محفوظة</span>' : icon('cloud_done') + '<span>محفوظة في قاعدة البيانات</span>';
      saveBtn.classList.toggle('has-dot', dirty);
      if (undoBtn) undoBtn.disabled = !dirty;
      return dirty;
    }
    function build(c) {
      card = c; var item = c || { visible: true };
      form.innerHTML = fieldsHTML(fields, item, pre);
      imageUrl = item.image ? item.image.url : '';
      sw.setAttribute('aria-checked', String(item.visible !== false));
      wireFields(fields, form, pre, sync); mountRich(fields, form, pre);
      fields.forEach(function (f) { wireImage(f, form, pre, function (m) { imageUrl = m ? m.url : ''; sync(); }); });
      if (!okEdit) { $$('input,select,textarea,button', form).forEach(function (x) { x.disabled = true; }); sw.disabled = true; saveBtn.hidden = true; if (undoBtn) undoBtn.hidden = true; }
      loaded = true; saved = key(collect()); sync();
    }
    document.addEventListener('switch', function (e) { if (e.target === sw) sync(); });
    function save() {
      if (!okEdit || busy || !loaded) return false;
      var bad = validate(fields, form, pre);
      if (bad.length) { bad[0].focus(); toast('لا يمكن الحفظ بعد', { text: 'أكمل الحقول المطلوبة وصحّح المظللة.', tone: 'danger', icon: 'error' }); return false; }
      var d = collect(), body = Object.assign({}, d, { is_active: d.visible }); delete body.visible;
      busy = true; saveBtn.disabled = true; saveBtn.classList.add('is-busy');
      api(card ? 'PUT' : 'POST', '/admin/appeals' + (card ? '/' + card.id : ''), body).then(function (j) {
        card = j.data; saved = key(collect()); imageUrl = card.image ? card.image.url : ''; sync(); stEl.classList.remove('is-pulse'); void stEl.offsetWidth; stEl.classList.add('is-pulse');
        toast('تم حفظ نداء الإغاثة', { text: 'حُفظت البيانات في قاعدة البيانات.', icon: 'cloud_done' });
      }, function (er) {
        if (er.status === 422) { showServerErrors(er.errors, form, pre); toast('تعذّر الحفظ', { text: firstError(er), tone: 'danger', icon: 'error' }); } else fail(er, 'تعذّر الحفظ');
      }).then(function () { busy = false; saveBtn.disabled = false; saveBtn.classList.remove('is-busy'); });
      return true;
    }
    saveBtn.addEventListener('click', save);
    form.addEventListener('submit', function (e) { e.preventDefault(); save(); });
    document.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 's' || e.key === 'S')) { e.preventDefault(); save(); } });
    if (undoBtn) undoBtn.addEventListener('click', function () {
      if (!sync()) return;
      U.modal({ title: 'التراجع عن التعديلات؟', text: 'ستعود البطاقة إلى آخر نسخة محفوظة، وتُفقد التعديلات التي لم تحفظها.', icon: 'undo', tone: 'warn', confirmText: 'تراجع' }).then(function (ok) { if (ok) build(card); });
    });
    window.addEventListener('beforeunload', function (e) { if (sync()) { e.preventDefault(); e.returnValue = ''; } });
    api('GET', '/admin/appeals').then(function (j) { build(j.data); }, function (e) {
      form.innerHTML = '<div class="pp-state">' + esc(firstError(e)) + '<br><button type="button" class="btn btn-secondary" id="ap-retry">' + icon('refresh') + 'إعادة المحاولة</button></div>';
      $('#ap-retry').addEventListener('click', function () { location.reload(); });
    });
  }

  function start() {
    if (PAGE === 'appeal') Appeal();
    else if (PAGE === 'announcements') {
      var barBox = null;
      List(CFG.announcements, { onLoad: function (j) { if (!barBox) { barBox = true; AnnBar(j.bar); } } });
    } else List(CFG[PAGE]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
