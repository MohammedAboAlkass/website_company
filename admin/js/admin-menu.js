/* =========================================================================
   إدارة القائمة — menu.html
   • Two menus: header (القائمة الرئيسية) and footer (قائمة التذييل).
   • Nested items (2 levels) — drag & drop with Pointer Events (AdminDnD):
     reorder vertically, drag left/right (RTL) to nest / un-nest, drop
     placeholder + parent highlight, ghost, auto-scroll, Esc to cancel.
   • Keyboard: focus a handle → ↑/↓ move, ← nest, → un-nest (RTL);
     explicit up / down / indent / outdent buttons on every row.
   • Add from pages, custom link, or homepage section anchor.
   • Inline editor: label, URL, new tab, icon, highlight-as-button.
   • Live preview of the public header (desktop / mobile, top / scrolled)
     and footer, updated while dragging and typing.
   • Save / undo (Ctrl+Z) / reset, unsaved indicator, localStorage.
   ========================================================================= */
(function () {
  'use strict';
  function start() {
    var UI = window.AdminUI, B = window.BUILDER_DATA, DnD = window.AdminDnD;
    if (!UI || !B || !DnD || !document.getElementById('mb-list')) return;
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var esc = UI.esc, icon = UI.icon, toast = UI.toast;
    var KEY = 'almel-admin-menu';
    var TABS = { header: 'القائمة الرئيسية', footer: 'قائمة التذييل' };
    var TYPES = { page: { label: 'صفحة', icon: 'web' }, custom: { label: 'رابط مخصص', icon: 'link' }, anchor: { label: 'قسم', icon: 'tag' } };
    var LOGO = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3c-2.8 3.6-7 6.2-7 10.2A7 7 0 0 0 12 21a7 7 0 0 0 7-7.8C19 9.2 14.8 6.6 12 3Z" fill="currentColor"/></svg>';

    /* ---------- state ---------- */
    var seq = 0;
    function nid(p) { seq++; return p + seq.toString(36) + Math.random().toString(36).slice(2, 5); }
    function withIds(tree, p) {
      return (tree || []).map(function (it) {
        var c = { id: it.id || nid(p), label: it.label || '', url: it.url || '', type: it.type || 'custom', icon: it.icon || '', newTab: !!it.newTab, button: !!it.button };
        if (it.children && it.children.length) c.children = withIds(it.children, p);
        return c;
      });
    }
    function seed(which) { return withIds(JSON.parse(JSON.stringify(B.menus[which])), which.charAt(0)); }
    function load() {
      try {
        var v = JSON.parse(localStorage.getItem(KEY));
        if (v && Array.isArray(v.header) && Array.isArray(v.footer)) return { header: withIds(v.header, 'h'), footer: withIds(v.footer, 'f'), savedAt: v.savedAt || null };
      } catch (e) { /* ignore */ }
      return null;
    }
    var stored = load();
    var state = stored ? { header: stored.header, footer: stored.footer } : { header: seed('header'), footer: seed('footer') };
    var savedAt = stored ? stored.savedAt : null;
    var savedJSON = { header: JSON.stringify(state.header), footer: JSON.stringify(state.footer) };
    var tab = 'header';
    var history = [];
    var expanded = {};
    var focusId = null, flash = {};
    var pendingSnap = null;
    var device = innerWidth < 768 ? 'mobile' : 'desktop', hstate = 'top';

    function cur() { return state[tab]; }
    function snap() { return JSON.stringify({ header: state.header, footer: state.footer }); }
    function restore(json) { var v = JSON.parse(json); state.header = v.header; state.footer = v.footer; }
    function commit(fn, opts) {
      opts = opts || {};
      var before = snap();
      fn();
      if (snap() === before) return false;
      history.push({ json: before, tab: tab });
      if (history.length > 80) history.shift();
      pendingSnap = null;
      renderAll();
      return true;
    }
    function isDirty(which) { return JSON.stringify(state[which]) !== savedJSON[which]; }
    function flatOf(tree) { return DnD.flatten(tree); }
    function find(id, tree) {
      tree = tree || cur();
      for (var i = 0; i < tree.length; i++) {
        if (tree[i].id === id) return { item: tree[i], arr: tree, idx: i, parent: null };
        var ch = tree[i].children || [];
        for (var j = 0; j < ch.length; j++) if (ch[j].id === id) return { item: ch[j], arr: ch, idx: j, parent: tree[i] };
      }
      return null;
    }
    function countAll(tree) { return flatOf(tree).length; }
    function clone(o) { return JSON.parse(JSON.stringify(o)); }

    /* ---------- a11y helpers ---------- */
    var live = $('#mb-live');
    function announce(t) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 30); }
    function toastUndo(title, opts) {
      var t = toast(title, opts);
      if (!t || !history.length) return t;
      var b = document.createElement('button'); b.type = 'button'; b.className = 't-undo'; b.textContent = 'تراجع';
      b.addEventListener('click', function () { undo(); var c = t.querySelector('.t-close'); if (c) c.click(); });
      var body = t.querySelector('.t-body'); if (body) body.appendChild(b);
      return t;
    }

    /* ---------- list rendering ---------- */
    var list = $('#mb-list');
    function rowHTML(f, i, flat) {
      var it = f.item, d = f.depth, open = !!expanded[it.id];
      var info = find(it.id), parent = info && info.parent, kids = (it.children || []).length;
      var sibs = info ? info.arr.length : 0, idx = info ? info.idx : 0;
      var canUp = idx > 0, canDown = idx < sibs - 1;
      var canIndent = d === 0 && idx > 0 && !kids, canOutdent = d === 1;
      var t = TYPES[it.type] || TYPES.custom;
      var lbl = it.label || 'بدون عنوان';
      var btnOK = tab === 'header' && d === 0 && !kids;
      var h = '<li data-id="' + it.id + '" data-depth="' + d + '" data-label="' + esc(lbl) + '" class="mb-row' + (open ? ' is-open' : '') + (it.button && btnOK ? ' is-button' : '') + (flash[it.id] ? ' is-flash' : '') + '">' +
        '<div class="mb-item">' +
        '<button type="button" class="dnd-handle" data-fk="' + it.id + ':h" aria-label="سحب لإعادة ترتيب: ' + esc(lbl) + '" aria-describedby="mb-help">' + icon('drag_indicator') + '</button>' +
        '<span class="mb-ico' + (it.icon ? '' : ' is-empty') + '" aria-hidden="true">' + icon(it.icon || t.icon) + '</span>' +
        '<div class="mb-text"><strong class="mb-label">' + esc(lbl) + '</strong>' +
          '<span class="mb-meta"><span class="mb-type t-' + it.type + '">' + esc(t.label) + '</span><span class="mb-url" dir="ltr">' + esc(it.url || (kids ? '—' : '#')) + '</span></span>' +
          '<span class="sr-only">' + (d ? '، عنصر فرعي ضمن «' + esc(parent ? parent.label : '') + '»' : kids ? '، يحتوي ' + kids + ' عناصر فرعية' : '') + '، الموضع ' + (idx + 1) + ' من ' + sibs + '</span></div>' +
        '<span class="mb-badges" aria-hidden="true">' +
          (it.button && btnOK ? '<span class="mb-badge is-gold">' + icon('star') + 'زر مميز</span>' : '') +
          (it.newTab ? '<span class="mb-badge" title="يفتح في تبويب جديد">' + icon('open_in_new') + '</span>' : '') +
          (kids ? '<span class="mb-badge">' + icon('account_tree') + kids + '</span>' : '') +
        '</span>' +
        '<div class="mb-moves" role="group" aria-label="تحريك «' + esc(lbl) + '»">' +
          '<button type="button" class="icon-btn sm" data-act="up" data-fk="' + it.id + ':up" aria-label="تحريك «' + esc(lbl) + '» لأعلى" title="لأعلى"' + (canUp ? '' : ' disabled') + '>' + icon('arrow_upward') + '</button>' +
          '<button type="button" class="icon-btn sm" data-act="down" data-fk="' + it.id + ':down" aria-label="تحريك «' + esc(lbl) + '» لأسفل" title="لأسفل"' + (canDown ? '' : ' disabled') + '>' + icon('arrow_downward') + '</button>' +
          '<button type="button" class="icon-btn sm" data-act="outdent" data-fk="' + it.id + ':out" aria-label="إخراج «' + esc(lbl) + '» إلى المستوى الرئيسي" title="إلى المستوى الرئيسي"' + (canOutdent ? '' : ' disabled') + '>' + icon('format_indent_decrease', 'flip-rtl') + '</button>' +
          '<button type="button" class="icon-btn sm" data-act="indent" data-fk="' + it.id + ':in" aria-label="جعل «' + esc(lbl) + '» عنصراً فرعياً" title="عنصر فرعي"' + (canIndent ? '' : ' disabled') + '>' + icon('format_indent_increase', 'flip-rtl') + '</button>' +
        '</div>' +
        '<button type="button" class="icon-btn sm mb-more" data-act="more" data-fk="' + it.id + ':more" aria-haspopup="menu" aria-expanded="false" aria-label="خيارات «' + esc(lbl) + '»">' + icon('more_vert') + '</button>' +
        '<button type="button" class="icon-btn sm mb-toggle" data-act="toggle" data-fk="' + it.id + ':t" aria-expanded="' + open + '" aria-controls="ed-' + it.id + '" aria-label="تحرير «' + esc(lbl) + '»">' + icon(open ? 'expand_less' : 'edit') + '</button>' +
        '</div>';
      if (open) h += editorHTML(it, d, kids, btnOK);
      return h + '</li>';
    }
    function editorHTML(it, d, kids, btnOK) {
      var id = it.id, p = 'ed-' + id;
      var urlHint = kids ? 'اتركه فارغاً ليعمل العنصر ' + (tab === 'footer' ? 'كعنوان عمود' : 'كقائمة منسدلة فقط') + '.' : it.type === 'anchor' ? 'رابط قسم في الصفحة الرئيسية، مثل index.html#faq' : it.type === 'page' ? 'صفحة من الموقع — يمكنك إضافة #قسم أو ?معامل.' : 'رابط خارجي أو داخلي أو mailto: / tel:';
      var btnHint = tab !== 'header' ? 'متاح في القائمة الرئيسية فقط.' : d ? 'متاح للعناصر الرئيسية فقط.' : kids ? 'غير متاح لعنصر يحتوي عناصر فرعية.' : 'يظهر كزر ذهبي بجانب القائمة.';
      return '<div class="mb-editor" id="' + p + '" role="group" aria-label="تحرير «' + esc(it.label || 'بدون عنوان') + '»">' +
        '<div class="field-row">' +
          '<div class="field"><label class="label" for="' + p + '-label"><span>النص <span class="req" aria-hidden="true">*</span></span></label><input class="input" id="' + p + '-label" data-field="label" data-fk="' + id + ':label" value="' + esc(it.label) + '" maxlength="40" aria-describedby="' + p + '-label-err"' + (it.label ? '' : ' aria-invalid="true"') + '><p class="error" id="' + p + '-label-err"' + (it.label ? ' hidden' : '') + '>' + icon('error') + '<span>النص مطلوب ليظهر العنصر في القائمة.</span></p></div>' +
          '<div class="field"><label class="label" for="' + p + '-url"><span>الرابط</span><span class="mb-type t-' + it.type + '">' + esc((TYPES[it.type] || TYPES.custom).label) + '</span></label><input class="input" id="' + p + '-url" data-field="url" data-fk="' + id + ':url" dir="ltr" value="' + esc(it.url) + '" aria-describedby="' + p + '-url-hint" spellcheck="false" autocomplete="off"><p class="hint" id="' + p + '-url-hint">' + esc(urlHint) + '</p></div>' +
        '</div>' +
        '<div class="mb-switches">' +
          '<div class="mb-switch"><div><strong id="' + p + '-tab-l">فتح في تبويب جديد</strong><span class="hint">مفيد للروابط الخارجية.</span></div><button type="button" class="switch" role="switch" data-field="newTab" data-fk="' + id + ':newTab" aria-checked="' + it.newTab + '" aria-labelledby="' + p + '-tab-l"></button></div>' +
          '<div class="mb-switch' + (btnOK ? '' : ' is-disabled') + '"><div><strong id="' + p + '-btn-l">إبرازه كزر</strong><span class="hint" id="' + p + '-btn-h">' + esc(btnHint) + '</span></div><button type="button" class="switch" role="switch" data-field="button" data-fk="' + id + ':button" aria-checked="' + (!!it.button && btnOK) + '" aria-labelledby="' + p + '-btn-l" aria-describedby="' + p + '-btn-h"' + (btnOK ? '' : ' disabled') + '></button></div>' +
        '</div>' +
        '<div class="field"><span class="label" id="' + p + '-icon-l">الأيقونة <span class="opt">تظهر في قائمة الجوال والأزرار</span></span>' +
          '<div class="icon-grid" role="group" aria-labelledby="' + p + '-icon-l">' +
          '<button type="button" class="icon-opt is-none" data-icon="" data-fk="' + id + ':ic-" aria-pressed="' + !it.icon + '" aria-label="بلا أيقونة" title="بلا أيقونة">' + icon('block') + '</button>' +
          B.icons.map(function (n) { return '<button type="button" class="icon-opt" data-icon="' + n + '" data-fk="' + id + ':ic-' + n + '" aria-pressed="' + (it.icon === n) + '" aria-label="أيقونة ' + n.replace(/_/g, ' ') + '" title="' + n + '">' + icon(n) + '</button>'; }).join('') +
          '</div></div>' +
        '<div class="mb-editor-foot"><button type="button" class="btn btn-danger-ghost btn-sm" data-act="delete" data-fk="' + id + ':del">' + icon('delete') + 'حذف العنصر</button><button type="button" class="btn btn-secondary btn-sm" data-act="toggle" data-fk="' + id + ':done">' + icon('check') + 'تم</button></div>' +
        '</div>';
    }
    function renderList() {
      var act = document.activeElement, fk = act && list.contains(act) ? act.getAttribute('data-fk') : null;
      var sel = fk && act.setSelectionRange && act.value != null ? [act.selectionStart, act.selectionEnd] : null;
      var flat = flatOf(cur());
      list.innerHTML = flat.map(rowHTML).join('');
      flash = {};
      $('#mb-empty').innerHTML = flat.length ? '' : UI.emptyState('menu', 'القائمة فارغة', 'أضف صفحات أو روابط أو أقسام من لوحة «إضافة عنصر».', '<button type="button" class="btn btn-primary" data-jump-add>' + icon('add') + 'إضافة عنصر</button>');
      var top = cur().length, all = flat.length;
      $('#mb-sub').textContent = all ? top + ' عنصراً رئيسياً' + (all - top ? ' · ' + (all - top) + ' فرعية' : '') + ' — ' + (tab === 'header' ? 'تظهر في رأس الموقع وقائمة الجوال' : 'الرئيسية ذات العناصر الفرعية تصبح أعمدة، والمنفردة تظهر في الشريط السفلي') : 'لا توجد عناصر';
      if (fk) { var el = $('[data-fk="' + fk + '"]', list); if (el && !el.disabled) { el.focus({ preventScroll: true }); if (sel) try { el.setSelectionRange(sel[0], sel[1]); } catch (e) { /* ignore */ } } else if (el) { var h = $('.dnd-handle', el.closest('li')); if (h) h.focus({ preventScroll: true }); } }
    }
    function renderCounts() {
      $$('#mb-tabs [data-count]').forEach(function (el) { el.textContent = countAll(state[el.getAttribute('data-count')]); });
      Object.keys(TABS).forEach(function (k) { var d = $('[data-dirty="' + k + '"]'); if (d) d.hidden = !isDirty(k); });
      var dirty = isDirty('header') || isDirty('footer');
      var s = $('#mb-state');
      s.classList.toggle('is-dirty', dirty);
      s.innerHTML = dirty ? '<span class="dirty-dot" aria-hidden="true"></span><span>تغييرات غير محفوظة</span>' : icon('cloud_done') + '<span>' + (savedAt ? 'محفوظة · ' + esc(UI.ago(Math.max(0, Math.round((Date.now() - savedAt) / 60000)))) : 'مطابقة للموقع الحالي') + '</span>';
      $('#mb-save').classList.toggle('has-dot', dirty);
      $('#mb-undo').setAttribute('aria-disabled', history.length ? 'false' : 'true');
    }
    function renderAll(previewTree) {
      renderList(); renderCounts(); renderPreview(previewTree); renderPickers();
    }

    /* ---------- live preview ---------- */
    var stage = $('#pv-stage');
    var DESIGN_W = 1280;
    function hdrHTML(tree, isMobile) {
      var nav = '', btns = '', activeDone = false;
      tree.forEach(function (it) {
        var kids = it.children || [];
        var lbl = esc(it.label || 'بدون عنوان');
        var cls = (it.id === focusId || kids.some(function (k) { return k.id === focusId; })) ? ' is-focus' : '';
        if (it.button && !kids.length) { btns += '<span class="sp-btn' + cls + '">' + (it.icon ? icon(it.icon, 'fill') : '') + lbl + (it.newTab ? icon('open_in_new', 'sp-ext') : '') + '</span>'; return; }
        var active = !activeDone; activeDone = true;
        var open = kids.length && (it.id === focusId || kids.some(function (k) { return k.id === focusId; }));
        nav += '<span class="sp-link' + (active ? ' is-active' : '') + (kids.length ? ' has-kids' : '') + (open ? ' is-open' : '') + cls + '">' + lbl + (it.newTab ? icon('open_in_new', 'sp-ext') : '') + (kids.length ? icon('expand_more', 'sp-chev') : '') +
          (kids.length ? '<span class="sp-dd">' + kids.map(function (k) { return '<span class="sp-dd-item' + (k.id === focusId ? ' is-focus' : '') + '">' + (k.icon ? icon(k.icon) : '') + esc(k.label || 'بدون عنوان') + (k.newTab ? icon('open_in_new', 'sp-ext') : '') + '</span>'; }).join('') + '</span>' : '') + '</span>';
      });
      var brand = '<span class="sp-brand"><span class="sp-mark">' + LOGO + '</span><span class="sp-brand-t"><b>جمعية الشمال للتنمية والتطوير المجتمعي</b><small>' + esc(B.site.tagline) + '</small></span></span>';
      if (!isMobile) return '<header class="sp-header ' + (hstate === 'top' ? 'is-top' : 'is-scrolled') + '"><div class="sp-bar">' + brand + '<nav class="sp-nav">' + nav + '</nav><span class="sp-actions">' + btns + '<span class="sp-icon">' + icon('person') + '</span></span></div></header>';
      return brand;
    }
    function mobileMenuHTML(tree) {
      var h = '', ctas = '';
      tree.forEach(function (it) {
        var kids = it.children || [];
        var f = it.id === focusId ? ' is-focus' : '';
        if (it.button && !kids.length) { ctas += '<span class="sp-btn sp-btn-block' + f + '">' + (it.icon ? icon(it.icon, 'fill') : '') + esc(it.label || 'بدون عنوان') + '</span>'; return; }
        h += '<span class="sp-m-link' + f + '">' + icon(it.icon || 'radio_button_unchecked') + '<span>' + esc(it.label || 'بدون عنوان') + '</span>' + (it.newTab ? icon('open_in_new', 'sp-ext') : '') + (kids.length ? icon('expand_less', 'sp-chev') : '') + '</span>';
        kids.forEach(function (k) { h += '<span class="sp-m-link is-child' + (k.id === focusId ? ' is-focus' : '') + '">' + (k.icon ? icon(k.icon) : '<i class="sp-bullet"></i>') + '<span>' + esc(k.label || 'بدون عنوان') + '</span>' + (k.newTab ? icon('open_in_new', 'sp-ext') : '') + '</span>'; });
      });
      return '<div class="sp-m-panel">' + (h || '<span class="sp-m-empty">لا توجد روابط</span>') + ctas + '</div>';
    }
    function footerHTML(tree, isMobile) {
      var cols = '', bottom = '';
      tree.forEach(function (it) {
        var kids = it.children || [];
        var f = it.id === focusId || kids.some(function (k) { return k.id === focusId; }) ? ' is-focus' : '';
        if (kids.length) cols += '<div class="sf-col' + f + '"><span class="sf-h">' + esc(it.label || 'بدون عنوان') + '</span><span class="sf-links">' + kids.map(function (k) { return '<span class="' + (k.id === focusId ? 'is-focus' : '') + '">' + esc(k.label || 'بدون عنوان') + (k.newTab ? icon('open_in_new', 'sp-ext') : '') + '</span>'; }).join('') + '</span></div>';
        else bottom += '<span class="' + (it.id === focusId ? 'is-focus' : '') + '">' + esc(it.label || 'بدون عنوان') + (it.newTab ? icon('open_in_new', 'sp-ext') : '') + '</span>';
      });
      return '<footer class="sf ' + (isMobile ? 'is-mobile' : '') + '"><div class="sf-grid">' +
        '<div class="sf-col sf-brand"><span class="sp-brand"><span class="sp-mark">' + LOGO + '</span><span class="sp-brand-t"><b>جمعية الشمال للتنمية والتطوير المجتمعي</b></span></span><p>مؤسسة إنسانية تعنى بإغاثة أهل غزة: الغذاء والدواء والمأوى وكفالة الأيتام النازحين.</p></div>' +
        cols +
        '<div class="sf-col sf-static"><span class="sf-h">التواصل</span><p>غرفة التنسيق: القاهرة<br>info@shamal-society.org</p></div>' +
        '</div><div class="sf-bottom"><span>جميع الحقوق محفوظة © 2026 جمعية الشمال للتنمية والتطوير المجتمعي</span><span class="sf-bl">' + bottom + '</span></div></footer>';
    }
    function renderPreview(tree) {
      tree = tree || cur();
      var isMobile = device === 'mobile';
      var h;
      if (tab === 'header') {
        if (!isMobile) {
          h = '<div class="pv-desktop"><div class="pv-browser"><span class="pv-dots"><i></i><i></i><i></i></span><span class="pv-url">' + icon('lock') + 'shamal-society.org</span></div>' +
            '<div class="pv-viewport"><div class="pv-canvas ' + (hstate === 'top' ? 'on-hero' : 'on-page') + '" style="width:' + DESIGN_W + 'px">' +
            (hstate === 'top' ? '<div class="sp-hero"><img src="../img/hero-poster.jpg" alt=""><div class="sp-hero-t"><span class="sp-kicker">حملة الشتاء 2026</span><b>معاً نصنع الأمل لأهل غزة</b><i></i><i class="short"></i></div></div>' : '<div class="sp-page"><i class="w1"></i><i class="w2"></i><div class="sp-cards"><span></span><span></span><span></span></div></div>') +
            hdrHTML(tree, false) + '</div></div></div>';
        } else {
          h = '<div class="pv-phone"><div class="pv-notch"></div><div class="pv-screen"><img class="pv-phone-bg" src="../img/hero-poster.jpg" alt=""><div class="sp-m-bar ' + (hstate === 'top' ? 'is-top' : 'is-scrolled') + '">' + hdrHTML(tree, true) + '<span class="sp-icon">' + icon('close') + '</span></div><div class="sp-m-backdrop"></div>' + mobileMenuHTML(tree) + '</div></div>';
        }
      } else {
        if (!isMobile) h = '<div class="pv-desktop"><div class="pv-browser"><span class="pv-dots"><i></i><i></i><i></i></span><span class="pv-url">' + icon('lock') + 'shamal-society.org</span></div><div class="pv-viewport"><div class="pv-canvas on-footer" style="width:' + DESIGN_W + 'px">' + footerHTML(tree, false) + '</div></div></div>';
        else h = '<div class="pv-phone"><div class="pv-notch"></div><div class="pv-screen is-footer">' + footerHTML(tree, true) + '</div></div>';
      }
      stage.innerHTML = h;
      stage.setAttribute('data-device', device);
      fitPreview();
      // overflow warning (desktop header)
      var sub = $('#pv-sub'), bar = $('.sp-bar', stage), warn = false;
      if (bar && !isMobile) { var nav = $('.sp-nav', bar); warn = nav && nav.scrollWidth > nav.clientWidth + 2; }
      sub.innerHTML = warn ? '<span class="pv-warn">' + icon('warning') + 'عناصر القائمة أكثر من المساحة المتاحة في الشاشات المتوسطة — فكّر في تجميع بعضها كعناصر فرعية.</span>' : 'تتحدّث فوراً مع كل سحب أو تعديل — بتنسيق الموقع العام.';
      var top = tree.filter(function (i) { return !(i.button && !(i.children || []).length); }).map(function (i) { return i.label; });
      $('#pv-caption').textContent = 'معاينة ' + TABS[tab] + ': ' + top.join('، ');
    }
    function fitPreview() {
      var vp = $('.pv-viewport', stage), cv = $('.pv-canvas', stage);
      if (!vp || !cv) return;
      var s = Math.min(1, vp.clientWidth / DESIGN_W);
      cv.style.transform = 'scale(' + s + ')';
      vp.style.height = Math.ceil(cv.offsetHeight * s) + 'px';
    }
    if (window.ResizeObserver) new ResizeObserver(function () { fitPreview(); }).observe(stage);
    else window.addEventListener('resize', fitPreview);

    /* ---------- operations ---------- */
    function lbl(it) { return '«' + (it.label || 'بدون عنوان') + '»'; }
    function move(id, act) {
      var f = find(id); if (!f) return;
      var it = f.item, msg = '';
      var ok = commit(function () {
        if (act === 'up' && f.idx > 0) { f.arr.splice(f.idx, 1); f.arr.splice(f.idx - 1, 0, it); msg = 'نُقل ' + lbl(it) + ' إلى الموضع ' + f.idx + ' من ' + f.arr.length; }
        else if (act === 'down' && f.idx < f.arr.length - 1) { f.arr.splice(f.idx, 1); f.arr.splice(f.idx + 1, 0, it); msg = 'نُقل ' + lbl(it) + ' إلى الموضع ' + (f.idx + 2) + ' من ' + f.arr.length; }
        else if (act === 'indent' && !f.parent && f.idx > 0 && !(it.children || []).length) {
          var p = f.arr[f.idx - 1]; f.arr.splice(f.idx, 1); (p.children = p.children || []).push(it); it.button = false;
          msg = 'أصبح ' + lbl(it) + ' عنصراً فرعياً ضمن ' + lbl(p);
        } else if (act === 'outdent' && f.parent) {
          var root = cur(), pi = root.indexOf(f.parent);
          f.arr.splice(f.idx, 1); if (!f.arr.length) delete f.parent.children;
          root.splice(pi + 1, 0, it); msg = 'أصبح ' + lbl(it) + ' عنصراً رئيسياً بعد ' + lbl(f.parent);
        }
        focusId = id; flash[id] = true;
      });
      if (ok) announce(msg);
      return ok;
    }
    function removeItem(id) {
      var f = find(id); if (!f) return;
      var kids = (f.item.children || []).length;
      var go = function () {
        commit(function () { f.arr.splice(f.idx, 1); if (f.parent && !f.arr.length) delete f.parent.children; delete expanded[id]; });
        toastUndo('تم حذف العنصر', { text: lbl(f.item) + (kids ? ' و' + kids + ' عناصر فرعية' : ''), tone: 'danger' });
        announce('تم حذف ' + lbl(f.item));
        var h = $('.dnd-handle', list); if (h) h.focus({ preventScroll: true });
      };
      if (!kids) { go(); return; }
      UI.confirmDelete('العنصر', 'سيُحذف ' + lbl(f.item) + ' مع ' + kids + ' عناصر فرعية من ' + TABS[tab] + '. يمكنك التراجع قبل الحفظ.').then(function (ok) { if (ok) go(); });
    }
    function undo() {
      if (!history.length) { toast('لا يوجد ما يمكن التراجع عنه', { tone: 'info', icon: 'info', duration: 2200 }); return; }
      var h = history.pop();
      restore(h.json); pendingSnap = null;
      if (h.tab !== tab) selectTab(h.tab); else renderAll();
      toast('تم التراجع عن آخر تغيير', { text: TABS[h.tab], tone: 'info', icon: 'undo', duration: 2400 });
      announce('تم التراجع');
    }
    function save() {
      if (!isDirty('header') && !isDirty('footer')) { toast('لا توجد تغييرات جديدة', { text: 'القائمتان محفوظتان بالفعل.', tone: 'info', icon: 'info', duration: 2400 }); return; }
      var bad = flatOf(state.header).concat(flatOf(state.footer)).filter(function (f) { return !f.item.label.trim(); });
      if (bad.length) {
        toast('أكمل الحقول المطلوبة', { text: bad.length + ' عنصر بلا نص. أضف نصاً أو احذف العنصر.', tone: 'danger', icon: 'error' });
        var inTab = bad.filter(function (f) { return find(f.item.id); })[0];
        if (inTab) { expanded[inTab.item.id] = true; renderList(); var i = $('#ed-' + inTab.item.id + '-label'); if (i) i.focus(); }
        return;
      }
      savedAt = Date.now();
      try { localStorage.setItem(KEY, JSON.stringify({ v: 1, header: state.header, footer: state.footer, savedAt: savedAt })); } catch (e) { toast('تعذّر الحفظ', { text: 'مساحة التخزين غير متاحة في هذا المتصفح.', tone: 'danger', icon: 'error' }); return; }
      savedJSON = { header: JSON.stringify(state.header), footer: JSON.stringify(state.footer) };
      renderCounts();
      toast('تم حفظ القائمة', { text: 'حُفظت القائمة الرئيسية وقائمة التذييل على هذا الجهاز (قالب تجريبي بلا خادم).', icon: 'cloud_done' });
    }
    function resetTab() {
      UI.modal({ title: 'استعادة ' + TABS[tab] + ' الافتراضية؟', text: 'ستعود العناصر إلى روابط الموقع الأصلية. يمكنك التراجع قبل الحفظ.', icon: 'restart_alt', tone: 'warn', confirmText: 'استعادة الافتراضي' }).then(function (ok) {
        if (!ok) return;
        expanded = {}; focusId = null;
        if (commit(function () { state[tab] = seed(tab); })) toastUndo('تمت استعادة ' + TABS[tab], { text: 'احفظ لتطبيق التغيير.', tone: 'info', icon: 'restart_alt' });
        else toast('القائمة مطابقة للافتراضي بالفعل', { tone: 'info', icon: 'info', duration: 2400 });
      });
    }
    function addItems(items, source) {
      if (!items.length) { toast('اختر عنصراً واحداً على الأقل', { tone: 'info', icon: 'info', duration: 2400 }); return false; }
      var ids = [];
      commit(function () {
        items.forEach(function (it) { it.id = nid(tab.charAt(0)); ids.push(it.id); cur().push(it); flash[it.id] = true; });
        focusId = ids[ids.length - 1];
      });
      var row = $('li[data-id="' + ids[0] + '"]', list);
      if (row) { row.scrollIntoView({ block: 'nearest', behavior: UI.reduceMotion ? 'auto' : 'smooth' }); }
      toastUndo(items.length === 1 ? 'أُضيف ' + lbl(items[0]) + ' إلى ' + TABS[tab] : 'أُضيف ' + items.length + ' عناصر إلى ' + TABS[tab], { text: source, icon: 'add_link' });
      announce('أُضيف ' + items.length + ' عنصر في نهاية القائمة');
      return true;
    }

    /* ---------- list events ---------- */
    list.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act],[data-icon]'); if (!b || !list.contains(b)) return;
      var row = b.closest('li[data-id]'), id = row.getAttribute('data-id');
      if (b.hasAttribute('data-icon')) {
        var f0 = find(id); focusId = id;
        commit(function () { f0.item.icon = b.getAttribute('data-icon'); });
        return;
      }
      var act = b.getAttribute('data-act');
      if (act === 'toggle') {
        expanded[id] = !expanded[id]; focusId = id; renderList(); renderPreview();
        if (expanded[id]) { var inp = $('#ed-' + id + '-label'); if (inp) inp.focus(); }
        else { var t = $('li[data-id="' + id + '"] .mb-toggle', list); if (t) t.focus(); }
        return;
      }
      if (act === 'delete') { removeItem(id); return; }
      if (act === 'more') {
        var f = find(id), kids = (f.item.children || []).length;
        var items = [];
        if (f.idx > 0) items.push({ icon: 'arrow_upward', label: 'تحريك لأعلى', action: function () { move(id, 'up'); } });
        if (f.idx < f.arr.length - 1) items.push({ icon: 'arrow_downward', label: 'تحريك لأسفل', action: function () { move(id, 'down'); } });
        if (!f.parent && f.idx > 0 && !kids) items.push({ icon: 'subdirectory_arrow_left', label: 'جعله عنصراً فرعياً', action: function () { move(id, 'indent'); } });
        if (f.parent) items.push({ icon: 'format_indent_decrease', label: 'إخراجه إلى المستوى الرئيسي', action: function () { move(id, 'outdent'); } });
        items.push({ icon: 'edit', label: expanded[id] ? 'إغلاق المحرر' : 'تحرير', action: function () { b.closest('li').querySelector('.mb-toggle').click(); } });
        items.push('-');
        items.push({ icon: 'delete', label: 'حذف', danger: true, action: function () { removeItem(id); } });
        UI.rowMenu(b, items);
        return;
      }
      if (/^(up|down|indent|outdent)$/.test(act)) move(id, act);
    });
    list.addEventListener('keydown', function (e) {
      var h = e.target.closest('.dnd-handle'); if (!h) return;
      var id = h.closest('li').getAttribute('data-id');
      var rtl = getComputedStyle(list).direction === 'rtl', act = null;
      if (e.key === 'ArrowUp') act = 'up'; else if (e.key === 'ArrowDown') act = 'down';
      else if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) act = 'indent';
      else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) act = 'outdent';
      if (!act) return;
      e.preventDefault();
      if (!move(id, act)) announce('لا يمكن ' + ({ up: 'التحريك لأعلى', down: 'التحريك لأسفل', indent: 'جعله فرعياً هنا', outdent: 'إخراجه أكثر' })[act]);
      var nh = $('li[data-id="' + id + '"] .dnd-handle', list); if (nh) nh.focus();
    });
    // inline editing: live update, one undo step per field edit
    list.addEventListener('focusin', function (e) { if (e.target.matches('.mb-editor input')) pendingSnap = snap(); });
    list.addEventListener('input', function (e) {
      var inp = e.target; if (!inp.matches('.mb-editor input[data-field]')) return;
      var row = inp.closest('li[data-id]'), id = row.getAttribute('data-id'), f = find(id); if (!f) return;
      if (pendingSnap === null) pendingSnap = snap();
      var field = inp.getAttribute('data-field');
      f.item[field] = inp.value;
      if (field === 'label') {
        var v = inp.value.trim();
        $('.mb-label', row).textContent = v || 'بدون عنوان';
        inp.setAttribute('aria-invalid', v ? 'false' : 'true');
        var err = $('#ed-' + id + '-label-err'); if (err) err.hidden = !!v;
      } else { $('.mb-url', row).textContent = inp.value || '#'; }
      focusId = id; renderPreview(); renderCounts();
    });
    // Commit on change without re-rendering the list (a re-render here would
    // swallow the click that caused the blur, e.g. on «تم» or another row).
    list.addEventListener('change', function (e) {
      var inp = e.target; if (!inp.matches('.mb-editor input[data-field]')) return;
      var row = inp.closest('li[data-id]'), f = row && find(row.getAttribute('data-id'));
      if (f) {
        var field = inp.getAttribute('data-field'), v = inp.value.trim();
        f.item[field] = v; if (inp.value !== v) inp.value = v;
        if (field === 'label') {
          var old = row.getAttribute('data-label') || '', nl = v || 'بدون عنوان';
          $$('[aria-label]', row).forEach(function (el) { if (old) el.setAttribute('aria-label', el.getAttribute('aria-label').split('«' + old + '»').join('«' + nl + '»').split(': ' + old).join(': ' + nl)); });
          row.setAttribute('data-label', nl);
        }
      }
      if (pendingSnap !== null && pendingSnap !== snap()) { history.push({ json: pendingSnap, tab: tab }); if (history.length > 80) history.shift(); }
      pendingSnap = null;
      renderCounts(); renderPreview(); renderPickers();
    });
    document.addEventListener('switch', function (e) {
      var sw = e.target; if (!list.contains(sw)) return;
      var id = sw.closest('li[data-id]').getAttribute('data-id'), f = find(id), field = sw.getAttribute('data-field');
      focusId = id;
      commit(function () { f.item[field] = e.detail.on; });
      if (field === 'button') announce(e.detail.on ? 'سيظهر ' + lbl(f.item) + ' كزر مميز' : 'أُلغي إبراز ' + lbl(f.item));
    });
    document.addEventListener('click', function (e) { if (e.target.closest('[data-jump-add]')) focusAdd(); });

    /* ---------- drag & drop ---------- */
    var dragId = null;
    DnD.Sortable(list, {
      maxDepth: 1, indent: 40,
      onStart: function (r) { dragId = r.id; focusId = r.id; },
      onMove: function (r) { renderPreview(DnD.applyDrop(clone(cur()), r, function (x) { return x.id; })); },
      onDrop: function (r) {
        dragId = null;
        if (!r.changed) { renderPreview(); return; }
        var f0 = find(r.id), wasParent = f0 && f0.parent;
        flash[r.id] = true; focusId = r.id;
        commit(function () {
          state[tab] = DnD.applyDrop(cur(), r, function (x) { return x.id; });
          var f = find(r.id); if (f && f.parent) f.item.button = false;
        });
        var f1 = find(r.id);
        var msg = f1.parent ? 'أصبح ' + lbl(f1.item) + ' عنصراً فرعياً ضمن ' + lbl(f1.parent) : (wasParent ? 'أصبح ' + lbl(f1.item) + ' عنصراً رئيسياً' : 'نُقل ' + lbl(f1.item) + ' إلى الموضع ' + (f1.idx + 1) + ' من ' + f1.arr.length);
        announce(msg);
        if ((f1.parent && (!wasParent || wasParent.id !== f1.parent.id)) || (!f1.parent && wasParent)) toast(f1.parent ? 'تم التداخل' : 'تم إخراج العنصر', { text: msg, icon: 'account_tree', duration: 2600 });
        var h = $('li[data-id="' + r.id + '"] .dnd-handle', list); if (h) h.focus({ preventScroll: true });
      },
      onCancel: function () { dragId = null; renderPreview(); announce('أُلغي السحب'); }
    });

    /* ---------- add panel ---------- */
    function readJSON(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
    function sitePages() { var v = readJSON('almel-admin-pages'); return Array.isArray(v) && v.length ? v : B.pages; }
    function siteSections() {
      var v = readJSON('almel-admin-home-sections'), meta = {};
      B.sections.forEach(function (s) { meta[s.id] = s; });
      var order = Array.isArray(v) ? v.filter(function (s) { return s && meta[s.id]; }) : B.sections.map(function (s) { return { id: s.id, visible: true }; });
      return order.map(function (s) { return Object.assign({ visible: s.visible !== false }, meta[s.id]); });
    }
    function inMenu(url) { return flatOf(cur()).some(function (f) { return f.item.url === url; }); }
    var STATUS_L = { draft: 'مسودة', hidden: 'مخفية' };
    function renderPickers() {
      var pk = $('#pick-pages'), checked = $$('input:checked', pk).map(function (i) { return i.value; });
      pk.innerHTML = sitePages().map(function (p, i) {
        var file = p.file || (p.slug ? p.slug + '.html' : 'index.html');
        return '<label class="pick"><input type="checkbox" class="checkbox" value="' + esc(p.id) + '"' + (checked.indexOf(p.id) > -1 ? ' checked' : '') + '><span class="pick-ico" aria-hidden="true">' + icon(p.icon || 'description') + '</span><span class="pick-t"><span>' + esc(p.title) + '</span><small dir="ltr">' + esc(file) + '</small></span>' +
          (p.status && p.status !== 'published' ? '<span class="pill pill-neutral sm-pill">' + STATUS_L[p.status] + '</span>' : '') +
          (inMenu(file) ? '<span class="pick-in">' + icon('check') + 'في القائمة</span>' : '') + '</label>';
      }).join('');
      var pa = $('#pick-anchors'), checkedA = $$('input:checked', pa).map(function (i) { return i.value; });
      pa.innerHTML = siteSections().map(function (s) {
        var url = 'index.html#' + s.id;
        return '<label class="pick"><input type="checkbox" class="checkbox" value="' + s.id + '"' + (checkedA.indexOf(s.id) > -1 ? ' checked' : '') + '><span class="pick-ico" aria-hidden="true">' + icon(s.icon) + '</span><span class="pick-t"><span>' + esc(s.label) + '</span><small dir="ltr">#' + s.id + '</small></span>' +
          (s.visible ? '' : '<span class="pill pill-warn sm-pill">مخفي</span>') +
          (inMenu(url) ? '<span class="pick-in">' + icon('check') + 'في القائمة</span>' : '') + '</label>';
      }).join('');
    }
    UI.initTabs($('#add-tabs'));
    $('#pick-pages-all').addEventListener('click', function () {
      var boxes = $$('#pick-pages input'), all = boxes.every(function (b) { return b.checked; });
      boxes.forEach(function (b) { b.checked = !all; });
      this.textContent = all ? 'تحديد الكل' : 'إلغاء التحديد';
    });
    $('#add-pages').addEventListener('click', function () {
      var ps = sitePages(), sel = $$('#pick-pages input:checked').map(function (i) { return ps.filter(function (p) { return p.id === i.value; })[0]; }).filter(Boolean);
      var ok = addItems(sel.map(function (p) { return { label: p.title, url: p.file || (p.slug ? p.slug + '.html' : 'index.html'), type: 'page', icon: p.icon || '', newTab: false, button: false }; }), 'من الصفحات الموجودة');
      if (ok) { $$('#pick-pages input').forEach(function (b) { b.checked = false; }); $('#pick-pages-all').textContent = 'تحديد الكل'; renderPickers(); }
    });
    $('#add-anchors').addEventListener('click', function () {
      var ss = siteSections(), sel = $$('#pick-anchors input:checked').map(function (i) { return ss.filter(function (s) { return s.id === i.value; })[0]; }).filter(Boolean);
      var ok = addItems(sel.map(function (s) { return { label: s.label, url: 'index.html#' + s.id, type: 'anchor', icon: s.icon, newTab: false, button: false }; }), 'أقسام الصفحة الرئيسية');
      if (ok) { $$('#pick-anchors input').forEach(function (b) { b.checked = false; }); renderPickers(); }
    });
    var cf = $('#custom-form'), cl = $('#cl-label'), cu = $('#cl-url'), ct = $('#cl-tab');
    var URL_RE = /^(https?:\/\/[^\s.]+\.[^\s]+|mailto:[^\s@]+@[^\s]+|tel:[+\d][\d\s-]*|#[\w-]*|\/[^\s]*|[\w\-./]+\.html([?#][^\s]*)?)$/i;
    function setErr(input, msg) { var e = $('#' + input.id + '-err'); input.setAttribute('aria-invalid', msg ? 'true' : 'false'); e.hidden = !msg; if (msg) $('span:last-child', e).textContent = msg; }
    function vLabel() { var m = cl.value.trim() ? '' : 'أدخل نص الرابط.'; setErr(cl, m); return !m; }
    function vUrl() { var v = cu.value.trim(), m = !v ? 'أدخل الرابط.' : URL_RE.test(v) ? '' : 'صيغة غير صحيحة. مثال: https://example.org أو contact.html'; setErr(cu, m); return !m; }
    ct.addEventListener('change', function () { ct._touched = true; });
    cu.addEventListener('input', function () { if (!ct._touched) ct.checked = /^https?:\/\//i.test(cu.value.trim()) && cu.value.indexOf(B.site.domain) < 0; if (cu.getAttribute('aria-invalid') === 'true') vUrl(); });
    cl.addEventListener('input', function () { if (cl.getAttribute('aria-invalid') === 'true') vLabel(); });
    cf.addEventListener('submit', function (e) {
      e.preventDefault();
      var a = vLabel(), b = vUrl();
      if (!a || !b) { (a ? cu : cl).focus(); return; }
      addItems([{ label: cl.value.trim(), url: cu.value.trim(), type: 'custom', icon: /^https?:/i.test(cu.value) ? 'open_in_new' : 'link', newTab: ct.checked, button: false }], 'رابط مخصص');
      cf.reset(); ct._touched = false; cl.focus();
    });
    function focusAdd() {
      var c = $('#add'); c.scrollIntoView({ behavior: UI.reduceMotion ? 'auto' : 'smooth', block: 'start' });
      setTimeout(function () { var t = $('#add-tabs [aria-selected="true"]'); if (t) t.focus({ preventScroll: true }); }, 300);
    }
    window.__focusMenuAdd = focusAdd;
    $('#mb-add-jump').addEventListener('click', focusAdd);

    /* ---------- tabs, toolbar, shortcuts ---------- */
    var tabsApi = UI.initTabs($('#mb-tabs'), function (t) {
      tab = t.getAttribute('data-value'); pendingSnap = null; focusId = null;
      $('#mb-panel').setAttribute('aria-labelledby', t.id);
      $('#pv-state').hidden = tab !== 'header';
      renderAll();
    });
    function selectTab(v) { var t = $('#mb-tabs [data-value="' + v + '"]'); if (t) tabsApi.select(t); }
    UI.initSeg($('#pv-device'), function (v) { device = v; renderPreview(); });
    UI.initSeg($('#pv-state'), function (v) { hstate = v; renderPreview(); });
    $$('#pv-device button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-value') === device ? 'true' : 'false'); });
    $('#mb-undo').addEventListener('click', function () { if (this.getAttribute('aria-disabled') !== 'true') undo(); });
    $('#mb-save').addEventListener('click', save);
    $('#mb-reset').addEventListener('click', resetTab);
    document.addEventListener('keydown', function (e) {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || UI.Layers.top()) return;
      var k = (e.key || '').toLowerCase();
      if (k === 's' || e.code === 'KeyS') { e.preventDefault(); save(); }
      else if ((k === 'z' || e.code === 'KeyZ') && !e.shiftKey && !e.target.closest('input, textarea, [contenteditable="true"]')) { e.preventDefault(); undo(); }
    });
    window.addEventListener('beforeunload', function (e) { if (isDirty('header') || isDirty('footer')) { e.preventDefault(); e.returnValue = ''; } });
    window.addEventListener('storage', function (e) { if (e.key === 'almel-admin-pages' || e.key === 'almel-admin-home-sections') renderPickers(); });

    renderAll();
    if (location.hash === '#add') setTimeout(focusAdd, 150);
    window.__menuBuilder = { state: state, isDirty: isDirty };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
