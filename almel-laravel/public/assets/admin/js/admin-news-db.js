/* News list + news editor, 100% database backed (Laravel JSON API: /admin/articles).
   Loaded after admin.js on /admin/news and /admin/news-edit; admin.js skips its demo page logic (window.__DB_PAGES). */
(function () {
  'use strict';
  var U = window.AdminUI;
  var PAGE = document.body.getAttribute('data-page');
  if (!U || (PAGE !== 'news' && PAGE !== 'news-edit')) return;

  var OPTS = window.__NEWS_OPTS || { categories: [], statuses: [], statusLabels: {} };
  var MAXMB = OPTS.maxMb || 10;
  var esc = U.esc, icon = U.icon, toast = U.toast, pill = U.pill, emptyState = U.emptyState;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  var TONE = { published: 'info', draft: 'neutral', scheduled: 'warn' };
  function statusLabel(k) { return (OPTS.statusLabels && OPTS.statusLabels[k]) || ({ published: 'منشور', draft: 'مسودة', scheduled: 'مجدول' })[k] || k; }

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

  function setSidebarDrafts(n) {
    var link = document.querySelector('#sidebar a[href="/admin/news"]'); if (!link) return;
    var c = link.querySelector('[data-count="news"]'), sr = link.querySelector('[data-count-sr="news"]');
    if (!n) { if (c) c.remove(); if (sr) sr.textContent = ''; return; }
    if (!c) { c = document.createElement('span'); c.className = 'sb-count'; c.setAttribute('data-count', 'news'); c.setAttribute('aria-hidden', 'true'); link.appendChild(c); }
    if (!sr) { sr = document.createElement('span'); sr.className = 'sr-only'; sr.setAttribute('data-count-sr', 'news'); link.appendChild(sr); }
    c.textContent = n; sr.textContent = '، ' + n + ' مسودات';
  }

  function fillSelect(sel, list, ph) {
    sel.innerHTML = (ph ? '<option value="' + esc(ph.value) + '">' + esc(ph.label) + '</option>' : '') + list.map(function (o) { return '<option value="' + esc(o.key) + '">' + esc(o.label) + '</option>'; }).join('');
  }
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
  var pad = function (x) { return String(x).padStart(2, '0'); };
  function toLocalInput(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }

  /* =====================================================================
     NEWS LIST
     ===================================================================== */
  function newsList() {
    var st = { tab: 'all', q: '', cat: '', page: 1, per: 6 };
    var tabsEl = $('#news-tabs'), body = $('#news-body'), seq = 0, rows = [];
    fillSelect($('#n-cat'), OPTS.categories, { value: '', label: 'كل التصنيفات' });

    function setCounts(c) {
      $$('[data-tab-count]', tabsEl).forEach(function (el) { var k = el.getAttribute('data-tab-count'); el.textContent = c && c[k] != null ? c[k] : ''; });
      if (c) setSidebarDrafts(c.draft || 0);
    }
    function loading() { body.innerHTML = emptyState('hourglass_top', 'جارٍ تحميل الأخبار…', 'لحظات من فضلك.', ''); }
    function load() {
      var my = ++seq;
      var qs = 'status=' + encodeURIComponent(st.tab) + '&q=' + encodeURIComponent(st.q) + '&category=' + encodeURIComponent(st.cat) + '&page=' + st.page + '&per=' + st.per;
      if (!rows.length) loading();
      api('GET', '/admin/articles?' + qs).then(function (res) {
        if (my !== seq) return;
        if (res.meta.page < st.page && res.meta.pages >= 1) { st.page = res.meta.pages; return load(); }
        rows = res.data; setCounts(res.counts); render(res.meta);
      }, function (e) {
        if (my !== seq) return;
        body.innerHTML = emptyState('cloud_off', 'تعذّر تحميل الأخبار', firstError(e), '<button type="button" class="btn btn-primary" id="n-retry">' + icon('refresh') + 'إعادة المحاولة</button>');
        var b = $('#n-retry'); if (b) b.addEventListener('click', load);
        $('#news-pages').innerHTML = '';
      });
    }
    function render(meta) {
      if (!rows.length) {
        var lbl = st.tab === 'all' ? '' : statusLabel(st.tab);
        body.innerHTML = emptyState('article', lbl && !st.q && !st.cat ? 'لا توجد أخبار بحالة «' + lbl + '»' : 'لا توجد نتائج', 'أنشئ خبراً جديداً أو غيّر عوامل التصفية لعرض المزيد.', '<a class="btn btn-primary" href="/admin/news-edit">' + icon('add') + 'خبر جديد</a>');
      } else {
        body.innerHTML = '<div class="table-wrap" tabindex="0" role="region" aria-label="جدول الأخبار"><table class="table"><thead><tr><th scope="col">الخبر</th><th scope="col">التصنيف</th><th scope="col">الحالة</th><th scope="col">الكاتب</th><th scope="col">التاريخ</th><th scope="col">المشاهدات</th><th scope="col" class="col-actions"><span class="sr-only">إجراءات</span></th></tr></thead><tbody>' +
          rows.map(function (n) {
            var d = n.date ? U.fmtDate(new Date(n.date), { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
            return '<tr><td><a class="cell-media" href="/admin/news-edit?id=' + n.id + '"><img src="' + esc(n.image) + '" alt="" loading="lazy"><div style="min-width:0"><span class="t">' + esc(n.title) + '</span><span class="s">' + (n.tags || []).map(function (t) { return '#' + esc(t); }).join(' ') + '</span></div></a></td>' +
              '<td><span class="tag">' + esc(n.category_label || '—') + '</span></td><td>' + pill(statusLabel(n.status), TONE[n.status] || 'neutral') + '</td><td>' + esc(n.author) + '</td>' +
              '<td style="white-space:nowrap">' + (n.status === 'scheduled' ? icon('schedule', 'muted') + ' ' : '') + d + '</td>' +
              '<td class="num-cell">' + (n.views ? new Intl.NumberFormat('ar-EG-u-nu-latn').format(n.views) : '<span class="muted">—</span>') + '</td>' +
              '<td class="col-actions"><button type="button" class="icon-btn sm" data-menu="' + n.id + '" aria-haspopup="menu" aria-expanded="false" aria-label="إجراءات: ' + esc(n.title) + '">' + icon('more_horiz') + '</button></td></tr>';
          }).join('') + '</tbody></table></div>';
        $$('[data-menu]', body).forEach(function (b) {
          b.addEventListener('click', function () {
            var id = +b.getAttribute('data-menu');
            var n = rows.filter(function (x) { return x.id === id; })[0]; if (!n) return;
            U.rowMenu(b, [
              { icon: 'edit', label: 'تحرير', action: function () { location.href = '/admin/news-edit?id=' + n.id; } },
              n.status !== 'published'
                ? { icon: 'publish', label: 'نشر الآن', action: function () { api('PATCH', '/admin/articles/' + n.id + '/publish').then(function () { toast('تم نشر الخبر', { text: n.title }); load(); }, fail); } }
                : { icon: 'unpublished', label: 'إرجاع إلى المسودات', action: function () { api('PATCH', '/admin/articles/' + n.id + '/unpublish').then(function () { toast('أُعيد الخبر إلى المسودات', { tone: 'info', icon: 'inventory_2' }); load(); }, fail); } },
              '-',
              { icon: 'delete', label: 'حذف', danger: true, action: function () { U.confirmDelete('الخبر', '«' + n.title + '»').then(function (ok) { if (!ok) return; api('DELETE', '/admin/articles/' + n.id).then(function () { toast('تم حذف الخبر', { tone: 'danger' }); load(); }, fail); }); } }
            ]);
          });
        });
      }
      pagination($('#news-pages'), meta ? meta.total : rows.length, st.page, st.per, function (pg) { st.page = pg; load(); });
    }
    U.initTabs(tabsEl, function (tab) { st.tab = tab.getAttribute('data-value'); st.page = 1; $('#news-panel').setAttribute('aria-labelledby', tab.id); load(); });
    var t; $('#n-search').addEventListener('input', function (e) { clearTimeout(t); t = setTimeout(function () { st.q = e.target.value.trim(); st.page = 1; load(); }, 250); });
    $('#n-cat').addEventListener('change', function (e) { st.cat = e.target.value; st.page = 1; load(); });
    load();
  }

  /* =====================================================================
     NEWS EDITOR
     ===================================================================== */
  function newsEditor() {
    var id = new URLSearchParams(location.search).get('id');
    id = id && /^\d+$/.test(id) ? id : null;
    var title = $('#ne-title'), slug = $('#ne-slug'), meta = $('#ne-meta'), statusSel = $('#ne-status'), catSel = $('#ne-cat');
    /* shared rich-text editor (public/assets/admin/js/admin-editor.js) */
    var editor = window.AdminEditor.create({
      el: '#ne-editor', id: 'ne-body', wordsId: 'ne-words', labelledby: 'ne-body-label', maxMb: MAXMB, minHeight: 380,
      placeholder: 'ابدأ كتابة الخبر هنا… استخدم شريط الأدوات للتنسيق وإدراج الصور والألبومات والفيديو.'
    });
    var tags = [], coverId = null, saved = null, dirty = false, slugTouched = false, busy = false;
    fillSelect(catSel, OPTS.categories); fillSelect(statusSel, OPTS.statuses);
    var authorEl = $('#ne-author'); if (authorEl) authorEl.textContent = OPTS.user || '';

    function slugify(s) { return U.normalize(s).replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60); }
    function autoGrow() { title.style.height = 'auto'; title.style.height = title.scrollHeight + 'px'; }
    function syncSeo() {
      var t = title.value.trim() || 'عنوان الخبر يظهر هنا';
      if (!slugTouched) slug.value = slugify(title.value) || '';
      $('#seo-t').textContent = t + ' | جمعية الشمال للتنمية والتطوير المجتمعي';
      $('#seo-u').textContent = 'shamal-society.org › news › ' + (slug.value || 'slug');
      var d = meta.value.trim() || editor.getText().slice(0, 155) || 'أضف وصفاً مختصراً يظهر في نتائج محركات البحث ومشاركات الشبكات الاجتماعية.';
      $('#seo-d').textContent = d.length > 160 ? d.slice(0, 157) + '…' : d;
      var c = $('#ne-meta-count'); c.textContent = meta.value.length + ' / 160'; c.classList.toggle('over', meta.value.length > 160);
    }
    function renderTags() {
      $('#ne-tags-list').innerHTML = tags.map(function (t, i) { return '<li class="chip">' + esc(t) + '<button type="button" data-rm="' + i + '" aria-label="إزالة الوسم ' + esc(t) + '">' + icon('close') + '</button></li>'; }).join('');
    }
    function wordCount() { /* the shared editor keeps its own «N كلمة · M د قراءة» footer */ }
    function markDirty() { dirty = true; $('#save-state').innerHTML = icon('edit') + 'تغييرات غير محفوظة'; }
    function markSaved(txt) { dirty = false; $('#save-state').innerHTML = icon('cloud_done') + (txt || 'تم الحفظ في قاعدة البيانات'); }
    function syncPublishBtn() {
      var s = statusSel.value;
      $('#ne-publish .btn-text').textContent = s === 'scheduled' ? 'جدولة النشر' : s === 'draft' ? 'حفظ المسودة' : (saved && saved.status === 'published' ? 'تحديث الخبر' : 'نشر الآن');
      $('#ne-date-field').hidden = s === 'draft'; $('#ne-draft').hidden = s === 'draft';
      var ic = $('#ne-publish .material-symbols-outlined'); if (ic) { ic.textContent = s === 'draft' ? 'save' : s === 'scheduled' ? 'schedule_send' : 'send'; ic.classList.toggle('flip-rtl', s !== 'draft'); }
    }
    function setCover(src) {
      $('#ne-cover-preview').hidden = !src; $('#ne-dropzone').hidden = !!src;
      if (src) $('#ne-cover-img').src = src;
    }
    function selectSet(sel, v) { if (v && !$$('option', sel).some(function (o) { return o.value === v; })) sel.insertAdjacentHTML('beforeend', '<option value="' + esc(v) + '">' + esc(v) + '</option>'); sel.value = v == null ? '' : v; }

    function applyArticle(a) {
      saved = a; id = String(a.id);
      $('#ne-heading').textContent = 'تحرير الخبر';
      document.title = 'تحرير: ' + a.title + ' — لوحة التحكم';
      title.value = a.title; selectSet(catSel, a.category); selectSet(statusSel, a.status);
      tags = (a.tags || []).slice(); renderTags();
      slug.value = a.slug || ''; slugTouched = true;
      meta.value = a.seo_description || a.excerpt || '';
      editor.setHTML(a.body || '', true);
      coverId = a.cover ? a.cover.id : null; setCover(a.cover ? a.cover.url : null);
      if (a.published_at) $('#ne-date').value = toLocalInput(new Date(a.published_at));
      var au = $('#ne-author'); if (au && a.author) au.textContent = a.author;
      autoGrow(); wordCount(); syncSeo(); syncPublishBtn();
    }

    /* load */
    var t0 = new Date(); t0.setMinutes(0); t0.setHours(t0.getHours() + 1); $('#ne-date').value = toLocalInput(t0);
    renderTags(); autoGrow(); wordCount(); syncSeo(); syncPublishBtn();
    if (id) {
      busy = true; $('#save-state').innerHTML = icon('hourglass_top') + 'جارٍ تحميل الخبر…';
      api('GET', '/admin/articles/' + id).then(function (res) { applyArticle(res.data); busy = false; markSaved('لا توجد تغييرات بعد'); }, function (e) {
        fail(e, 'تعذّر تحميل الخبر'); setTimeout(function () { location.href = '/admin/news'; }, 1500);
      });
    }

    /* events */
    $('#ne-tags-list').addEventListener('click', function (e) { var b = e.target.closest('[data-rm]'); if (!b) return; tags.splice(+b.getAttribute('data-rm'), 1); renderTags(); markDirty(); $('#ne-tag-input').focus(); });
    $('#ne-tag-input').addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ',' || e.key === '،') && this.value.trim()) { e.preventDefault(); var v = this.value.trim().replace(/^#/, ''); if (tags.indexOf(v) < 0) tags.push(v); this.value = ''; renderTags(); markDirty(); }
      else if (e.key === 'Backspace' && !this.value && tags.length) { tags.pop(); renderTags(); markDirty(); }
    });
    statusSel.addEventListener('change', function () { syncPublishBtn(); markDirty(); });
    catSel.addEventListener('change', markDirty);
    $('#ne-date').addEventListener('change', markDirty);
    title.addEventListener('input', function () { autoGrow(); syncSeo(); markDirty(); });
    slug.addEventListener('input', function () { slugTouched = true; syncSeo(); markDirty(); });
    meta.addEventListener('input', function () { syncSeo(); markDirty(); });
    editor.onChange(function () { syncSeo(); markDirty(); });
    window.addEventListener('resize', autoGrow);
    window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

    /* cover upload */
    function uploadCover(file) {
      if (!file) return;
      if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) { toast('الملف غير مدعوم', { text: 'يمكن رفع الصور فقط (JPG، PNG، WebP).', tone: 'danger', icon: 'error' }); return; }
      if (file.size > MAXMB * 1024 * 1024) { toast('الصورة كبيرة جداً', { text: 'الحد الأقصى لحجم الصورة ' + MAXMB + ' ميغابايت.', tone: 'danger', icon: 'error' }); return; }
      var dz = $('#ne-dropzone'); dz.classList.add('is-over');
      var fd = new FormData(); fd.append('file', file);
      api('POST', '/admin/articles/cover', fd).then(function (res) {
        dz.classList.remove('is-over'); coverId = res.data.id; setCover(res.data.url); markDirty();
        toast('تم رفع صورة الغلاف', { text: 'ستُحفظ مع الخبر.', icon: 'image' });
      }, function (e) { dz.classList.remove('is-over'); fail(e, 'تعذّر رفع الصورة'); });
    }
    (function wire() {
      var dz = $('#ne-dropzone'), input = $('#ne-cover-input');
      ['dragenter', 'dragover'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('is-over'); }); });
      ['dragleave', 'dragend'].forEach(function (ev) { dz.addEventListener(ev, function (e) { if (!dz.contains(e.relatedTarget)) dz.classList.remove('is-over'); }); });
      dz.addEventListener('drop', function (e) { e.preventDefault(); dz.classList.remove('is-over'); var f = (e.dataTransfer.files || [])[0]; if (f) uploadCover(f); });
      input.addEventListener('change', function () { var f = input.files && input.files[0]; if (f) uploadCover(f); input.value = ''; });
    })();
    $('#ne-cover-change').addEventListener('click', function () { $('#ne-cover-input').click(); });
    $('#ne-cover-remove').addEventListener('click', function () { coverId = null; setCover(null); markDirty(); $('#ne-cover-input').focus(); });

    /* save */
    function validate() {
      if (title.value.trim().length < 8) {
        title.setAttribute('aria-invalid', 'true'); $('#ne-title-err').hidden = false; title.focus();
        toast('العنوان قصير جداً', { text: 'اكتب عنواناً من 8 أحرف على الأقل.', tone: 'danger', icon: 'error' }); return false;
      }
      title.removeAttribute('aria-invalid'); $('#ne-title-err').hidden = true; return true;
    }
    function payload(status) {
      var p = {
        title: title.value.trim(), slug: slug.value.trim(), category: catSel.value, status: status, tags: tags,
        body: editor.isEmpty() ? '' : editor.getHTML(), seo_description: meta.value.trim(), cover_media_id: coverId
      };
      if (status !== 'draft' || $('#ne-date').value) { var v = $('#ne-date').value; if (v && status !== 'draft') p.published_at = new Date(v).toISOString(); }
      return p;
    }
    function save(status, btn, okTitle) {
      if (busy || !validate()) return;
      if (!catSel.value) { toast('اختر التصنيف', { tone: 'danger', icon: 'error' }); catSel.focus(); return; }
      busy = true;
      var ic, old;
      if (btn) { btn.classList.add('is-loading'); ic = btn.querySelector('.material-symbols-outlined'); old = ic ? ic.outerHTML : ''; if (ic) ic.outerHTML = '<span class="spinner" aria-hidden="true"></span>'; }
      function restore() { if (btn) { btn.classList.remove('is-loading'); var sp = btn.querySelector('.spinner'); if (sp) sp.outerHTML = old; } }
      var req = id ? api('PUT', '/admin/articles/' + id, payload(status)) : api('POST', '/admin/articles', payload(status));
      req.then(function (res) {
        restore(); busy = false; var wasNew = !id;
        applyArticle(res.data); markSaved();
        if (wasNew) history.replaceState(null, '', '/admin/news-edit?id=' + res.data.id);
        var s = res.data.status;
        toast(okTitle || (s === 'scheduled' ? 'تمت جدولة الخبر' : s === 'draft' ? 'تم حفظ المسودة' : (wasNew ? 'تم نشر الخبر' : 'تم تحديث الخبر')),
          { text: s === 'scheduled' ? U.fmtDate(new Date(res.data.published_at), { day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' }) : 'حُفظ في قاعدة البيانات.', icon: s === 'draft' ? 'save' : undefined });
      }, function (e) {
        restore(); busy = false;
        if (e.errors && e.errors.title) { title.setAttribute('aria-invalid', 'true'); $('#ne-title-err').hidden = false; $('#ne-title-err span:last-child').textContent = e.errors.title[0]; title.focus(); }
        fail(e, 'تعذّر حفظ الخبر');
      }).then(function () { syncPublishBtn(); });
    }
    $('#ne-draft').addEventListener('click', function () { save('draft', this, 'تم حفظ المسودة'); });
    $('#ne-publish').addEventListener('click', function () { save(statusSel.value, this); });
    $('#ne-preview').addEventListener('click', function () {
      if (!saved) { toast('احفظ الخبر أولاً', { text: 'تتوفر المعاينة بعد الحفظ.', tone: 'info', icon: 'info' }); return; }
      window.open('/news/' + encodeURIComponent(saved.slug), '_blank');
    });
  }

  ready(function () { try { if (PAGE === 'news') newsList(); else newsEditor(); } catch (err) { if (window.console) console.error(err); } });
})();
