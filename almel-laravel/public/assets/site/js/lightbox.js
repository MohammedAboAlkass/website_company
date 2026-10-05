/* =========================================================
   Image lightbox — self-hosted, dependency-free (no Fancybox / CDN).
   Hook:  any <a href="big-image" data-lb-group="name" data-lb-kicker data-lb-title
          [data-lb-type="video" data-lb-poster] [data-lb-thumb]> opens it; items with the
          same data-lb-group (and currently visible) form the gallery.
   Markup: resources/views/partials/site/lightbox.blade.php   Style: css/lightbox.css
   Features: caption + counter, next/prev (buttons, arrows — RTL aware —, swipe),
   zoom (buttons, + / − / 0, wheel, double click/tap, pinch) with pan, thumbnails,
   fullscreen, focus trap + inert background, scroll lock, neighbour preloading.
   ========================================================= */
(() => {
  "use strict";
  const root = document.getElementById("lightbox");
  if (!root || root.dataset.lbxReady) return;
  root.dataset.lbxReady = "1";
  // Always live directly under <body>: no transformed/clipped ancestor can break position:fixed, and the page behind can be made inert.
  document.body.appendChild(root);

  const T = (k, d) => { const c = window.SITE_T; return c && typeof c[k] === "string" && c[k] !== "" ? c[k] : d; };
  const $ = (s, r = root) => r.querySelector(s);
  const q = (n) => $(`[data-lb="${n}"]`);
  const view = q("media"), stage = q("stage"), spin = q("spin"), card = q("card");
  const kick = q("kicker"), title = q("title"), iEl = q("i"), nEl = q("n"), thumbs = q("thumbs");
  const btn = { close: q("close"), prev: q("prev"), next: q("next"), zin: q("zin"), zout: q("zout"), zreset: q("zreset"), fs: q("fs") };
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isRtl = () => getComputedStyle(document.documentElement).direction === "rtl";
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const MAX_FALLBACK = 4;

  let list = [], idx = 0, lastFocus = null, isOpen = false, closedAt = 0;
  let cur = null;                    // current slide: { el, node, type, s, x, y, max, ready }
  let inerted = [], lockPad = "", moved = false, lastTap = { t: 0, x: 0, y: 0 };
  const pointers = new Map();
  let gesture = null, spinTimer = 0;

  /* ---------- helpers ---------- */
  const isVideoItem = (el) => el.dataset.lbType === "video";
  const visible = (el) => el.isConnected && el.getClientRects().length > 0;
  const thumbSrc = (el) => {
    if (el.dataset.lbThumb) return el.dataset.lbThumb;
    const im = el.querySelector("img") || el.closest("article, figure, li, div")?.querySelector("img");
    return (im && (im.currentSrc || im.src)) || (isVideoItem(el) ? el.dataset.lbPoster || "" : el.getAttribute("href"));
  };
  const setDisabled = (b, off) => b.setAttribute("aria-disabled", off ? "true" : "false");
  const disabled = (b) => b.getAttribute("aria-disabled") === "true";

  /* ---------- zoom engine ---------- */
  const paint = (sl, animate) => {
    if (!sl || sl.type !== "image") return;
    const im = sl.node;
    im.classList.toggle("is-anim", !!animate && !reduced());
    im.style.transform = sl.s === 1 && !sl.x && !sl.y ? "" : `translate3d(${sl.x}px, ${sl.y}px, 0) scale(${sl.s})`;
    view.classList.toggle("is-zoomed", sl.s > 1.001);
    btn.zreset.textContent = Math.round(sl.s * 100) + "%";
    setDisabled(btn.zin, sl.s >= sl.max - 0.001);
    setDisabled(btn.zout, sl.s <= 1.001);
  };
  const limits = (sl) => {
    const w = sl.node.offsetWidth, h = sl.node.offsetHeight;
    return { mx: Math.max(0, (w * sl.s - view.clientWidth) / 2), my: Math.max(0, (h * sl.s - view.clientHeight) / 2) };
  };
  const fit = (sl) => {
    const l = limits(sl);
    sl.x = clamp(sl.x, -l.mx, l.mx);
    sl.y = clamp(sl.y, -l.my, l.my);
  };
  // Zoom to `ns`, keeping the point (cx, cy) (client coordinates) under the finger / cursor.
  const zoomTo = (sl, ns, cx, cy, animate) => {
    if (!sl || sl.type !== "image" || !sl.ready) return;
    ns = clamp(ns, 1, sl.max);
    const r = view.getBoundingClientRect();
    const px = (cx ?? r.left + r.width / 2) - (r.left + r.width / 2);
    const py = (cy ?? r.top + r.height / 2) - (r.top + r.height / 2);
    const k = ns / sl.s;
    sl.x = px - k * (px - sl.x);
    sl.y = py - k * (py - sl.y);
    sl.s = ns;
    if (ns <= 1.001) { sl.s = 1; sl.x = 0; sl.y = 0; }
    fit(sl);
    paint(sl, animate);
  };
  const zoomBy = (f, cx, cy, animate) => cur && zoomTo(cur, f > 1 ? cur.s * f : (cur.s / -f < 1.12 ? 1 : cur.s / -f), cx, cy, animate);
  const toggleZoom = (cx, cy) => {
    if (!cur || cur.type !== "image" || !cur.ready) return;
    if (cur.s > 1.05) zoomTo(cur, 1, cx, cy, true);
    else zoomTo(cur, Math.min(cur.max, 2.5), cx, cy, true);
  };

  /* ---------- slides ---------- */
  const buildSlide = (el, fromPx) => {
    const sl = { el, type: isVideoItem(el) ? "video" : "image", s: 1, x: 0, y: 0, max: MAX_FALLBACK, ready: false };
    const wrap = document.createElement("div");
    wrap.className = "lbx-slide";
    if (fromPx) wrap.style.setProperty("--lbx-from", fromPx + "px");
    sl.wrap = wrap;
    const src = el.getAttribute("href");
    const label = el.dataset.lbTitle || "";
    if (sl.type === "video") {
      const v = document.createElement("video");
      v.src = src; v.controls = true; v.playsInline = true; v.preload = "metadata";
      if (el.dataset.lbPoster) v.poster = el.dataset.lbPoster;
      v.setAttribute("aria-label", label || T("js.lb.video", "فيديو"));
      sl.node = v; sl.ready = true;
      wrap.appendChild(v);
    } else {
      const im = new Image();
      im.alt = label; im.decoding = "async"; im.draggable = false;
      im.addEventListener("load", () => {
        sl.ready = true;
        clearTimeout(spinTimer); spin.hidden = true;
        sl.max = clamp((im.naturalWidth / Math.max(1, im.offsetWidth)) * 2, 3, 8);
        wrap.classList.add("is-in");
        if (cur === sl) syncTools();
      });
      im.addEventListener("error", () => {
        clearTimeout(spinTimer); spin.hidden = true;
        const p = document.createElement("p");
        p.className = "lbx-err"; p.textContent = T("js.lb.error", "تعذّر تحميل الصورة");
        wrap.replaceChildren(p); wrap.classList.add("is-in");
        sl.type = "error"; sl.ready = false; sl.node = p;
        syncTools();
      });
      im.src = src;
      sl.node = im;
      wrap.appendChild(im);
    }
    return sl;
  };
  const syncTools = () => {
    const off = !cur || cur.type !== "image" || !cur.ready;
    if (off) { setDisabled(btn.zin, true); setDisabled(btn.zout, true); setDisabled(btn.zreset, true); btn.zreset.textContent = "100%"; view.classList.remove("is-zoomed"); }
    else { setDisabled(btn.zreset, false); paint(cur, false); }
  };
  const dropSlide = (sl) => {
    if (!sl) return;
    if (reduced()) { sl.wrap.remove(); return; }
    sl.wrap.classList.add("is-out");
    sl.wrap.classList.remove("is-in");
    setTimeout(() => sl.wrap.remove(), 200);
  };
  const preload = (k) => {
    const el = list[(k + list.length) % list.length];
    if (el && !isVideoItem(el)) { const im = new Image(); im.decoding = "async"; im.src = el.getAttribute("href"); }
  };

  const $$thumbs = () => Array.from(thumbs.children);
  const updateThumbs = () => {
    $$thumbs().forEach((b, k) => {
      const on = k === idx;
      b.setAttribute("aria-current", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
    const active = $$thumbs()[idx];
    if (active && !thumbs.hidden && thumbs.getClientRects().length) active.scrollIntoView({ block: "nearest", inline: "center", behavior: reduced() ? "auto" : "smooth" });
  };
  // The strip only exists on roomy screens (CSS hides it on phones): build it only when it is displayed, and let the browser lazy-load the thumbnails that scroll into view.
  const buildThumbs = () => {
    thumbs.replaceChildren();
    thumbs.hidden = list.length < 2;
    if (list.length < 2 || getComputedStyle(thumbs).display === "none") return;
    const frag = document.createDocumentFragment();
    list.forEach((el, k) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "lbx-thumb"; b.dataset.k = String(k);
      b.setAttribute("aria-label", T("js.lb.goto", "عرض العنصر {n}").replace("{n}", String(k + 1)) + (el.dataset.lbTitle ? ": " + el.dataset.lbTitle : ""));
      const src = thumbSrc(el);
      if (src && !(isVideoItem(el) && !el.dataset.lbPoster && !el.dataset.lbThumb)) {
        const im = document.createElement("img");
        im.loading = "lazy"; im.decoding = "async"; im.alt = ""; im.draggable = false; im.src = src;     // `loading` must be set before `src`
        b.appendChild(im);
      } else b.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">play_circle</span>';
      frag.appendChild(b);
    });
    thumbs.appendChild(frag);
    updateThumbs();
  };

  const show = (i, dir) => {
    if (!list.length) return;
    idx = (i + list.length) % list.length;
    const el = list[idx];
    const old = cur;
    clearTimeout(spinTimer); spin.hidden = true;
    // the new slide enters from the side of travel (next = to the reading end), a short calm slide + fade
    const sign = dir === 0 ? 0 : (dir > 0 ? 1 : -1) * (isRtl() ? -1 : 1);
    cur = buildSlide(el, sign * 26);
    view.appendChild(cur.wrap);
    if (cur.type === "video") requestAnimationFrame(() => cur && cur.wrap.classList.add("is-in"));
    else {
      clearTimeout(spinTimer);
      spinTimer = setTimeout(() => { if (cur && !cur.ready && cur.type === "image") spin.hidden = false; }, 160);
    }
    dropSlide(old);
    kick.textContent = el.dataset.lbKicker || "";
    title.textContent = el.dataset.lbTitle || "";
    card.hidden = !(kick.textContent || title.textContent);
    if (title.textContent) { root.setAttribute("aria-labelledby", "lb-title"); root.removeAttribute("aria-label"); }
    else { root.removeAttribute("aria-labelledby"); root.setAttribute("aria-label", T("js.lb.dialog", "عارض الصور")); }
    iEl.textContent = idx + 1;
    nEl.textContent = list.length;
    btn.prev.hidden = btn.next.hidden = list.length < 2;
    view.classList.remove("is-zoomed");
    syncTools();
    updateThumbs();
    preload(idx + 1);
    preload(idx - 1);
  };
  const go = (d) => { if (list.length > 1) show(idx + d, d); };

  /* ---------- fullscreen ---------- */
  const fsOn = () => document.fullscreenElement === root || document.webkitFullscreenElement === root;
  const syncFs = () => {
    const on = fsOn();
    btn.fs.setAttribute("aria-pressed", String(on));
    btn.fs.setAttribute("aria-label", on ? T("js.lb.fs_off", "إنهاء ملء الشاشة") : T("js.lb.fs_on", "ملء الشاشة"));
    btn.fs.firstElementChild.textContent = on ? "fullscreen_exit" : "fullscreen";
  };
  const toggleFs = () => {
    if (fsOn()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else (root.requestFullscreen || root.webkitRequestFullscreen)?.call(root);
  };
  if (root.requestFullscreen || root.webkitRequestFullscreen) btn.fs.hidden = false;
  document.addEventListener("fullscreenchange", () => { syncFs(); if (isOpen && cur) requestAnimationFrame(() => { fit(cur); paint(cur, false); }); });

  /* ---------- open / close ---------- */
  const focusables = () => Array.from(root.querySelectorAll("button, video[controls], a[href]")).filter((x) => !x.hidden && !x.closest("[hidden]") && x.getClientRects().length && x.tabIndex !== -1);
  const lockScroll = () => {
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    lockPad = document.body.style.paddingInlineEnd;
    if (sbw > 0) document.body.style.paddingInlineEnd = sbw + "px";
    document.documentElement.classList.add("lbx-lock");
  };
  const unlockScroll = () => {
    document.documentElement.classList.remove("lbx-lock");
    document.body.style.paddingInlineEnd = lockPad;
  };
  const inertOthers = () => {
    inerted = [];
    Array.from(document.body.children).forEach((n) => {
      if (n === root || /^(SCRIPT|STYLE|LINK|NOSCRIPT)$/.test(n.tagName) || n.inert) return;
      n.inert = true; inerted.push(n);
    });
  };
  const open = (el) => {
    const group = el.dataset.lbGroup;
    list = Array.from(document.querySelectorAll("[data-lb-group]")).filter((x) => x.dataset.lbGroup === group && visible(x));
    if (!list.includes(el)) list = [el];
    lastFocus = el;
    isOpen = true;
    root.classList.toggle("lbx--ltr", !isRtl());
    btn.prev.firstElementChild.textContent = isRtl() ? "arrow_forward" : "arrow_back";
    btn.next.firstElementChild.textContent = isRtl() ? "arrow_back" : "arrow_forward";
    lockScroll();
    inertOthers();
    root.hidden = false;
    syncFs();
    buildThumbs();
    show(list.indexOf(el), 0);
    btn.close.focus({ preventScroll: true });
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", onResize);
  };
  const close = (byPointer) => {
    if (!isOpen) return;
    isOpen = false;
    if (byPointer === true) closedAt = Date.now();      // pointer close: swallow the 2nd click of a double click so it cannot hit the page below
    if (fsOn()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    document.removeEventListener("keydown", onKey, true);
    window.removeEventListener("resize", onResize);
    clearTimeout(spinTimer); spin.hidden = true;
    view.replaceChildren(); thumbs.replaceChildren();
    cur = null; gesture = null; pointers.clear();
    view.classList.remove("is-zoomed", "is-dragging");
    root.hidden = true;
    unlockScroll();
    inerted.forEach((n) => { n.inert = false; });
    inerted = [];
    if (lastFocus && lastFocus.isConnected) lastFocus.focus({ preventScroll: true });
  };
  const onResize = () => {
    if (cur) { fit(cur); paint(cur, false); }
    if (list.length > 1 && !thumbs.children.length) buildThumbs();      // e.g. a tablet rotated to landscape
  };

  /* ---------- keyboard ---------- */
  const onKey = (e) => {
    if (!isOpen || e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key;
    const inVideo = e.target && e.target.tagName === "VIDEO";
    const on = e.target && e.target.closest && e.target.closest("button");
    if (k === "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
    else if ((k === "ArrowLeft" || k === "ArrowRight") && !inVideo) {
      e.preventDefault();
      const toEnd = (k === "ArrowLeft") === isRtl();    // RTL: left arrow = next, right arrow = previous
      go(toEnd ? 1 : -1);
    }
    else if (k === "Home" && !inVideo) { e.preventDefault(); show(0, -1); }
    else if (k === "End" && !inVideo) { e.preventDefault(); show(list.length - 1, 1); }
    else if (k === "+" || k === "=" || k === "Add") { e.preventDefault(); zoomBy(1.5, undefined, undefined, true); }
    else if (k === "-" || k === "_" || k === "Subtract") { e.preventDefault(); zoomBy(-1.5, undefined, undefined, true); }
    else if (k === "0" && cur) { e.preventDefault(); zoomTo(cur, 1, undefined, undefined, true); }
    else if ((k === "ArrowUp" || k === "ArrowDown") && cur && cur.s > 1.001 && !on) {
      e.preventDefault(); cur.y += k === "ArrowUp" ? 70 : -70; fit(cur); paint(cur, true);
    }
    else if (k === "Tab") {
      const f = focusables();
      if (!f.length) { e.preventDefault(); return; }
      const first = f[0], last = f[f.length - 1], a = document.activeElement;
      if (!root.contains(a)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
    }
  };

  /* ---------- pointer gestures: pan, swipe, pinch, double tap ---------- */
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  view.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (cur && cur.type === "video" && e.target.closest("video")) return;     // keep native video controls usable
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { view.setPointerCapture(e.pointerId); } catch (_) { /* not capturable */ }
    if (pointers.size === 1) {
      moved = false;
      gesture = { kind: "one", sx: e.clientX, sy: e.clientY, ox: cur ? cur.x : 0, oy: cur ? cur.y : 0, t: performance.now(), type: e.pointerType, axis: "" };
    } else if (pointers.size === 2 && cur && cur.type === "image" && cur.ready) {
      const [a, b] = [...pointers.values()];
      gesture = { kind: "pinch", d0: dist(a, b), s0: cur.s, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
      moved = true;
      resetSwipe();
    }
  });
  const swipeEl = () => cur && cur.wrap;
  const resetSwipe = () => {
    const w = swipeEl(); if (!w) return;
    w.classList.remove("is-swiping");
    w.style.transform = ""; w.style.opacity = "";
  };
  view.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId) || !gesture) return;
    const p = pointers.get(e.pointerId);
    p.x = e.clientX; p.y = e.clientY;
    if (gesture.kind === "pinch" && pointers.size >= 2 && cur) {
      const [a, b] = [...pointers.values()];
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const ns = clamp(gesture.s0 * (dist(a, b) / Math.max(1, gesture.d0)), 1, cur.max);
      zoomTo(cur, ns, mx, my, false);
      cur.x += mx - gesture.mx; cur.y += my - gesture.my; fit(cur); paint(cur, false);
      gesture.mx = mx; gesture.my = my;
      return;
    }
    if (gesture.kind !== "one" || !cur) return;
    const dx = e.clientX - gesture.sx, dy = e.clientY - gesture.sy;
    if (!moved && Math.hypot(dx, dy) > 7) { moved = true; if (cur.s > 1.001) view.classList.add("is-dragging"); }
    if (!moved) return;
    if (cur.type === "image" && cur.s > 1.001) {                 // pan the zoomed image
      cur.x = gesture.ox + dx; cur.y = gesture.oy + dy; fit(cur); paint(cur, false);
    } else if (gesture.type !== "mouse") {
      // touch / pen at 1×: follow the finger horizontally (swipe to navigate)
      if (!gesture.axis) gesture.axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
      if (gesture.axis === "x" && list.length > 1) {
        const w = swipeEl();
        w.classList.add("is-swiping");
        w.style.transform = `translateX(${dx * 0.85}px)`;
        w.style.opacity = String(1 - Math.min(0.5, Math.abs(dx) / Math.max(300, view.clientWidth)));
      }
    }
  });
  const endPointer = (e, cancelled) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    try { view.releasePointerCapture(e.pointerId); } catch (_) { /* already released */ }
    view.classList.remove("is-dragging");
    const g = gesture;
    if (g && g.kind === "pinch") { if (pointers.size < 2) { gesture = null; if (cur && cur.s < 1.02) zoomTo(cur, 1, undefined, undefined, true); } return; }
    if (!g || g.kind !== "one" || pointers.size) return;
    gesture = null;
    const dx = e.clientX - g.sx, dy = e.clientY - g.sy;
    const dt = Math.max(1, performance.now() - g.t);
    const w = swipeEl();
    const swiping = !!(w && w.classList.contains("is-swiping"));
    if (cancelled) { if (swiping) resetSwipe(); return; }
    if (moved) {
      if (g.type !== "mouse" && cur && cur.s <= 1.001) {
        const commitX = g.axis === "x" && list.length > 1 && (Math.abs(dx) > 60 || (Math.abs(dx) > 28 && Math.abs(dx) / dt > 0.45));
        if (commitX) {
          // RTL: finger moves right → the next item (it sits on the left); LTR mirrors
          const next = isRtl() ? dx > 0 : dx < 0;
          w.classList.remove("is-swiping"); w.style.opacity = "";      // keep the dragged offset; the old slide just fades away
          go(next ? 1 : -1);
          return;
        }
        if (g.axis === "y" && dy > 110 && Math.abs(dy) > Math.abs(dx) * 1.5) { resetSwipe(); close(true); return; }
      }
      if (swiping) resetSwipe();
      return;
    }
    // a tap / click without movement → double tap / double click toggles zoom
    const now = Date.now();
    const ir = cur && cur.type === "image" ? cur.node.getBoundingClientRect() : null;    // pointer capture retargets events, so hit-test by position
    const onImage = !!ir && e.clientX >= ir.left && e.clientX <= ir.right && e.clientY >= ir.top && e.clientY <= ir.bottom;
    if (onImage && now - lastTap.t < 320 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 28) {
      lastTap.t = 0;
      toggleZoom(e.clientX, e.clientY);
    } else lastTap = { t: now, x: e.clientX, y: e.clientY };
  };
  view.addEventListener("pointerup", (e) => endPointer(e, false));
  view.addEventListener("pointercancel", (e) => endPointer(e, true));

  view.addEventListener("wheel", (e) => {
    if (!cur || cur.type !== "image" || !cur.ready) return;
    e.preventDefault();
    const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
    const f = Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0018));
    zoomTo(cur, cur.s * f, e.clientX, e.clientY, false);
  }, { passive: false });
  // suppress the native dblclick text-selection / zoom (we handle double click ourselves)
  view.addEventListener("dblclick", (e) => e.preventDefault());

  /* ---------- clicks ---------- */
  btn.close.addEventListener("click", (e) => close(e.detail > 0));
  btn.prev.addEventListener("click", () => go(-1));
  btn.next.addEventListener("click", () => go(1));
  btn.zin.addEventListener("click", () => { if (!disabled(btn.zin)) zoomBy(1.5, undefined, undefined, true); });
  btn.zout.addEventListener("click", () => { if (!disabled(btn.zout)) zoomBy(-1.5, undefined, undefined, true); });
  btn.zreset.addEventListener("click", () => { if (cur && !disabled(btn.zreset)) zoomTo(cur, 1, undefined, undefined, true); });
  btn.fs.addEventListener("click", toggleFs);
  thumbs.addEventListener("click", (e) => {
    const b = e.target.closest(".lbx-thumb");
    if (!b) return;
    const k = Number(b.dataset.k);
    if (k !== idx) show(k, k > idx ? 1 : -1);
  });
  root.addEventListener("pointerdown", () => { moved = false; }, true);
  // clicking the empty backdrop / area around the picture closes (never the picture, the bars or the buttons)
  root.addEventListener("click", (e) => {
    if (!(e.target === root || e.target === stage || e.target === view || (cur && e.target === cur.wrap))) return;
    if (moved) { moved = false; return; }
    if (cur && cur.node && cur.node.getBoundingClientRect) {     // pointer capture retargets the click to the view: hit-test the picture by position
      const r = cur.node.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) return;
    }
    close(true);
  });

  /* ---------- opening links ---------- */
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented) return;
    const a = e.target.closest && e.target.closest("[data-lb-group]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (isOpen || Date.now() - closedAt < 450) return;     // ignore the second click of a double-click on the backdrop
    open(a);
  });
})();
