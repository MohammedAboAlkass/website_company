/* الوسوم (/admin/tags): add / edit drawer, merge drawer, auto-submitting filters. Server-rendered page, config in window.__TAGS_CFG. */
(function () {
  'use strict';
  var UI = window.AdminUI, CFG = window.__TAGS_CFG;
  if (!UI || !CFG) return;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  $$('[data-autosubmit]').forEach(function (el) { el.addEventListener('change', function () { if (el.form) el.form.submit(); }); });

  var drawer = $('#tg-drawer'), form = $('#tg-form');
  function openCreate() {
    form.action = CFG.store; $('#tg-method').disabled = true;
    $('#tg-title').textContent = 'وسم جديد'; $('#tg-sub').textContent = 'اكتب الاسم كما سيظهر أسفل الخبر.';
    $('#tg-name').value = ''; $('#tg-slug').value = ''; $('#tg-slug').placeholder = '';
    UI.Drawer.open(drawer, { focus: '#tg-name' });
  }
  function openEdit(b) {
    form.action = b.dataset.action; $('#tg-method').disabled = false; $('#tg-method').value = 'PUT';
    $('#tg-title').textContent = 'تعديل وسم'; $('#tg-sub').textContent = b.dataset.name;
    $('#tg-name').value = b.dataset.name; $('#tg-slug').value = ''; $('#tg-slug').placeholder = b.dataset.slug;
    UI.Drawer.open(drawer, { focus: '#tg-name', returnFocus: b });
  }
  var add = $('#tg-add'); if (add) add.addEventListener('click', openCreate);
  $$('[data-edit]').forEach(function (b) { b.addEventListener('click', function () { openEdit(b); }); });

  var mdrawer = $('#tm-drawer'), mform = $('#tm-form');
  if (mdrawer && mform) {
    var sel = $('#tm-target');
    CFG.targets.forEach(function (t) { var o = document.createElement('option'); o.value = t.id; o.textContent = t.name; sel.appendChild(o); });
    $$('[data-merge]').forEach(function (b) {
      b.addEventListener('click', function () {
        mform.action = b.dataset.action;
        $('#tm-sub').textContent = b.dataset.name + (+b.dataset.uses ? ' — مستخدم في ' + b.dataset.uses + ' خبر' : '');
        Array.prototype.forEach.call(sel.options, function (o) { o.hidden = o.value === b.dataset.id; o.disabled = o.value === b.dataset.id; });
        sel.value = '';
        mform.setAttribute('data-confirm', 'سيُدمج الوسم «' + b.dataset.name + '» في الوسم الذي اخترته ثم يُحذف.');
        UI.Drawer.open(mdrawer, { focus: '#tm-target', returnFocus: b });
      });
    });
    // window capture runs before the shared data-confirm handler: do not ask "are you sure?" about an empty choice
    window.addEventListener('submit', function (e) {
      if (e.target === mform && !sel.value) { e.preventDefault(); e.stopImmediatePropagation(); UI.toast('اختر الوسم الذي سيُدمج فيه', { tone: 'danger', icon: 'error' }); sel.focus(); }
    }, true);
  }
  $$('[data-close-drawer]').forEach(function (b) { b.addEventListener('click', function () { var d = b.closest('.drawer'); if (d) UI.Drawer.close(d); }); });

  // validation failed on the server: reopen the drawer with what the user typed
  if (CFG.mode === 'create') { openCreate(); $('#tg-name').value = CFG.old.name; $('#tg-slug').value = CFG.old.slug; }
  else if (CFG.mode === 'edit') { var b = document.querySelector('[data-edit][data-id="' + CFG.editId + '"]'); if (b) { openEdit(b); $('#tg-name').value = CFG.old.name; $('#tg-slug').value = CFG.old.slug; } }
})();
