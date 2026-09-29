/* =========================================================================
   الصفحة الرئيسية — homepage.html
   Simple homepage section manager:
     • edit each section's heading (title + small eyebrow label when present)
     • drag & drop to reorder (Pointer Events via AdminDnD) + keyboard / buttons
     • show / hide switch per section
   Storage (single source of truth, shared with the sections panel of
   pages.html and read by ../js/home-overrides.js on the public homepage):
     • almel-admin-home-sections → [{ id, visible }]   (order + visibility)
     • almel-admin-home-titles   → { id: { eyebrow?, title? } } (only edits)
   Edits are kept in memory until "حفظ التغييرات" (unsaved marker, Ctrl+S,
   leave warning). "استعادة الافتراضي" restores the original page.
   ========================================================================= */
(function () {
  'use strict';
  /* default headings, copied from ../index.html (exact visible text) */
  var DEFAULTS = {
    'hero':          { eyebrow: 'المنصة الوثائقية لإغاثة قطاع غزة', title: 'معاً نروي صمود غزة.. ونوثق الأثر الإنساني لحظة بلحظة' },
    'announcements': { title: 'آخر الإعلانات' },
    'appeal':        { eyebrow: 'حملة السلال والخيام والمياه', title: 'خبز اليوم يصل للخيمة.. وماؤك لا ينقطع عن النازحين' },
    'about':         { eyebrow: 'التعريف والمسيرة في غزة', title: 'سنوات من العمل لإغاثة أهل غزة وصون كرامتهم' },
    'projects':      { eyebrow: 'مشاريع وبرامج غزة', title: 'مبادرات الإغاثة المعتمدة داخل القطاع' },
    'stories':       { eyebrow: 'قصص من الميدان', title: 'أصوات من خيام النزوح.. حكايات تصنعها مساهمتك' },
    'pillars':       { title: 'ركائز الإغاثة داخل قطاع غزة' },
    'activities':    { eyebrow: 'غزة تتكلم من الميدان', title: 'أنشطة ميدانية موثّقة داخل القطاع' },
    'impact-map':    { eyebrow: 'خريطة الأثر', title: 'أثر الإغاثة في محافظات القطاع الخمس' },
    'news':          { eyebrow: 'بيانات إغاثة غزة', title: 'آخر الأخبار وتقارير الشفافية من القطاع' },
    'partners':      { eyebrow: 'شركاء إغاثة غزة', title: 'تحالفات الخير لأهل القطاع' },
    'gallery':       { eyebrow: 'مرئيات من قطاع غزة', title: 'معرض التوثيق الميداني في غزة' },
    'contact':       { eyebrow: 'التواصل لدعم إغاثة غزة', title: 'نحن في خدمتك لكل استفسار عن القطاع' },
    'faq':           { eyebrow: 'الأسئلة الشائعة', title: 'إجابات واضحة قبل أن تتبرع' }
  };
  var LIMIT = { eyebrow: 50, title: 90 };
  var LABEL = { eyebrow: 'العنوان الفرعي الصغير', title: 'العنوان الرئيسي' };

  function start() {
    var UI = window.AdminUI, B = window.BUILDER_DATA, DnD = window.AdminDnD;
    var list = document.getElementById('hp-list');
    if (!UI || !B || !DnD || !list) return;
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var esc = UI.esc, icon = UI.icon, toast = UI.toast;
    var KEY_SECTIONS = 'almel-admin-home-sections', KEY_TITLES = 'almel-admin-home-titles', KEY_SAVED_AT = 'almel-admin-home-saved-at';
    var SEC = {}; B.sections.forEach(function (s) { SEC[s.id] = s; });

    /* ---------- storage ---------- */
    function read(key) { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } }
    function write(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); return true; } catch (e) { return false; } }
    function norm(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
    function seedSections() { return B.sections.map(function (s) { return { id: s.id, visible: true }; }); }
    function loadSections() {
      var saved = read(KEY_SECTIONS);
      if (!Array.isArray(saved)) return seedSections();
      var out = saved.filter(function (s) { return s && SEC[s.id]; }).map(function (s) { return { id: s.id, visible: s.visible !== false }; });
      B.sections.forEach(function (s) { if (!out.some(function (o) { return o.id === s.id; })) out.push({ id: s.id, visible: true }); });
      return out;
    }
    /* working headings: full values for every field */
    function seedTitles() { var o = {}; Object.keys(DEFAULTS).forEach(function (id) { o[id] = Object.assign({}, DEFAULTS[id]); }); return o; }
    function loadTitles() {
      var saved = read(KEY_TITLES) || {}, o = seedTitles();
      Object.keys(o).forEach(function (id) {
        var s = saved[id]; if (!s || typeof s !== 'object') return;
        Object.keys(o[id]).forEach(function (k) { if (typeof s[k] === 'string' && norm(s[k])) o[id][k] = norm(s[k]).slice(0, LIMIT[k]); });
      });
      return o;
    }
    /* only edited fields are stored */
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
    function snapshot() { return JSON.stringify({ s: sections, t: diffTitles(titles), e: emptyFields().length }); }
    function isEdited(id) { var d = DEFAULTS[id]; return Object.keys(d).some(function (k) { return norm(titles[id][k]) !== d[k]; }); }
    function emptyFields() {
      var out = [];
      sections.forEach(function (s) { Object.keys(DEFAULTS[s.id]).forEach(function (k) { if (!norm(titles[s.id][k])) out.push({ id: s.id, k: k }); }); });
      return out;
    }

    var sections = loadSections(), titles = loadTitles();
    var saved = snapshot();
    var open = {};
    var savedAt = +read(KEY_SAVED_AT) || 0;
    var dragId = null;

    /* ---------- dirty state ---------- */
    function isDirty() { return snapshot() !== saved; }
    function syncState() {
      var dirty = isDirty(), s = $('#hp-state');
      s.classList.toggle('is-dirty', dirty);
      s.innerHTML = dirty ? '<span class="dirty-dot" aria-hidden="true"></span><span>تغييرات غير محفوظة</span>'
        : icon('cloud_done') + '<span>' + (savedAt ? 'محفوظة · ' + esc(UI.ago(Math.max(0, Math.round((Date.now() - savedAt) / 60000)))) : 'مطابقة للموقع الحالي') + '</span>';
      $('#hp-save').classList.toggle('has-dot', dirty);
      var vis = sections.filter(function (x) { return x.visible; }).length, edited = sections.filter(function (x) { return isEdited(x.id); }).length;
      $('#hp-sub').textContent = sections.length + ' قسماً · ' + vis + ' ظاهر' + (sections.length - vis ? ' · ' + (sections.length - vis) + ' مخفي' : '') + (edited ? ' · ' + edited + ' بعناوين معدّلة' : '');
      $('#hp-outline-sub').textContent = 'بالترتيب الذي سيظهر للزائر · ' + vis + ' قسماً';
    }
    var live = $('#hp-live');
    function announce(t) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 30); }

    /* ---------- rendering ---------- */
    function fieldHTML(id, k) {
      var v = titles[id][k], fid = 'hp-' + id + '-' + k;
      var tag = k === 'title' ? 'textarea' : 'input';
      var ctl = tag === 'textarea'
        ? '<textarea class="textarea hp-input" rows="2" id="' + fid + '" data-id="' + id + '" data-k="' + k + '" maxlength="' + LIMIT[k] + '" aria-describedby="' + fid + '-err">' + esc(v) + '</textarea>'
        : '<input class="input hp-input" id="' + fid + '" data-id="' + id + '" data-k="' + k + '" maxlength="' + LIMIT[k] + '" value="' + esc(v) + '" aria-describedby="' + fid + '-err">';
      return '<div class="field">' +
        '<label class="label" for="' + fid + '"><span>' + LABEL[k] + (k === 'title' ? ' <span class="req" aria-hidden="true">*</span>' : '') + '</span><span class="counter" data-counter="' + fid + '">' + norm(v).length + ' / ' + LIMIT[k] + '</span></label>' +
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
      var fields = Object.keys(DEFAULTS[id]);
      return '<li data-id="' + id + '" data-depth="0" class="sec-row hp-row' + (s.visible ? '' : ' is-off') + (isOpen ? ' is-open' : '') + '">' +
        '<div class="sec-item">' +
          '<button type="button" class="dnd-handle" aria-label="سحب لإعادة ترتيب قسم ' + esc(m.label) + '، الموضع ' + (i + 1) + ' من ' + sections.length + '" aria-describedby="hp-dnd-help">' + icon('drag_indicator') + '</button>' +
          '<span class="sec-num" aria-hidden="true">' + (i + 1) + '</span>' +
          '<span class="sec-ico tone-' + m.tone + '" aria-hidden="true">' + icon(m.icon) + '</span>' +
          '<div class="sec-text"><strong>' + esc(m.label) + '<span class="hp-edited"' + (edited ? '' : ' hidden') + '>معدّل</span></strong><span class="sec-note" data-note="' + id + '">' + esc(titles[id].title) + '</span></div>' +
          '<span class="sec-flag" aria-hidden="true">' + (s.visible ? '' : icon('visibility_off') + 'مخفي') + '</span>' +
          '<button type="button" class="btn btn-ghost btn-sm hp-edit" data-edit="' + id + '" aria-expanded="' + isOpen + '" aria-controls="hp-f-' + id + '" aria-label="تعديل عنوان قسم ' + esc(m.label) + '">' + icon(isOpen ? 'expand_less' : 'edit') + '<span class="hp-edit-text">' + (isOpen ? 'إغلاق' : 'تعديل') + '</span></button>' +
          '<button type="button" class="switch" role="switch" data-vis="' + id + '" aria-checked="' + s.visible + '" aria-label="إظهار قسم ' + esc(m.label) + '"></button>' +
          '<div class="sec-move">' +
            '<button type="button" class="icon-btn sm" data-up="' + id + '" aria-label="تحريك ' + esc(m.label) + ' لأعلى"' + (i === 0 ? ' disabled' : '') + '>' + icon('arrow_upward') + '</button>' +
            '<button type="button" class="icon-btn sm" data-down="' + id + '" aria-label="تحريك ' + esc(m.label) + ' لأسفل"' + (i === sections.length - 1 ? ' disabled' : '') + '>' + icon('arrow_downward') + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="hp-fields" id="hp-f-' + id + '" role="group" aria-label="عنوان قسم ' + esc(m.label) + '"' + (isOpen ? '' : ' hidden') + '>' +
          '<div class="hp-fields-grid">' + fields.map(function (k) { return fieldHTML(id, k); }).join('') + '</div>' +
          sampleHTML(id) +
          '<div class="hp-fields-foot"><code class="sec-anchor" dir="ltr">#' + id + '</code><span class="grow"></span>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-restore="' + id + '"' + (edited ? '' : ' disabled') + '>' + icon('history') + 'النص الأصلي</button>' +
          '</div>' +
        '</div></li>';
    }
    function render(flashId) {
      list.innerHTML = sections.map(rowHTML).join('');
      renderOutline(sections);
      if (flashId) { var r = $('li[data-id="' + flashId + '"]', list); if (r) r.classList.add('is-dropped'); }
      var all = sections.every(function (s) { return open[s.id]; }), eb = $('#hp-expand');
      eb.setAttribute('aria-pressed', String(all));
      eb.innerHTML = icon(all ? 'unfold_less' : 'unfold_more') + '<span>' + (all ? 'طي الكل' : 'فتح الكل') + '</span>';
      syncState();
    }
    function renderOutline(order) {
      var h = '<div class="ol-nav"><span class="ol-brand"></span><span class="ol-links"><i></i><i></i><i></i><i></i></span><span class="ol-cta"></span></div>';
      order.forEach(function (s) {
        if (!s.visible) return;
        var m = SEC[s.id];
        h += '<div class="ol-block hp-ol tone-' + m.tone + (s.id === dragId ? ' is-active' : '') + '" data-ol="' + s.id + '" style="--h:' + m.h + '"><span>' + esc(titles[s.id].title || m.label) + '</span></div>';
      });
      h += '<div class="ol-foot"><span>التذييل</span></div>';
      $('#hp-outline').innerHTML = h;
    }
    /* light update while typing (keeps focus) */
    function refreshRow(id) {
      var li = $('li[data-id="' + id + '"]', list); if (!li) return;
      var edited = isEdited(id);
      $('.hp-edited', li).hidden = !edited;
      $('[data-note="' + id + '"]', li).textContent = titles[id].title;
      $('[data-restore="' + id + '"]', li).disabled = !edited;
      var sm = $('[data-sample="' + id + '"]', li);
      if (sm) { var e = $('.hp-sample-eyebrow', sm); if (e) e.textContent = titles[id].eyebrow; $('.hp-sample-title', sm).textContent = titles[id].title; }
      var ob = $('[data-ol="' + id + '"] span'); if (ob) ob.textContent = titles[id].title || SEC[id].label;
      var ol = $('[data-ol="' + id + '"]'); if (ol) { ol.classList.remove('is-ping'); void ol.offsetWidth; ol.classList.add('is-ping'); }
      syncState();
    }

    /* ---------- actions ---------- */
    function move(id, to, how) {
      var from = sections.findIndex(function (s) { return s.id === id; });
      if (from < 0 || to < 0 || to >= sections.length || to === from) return false;
      var it = sections.splice(from, 1)[0]; sections.splice(to, 0, it);
      render(id);
      announce('نُقل قسم «' + SEC[id].label + '» إلى الموضع ' + (to + 1) + ' من ' + sections.length);
      if (how === 'drag') toast('تم تغيير الترتيب', { text: '«' + SEC[id].label + '» الآن في الموضع ' + (to + 1) + ' — احفظ لتطبيقه', icon: 'reorder', duration: 2400 });
      return true;
    }
    function toggleOpen(id, force) {
      open[id] = force === undefined ? !open[id] : force;
      var li = $('li[data-id="' + id + '"]', list), b = $('[data-edit="' + id + '"]', li), f = $('#hp-f-' + id);
      li.classList.toggle('is-open', open[id]);
      f.hidden = !open[id];
      b.setAttribute('aria-expanded', String(open[id]));
      b.innerHTML = icon(open[id] ? 'expand_less' : 'edit') + '<span class="hp-edit-text">' + (open[id] ? 'إغلاق' : 'تعديل') + '</span>';
      var all = sections.every(function (s) { return open[s.id]; }), eb = $('#hp-expand');
      eb.setAttribute('aria-pressed', String(all));
      eb.innerHTML = icon(all ? 'unfold_less' : 'unfold_more') + '<span>' + (all ? 'طي الكل' : 'فتح الكل') + '</span>';
    }
    function showError(id, k, on) {
      var inp = $('#hp-' + id + '-' + k), err = $('#hp-' + id + '-' + k + '-err');
      if (!inp) return;
      inp.classList.toggle('is-invalid', on); inp.setAttribute('aria-invalid', String(on)); err.hidden = !on;
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
        var rid = rs.getAttribute('data-restore'), prev = Object.assign({}, titles[rid]);
        titles[rid] = Object.assign({}, DEFAULTS[rid]);
        Object.keys(DEFAULTS[rid]).forEach(function (k) { var inp = $('#hp-' + rid + '-' + k); inp.value = titles[rid][k]; $('[data-counter="hp-' + rid + '-' + k + '"]').textContent = titles[rid][k].length + ' / ' + LIMIT[k]; showError(rid, k, false); });
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
      var inp = e.target.closest('.hp-input'); if (!inp) return;
      var id = inp.getAttribute('data-id'), k = inp.getAttribute('data-k');
      if (inp.tagName === 'TEXTAREA' && /\n/.test(inp.value)) inp.value = inp.value.replace(/\n+/g, ' ');
      titles[id][k] = inp.value;
      var n = norm(inp.value).length, c = $('[data-counter="' + inp.id + '"]');
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
      var sw = e.target; if (!sw.hasAttribute || !sw.hasAttribute('data-vis')) return;
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
    DnD.Sortable(list, {
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
      var all = sections.every(function (s) { return open[s.id]; });
      sections.forEach(function (s) { open[s.id] = !all; });
      render();
    });

    function save() {
      var empty = emptyFields();
      if (empty.length) {
        empty.forEach(function (f) { if (!open[f.id]) toggleOpen(f.id, true); showError(f.id, f.k, true); });
        var first = $('#hp-' + empty[0].id + '-' + empty[0].k); if (first) { first.scrollIntoView({ block: 'center', behavior: UI.reduceMotion ? 'auto' : 'smooth' }); first.focus({ preventScroll: true }); }
        toast('لا يمكن الحفظ بعد', { text: 'أكمل ' + (empty.length === 1 ? 'الحقل الفارغ' : empty.length + ' حقول فارغة') + ' أولاً.', tone: 'danger', icon: 'error' });
        return false;
      }
      var ok = write(KEY_SECTIONS, sections) && write(KEY_TITLES, diffTitles(titles));
      if (!ok) { toast('تعذّر الحفظ', { text: 'مساحة التخزين في المتصفح غير متاحة.', tone: 'danger', icon: 'error' }); return false; }
      savedAt = Date.now(); write(KEY_SAVED_AT, savedAt);
      saved = snapshot(); syncState();
      var st = $('#hp-state'); st.classList.remove('is-pulse'); void st.offsetWidth; st.classList.add('is-pulse');
      toast('تم حفظ الصفحة الرئيسية', { text: 'الترتيب والعناوين تظهر الآن في الموقع على هذا المتصفح.', icon: 'cloud_done', tone: 'success' });
      return true;
    }
    $('#hp-save').addEventListener('click', save);
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 's' || e.key === 'S')) { e.preventDefault(); save(); }
    });
    $('#hp-reset').addEventListener('click', function () {
      UI.modal({ title: 'استعادة الصفحة الرئيسية الافتراضية؟', text: 'ستعود العناوين الأصلية وترتيب الأقسام كما في الموقع، وتظهر كل الأقسام. لن يُطبَّق ذلك حتى تضغط «حفظ التغييرات».', icon: 'restart_alt', tone: 'warn', confirmText: 'استعادة' }).then(function (ok) {
        if (!ok) return;
        var prev = { s: JSON.parse(JSON.stringify(sections)), t: JSON.parse(JSON.stringify(titles)) };
        sections = seedSections(); titles = seedTitles(); render();
        var t = toast('تمت استعادة الافتراضي', { text: 'اضغط «حفظ التغييرات» لتطبيقها على الموقع.', icon: 'restart_alt', tone: 'info' });
        addUndo(t, function () { sections = prev.s; titles = prev.t; render(); });
      });
    });
    window.addEventListener('beforeunload', function (e) { if (isDirty()) { e.preventDefault(); e.returnValue = ''; } });
    /* pages.html may change order / visibility in another tab */
    window.addEventListener('storage', function (e) {
      if (e.key !== KEY_SECTIONS && e.key !== KEY_TITLES) return;
      if (isDirty()) return;
      sections = loadSections(); titles = loadTitles(); saved = snapshot(); render();
    });
    setInterval(function () { if (!isDirty()) syncState(); }, 60000);

    window.__focusHomeList = function (edit) {
      var id = sections[0].id;
      if (edit) { toggleOpen(id, true); var i = $('#hp-f-' + id + ' .hp-input'); if (i) { i.focus(); return; } }
      var h = $('.dnd-handle', list); if (h) h.focus();
    };

    render();
    if (location.hash === '#edit') setTimeout(function () { window.__focusHomeList(true); }, 120);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
