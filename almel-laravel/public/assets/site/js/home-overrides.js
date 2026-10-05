/* =========================================================================
   home-overrides.js — applies the homepage settings saved from the admin
   page "الصفحة الرئيسية" (admin/homepage.html) in this browser:
     • section order + visibility  ← localStorage "almel-admin-home-sections"
       (shared with the sections panel of admin/pages.html)
     • section headings (eyebrow + title) ← "almel-admin-home-titles"
   Safety: runs before js/main.js; does nothing when nothing is saved;
   only moves / hides existing <section> elements and writes text with
   textContent (never innerHTML). Icons and decorative spans are kept.
   Every step is wrapped so a bad value can never break the page.
   ========================================================================= */
(function () {
  'use strict';
  var KEY_SECTIONS = 'almel-admin-home-sections', KEY_TITLES = 'almel-admin-home-titles';

  /* heading targets for each homepage section (eyebrow is optional) */
  var HEADINGS = {
    'announcements': { title: '#announcements .ticker-label-text' },
    'appeal':        { eyebrow: '#appeal .appeal-body > p.text-gold-light', title: '#appeal-title' },
    'about':         { eyebrow: '#about .ab-intro-head .eyebrow', title: '#about-title' },
    'projects':      { eyebrow: '#projects .eyebrow', title: '#projects .section-title' },
    'stories':       { eyebrow: '#stories .eyebrow', title: '#stories-title' },
    'pillars':       { title: '#pillars .section-title' },
    'activities':    { eyebrow: '#activities .eyebrow', title: '#activities .section-title' },
    'impact-map':    { eyebrow: '#impact-map .eyebrow', title: '#impact-title' },
    'news':          { eyebrow: '#news .eyebrow', title: '#news .section-title' },
    'partners':      { eyebrow: '#partners .lux-eyebrow', title: '#partners-title' },
    'gallery':       { eyebrow: '#gallery .eyebrow', title: '#gallery .section-title' },
    'admin':         { eyebrow: '#admin .eyebrow-pill', title: '#admin .section-title' },
    'contact':       { eyebrow: '#contact .eyebrow', title: '#contact .section-title' },
    'faq':           { eyebrow: '#faq .eyebrow', title: '#faq-title' }
  };

  function read(key) { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } }
  function norm(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
  /* decorative children (icons, rules, dots) are preserved when text changes */
  function isDecor(n) {
    if (n.nodeType !== 1) return false;
    var c = n.classList;
    return n.getAttribute('aria-hidden') === 'true' || c.contains('material-symbols-outlined') ||
      c.contains('lux-rule') || c.contains('h-px') || c.contains('live-dot');
  }
  function readText(el) {
    var t = '';
    Array.prototype.forEach.call(el.childNodes, function (n) {
      if (n.nodeType === 3) t += n.nodeValue;
      else if (n.nodeType === 1 && !isDecor(n)) t += (n.tagName === 'BR' ? ' ' : n.textContent);
    });
    return norm(t);
  }
  function writeText(el, value) {
    value = norm(value);
    if (!value || value.length > 160 || value === readText(el)) return false;
    var kids = Array.prototype.slice.call(el.childNodes), anchor = null;
    kids.forEach(function (n) {
      var meaningful = n.nodeType === 3 ? /\S/.test(n.nodeValue) : (n.nodeType === 1 && !isDecor(n));
      if (!meaningful) return;
      if (!anchor) anchor = n;
      else el.removeChild(n);
    });
    var txt = document.createTextNode(value);
    if (anchor) el.replaceChild(txt, anchor); else el.appendChild(txt);
    return true;
  }

  function applyTitles(titles) {
    if (!titles || typeof titles !== 'object') return 0;
    var n = 0;
    Object.keys(HEADINGS).forEach(function (id) {
      var t = titles[id]; if (!t || typeof t !== 'object') return;
      ['eyebrow', 'title'].forEach(function (k) {
        try {
          var sel = HEADINGS[id][k], el = sel && document.querySelector(sel);
          if (el && typeof t[k] === 'string' && writeText(el, t[k])) n++;
        } catch (e) { /* ignore one bad field */ }
      });
    });
    return n;
  }

  function applyLayout(layout) {
    if (!Array.isArray(layout) || !layout.length) return;
    var main = document.querySelector('main'); if (!main) return;
    var current = Array.prototype.filter.call(main.children, function (el) { return el.tagName === 'SECTION' && el.id; });
    var byId = {}; current.forEach(function (el) { byId[el.id] = el; });
    var wanted = [];
    layout.forEach(function (s) {
      if (!s || typeof s.id !== 'string' || !byId[s.id] || wanted.indexOf(byId[s.id]) >= 0) return;
      wanted.push(byId[s.id]);
      if (s.visible === false) { byId[s.id].style.display = 'none'; byId[s.id].setAttribute('data-admin-hidden', ''); }
    });
    current.forEach(function (el) { if (wanted.indexOf(el) < 0) wanted.push(el); }); // unknown sections keep their relative order at the end
    var same = wanted.every(function (el, i) { return el === current[i]; });
    if (same) return; // nothing to move
    var marker = document.createComment('home-sections');
    main.insertBefore(marker, current[0]);
    wanted.forEach(function (el) { main.insertBefore(el, marker); });
    main.removeChild(marker);
  }

  window.HomeOverrides = { HEADINGS: HEADINGS, readText: readText };
  try { applyLayout(read(KEY_SECTIONS)); } catch (e) { /* keep original layout */ }
  try { applyTitles(read(KEY_TITLES)); } catch (e) { /* keep original headings */ }
})();
