/* «الرؤية والرسالة والقيم» — editor for the three story cards of the home page and /about (database backed).
   State: { cards[] } saved as a whole with PUT /admin/vision (rules: App\Support\VisionSupport). */
(function () {
  'use strict';
  var U = window.AdminUI, DB = window.AdminDB, BOOT = window.__VISION;
  if (!U || !DB || !BOOT) return;
  var esc = U.esc;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function can(k) { return !window.AdminPerm || window.AdminPerm.can(k); }
  var READONLY = !can('vision.edit');
  var MAX = BOOT.max || { tab: 24, kicker: 60, title: 100, copy: 400 };
  var ICONS = BOOT.icons || {};
  var LABEL = { vision: 'بطاقة الرؤية', mission: 'بطاقة الرسالة', values: 'بطاقة القيم' };

  var state = { cards: clone(BOOT.cards), errs: {}, saved: !!BOOT.saved, busy: false };
  var snap = '';
  function payload() { return { cards: clone(state.cards) }; }
  function takeSnap() { snap = JSON.stringify(payload()); }
  function isChanged() { return JSON.stringify(payload()) !== snap; }
  function isDirty() { return isChanged() || !state.saved; }
  takeSnap();

  var elList = $('#vs-list'), elBar = $('#vs-bar'), elState = $('#vs-state'), elNote = $('#vs-note');

  /* ---------------------------------------------------------------- helpers */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function src(p) { return '/' + String(p || '').replace(/^\/+/, ''); }
  function defOf(id) { return (BOOT.defaults || []).filter(function (d) { return d.id === id; })[0]; }
  function len(s) { return Array.from(String(s || '')).length; }
  function err(i, f) { var m = state.errs['cards.' + i + '.' + f]; return m ? '<p class="vs-err" role="alert">' + esc(m) + '</p>' : ''; }
  function cardHasErr(i) { return Object.keys(state.errs).some(function (k) { return k.indexOf('cards.' + i + '.') === 0; }); }

  /* ---------------------------------------------------------------- validation (mirrors the server) */
  function validate() {
    var e = {};
    state.cards.forEach(function (c, i) {
      var p = 'cards.' + i + '.';
      [['tab', 'عنوان التبويب', true], ['kicker', 'العنوان الفرعي', false], ['title', 'العنوان', true], ['copy', 'النص', true]].forEach(function (f) {
        var v = String(c[f[0]] || '').replace(/\s+/g, ' ').trim();
        if (f[2] && !v) e[p + f[0]] = f[1] + ' مطلوب.';
        else if (len(v) > MAX[f[0]]) e[p + f[0]] = f[1] + ' طويل جداً (الحد ' + MAX[f[0]] + ' حرفاً).';
      });
      if (!c.image) e[p + 'image'] = 'اختر صورة للبطاقة.';
      if (!ICONS[c.icon]) e[p + 'icon'] = 'اختر أيقونة من القائمة.';
    });
    return e;
  }

  /* ---------------------------------------------------------------- dirty bar */
  function updateBar() {
    var d = isDirty();
    if (elBar) elBar.hidden = !d || READONLY;
    if (elState) {
      elState.innerHTML = d ? '<span class="material-symbols-outlined" aria-hidden="true">edit_note</span><span>تغييرات غير محفوظة</span>' : '<span class="material-symbols-outlined" aria-hidden="true">cloud_done</span><span>محفوظة في قاعدة البيانات</span>';
      elState.classList.toggle('is-dirty', d);
    }
    ['#vs-save', '#vs-save2'].forEach(function (s) { var b = $(s); if (b) b.disabled = state.busy || !d || READONLY; });
    ['#vs-revert', '#vs-revert2'].forEach(function (s) { var b = $(s); if (b) b.disabled = state.busy || !isChanged() || READONLY; });
    var rs = $('#vs-reset'); if (rs) rs.disabled = state.busy || READONLY;
    var shown = state.cards.filter(function (c) { return c.visible; }).length;
    if (elNote) {
      elNote.hidden = shown > 0;
      elNote.innerHTML = shown > 0 ? '' : '<span class="material-symbols-outlined" aria-hidden="true">visibility_off</span><span>كل البطاقات مخفية: لن يظهر قسم «الرؤية والرسالة والقيم» في الموقع حتى تُظهر بطاقة واحدة على الأقل.</span>';
    }
  }

  /* ---------------------------------------------------------------- render */
  function preview(c, i) {
    return '<div class="vs-prev" data-prev="' + i + '"><p class="vs-prev-cap">معاينة سريعة</p>' +
      '<div class="vs-prev-h"><span class="material-symbols-outlined" aria-hidden="true">' + esc(c.icon) + '</span><span data-pv="tab">' + esc(c.tab) + '</span></div>' +
      (c.kicker ? '<p class="vs-prev-k" data-pv="kicker">' + esc(c.kicker) + '</p>' : '<p class="vs-prev-k" data-pv="kicker" hidden></p>') +
      '<h3 class="vs-prev-t" data-pv="title">' + esc(c.title) + '</h3><p class="vs-prev-c" data-pv="copy">' + esc(c.copy) + '</p></div>';
  }
  function fieldText(i, f, label, area, hint) {
    var c = state.cards[i], id = 'vs-' + i + '-' + f, v = c[f] || '';
    var inner = (area ? '<textarea class="textarea" rows="4"' : '<input class="input" type="text"') + ' id="' + id + '" data-i="' + i + '" data-f="' + f + '" maxlength="' + (MAX[f] + 40) + '"' + (READONLY ? ' disabled' : '') +
      (state.errs['cards.' + i + '.' + f] ? ' aria-invalid="true"' : '') + ' aria-describedby="' + id + '-e"' + (area ? '>' + esc(v) + '</textarea>' : ' value="' + esc(v) + '">');
    return '<div class="field"><label class="label" for="' + id + '"><span>' + label + '</span><small data-count="' + i + '-' + f + '">' + len(v) + ' / ' + MAX[f] + '</small></label>' + inner +
      (hint ? '<p class="hint">' + hint + '</p>' : '') + '<div id="' + id + '-e">' + err(i, f) + '</div></div>';
  }
  function renderCard(c, i) {
    var n = state.cards.length;
    var icons = Object.keys(ICONS).map(function (k) {
      return '<button type="button" class="vs-ico" data-op="icon" data-i="' + i + '" data-v="' + esc(k) + '" aria-pressed="' + (c.icon === k) + '" title="' + esc(ICONS[k]) + '" aria-label="' + esc(ICONS[k]) + '"' + (READONLY ? ' disabled' : '') + '><span class="material-symbols-outlined" aria-hidden="true">' + esc(k) + '</span></button>';
    }).join('');
    return '<section class="card vs-card' + (c.visible ? '' : ' is-off') + (cardHasErr(i) ? ' has-err' : '') + '" data-card="' + i + '" aria-labelledby="vs-t-' + i + '">' +
      '<div class="card-head bordered"><div class="vs-headl"><span class="vs-badge" aria-hidden="true">' + pad(i + 1) + '</span><div><h2 class="card-title" id="vs-t-' + i + '" data-pv-head="' + i + '">' + esc(c.tab) + '</h2><p class="card-sub">' + (c.visible ? 'ظاهرة في الموقع' : 'مخفية عن الموقع') + ' • ' + esc(LABEL[c.id] || '') + '</p></div></div>' +
        '<div class="vs-ops"><span class="vs-sw"><span id="vs-vis-l-' + i + '">ظاهرة في الموقع</span><button type="button" class="switch" role="switch" data-op="vis" data-i="' + i + '" aria-checked="' + !!c.visible + '" aria-labelledby="vs-vis-l-' + i + '"' + (READONLY ? ' disabled' : '') + '></button></span>' +
        '<button type="button" class="icon-btn sm" data-op="up" data-i="' + i + '" aria-label="تحريك للأعلى (قبل ' + pad(i) + ')"' + (READONLY || i === 0 ? ' disabled' : '') + '><span class="material-symbols-outlined" aria-hidden="true">arrow_upward</span></button>' +
        '<button type="button" class="icon-btn sm" data-op="down" data-i="' + i + '" aria-label="تحريك للأسفل"' + (READONLY || i === n - 1 ? ' disabled' : '') + '><span class="material-symbols-outlined" aria-hidden="true">arrow_downward</span></button></div></div>' +
      '<div class="card-body vs-body"><div class="vs-fields">' +
        fieldText(i, 'tab', 'عنوان التبويب', false, 'الاسم القصير الذي يظهر على التبويب (مثل: رؤيتنا).') +
        fieldText(i, 'kicker', 'العنوان الفرعي <span class="opt">اختياري</span>', false) +
        fieldText(i, 'title', 'العنوان', false) +
        fieldText(i, 'copy', 'النص', true) +
        '<div class="field"><span class="label" id="vs-ic-l-' + i + '">الأيقونة</span><div class="vs-icons" role="group" aria-labelledby="vs-ic-l-' + i + '">' + icons + '</div>' + err(i, 'icon') + '</div>' +
      '</div><div class="vs-side">' +
        '<div class="vs-img"><span class="label">الصورة</span><div class="vs-thumb">' + (c.image ? '<img src="' + esc(src(c.image)) + '" alt="" loading="lazy">' : '') + '</div><p class="vs-path">' + esc(c.image || '—') + '</p>' +
          '<div class="vs-imgbtns"><button type="button" class="btn btn-secondary btn-sm" data-op="upload" data-i="' + i + '"' + (READONLY ? ' disabled' : '') + '><span class="material-symbols-outlined" aria-hidden="true">upload</span>رفع صورة</button>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-op="defimg" data-i="' + i + '"' + (READONLY ? ' disabled' : '') + '><span class="material-symbols-outlined" aria-hidden="true">image</span>الصورة الافتراضية</button></div>' +
          '<p class="hint">JPG أو PNG أو WebP أو GIF، حتى ' + esc(String(BOOT.image_max_mb || 10)) + ' ميغابايت.</p>' + err(i, 'image') + '</div>' +
        preview(c, i) +
      '</div></div></section>';
  }
  function render() {
    elList.innerHTML = state.cards.map(renderCard).join('');
    updateBar();
  }

  /* ---------------------------------------------------------------- live updates while typing (no re-render: keeps focus) */
  function liveUpdate(i, f) {
    var c = state.cards[i], card = $('[data-card="' + i + '"]', elList);
    if (!card) return;
    var cnt = $('[data-count="' + i + '-' + f + '"]', card); if (cnt) cnt.textContent = len(c[f]) + ' / ' + MAX[f];
    var pv = $('[data-pv="' + f + '"]', card);
    if (pv) { pv.textContent = c[f]; if (f === 'kicker') pv.hidden = !c.kicker; }
    if (f === 'tab') { var h = $('[data-pv-head="' + i + '"]', card); if (h) h.textContent = c.tab; }
    if (state.errs['cards.' + i + '.' + f]) {
      delete state.errs['cards.' + i + '.' + f];
      var holder = $('#vs-' + i + '-' + f + '-e', card); if (holder) holder.innerHTML = '';
      var input = $('#vs-' + i + '-' + f, card); if (input) input.removeAttribute('aria-invalid');
      card.classList.toggle('has-err', cardHasErr(i));
    }
    updateBar();
  }
  elList.addEventListener('input', function (e) {
    var t = e.target;
    if (READONLY || !t.getAttribute) return;
    var f = t.getAttribute('data-f'), i = Number(t.getAttribute('data-i'));
    if (!f || isNaN(i) || !state.cards[i]) return;
    state.cards[i][f] = t.value;
    liveUpdate(i, f);
  });

  /* ---------------------------------------------------------------- actions */
  function busy(b, on) { if (b) { b.disabled = on; b.classList.toggle('is-busy', on); } }
  function chooseFile(accept, cb) {
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = accept; inp.hidden = true;
    inp.addEventListener('change', function () { if (inp.files && inp.files[0]) cb(inp.files[0]); inp.remove(); });
    document.body.appendChild(inp); inp.click();
  }
  function move(i, d) {
    var j = i + d; if (j < 0 || j >= state.cards.length) return;
    var t = state.cards[i]; state.cards[i] = state.cards[j]; state.cards[j] = t;
    state.errs = {}; render();
    var b = $('[data-card="' + j + '"] [data-op="' + (d < 0 ? 'up' : 'down') + '"]'); if (b && !b.disabled) b.focus();
  }
  elList.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-op]') : null;
    if (!b || READONLY || b.disabled) return;
    var op = b.getAttribute('data-op'), i = Number(b.getAttribute('data-i')), c = state.cards[i];
    if (!c) return;
    if (op === 'vis') { c.visible = !c.visible; render(); var nb = $('[data-card="' + i + '"] [data-op="vis"]'); if (nb) nb.focus(); }
    else if (op === 'up') move(i, -1);
    else if (op === 'down') move(i, 1);
    else if (op === 'icon') { c.icon = b.getAttribute('data-v'); delete state.errs['cards.' + i + '.icon']; render(); var nb2 = $('[data-card="' + i + '"] [data-op="icon"][aria-pressed="true"]'); if (nb2) nb2.focus(); }
    else if (op === 'defimg') { var d = defOf(c.id); if (d) { c.image = d.image; delete state.errs['cards.' + i + '.image']; render(); U.toast('تمت استعادة الصورة الافتراضية', { tone: 'info', icon: 'image' }); } }
    else if (op === 'upload') chooseFile('image/jpeg,image/png,image/webp,image/gif', function (f) {
      busy(b, true);
      DB.upload(f, '/admin/vision/image', BOOT.image_max_mb || 10).then(function (m) {
        c.image = m.path; delete state.errs['cards.' + i + '.image']; render(); U.toast('تم رفع الصورة', { text: 'اضغط «حفظ التغييرات» لتظهر في الموقع.' });
      }, function (er) { DB.fail(er, 'تعذّر رفع الصورة'); busy(b, false); });
    });
  });

  function showErrors(errs) {
    state.errs = errs;
    render();
    var first = Object.keys(errs)[0];
    U.toast('تعذّر الحفظ', { text: errs[first] || 'راجع الحقول المعلّمة.', tone: 'danger', icon: 'error' });
    var f = $('.vs-err', elList); if (f && f.scrollIntoView) { try { f.scrollIntoView({ block: 'center' }); } catch (x) { /* ignore */ } }
  }
  function save() {
    if (READONLY || state.busy || !isDirty()) return Promise.resolve(false);
    var errs = validate();
    if (Object.keys(errs).length) { showErrors(errs); return Promise.resolve(false); }
    state.busy = true; updateBar();
    return DB.api('PUT', '/admin/vision', payload()).then(function (r) {
      state.cards = clone(r.data.cards); state.errs = {}; state.saved = true; BOOT.saved = true; takeSnap(); state.busy = false;
      render(); U.toast('تم حفظ البطاقات', { text: 'التغييرات ظاهرة الآن في الصفحة الرئيسية وصفحة «من نحن».' });
      return true;
    }, function (er) {
      state.busy = false;
      if (er && er.status === 422 && er.errors && Object.keys(er.errors).length) {
        var flat = {}; Object.keys(er.errors).forEach(function (k) { flat[k] = er.errors[k][0]; });
        showErrors(flat);
      } else { DB.fail(er, 'تعذّر حفظ البطاقات'); }
      updateBar();
      return false;
    });
  }
  function revert() {
    if (!isChanged() || READONLY) return;
    U.modal({ title: 'التراجع عن التغييرات؟', text: 'ستعود البطاقات إلى آخر نسخة محفوظة وتُفقد التعديلات غير المحفوظة.', icon: 'undo', confirmText: 'نعم، تراجع', cancelText: 'متابعة التحرير' }).then(function (ok) {
      if (!ok) return;
      state.cards = JSON.parse(snap).cards; state.errs = {}; render(); U.toast('تم التراجع عن التغييرات', { tone: 'info', icon: 'undo' });
    });
  }
  function resetDefaults() {
    if (READONLY) return;
    U.modal({ title: 'استعادة المحتوى الافتراضي؟', text: 'ستعود البطاقات الثلاث إلى نصوصها وصورها وأيقوناتها وترتيبها الأصلي. لن يُطبَّق ذلك على الموقع قبل الضغط على «حفظ التغييرات».', icon: 'restart_alt', tone: 'warn', confirmText: 'نعم، استعد الافتراضي', cancelText: 'إلغاء' }).then(function (ok) {
      if (!ok) return;
      state.cards = clone(BOOT.defaults); state.errs = {}; render(); U.toast('تمت استعادة الافتراضي', { text: 'اضغط «حفظ التغييرات» لتطبيقها على الموقع.', tone: 'info', icon: 'restart_alt' });
    });
  }
  ['#vs-save', '#vs-save2'].forEach(function (s) { var b = $(s); if (b) b.addEventListener('click', save); });
  ['#vs-revert', '#vs-revert2'].forEach(function (s) { var b = $(s); if (b) b.addEventListener('click', revert); });
  var rb = $('#vs-reset'); if (rb) rb.addEventListener('click', resetDefaults);
  document.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); save(); } });
  window.addEventListener('beforeunload', function (e) { if (isChanged() && !READONLY) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------------------------------------------------------------- boot */
  if (READONLY && elNote) { /* read-only users still see the cards, with every control disabled */ }
  render();
  window.__VISION_API = { state: state, save: save, payload: payload, validate: validate, isDirty: isDirty };
})();
