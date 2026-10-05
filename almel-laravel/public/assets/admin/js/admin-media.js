/* مكتبة الوسائط (/admin/media): upload (drag & drop, progress, per-file errors), details / edit drawer, copy URL, bulk delete.
   Server-rendered page; config in window.__MEDIA_CFG (resources/views/admin/media/index.blade.php). No native dialogs: confirmations use
   the shared data-confirm handler of admin.js (AdminUI.confirm), messages use AdminUI.toast. */
(function () {
  'use strict';
  var UI = window.AdminUI;
  var CFG = window.__MEDIA_CFG;
  if (!UI || !CFG) return;
  var ROWS = CFG.rows || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = UI.esc;
  function csrf() { var m = $('meta[name="csrf-token"]'); return m ? m.getAttribute('content') : ''; }
  function toast(t, o) { UI.toast(t, o); }
  function err(t, text) { UI.toast(t, { tone: 'danger', icon: 'error', text: text || '' }); }

  /* ---------- copy URL ---------- */
  function absolute(u) { try { return new URL(u, location.origin).href; } catch (e) { return u; } }
  function copyText(text) {
    var done = function () { toast('تم نسخ الرابط', { icon: 'content_copy' }); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else fallback();
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;opacity:0';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      if (ok) done(); else err('تعذّر النسخ تلقائياً', 'حدّد الرابط من خانة «رابط الملف» وانسخه يدوياً.');
    }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-copy]') : null;
    if (b) { e.preventDefault(); copyText(absolute(b.getAttribute('data-copy'))); }
  });

  /* ---------- details / edit drawer ---------- */
  var drawer = $('#md-drawer'), form = $('#md-form'), delForm = $('#md-del-form'), delBtn = $('#md-del');
  var useBox = $('#md-use'), curId = null, useReq = 0;
  function row(id) { return ROWS[String(id)] || null; }
  function dl(pairs) {
    return pairs.filter(function (p) { return p[1]; }).map(function (p) { return '<dt>' + esc(p[0]) + '</dt><dd>' + p[1] + '</dd>'; }).join('');
  }
  function preview(r) {
    var p = $('#md-prev');
    if (r.kind === 'image') p.innerHTML = '<img src="' + esc(r.url) + '" alt="">';
    else if (r.kind === 'video') p.innerHTML = '<video src="' + esc(r.url) + '" controls preload="metadata"></video>';
    else p.innerHTML = '<div class="md-prev-ico">' + UI.icon(r.icon) + '<span>' + esc(r.kind_label) + '</span></div>';
  }
  function setUse(html, tone) { useBox.className = 'md-use' + (tone ? ' is-' + tone : ''); useBox.innerHTML = html; }
  function open(id, trigger) {
    var r = row(id); if (!r || !drawer) return;
    curId = r.id;
    $('#md-d-title').textContent = r.title || 'تفاصيل الملف';
    $('#md-d-sub').textContent = r.kind_label + ' · ' + r.size;
    preview(r);
    $('#md-url').value = absolute(r.url);
    $('#md-dl').innerHTML = dl([
      ['اسم الملف الأصلي', '<bdi dir="ltr">' + esc(r.name || '—') + '</bdi>'], ['النوع', esc(r.kind_label) + (r.mime ? ' <bdi dir="ltr" class="muted">(' + esc(r.mime) + ')</bdi>' : '')],
      ['الحجم', esc(r.size)], ['الأبعاد', r.dims ? '<bdi dir="ltr">' + esc(r.dims) + '</bdi>' : ''], ['رُفع بواسطة', esc(r.by || '')], ['تاريخ الرفع', r.date ? '<bdi dir="ltr">' + esc(r.date) + '</bdi>' : '']
    ]);
    $('#md-title').value = r.title || ''; $('#md-alt').value = r.alt || ''; $('#md-cap').value = r.caption || '';
    $('#md-alt').closest('.field').hidden = r.kind !== 'image';
    form.action = CFG.urls.item + '/' + r.id;
    if (delForm) delForm.action = CFG.urls.item + '/' + r.id;
    if (delBtn) { delBtn.disabled = true; delBtn.title = ''; }
    if (!r.upload) {
      setUse('<span class="material-symbols-outlined" aria-hidden="true">lock</span><p>ملف من تصميم الموقع نفسه: يمكنك تعديل اسمه ونصه البديل، لكن لا يمكن حذفه من المكتبة.</p>', 'info');
    } else {
      setUse('<span class="material-symbols-outlined" aria-hidden="true">hourglass_top</span><p>جارٍ التحقق من أماكن استخدام الملف…</p>');
      var my = ++useReq;
      fetch(CFG.urls.item + '/' + r.id + '/usage', { credentials: 'same-origin', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } })
        .then(function (res) { return res.ok ? res.json() : Promise.reject(res.status); })
        .then(function (d) {
          if (my !== useReq || curId !== r.id) return;
          if (d.used) {
            setUse('<span class="material-symbols-outlined" aria-hidden="true">link</span><div><p><strong>الملف مستخدم في المحتوى، ولا يمكن حذفه الآن:</strong></p><ul>' +
              d.usages.map(function (u) { return '<li>' + esc(u.label) + (u.title ? ' — ' + esc(u.title) : '') + '</li>'; }).join('') + '</ul><p class="muted">أزله من هذه الأماكن أولاً ثم احذفه.</p></div>', 'warn');
            if (delBtn) delBtn.title = 'الملف مستخدم في المحتوى';
          } else {
            setUse('<span class="material-symbols-outlined" aria-hidden="true">check_circle</span><p>لا يستخدم أي محتوى هذا الملف حالياً، ويمكن حذفه بأمان.</p>', 'ok');
            if (delBtn) delBtn.disabled = false;
          }
        })
        .catch(function () {
          if (my !== useReq) return;
          setUse('<span class="material-symbols-outlined" aria-hidden="true">error</span><p>تعذّر التحقق من الاستخدام. سيتحقق الخادم عند محاولة الحذف.</p>', 'warn');
          if (delBtn) delBtn.disabled = false;
        });
    }
    UI.Drawer.open(drawer, { returnFocus: trigger });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-open]') : null;
    if (b && !e.target.closest('.md-sel')) { e.preventDefault(); open(b.getAttribute('data-open'), b); }
  });
  $$('[data-close-drawer]', drawer || document).forEach(function (b) { b.addEventListener('click', function () { UI.Drawer.close(drawer); }); });
  if (drawer) drawer.addEventListener('transitionend', function () { if (!drawer.classList.contains('is-open')) { var v = $('video', drawer); if (v) v.pause(); } });

  /* ---------- selection + bulk delete ---------- */
  var all = $('#md-all'), countEl = $('#md-sel-count'), bulkBtn = $('#md-bulk-btn'), bulk = $('#md-bulk');
  function checks() { return $$('.md-check'); }
  function sync() {
    var cs = checks(), sel = cs.filter(function (c) { return c.checked; });
    cs.forEach(function (c) { var card = c.closest('.md-card'); if (card) card.classList.toggle('is-selected', c.checked); });
    if (countEl) countEl.textContent = sel.length ? 'تم تحديد ' + sel.length : 'لم يُحدَّد شيء';
    if (bulkBtn) bulkBtn.disabled = !sel.length;
    if (all) { all.checked = cs.length > 0 && sel.length === cs.length; all.indeterminate = sel.length > 0 && sel.length < cs.length; }
  }
  document.addEventListener('change', function (e) {
    if (e.target.classList && e.target.classList.contains('md-check')) sync();
    else if (e.target === all) { checks().forEach(function (c) { c.checked = all.checked; }); sync(); }
  });
  if (bulkBtn && bulk) {
    bulkBtn.addEventListener('click', function () {
      var sel = checks().filter(function (c) { return c.checked; });
      var box = $('#md-bulk-ids'); box.innerHTML = '';
      sel.forEach(function (c) { var i = document.createElement('input'); i.type = 'hidden'; i.name = 'ids[]'; i.value = c.value; box.appendChild(i); });
      bulk.setAttribute('data-confirm', 'سيُحذف ' + sel.length + ' ملف نهائياً. الملفات المستخدمة في المحتوى لن تُحذف وسيتم تخطّيها.');
    });
  }
  sync();

  /* ---------- upload ---------- */
  var drop = $('#md-drop'), input = $('#md-file'), list = $('#md-uploads'), pick = $('#md-pick');
  if (drop && input && list) {
    var busy = false, okCount = 0;
    if (pick) pick.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () { var f = Array.prototype.slice.call(input.files || []); input.value = ''; if (f.length) start(f); });
    ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-over'); }); });
    ['dragleave', 'dragend', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { if (ev === 'drop' || !drop.contains(e.relatedTarget)) drop.classList.remove('is-over'); }); });
    drop.addEventListener('drop', function (e) { e.preventDefault(); var f = Array.prototype.slice.call((e.dataTransfer && e.dataTransfer.files) || []); if (f.length) start(f); });
    // dropping a file anywhere else must not make the browser navigate away from the page
    ['dragover', 'drop'].forEach(function (ev) { window.addEventListener(ev, function (e) { if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') >= 0) e.preventDefault(); }); });

    var fmt = UI.fmtSize || function (n) { return Math.round(n / 1024) + ' KB'; };
    function kindOf(name) { var m = /\.([a-z0-9]+)$/i.exec(name || ''); var ext = m ? m[1].toLowerCase() : ''; return { ext: ext, kind: CFG.kinds[ext] || 'document' }; }
    function addRow(f) {
      var li = document.createElement('li'); li.className = 'md-up';
      li.innerHTML = '<span class="md-up-name">' + esc(f.name) + ' <span class="muted">· ' + esc(fmt(f.size)) + '</span></span><span class="md-up-state">في الانتظار</span><div class="progress navy" aria-hidden="true"><span style="width:0"></span></div>';
      list.appendChild(li); return li;
    }
    function fail(li, msg) { li.classList.add('is-err'); $('.md-up-state', li).textContent = msg; var p = $('.progress', li); if (p) p.remove(); }
    function one(f) {
      return new Promise(function (resolve) {
        var li = addRow(f), k = kindOf(f.name);
        if (CFG.exts.indexOf(k.ext) < 0) { fail(li, 'نوع الملف غير مدعوم'); return resolve(false); }
        if (f.size > (CFG.limits[k.kind] || CFG.limits.document)) { fail(li, 'أكبر من الحد المسموح (' + CFG.limitLabels[k.kind === 'image' ? 'image' : k.kind === 'video' ? 'video' : 'document'] + ')'); return resolve(false); }
        if (f.size <= 0) { fail(li, 'الملف فارغ'); return resolve(false); }
        var fd = new FormData(); fd.append('files[]', f, f.name);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', CFG.urls.store);
        xhr.setRequestHeader('Accept', 'application/json'); xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); xhr.setRequestHeader('X-CSRF-TOKEN', csrf());
        var bar = $('.progress > span', li), st = $('.md-up-state', li);
        st.textContent = 'جارٍ الرفع…';
        xhr.upload.onprogress = function (e) { if (e.lengthComputable && bar) { var pc = Math.round(e.loaded / e.total * 100); bar.style.width = pc + '%'; st.textContent = pc + '%'; } };
        xhr.onload = function () {
          var d = null; try { d = JSON.parse(xhr.responseText); } catch (e) { d = null; }
          if (xhr.status >= 200 && xhr.status < 300) {
            st.textContent = 'تم الرفع'; li.classList.add('is-ok'); var p = $('.progress', li); if (p) p.remove();
            if (d && d.errors && d.errors.length) fail(li, d.errors[0]); else okCount++;
            resolve(true);
          } else {
            var m = d && (d.message || (d.errors && d.errors[0])) || (xhr.status === 419 ? 'انتهت الجلسة، أعد تحميل الصفحة' : xhr.status === 413 ? 'حجم الملف أكبر من الحد المسموح في الخادم' : xhr.status === 403 ? 'لا تملك صلاحية الرفع' : 'تعذّر الرفع');
            if (d && d.errors && !Array.isArray(d.errors)) { var first = Object.keys(d.errors)[0]; if (first) m = [].concat(d.errors[first])[0]; }
            fail(li, m); resolve(false);
          }
        };
        xhr.onerror = function () { fail(li, 'انقطع الاتصال أثناء الرفع'); resolve(false); };
        xhr.send(fd);
      });
    }
    function start(files) {
      if (busy) { toast('انتظر انتهاء الرفع الحالي', { tone: 'info' }); return; }
      if (files.length > 20) { err('الحد الأقصى 20 ملفاً في كل مرة'); files = files.slice(0, 20); }
      busy = true; okCount = 0; list.innerHTML = '';
      var chain = Promise.resolve();
      files.forEach(function (f) { chain = chain.then(function () { return one(f); }); });
      chain.then(function () {
        busy = false;
        if (okCount) { toast('تم رفع ' + okCount + ' ملف'); setTimeout(function () { location.reload(); }, 1200); }
        else err('لم يُرفع أي ملف', 'راجع الأسباب أسفل منطقة الرفع.');
      });
    }
  }
})();
