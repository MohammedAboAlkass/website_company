/* Admin «نصوص الموقع» (/admin/site-texts): edits the fixed texts of the public pages that are stored in the database
   (settings key "site.texts"): relief pillars, programs page, about page, contact form + map.
   Server payload: window.__SITE_TEXTS (sections / fields / listSpecs / listDefaults / text / lists / icons).
   API: PUT /admin/site-texts (save), PUT /admin/site-texts/reset {scope}, POST /admin/site-texts/image.
   Loaded after admin.js + admin-dbkit.js (window.__DB_PAGES makes admin.js skip its own demo logic). */
(function () {
  'use strict';
  var U = window.AdminUI, DB = window.AdminDB, B = window.__SITE_TEXTS;
  if (!U || !DB || !B) return;
  var esc = U.esc, icon = U.icon;
  function $(s, r) { return (r || document).querySelector(s); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  var CAN = !window.AdminPerm || window.AdminPerm.can('pages.edit');
  var PAGE_URL = { pillars: '/', programs: '/projects', projectui: '/projects', about: '/about', contact: '/contact', partners: '/partners', homenews: '/#news', js: '/' };

  var state = { text: clone(B.text), lists: clone(B.lists), tab: B.sections[0].id, errs: {}, open: {}, pick: '', busy: false, snap: '' };
  state.snap = JSON.stringify({ text: state.text, lists: state.lists });
  var hash = (location.hash || '').replace('#', '');
  B.sections.forEach(function (s) { if (s.id === hash) state.tab = s.id; });

  var elTabs = $('#st-tabs'), elPanel = $('#st-panel'), elState = $('#st-state'), elBar = $('#st-bar'), elLive = $('#st-live');

  /* ----------------------------------------------------------------- helpers */
  function secById(id) { for (var i = 0; i < B.sections.length; i++) if (B.sections[i].id === id) return B.sections[i]; return B.sections[0]; }
  function sectionKeys(sec) {
    var keys = [], lists = [];
    sec.blocks.forEach(function (b) { if (b.kind === 'list') lists.push(b.list); else b.keys.forEach(function (k) { keys.push(k); }); });
    return { keys: keys, lists: lists };
  }
  function isDirty() { return JSON.stringify({ text: state.text, lists: state.lists }) !== state.snap; }
  function defItem(lk, id) { var d = B.listDefaults[lk] || []; for (var i = 0; i < d.length; i++) if (d[i].id === id) return d[i]; return null; }
  function sameJson(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function editedCount(sec) {
    var s = sectionKeys(sec), n = 0;
    s.keys.forEach(function (k) { if (state.text[k] !== B.fields[k].default) n++; });
    s.lists.forEach(function (l) { if (!sameJson(state.lists[l], B.listDefaults[l])) n++; });
    return n;
  }
  function iconName(v) { return Object.prototype.hasOwnProperty.call(B.icons, v) ? B.icons[v] : ''; }
  function idOf(s) { return String(s).replace(/[^A-Za-z0-9_-]/g, '-'); }
  function announce(m) { if (elLive) { elLive.textContent = ''; setTimeout(function () { elLive.textContent = m; }, 30); } }
  function newId() { return 'n' + Math.random().toString(36).slice(2, 10); }
  function itemByIdx(lk, id) { var a = state.lists[lk] || []; for (var i = 0; i < a.length; i++) if (a[i].id === id) return i; return -1; }
  function plain(v) { return String(v == null ? '' : v).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }

  /* ----------------------------------------------------------------- field renderer */
  function wide(f) { return f.type === 'text' || f.type === 'image' || f.type === 'embed' || f.type === 'url' || f.type === 'link' || f.type === 'icon' || (f.max || 0) >= 80; }

  function fieldHtml(o) {
    var f = o.f, v = o.value == null ? '' : String(o.value), id = o.id, err = state.errs[o.ek] || '';
    var changed = o.def != null && v !== o.def;
    var ro = CAN ? '' : ' readonly';
    var h = '<div class="field st-f' + (wide(f) ? ' st-wide' : '') + (err ? ' has-error' : '') + (changed ? ' is-changed' : '') + '" data-ek="' + esc(o.ek) + '">';
    h += '<div class="st-label-row"><label class="label" for="' + id + '">' + esc(f.label) + (f.optional ? ' <span class="opt">اختياري</span>' : '') + '</label>';
    if (f.type === 'line' || f.type === 'text') h += '<span class="st-count" data-count="' + id + '">' + v.length + ' / ' + f.max + '</span>';
    h += '</div>';
    var attrs = ' id="' + id + '" ' + o.attr + ' aria-describedby="' + id + '-h ' + id + '-e"' + (err ? ' aria-invalid="true"' : '') + ro;
    if (f.type === 'text') h += '<textarea class="textarea" rows="3" maxlength="' + f.max + '"' + attrs + '>' + esc(v) + '</textarea>';
    else if (f.type === 'embed') h += '<textarea class="textarea st-ltr" rows="2" dir="ltr" spellcheck="false" placeholder="https://www.google.com/maps/embed?pb=…"' + attrs + '>' + esc(v) + '</textarea>';
    else if (f.type === 'url') h += '<input class="input st-ltr" type="url" dir="ltr" inputmode="url" spellcheck="false" maxlength="' + f.max + '" placeholder="https://…"' + attrs + ' value="' + esc(v) + '">';
    else if (f.type === 'link') h += '<input class="input st-ltr" type="text" dir="ltr" inputmode="url" spellcheck="false" maxlength="' + f.max + '" placeholder="/news"' + attrs + ' value="' + esc(v) + '">';
    else if (f.type === 'toggle') h += '<div class="st-toggle"><button type="button" class="switch" role="switch" id="' + id + '" ' + o.attr + ' aria-checked="' + (v !== '0') + '" aria-describedby="' + id + '-h"' + (CAN ? '' : ' disabled') + '></button><span class="st-toggle-t" aria-hidden="true">' + (v !== '0' ? 'ظاهر' : 'مخفي') + '</span></div>';
    else if (f.type === 'image') {
      var src = v ? '/' + v.replace(/^\/+/, '') : '';
      h += '<div class="st-img"><div class="st-img-prev">' + (src ? '<img src="' + esc(src) + '" alt="" loading="lazy">' : icon('image')) + '</div><div class="st-img-side">' +
        '<code class="st-img-path" dir="ltr" id="' + id + '">' + esc(v || '—') + '</code>' +
        (CAN ? '<div class="st-img-btns"><button type="button" class="btn btn-secondary btn-sm" data-act="img-up" data-ek="' + esc(o.ek) + '">' + icon('upload') + 'رفع صورة</button></div>' : '') +
        '</div></div>';
    } else h += '<input class="input" type="text" maxlength="' + f.max + '" ' + attrs.slice(1) + ' value="' + esc(v) + '">';
    h += '<p class="hint" id="' + id + '-h">' + (f.optional && !f.hint && o.optHint ? esc(o.optHint) : esc(f.hint || '')) + '</p>';
    h += '<p class="error st-err" id="' + id + '-e" role="alert"' + (err ? '' : ' hidden') + '>' + esc(err) + '</p>';
    if (CAN && o.def != null) h += '<button type="button" class="st-restore" data-act="restore" ' + o.rattr + (changed ? '' : ' hidden') + ' title="' + esc('النص الأصلي: ' + (f.type === 'image' ? o.def : f.type === 'toggle' ? (o.def === '0' ? 'مخفي' : 'ظاهر') : o.def || '(فارغ)')) + '">' + icon('undo') + 'استعادة الأصل</button>';
    return h + '</div>';
  }

  function textFieldHtml(k) {
    var f = B.fields[k];
    return fieldHtml({ f: f, value: state.text[k], def: f.default, id: 'st-t-' + idOf(k), ek: 't:' + k, attr: 'data-t="' + esc(k) + '"', rattr: 'data-t="' + esc(k) + '"' });
  }

  /* ----------------------------------------------------------------- list item */
  function iconPickerHtml(lk, it, f, uid) {
    var cur = it[f.k], pid = lk + '|' + it.id + '|' + f.k, openP = state.pick === pid, err = state.errs['l:' + lk + ':' + it.id + ':' + f.k] || '';
    var h = '<div class="field st-f st-wide' + (err ? ' has-error' : '') + '" data-ek="l:' + esc(lk + ':' + it.id + ':' + f.k) + '">' +
      '<span class="label" id="' + uid + '-l">' + esc(f.label) + '</span>' +
      '<div class="st-ico-cur"><span class="st-ico-big">' + (iconName(cur) ? icon(cur) : icon('help')) + '</span><span class="st-ico-name">' + esc(iconName(cur) || 'لم تُحدَّد أيقونة') + '</span>' +
      (CAN ? '<button type="button" class="btn btn-secondary btn-sm" data-act="pick-toggle" data-pid="' + esc(pid) + '" aria-expanded="' + openP + '">' + (openP ? 'إغلاق القائمة' : 'تغيير الأيقونة') + '</button>' : '') + '</div>';
    if (openP && CAN) {
      h += '<div class="st-icons" role="radiogroup" aria-labelledby="' + uid + '-l">';
      Object.keys(B.icons).forEach(function (n) {
        var on = n === cur;
        h += '<button type="button" class="st-ico' + (on ? ' is-on' : '') + '" role="radio" aria-checked="' + on + '" data-act="pick" data-list="' + esc(lk) + '" data-item="' + esc(it.id) + '" data-f="' + esc(f.k) + '" data-v="' + esc(n) + '" title="' + esc(B.icons[n]) + '" aria-label="' + esc(B.icons[n]) + '">' + icon(n) + '</button>';
      });
      h += '</div>';
    }
    h += '<p class="error st-err" role="alert"' + (err ? '' : ' hidden') + '>' + esc(err) + '</p></div>';
    return h;
  }

  function itemHtml(lk, spec, it, i, total) {
    var key = lk + '|' + it.id, open = !!state.open[key], d = defItem(lk, it.id);
    var firstIcon = null, title = '', sub = '';
    spec.fields.forEach(function (f) {
      if (f.type === 'icon') { if (!firstIcon) firstIcon = it[f.k]; return; }
      var t = plain(it[f.k]); if (!t) return;
      if (!title) title = t; else if (!sub) sub = t;
    });
    var isNew = !d && !!spec.add;
    var edited = d && !sameJson(d, it);
    var hasErr = false, prefix = 'l:' + lk + ':' + it.id + ':';
    Object.keys(state.errs).forEach(function (k) { if (k.indexOf(prefix) === 0) hasErr = true; });
    var bid = 'st-i-' + idOf(lk) + '-' + idOf(it.id);
    var h = '<li class="st-item' + (it.visible ? '' : ' is-off') + (open ? ' is-open' : '') + (hasErr ? ' has-error' : '') + '" data-item="' + esc(it.id) + '">' +
      '<div class="st-item-bar"><span class="st-item-no" aria-hidden="true">' + (i + 1) + '</span>' +
      (firstIcon && iconName(firstIcon) ? '<span class="st-item-ico">' + icon(firstIcon) + '</span>' : '') +
      '<button type="button" class="st-item-main" data-act="toggle" data-list="' + esc(lk) + '" data-item="' + esc(it.id) + '" aria-expanded="' + open + '" aria-controls="' + bid + '">' +
      '<b>' + esc(title || (spec.itemLabel + ' ' + (i + 1))) + '</b>' + (sub ? '<small>' + esc(sub.length > 80 ? sub.slice(0, 80) + '…' : sub) + '</small>' : '') + '</button>' +
      '<span class="st-item-flags">' + (hasErr ? '<span class="st-flag err">يحتاج تصحيحاً</span>' : '') + (!it.visible ? '<span class="st-flag off">مخفي</span>' : '') + (isNew ? '<span class="st-flag new">جديد</span>' : (edited ? '<span class="st-flag">معدّل</span>' : '')) + '</span>' +
      '<span class="st-item-ctl">' +
      (CAN ? '<button type="button" class="switch" role="switch" aria-checked="' + it.visible + '" data-list="' + esc(lk) + '" data-item="' + esc(it.id) + '" aria-label="إظهار ' + esc(spec.itemLabel) + ' ' + (i + 1) + ' في الموقع" title="إظهار / إخفاء"></button>' +
        '<button type="button" class="icon-btn sm" data-act="up" data-list="' + esc(lk) + '" data-item="' + esc(it.id) + '" aria-label="نقل لأعلى"' + (i === 0 ? ' disabled' : '') + '>' + icon('arrow_upward') + '</button>' +
        '<button type="button" class="icon-btn sm" data-act="down" data-list="' + esc(lk) + '" data-item="' + esc(it.id) + '" aria-label="نقل لأسفل"' + (i === total - 1 ? ' disabled' : '') + '>' + icon('arrow_downward') + '</button>' +
        (spec.add ? '<button type="button" class="icon-btn sm danger" data-act="del" data-list="' + esc(lk) + '" data-item="' + esc(it.id) + '" aria-label="حذف ' + esc(spec.itemLabel) + '" title="حذف">' + icon('delete') + '</button>' : '') : '') +
      '</span></div>';
    if (open) {
      h += '<div class="st-item-body" id="' + bid + '"><div class="st-grid">';
      spec.fields.forEach(function (f) {
        var uid = bid + '-' + f.k, ek = 'l:' + lk + ':' + it.id + ':' + f.k;
        if (f.type === 'icon') { h += iconPickerHtml(lk, it, f, uid); return; }
        h += fieldHtml({ f: f, value: it[f.k], def: d ? (d[f.k] == null ? '' : d[f.k]) : null, id: uid, ek: ek, optHint: 'اتركه فارغاً لإخفائه.',
          attr: 'data-list="' + esc(lk) + '" data-item="' + esc(it.id) + '" data-f="' + esc(f.k) + '"', rattr: 'data-list="' + esc(lk) + '" data-item="' + esc(it.id) + '" data-f="' + esc(f.k) + '"' });
      });
      h += '</div></div>';
    }
    return h + '</li>';
  }

  function listBlockHtml(b) {
    var lk = b.list, spec = B.listSpecs[lk], items = state.lists[lk] || [], err = state.errs['L:' + lk] || '';
    var visible = items.filter(function (x) { return x.visible; }).length;
    var h = '<section class="st-block" aria-label="' + esc(b.title) + '"><header class="st-block-h"><div><h3>' + esc(b.title) + '</h3>' + whereHtml(b.where) + '</div><div class="st-block-tools">' +
      '<span class="st-meta">' + items.length + ' / ' + spec.max + ' · ' + visible + ' ظاهر</span>' +
      (CAN && !sameJson(items, B.listDefaults[lk]) ? '<button type="button" class="btn btn-ghost btn-sm" data-act="list-restore" data-list="' + esc(lk) + '">' + icon('undo') + 'استعادة القائمة الأصلية</button>' : '') +
      (CAN && spec.add ? '<button type="button" class="btn btn-secondary btn-sm" data-act="add" data-list="' + esc(lk) + '"' + (items.length >= spec.max ? ' disabled' : '') + '>' + icon('add') + 'إضافة ' + esc(spec.itemLabel) + '</button>' : '') +
      '</div></header>' + (b.note ? '<p class="st-bnote">' + esc(b.note) + '</p>' : '') +
      '<p class="error st-err st-list-err" role="alert"' + (err ? '' : ' hidden') + '>' + esc(err) + '</p>';
    if (!items.length) h += '<p class="st-empty">لا توجد عناصر. ' + (CAN && spec.add ? 'اضغط «إضافة ' + esc(spec.itemLabel) + '» لإنشاء أول عنصر.' : '') + '</p>';
    else {
      h += '<ol class="st-items">';
      items.forEach(function (it, i) { h += itemHtml(lk, spec, it, i, items.length); });
      h += '</ol>';
    }
    return h + '</section>';
  }

  function whereHtml(w) { return w ? '<p class="st-where">' + icon('place') + '<span>تظهر في: ' + esc(w) + '</span></p>' : ''; }

  function fieldsBlockHtml(b) {
    var h = '<section class="st-block" aria-label="' + esc(b.title) + '"><header class="st-block-h"><div><h3>' + esc(b.title) + '</h3>' + whereHtml(b.where) + '</div></header>' +
      (b.note ? '<p class="st-bnote">' + esc(b.note) + '</p>' : '') + '<div class="st-grid">';
    b.keys.forEach(function (k) { h += textFieldHtml(k); });
    return h + '</div></section>';
  }

  /* ----------------------------------------------------------------- render */
  function renderTabs() {
    var h = '';
    B.sections.forEach(function (s) {
      var n = editedCount(s), on = s.id === state.tab;
      h += '<button type="button" class="tab" role="tab" id="st-tab-' + s.id + '" aria-selected="' + on + '" aria-controls="st-panel" tabindex="' + (on ? 0 : -1) + '" data-tab="' + s.id + '">' +
        icon(s.icon) + '<span>' + esc(s.label) + '</span>' + (n ? '<span class="tab-count" title="عناصر معدّلة عن الأصل">' + n + '</span>' : '') + '</button>';
    });
    elTabs.innerHTML = h;
    elPanel.setAttribute('aria-labelledby', 'st-tab-' + state.tab);
  }

  function renderPanel(keepFocus) {
    var sec = secById(state.tab), f = keepFocus && document.activeElement && document.activeElement.id ? document.activeElement : null;
    var fid = f ? f.id : '', sel = f && typeof f.selectionStart === 'number' ? [f.selectionStart, f.selectionEnd] : null;
    var h = '<div class="st-panel-head"><p class="st-desc">' + esc(sec.desc) + '</p><div class="st-panel-tools">' +
      '<a class="btn btn-ghost btn-sm" href="' + esc(PAGE_URL[sec.id] || '/') + '" target="_blank" rel="noopener">' + icon('open_in_new') + 'عرض الصفحة في الموقع</a>' +
      (CAN ? '<button type="button" class="btn btn-secondary btn-sm" data-act="reset-tab">' + icon('restart_alt') + 'استعادة هذا القسم</button>' : '') + '</div></div>';
    sec.blocks.forEach(function (b) { h += b.kind === 'list' ? listBlockHtml(b) : fieldsBlockHtml(b); });
    elPanel.innerHTML = h;
    if (fid) { var el = document.getElementById(fid); if (el) { el.focus({ preventScroll: true }); if (sel && el.setSelectionRange) { try { el.setSelectionRange(sel[0], sel[1]); } catch (e) { /* ignore */ } } } }
    refreshStatus();
  }

  function refreshStatus() {
    var dirty = isDirty();
    elBar.hidden = !dirty;
    var tot = 0; B.sections.forEach(function (s) { tot += editedCount(s); });
    elState.className = 'save-state' + (dirty ? ' dirty' : '');
    elState.textContent = dirty ? 'تغييرات غير محفوظة' : (tot ? 'محفوظ — ' + tot + ' عنصراً معدّلاً عن الأصل' : 'النصوص الأصلية (بدون تعديل)');
    var sv = $('#st-save'), sv2 = $('#st-save2');
    [sv, sv2].forEach(function (b) { if (b) b.disabled = state.busy || !dirty; });
    var ra = $('#st-reset-all'); if (ra) ra.disabled = state.busy;
    // tab badges
    B.sections.forEach(function (s) {
      var t = document.getElementById('st-tab-' + s.id); if (!t) return;
      var c = t.querySelector('.tab-count'), n = editedCount(s);
      if (n) { if (!c) { c = document.createElement('span'); c.className = 'tab-count'; c.title = 'عناصر معدّلة عن الأصل'; t.appendChild(c); } c.textContent = n; }
      else if (c) c.remove();
    });
  }

  /* ----------------------------------------------------------------- validation (mirror of the server; the server is authoritative) */
  function validLink(s, max) { /* mirror of SiteTexts::validLink */
    if (!s || s.length > max || /[\s\x00-\x1F\x7F\\"'<>`]/.test(s)) return false;
    if (s.charAt(0) === '#') return true;
    if (s.charAt(0) === '/') return s.indexOf('//') !== 0;
    if (/^https?:\/\/[^\/?#]+/i.test(s)) return true;
    if (/^mailto:[^\s@?#]+@[^\s@?#]+(\?\S*)?$/i.test(s)) return true;
    return /^tel:\+?[0-9][0-9().\-]{2,29}$/i.test(s);
  }
  function cleanLen(v) { return plain(v).length; }
  function validateField(f, v) {
    var lab = '«' + f.label + '»', s = String(v == null ? '' : v);
    if (f.type === 'url') { s = s.trim(); if (!s) return f.optional ? '' : 'حقل ' + lab + ' مطلوب.'; return /^https:\/\/[^\s]+$/i.test(s) && s.length <= f.max ? '' : 'حقل ' + lab + ' يجب أن يكون رابطاً صالحاً يبدأ بـ https://'; }
    if (f.type === 'link') { s = s.trim(); if (!s) return f.optional ? '' : 'حقل ' + lab + ' مطلوب.'; return validLink(s, f.max) ? '' : 'حقل ' + lab + ' يجب أن يكون مساراً داخلياً يبدأ بـ / (مثل /news) أو رابطاً يبدأ بـ https:// أو http:// أو # أو mailto: أو tel: (بدون مسافات).'; }
    if (f.type === 'toggle') return s === '0' || s === '1' ? '' : 'قيمة ' + lab + ' غير صالحة.';
    if (f.type === 'embed') { s = s.trim(); if (!s) return ''; return /^(https:\/\/www\.google\.com\/maps\/embed|https:\/\/www\.openstreetmap\.org\/export\/embed\.html|<iframe)/i.test(s) ? '' : 'رابط الخريطة المضمّنة غير صالح: يجب أن يكون رابط تضمين من خرائط Google أو OpenStreetMap.'; }
    if (f.type === 'image') return s.trim() ? '' : 'اختر صورة (ارفع صورة أو استعد الافتراضية).';
    var n = cleanLen(s);
    if (!n) return f.optional ? '' : 'حقل ' + lab + ' مطلوب.';
    return n > f.max ? 'حقل ' + lab + ' يجب ألا يتجاوز ' + f.max + ' حرفاً.' : '';
  }
  function validateAll() {
    var errs = {}, first = null;
    function mark(sec, ek, msg, open) { errs[ek] = msg; if (!first) first = { tab: sec, ek: ek, open: open || null }; }
    B.sections.forEach(function (sec) {
      var s = sectionKeys(sec);
      s.keys.forEach(function (k) { var m = validateField(B.fields[k], state.text[k]); if (m) mark(sec.id, 't:' + k, m); });
      s.lists.forEach(function (lk) {
        var spec = B.listSpecs[lk], items = state.lists[lk] || [], vis = 0;
        if (items.length > spec.max) mark(sec.id, 'L:' + lk, 'قائمة «' + spec.label + '» يجب ألا تتجاوز ' + spec.max + ' عناصر.');
        items.forEach(function (it) {
          if (it.visible) vis++;
          spec.fields.forEach(function (f) {
            var m = f.type === 'icon' ? (iconName(it[f.k]) ? '' : 'اختر أيقونة من القائمة.') : validateField(f, it[f.k]);
            if (m) mark(sec.id, 'l:' + lk + ':' + it.id + ':' + f.k, m, lk + '|' + it.id);
          });
        });
        if (spec.min > 0 && vis < spec.min && !errs['L:' + lk]) mark(sec.id, 'L:' + lk, 'يجب أن يبقى عنصر واحد ظاهر على الأقل في «' + spec.label + '».');
      });
    });
    return { errs: errs, first: first };
  }
  /* server error keys: "text.<key>" and "lists.<list>.<index>.<field>" / "lists.<list>" */
  function mapServerErrors(errors) {
    var out = {}, first = null;
    Object.keys(errors || {}).forEach(function (k) {
      var msg = errors[k] && errors[k][0] ? errors[k][0] : 'قيمة غير صالحة.';
      var ek = null, sec = null, open = null;
      if (k.indexOf('text.') === 0) { ek = 't:' + k.slice(5); sec = secOfKey(k.slice(5)); }
      else if (k.indexOf('lists.') === 0) {
        Object.keys(B.listSpecs).forEach(function (lk) {
          var p = 'lists.' + lk;
          if (k === p) { ek = 'L:' + lk; sec = secOfList(lk); }
          else if (k.indexOf(p + '.') === 0) {
            var m = k.slice(p.length + 1).split('.'), it = (state.lists[lk] || [])[parseInt(m[0], 10)];
            sec = secOfList(lk);
            if (it && m[1]) { ek = 'l:' + lk + ':' + it.id + ':' + m[1]; open = lk + '|' + it.id; }
            else ek = 'L:' + lk;
          }
        });
      }
      if (!ek) { ek = 'g:' + k; }
      out[ek] = msg;
      if (!first && sec) first = { tab: sec, ek: ek, open: open };
    });
    return { errs: out, first: first };
  }
  function secOfKey(k) { for (var i = 0; i < B.sections.length; i++) if (sectionKeys(B.sections[i]).keys.indexOf(k) >= 0) return B.sections[i].id; return null; }
  function secOfList(lk) { for (var i = 0; i < B.sections.length; i++) if (sectionKeys(B.sections[i]).lists.indexOf(lk) >= 0) return B.sections[i].id; return null; }

  function showErrors(r) {
    state.errs = r.errs;
    if (r.first) {
      state.tab = r.first.tab;
      if (r.first.open) state.open[r.first.open] = true;
    }
    renderTabs(); renderPanel();
    if (r.first) {
      var wrap = elPanel.querySelector('[data-ek="' + r.first.ek.replace(/"/g, '\\"') + '"]');
      if (wrap) {
        wrap.scrollIntoView({ block: 'center', behavior: U.reduceMotion ? 'auto' : 'smooth' });
        var inp = wrap.querySelector('input,textarea,button'); if (inp) inp.focus({ preventScroll: true });
      }
    }
  }

  /* ----------------------------------------------------------------- server calls */
  function applyServer(data) {
    state.text = clone(data.text); state.lists = clone(data.lists);
    state.snap = JSON.stringify({ text: state.text, lists: state.lists });
    state.errs = {}; state.pick = '';
    // keep open items that still exist
    var ex = {}; Object.keys(state.lists).forEach(function (lk) { state.lists[lk].forEach(function (it) { ex[lk + '|' + it.id] = 1; }); });
    Object.keys(state.open).forEach(function (k) { if (!ex[k]) delete state.open[k]; });
    renderTabs(); renderPanel();
  }

  function save() {
    if (!CAN || state.busy || !isDirty()) return;
    var v = validateAll();
    if (v.first) { showErrors(v); U.toast('راجع الحقول المطلوبة', { text: 'بعض الحقول تحتاج تصحيحاً قبل الحفظ.', tone: 'danger', icon: 'error' }); announce('بعض الحقول تحتاج تصحيحاً قبل الحفظ.'); return; }
    state.busy = true; refreshStatus();
    DB.api('PUT', '/admin/site-texts', { text: state.text, lists: state.lists }).then(function (r) {
      state.busy = false;
      applyServer(r.data);
      U.toast('تم حفظ نصوص الموقع', { text: 'التغييرات ظاهرة الآن في الموقع (قد تحتاج الصفحات المفتوحة إلى تحديث).' });
    }).catch(function (e) {
      state.busy = false;
      if (e && e.status === 422) { showErrors(mapServerErrors(e.errors)); DB.fail(e, 'تعذّر الحفظ'); }
      else { refreshStatus(); DB.fail(e, 'تعذّر الحفظ'); }
    });
  }

  function resetScope(scope, label) {
    if (!CAN || state.busy) return;
    var dirty = isDirty();
    U.confirm({
      title: 'استعادة ' + label + '؟',
      text: 'ستعود النصوص إلى صيغتها الأصلية وتُطبَّق على الموقع فوراً.' + (dirty ? ' ستُفقد أيضاً أي تعديلات غير محفوظة في هذه الصفحة.' : ''),
      confirmLabel: 'نعم، استعد الأصل', cancelLabel: 'إلغاء', tone: 'warn', icon: 'restart_alt'
    }).then(function (ok) {
      if (!ok) return;
      state.busy = true; refreshStatus();
      DB.api('PUT', '/admin/site-texts/reset', { scope: scope }).then(function (r) {
        state.busy = false; applyServer(r.data);
        U.toast('تمت الاستعادة', { text: 'عادت ' + label + ' إلى النص الأصلي.' });
      }).catch(function (e) { state.busy = false; refreshStatus(); DB.fail(e, 'تعذّرت الاستعادة'); });
    });
  }

  /* ----------------------------------------------------------------- events */
  function setErrFor(ek, msg) {
    if (msg) state.errs[ek] = msg; else delete state.errs[ek];
    var w = elPanel.querySelector('[data-ek="' + ek.replace(/"/g, '\\"') + '"]'); if (!w) return;
    var p = w.querySelector('.st-err'); if (p) { p.textContent = msg || ''; p.hidden = !msg; }
    w.classList.toggle('has-error', !!msg);
    var i = w.querySelector('input,textarea'); if (i) { if (msg) i.setAttribute('aria-invalid', 'true'); else i.removeAttribute('aria-invalid'); }
  }

  function onInput(e) {
    var el = e.target; if (!CAN || !el.matches('input,textarea')) return;
    var k = el.getAttribute('data-t'), lk = el.getAttribute('data-list'), val = el.value, ek, def, f;
    if (k) { state.text[k] = val; ek = 't:' + k; def = B.fields[k].default; f = B.fields[k]; }
    else if (lk) {
      var idx = itemByIdx(lk, el.getAttribute('data-item')); if (idx < 0) return;
      var fk = el.getAttribute('data-f'); state.lists[lk][idx][fk] = val; ek = 'l:' + lk + ':' + el.getAttribute('data-item') + ':' + fk;
      var d = defItem(lk, el.getAttribute('data-item')); def = d ? (d[fk] == null ? '' : d[fk]) : null;
      B.listSpecs[lk].fields.forEach(function (x) { if (x.k === fk) f = x; });
      // live summary of the item header
      var li = el.closest('.st-item'), b = li && li.querySelector('.st-item-main b');
      if (b) { var spec = B.listSpecs[lk], t = ''; spec.fields.forEach(function (x) { if (!t && x.type !== 'icon') t = plain(state.lists[lk][idx][x.k]); }); b.textContent = t || (spec.itemLabel + ' ' + (idx + 1)); }
    } else return;
    var c = elPanel.querySelector('[data-count="' + el.id + '"]'); if (c) { c.textContent = val.length + ' / ' + el.maxLength; c.classList.toggle('over', el.maxLength > 0 && val.length >= el.maxLength); }
    var w = el.closest('.st-f');
    if (w && def != null) { var ch = val !== def; w.classList.toggle('is-changed', ch); var rb = w.querySelector('.st-restore'); if (rb) rb.hidden = !ch; }
    if (state.errs[ek] && f && !validateField(f, val)) setErrFor(ek, '');
    refreshStatus();
  }

  function onChange(e) {
    var el = e.target; if (!CAN || !el.matches('textarea.st-ltr')) return;
    var m = /\bsrc\s*=\s*(["'])(.*?)\1/i.exec(el.value);
    if (/<iframe/i.test(el.value) && m) { // pasted <iframe> code -> keep only its address
      var tmp = document.createElement('textarea'); tmp.innerHTML = m[2]; el.value = tmp.value.trim();
      var k = el.getAttribute('data-t'); if (k) { state.text[k] = el.value; setErrFor('t:' + k, ''); refreshStatus(); }
    }
  }

  function doRestore(btn) {
    var k = btn.getAttribute('data-t'), lk = btn.getAttribute('data-list');
    if (k) state.text[k] = B.fields[k].default;
    else if (lk) {
      var id = btn.getAttribute('data-item'), idx = itemByIdx(lk, id), d = defItem(lk, id), fk = btn.getAttribute('data-f');
      if (idx < 0 || !d) return; state.lists[lk][idx][fk] = d[fk] == null ? '' : d[fk];
    }
    var ek = k ? 't:' + k : 'l:' + lk + ':' + btn.getAttribute('data-item') + ':' + btn.getAttribute('data-f'); delete state.errs[ek];
    renderTabs(); renderPanel();
  }

  function onClick(e) {
    var b = e.target.closest('[data-act]'); if (!b || !elPanel.contains(b)) return;
    var act = b.getAttribute('data-act'), lk = b.getAttribute('data-list'), id = b.getAttribute('data-item');
    if (act === 'toggle') { var key = lk + '|' + id; state.open[key] = !state.open[key]; renderPanel(); var nb = elPanel.querySelector('[data-act="toggle"][data-item="' + id + '"][data-list="' + lk + '"]'); if (nb) nb.focus({ preventScroll: true }); return; }
    if (!CAN) return;
    if (act === 'restore') { doRestore(b); return; }
    if (act === 'reset-tab') { var s = secById(state.tab); resetScope(s.id, 'نصوص قسم «' + s.label + '»'); return; }
    if (act === 'pick-toggle') { var pid = b.getAttribute('data-pid'); state.pick = state.pick === pid ? '' : pid; renderPanel(); var again = elPanel.querySelector('[data-act="pick-toggle"][data-pid="' + pid.replace(/"/g, '\\"') + '"]'); if (again) again.focus({ preventScroll: true }); return; }
    if (act === 'pick') {
      var idx = itemByIdx(lk, id); if (idx < 0) return;
      state.lists[lk][idx][b.getAttribute('data-f')] = b.getAttribute('data-v'); delete state.errs['l:' + lk + ':' + id + ':' + b.getAttribute('data-f')];
      state.pick = ''; renderTabs(); renderPanel();
      var pt = elPanel.querySelector('[data-act="pick-toggle"][data-pid="' + (lk + '|' + id + '|' + b.getAttribute('data-f')).replace(/"/g, '\\"') + '"]'); if (pt) pt.focus({ preventScroll: true });
      return;
    }
    if (act === 'up' || act === 'down') {
      var i = itemByIdx(lk, id), j = act === 'up' ? i - 1 : i + 1, a = state.lists[lk];
      if (i < 0 || j < 0 || j >= a.length) return;
      var t = a[i]; a[i] = a[j]; a[j] = t; renderTabs(); renderPanel();
      var nb2 = elPanel.querySelector('[data-act="' + act + '"][data-item="' + id + '"][data-list="' + lk + '"]:not([disabled])') || elPanel.querySelector('[data-act="' + (act === 'up' ? 'down' : 'up') + '"][data-item="' + id + '"][data-list="' + lk + '"]');
      if (nb2) nb2.focus({ preventScroll: true });
      announce('تم نقل العنصر إلى الموضع ' + (j + 1));
      return;
    }
    if (act === 'add') {
      var spec = B.listSpecs[lk], arr = state.lists[lk]; if (arr.length >= spec.max) return;
      var it = { id: newId(), visible: true }, ic = B.listDefaults[lk] && B.listDefaults[lk][0] ? B.listDefaults[lk][0] : {};
      spec.fields.forEach(function (f) { it[f.k] = f.type === 'icon' ? (ic[f.k] || Object.keys(B.icons)[0]) : ''; });
      arr.push(it); state.open[lk + '|' + it.id] = true; renderTabs(); renderPanel();
      var first = elPanel.querySelector('[data-item="' + it.id + '"] .st-item-body input,[data-item="' + it.id + '"] .st-item-body textarea');
      if (first) { first.scrollIntoView({ block: 'center' }); first.focus({ preventScroll: true }); }
      announce('أُضيف عنصر جديد');
      return;
    }
    if (act === 'del') {
      var spec2 = B.listSpecs[lk], ix = itemByIdx(lk, id); if (ix < 0) return;
      U.confirm({ title: 'حذف ' + spec2.itemLabel + '؟', text: 'سيُحذف هذا العنصر من القائمة عند الحفظ. يمكنك التراجع قبل الحفظ بزر «تراجع عن التغييرات».', confirmLabel: 'نعم، احذف', cancelLabel: 'إلغاء', tone: 'danger' }).then(function (ok) {
        if (!ok) return; var n = itemByIdx(lk, id); if (n < 0) return;
        state.lists[lk].splice(n, 1); delete state.open[lk + '|' + id]; renderTabs(); renderPanel();
      });
      return;
    }
    if (act === 'list-restore') {
      U.confirm({ title: 'استعادة القائمة الأصلية؟', text: 'ستعود عناصر هذه القائمة وترتيبها إلى الأصل في هذه الصفحة، ويلزم الضغط على «حفظ التغييرات» لتطبيق ذلك على الموقع.', confirmLabel: 'نعم، استعد', cancelLabel: 'إلغاء', tone: 'warn', icon: 'undo' }).then(function (ok) {
        if (!ok) return; state.lists[lk] = clone(B.listDefaults[lk]);
        Object.keys(state.errs).forEach(function (k) { if (k.indexOf('l:' + lk + ':') === 0 || k === 'L:' + lk) delete state.errs[k]; });
        renderTabs(); renderPanel();
      });
      return;
    }
    if (act === 'img-up') { uploadImage(b.getAttribute('data-ek')); return; }
  }

  function uploadImage(ek) {
    var k = ek.slice(2), inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/jpeg,image/png,image/webp,image/gif';
    inp.addEventListener('change', function () {
      var file = inp.files && inp.files[0]; if (!file) return;
      DB.upload(file, '/admin/site-texts/image', B.image_max_mb).then(function (d) {
        state.text[k] = d.path; delete state.errs[ek]; renderTabs(); renderPanel();
        U.toast('تم رفع الصورة', { text: 'اضغط «حفظ التغييرات» لتطبيقها على الموقع.' });
      }).catch(function (e) { DB.fail(e, 'تعذّر رفع الصورة'); });
    });
    inp.click();
  }

  /* ----------------------------------------------------------------- init */
  function selectTab(id) {
    state.tab = id; state.pick = ''; renderTabs(); renderPanel();
    try { history.replaceState(null, '', '#' + id); } catch (e) { /* ignore */ }
  }
  elTabs.addEventListener('click', function (e) { var t = e.target.closest('[data-tab]'); if (t) { selectTab(t.getAttribute('data-tab')); } });
  elTabs.addEventListener('keydown', function (e) {
    var ids = B.sections.map(function (s) { return s.id; }), i = ids.indexOf(state.tab), n = null;
    if (e.key === 'ArrowLeft') n = ids[(i + 1) % ids.length]; else if (e.key === 'ArrowRight') n = ids[(i - 1 + ids.length) % ids.length];
    else if (e.key === 'Home') n = ids[0]; else if (e.key === 'End') n = ids[ids.length - 1];
    if (n) { e.preventDefault(); selectTab(n); var t = document.getElementById('st-tab-' + n); if (t) t.focus(); }
  });
  elPanel.addEventListener('input', onInput);
  elPanel.addEventListener('change', onChange);
  elPanel.addEventListener('click', onClick);
  document.addEventListener('switch', function (e) {
    var sw = e.target.closest('.switch[data-item],.switch[data-t]'); if (!sw || !elPanel.contains(sw)) return;
    var tk = sw.getAttribute('data-t');
    if (tk) { // on / off field (type "toggle")
      if (!CAN || !B.fields[tk]) return;
      state.text[tk] = e.detail && e.detail.on ? '1' : '0'; delete state.errs['t:' + tk];
      renderTabs(); renderPanel();
      var tsw = document.getElementById(sw.id); if (tsw) tsw.focus({ preventScroll: true });
      announce(state.text[tk] === '1' ? 'الصندوق ظاهر' : 'الصندوق مخفي');
      return;
    }
    if (!CAN) { sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') === 'true' ? 'false' : 'true'); return; }
    var lk = sw.getAttribute('data-list'), idx = itemByIdx(lk, sw.getAttribute('data-item')); if (idx < 0) return;
    state.lists[lk][idx].visible = !!(e.detail && e.detail.on);
    renderTabs(); renderPanel();
    var nb = elPanel.querySelector('.switch[data-item="' + sw.getAttribute('data-item') + '"][data-list="' + lk + '"]'); if (nb) nb.focus({ preventScroll: true });
  });
  $('#st-save').addEventListener('click', save);
  $('#st-save2').addEventListener('click', save);
  $('#st-reset-all').addEventListener('click', function () { resetScope('all', 'كل نصوص الموقع'); });
  $('#st-revert').addEventListener('click', function () {
    U.confirm({ title: 'التراجع عن التغييرات؟', text: 'ستُلغى كل التعديلات غير المحفوظة في هذه الصفحة.', confirmLabel: 'نعم، تراجع', cancelLabel: 'متابعة التعديل', tone: 'warn', icon: 'undo' }).then(function (ok) {
      if (!ok) return; var s = JSON.parse(state.snap); state.text = s.text; state.lists = s.lists; state.errs = {}; state.pick = ''; renderTabs(); renderPanel();
    });
  });
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); save(); }
  });
  window.addEventListener('beforeunload', function (e) { if (isDirty()) { e.preventDefault(); e.returnValue = ''; } });

  if (!CAN) { var ro = $('#st-readonly'); if (ro) ro.hidden = false; }
  renderTabs(); renderPanel();
})();
