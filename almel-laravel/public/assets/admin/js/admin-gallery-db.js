/* Gallery page, 100% database backed (Laravel JSON API: /admin/gallery-items and /admin/gallery-albums).
   Loaded after admin.js on /admin/gallery; admin.js skips its demo page logic (window.__DB_PAGES). */
(function () {
  'use strict';
  var U = window.AdminUI;
  if (!U || document.body.getAttribute('data-page') !== 'gallery') return;

  var MAXMB = (window.__GAL_OPTS && window.__GAL_OPTS.maxMb) || 10;
  var esc = U.esc, icon = U.icon, toast = U.toast, emptyState = U.emptyState;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  /* ---------- API ---------- */
  function csrf() { var m = document.querySelector('meta[name="csrf-token"]'); return m ? m.getAttribute('content') : ''; }
  function api(method, url, body) {
    var opt = { method: method, credentials: 'same-origin', headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': csrf() } };
    if (body instanceof FormData) opt.body = body;
    else if (body !== undefined) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
    return fetch(url, opt).then(function (r) {
      return r.text().then(function (t) {
        var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) { j = null; }
        if (r.ok) return j || {};
        var err = { status: r.status, message: (j && j.message) || '', errors: (j && j.errors) || {} };
        if (r.status === 419) err.message = 'انتهت الجلسة. أعد تحميل الصفحة ثم حاول مجدداً.';
        else if (r.status === 401) { err.message = 'انتهت جلسة الدخول.'; setTimeout(function () { location.href = '/admin/login'; }, 800); }
        else if (r.status === 403) err.message = 'ليست لديك صلاحية لهذا الإجراء.';
        else if (r.status === 404) err.message = err.message || 'العنصر غير موجود.';
        else if (r.status >= 500) err.message = 'تعذّر الاتصال بالخادم. حاول مرة أخرى.';
        else if (r.status === 413) err.message = 'حجم الملف أكبر من المسموح.';
        throw err;
      });
    }, function () { throw { status: 0, message: 'تعذّر الاتصال بالخادم. تحقق من الإنترنت.', errors: {} }; });
  }
  function firstError(e) {
    if (e && e.errors) { var k = Object.keys(e.errors); if (k.length && e.errors[k[0]] && e.errors[k[0]][0]) return e.errors[k[0]][0]; }
    return (e && e.message) || 'حدث خطأ غير متوقع.';
  }
  function fail(e, title) { toast(title || 'تعذّر تنفيذ العملية', { text: firstError(e), tone: 'danger', icon: 'error' }); }
  function countWord(n) { return n === 1 ? 'صورة واحدة' : n === 2 ? 'صورتين' : n + (n <= 10 ? ' صور' : ' صورة'); }

  function gallery() {
    var items = [], albums = [], loaded = false, failed = false;
    var st = { album: 'all', sel: new Set(), active: null };
    var grid = $('#g-grid'), panel = $('#g-panel'), mq = matchMedia('(max-width: 1279px)');
    function byId(id) { for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i]; return null; }
    function albumLabel(slug) { for (var i = 0; i < albums.length; i++) if (albums[i].slug === slug) return albums[i].label; return 'بدون ألبوم'; }
    function fillAlbumSelects() {
      var opts = albums.map(function (a) { return '<option value="' + esc(a.slug) + '">' + esc(a.label) + '</option>'; }).join('');
      $('#bulk-move').innerHTML = '<option value="">نقل إلى ألبوم…</option>' + opts;
      var cur = $('#gp-album').value;
      $('#gp-album').innerHTML = '<option value="">بدون ألبوم</option>' + opts;
      $('#gp-album').value = cur;
    }
    function renderChips() {
      var chips = [{ slug: 'all', label: 'كل الصور' }].concat(albums);
      $('#g-albums').innerHTML = chips.map(function (a) {
        var c = a.slug === 'all' ? items.length : items.filter(function (g) { return g.album === a.slug; }).length;
        return '<button type="button" class="chip-btn" data-album="' + esc(a.slug) + '" aria-pressed="' + (st.album === a.slug) + '">' + esc(a.label) + '<span class="c">' + (loaded ? c : '') + '</span></button>';
      }).join('');
      $$('[data-album]').forEach(function (b) { b.addEventListener('click', function () { st.album = b.getAttribute('data-album'); renderChips(); renderGrid(); }); });
    }
    function visible() { return items.filter(function (g) { return st.album === 'all' || g.album === st.album; }); }
    function renderGrid() {
      var list = visible();
      grid.classList.toggle('has-selection', st.sel.size > 0);
      if (!loaded) {
        grid.innerHTML = '<li style="grid-column:1/-1">' + (failed
          ? emptyState('cloud_off', 'تعذّر تحميل الصور', 'تحقق من الاتصال ثم أعد المحاولة.', '<button type="button" class="btn btn-primary" id="g-retry">' + icon('refresh') + 'إعادة المحاولة</button>')
          : emptyState('hourglass_top', 'جارٍ تحميل الصور…', 'لحظات من فضلك.', '')) + '</li>';
        var r = $('#g-retry'); if (r) r.addEventListener('click', load);
        syncBulk(); return;
      }
      if (!list.length) {
        grid.innerHTML = '<li style="grid-column:1/-1">' + emptyState('photo_library', st.album === 'all' ? 'المعرض فارغ' : 'هذا الألبوم فارغ', 'اسحب الصور إلى منطقة الرفع أعلاه أو اخترها من جهازك لإضافتها إلى هذا الألبوم.', '') + '</li>';
      } else {
        grid.innerHTML = list.map(function (g) {
          var on = st.sel.has(g.id);
          return '<li class="gtile' + (on ? ' is-selected' : '') + (st.active === g.id ? ' is-active' : '') + '" draggable="true" data-tile="' + g.id + '"><img src="' + esc(g.src) + '" alt="' + esc(g.alt || '') + '" loading="lazy" draggable="false">' +
            '<button type="button" class="g-open" data-open="' + g.id + '" aria-label="تفاصيل الصورة: ' + esc(g.title) + '"></button>' +
            '<span class="g-check"><input type="checkbox" class="checkbox" data-sel="' + g.id + '" aria-label="تحديد ' + esc(g.title) + '"' + (on ? ' checked' : '') + '></span>' +
            (g.isNew ? '<span class="pill no-dot g-new">جديد</span>' : '') + '<span class="g-cap" aria-hidden="true">' + esc(g.title) + '</span></li>';
        }).join('');
      }
      $$('[data-sel]', grid).forEach(function (cb) { cb.addEventListener('change', function () { var id = +cb.getAttribute('data-sel'); cb.checked ? st.sel.add(id) : st.sel.delete(id); cb.closest('.gtile').classList.toggle('is-selected', cb.checked); grid.classList.toggle('has-selection', st.sel.size > 0); syncBulk(); }); });
      $$('[data-open]', grid).forEach(function (b) { b.addEventListener('click', function () { openDetail(+b.getAttribute('data-open'), b); }); });
      wireDnd();
      syncBulk();
    }
    function syncBulk() {
      var n = st.sel.size;
      $('#g-bulk').hidden = !n;
      $('#g-bulk-count').textContent = 'تم تحديد ' + countWord(n);
    }
    function renderPanel() {
      var g = st.active ? byId(st.active) : null;
      $('#gp-empty').hidden = !!g; $('#gp-form').hidden = !g;
      if (!g) return;
      $('#gp-img').src = g.src; $('#gp-img').alt = g.alt || '';
      $('#gp-title').value = g.title; $('#gp-alt').value = g.alt || ''; $('#gp-album').value = g.album || '';
      $('#gp-dims').textContent = g.dims || '—'; $('#gp-size').textContent = g.size || '—';
      $('#gp-alt').dispatchEvent(new Event('input'));
    }
    function openDetail(id, trigger) {
      st.active = id; renderPanel();
      $$('.gtile', grid).forEach(function (t) { var b = $('[data-open]', t); t.classList.toggle('is-active', b && +b.getAttribute('data-open') === id); });
      if (mq.matches) { panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); U.Drawer.open(panel, { focus: '#gp-title', returnFocus: trigger }); }
      else setTimeout(function () { $('#gp-title').focus(); }, 30);
    }

    /* drag & drop re-ordering (saved to the database) */
    var dragId = null;
    function wireDnd() {
      $$('.gtile[data-tile]', grid).forEach(function (t) {
        t.addEventListener('dragstart', function (e) { dragId = +t.getAttribute('data-tile'); t.style.opacity = '.5'; try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(dragId)); } catch (x) { /* old browsers */ } });
        t.addEventListener('dragend', function () { t.style.opacity = ''; dragId = null; });
        t.addEventListener('dragover', function (e) { if (dragId !== null) e.preventDefault(); });
        t.addEventListener('drop', function (e) {
          if (dragId === null) return; e.preventDefault();
          var to = +t.getAttribute('data-tile'); if (to === dragId) return;
          reorder(dragId, to);
        });
      });
    }
    function reorder(fromId, toId) {
      var list = visible(), fi = -1, ti = -1;
      list.forEach(function (g, i) { if (g.id === fromId) fi = i; if (g.id === toId) ti = i; });
      if (fi < 0 || ti < 0) return;
      var before = items.slice();
      var moved = list.splice(fi, 1)[0]; list.splice(ti, 0, moved);
      var li = 0;
      items = items.map(function (g) { return (st.album === 'all' || g.album === st.album) ? list[li++] : g; });
      renderGrid();
      api('POST', '/admin/gallery-items/reorder', { ids: items.map(function (g) { return g.id; }) }).then(function () { toast('تم حفظ الترتيب', { icon: 'swap_horiz' }); }, function (e) { items = before; renderGrid(); fail(e, 'تعذّر حفظ الترتيب'); });
    }

    /* detail panel */
    panel._onClose = function () { panel.setAttribute('role', 'region'); panel.removeAttribute('aria-modal'); };
    mq.addEventListener('change', function () { if (!mq.matches) U.Drawer.close(panel); });
    $('#gp-alt').addEventListener('input', function () { var c = $('#gp-alt-count'); c.textContent = this.value.length + ' / 125'; c.classList.toggle('over', this.value.length > 125); });
    $('#gp-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var g = byId(st.active); if (!g) return;
      if (!$('#gp-title').value.trim()) { $('#gp-title').setAttribute('aria-invalid', 'true'); $('#gp-title').focus(); return; }
      $('#gp-title').removeAttribute('aria-invalid');
      var btn = $('#gp-form button[type=submit]'); btn.disabled = true;
      api('PUT', '/admin/gallery-items/' + g.id, { title: $('#gp-title').value.trim(), alt_text: $('#gp-alt').value.trim(), album: $('#gp-album').value || null }).then(function (res) {
        btn.disabled = false;
        items = items.map(function (x) { return x.id === g.id ? Object.assign(res.data, { isNew: x.isNew }) : x; });
        renderChips(); renderGrid(); renderPanel(); toast('تم حفظ بيانات الصورة');
        if (mq.matches) U.Drawer.close(panel);
      }, function (er) { btn.disabled = false; fail(er, 'تعذّر حفظ بيانات الصورة'); });
    });
    function remove(ids, label) {
      return U.confirmDelete(label).then(function (ok) {
        if (!ok) return;
        var p = ids.length === 1 ? api('DELETE', '/admin/gallery-items/' + ids[0]) : api('POST', '/admin/gallery-items/bulk-delete', { ids: ids });
        p.then(function () {
          items = items.filter(function (g) { return ids.indexOf(g.id) < 0; });
          ids.forEach(function (i) { st.sel.delete(i); });
          if (ids.indexOf(st.active) > -1) { st.active = null; if (mq.matches) U.Drawer.close(panel); renderPanel(); }
          renderChips(); renderGrid(); toast(ids.length > 1 ? 'تم حذف ' + ids.length + ' صور' : 'تم حذف الصورة', { tone: 'danger' });
        }, function (e) { fail(e, 'تعذّر حذف الصور'); });
      });
    }
    $('#gp-delete').addEventListener('click', function () { var g = byId(st.active); if (g) remove([g.id], 'الصورة «' + g.title + '»'); });
    $('#gp-copy').addEventListener('click', function () {
      var g = byId(st.active); if (!g) return;
      var url = location.origin + g.src;
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).catch(function () {});
      toast('تم نسخ رابط الصورة', { text: url.slice(0, 60), icon: 'link' });
    });
    $('#g-bulk-delete').addEventListener('click', function () { var ids = Array.from(st.sel); remove(ids, ids.length + ' من الصور'); });
    $('#g-bulk-clear').addEventListener('click', function () { st.sel.clear(); renderGrid(); });
    $('#bulk-move').addEventListener('change', function () {
      var a = this.value, sel = this; if (!a) return;
      var ids = Array.from(st.sel);
      api('POST', '/admin/gallery-items/bulk-move', { ids: ids, album: a }).then(function () {
        items.forEach(function (g) { if (st.sel.has(g.id)) g.album = a; });
        st.sel.clear(); sel.value = ''; renderChips(); renderGrid(); toast('تم نقل ' + ids.length + ' إلى «' + albumLabel(a) + '»', { icon: 'drive_file_move' });
      }, function (e) { sel.value = ''; fail(e, 'تعذّر نقل الصور'); });
    });
    $('#g-select-all').addEventListener('click', function () { visible().forEach(function (g) { st.sel.add(g.id); }); renderGrid(); });
    $('#new-album').addEventListener('click', function () {
      U.modal({ title: 'ألبوم جديد', icon: 'create_new_folder', body: '<div class="field mt-16"><label class="label" for="album-name">اسم الألبوم</label><input class="input" id="album-name" maxlength="40" placeholder="مثال: حملة الشتاء"></div>', confirmText: 'إنشاء', focus: '#album-name',
        validate: function (d) { var i = $('#album-name', d); if (!i.value.trim()) { i.setAttribute('aria-invalid', 'true'); i.focus(); return false; } return true; },
        getValue: function (d) { return $('#album-name', d).value.trim(); } })
        .then(function (name) {
          if (!name) return;
          api('POST', '/admin/gallery-albums', { name: name }).then(function (res) {
            albums.push(res.data); st.album = res.data.slug; fillAlbumSelects(); renderChips(); renderGrid(); toast('تم إنشاء الألبوم «' + res.data.label + '»', { icon: 'folder' });
          }, function (e) { fail(e, 'تعذّر إنشاء الألبوم'); });
        });
    });

    /* upload: one request per file (a failed file never blocks the others) */
    function addFiles(files) {
      var target = st.album === 'all' ? (albums.some(function (a) { return a.slug === 'field'; }) ? 'field' : '') : st.album;
      var ok = [], bad = 0, i = 0;
      var run = function () {
        if (i >= files.length) {
          if (ok.length) { items = ok.concat(items); renderChips(); renderGrid(); toast('تمت إضافة ' + countWord(ok.length), { text: 'حُفظت في قاعدة البيانات ومجلد التخزين.', icon: 'cloud_upload' }); }
          return;
        }
        var f = files[i++];
        if (!/^image\/(jpeg|png|webp|gif)$/.test(f.type)) { bad++; toast('الملف غير مدعوم: ' + f.name, { text: 'يمكن رفع الصور فقط (JPG، PNG، WebP).', tone: 'danger', icon: 'error' }); return run(); }
        if (f.size > MAXMB * 1024 * 1024) { bad++; toast('الصورة كبيرة جداً: ' + f.name, { text: 'الحد الأقصى ' + MAXMB + ' ميغابايت للصورة.', tone: 'danger', icon: 'error' }); return run(); }
        var fd = new FormData(); fd.append('files[]', f); if (target) fd.append('album', target);
        api('POST', '/admin/gallery-items', fd).then(function (res) { ok = res.data.concat(ok); }, function (e) { bad++; fail(e, 'تعذّر رفع ' + f.name); }).then(run);
      };
      toast('جارٍ رفع ' + countWord(files.length) + '…', { icon: 'cloud_upload', tone: 'info', duration: 2200 });
      run();
    }
    (function wire() {
      var dz = $('#g-dropzone'), input = $('#g-file');
      ['dragenter', 'dragover'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('is-over'); }); });
      ['dragleave', 'dragend'].forEach(function (ev) { dz.addEventListener(ev, function (e) { if (!dz.contains(e.relatedTarget)) dz.classList.remove('is-over'); }); });
      dz.addEventListener('drop', function (e) {
        e.preventDefault(); dz.classList.remove('is-over');
        var files = Array.prototype.filter.call(e.dataTransfer.files || [], function (f) { return /^image\//.test(f.type); });
        if (files.length) addFiles(files); else toast('الملف غير مدعوم', { text: 'يمكن رفع الصور فقط (JPG، PNG، WebP).', tone: 'danger', icon: 'error' });
      });
      input.addEventListener('change', function () { var f = Array.prototype.slice.call(input.files || []); if (f.length) addFiles(f); input.value = ''; });
    })();
    $('#g-upload-btn').addEventListener('click', function () { $('#g-file').click(); });

    function load() {
      failed = false; loaded = false; renderGrid();
      api('GET', '/admin/gallery-items').then(function (res) {
        items = res.data; albums = res.albums; loaded = true;
        fillAlbumSelects(); renderChips(); renderGrid(); renderPanel();
      }, function (e) { failed = true; loaded = false; renderChips(); renderGrid(); fail(e, 'تعذّر تحميل المعرض'); });
    }
    fillAlbumSelects(); renderChips(); renderPanel(); load();
    if (location.hash === '#upload') setTimeout(function () { $('#g-file').focus(); $('#g-dropzone').scrollIntoView({ block: 'center' }); }, 200);
  }

  ready(function () { try { gallery(); } catch (err) { if (window.console) console.error(err); } });
})();
