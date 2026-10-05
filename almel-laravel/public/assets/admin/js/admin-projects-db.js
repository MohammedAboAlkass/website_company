/* Projects page, 100% database backed (Laravel JSON API: /admin/projects ...).
   Loaded after admin.js on /admin/projects; admin.js skips its demo page logic (window.__DB_PAGES). */
(function () {
  'use strict';
  var U = window.AdminUI, DB = window.AdminDB;
  if (!U || !DB || document.body.getAttribute('data-page') !== 'projects') return;

  var O = window.__PRJ_OPTS || {};
  var esc = U.esc, icon = U.icon, toast = U.toast, emptyState = U.emptyState;
  var BASE = '/admin/projects';
  var TONE = { active: 'info', urgent: 'danger', paused: 'warn', draft: 'neutral', completed: 'solid' };
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function can(k) { return !window.AdminPerm || window.AdminPerm.can(k); }
  function num(n) { return n == null ? '—' : Number(n).toLocaleString('en-US'); }
  function countWord(n) { return n === 1 ? 'مشروع واحد' : n === 2 ? 'مشروعين' : n + (n <= 10 ? ' مشاريع' : ' مشروعاً'); }
  function label(list, key, fallback) { for (var i = 0; i < list.length; i++) if (String(list[i].key) === String(key)) return list[i].label; return fallback || key || ''; }

  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  ready(function () {
    var view = $('#proj-view'), bulk = $('#bulkbar'), search = $('#proj-search');
    var st = { q: '', program: '', status: '', view: U.store.get('almel-admin-pview', 'table'), page: 1, per: 8, sel: new Set() };
    var rows = [], meta = { total: 0, page: 1, pages: 1 }, counts = {}, loaded = false, failed = false, reqId = 0;
    var qs0 = new URLSearchParams(location.search); st.q = qs0.get('q') || ''; search.value = st.q;

    /* ---------- selects ---------- */
    function opt(v, l, sel) { return '<option value="' + esc(v) + '"' + (sel ? ' selected' : '') + '>' + esc(l) + '</option>'; }
    $('#f-cat').innerHTML = opt('', 'كل الفئات') + (O.programs || []).map(function (p) { return opt(p.key, p.label); }).join('');
    $('#f-status').innerHTML = opt('', 'كل الحالات') + (O.statuses || []).map(function (p) { return opt(p.key, p.label); }).join('');
    $('#pf-cat').innerHTML = (O.programs || []).map(function (p) { return opt(p.key, p.label); }).join('');
    $('#pf-status').innerHTML = (O.statuses || []).map(function (p) { return opt(p.key, p.label); }).join('');
    $('#pf-gov').innerHTML = opt('', '— غير محددة —') + (O.governorates || []).map(function (g) { return opt(g.id, g.label); }).join('');
    $('#pf-badge-tone').innerHTML = opt('', 'بدون لون') + (O.tones || []).map(function (t) { return opt(t.key, t.label); }).join('');
    $('#pf-badge-icon').innerHTML = opt('', 'بدون أيقونة') + (O.icons || []).map(function (t) { return opt(t.key, t.label); }).join('');

    /* ---------- load + render ---------- */
    function load() {
      var id = ++reqId;
      var q = new URLSearchParams({ page: st.page, per: st.per });
      if (st.q) q.set('q', st.q); if (st.program) q.set('program', st.program); if (st.status) q.set('status', st.status);
      return DB.api('GET', BASE + '?' + q.toString()).then(function (r) {
        if (id !== reqId) return;
        rows = r.data || []; meta = r.meta || meta; counts = r.counts || {}; loaded = true; failed = false;
        if (meta.pages > 0 && st.page > meta.pages) { st.page = meta.pages; return load(); }
        stats(); render();
      }, function (e) { if (id !== reqId) return; failed = true; loaded = false; render(); DB.fail(e, 'تعذّر تحميل المشاريع'); });
    }
    function stats() {
      $('#p-stats').innerHTML = '<div><dt>إجمالي المشاريع</dt><dd><b>' + (counts.all || 0) + '</b></dd></div>' +
        '<div><dt>مشاريع نشطة</dt><dd><b>' + (counts.active || 0) + '</b><span class="pill pill-danger">' + (counts.urgent || 0) + ' عاجل</span></dd></div>' +
        '<div><dt>مسودات</dt><dd><b>' + (counts.draft || 0) + '</b></dd></div>' +
        '<div><dt>مكتملة</dt><dd><b>' + (counts.completed || 0) + '</b><span class="muted" style="font-size:12.5px">متوقفة: ' + (counts.paused || 0) + '</span></dd></div>';
    }
    function byId(id) { for (var i = 0; i < rows.length; i++) if (rows[i].id === id) return rows[i]; return null; }
    function statusPill(p) { return U.pill(p.status_label || p.status, TONE[p.status] || 'neutral'); }
    function whereOf(p) { return p.location || p.governorate || ''; }

    function menuFor(p) {
      var m = [];
      if (can('projects.edit')) m.push({ icon: 'edit', label: 'تعديل', action: function () { openDrawer(p.id); } });
      if (can('projects.edit') && p.status !== 'draft') m.push({ icon: 'inventory_2', label: 'نقل إلى المسودات', action: function () { setStatus([p.id], 'draft'); } });
      if (can('projects.publish') && p.status === 'draft') m.push({ icon: 'check_circle', label: 'تفعيل ونشر', action: function () { setStatus([p.id], 'active'); } });
      if (can('projects.delete')) { if (m.length) m.push('-'); m.push({ icon: 'delete', label: 'حذف', danger: true, action: function () { removeProjects([p.id], '«' + p.title + '»'); } }); }
      return m;
    }
    function render() {
      $$('#view-seg button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-value') === st.view ? 'true' : 'false'); });
      $('#result-count').textContent = loaded ? meta.total + ' نتيجة' : '';
      if (!loaded) {
        view.innerHTML = failed
          ? emptyState('cloud_off', 'تعذّر تحميل المشاريع', 'تحقق من الاتصال ثم أعد المحاولة.', '<button type="button" class="btn btn-primary" id="p-retry">' + icon('refresh') + 'إعادة المحاولة</button>')
          : emptyState('hourglass_top', 'جارٍ تحميل المشاريع…', 'لحظات من فضلك.', '');
        var r = $('#p-retry'); if (r) r.addEventListener('click', load);
        $('#proj-pages').innerHTML = ''; syncBulk(); return;
      }
      if (!rows.length) {
        var filtering = st.q || st.program || st.status;
        view.innerHTML = filtering
          ? emptyState('search_off', 'لا توجد مشاريع مطابقة', 'جرّب تعديل كلمات البحث أو إزالة عوامل التصفية لعرض المزيد من النتائج.', '<button type="button" class="btn btn-secondary" id="clear-filters">' + icon('filter_alt_off') + 'مسح عوامل التصفية</button>')
          : emptyState('volunteer_activism', 'لا توجد مشاريع بعد', 'أضف أول مشروع ليظهر في صفحة المشاريع.', can('projects.create') ? '<button type="button" class="btn btn-primary" id="empty-add">' + icon('add') + 'مشروع جديد</button>' : '');
        var cf = $('#clear-filters'); if (cf) cf.addEventListener('click', function () { st.q = ''; st.program = ''; st.status = ''; search.value = ''; $('#f-cat').value = ''; $('#f-status').value = ''; st.page = 1; load(); search.focus(); });
        var ea = $('#empty-add'); if (ea) ea.addEventListener('click', function () { openDrawer(null); });
        $('#proj-pages').innerHTML = ''; syncBulk(); return;
      }
      if (st.view === 'table') {
        var allSel = rows.every(function (p) { return st.sel.has(p.id); }), someSel = rows.some(function (p) { return st.sel.has(p.id); });
        view.innerHTML = '<div class="table-wrap" tabindex="0" role="region" aria-label="جدول المشاريع"><table class="table"><thead><tr><th class="col-check" scope="col"><input type="checkbox" class="checkbox" id="sel-all" aria-label="تحديد كل مشاريع هذه الصفحة"' + (allSel ? ' checked' : '') + '></th><th scope="col">المشروع</th><th scope="col">الفئة</th><th scope="col">الحالة</th><th scope="col">المستفيدون</th><th scope="col">آخر تحديث</th><th scope="col" class="col-actions"><span class="sr-only">إجراءات</span></th></tr></thead><tbody>' +
          rows.map(function (p) {
            var on = st.sel.has(p.id);
            return '<tr class="' + (on ? 'is-selected' : '') + '"><td class="col-check"><input type="checkbox" class="checkbox" data-sel="' + p.id + '" aria-label="تحديد ' + esc(p.title) + '"' + (on ? ' checked' : '') + '></td>' +
              '<td><div class="cell-media"><img src="' + esc(p.image) + '" alt="" loading="lazy"><div style="min-width:0"><button type="button" class="t" data-edit="' + p.id + '" style="text-align:start">' + esc(p.title) + '</button><span class="s">' + icon('location_on') + esc(whereOf(p) || '—') + (p.is_featured ? ' <span class="p-flag">' + icon('star') + 'مميّز</span>' : '') + '</span></div></div></td>' +
              '<td><span class="tag">' + esc(p.program_label || '—') + '</span></td><td>' + statusPill(p) + '</td>' +
              '<td class="num-cell"><span class="amount">' + num(p.beneficiaries) + '</span></td>' +
              '<td class="muted" style="white-space:nowrap">' + esc(DB.agoLabel(p.updated)) + '</td>' +
              '<td class="col-actions"><button type="button" class="icon-btn sm" data-menu="' + p.id + '" aria-haspopup="menu" aria-expanded="false" aria-label="إجراءات: ' + esc(p.title) + '">' + icon('more_horiz') + '</button></td></tr>';
          }).join('') + '</tbody></table></div>';
        var sa = $('#sel-all'); sa.indeterminate = someSel && !allSel;
        sa.addEventListener('change', function () { rows.forEach(function (p) { sa.checked ? st.sel.add(p.id) : st.sel.delete(p.id); }); render(); var s2 = $('#sel-all'); if (s2) s2.focus(); });
      } else {
        view.innerHTML = '<ul class="pgrid">' + rows.map(function (p) {
          var on = st.sel.has(p.id);
          return '<li class="pcard' + (on ? ' is-selected' : '') + '"><div class="pcard-media"><img src="' + esc(p.image) + '" alt="" loading="lazy"><input type="checkbox" class="checkbox" data-sel="' + p.id + '" aria-label="تحديد ' + esc(p.title) + '"' + (on ? ' checked' : '') + '>' + statusPill(p) + '</div>' +
            '<div class="pcard-body"><span class="tag" style="align-self:flex-start">' + esc(p.program_label || '—') + '</span><h3><button type="button" class="t" data-edit="' + p.id + '" style="text-align:start">' + esc(p.title) + '</button></h3>' +
            '<div class="pcard-meta"><span>' + (p.beneficiaries != null ? '<b class="ltr">' + num(p.beneficiaries) + '</b> مستفيد' : '&nbsp;') + '</span></div></div>' +
            '<div class="pcard-foot"><span class="muted" style="font-size:12.5px;display:inline-flex;align-items:center;gap:4px">' + icon('location_on') + esc(whereOf(p) || '—') + '</span><button type="button" class="icon-btn sm" data-menu="' + p.id + '" aria-haspopup="menu" aria-expanded="false" aria-label="إجراءات: ' + esc(p.title) + '">' + icon('more_horiz') + '</button></div></li>';
        }).join('') + '</ul>';
      }
      $$('[data-sel]', view).forEach(function (cb) {
        cb.addEventListener('change', function () {
          var id = +cb.getAttribute('data-sel'); cb.checked ? st.sel.add(id) : st.sel.delete(id);
          var row = cb.closest('tr, .pcard'); if (row) row.classList.toggle('is-selected', cb.checked);
          syncBulk();
          var s2 = $('#sel-all'); if (s2) { var all = rows.every(function (p) { return st.sel.has(p.id); }), some = rows.some(function (p) { return st.sel.has(p.id); }); s2.checked = all; s2.indeterminate = some && !all; }
        });
      });
      $$('[data-menu]', view).forEach(function (b) { b.addEventListener('click', function () { var p = byId(+b.getAttribute('data-menu')); var m = p && menuFor(p); if (m && m.length) U.rowMenu(b, m); }); });
      $$('[data-edit]', view).forEach(function (b) { b.addEventListener('click', function () { if (can('projects.edit')) openDrawer(+b.getAttribute('data-edit'), b); else toast('ليست لديك صلاحية تعديل المشاريع', { tone: 'info', icon: 'lock' }); }); });
      pager();
      syncBulk();
    }
    function pager() {
      var el = $('#proj-pages'), total = meta.total, page = meta.page, pages = Math.max(1, meta.pages), per = meta.per || st.per;
      var from = total ? (page - 1) * per + 1 : 0, to = Math.min(total, page * per);
      var h = '<p class="info">عرض <b class="num">' + from + '–' + to + '</b> من <b class="num">' + total + '</b></p><div class="pages" role="group" aria-label="التنقل بين الصفحات"><button type="button" class="page-btn" data-go="' + (page - 1) + '" aria-label="الصفحة السابقة"' + (page <= 1 ? ' disabled' : '') + '>' + icon('chevron_right') + '</button>';
      for (var i = 1; i <= pages; i++) h += '<button type="button" class="page-btn" data-go="' + i + '"' + (i === page ? ' aria-current="page"' : '') + ' aria-label="الصفحة ' + i + '">' + i + '</button>';
      h += '<button type="button" class="page-btn" data-go="' + (page + 1) + '" aria-label="الصفحة التالية"' + (page >= pages ? ' disabled' : '') + '>' + icon('chevron_left') + '</button></div>';
      el.innerHTML = h;
      $$('[data-go]', el).forEach(function (b) { b.addEventListener('click', function () { st.page = +b.getAttribute('data-go'); load().then(function () { view.scrollIntoView({ block: 'nearest' }); }); }); });
    }
    function syncBulk() { var n = st.sel.size; bulk.hidden = !n; $('#bulk-count').textContent = 'تم تحديد ' + countWord(n); }

    /* ---------- toolbar + bulk ---------- */
    var searchT;
    search.addEventListener('input', function () { clearTimeout(searchT); searchT = setTimeout(function () { st.q = search.value.trim(); st.page = 1; load(); }, 250); });
    $('#f-cat').addEventListener('change', function (e) { st.program = e.target.value; st.page = 1; load(); });
    $('#f-status').addEventListener('change', function (e) { st.status = e.target.value; st.page = 1; load(); });
    U.initSeg($('#view-seg'), function (v) { st.view = v; U.store.set('almel-admin-pview', v); render(); });
    $('#bulk-clear').addEventListener('click', function () { st.sel.clear(); render(); });
    $('#bulk-activate').addEventListener('click', function () { setStatus(Array.from(st.sel), 'active'); });
    $('#bulk-draft').addEventListener('click', function () { setStatus(Array.from(st.sel), 'draft'); });
    $('#bulk-delete').addEventListener('click', function () { removeProjects(Array.from(st.sel), countWord(st.sel.size)); });

    function setStatus(ids, status) {
      if (!ids.length) return;
      DB.api('POST', BASE + '/bulk-status', { ids: ids, status: status }).then(function (r) {
        ids.forEach(function (i) { st.sel.delete(i); });
        toast(status === 'draft' ? 'تم نقل المشاريع إلى المسودات' : 'تم تفعيل المشاريع', { text: r.message, tone: status === 'draft' ? 'info' : 'success', icon: status === 'draft' ? 'inventory_2' : 'check_circle' });
        load();
      }, function (e) { DB.fail(e, 'تعذّر تغيير الحالة'); });
    }
    function removeProjects(ids, what) {
      if (!ids.length) return;
      U.confirmDelete(ids.length === 1 ? 'المشروع' : 'المشاريع', what + ' — سيُحذف من الموقع ولوحة التحكم (حذف مرن يحفظه في قاعدة البيانات).').then(function (ok) {
        if (!ok) return;
        var p = ids.length === 1 ? DB.api('DELETE', BASE + '/' + ids[0]) : DB.api('POST', BASE + '/bulk-delete', { ids: ids });
        p.then(function () { ids.forEach(function (i) { st.sel.delete(i); }); toast(ids.length === 1 ? 'تم حذف المشروع' : 'تم حذف المشاريع', { tone: 'danger' }); load(); }, function (e) { DB.fail(e, 'تعذّر الحذف'); });
      });
    }

    /* ---------- drawer ---------- */
    var drawer = $('#project-drawer'), form = $('#project-form'), editingId = null, cover = null, gallery = [], saving = false;
    var TABS = ['basic', 'content', 'gallery', 'updates', 'seo'];
    var tabsEl = $('#pf-tabs');
    U.initTabs(tabsEl);
    function showTab(name) { var t = $('#pft-' + name); if (t) t.click(); }
    function tabOf(el) { var p = el && el.closest && el.closest('[role=tabpanel]'); return p ? p.id.replace('pfp-', '') : null; }

    function clearErrors() {
      $$('[aria-invalid]', form).forEach(function (i) { i.removeAttribute('aria-invalid'); });
      $$('.error', form).forEach(function (e) { e.hidden = true; });
      $$('.has-error', form).forEach(function (e) { e.classList.remove('has-error'); });
      $('#pf-state').textContent = ''; $('#pf-state').classList.remove('is-err');
    }
    var IDS = { title: 'pf-title', program: 'pf-cat', status: 'pf-status', governorate_id: 'pf-gov', location_text: 'pf-location', beneficiaries_count: 'pf-ben', start_date: 'pf-start', end_date: 'pf-end', cover_alt: 'pf-cover-alt', summary: 'pf-summary', description: 'pf-desc', badge_text: 'pf-badge-text', seo_title: 'pf-seo-title', seo_description: 'pf-seo-desc' };
    function fieldError(key, msg) {
      var input = IDS[key] && document.getElementById(IDS[key]);
      var e = document.getElementById('pf-' + key + '-err');
      if (input) input.setAttribute('aria-invalid', 'true');
      if (e) { e.hidden = false; var s = e.querySelector('span:last-child'); if (s) s.textContent = msg; }
      return input || e;
    }
    /* maps server validation errors (incl. facts.0.label ...) to the form; returns the element to focus */
    function showServerErrors(errors) {
      var focusEl = null, tab = null, nestedMsg = null;
      Object.keys(errors || {}).forEach(function (k) {
        var msg = (errors[k] || [])[0] || 'قيمة غير صالحة.';
        var m = /^(facts|components|images|updates)\.(\d+)\./.exec(k);
        if (m) {
          var sel = { facts: '#pf-facts', components: '#pf-comps', images: '#pf-gal', updates: '#pf-upds' }[m[1]];
          var row = $$((m[1] === 'images' ? 'li' : '.pf-row'), $(sel))[+m[2]];
          if (row) { row.classList.add('has-error'); if (!focusEl) focusEl = $('input,select,textarea', row) || row; }
          tab = tab || (m[1] === 'facts' || m[1] === 'components' ? 'content' : m[1] === 'images' ? 'gallery' : 'updates');
          nestedMsg = nestedMsg || msg;
          return;
        }
        var el = fieldError(k.replace(/\.\d+.*$/, ''), msg);
        if (!el && (k === 'images' || k === 'updates')) { var e2 = document.getElementById('pf-' + k + '-err'); if (e2) { e2.hidden = false; e2.querySelector('span:last-child').textContent = msg; el = e2; } }
        if (el && !focusEl) { focusEl = el; tab = tabOf(el); }
      });
      if (tab) showTab(tab);
      if (nestedMsg) { var st2 = $('#pf-state'); st2.textContent = nestedMsg; st2.classList.add('is-err'); }
      if (focusEl && focusEl.focus) setTimeout(function () { try { focusEl.focus(); } catch (x) { /* hidden */ } }, 80);
    }

    function setCover(c) {
      cover = c;
      $('#pf-cover-preview').hidden = !c; $('#pf-dropzone').hidden = !!c;
      if (c) $('#pf-cover-img').src = c.url; else $('#pf-cover-img').removeAttribute('src');
    }
    function counter(inputId, countId, max) { var i = document.getElementById(inputId), c = document.getElementById(countId); if (!i || !c) return; var n = i.value.length; c.textContent = n + ' / ' + max; c.classList.toggle('over', n > max); }
    [['pf-title', 'pf-title-count', 120], ['pf-summary', 'pf-summary-count', 500], ['pf-seo-title', 'pf-seo-title-count', 255], ['pf-seo-desc', 'pf-seo-desc-count', 320]].forEach(function (c) { document.getElementById(c[0]).addEventListener('input', function () { counter(c[0], c[1], c[2]); }); });

    /* repeaters */
    function iconOptions(sel) { return opt('', 'بدون أيقونة', !sel) + (O.icons || []).map(function (t) { return opt(t.key, t.label, t.key === sel); }).join(''); }
    function rowTools() { return '<div class="pf-row-tools"><button type="button" class="icon-btn sm" data-mv="-1" aria-label="تحريك لأعلى">' + icon('arrow_upward') + '</button><button type="button" class="icon-btn sm" data-mv="1" aria-label="تحريك لأسفل">' + icon('arrow_downward') + '</button><button type="button" class="icon-btn sm" data-rm aria-label="حذف" title="حذف">' + icon('delete') + '</button></div>'; }
    function addFact(f) {
      f = f || {}; var box = $('#pf-facts'); var e0 = $('.pf-empty', box); if (e0) e0.remove();
      var d = document.createElement('div'); d.className = 'pf-row is-fact';
      d.innerHTML = '<input class="input" data-f="label" maxlength="100" placeholder="العنوان (مثال: النطاق)" aria-label="عنوان الحقيقة" value="' + esc(f.label || '') + '">' +
        '<input class="input" data-f="value" maxlength="150" placeholder="القيمة (مثال: 4 مخابز مركزية)" aria-label="قيمة الحقيقة" value="' + esc(f.value || '') + '">' +
        '<div class="pf-row-tools"><label class="pf-chk" title="تمييز بصري"><input type="checkbox" class="checkbox" data-f="is_accent"' + (f.is_accent ? ' checked' : '') + '>مميّزة</label><button type="button" class="icon-btn sm" data-mv="-1" aria-label="تحريك لأعلى">' + icon('arrow_upward') + '</button><button type="button" class="icon-btn sm" data-mv="1" aria-label="تحريك لأسفل">' + icon('arrow_downward') + '</button><button type="button" class="icon-btn sm" data-rm aria-label="حذف الحقيقة">' + icon('delete') + '</button></div>';
      box.appendChild(d); return d;
    }
    function addComp(c) {
      c = c || {}; var box = $('#pf-comps'); var e0 = $('.pf-empty', box); if (e0) e0.remove();
      var d = document.createElement('div'); d.className = 'pf-row is-comp';
      d.innerHTML = '<select class="select" data-f="icon" aria-label="أيقونة المكوّن">' + iconOptions(c.icon || '') + '</select>' +
        '<input class="input" data-f="title" maxlength="150" placeholder="عنوان المكوّن" aria-label="عنوان المكوّن" value="' + esc(c.title || '') + '">' + rowTools() +
        '<textarea class="textarea pf-wide" data-f="text" maxlength="500" rows="2" placeholder="نص قصير يشرح المكوّن (اختياري)" aria-label="نص المكوّن" style="min-height:0">' + esc(c.text || '') + '</textarea>';
      box.appendChild(d); return d;
    }
    function addUpd(u) {
      u = u || {}; var box = $('#pf-upds'); var e0 = $('.pf-empty', box); if (e0) e0.remove();
      var d = document.createElement('div'); d.className = 'pf-row is-upd'; if (u.id) d.setAttribute('data-uid', u.id);
      var today = new Date().toISOString().slice(0, 10);
      d.innerHTML = '<input class="input" data-f="title" maxlength="255" placeholder="عنوان التحديث" aria-label="عنوان التحديث" value="' + esc(u.title || '') + '">' +
        '<input class="input" type="date" dir="ltr" data-f="published_at" aria-label="تاريخ التحديث" value="' + esc(u.published_at || today) + '">' +
        '<div class="pf-row-tools"><label class="pf-chk"><input type="checkbox" class="checkbox" data-f="is_published"' + (u.is_published === false ? '' : ' checked') + '>منشور</label><button type="button" class="icon-btn sm" data-rm aria-label="حذف التحديث">' + icon('delete') + '</button></div>' +
        '<textarea class="textarea pf-wide" data-f="body" rows="3" placeholder="تفاصيل التحديث…" aria-label="نص التحديث" style="min-height:0">' + esc(u.body || '') + '</textarea>';
      box.appendChild(d); return d;
    }
    function emptyRows(box, text) { if (!$('.pf-row', box)) box.innerHTML = '<p class="pf-empty">' + esc(text) + '</p>'; syncCounts(); }
    function syncCounts() { $('#pf-gal-n').textContent = gallery.length; $('#pf-upd-n').textContent = $$('.pf-row', $('#pf-upds')).length; }
    function repeaterClicks(box, emptyText) {
      box.addEventListener('click', function (e) {
        var row = e.target.closest('.pf-row'); if (!row) return;
        var mv = e.target.closest('[data-mv]');
        if (mv) { var dir = +mv.getAttribute('data-mv'); var sib = dir < 0 ? row.previousElementSibling : row.nextElementSibling; if (sib && sib.classList.contains('pf-row')) { dir < 0 ? box.insertBefore(row, sib) : box.insertBefore(sib, row); mv.focus(); } return; }
        if (e.target.closest('[data-rm]')) { row.remove(); emptyRows(box, emptyText); }
      });
    }
    repeaterClicks($('#pf-facts'), 'لا توجد حقائق سريعة بعد.');
    repeaterClicks($('#pf-comps'), 'لا توجد مكوّنات بعد.');
    repeaterClicks($('#pf-upds'), 'لا توجد تحديثات بعد.');
    $('#pf-add-fact').addEventListener('click', function () { if ($$('.pf-row', $('#pf-facts')).length >= 12) { toast('الحد الأقصى 12 حقيقة', { tone: 'info' }); return; } addFact().querySelector('input').focus(); });
    $('#pf-add-comp').addEventListener('click', function () { if ($$('.pf-row', $('#pf-comps')).length >= 12) { toast('الحد الأقصى 12 مكوّناً', { tone: 'info' }); return; } addComp().querySelector('input,select').focus(); });
    $('#pf-add-upd').addEventListener('click', function () { if ($$('.pf-row', $('#pf-upds')).length >= 50) { toast('الحد الأقصى 50 تحديثاً', { tone: 'info' }); return; } var d = addUpd(); syncCounts(); d.querySelector('input').focus(); });

    /* gallery */
    function renderGallery() {
      var ul = $('#pf-gal');
      ul.innerHTML = gallery.map(function (g, i) {
        return '<li data-i="' + i + '"' + (g.busy ? ' class="is-busy"' : '') + '><img src="' + esc(g.url || '') + '" alt="">' +
          '<div class="pf-gal-body"><input class="input" data-cap maxlength="255" placeholder="تعليق الصورة (اختياري)" aria-label="تعليق الصورة ' + (i + 1) + '" value="' + esc(g.caption || '') + '">' +
          '<div class="pf-gal-tools"><span><button type="button" class="icon-btn sm" data-gmv="-1" aria-label="تقديم"' + (i === 0 ? ' disabled' : '') + '>' + icon('arrow_forward') + '</button><button type="button" class="icon-btn sm" data-gmv="1" aria-label="تأخير"' + (i === gallery.length - 1 ? ' disabled' : '') + '>' + icon('arrow_back') + '</button></span>' +
          '<button type="button" class="icon-btn sm" data-grm aria-label="حذف الصورة">' + icon('delete') + '</button></div></div></li>';
      }).join('');
      syncCounts();
    }
    $('#pf-gal').addEventListener('input', function (e) { var c = e.target.closest('[data-cap]'); if (!c) return; var li = c.closest('li'); gallery[+li.getAttribute('data-i')].caption = c.value; });
    $('#pf-gal').addEventListener('click', function (e) {
      var li = e.target.closest('li'); if (!li) return; var i = +li.getAttribute('data-i');
      var mv = e.target.closest('[data-gmv]');
      if (mv) { var j = i + +mv.getAttribute('data-gmv'); if (j >= 0 && j < gallery.length) { var t = gallery[i]; gallery[i] = gallery[j]; gallery[j] = t; renderGallery(); var nb = $('li[data-i="' + j + '"] [data-gmv="' + mv.getAttribute('data-gmv') + '"]', $('#pf-gal')); if (nb && !nb.disabled) nb.focus(); } return; }
      if (e.target.closest('[data-grm]')) { gallery.splice(i, 1); renderGallery(); }
    });
    function addGalleryFiles(files) {
      files = Array.prototype.slice.call(files || []).filter(function (f) { return /^image\//.test(f.type); });
      if (!files.length) { toast('اختر ملفات صور (JPG أو PNG أو WebP)', { tone: 'danger', icon: 'error' }); return; }
      var room = 40 - gallery.length; if (files.length > room) { files = files.slice(0, Math.max(0, room)); toast('الحد الأقصى 40 صورة في المعرض', { tone: 'info' }); }
      var chain = Promise.resolve();
      files.forEach(function (f) {
        var item = { busy: true, url: URL.createObjectURL(f), caption: '' }; gallery.push(item); renderGallery();
        chain = chain.then(function () {
          return DB.upload(f, BASE + '/cover', O.maxMb).then(function (r) { item.media_id = r.id; item.url = r.url; item.busy = false; renderGallery(); },
            function (e) { gallery.splice(gallery.indexOf(item), 1); renderGallery(); DB.fail(e, 'تعذّر رفع «' + f.name + '»'); });
        });
      });
    }
    var galInput = $('#pf-gal-input');
    galInput.addEventListener('change', function () { addGalleryFiles(galInput.files); galInput.value = ''; });
    (function wireDz(dz, cb) {
      ['dragenter', 'dragover'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('is-over'); }); });
      ['dragleave', 'dragend', 'drop'].forEach(function (ev) { dz.addEventListener(ev, function () { dz.classList.remove('is-over'); }); });
      dz.addEventListener('drop', function (e) { e.preventDefault(); cb(e.dataTransfer.files); });
    })($('#pf-gal-dz'), addGalleryFiles);

    /* cover */
    function pickCover(file) {
      var nm = $('#pf-cover-name'); nm.textContent = 'جارٍ رفع الصورة…';
      DB.upload(file, BASE + '/cover', O.maxMb).then(function (r) { setCover({ id: r.id, url: r.url }); nm.textContent = (r.name || file.name); $('#pf-cover_media_id-err').hidden = true; },
        function (e) { nm.textContent = ''; fieldError('cover_media_id', DB.firstError(e)); $('#pf-cover_media_id-err').hidden = false; var s = $('#pf-cover_media_id-err span:last-child'); if (s) s.textContent = DB.firstError(e); });
    }
    var cin = $('#pf-cover-input');
    cin.addEventListener('change', function () { if (cin.files[0]) pickCover(cin.files[0]); cin.value = ''; });
    (function (dz) {
      ['dragenter', 'dragover'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('is-over'); }); });
      ['dragleave', 'dragend', 'drop'].forEach(function (ev) { dz.addEventListener(ev, function () { dz.classList.remove('is-over'); }); });
      dz.addEventListener('drop', function (e) { e.preventDefault(); var f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) pickCover(f); });
    })($('#pf-dropzone'));
    $('#pf-cover-change').addEventListener('click', function () { cin.click(); });
    $('#pf-cover-remove').addEventListener('click', function () { setCover(null); $('#pf-cover-name').textContent = ''; });

    function lockStatusOptions(current, creating) {
      var canPub = can('projects.publish'), sel = $('#pf-status');
      $$('option', sel).forEach(function (o) { o.disabled = !canPub && o.value !== 'draft' && (creating || current === 'draft'); });
    }

    function fillForm(p) {
      form.reset(); clearErrors();
      var creating = !p;
      $('#drawer-title').textContent = creating ? 'مشروع جديد' : 'تعديل المشروع';
      $('#drawer-sub').textContent = creating ? 'أدخل بيانات المشروع لإضافته إلى القائمة.' : 'حدّث بيانات المشروع ثم احفظ التغييرات.';
      p = p || {};
      $('#pf-title').value = p.title || '';
      $('#pf-cat').value = p.program || ((O.programs || [])[0] || {}).key || '';
      lockStatusOptions(p.status || 'draft', creating);
      $('#pf-status').value = p.status || 'draft';
      $('#pf-gov').value = p.governorate_id ? String(p.governorate_id) : '';
      if (p.governorate_id && $('#pf-gov').value === '') { $('#pf-gov').insertAdjacentHTML('beforeend', opt(p.governorate_id, 'محافظة غير مفعّلة', true)); $('#pf-gov').value = String(p.governorate_id); }
      $('#pf-location').value = p.location_text || '';
      $('#pf-ben').value = p.beneficiaries_count == null ? '' : p.beneficiaries_count;
      $('#pf-featured').checked = !!p.is_featured;
      $('#pf-start').value = p.start_date || ''; $('#pf-end').value = p.end_date || '';
      setCover(p.cover || null); $('#pf-cover-name').textContent = '';
      $('#pf-cover-alt').value = p.cover_alt || '';
      $('#pf-summary').value = p.summary || '';
      $('#pf-desc').value = p.description || '';
      $('#pf-facts').innerHTML = ''; (p.facts || []).forEach(addFact); emptyRows($('#pf-facts'), 'لا توجد حقائق سريعة بعد.');
      $('#pf-comps').innerHTML = ''; (p.components || []).forEach(addComp); emptyRows($('#pf-comps'), 'لا توجد مكوّنات بعد.');
      $('#pf-upds').innerHTML = ''; (p.updates || []).forEach(addUpd); emptyRows($('#pf-upds'), 'لا توجد تحديثات بعد.');
      gallery = (p.images || []).map(function (i) { return { media_id: i.media_id, url: i.url, caption: i.caption || '' }; }); renderGallery();
      $('#pf-badge-text').value = p.badge_text || '';
      $('#pf-badge-tone').value = p.badge_tone || ''; $('#pf-badge-icon').value = p.badge_icon || '';
      $('#pf-seo-title').value = p.seo_title || ''; $('#pf-seo-desc').value = p.seo_description || '';
      [['pf-title', 'pf-title-count', 120], ['pf-summary', 'pf-summary-count', 500], ['pf-seo-title', 'pf-seo-title-count', 255], ['pf-seo-desc', 'pf-seo-desc-count', 320]].forEach(function (c) { counter(c[0], c[1], c[2]); });
      showTab('basic');
    }
    function openDrawer(id, trigger) {
      editingId = id || null;
      if (!id) { fillForm(null); U.Drawer.open(drawer, { focus: '#pf-title', returnFocus: trigger }); return; }
      DB.api('GET', BASE + '/' + id).then(function (r) { fillForm(r.data); U.Drawer.open(drawer, { focus: '#pf-title', returnFocus: trigger }); },
        function (e) { DB.fail(e, 'تعذّر فتح المشروع'); if (e.status === 404) load(); });
    }
    window.__openProjectDrawer = function () { if (can('projects.create')) openDrawer(null); };
    $('#add-project').addEventListener('click', function () { openDrawer(null, this); });

    function collect() {
      var facts = [], comps = [], upds = [];
      $$('.pf-row', $('#pf-facts')).forEach(function (r) { var l = $('[data-f=label]', r).value.trim(), v = $('[data-f=value]', r).value.trim(); if (l || v) facts.push({ label: l, value: v, is_accent: $('[data-f=is_accent]', r).checked }); });
      $$('.pf-row', $('#pf-comps')).forEach(function (r) { var t = $('[data-f=title]', r).value.trim(), x = $('[data-f=text]', r).value.trim(); if (t || x) comps.push({ icon: $('[data-f=icon]', r).value || null, title: t, text: x || null }); });
      $$('.pf-row', $('#pf-upds')).forEach(function (r) { var t = $('[data-f=title]', r).value.trim(), b = $('[data-f=body]', r).value.trim(); if (t || b) { var o = { title: t, body: b || null, is_published: $('[data-f=is_published]', r).checked, published_at: $('[data-f=published_at]', r).value || null }; var uid = r.getAttribute('data-uid'); if (uid) o.id = +uid; upds.push(o); } });
      return {
        title: $('#pf-title').value.trim(), program: $('#pf-cat').value, status: $('#pf-status').value,
        governorate_id: $('#pf-gov').value ? +$('#pf-gov').value : null, location_text: $('#pf-location').value.trim() || null,
        beneficiaries_count: $('#pf-ben').value === '' ? null : +$('#pf-ben').value, is_featured: $('#pf-featured').checked,
        start_date: $('#pf-start').value || null, end_date: $('#pf-end').value || null,
        cover_media_id: cover ? cover.id : null, cover_alt: $('#pf-cover-alt').value.trim() || null,
        summary: $('#pf-summary').value.trim() || null, description: $('#pf-desc').value || null,
        badge_text: $('#pf-badge-text').value.trim() || null, badge_tone: $('#pf-badge-tone').value || null, badge_icon: $('#pf-badge-icon').value || null,
        seo_title: $('#pf-seo-title').value.trim() || null, seo_description: $('#pf-seo-desc').value.trim() || null,
        facts: facts, components: comps,
        images: gallery.filter(function (g) { return g.media_id; }).map(function (g) { return { media_id: g.media_id, caption: g.caption || null }; }),
        updates: upds
      };
    }
    function validate(d) {
      var errs = {};
      if (d.title.length < 5) errs.title = ['أدخل عنواناً واضحاً من 5 أحرف على الأقل.'];
      if (!d.program) errs.program = ['اختر فئة المشروع.'];
      if (d.start_date && d.end_date && d.end_date < d.start_date) errs.end_date = ['تاريخ النهاية يجب أن يكون بعد تاريخ البداية.'];
      if (d.beneficiaries_count != null && (!(d.beneficiaries_count >= 0) || d.beneficiaries_count % 1)) errs.beneficiaries_count = ['عدد المستفيدين يجب أن يكون رقماً صحيحاً غير سالب.'];
      if ((d.summary || '').length > 500) errs.summary = ['الملخص يجب ألا يتجاوز 500 حرف.'];
      if (window.AdminEditor && window.AdminEditor.textLength(d.description || '') > 20000) errs.description = ['الوصف طويل جداً (الحد 20000 حرف).'];
      d.facts.forEach(function (f, i) { if (!f.label) errs['facts.' + i + '.label'] = ['عنوان الحقيقة السريعة مطلوب.']; else if (!f.value) errs['facts.' + i + '.value'] = ['قيمة الحقيقة السريعة مطلوبة.']; });
      d.components.forEach(function (c, i) { if (!c.title) errs['components.' + i + '.title'] = ['عنوان المكوّن مطلوب.']; });
      d.updates.forEach(function (u, i) { if (!u.title) errs['updates.' + i + '.title'] = ['عنوان التحديث مطلوب.']; });
      return errs;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault(); if (saving) return; clearErrors();
      var d = collect(), errs = validate(d);
      if (Object.keys(errs).length) { showServerErrors(errs); toast('يرجى تصحيح الحقول المظللة', { tone: 'danger', icon: 'error' }); return; }
      if (gallery.some(function (g) { return g.busy; })) { toast('انتظر اكتمال رفع الصور ثم احفظ', { tone: 'info', icon: 'hourglass_top' }); return; }
      saving = true; var btn = $('#pf-save'); btn.disabled = true; $('#pf-state').textContent = 'جارٍ الحفظ…';
      var creating = !editingId;
      DB.api(creating ? 'POST' : 'PUT', creating ? BASE : BASE + '/' + editingId, d).then(function (r) {
        saving = false; btn.disabled = false;
        U.Drawer.close(drawer); st.page = creating ? 1 : st.page;
        toast(creating ? 'تمت إضافة المشروع' : 'تم حفظ التغييرات', { text: r.data && r.data.title });
        load();
      }, function (er) {
        saving = false; btn.disabled = false; $('#pf-state').textContent = '';
        if (er.status === 422) { showServerErrors(er.errors); toast('يرجى تصحيح الحقول المظللة', { text: DB.firstError(er), tone: 'danger', icon: 'error' }); }
        else DB.fail(er, 'تعذّر حفظ المشروع');
      });
    });

    load().then(function () { if (location.hash === '#new' && can('projects.create')) setTimeout(function () { openDrawer(null); }, 300); });
  });
})();
