/* سجل العمليات (/admin/audit-logs): details drawer (what changed: old -> new) + auto-submitting filters. Read-only; config in window.__AUDIT_CFG. */
(function () {
  'use strict';
  var UI = window.AdminUI, CFG = window.__AUDIT_CFG;
  if (!UI || !CFG) return;
  var esc = UI.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  $$('[data-autosubmit]').forEach(function (el) { el.addEventListener('change', function () { if (el.form) el.form.submit(); }); });

  var drawer = $('#au-drawer'), body = $('#au-d-body'), seq = 0;
  function dl(pairs) {
    return '<dl class="au-dl">' + pairs.filter(function (p) { return p[1]; }).map(function (p) { return '<dt>' + esc(p[0]) + '</dt><dd>' + p[1] + '</dd>'; }).join('') + '</dl>';
  }
  function ltr(v) { return v ? '<bdi dir="ltr">' + esc(v) + '</bdi>' : ''; }
  function render(d) {
    var h = '<div class="au-head"><span class="pill pill-' + esc(d.tone) + '">' + esc(d.action_label) + '</span><span class="au-mod"><span class="material-symbols-outlined" aria-hidden="true">' + esc(d.icon) + '</span>' + esc(d.module_label) + '</span></div>';
    h += '<p class="au-text">' + esc(d.description) + '</p>';
    h += dl([
      ['الوقت', ltr(d.time)],
      ['المستخدم', d.user ? esc(d.user) + (d.email ? ' <span class="muted">(' + ltr(d.email) + ')</span>' : '') : (d.email ? 'زائر ' + ltr(d.email) : 'النظام')],
      ['مفتاح العملية', ltr(d.action)],
      ['السجل المتأثر', d.subject_type ? esc(d.subject_type) + (d.subject_id ? ' <span class="muted">#' + esc(String(d.subject_id)) + '</span>' : '') : ''],
      ['اسم السجل', d.subject_label ? esc(d.subject_label) : ''],
      ['عنوان IP', ltr(d.ip)],
      ['المتصفح', d.user_agent ? '<span class="au-ua">' + esc(d.user_agent) + '</span>' : '']
    ]);
    if (d.changes && d.changes.length) {
      h += '<h3 class="au-h">التغييرات</h3><div class="table-wrap"><table class="table au-changes"><thead><tr><th scope="col">الحقل</th><th scope="col">قبل</th><th scope="col">بعد</th></tr></thead><tbody>' +
        d.changes.map(function (c) { return '<tr><th scope="row">' + esc(c.label) + (c.label !== c.field ? '<span class="muted ltr"> ' + esc(c.field) + '</span>' : '') + '</th><td class="au-old">' + esc(c.old) + '</td><td class="au-new">' + esc(c.new) + '</td></tr>'; }).join('') +
        '</tbody></table></div>';
    } else {
      h += '<p class="muted au-none">لم تُسجَّل تفاصيل تغيير لهذه العملية.</p>';
    }
    if (d.context && d.context.length) {
      h += '<h3 class="au-h">معلومات إضافية</h3><dl class="au-dl">' + d.context.map(function (c) { return '<dt class="ltr">' + esc(c.key) + '</dt><dd>' + esc(c.value) + '</dd>'; }).join('') + '</dl>';
    }
    return h;
  }
  function open(id, trigger) {
    var my = ++seq;
    $('#au-d-title').textContent = 'تفاصيل العملية';
    $('#au-d-sub').textContent = 'رقم ' + id;
    body.innerHTML = '<p class="muted">جارٍ التحميل…</p>';
    UI.Drawer.open(drawer, { returnFocus: trigger });
    fetch(CFG.item + '/' + encodeURIComponent(id), { credentials: 'same-origin', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (j) { if (my === seq) body.innerHTML = render(j.data); })
      .catch(function (s) { if (my === seq) body.innerHTML = '<p class="error"><span class="material-symbols-outlined" aria-hidden="true">error</span><span>' + (s === 404 ? 'السجل غير موجود.' : s === 403 ? 'لا تملك صلاحية عرض هذا السجل.' : 'تعذّر تحميل التفاصيل.') + '</span></p>'; });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-open]') : null;
    if (b) { e.preventDefault(); open(b.getAttribute('data-open'), b); }
  });
  $$('[data-close-drawer]').forEach(function (b) { b.addEventListener('click', function () { UI.Drawer.close(drawer); }); });
  if (CFG.open) open(CFG.open);
})();
