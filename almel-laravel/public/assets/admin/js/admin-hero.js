/* «إعدادات الهيرو» — slide list, live preview and editor for the homepage hero (database backed).
   State: { settings, slides[] }. Saved as a whole with PUT /admin/hero (see App\Support\HeroSupport for the rules). */
(function () {
  'use strict';
  var U = window.AdminUI, DB = window.AdminDB, BOOT = window.__HERO;
  if (!U || !DB || !BOOT) return;
  var esc = U.esc;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function can(k) { return !window.AdminPerm || window.AdminPerm.can(k); }
  var READONLY = !can('homepage.edit');
  var MAX = BOOT.max_slides || 12;
  var keySeq = 0;
  function newKey() { keySeq += 1; return 'k' + keySeq; }

  /* ---------------------------------------------------------------- CSS helpers (same output as HeroSupport.php) */
  function clamp(v, a, b) { v = Number(v); if (isNaN(v)) v = a; return Math.max(a, Math.min(b, v)); }
  function hexRgb(h) {
    h = String(h || '#000000').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (!/^[0-9a-fA-F]{6}$/.test(h)) h = '000000';
    return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
  }
  function rgba(hex, alpha) {
    var c = hexRgb(hex), a = String(parseFloat((clamp(alpha, 0, 100) / 100).toFixed(2)));
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
  }
  function gradientCss(g) {
    var stops = ((g && g.stops) || []).slice().sort(function (a, b) { return (a.pos || 0) - (b.pos || 0); });
    var parts = stops.map(function (s) { return rgba(s.color, s.alpha == null ? 100 : s.alpha) + ' ' + String(parseFloat(Number(s.pos || 0).toFixed(1))) + '%'; });
    if (parts.length < 2) parts = ['rgba(12,120,69,1) 0%', 'rgba(255,112,0,1) 100%'];
    if (g && g.type === 'radial') return 'radial-gradient(ellipse at 50% 50%, ' + parts.join(', ') + ')';
    return 'linear-gradient(' + parseInt(g && g.angle != null ? g.angle : 180, 10) + 'deg, ' + parts.join(', ') + ')';
  }
  function overlayCss(ov) {
    if (!ov) return '';
    if (ov.mode === 'color') return 'background:' + rgba(ov.color, ov.opacity == null ? 40 : ov.opacity);
    if (ov.mode === 'gradient') return 'background:' + gradientCss(ov.gradient);
    return '';
  }
  function titleHtml(t) {
    return esc(String(t || '')).replace(/\[\[([\s\S]+?)\]\]/g, '<span class="hs-accent">$1</span>').replace(/\r?\n/g, '<br>');
  }
  window.HeroCss = { rgba: rgba, gradientCss: gradientCss, overlayCss: overlayCss, titleHtml: titleHtml };

  /* ---------------------------------------------------------------- state */
  var state = { settings: clone(BOOT.settings), slides: clone(BOOT.slides), sel: 0, tab: 'content', device: 'desktop', errs: {}, saved: !!BOOT.saved, busy: false };
  state.slides.forEach(function (s) { s._k = newKey(); });
  var snap = '';
  function payload() {
    return { settings: clone(state.settings), slides: state.slides.map(function (s) { var c = clone(s); delete c._k; return c; }) };
  }
  function takeSnap() { snap = JSON.stringify(payload()); }
  function isChanged() { return JSON.stringify(payload()) !== snap; }
  function isDirty() { return isChanged() || !state.saved; }
  takeSnap();
  function cur() { return state.slides[state.sel]; }
  function getp(o, p) { return p.split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function setp(o, p, v) { var ks = p.split('.'), last = ks.pop(); var t = ks.reduce(function (a, k) { if (a[k] == null || typeof a[k] !== 'object') a[k] = {}; return a[k]; }, o); t[last] = v; }

  var LIMITS = { video_kb: 0 };
  function loadLimits() { DB.api('GET', '/admin/editor/limits').then(function (r) { if (r && r.data) { LIMITS = r.data; renderEditor(); } }, function () {}); }

  var elList = $('#hr-slides'), elGlobal = $('#hr-global'), elEditor = $('#hr-editor'), elPrev = $('#hr-prev'), elBar = $('#hr-bar'), elState = $('#hr-state');
  if (!elList || !elEditor || !elGlobal) return;

  var ICONS = ['play_arrow', 'photo_library', 'arrow_back', 'arrow_forward', 'volunteer_activism', 'favorite', 'info', 'mail', 'call', 'download', 'visibility', 'map', 'handshake', 'newspaper', 'event', 'campaign'];
  var PALETTE = [['#0C7845', 'أخضر الشعار'], ['#FF7000', 'برتقالي الشعار'], ['#2B2B2B', 'رمادي داكن'], ['#FFFFFF', 'أبيض'], ['#DEDEDE', 'رمادي فاتح']];
  var PRESETS = [
    { n: 'أخضر ← برتقالي', g: { type: 'linear', angle: 135, stops: [{ color: '#0C7845', alpha: 100, pos: 0 }, { color: '#FF7000', alpha: 100, pos: 100 }] } },
    { n: 'أخضر شفاف من الأسفل', g: { type: 'linear', angle: 0, stops: [{ color: '#0C7845', alpha: 85, pos: 0 }, { color: '#0C7845', alpha: 0, pos: 60 }] } },
    { n: 'رمادي داكن من الأسفل', g: { type: 'linear', angle: 0, stops: [{ color: '#2B2B2B', alpha: 70, pos: 0 }, { color: '#2B2B2B', alpha: 0, pos: 65 }] } },
    { n: 'رمادي فاتح من اليمين', g: { type: 'linear', angle: 270, stops: [{ color: '#DEDEDE', alpha: 92, pos: 0 }, { color: '#E8E2DC', alpha: 80, pos: 35 }, { color: '#E4E4E4', alpha: 25, pos: 65 }, { color: '#E2E2E2', alpha: 0, pos: 100 }] } },
    { n: 'هالة خضراء', g: { type: 'radial', angle: 0, stops: [{ color: '#0C7845', alpha: 0, pos: 30 }, { color: '#0C7845', alpha: 70, pos: 100 }] } }
  ];

  /* ---------------------------------------------------------------- errors / validation */
  function errFor(path) { return state.errs['slides.' + state.sel + '.' + path] || state.errs[path] || ''; }
  function errHtml(path) { var m = errFor(path); return m ? '<p class="hr-err" role="alert">' + esc(m) + '</p>' : ''; }
  var URL_OK = /^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[+0-9\-\s()]+|\/(?!\/)[^\s]*|#[^\s]*)$/i;
  function urlOk(v) { v = String(v || '').trim(); return URL_OK.test(v) || (!/:/.test(v) && !/^\/\//.test(v) && /^[A-Za-z0-9_\-.\/?=&%#]+$/.test(v)); }
  function validate() {
    var e = {};
    if (!state.slides.length) e.slides = 'يجب أن تبقى شريحة واحدة على الأقل.';
    var iv = Number(state.settings.interval);
    if (!(iv >= 2 && iv <= 60)) e['settings.interval'] = 'مدة التبديل بين 2 و60 ثانية.';
    state.slides.forEach(function (s, i) {
      var p = 'slides.' + i + '.', n = i + 1, c = s.content, bg = s.background;
      ['btn1', 'btn2'].forEach(function (k) {
        var b = c[k], nm = k === 'btn1' ? 'الزر الأول' : 'الزر الثاني';
        if (!b.visible) return;
        if (!String(b.label || '').trim()) e[p + 'content.' + k + '.label'] = 'اكتب نص ' + nm + ' أو أخفِه (الشريحة ' + n + ').';
        if (!urlOk(b.url)) e[p + 'content.' + k + '.url'] = 'رابط ' + nm + ' غير صالح. استخدم رابطاً كاملاً أو مساراً يبدأ بـ / أو #قسم (الشريحة ' + n + ').';
      });
      if (bg.type === 'image' && !urlOk(bg.image.url)) e[p + 'background.image.url'] = 'اختر صورة الخلفية للشريحة ' + n + ' أو غيّر نوع الخلفية.';
      if (bg.type === 'video') {
        if (!urlOk(bg.video.url)) e[p + 'background.video.url'] = 'أدخل رابط الفيديو أو ارفعه للشريحة ' + n + '.';
        if (bg.video.poster && !urlOk(bg.video.poster)) e[p + 'background.video.poster'] = 'رابط صورة الغلاف غير صالح (الشريحة ' + n + ').';
      }
    });
    return e;
  }

  /* ---------------------------------------------------------------- dirty bar */
  function updateBar() {
    var d = isDirty();
    if (elBar) elBar.hidden = !d;
    if (elState) {
      elState.innerHTML = d ? '<span class="material-symbols-outlined" aria-hidden="true">edit_note</span><span>تغييرات غير محفوظة</span>' : '<span class="material-symbols-outlined" aria-hidden="true">cloud_done</span><span>محفوظة في قاعدة البيانات</span>';
      elState.classList.toggle('is-dirty', d);
    }
    ['#hr-save', '#hr-save2'].forEach(function (s) { var b = $(s); if (b) b.disabled = state.busy || !d || READONLY; });
    ['#hr-revert', '#hr-revert2'].forEach(function (s) { var b = $(s); if (b) b.disabled = state.busy || !isChanged() || READONLY; });
  }

  /* ---------------------------------------------------------------- slide list */
  function bgThumb(s) {
    var bg = s.background, st = 'background-color:' + (bg.color || '#d9d6d2') + ';';
    if (bg.type === 'gradient') st = 'background:' + gradientCss(bg.gradient) + ';';
    else if (bg.type === 'image' && bg.image.url) st += 'background-image:url(\'' + bg.image.url + '\');background-size:cover;background-position:' + bg.focus_x + '% ' + bg.focus_y + '%;';
    else if (bg.type === 'video' && bg.video.poster) st += 'background-image:url(\'' + bg.video.poster + '\');background-size:cover;background-position:center;';
    else if (bg.type === 'video') st = 'background:#2B2B2B;';
    return st;
  }
  var TYPE_ICON = { image: 'image', video: 'movie', color: 'palette', gradient: 'gradient' };
  function renderList() {
    var h = '';
    state.slides.forEach(function (s, i) {
      var title = (s.content.title || '').replace(/\[\[|\]\]/g, '').replace(/\s+/g, ' ').trim();
      var bad = Object.keys(state.errs).some(function (k) { return k.indexOf('slides.' + i + '.') === 0; });
      h += '<li class="hr-item' + (i === state.sel ? ' is-sel' : '') + (s.is_visible ? '' : ' is-off') + (bad ? ' has-err' : '') + '" data-i="' + i + '" draggable="' + (READONLY ? 'false' : 'true') + '">' +
        '<span class="hr-handle" aria-hidden="true" title="اسحب لتغيير الترتيب"><span class="material-symbols-outlined">drag_indicator</span></span>' +
        '<button type="button" class="hr-pick" data-op="select" data-i="' + i + '" aria-pressed="' + (i === state.sel) + '" aria-label="تعديل الشريحة ' + (i + 1) + '">' +
          '<span class="hr-thumb" style="' + esc(bgThumb(s)) + '"><span class="material-symbols-outlined" aria-hidden="true">' + TYPE_ICON[s.background.type] + '</span></span>' +
          '<span class="hr-meta"><strong>' + (i + 1) + '. ' + esc(s.label || 'شريحة ' + (i + 1)) + '</strong><small>' + esc(title || 'بدون عنوان') + '</small></span>' +
        '</button>' +
        '<span class="hr-ops">' +
          '<button type="button" class="switch" role="switch" aria-checked="' + !!s.is_visible + '" data-op="vis" data-i="' + i + '" aria-label="' + (s.is_visible ? 'إخفاء' : 'إظهار') + ' الشريحة ' + (i + 1) + '" title="' + (s.is_visible ? 'ظاهرة — اضغط للإخفاء' : 'مخفية — اضغط للإظهار') + '"></button>' +
          '<button type="button" class="icon-btn sm" data-op="up" data-i="' + i + '" aria-label="تحريك للأعلى"' + (i === 0 ? ' disabled' : '') + '><span class="material-symbols-outlined" aria-hidden="true">arrow_upward</span></button>' +
          '<button type="button" class="icon-btn sm" data-op="down" data-i="' + i + '" aria-label="تحريك للأسفل"' + (i === state.slides.length - 1 ? ' disabled' : '') + '><span class="material-symbols-outlined" aria-hidden="true">arrow_downward</span></button>' +
          '<button type="button" class="icon-btn sm" data-op="dup" data-i="' + i + '" aria-label="تكرار الشريحة"><span class="material-symbols-outlined" aria-hidden="true">content_copy</span></button>' +
          '<button type="button" class="icon-btn sm" data-op="del" data-i="' + i + '" aria-label="حذف الشريحة"><span class="material-symbols-outlined" aria-hidden="true">delete</span></button>' +
        '</span></li>';
    });
    elList.innerHTML = h;
    var add = $('#hr-add');
    if (add) { add.disabled = READONLY || state.slides.length >= MAX; add.title = state.slides.length >= MAX ? 'الحد الأقصى ' + MAX + ' شريحة' : ''; }
    var cnt = $('#hr-count');
    if (cnt) cnt.textContent = state.slides.length + ' / ' + MAX + ' • ' + state.slides.filter(function (s) { return s.is_visible; }).length + ' ظاهرة';
    if (READONLY) $$('[data-op="vis"],[data-op="up"],[data-op="down"],[data-op="dup"],[data-op="del"]', elList).forEach(function (b) { b.disabled = true; });
  }
  function touch(rerender) {
    updateBar(); renderPreview(); renderList();
    if (rerender) renderEditor();
  }
  function selectSlide(i) { if (i < 0 || i >= state.slides.length) return; state.sel = i; renderList(); renderEditor(); renderPreview(); }
  function move(from, to) {
    if (to < 0 || to >= state.slides.length || from === to) return;
    var s = state.slides.splice(from, 1)[0];
    state.slides.splice(to, 0, s);
    state.errs = {};
    state.sel = to;
    touch(true);
  }
  function addSlide() {
    if (state.slides.length >= MAX) { U.toast('وصلت للحد الأقصى', { text: 'الحد الأقصى ' + MAX + ' شريحة.', tone: 'info', icon: 'info' }); return; }
    var s = clone(BOOT.blank); s.id = null; s._k = newKey(); s.is_visible = true; s.label = 'شريحة ' + (state.slides.length + 1);
    state.slides.push(s); state.sel = state.slides.length - 1; state.tab = 'content'; state.errs = {};
    touch(true);
    U.toast('تمت إضافة شريحة جديدة', { text: 'عدّل محتواها ثم اضغط «حفظ التغييرات».' });
  }
  function dupSlide(i) {
    if (state.slides.length >= MAX) { U.toast('وصلت للحد الأقصى', { text: 'الحد الأقصى ' + MAX + ' شريحة.', tone: 'info', icon: 'info' }); return; }
    var s = clone(state.slides[i]); s.id = null; s._k = newKey(); s.label = (s.label || 'شريحة') + ' (نسخة)';
    state.slides.splice(i + 1, 0, s); state.sel = i + 1; state.errs = {};
    touch(true);
  }
  function delSlide(i) {
    if (state.slides.length <= 1) { U.toast('لا يمكن حذف الشريحة الأخيرة', { text: 'أخفِها بدل حذفها إن لم تُرد عرضها.', tone: 'info', icon: 'info' }); return; }
    U.confirmDelete('الشريحة «' + (state.slides[i].label || (i + 1)) + '»', 'ستُحذف الشريحة نهائياً عند الحفظ، ويمكنك التراجع قبل الحفظ بزر «تراجع».').then(function (ok) {
      if (!ok) return;
      state.slides.splice(i, 1);
      state.sel = Math.min(state.sel, state.slides.length - 1);
      state.errs = {};
      touch(true);
    });
  }
  elList.addEventListener('click', function (e) {
    var b = e.target.closest('[data-op]'); if (!b || b.disabled) return;
    var i = parseInt(b.getAttribute('data-i'), 10), op = b.getAttribute('data-op');
    if (op === 'select') selectSlide(i);
    else if (op === 'vis') { state.slides[i].is_visible = !state.slides[i].is_visible; touch(i === state.sel && state.tab === 'display'); }
    else if (op === 'up') move(i, i - 1);
    else if (op === 'down') move(i, i + 1);
    else if (op === 'dup') dupSlide(i);
    else if (op === 'del') delSlide(i);
  });
  (function dnd() {
    var drag = null;
    elList.addEventListener('dragstart', function (e) {
      var li = e.target.closest ? e.target.closest('li[data-i]') : null; if (!li || READONLY) return;
      drag = parseInt(li.getAttribute('data-i'), 10);
      if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(drag)); } catch (x) { /* ignore */ } }
      li.classList.add('is-drag');
    });
    elList.addEventListener('dragover', function (e) {
      if (drag === null) return;
      e.preventDefault();
      var li = e.target.closest('li[data-i]'); $$('.drop-before,.drop-after', elList).forEach(function (x) { x.classList.remove('drop-before', 'drop-after'); });
      if (!li) return;
      var r = li.getBoundingClientRect(), after = r.height ? (e.clientY - r.top) > r.height / 2 : false;
      li.classList.add(after ? 'drop-after' : 'drop-before'); li._after = after;
    });
    elList.addEventListener('drop', function (e) {
      if (drag === null) return;
      e.preventDefault();
      var li = e.target.closest('li[data-i]'); if (!li) { drag = null; return; }
      var to = parseInt(li.getAttribute('data-i'), 10); if (li._after) to += 1;
      var from = drag; drag = null;
      if (from < to) to -= 1;
      move(from, to);
    });
    elList.addEventListener('dragend', function () { drag = null; renderList(); });
  })();

  /* ---------------------------------------------------------------- global settings */
  function sw(attr, path, on, label, extra) {
    var id = 'hrs-' + path.replace(/\./g, '-');
    return '<div class="hr-sw"><span id="' + id + '-l">' + label + '</span><button type="button" class="switch" role="switch" id="' + id + '" aria-checked="' + !!on + '" aria-labelledby="' + id + '-l" ' + attr + '="' + path + '" data-kind="bool"' + (extra || '') + '></button></div>';
  }
  function renderGlobal() {
    var g = state.settings, h = '';
    h += sw('data-g', 'enabled', g.enabled, 'إظهار الهيرو في الصفحة الرئيسية');
    h += '<div class="field"><label class="label" for="hrg-height_mode">ارتفاع الهيرو</label><select class="select" id="hrg-height_mode" data-g="height_mode">' +
      [['full', 'ملء الشاشة (100%)'], ['70vh', '70% من ارتفاع الشاشة'], ['custom', 'ارتفاع مخصص']].map(function (o) { return '<option value="' + o[0] + '"' + (g.height_mode === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>';
    if (g.height_mode === 'custom') {
      h += '<div class="field-row"><div class="field"><label class="label" for="hrg-height_value">القيمة</label><input class="input" type="number" id="hrg-height_value" data-g="height_value" data-kind="num" min="' + (g.height_unit === 'px' ? 320 : 30) + '" max="' + (g.height_unit === 'px' ? 1600 : 100) + '" value="' + esc(g.height_value) + '"></div>' +
        '<div class="field"><label class="label" for="hrg-height_unit">الوحدة</label><select class="select" id="hrg-height_unit" data-g="height_unit"><option value="vh"' + (g.height_unit === 'vh' ? ' selected' : '') + '>% من الشاشة</option><option value="px"' + (g.height_unit === 'px' ? ' selected' : '') + '>بكسل</option></select></div></div>' +
        errHtml('settings.height_value');
    }
    h += '<p class="hint">الهيرو يتمدّد تلقائياً إن احتاج محتواه مساحة أكبر.</p><div class="hr-sep"></div>';
    h += sw('data-g', 'autoplay', g.autoplay, 'التبديل التلقائي بين الشرائح');
    h += '<div class="field"><label class="label" for="hrg-interval">مدة عرض الشريحة (ثوانٍ)</label><input class="input" type="number" id="hrg-interval" data-g="interval" data-kind="num" min="2" max="60" value="' + esc(g.interval) + '"' + (g.autoplay ? '' : ' disabled') + '><p class="hint">تُستخدم للشرائح التي مدّتها «تلقائي». يمكن تخصيص مدة لكل شريحة.</p>' + errHtml('settings.interval') + '</div>';
    h += sw('data-g', 'loop', g.loop, 'التكرار من البداية بعد آخر شريحة');
    h += sw('data-g', 'pause_hover', g.pause_hover, 'إيقاف التبديل عند وقوف المؤشر على الهيرو');
    h += '<div class="hr-sep"></div>';
    h += sw('data-g', 'arrows', g.arrows, 'إظهار أسهم التنقل');
    h += sw('data-g', 'dots', g.dots, 'إظهار النقاط السفلية');
    h += sw('data-g', 'scroll_hint', g.scroll_hint, 'مؤشر «استكشف» في أسفل الهيرو');
    h += '<div class="hr-sep"></div>';
    h += sw('data-g', 'theme_follow', g.theme_follow !== false, 'اتباع «مظهر الموقع» في ألوان الهيرو');
    h += '<p class="hint">عند التفعيل: الألوان التي لم تغيّرها في الشرائح (الأخضر والبرتقالي الافتراضيان) تتبع قالب الموقع وتدرّجه من «الإعدادات ← مظهر الموقع»، والألوان التي تختارها هنا تبقى كما هي. عند الإيقاف يبقى الهيرو بألوانه الحالية دون أي تأثّر. المعاينة هنا تعرض ألوان الهيرو المحفوظة فقط.</p><div class="hr-sep"></div>';
    h += '<div class="field"><span class="label" id="hrg-tr-l">نوع الانتقال</span><div class="seg" role="group" aria-labelledby="hrg-tr-l" data-g="transition" data-kind="seg">' +
      [['fade', 'تلاشٍ'], ['slide', 'انزلاق']].map(function (o) { return '<button type="button" data-v="' + o[0] + '" aria-pressed="' + (g.transition === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div></div>';
    h += '<div class="field"><label class="label" for="hrg-speed">سرعة الانتقال <output class="hr-out" data-out="speed">' + (g.speed / 1000).toFixed(1) + ' ث</output></label><input type="range" id="hrg-speed" data-g="speed" data-kind="num" data-fmt="sec" min="200" max="3000" step="100" value="' + esc(g.speed) + '"></div>';
    elGlobal.innerHTML = h;
    if (READONLY) $$('input,select,button', elGlobal).forEach(function (x) { x.disabled = true; });
  }

  /* ---------------------------------------------------------------- editor fields */
  function fid(path) { return 'hrf-' + path.replace(/\./g, '-'); }
  function val(path) { var v = getp(cur(), path); return v == null ? '' : v; }
  function field(label, inner, path, hint, id, cls) { return '<div class="field' + (cls ? ' ' + cls : '') + '"><label class="label"' + (id ? ' for="' + id + '"' : '') + '>' + label + '</label>' + inner + (hint ? '<p class="hint">' + hint + '</p>' : '') + (path ? errHtml(path) : '') + '</div>'; }
  function text(path, label, o) {
    o = o || {};
    var id = fid(path), v = val(path);
    return field(label, (o.area ? '<textarea class="textarea" rows="' + (o.rows || 3) + '"' : '<input class="input" type="text"') + ' id="' + id + '" data-k="' + path + '" maxlength="' + (o.max || 300) + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.dir ? ' dir="' + o.dir + '"' : '') + (o.list ? ' list="' + o.list + '"' : '') + (o.area ? '>' + esc(v) + '</textarea>' : ' value="' + esc(v) + '">'), path, o.hint, id, o.cls);
  }
  function fmtOut(v, fmt) { return fmt === 'pct' ? v + '%' : fmt === 'deg' ? v + '°' : fmt === 'sec' ? (v / 1000).toFixed(1) + ' ث' : String(v); }
  function range(path, label, min, max, step, fmt) {
    var id = fid(path), v = val(path);
    return '<div class="field"><label class="label" for="' + id + '">' + label + ' <output class="hr-out" data-out="' + path + '">' + fmtOut(v, fmt) + '</output></label><input type="range" id="' + id + '" data-k="' + path + '" data-kind="num" data-fmt="' + (fmt || '') + '" min="' + min + '" max="' + max + '" step="' + (step || 1) + '" value="' + esc(v) + '"></div>';
  }
  function color(path, label) {
    var id = fid(path), v = val(path) || '#000000';
    var chips = '<span class="hr-chips">' + PALETTE.map(function (p) { return '<button type="button" class="hr-chip" data-pal="' + path + '" data-v="' + p[0] + '" style="background:' + p[0] + '" aria-label="' + p[1] + '" title="' + p[1] + '"></button>'; }).join('') + '</span>';
    return '<div class="field"><label class="label" for="' + id + '">' + label + '</label><div class="hr-color"><input type="color" id="' + id + '" data-k="' + path + '" data-kind="color" value="' + esc(String(v).toLowerCase()) + '"><input class="input sm" type="text" dir="ltr" maxlength="7" data-k="' + path + '" data-kind="color" value="' + esc(v) + '" aria-label="' + label + ' (رمز اللون)">' + chips + '</div>' + errHtml(path) + '</div>';
  }
  function toggle(path, label, rerender) {
    var id = fid(path), v = !!val(path);
    return '<div class="hr-sw"><span id="' + id + '-l">' + label + '</span><button type="button" class="switch" role="switch" id="' + id + '" aria-checked="' + v + '" aria-labelledby="' + id + '-l" data-k="' + path + '" data-kind="bool"' + (rerender ? ' data-rerender="1"' : '') + '></button></div>';
  }
  function seg(path, label, opts, rerender) {
    var v = val(path), id = fid(path);
    return '<div class="field"><span class="label" id="' + id + '-l">' + label + '</span><div class="seg" role="group" aria-labelledby="' + id + '-l" data-k="' + path + '" data-kind="seg"' + (rerender ? ' data-rerender="1"' : '') + '>' +
      opts.map(function (x) { return '<button type="button" data-v="' + x[0] + '" aria-pressed="' + (v === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div>' + errHtml(path) + '</div>';
  }
  function selectField(path, label, opts, extra) {
    var v = val(path), id = fid(path);
    return field(label, '<select class="select" id="' + id + '" data-k="' + path + '">' + opts.map(function (x) { return '<option value="' + x[0] + '"' + (String(v) === x[0] ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</select>' + (extra || ''), path, '', id);
  }
  /* hint under "background.fit": shown only when the choice is not "cover" */
  function fitHintText(bg) {
    if (!bg || bg.fit !== 'contain') return '';
    return 'بهذا الخيار ' + (bg.type === 'video' ? 'يظهر الفيديو كاملاً' : 'تظهر الصورة كاملة') + ' بدون أي قص، لكن إذا كان ' + (bg.type === 'video' ? 'قياسه' : 'قياسها') + ' يختلف عن قياس الهيرو قد تظهر مساحات فارغة على الجانبين أو في الأعلى والأسفل' +
      (bg.type === 'video' ? ' (تظهر فيها صورة الغلاف إن وُجدت، وإلا لون الخلفية).' : ' (يظهر فيها لون خلفية الشريحة).') +
      ' لتفادي هذه المساحات ارجع إلى «ملء كامل المساحة (قص الأطراف)».';
  }
  function fitHintHtml(bg) {
    var t = fitHintText(bg);
    return '<p class="hint" id="hr-fit-hint" role="status"' + (t ? '' : ' hidden') + '>' + t + '</p>';
  }
  function updateFitHint() {
    var el = document.getElementById('hr-fit-hint'), c = cur();
    if (!el || !c) return;
    var t = fitHintText(c.background);
    el.textContent = t; el.hidden = !t;
  }

  /* gradient builder (background.gradient / background.overlay.gradient) */
  function gradBuilder(path) {
    var g = getp(cur(), path) || { type: 'linear', angle: 180, stops: [] };
    var h = '<div class="gb" data-gb="' + path + '">';
    h += '<div class="gb-prev" style="background:' + gradientCss(g) + '" aria-label="معاينة التدرّج" role="img"></div>';
    h += '<div class="gb-row"><div class="seg" role="group" aria-label="نوع التدرّج" data-gb-type="' + path + '">' +
      [['linear', 'خطي'], ['radial', 'دائري']].map(function (o) { return '<button type="button" data-v="' + o[0] + '" aria-pressed="' + (g.type === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>';
    if (g.type === 'linear') {
      h += '<label class="gb-angle"><span>الزاوية</span><input type="range" min="0" max="360" step="1" value="' + g.angle + '" data-gb-angle="' + path + '" aria-label="زاوية التدرّج"><input class="input sm" type="number" min="0" max="360" value="' + g.angle + '" data-gb-angle="' + path + '" aria-label="زاوية التدرّج بالدرجات"><span>°</span></label>';
    }
    h += '</div>';
    if (g.type === 'linear') h += '<p class="hint">0° = من الأسفل إلى الأعلى • 90° = من اليسار إلى اليمين • 180° = من الأعلى إلى الأسفل • 270° = من اليمين إلى اليسار.</p>';
    h += '<div class="gb-stops">';
    g.stops.forEach(function (s, i) {
      h += '<div class="gb-stop" data-si="' + i + '"><span class="gb-n">' + (i + 1) + '</span>' +
        '<input type="color" value="' + esc(String(s.color).toLowerCase()) + '" data-gb-stop="' + path + '" data-si="' + i + '" data-f="color" aria-label="لون النقطة ' + (i + 1) + '">' +
        '<label class="gb-f"><span>الكثافة</span><input type="range" min="0" max="100" value="' + s.alpha + '" data-gb-stop="' + path + '" data-si="' + i + '" data-f="alpha" aria-label="كثافة لون النقطة ' + (i + 1) + '"><output>' + s.alpha + '%</output></label>' +
        '<label class="gb-f"><span>الموضع</span><input class="input sm" type="number" min="0" max="100" value="' + s.pos + '" data-gb-stop="' + path + '" data-si="' + i + '" data-f="pos" aria-label="موضع النقطة ' + (i + 1) + '"><span>%</span></label>' +
        '<button type="button" class="icon-btn sm" data-gb-act="rm" data-gb="' + path + '" data-si="' + i + '" aria-label="حذف النقطة ' + (i + 1) + '"' + (g.stops.length <= 2 ? ' disabled' : '') + '><span class="material-symbols-outlined" aria-hidden="true">close</span></button></div>';
    });
    h += '</div><div class="gb-act">' +
      '<button type="button" class="btn btn-secondary btn-sm" data-gb-act="add" data-gb="' + path + '"' + (g.stops.length >= 4 ? ' disabled' : '') + '><span class="material-symbols-outlined" aria-hidden="true">add</span>نقطة لونية</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-gb-act="rev" data-gb="' + path + '"><span class="material-symbols-outlined" aria-hidden="true">swap_horiz</span>عكس</button></div>';
    h += '<div class="gb-presets"><span class="muted">قوالب جاهزة:</span>' + PRESETS.map(function (p, i) { return '<button type="button" class="hr-preset" data-gb-act="preset" data-gb="' + path + '" data-pi="' + i + '"><span class="hr-preset-sw" style="background:' + gradientCss(p.g) + '"></span>' + p.n + '</button>'; }).join('') + '</div>';
    return h + '</div>';
  }

  var TABS = [['content', 'المحتوى', 'edit_note'], ['style', 'النص والموضع', 'format_align_right'], ['bg', 'الخلفية', 'wallpaper'], ['overlay', 'التراكب', 'layers'], ['display', 'العرض والتوقيت', 'schedule']];

  function btnCard(k, title) {
    var b = cur().content[k], p = 'content.' + k + '.';
    var h = '<fieldset class="hr-btn"><legend>' + title + '</legend>' + toggle(p + 'visible', 'إظهار الزر', true);
    if (b.visible) {
      h += '<div class="field-row">' + text(p + 'label', 'نص الزر', { max: 60 }) + text(p + 'url', 'الرابط', { max: 500, dir: 'ltr', ph: '#about أو /projects أو https://…' }) + '</div>';
      h += '<div class="field-row">' + selectField(p + 'style', 'شكل الزر', [['gold', 'برتقالي مصمت (رئيسي)'], ['glass', 'شفاف بإطار أخضر'], ['green', 'أخضر مصمت'], ['white', 'أبيض']]) + text(p + 'icon', 'أيقونة (اختياري)', { max: 40, dir: 'ltr', list: 'hr-icons', ph: 'play_arrow' }) + '</div>';
      h += toggle(p + 'new_tab', 'فتح الرابط في نافذة جديدة');
    }
    return h + '</fieldset>';
  }
  function panelContent() {
    return '<div class="hr-grid">' +
      text('label', 'اسم الشريحة (للإدارة فقط)', { max: 150 }) +
      '<div class="field-row">' + text('content.badge', 'الشارة الصغيرة (نص أول)', { max: 120, hint: 'تظهر داخل كبسولة مع نقطة نابضة.' }) + text('content.badge2', 'نص الشارة الثاني', { max: 120 }) + '</div>' +
      text('content.eyebrow', 'العنوان الصغير فوق العنوان الرئيسي', { max: 120 }) +
      text('content.title', 'العنوان الرئيسي', { area: true, rows: 3, max: 300, hint: 'سطر جديد = سطر جديد في العنوان. ضع الكلمات المميّزة بين <bdi dir="ltr">[[ ]]</bdi> لتظهر بلون التمييز (البرتقالي افتراضياً).' }) +
      text('content.subtitle', 'الوصف', { area: true, rows: 4, max: 800 }) +
      btnCard('btn1', 'الزر الأول') + btnCard('btn2', 'الزر الثاني') +
      '<datalist id="hr-icons">' + ICONS.map(function (i) { return '<option value="' + i + '">'; }).join('') + '</datalist></div>';
  }
  function posGrid() {
    var s = cur().style, rows = [['top', 'أعلى'], ['middle', 'وسط'], ['bottom', 'أسفل']], cols = [['right', 'يمين'], ['center', 'وسط'], ['left', 'يسار']];
    var h = '<div class="hr-pos" role="group" aria-label="موضع النص داخل الهيرو">';
    rows.forEach(function (r) { cols.forEach(function (c) {
      var on = s.v === r[0] && s.h === c[0];
      h += '<button type="button" class="hr-pos-cell" data-pos-v="' + r[0] + '" data-pos-h="' + c[0] + '" aria-pressed="' + on + '" aria-label="' + r[1] + ' ' + c[1] + '"><i></i></button>';
    }); });
    return h + '</div>';
  }
  function panelStyle() {
    return '<div class="hr-grid"><div class="field"><span class="label">موضع النص في الهيرو</span>' + posGrid() + '<p class="hint">9 مواضع: أعلى/وسط/أسفل × يمين/وسط/يسار.</p></div>' +
      seg('style.align', 'محاذاة النص داخل الصندوق', [['right', 'يمين'], ['center', 'وسط'], ['left', 'يسار']]) +
      '<div class="field-row">' + color('style.title_color', 'لون العنوان') + color('style.text_color', 'لون الوصف') + '</div>' +
      '<div class="field-row">' + color('style.eyebrow_color', 'لون الشارة والعنوان الصغير') + color('style.accent_color', 'لون التمييز داخل العنوان') + '</div>' +
      '<div class="field-row">' + range('style.title_size', 'حجم العنوان', 50, 200, 5, 'pct') + range('style.text_size', 'حجم الوصف والعناوين الصغيرة', 50, 200, 5, 'pct') + '</div>' +
      '<p class="hint">ألوان الشعار: أخضر داكن وبرتقالي. استخدم الرمادي #2B2B2B أو الأبيض حسب لون الخلفية.</p></div>';
  }
  function focusBox() {
    var bg = cur().background, u = bg.type === 'image' ? bg.image.url : bg.video.poster;
    return '<div class="hr-focus" data-focus style="' + (u ? 'background-image:url(\'' + esc(u) + '\')' : '') + '" role="button" tabindex="0" aria-label="اضغط لتحديد النقطة المحورية">' + (u ? '' : '<span class="muted">لا توجد صورة</span>') +
      '<i class="hr-focus-dot" style="left:' + bg.focus_x + '%;top:' + bg.focus_y + '%"></i></div>';
  }
  function panelBg() {
    var bg = cur().background, t = bg.type;
    var h = '<div class="hr-grid">' + seg('background.type', 'نوع الخلفية', [['image', 'صورة'], ['video', 'فيديو'], ['color', 'لون'], ['gradient', 'تدرّج لوني']], true);
    if (t === 'image') {
      h += '<div class="field"><span class="label">صورة الخلفية</span><div class="hr-pickrow"><button type="button" class="btn btn-secondary btn-sm" data-act="lib" data-target="image"><span class="material-symbols-outlined" aria-hidden="true">photo_library</span>من مكتبة الوسائط</button>' +
        '<button type="button" class="btn btn-secondary btn-sm" data-act="up-img" data-target="image"><span class="material-symbols-outlined" aria-hidden="true">upload</span>رفع صورة</button></div>' +
        text('background.image.url', 'أو رابط الصورة', { max: 500, dir: 'ltr', ph: '/storage/uploads/…', cls: 'mt-8' }) + '</div>';
    } else if (t === 'video') {
      var lim = LIMITS.video_kb ? 'الحد الأقصى للرفع على هذا الخادم: ' + (Math.round(LIMITS.video_kb / 102.4) / 10) + ' ميغابايت. للملفات الأكبر ضع رابط الملف مباشرة. ' : '';
      h += '<div class="field"><span class="label">ملف الفيديو (MP4 أو WebM)</span><div class="hr-pickrow"><button type="button" class="btn btn-secondary btn-sm" data-act="up-vid"><span class="material-symbols-outlined" aria-hidden="true">upload</span>رفع فيديو</button></div>' +
        text('background.video.url', 'رابط الفيديو', { max: 500, dir: 'ltr', ph: '/assets/site/img/video/hero.mp4', cls: 'mt-8', hint: lim + 'يُشغَّل تلقائياً بدون صوت وبتكرار دائم.' }) + '</div>' +
        '<div class="field"><span class="label">صورة الغلاف (poster) — تظهر قبل بدء الفيديو</span><div class="hr-pickrow"><button type="button" class="btn btn-secondary btn-sm" data-act="lib" data-target="poster"><span class="material-symbols-outlined" aria-hidden="true">photo_library</span>من المكتبة</button>' +
        '<button type="button" class="btn btn-secondary btn-sm" data-act="up-img" data-target="poster"><span class="material-symbols-outlined" aria-hidden="true">upload</span>رفع صورة</button></div>' +
        text('background.video.poster', 'رابط صورة الغلاف', { max: 500, dir: 'ltr', cls: 'mt-8' }) + '</div>';
    } else if (t === 'color') {
      h += color('background.color', 'لون الخلفية');
    } else {
      h += '<div class="field"><span class="label">تدرّج الخلفية</span>' + gradBuilder('background.gradient') + errHtml('background.gradient') + '</div>';
    }
    if (t === 'image' || t === 'video') {
      h += '<div class="hr-sep"></div><div class="field-row">' + selectField('background.fit', 'طريقة احتواء الوسائط', [['cover', 'ملء كامل المساحة (قص الأطراف)'], ['contain', 'عرض كامل بدون قص']], fitHintHtml(cur().background)) +
        range('background.zoom', 'التقريب (Zoom)', 100, 250, 5, 'pct') + '</div>';
      h += '<div class="field-row"><div class="field"><span class="label">النقطة المحورية (الجزء الذي يبقى ظاهراً)</span>' + focusBox() + '</div><div>' +
        range('background.focus_x', 'أفقياً', 0, 100, 1, 'pct') + range('background.focus_y', 'عمودياً', 0, 100, 1, 'pct') + '</div></div>';
      h += range('background.grayscale', 'تدرّج الرمادي (0% = ألوان طبيعية)', 0, 100, 5, 'pct');
      h += toggle('background.motion', 'حركة تقريب هادئة عند ظهور الشريحة');
    }
    return h + '</div>';
  }
  function panelOverlay() {
    var ov = cur().background.overlay, m = ov.mode;
    var h = '<div class="hr-grid"><p class="hr-note"><span class="material-symbols-outlined" aria-hidden="true">layers</span>طبقة واحدة فقط فوق الخلفية — بدون تأثيرات أو طبقات متراكبة. اختر «بدون» لإبقاء ألوان الصورة أو الفيديو كما هي.</p>' +
      seg('background.overlay.mode', 'نوع الطبقة', [['none', 'بدون'], ['color', 'لون واحد'], ['gradient', 'تدرّج']], true);
    if (m === 'color') {
      h += '<div class="field-row">' + color('background.overlay.color', 'لون الطبقة') + range('background.overlay.opacity', 'الشفافية (الكثافة)', 0, 100, 1, 'pct') + '</div>';
    } else if (m === 'gradient') {
      h += '<div class="field"><span class="label">تدرّج الطبقة (يمكن جعل أطرافه شفافة)</span>' + gradBuilder('background.overlay.gradient') + errHtml('background.overlay.gradient') + '</div>';
    }
    return h + '</div>';
  }
  function panelDisplay() {
    return '<div class="hr-grid">' + toggle('is_visible', 'الشريحة ظاهرة في الموقع') +
      '<div class="field"><label class="label" for="hrf-duration">مدة عرض هذه الشريحة (ثوانٍ)</label><input class="input" type="number" id="hrf-duration" data-k="duration" data-kind="num" min="0" max="120" value="' + esc(val('duration')) + '"><p class="hint">0 = تلقائي (' + esc(state.settings.interval) + ' ثوانٍ حسب الإعدادات العامة).</p></div>' +
      '<p class="hint">الشرائح المخفية تبقى محفوظة هنا ولا تظهر للزوار.</p></div>';
  }
  function tabOf(k) {
    var p = k.replace(/^slides\.\d+\./, '');
    if (p.indexOf('content.') === 0 || p === 'label') return 'content';
    if (p.indexOf('style.') === 0) return 'style';
    if (p.indexOf('background.overlay') === 0) return 'overlay';
    if (p.indexOf('background.') === 0) return 'bg';
    return 'display';
  }
  function renderEditor() {
    if (!cur()) { elEditor.innerHTML = ''; return; }
    var active = document.activeElement, fk = active && active.getAttribute ? (active.getAttribute('data-k') || active.id) : null;
    var scroll = elEditor.scrollTop;
    var tabs = '<div class="hr-tabs" role="tablist" aria-label="أقسام تعديل الشريحة">' + TABS.map(function (t) {
      var bad = Object.keys(state.errs).some(function (k) { return k.indexOf('slides.' + state.sel + '.') === 0 && tabOf(k) === t[0]; });
      return '<button type="button" role="tab" class="hr-tab" id="hrt-' + t[0] + '" aria-selected="' + (state.tab === t[0]) + '" data-tab="' + t[0] + '"><span class="material-symbols-outlined" aria-hidden="true">' + t[2] + '</span>' + t[1] + (bad ? '<i class="hr-dot-err" title="أخطاء"></i>' : '') + '</button>';
    }).join('') + '</div>';
    var body = state.tab === 'style' ? panelStyle() : state.tab === 'bg' ? panelBg() : state.tab === 'overlay' ? panelOverlay() : state.tab === 'display' ? panelDisplay() : panelContent();
    elEditor.innerHTML = '<div class="hr-edit-head"><h3>الشريحة ' + (state.sel + 1) + ' — ' + esc(cur().label || '') + '</h3></div>' + tabs + '<div class="hr-panel" role="tabpanel" aria-labelledby="hrt-' + state.tab + '">' + body + '</div>';
    elEditor.scrollTop = scroll;
    if (READONLY) $$('.hr-panel input,.hr-panel textarea,.hr-panel select,.hr-panel button', elEditor).forEach(function (x) { x.disabled = true; });
    if (fk) {
      var again = fk.indexOf('hrf-') === 0 || fk.indexOf('hrs-') === 0 ? document.getElementById(fk) : $('[data-k="' + fk + '"]', elEditor);
      if (again && again.focus && again !== document.activeElement) { try { again.focus(); } catch (x) { /* ignore */ } }
    }
  }

  /* ---------------------------------------------------------------- editor events */
  var REFRESH_LIST = /^(label|is_visible|content\.title|background\.)/;
  function applyVal(path, v, global) { if (global) setp(state.settings, path, v); else setp(cur(), path, v); }
  function afterChange(path, global, rerender) {
    var key = global ? 'settings.' + path : 'slides.' + state.sel + '.' + path;
    if (state.errs[key] || state.errs[path]) { delete state.errs[key]; delete state.errs[path]; }
    updateBar(); renderPreview();
    if (!global && path === 'background.fit') updateFitHint();
    if (!global && REFRESH_LIST.test(path)) renderList();
    if (global && /^(autoplay|height_mode|height_unit)$/.test(path)) renderGlobal();
    if (rerender) renderEditor();
  }
  function readCtl(el) {
    var kind = el.getAttribute('data-kind');
    if (kind === 'bool') return el.getAttribute('aria-checked') !== 'true';
    if (kind === 'num') { if (el.value === '') return null; var n = Number(el.value); return isNaN(n) ? null : n; }
    if (kind === 'color') { var c = String(el.value).trim(); if (c && c[0] !== '#') c = '#' + c; return c; }
    return el.value;
  }
  function onCtl(e, global) {
    var el = e.target.closest(global ? '[data-g]' : '[data-k]'); if (!el || el.disabled) return;
    var path = el.getAttribute(global ? 'data-g' : 'data-k'), kind = el.getAttribute('data-kind'), v;
    if (kind === 'seg') return;
    if (kind === 'bool') { if (e.type !== 'click') return; v = readCtl(el); el.setAttribute('aria-checked', String(v)); }
    else {
      if (e.type === 'click' || el.tagName === 'BUTTON') return;
      v = readCtl(el);
      if (v === null) return;
      if (kind === 'color' && !/^#[0-9a-fA-F]{6}$/.test(v)) return; // wait for a complete colour
      if (kind === 'num' && e.type === 'change') {
        var mn = el.getAttribute('min'), mx = el.getAttribute('max');
        if (mn !== null && mx !== null) v = clamp(v, Number(mn), Number(mx));
      }
    }
    applyVal(path, v, global);
    var scope = global ? elGlobal : elEditor;
    if (kind === 'color') $$('[data-' + (global ? 'g' : 'k') + '="' + path + '"]', scope).forEach(function (o) { if (o !== el) o.value = o.type === 'color' ? String(v).toLowerCase() : v; });
    var out = scope.querySelector('[data-out="' + path + '"]');
    if (out) out.textContent = fmtOut(v, el.getAttribute('data-fmt'));
    afterChange(path, global, el.hasAttribute('data-rerender'));
  }
  function onSeg(e, global) {
    var b = e.target.closest('.seg button[data-v]'); if (!b || b.disabled) return;
    var s = b.closest('[data-k],[data-g]'); if (!s) return;
    var path = s.getAttribute(global ? 'data-g' : 'data-k'); if (!path) return;
    $$('button', s).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    applyVal(path, b.getAttribute('data-v'), global);
    afterChange(path, global, s.hasAttribute('data-rerender'));
  }
  ['input', 'change', 'click'].forEach(function (t) {
    elEditor.addEventListener(t, function (e) { onCtl(e, false); });
    elGlobal.addEventListener(t, function (e) { onCtl(e, true); });
  });
  elGlobal.addEventListener('click', function (e) { onSeg(e, true); });

  function gradient(path) { return getp(cur(), path); }
  function gradAct(b) {
    var path = b.getAttribute('data-gb'), g = gradient(path), act = b.getAttribute('data-gb-act');
    if (!g) return;
    if (act === 'add' && g.stops.length < 4) {
      var s = g.stops.slice().sort(function (a, c) { return a.pos - c.pos; }), last = s[s.length - 1], prev = s[s.length - 2] || last, mid = Math.round((last.pos + prev.pos) / 2);
      g.stops.push({ color: last.color, alpha: last.alpha, pos: mid === last.pos ? 100 : mid });
    } else if (act === 'rm' && g.stops.length > 2) g.stops.splice(parseInt(b.getAttribute('data-si'), 10), 1);
    else if (act === 'rev') { g.stops.forEach(function (s) { s.pos = 100 - s.pos; }); g.stops.reverse(); }
    else if (act === 'preset') { var pr = clone(PRESETS[parseInt(b.getAttribute('data-pi'), 10)].g); g.type = pr.type; g.angle = pr.angle; g.stops = pr.stops; }
    renderEditor(); afterChange(path, false, false);
  }
  elEditor.addEventListener('click', function (e) {
    onSeg(e, false);
    var tab = e.target.closest('[data-tab]');
    if (tab) { state.tab = tab.getAttribute('data-tab'); renderEditor(); return; }
    var pal = e.target.closest('[data-pal]');
    if (pal && !pal.disabled) { var p = pal.getAttribute('data-pal'); applyVal(p, pal.getAttribute('data-v'), false); renderEditor(); afterChange(p, false, false); return; }
    var pc = e.target.closest('.hr-pos-cell');
    if (pc && !pc.disabled) { cur().style.v = pc.getAttribute('data-pos-v'); cur().style.h = pc.getAttribute('data-pos-h'); renderEditor(); updateBar(); renderPreview(); return; }
    var fc = e.target.closest('[data-focus]');
    if (fc && !READONLY) {
      var r = fc.getBoundingClientRect();
      if (r.width && r.height) {
        cur().background.focus_x = Math.round(clamp((e.clientX - r.left) / r.width * 100, 0, 100));
        cur().background.focus_y = Math.round(clamp((e.clientY - r.top) / r.height * 100, 0, 100));
        renderEditor(); afterChange('background.focus_x', false, false);
      }
      return;
    }
    var gt = e.target.closest('[data-gb-type] button');
    if (gt && !gt.disabled) { var gp = gt.parentNode.getAttribute('data-gb-type'); gradient(gp).type = gt.getAttribute('data-v'); renderEditor(); afterChange(gp, false, false); return; }
    var ga = e.target.closest('[data-gb-act]');
    if (ga && !ga.disabled) { gradAct(ga); return; }
    var act = e.target.closest('[data-act]');
    if (act && !act.disabled) doAct(act);
  });
  function gbInput(e) {
    var t = e.target, path, g;
    if (t.hasAttribute('data-gb-angle')) {
      path = t.getAttribute('data-gb-angle'); g = gradient(path); g.angle = Math.round(clamp(t.value, 0, 360));
      $$('[data-gb-angle="' + path + '"]', elEditor).forEach(function (o) { if (o !== t) o.value = g.angle; });
    } else if (t.hasAttribute('data-gb-stop')) {
      path = t.getAttribute('data-gb-stop'); g = gradient(path);
      var st = g.stops[parseInt(t.getAttribute('data-si'), 10)], f = t.getAttribute('data-f');
      if (!st) return;
      if (f === 'color') st.color = String(t.value).toUpperCase();
      else if (f === 'alpha') { st.alpha = Math.round(clamp(t.value, 0, 100)); var o = t.parentNode.querySelector('output'); if (o) o.textContent = st.alpha + '%'; }
      else if (f === 'pos') { if (t.value === '') return; st.pos = clamp(t.value, 0, 100); }
    } else return;
    var pv = $('[data-gb="' + path + '"] .gb-prev', elEditor); if (pv) pv.style.background = gradientCss(g);
    afterChange(path, false, false);
  }
  elEditor.addEventListener('input', gbInput); elEditor.addEventListener('change', gbInput);

  /* ---------------------------------------------------------------- media library / uploads */
  function setMedia(target, m) {
    var bg = cur().background, path;
    if (target === 'image') { bg.image.url = m.url; bg.image.id = m.id || null; path = 'background.image.url'; }
    else if (target === 'poster') { bg.video.poster = m.url; path = 'background.video.poster'; }
    else { bg.video.url = m.url; bg.video.id = m.id || null; path = 'background.video.url'; }
    renderEditor(); afterChange(path, false, false);
  }
  function busy(b, on) { if (b) { b.disabled = on; b.classList.toggle('is-busy', on); } }
  function chooseFile(accept, cb) {
    var i = document.createElement('input'); i.type = 'file'; i.accept = accept; i.hidden = true;
    i.addEventListener('change', function () { if (i.files && i.files[0]) cb(i.files[0]); i.remove(); });
    document.body.appendChild(i); i.click();
  }
  function doAct(b) {
    var a = b.getAttribute('data-act'), target = b.getAttribute('data-target');
    if (a === 'lib') pickFromLibrary().then(function (m) { if (m) setMedia(target, m); });
    else if (a === 'up-img') chooseFile('image/jpeg,image/png,image/webp,image/gif', function (f) {
      busy(b, true);
      DB.upload(f, '/admin/editor/upload', 5).then(function (m) { setMedia(target, m); U.toast('تم رفع الصورة'); }, function (er) { DB.fail(er, 'تعذّر رفع الصورة'); }).then(function () { busy(b, false); });
    });
    else if (a === 'up-vid') chooseFile('video/mp4,video/webm', function (f) {
      if (!/^video\/(mp4|webm)$/.test(f.type)) { U.toast('صيغة غير مدعومة', { text: 'اختر ملف MP4 أو WebM.', tone: 'danger', icon: 'error' }); return; }
      if (LIMITS.video_kb && f.size > LIMITS.video_kb * 1024) { U.toast('الفيديو أكبر من الحد المسموح', { text: 'الحد الأقصى ' + (Math.round(LIMITS.video_kb / 102.4) / 10) + ' ميغابايت على هذا الخادم. استخدم رابط الملف بدل الرفع.', tone: 'danger', icon: 'error' }); return; }
      var fd = new FormData(); fd.append('file', f); busy(b, true);
      DB.api('POST', '/admin/editor/video', fd).then(function (r) { setMedia('video', r.data); U.toast('تم رفع الفيديو'); }, function (er) { DB.fail(er, 'تعذّر رفع الفيديو'); }).then(function () { busy(b, false); });
    });
  }
  function pickFromLibrary() {
    var chosen = null;
    return U.modal({
      title: 'اختيار صورة من مكتبة الوسائط', size: 'lg', confirmText: 'استخدام الصورة المحددة',
      body: '<div class="hr-lib"><div class="hr-lib-bar"><label class="input-icon"><span class="sr-only">بحث</span><span class="material-symbols-outlined" aria-hidden="true">search</span><input class="input sm" type="search" id="hr-lib-q" placeholder="ابحث باسم الصورة…" autocomplete="off"></label>' +
        '<button type="button" class="btn btn-secondary btn-sm" id="hr-lib-up"><span class="material-symbols-outlined" aria-hidden="true">upload</span>رفع صورة جديدة</button></div>' +
        '<div class="hr-lib-grid" id="hr-lib-grid" aria-live="polite"></div><div class="hr-lib-more"><button type="button" class="btn btn-ghost btn-sm" id="hr-lib-more" hidden>تحميل المزيد</button></div></div>',
      validate: function () { if (!chosen) { U.toast('اختر صورة أولاً', { tone: 'info', icon: 'info' }); return false; } return true; },
      getValue: function () { return chosen; },
      onOpen: function (dlg) {
        var grid = $('#hr-lib-grid', dlg), more = $('#hr-lib-more', dlg), q = $('#hr-lib-q', dlg), page = 1, timer = null, items = {};
        function card(m) { return '<button type="button" class="hr-lib-item" data-id="' + m.id + '" title="' + esc(m.name) + '"><img src="' + esc(m.url) + '" alt="' + esc(m.alt || m.name) + '" loading="lazy"><span>' + esc(m.name) + '</span></button>'; }
        function load(reset) {
          if (reset) { page = 1; grid.innerHTML = ''; }
          DB.api('GET', '/admin/editor/media?page=' + page + '&q=' + encodeURIComponent(q.value || '')).then(function (r) {
            (r.data || []).forEach(function (m) { items[m.id] = m; grid.insertAdjacentHTML('beforeend', card(m)); });
            more.hidden = page >= ((r.meta && r.meta.last) || 1);
            if (!grid.children.length) grid.innerHTML = '<p class="muted">لا توجد صور. ارفع صورة جديدة.</p>';
          }, function (er) { DB.fail(er, 'تعذّر تحميل المكتبة'); });
        }
        grid.addEventListener('click', function (e) {
          var it = e.target.closest('.hr-lib-item'); if (!it) return;
          $$('.hr-lib-item', grid).forEach(function (x) { x.classList.toggle('is-sel', x === it); });
          chosen = items[it.getAttribute('data-id')] || null;
        });
        more.addEventListener('click', function () { page += 1; load(false); });
        q.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { load(true); }, 300); });
        $('#hr-lib-up', dlg).addEventListener('click', function () {
          chooseFile('image/jpeg,image/png,image/webp,image/gif', function (f) {
            DB.upload(f, '/admin/editor/upload', 5).then(function (m) { items[m.id] = m; grid.insertAdjacentHTML('afterbegin', card(m)); var n = grid.querySelector('.hr-lib-item'); if (n) n.click(); }, function (er) { DB.fail(er, 'تعذّر رفع الصورة'); });
          });
        });
        load(true);
      }
    }).then(function (v) { return v || null; });
  }

  /* ---------------------------------------------------------------- live preview */
  var DEV = { desktop: { w: 1280, h: 720 }, mobile: { w: 390, h: 760 } };
  function cl3(a, b, c) { return Math.max(a, Math.min(c, b)); }
  function prevVars(w, h) {
    var vh = h / 100, vw = w / 100, v = {};
    if (w >= 768) {
      v['--hs-k-mt'] = cl3(10, 2 * vh, 24) + 'px'; v['--hs-t-mt'] = cl3(6, 1.3 * vh, 16) + 'px';
      v['--hs-t-fs'] = cl3(34, Math.min(4.2 * vw, 6.4 * vh), 64) + 'px'; v['--hs-t-lh'] = '1.32'; v['--hs-l-mt'] = cl3(10, 2 * vh, 24) + 'px';
      v['--hs-l-fs'] = cl3(15, 2.1 * vh, 19) + 'px'; v['--hs-l-lh'] = '1.85'; v['--hs-l-w'] = '48rem'; v['--hs-cta-mt'] = cl3(14, 3 * vh, 36) + 'px';
      v['--hs-btn-h'] = cl3(46, 6.2 * vh, 56) + 'px'; v['--hs-btn-fs'] = cl3(14.5, 1.9 * vh, 16) + 'px';
    } else {
      v['--hs-k-mt'] = '22px'; v['--hs-t-mt'] = '14px'; v['--hs-t-fs'] = '38px'; v['--hs-t-lh'] = '1.35'; v['--hs-l-mt'] = '20px'; v['--hs-l-fs'] = '17px'; v['--hs-l-lh'] = '1.95'; v['--hs-l-w'] = '42rem'; v['--hs-cta-mt'] = '28px'; v['--hs-btn-h'] = '56px'; v['--hs-btn-fs'] = '16px';
    }
    return Object.keys(v).map(function (k) { return k + ':' + v[k]; }).join(';');
  }
  function heroHeightPx(h) {
    var s = state.settings;
    if (s.height_mode === '70vh') return Math.round(h * 0.7);
    if (s.height_mode === 'custom') return s.height_unit === 'px' ? Number(s.height_value) : Math.round(h * Number(s.height_value) / 100);
    return h;
  }
  function slideMarkup(s) {
    var c = s.content, st = s.style, bg = s.background, t = bg.type;
    var bgStyle = 'background-color:' + bg.color + ';';
    if (t === 'gradient') bgStyle = 'background:' + gradientCss(bg.gradient) + ';';
    else if (t === 'video' && bg.video.poster) bgStyle += 'background-image:url(\'' + bg.video.poster + '\');background-size:cover;background-position:' + bg.focus_x + '% ' + bg.focus_y + '%;background-repeat:no-repeat;';
    var gray = bg.grayscale > 0 ? 'filter:grayscale(' + (bg.grayscale / 100).toFixed(2) + ');' : '';
    var z = (bg.zoom / 100).toFixed(2), media = '';
    if (t === 'image' && bg.image.url) media = '<div class="hs-media" style="background-image:url(\'' + bg.image.url + '\');background-repeat:no-repeat;background-size:' + bg.fit + ';background-position:' + bg.focus_x + '% ' + bg.focus_y + '%;--hs-z:' + z + ';' + gray + '"></div>';
    else if (t === 'video' && bg.video.url) media = '<video class="hs-media hs-video" autoplay muted loop playsinline preload="metadata"' + (bg.video.poster ? ' poster="' + esc(bg.video.poster) + '"' : '') + ' style="object-fit:' + bg.fit + ';object-position:' + bg.focus_x + '% ' + bg.focus_y + '%;--hs-z:' + z + ';' + gray + '"><source src="' + esc(bg.video.url) + '"></video>';
    var ov = overlayCss(bg.overlay);
    var bgHtml = '<div class="hs-bgs"><div class="hs-bg is-active' + (bg.motion && (t === 'image' || t === 'video') ? ' has-motion' : '') + '" data-pos="active" style="' + esc(bgStyle) + '">' + media + (ov ? '<div class="hs-ov" style="' + esc(ov) + '"></div>' : '') + '</div></div>';
    var vars = '--hs-title:' + st.title_color + ';--hs-text:' + st.text_color + ';--hs-eyebrow:' + st.eyebrow_color + ';--hs-accent:' + st.accent_color + ';--hs-ts:' + (st.title_size / 100).toFixed(2) + ';--hs-xs:' + (st.text_size / 100).toFixed(2);
    var box = '';
    if (c.badge || c.badge2) box += '<div class="hs-badge"><span class="hs-dot"></span>' + (c.badge ? '<span class="hs-b1">' + esc(c.badge) + '</span>' : '') + (c.badge && c.badge2 ? '<span class="hs-sep">•</span>' : '') + (c.badge2 ? '<span class="hs-b2">' + esc(c.badge2) + '</span>' : '') + '</div>';
    if (c.eyebrow) box += '<p class="hs-kicker"><span class="hs-rule"></span>' + esc(c.eyebrow) + '</p>';
    if (c.title) box += '<h2 class="hs-title">' + titleHtml(c.title) + '</h2>';
    if (c.subtitle) box += '<p class="hs-lead">' + esc(c.subtitle).replace(/\r?\n/g, '<br>') + '</p>';
    var btns = [c.btn1, c.btn2].filter(function (b) { return b.visible && b.label && b.url; }).map(function (b) {
      var gold = b.style === 'gold', icon = b.icon ? (gold ? '<span class="hs-circle"><span class="material-symbols-outlined fill">' + esc(b.icon) + '</span></span>' : '<span class="material-symbols-outlined hs-bico">' + esc(b.icon) + '</span>') : '';
      return '<span class="hs-btn hs-btn--' + b.style + (gold && b.icon ? ' has-circle' : '') + '">' + icon + esc(b.label) + (gold ? '<span class="material-symbols-outlined hs-barrow">arrow_back</span>' : '') + '</span>';
    });
    if (btns.length) box += '<div class="hs-cta">' + btns.join('') + '</div>';
    return { bg: bgHtml, slide: '<div class="hs-slide is-active" data-pos="active" data-v="' + st.v + '" data-h="' + st.h + '" style="' + vars + '"><div class="hs-box" data-a="' + st.align + '">' + box + '</div></div>' };
  }
  var prevScale = 0.6;
  function renderPreview() {
    if (!elPrev || !cur()) return;
    var d = DEV[state.device], g = state.settings, s = cur();
    var vis = state.slides.filter(function (x) { return x.is_visible; }), multi = vis.length > 1;
    var H = heroHeightPx(d.h), m = slideMarkup(s), dots = '';
    if (multi) {
      dots = '<span class="hs-arrow hs-prev" aria-hidden="true"><span class="material-symbols-outlined">chevron_right</span></span><span class="hs-arrow hs-next" aria-hidden="true"><span class="material-symbols-outlined">chevron_left</span></span>' +
        '<div class="hs-ctrl"><div class="hs-dots">' + vis.map(function (x) { return '<span class="hs-dot-btn' + (x === s ? ' is-active' : '') + '"></span>'; }).join('') + '</div></div>';
    }
    elPrev.innerHTML = '<div class="hs-wrap" style="width:' + Math.round(d.w * prevScale) + 'px;height:' + Math.round(H * prevScale) + 'px">' +
      '<div class="hs-root hs-prev" data-dev="' + state.device + '" data-tr="' + g.transition + '" data-arrows="' + (g.arrows && multi ? 1 : 0) + '" data-dots="' + (g.dots && multi ? 1 : 0) + '" data-autoplay="' + (g.autoplay && multi ? 1 : 0) + '" data-scroll="' + (g.scroll_hint ? 1 : 0) + '" style="width:' + d.w + 'px;height:' + H + 'px;--hero-h:' + H + 'px;transform:scale(' + prevScale.toFixed(3) + ');' + prevVars(d.w, H) + '">' +
      m.bg + '<div class="hs-pv-head"><b></b><span></span><span></span><span></span></div>' +
      '<div class="hero-inner hs-pv-inner"><div class="hs-stage">' + m.slide + dots + '</div><div class="hs-pv-stats" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div>' +
      (g.enabled ? '' : '<div class="hs-pv-note"><span class="material-symbols-outlined" aria-hidden="true">visibility_off</span>الهيرو مخفي حالياً عن الموقع</div>') +
      (s.is_visible ? '' : '<div class="hs-pv-tag">شريحة مخفية</div>') + '</div></div>';
    var cap = $('#hr-prev-cap');
    if (cap) cap.textContent = d.w + ' × ' + H + (state.device === 'mobile' ? ' (هاتف)' : ' (حاسوب)');
  }
  function fitPreview() {
    var box = $('#hr-prev-box'), d = DEV[state.device], w = box ? box.clientWidth : 0;
    if (!w) { prevScale = state.device === 'mobile' ? 0.6 : 0.5; return; }
    prevScale = Math.min(1, (w - 2) / d.w);
    if (state.device === 'mobile') prevScale = Math.min(prevScale, 0.7);
  }
  var devSeg = $('#hr-device');
  if (devSeg) devSeg.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-v]'); if (!b) return;
    state.device = b.getAttribute('data-v');
    $$('button', devSeg).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    fitPreview(); renderPreview();
  });
  var rt = null;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { fitPreview(); renderPreview(); }, 120); });

  /* ---------------------------------------------------------------- save / revert */
  function showErrors(errs) {
    state.errs = errs;
    var first = Object.keys(errs)[0], m = /^slides\.(\d+)\./.exec(first || '');
    if (m && Number(m[1]) < state.slides.length) { state.sel = Number(m[1]); state.tab = tabOf(first); }
    renderList(); renderEditor(); renderGlobal(); renderPreview();
    U.toast('تعذّر الحفظ', { text: errs[first] || 'راجع الحقول المعلّمة.', tone: 'danger', icon: 'error' });
    var f = $('.hr-err', elEditor); if (f && f.scrollIntoView) { try { f.scrollIntoView({ block: 'center' }); } catch (x) { /* ignore */ } }
  }
  function save() {
    if (READONLY || state.busy || !isDirty()) return Promise.resolve(false);
    var errs = validate();
    if (Object.keys(errs).length) { showErrors(errs); return Promise.resolve(false); }
    state.busy = true; updateBar();
    return DB.api('PUT', '/admin/hero', payload()).then(function (r) {
      var d = r.data, idx = state.sel;
      state.settings = clone(d.settings); state.slides = clone(d.slides); state.slides.forEach(function (s) { s._k = newKey(); });
      state.sel = Math.min(idx, state.slides.length - 1); state.errs = {}; state.saved = true; BOOT.saved = true;
      takeSnap(); state.busy = false;
      renderList(); renderGlobal(); renderEditor(); renderPreview(); updateBar();
      U.toast('تم حفظ إعدادات الهيرو', { text: 'التغييرات ظاهرة الآن في الصفحة الرئيسية.' });
      return true;
    }, function (er) {
      state.busy = false;
      if (er && er.status === 422 && er.errors && Object.keys(er.errors).length) {
        var flat = {}; Object.keys(er.errors).forEach(function (k) { flat[k] = er.errors[k][0]; });
        showErrors(flat);
      } else DB.fail(er, 'تعذّر حفظ إعدادات الهيرو');
      updateBar();
      return false;
    });
  }
  function revert() {
    if (!isChanged() || READONLY) return;
    U.modal({ title: 'التراجع عن التغييرات؟', text: 'ستعود الصفحة إلى آخر نسخة محفوظة وتُفقد التعديلات غير المحفوظة.', icon: 'undo', confirmText: 'نعم، تراجع', cancelText: 'متابعة التعديل' }).then(function (ok) {
      if (!ok) return;
      var p = JSON.parse(snap);
      state.settings = p.settings; state.slides = p.slides; state.slides.forEach(function (s) { s._k = newKey(); });
      state.sel = Math.min(state.sel, state.slides.length - 1); state.errs = {};
      renderList(); renderGlobal(); renderEditor(); renderPreview(); updateBar();
      U.toast('تم التراجع عن التغييرات', { tone: 'info', icon: 'undo' });
    });
  }
  ['#hr-save', '#hr-save2'].forEach(function (s) { var b = $(s); if (b) b.addEventListener('click', save); });
  ['#hr-revert', '#hr-revert2'].forEach(function (s) { var b = $(s); if (b) b.addEventListener('click', revert); });
  var addBtn = $('#hr-add'); if (addBtn) addBtn.addEventListener('click', addSlide);
  document.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); save(); } });
  window.addEventListener('beforeunload', function (e) { if (isChanged() && !READONLY) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------------------------------------------------------------- boot */
  fitPreview();
  renderList(); renderGlobal(); renderEditor(); renderPreview(); updateBar();
  if (!READONLY) loadLimits();
  window.__HERO_API = { state: state, save: save, payload: payload, validate: validate, isDirty: isDirty };
})();
