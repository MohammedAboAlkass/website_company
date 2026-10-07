/* =========================================================================
   جمعية الشمال للتنمية والتطوير المجتمعي — Admin template script (static, no backend)
   1. Utilities & formatting      5. Command palette
   2. Layers (Esc + focus trap)   6. Charts (inline SVG, RTL time axis)
   3. UI components               7. Page modules (data-page on <body>)
   4. App shell (sidebar/topbar)
   All data comes from window.ADMIN_DATA (js/admin-data.js — demo only).
   ========================================================================= */
(function () {
  'use strict';

  /* ---------- 1. Utilities ---------- */
  var D = window.ADMIN_DATA || {};
  // Real signed-in user (Laravel injects window.__ADMIN_USER = {name, email, role, role_label} in layouts/admin.blade.php)
  var ME = window.__ADMIN_USER || null;
  if (ME) {
    var _nm = String(ME.name || '').trim();
    D.user = { name: _nm || ME.email, email: ME.email, avatar: ME.avatar || '', role: ME.role_label || ME.role, roleKey: ME.role, initials: _nm ? _nm.charAt(0) : String(ME.email || '؟').charAt(0).toUpperCase() };
  }
  function doLogout() {
    var meta = document.querySelector('meta[name="csrf-token"]');
    var f = document.createElement('form');
    f.method = 'POST'; f.action = '/admin/logout'; f.style.display = 'none';
    var i = document.createElement('input'); i.type = 'hidden'; i.name = '_token'; i.value = meta ? meta.getAttribute('content') : '';
    f.appendChild(i); document.body.appendChild(f); f.submit();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-logout]') : null;
    if (b) { e.preventDefault(); doLogout(); }
  });
  var html = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var icon = function (n, cls) { return '<span class="material-symbols-outlined' + (cls ? ' ' + cls : '') + '" aria-hidden="true">' + n + '</span>'; };
  var fmtNum = function (n) { return Number(n).toLocaleString('en-US'); };
  var fmtMoney = function (n) { return '$' + fmtNum(Math.round(n)); };
  var fmtCompact = function (n, cur) {
    var p = cur === false ? '' : '$';
    if (Math.abs(n) >= 1e6) return p + (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (Math.abs(n) >= 1e3) return p + (n / 1e3).toFixed(n >= 1e5 ? 0 : 1).replace(/\.0$/, '') + 'K';
    return p + Math.round(n);
  };
  var pct = function (a, b) { return b ? Math.min(100, Math.round((a / b) * 100)) : 0; };
  var uid = (function () { var i = 0; return function (p) { return (p || 'u') + (++i); }; })();
  /* ثوابت النظام: عيّن قيمة قائمة حتى لو كان خيارها معطّلاً/محذوفاً */
  function AC_set(sel, v) { if (window.AdminConstants) window.AdminConstants.setValue(sel, v); else sel.value = v == null ? '' : v; }
  var byId = function (list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function plural(n, one, two, few, many) {
    if (n === 1) return one; if (n === 2) return two;
    if (n >= 3 && n <= 10) return n + ' ' + few; return n + ' ' + many;
  }
  function ago(mins) {
    if (mins == null) return '—';
    if (mins < 1) return 'الآن';
    if (mins < 60) return 'قبل ' + plural(mins, 'دقيقة', 'دقيقتين', 'دقائق', 'دقيقة');
    var h = Math.floor(mins / 60);
    if (h < 24) return 'قبل ' + plural(h, 'ساعة', 'ساعتين', 'ساعات', 'ساعة');
    var d = Math.floor(h / 24);
    if (d < 30) return 'قبل ' + plural(d, 'يوم', 'يومين', 'أيام', 'يوماً');
    var m = Math.floor(d / 30);
    return 'قبل ' + plural(m, 'شهر', 'شهرين', 'أشهر', 'شهراً');
  }
  var LOCALE = 'ar-EG-u-nu-latn';
  function fmtDate(d, opts) { return new Intl.DateTimeFormat(LOCALE, opts || { day: 'numeric', month: 'long', year: 'numeric' }).format(d); }
  function parseISO(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function normalize(s) {
    return String(s || '').toLowerCase()
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();
  }
  /* تسميات الثوابت المعدّلة تنعكس على الجداول والبطاقات أيضاً */
  function acLabel(group, id, fallback) { var l = window.AdminConstants && window.AdminConstants.label(group, id); return l || fallback; }
  function cat(id) { var c = byId(D.categories || [], id) || { label: id, icon: 'category' }; return Object.assign({}, c, { label: acLabel('project_category', id, c.label) }); }
  function pStatus(id) { var s = byId(D.projectStatuses || [], id) || { label: id, tone: 'neutral' }; return Object.assign({}, s, { label: acLabel('project_status', id, s.label) }); }
  function pill(label, tone) { return '<span class="pill pill-' + tone + '">' + esc(label) + '</span>'; }
  var MSG_TYPES = { contact: { label: 'تواصل', tone: 'info', icon: 'chat' }, volunteer: { label: 'تطوع', tone: 'warn', icon: 'handshake' }, donation: { label: 'استفسار تبرع', tone: 'neutral', icon: 'payments' } };
  // Profile photo markup (img when the user has one, else the initial letter; a broken image falls back to the letter, see the capture listener below)
  function avatarInner(u) { return u && u.avatar ? '<img src="' + esc(u.avatar) + '" alt="">' : esc((u && u.initials) || 'م'); }
  function initials(name) { var s = String(name || '').replace(/[#\d]/g, '').trim(); return s ? s.charAt(0) : '؟'; }
  function readFileAsDataURL(file) {
    return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = rej; r.readAsDataURL(file); });
  }
  function fmtSize(b) { return b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }

  /* ---------- Appearance preferences (saved in /admin/settings, applied on every page) ----------
     localStorage "almel-admin-appearance" = { accent, scale, density, sidebar, radius }.
     Defaults inject nothing, so pages look exactly as designed until something is changed. */
  var Appearance = (function () {
    var KEY = 'almel-admin-appearance';
    var DEF = { accent: '#f28c14', scale: 'md', density: 'comfortable', sidebar: 'navy', radius: 'md' };
    var SCALES = { sm: 0.9375, md: 1, lg: 1.0625, xl: 1.125 };
    var RADII = { sharp: [10, 8, 6, 4], md: [20, 16, 12, 8], round: [26, 22, 16, 12] };
    var OPTS = { density: ['comfortable', 'compact'], sidebar: ['navy', 'midnight', 'glow'] };
    function rgb(h) { var m = /^#([0-9a-f]{6})$/i.exec(String(h || '')); if (!m) return null; var n = parseInt(m[1], 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
    function hex(c) { return '#' + c.map(function (v) { return ('0' + Math.round(Math.max(0, Math.min(255, v))).toString(16)).slice(-2); }).join(''); }
    function mix(a, b, t) { return [0, 1, 2].map(function (i) { return a[i] + (b[i] - a[i]) * t; }); }
    function lum(c) { var a = c.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; }
    function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
    function toward(c, target, bgs, ratio) { for (var t = 0; t <= 1.0001; t += 0.02) { var m = mix(c, target, t); if (bgs.every(function (bg) { return contrast(m, bg) >= ratio; })) return m; } return target; }
    function derive(accent) {
      var c = rgb(accent) || rgb(DEF.accent), W = [255, 255, 255], K = [0, 0, 0];
      var navy = rgb('#001a3c'), navy9 = rgb('#00112a'), d1 = rgb('#0f1a2e'), d3 = rgb('#16253f'), tint = mix(c, W, 0.88);
      var rgba = function (a) { return 'rgba(' + c.map(Math.round).join(',') + ',' + a + ')'; };
      return {
        base: hex(c), s50: hex(tint), s300: hex(toward(mix(c, W, 0.3), W, [navy], 4.5)), s400: hex(mix(c, W, 0.15)), s600: hex(mix(c, K, 0.2)),
        text: hex(toward(c, K, [W, tint, rgb('#f6f5f2')], 4.6)), textDark: hex(toward(c, W, [d1, d3], 4.6)),
        focus: hex(toward(c, K, [W], 3.2)), onAccent: contrast(c, navy9) >= contrast(c, W) ? '#00112a' : '#ffffff',
        tintDark: rgba(0.16), glow: rgba(0.22)
      };
    }
    function clean(p) {
      p = p && typeof p === 'object' ? p : {};
      var o = {};
      o.accent = rgb(p.accent) ? String(p.accent).toLowerCase() : DEF.accent;
      o.scale = SCALES[p.scale] ? p.scale : DEF.scale;
      o.density = OPTS.density.indexOf(p.density) >= 0 ? p.density : DEF.density;
      o.sidebar = OPTS.sidebar.indexOf(p.sidebar) >= 0 ? p.sidebar : DEF.sidebar;
      o.radius = RADII[p.radius] ? p.radius : DEF.radius;
      return o;
    }
    function read() { try { return clean(JSON.parse(localStorage.getItem(KEY))); } catch (e) { return clean(null); } }
    function css(p) {
      var out = '';
      if (p.accent !== DEF.accent) {
        var a = derive(p.accent);
        out += ':root{--amber-50:' + a.s50 + ';--amber-300:' + a.s300 + ';--amber-400:' + a.s400 + ';--amber-500:' + a.base + ';--amber-600:' + a.s600 + ';--amber-700:' + a.text +
          ';--accent:' + a.base + ';--accent-text:' + a.text + ';--accent-tint:' + a.s50 + ';--focus:' + a.focus + ';--c-2:' + a.base + ';--c-4:' + a.s300 + ';--on-accent:' + a.onAccent + '}' +
          'html.dark{--accent-text:' + a.textDark + ';--accent-tint:' + a.tintDark + ';--focus:' + a.textDark + ';--c-2:' + a.s400 + '}' +
          '.btn-accent,.sb-count.is-accent{color:var(--on-accent)}.sidebar::before{background:radial-gradient(420px 260px at 100% 0%,' + a.glow + ',transparent 70%)}';
      }
      if (p.radius !== DEF.radius) { var r = RADII[p.radius]; out += ':root{--radius-lg:' + r[0] + 'px;--radius:' + r[1] + 'px;--radius-sm:' + r[2] + 'px;--radius-xs:' + r[3] + 'px}'; }
      if (p.scale !== DEF.scale) out += '.content{zoom:' + SCALES[p.scale] + '}';
      return out;
    }
    function apply(p) {
      p = clean(p);
      html.classList.toggle('ui-compact', p.density === 'compact');
      html.classList.toggle('sb-midnight', p.sidebar === 'midnight');
      html.classList.toggle('sb-glow', p.sidebar === 'glow');
      html.setAttribute('data-radius', p.radius);
      var text = css(p), el = document.getElementById('admin-appearance');
      if (!text) { if (el) el.remove(); return p; }
      if (!el) { el = document.createElement('style'); el.id = 'admin-appearance'; document.head.appendChild(el); }
      el.textContent = text;
      return p;
    }
    // theme "auto": follow the system while no explicit theme is stored
    if (window.matchMedia) {
      var mq = matchMedia('(prefers-color-scheme: dark)');
      var onMq = function () { if (store.get('almel-admin-theme', null) === null) { html.classList.toggle('dark', mq.matches); if (typeof syncThemeButtons === 'function') syncThemeButtons(); } };
      /* light is the default: do not follow the system theme */
    }
    return { KEY: KEY, DEF: DEF, SCALES: SCALES, RADII: RADII, read: read, apply: apply, clean: clean, derive: derive, contrast: function (a, b) { return contrast(rgb(a), rgb(b)); } };
  })();
  try { Appearance.apply(Appearance.read()); } catch (e) { /* keep defaults */ }
  window.AdminAppearance = Appearance;

  /* ---------- 2. Layers: Esc closes the top layer, Tab is trapped ---------- */
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
  function focusables(root) {
    return $$(FOCUSABLE, root).filter(function (el) {
      if (el.closest('[hidden]') || el.closest('[inert]')) return false;
      var cs = getComputedStyle(el);
      return cs.visibility !== 'hidden' && cs.display !== 'none' && el.getClientRects().length > 0;
    });
  }
  var Layers = {
    stack: [],
    push: function (el, close, opts) {
      opts = opts || {};
      var layer = { el: el, close: close, trap: opts.trap !== false, prev: opts.returnFocus || document.activeElement, outside: opts.outside, trigger: opts.trigger };
      this.stack.push(layer);
      if (opts.modal) { layer.modal = true; document.body.classList.add('no-scroll'); }
      var focusTarget = opts.focus;
      setTimeout(function () {
        var t = typeof focusTarget === 'string' ? $(focusTarget, el) : focusTarget;
        t = t || focusables(el)[0] || el;
        if (t === el && !el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
        try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); }
      }, opts.delay != null ? opts.delay : 30);
      return layer;
    },
    remove: function (el, restore) {
      for (var i = this.stack.length - 1; i >= 0; i--) {
        if (this.stack[i].el === el) {
          var l = this.stack.splice(i, 1)[0];
          if (!this.stack.some(function (x) { return x.modal; })) document.body.classList.remove('no-scroll');
          if (restore !== false && l.prev && document.contains(l.prev) && l.prev.getClientRects().length) { try { l.prev.focus({ preventScroll: true }); } catch (e) { l.prev.focus(); } }
          return l;
        }
      }
      return null;
    },
    has: function (el) { return this.stack.some(function (l) { return l.el === el; }); },
    top: function () { return this.stack[this.stack.length - 1]; }
  };
  document.addEventListener('keydown', function (e) {
    var top = Layers.top();
    if (!top) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); top.close(); return; }
    if (e.key === 'Tab' && top.trap) {
      var f = focusables(top.el);
      if (!f.length) { e.preventDefault(); return; }
      var first = f[0], last = f[f.length - 1];
      if (!top.el.contains(document.activeElement)) { e.preventDefault(); first.focus(); return; }
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, true);
  document.addEventListener('pointerdown', function (e) {
    var top = Layers.top();
    if (!top || !top.outside) return;
    if (top.el.contains(e.target) || (top.trigger && top.trigger.contains(e.target))) return;
    top.close(false);
  });

  /* ---------- 3. UI components ---------- */
  // Toasts
  function toast(title, opts) {
    opts = opts || {};
    var region = $('#toasts');
    if (!region) { region = document.createElement('div'); region.id = 'toasts'; region.className = 'toasts'; region.setAttribute('role', 'status'); region.setAttribute('aria-live', 'polite'); document.body.appendChild(region); }
    var tone = opts.tone || 'success';
    var ic = opts.icon || (tone === 'danger' ? 'delete' : tone === 'info' ? 'info' : 'check');
    var t = document.createElement('div');
    t.className = 'toast ' + tone;
    t.innerHTML = '<span class="t-ico">' + icon(ic) + '</span><div class="t-body"><strong>' + esc(title) + '</strong>' + (opts.text ? '<span>' + esc(opts.text) + '</span>' : '') + '</div><button type="button" class="t-close" aria-label="إغلاق الإشعار">' + icon('close') + '</button>';
    region.appendChild(t);
    var done = false;
    var kill = function () { if (done) return; done = true; t.classList.add('out'); setTimeout(function () { t.remove(); }, reduceMotion ? 0 : 260); };
    t.querySelector('.t-close').addEventListener('click', kill);
    setTimeout(kill, opts.duration || 4200);
    return t;
  }

  // Overlay helper
  function makeOverlay(onClick) {
    var o = document.createElement('div'); o.className = 'overlay'; o.setAttribute('aria-hidden', 'true');
    if (onClick) o.addEventListener('click', onClick);
    document.body.appendChild(o); return o;
  }

  // Modal (returns a Promise<boolean>)
  function modal(o) {
    return new Promise(function (resolve) {
      var id = uid('modal');
      var overlay = makeOverlay();
      var wrap = document.createElement('div');
      wrap.className = 'modal';
      var tone = o.tone || (o.danger ? 'danger' : 'info');
      wrap.innerHTML = '<div class="modal-dialog' + (o.size === 'lg' ? ' lg' : '') + '" role="' + (o.danger ? 'alertdialog' : 'dialog') + '" aria-modal="true" aria-labelledby="' + id + '-t"' + (o.text ? ' aria-describedby="' + id + '-d"' : '') + '>' +
        '<button type="button" class="icon-btn sm modal-close" aria-label="إغلاق">' + icon('close') + '</button>' +
        '<div class="modal-body">' + (o.icon ? '<div class="modal-icon tone-' + (tone === 'danger' ? 'danger' : tone === 'warn' ? 'gold' : 'info') + '">' + icon(o.icon) + '</div>' : '') +
        '<h2 class="modal-title" id="' + id + '-t">' + esc(o.title) + '</h2>' +
        (o.text ? '<p class="modal-text" id="' + id + '-d">' + esc(o.text) + '</p>' : '') + (o.body || '') + '</div>' +
        '<div class="modal-foot"><button type="button" class="btn btn-secondary" data-act="cancel">' + esc(o.cancelText || 'إلغاء') + '</button>' +
        '<button type="button" class="btn ' + (o.danger ? 'btn-danger' : 'btn-primary') + '" data-act="ok">' + esc(o.confirmText || 'تأكيد') + '</button></div></div>';
      document.body.appendChild(wrap);
      var dialog = wrap.firstChild;
      var finished = false;
      function close(val) {
        if (finished) return; finished = true;
        Layers.remove(wrap);
        wrap.remove(); overlay.remove();
        resolve(val);
      }
      wrap.addEventListener('click', function (e) { if (e.target === wrap) close(false); });
      dialog.querySelector('.modal-close').addEventListener('click', function () { close(false); });
      dialog.querySelector('[data-act="cancel"]').addEventListener('click', function () { close(false); });
      dialog.querySelector('[data-act="ok"]').addEventListener('click', function () {
        if (o.validate && !o.validate(dialog)) return;
        var v = o.getValue ? o.getValue(dialog) : true; close(v);
      });
      if (o.onOpen) o.onOpen(dialog);
      Layers.push(wrap, function () { close(false); }, { modal: true, focus: o.focus || (o.danger ? '[data-act="cancel"]' : null) });
    });
  }
  function confirmDelete(what, text) {
    return modal({ title: 'حذف ' + what + '؟', text: text || 'لا يمكن التراجع عن هذا الإجراء. سيُحذف العنصر من هذه المعاينة فقط.', icon: 'delete', danger: true, confirmText: 'نعم، احذف', cancelText: 'إلغاء' });
  }

  // Reusable confirm dialog (AdminUI.confirm, options: title, text, confirmLabel, cancelLabel, tone) -> Promise<boolean>.
  // Also driven declaratively by data-confirm="..." (see the delegated handlers below).
  function confirmDialog(o) {
    if (typeof o === 'string') o = { text: o };
    o = o || {};
    var danger = o.tone === 'danger' || o.danger === true;
    return modal({
      title: o.title || (danger ? 'تأكيد الحذف' : 'تأكيد الإجراء'),
      text: o.text || '',
      icon: o.icon || (danger ? 'delete' : 'help'),
      danger: danger,
      tone: o.tone === 'warn' ? 'warn' : (danger ? 'danger' : 'info'),
      confirmText: o.confirmLabel || (danger ? 'نعم، احذف' : 'تأكيد'),
      cancelText: o.cancelLabel || 'إلغاء',
      focus: danger ? '[data-act="cancel"]' : '[data-act="ok"]',
      onOpen: function (d) {
        // Enter confirms unless focus is on a control that already handles Enter (buttons, links, fields).
        d.addEventListener('keydown', function (e) {
          if (e.key !== 'Enter' || e.isComposing || e.defaultPrevented) return;
          if (/^(BUTTON|A|TEXTAREA|SELECT|INPUT)$/.test(e.target.tagName)) return;
          e.preventDefault();
          var ok = d.querySelector('[data-act="ok"]'); if (ok) ok.click();
        });
      }
    });
  }
  function confirmOpts(el) {
    var ds = el.dataset || {};
    return { text: ds.confirm || '', title: ds.confirmTitle || '', confirmLabel: ds.confirmLabel || '', cancelLabel: ds.confirmCancel || '', tone: ds.tone || '', icon: ds.confirmIcon || '' };
  }
  // Forms: <form data-confirm="نص" data-confirm-title data-confirm-label data-tone="danger">
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || !f.hasAttribute || !f.hasAttribute('data-confirm')) return;
    if (f.__confirmed) { f.__confirmed = false; return; } // second pass, after the user confirmed
    e.preventDefault(); e.stopImmediatePropagation();
    if (f.__confirming) return; // dialog already open (double click / double Enter)
    f.__confirming = true;
    var sub = e.submitter || null;
    confirmDialog(confirmOpts(f)).then(function (ok) {
      f.__confirming = false;
      if (!ok) return;
      f.__confirmed = true;
      if (typeof f.requestSubmit === 'function') { try { f.requestSubmit(sub && sub.form === f ? sub : undefined); return; } catch (err) { /* fall through */ } }
      f.__confirmed = false; f.submit();
    });
  }, true);
  // Buttons / links (not forms): <button data-confirm="..."> or <a href data-confirm="...">
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-confirm]:not(form)') : null;
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    if (el.__confirmed) { el.__confirmed = false; return; }
    e.preventDefault(); e.stopImmediatePropagation();
    if (el.__confirming) return;
    el.__confirming = true;
    confirmDialog(confirmOpts(el)).then(function (ok) {
      el.__confirming = false;
      if (!ok) return;
      el.__confirmed = true; el.click();
    });
  }, true);

  // Drawer (element already in the page)
  var Drawer = {
    open: function (el, opts) {
      if (Layers.has(el)) return;
      opts = opts || {};
      el._overlay = makeOverlay(function () { Drawer.close(el); });
      el.hidden = false;
      void el.offsetWidth;
      el.classList.add('is-open');
      el.setAttribute('aria-hidden', 'false');
      Layers.push(el, function () { Drawer.close(el); }, { modal: true, focus: opts.focus, returnFocus: opts.returnFocus, delay: 60 });
    },
    close: function (el) {
      if (!Layers.has(el)) return;
      el.classList.remove('is-open');
      if (el._overlay) { el._overlay.remove(); el._overlay = null; }
      Layers.remove(el);
      if (el._onClose) el._onClose();
    }
  };
  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-close-drawer]');
    if (c) { var d = c.closest('.drawer, .detail-panel'); if (d) Drawer.close(d); }
  });

  // Dropdowns: [data-dd] button with aria-controls → panel
  function openDropdown(btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel || Layers.has(panel)) return;
    Layers.stack.slice().forEach(function (l) { if (l.outside) l.close(false); });
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    var isMenu = panel.getAttribute('role') === 'menu';
    Layers.push(panel, function (restore) { closeDropdown(btn, restore); }, { outside: true, trigger: btn, focus: isMenu ? '[role="menuitem"]' : null, delay: 10 });
    if (btn._onOpen) btn._onOpen(panel);
  }
  function closeDropdown(btn, restore) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    Layers.remove(panel, restore !== false);
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-dd]');
    if (!btn) return;
    e.preventDefault();
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (panel && Layers.has(panel)) closeDropdown(btn); else openDropdown(btn);
  });
  // Arrow-key navigation inside any role=menu
  document.addEventListener('keydown', function (e) {
    var menu = e.target.closest && e.target.closest('[role="menu"]');
    if (!menu) return;
    var items = $$('[role="menuitem"]', menu).filter(function (i) { return !i.disabled; });
    var i = items.indexOf(e.target);
    var next = null;
    if (e.key === 'ArrowDown') next = items[(i + 1) % items.length];
    else if (e.key === 'ArrowUp') next = items[(i - 1 + items.length) % items.length];
    else if (e.key === 'Home') next = items[0];
    else if (e.key === 'End') next = items[items.length - 1];
    if (next) { e.preventDefault(); next.focus(); }
  });

  // Floating row menu (positioned fixed so table scroll containers don't clip it)
  function rowMenu(btn, items) {
    var existing = $('.row-menu');
    if (existing && existing._btn === btn) { existing._close(); return; }
    if (existing) existing._close(false);
    var m = document.createElement('div');
    m.className = 'row-menu'; m.setAttribute('role', 'menu'); m.id = uid('rowmenu');
    m.innerHTML = items.map(function (it, idx) {
      if (it === '-') return '<div class="menu-sep" role="separator"></div>';
      return '<button type="button" role="menuitem" class="menu-item' + (it.danger ? ' danger' : '') + '" data-i="' + idx + '">' + icon(it.icon) + esc(it.label) + '</button>';
    }).join('');
    document.body.appendChild(m);
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-controls', m.id);
    var r = btn.getBoundingClientRect();
    var mw = m.offsetWidth, mh = m.offsetHeight;
    var left = Math.max(8, Math.min(r.left, window.innerWidth - mw - 8));
    var top = r.bottom + 6;
    if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 6);
    m.style.left = left + 'px'; m.style.top = top + 'px';
    m._btn = btn;
    var close = function (restore) {
      if (!m.isConnected) return;
      m.remove(); btn.setAttribute('aria-expanded', 'false'); btn.removeAttribute('aria-controls');
      Layers.remove(m, restore !== false);
      window.removeEventListener('scroll', onScroll, true); window.removeEventListener('resize', onScroll);
    };
    var onScroll = function (e) { if (!m.contains(e.target)) close(false); };
    m._close = close;
    m.addEventListener('click', function (e) {
      var b = e.target.closest('[data-i]'); if (!b) return;
      var it = items[+b.getAttribute('data-i')];
      close(); if (it.action) it.action();
    });
    window.addEventListener('scroll', onScroll, true); window.addEventListener('resize', onScroll);
    Layers.push(m, close, { outside: true, trigger: btn, focus: '[role="menuitem"]', delay: 0 });
  }

  // Tabs: [role=tablist] with [role=tab][aria-controls]
  function initTabs(list, onChange) {
    var tabs = $$('[role="tab"]', list);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var p = t.getAttribute('aria-controls') && document.getElementById(t.getAttribute('aria-controls'));
        if (p && list.getAttribute('data-shared-panel') !== 'true') p.hidden = !on;
      });
      if (focus) tab.focus();
      if (onChange) onChange(tab);
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(t), n = null;
        var vertical = list.getAttribute('aria-orientation') === 'vertical';
        // RTL: ArrowLeft moves forward, ArrowRight moves back
        if (e.key === 'ArrowLeft' || (vertical && e.key === 'ArrowDown')) n = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowRight' || (vertical && e.key === 'ArrowUp')) n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') n = tabs[0];
        else if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
    return { select: select, tabs: tabs };
  }

  // Segmented buttons (aria-pressed)
  function initSeg(seg, onChange) {
    var btns = $$('button', seg);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        if (onChange) onChange(b.getAttribute('data-value'), b);
      });
    });
  }

  // Switches
  document.addEventListener('click', function (e) {
    var sw = e.target.closest('.switch[role="switch"]');
    if (!sw) return;
    var on = sw.getAttribute('aria-checked') !== 'true';
    sw.setAttribute('aria-checked', on ? 'true' : 'false');
    sw.dispatchEvent(new CustomEvent('switch', { bubbles: true, detail: { on: on } }));
  });

  // Pagination markup
  function pagination(el, total, page, per, onGo) {
    var pages = Math.max(1, Math.ceil(total / per));
    if (page > pages) page = pages;
    var from = total ? (page - 1) * per + 1 : 0, to = Math.min(total, page * per);
    var h = '<p class="info">عرض <b class="num">' + from + '–' + to + '</b> من <b class="num">' + total + '</b></p><div class="pages" role="group" aria-label="التنقل بين الصفحات">' +
      '<button type="button" class="page-btn" data-go="' + (page - 1) + '" aria-label="الصفحة السابقة"' + (page <= 1 ? ' disabled' : '') + '>' + icon('chevron_right') + '</button>';
    for (var i = 1; i <= pages; i++) h += '<button type="button" class="page-btn" data-go="' + i + '"' + (i === page ? ' aria-current="page"' : '') + ' aria-label="الصفحة ' + i + '">' + i + '</button>';
    h += '<button type="button" class="page-btn" data-go="' + (page + 1) + '" aria-label="الصفحة التالية"' + (page >= pages ? ' disabled' : '') + '>' + icon('chevron_left') + '</button></div>';
    el.innerHTML = h;
    $$('[data-go]', el).forEach(function (b) { b.addEventListener('click', function () { onGo(+b.getAttribute('data-go')); }); });
  }

  function emptyState(ic, title, text, action) {
    return '<div class="empty">' + '<div class="empty-ico">' + icon(ic) + '</div><h3>' + esc(title) + '</h3><p>' + esc(text) + '</p>' + (action || '') + '</div>';
  }

  // Dropzone wiring (click + drag & drop). cb(files)
  function wireDropzone(dz, cb) {
    var input = $('input[type=file]', dz);
    ['dragenter', 'dragover'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('is-over'); }); });
    ['dragleave', 'dragend'].forEach(function (ev) { dz.addEventListener(ev, function (e) { if (!dz.contains(e.relatedTarget)) dz.classList.remove('is-over'); }); });
    dz.addEventListener('drop', function (e) {
      e.preventDefault(); dz.classList.remove('is-over');
      var files = Array.prototype.filter.call(e.dataTransfer.files || [], function (f) { return /^image\//.test(f.type); });
      if (files.length) cb(files); else toast('الملف غير مدعوم', { text: 'يمكن رفع الصور فقط (JPG، PNG، WebP).', tone: 'danger', icon: 'error' });
    });
    if (input) input.addEventListener('change', function () { var f = Array.prototype.slice.call(input.files || []); if (f.length) cb(f); input.value = ''; });
  }

  /* ---------- 4. App shell ---------- */
  var PAGE = document.body.getAttribute('data-page') || '';
  var unreadCount = function () { if (window.__ADMIN_COUNTS) return window.__ADMIN_COUNTS.messages_unread | 0; return (D.messages || []).filter(function (m) { return !m.read && !m.archived; }).length; };
  var NAV = [
    { group: 'عام', items: [
      { id: 'index', href: '/admin', icon: 'space_dashboard', label: 'نظرة عامة' },
      { id: 'reports', href: '/admin/reports', icon: 'monitoring', label: 'التقارير والإحصائيات' }
    ] },
    { group: 'المحتوى', items: [
      { id: 'homepage', href: '/admin/homepage', icon: 'home', label: 'الصفحة الرئيسية' },
      { id: 'hero', perm: 'homepage', href: '/admin/hero', icon: 'slideshow', label: 'إعدادات الهيرو' },
      { id: 'projects', href: '/admin/projects', icon: 'volunteer_activism', label: 'إدارة المشاريع', count: function () { return window.__ADMIN_COUNTS ? (window.__ADMIN_COUNTS.projects | 0) : (D.projects || []).length; }, countLabel: 'مشروعاً' },
      { id: 'news', href: '/admin/news', icon: 'newspaper', label: 'الأخبار', count: function () { return window.__ADMIN_COUNTS ? (window.__ADMIN_COUNTS.news_drafts | 0) : (D.news || []).filter(function (n) { return n.status === 'draft'; }).length; }, countLabel: 'مسودات' },
      { id: 'tags', href: '/admin/tags', icon: 'sell', label: 'الوسوم' },
      { id: 'gallery', href: '/admin/gallery', icon: 'photo_library', label: 'معرض الصور' },
      { id: 'media', href: '/admin/media', icon: 'perm_media', label: 'مكتبة الوسائط' },
      { id: 'stories', href: '/admin/stories', icon: 'format_quote', label: 'قصص الميدان' },
      { id: 'activities', href: '/admin/activities', icon: 'event_available', label: 'الأنشطة الميدانية' },
      { id: 'partners', href: '/admin/partners', icon: 'handshake', label: 'الشركاء' },
      { id: 'faq', href: '/admin/faq', icon: 'help', label: 'الأسئلة الشائعة' },
      { id: 'appeal', href: '/admin/appeal', icon: 'campaign', label: 'نداء الإغاثة' },
      { id: 'announcements', href: '/admin/announcements', icon: 'notifications_active', label: 'الإعلانات' },
      { id: 'impact', href: '/admin/impact', icon: 'map', label: 'خريطة الأثر' },
      { id: 'vision', href: '/admin/vision', icon: 'visibility', label: 'الرؤية والرسالة والقيم' },
      { id: 'pages', href: '/admin/pages', icon: 'web', label: 'إدارة الصفحات' },
      { id: 'site-texts', perm: 'pages', href: '/admin/site-texts', icon: 'edit_note', label: 'نصوص الموقع' },
      { id: 'menu', href: '/admin/menu', icon: 'menu_open', label: 'إدارة القائمة' }
    ] },
    { group: 'التواصل', items: [
      { id: 'messages', href: '/admin/messages', icon: 'inbox', label: 'الرسائل والطلبات', count: unreadCount, countLabel: 'غير مقروءة', accent: true },
      { id: 'newsletter', perm: 'messages', href: '/admin/newsletter', icon: 'mark_email_read', label: 'المشتركون' }
    ] },
    { group: 'النظام', items: [
      { id: 'users', href: '/admin/users', icon: 'manage_accounts', label: 'المستخدمون', adminOnly: true },
      { id: 'roles', href: '/admin/roles', icon: 'admin_panel_settings', label: 'الأدوار والصلاحيات' },
      { id: 'backup', href: '/admin/backup', icon: 'backup', label: 'النسخ الاحتياطي', adminOnly: true },
      { id: 'audit', href: '/admin/audit-logs', icon: 'history', label: 'سجل العمليات' },
      { id: 'settings', href: '/admin/settings', icon: 'settings', label: 'الإعدادات', adminOnly: true }
    ] }
  ];
  // Permissions (window.__ADMIN_USER.permissions, from the user's role): hide nav entries without <module>.view.
  // The server enforces the same rules (403) - this only keeps the menu clean.
  function can(k) { return !ME || !ME.permissions || ME.is_super || ME.permissions.indexOf(k) >= 0; }
  if (ME) {
    NAV.forEach(function (g) { g.items = g.items.filter(function (it) { return can((it.perm || (it.id === 'index' ? 'dashboard' : it.id)) + '.view'); }); });
    NAV = NAV.filter(function (g) { return g.items.length; });
  }
  var PAGES = {
    index: { title: 'نظرة عامة' }, reports: { title: 'التقارير والإحصائيات' }, projects: { title: 'إدارة المشاريع' },
    news: { title: 'الأخبار' }, 'news-edit': { title: 'تحرير خبر', parent: 'news' }, gallery: { title: 'معرض الصور' },
    messages: { title: 'الرسائل والطلبات' }, newsletter: { title: 'المشتركون' }, notifications: { title: 'الإشعارات' }, settings: { title: 'الإعدادات' }, users: { title: 'المستخدمون' }, roles: { title: 'الأدوار والصلاحيات' }, profile: { title: 'حسابي' },
    pages: { title: 'إدارة الصفحات' }, menu: { title: 'إدارة القائمة' }, homepage: { title: 'الصفحة الرئيسية' }, 'site-texts': { title: 'نصوص الموقع' }, hero: { title: 'إعدادات الهيرو' },
    stories: { title: 'قصص الميدان' }, activities: { title: 'الأنشطة الميدانية' }, partners: { title: 'الشركاء' }, faq: { title: 'الأسئلة الشائعة' },
    appeal: { title: 'نداء الإغاثة' }, announcements: { title: 'الإعلانات' }, impact: { title: 'خريطة الأثر' }, vision: { title: 'الرؤية والرسالة والقيم' }, backup: { title: 'النسخ الاحتياطي' },
    tags: { title: 'الوسوم' }, media: { title: 'مكتبة الوسائط' }, audit: { title: 'سجل العمليات' }
  };
  var LOGO = '<img src="/assets/site/img/logo.png" alt="شعار الجمعية" width="44" height="44">';

  function renderSidebar() {
    var sb = $('#sidebar');
    if (!sb) return;

    if (!sb.querySelector('.sb-nav')) {
      var active = (PAGES[PAGE] && PAGES[PAGE].parent) || PAGE;
      var h = '<div class="sb-head"><a class="sb-brand" href="/admin" data-tip="جمعية الشمال للتنمية والتطوير المجتمعي"><span class="brand-mark">' + LOGO + '</span><span class="sb-brand-text"><strong>' + esc(D.org ? D.org.name : 'جمعية الشمال للتنمية والتطوير المجتمعي') + '</strong><small>لوحة التحكم</small></span></a>' +
        '<button type="button" class="sb-collapse" id="sb-collapse" aria-controls="sidebar" aria-expanded="true" aria-label="طي القائمة الجانبية" data-tip="توسيع القائمة">' + icon('right_panel_close') + '</button>' +
        '<button type="button" class="sb-close" id="sb-close" aria-label="إغلاق القائمة">' + icon('close') + '</button></div>';
      h += '<nav class="sb-nav" aria-label="التنقل في لوحة التحكم">';
      NAV.forEach(function (g, gi) {
        h += '<div class="sb-group"><p class="sb-group-label" id="sbg-' + gi + '">' + esc(g.group) + '</p><ul aria-labelledby="sbg-' + gi + '">';
        g.items.forEach(function (it) {
          var c = it.count ? it.count() : 0;
          h += '<li><a class="sb-link" href="' + it.href + '" data-tip="' + esc(it.label) + '"' + (active === it.id ? ' aria-current="page"' : '') + '>' + icon(it.icon) + '<span class="sb-label">' + esc(it.label) + '</span>' +
            (c ? '<span class="sb-count' + (it.accent ? ' is-accent' : '') + '" data-count="' + it.id + '" aria-hidden="true">' + c + '</span><span class="sr-only" data-count-sr="' + it.id + '">، ' + c + ' ' + it.countLabel + '</span>' : '') + '</a></li>';
        });
        h += '</ul></div>';
      });
      h += '</nav>';
      var u = D.user || {};
      h += '<div class="sb-foot">' +
        '<div class="sb-user"><span class="avatar" aria-hidden="true" data-me-avatar data-ini="' + esc(u.initials || 'م') + '">' + avatarInner(u) + '</span><div class="sb-user-meta"><strong>' + esc(u.name) + '</strong><span>' + esc(u.role) + '</span></div>' +
        '<button type="button" class="sb-user-btn" data-logout aria-label="تسجيل الخروج" data-tip="تسجيل الخروج">' + icon('logout', 'flip-rtl') + '</button></div></div>';
      sb.innerHTML = h;
    }

    var collapseBtn = $('#sb-collapse');
    if (collapseBtn) {
      function syncCollapse() {
        var c = html.classList.contains('sb-collapsed');
        collapseBtn.setAttribute('aria-expanded', c ? 'false' : 'true');
        collapseBtn.setAttribute('aria-label', c ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية');
        collapseBtn.innerHTML = icon(c ? 'right_panel_open' : 'right_panel_close');
      }
      syncCollapse();
      collapseBtn.addEventListener('click', function () {
        html.classList.add('sb-animating');
        html.classList.toggle('sb-collapsed');
        store.set('almel-admin-sb', html.classList.contains('sb-collapsed') ? '1' : '0');
        syncCollapse();
        window.dispatchEvent(new Event('resize'));
        setTimeout(function () { html.classList.remove('sb-animating'); }, 300);
      });
    }
    var closeBtn = $('#sb-close');
    if (closeBtn) closeBtn.addEventListener('click', closeMobileNav);
    var bd = $('.sb-backdrop');
    if (!bd && sb.parentNode) {
      bd = document.createElement('div'); bd.className = 'sb-backdrop'; bd.setAttribute('aria-hidden', 'true');
      bd.addEventListener('click', closeMobileNav);
      sb.parentNode.insertBefore(bd, sb.nextSibling);
    }
    var sbNav = $('.sb-nav', sb);
    if (sbNav) {
      var savedScroll = sessionStorage.getItem('almel-admin-sb-scroll');
      if (savedScroll !== null) {
        sbNav.scrollTop = parseInt(savedScroll, 10);
      }
      sbNav.addEventListener('scroll', function () {
        sessionStorage.setItem('almel-admin-sb-scroll', sbNav.scrollTop);
      }, { passive: true });
    }

    // Instant hover prefetching & 0ms visual feedback on click
    document.addEventListener('pointerenter', function (e) {
      var a = e.target.closest ? e.target.closest('a.sb-link, a[href^="/admin"]') : null;
      if (!a || !a.href || a.__prefetched || a.href.indexOf('#') !== -1 || a.hasAttribute('data-logout')) return;
      a.__prefetched = true;
      var link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = a.href;
      document.head.appendChild(link);
    }, true);

    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a.sb-link') : null;
      if (!a || !a.href || (a.getAttribute('href') && a.getAttribute('href').charAt(0) === '#') || a.hasAttribute('data-logout') || e.ctrlKey || e.metaKey || e.shiftKey) return;
      $$('.sb-link[aria-current="page"]').forEach(function (el) { el.removeAttribute('aria-current'); });
      a.setAttribute('aria-current', 'page');
      var loader = $('#nav-loader');
      if (loader) loader.classList.add('is-loading');
    });
  }
  function openMobileNav() {
    var sb = $('#sidebar');
    html.classList.add('sb-open');
    sb.setAttribute('role', 'dialog'); sb.setAttribute('aria-modal', 'true'); sb.setAttribute('aria-label', 'القائمة الرئيسية');
    var btn = $('#tb-menu'); if (btn) btn.setAttribute('aria-expanded', 'true');
    Layers.push(sb, closeMobileNav, { modal: true, focus: '[aria-current="page"]', delay: 80 });
  }
  function closeMobileNav() {
    var sb = $('#sidebar');
    if (!html.classList.contains('sb-open')) return;
    html.classList.remove('sb-open');
    sb.removeAttribute('role'); sb.removeAttribute('aria-modal'); sb.removeAttribute('aria-label');
    var btn = $('#tb-menu'); if (btn) btn.setAttribute('aria-expanded', 'false');
    Layers.remove(sb);
  }
  if (window.matchMedia) matchMedia('(min-width: 1024px)').addEventListener('change', function (e) { if (e.matches) closeMobileNav(); });
  function updateCounts() {
    NAV.forEach(function (g) { g.items.forEach(function (it) {
      if (!it.count) return;
      var c = it.count();
      $$('[data-count="' + it.id + '"]').forEach(function (el) { el.textContent = c; el.hidden = !c; });
      $$('[data-count-sr="' + it.id + '"]').forEach(function (el) { el.textContent = c ? '، ' + c + ' ' + it.countLabel : ''; });
    }); });
  }

  function renderTopbar() {
    var tb = $('#topbar');
    if (!tb) return;
    var meta = PAGES[PAGE] || { title: '' };
    var crumbs = '<li><a href="/admin">لوحة التحكم</a></li>';
    if (meta.parent) crumbs += '<li><a href="' + meta.parent + '.html">' + esc(PAGES[meta.parent].title) + '</a></li>';
    if (PAGE !== 'index') crumbs += '<li aria-current="page">' + esc(meta.title) + '</li>';
    else crumbs = '<li><span aria-current="page">لوحة التحكم</span></li>';
    var NF = window.__ADMIN_NOTIF || { unread: 0, items: [], quiet: false };
    var unreadN = NF.unread | 0;
    function notifBadge(f) { var n = f.unread | 0; return n ? '<span class="notif-count' + (f.quiet ? ' quiet' : '') + '" id="notif-badge" aria-hidden="true">' + (n > 99 ? '99+' : n) + '</span>' : ''; }
    function notifItems(f) {
      if (!f.items || !f.items.length) return '<li class="notif-empty">لا توجد إشعارات حتى الآن.</li>';
      return f.items.map(function (n) {
        return '<li class="notif-item' + (n.unread ? ' unread' : '') + '"><a class="notif-link" href="' + esc(n.open) + '"><span class="ico tone-' + esc(n.tone) + '">' + icon(n.icon) + '</span><div><strong>' + esc(n.title) + '</strong>' + (n.text ? '<p>' + esc(n.text) + '</p>' : '') + '<time>' + ago(n.mins) + '</time></div></a>' + (n.unread ? '<span class="sr-only">غير مقروء</span>' : '') + '</li>';
      }).join('');
    }
    function notifApply(f) {
      var btn = $('#notif-btn'), list = $('#notif-list'); if (!btn || !list || !f) return;
      window.__ADMIN_NOTIF = f;
      var old = $('#notif-badge'); if (old) old.remove();
      btn.insertAdjacentHTML('beforeend', notifBadge(f));
      btn.setAttribute('aria-label', 'الإشعارات' + (f.unread ? '، ' + f.unread + ' غير مقروءة' : ''));
      list.innerHTML = notifItems(f);
    }
    function notifToken() { var m = document.querySelector('meta[name="csrf-token"]'); return m ? m.getAttribute('content') : ''; }
    function notifPull() {
      if (document.hidden) return;
      fetch('/admin/notifications/feed', { credentials: 'same-origin', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } })
        .then(function (r) { if (r.status === 401 || r.status === 403 || r.status === 419) { clearInterval(window.__notifTimer); return null; } return r.ok ? r.json() : null; })
        .then(function (f) { if (f) notifApply(f); })
        .catch(function () {});
    }
    var u = D.user || {};
    tb.innerHTML =
      '<button type="button" class="icon-btn tb-menu" id="tb-menu" aria-label="فتح القائمة" aria-controls="sidebar" aria-expanded="false">' + icon('menu') + '</button>' +
      '<nav class="breadcrumbs" aria-label="مسار التنقل"><ol>' + crumbs + '</ol></nav>' +
      '<div class="tb-spacer"></div>' +
      '<div class="tb-actions">' +
      '<button type="button" class="tb-search" id="tb-search" aria-haspopup="dialog" aria-label="بحث وأوامر سريعة (Ctrl+K)">' + icon('search') + '<span class="tb-search-text" aria-hidden="true">ابحث أو انتقل إلى…</span><kbd aria-hidden="true">Ctrl K</kbd></button>' +
      '<button type="button" class="icon-btn theme-toggle" aria-pressed="false" aria-label="الوضع الداكن">' + icon('dark_mode') + '</button>' +
      '<div class="dd"><button type="button" class="icon-btn" id="notif-btn" data-dd aria-controls="notif-panel" aria-expanded="false" aria-haspopup="dialog" aria-label="الإشعارات' + (unreadN ? '، ' + unreadN + ' غير مقروءة' : '') + '">' + icon('notifications') + notifBadge(NF) + '</button>' +
      '<div class="dd-panel notif-panel" id="notif-panel" role="dialog" aria-label="الإشعارات" hidden>' +
      '<div class="notif-head"><h2>الإشعارات</h2><button type="button" class="btn btn-ghost btn-sm" id="notif-read">' + icon('done_all') + 'تعليم الكل كمقروء</button></div>' +
      '<ul class="notif-list" id="notif-list">' + notifItems(NF) + '</ul>' +
      '<div class="notif-foot"><a class="btn btn-ghost btn-sm" href="/admin/notifications">عرض كل الإشعارات' + icon('arrow_back') + '</a></div></div></div>' +
      '<div class="dd"><button type="button" class="tb-user" id="user-btn" data-dd aria-controls="user-menu" aria-expanded="false" aria-haspopup="menu" aria-label="حساب ' + esc(u.name) + '"><span class="avatar" aria-hidden="true" data-me-avatar data-ini="' + esc(u.initials || 'م') + '">' + avatarInner(u) + '</span>' + icon('expand_more') + '</button>' +
      '<div class="menu" id="user-menu" role="menu" aria-label="قائمة الحساب" hidden>' +
      '<div class="menu-head" role="presentation"><strong>' + esc(u.name) + '</strong><span>' + esc(u.email) + '</span></div><div class="menu-sep" role="separator"></div>' +
      '<a role="menuitem" class="menu-item" href="' + (ME ? '/admin/profile' : '/admin/settings#profile') + '">' + icon('person') + 'حسابي</a>' +
      ((!ME || ME.role === 'admin') ? '<a role="menuitem" class="menu-item" href="/admin/settings">' + icon('settings') + 'الإعدادات</a>' : '') +
      '<button type="button" role="menuitem" class="menu-item" data-cmdk-open>' + icon('keyboard_command_key') + 'لوحة الأوامر</button>' +
      '<div class="menu-sep" role="separator"></div>' +
      '<button type="button" role="menuitem" class="menu-item danger" data-logout>' + icon('logout', 'flip-rtl') + 'تسجيل الخروج</button></div></div>' +
      '</div>';
    $('#tb-menu').addEventListener('click', function () { html.classList.contains('sb-open') ? closeMobileNav() : openMobileNav(); });
    $('#tb-search').addEventListener('click', function () { Cmdk.open(); });
    $('#notif-read').addEventListener('click', function () {
      fetch('/admin/notifications/read-all', { method: 'POST', credentials: 'same-origin', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': notifToken() } })
        .then(function (r) { if (!r.ok) throw new Error('x'); return r.json(); })
        .then(function (j) { toast(j.message || 'تم تعليم كل الإشعارات كمقروءة'); notifPull(); })
        .catch(function () { toast('تعذّر تعليم الإشعارات، حاول مرة أخرى.', { tone: 'danger', icon: 'error' }); });
    });
    if (!window.__notifTimer) { window.__notifTimer = setInterval(notifPull, 60000); document.addEventListener('visibilitychange', function () { if (!document.hidden) notifPull(); }); }
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cmdk-open]')) { var top = Layers.top(); if (top && top.outside) top.close(false); Cmdk.open(); }
  });

  // Theme
  function syncThemeButtons() {
    var dark = html.classList.contains('dark');
    $$('.theme-toggle').forEach(function (b) {
      b.setAttribute('aria-pressed', dark ? 'true' : 'false');
      b.innerHTML = icon(dark ? 'light_mode' : 'dark_mode');
      b.setAttribute('aria-label', 'الوضع الداكن');
      b.title = dark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن';
    });
    var meta = $('meta[name="theme-color"]'); if (meta) meta.content = dark ? '#0a1221' : '#f6f5f2';
  }
  function setTheme(dark) {
    html.classList.add('theme-anim');
    html.classList.toggle('dark', dark);
    store.set('almel-admin-theme', dark ? 'dark' : 'light');
    syncThemeButtons();
    setTimeout(function () { html.classList.remove('theme-anim'); }, 400);
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('.theme-toggle')) setTheme(!html.classList.contains('dark'));
  });
  // 'light' | 'dark' | 'auto' (auto = follow the system; used by /admin/settings)
  function setThemeMode(mode) {
    if (mode === 'auto') {
      try { localStorage.removeItem('almel-admin-theme'); } catch (e) { /* ignore */ }
      html.classList.add('theme-anim');
      html.classList.toggle('dark', !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches));
      syncThemeButtons();
      setTimeout(function () { html.classList.remove('theme-anim'); }, 400);
    } else setTheme(mode === 'dark');
  }

  /* ---------- 5. Command palette (Ctrl/⌘ + K) ---------- */
  var Cmdk = (function () {
    var root, overlay, input, list, items = [], filtered = [], active = 0;
    function go(href) { return function () { location.href = href; }; }
    function build() {
      var cmds = [];
      NAV.forEach(function (g) { g.items.forEach(function (it) { cmds.push({ group: 'الصفحات', icon: it.icon, label: it.label, hint: g.group, run: go(it.href) }); }); });
      cmds.push({ group: 'إجراءات سريعة', icon: 'add_circle', label: 'إضافة مشروع جديد', perm: 'projects.create', hint: 'المشاريع', run: function () { if (PAGE === 'projects' && window.__openProjectDrawer) window.__openProjectDrawer(); else location.href = '/admin/projects#new'; } });
      cmds.push({ group: 'إجراءات سريعة', icon: 'edit_square', label: 'كتابة خبر جديد', perm: 'news.create', hint: 'الأخبار', run: go('/admin/news-edit') });
      cmds.push({ group: 'إجراءات سريعة', icon: 'upload', label: 'رفع صور إلى المعرض', perm: 'gallery.create', hint: 'المعرض', run: go('/admin/gallery#upload') });
      cmds.push({ group: 'إجراءات سريعة', icon: 'download', label: 'تصدير تقرير CSV', perm: 'reports.export', hint: 'التقارير', run: go('/admin/reports#export') });
      cmds.push({ group: 'إجراءات سريعة', icon: 'reorder', label: 'ترتيب أقسام الصفحة الرئيسية', perm: 'homepage.edit', hint: 'الرئيسية', run: function () { if (PAGE === 'homepage' && window.__focusHomeList) window.__focusHomeList(); else location.href = '/admin/homepage'; } });
      cmds.push({ group: 'إجراءات سريعة', icon: 'title', label: 'تعديل عناوين أقسام الصفحة الرئيسية', perm: 'homepage.edit', hint: 'الرئيسية', run: function () { if (PAGE === 'homepage' && window.__focusHomeList) window.__focusHomeList(true); else location.href = '/admin/homepage#edit'; } });
      cmds.push({ group: 'إجراءات سريعة', icon: 'add_link', label: 'إضافة رابط إلى القائمة الرئيسية', perm: 'menu.create', hint: 'القائمة', run: function () { if (PAGE === 'menu' && window.__focusMenuAdd) window.__focusMenuAdd(); else location.href = '/admin/menu#add'; } });
      cmds.push({ group: 'إجراءات سريعة', icon: 'contrast', label: 'تبديل الوضع الداكن / الفاتح', hint: 'المظهر', run: function () { setTheme(!html.classList.contains('dark')); } });
      cmds.push({ group: 'إجراءات سريعة', icon: 'right_panel_close', label: 'طي / توسيع القائمة الجانبية', hint: 'المظهر', run: function () { var b = $('#sb-collapse'); if (b && innerWidth >= 1024) b.click(); else openMobileNav(); } });
      [['/admin/404', 'explore_off', 'صفحة 404 — غير موجودة'], ['/admin/403', 'shield_lock', 'صفحة 403 — لا توجد صلاحية'], ['/admin/maintenance', 'construction', 'وضع الصيانة'], ['/admin/forgot-password', 'lock_reset', 'استعادة كلمة المرور']].forEach(function (x) { cmds.push({ group: 'صفحات الحالات', icon: x[1], label: x[2], hint: 'معاينة', run: go(x[0]) }); });
      cmds.push({ group: 'الحساب', icon: 'logout', label: 'تسجيل الخروج', hint: '', run: doLogout });
      return cmds.filter(function (c) { return !c.perm || can(c.perm); });
    }
    var remote = { q: '', items: [], busy: false }, rTimer = null, rSeq = 0;
    function remoteItems(q) { return q && remote.q === q ? remote.items : []; }
    function remoteSearch(raw) {
      clearTimeout(rTimer);
      var q = normalize(raw);
      if (q.length < 2) { rSeq++; remote = { q: '', items: [], busy: false }; return; }
      if (remote.q === q) return;
      remote.busy = true;
      rTimer = setTimeout(function () {
        var seq = ++rSeq;
        fetch('/admin/search?q=' + encodeURIComponent(String(raw).trim()), { credentials: 'same-origin', headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } })
          .then(function (r) { return r.ok ? r.json() : { data: [] }; })
          .then(function (j) {
            if (seq !== rSeq || !root) return;
            remote = { q: q, busy: false, items: (j.data || []).map(function (x) { return { group: x.group, icon: x.icon || 'search', label: x.label, hint: x.hint || '', run: go(x.url) }; }) };
            active = 0; render();
          })
          .catch(function () { remote.busy = false; if (root) render(); });
      }, 200);
    }
    function render() {
      var q = normalize(input.value);
      filtered = items.filter(function (c) { return !q || normalize(c.label + ' ' + c.hint + ' ' + c.group).indexOf(q) > -1; });
      filtered = remoteItems(q).concat(filtered);
      if (active >= filtered.length) active = 0;
      if (!filtered.length) { list.innerHTML = '<div class="cmdk-empty" role="presentation">' + (remote.busy && q.length >= 2 ? 'جارٍ البحث…' : 'لا توجد نتائج لـ «' + esc(input.value) + '»') + '</div>'; input.setAttribute('aria-activedescendant', ''); return; }
      var h = '', last = null, gi = 0;
      filtered.forEach(function (c, i) {
        if (c.group !== last) { if (last !== null) h += '</div>'; gi++; h += '<div role="group" aria-labelledby="cmdk-g' + gi + '"><div class="cmdk-group" id="cmdk-g' + gi + '" role="presentation">' + esc(c.group) + '</div>'; last = c.group; }
        h += '<div class="cmdk-item" role="option" id="cmdk-o' + i + '" data-i="' + i + '" aria-selected="' + (i === active) + '"><span class="ci">' + icon(c.icon) + '</span><span class="cl">' + esc(c.label) + '</span>' + (c.hint ? '<span class="ch">' + esc(c.hint) + '</span>' : '') + '</div>';
      });
      h += '</div>';
      list.innerHTML = h;
      input.setAttribute('aria-activedescendant', 'cmdk-o' + active);
    }
    function setActive(i) {
      if (!filtered.length) return;
      active = (i + filtered.length) % filtered.length;
      $$('.cmdk-item', list).forEach(function (el) { el.setAttribute('aria-selected', +el.getAttribute('data-i') === active ? 'true' : 'false'); });
      input.setAttribute('aria-activedescendant', 'cmdk-o' + active);
      var el = $('#cmdk-o' + active); if (el) el.scrollIntoView({ block: 'nearest' });
    }
    function run(i) { var c = filtered[i]; if (!c) return; close(); c.run(); }
    function open() {
      if (root && Layers.has(root)) return;
      items = build();
      overlay = makeOverlay();
      root = document.createElement('div');
      root.className = 'cmdk';
      root.innerHTML = '<div class="cmdk-dialog" role="dialog" aria-modal="true" aria-label="لوحة الأوامر والبحث">' +
        '<div class="cmdk-input-wrap">' + icon('search') + '<input class="cmdk-input" type="text" role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-autocomplete="list" aria-label="ابحث عن صفحة أو إجراء أو مشروع" placeholder="ابحث عن صفحة أو إجراء أو مشروع…" autocomplete="off" spellcheck="false"><kbd>Esc</kbd></div>' +
        '<div class="cmdk-list" id="cmdk-list" role="listbox" aria-label="النتائج"></div>' +
        '<div class="cmdk-foot" aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> للتنقل</span><span><kbd>Enter</kbd> للتنفيذ</span><span><kbd>Esc</kbd> للإغلاق</span></div></div>';
      document.body.appendChild(root);
      input = $('.cmdk-input', root); list = $('.cmdk-list', root);
      remote = { q: '', items: [], busy: false }; rSeq++;
      active = 0; render();
      input.addEventListener('input', function () { active = 0; remoteSearch(input.value); render(); });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
        else if (e.key === 'Enter') { e.preventDefault(); run(active); }
      });
      list.addEventListener('click', function (e) { var it = e.target.closest('[data-i]'); if (it) run(+it.getAttribute('data-i')); });
      list.addEventListener('mousemove', function (e) { var it = e.target.closest('[data-i]'); if (it && +it.getAttribute('data-i') !== active) setActive(+it.getAttribute('data-i')); });
      root.addEventListener('mousedown', function (e) { if (e.target === root) close(); });
      Layers.push(root, close, { modal: true, focus: '.cmdk-input', delay: 10 });
    }
    function close() { if (!root) return; Layers.remove(root); root.remove(); overlay.remove(); root = null; }
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K' || e.code === 'KeyK')) {
        e.preventDefault();
        if (root) close(); else { var top = Layers.top(); if (top && top.outside) top.close(false); open(); }
      }
    });
    return { open: open, close: close };
  })();

  /* ---------- 6. Charts (inline SVG). RTL: index 0 = oldest = right edge ---------- */
  function niceMax(v) {
    if (v <= 0) return 1;
    var e = Math.pow(10, Math.floor(Math.log10(v))), f = v / e;
    var n = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 4 ? 4 : f <= 5 ? 5 : f <= 8 ? 8 : 10;
    return n * e;
  }
  function smoothPath(pts) {
    if (pts.length < 2) return '';
    var d = 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var t = 0.18;
      var c1x = p1[0] + (p2[0] - p0[0]) * t, c1y = p1[1] + (p2[1] - p0[1]) * t;
      var c2x = p2[0] - (p3[0] - p1[0]) * t, c2y = p2[1] - (p3[1] - p1[1]) * t;
      var lo = Math.min(p1[1], p2[1]), hi = Math.max(p1[1], p2[1]);
      c1y = Math.max(lo, Math.min(hi, c1y)); c2y = Math.max(lo, Math.min(hi, c2y));
      d += 'C' + c1x.toFixed(1) + ',' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ',' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1);
    }
    return d;
  }
  function sparkline(values, cls) {
    var W = 104, H = 40, n = values.length, min = Math.min.apply(null, values), max = Math.max.apply(null, values);
    var rng = max - min || 1;
    var pts = values.map(function (v, i) { return [W - (i * W) / (n - 1), 4 + (H - 8) - ((v - min) / rng) * (H - 8)]; });
    var id = uid('sp');
    var line = smoothPath(pts);
    var last = pts[pts.length - 1];
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true" focusable="false"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--c-' + cls + ');stop-opacity:.22"/><stop offset="1" style="stop-color:var(--c-' + cls + ');stop-opacity:0"/></linearGradient></defs>' +
      '<path d="' + line + 'L' + last[0] + ',' + H + 'L' + W + ',' + H + 'Z" fill="url(#' + id + ')"/>' +
      '<path d="' + line + '" fill="none" class="s-' + cls + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="' + last[0] + '" cy="' + last[1] + '" r="3" class="f-' + cls + '" style="stroke:var(--surface);stroke-width:2"/></svg>';
  }
  function measureText(str) { return String(str).length * 6.6; }

  function observe(el, fn) {
    var raf = 0, lastW = 0;
    if (window.ResizeObserver) {
      new ResizeObserver(function () {
        var w = el.clientWidth; if (Math.abs(w - lastW) < 2) return; lastW = w;
        cancelAnimationFrame(raf); raf = requestAnimationFrame(fn);
      }).observe(el);
    } else { window.addEventListener('resize', fn); }
  }

  // Line / area chart
  function lineChart(el, cfg) {
    el.classList.add('chart');
    var tip = document.createElement('div'); tip.className = 'chart-tip'; tip.setAttribute('aria-hidden', 'true');
    var geom = null, animateNext = !reduceMotion;
    function render() {
      var W = Math.max(260, el.clientWidth), H = cfg.height || 280;
      var all = []; cfg.series.forEach(function (s) { all = all.concat(s.values); });
      var max = niceMax(Math.max.apply(null, all) * 1.05), ticks = 4;
      var yf = cfg.yFormat || function (v) { return fmtCompact(v); };
      var labW = 0; for (var k = 0; k <= ticks; k++) labW = Math.max(labW, measureText(yf(max * k / ticks)));
      var padT = 12, padB = 30, padL = 8, padR = labW + 16;
      var pw = W - padL - padR, ph = H - padT - padB, n = cfg.labels.length;
      var x = function (i) { return padL + pw - (n === 1 ? 0 : (i * pw) / (n - 1)); };
      var y = function (v) { return padT + ph - (v / max) * ph; };
      var id = uid('lc');
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" height="' + H + '" role="img" aria-label="' + esc(cfg.aria || '') + '"><defs>';
      cfg.series.forEach(function (se, si) { if (se.area) s += '<linearGradient id="' + id + 'g' + si + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--c-' + se.cls + ');stop-opacity:.2"/><stop offset="1" style="stop-color:var(--c-' + se.cls + ');stop-opacity:0"/></linearGradient>'; });
      s += '</defs>';
      for (k = 0; k <= ticks; k++) {
        var yy = y(max * k / ticks);
        s += '<line class="' + (k === 0 ? 'base-line' : 'grid-line') + '" x1="' + padL + '" x2="' + (padL + pw) + '" y1="' + yy + '" y2="' + yy + '"' + (k === 0 ? '' : ' stroke-dasharray="3 4"') + '/>';
        s += '<text x="' + (W - 2) + '" y="' + (yy + 4) + '" text-anchor="end">' + esc(yf(max * k / ticks)) + '</text>';
      }
      var maxLabels = Math.max(2, Math.floor(pw / 72)), step = Math.max(1, Math.ceil(n / maxLabels));
      for (var i = 0; i < n; i++) {
        if (i % step !== 0 && i !== n - 1) continue;
        if (i !== n - 1 && n - 1 - i < step * 0.6) continue;
        var anchor = i === 0 ? 'end' : i === n - 1 ? 'start' : 'middle';
        s += '<text x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="' + anchor + '">' + esc(cfg.labels[i]) + '</text>';
      }
      cfg.series.slice().reverse().forEach(function (se) {
        var si = cfg.series.indexOf(se);
        var pts = se.values.map(function (v, i) { return [x(i), y(v)]; });
        var d = smoothPath(pts);
        if (se.area) s += '<path d="' + d + 'L' + x(n - 1) + ',' + y(0) + 'L' + x(0) + ',' + y(0) + 'Z" fill="url(#' + id + 'g' + si + ')"' + (animateNext ? ' style="animation:fade .8s ease both"' : '') + '/>';
        s += '<path d="' + d + '" fill="none" class="' + (se.dashed ? 's-prev' : 's-' + se.cls) + '" stroke-width="' + (se.dashed ? 1.75 : 2.5) + '" stroke-linecap="round" stroke-linejoin="round"' + (se.dashed ? ' stroke-dasharray="5 5"' : (animateNext ? ' pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;animation:drawLine 1.1s cubic-bezier(.22,.8,.24,1) forwards"' : '')) + '/>';
      });
      s += '<g class="hover-g" style="display:none"><line class="hover-line" y1="' + padT + '" y2="' + (padT + ph) + '"/>' + cfg.series.map(function (se) { return '<circle r="4.5" class="dot ' + (se.dashed ? '' : 'f-' + se.cls) + '"' + (se.dashed ? ' style="fill:var(--c-prev)"' : '') + '/>'; }).join('') + '</g>';
      s += '<rect x="' + padL + '" y="' + padT + '" width="' + pw + '" height="' + ph + '" fill="transparent" class="hit"/></svg>';
      el.innerHTML = s; el.appendChild(tip);
      geom = { x: x, y: y, n: n, pw: pw, padL: padL, W: W };
      animateNext = false;
      var hit = $('.hit', el), g = $('.hover-g', el);
      function show(i) {
        var px = x(i);
        g.style.display = '';
        $('line', g).setAttribute('x1', px); $('line', g).setAttribute('x2', px);
        $$('circle', g).forEach(function (c, si) { c.setAttribute('cx', px); c.setAttribute('cy', y(cfg.series[si].values[i])); });
        tip.innerHTML = '<div class="tt">' + esc(cfg.tipTitle ? cfg.tipTitle(i) : cfg.labels[i]) + '</div>' + cfg.series.map(function (se) {
          return '<div class="tr"><span><i class="sw ' + (se.dashed ? '' : 'sw-' + se.cls) + '"' + (se.dashed ? ' style="background:var(--c-prev)"' : '') + '></i>' + esc(se.name) + '</span><b>' + esc((cfg.tipFormat || fmtMoney)(se.values[i])) + '</b></div>';
        }).join('');
        tip.classList.add('on');
        var tw = tip.offsetWidth, th = tip.offsetHeight;
        var left = px - tw - 14; if (left < 0) left = px + 14;
        var top = Math.max(0, y(cfg.series[0].values[i]) - th - 12);
        tip.style.transform = 'translate(' + left + 'px,' + top + 'px)';
      }
      hit.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(); var sx = (e.clientX - r.left) * (W / r.width);
        var i = Math.round(((padL + pw) - sx) / (pw / (n - 1)));
        show(Math.max(0, Math.min(n - 1, i)));
      });
      hit.addEventListener('pointerleave', function () { g.style.display = 'none'; tip.classList.remove('on'); });
    }
    render();
    observe(el, render);
    el._update = function (c) { cfg = c; animateNext = !reduceMotion; render(); };
    return el;
  }

  // Stacked bar chart
  function barChart(el, cfg) {
    el.classList.add('chart');
    var tip = document.createElement('div'); tip.className = 'chart-tip'; tip.setAttribute('aria-hidden', 'true');
    var animateNext = !reduceMotion;
    function render() {
      var W = Math.max(260, el.clientWidth), H = cfg.height || 280, n = cfg.labels.length;
      var totals = cfg.labels.map(function (_, i) { return cfg.series.reduce(function (a, s) { return a + s.values[i]; }, 0); });
      var max = niceMax(Math.max.apply(null, totals) * 1.05), ticks = 4, yf = cfg.yFormat || function (v) { return fmtCompact(v); };
      var labW = 0; for (var k = 0; k <= ticks; k++) labW = Math.max(labW, measureText(yf(max * k / ticks)));
      var padT = 12, padB = 30, padL = 8, padR = labW + 16, pw = W - padL - padR, ph = H - padT - padB;
      var slot = pw / n, bw = Math.min(44, slot * 0.52);
      var cx = function (i) { return padL + pw - (i + 0.5) * slot; };
      var y = function (v) { return padT + ph - (v / max) * ph; };
      var id = uid('bc');
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" height="' + H + '" role="img" aria-label="' + esc(cfg.aria || '') + '"><defs>';
      totals.forEach(function (t, i) { var top = y(t); s += '<clipPath id="' + id + 'c' + i + '"><rect x="' + (cx(i) - bw / 2) + '" y="' + top + '" width="' + bw + '" height="' + (padT + ph - top + 8) + '" rx="7"/></clipPath>'; });
      s += '</defs>';
      for (k = 0; k <= ticks; k++) {
        var yy = y(max * k / ticks);
        s += '<line class="' + (k === 0 ? 'base-line' : 'grid-line') + '" x1="' + padL + '" x2="' + (padL + pw) + '" y1="' + yy + '" y2="' + yy + '"' + (k === 0 ? '' : ' stroke-dasharray="3 4"') + '/>';
        s += '<text x="' + (W - 2) + '" y="' + (yy + 4) + '" text-anchor="end">' + esc(yf(max * k / ticks)) + '</text>';
      }
      totals.forEach(function (t, i) {
        var acc = 0;
        s += '<g class="bar-col" data-i="' + i + '" clip-path="url(#' + id + 'c' + i + ')"' + (animateNext ? ' style="transform-origin:0 ' + (padT + ph) + 'px;animation:growY .8s cubic-bezier(.22,.8,.24,1) ' + (i * 0.05) + 's both"' : '') + '>';
        cfg.series.forEach(function (se) {
          var v = se.values[i], y1 = y(acc + v), y0 = y(acc);
          s += '<rect class="bar f-' + se.cls + '" x="' + (cx(i) - bw / 2) + '" y="' + y1 + '" width="' + bw + '" height="' + Math.max(0, y0 - y1 - (acc + v === t ? 0 : 1.5)) + '"/>';
          acc += v;
        });
        s += '</g>';
        s += '<text x="' + cx(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(cfg.labels[i]) + '</text>';
      });
      s += '<rect x="' + padL + '" y="' + padT + '" width="' + pw + '" height="' + ph + '" fill="transparent" class="hit"/></svg>';
      el.innerHTML = s; el.appendChild(tip);
      animateNext = false;
      var hit = $('.hit', el), cols = $$('.bar-col', el);
      hit.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), sx = (e.clientX - r.left) * (W / r.width);
        var i = Math.max(0, Math.min(n - 1, Math.floor(((padL + pw) - sx) / slot)));
        cols.forEach(function (c, ci) { c.classList.toggle('is-dim', ci !== i); });
        tip.innerHTML = '<div class="tt">' + esc(cfg.tipTitle ? cfg.tipTitle(i) : cfg.labels[i]) + '</div>' + cfg.series.slice().reverse().map(function (se) {
          return '<div class="tr"><span><i class="sw sw-' + se.cls + '"></i>' + esc(se.name) + '</span><b>' + fmtMoney(se.values[i]) + '</b></div>';
        }).join('') + '<div class="tr" style="margin-top:6px;padding-top:6px;border-top:1px solid var(--border)"><span>الإجمالي</span><b>' + fmtMoney(totals[i]) + '</b></div>';
        tip.classList.add('on');
        var tw = tip.offsetWidth, th = tip.offsetHeight, px = cx(i);
        var left = px - bw / 2 - tw - 10; if (left < 0) left = px + bw / 2 + 10;
        tip.style.transform = 'translate(' + left + 'px,' + Math.max(0, y(totals[i]) - th / 2) + 'px)';
      });
      hit.addEventListener('pointerleave', function () { cols.forEach(function (c) { c.classList.remove('is-dim'); }); tip.classList.remove('on'); });
    }
    render();
    observe(el, render);
    el._update = function (c) { cfg = c; animateNext = !reduceMotion; render(); };
    return el;
  }

  // Donut
  function donutChart(el, cfg) {
    function render() {
      var total = cfg.items.reduce(function (a, b) { return a + b.value; }, 0);
      var r = 70, C = 2 * Math.PI * r, off = 0, gap = cfg.items.length > 1 ? 3 : 0;
      var arcs = cfg.items.map(function (it, i) {
        var len = (it.value / total) * C;
        var a = '<circle class="seg-arc s-' + (i + 1) + '" data-i="' + i + '" cx="92" cy="92" r="' + r + '" fill="none" stroke-width="18" stroke-dasharray="' + Math.max(0, len - gap).toFixed(2) + ' ' + C.toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '"/>';
        off += len; return a;
      }).join('');
      el.innerHTML = '<div class="donut-wrap"><div class="donut"><svg viewBox="0 0 184 184" role="img" aria-label="' + esc(cfg.aria || '') + '"><circle cx="92" cy="92" r="' + r + '" fill="none" style="stroke:var(--surface-3)" stroke-width="18"/>' + arcs + '</svg>' +
        '<div class="donut-center"><b>' + esc(cfg.center) + '</b><span>' + esc(cfg.centerLabel) + '</span></div></div>' +
        '<ul class="donut-legend">' + cfg.items.map(function (it, i) { return '<li data-i="' + i + '"><i class="sw-' + (i + 1) + '" aria-hidden="true"></i>' + esc(it.label) + '<b>' + esc(cfg.format ? cfg.format(it) : it.value + '%') + '</b></li>'; }).join('') + '</ul></div>';
      var arcsEl = $$('.seg-arc', el), lis = $$('.donut-legend li', el);
      function hi(i) {
        arcsEl.forEach(function (a, ai) { a.classList.toggle('is-on', ai === i); a.classList.toggle('is-dim', i != null && ai !== i); });
        lis.forEach(function (l, li) { l.classList.toggle('is-on', li === i); });
      }
      arcsEl.concat(lis).forEach(function (n) {
        n.addEventListener('mouseenter', function () { hi(+n.getAttribute('data-i')); });
        n.addEventListener('mouseleave', function () { hi(null); });
      });
    }
    render();
    el._update = function (c) { cfg = c; render(); };
  }

  // Gaza governorates — schematic (not to scale) strip, north at top.
  var GOV_T = [0, 0.18, 0.40, 0.60, 0.84, 1];
  function gazaMap(values, activeIdx) {
    var W = function (t) { return [62 - 54 * t, 6 + 284 * t]; };
    var nx = 0.983, ny = 0.187;
    var E = function (t) { var w = W(t), wd = 32 + 44 * t; return [w[0] + nx * wd, w[1] + ny * wd]; };
    var sorted = values.slice().sort(function (a, b) { return a - b; });
    var polys = '', outline = '';
    for (var i = 0; i < 5; i++) {
      var a = W(GOV_T[i]), b = W(GOV_T[i + 1]), c = E(GOV_T[i + 1]), d = E(GOV_T[i]);
      var pts = [a, b, c, d].map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
      var rank = sorted.indexOf(values[i]) + 1;
      polys += '<polygon class="gz gz-' + rank + (activeIdx != null && activeIdx !== i ? ' is-dim' : '') + '" data-i="' + i + '" points="' + pts + '"/>';
      if (activeIdx === i) outline = '<polygon class="gz-outline" points="' + pts + '"/>';
    }
    return '<svg viewBox="-4 0 104 312" role="img" aria-label="مخطط توضيحي لمحافظات قطاع غزة الخمس من الشمال إلى الجنوب"><path class="sea-line" d="M56,2 L0,296"/><text class="sea" transform="translate(13,150) rotate(-79)" text-anchor="middle">البحر المتوسط</text>' + polys + outline + '</svg>';
  }
  function govWidget(el, metric) {
    var govs = D.governorates || [];
    var state = { metric: metric || 'beneficiaries' };
    function render() {
      var vals = govs.map(function (g) { return g[state.metric]; });
      var max = Math.max.apply(null, vals), total = vals.reduce(function (a, b) { return a + b; }, 0);
      var sorted = vals.slice().sort(function (a, b) { return a - b; });
      el.innerHTML = '<div class="gov-wrap"><div class="gov-map">' + gazaMap(vals, null) + '</div><ul class="gov-list">' + govs.map(function (g, i) {
        var v = vals[i], rank = sorted.indexOf(v) + 1;
        return '<li class="gov-row" data-i="' + i + '"><span class="n"><i class="gz-swatch" style="background:var(--map-' + rank + ')" aria-hidden="true"></i>' + esc(g.name) + ' <small>' + Math.round((v / total) * 100) + '%</small></span><span class="v">' + (state.metric === 'donations' ? fmtCompact(v) : fmtNum(v)) + '</span><div class="progress" aria-hidden="true"><span style="width:' + ((v / max) * 100).toFixed(1) + '%"></span></div></li>';
      }).join('') + '</ul></div>';
      var polys = $$('.gz', el), rows = $$('.gov-row', el);
      function hi(i) {
        polys.forEach(function (p) { var pi = +p.getAttribute('data-i'); p.classList.toggle('is-dim', i != null && pi !== i); p.classList.toggle('is-on', pi === i); if (pi === i) p.parentNode.appendChild(p); });
        rows.forEach(function (r, ri) { r.classList.toggle('is-on', ri === i); });
      }
      polys.concat(rows).forEach(function (n) { n.addEventListener('mouseenter', function () { hi(+n.getAttribute('data-i')); }); });
      $('.gov-wrap', el).addEventListener('mouseleave', function () { hi(null); });
    }
    render();
    return { setMetric: function (m) { state.metric = m; render(); } };
  }

  /* ---------- 7. Page modules ---------- */
  var Pages = {};

  function periodDates(key, end) {
    end = end || new Date();
    var out = [];
    if (key === '12m') { for (var m = 11; m >= 0; m--) out.push(new Date(end.getFullYear(), end.getMonth() - m, 1)); }
    else { var n = key === '7d' ? 7 : 30; for (var d = n - 1; d >= 0; d--) out.push(new Date(end.getFullYear(), end.getMonth(), end.getDate() - d)); }
    return out;
  }
  function periodLabels(key, dates) {
    return dates.map(function (d) {
      if (key === '12m') return fmtDate(d, { month: 'long' });
      if (key === '7d') return fmtDate(d, { weekday: 'long' });
      return fmtDate(d, { day: 'numeric', month: 'short' });
    });
  }
  function periodTip(key, dates) {
    return function (i) { return key === '12m' ? fmtDate(dates[i], { month: 'long', year: 'numeric' }) : fmtDate(dates[i], { weekday: 'long', day: 'numeric', month: 'long' }); };
  }
  function deltaChip(v, unit) {
    var up = v >= 0;
    return '<span class="delta delta-chip ' + (up ? 'up' : 'down') + '">' + icon(up ? 'trending_up' : 'trending_down', 'flip-rtl') + '<span>' + (up ? '+' : '−') + Math.abs(v) + (unit ? '' : '%') + '</span></span>' + (unit ? '<span class="sr-only"> ' + unit + '</span>' : '');
  }
  var sum = function (a) { return a.reduce(function (x, y) { return x + y; }, 0); };

  /* ----- Dashboard ----- */
  Pages.index = function () {
    var now = new Date(), h = now.getHours();
    $('#greet-title').textContent = (h < 12 ? 'صباح الخير' : 'مساء الخير') + '، ' + (D.user ? D.user.name : '');
    $('#greet-date').textContent = fmtDate(now, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    var kpiEl = $('#kpis');
    kpiEl.innerHTML = [0, 1, 2, 3].map(function () { return '<div class="card kpi" aria-hidden="true"><div class="kpi-top"><span class="skeleton sk-line" style="width:45%"></span><span class="skeleton" style="width:36px;height:36px;border-radius:10px"></span></div><span class="skeleton" style="width:60%;height:32px;margin-top:12px"></span><div class="kpi-foot"><span class="skeleton sk-line" style="width:40%"></span></div></div>'; }).join('');
    kpiEl.setAttribute('aria-busy', 'true');

    // KPI cards: real entries from D.kpis + two values derived from existing data (no new numbers).
    var govs = D.governorates || [], msgs = D.messages || [];
    var pointsTotal = sum(govs.map(function (g) { return g.points || 0; }));
    var volNew = msgs.filter(function (m) { return m.type === 'volunteer' && !m.read && !m.archived; }).length;
    var volAll = msgs.filter(function (m) { return m.type === 'volunteer' && !m.archived; }).length;
    var kpiList = (D.kpis || []).map(function (k) { return { label: k.label, value: fmtNum(k.value), icon: k.icon, delta: k.delta, unit: k.deltaUnit, note: 'عن الشهر الماضي', spark: k.spark }; });
    kpiList.push({ label: 'نقاط التوزيع', value: fmtNum(pointsTotal), icon: 'location_on', chip: govs.length + ' محافظات', note: 'موزعة على قطاع غزة' });
    kpiList.push({ label: 'طلبات تطوع جديدة', value: fmtNum(volNew), icon: 'handshake', chip: 'من أصل ' + volAll, note: 'غير مقروءة في الرسائل' });
    setTimeout(function () {
      kpiEl.innerHTML = kpiList.map(function (k) {
        var badge = k.chip ? '<span class="pill pill-neutral no-dot">' + esc(k.chip) + '</span>' : deltaChip(k.delta, k.unit);
        return '<article class="card kpi"><div class="kpi-top"><h2 class="kpi-label">' + esc(k.label) + '</h2><span class="kpi-ico">' + icon(k.icon) + '</span></div>' +
          '<p class="kpi-value"><span class="ltr">' + k.value + '</span></p><div class="kpi-foot"><div>' + badge + '<span class="muted">' + esc(k.note) + '</span></div>' + (k.spark ? '<div class="kpi-spark">' + sparkline(k.spark, '1') + '</div>' : '') + '</div></article>';
      }).join('');
      kpiEl.removeAttribute('aria-busy');
      kpiEl.classList.add('stagger');
    }, reduceMotion ? 0 : 450);

    // Beneficiaries over time (from the beneficiaries KPI spark: last 12 months, in thousands)
    var bk = null; (D.kpis || []).forEach(function (k) { if (k.id === 'beneficiaries') bk = k; });
    var benEl = $('#ben-chart');
    if (bk && bk.spark && bk.spark.length > 1) {
      $('#ben-total').textContent = fmtNum(bk.value);
      $('#ben-delta').innerHTML = deltaChip(bk.delta) + '<span class="muted" style="font-size:12.5px">عن الشهر الماضي</span>';
      lineChart(benEl, { labels: periodLabels('12m', periodDates('12m')), tipTitle: periodTip('12m', periodDates('12m')), height: 272,
        yFormat: function (v) { return fmtNum(Math.round(v)); }, tipFormat: function (v) { return fmtNum(v) + ' ألف'; },
        aria: 'مخطط المستفيدين خلال آخر 12 شهراً، بالآلاف',
        series: [{ name: 'المستفيدون', values: bk.spark, cls: '1', area: true }] });
    } else { benEl.closest('.card').hidden = true; }

    var gov = govWidget($('#gov-widget'), 'beneficiaries');
    initSeg($('#gov-seg'), function (v) { gov.setMetric(v); });

    // Active projects (status only; no money figures)
    var top = (D.projects || []).filter(function (p) { return p.status === 'active' || p.status === 'urgent'; })
      .sort(function (a, b) { return (b.status === 'urgent') - (a.status === 'urgent') || a.updated - b.updated; }).slice(0, 5);
    $('#proj-active').innerHTML = top.map(function (p) {
      var st = pStatus(p.status);
      return '<li class="pl-item"><img src="' + esc(p.image) + '" alt="" loading="lazy"><div class="pl-main"><p class="pl-title">' + esc(p.title) + '</p><p class="pl-sub">' + esc(p.location) + ' · ' + esc(cat(p.cat).label) + '</p></div><div class="pl-end">' + pill(st.label, st.tone) + '<small>' + (p.updated ? 'حُدِّث ' + ago(p.updated * 1440) : 'حُدِّث اليوم') + '</small></div></li>';
    }).join('');

    // Feed (activity log)
    $('#feed-activity').innerHTML = '<ul class="timeline">' + (D.activity || []).map(function (a) {
      return '<li class="tl-item"><span class="li-ico">' + icon(a.icon) + '</span><div><p>' + esc(a.text) + '</p><span>' + esc(a.by) + ' · ' + ago(a.mins) + '</span></div></li>';
    }).join('') + '</ul>';

    // Messages (contact + volunteer only on the overview)
    $('#latest-messages').innerHTML = (D.messages || []).filter(function (m) { return !m.archived && m.type !== 'donation'; }).slice(0, 4).map(function (m) {
      var t = MSG_TYPES[m.type];
      return '<li><a class="msg-mini" href="/admin/messages#' + m.id + '"><span class="avatar navy" aria-hidden="true">' + icon(t.icon) + '</span><div class="li-main"><div class="top"><strong>' + (m.read ? '' : '<span class="udot" aria-hidden="true"></span><span class="sr-only">غير مقروءة: </span>') + esc(m.from) + '</strong><time>' + ago(m.mins) + '</time></div><p>' + esc(m.subject) + '</p></div><span class="pill pill-' + t.tone + ' no-dot">' + esc(t.label) + '</span></a></li>';
    }).join('');
  };

  /* ----- Projects ----- */
  Pages.projects = function () {
    var items = (D.projects || []).map(function (p) { return Object.assign({}, p); });
    var qs = new URLSearchParams(location.search);
    var st = { q: qs.get('q') || '', cat: '', status: '', view: store.get('almel-admin-pview', 'table'), page: 1, per: 8, sel: new Set() };
    var view = $('#proj-view'), bulk = $('#bulkbar'), search = $('#proj-search');
    search.value = st.q;

    // filters
    function stats() {
      var active = items.filter(function (p) { return p.status === 'active' || p.status === 'urgent'; }).length;
      var raised = sum(items.map(function (p) { return p.raised; })), goal = sum(items.map(function (p) { return p.goal; }));
      $('#p-stats').innerHTML = '<div><dt>إجمالي المشاريع</dt><dd><b>' + items.length + '</b></dd></div><div><dt>مشاريع نشطة</dt><dd><b>' + active + '</b><span class="pill pill-danger">' + items.filter(function (p) { return p.status === 'urgent'; }).length + ' عاجل</span></dd></div>' +
        '<div><dt>إجمالي المُحصَّل</dt><dd><b class="ltr">' + fmtCompact(raised) + '</b><span class="muted" style="font-size:12.5px">من <span class="ltr">' + fmtCompact(goal) + '</span></span></dd></div><div><dt>متوسط الإنجاز</dt><dd><b>' + pct(raised, goal) + '%</b></dd></div>';
    }
    function filtered() {
      var q = normalize(st.q);
      return items.filter(function (p) {
        return (!q || normalize(p.title + ' ' + p.location + ' ' + cat(p.cat).label).indexOf(q) > -1) && (!st.cat || p.cat === st.cat) && (!st.status || p.status === st.status);
      });
    }
    function menuFor(p) {
      return [
        { icon: 'edit', label: 'تعديل', action: function () { openDrawer(p); } },
        { icon: 'content_copy', label: 'تكرار', action: function () { var c = Object.assign({}, p, { id: p.id + '-copy' + Date.now(), title: p.title + ' (نسخة)', status: 'draft', raised: 0, updated: 0 }); items.unshift(c); render(); stats(); toast('تم إنشاء نسخة كمسودة'); } },
        '-',
        { icon: 'delete', label: 'حذف', danger: true, action: function () { confirmDelete('المشروع', '«' + p.title + '» — سيُحذف من هذه المعاينة فقط.').then(function (ok) { if (!ok) return; items = items.filter(function (x) { return x !== p; }); st.sel.delete(p.id); render(); stats(); toast('تم حذف المشروع', { tone: 'danger' }); }); } }
      ];
    }
    function render() {
      var list = filtered();
      var pages = Math.max(1, Math.ceil(list.length / st.per)); if (st.page > pages) st.page = pages;
      var pageItems = list.slice((st.page - 1) * st.per, st.page * st.per);
      $$('#view-seg button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-value') === st.view ? 'true' : 'false'); });
      $('#result-count').textContent = list.length + ' نتيجة';
      if (!list.length) {
        view.innerHTML = emptyState('search_off', 'لا توجد مشاريع مطابقة', 'جرّب تعديل كلمات البحث أو إزالة عوامل التصفية لعرض المزيد من النتائج.', '<button type="button" class="btn btn-secondary" id="clear-filters">' + icon('filter_alt_off') + 'مسح عوامل التصفية</button>');
        $('#clear-filters').addEventListener('click', function () { st.q = ''; st.cat = ''; st.status = ''; search.value = ''; $('#f-cat').value = ''; $('#f-status').value = ''; render(); search.focus(); });
      } else if (st.view === 'table') {
        var allSel = pageItems.every(function (p) { return st.sel.has(p.id); }), someSel = pageItems.some(function (p) { return st.sel.has(p.id); });
        view.innerHTML = '<div class="table-wrap" tabindex="0" role="region" aria-label="جدول المشاريع"><table class="table"><thead><tr><th class="col-check" scope="col"><input type="checkbox" class="checkbox" id="sel-all" aria-label="تحديد كل مشاريع هذه الصفحة"' + (allSel ? ' checked' : '') + '></th><th scope="col">المشروع</th><th scope="col">الفئة</th><th scope="col">الحالة</th><th scope="col">التمويل</th><th scope="col">المُحصَّل / الهدف</th><th scope="col">آخر تحديث</th><th scope="col" class="col-actions"><span class="sr-only">إجراءات</span></th></tr></thead><tbody>' +
          pageItems.map(function (p) {
            var s = pStatus(p.status), c = cat(p.cat), pc = pct(p.raised, p.goal), on = st.sel.has(p.id);
            return '<tr class="' + (on ? 'is-selected' : '') + '"><td class="col-check"><input type="checkbox" class="checkbox" data-sel="' + esc(p.id) + '" aria-label="تحديد ' + esc(p.title) + '"' + (on ? ' checked' : '') + '></td>' +
              '<td><div class="cell-media"><img src="' + esc(p.image) + '" alt="" loading="lazy"><div style="min-width:0"><button type="button" class="t" data-edit="' + esc(p.id) + '" style="text-align:start">' + esc(p.title) + '</button><span class="s">' + icon('location_on') + esc(p.location) + '</span></div></div></td>' +
              '<td><span class="tag">' + icon(c.icon) + esc(c.label) + '</span></td><td>' + pill(s.label, s.tone) + '</td>' +
              '<td><div class="progress-cell"><div class="progress" role="progressbar" aria-label="نسبة التمويل" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pc + '"><span style="width:' + pc + '%"></span></div><b>' + pc + '%</b></div></td>' +
              '<td class="num-cell"><span class="amount">' + fmtMoney(p.raised) + '</span><div class="muted" style="font-size:12.5px">من <span class="ltr">' + fmtMoney(p.goal) + '</span></div></td>' +
              '<td class="muted" style="white-space:nowrap">' + (p.updated === 0 ? 'اليوم' : ago(p.updated * 1440)) + '</td>' +
              '<td class="col-actions"><button type="button" class="icon-btn sm" data-menu="' + esc(p.id) + '" aria-haspopup="menu" aria-expanded="false" aria-label="إجراءات: ' + esc(p.title) + '">' + icon('more_horiz') + '</button></td></tr>';
          }).join('') + '</tbody></table></div>';
        var sa = $('#sel-all'); sa.indeterminate = someSel && !allSel;
        sa.addEventListener('change', function () { pageItems.forEach(function (p) { sa.checked ? st.sel.add(p.id) : st.sel.delete(p.id); }); render(); $('#sel-all') && $('#sel-all').focus(); });
      } else {
        view.innerHTML = '<ul class="pgrid">' + pageItems.map(function (p) {
          var s = pStatus(p.status), c = cat(p.cat), pc = pct(p.raised, p.goal), on = st.sel.has(p.id);
          return '<li class="pcard' + (on ? ' is-selected' : '') + '"><div class="pcard-media"><img src="' + esc(p.image) + '" alt="" loading="lazy"><input type="checkbox" class="checkbox" data-sel="' + esc(p.id) + '" aria-label="تحديد ' + esc(p.title) + '"' + (on ? ' checked' : '') + '>' + pill(s.label, s.tone) + '</div>' +
            '<div class="pcard-body"><span class="tag" style="align-self:flex-start">' + icon(c.icon) + esc(c.label) + '</span><h3>' + esc(p.title) + '</h3>' +
            '<div><div class="pcard-meta"><span><b class="ltr">' + fmtMoney(p.raised) + '</b> من <span class="ltr">' + fmtMoney(p.goal) + '</span></span><b>' + pc + '%</b></div><div class="progress mt-8" role="progressbar" aria-label="نسبة التمويل" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pc + '"><span style="width:' + pc + '%"></span></div></div></div>' +
            '<div class="pcard-foot"><span class="muted" style="font-size:12.5px;display:inline-flex;align-items:center;gap:4px">' + icon('location_on') + esc(p.location) + '</span><button type="button" class="icon-btn sm" data-menu="' + esc(p.id) + '" aria-haspopup="menu" aria-expanded="false" aria-label="إجراءات: ' + esc(p.title) + '">' + icon('more_horiz') + '</button></div></li>';
        }).join('') + '</ul>';
      }
      $$('[data-sel]', view).forEach(function (cb) {
        cb.addEventListener('change', function () { var id = cb.getAttribute('data-sel'); cb.checked ? st.sel.add(id) : st.sel.delete(id); var row = cb.closest('tr, .pcard'); row.classList.toggle('is-selected', cb.checked); syncBulk(); var sa2 = $('#sel-all'); if (sa2) { var all = pageItems.every(function (p) { return st.sel.has(p.id); }), some = pageItems.some(function (p) { return st.sel.has(p.id); }); sa2.checked = all; sa2.indeterminate = some && !all; } });
      });
      $$('[data-menu]', view).forEach(function (b) { b.addEventListener('click', function () { var p = byId(items, b.getAttribute('data-menu')); rowMenu(b, menuFor(p)); }); });
      $$('[data-edit]', view).forEach(function (b) { b.addEventListener('click', function () { openDrawer(byId(items, b.getAttribute('data-edit'))); }); });
      pagination($('#proj-pages'), list.length, st.page, st.per, function (pg) { st.page = pg; render(); view.scrollIntoView({ block: 'nearest' }); });
      syncBulk();
    }
    function syncBulk() {
      var n = st.sel.size;
      bulk.hidden = !n;
      $('#bulk-count').textContent = 'تم تحديد ' + (n === 1 ? 'مشروع واحد' : n === 2 ? 'مشروعين' : n + (n <= 10 ? ' مشاريع' : ' مشروعاً'));
    }
    var searchT;
    search.addEventListener('input', function () { clearTimeout(searchT); searchT = setTimeout(function () { st.q = search.value; st.page = 1; render(); }, 120); });
    $('#f-cat').addEventListener('change', function (e) { st.cat = e.target.value; st.page = 1; render(); });
    $('#f-status').addEventListener('change', function (e) { st.status = e.target.value; st.page = 1; render(); });
    initSeg($('#view-seg'), function (v) { st.view = v; store.set('almel-admin-pview', v); render(); });
    $('#bulk-clear').addEventListener('click', function () { st.sel.clear(); render(); });
    $('#bulk-activate').addEventListener('click', function () { items.forEach(function (p) { if (st.sel.has(p.id)) p.status = 'active'; }); var n = st.sel.size; st.sel.clear(); render(); stats(); toast('تم تفعيل ' + n + ' من المشاريع'); });
    $('#bulk-draft').addEventListener('click', function () { items.forEach(function (p) { if (st.sel.has(p.id)) p.status = 'draft'; }); var n = st.sel.size; st.sel.clear(); render(); stats(); toast('تم نقل ' + n + ' إلى المسودات', { tone: 'info', icon: 'inventory_2' }); });
    $('#bulk-delete').addEventListener('click', function () {
      var n = st.sel.size;
      confirmDelete(n + ' من المشاريع').then(function (ok) { if (!ok) return; items = items.filter(function (p) { return !st.sel.has(p.id); }); st.sel.clear(); render(); stats(); toast('تم حذف ' + n + ' من المشاريع', { tone: 'danger' }); });
    });

    // Drawer (add / edit)
    var drawer = $('#project-drawer'), form = $('#project-form'), editing = null, coverData = null;
    function setCover(src) {
      coverData = src;
      $('#pf-cover-preview').hidden = !src; $('#pf-dropzone').hidden = !!src;
      if (src) $('#pf-cover-img').src = src;
    }
    function clearErrors() { $$('[aria-invalid]', form).forEach(function (i) { i.removeAttribute('aria-invalid'); }); $$('.error', form).forEach(function (e) { e.hidden = true; }); }
    function openDrawer(p) {
      editing = p || null;
      form.reset(); clearErrors();
      $('#drawer-title').textContent = p ? 'تعديل المشروع' : 'مشروع جديد';
      $('#drawer-sub').textContent = p ? 'حدّث بيانات المشروع ثم احفظ التغييرات.' : 'أدخل بيانات المشروع لإضافته إلى القائمة.';
      $('#pf-title').value = p ? p.title : '';
      AC_set($('#pf-cat'), p ? p.cat : 'relief');
      AC_set($('#pf-gov'), p ? p.gov : 'north');
      $('#pf-location').value = p ? p.location : '';
      $('#pf-goal').value = p ? p.goal : '';
      $('#pf-raised').value = p ? p.raised : '';
      AC_set($('#pf-status'), p ? p.status : 'draft');
      $('#pf-desc').value = p ? (p.desc || '') : '';
      $('#pf-desc').dispatchEvent(new Event('input'));
      setCover(p ? p.image : null);
      Drawer.open(drawer, { focus: '#pf-title' });
    }
    window.__openProjectDrawer = function () { openDrawer(null); };
    $('#add-project').addEventListener('click', function () { openDrawer(null); });
    wireDropzone($('#pf-dropzone'), function (files) { readFileAsDataURL(files[0]).then(function (src) { setCover(src); $('#pf-cover-name').textContent = files[0].name + ' · ' + fmtSize(files[0].size); toast('تم تحميل صورة الغلاف', { text: 'معاينة محلية فقط — لم تُرفع إلى أي خادم.', icon: 'image' }); }); });
    $('#pf-cover-change').addEventListener('click', function () { $('#pf-cover-input').click(); });
    $('#pf-cover-remove').addEventListener('click', function () { setCover(null); $('#pf-cover-name').textContent = ''; $('#pf-dropzone input').focus(); });
    $('#pf-desc').addEventListener('input', function () { if (this.hasAttribute('data-rich') && window.AdminEditor) return; var n = this.value.length; var c = $('#pf-desc-count'); c.textContent = n + ' / 280'; c.classList.toggle('over', n > 280); });
    function fieldError(input, msg) { input.setAttribute('aria-invalid', 'true'); var e = $('#' + input.id + '-err'); if (e) { e.hidden = false; $('span:last-child', e).textContent = msg; } }
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clearErrors();
      var title = $('#pf-title'), goal = $('#pf-goal'), raised = $('#pf-raised'), bad = [];
      if (title.value.trim().length < 5) { fieldError(title, 'أدخل عنواناً واضحاً من 5 أحرف على الأقل.'); bad.push(title); }
      if (!(+goal.value > 0)) { fieldError(goal, 'أدخل مبلغ هدف أكبر من صفر.'); bad.push(goal); }
      if (raised.value !== '' && +raised.value < 0) { fieldError(raised, 'لا يمكن أن يكون المبلغ سالباً.'); bad.push(raised); }
      if (($('#pf-desc').hasAttribute('data-rich') && window.AdminEditor) ? window.AdminEditor.textLength($('#pf-desc').value) > 2000 : $('#pf-desc').value.length > 280) { bad.push($('#pf-desc')); }
      if (bad.length) { bad[0].focus(); toast('يرجى تصحيح الحقول المظللة', { tone: 'danger', icon: 'error' }); return; }
      var data = { title: title.value.trim(), cat: $('#pf-cat').value, gov: $('#pf-gov').value, location: $('#pf-location').value.trim() || (window.AdminConstants ? AdminConstants.label('governorate', $('#pf-gov').value) : ($('#pf-gov').value)), goal: +goal.value, raised: +raised.value || 0, status: $('#pf-status').value, desc: $('#pf-desc').value, image: coverData || '/assets/site/img/project-parallax.jpg', updated: 0 };
      if (editing) Object.assign(editing, data); else items.unshift(Object.assign({ id: 'p' + Date.now(), donors: 0 }, data));
      Drawer.close(drawer); st.page = 1; render(); stats();
      toast(editing ? 'تم حفظ التغييرات' : 'تمت إضافة المشروع', { text: data.title });
    });
    stats(); render();
    if (location.hash === '#new') setTimeout(function () { openDrawer(null); }, 300);
  };

  /* ----- News list ----- */
  var NEWS_STATUS = { published: { label: 'منشور', tone: 'info' }, draft: { label: 'مسودة', tone: 'neutral' }, scheduled: { label: 'مجدول', tone: 'warn' } };
  if (window.AdminConstants) AdminConstants.all('article_status').forEach(function (c) { if (NEWS_STATUS[c.key]) NEWS_STATUS[c.key].label = c.label; });
  function newsCat(id) { var c = byId(D.newsCategories || [], id) || { label: id }; return { id: c.id, label: acLabel('news_category', id, c.label) }; }
  Pages.news = function () {
    var items = (D.news || []).map(function (n) { return Object.assign({}, n); });
    var st = { tab: 'all', q: '', cat: '', page: 1, per: 6 };
    var tabsEl = $('#news-tabs'), body = $('#news-body');
    function counts() {
      $$('[data-tab-count]', tabsEl).forEach(function (c) { var k = c.getAttribute('data-tab-count'); c.textContent = k === 'all' ? items.length : items.filter(function (n) { return n.status === k; }).length; });
    }
    function render() {
      counts();
      var q = normalize(st.q);
      var list = items.filter(function (n) { return (st.tab === 'all' || n.status === st.tab) && (!st.cat || n.cat === st.cat) && (!q || normalize(n.title + ' ' + (n.tags || []).join(' ')).indexOf(q) > -1); })
        .sort(function (a, b) { return b.date.localeCompare(a.date); });
      var pages = Math.max(1, Math.ceil(list.length / st.per)); if (st.page > pages) st.page = pages;
      var pageItems = list.slice((st.page - 1) * st.per, st.page * st.per);
      if (!list.length) {
        var lbl = st.tab === 'all' ? '' : NEWS_STATUS[st.tab].label;
        body.innerHTML = emptyState('article', lbl ? 'لا توجد أخبار بحالة «' + lbl + '»' : 'لا توجد نتائج', 'أنشئ خبراً جديداً أو غيّر عوامل التصفية لعرض المزيد.', '<a class="btn btn-primary" href="/admin/news-edit">' + icon('add') + 'خبر جديد</a>');
      } else {
        body.innerHTML = '<div class="table-wrap" tabindex="0" role="region" aria-label="جدول الأخبار"><table class="table"><thead><tr><th scope="col">الخبر</th><th scope="col">التصنيف</th><th scope="col">الحالة</th><th scope="col">الكاتب</th><th scope="col">التاريخ</th><th scope="col">المشاهدات</th><th scope="col" class="col-actions"><span class="sr-only">إجراءات</span></th></tr></thead><tbody>' +
          pageItems.map(function (n) {
            var s = NEWS_STATUS[n.status];
            return '<tr><td><a class="cell-media" href="/admin/news-edit?id=' + encodeURIComponent(n.id) + '"><img src="' + esc(n.image) + '" alt="" loading="lazy"><div style="min-width:0"><span class="t">' + esc(n.title) + '</span><span class="s">' + (n.tags || []).map(function (t) { return '#' + esc(t); }).join(' ') + '</span></div></a></td>' +
              '<td><span class="tag">' + esc(newsCat(n.cat).label) + '</span></td><td>' + pill(s.label, s.tone) + '</td><td>' + esc(n.author) + '</td>' +
              '<td style="white-space:nowrap">' + (n.status === 'scheduled' ? icon('schedule', 'muted') + ' ' : '') + fmtDate(parseISO(n.date), { day: 'numeric', month: 'short', year: 'numeric' }) + '</td>' +
              '<td class="num-cell">' + (n.views ? fmtNum(n.views) : '<span class="muted">—</span>') + '</td>' +
              '<td class="col-actions"><button type="button" class="icon-btn sm" data-menu="' + esc(n.id) + '" aria-haspopup="menu" aria-expanded="false" aria-label="إجراءات: ' + esc(n.title) + '">' + icon('more_horiz') + '</button></td></tr>';
          }).join('') + '</tbody></table></div>';
        $$('[data-menu]', body).forEach(function (b) {
          b.addEventListener('click', function () {
            var n = byId(items, b.getAttribute('data-menu'));
            rowMenu(b, [
              { icon: 'edit', label: 'تحرير', action: function () { location.href = '/admin/news-edit?id=' + encodeURIComponent(n.id); } },
              n.status !== 'published' ? { icon: 'publish', label: 'نشر الآن', action: function () { n.status = 'published'; render(); toast('تم نشر الخبر', { text: n.title }); } } : { icon: 'unpublished', label: 'إرجاع إلى المسودات', action: function () { n.status = 'draft'; render(); toast('أُعيد الخبر إلى المسودات', { tone: 'info', icon: 'inventory_2' }); } },
              '-',
              { icon: 'delete', label: 'حذف', danger: true, action: function () { confirmDelete('الخبر', '«' + n.title + '»').then(function (ok) { if (!ok) return; items = items.filter(function (x) { return x !== n; }); render(); toast('تم حذف الخبر', { tone: 'danger' }); }); } }
            ]);
          });
        });
      }
      pagination($('#news-pages'), list.length, st.page, st.per, function (pg) { st.page = pg; render(); });
    }
    initTabs(tabsEl, function (tab) { st.tab = tab.getAttribute('data-value'); st.page = 1; $('#news-panel').setAttribute('aria-labelledby', tab.id); render(); });
    var t; $('#n-search').addEventListener('input', function (e) { clearTimeout(t); t = setTimeout(function () { st.q = e.target.value; st.page = 1; render(); }, 120); });
    $('#n-cat').addEventListener('change', function (e) { st.cat = e.target.value; st.page = 1; render(); });
    render();
  };

  /* ----- News editor ----- */
  Pages['news-edit'] = function () {
    var id = new URLSearchParams(location.search).get('id');
    var n = id ? byId(D.news, id) : null;
    var title = $('#ne-title'), rte = $('#ne-body'), slug = $('#ne-slug'), meta = $('#ne-meta'), statusSel = $('#ne-status');
    var tags = [];
    function autoGrow() { title.style.height = 'auto'; title.style.height = title.scrollHeight + 'px'; }
    function slugify(s) { return normalize(s).replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60); }
    var slugTouched = false;
    function syncSeo() {
      var t = title.value.trim() || 'عنوان الخبر يظهر هنا';
      if (!slugTouched) slug.value = slugify(title.value) || '';
      $('#seo-t').textContent = t + ' | جمعية الشمال للتنمية والتطوير المجتمعي';
      $('#seo-u').textContent = 'shamal-society.org › news › ' + (slug.value || 'slug');
      var d = meta.value.trim() || rte.textContent.trim().slice(0, 155) || 'أضف وصفاً مختصراً يظهر في نتائج محركات البحث ومشاركات الشبكات الاجتماعية.';
      $('#seo-d').textContent = d.length > 160 ? d.slice(0, 157) + '…' : d;
      var c = $('#ne-meta-count'); c.textContent = meta.value.length + ' / 160'; c.classList.toggle('over', meta.value.length > 160);
    }
    function renderTags() {
      $('#ne-tags-list').innerHTML = tags.map(function (t, i) { return '<li class="chip">' + esc(t) + '<button type="button" data-rm="' + i + '" aria-label="إزالة الوسم ' + esc(t) + '">' + icon('close') + '</button></li>'; }).join('');
    }
    $('#ne-tags-list').addEventListener('click', function (e) { var b = e.target.closest('[data-rm]'); if (!b) return; tags.splice(+b.getAttribute('data-rm'), 1); renderTags(); $('#ne-tag-input').focus(); });
    $('#ne-tag-input').addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ',' || e.key === '،') && this.value.trim()) { e.preventDefault(); var v = this.value.trim().replace(/^#/, ''); if (tags.indexOf(v) < 0) tags.push(v); this.value = ''; renderTags(); }
      else if (e.key === 'Backspace' && !this.value && tags.length) { tags.pop(); renderTags(); }
    });
    function wordCount() {
      var txt = rte.textContent.trim(); var w = txt ? txt.split(/\s+/).length : 0;
      $('#ne-words').textContent = w + ' كلمة · ' + Math.max(1, Math.round(w / 180)) + ' د قراءة';
      rte.classList.toggle('is-empty', !txt && !rte.querySelector('img,li'));
    }
    // Load
    var pad = function (x) { return String(x).padStart(2, '0'); };
    var toLocalInput = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
    if (n) {
      $('#ne-heading').textContent = 'تحرير الخبر';
      document.title = 'تحرير: ' + n.title + ' — لوحة التحكم';
      title.value = n.title; AC_set($('#ne-cat'), n.cat); AC_set(statusSel, n.status); tags = (n.tags || []).slice();
      var dd = parseISO(n.date); dd.setHours(10, 0); $('#ne-date').value = toLocalInput(dd);
      rte.innerHTML = '<p>' + esc('نص تجريبي: هذه فقرة افتتاحية للخبر «' + n.title + '». يُستبدل هذا النص بالمحتوى الرسمي من المكتب الإعلامي عند ربط القالب بنظام إدارة المحتوى.') + '</p><h2>أبرز ما جاء في الخبر</h2><ul><li>توثيق ميداني بالصور لكل مرحلة من مراحل التوزيع.</li><li>تنسيق مع الشركاء لضمان وصول المساعدات إلى مستحقيها.</li></ul><blockquote>«الشفافية جزء أصيل من عملنا» — اقتباس تجريبي.</blockquote>';
      setCover(n.image);
    } else {
      var t0 = new Date(); t0.setMinutes(0); t0.setHours(t0.getHours() + 1); $('#ne-date').value = toLocalInput(t0);
    }
    renderTags(); autoGrow(); wordCount(); syncSeo(); syncPublishBtn();
    function syncPublishBtn() { var s = statusSel.value; $('#ne-publish .btn-text').textContent = s === 'scheduled' ? 'جدولة النشر' : s === 'draft' ? 'حفظ المسودة' : (n && n.status === 'published' ? 'تحديث الخبر' : 'نشر الآن'); $('#ne-date-field').hidden = s === 'draft'; $('#ne-draft').hidden = s === 'draft'; var ic = $('#ne-publish .material-symbols-outlined'); ic.textContent = s === 'draft' ? 'save' : s === 'scheduled' ? 'schedule_send' : 'send'; ic.classList.toggle('flip-rtl', s !== 'draft'); }
    statusSel.addEventListener('change', syncPublishBtn);
    title.addEventListener('input', function () { autoGrow(); syncSeo(); markDirty(); });
    slug.addEventListener('input', function () { slugTouched = true; syncSeo(); });
    meta.addEventListener('input', syncSeo);
    rte.addEventListener('input', function () { wordCount(); syncSeo(); markDirty(); });
    window.addEventListener('resize', autoGrow);
    var dirtyT;
    function markDirty() {
      var s = $('#save-state'); s.innerHTML = icon('edit') + 'تغييرات غير محفوظة';
      clearTimeout(dirtyT); dirtyT = setTimeout(function () { s.innerHTML = icon('cloud_done') + 'حُفظت المسودة تلقائياً (محلياً)'; }, 1200);
    }

    // Toolbar
    var toolbar = $('#rte-toolbar');
    toolbar.addEventListener('mousedown', function (e) { if (e.target.closest('button')) e.preventDefault(); });
    toolbar.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-cmd]'); if (!b) return;
      var cmd = b.getAttribute('data-cmd'), val = b.getAttribute('data-val');
      rte.focus();
      if (cmd === 'createLink') {
        modal({ title: 'إدراج رابط', icon: 'link', body: '<div class="field mt-16"><label class="label" for="link-url">عنوان الرابط</label><input class="input" id="link-url" type="url" dir="ltr" placeholder="https://" value="https://"></div>', confirmText: 'إدراج', focus: '#link-url', getValue: function (d) { return $('#link-url', d).value; } })
          .then(function (url) { if (url && url !== 'https://') { rte.focus(); document.execCommand('createLink', false, url); wordCount(); } });
        return;
      }
      if (cmd === 'formatBlock') {
        var cur = (document.queryCommandValue('formatBlock') || '').toLowerCase();
        document.execCommand('formatBlock', false, cur === val.toLowerCase() ? 'p' : val);
      } else document.execCommand(cmd, false, val || null);
      syncToolbar(); wordCount();
    });
    function syncToolbar() {
      $$('button[data-cmd]', toolbar).forEach(function (b) {
        var cmd = b.getAttribute('data-cmd');
        if (!b.hasAttribute('aria-pressed')) return;
        var on = false;
        try { on = cmd === 'formatBlock' ? (document.queryCommandValue('formatBlock') || '').toLowerCase() === b.getAttribute('data-val').toLowerCase() : document.queryCommandState(cmd); } catch (err) { on = false; }
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
    document.addEventListener('selectionchange', function () { if (rte.contains(document.getSelection().anchorNode)) syncToolbar(); });
    rte.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && ['b', 'i', 'u'].indexOf(e.key.toLowerCase()) > -1) setTimeout(syncToolbar, 0);
    });

    // Cover
    function setCover(src) {
      $('#ne-cover-preview').hidden = !src; $('#ne-dropzone').hidden = !!src;
      if (src) $('#ne-cover-img').src = src;
    }
    wireDropzone($('#ne-dropzone'), function (files) { readFileAsDataURL(files[0]).then(function (src) { setCover(src); toast('تم تحميل صورة الغلاف', { text: 'معاينة محلية فقط.', icon: 'image' }); }); });
    $('#ne-cover-change').addEventListener('click', function () { $('#ne-cover-input').click(); });
    $('#ne-cover-remove').addEventListener('click', function () { setCover(null); $('#ne-cover-input').focus(); });

    // Actions
    function validate() {
      if (title.value.trim().length < 8) {
        title.setAttribute('aria-invalid', 'true'); $('#ne-title-err').hidden = false; title.focus();
        toast('العنوان قصير جداً', { text: 'اكتب عنواناً من 8 أحرف على الأقل.', tone: 'danger', icon: 'error' }); return false;
      }
      title.removeAttribute('aria-invalid'); $('#ne-title-err').hidden = true; return true;
    }
    $('#ne-draft').addEventListener('click', function () { if (!validate()) return; $('#save-state').innerHTML = icon('cloud_done') + 'حُفظت المسودة'; toast('تم حفظ المسودة', { icon: 'save' }); });
    $('#ne-publish').addEventListener('click', function () {
      if (!validate()) return;
      var b = this, s = statusSel.value;
      b.classList.add('is-loading'); var ic = b.querySelector('.material-symbols-outlined'); var old = ic.outerHTML; ic.outerHTML = '<span class="spinner" aria-hidden="true"></span>';
      setTimeout(function () {
        b.classList.remove('is-loading'); b.querySelector('.spinner').outerHTML = old;
        toast(s === 'scheduled' ? 'تمت جدولة الخبر' : s === 'draft' ? 'تم حفظ المسودة' : 'تم نشر الخبر', { text: s === 'scheduled' ? fmtDate(new Date($('#ne-date').value), { day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' }) : 'واجهة تجريبية — لم يُرسل شيء إلى خادم.' });
      }, 700);
    });
    $('#ne-preview').addEventListener('click', function () { location.href = '/news' + (n ? '/' + encodeURIComponent(n.id) : ''); });
  };

  /* ----- Gallery ----- */
  Pages.gallery = function () {
    var items = (D.gallery || []).map(function (g) { return Object.assign({}, g); });
    var albums = (D.albums || []).slice();
    var AC = window.AdminConstants;
    function shownAlbums() { if (!AC) return albums; var on = {}; AC.get('gallery_album').forEach(function (c) { on[c.key] = 1; }); return albums.filter(function (a) { return on[a.id] || items.some(function (g) { return g.album === a.id; }); }); }
    var st = { album: 'all', sel: new Set(), active: null };
    var grid = $('#g-grid'), panel = $('#g-panel'), mq = matchMedia('(max-width: 1279px)');
    function albumLabel(id) { var a = byId(albums, id); return a ? a.label : ((AC && AC.label('gallery_album', id)) || 'بدون ألبوم'); }
    function renderChips() {
      var chips = [{ id: 'all', label: 'كل الصور' }].concat(shownAlbums());
      $('#g-albums').innerHTML = chips.map(function (a) {
        var c = a.id === 'all' ? items.length : items.filter(function (g) { return g.album === a.id; }).length;
        return '<button type="button" class="chip-btn" data-album="' + a.id + '" aria-pressed="' + (st.album === a.id) + '">' + esc(a.label) + '<span class="c">' + c + '</span></button>';
      }).join('');
      $$('[data-album]').forEach(function (b) { b.addEventListener('click', function () { st.album = b.getAttribute('data-album'); renderChips(); renderGrid(); }); });
    }
    function renderGrid() {
      var list = items.filter(function (g) { return st.album === 'all' || g.album === st.album; });
      grid.classList.toggle('has-selection', st.sel.size > 0);
      if (!list.length) {
        grid.innerHTML = '<li style="grid-column:1/-1">' + emptyState('photo_library', 'هذا الألبوم فارغ', 'اسحب الصور إلى منطقة الرفع أعلاه أو اخترها من جهازك لإضافتها إلى هذا الألبوم.', '') + '</li>';
      } else {
        grid.innerHTML = list.map(function (g) {
          var on = st.sel.has(g.id);
          return '<li class="gtile' + (on ? ' is-selected' : '') + (st.active === g.id ? ' is-active' : '') + '"><img src="' + esc(g.src) + '" alt="' + esc(g.alt || '') + '" loading="lazy">' +
            '<button type="button" class="g-open" data-open="' + g.id + '" aria-label="تفاصيل الصورة: ' + esc(g.title) + '"></button>' +
            '<span class="g-check"><input type="checkbox" class="checkbox" data-sel="' + g.id + '" aria-label="تحديد ' + esc(g.title) + '"' + (on ? ' checked' : '') + '></span>' +
            (g.isNew ? '<span class="pill no-dot g-new">جديد</span>' : '') + '<span class="g-cap" aria-hidden="true">' + esc(g.title) + '</span></li>';
        }).join('');
      }
      $$('[data-sel]', grid).forEach(function (cb) { cb.addEventListener('change', function () { var id = cb.getAttribute('data-sel'); cb.checked ? st.sel.add(id) : st.sel.delete(id); cb.closest('.gtile').classList.toggle('is-selected', cb.checked); grid.classList.toggle('has-selection', st.sel.size > 0); syncBulk(); }); });
      $$('[data-open]', grid).forEach(function (b) { b.addEventListener('click', function () { openDetail(b.getAttribute('data-open'), b); }); });
      syncBulk();
    }
    function syncBulk() {
      var n = st.sel.size;
      $('#g-bulk').hidden = !n;
      $('#g-bulk-count').textContent = 'تم تحديد ' + (n === 1 ? 'صورة واحدة' : n === 2 ? 'صورتين' : n + (n <= 10 ? ' صور' : ' صورة'));
    }
    function renderPanel() {
      var g = st.active ? byId(items, st.active) : null;
      $('#gp-empty').hidden = !!g; $('#gp-form').hidden = !g;
      if (!g) return;
      $('#gp-img').src = g.src; $('#gp-img').alt = g.alt || '';
      $('#gp-title').value = g.title; $('#gp-alt').value = g.alt || ''; AC_set($('#gp-album'), g.album);
      $('#gp-dims').textContent = g.dims || '—'; $('#gp-size').textContent = g.size || '—';
      $('#gp-alt').dispatchEvent(new Event('input'));
    }
    function openDetail(id, trigger) {
      st.active = id; renderPanel();
      $$('.gtile', grid).forEach(function (t) { var b = $('[data-open]', t); t.classList.toggle('is-active', b && b.getAttribute('data-open') === id); });
      if (mq.matches) { panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); Drawer.open(panel, { focus: '#gp-title', returnFocus: trigger }); }
      else setTimeout(function () { $('#gp-title').focus(); }, 30);
    }
    panel._onClose = function () { panel.setAttribute('role', 'region'); panel.removeAttribute('aria-modal'); };
    mq.addEventListener('change', function () { if (!mq.matches) Drawer.close(panel); });
    $('#gp-alt').addEventListener('input', function () { var c = $('#gp-alt-count'); c.textContent = this.value.length + ' / 125'; c.classList.toggle('over', this.value.length > 125); });
    $('#gp-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var g = byId(items, st.active); if (!g) return;
      if (!$('#gp-title').value.trim()) { $('#gp-title').setAttribute('aria-invalid', 'true'); $('#gp-title').focus(); return; }
      $('#gp-title').removeAttribute('aria-invalid');
      g.title = $('#gp-title').value.trim(); g.alt = $('#gp-alt').value.trim(); g.album = $('#gp-album').value;
      renderChips(); renderGrid(); toast('تم حفظ بيانات الصورة');
      if (mq.matches) Drawer.close(panel);
    });
    function remove(ids, label) {
      return confirmDelete(label).then(function (ok) {
        if (!ok) return;
        items = items.filter(function (g) { return ids.indexOf(g.id) < 0; });
        ids.forEach(function (i) { st.sel.delete(i); });
        if (ids.indexOf(st.active) > -1) { st.active = null; if (mq.matches) Drawer.close(panel); renderPanel(); }
        renderChips(); renderGrid(); toast(ids.length > 1 ? 'تم حذف ' + ids.length + ' صور' : 'تم حذف الصورة', { tone: 'danger' });
      });
    }
    $('#gp-delete').addEventListener('click', function () { var g = byId(items, st.active); if (g) remove([g.id], 'الصورة «' + g.title + '»'); });
    $('#gp-copy').addEventListener('click', function () { var g = byId(items, st.active); var url = g && g.src.indexOf('data:') === 0 ? '(صورة محلية)' : g.src; if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).catch(function () {}); toast('تم نسخ رابط الصورة', { text: url.slice(0, 60), icon: 'link' }); });
    $('#g-bulk-delete').addEventListener('click', function () { var ids = Array.from(st.sel); remove(ids, ids.length + ' من الصور'); });
    $('#g-bulk-clear').addEventListener('click', function () { st.sel.clear(); renderGrid(); });
    $('#bulk-move').addEventListener('change', function () {
      var a = this.value; if (!a) return;
      var n = st.sel.size; items.forEach(function (g) { if (st.sel.has(g.id)) g.album = a; });
      st.sel.clear(); this.value = ''; renderChips(); renderGrid(); toast('تم نقل ' + n + ' إلى «' + albumLabel(a) + '»', { icon: 'drive_file_move' });
    });
    $('#g-select-all').addEventListener('click', function () { items.filter(function (g) { return st.album === 'all' || g.album === st.album; }).forEach(function (g) { st.sel.add(g.id); }); renderGrid(); });
    $('#new-album').addEventListener('click', function () {
      modal({ title: 'ألبوم جديد', icon: 'create_new_folder', body: '<div class="field mt-16"><label class="label" for="album-name">اسم الألبوم</label><input class="input" id="album-name" maxlength="40" placeholder="مثال: حملة الشتاء"></div>', confirmText: 'إنشاء', focus: '#album-name',
        validate: function (d) { var i = $('#album-name', d); if (!i.value.trim()) { i.setAttribute('aria-invalid', 'true'); i.focus(); return false; } return true; },
        getValue: function (d) { return $('#album-name', d).value.trim(); } })
        .then(function (name) { if (!name) return; var id = 'a' + Date.now(); albums.push({ id: id, label: name }); if (AC) AC.add('gallery_album', { key: id, label: name }); st.album = id; renderChips(); renderGrid(); toast('تم إنشاء الألبوم «' + name + '»', { icon: 'folder' }); });
    });
    // Upload
    function addFiles(files) {
      var target = st.album === 'all' ? 'field' : st.album;
      Promise.all(files.map(function (f) {
        return readFileAsDataURL(f).then(function (src) {
          return new Promise(function (res) {
            var im = new Image();
            im.onload = function () { res({ id: 'n' + Date.now() + Math.random().toString(36).slice(2, 6), src: src, title: f.name.replace(/\.[^.]+$/, ''), alt: '', album: target, size: fmtSize(f.size), dims: im.naturalWidth + '×' + im.naturalHeight, isNew: true }); };
            im.onerror = function () { res(null); };
            im.src = src;
          });
        });
      })).then(function (added) {
        added = added.filter(Boolean);
        if (!added.length) return;
        items = added.concat(items); renderChips(); renderGrid();
        toast('تمت إضافة ' + (added.length === 1 ? 'صورة واحدة' : added.length === 2 ? 'صورتين' : added.length + ' صور'), { text: 'معاينة محلية عبر FileReader — لم يُرفع شيء إلى خادم.', icon: 'cloud_upload' });
      });
    }
    wireDropzone($('#g-dropzone'), addFiles);
    $('#g-upload-btn').addEventListener('click', function () { $('#g-file').click(); });
    renderChips(); renderGrid(); renderPanel();
    if (location.hash === '#upload') setTimeout(function () { $('#g-file').focus(); $('#g-dropzone').scrollIntoView({ block: 'center' }); }, 200);
  };

  /* ----- Messages ----- */
  Pages.messages = function () {
    var msgs = D.messages || [];
    var st = { box: 'all', type: '', q: '', active: null };
    var listEl = $('#m-list'), reader = $('#m-reader'), inbox = $('#inbox');
    function filtered() {
      var q = normalize(st.q);
      return msgs.filter(function (m) {
        if (st.box === 'archived') { if (!m.archived) return false; } else if (m.archived) return false;
        if (st.box === 'unread' && m.read) return false;
        if (st.box === 'starred' && !m.starred) return false;
        if (st.type && m.type !== st.type) return false;
        return !q || normalize(m.from + ' ' + m.subject + ' ' + m.body).indexOf(q) > -1;
      });
    }
    function syncHeader() {
      var u = unreadCount();
      $('#m-sub').textContent = u ? u + ' رسائل غير مقروءة بحاجة إلى متابعة' : 'لا توجد رسائل غير مقروءة — عمل رائع!';
      updateCounts();
    }
    function renderList() {
      var list = filtered();
      if (!list.length) { listEl.innerHTML = '<li role="presentation">' + emptyState(st.box === 'starred' ? 'star' : 'inbox', 'لا توجد رسائل', st.q ? 'لا نتائج مطابقة لبحثك.' : 'لا توجد رسائل في هذا التصنيف حالياً.', '') + '</li>'; listEl.removeAttribute('aria-activedescendant'); return; }
      var hasActive = list.some(function (m) { return m.id === st.active; });
      listEl.innerHTML = list.map(function (m, i) {
        var t = MSG_TYPES[m.type], sel = m.id === st.active;
        return '<li class="mitem' + (m.read ? '' : ' unread') + '" role="option" id="opt-' + m.id + '" data-id="' + m.id + '" aria-selected="' + sel + '" tabindex="' + (sel || (!hasActive && i === 0) ? 0 : -1) + '">' +
          '<span class="avatar navy" aria-hidden="true">' + icon(t.icon) + '</span><div class="li-main"><div class="top">' + (m.read ? '' : '<span class="udot" aria-hidden="true"></span>') + '<span class="from">' + esc(m.from) + '</span><time>' + ago(m.mins) + '</time></div>' +
          '<p class="subj">' + (m.read ? '' : '<span class="sr-only">غير مقروءة: </span>') + esc(m.subject) + '</p><p class="snip">' + esc(m.body.replace(/\n/g, ' ')) + '</p>' +
          '<div class="row2">' + pill(t.label, t.tone) + (m.starred ? icon('star', 'fill star') + '<span class="sr-only">مميزة بنجمة</span>' : '') + '</div></div></li>';
      }).join('');
    }
    function renderReader() {
      var m = st.active ? byId(msgs, st.active) : null;
      if (!m) {
        reader.innerHTML = '<div class="reader-scroll" style="justify-content:center">' + emptyState('mark_email_read', 'اختر رسالة لقراءتها', 'تظهر هنا تفاصيل الرسالة وصندوق الرد السريع.', '') + '</div>';
        return;
      }
      var t = MSG_TYPES[m.type];
      reader.innerHTML = '<div class="reader-head"><button type="button" class="icon-btn reader-back" id="m-back" aria-label="العودة إلى القائمة">' + icon('arrow_forward') + '</button><span class="pill pill-' + t.tone + '">' + esc(t.label) + '</span><span class="tb-spacer"></span><div class="reader-actions" role="toolbar" aria-label="إجراءات الرسالة">' +
        '<button type="button" class="icon-btn" id="m-star" aria-pressed="' + !!m.starred + '" aria-label="تمييز بنجمة" title="تمييز بنجمة">' + icon('star', m.starred ? 'fill' : '') + '</button>' +
        '<button type="button" class="icon-btn" id="m-unread" aria-label="تعليم كغير مقروءة" title="تعليم كغير مقروءة">' + icon('mark_email_unread') + '</button>' +
        '<button type="button" class="icon-btn" id="m-archive" aria-label="' + (m.archived ? 'إلغاء الأرشفة' : 'أرشفة') + '" title="' + (m.archived ? 'إلغاء الأرشفة' : 'أرشفة') + '">' + icon(m.archived ? 'unarchive' : 'archive') + '</button>' +
        '<button type="button" class="icon-btn" id="m-delete" aria-label="حذف" title="حذف">' + icon('delete') + '</button></div></div>' +
        '<div class="reader-scroll"><div class="reader-body"><h2 class="reader-subject" id="m-subject" tabindex="-1">' + esc(m.subject) + '</h2>' +
        '<div class="reader-meta"><span class="avatar navy" aria-hidden="true">' + icon(t.icon) + '</span><div style="flex:1;min-width:0"><strong>' + esc(m.from) + '</strong><span class="ltr">' + esc(m.email) + '</span></div><span>' + ago(m.mins) + '</span></div>' +
        '<div class="reader-text">' + esc(m.body) + '</div></div>' +
        '<form class="reply" id="m-reply"><div class="reply-to">' + icon('reply', 'flip-rtl') + 'رد إلى <span class="ltr">' + esc(m.email) + '</span></div><label class="sr-only" for="m-reply-text">نص الرد</label><textarea id="m-reply-text" placeholder="اكتب ردك هنا…"></textarea>' +
        '<div class="reply-foot"><div class="chips" role="group" aria-label="ردود جاهزة"><button type="button" class="chip-btn" data-tpl="شكراً لتواصلك مع جمعية الشمال للتنمية والتطوير المجتمعي، وصلتنا رسالتك وسنعود إليك قريباً.">شكر واستلام</button><button type="button" class="chip-btn" data-tpl="تم تحويل طلبك إلى الفريق المختص، وسيتواصل معك خلال يومي عمل.">تحويل للفريق</button><button type="button" class="chip-btn" data-tpl="يسعدنا انضمامك إلى فريق المتطوعين، نرجو تعبئة نموذج التطوع المرفق.">ترحيب بمتطوع</button></div>' +
        '<div class="row" style="gap:4px"><button type="button" class="icon-btn sm" aria-label="إرفاق ملف" title="إرفاق ملف (واجهة فقط)">' + icon('attach_file') + '</button><button type="submit" class="btn btn-primary btn-sm">' + icon('send', 'flip-rtl') + 'إرسال الرد</button></div></div></form></div>';
      $('#m-back').addEventListener('click', function () { inbox.classList.remove('show-reader'); var o = $('#opt-' + m.id); if (o) o.focus(); });
      $('#m-star').addEventListener('click', function () { m.starred = !m.starred; renderList(); renderReader(); $('#m-star').focus(); toast(m.starred ? 'تمت إضافة الرسالة إلى المميزة' : 'أُزيلت من المميزة', { icon: 'star' }); });
      $('#m-unread').addEventListener('click', function () { m.read = false; st.active = null; renderList(); renderReader(); syncHeader(); inbox.classList.remove('show-reader'); toast('تم تعليم الرسالة كغير مقروءة', { icon: 'mark_email_unread', tone: 'info' }); var o = $('#opt-' + m.id); if (o) o.focus(); });
      $('#m-archive').addEventListener('click', function () { m.archived = !m.archived; var was = m.archived; st.active = null; renderList(); renderReader(); syncHeader(); inbox.classList.remove('show-reader'); toast(was ? 'تمت أرشفة الرسالة' : 'أُعيدت الرسالة إلى الوارد', { icon: was ? 'archive' : 'unarchive', tone: 'info' }); focusFirst(); });
      $('#m-delete').addEventListener('click', function () { confirmDelete('الرسالة').then(function (ok) { if (!ok) return; msgs.splice(msgs.indexOf(m), 1); st.active = null; renderList(); renderReader(); syncHeader(); inbox.classList.remove('show-reader'); toast('تم حذف الرسالة', { tone: 'danger' }); focusFirst(); }); });
      $$('[data-tpl]', reader).forEach(function (b) { b.addEventListener('click', function () { var ta = $('#m-reply-text'); ta.value = (ta.value ? ta.value + '\n' : '') + b.getAttribute('data-tpl'); ta.focus(); }); });
      $('#m-reply').addEventListener('submit', function (e) {
        e.preventDefault(); var ta = $('#m-reply-text');
        if (!ta.value.trim()) { ta.focus(); toast('اكتب نص الرد أولاً', { tone: 'danger', icon: 'error' }); return; }
        ta.value = ''; toast('تم إرسال الرد', { text: 'واجهة تجريبية — لم تُرسل أي رسالة فعلياً.', icon: 'send' });
      });
    }
    function focusFirst() { var o = $('.mitem', listEl); if (o) o.focus(); }
    function select(id, focusReader) {
      var m = byId(msgs, id); if (!m) return;
      st.active = id;
      if (!m.read) { m.read = true; syncHeader(); }
      renderList(); renderReader();
      inbox.classList.add('show-reader');
      if (focusReader || matchMedia('(max-width: 1023px)').matches) { var s = $('#m-subject'); if (s) s.focus({ preventScroll: true }); }
      else { var o = $('#opt-' + id); if (o) o.focus({ preventScroll: true }); }
    }
    listEl.addEventListener('click', function (e) { var it = e.target.closest('[data-id]'); if (it) select(it.getAttribute('data-id')); });
    listEl.addEventListener('keydown', function (e) {
      var it = e.target.closest('[data-id]'); if (!it) return;
      var opts = $$('[data-id]', listEl), i = opts.indexOf(it), n = null;
      if (e.key === 'ArrowDown') n = opts[i + 1]; else if (e.key === 'ArrowUp') n = opts[i - 1];
      else if (e.key === 'Home') n = opts[0]; else if (e.key === 'End') n = opts[opts.length - 1];
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(it.getAttribute('data-id'), true); return; }
      if (n) { e.preventDefault(); opts.forEach(function (o) { o.tabIndex = -1; }); n.tabIndex = 0; n.focus(); }
    });
    initSeg($('#m-box'), function (v) { st.box = v; renderList(); });
    $$('[data-type]').forEach(function (b) { b.addEventListener('click', function () { st.type = b.getAttribute('data-type'); $$('[data-type]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); renderList(); }); });
    var t; $('#m-search').addEventListener('input', function (e) { clearTimeout(t); t = setTimeout(function () { st.q = e.target.value; renderList(); }, 120); });
    $('#m-readall').addEventListener('click', function () { msgs.forEach(function (m) { m.read = true; }); renderList(); syncHeader(); toast('تم تعليم كل الرسائل كمقروءة', { icon: 'done_all' }); });
    syncHeader();
    var hash = location.hash.slice(1);
    var first = byId(msgs, hash) || msgs.filter(function (m) { return !m.archived; })[0];
    st.active = first ? first.id : null;
    if (first) first.read = true;
    renderList(); renderReader(); syncHeader();
    if (hash && matchMedia('(max-width: 1023px)').matches) inbox.classList.add('show-reader');
  };

  /* ----- Reports ----- */
  Pages.reports = function () {
    var DAY = 864e5;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var PRESETS = [
      { id: '7d', label: 'آخر 7 أيام', days: 7 }, { id: '30d', label: 'آخر 30 يوماً', days: 30 }, { id: '90d', label: 'آخر 90 يوماً', days: 90 },
      { id: 'ytd', label: 'منذ بداية العام', days: null }, { id: '12m', label: 'آخر 12 شهراً', days: 365 }
    ];
    var st = { start: new Date(today - 364 * DAY), end: today, preset: '12m' };
    var draft = { start: st.start, end: st.end, preset: st.preset }, calMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    var sameDay = function (a, b) { return a && b && a.getTime() === b.getTime(); };
    var fmtShort = function (d) { return fmtDate(d, { day: 'numeric', month: 'short', year: 'numeric' }); };
    function rangeText(s) { return fmtShort(s.start) + ' – ' + fmtShort(s.end); }
    function days() { return Math.round((st.end - st.start) / DAY) + 1; }
    function seriesKey() { var d = days(); return d <= 7 ? '7d' : d <= 31 ? '30d' : '12m'; }
    function factor() { var d = days(); return d <= 7 ? 0.05 : d <= 31 ? 0.2 : d <= 92 ? 0.55 : d <= 300 ? 0.8 : 1; }

    // Date range picker
    var pop = $('#range-pop'), rbtn = $('#range-btn');
    function renderPresets() {
      $('#range-presets').innerHTML = PRESETS.map(function (p) { return '<button type="button" data-preset="' + p.id + '" aria-pressed="' + (draft.preset === p.id) + '">' + esc(p.label) + '</button>'; }).join('') + '<button type="button" data-preset="custom" aria-pressed="' + (draft.preset === 'custom') + '">نطاق مخصص</button>';
      $$('[data-preset]', pop).forEach(function (b) { b.addEventListener('click', function () {
        var id = b.getAttribute('data-preset'); draft.preset = id;
        if (id !== 'custom') {
          var p = byId(PRESETS, id);
          draft.end = today; draft.start = p.days ? new Date(today - (p.days - 1) * DAY) : new Date(today.getFullYear(), 0, 1);
          calMonth = new Date(draft.end.getFullYear(), draft.end.getMonth(), 1);
        }
        renderPresets(); renderCal();
      }); });
    }
    function renderCal() {
      var y = calMonth.getFullYear(), m = calMonth.getMonth();
      var first = new Date(y, m, 1), offset = (first.getDay() + 1) % 7; // week starts Saturday
      var start = new Date(y, m, 1 - offset);
      var h = '<div class="cal-head"><button type="button" class="icon-btn sm" id="cal-prev" aria-label="الشهر السابق">' + icon('chevron_right') + '</button><strong aria-live="polite">' + fmtDate(first, { month: 'long', year: 'numeric' }) + '</strong><button type="button" class="icon-btn sm" id="cal-next" aria-label="الشهر التالي"' + (y === today.getFullYear() && m === today.getMonth() ? ' disabled' : '') + '>' + icon('chevron_left') + '</button></div>';
      h += '<div class="cal-grid" role="group" aria-label="اختيار نطاق التاريخ">' + ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'].map(function (d) { return '<span class="dow" aria-hidden="true">' + d + '</span>'; }).join('');
      for (var w = 0; w < 6; w++) {
        for (var i = 0; i < 7; i++) {
          var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + i);
          var cls = 'cal-day' + (d.getMonth() !== m ? ' out' : '') + (sameDay(d, today) ? ' today' : '');
          if (draft.start && draft.end && d > draft.start && d < draft.end) cls += ' in-range';
          if (sameDay(d, draft.start)) cls += ' is-start';
          if (sameDay(d, draft.end)) cls += ' is-end';
          var future = d > today;
          h += '<button type="button" class="' + cls + '" data-d="' + d.getTime() + '"' + (future ? ' disabled style="opacity:.3"' : '') + ' aria-label="' + fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + '"' + (cls.indexOf('is-start') > -1 || cls.indexOf('is-end') > -1 ? ' aria-pressed="true"' : '') + '>' + d.getDate() + '</button>';
        }
      }
      h += '</div>';
      $('#cal').innerHTML = h;
      $('#cal-sel').textContent = draft.end ? rangeText(draft) : 'اختر تاريخ النهاية…';
      $('#cal-prev').addEventListener('click', function () { calMonth = new Date(y, m - 1, 1); renderCal(); $('#cal-prev').focus(); });
      $('#cal-next').addEventListener('click', function () { calMonth = new Date(y, m + 1, 1); renderCal(); var n = $('#cal-next'); (n.disabled ? $('#cal-prev') : n).focus(); });
      $$('[data-d]', pop).forEach(function (b) { b.addEventListener('click', function () {
        var d = new Date(+b.getAttribute('data-d'));
        draft.preset = 'custom';
        if (!draft.start || draft.end) { draft.start = d; draft.end = null; }
        else if (d < draft.start) { draft.end = draft.start; draft.start = d; }
        else draft.end = d;
        renderPresets(); renderCal();
        var again = $('[data-d="' + d.getTime() + '"]', pop); if (again) again.focus();
      }); });
    }
    rbtn._onOpen = function () { draft = { start: st.start, end: st.end, preset: st.preset }; calMonth = new Date(st.end.getFullYear(), st.end.getMonth(), 1); renderPresets(); renderCal(); };
    $('#range-cancel').addEventListener('click', function () { closeDropdown(rbtn); });
    $('#range-apply').addEventListener('click', function () {
      if (!draft.end) { draft.end = draft.start; }
      st = { start: draft.start, end: draft.end, preset: draft.preset };
      closeDropdown(rbtn); refresh(true);
    });

    // Charts
    var lineEl = $('#r-line'), barEl = $('#r-bar'), donutEl = $('#r-donut');
    function lineCfg() {
      var key = seriesKey(), s = D.donationsSeries[key], dates = periodDates(key, st.end);
      return { labels: periodLabels(key, dates), tipTitle: periodTip(key, dates), height: 288, aria: 'اتجاه التبرعات للفترة المحددة مقارنة بالفترة السابقة',
        series: [{ name: 'الفترة المحددة', values: s.current, cls: '1', area: true }, { name: 'الفترة السابقة', values: s.previous, dashed: true }] };
    }
    function barCfg() {
      var dates = []; for (var i = 5; i >= 0; i--) dates.push(new Date(st.end.getFullYear(), st.end.getMonth() - i, 1));
      var f = factor() < 1 ? 0.6 + factor() * 0.4 : 1;
      return { labels: dates.map(function (d) { return fmtDate(d, { month: 'long' }); }), tipTitle: function (i) { return fmtDate(dates[i], { month: 'long', year: 'numeric' }); }, height: 288, aria: 'التبرعات الشهرية حسب القناة لآخر ستة أشهر',
        series: D.channels.map(function (c, i) { return { name: c.label, cls: ['1', '2', '5'][i], values: c.values.map(function (v) { return Math.round(v * f); }) }; }) };
    }
    function summary() {
      var f = factor(), key = seriesKey(), s = D.donationsSeries[key];
      var total = Math.round(sum(s.current) * (key === '12m' ? f : 1)), prev = Math.round(sum(s.previous) * (key === '12m' ? f : 1));
      var donors = Math.round(9840 * f), avg = Math.round(total / donors), benef = Math.round(88950 * (0.35 + f * 0.65));
      var dl = function (a, b) { return Math.round(((a - b) / b) * 1000) / 10; };
      $('#r-stats').innerHTML = [
        ['إجمالي التبرعات', '<span class="ltr">' + fmtMoney(total) + '</span>', dl(total, prev)],
        ['عدد المتبرعين', fmtNum(donors), 9.6],
        ['متوسط التبرع', '<span class="ltr">' + fmtMoney(avg) + '</span>', 4.2],
        ['المستفيدون', fmtNum(benef), -2.1]
      ].map(function (r) { return '<div><dt>' + r[0] + '</dt><dd><b>' + r[1] + '</b>' + deltaChip(r[2]) + '</dd></div>'; }).join('');
      return { total: total, donors: donors, avg: avg, benef: benef };
    }
    function topProjects() {
      return (D.projects || []).slice().sort(function (a, b) { return b.raised - a.raised; }).slice(0, 6);
    }
    function renderTable() {
      var f = factor();
      $('#r-table').innerHTML = '<div class="table-wrap" tabindex="0" role="region" aria-label="جدول أعلى المشاريع تمويلاً"><table class="table"><thead><tr><th scope="col">#</th><th scope="col">المشروع</th><th scope="col">الفئة</th><th scope="col">المُحصَّل</th><th scope="col">الهدف</th><th scope="col">الإنجاز</th><th scope="col">المتبرعون</th><th scope="col">متوسط التبرع</th></tr></thead><tbody>' +
        topProjects().map(function (p, i) {
          var raised = Math.round(p.raised * f), donors = Math.max(1, Math.round(p.donors * f)), pc = pct(p.raised, p.goal);
          return '<tr><td><span class="rank' + (i === 0 ? ' r1' : '') + '">' + (i + 1) + '</span></td><td><div class="cell-media"><img src="' + esc(p.image) + '" alt="" loading="lazy"><span class="t">' + esc(p.title) + '</span></div></td><td><span class="tag">' + icon(cat(p.cat).icon) + esc(cat(p.cat).label) + '</span></td>' +
            '<td class="num-cell strong"><span class="ltr">' + fmtMoney(raised) + '</span></td><td class="num-cell"><span class="ltr">' + fmtMoney(p.goal) + '</span></td>' +
            '<td><div class="progress-cell"><div class="progress" role="progressbar" aria-label="نسبة الإنجاز" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pc + '"><span style="width:' + pc + '%"></span></div><b>' + pc + '%</b></div></td>' +
            '<td class="num-cell">' + fmtNum(donors) + '</td><td class="num-cell"><span class="ltr">' + fmtMoney(raised / donors) + '</span></td></tr>';
        }).join('') + '</tbody></table></div>';
    }
    var gov = govWidget($('#r-gov'), 'donations');
    initSeg($('#r-gov-seg'), function (v) { gov.setMetric(v); });
    lineChart(lineEl, lineCfg());
    barChart(barEl, barCfg());
    donutChart(donutEl, { items: D.donationsByCategory, center: D.donationsByCategory[0].value + '%', centerLabel: D.donationsByCategory[0].label, aria: 'توزيع التبرعات حسب البرنامج: ' + D.donationsByCategory.map(function (c) { return c.label + ' ' + c.value + '%'; }).join('، ') });
    function refresh(animate) {
      $('#range-text').textContent = rangeText(st);
      $('#print-range').textContent = rangeText(st);
      var areas = $$('.card[data-loading]');
      if (animate) {
        areas.forEach(function (a) { a.classList.add('is-loading-area'); a.setAttribute('aria-busy', 'true'); });
        $('#r-table').innerHTML = '<div style="padding:24px;display:flex;flex-direction:column;gap:16px" aria-hidden="true">' + [1, 2, 3, 4].map(function () { return '<div class="row"><span class="skeleton" style="width:26px;height:26px"></span><span class="skeleton" style="width:48px;height:40px"></span><span class="skeleton sk-line" style="flex:1"></span><span class="skeleton sk-line" style="width:15%"></span></div>'; }).join('') + '</div>';
      }
      setTimeout(function () {
        summary(); lineEl._update(lineCfg()); barEl._update(barCfg()); renderTable();
        areas.forEach(function (a) { a.classList.remove('is-loading-area'); a.removeAttribute('aria-busy'); });
        if (animate) toast('تم تحديث التقرير', { text: rangeText(st), icon: 'event_available' });
      }, animate && !reduceMotion ? 450 : 0);
    }
    refresh(false);
    $('#print-date').textContent = fmtDate(new Date(), { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' });

    // CSV export (real file generated from the demo data)
    function csvCell(v) { v = String(v == null ? '' : v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
    function exportCSV() {
      var f = factor(), s = summary(), key = seriesKey(), ser = D.donationsSeries[key], dates = periodDates(key, st.end), labels = periodLabels(key, dates);
      var iso = function (d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
      var rows = [['تقرير جمعية الشمال للتنمية والتطوير المجتمعي — بيانات تجريبية (Demo data)'], ['الفترة', iso(st.start), iso(st.end)], [],
        ['الملخص', 'القيمة'], ['إجمالي التبرعات (USD)', s.total], ['عدد المتبرعين', s.donors], ['متوسط التبرع (USD)', s.avg], ['المستفيدون', s.benef], [],
        ['الفترة الزمنية', 'التاريخ', 'تبرعات الفترة الحالية (USD)', 'تبرعات الفترة السابقة (USD)']];
      dates.forEach(function (d, i) { rows.push([labels[i], iso(d), ser.current[i], ser.previous[i]]); });
      rows.push([], ['الترتيب', 'المشروع', 'الفئة', 'المُحصَّل (USD)', 'الهدف (USD)', 'الإنجاز %', 'المتبرعون']);
      topProjects().forEach(function (p, i) { rows.push([i + 1, p.title, cat(p.cat).label, Math.round(p.raised * f), p.goal, pct(p.raised, p.goal), Math.max(1, Math.round(p.donors * f))]); });
      rows.push([], ['المحافظة', 'المستفيدون', 'التبرعات (USD)', 'المشاريع']);
      D.governorates.forEach(function (g) { rows.push([g.name, g.beneficiaries, g.donations, g.projects]); });
      rows.push([], ['البرنامج', 'نسبة التبرعات %']);
      D.donationsByCategory.forEach(function (c) { rows.push([c.label, c.value]); });
      var csv = '\uFEFF' + rows.map(function (r) { return r.map(csvCell).join(','); }).join('\r\n');
      var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      var url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = 'almel-report-' + iso(st.start) + '_' + iso(st.end) + '.csv';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      toast('تم تصدير ملف CSV', { text: a.download, icon: 'download' });
    }
    $('#export-csv').addEventListener('click', exportCSV);
    $('#print-pdf').addEventListener('click', function () { window.print(); });
    if (location.hash === '#export') setTimeout(function () { $('#export-csv').focus(); }, 200);
  };

  /* ----- Settings ----- */
  Pages.settings = function () {
    var tl = $('#settings-tabs');
    if (!tl) return; // /admin/settings is now driven by js/admin-settings.js
    var tabs = initTabs(tl, function (tab) { history.replaceState(null, '', '#' + tab.getAttribute('data-value')); });
    var h = location.hash.slice(1);
    var t0 = $('[data-value="' + h + '"]', tl); if (t0) tabs.select(t0);
    window.addEventListener('hashchange', function () { var t = $('[data-value="' + location.hash.slice(1) + '"]', tl); if (t) tabs.select(t); });
    function sync() { tl.setAttribute('aria-orientation', matchMedia('(max-width: 1023px)').matches ? 'horizontal' : 'vertical'); }
    sync(); matchMedia('(max-width: 1023px)').addEventListener('change', sync);

    // Profile avatar
    var av = $('#s-avatar');
    $('#s-avatar-input').addEventListener('change', function () { var f = this.files[0]; if (!f) return; readFileAsDataURL(f).then(function (src) { av.innerHTML = '<img src="' + src + '" alt="">'; toast('تم تحديث الصورة (معاينة محلية)', { icon: 'account_circle' }); }); });
    $('#s-avatar-remove').addEventListener('click', function () { av.textContent = (D.user && D.user.initials) || 'م'; toast('أُزيلت الصورة الشخصية', { tone: 'info', icon: 'account_circle' }); });
    $('#s-logo-input').addEventListener('change', function () { var f = this.files[0]; if (!f) return; readFileAsDataURL(f).then(function (src) { $('#s-logo').innerHTML = '<img src="' + src + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">'; toast('تم تحديث الشعار (معاينة محلية)', { icon: 'image' }); }); });

    // Forms
    $$('form[data-settings]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var bad = null;
        $$('[required]', f).forEach(function (i) { var ok = i.value.trim() && (i.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value)); i.setAttribute('aria-invalid', ok ? 'false' : 'true'); if (!ok && !bad) bad = i; });
        var np = $('#s-pass-new', f), cp = $('#s-pass-confirm', f);
        if (np && np.value && np.value !== cp.value) { cp.setAttribute('aria-invalid', 'true'); $('#s-pass-confirm-err').hidden = false; bad = bad || cp; } else if (cp) { $('#s-pass-confirm-err').hidden = true; }
        if (bad) { bad.focus(); toast('يرجى مراجعة الحقول المظللة', { tone: 'danger', icon: 'error' }); return; }
        $$('[aria-invalid]', f).forEach(function (i) { i.removeAttribute('aria-invalid'); });
        toast('تم حفظ التغييرات', { text: 'حُفظت في هذه المعاينة فقط.', icon: 'save' });
      });
    });

    // Users
    var users = (D.users || []).map(function (u) { return Object.assign({}, u); });
    var STATUS = { active: { label: 'نشط', tone: 'info' }, invited: { label: 'مدعو', tone: 'warn' }, disabled: { label: 'معطّل', tone: 'neutral' } };
    function role(id) { var r = byId(D.roles, id) || { label: id, tone: 'neutral' }; return Object.assign({}, r, { label: acLabel('user_role', id, r.label) }); }
    function renderUsers() {
      $('#users-body').innerHTML = users.map(function (u, i) {
        var r = role(u.role), s = STATUS[u.status];
        return '<tr><td><div class="cell-media"><span class="avatar ' + (i === 0 ? '' : 'navy') + '" aria-hidden="true">' + esc(initials(u.name)) + '</span><div style="min-width:0"><span class="t">' + esc(u.name) + (i === 0 ? ' <span class="muted" style="font-weight:500">(أنت)</span>' : '') + '</span><span class="s ltr">' + esc(u.email) + '</span></div></div></td>' +
          '<td>' + pill(r.label, r.tone) + '</td><td>' + pill(s.label, s.tone) + '</td><td class="muted" style="white-space:nowrap">' + (u.last === 0 ? 'متصل الآن' : ago(u.last)) + '</td>' +
          '<td class="col-actions">' + (i === 0 ? '' : '<button type="button" class="icon-btn sm" data-umenu="' + i + '" aria-haspopup="menu" aria-expanded="false" aria-label="إجراءات: ' + esc(u.name) + '">' + icon('more_horiz') + '</button>') + '</td></tr>';
      }).join('');
      $('#users-count').textContent = users.length + ' أعضاء · ' + users.filter(function (u) { return u.status === 'active'; }).length + ' نشطون';
      $$('[data-umenu]').forEach(function (b) { b.addEventListener('click', function () {
        var u = users[+b.getAttribute('data-umenu')];
        rowMenu(b, [
          { icon: 'manage_accounts', label: 'تغيير الدور', action: function () { roleModal(u); } },
          u.status === 'invited' ? { icon: 'forward_to_inbox', label: 'إعادة إرسال الدعوة', action: function () { toast('أُعيد إرسال الدعوة', { text: u.email, icon: 'forward_to_inbox' }); } } :
            { icon: u.status === 'disabled' ? 'person_check' : 'person_off', label: u.status === 'disabled' ? 'تفعيل الحساب' : 'تعطيل الحساب', action: function () { u.status = u.status === 'disabled' ? 'active' : 'disabled'; renderUsers(); toast(u.status === 'disabled' ? 'تم تعطيل الحساب' : 'تم تفعيل الحساب', { tone: 'info', icon: 'person' }); } },
          '-',
          { icon: 'person_remove', label: 'إزالة من الفريق', danger: true, action: function () { confirmDelete('العضو «' + u.name + '»', 'ستُلغى صلاحيات الوصول لهذا الحساب في هذه المعاينة.').then(function (ok) { if (!ok) return; users.splice(users.indexOf(u), 1); renderUsers(); toast('تمت إزالة العضو', { tone: 'danger' }); }); } }
        ]);
      }); });
    }
    var roleOptions = function (sel) { var list = D.roles.map(function (r) { return [r.id, r.label]; }); return list.map(function (r) { return '<option value="' + r[0] + '"' + (r[0] === sel ? ' selected' : '') + '>' + esc(acLabel('user_role', r[0], r[1])) + '</option>'; }).join(''); };
    function roleModal(u) {
      modal({ title: 'تغيير دور ' + u.name, icon: 'manage_accounts', body: '<div class="field mt-16"><label class="label" for="role-sel">الدور</label><select class="select" id="role-sel">' + roleOptions(u.role) + '</select><p class="hint">يحدد الدور الصفحات والإجراءات المتاحة للمستخدم.</p></div>', confirmText: 'حفظ', focus: '#role-sel', getValue: function (d) { return $('#role-sel', d).value; } })
        .then(function (v) { if (!v) return; u.role = v; renderUsers(); toast('تم تحديث الدور', { text: role(v).label, icon: 'manage_accounts' }); });
    }
    $('#invite-user').addEventListener('click', function () {
      modal({ title: 'دعوة عضو جديد', icon: 'person_add', size: 'lg', confirmText: 'إرسال الدعوة', focus: '#inv-email',
        body: '<p class="modal-text">سيصل إلى العضو بريد يحتوي رابط تفعيل الحساب (واجهة تجريبية).</p><div class="field-row mt-16"><div class="field"><label class="label" for="inv-email">البريد الإلكتروني <span class="req" aria-hidden="true">*</span></label><input class="input" id="inv-email" type="email" dir="ltr" placeholder="name@shamal-society.org" aria-describedby="inv-email-err" required><p class="error" id="inv-email-err" hidden>' + icon('error') + '<span>أدخل بريداً إلكترونياً صالحاً.</span></p></div><div class="field"><label class="label" for="inv-role">الدور</label><select class="select" id="inv-role">' + roleOptions('editor') + '</select></div></div>',
        validate: function (d) { var i = $('#inv-email', d), ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value.trim()); i.setAttribute('aria-invalid', ok ? 'false' : 'true'); $('#inv-email-err', d).hidden = ok; if (!ok) i.focus(); return ok; },
        getValue: function (d) { return { email: $('#inv-email', d).value.trim(), role: $('#inv-role', d).value }; } })
        .then(function (v) { if (!v) return; users.push({ name: 'عضو جديد #' + (users.length + 1), email: v.email, role: v.role, status: 'invited', last: null }); renderUsers(); toast('تم إرسال الدعوة', { text: v.email, icon: 'mail' }); });
    });
    renderUsers();

    // Notifications
    document.addEventListener('switch', function (e) {
      var sw = e.target; if (!sw.closest('#panel-notifications')) return;
      toast(e.detail.on ? 'تم تفعيل الإشعار' : 'تم إيقاف الإشعار', { text: sw.getAttribute('aria-label'), icon: e.detail.on ? 'notifications_active' : 'notifications_off', tone: 'info', duration: 2400 });
    });
    initSeg($('#digest-seg'), function (v, b) { toast('تم اختيار تكرار الملخص: ' + b.textContent.trim(), { icon: 'schedule', tone: 'info', duration: 2400 }); });
  };

  /* ----- Login ----- */
  Pages.login = function () {
    var form = $('#login-form'), email = $('#l-email'), pass = $('#l-pass'), remember = $('#l-remember');
    var saved = store.get('almel-admin-email', '');
    if (saved) { email.value = saved; remember.checked = true; }
    function setErr(input, msg) {
      var e = $('#' + input.id + '-err');
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      e.hidden = !msg; if (msg) $('span:last-child', e).textContent = msg;
    }
    function check(input) {
      if (input === email) { var v = email.value.trim(); setErr(email, !v ? 'أدخل بريدك الإلكتروني.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'صيغة البريد غير صحيحة، مثال: name@example.org'); }
      else setErr(pass, !pass.value ? 'أدخل كلمة المرور.' : pass.value.length < 4 ? 'كلمة المرور يجب أن تكون 4 أحرف على الأقل.' : '');
      return input.getAttribute('aria-invalid') !== 'true';
    }
    [email, pass].forEach(function (i) {
      i.addEventListener('blur', function () { if (i.value) check(i); });
      i.addEventListener('input', function () { if (i.getAttribute('aria-invalid') === 'true') check(i); });
    });
    $('#pw-toggle').addEventListener('click', function () {
      var show = pass.type === 'password';
      pass.type = show ? 'text' : 'password';
      this.setAttribute('aria-pressed', show ? 'true' : 'false');
      this.setAttribute('aria-label', show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور');
      this.innerHTML = icon(show ? 'visibility_off' : 'visibility');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok1 = check(email), ok2 = check(pass);
      if (!ok1 || !ok2) { (ok1 ? pass : email).focus(); return; }
      if (remember.checked) store.set('almel-admin-email', email.value.trim()); else { try { localStorage.removeItem('almel-admin-email'); } catch (err) { /* ignore */ } }
      var btn = $('#l-submit');
      btn.classList.add('is-loading'); btn.setAttribute('aria-disabled', 'true');
      btn.innerHTML = '<span class="spinner" aria-hidden="true"></span><span class="btn-text">جارٍ تسجيل الدخول…</span>';
      setTimeout(function () { location.href = '/admin'; }, reduceMotion ? 50 : 650);
    });
    // #forgot is a plain link to /admin/forgot-password
  };

  /* ---------- Boot ---------- */
  function boot() {
    renderSidebar();
    renderTopbar();
    syncThemeButtons();
    if (Pages[PAGE] && !(window.__DB_PAGES && window.__DB_PAGES[PAGE])) { // pages that load their own database-backed script (news, gallery) set window.__DB_PAGES
      try { Pages[PAGE](); } catch (err) { if (window.console) console.error(err); }
    }
    requestAnimationFrame(function () {
      html.classList.add('is-ready');
      var loader = $('#nav-loader');
      if (loader) loader.classList.remove('is-loading');
    });
    try { // quick-search deep link: /admin/<page>?q=term fills the page search box (best effort)
      var dq = new URLSearchParams(location.search).get('q');
      if (dq) setTimeout(function () {
        var si = document.querySelector('#main input[type=search]') || document.querySelector('#main input[id$="search"]');
        if (si && !si.value) { si.value = dq; si.dispatchEvent(new Event('input', { bubbles: true })); }
      }, 900);
    } catch (e) { /* ignore */ }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  // The signed-in user's photo: refreshes every [data-me-avatar] (sidebar, top bar, «حسابي»). url empty/null = initial letter.
  function setAvatar(url) {
    if (ME) ME.avatar = url || '';
    if (D.user) D.user.avatar = url || '';
    $$('[data-me-avatar]').forEach(function (el) {
      el.classList.remove('is-preview');
      if (url) { el.innerHTML = '<img src="' + esc(url) + '" alt="">'; } else { el.textContent = el.getAttribute('data-ini') || 'م'; }
    });
  }
  // a photo that fails to load falls back to the initial letter
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && t.parentElement && t.parentElement.classList.contains('avatar') && t.parentElement.hasAttribute('data-ini')) t.parentElement.textContent = t.parentElement.getAttribute('data-ini');
  }, true);
  // ...also for photos that already failed before this script ran (server-rendered <img>, e.g. the users list and «حسابي»)
  function fixBrokenAvatars() {
    $$('.avatar[data-ini] img').forEach(function (im) { if (im.complete && im.naturalWidth === 0 && im.parentElement) im.parentElement.textContent = im.parentElement.getAttribute('data-ini'); });
  }
  fixBrokenAvatars(); window.addEventListener('load', fixBrokenAvatars);

  window.AdminUI = {
    toast: toast, modal: modal, Drawer: Drawer, Cmdk: Cmdk, setTheme: setTheme,
    // shared helpers for page scripts loaded after admin.js (/admin/pages, /admin/menu)
    Layers: Layers, initTabs: initTabs, initSeg: initSeg, rowMenu: rowMenu, confirmDelete: confirmDelete, confirm: confirmDialog, emptyState: emptyState,
    esc: esc, icon: icon, pill: pill, ago: ago, normalize: normalize, store: store, uid: uid, reduceMotion: reduceMotion, page: PAGE,
    setAvatar: setAvatar, setThemeMode: setThemeMode, readFileAsDataURL: readFileAsDataURL, fmtSize: fmtSize, initials: initials, fmtDate: fmtDate
  };
})();
