/* =========================================================================
   الصفحة الرئيسية — /admin/homepage (قاعدة البيانات)
   Section manager of the public home page. Everything is stored in the database
   (settings key `home.sections`, rules: App\Support\HomeSections) and read by the site:
     • edit eyebrow / title / lead / button text of each section
     • drag & drop (Pointer Events via AdminDnD) + keyboard / buttons to reorder
     • show / hide switch per section
   Edits stay in memory until "حفظ التغييرات" (PUT /admin/homepage; unsaved marker, Ctrl+S, leave warning).
   "استعادة الافتراضي" asks with AdminUI.confirm, then DELETE /admin/homepage.
   Order / visibility are also mirrored to localStorage `almel-admin-home-sections` because the
   pages / menu editors read it for their section pickers.
   ========================================================================= */
(function () {
  'use strict';
  var BOOT = window.__HOMEPAGE;
  var LIMIT = (BOOT && BOOT.limits) || { eyebrow: 60, title: 120, lead: 300, button: 40 };
  var LABEL = (BOOT && BOOT.labels) || { eyebrow: 'العنوان الفرعي الصغير', title: 'العنوان الرئيسي', lead: 'النص التمهيدي', button: 'نص الزر' };
  var FIELD_ORDER = ['eyebrow', 'title', 'lead', 'button'];
  var OTHER = { 'hero': ['إعدادات الهيرو', '/admin/hero'], 'announcements': ['الإعلانات', '/admin/announcements'], 'appeal': ['نداء الإغاثة', '/admin/appeal'] };

  function start() {
    var UI = window.AdminUI, B = window.BUILDER_DATA, DnD = window.AdminDnD, DB = window.AdminDB;
    var list = document.getElementById('hp-list');
    if (!UI || !B || !DnD || !DB || !BOOT || !list) return;
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var esc = UI.esc, icon = UI.icon, toast = UI.toast;
    var KEY_SECTIONS = 'almel-admin-home-sections';
    var READONLY = !!(window.AdminPerm && !window.AdminPerm.can('homepage.edit'));
    var SEC = {}; B.sections.forEach(function (s) { SEC[s.id] = s; });
    var DEFAULTS = BOOT.defaults || {};
    function fieldsOf(id) { return FIELD_ORDER.filter(function (k) { return DEFAULTS[id] && DEFAULTS[id][k] !== undefined; }); }

    /* ---------- state ---------- */
    function norm(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
    function len(s) { return Array.from(String(s || '')).length; }
    function write(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); return true; } catch (e) { return false; } }
    function mirror() { write(KEY_SECTIONS, sections.map(function (s) { return { id: s.id, visible: s.visible }; })); }
    function sectionsFrom(d) {
      var hidden = d.hidden || [];
      return (d.order || []).filter(function (id) { return SEC[id]; }).map(function (id) { return { id: id, visible: hidden.indexOf(id) < 0 }; });
    }
    function titlesFrom(d) {
      var o = {};
      Object.keys(DEFAULTS).forEach(function (id) {
        o[id] = Object.assign({}, DEFAULTS[id]);
        var t = (d.text || {})[id] || {};
        Object.keys(DEFAULTS[id]).forEach(function (k) { if (typeof t[k] === 'string' && norm(t[k])) o[id][k] = norm(t[k]); });
      });
      return o;
    }
    function defaultSections() { return B.sections.map(function (s) { return { id: s.id, visible: true }; }); }
    function defaultTitles() { var o = {}; Object.keys(DEFAULTS).forEach(function (id) { o[id] = Object.assign({}, DEFAULTS[id]); }); return o; }
    /* only edited fields are sent / stored */
    function diffTitles(t) {
      var o = {};
      Object.keys(DEFAULTS).forEach(function (id) {
        Object.keys(DEFAULTS[id]).forEach(function (k) {
          var v = norm(t[id][k]);
          if (v && v !== DEFAULTS[id][k]) { o[id] = o[id] || {}; o[id][k] = v; }
        });
      });
      return o;
    }
    function payload() {
      return {
        order: sections.map(function (s) { return s.id; }),
        hidden: sections.filter(function (s) { return !s.visible; }).map(function (s) { return s.id; }),
        text: diffTitles(titles)
      };
    }
    function snapshot() { return JSON.stringify(payload()); }
    function isEdited(id) { var d = DEFAULTS[id]; return !!d && Object.keys(d).some(function (k) { return norm(titles[id][k]) !== d[k]; }); }
    function emptyFields() {
      var out = [];
      sections.forEach(function (s) { fieldsOf(s.id).forEach(function (k) { if (!norm(titles[s.id][k])) out.push({ id: s.id, k: k }); }); });
      return out;
    }
    function noteOf(id) { var t = titles[id]; return t && t.title ? t.title : SEC[id].note; }

    var sections = sectionsFrom(BOOT), titles = titlesFrom(BOOT);
    var saved = snapshot(), isSaved = !!BOOT.saved, busy = false;
    var open = {};
    var dragId = null;
    mirror();

    /* ---------- dirty state ---------- */
    function isDirty() { return snapshot() !== saved; }
    function syncState() {
      var dirty = isDirty(), s = $('#hp-state');
      s.classList.toggle('is-dirty', dirty);
      s.innerHTML = dirty ? '<span class="dirty-dot" aria-hidden="true"></span><span>تغييرات غير محفوظة</span>'
        : icon('cloud_done') + '<span>' + (isSaved ? 'محفوظة في قاعدة البيانات' : 'مطابقة للموقع الحالي (الافتراضي)') + '</span>';
      var sb = $('#hp-save');
      sb.classList.toggle('has-dot', dirty);
      sb.disabled = busy || READONLY;
      $('#hp-reset').disabled = busy || READONLY;
      var vis = sections.filter(function (x) { return x.visible; }).length, edited = sections.filter(function (x) { return isEdited(x.id); }).length;
      $('#hp-sub').textContent = sections.length + ' قسماً · ' + vis + ' ظاهر' + (sections.length - vis ? ' · ' + (sections.length - vis) + ' مخفي' : '') + (edited ? ' · ' + edited + ' بنصوص معدّلة' : '');
      $('#hp-outline-sub').textContent = 'بالترتيب الذي سيظهر للزائر · ' + vis + ' قسماً';
    }
    var live = $('#hp-live');
    function announce(t) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 30); }

    /* ---------- rendering ---------- */
    function fieldHTML(id, k) {
      var v = titles[id][k], fid = 'hp-' + id + '-' + k;
      var area = k === 'title' || k === 'lead';
      var ro = READONLY ? ' readonly' : '';
      var ctl = area
        ? '<textarea class="textarea hp-input" rows="' + (k === 'lead' ? 3 : 2) + '" id="' + fid + '" data-id="' + id + '" data-k="' + k + '" maxlength="' + LIMIT[k] + '" aria-describedby="' + fid + '-err"' + ro + '>' + esc(v) + '</textarea>'
        : '<input class="input hp-input" id="' + fid + '" data-id="' + id + '" data-k="' + k + '" maxlength="' + LIMIT[k] + '" value="' + esc(v) + '" aria-describedby="' + fid + '-err"' + ro + '>';
      return '<div class="field">' +
        '<label class="label" for="' + fid + '"><span>' + LABEL[k] + ' <span class="req" aria-hidden="true">*</span></span><span class="counter" data-counter="' + fid + '">' + len(norm(v)) + ' / ' + LIMIT[k] + '</span></label>' +
        ctl + '<p class="error" id="' + fid + '-err" hidden>' + icon('error') + '<span>هذا الحقل مطلوب.</span></p></div>';
    }
    function sampleHTML(id) {
      var m = SEC[id], t = titles[id];
      return '<div class="hp-sample tone-' + m.tone + '" data-sample="' + id + '" aria-hidden="true">' +
        (DEFAULTS[id].eyebrow !== undefined ? '<span class="hp-sample-eyebrow">' + esc(t.eyebrow) + '</span>' : '') +
        '<span class="hp-sample-title">' + esc(t.title) + '</span></div>';
    }
    function rowHTML(s, i) {
      var id = s.id, m = SEC[id], isOpen = !!open[id], edited = isEdited(id);
      var fields = fieldsOf(id), other = OTHER[id];
      var editBtn = fields.length
        ? '<button type="button" class="btn btn-ghost btn-sm hp-edit" data-edit="' + id + '" aria-expanded="' + isOpen + '" aria-controls="hp-f-' + id + '" aria-label="تعديل نصوص قسم ' + esc(m.label) + '">' + icon(isOpen ? 'expand_less' : 'edit') + '<span class="hp-edit-text">' + (isOpen ? 'إغلاق' : 'تعديل') + '</span></button>'
        : (other ? '<a class="btn btn-ghost btn-sm hp-edit" href="' + other[1] + '" aria-label="إدارة نصوص قسم ' + esc(m.label) + ' من صفحة ' + esc(other[0]) + '">' + icon('open_in_new') + '<span class="hp-edit-text">' + esc(other[0]) + '</span></a>' : '');
      return '<li data-id="' + id + '" data-depth="0" class="sec-row hp-row' + (s.visible ? '' : ' is-off') + (isOpen ? ' is-open' : '') + '">' +
        '<div class="sec-item">' +
          '<button type="button" class="dnd-handle" aria-label="سحب لإعادة ترتيب قسم ' + esc(m.label) + '، الموضع ' + (i + 1) + ' من ' + sections.length + '" aria-describedby="hp-dnd-help"' + (READONLY ? ' disabled' : '') + '>' + icon('drag_indicator') + '</button>' +
          '<span class="sec-num" aria-hidden="true">' + (i + 1) + '</span>' +
          '<span class="sec-ico tone-' + m.tone + '" aria-hidden="true">' + icon(m.icon) + '</span>' +
          '<div class="sec-text"><strong>' + esc(m.label) + '<span class="hp-edited"' + (edited ? '' : ' hidden') + '>معدّل</span></strong><span class="sec-note" data-note="' + id + '">' + esc(noteOf(id)) + '</span></div>' +
          '<span class="sec-flag" aria-hidden="true">' + (s.visible ? '' : icon('visibility_off') + 'مخفي') + '</span>' +
          editBtn +
          '<button type="button" class="switch" role="switch" data-vis="' + id + '" aria-checked="' + s.visible + '" aria-label="إظهار قسم ' + esc(m.label) + '"' + (READONLY ? ' disabled' : '') + '></button>' +
          '<div class="sec-move">' +
            '<button type="button" class="icon-btn sm" data-up="' + id + '" aria-label="تحريك ' + esc(m.label) + ' لأعلى"' + (i === 0 || READONLY ? ' disabled' : '') + '>' + icon('arrow_upward') + '</button>' +
            '<button type="button" class="icon-btn sm" data-down="' + id + '" aria-label="تحريك ' + esc(m.label) + ' لأسفل"' + (i === sections.length - 1 || READONLY ? ' disabled' : '') + '>' + icon('arrow_downward') + '</button>' +
          '</div>' +
        '</div>' +
        (fields.length ?
        '<div class="hp-fields" id="hp-f-' + id + '" role="group" aria-label="نصوص قسم ' + esc(m.label) + '"' + (isOpen ? '' : ' hidden') + '>' +
          '<div class="hp-fields-grid">' + fields.map(function (k) { return fieldHTML(id, k); }).join('') + '</div>' +
          sampleHTML(id) +
          '<div class="hp-fields-foot"><code class="sec-anchor" dir="ltr">#' + id + '</code><span class="grow"></span>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-restore="' + id + '"' + (edited && !READONLY ? '' : ' disabled') + '>' + icon('history') + 'النص الأصلي</button>' +
          '</div>' +
        '</div>' : '') + '</li>';
    }
    function render(flashId) {
      list.innerHTML = sections.map(rowHTML).join('');
      renderOutline(sections);
      if (flashId) { var r = $('li[data-id="' + flashId + '"]', list); if (r) r.classList.add('is-dropped'); }
      updateExpand();
      syncState();
    }
    function updateExpand() {
      var ed = sections.filter(function (s) { return fieldsOf(s.id).length; });
      var all = ed.every(function (s) { return open[s.id]; }), eb = $('#hp-expand');
      eb.setAttribute('aria-pressed', String(all));
      eb.innerHTML = icon(all ? 'unfold_less' : 'unfold_more') + '<span>' + (all ? 'طي الكل' : 'فتح الكل') + '</span>';
    }
    function renderOutline(order) {
      var h = '<div class="ol-nav"><span class="ol-brand"></span><span class="ol-links"><i></i><i></i><i></i><i></i></span><span class="ol-cta"></span></div>';
      order.forEach(function (s) {
        if (!s.visible) return;
        var m = SEC[s.id], t = titles[s.id];
        h += '<div class="ol-block hp-ol tone-' + m.tone + (s.id === dragId ? ' is-active' : '') + '" data-ol="' + s.id + '" style="--h:' + m.h + '"><span>' + esc((t && t.title) || m.label) + '</span></div>';
      });
      h += '<div class="ol-foot"><span>التذييل</span></div>';
      $('#hp-outline').innerHTML = h;
    }
    /* light update while typing (keeps focus) */
    function refreshRow(id) {
      var li = $('li[data-id="' + id + '"]', list); if (!li) return;
      var edited = isEdited(id);
      $('.hp-edited', li).hidden = !edited;
      $('[data-note="' + id + '"]', li).textContent = noteOf(id);
      var rb = $('[data-restore="' + id + '"]', li); if (rb) rb.disabled = !edited || READONLY;
      var sm = $('[data-sample="' + id + '"]', li);
      if (sm) { var e = $('.hp-sample-eyebrow', sm); if (e) e.textContent = titles[id].eyebrow; $('.hp-sample-title', sm).textContent = titles[id].title; }
      var ob = $('[data-ol="' + id + '"] span'); if (ob) ob.textContent = titles[id].title || SEC[id].label;
      var ol = $('[data-ol="' + id + '"]'); if (ol) { ol.classList.remove('is-ping'); void ol.offsetWidth; ol.classList.add('is-ping'); }
      syncState();
    }

    /* ---------- actions ---------- */
    function move(id, to, how) {
      if (READONLY) return false;
      var from = sections.findIndex(function (s) { return s.id === id; });
      if (from < 0 || to < 0 || to >= sections.length || to === from) return false;
      var it = sections.splice(from, 1)[0]; sections.splice(to, 0, it);
      render(id);
      announce('نُقل قسم «' + SEC[id].label + '» إلى الموضع ' + (to + 1) + ' من ' + sections.length);
      if (how === 'drag') toast('تم تغيير الترتيب', { text: '«' + SEC[id].label + '» الآن في الموضع ' + (to + 1) + ' — احفظ لتطبيقه', icon: 'reorder', duration: 2400 });
      return true;
    }
    function toggleOpen(id, force) {
      if (!fieldsOf(id).length) return;
      open[id] = force === undefined ? !open[id] : force;
      var li = $('li[data-id="' + id + '"]', list), b = $('[data-edit="' + id + '"]', li), f = $('#hp-f-' + id);
      li.classList.toggle('is-open', open[id]);
      f.hidden = !open[id];
      b.setAttribute('aria-expanded', String(open[id]));
      b.innerHTML = icon(open[id] ? 'expand_less' : 'edit') + '<span class="hp-edit-text">' + (open[id] ? 'إغلاق' : 'تعديل') + '</span>';
      updateExpand();
    }
    function showError(id, k, on, msg) {
      var inp = $('#hp-' + id + '-' + k), err = $('#hp-' + id + '-' + k + '-err');
      if (!inp) return;
      inp.classList.toggle('is-invalid', on); inp.setAttribute('aria-invalid', String(on)); err.hidden = !on;
      if (on && msg) $('span', err).textContent = msg;
    }

    list.addEventListener('click', function (e) {
      var ed = e.target.closest('[data-edit]');
      if (ed) {
        var id = ed.getAttribute('data-edit'); toggleOpen(id);
        if (open[id]) { var first = $('#hp-f-' + id + ' .hp-input'); if (first) first.focus(); }
        return;
      }
      var rs = e.target.closest('[data-restore]');
      if (rs) {
        if (READONLY) return;
        var rid = rs.getAttribute('data-restore'), prev = Object.assign({}, titles[rid]);
        titles[rid] = Object.assign({}, DEFAULTS[rid]);
        Object.keys(DEFAULTS[rid]).forEach(function (k) { var inp = $('#hp-' + rid + '-' + k); inp.value = titles[rid][k]; $('[data-counter="hp-' + rid + '-' + k + '"]').textContent = len(titles[rid][k]) + ' / ' + LIMIT[k]; showError(rid, k, false); });
        refreshRow(rid); $('#hp-' + rid + '-title').focus();
        var t = toast('عاد النص الأصلي', { text: '«' + SEC[rid].label + '»', icon: 'history', tone: 'info', duration: 3200 });
        addUndo(t, function () { titles[rid] = prev; render(); toggleOpen(rid, true); });
        return;
      }
      var b = e.target.closest('[data-up],[data-down]'); if (!b) return;
      var up = b.hasAttribute('data-up'), mid = b.getAttribute(up ? 'data-up' : 'data-down');
      var from = sections.findIndex(function (s) { return s.id === mid; });
      if (move(mid, from + (up ? -1 : 1))) {
        var nb = $('[data-' + (up ? 'up' : 'down') + '="' + mid + '"]', list);
        if (nb && nb.disabled) nb = $('li[data-id="' + mid + '"] .dnd-handle', list);
        if (nb) nb.focus();
      }
    });
    list.addEventListener('input', function (e) {
      var inp = e.target.closest('.hp-input'); if (!inp || READONLY) return;
      var id = inp.getAttribute('data-id'), k = inp.getAttribute('data-k');
      if (inp.tagName === 'TEXTAREA' && /\n/.test(inp.value)) inp.value = inp.value.replace(/\n+/g, ' ');
      titles[id][k] = inp.value;
      var n = len(norm(inp.value)), c = $('[data-counter="' + inp.id + '"]');
      c.textContent = n + ' / ' + LIMIT[k]; c.classList.toggle('over', n >= LIMIT[k]);
      if (n) showError(id, k, false);
      refreshRow(id);
    });
    list.addEventListener('keydown', function (e) {
      if (e.target.matches('textarea.hp-input') && e.key === 'Enter') { e.preventDefault(); return; }
      var h = e.target.closest('.dnd-handle'); if (!h) return;
      var id = h.closest('li').getAttribute('data-id'), from = sections.findIndex(function (s) { return s.id === id; }), to = null;
      if (e.key === 'ArrowUp') to = from - 1; else if (e.key === 'ArrowDown') to = from + 1;
      else if (e.key === 'Home') to = 0; else if (e.key === 'End') to = sections.length - 1;
      if (to === null) return;
      e.preventDefault();
      if (move(id, to)) { var nh = $('li[data-id="' + id + '"] .dnd-handle', list); if (nh) nh.focus(); }
    });
    document.addEventListener('switch', function (e) {
      var sw = e.target; if (!sw.hasAttribute || !sw.hasAttribute('data-vis') || READONLY) return;
      var id = sw.getAttribute('data-vis'), s = sections.find(function (x) { return x.id === id; });
      s.visible = e.detail.on; render();
      var n = $('[data-vis="' + id + '"]', list); if (n) n.focus();
      announce((s.visible ? 'أصبح قسم ' : 'أُخفي قسم ') + SEC[id].label);
    });
    function addUndo(t, fn) {
      if (!t) return;
      var b = document.createElement('button'); b.type = 'button'; b.className = 't-undo'; b.textContent = 'تراجع';
      b.addEventListener('click', function () { fn(); var c = t.querySelector('.t-close'); if (c) c.click(); });
      var body = t.querySelector('.t-body'); if (body) body.appendChild(b);
    }
    if (!READONLY) DnD.Sortable(list, {
      maxDepth: 0,
      onStart: function (r) { dragId = r.id; },
      onMove: function (r) {
        var order = sections.slice(), from = order.findIndex(function (s) { return s.id === r.id; });
        var it = order.splice(from, 1)[0]; order.splice(r.index, 0, it);
        renderOutline(order);
        var n = 0; $$('#hp-list > li').forEach(function (li) { if (li.hidden) return; n++; var num = $('.sec-num', li); if (num && !li.classList.contains('dnd-placeholder')) num.textContent = n; });
      },
      onDrop: function (r) {
        var id = dragId; dragId = null;
        if (!r.changed) { render(); return; }
        move(id, r.index, 'drag');
        var h = $('li[data-id="' + id + '"] .dnd-handle', list); if (h) h.focus({ preventScroll: true });
      },
      onCancel: function () { dragId = null; render(); announce('أُلغي السحب'); }
    });

    $('#hp-expand').addEventListener('click', function () {
      var ed = sections.filter(function (s) { return fieldsOf(s.id).length; });
      var all = ed.every(function (s) { return open[s.id]; });
      ed.forEach(function (s) { open[s.id] = !all; });
      render();
    });

    /* ---------- save / reset (database) ---------- */
    function applyServer(d) {
      sections = sectionsFrom(d); titles = titlesFrom(d); isSaved = !!d.saved;
      saved = snapshot(); mirror(); render();
    }
    function save() {
      if (READONLY || busy) return false;
      var empty = emptyFields();
      if (empty.length) {
        empty.forEach(function (f) { if (!open[f.id]) toggleOpen(f.id, true); showError(f.id, f.k, true, 'هذا الحقل مطلوب.'); });
        var first = $('#hp-' + empty[0].id + '-' + empty[0].k); if (first) { first.scrollIntoView({ block: 'center', behavior: UI.reduceMotion ? 'auto' : 'smooth' }); first.focus({ preventScroll: true }); }
        toast('لا يمكن الحفظ بعد', { text: 'أكمل ' + (empty.length === 1 ? 'الحقل الفارغ' : empty.length + ' حقول فارغة') + ' أولاً.', tone: 'danger', icon: 'error' });
        return false;
      }
      busy = true; syncState();
      DB.api('PUT', '/admin/homepage', payload()).then(function (r) {
        busy = false;
        applyServer(r.data);
        var st = $('#hp-state'); st.classList.remove('is-pulse'); void st.offsetWidth; st.classList.add('is-pulse');
        toast('تم حفظ الصفحة الرئيسية', { text: 'الترتيب والإظهار والنصوص تظهر الآن في الموقع.', icon: 'cloud_done', tone: 'success' });
      }, function (e) {
        busy = false; syncState();
        var shown = false;
        Object.keys(e.errors || {}).forEach(function (key) {
          var m = /^text\.([^.]+)\.([^.]+)$/.exec(key);
          if (m && $('#hp-' + m[1] + '-' + m[2])) { if (!open[m[1]]) toggleOpen(m[1], true); showError(m[1], m[2], true, e.errors[key][0]); shown = true; }
        });
        DB.fail(e, 'تعذّر حفظ الصفحة الرئيسية');
      });
      return true;
    }
    $('#hp-save').addEventListener('click', save);
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 's' || e.key === 'S')) { e.preventDefault(); save(); }
    });
    $('#hp-reset').addEventListener('click', function () {
      if (READONLY || busy) return;
      UI.confirm({ title: 'استعادة الصفحة الرئيسية الافتراضية؟', text: 'ستعود النصوص الأصلية وترتيب الأقسام كما كان في الموقع، وتظهر كل الأقسام. يُطبَّق ذلك على الموقع فوراً.', icon: 'restart_alt', tone: 'warn', confirmLabel: 'نعم، استعد الافتراضي', cancelLabel: 'إلغاء' }).then(function (ok) {
        if (!ok) return;
        busy = true; syncState();
        DB.api('DELETE', '/admin/homepage').then(function (r) {
          busy = false; applyServer(r.data);
          toast('تمت استعادة الافتراضي', { text: 'الصفحة الرئيسية عادت لترتيبها ونصوصها الأصلية.', icon: 'restart_alt', tone: 'info' });
        }, function (e) { busy = false; syncState(); DB.fail(e, 'تعذّرت الاستعادة'); });
      });
    });
    window.addEventListener('beforeunload', function (e) { if (isDirty()) { e.preventDefault(); e.returnValue = ''; } });
    if (READONLY) { var n = $('#hp-readonly'); if (n) n.hidden = false; }

    window.__focusHomeList = function (edit) {
      var id = sections.filter(function (s) { return fieldsOf(s.id).length; })[0];
      id = id ? id.id : sections[0].id;
      if (edit && fieldsOf(id).length) { toggleOpen(id, true); var i = $('#hp-f-' + id + ' .hp-input'); if (i) { i.focus(); return; } }
      var h = $('.dnd-handle', list); if (h) h.focus();
    };

    render();
    if (location.hash === '#edit') setTimeout(function () { window.__focusHomeList(true); }, 120);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
