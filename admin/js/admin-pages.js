/* =========================================================================
   إدارة الصفحات — pages.html
   • Public pages list: status, last edit, author, SERP snippet, search +
     status filter, quick publish / hide toggles, duplicate, delete (confirm).
   • Editor drawer: name, browser title, slug, meta description, status,
     live Google-style SERP preview (desktop / mobile) + SEO checks.
   • Homepage sections: drag & drop (Pointer Events, AdminDnD), keyboard
     move, show / hide switches, live page outline.
   Persists to localStorage; "استعادة الافتراضي" restores the seed.
   ========================================================================= */
(function () {
  'use strict';
  function start() {
    var UI = window.AdminUI, B = window.BUILDER_DATA, DnD = window.AdminDnD;
    if (!UI || !B || !DnD || !document.getElementById('pg-body')) return;
    var D = window.ADMIN_DATA || {};
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var esc = UI.esc, icon = UI.icon, pill = UI.pill, toast = UI.toast, normalize = UI.normalize;
    var KEY_PAGES = 'almel-admin-pages', KEY_SECTIONS = 'almel-admin-home-sections';
    var ME = (D.user && D.user.name) || 'مدير المنصة';
    var DOMAIN = B.site.domain;
    var STATUS = {}; B.pageStatuses.forEach(function (s) { STATUS[s.id] = s; });
    if (window.AdminConstants) window.AdminConstants.all('page_status').forEach(function (c) { if (STATUS[c.key]) STATUS[c.key].label = c.label; });

    /* ---------- storage ---------- */
    function read(key) { try { var v = JSON.parse(localStorage.getItem(key)); return v; } catch (e) { return null; } }
    function write(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); return true; } catch (e) { return false; } }
    function seedPages() {
      var now = Date.now();
      return B.pages.map(function (p) { var c = Object.assign({}, p); c.updatedAt = now - p.mins * 60000; delete c.mins; return c; });
    }
    function seedSections() { return B.sections.map(function (s) { return { id: s.id, visible: true }; }); }
    function loadSections() {
      var saved = read(KEY_SECTIONS), known = {};
      B.sections.forEach(function (s) { known[s.id] = s; });
      if (!Array.isArray(saved)) return seedSections();
      var out = saved.filter(function (s) { return s && known[s.id]; }).map(function (s) { return { id: s.id, visible: s.visible !== false }; });
      B.sections.forEach(function (s) { if (!out.some(function (o) { return o.id === s.id; })) out.push({ id: s.id, visible: true }); });
      return out;
    }
    var pages = (function () { var v = read(KEY_PAGES); return Array.isArray(v) && v.length ? v : seedPages(); })();
    var sections = loadSections();
    var SEC = {}; B.sections.forEach(function (s) { SEC[s.id] = s; });

    function flashSaved(el, text) {
      if (!el) return;
      el.innerHTML = icon('cloud_done') + '<span>' + esc(text || 'حُفظ الآن') + '</span>';
      el.classList.remove('is-pulse'); void el.offsetWidth; el.classList.add('is-pulse');
    }
    function savePages() { write(KEY_PAGES, pages); flashSaved($('#pg-saved'), 'حُفظت التغييرات الآن'); }
    function saveSections() { write(KEY_SECTIONS, sections); flashSaved($('#sec-saved'), 'حُفظ الترتيب الآن'); }

    var live = document.createElement('p'); live.className = 'sr-only'; live.setAttribute('aria-live', 'assertive'); document.getElementById('main').appendChild(live);
    function announce(t) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 30); }
    function toastUndo(title, opts, undo) {
      var t = toast(title, opts);
      if (!undo || !t) return t;
      var b = document.createElement('button'); b.type = 'button'; b.className = 't-undo'; b.textContent = 'تراجع';
      b.addEventListener('click', function () { undo(); var c = t.querySelector('.t-close'); if (c) c.click(); });
      var body = t.querySelector('.t-body'); if (body) body.appendChild(b);
      return t;
    }

    /* ---------- helpers ---------- */
    function pathOf(p) { return p.slug ? '/' + p.slug : '/'; }
    function urlOf(p) { return 'https://' + DOMAIN + (p.slug ? ' › ' + p.slug : ''); }
    function hrefOf(p) { return '../' + (p.file || (p.slug ? p.slug + '.html' : 'index.html')); }
    function trunc(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + ' …' : s; }
    function seoScore(p) {
      var t = (p.seoTitle || '').length, d = (p.meta || '').length;
      var issues = [];
      if (t < 30 || t > 60) issues.push(t < 30 ? 'العنوان قصير' : 'العنوان طويل');
      if (d < 70 || d > 160) issues.push(d < 70 ? 'الوصف قصير' : 'الوصف طويل');
      return issues;
    }
    function minsAgo(ts) { return Math.max(0, Math.round((Date.now() - ts) / 60000)); }
    function isHome(p) { return p.id === 'index'; }

    /* ---------- stats ---------- */
    function renderStats() {
      var c = { published: 0, draft: 0, hidden: 0 }, seo = 0;
      pages.forEach(function (p) { c[p.status] = (c[p.status] || 0) + 1; if (seoScore(p).length) seo++; });
      $('#pg-stats').innerHTML =
        '<div><dt>إجمالي الصفحات</dt><dd><b>' + pages.length + '</b><span class="tag">' + icon('web') + 'الموقع العام</span></dd></div>' +
        '<div><dt>منشورة</dt><dd><b>' + c.published + '</b>' + pill('ظاهرة للزوار', 'info') + '</dd></div>' +
        '<div><dt>مسودات ومخفية</dt><dd><b>' + (c.draft + c.hidden) + '</b>' + pill(c.draft + ' مسودة · ' + c.hidden + ' مخفية', 'neutral') + '</dd></div>' +
        '<div><dt>تحتاج تحسين SEO</dt><dd><b>' + seo + '</b>' + (seo ? pill('راجع العنوان والوصف', 'warn') : pill('ممتاز', 'info')) + '</dd></div>';
    }

    /* ---------- table ---------- */
    var st = { tab: 'all', q: '', newId: null };
    var tabsEl = $('#pg-tabs'), body = $('#pg-body');
    function counts() {
      $$('[data-tab-count]', tabsEl).forEach(function (el) { var k = el.getAttribute('data-tab-count'); el.textContent = k === 'all' ? pages.length : pages.filter(function (p) { return p.status === k; }).length; });
    }
    function filtered() {
      var q = normalize(st.q);
      return pages.filter(function (p) {
        return (st.tab === 'all' || p.status === st.tab) && (!q || normalize(p.title + ' ' + p.slug + ' ' + p.seoTitle + ' ' + p.meta + ' ' + p.kind).indexOf(q) > -1);
      });
    }
    function render() {
      counts(); renderStats();
      var list = filtered();
      $('#pg-count').textContent = list.length + ' من ' + pages.length + ' صفحة';
      if (!list.length) {
        body.innerHTML = UI.emptyState('find_in_page', st.q ? 'لا توجد صفحات مطابقة' : 'لا توجد صفحات بهذه الحالة', 'غيّر كلمات البحث أو عامل التصفية، أو أنشئ صفحة جديدة.', '<button type="button" class="btn btn-secondary" data-clear>' + icon('filter_alt_off') + 'مسح التصفية</button>');
        var c = $('[data-clear]', body); if (c) c.addEventListener('click', function () { st.q = ''; $('#pg-search').value = ''; setTab('all'); });
        return;
      }
      body.innerHTML = '<div class="table-wrap pg-wrap" tabindex="0" role="region" aria-label="جدول صفحات الموقع"><table class="table pg-table"><thead><tr>' +
        '<th scope="col">الصفحة</th><th scope="col">الحالة</th><th scope="col">معاينة نتيجة البحث</th><th scope="col">آخر تعديل</th><th scope="col" class="col-toggle">نشر</th><th scope="col" class="col-actions"><span class="sr-only">إجراءات</span></th></tr></thead><tbody>' +
        list.map(rowHTML).join('') + '</tbody></table></div>';
      if (st.newId) { var nr = $('tr[data-id="' + st.newId + '"]', body); if (nr) { nr.classList.add('is-new'); } st.newId = null; }
    }
    function rowHTML(p) {
      var s = STATUS[p.status] || STATUS.draft, issues = seoScore(p), home = isHome(p);
      var initials = String(p.author || '؟').replace(/[#\d]/g, '').trim().charAt(0) || '؟';
      return '<tr data-id="' + esc(p.id) + '" class="' + (p.status !== 'published' ? 'is-muted' : '') + '">' +
        '<td data-label="الصفحة"><div class="pg-cell"><span class="pg-ico">' + icon(p.icon || 'description') + '</span><div class="pg-cell-t">' +
          '<button type="button" class="pg-name" data-edit="' + esc(p.id) + '">' + esc(p.title) + '</button>' +
          '<span class="pg-sub"><span class="pg-path" dir="ltr">' + esc(pathOf(p)) + '</span><span class="dot-sep" aria-hidden="true">•</span>' + esc(p.kind || 'صفحة') + '</span></div></div></td>' +
        '<td data-label="الحالة">' + pill(s.label, s.tone) + '</td>' +
        '<td data-label="نتيجة البحث" class="pg-serp-cell"><div class="mini-serp"><span class="ms-url" dir="ltr">' + esc(urlOf(p)) + '</span><span class="ms-title">' + esc(trunc(p.seoTitle, 64)) + '</span><span class="ms-desc">' + esc(trunc(p.meta, 150)) + '</span>' +
          '<span class="ms-score ' + (issues.length ? 'warn' : 'ok') + '">' + icon(issues.length ? 'error' : 'check_circle') + (issues.length ? esc(issues.join('، ')) : 'جاهزة لمحركات البحث') + '</span></div></td>' +
        '<td data-label="آخر تعديل"><div class="pg-edit"><span class="avatar sand sm" aria-hidden="true">' + esc(initials) + '</span><div><span class="pg-when">' + esc(UI.ago(minsAgo(p.updatedAt))) + '</span><span class="pg-who">' + esc(p.author) + '</span></div></div></td>' +
        '<td data-label="نشر" class="col-toggle"><button type="button" class="switch" role="switch" data-pub="' + esc(p.id) + '" aria-checked="' + (p.status === 'published') + '" aria-label="نشر صفحة ' + esc(p.title) + '"' + (home ? ' disabled title="الصفحة الرئيسية تبقى منشورة دائماً"' : '') + '></button></td>' +
        '<td class="col-actions"><div class="pg-acts">' +
          '<button type="button" class="icon-btn sm" data-hide="' + esc(p.id) + '" aria-pressed="' + (p.status === 'hidden') + '" aria-label="' + (p.status === 'hidden' ? 'إظهار' : 'إخفاء') + ' صفحة ' + esc(p.title) + '" title="' + (p.status === 'hidden' ? 'إظهار الصفحة' : 'إخفاء الصفحة') + '"' + (home ? ' disabled' : '') + '>' + icon(p.status === 'hidden' ? 'visibility_off' : 'visibility') + '</button>' +
          '<button type="button" class="icon-btn sm" data-edit="' + esc(p.id) + '" aria-label="تحرير صفحة ' + esc(p.title) + '" title="تحرير">' + icon('edit') + '</button>' +
          '<button type="button" class="icon-btn sm" data-menu="' + esc(p.id) + '" aria-haspopup="menu" aria-expanded="false" aria-label="إجراءات أخرى: ' + esc(p.title) + '">' + icon('more_horiz') + '</button>' +
        '</div></td></tr>';
    }
    function byId(id) { for (var i = 0; i < pages.length; i++) if (pages[i].id === id) return pages[i]; return null; }
    function touch(p) { p.updatedAt = Date.now(); p.author = ME; }
    function setStatus(p, status, silent) {
      var prev = p.status;
      if (prev === status) return;
      p.status = status; touch(p); savePages(); render();
      if (silent) return;
      var msg = status === 'published' ? 'تم نشر الصفحة' : status === 'hidden' ? 'تم إخفاء الصفحة' : 'نُقلت الصفحة إلى المسودات';
      toastUndo(msg, { text: '«' + p.title + '»', tone: status === 'published' ? 'success' : 'info', icon: STATUS[status].icon, duration: 3600 }, function () { p.status = prev; savePages(); render(); announce('تم التراجع'); });
    }
    function uniqueSlug(base) {
      var s = (base || 'page') + '-copy', n = 2;
      while (pages.some(function (p) { return p.slug === s; })) s = (base || 'page') + '-copy-' + (n++);
      return s;
    }
    function duplicate(p) {
      var c = Object.assign({}, p);
      c.id = 'p' + Date.now().toString(36);
      c.title = 'نسخة من ' + p.title;
      c.seoTitle = p.seoTitle;
      c.slug = uniqueSlug(p.slug || 'home');
      c.file = c.slug + '.html';
      c.status = 'draft'; c.kind = p.kind === 'صفحة رئيسية' ? 'صفحة ثابتة' : p.kind;
      touch(c);
      pages.splice(pages.indexOf(p) + 1, 0, c);
      st.newId = c.id;
      savePages();
      if (st.tab !== 'all' && st.tab !== 'draft') setTab('all'); else render();
      toast('تم إنشاء نسخة كمسودة', { text: '«' + c.title + '» — ' + '/' + c.slug, icon: 'content_copy' });
    }
    function remove(p) {
      UI.confirmDelete('الصفحة', 'ستُحذف «' + p.title + '» من قائمة الصفحات، وتُزال روابطها من منشئ القائمة يدوياً. يمكنك التراجع مباشرة بعد الحذف.').then(function (ok) {
        if (!ok) return;
        var idx = pages.indexOf(p);
        pages.splice(idx, 1); savePages(); render();
        toastUndo('تم حذف الصفحة', { text: '«' + p.title + '»', tone: 'danger' }, function () { pages.splice(idx, 0, p); savePages(); render(); announce('أُعيدت الصفحة'); });
      });
    }

    body.addEventListener('click', function (e) {
      var b;
      if ((b = e.target.closest('[data-edit]'))) { openEditor(byId(b.getAttribute('data-edit')), b); return; }
      if ((b = e.target.closest('[data-hide]'))) { var p = byId(b.getAttribute('data-hide')); setStatus(p, p.status === 'hidden' ? 'published' : 'hidden'); focusAfter(p.id, '[data-hide]'); return; }
      if ((b = e.target.closest('[data-menu]'))) {
        var pg = byId(b.getAttribute('data-menu')), home = isHome(pg);
        var items = [
          { icon: 'edit', label: 'تحرير الصفحة و SEO', action: function () { openEditor(pg, b); } },
          { icon: 'open_in_new', label: 'معاينة في الموقع', action: function () { location.href = hrefOf(pg); } },
          { icon: 'content_copy', label: 'نسخ الصفحة (مسودة)', action: function () { duplicate(pg); } }
        ];
        if (!home) {
          items.push(pg.status === 'published' ? { icon: 'unpublished', label: 'إرجاع إلى المسودات', action: function () { setStatus(pg, 'draft'); } } : { icon: 'publish', label: 'نشر الآن', action: function () { setStatus(pg, 'published'); } });
          items.push('-');
          items.push({ icon: 'delete', label: 'حذف الصفحة', danger: true, action: function () { remove(pg); } });
        }
        UI.rowMenu(b, items);
      }
    });
    document.addEventListener('switch', function (e) {
      var sw = e.target; if (!sw.hasAttribute('data-pub')) return;
      var p = byId(sw.getAttribute('data-pub'));
      setStatus(p, e.detail.on ? 'published' : 'draft');
      focusAfter(p.id, '[data-pub]');
    });
    function focusAfter(id, sel) { var el = $('tr[data-id="' + id + '"] ' + sel, body); if (el) el.focus(); }

    var tabsApi = UI.initTabs(tabsEl, function (tab) { st.tab = tab.getAttribute('data-value'); $('#pg-panel').setAttribute('aria-labelledby', tab.id); $('#pg-status').value = st.tab; render(); });
    function setTab(v) { var t = $('[data-value="' + v + '"]', tabsEl); if (t) tabsApi.select(t); }
    $('#pg-status').addEventListener('change', function (e) { setTab(e.target.value); });
    var tmr; $('#pg-search').addEventListener('input', function (e) { clearTimeout(tmr); tmr = setTimeout(function () { st.q = e.target.value; render(); }, 120); });

    /* ---------- editor drawer ---------- */
    var drawer = $('#page-drawer'), form = $('#page-form'), editing = null, serpMode = 'desktop';
    var f = { name: $('#pf-name'), seo: $('#pf-seo'), slug: $('#pf-slug'), meta: $('#pf-meta'), status: $('#pf-status') };
    function setErr(input, msg) {
      var e = $('#' + input.id + '-err'); if (!e) return;
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      e.hidden = !msg; if (msg) $('span:last-child', e).textContent = msg;
    }
    function slugify(s) { return String(s || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''); }
    function updatePreview() {
      var t = f.seo.value.trim() || f.name.value.trim() || 'عنوان الصفحة', d = f.meta.value.trim(), slug = f.slug.value.trim();
      var tl = f.seo.value.trim().length, dl = d.length;
      var tc = $('#pf-seo-count'); tc.textContent = tl + ' / 60'; tc.classList.toggle('over', tl > 60);
      var dc = $('#pf-meta-count'); dc.textContent = dl + ' / 160'; dc.classList.toggle('over', dl > 160);
      $('#serp-url').textContent = 'https://' + DOMAIN + (slug ? ' › ' + slug : '');
      $('#serp-title').textContent = trunc(t, serpMode === 'mobile' ? 78 : 62);
      $('#serp-desc').textContent = d ? trunc(d, serpMode === 'mobile' ? 124 : 158) : 'لم يُكتب وصف بعد — سيختار محرك البحث مقتطفاً من محتوى الصفحة تلقائياً.';
      $('#serp-desc').classList.toggle('is-empty', !d);
      $('#serp').classList.toggle('is-mobile', serpMode === 'mobile');
      var checks = [
        { ok: tl >= 30 && tl <= 60, text: 'طول العنوان ' + tl + ' حرفاً', tip: 'المثالي بين 30 و60 حرفاً' },
        { ok: dl >= 70 && dl <= 160, text: 'طول الوصف ' + dl + ' حرفاً', tip: 'المثالي بين 70 و160 حرفاً' },
        { ok: editing && isHome(editing) ? true : /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 40, text: 'رابط قصير وواضح', tip: 'أحرف لاتينية صغيرة وشرطات' },
        { ok: /الشمال/.test(t), text: 'العنوان يتضمن اسم الجمعية', tip: 'يعزّز الثقة في نتائج البحث' }
      ];
      $('#seo-checks').innerHTML = checks.map(function (c) { return '<li class="' + (c.ok ? 'ok' : 'warn') + '">' + icon(c.ok ? 'check_circle' : 'error') + '<span>' + esc(c.text) + '<small> — ' + esc(c.tip) + '</small></span><span class="sr-only">' + (c.ok ? ' (جيد)' : ' (يحتاج تحسيناً)') + '</span></li>'; }).join('');
    }
    function openEditor(p, trigger) {
      editing = p || null;
      var home = p && isHome(p);
      $('#pd-title').textContent = p ? 'تحرير: ' + p.title : 'صفحة جديدة';
      $('#pd-sub').textContent = p ? 'آخر تعديل ' + UI.ago(minsAgo(p.updatedAt)) + ' بواسطة ' + p.author : 'تُنشأ الصفحة كمسودة حتى تنشرها.';
      f.name.value = p ? p.title : '';
      f.seo.value = p ? p.seoTitle : '';
      f.slug.value = p ? p.slug : '';
      f.meta.value = p ? p.meta : '';
      if (window.AdminConstants) window.AdminConstants.setValue(f.status, p ? p.status : 'draft'); else f.status.value = p ? p.status : 'draft';
      f.slug.disabled = !!home;
      f.status.disabled = !!home;
      $('#pf-slug-hint').textContent = home ? 'رابط الصفحة الرئيسية ثابت ولا يمكن تغييره.' : 'أحرف لاتينية صغيرة وأرقام وشرطات فقط.';
      [f.name, f.seo, f.slug].forEach(function (i) { setErr(i, ''); });
      f.slug._touched = !!p;
      updatePreview();
      UI.Drawer.open(drawer, { focus: '#pf-name', returnFocus: trigger || document.activeElement });
    }
    ['input', 'change'].forEach(function (ev) { form.addEventListener(ev, function (e) {
      if (e.target === f.slug) f.slug._touched = true;
      if (e.target === f.name && !editing && !f.slug._touched) { /* Arabic names don't slugify; leave for the user */ }
      if (e.target.getAttribute('aria-invalid') === 'true') validate(e.target);
      updatePreview();
    }); });
    f.slug.addEventListener('blur', function () { if (!f.slug.disabled) { f.slug.value = slugify(f.slug.value); updatePreview(); } });
    UI.initSeg($('#serp-seg'), function (v) { serpMode = v; updatePreview(); });
    function validate(input) {
      var v = input.value.trim(), msg = '';
      if (input === f.name && !v) msg = 'أدخل اسم الصفحة.';
      if (input === f.seo && !v) msg = 'أدخل عنوان الصفحة في المتصفح.';
      if (input === f.slug && !f.slug.disabled) {
        var s = slugify(v);
        if (!s) msg = 'أدخل رابطاً بأحرف لاتينية، مثال: about-us';
        else if (pages.some(function (p) { return p !== editing && p.slug === s; })) msg = 'هذا الرابط مستخدم لصفحة أخرى.';
      }
      setErr(input, msg); return !msg;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = [f.name, f.seo, f.slug].filter(function (i) { return !validate(i); });
      if (bad.length) { bad[0].focus(); return; }
      var isNew = !editing, p = editing || { id: 'p' + Date.now().toString(36), icon: 'draft', kind: 'صفحة ثابتة' };
      p.title = f.name.value.trim(); p.seoTitle = f.seo.value.trim(); p.meta = f.meta.value.trim();
      if (!f.slug.disabled) { p.slug = slugify(f.slug.value); p.file = p.slug + '.html'; }
      if (!f.status.disabled) p.status = f.status.value;
      touch(p);
      if (isNew) { pages.push(p); st.newId = p.id; }
      savePages(); render();
      UI.Drawer.close(drawer);
      toast(isNew ? 'تم إنشاء الصفحة' : 'تم حفظ الصفحة', { text: '«' + p.title + '» — ' + pathOf(p) });
    });
    $('#pg-new').addEventListener('click', function () { openEditor(null, this); });

    /* ---------- homepage sections ---------- */
    var secList = $('#sec-list');
    var projected = null, dragId = null;
    function secHTML(s, i) {
      var m = SEC[s.id];
      return '<li data-id="' + s.id + '" data-depth="0" class="sec-row' + (s.visible ? '' : ' is-off') + '">' +
        '<div class="sec-item">' +
        '<button type="button" class="dnd-handle" aria-label="سحب لإعادة ترتيب قسم ' + esc(m.label) + '، الموضع ' + (i + 1) + ' من ' + sections.length + '" aria-describedby="sec-help">' + icon('drag_indicator') + '</button>' +
        '<span class="sec-num" aria-hidden="true">' + (i + 1) + '</span>' +
        '<span class="sec-ico tone-' + m.tone + '" aria-hidden="true">' + icon(m.icon) + '</span>' +
        '<div class="sec-text"><strong>' + esc(m.label) + (m.urgent ? ' <span class="pill pill-danger sm-pill">عاجل</span>' : '') + '</strong><span class="sec-note">' + esc(m.note) + '</span></div>' +
        '<code class="sec-anchor" dir="ltr">#' + s.id + '</code>' +
        '<span class="sec-flag" aria-hidden="true">' + (s.visible ? '' : icon('visibility_off') + 'مخفي') + '</span>' +
        '<button type="button" class="switch" role="switch" data-sec="' + s.id + '" aria-checked="' + s.visible + '" aria-label="إظهار قسم ' + esc(m.label) + '"></button>' +
        '<div class="sec-move">' +
          '<button type="button" class="icon-btn sm" data-up="' + s.id + '" aria-label="تحريك ' + esc(m.label) + ' لأعلى"' + (i === 0 ? ' disabled' : '') + '>' + icon('arrow_upward') + '</button>' +
          '<button type="button" class="icon-btn sm" data-down="' + s.id + '" aria-label="تحريك ' + esc(m.label) + ' لأسفل"' + (i === sections.length - 1 ? ' disabled' : '') + '>' + icon('arrow_downward') + '</button>' +
        '</div></div></li>';
    }
    function renderSections(flashId) {
      secList.innerHTML = sections.map(secHTML).join('');
      var vis = sections.filter(function (s) { return s.visible; }).length;
      $('#outline-sub').textContent = vis + ' قسماً ظاهراً' + (sections.length - vis ? ' · ' + (sections.length - vis) + ' مخفية' : '');
      renderOutline(sections);
      if (flashId) { var r = $('li[data-id="' + flashId + '"]', secList); if (r) r.classList.add('is-dropped'); }
    }
    function renderOutline(order) {
      var h = '<div class="ol-nav"><span class="ol-brand"></span><span class="ol-links"><i></i><i></i><i></i><i></i></span><span class="ol-cta"></span></div>';
      order.forEach(function (s) {
        if (!s.visible) return;
        var m = SEC[s.id];
        h += '<div class="ol-block tone-' + m.tone + (s.id === dragId ? ' is-active' : '') + '" style="--h:' + m.h + '"><span>' + esc(m.label) + '</span></div>';
      });
      h += '<div class="ol-foot"><span>التذييل</span></div>';
      $('#outline').innerHTML = h;
    }
    function moveSection(id, to, how) {
      var from = sections.findIndex(function (s) { return s.id === id; });
      if (from < 0 || to < 0 || to >= sections.length || to === from) return false;
      var it = sections.splice(from, 1)[0]; sections.splice(to, 0, it);
      saveSections(); renderSections(id);
      announce('نُقل قسم «' + SEC[id].label + '» إلى الموضع ' + (to + 1) + ' من ' + sections.length);
      if (how === 'drag') toast('تم تحديث ترتيب الأقسام', { text: '«' + SEC[id].label + '» الآن في الموضع ' + (to + 1), icon: 'reorder', duration: 2400 });
      return true;
    }
    secList.addEventListener('click', function (e) {
      var b = e.target.closest('[data-up],[data-down]'); if (!b) return;
      var up = b.hasAttribute('data-up'), id = b.getAttribute(up ? 'data-up' : 'data-down');
      var from = sections.findIndex(function (s) { return s.id === id; });
      if (moveSection(id, from + (up ? -1 : 1))) {
        var nb = $('[data-' + (up ? 'up' : 'down') + '="' + id + '"]', secList);
        if (nb && nb.disabled) nb = $('.dnd-handle', nb.closest('li'));
        if (nb) nb.focus();
      }
    });
    secList.addEventListener('keydown', function (e) {
      var h = e.target.closest('.dnd-handle'); if (!h) return;
      var id = h.closest('li').getAttribute('data-id'), from = sections.findIndex(function (s) { return s.id === id; }), to = null;
      if (e.key === 'ArrowUp') to = from - 1; else if (e.key === 'ArrowDown') to = from + 1;
      else if (e.key === 'Home') to = 0; else if (e.key === 'End') to = sections.length - 1;
      if (to === null) return;
      e.preventDefault();
      if (moveSection(id, to)) { var nh = $('li[data-id="' + id + '"] .dnd-handle', secList); if (nh) nh.focus(); }
    });
    document.addEventListener('switch', function (e) {
      var sw = e.target; if (!sw.hasAttribute('data-sec')) return;
      var id = sw.getAttribute('data-sec'), s = sections.find(function (x) { return x.id === id; });
      s.visible = e.detail.on; saveSections(); renderSections();
      var n = $('[data-sec="' + id + '"]', secList); if (n) n.focus();
      toastUndo(s.visible ? 'أصبح القسم ظاهراً' : 'تم إخفاء القسم', { text: '«' + SEC[id].label + '» في الصفحة الرئيسية', tone: s.visible ? 'success' : 'info', icon: s.visible ? 'visibility' : 'visibility_off', duration: 3200 }, function () { s.visible = !s.visible; saveSections(); renderSections(); });
    });
    DnD.Sortable(secList, {
      maxDepth: 0,
      onStart: function (r) { dragId = r.id; },
      onMove: function (r) {
        var order = sections.slice(), from = order.findIndex(function (s) { return s.id === r.id; });
        var it = order.splice(from, 1)[0]; order.splice(r.index, 0, it);
        projected = order; renderOutline(order);
        // live numbering while dragging
        var n = 0; $$('#sec-list > li').forEach(function (li) { if (li.hidden) return; var num = $('.sec-num', li); if (li.classList.contains('dnd-placeholder')) { n++; return; } n++; if (num) num.textContent = n; });
      },
      onDrop: function (r) {
        var id = dragId; dragId = null; projected = null;
        if (!r.changed) { renderSections(); return; }
        moveSection(id, r.index, 'drag');
        var h = $('li[data-id="' + id + '"] .dnd-handle', secList); if (h) h.focus({ preventScroll: true });
      },
      onCancel: function () { dragId = null; projected = null; renderSections(); announce('أُلغي السحب'); }
    });
    $('#sec-reset').addEventListener('click', function () {
      UI.modal({ title: 'استعادة ترتيب الأقسام الافتراضي؟', text: 'سيعود ترتيب أقسام الصفحة الرئيسية كما في الموقع الأصلي وتظهر كل الأقسام.', icon: 'restart_alt', tone: 'warn', confirmText: 'استعادة' }).then(function (ok) {
        if (!ok) return; var prev = sections; sections = seedSections(); saveSections(); renderSections();
        toastUndo('تمت استعادة ترتيب الأقسام', { icon: 'restart_alt', tone: 'info' }, function () { sections = prev; saveSections(); renderSections(); });
      });
    });
    $('#pg-reset').addEventListener('click', function () {
      UI.modal({ title: 'استعادة الإعدادات الافتراضية؟', text: 'ستعود قائمة الصفحات وحالاتها وبيانات SEO وترتيب أقسام الرئيسية إلى القيم الأصلية، وتُحذف الصفحات المنسوخة أو الجديدة.', icon: 'restart_alt', tone: 'warn', confirmText: 'نعم، استعد الافتراضي' }).then(function (ok) {
        if (!ok) return;
        try { localStorage.removeItem(KEY_PAGES); localStorage.removeItem(KEY_SECTIONS); } catch (e) { /* ignore */ }
        pages = seedPages(); sections = seedSections(); render(); renderSections();
        flashSaved($('#pg-saved'), 'تمت الاستعادة'); flashSaved($('#sec-saved'), 'تمت الاستعادة');
        toast('تمت استعادة الافتراضي', { text: 'الصفحات وأقسام الرئيسية عادت إلى حالتها الأصلية.', icon: 'restart_alt', tone: 'info' });
      });
    });

    window.__focusSections = function () {
      var c = $('#sections'); if (!c) return;
      c.scrollIntoView({ behavior: UI.reduceMotion ? 'auto' : 'smooth', block: 'start' });
      var h = $('.dnd-handle', secList); if (h) setTimeout(function () { h.focus({ preventScroll: true }); }, 350);
    };

    render(); renderSections();
    if (location.hash === '#sections') setTimeout(window.__focusSections, 120);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
