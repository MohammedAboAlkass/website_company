/* =========================================================================
   AdminEditor — المحرر الغني المشترك (rich-text editor), contenteditable based, no external library.

   Usage
     var ed = AdminEditor.create({ el: '#container', value: '<p>…</p>', id: 'ne-body', wordsId: 'ne-words',
                                   placeholder: '…', minHeight: 360, compact: false, hint: '…', maxChars: 0,
                                   label: 'نص الخبر', onChange: function (html) {} });
     ed.getHTML() · ed.setHTML(html) · ed.getText() · ed.isEmpty() · ed.focus() · ed.onChange(fn) · ed.destroy()
     AdminEditor.enhance(textarea, { compact: true })     // textarea stays the data holder (value = plain text or HTML)
     <textarea data-rich data-rich-max="600" data-rich-count="counter-id">   // auto-enhanced on DOMContentLoaded
     AdminEditor.sanitize(html, 'full'|'paste') · AdminEditor.plain(v) · AdminEditor.render(v) · AdminEditor.textLength(v)

   Server counterpart: App\Support\HtmlSanitizer (same whitelist). Endpoints: /admin/editor/{media,upload,video},
   /admin/gallery-albums, /admin/gallery-items?album=slug. Dialogs use window.AdminUI.modal / toast.
   ========================================================================= */
