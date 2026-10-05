/* النسخ الاحتياطي: real export (JSON file), validated import with preview + transaction, history.
   Server: App\Http\Controllers\Admin\BackupController (routes admin.backup.*). */
(function () {
  'use strict';
  function start() {
    var UI = window.AdminUI, DB = window.AdminDB;
    if (!UI || !DB || !document.getElementById('bk-groups')) return;
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var esc = UI.esc, icon = UI.icon, toast = UI.toast;
    var ME = window.__ADMIN_USER || {};
    var canManage = !ME.permissions || ME.is_super || ME.permissions.indexOf('backup.manage') >= 0;
    var KIND = { export: 'تصدير يدوي', scheduled: 'مجدولة', pre_restore: 'نسخة أمان', import: 'استعادة' };
    var GL = {}, groups = [], pending = null;

    function size(n) { return n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
    function when(iso) { if (!iso) return '—'; try { return new Intl.DateTimeFormat('ar-EG-u-nu-latn', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)); } catch (e) { return iso; } }

    function load() {
      return DB.api('GET', '/admin/backup/data').then(function (r) {
        groups = r.data.groups; groups.forEach(function (g) { GL[g.key] = g.label; });
        renderGroups(); renderHistory(r.data.runs);
      }).catch(function (e) { DB.fail(e, 'تعذّر تحميل بيانات النسخ'); });
    }

    function renderGroups() {
      var keep = $$('#bk-groups input:checked').map(function (i) { return i.value; });
      var first = !$('#bk-groups input');
      $('#bk-groups').innerHTML = groups.map(function (g) {
        var on = first ? g.default : keep.indexOf(g.key) > -1;
        return '<label class="bk-g"><input type="checkbox" class="checkbox" value="' + esc(g.key) + '"' + (on ? ' checked' : '') + '><span><strong>' + esc(g.label) + (g.sensitive ? ' ' + UI.pill('بيانات حساسة', 'warn') : '') + '</strong><small>' + esc(g.hint) + '</small></span><span class="bk-cnt">' + g.rows + ' صفاً · ' + g.tables + ' جدولاً</span></label>';
      }).join('');
      $('#bk-export').disabled = !canManage;
    }

    function renderHistory(runs) {
      var box = $('#bk-history');
      if (!runs.length) { box.innerHTML = UI.emptyState('backup', 'لا توجد نسخ بعد', 'أنشئ أول نسخة احتياطية من البطاقة أعلاه.'); return; }
      box.innerHTML = '<div class="table-wrap" tabindex="0" role="region" aria-label="سجل النسخ"><table class="table bk-hist"><thead><tr><th scope="col">التاريخ</th><th scope="col">النوع</th><th scope="col">المحتوى</th><th scope="col">الحجم</th><th scope="col">الصفوف</th><th scope="col">بواسطة</th><th scope="col"><span class="sr-only">إجراءات</span></th></tr></thead><tbody>' +
        runs.map(function (r) {
          var ok = r.status === 'ok';
          return '<tr><td>' + esc(when(r.created_at)) + '</td><td>' + UI.pill(KIND[r.kind] || r.kind, ok ? (r.kind === 'import' ? 'warn' : 'info') : 'danger') + (ok ? '' : ' <small>فشلت</small>') + '</td>' +
            '<td>' + esc((r.scope || []).map(function (k) { return GL[k] || k; }).join('، ') || '—') + (r.note ? '<br><small class="muted">' + esc(r.note) + '</small>' : '') + '</td>' +
            '<td>' + (r.size ? size(r.size) : '—') + '</td><td>' + (r.rows || '—') + '</td><td>' + esc(r.user || '—') + '</td><td>' +
            (canManage ? (r.available ? '<a class="icon-btn sm" href="/admin/backup/download/' + r.id + '" aria-label="تنزيل" title="تنزيل">' + icon('download') + '</a>' : '') + '<button type="button" class="icon-btn sm" data-del="' + r.id + '" aria-label="حذف من السجل" title="حذف">' + icon('delete') + '</button>' : '') +
            '</td></tr>';
        }).join('') + '</tbody></table></div>';
    }

    $('#bk-history').addEventListener('click', function (e) {
      var b = e.target.closest('[data-del]'); if (!b) return;
      UI.confirmDelete('النسخة', 'سيُحذف ملف النسخة من الخادم نهائياً.').then(function (ok) {
        if (!ok) return;
        DB.api('DELETE', '/admin/backup/' + b.getAttribute('data-del')).then(function (r) { toast(r.message || 'تم الحذف', { icon: 'delete' }); load(); }).catch(function (x) { DB.fail(x); });
      });
    });

    $('#bk-export').addEventListener('click', function () {
      var sel = $$('#bk-groups input:checked').map(function (i) { return i.value; });
      if (!sel.length) { toast('اختر مجموعة واحدة على الأقل', { tone: 'danger', icon: 'error' }); return; }
      var btn = this; btn.disabled = true;
      DB.api('POST', '/admin/backup/export', { groups: sel, note: $('#bk-note').value }).then(function (r) {
        btn.disabled = false; $('#bk-note').value = '';
        toast('تم إنشاء النسخة', { text: size(r.data.size) + ' · ' + r.data.rows + ' صفاً', icon: 'task_alt' });
        var a = document.createElement('a'); a.href = r.url; a.download = r.data.filename; document.body.appendChild(a); a.click(); a.remove();
        load();
      }).catch(function (x) { btn.disabled = false; DB.fail(x, 'تعذّر إنشاء النسخة'); });
    });

    /* ---- import ---- */
    var drop = $('#bk-drop'), fileIn = $('#bk-file');
    ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('is-over'); }); });
    drop.addEventListener('drop', function (e) { var f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) inspect(f); });
    fileIn.addEventListener('change', function () { if (fileIn.files[0]) inspect(fileIn.files[0]); fileIn.value = ''; });
    if (!canManage) { drop.style.display = 'none'; }

    function inspect(f) {
      if (!/\.json$/i.test(f.name)) { toast('الملف غير مدعوم', { text: 'يجب أن يكون الملف بصيغة JSON.', tone: 'danger', icon: 'error' }); return; }
      var box = $('#bk-preview'); box.hidden = false; box.innerHTML = '<p class="muted">جارٍ فحص الملف…</p>'; pending = null;
      var fd = new FormData(); fd.append('file', f);
      DB.api('POST', '/admin/backup/inspect', fd).then(function (r) { pending = r.data; renderPreview(); }).catch(function (x) {
        var list = (x.errors && x.errors.file) || [x.message];
        box.innerHTML = '<div class="bk-danger"><strong>تعذّرت الاستعادة من هذا الملف:</strong><ul>' + list.slice(0, 6).map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul></div>';
      });
    }

    function renderPreview() {
      var d = pending, box = $('#bk-preview');
      var byGroup = {}; d.tables.forEach(function (t) { (byGroup[t.group] = byGroup[t.group] || []).push(t); });
      var gl = {}; groups.forEach(function (g) { gl[g.key] = g; });
      box.innerHTML = '<div class="bk-prev"><p><strong>' + esc(d.file) + '</strong> — نسخة بتاريخ ' + esc(when(d.created_at)) + ' ' + UI.pill('الملف سليم', 'info') + '</p>' +
        (d.warnings || []).map(function (w) { return '<div class="bk-warn">' + esc(w) + '</div>'; }).join('') +
        '<div class="bk-groups">' + d.groups.map(function (k) { var g = gl[k] || { label: k, sensitive: false }; var ts = byGroup[k] || [];
          return '<label class="bk-g"><input type="checkbox" class="checkbox" data-rg value="' + esc(k) + '"' + ((g.sensitive || (k === 'access' && !ME.is_super)) ? '' : ' checked') + (k === 'access' && !ME.is_super ? ' disabled' : '') + '><span><strong>' + esc(g.label) + '</strong><small>' + ts.map(function (t) { return esc(t.table) + ': ' + t.current + ' ← ' + t.incoming; }).join(' · ') + '</small></span></label>'; }).join('') + '</div>' +
        '<div class="bk-danger">الاستعادة <strong>تستبدل</strong> بيانات المجموعات المختارة بالكامل بما في الملف (الحالي ← القادم). تُحفظ نسخة أمان قبلها ويتم كل شيء في عملية واحدة تُلغى عند أي خطأ.</div>' +
        '<div class="bk-confirm"><div class="field"><label class="label" for="bk-confirm">اكتب كلمة «استعادة» للتأكيد</label><input class="input" id="bk-confirm" autocomplete="off"></div><div class="field"><label class="label" for="bk-pass">كلمة مرورك الحالية</label><input class="input" id="bk-pass" type="password" autocomplete="current-password" dir="ltr"></div><button type="button" class="btn btn-danger" id="bk-restore"><span class="material-symbols-outlined" aria-hidden="true">restore</span>استعادة الآن</button><button type="button" class="btn btn-ghost" id="bk-cancel">إلغاء</button></div></div>';
      $('#bk-cancel').addEventListener('click', function () { pending = null; box.hidden = true; box.innerHTML = ''; });
      $('#bk-restore').addEventListener('click', function () {
        var sel = $$('input[data-rg]:checked', box).map(function (i) { return i.value; });
        if (!sel.length) { toast('اختر مجموعة واحدة على الأقل', { tone: 'danger', icon: 'error' }); return; }
        if (!$('#bk-pass').value) { toast('أدخل كلمة مرورك الحالية', { tone: 'danger', icon: 'error' }); $('#bk-pass').focus(); return; }
        var btn = this; btn.disabled = true;
        DB.api('POST', '/admin/backup/restore', { token: pending.token, groups: sel, confirm: $('#bk-confirm').value, password: $('#bk-pass').value }).then(function (r) {
          toast('تمت الاستعادة', { text: r.message, icon: 'task_alt', duration: 6000 });
          pending = null; box.hidden = true; box.innerHTML = ''; load();
        }).catch(function (x) { btn.disabled = false; DB.fail(x, 'تعذّرت الاستعادة'); });
      });
    }

    load();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 0); }); else setTimeout(start, 0);
})();
