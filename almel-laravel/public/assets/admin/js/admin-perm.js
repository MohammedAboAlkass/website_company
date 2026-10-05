/* Permission-aware UI helper (loaded before admin.js on every dashboard page).
   window.__ADMIN_USER = { name, email, role, role_label, is_super, permissions: ['news.view', ...] } comes from layouts/admin.blade.php.
   - data-perm="news.create"           hide the element when the user lacks the permission ("a|b" = any of them)
   - data-perm-mode="disable"           disable it instead of hiding it
   The server enforces every permission (403); this only removes buttons the user could not use. */
(function () {
  'use strict';
  var ME = window.__ADMIN_USER || null;
  var set = {};
  if (ME && ME.permissions) ME.permissions.forEach(function (k) { set[k] = 1; });
  function can(k) {
    if (!ME || ME.is_super || !k) return true;
    return String(k).split('|').some(function (x) { return !!set[x.trim()]; });
  }
  function all(list) { return (list || []).every(can); }
  function one(el) {
    var ok = can(el.getAttribute('data-perm'));
    var disable = el.getAttribute('data-perm-mode') === 'disable';
    if (ok) {
      if (el.getAttribute('data-perm-off') === '1') {
        el.removeAttribute('data-perm-off');
        if (disable) { el.removeAttribute('disabled'); el.removeAttribute('aria-disabled'); el.removeAttribute('title'); }
        else el.style.removeProperty('display');
      }
      return;
    }
    el.setAttribute('data-perm-off', '1');
    if (disable) { el.setAttribute('disabled', ''); el.setAttribute('aria-disabled', 'true'); el.setAttribute('title', 'لا تملك صلاحية لهذا الإجراء'); }
    else el.style.setProperty('display', 'none', 'important');
  }
  function apply(root) {
    var r = root && root.querySelectorAll ? root : document;
    if (r !== document && r.matches && r.matches('[data-perm]')) one(r);
    r.querySelectorAll('[data-perm]').forEach(one);
  }
  window.AdminPerm = { can: can, all: all, apply: apply, user: ME };
  function start() {
    apply(document);
    if (!window.MutationObserver) return;
    var queued = false;
    new MutationObserver(function (list) {
      if (queued) return; queued = true;
      setTimeout(function () { queued = false; apply(document); }, 30);
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