(function () {
  'use strict';
  var D = document, SEQ = 0;
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function ico(n) { return '<span class="material-symbols-outlined" aria-hidden="true">' + n + '</span>'; }
  function h(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function UI() { return window.AdminUI || null; }
  function toast(title, o) { var u = UI(); if (u && u.toast) u.toast(title, o || {}); }
  function fail(msg) { toast('تعذّر تنفيذ العملية', { text: msg, tone: 'danger', icon: 'error' }); }

  /* ---------- palettes (brand friendly) ---------- */
  var TEXT_COLORS = [['#2B2B2B', 'الافتراضي'], ['#0C7845', 'أخضر الجمعية'], ['#095C34', 'أخضر داكن'], ['#FF7000', 'برتقالي الجمعية'], ['#C2410C', 'برتقالي داكن'], ['#B42318', 'أحمر'], ['#1D4ED8', 'أزرق'], ['#6B7280', 'رمادي']];
  var HILITES = [['#E6F4EC', 'أخضر فاتح'], ['#FFE8D1', 'برتقالي فاتح'], ['#FFF3B0', 'أصفر'], ['#DDE9FF', 'أزرق فاتح'], ['#FBE2E0', 'أحمر فاتح'], ['#ECEFF3', 'رمادي فاتح']];
  var SIZES = [['2', 'صغير'], ['3', 'عادي'], ['4', 'كبير'], ['5', 'كبير جداً']];
  var BLOCKS = [['p', 'فقرة عادية'], ['h2', 'عنوان رئيسي (H2)'], ['h3', 'عنوان فرعي (H3)'], ['h4', 'عنوان صغير (H4)']];
  var CALLOUTS = [['info', 'ملاحظة (معلومة)', 'info'], ['success', 'نجاح / إنجاز', 'check_circle'], ['warning', 'تنبيه', 'warning'], ['button', 'زر رابط', 'smart_button']];
  var EMOJI = '😀 😊 😍 🙏 👏 💚 🧡 ❤️ ⭐ ✨ 🎉 👍 💪 🤝 🌱 🌿 🕊️ 🏠 🍞 💧 📚 🎓 🏥 ⚽ 📢 📍 📅 ✅ ❗ ❓ ➡️ ⬅️ 🔔 🎁 🌙 ☀️ 🌟 🤲 🫶 🇵🇸'.split(' ');

  /* ---------- sanitizer (mirror of App\Support\HtmlSanitizer) ---------- */
  var TAGS = {
    p: [], br: [], h2: [], h3: [], h4: [], strong: [], b: [], em: [], i: [], u: [], s: [], strike: [], del: [], ins: [], mark: [], sub: [], sup: [], small: [],
    span: [], div: [], pre: [], code: [], blockquote: [], ul: [], ol: ['start'], li: [], hr: [], a: ['href', 'target', 'rel', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'], figure: [], figcaption: [], table: [], thead: [], tbody: [], tfoot: [], tr: [], caption: [],
    th: ['colspan', 'rowspan', 'scope'], td: ['colspan', 'rowspan'], iframe: ['src', 'title', 'allowfullscreen', 'loading'],
    video: ['src', 'controls', 'poster', 'preload', 'width', 'height'], source: ['src', 'type']
  };
  var DROP = 'script style object embed applet link meta base form input button textarea select option noscript svg math frame frameset head title template canvas audio'.split(' ');
  var RENAME = { h1: 'h2', h5: 'h4', h6: 'h4' };
  var EMBED_HOSTS = { 'www.youtube.com': /^\/embed\/[A-Za-z0-9_-]{6,20}$/, 'youtube.com': /^\/embed\/[A-Za-z0-9_-]{6,20}$/, 'www.youtube-nocookie.com': /^\/embed\/[A-Za-z0-9_-]{6,20}$/, 'youtube-nocookie.com': /^\/embed\/[A-Za-z0-9_-]{6,20}$/, 'player.vimeo.com': /^\/video\/\d{4,14}$/ };

  function cleanUrl(v, link) {
    v = String(v || '').replace(/[\u0000-\u001F\u007F\s]+/g, '');
    if (!v || v.length > 2000) return '';
    if (link) return /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(v) ? v : '';
    return /^(https?:\/\/|\/(?!\/))/i.test(v) ? v : '';
  }
  function cleanClasses(v) { return String(v || '').split(/\s+/).filter(function (c) { return /^ed-[a-z0-9_-]{1,40}$/.test(c); }).filter(function (c, i, a) { return a.indexOf(c) === i; }).join(' '); }
  var LEN = /^\d{1,3}(\.\d{1,2})?(px|em|rem|%)$/;
  var COLOR = /^(#[0-9a-f]{3,8}|rgba?\(\s*\d{1,3}\s*(,\s*[\d.]+\s*){2,3}\)|[a-z]{3,20}|transparent)$/i;
  var DEFAULT_COLOR = /^(#2b2b2b|rgb\(\s*43\s*,\s*43\s*,\s*43\s*\))$/i;
  function cleanStyle(v, tidy) {
    var out = [];
    String(v || '').split(';').forEach(function (decl) {
      var i = decl.indexOf(':'); if (i < 0) return;
      var prop = decl.slice(0, i).trim().toLowerCase(), val = decl.slice(i + 1).replace(/\s*!important\s*$/i, '').trim(), lv = val.toLowerCase();
      if (!val || /(url\s*\(|expression|javascript|@import|[<>\\])/i.test(val)) return;
      var ok = false;
      if (prop === 'color' || prop === 'background-color') ok = COLOR.test(val);
      else if (prop === 'font-size') ok = /^(xx-small|x-small|small|medium|large|x-large|xx-large|xxx-large|smaller|larger)$/.test(lv) || LEN.test(lv);
      else if (prop === 'text-align') ok = /^(left|right|center|justify|start|end)$/.test(lv);
      else if (prop === 'direction') ok = /^(rtl|ltr)$/.test(lv);
      else if (/^(padding-inline-start|margin-inline-start|padding-right|padding-left|margin-right|margin-left)$/.test(prop)) ok = LEN.test(lv);
      else if (prop === 'width') ok = /^\d{1,3}(\.\d{1,2})?(%|px)$/.test(lv);
      else if (prop === 'font-weight') ok = /^(normal|bold|[1-9]00)$/.test(lv);
      else if (prop === 'font-style') ok = /^(normal|italic)$/.test(lv);
      else if (prop === 'text-decoration' || prop === 'text-decoration-line') ok = /^(none|underline|line-through|underline line-through|line-through underline)$/.test(lv);
      if (!ok) return;
      if (tidy && ((prop === 'font-size' && lv === 'medium') || (prop === 'background-color' && lv === 'transparent') || (prop === 'color' && DEFAULT_COLOR.test(val)))) return;
      out.push(prop + ': ' + val);
    });
    return out.join('; ') + (out.length ? ';' : '');
  }
  function embedOK(src) {
    try {
      var u = new URL(src), host = u.hostname.toLowerCase();
      return u.protocol === 'https:' && !u.username && !u.port && EMBED_HOSTS[host] && EMBED_HOSTS[host].test(u.pathname) ? u.protocol + '//' + host + u.pathname : '';
    } catch (e) { return ''; }
  }
  function unwrap(el) { var p = el.parentNode; while (el.firstChild) p.insertBefore(el.firstChild, el); p.removeChild(el); }
  function rename(el, to) { var n = el.ownerDocument.createElement(to); while (el.firstChild) n.appendChild(el.firstChild); el.parentNode.replaceChild(n, el); return n; }
  function hasBlockChild(el) { return !!el.querySelector('p,h2,h3,h4,ul,ol,blockquote,table,figure,div,pre,hr,li'); }

  function walk(parent, paste) {
    Array.prototype.slice.call(parent.childNodes).forEach(function (node) {
      if (node.nodeType === 8 || node.nodeType === 7 || node.nodeType === 4) { parent.removeChild(node); return; }
      if (node.nodeType === 3) { if (paste) node.nodeValue = node.nodeValue.replace(/\u00a0/g, ' ').replace(/[\u200b\ufeff]/g, ''); return; }
      if (node.nodeType !== 1) { parent.removeChild(node); return; }
      var tag = node.tagName.toLowerCase();
      if (tag.indexOf(':') > -1) tag = 'x-' + tag.replace(':', '-');
      if (DROP.indexOf(tag) > -1) { parent.removeChild(node); return; }
      if (paste && node.getAttribute('style')) {          // Word / Google Docs: keep the meaning, lose the style soup
        var st = node.getAttribute('style').toLowerCase(), wrap = [];
        if (tag === 'b' && /font-weight:\s*normal/.test(st)) { walk(node, paste); unwrap(node); return; }
        if (/font-weight:\s*(bold|[6-9]00)/.test(st) && tag !== 'strong' && tag !== 'b' && !/^h\d$/.test(tag)) wrap.push('strong');
        if (/font-style:\s*italic/.test(st) && tag !== 'em' && tag !== 'i') wrap.push('em');
        if (/text-decoration[^;]*underline/.test(st) && tag !== 'u' && tag !== 'a') wrap.push('u');
        if (/text-decoration[^;]*line-through/.test(st) && tag !== 's') wrap.push('s');
        wrap.forEach(function (w) { var n = node.ownerDocument.createElement(w); while (node.firstChild) n.appendChild(node.firstChild); node.appendChild(n); });
      }
      if (RENAME[tag]) { node = rename(node, RENAME[tag]); tag = node.tagName.toLowerCase(); }
      if (paste && tag === 'div' && !hasBlockChild(node)) { node = rename(node, 'p'); tag = 'p'; }
      if (!Object.prototype.hasOwnProperty.call(TAGS, tag)) { walk(node, paste); unwrap(node); return; }
      var allowed = ['class', 'style', 'dir'].concat(TAGS[tag]);
      Array.prototype.slice.call(node.attributes).forEach(function (a) {
        var n = a.name.toLowerCase(), v = a.value, c;
        if (allowed.indexOf(n) < 0 || (paste && (n === 'class' || n === 'style' || n === 'dir'))) { node.removeAttribute(a.name); return; }
        if (n === 'class') c = cleanClasses(v);
        else if (n === 'style') c = cleanStyle(v, true);
        else if (n === 'dir') c = /^(rtl|ltr|auto)$/i.test(v) ? v.toLowerCase() : '';
        else if (n === 'href') c = cleanUrl(v, true);
        else if (n === 'src' || n === 'poster') c = cleanUrl(v, false);
        else if (n === 'target') c = v === '_blank' ? '_blank' : '';
        else if (/^(width|height|colspan|rowspan|start)$/.test(n)) c = /^\d{1,4}$/.test(v.trim()) ? v.trim() : '';
        else if (n === 'loading') c = /^(lazy|eager)$/.test(v) ? v : '';
        else if (n === 'preload') c = /^(none|metadata|auto)$/.test(v) ? v : '';
        else if (n === 'scope') c = /^(row|col)$/.test(v) ? v : '';
        else if (n === 'type') c = /^video\/(mp4|webm|ogg)$/.test(v) ? v : '';
        else if (n === 'controls' || n === 'allowfullscreen') c = n;
        else if (n === 'rel') c = '';
        else c = v.replace(/<[^>]*>/g, '').trim().slice(0, 500);
        if (!c) node.removeAttribute(a.name); else if (c !== v) node.setAttribute(a.name, c);
      });
      if (tag === 'a' && node.getAttribute('target') === '_blank') node.setAttribute('rel', 'noopener noreferrer');
      if (tag === 'img') { if (!node.getAttribute('src')) { parent.removeChild(node); return; } if (!node.getAttribute('loading')) node.setAttribute('loading', 'lazy'); }
      if (tag === 'iframe') {
        var ok = embedOK(node.getAttribute('src') || '');
        if (!ok) { parent.removeChild(node); return; }
        var q = '';
        try { var u = new URL(node.getAttribute('src')), keep = []; ['start', 'rel', 'controls', 'autoplay', 'mute', 'loop'].forEach(function (k) { var x = u.searchParams.get(k); if (x != null && /^\d{1,6}$/.test(x)) keep.push(k + '=' + x); }); q = keep.length ? '?' + keep.join('&') : ''; } catch (e) { q = ''; }
        node.setAttribute('src', ok + q); node.setAttribute('loading', 'lazy');
        node.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen'); node.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      }
      if (tag === 'source' && !node.getAttribute('src')) { parent.removeChild(node); return; }
      walk(node, paste);
      if (tag === 'span' && !node.attributes.length) { unwrap(node); return; }
      if (tag === 'a' && !node.getAttribute('href')) { unwrap(node); return; }
      if (tag === 'video' && !node.getAttribute('src') && !node.querySelector('source')) { parent.removeChild(node); return; }
      if (tag === 'p' && !node.firstChild && !node.attributes.length) { parent.removeChild(node); return; }
      if (paste && tag === 'p' && !node.textContent.replace(/[\s\u00a0]+/g, '') && !node.querySelector('img,iframe,video')) parent.removeChild(node);
    });
  }
  function sanitize(html, mode) {
    html = String(html == null ? '' : html);
    if (!html.trim()) return '';
    if (mode === 'paste') {
      var m = /<!--\s*StartFragment\s*-->([\s\S]*?)<!--\s*EndFragment\s*-->/i.exec(html); if (m) html = m[1];
      html = html.replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, '').replace(/<\/?o:p[^>]*>/gi, '');
    }
    var doc = D.implementation.createHTMLDocument(''), root = doc.createElement('div');
    root.innerHTML = html;
    walk(root, mode === 'paste');
    return root.innerHTML.trim();
  }
  function looksHtml(v) { return /<\/?[a-z][a-z0-9]*(\s[^>]*)?>/i.test(String(v || '')); }
  function textOf(html) {
    var doc = D.implementation.createHTMLDocument(''), r = doc.createElement('div');
    r.innerHTML = String(html || '').replace(/<(\/(p|h2|h3|h4|li|blockquote|div|tr|figure|figcaption)|br|hr)\b[^>]*>/gi, '$& ');
    return (r.textContent || '').replace(/\s+/g, ' ').trim();
  }
  function plain(v) { v = String(v == null ? '' : v); return looksHtml(v) ? textOf(v) : v.replace(/\s+/g, ' ').trim(); }
  function fromStored(v) { v = String(v == null ? '' : v); if (!v.trim()) return ''; return looksHtml(v) ? v : '<p>' + esc(v.trim()).replace(/\n+/g, '<br>') + '</p>'; }
  function toStored(html) {
    html = String(html || '').trim(); if (!html) return '';
    var m = /^<p>([^<]*)<\/p>$/.exec(html);
    if (m) { var t = m[1].replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&amp;/g, '&'); if (!looksHtml(t)) return t; }
    return html;
  }
  function render(v) { v = String(v == null ? '' : v); return looksHtml(v) ? sanitize(v, 'full') : esc(v); }
  function textLength(v) { return plain(v).length; }

  /* ---------- video url parsing ---------- */
  function parseVideo(u) {
    u = String(u || '').trim(); if (!u) return null;
    var m;
    if ((m = /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,20})/i.exec(u))) return { kind: 'iframe', src: 'https://www.youtube-nocookie.com/embed/' + m[1] };
    if ((m = /^(?:https?:\/\/)?(?:www\.)?(?:player\.)?vimeo\.com\/(?:video\/|channels\/[^/]+\/|groups\/[^/]+\/videos\/)?(\d{4,14})/i.exec(u))) return { kind: 'iframe', src: 'https://player.vimeo.com/video/' + m[1] };
    if (/^(https:\/\/|\/(?!\/))[^\s?#]+\.(mp4|webm|ogv|ogg)(\?[^\s#]*)?$/i.test(u)) return { kind: 'video', src: u, type: /\.webm/i.test(u) ? 'video/webm' : /\.og[gv]/i.test(u) ? 'video/ogg' : 'video/mp4' };
    return null;
  }

  /* ---------- network ---------- */
  function csrf() { var m = D.querySelector('meta[name="csrf-token"]'); return m ? m.getAttribute('content') : ''; }
  function api(method, url, body) {
    var opt = { method: method, credentials: 'same-origin', headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': csrf() } };
    if (body instanceof FormData) opt.body = body;
    return fetch(url, opt).then(function (r) {
      return r.text().then(function (t) {
        var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) { j = null; }
        if (r.ok) return j || {};
        var msg = '';
        if (j && j.errors) { var k = Object.keys(j.errors); if (k.length && j.errors[k[0]] && j.errors[k[0]][0]) msg = j.errors[k[0]][0]; }
        if (!msg) msg = r.status === 419 ? 'انتهت الجلسة. أعد تحميل الصفحة ثم حاول مجدداً.' : r.status === 401 ? 'انتهت جلسة الدخول.' : r.status === 403 ? 'ليست لديك صلاحية لهذا الإجراء.' : r.status === 413 ? 'حجم الملف أكبر من المسموح.' : (j && j.message) || 'تعذّر الاتصال بالخادم. حاول مرة أخرى.';
        throw { status: r.status, message: msg };
      });
    }, function () { throw { status: 0, message: 'تعذّر الاتصال بالخادم. تحقق من الإنترنت.' }; });
  }
  function errMsg(e) { return (e && e.message) || 'حدث خطأ غير متوقع.'; }

  /* ---------- toolbar definition ---------- */
  var BAR = [
    ['history', 'السجل', [{ c: 'undo', i: 'undo', t: 'تراجع', k: 'Ctrl+Z' }, { c: 'redo', i: 'redo', t: 'إعادة', k: 'Ctrl+Y' }]],
    ['block', 'نمط الفقرة', [{ c: 'block', menu: 1, p: 1, t: 'نمط الفقرة (عنوان / فقرة)' }]],
    ['inline', 'تنسيق الخط', [{ c: 'bold', i: 'format_bold', t: 'غامق', k: 'Ctrl+B', p: 1 }, { c: 'italic', i: 'format_italic', t: 'مائل', k: 'Ctrl+I', p: 1 }, { c: 'underline', i: 'format_underlined', t: 'تسطير', k: 'Ctrl+U', p: 1 }, { c: 'strike', i: 'strikethrough_s', t: 'يتوسطه خط', k: 'Ctrl+Shift+X' }]],
    ['color', 'الألوان والحجم', [{ c: 'color', i: 'format_color_text', t: 'لون النص', pal: 1, p: 1 }, { c: 'hilite', i: 'format_color_fill', t: 'تمييز بلون خلفية', pal: 1 }, { c: 'size', i: 'format_size', t: 'حجم الخط', menu: 1 }]],
    ['align', 'المحاذاة والاتجاه', [{ c: 'right', i: 'format_align_right', t: 'محاذاة لليمين', k: 'Ctrl+Shift+R' }, { c: 'center', i: 'format_align_center', t: 'توسيط', k: 'Ctrl+Shift+E' }, { c: 'left', i: 'format_align_left', t: 'محاذاة لليسار', k: 'Ctrl+Shift+L' }, { c: 'justify', i: 'format_align_justify', t: 'ضبط الهوامش', k: 'Ctrl+Shift+J' }, { c: 'dir', i: 'format_textdirection_l_to_r', t: 'تبديل اتجاه الفقرة (يمين↔يسار)' }]],
    ['list', 'القوائم', [{ c: 'ul', i: 'format_list_bulleted', t: 'قائمة نقطية', k: 'Ctrl+Shift+8', p: 1 }, { c: 'ol', i: 'format_list_numbered', t: 'قائمة رقمية', k: 'Ctrl+Shift+7', p: 1 }, { c: 'outdent', i: 'format_indent_decrease', t: 'تقليل المسافة البادئة', k: 'Ctrl+[' }, { c: 'indent', i: 'format_indent_increase', t: 'زيادة المسافة البادئة', k: 'Ctrl+]' }]],
    ['blocks', 'عناصر', [{ c: 'quote', i: 'format_quote', t: 'اقتباس' }, { c: 'hr', i: 'horizontal_rule', t: 'خط فاصل' }, { c: 'callout', i: 'sticky_note_2', t: 'صندوق ملاحظة / زر', menu: 1 }, { c: 'table', i: 'table_chart', t: 'إدراج جدول' }]],
    ['insert', 'إدراج', [{ c: 'link', i: 'link', t: 'رابط', k: 'Ctrl+K', p: 1 }, { c: 'image', i: 'image', t: 'إدراج صورة', p: 1 }, { c: 'album', i: 'photo_library', t: 'إدراج ألبوم صور' }, { c: 'video', i: 'smart_display', t: 'إدراج فيديو' }, { c: 'emoji', i: 'mood', t: 'إيموجي', pal: 1 }]],
    ['tools', 'أدوات', [{ c: 'clear', i: 'format_clear', t: 'مسح التنسيق', k: 'Ctrl+\\' }, { c: 'source', i: 'code', t: 'عرض الشيفرة (HTML)' }, { c: 'fullscreen', i: 'fullscreen', t: 'ملء الشاشة', k: 'Ctrl+Shift+F', p: 1 }]]
  ];

  /* =====================================================================
     create()
     ===================================================================== */
  function create(o) {
    o = o || {};
    var host = typeof o.el === 'string' ? $(o.el) : o.el;
    if (!host) return null;
    var id = 'ed' + (++SEQ), listeners = [], cbs = [], savedRange = null, selected = null, popEl = null, popBtn = null, silent = false;
    var root = h('div', 'ed' + (o.compact ? ' ed-compact' : ''));
    root.setAttribute('dir', 'rtl');
    var bar = h('div', 'ed-bar'); bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'أدوات تنسيق النص'); bar.setAttribute('aria-controls', o.id || id + '-body');
    var stage = h('div', 'ed-stage');
    var body = h('div', 'ed-body ed-content is-empty');
    body.id = o.id || id + '-body'; body.setAttribute('contenteditable', 'true'); body.setAttribute('role', 'textbox'); body.setAttribute('aria-multiline', 'true');
    body.setAttribute('spellcheck', 'true'); body.setAttribute('data-placeholder', o.placeholder || 'ابدأ الكتابة هنا… استخدم شريط الأدوات للتنسيق وإدراج الصور والفيديو.');
    if (o.label) body.setAttribute('aria-label', o.label); else if (o.labelledby) body.setAttribute('aria-labelledby', o.labelledby);
    if (o.minHeight) body.style.minHeight = o.minHeight + 'px';
    var src = h('textarea', 'ed-src'); src.setAttribute('dir', 'ltr'); src.setAttribute('spellcheck', 'false'); src.setAttribute('aria-label', 'شيفرة HTML'); src.hidden = true;
    var ctx = h('div', 'ed-ctx'); ctx.hidden = true; ctx.setAttribute('role', 'toolbar'); ctx.setAttribute('aria-label', 'خيارات العنصر المحدد');
    var foot = h('div', 'ed-foot');
    var words = h('span', 'ed-words'); words.setAttribute('aria-live', 'polite'); if (o.wordsId) words.id = o.wordsId; words.textContent = '0 كلمة';
    var status = h('span', 'ed-status'); status.setAttribute('role', 'status');
    var hint = h('span', 'ed-hint'); hint.textContent = o.hint != null ? o.hint : 'اضغط «حفظ» لتثبيت التغييرات';
    foot.appendChild(words); foot.appendChild(status); foot.appendChild(hint);
    stage.appendChild(body); stage.appendChild(src); stage.appendChild(ctx);
    root.appendChild(bar); root.appendChild(stage); root.appendChild(foot);

    /* --- toolbar --- */
    var btns = {};
    BAR.forEach(function (g) {
      var grp = h('div', 'ed-group'); grp.setAttribute('role', 'group'); grp.setAttribute('aria-label', g[1]); grp.setAttribute('data-g', g[0]);
      g[2].forEach(function (it) {
        var b = h('button', 'ed-tb' + (it.menu || it.pal ? ' has-pop' : '')); b.type = 'button'; b.setAttribute('data-cmd', it.c); b.tabIndex = -1;
        var tip = it.t + (it.k ? ' (' + it.k + ')' : ''); b.title = tip; b.setAttribute('aria-label', it.t);
        if (it.p) { b.setAttribute('data-p', '1'); grp.setAttribute('data-p', '1'); }
        if (it.c === 'block') b.innerHTML = '<span class="ed-lbl">فقرة عادية</span>' + ico('arrow_drop_down');
        else if (it.c === 'color' || it.c === 'hilite') b.innerHTML = ico(it.i) + '<i class="ed-cbar" style="background:' + (it.c === 'color' ? '#0C7845' : '#FFF3B0') + '"></i>';
        else b.innerHTML = ico(it.i) + (it.menu || it.pal ? '<span class="material-symbols-outlined ed-caret" aria-hidden="true">arrow_drop_down</span>' : '');
        if (['bold', 'italic', 'underline', 'strike', 'ul', 'ol', 'right', 'center', 'left', 'justify', 'quote', 'source', 'fullscreen', 'dir'].indexOf(it.c) > -1) b.setAttribute('aria-pressed', 'false');
        if (it.menu || it.pal) { b.setAttribute('aria-haspopup', 'true'); b.setAttribute('aria-expanded', 'false'); }
        btns[it.c] = b; grp.appendChild(b);
      });
      bar.appendChild(grp);
    });
    var moreBtn = h('button', 'ed-tb ed-more'); moreBtn.type = 'button'; moreBtn.setAttribute('data-cmd', 'more'); moreBtn.tabIndex = -1; moreBtn.title = 'عرض كل أدوات التنسيق'; moreBtn.setAttribute('aria-label', 'عرض كل أدوات التنسيق'); moreBtn.setAttribute('aria-pressed', 'false'); moreBtn.innerHTML = ico('more_horiz');
    bar.appendChild(moreBtn); btns.more = moreBtn;
    var firstBtn = $('.ed-tb', bar); if (firstBtn) firstBtn.tabIndex = 0;

    host.innerHTML = ''; host.appendChild(root);

    /* --- helpers --- */
    function on(t, ev, fn, opt) { t.addEventListener(ev, fn, opt); listeners.push([t, ev, fn, opt]); }
    function sel() { return D.getSelection ? D.getSelection() : null; }
    function inBody(n) { return !!n && (n === body || body.contains(n)); }
    function saveSel() { var s = sel(); if (s && s.rangeCount && inBody(s.anchorNode) && inBody(s.focusNode)) savedRange = s.getRangeAt(0).cloneRange(); }
    function restoreSel() {
      body.focus();
      var s = sel(); if (!s) return;
      if (savedRange && inBody(savedRange.startContainer) && inBody(savedRange.endContainer)) { s.removeAllRanges(); s.addRange(savedRange); }
      else if (!s.rangeCount || !inBody(s.anchorNode)) { var r = D.createRange(); r.selectNodeContents(body); r.collapse(false); s.removeAllRanges(); s.addRange(r); }
    }
    function exec(cmd, val) { try { return D.execCommand(cmd, false, val == null ? null : val); } catch (e) { return false; } }
    function css(onOff) { try { D.execCommand('styleWithCSS', false, !!onOff); } catch (e) { /* ignore */ } }
    function qs(cmd) { try { return !!D.queryCommandState(cmd); } catch (e) { return false; } }
    function closest(n, sel2) { while (n && n !== body) { if (n.nodeType === 1 && n.matches(sel2)) return n; n = n.parentNode; } return null; }
    function curRange() { var s = sel(); return s && s.rangeCount ? s.getRangeAt(0) : null; }
    function leafBlocks() {
      var r = curRange(); if (!r) return [];
      var all = $$('p,h2,h3,h4,blockquote,li,pre,figcaption,td,th', body).filter(function (n) { try { return r.intersectsNode(n); } catch (e) { return false; } });
      return all.filter(function (n) { return !all.some(function (m) { return m !== n && n.contains(m); }); });
    }
    function lockBlocks() { $$('.ed-gallery,.ed-embed', body).forEach(function (e) { e.setAttribute('contenteditable', 'false'); }); }
    function isEmptyDom(c) { return !c.textContent.trim() && !c.querySelector('img,iframe,video,hr,table,li,.ed-gallery'); }
    function updateEmpty() { body.classList.toggle('is-empty', isEmptyDom(body)); }
    function countWords() {
      var t = body.textContent.replace(/\u00a0/g, ' ').trim(), w = t ? t.split(/\s+/).length : 0;
      words.textContent = w + ' كلمة · ' + Math.max(1, Math.round(w / 180)) + ' د قراءة';
      if (o.maxChars) { words.textContent += ' · ' + t.length + ' / ' + o.maxChars + ' حرف'; words.classList.toggle('over', t.length > o.maxChars); }
    }
    function getHTML() {
      if (root.classList.contains('is-source')) return sanitize(src.value, 'full');
      var c = body.cloneNode(true);
      $$('.is-selected', c).forEach(function (e) { e.classList.remove('is-selected'); if (!e.getAttribute('class')) e.removeAttribute('class'); });
      $$('[contenteditable]', c).forEach(function (e) { e.removeAttribute('contenteditable'); });
      if (isEmptyDom(c)) return '';
      return sanitize(c.innerHTML.replace(/&nbsp;(?=[^\s&<])/g, ' '), 'full'); // typing leaves stray nbsp between words
    }
    function change() {
      if (silent) return;
      updateEmpty(); countWords();
      var htmlNow = getHTML();
      cbs.forEach(function (fn) { try { fn(htmlNow); } catch (e) { /* ignore */ } });
      host.dispatchEvent(new Event('input', { bubbles: true }));
    }
    function pretty(html) { return String(html || '').replace(/<\/(p|h2|h3|h4|ul|ol|li|blockquote|figure|figcaption|table|tr|div|thead|tbody|pre)>/g, '$&\n').replace(/<(hr|br)\s*\/?>/g, '$&\n').trim(); }
    function setHTML(html, quiet) {
      var clean = sanitize(html, 'full');
      body.innerHTML = clean || '<p><br></p>';
      lockBlocks(); hideCtx(); updateEmpty(); countWords();
      if (root.classList.contains('is-source')) src.value = pretty(clean);
      if (!quiet) change();
    }
    function insertHTML(html) {
      restoreSel();
      var ok = exec('insertHTML', html);
      if (!ok) {
        var r = curRange();
        if (r) { r.deleteContents(); var f = r.createContextualFragment(html), last = f.lastChild; r.insertNode(f); if (last) { r.setStartAfter(last); r.collapse(true); var s = sel(); s.removeAllRanges(); s.addRange(r); } }
        else body.insertAdjacentHTML('beforeend', html);
      }
      lockBlocks(); saveSel(); change();
    }
    /* block-level insert (figure, gallery, embed, table, callout …): placed after the block holding the caret,
       or in place of an empty paragraph; the caret moves to the paragraph that follows */
    function topBlock(n) { while (n && n.parentNode !== body) n = n.parentNode; return n && n.parentNode === body ? n : null; }
    function emptyPara(n) { return !!n && n.nodeType === 1 && n.tagName === 'P' && !n.textContent.trim() && !n.querySelector('img,iframe,video'); }
    function insertBlock(html) {
      restoreSel();
      var r = curRange(), top = r ? topBlock(r.endContainer) : null;
      var wrap = D.createElement('div'); wrap.innerHTML = html;
      var nodes = Array.prototype.slice.call(wrap.childNodes), lastNode = nodes[nodes.length - 1];
      if (!lastNode || lastNode.nodeType !== 1 || lastNode.tagName !== 'P') { lastNode = D.createElement('p'); lastNode.innerHTML = '<br>'; nodes.push(lastNode); }
      var ref = top ? (emptyPara(top) ? top : top.nextSibling) : null;
      nodes.forEach(function (nd) { body.insertBefore(nd, ref); });
      if (top && emptyPara(top)) body.removeChild(top);
      lockBlocks();
      var s = sel(), nr = D.createRange();
      nr.selectNodeContents(lastNode); nr.collapse(true);
      if (s) { s.removeAllRanges(); s.addRange(nr); }
      saveSel(); change();
    }
    function selectedText() { var s = sel(); return s && s.rangeCount && inBody(s.anchorNode) ? s.toString() : ''; }

    /* --- popups --- */
    function closePop() {
      if (!popEl) return;
      if (popEl.parentNode) popEl.parentNode.removeChild(popEl);
      if (popBtn) popBtn.setAttribute('aria-expanded', 'false');
      popEl = null; popBtn = null;
    }
    function openPop(btn, cls, html, onPick) {
      if (popBtn === btn) { closePop(); return; }
      closePop(); saveSel();
      popEl = h('div', 'ed-pop ' + cls, html); popBtn = btn; btn.setAttribute('aria-expanded', 'true');
      bar.appendChild(popEl);
      var left = btn.offsetLeft, w = popEl.offsetWidth || 200;
      if (left + w > bar.clientWidth - 4) left = Math.max(4, bar.clientWidth - w - 4);
      popEl.style.left = left + 'px'; popEl.style.top = (btn.offsetTop + btn.offsetHeight + 4) + 'px';
      popEl.addEventListener('mousedown', function (e) { e.preventDefault(); });
      popEl.addEventListener('click', function (e) {
        var t = e.target.closest('[data-v]'); if (!t || !popEl || !popEl.contains(t)) return;
        var v = t.getAttribute('data-v'); closePop(); restoreSel(); onPick(v, t);
      });
    }

    /* --- commands --- */
    var CMD = {
      undo: function () { exec('undo'); change(); },
      redo: function () { exec('redo'); change(); },
      bold: function () { css(false); exec('bold'); change(); },
      italic: function () { css(false); exec('italic'); change(); },
      underline: function () { css(false); exec('underline'); change(); },
      strike: function () { css(false); exec('strikeThrough'); change(); },
      right: function () { exec('justifyRight'); change(); },
      center: function () { exec('justifyCenter'); change(); },
      left: function () { exec('justifyLeft'); change(); },
      justify: function () { exec('justifyFull'); change(); },
      ul: function () { exec('insertUnorderedList'); change(); },
      ol: function () { exec('insertOrderedList'); change(); },
      hr: function () { exec('insertHorizontalRule'); change(); },
      quote: function () {
        var q = closest((curRange() || {}).startContainer, 'blockquote');
        exec('formatBlock', q ? '<p>' : '<blockquote>'); change();
      },
      clear: function () {
        exec('removeFormat'); exec('unlink');
        leafBlocks().forEach(function (b) { b.removeAttribute('style'); if (!/^(li|td|th)$/i.test(b.tagName)) b.removeAttribute('dir'); b.removeAttribute('class'); });
        var r = curRange();
        $$('span[style],font', body).forEach(function (s) { try { if (r && r.intersectsNode(s)) unwrap(s); } catch (e) { /* ignore */ } });
        var q = closest((curRange() || {}).startContainer, 'h2,h3,h4,blockquote'); if (q) exec('formatBlock', '<p>');
        change();
      },
      indent: function () { indentBy(1); },
      outdent: function () { indentBy(-1); },
      dir: function () {
        var bl = leafBlocks(); if (!bl.length) return;
        var cur = (bl[0].getAttribute('dir') || 'rtl').toLowerCase(), next = cur === 'ltr' ? 'rtl' : 'ltr';
        bl.forEach(function (b) { b.setAttribute('dir', next); });
        change(); syncBar();
      },
      block: function (v) { exec('formatBlock', '<' + v + '>'); change(); },
      size: function (v) { css(true); exec('fontSize', v); css(false); change(); },
      color: function (v) { css(true); exec('foreColor', v); css(false); btns.color.querySelector('.ed-cbar').style.background = v; change(); },
      hilite: function (v) { css(true); if (!exec('hiliteColor', v)) exec('backColor', v); css(false); if (v !== 'transparent') btns.hilite.querySelector('.ed-cbar').style.background = v; change(); }
    };
    function indentBy(dir) {
      var r = curRange(); if (!r) return;
      if (closest(r.startContainer, 'li')) { exec(dir > 0 ? 'indent' : 'outdent'); change(); return; }
      leafBlocks().forEach(function (b) {
        var st = b.getAttribute('style') || '', m = /padding-inline-start:\s*(\d+)px/.exec(st), lv = m ? Math.round(+m[1] / 32) : 0;
        lv = Math.max(0, Math.min(6, lv + dir));
        st = st.replace(/padding-inline-start:\s*[^;]*;?\s*/g, '').trim();
        if (lv) st = (st ? st.replace(/;?$/, ';') + ' ' : '') + 'padding-inline-start: ' + (lv * 32) + 'px;';
        if (st) b.setAttribute('style', st); else b.removeAttribute('style');
      });
      change();
    }

    /* --- dialogs --- */
    function ask(opt) {
      var u = UI();
      if (!u || !u.modal) { fail('نافذة الحوار غير متاحة في هذه الصفحة.'); return Promise.resolve(false); }
      saveSel(); closePop();
      var userOpen = opt.onOpen;
      opt.onOpen = function (d) { d.classList.add('ed-dialog'); if (opt.wide) d.classList.add('ed-wide'); if (userOpen) userOpen(d); };
      return u.modal(opt);
    }
    function normUrl(v) {
      v = String(v || '').trim(); if (!v) return '';
      if (/^[\w-]+(\.[\w-]+)+([\/?#].*)?$/.test(v) && !/^(https?:|mailto:|tel:)/i.test(v)) v = 'https://' + v;
      if (/^[^\s@\/]+@[^\s@\/]+\.[a-z]{2,}$/i.test(v)) v = 'mailto:' + v;
      return cleanUrl(v, true);
    }
    function setLinkAttrs(x, v) {
      x.setAttribute('href', v.href);
      if (v.blank) { x.setAttribute('target', '_blank'); x.setAttribute('rel', 'noopener noreferrer'); } else { x.removeAttribute('target'); x.removeAttribute('rel'); }
    }
    function openLink() {
      restoreSel(); saveSel();
      var r = curRange(), a = r ? closest(r.startContainer, 'a') || closest(r.endContainer, 'a') : null;
      var selTxt = selectedText(), needText = !a && !selTxt;
      var cur = a ? { href: a.getAttribute('href') || '', blank: a.getAttribute('target') === '_blank' } : { href: '', blank: false };
      var removed = false;
      ask({
        title: a ? 'تعديل الرابط' : 'إدراج رابط', icon: 'link', confirmText: a ? 'حفظ الرابط' : 'إدراج', focus: '#' + id + '-url',
        body: '<div class="field mt-16"><label class="label" for="' + id + '-url">عنوان الرابط (URL)</label><input class="input" id="' + id + '-url" type="text" dir="ltr" placeholder="https://example.org" value="' + esc(cur.href) + '"><p class="error" id="' + id + '-url-err" hidden>أدخل رابطاً صالحاً يبدأ بـ https:// أو mailto: أو tel: أو مساراً داخلياً.</p></div>' +
          (needText ? '<div class="field"><label class="label" for="' + id + '-txt">نص الرابط</label><input class="input" id="' + id + '-txt" type="text" placeholder="النص الذي سيظهر للزائر"></div>' : '') +
          '<label class="ed-check"><input type="checkbox" class="checkbox" id="' + id + '-blank"' + (cur.blank ? ' checked' : '') + '><span>فتح الرابط في تبويب جديد</span></label>' +
          (a ? '<div class="ed-rm"><button type="button" class="btn btn-secondary btn-sm" data-rm>' + ico('link_off') + 'إزالة الرابط</button></div>' : ''),
        onOpen: function (d) {
          var rm = $('[data-rm]', d);
          if (rm) rm.addEventListener('click', function () { removed = true; $('[data-act="ok"]', d).click(); });
        },
        validate: function (d) {
          if (removed) return true;
          var v = normUrl($('#' + id + '-url', d).value), er = $('#' + id + '-url-err', d);
          er.hidden = !!v; if (!v) { $('#' + id + '-url', d).focus(); return false; }
          if (needText && !$('#' + id + '-txt', d).value.trim()) { $('#' + id + '-txt', d).focus(); return false; }
          return true;
        },
        getValue: function (d) {
          if (removed) return { removed: true };
          return { href: normUrl($('#' + id + '-url', d).value), blank: $('#' + id + '-blank', d).checked, text: needText ? $('#' + id + '-txt', d).value.trim() : '' };
        }
      }).then(function (v) {
        restoreSel();
        if (!v) return;
        if (a && body.contains(a)) { var rr = D.createRange(); rr.selectNodeContents(a); var s = sel(); s.removeAllRanges(); s.addRange(rr); }
        if (v.removed) { exec('unlink'); if (a && body.contains(a) && a.parentNode) unwrap(a); change(); return; }
        if (needText) { insertHTML('<a href="' + esc(v.href) + '"' + (v.blank ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + esc(v.text) + '</a>&nbsp;'); return; }
        exec('createLink', '#ed-link-tmp');
        $$('a[href="#ed-link-tmp"]', body).forEach(function (x) { setLinkAttrs(x, v); });
        if (a && body.contains(a)) setLinkAttrs(a, v);
        change();
      });
    }

    var SIZE_OPTS = [['25', 'صغيرة (25%)'], ['50', 'متوسطة (50%)'], ['75', 'كبيرة (75%)'], ['100', 'عرض كامل (100%)']];
    var ALIGN_OPTS = [['right', 'يمين'], ['center', 'وسط'], ['left', 'يسار']];
    function optHTML(list, cur) { return list.map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === cur ? ' selected' : '') + '>' + esc(x[1]) + '</option>'; }).join(''); }
    function figureHTML(f) {
      return '<figure class="ed-fig ed-w-' + esc(f.size || '75') + ' ed-align-' + esc(f.align || 'center') + '"><img src="' + esc(f.src) + '" alt="' + esc(f.alt || '') + '" loading="lazy">' + (f.caption ? '<figcaption>' + esc(f.caption) + '</figcaption>' : '') + '</figure>';
    }
    function uploadImage(file, alt) {
      var fd = new FormData(); fd.append('file', file); if (alt) fd.append('alt', alt);
      return api('POST', o.uploadUrl || '/admin/editor/upload', fd).then(function (j) { return j.data; });
    }

    function openImage(fig) {
      var existing = null;
      if (fig) {
        var im = $('img', fig), cap = $('figcaption', fig), cl = fig.className;
        existing = { src: im ? im.getAttribute('src') : '', alt: im ? im.getAttribute('alt') || '' : '', caption: cap ? cap.textContent : '', size: (/ed-w-(\d+)/.exec(cl) || [0, '75'])[1], align: (/ed-align-(\w+)/.exec(cl) || [0, 'center'])[1] };
      } else restoreSel();
      var chosen = existing ? { src: existing.src } : null, libPage = 1, libQ = '', libTimer = null;
      ask({
        title: fig ? 'خصائص الصورة' : 'إدراج صورة', icon: 'image', wide: true, confirmText: fig ? 'حفظ' : 'إدراج الصورة',
        body: '<div class="ed-tabs" role="tablist"><button type="button" role="tab" class="is-on" aria-selected="true" data-tab="up">' + ico('upload') + 'رفع من الجهاز</button><button type="button" role="tab" aria-selected="false" data-tab="lib">' + ico('photo_library') + 'مكتبة الوسائط</button><button type="button" role="tab" aria-selected="false" data-tab="url">' + ico('link') + 'رابط صورة</button></div>' +
          '<div class="ed-pane" data-pane="up"><label class="ed-drop" data-drop><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden data-file>' + ico('cloud_upload') + '<strong>اسحب الصورة إلى هنا أو اضغط للاختيار</strong><span>JPG · PNG · WebP · GIF' + (o.maxMb ? ' — الحد الأقصى ' + esc(o.maxMb) + ' ميغابايت' : '') + '</span></label><p class="ed-msg" data-msg role="status"></p></div>' +
          '<div class="ed-pane" data-pane="lib" hidden><label class="input-icon"><span class="sr-only">بحث في المكتبة</span>' + ico('search') + '<input class="input sm" type="search" placeholder="ابحث باسم الصورة أو الوصف…" data-q></label><div class="ed-grid" data-grid aria-live="polite"></div><div class="ed-more-row"><button type="button" class="btn btn-secondary btn-sm" data-more hidden>تحميل المزيد</button></div></div>' +
          '<div class="ed-pane" data-pane="url" hidden><div class="field"><label class="label" for="' + id + '-iurl">رابط الصورة</label><input class="input" id="' + id + '-iurl" type="text" dir="ltr" placeholder="https://… أو /storage/uploads/…" data-url></div></div>' +
          '<div class="ed-sel"><div class="ed-prev" data-prev>' + (existing ? '<img alt="" src="' + esc(existing.src) + '">' : '<span>لم تُحدَّد صورة بعد</span>') + '</div>' +
          '<div class="ed-fields"><div class="field"><label class="label" for="' + id + '-alt">النص البديل (alt) — يصف الصورة لذوي الإعاقة البصرية</label><input class="input" id="' + id + '-alt" maxlength="255" data-alt value="' + esc(existing ? existing.alt : '') + '"></div>' +
          '<div class="field"><label class="label" for="' + id + '-cap">تعليق تحت الصورة (اختياري)</label><input class="input" id="' + id + '-cap" maxlength="300" data-cap value="' + esc(existing ? existing.caption : '') + '"></div>' +
          '<div class="field-row"><div class="field"><label class="label" for="' + id + '-isz">الحجم</label><select class="select" id="' + id + '-isz" data-size>' + optHTML(SIZE_OPTS, existing ? existing.size : '75') + '</select></div><div class="field"><label class="label" for="' + id + '-ial">المحاذاة</label><select class="select" id="' + id + '-ial" data-align>' + optHTML(ALIGN_OPTS, existing ? existing.align : 'center') + '</select></div></div></div></div>',
        onOpen: function (d) {
          var prev = $('[data-prev]', d), msg = $('[data-msg]', d), grid = $('[data-grid]', d), moreB = $('[data-more]', d);
          function pick(s, alt) { chosen = { src: s }; prev.innerHTML = '<img alt="" src="' + esc(s) + '">'; if (alt != null && !$('[data-alt]', d).value) $('[data-alt]', d).value = alt; }
          $$('[data-tab]', d).forEach(function (t) {
            t.addEventListener('click', function () {
              $$('[data-tab]', d).forEach(function (x) { var on2 = x === t; x.classList.toggle('is-on', on2); x.setAttribute('aria-selected', on2 ? 'true' : 'false'); });
              $$('[data-pane]', d).forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== t.getAttribute('data-tab'); });
              if (t.getAttribute('data-tab') === 'lib' && !grid.children.length) loadLib(true);
            });
          });
          function doUpload(file) {
            if (!file) return;
            if (!/^image\//.test(file.type)) { msg.textContent = 'اختر ملف صورة (JPG أو PNG أو WebP أو GIF).'; msg.className = 'ed-msg is-err'; return; }
            msg.textContent = 'جارٍ رفع الصورة…'; msg.className = 'ed-msg';
            uploadImage(file, $('[data-alt]', d).value).then(function (m) { pick(m.url, m.alt); msg.textContent = 'تم الرفع وحُفظت الصورة في مكتبة الوسائط.'; msg.className = 'ed-msg is-ok'; }, function (e) { msg.textContent = errMsg(e); msg.className = 'ed-msg is-err'; });
          }
          var fi = $('[data-file]', d), dz = $('[data-drop]', d);
          fi.addEventListener('change', function () { doUpload(fi.files && fi.files[0]); });
          ['dragenter', 'dragover'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('is-drag'); }); });
          ['dragleave', 'drop'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('is-drag'); if (ev === 'drop' && e.dataTransfer && e.dataTransfer.files) doUpload(e.dataTransfer.files[0]); }); });
          function loadLib(reset) {
            if (reset) { libPage = 1; grid.innerHTML = ''; }
            api('GET', (o.mediaUrl || '/admin/editor/media') + '?page=' + libPage + '&q=' + encodeURIComponent(libQ)).then(function (j) {
              var rows = j.data || [];
              if (reset && !rows.length) grid.innerHTML = '<p class="ed-empty">لا توجد صور مطابقة في المكتبة.</p>';
              rows.forEach(function (m) {
                var b = h('button', 'ed-thumb'); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.title = m.name || '';
                b.innerHTML = '<img loading="lazy" alt="" src="' + esc(m.url) + '"><span>' + esc(m.name || '') + '</span>';
                b.addEventListener('click', function () { $$('.ed-thumb', grid).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); b.setAttribute('aria-pressed', 'true'); pick(m.url, m.alt || ''); });
                grid.appendChild(b);
              });
              moreB.hidden = !(j.meta && j.meta.page < j.meta.last);
            }, function (e) { grid.innerHTML = '<p class="ed-empty">' + esc(errMsg(e)) + '</p>'; });
          }
          moreB.addEventListener('click', function () { libPage++; loadLib(false); });
          $('[data-q]', d).addEventListener('input', function (e) { clearTimeout(libTimer); var v = e.target.value; libTimer = setTimeout(function () { libQ = v.trim(); loadLib(true); }, 250); });
          $('[data-url]', d).addEventListener('input', function (e) { var v = cleanUrl(e.target.value, false); if (v) pick(v); });
        },
        validate: function (d) { if (chosen && chosen.src) return true; var m = $('[data-msg]', d); if (m) { m.textContent = 'اختر صورة أو ارفع واحدة أولاً.'; m.className = 'ed-msg is-err'; } toast('اختر صورة أولاً', { tone: 'danger', icon: 'error' }); return false; },
        getValue: function (d) { return { src: chosen.src, alt: $('[data-alt]', d).value.trim(), caption: $('[data-cap]', d).value.trim(), size: $('[data-size]', d).value, align: $('[data-align]', d).value }; }
      }).then(function (v) {
        if (!v) { restoreSel(); return; }
        if (fig) { applyFigure(fig, v); return; }
        insertBlock(figureHTML(v) + '<p><br></p>');
      });
    }
    function applyFigure(fig, v) {
      fig.className = (fig.className.replace(/\bed-(w|align)-\w+\b/g, '').replace(/\s+/g, ' ').trim() + ' ed-w-' + v.size + ' ed-align-' + v.align).trim();
      var im = $('img', fig); if (im) { im.setAttribute('src', v.src); im.setAttribute('alt', v.alt || ''); }
      var cap = $('figcaption', fig);
      if (v.caption) { if (!cap) { cap = D.createElement('figcaption'); fig.appendChild(cap); } cap.textContent = v.caption; } else if (cap) fig.removeChild(cap);
      change(); showCtx(fig);
    }

    function openAlbum() {
      restoreSel(); var pickedSlug = '';
      ask({
        title: 'إدراج ألبوم صور', icon: 'photo_library', wide: true, confirmText: 'إدراج الألبوم',
        body: '<p class="modal-text">اختر ألبوماً من معرض الصور، وسيُدرج كشبكة صور متجاوبة داخل المحتوى.</p><div class="ed-albums" data-albums aria-live="polite"><p class="ed-empty">جارٍ تحميل الألبومات…</p></div>' +
          '<div class="field-row mt-16"><div class="field"><label class="label" for="' + id + '-cols">عدد الأعمدة</label><select class="select" id="' + id + '-cols" data-cols><option value="2">عمودان</option><option value="3" selected>3 أعمدة</option><option value="4">4 أعمدة</option></select></div><div class="field"><label class="label" for="' + id + '-max">عدد الصور</label><select class="select" id="' + id + '-max" data-max><option value="6">أول 6 صور</option><option value="9">أول 9 صور</option><option value="12" selected>أول 12 صورة</option><option value="24">أول 24 صورة</option><option value="200">كل الصور</option></select></div></div>',
        onOpen: function (d) {
          var box = $('[data-albums]', d);
          api('GET', '/admin/gallery-albums').then(function (j) {
            var rows = (j.data || []).filter(function (a) { return a.count > 0; });
            if (!rows.length) { box.innerHTML = '<p class="ed-empty">لا توجد ألبومات تحتوي صوراً بعد. أضف صوراً من صفحة «المعرض».</p>'; return; }
            box.innerHTML = '';
            rows.forEach(function (a) {
              var b = h('button', 'ed-album'); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
              b.innerHTML = ico('photo_library') + '<strong>' + esc(a.label) + '</strong><span>' + a.count + ' صورة</span>';
              b.addEventListener('click', function () { $$('.ed-album', box).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); b.setAttribute('aria-pressed', 'true'); pickedSlug = a.slug; });
              box.appendChild(b);
            });
          }, function (e) { box.innerHTML = '<p class="ed-empty">' + esc(errMsg(e)) + '</p>'; });
        },
        validate: function () { if (pickedSlug) return true; toast('اختر ألبوماً أولاً', { tone: 'danger', icon: 'error' }); return false; },
        getValue: function (d) { return { slug: pickedSlug, cols: $('[data-cols]', d).value, max: +$('[data-max]', d).value }; }
      }).then(function (v) {
        if (!v) { restoreSel(); return; }
        api('GET', '/admin/gallery-items?album=' + encodeURIComponent(v.slug)).then(function (j) {
          var items = (j.data || []).filter(function (x) { return x.src && (!x.type || x.type === 'image'); }).slice(0, v.max);
          if (!items.length) { fail('لا توجد صور في هذا الألبوم.'); return; }
          insertBlock('<div class="ed-gallery ed-cols-' + esc(v.cols) + '" data-album="' + esc(v.slug) + '">' + items.map(function (x) { return '<figure><img src="' + esc(x.src) + '" alt="' + esc(x.alt || x.title || '') + '" loading="lazy"></figure>'; }).join('') + '</div><p><br></p>');
        }, function (e) { fail(errMsg(e)); });
      });
    }

    function openVideo() {
      restoreSel();
      ask({
        title: 'إدراج فيديو', icon: 'smart_display', confirmText: 'إدراج الفيديو', focus: '#' + id + '-vurl',
        body: '<div class="field mt-16"><label class="label" for="' + id + '-vurl">رابط الفيديو (YouTube أو Vimeo أو ملف MP4)</label><input class="input" id="' + id + '-vurl" type="text" dir="ltr" placeholder="https://www.youtube.com/watch?v=…" data-vurl><p class="hint">تُدرج المقاطع من YouTube وVimeo فقط كإطار مضمَّن آمن، أما ملفات MP4 فتُشغَّل مباشرة.</p><p class="error" id="' + id + '-vurl-err" hidden>رابط غير مدعوم. استخدم رابط YouTube أو Vimeo أو رابط ملف MP4/WebM.</p></div>' +
          '<div class="ed-vup"><label class="btn btn-secondary btn-sm">' + ico('upload_file') + 'أو ارفع ملف MP4 من جهازك<input type="file" accept="video/mp4,video/webm" hidden data-vfile></label><span class="ed-msg" data-vmsg role="status"></span></div>',
        onOpen: function (d) {
          var fi = $('[data-vfile]', d), msg = $('[data-vmsg]', d);
          fi.addEventListener('change', function () {
            var f = fi.files && fi.files[0]; if (!f) return;
            msg.textContent = 'جارٍ رفع الفيديو…'; msg.className = 'ed-msg';
            var fd = new FormData(); fd.append('file', f);
            api('POST', o.videoUrl || '/admin/editor/video', fd).then(function (j) { $('[data-vurl]', d).value = j.data.url; msg.textContent = 'تم رفع الفيديو.'; msg.className = 'ed-msg is-ok'; }, function (e) { msg.textContent = errMsg(e); msg.className = 'ed-msg is-err'; });
          });
        },
        validate: function (d) { var ok = !!parseVideo($('[data-vurl]', d).value); $('#' + id + '-vurl-err', d).hidden = ok; if (!ok) $('[data-vurl]', d).focus(); return ok; },
        getValue: function (d) { return parseVideo($('[data-vurl]', d).value); }
      }).then(function (v) {
        if (!v) { restoreSel(); return; }
        if (v.kind === 'iframe') insertBlock('<div class="ed-embed"><iframe src="' + esc(v.src) + '" title="فيديو" allowfullscreen loading="lazy"></iframe></div><p><br></p>');
        else insertBlock('<div class="ed-embed ed-embed-file"><video controls preload="metadata" src="' + esc(v.src) + '"></video></div><p><br></p>');
      });
    }

    function openTable() {
      restoreSel();
      ask({
        title: 'إدراج جدول', icon: 'table_chart', confirmText: 'إدراج الجدول', focus: '#' + id + '-rows',
        body: '<div class="field-row mt-16"><div class="field"><label class="label" for="' + id + '-rows">عدد الصفوف</label><input class="input num" id="' + id + '-rows" type="number" min="1" max="20" value="3" dir="ltr" data-rows></div><div class="field"><label class="label" for="' + id + '-colsn">عدد الأعمدة</label><input class="input num" id="' + id + '-colsn" type="number" min="1" max="8" value="3" dir="ltr" data-cols></div></div>' +
          '<label class="ed-check"><input type="checkbox" class="checkbox" data-head checked><span>الصف الأول عناوين الأعمدة</span></label>',
        getValue: function (d) { return { r: Math.max(1, Math.min(20, +$('[data-rows]', d).value || 3)), c: Math.max(1, Math.min(8, +$('[data-cols]', d).value || 3)), head: $('[data-head]', d).checked }; }
      }).then(function (v) {
        if (!v) { restoreSel(); return; }
        var cells = function (t) { var s = ''; for (var i = 0; i < v.c; i++) s += '<' + t + '><br></' + t + '>'; return s; }, rows = '';
        if (v.head) rows += '<thead><tr>' + cells('th') + '</tr></thead>';
        rows += '<tbody>'; for (var i = v.head ? 1 : 0; i < v.r; i++) rows += '<tr>' + cells('td') + '</tr>'; rows += '</tbody>';
        insertBlock('<table class="ed-table">' + rows + '</table><p><br></p>');
      });
    }

    function openCallout(type) {
      restoreSel();
      if (type !== 'button') {
        var txt = selectedText().trim();
        if (txt) exec('delete');
        insertBlock('<div class="ed-callout ed-callout-' + type + '"><p>' + (txt ? esc(txt) : 'اكتب الملاحظة هنا…') + '</p></div><p><br></p>');
        return;
      }
      ask({
        title: 'إدراج زر رابط', icon: 'smart_button', confirmText: 'إدراج الزر', focus: '#' + id + '-bl',
        body: '<div class="field mt-16"><label class="label" for="' + id + '-bl">نص الزر</label><input class="input" id="' + id + '-bl" maxlength="60" data-bl value="' + esc(selectedText().trim().slice(0, 60) || 'اعرف المزيد') + '"></div>' +
          '<div class="field"><label class="label" for="' + id + '-bu">رابط الزر</label><input class="input" id="' + id + '-bu" dir="ltr" placeholder="https://…" data-bu><p class="error" data-bu-err hidden>أدخل رابطاً صالحاً.</p></div>' +
          '<div class="field"><label class="label" for="' + id + '-bs">لون الزر</label><select class="select" id="' + id + '-bs" data-bs><option value="green">أخضر</option><option value="orange">برتقالي</option><option value="outline">إطار فقط</option></select></div>' +
          '<label class="ed-check"><input type="checkbox" class="checkbox" data-bb><span>فتح في تبويب جديد</span></label>',
        validate: function (d) { var ok = !!normUrl($('[data-bu]', d).value) && !!$('[data-bl]', d).value.trim(); $('[data-bu-err]', d).hidden = ok; if (!ok) $('[data-bu]', d).focus(); return ok; },
        getValue: function (d) { return { label: $('[data-bl]', d).value.trim(), href: normUrl($('[data-bu]', d).value), style: $('[data-bs]', d).value, blank: $('[data-bb]', d).checked }; }
      }).then(function (v) {
        if (!v) { restoreSel(); return; }
        insertBlock('<p class="ed-btn-wrap"><a class="ed-btn ed-btn-' + esc(v.style) + '" href="' + esc(v.href) + '"' + (v.blank ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + esc(v.label) + '</a></p><p><br></p>');
      });
    }

    /* --- context bar (images, galleries, embeds, tables) --- */
    function hideCtx() { if (selected) selected.classList.remove('is-selected'); selected = null; ctx.hidden = true; ctx.innerHTML = ''; ctx._t = null; }
    function ctxBtn(act, icon, tip, txt, on2) {
      return '<button type="button" class="ed-cbtn' + (on2 ? ' is-on' : '') + '" data-a="' + act + '" title="' + esc(tip) + '" aria-label="' + esc(tip) + '"' + (on2 ? ' aria-pressed="true"' : '') + '>' + (icon ? ico(icon) : '') + (txt ? '<span>' + esc(txt) + '</span>' : '') + '</button>';
    }
    function showCtx(target) {
      if (!target || !body.contains(target)) { hideCtx(); return; }
      if (selected && selected !== target) selected.classList.remove('is-selected');
      var html = '', sep = '<span class="ed-csep"></span>';
      if (target.matches('figure.ed-fig')) {
        selected = target; target.classList.add('is-selected');
        var cl = target.className, sz = (/ed-w-(\d+)/.exec(cl) || [0, ''])[1], al = (/ed-align-(\w+)/.exec(cl) || [0, ''])[1];
        ['25', '50', '75', '100'].forEach(function (s) { html += ctxBtn('w' + s, '', 'عرض ' + s + '%', s + '%', sz === s); });
        html += sep + ctxBtn('al-right', 'format_align_right', 'يمين', '', al === 'right') + ctxBtn('al-center', 'format_align_center', 'وسط', '', al === 'center') + ctxBtn('al-left', 'format_align_left', 'يسار', '', al === 'left');
        html += sep + ctxBtn('edit', 'tune', 'تعديل النص البديل والتعليق') + ctxBtn('del', 'delete', 'حذف الصورة');
      } else if (target.matches('.ed-gallery')) {
        selected = target; target.classList.add('is-selected');
        var cc = (/ed-cols-(\d)/.exec(target.className) || [0, '3'])[1];
        ['2', '3', '4'].forEach(function (c2) { html += ctxBtn('cols' + c2, '', c2 + ' أعمدة', c2 + ' أعمدة', cc === c2); });
        html += sep + ctxBtn('del', 'delete', 'حذف الألبوم');
      } else if (target.matches('.ed-embed')) {
        selected = target; target.classList.add('is-selected');
        html += ctxBtn('del', 'delete', 'حذف الفيديو');
      } else if (target.matches('table')) {
        if (selected) selected.classList.remove('is-selected'); selected = null;
        html += ctxBtn('row+', 'add', 'إضافة صف بعد الحالي', 'صف') + ctxBtn('col+', 'add', 'إضافة عمود بعد الحالي', 'عمود') + sep + ctxBtn('row-', 'remove', 'حذف الصف', 'صف') + ctxBtn('col-', 'remove', 'حذف العمود', 'عمود') + sep + ctxBtn('del', 'delete', 'حذف الجدول');
      } else { hideCtx(); return; }
      ctx.innerHTML = html; ctx.hidden = false; ctx._t = target;
      placeCtx(target);
    }
    function placeCtx(t) {
      if (ctx.hidden || !t) return;
      var sr = stage.getBoundingClientRect(), tr = t.getBoundingClientRect();
      var br = root.classList.contains('is-full') ? bar.getBoundingClientRect() : bar.getBoundingClientRect();
      var want = tr.top - ctx.offsetHeight - 6, floor = br.bottom + 4;
      if (want < floor) want = Math.min(Math.max(tr.top + 6, floor), Math.max(floor, tr.bottom - ctx.offsetHeight - 6));
      var top = want - sr.top;
      var left = tr.left - sr.left; left = Math.max(4, Math.min(left, sr.width - ctx.offsetWidth - 4));
      ctx.style.top = top + 'px'; ctx.style.left = left + 'px';
    }
    function ctxTarget(n) {
      if (!n) return null;
      if (n.nodeType !== 1) n = n.parentNode;
      if (!inBody(n)) return null;
      return closest(n, 'figure.ed-fig') || closest(n, '.ed-gallery') || closest(n, '.ed-embed') || closest(n, 'table');
    }
    function tableOp(op, cell, table) {
      if (op === 'del') { table.parentNode.removeChild(table); hideCtx(); change(); return; }
      var tr = cell ? cell.parentNode : null; if (!tr) return;
      var idx = cell.cellIndex;
      if (op === 'row+') {
        var nr = D.createElement('tr'); for (var i = 0; i < tr.cells.length; i++) { var c = D.createElement('td'); c.innerHTML = '<br>'; nr.appendChild(c); }
        if (tr.parentNode.tagName === 'THEAD') { var tb = table.tBodies[0] || table.appendChild(D.createElement('tbody')); tb.insertBefore(nr, tb.firstChild); } else tr.parentNode.insertBefore(nr, tr.nextSibling);
      } else if (op === 'col+') {
        $$('tr', table).forEach(function (r) { var ref = r.cells[idx], n2 = D.createElement(r.parentNode.tagName === 'THEAD' ? 'th' : 'td'); n2.innerHTML = '<br>'; r.insertBefore(n2, ref ? ref.nextSibling : null); });
      } else if (op === 'row-') {
        tr.parentNode.removeChild(tr); if (!$$('tr', table).length) table.parentNode.removeChild(table);
      } else if (op === 'col-') {
        $$('tr', table).forEach(function (r) { if (r.cells[idx]) r.removeChild(r.cells[idx]); });
        if (!$$('td,th', table).length) table.parentNode.removeChild(table);
      }
      change(); hideCtx();
    }
    on(ctx, 'mousedown', function (e) { e.preventDefault(); });
    on(ctx, 'click', function (e) {
      var b = e.target.closest('[data-a]'); if (!b) return;
      var a = b.getAttribute('data-a'), t = ctx._t; if (!t) return;
      var m;
      if (a === 'del') { t.parentNode.removeChild(t); if (!body.childNodes.length) body.innerHTML = '<p><br></p>'; hideCtx(); change(); return; }
      if (a === 'edit') { openImage(t); return; }
      if ((m = /^w(\d+)$/.exec(a))) { t.className = t.className.replace(/\bed-w-\d+\b/, '').trim() + ' ed-w-' + m[1]; change(); showCtx(t); return; }
      if ((m = /^al-(\w+)$/.exec(a))) { t.className = t.className.replace(/\bed-align-\w+\b/, '').trim() + ' ed-align-' + m[1]; change(); showCtx(t); return; }
      if ((m = /^cols(\d)$/.exec(a))) { t.className = t.className.replace(/\bed-cols-\d\b/, '').trim() + ' ed-cols-' + m[1]; change(); showCtx(t); return; }
      if (t.matches('table')) { var r = curRange(), cell = (r ? closest(r.startContainer, 'td,th') : null) || (ctx._cell && body.contains(ctx._cell) ? ctx._cell : null); tableOp(a, cell, t); }
    });

    /* --- state sync --- */
    function pressed(c, v) { var b = btns[c]; if (b && b.hasAttribute('aria-pressed')) { b.setAttribute('aria-pressed', v ? 'true' : 'false'); b.classList.toggle('is-on', !!v); } }
    var syncQueued = false;
    function syncBar() {
      syncQueued = false;
      var s = sel(); if (!s || !s.rangeCount || !inBody(s.anchorNode)) return;
      pressed('bold', qs('bold')); pressed('italic', qs('italic')); pressed('underline', qs('underline')); pressed('strike', qs('strikeThrough'));
      pressed('ul', qs('insertUnorderedList')); pressed('ol', qs('insertOrderedList'));
      pressed('right', qs('justifyRight')); pressed('center', qs('justifyCenter')); pressed('left', qs('justifyLeft')); pressed('justify', qs('justifyFull'));
      var n = s.anchorNode, blk = closest(n, 'h2,h3,h4,blockquote,p,li'), tg = blk ? blk.tagName.toLowerCase() : 'p';
      var lbl = $('.ed-lbl', btns.block); if (lbl) lbl.textContent = tg === 'h2' ? 'عنوان رئيسي' : tg === 'h3' ? 'عنوان فرعي' : tg === 'h4' ? 'عنوان صغير' : tg === 'blockquote' ? 'اقتباس' : 'فقرة عادية';
      pressed('quote', !!closest(n, 'blockquote'));
      var db = closest(n, 'p,h2,h3,h4,blockquote,li,div'), dir = !!(db && db.getAttribute('dir') === 'ltr');
      pressed('dir', dir); var di = $('.material-symbols-outlined', btns.dir); if (di) di.textContent = dir ? 'format_textdirection_r_to_l' : 'format_textdirection_l_to_r';
      btns.dir.title = dir ? 'تبديل الاتجاه إلى يمين←يسار (RTL)' : 'تبديل الاتجاه إلى يسار←يمين (LTR)';
    }
    on(D, 'selectionchange', function () {
      var s = sel(); if (!s || !s.rangeCount || !inBody(s.anchorNode)) return;
      saveSel();
      if (!syncQueued) { syncQueued = true; (window.requestAnimationFrame || setTimeout)(syncBar); }
    });

    /* --- source / fullscreen --- */
    function countWordsFrom(html) { var t = textOf(html), w = t ? t.split(/\s+/).length : 0; words.textContent = w + ' كلمة · ' + Math.max(1, Math.round(w / 180)) + ' د قراءة'; }
    function toggleSource() {
      var on2 = !root.classList.contains('is-source');
      closePop(); hideCtx();
      if (on2) { src.value = pretty(getHTML()); root.classList.add('is-source'); body.hidden = true; src.hidden = false; src.focus(); }
      else { var clean = sanitize(src.value, 'full'); root.classList.remove('is-source'); src.hidden = true; body.hidden = false; body.innerHTML = clean || '<p><br></p>'; lockBlocks(); updateEmpty(); countWords(); change(); body.focus(); }
      pressed('source', on2);
    }
    on(src, 'input', function () {
      countWordsFrom(src.value);
      if (silent) return;
      var clean = sanitize(src.value, 'full');
      cbs.forEach(function (fn) { try { fn(clean); } catch (e) { /* ignore */ } });
      host.dispatchEvent(new Event('input', { bubbles: true }));
    });
    var holder = null;
    function toggleFull(force) {
      var on2 = force != null ? force : !root.classList.contains('is-full');
      if (on2 === root.classList.contains('is-full')) return;
      closePop();
      if (on2) { holder = D.createComment('ed'); root.parentNode.insertBefore(holder, root); D.body.appendChild(root); root.classList.add('is-full'); D.body.classList.add('ed-noscroll'); }
      else { root.classList.remove('is-full'); D.body.classList.remove('ed-noscroll'); if (holder && holder.parentNode) { holder.parentNode.insertBefore(root, holder); holder.parentNode.removeChild(holder); } holder = null; }
      pressed('fullscreen', on2); var fi = $('.material-symbols-outlined', btns.fullscreen); if (fi) fi.textContent = on2 ? 'fullscreen_exit' : 'fullscreen';
      btns.fullscreen.title = on2 ? 'إنهاء ملء الشاشة (Esc)' : 'ملء الشاشة (Ctrl+Shift+F)';
      if (selected) placeCtx(selected);
    }

    /* --- toolbar events --- */
    function swatches(list, extra) {
      return '<div class="ed-sws">' + list.map(function (c2) { return '<button type="button" class="ed-sw" data-v="' + c2[0] + '" title="' + esc(c2[1]) + '" aria-label="' + esc(c2[1]) + '" style="background:' + c2[0] + '"></button>'; }).join('') + (extra || '') + '</div>';
    }
    function menuItems(list, withIcon) { return list.map(function (b2) { return '<button type="button" class="ed-mi ed-mi-' + b2[0] + '" data-v="' + b2[0] + '">' + (withIcon ? ico(b2[2]) : '') + esc(b2[1]) + '</button>'; }).join(''); }
    function run(cmd, btn) {
      if (root.classList.contains('is-source') && cmd !== 'source' && cmd !== 'fullscreen') return;
      if (cmd === 'more') { var on2 = root.classList.toggle('is-more'); btn.setAttribute('aria-pressed', on2 ? 'true' : 'false'); return; }
      if (cmd === 'source') return toggleSource();
      if (cmd === 'fullscreen') return toggleFull();
      if (cmd === 'block') return openPop(btn, 'ed-menu', menuItems(BLOCKS), function (v) { CMD.block(v); });
      if (cmd === 'size') return openPop(btn, 'ed-menu', menuItems(SIZES), function (v) { CMD.size(v); });
      if (cmd === 'callout') return openPop(btn, 'ed-menu', menuItems(CALLOUTS, true), function (v) { openCallout(v); });
      if (cmd === 'color') return openPop(btn, 'ed-pal', '<p class="ed-pt">لون النص</p>' + swatches(TEXT_COLORS), function (v) { CMD.color(v); });
      if (cmd === 'hilite') return openPop(btn, 'ed-pal', '<p class="ed-pt">تمييز بلون خلفية</p>' + swatches(HILITES, '<button type="button" class="ed-sw ed-sw-none" data-v="transparent" title="بدون تمييز" aria-label="بدون تمييز">' + ico('format_color_reset') + '</button>'), function (v) { CMD.hilite(v); });
      if (cmd === 'emoji') return openPop(btn, 'ed-pal ed-emoji', '<div class="ed-sws ed-emo">' + EMOJI.map(function (e2) { return '<button type="button" class="ed-em" data-v="' + e2 + '" aria-label="' + e2 + '">' + e2 + '</button>'; }).join('') + '</div>', function (v) { insertHTML(v); });
      closePop();
      if (cmd === 'link') return openLink();
      if (cmd === 'image') return openImage();
      if (cmd === 'album') return openAlbum();
      if (cmd === 'video') return openVideo();
      if (cmd === 'table') return openTable();
      restoreSel();
      if (CMD[cmd]) CMD[cmd]();
      syncBar();
    }
    on(bar, 'mousedown', function (e) { if (e.target.closest('.ed-tb') || e.target.closest('.ed-pop')) e.preventDefault(); });
    on(bar, 'click', function (e) { var b = e.target.closest('.ed-tb'); if (!b || !bar.contains(b)) return; run(b.getAttribute('data-cmd'), b); });
    on(bar, 'keydown', function (e) {
      var b = e.target.closest('.ed-tb'); if (!b) return;
      var list = $$('.ed-tb', bar).filter(function (x) { return x.offsetParent !== null || x === b; }), i = list.indexOf(b), n = -1;
      if (e.key === 'ArrowLeft') n = i + 1; else if (e.key === 'ArrowRight') n = i - 1; else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = list.length - 1;
      else if (e.key === 'Escape' && popEl) { closePop(); b.focus(); e.preventDefault(); return; }
      if (n < 0) return; e.preventDefault(); n = (n + list.length) % list.length;
      list.forEach(function (x) { x.tabIndex = -1; }); list[n].tabIndex = 0; list[n].focus();
    });
    on(D, 'mousedown', function (e) { if (popEl && !popEl.contains(e.target) && !(popBtn && popBtn.contains(e.target))) closePop(); });

    /* --- editing events --- */
    var pastePlain = false;
    on(body, 'input', function () { change(); });
    on(body, 'keydown', function (e) {
      var mod = e.ctrlKey || e.metaKey, k = (e.key || '').toLowerCase(), code = e.code || '';
      if (mod && e.shiftKey && k === 'v') pastePlain = true;
      if (e.key === 'Escape') return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected && selected.matches('.ed-gallery,.ed-embed')) {
        var s = sel(); if (s && s.isCollapsed) { e.preventDefault(); var d1 = $('[data-a="del"]', ctx); if (d1) d1.click(); return; }
      }
      if (e.key === 'Tab' && closest((curRange() || {}).startContainer, 'li')) { e.preventDefault(); indentBy(e.shiftKey ? -1 : 1); return; }
      if (!mod) return;
      var did = true;
      if (!e.shiftKey && !e.altKey && k === 'k') openLink();
      else if (e.shiftKey && !e.altKey && k === 'x') CMD.strike();
      else if (e.shiftKey && !e.altKey && k === 'r') CMD.right();
      else if (e.shiftKey && !e.altKey && k === 'e') CMD.center();
      else if (e.shiftKey && !e.altKey && k === 'l') CMD.left();
      else if (e.shiftKey && !e.altKey && k === 'j') CMD.justify();
      else if (e.shiftKey && !e.altKey && (code === 'Digit7' || k === '7' || k === '&')) CMD.ol();
      else if (e.shiftKey && !e.altKey && (code === 'Digit8' || k === '8' || k === '*')) CMD.ul();
      else if (e.shiftKey && !e.altKey && k === 'f') toggleFull();
      else if (!e.shiftKey && !e.altKey && k === ']') CMD.indent();
      else if (!e.shiftKey && !e.altKey && k === '[') CMD.outdent();
      else if (!e.shiftKey && !e.altKey && k === '\\') CMD.clear();
      else if (e.altKey && !e.shiftKey && /^Digit[0-3]$/.test(code)) CMD.block({ Digit0: 'p', Digit1: 'h2', Digit2: 'h3', Digit3: 'h4' }[code]);
      else did = false;
      if (did) { e.preventDefault(); syncBar(); }
    });
    on(body, 'click', function (e) {
      var t = ctxTarget(e.target);
      if (t && t.matches('table')) ctx._cell = closest(e.target, 'td,th');
      if (t) showCtx(t); else hideCtx();
    });
    on(body, 'keyup', function (e) {
      if (/^(Arrow|Home|End|Page)/.test(e.key || '') || e.key === 'Backspace' || e.key === 'Delete') {
        var s = sel(), t = s && s.rangeCount ? ctxTarget(s.anchorNode) : null;
        if (t && t.matches('table')) { ctx._cell = closest(s.anchorNode, 'td,th'); showCtx(t); } else hideCtx();
      }
    });
    on(stage, 'scroll', function () { if (selected) placeCtx(selected); }, true);
    on(window, 'resize', function () { if (!ctx.hidden && ctx._t) placeCtx(ctx._t); });
    on(window, 'scroll', function () { if (!ctx.hidden && ctx._t) placeCtx(ctx._t); }, { passive: true });
    on(body, 'focus', function () { try { D.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) { /* ignore */ } });

    /* paste: strip Word / web junk, upload pasted images */
    function imageFiles(dt) {
      var out = [];
      if (!dt) return out;
      if (dt.files && dt.files.length) Array.prototype.forEach.call(dt.files, function (f) { if (/^image\//.test(f.type)) out.push(f); });
      if (!out.length && dt.items) Array.prototype.forEach.call(dt.items, function (it) { if (it.kind === 'file' && /^image\//.test(it.type) && it.getAsFile) { var f = it.getAsFile(); if (f) out.push(f); } });
      return out;
    }
    function textToHTML(t) {
      return String(t || '').replace(/\r\n?/g, '\n').split(/\n{2,}/).map(function (par) { return par.trim() ? '<p>' + esc(par.trim()).replace(/\n/g, '<br>') + '</p>' : ''; }).join('');
    }
    function uploadFiles(files) {
      files.reduce(function (chain, f) {
        return chain.then(function () {
          status.textContent = 'جارٍ رفع الصورة…';
          return uploadImage(f).then(function (m) { insertBlock(figureHTML({ src: m.url, alt: m.alt || '', size: '75', align: 'center' }) + '<p><br></p>'); }, function (e) { fail(errMsg(e)); });
        });
      }, Promise.resolve()).then(function () { status.textContent = ''; }, function () { status.textContent = ''; });
    }
    on(body, 'paste', function (e) {
      var cd = e.clipboardData; if (!cd) return;
      var files = imageFiles(cd), html = cd.getData ? cd.getData('text/html') : '', text = cd.getData ? cd.getData('text/plain') : '';
      e.preventDefault();
      if (files.length && !html) { saveSel(); uploadFiles(files); return; }
      var plainOnly = pastePlain; pastePlain = false;
      saveSel();
      if (html && !plainOnly) { var clean = sanitize(html, 'paste'); if (clean) { insertHTML(clean); return; } }
      if (text) {
        if (/\n/.test(text.replace(/\n+$/, ''))) insertHTML(textToHTML(text));
        else { restoreSel(); if (!exec('insertText', text.replace(/\u00a0/g, ' '))) insertHTML(esc(text)); change(); }
      }
    });
    on(body, 'dragover', function (e) { var dt = e.dataTransfer; if (dt && dt.types && Array.prototype.indexOf.call(dt.types, 'Files') > -1) { e.preventDefault(); body.classList.add('is-drag'); } });
    on(body, 'dragleave', function () { body.classList.remove('is-drag'); });
    on(body, 'drop', function (e) {
      body.classList.remove('is-drag');
      var files = imageFiles(e.dataTransfer); if (!files.length) return;
      e.preventDefault();
      var r = null;
      if (D.caretRangeFromPoint) r = D.caretRangeFromPoint(e.clientX, e.clientY);
      else if (D.caretPositionFromPoint) { var p = D.caretPositionFromPoint(e.clientX, e.clientY); if (p) { r = D.createRange(); r.setStart(p.offsetNode, p.offset); r.collapse(true); } }
      if (r && inBody(r.startContainer)) { var s = sel(); s.removeAllRanges(); s.addRange(r); saveSel(); }
      uploadFiles(files);
    });
    on(root, 'keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (popEl) { closePop(); e.stopPropagation(); return; }
      if (root.classList.contains('is-full') && !D.querySelector('.modal')) { toggleFull(false); e.preventDefault(); }
    });

    /* --- init --- */
    if (o.value) setHTML(o.value, true); else body.innerHTML = '<p><br></p>';
    updateEmpty(); countWords();
    if (o.onChange) cbs.push(o.onChange);

    var self = {
      root: root, body: body, id: body.id,
      getHTML: getHTML, setHTML: setHTML,
      getText: function () { return body.textContent.replace(/\u00a0/g, ' ').trim(); },
      isEmpty: function () { return body.classList.contains('is-empty'); },
      focus: function () { if (root.classList.contains('is-source')) src.focus(); else body.focus(); },
      onChange: function (fn) { cbs.push(fn); },
      insertHTML: insertHTML, run: run, fullscreen: toggleFull,
      destroy: function () { closePop(); toggleFull(false); listeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); }); if (root.parentNode) root.parentNode.removeChild(root); cbs = []; }
    };
    host._edApi = self;
    return self;
  }

  /* =====================================================================
     enhance(textarea) — keeps the textarea as the data holder (value = plain text or HTML)
     ===================================================================== */
  function enhance(ta, o) {
    if (!ta) return null;
    if (ta._edApi) return ta._edApi;
    o = o || {};
    var desc = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
    var host = h('div', 'ed-host'); ta.parentNode.insertBefore(host, ta.nextSibling);
    ta.hidden = true; ta.style.display = 'none'; ta.setAttribute('aria-hidden', 'true'); ta.tabIndex = -1; ta.removeAttribute('maxlength');
    var lab = ta.id ? D.querySelector('label[for="' + ta.id + '"]') : null;
    var rows = +ta.getAttribute('rows') || 4;
    var max = o.max || +ta.getAttribute('data-rich-max') || 0;
    var counterId = o.counter || ta.getAttribute('data-rich-count');
    var stored = desc.get.call(ta);
    var ed = create({
      el: host, value: fromStored(stored), compact: o.compact != null ? o.compact : true, placeholder: ta.getAttribute('placeholder') || o.placeholder || undefined,
      minHeight: o.minHeight || Math.max(110, rows * 30), label: lab ? lab.textContent.replace(/\s*\*\s*|اختياري/g, '').trim() : (ta.getAttribute('aria-label') || undefined),
      hint: o.hint != null ? o.hint : '', maxChars: max, id: ta.id ? ta.id + '-editor' : undefined
    });
    var guard = false;
    function counter() {
      if (!counterId) return;
      var c = D.getElementById(counterId); if (!c) return;
      var n = textLength(stored); c.textContent = n + (max ? ' / ' + max : ''); c.classList.toggle('over', !!max && n > max);
    }
    Object.defineProperty(ta, 'value', {
      configurable: true,
      get: function () { return stored; },
      set: function (v) { v = v == null ? '' : String(v); stored = v; desc.set.call(ta, v); if (!guard) { ed.setHTML(fromStored(v), true); counter(); } }
    });
    ed.onChange(function (html) {
      stored = toStored(html); desc.set.call(ta, stored);
      guard = true; ta.dispatchEvent(new Event('input', { bubbles: true })); guard = false; counter();
    });
    ta.focus = function () { ed.focus(); };
    if (lab) lab.addEventListener('click', function (e) { e.preventDefault(); ed.focus(); });
    if (ta.form) ta.form.addEventListener('reset', function () { setTimeout(function () { stored = desc.get.call(ta); ed.setHTML(fromStored(stored), true); counter(); }, 0); });
    if (window.MutationObserver) new MutationObserver(function () { host.classList.toggle('is-invalid', ta.classList.contains('is-invalid')); }).observe(ta, { attributes: true, attributeFilter: ['class', 'aria-invalid'] });
    ta._edApi = ed; ed.textarea = ta; counter();
    return ed;
  }
  function autoInit() { $$('textarea[data-rich]').forEach(function (t) { enhance(t, { compact: t.getAttribute('data-rich-full') == null }); }); }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', autoInit); else autoInit();

  window.AdminEditor = {
    create: create, enhance: enhance, sanitize: sanitize, plain: plain, render: render, textLength: textLength,
    fromStored: fromStored, toStored: toStored, parseVideo: parseVideo, looksHtml: looksHtml
  };
}());
