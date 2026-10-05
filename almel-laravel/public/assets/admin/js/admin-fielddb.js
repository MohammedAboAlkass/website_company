/* «قصص الميدان» (/admin/stories) and «الأنشطة الميدانية» (/admin/activities): database backed lists.
   JSON API: /admin/stories, /admin/activities (+ reorder, publish/toggle, cover). Loaded after admin.js (window.__DB_PAGES). */
(function () {
  'use strict';
  var U = window.AdminUI, DB = window.AdminDB, DnD = window.AdminDnD;
  var PAGE = document.body.getAttribute('data-page');
  if (!U || !DB || !DnD || (PAGE !== 'stories' && PAGE !== 'activities')) return;

  var O = window.__FLD_OPTS || {};
  var esc = U.esc, icon = U.icon, toast = U.toast, normalize = U.normalize;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function can(k) { return !window.AdminPerm || window.AdminPerm.can(k); }
  function plain(v) { return window.AdminEditor ? window.AdminEditor.plain(v) : String(v == null ? '' : v); }
  function cut(s, n) { s = String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function opt(v, l, sel) { return '<option value="' + esc(v) + '"' + (sel ? ' selected' : '') + '>' + esc(l) + '</option>'; }
  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  function iconOpts(sel, ph) { return opt('', ph || 'بدون أيقونة', !sel) + (O.icons || []).map(function (t) { return opt(t.key, t.label, t.key === sel); }).join('') + (sel && !(O.icons || []).some(function (t) { return t.key === sel; }) ? opt(sel, sel, true) : ''); }

  /* ---------- page configs ---------- */
  var CFG = {
    stories: {
      base: '/admin/stories', mod: 'stories', publishKey: 'stories.publish', publishUrl: function (id) { return '/admin/stories/' + id + '/publish'; },
      the: 'القصة', add: 'قصة جديدة', editTitle: 'تعديل القصة', emptyText: 'أضف شهادة جديدة لتظهر في قسم «قصص من الميدان».', nameKey: 'person_name',
      title: function (i) { return i.person_name; }, sub: function (i) { return i.person_role || cut(plain(i.quote), 100); },
      tag: function (i) { return i.tag_label ? { icon: i.tag_icon || 'sell', text: i.tag_label } : null; }, thumb: function (i) { return i.image ? i.image.url : null; }, thumbIcon: 'format_quote',
      search: function (i) { return [i.person_name, i.person_role, i.tag_label, plain(i.quote)].join(' '); },
      stats: function (a) { var v = a.filter(function (x) { return x.is_published; }).length; return [['إجمالي القصص', a.length], ['ظاهرة في الموقع', v], ['مخفية', a.length - v], ['بصور', a.filter(function (x) { return x.image; }).length]]; },
      fields: [
        { k: 'person_name', label: 'اسم صاحب القصة', type: 'text', req: true, max: 100, ph: 'مثال: أم محمد' },
        { k: 'person_role', label: 'الموقع أو الصفة', type: 'text', opt: true, max: 150, ph: 'مثال: نازحة من جباليا إلى دير البلح' },
        { k: 'tag_label', label: 'الوسم', type: 'text', opt: true, max: 60, ph: 'مثال: السلال الغذائية' },
        { k: 'tag_icon', label: 'أيقونة الوسم', type: 'icon' },
        { k: 'quote', label: 'نص الشهادة', type: 'rich', req: true, max: O.quoteMax || 700, rows: 5 },
        { k: 'image', label: 'صورة صاحب القصة', type: 'image', altKey: 'image_alt' }
      ]
    },
    activities: {
      base: '/admin/activities', mod: 'activities', publishKey: 'activities.edit', publishUrl: function (id) { return '/admin/activities/' + id + '/toggle'; },
      the: 'النشاط', add: 'نشاط جديد', editTitle: 'تعديل النشاط', emptyText: 'أضف نشاطاً ميدانياً موثّقاً ليظهر في قسم «الأنشطة الميدانية».', nameKey: 'title',
      title: function (i) { return i.title; }, sub: function (i) { return [i.date_label, i.place].filter(Boolean).join(' • ') + (i.stat_label ? ' — ' + i.stat_label : ''); },
      tag: function (i) { return i.badge_text ? { icon: 'sell', text: i.badge_text } : null; }, thumb: function (i) { return i.image ? i.image.url : null; }, thumbIcon: 'event_available',
      search: function (i) { return [i.title, i.place, i.badge_text, i.stat_label, i.date_label, i.project, plain(i.description)].join(' '); },
      stats: function (a) { var v = a.filter(function (x) { return x.is_published; }).length; var pl = {}; a.forEach(function (x) { if (x.place) pl[x.place] = 1; }); return [['إجمالي الأنشطة', a.length], ['ظاهرة في الموقع', v], ['مخفية', a.length - v], ['أماكن مختلفة', Object.keys(pl).length]]; },
      fields: [
        { k: 'title', label: 'عنوان النشاط', type: 'text', req: true, max: 120, ph: 'مثال: توزيع 10,000 طرد شتوي' },
        { k: 'description', label: 'وصف النشاط', type: 'rich', opt: true, max: O.descMax || 500, rows: 4, storedMax: O.descMax || 500 },
        { k: 'badge_text', label: 'نص الشارة على الصورة', type: 'text', opt: true, max: 60, half: true },
        { k: 'badge_tone', label: 'لون الشارة', type: 'select', options: O.tones || [], blank: 'بدون لون', half: true },
        { k: 'date_label', label: 'التاريخ (نص يظهر على البطاقة)', type: 'text', opt: true, max: 60, ph: 'مثال: نوفمبر - ديسمبر 2024', half: true },
        { k: 'activity_date', label: 'التاريخ الفعلي (للترتيب)', type: 'date', opt: true, half: true },
        { k: 'place', label: 'المكان', type: 'text', opt: true, max: 100, half: true },
        { k: 'governorate_id', label: 'المحافظة', type: 'select', options: (O.governorates || []).map(function (g) { return { key: String(g.id), label: g.label }; }), blank: '— غير محددة —', half: true },
        { k: 'stat_label', label: 'الإحصائية الرئيسية', type: 'text', opt: true, max: 60, ph: 'مثال: 45,200 مستفيد', half: true },
        { k: 'stat_icon', label: 'أيقونة الإحصائية', type: 'icon', half: true },
        { k: 'link_label', label: 'نص الرابط الإضافي (يظهر في صفحة النشاط)', type: 'text', opt: true, max: 60, half: true },
        { k: 'link_url', label: 'الرابط الإضافي (يظهر في صفحة النشاط)', type: 'text', opt: true, max: 500, ph: 'https://…', dir: 'ltr', half: true },
        { k: 'project_id', label: 'المشروع المرتبط', type: 'select', options: (O.projects || []).map(function (p) { return { key: String(p.id), label: p.label }; }), blank: '— بدون مشروع —' },
        { k: 'image', label: 'صورة النشاط', type: 'image', altKey: 'image_alt' }
      ]
    }
  };
  var C = CFG[PAGE];

  ready(function () {
    var list = $('#fd-list'), drawer = $('#fd-drawer'), items = [], loaded = false, failed = false;
    var st = { q: '', f: 'all' }, editing = null, flashId = null, dragId = null, saving = false;
    var live = document.createElement('p'); live.className = 'sr-only'; live.setAttribute('aria-live', 'assertive'); $('#main').appendChild(live);
    function announce(t) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 30); }
    function byId(id) { for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i]; return null; }
    function filtering() { return !!(normalize(st.q) || st.f !== 'all'); }
    function matches(it) {
      if (st.f === 'visible' && !it.is_published) return false;
      if (st.f === 'hidden' && it.is_published) return false;
      var q = normalize(st.q); return !q || normalize(C.search(it)).indexOf(q) > -1;
    }
    function flashSaved(text) { var el = $('#fd-saved'); if (!el) return; el.innerHTML = icon('cloud_done') + '<span>' + esc(text || 'حُفظت التغييرات الآن') + '</span>'; el.classList.remove('is-pulse'); void el.offsetWidth; el.classList.add('is-pulse'); }

    /* ---------- load + render ---------- */
    function load() {
      return DB.api('GET', C.base).then(function (r) { items = r.data || []; loaded = true; failed = false; render(); },
        function (e) { failed = true; loaded = false; render(); DB.fail(e, 'تعذّر تحميل البيانات'); });
    }
    function thumbHTML(it) {
      var u = C.thumb(it);
      return u ? '<span class="ct-thumb" aria-hidden="true"><img src="' + esc(u) + '" alt="" loading="lazy"></span>' : '<span class="sec-ico tone-light" aria-hidden="true">' + icon(C.thumbIcon) + '</span>';
    }
    function rowHTML(it) {
      var pos = items.indexOf(it), n = items.length, off = filtering(), tg = C.tag(it), ttl = C.title(it);
      var canMove = can(C.mod + '.edit') && !off, canPub = can(C.publishKey), canDel = can(C.mod + '.delete'), canEdit = can(C.mod + '.edit');
      return '<li data-id="' + it.id + '" data-depth="0" class="sec-row ct-row' + (it.is_published ? '' : ' is-off') + (flashId === it.id ? ' is-dropped' : '') + '"><div class="sec-item">' +
        '<button type="button" class="dnd-handle" aria-label="سحب لإعادة ترتيب ' + esc(C.the) + ' «' + esc(cut(ttl, 40)) + '»، الموضع ' + (pos + 1) + ' من ' + n + '"' + (!canMove ? ' aria-disabled="true" disabled title="' + (off ? 'أزل البحث أو التصفية لإعادة الترتيب' : 'لا تملك صلاحية إعادة الترتيب') + '"' : '') + '>' + icon('drag_indicator') + '</button>' +
        '<span class="sec-num" aria-hidden="true">' + (pos + 1) + '</span>' + thumbHTML(it) +
        '<div class="sec-text"><strong>' + esc(cut(ttl, 90)) + '</strong><span class="sec-note">' + esc(C.sub(it)) + '</span></div>' +
        (tg ? '<span class="tag ct-tag">' + icon(tg.icon) + esc(cut(tg.text, 28)) + '</span>' : '') +
        '<span class="sec-flag" aria-hidden="true">' + (it.is_published ? '' : icon('visibility_off') + 'مخفي') + '</span>' +
        (canEdit ? '<button type="button" class="btn btn-ghost btn-sm" data-edit="' + it.id + '" aria-label="تعديل ' + esc(C.the) + ' «' + esc(cut(ttl, 40)) + '»">' + icon('edit') + '<span>تعديل</span></button>' : '') +
        '<button type="button" class="switch" role="switch" data-vis="' + it.id + '" aria-checked="' + it.is_published + '"' + (canPub ? '' : ' disabled aria-disabled="true" title="لا تملك صلاحية تغيير الظهور"') + ' aria-label="إظهار ' + esc(C.the) + ' «' + esc(cut(ttl, 40)) + '» في الموقع"></button>' +
        '<div class="sec-move"><button type="button" class="icon-btn sm" data-up="' + it.id + '" aria-label="تحريك لأعلى"' + (!canMove || pos === 0 ? ' disabled' : '') + '>' + icon('arrow_upward') + '</button>' +
        '<button type="button" class="icon-btn sm" data-down="' + it.id + '" aria-label="تحريك لأسفل"' + (!canMove || pos === n - 1 ? ' disabled' : '') + '>' + icon('arrow_downward') + '</button></div>' +
        (canDel ? '<button type="button" class="icon-btn sm ct-del" data-del="' + it.id + '" aria-label="حذف ' + esc(C.the) + ' «' + esc(cut(ttl, 40)) + '»" title="حذف">' + icon('delete') + '</button>' : '') +
        '</div></li>';
    }
    function render() {
      var shown = items.filter(matches);
      $('#fd-count').textContent = loaded ? shown.length + ' من ' + items.length : '';
      $('#fd-stats').innerHTML = loaded ? C.stats(items).map(function (s) { return '<div><dt>' + esc(s[0]) + '</dt><dd><b>' + esc(s[1]) + '</b></dd></div>'; }).join('') : '';
      if (!loaded) {
        list.classList.remove('sec-list');
        list.innerHTML = '<li class="ct-empty">' + (failed ? U.emptyState('cloud_off', 'تعذّر تحميل البيانات', 'تحقق من الاتصال ثم أعد المحاولة.', '<button type="button" class="btn btn-primary" data-retry>' + icon('refresh') + 'إعادة المحاولة</button>') : U.emptyState('hourglass_top', 'جارٍ التحميل…', 'لحظات من فضلك.', '')) + '</li>';
        var rt = $('[data-retry]', list); if (rt) rt.addEventListener('click', load);
        return;
      }
      if (!shown.length) {
        list.classList.remove('sec-list');
        if (!items.length) {
          list.innerHTML = '<li class="ct-empty">' + U.emptyState('inbox', 'لا توجد عناصر بعد', C.emptyText, can(C.mod + '.create') ? '<button type="button" class="btn btn-primary" data-empty-add>' + icon('add') + esc(C.add) + '</button>' : '') + '</li>';
          var ea = $('[data-empty-add]', list); if (ea) ea.addEventListener('click', function () { openDrawer(null); });
        } else {
          list.innerHTML = '<li class="ct-empty">' + U.emptyState('search_off', 'لا توجد نتائج مطابقة', 'غيّر كلمات البحث أو عامل التصفية.', '<button type="button" class="btn btn-secondary" data-clear>' + icon('filter_alt_off') + 'مسح البحث</button>') + '</li>';
          $('[data-clear]', list).addEventListener('click', function () { st.q = ''; st.f = 'all'; $('#fd-search').value = ''; $('#fd-filter').value = 'all'; render(); $('#fd-search').focus(); });
        }
        return;
      }
      list.classList.add('sec-list');
      list.innerHTML = shown.map(rowHTML).join('');
      flashId = null;
    }

    /* ---------- actions ---------- */
    function saveOrder(prev, id, how) {
      return DB.api('POST', C.base + '/reorder', { ids: items.map(function (x) { return x.id; }) }).then(function () {
        flashSaved('حُفظ الترتيب الآن');
        var it = byId(id); announce('نُقل «' + cut(C.title(it), 40) + '» إلى الموضع ' + (items.indexOf(it) + 1) + ' من ' + items.length);
        if (how === 'drag') toast('تم تغيير الترتيب', { text: 'الموضع الجديد: ' + (items.indexOf(it) + 1) + ' من ' + items.length, icon: 'reorder', duration: 2400 });
      }, function (e) { items = prev; render(); DB.fail(e, 'تعذّر حفظ الترتيب'); });
    }
    function move(id, to, how) {
      var from = items.findIndex(function (x) { return x.id === id; });
      if (from < 0 || to < 0 || to >= items.length || to === from) return false;
      var prev = items.slice(); var it = items.splice(from, 1)[0]; items.splice(to, 0, it);
      flashId = id; render(); saveOrder(prev, id, how); return true;
    }
    list.addEventListener('click', function (e) {
      var ed = e.target.closest('[data-edit]'); if (ed) { openDrawer(byId(+ed.getAttribute('data-edit')), ed); return; }
      var del = e.target.closest('[data-del]'); if (del) { removeItem(byId(+del.getAttribute('data-del'))); return; }
      var b = e.target.closest('[data-up],[data-down]'); if (!b || b.disabled) return;
      var up = b.hasAttribute('data-up'), id = +b.getAttribute(up ? 'data-up' : 'data-down');
      var from = items.findIndex(function (x) { return x.id === id; });
      if (move(id, from + (up ? -1 : 1))) {
        var nb = $('[data-' + (up ? 'up' : 'down') + '="' + id + '"]', list);
        if (nb && nb.disabled) nb = $('li[data-id="' + id + '"] .dnd-handle', list);
        if (nb) nb.focus();
      }
    });
    list.addEventListener('keydown', function (e) {
      var h = e.target.closest('.dnd-handle'); if (!h || h.disabled) return;
      var id = +h.closest('li').getAttribute('data-id'), from = items.findIndex(function (x) { return x.id === id; }), to = null;
      if (e.key === 'ArrowUp') to = from - 1; else if (e.key === 'ArrowDown') to = from + 1; else if (e.key === 'Home') to = 0; else if (e.key === 'End') to = items.length - 1;
      if (to === null) return; e.preventDefault();
      if (move(id, to)) { var nh = $('li[data-id="' + id + '"] .dnd-handle', list); if (nh) nh.focus(); }
    });
    document.addEventListener('switch', function (e) {
      var sw = e.target; if (!sw.hasAttribute || !sw.hasAttribute('data-vis') || !list.contains(sw)) return;
      var it = byId(+sw.getAttribute('data-vis')); if (!it) return;
      var on = e.detail.on;
      DB.api('PATCH', C.publishUrl(it.id), { is_published: on }).then(function (r) {
        Object.assign(it, r.data || { is_published: on }); render(); flashSaved();
        var n = $('[data-vis="' + it.id + '"]', list); if (n) n.focus();
        announce((on ? 'أصبح ظاهراً: ' : 'أُخفي: ') + cut(C.title(it), 40));
        toast(on ? 'أصبح العنصر ظاهراً' : 'تم إخفاء العنصر', { text: cut(C.title(it), 60), icon: on ? 'visibility' : 'visibility_off', tone: 'info', duration: 2400 });
      }, function (er) { render(); DB.fail(er, 'تعذّر تغيير الظهور'); });
    });
    DnD.Sortable(list, {
      maxDepth: 0,
      onStart: function (r) { dragId = +r.id; },
      onDrop: function (r) { var id = dragId; dragId = null; if (!r.changed) { render(); return; } move(id, r.index, 'drag'); var h = $('li[data-id="' + id + '"] .dnd-handle', list); if (h) h.focus({ preventScroll: true }); },
      onCancel: function () { dragId = null; render(); announce('أُلغي السحب'); }
    });
    function removeItem(it) {
      if (!it) return;
      U.confirmDelete(C.the, '«' + cut(C.title(it), 70) + '» — سيُحذف من الموقع ولوحة التحكم (حذف مرن يحفظه في قاعدة البيانات).').then(function (ok) {
        if (!ok) return;
        DB.api('DELETE', C.base + '/' + it.id).then(function () { items = items.filter(function (x) { return x !== it; }); render(); flashSaved(); toast('تم الحذف', { text: cut(C.title(it), 60), tone: 'danger' }); },
          function (e) { DB.fail(e, 'تعذّر الحذف'); if (e.status === 404) load(); });
      });
    }

    /* ---------- toolbar ---------- */
    var searchT;
    $('#fd-search').addEventListener('input', function () { var v = this.value; clearTimeout(searchT); searchT = setTimeout(function () { st.q = v; render(); }, 120); });
    $('#fd-filter').addEventListener('change', function () { st.f = this.value; render(); });
    $('#fd-add').addEventListener('click', function () { openDrawer(null, this); });

    /* ---------- drawer ---------- */
    function fieldHTML(f, v, prefix) {
      var id = prefix + '-' + f.k, val = v == null ? '' : v;
      var counter = f.max && (f.type === 'text' || f.type === 'rich') ? '<span class="counter"' + (f.type === 'rich' ? ' id="' + id + '-counter"' : ' data-counter="' + id + '"') + ' aria-live="polite">0 / ' + f.max + '</span>' : '';
      var h = '<div class="field' + (f.half ? ' half' : '') + '"><label class="label" for="' + id + '"><span>' + esc(f.label) + (f.req ? ' <span class="req" aria-hidden="true">*</span>' : f.opt ? ' <span class="opt">اختياري</span>' : '') + '</span>' + counter + '</label>';
      var d = ' id="' + id + '" data-k="' + f.k + '" aria-describedby="' + id + '-err"';
      if (f.type === 'rich') h += '<textarea class="textarea" rows="' + (f.rows || 4) + '"' + d + ' data-rich style="min-height:0">' + esc(val) + '</textarea>';
      else if (f.type === 'select') h += '<select class="select"' + d + '>' + opt('', f.blank || '—', !val) + (f.options || []).map(function (o) { return opt(o.key, o.label, String(o.key) === String(val)); }).join('') + '</select>';
      else if (f.type === 'icon') h += '<select class="select"' + d + '>' + iconOpts(val) + '</select>';
      else if (f.type === 'date') h += '<input class="input" type="date" dir="ltr"' + d + ' value="' + esc(val) + '">';
      else if (f.type === 'image') return imageHTML(f, v, prefix);
      else h += '<input class="input"' + (f.dir ? ' dir="' + f.dir + '"' : '') + d + (f.max ? ' maxlength="' + f.max + '"' : '') + (f.ph ? ' placeholder="' + esc(f.ph) + '"' : '') + ' value="' + esc(val) + '">';
      return h + '<p class="error" id="' + id + '-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p></div>';
    }
    function imageHTML(f, it, prefix) {
      var id = prefix + '-' + f.k, url = it && it.image ? it.image.url : '';
      return '<div class="field"><span class="label" id="' + id + '-l"><span>' + esc(f.label) + ' <span class="opt">اختياري</span></span></span>' +
        '<div class="fd-img" id="' + id + '"><span class="fd-prev"><img alt="" src="' + esc(url) + '"' + (url ? '' : ' hidden') + '><span class="material-symbols-outlined" aria-hidden="true"' + (url ? ' hidden' : '') + '>image</span></span>' +
        '<div class="fd-img-actions"><label class="btn btn-secondary btn-sm"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" aria-labelledby="' + id + '-l">' + icon('upload') + '<span data-up-label>' + (url ? 'تغيير الصورة' : 'رفع صورة') + '</span></label>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-img-rm' + (url ? '' : ' hidden') + '>' + icon('delete') + 'إزالة</button></div></div>' +
        '<p class="hint" id="' + id + '-h">JPG أو PNG أو WebP — حتى ' + esc(O.maxMb || 10) + ' ميغابايت</p>' +
        '<p class="error" id="' + id + '-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p></div>' +
        '<div class="field"><label class="label" for="' + prefix + '-' + f.altKey + '"><span>النص البديل للصورة <span class="opt">اختياري</span></span></label><input class="input" id="' + prefix + '-' + f.altKey + '" data-k="' + f.altKey + '" maxlength="255" placeholder="وصف مختصر لما تُظهره الصورة" value="' + esc(it ? it[f.altKey] || '' : '') + '" aria-describedby="' + prefix + '-' + f.altKey + '-err"><p class="error" id="' + prefix + '-' + f.altKey + '-err" hidden><span class="material-symbols-outlined" aria-hidden="true">error</span><span></span></p></div>';
    }
    function setErr(form, key, msg) {
      var input = $('[data-k="' + key + '"]', form) || $('#fdf-' + key, form), e = $('#fdf-' + key + '-err', form);
      if (input) input.setAttribute('aria-invalid', 'true');
      if (e) { e.hidden = false; $('span:last-child', e).textContent = msg; }
      return input;
    }
    function clearErrs(form) { $$('[aria-invalid]', form).forEach(function (i) { i.removeAttribute('aria-invalid'); }); $$('.error', form).forEach(function (e) { e.hidden = true; }); }

    function openDrawer(it, trigger) {
      editing = it || null; saving = false;
      var vals = it || {};
      var canPub = can(C.publishKey);
      var pubOn = it ? !!it.is_published : true;
      drawer.innerHTML = '<form id="fdf" novalidate style="display:contents">' +
        '<div class="drawer-head"><div><h2 id="fdf-dt">' + esc(it ? C.editTitle : C.add) + '</h2><p id="fdf-ds">' + (it ? 'حدّث البيانات ثم احفظ التغييرات.' : 'أدخل البيانات لإضافتها إلى القائمة.') + '</p></div><button type="button" class="icon-btn" data-close-drawer aria-label="إغلاق">' + icon('close') + '</button></div>' +
        '<div class="drawer-body">' + C.fields.map(function (f) { return fieldHTML(f, vals[f.k] == null && f.k === 'governorate_id' ? '' : vals[f.k], 'fdf'); }).join('') +
        '<label class="fd-check"' + (canPub ? '' : ' aria-disabled="true"') + '><input type="checkbox" class="checkbox" id="fdf-is_published"' + (pubOn ? ' checked' : '') + (canPub ? '' : ' disabled') + '><span>ظاهر في الموقع' + (canPub ? '' : ' (يتطلب صلاحية النشر)') + '</span></label></div>' +
        '<div class="drawer-foot"><span class="save-state" id="fdf-state" aria-live="polite"></span><button type="button" class="btn btn-secondary" data-close-drawer>إلغاء</button><button type="submit" class="btn btn-primary" id="fdf-save">' + icon('save') + 'حفظ</button></div></form>';
      drawer.setAttribute('aria-labelledby', 'fdf-dt'); drawer.setAttribute('aria-describedby', 'fdf-ds');
      var form = $('#fdf', drawer), image = it && it.image ? { id: it.image.id, url: it.image.url } : null;
      if (it && C.fields.some(function (f) { return f.k === 'governorate_id'; }) && it.governorate_id) $('#fdf-governorate_id', form).value = String(it.governorate_id);
      if (it && it.project_id && $('#fdf-project_id', form)) $('#fdf-project_id', form).value = String(it.project_id);
      // counters for plain text inputs
      C.fields.forEach(function (f) {
        if (f.type === 'text' && f.max) { var inp = $('#fdf-' + f.k, form), c = $('[data-counter="fdf-' + f.k + '"]', form); var upd = function () { c.textContent = inp.value.length + ' / ' + f.max; c.classList.toggle('over', inp.value.length > f.max); }; inp.addEventListener('input', upd); upd(); }
        if (f.type === 'rich' && window.AdminEditor) window.AdminEditor.enhance($('#fdf-' + f.k, form), { compact: true, max: f.max, counter: 'fdf-' + f.k + '-counter' });
      });
      // image field
      var imgField = $('.fd-img', form);
      if (imgField) {
        var fi = $('input[type=file]', imgField), prev = $('img', imgField), ph = $('.material-symbols-outlined', imgField), rm = $('[data-img-rm]', imgField), lab = $('[data-up-label]', imgField);
        var show = function () { prev.hidden = !image; ph.hidden = !!image; rm.hidden = !image; lab.textContent = image ? 'تغيير الصورة' : 'رفع صورة'; if (image) prev.src = image.url; else prev.removeAttribute('src'); };
        fi.addEventListener('change', function () {
          var f = fi.files[0]; if (!f) return; var err = $('#fdf-image-err', form); err.hidden = true; $('#fdf-state', form).textContent = 'جارٍ رفع الصورة…';
          DB.upload(f, C.base + '/cover', O.maxMb).then(function (r) { image = { id: r.id, url: r.url }; show(); $('#fdf-state', form).textContent = ''; },
            function (e) { $('#fdf-state', form).textContent = ''; err.hidden = false; $('span:last-child', err).textContent = DB.firstError(e); });
          fi.value = '';
        });
        rm.addEventListener('click', function () { image = null; show(); });
      }
      form.addEventListener('submit', function (e) {
        e.preventDefault(); if (saving) return; clearErrs(form);
        var data = {}, errs = {};
        C.fields.forEach(function (f) {
          if (f.type === 'image') { data.image_media_id = image ? image.id : null; data[f.altKey] = $('#fdf-' + f.altKey, form).value.trim() || null; return; }
          var el = $('#fdf-' + f.k, form), v = el.value; if (f.type !== 'rich') v = v.trim();
          data[f.k] = v === '' ? null : v;
          if (f.type === 'select' && f.k.slice(-3) === '_id') data[f.k] = v === '' ? null : +v;
          var n = f.type === 'rich' ? plain(v).length : String(v).length;
          if (f.req && !n) errs[f.k] = [f.label + ' مطلوب.'];
          else if (f.max && n > f.max) errs[f.k] = ['الحد الأقصى ' + f.max + ' حرف.'];
          if (f.storedMax && v && String(v).length > f.storedMax) errs[f.k] = [(window.AdminEditor && window.AdminEditor.looksHtml(v) ? 'الوصف بعد التنسيق يتجاوز ' + f.storedMax + ' حرفاً مخزّنة. اختصر النص أو بسّط التنسيق.' : 'الوصف يجب ألا يتجاوز ' + f.storedMax + ' حرف.')];
        });
        if (PAGE === 'activities' && data.title && data.title.length < 5) errs.title = ['العنوان يجب أن يكون 5 أحرف على الأقل.'];
        if (PAGE === 'stories' && data.person_name && data.person_name.length < 2) errs.person_name = ['الاسم يجب أن يكون حرفين على الأقل.'];
        if (data.link_url && !/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(data.link_url)) errs.link_url = ['الرابط يجب أن يبدأ بـ https:// أو / أو #.'];
        data.is_published = $('#fdf-is_published', form).checked;
        if (!can(C.publishKey)) delete data.is_published;
        function showErrs(er) {
          var first = null; Object.keys(er).forEach(function (k) { var inp = setErr(form, k === 'image_media_id' ? 'image' : k, er[k][0]); if (!first && inp) first = inp; });
          if (first) { var tgt = first._edApi ? first : first; try { tgt.focus(); } catch (x) { /* hidden */ } }
        }
        if (Object.keys(errs).length) { showErrs(errs); toast('يرجى تصحيح الحقول المظللة', { tone: 'danger', icon: 'error' }); return; }
        saving = true; var btn = $('#fdf-save', form); btn.disabled = true; $('#fdf-state', form).textContent = 'جارٍ الحفظ…';
        var creating = !editing;
        DB.api(creating ? 'POST' : 'PUT', creating ? C.base : C.base + '/' + editing.id, data).then(function (r) {
          saving = false; U.Drawer.close(drawer);
          if (creating) { items.push(r.data); flashId = r.data.id; } else { var cur = byId(editing.id); if (cur) Object.assign(cur, r.data); flashId = editing.id; }
          render(); flashSaved(); toast(creating ? 'تمت الإضافة' : 'تم حفظ التغييرات', { text: cut(C.title(r.data), 60) });
        }, function (er) {
          saving = false; btn.disabled = false; $('#fdf-state', form).textContent = '';
          if (er.status === 422) { showErrs(er.errors || {}); toast('يرجى تصحيح الحقول المظللة', { text: DB.firstError(er), tone: 'danger', icon: 'error' }); }
          else DB.fail(er, 'تعذّر الحفظ');
        });
      });
      U.Drawer.open(drawer, { focus: '#fdf-' + C.fields[0].k, returnFocus: trigger });
    }

    load();
  });
})();
