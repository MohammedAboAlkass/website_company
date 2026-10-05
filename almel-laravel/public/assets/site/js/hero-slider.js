/* Homepage hero slider (fade / slide). No mouse-driven effects: only timed changes, arrows, dots and keyboard-reachable buttons. */
(function () {
  'use strict';
  var T = function (k, d) { var c = window.SITE_T; return c && typeof c[k] === 'string' && c[k] !== '' ? c[k] : d; };
  var root = document.querySelector('[data-hero]');
  if (!root) return;
  var bgs = [].slice.call(root.querySelectorAll('.hs-bg'));
  var slides = [].slice.call(root.querySelectorAll('.hs-slide'));
  var dots = [].slice.call(root.querySelectorAll('.hs-dot-btn'));
  var n = slides.length;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = 0, timer = null, userPaused = false, hovering = false, focusing = false;
  var cfg = {
    autoplay: root.getAttribute('data-autoplay') === '1' && !reduce,
    interval: parseInt(root.getAttribute('data-interval'), 10) || 6000,
    loop: root.getAttribute('data-loop') === '1',
    hover: root.getAttribute('data-hover') === '1'
  };

  function playVideo(i) {
    bgs.forEach(function (b, k) {
      var v = b.querySelector('video');
      if (!v) return;
      if (k === i && !reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else if (k !== i) { v.pause(); }
    });
  }
  function setPos() {
    [bgs, slides].forEach(function (list) {
      list.forEach(function (el, k) {
        el.setAttribute('data-pos', k === cur ? 'active' : (k < cur ? 'before' : 'after'));
        el.classList.toggle('is-active', k === cur);
      });
    });
    slides.forEach(function (el, k) {
      if (k === cur) { el.removeAttribute('aria-hidden'); el.removeAttribute('inert'); }
      else { el.setAttribute('aria-hidden', 'true'); el.setAttribute('inert', ''); }
    });
    dots.forEach(function (d, k) {
      d.classList.toggle('is-active', k === cur);
      if (k === cur) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
    });
  }
  function go(i, user) {
    if (n < 2) return;
    if (i >= n) { if (!cfg.loop) { stop(); return; } i = 0; }
    if (i < 0) { if (!cfg.loop) return; i = n - 1; }
    cur = i;
    setPos();
    playVideo(cur);
    if (user === 'user') schedule();
    else schedule();
  }
  function delay() {
    var d = parseInt(bgs[cur] && bgs[cur].getAttribute('data-d'), 10);
    return d > 0 ? d : cfg.interval;
  }
  function stop() { if (timer) { clearTimeout(timer); timer = null; } }
  function schedule() {
    stop();
    if (!cfg.autoplay || userPaused || hovering || focusing || document.hidden || n < 2) return;
    if (!cfg.loop && cur >= n - 1) return;
    timer = setTimeout(function () { go(cur + 1); }, delay());
  }

  var prev = root.querySelector('.hs-prev'), next = root.querySelector('.hs-next'), pp = root.querySelector('.hs-pp');
  if (prev) prev.addEventListener('click', function () { go(cur - 1, 'user'); });
  if (next) next.addEventListener('click', function () { go(cur + 1, 'user'); });
  dots.forEach(function (d) { d.addEventListener('click', function () { go(parseInt(d.getAttribute('data-go'), 10) || 0, 'user'); }); });
  if (pp) pp.addEventListener('click', function () {
    userPaused = !userPaused;
    pp.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
    pp.setAttribute('aria-label', userPaused ? T('js.play.play', 'تشغيل التبديل التلقائي') : T('js.play.pause', 'إيقاف التشغيل التلقائي'));
    pp.querySelector('.material-symbols-outlined').textContent = userPaused ? 'play_arrow' : 'pause';
    schedule();
  });
  if (cfg.hover) { // pausing while the pointer is over the hero is an accessibility aid, not a visual effect
    root.addEventListener('mouseenter', function () { hovering = true; stop(); });
    root.addEventListener('mouseleave', function () { hovering = false; schedule(); });
  }
  root.addEventListener('focusin', function () { focusing = true; stop(); });
  root.addEventListener('focusout', function () { focusing = false; schedule(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else schedule(); });
  root.addEventListener('keydown', function (e) {
    if (n < 2) return;
    if (e.key === 'ArrowLeft') { go(cur + 1, 'user'); } else if (e.key === 'ArrowRight') { go(cur - 1, 'user'); }
  });

  if (reduce) bgs.forEach(function (b) { var v = b.querySelector('video'); if (v) { v.removeAttribute('autoplay'); v.pause(); } });
  schedule();
  window.HeroSlider = { go: function (i) { go(i, 'user'); }, current: function () { return cur; } };
})();
