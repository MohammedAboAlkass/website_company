(() => {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Header state ---------- */
  const header = $("#site-header");
  const fab = $(".fab");
  const onScroll = () => {
    const scrolled = window.scrollY > 40;
    header.classList.toggle("is-scrolled", scrolled);
    header.classList.toggle("is-top", !scrolled);
    fab?.classList.toggle("is-shown", window.scrollY > window.innerHeight * 0.6);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const menuBtn = $("#menu-btn");
  const mobileMenu = $("#mobile-menu");
  const setMenu = (open) => {
    mobileMenu.hidden = !open;
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
    menuBtn.querySelector(".material-symbols-outlined").textContent = open ? "close" : "menu";
    document.body.style.overflow = open ? "hidden" : "";
    if (open) mobileMenu.querySelector("#mobile-nav a")?.focus({ preventScroll: true });
  };
  menuBtn.addEventListener("click", () => setMenu(mobileMenu.hidden));
  mobileMenu.addEventListener("click", (e) => {
    if (e.target.closest("a, [data-close]")) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !mobileMenu.hidden) { setMenu(false); menuBtn.focus(); }
  });
  window.addEventListener("resize", () => { if (window.innerWidth >= 1280 && !mobileMenu.hidden) setMenu(false); });

  /* ---------- Hero video & sound ---------- */
  const video = $("#hero-video");
  const soundBtn = $("#sound-btn");
  const eq = $("#eq");
  if (video && reduceMotion) { video.removeAttribute("autoplay"); video.pause(); }
  if (soundBtn && video) {
    soundBtn.addEventListener("click", async () => {
      video.muted = !video.muted;
      if (!video.muted) { try { await video.play(); } catch (_) {} }
      soundBtn.querySelector(".material-symbols-outlined").textContent = video.muted ? "volume_off" : "volume_up";
      soundBtn.setAttribute("aria-pressed", String(!video.muted));
      eq.classList.toggle("is-off", video.muted);
    });
  }

  /* ---------- Counters ---------- */
  const formatCount = (el, value) => {
    const decimals = Number(el.dataset.decimals || 0);
    const formatted = decimals ? value.toFixed(decimals)
      : Math.round(value).toLocaleString(el.dataset.sep === "true" ? "en-US" : "en-US", { useGrouping: el.dataset.sep === "true" });
    return (el.dataset.prefix || "") + formatted + (el.dataset.suffix || "");
  };
  const animateCount = (el) => {
    const end = parseFloat(el.dataset.count);
    if (reduceMotion || Number.isNaN(end)) { el.textContent = formatCount(el, end); return; }
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = formatCount(el, end * eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    el.textContent = formatCount(el, 0);
    requestAnimationFrame(tick);
  };

  /* ---------- Reveal on scroll ---------- */
  const targets = $$(".reveal, .bar-fill, [data-count]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        if (entry.target.matches("[data-count]")) animateCount(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- About: word-fill statement + sticky scrollytelling ---------- */
  const statement = $("[data-wordfill]");
  let words = [];
  if (statement) {
    const hl = new Set(["الغذاء", "والدواء", "والمأوى", "والتعليم،"]);
    const frag = document.createDocumentFragment();
    statement.textContent.trim().split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
      const w = document.createElement("span");
      w.className = "ab-word" + (hl.has(part) ? " ab-hl" : "");
      w.textContent = part;
      frag.appendChild(w);
    });
    statement.textContent = "";
    statement.appendChild(frag);
    words = $$(".ab-word", statement);
    if (reduceMotion) words.forEach((w) => w.classList.add("is-lit"));
  }

  const story = $("[data-story]");
  const steps = story ? $$(".ab-step", story) : [];
  const stage = story ? $(".ab-stage", story) : null;
  const stageImgs = stage ? $$(".ab-img", stage) : [];
  const tabs = stage ? $$(".ab-tabbtn", stage) : [];
  const railFill = story ? $(".ab-rail-fill", story) : null;
  const track = stage ? $(".ab-bignum-track", stage) : null;
  const desktopStory = window.matchMedia("(min-width: 1024px)");
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  let activeStep = -1;
  let litCount = -1;

  const setActive = (i) => {
    if (i === activeStep) return;
    activeStep = i;
    steps.forEach((s, k) => { s.classList.toggle("is-active", k === i); s.classList.toggle("is-past", k < i); });
    stageImgs.forEach((img, k) => img.classList.toggle("is-active", k === i));
    tabs.forEach((t, k) => {
      t.classList.toggle("is-active", k === i);
      if (k === i) t.setAttribute("aria-current", "step"); else t.removeAttribute("aria-current");
    });
    track?.style.setProperty("--i", i);
  };

  let aboutTick = false;
  const aboutUpdate = () => {
    aboutTick = false;
    const vh = window.innerHeight;
    if (words.length && !reduceMotion) {
      const r = statement.getBoundingClientRect();
      const start = vh * 0.92, end = vh * 0.66 - r.height;
      const p = clamp01((start - r.top) / (start - end));
      const n = Math.round(p * words.length);
      if (n !== litCount) { litCount = n; words.forEach((w, k) => w.classList.toggle("is-lit", k < n)); }
    }
    if (!steps.length || !desktopStory.matches) return;
    const mid = vh * 0.5;
    let idx = 0;
    steps.forEach((s, k) => {
      const r = s.getBoundingClientRect();
      if (r.top + r.height * 0.5 <= mid + vh * 0.12) idx = k;
      const local = clamp01((mid - r.top) / r.height);
      tabs[k]?.style.setProperty("--p", local.toFixed(3));
    });
    setActive(idx);
    if (railFill) {
      const first = steps[0].getBoundingClientRect(), last = steps[steps.length - 1].getBoundingClientRect();
      const a = first.top + first.height / 2, b = last.top + last.height / 2;
      railFill.style.setProperty("--p", clamp01((mid - a) / (b - a || 1)).toFixed(3));
    }
  };
  const aboutQueue = () => { if (!aboutTick) { aboutTick = true; requestAnimationFrame(aboutUpdate); } };
  if (statement || steps.length) {
    setActive(0);
    window.addEventListener("scroll", aboutQueue, { passive: true });
    window.addEventListener("resize", aboutQueue);
    aboutUpdate();
  }
  tabs.forEach((t) => t.addEventListener("click", (e) => {
    const step = steps[Number(t.dataset.goto)];
    if (!step) return;
    e.preventDefault();
    const r = step.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + r.top + r.height / 2 - window.innerHeight / 2, behavior: reduceMotion ? "auto" : "smooth" });
    step.setAttribute("tabindex", "-1");
    step.focus({ preventScroll: true });
  }));

  /* ---------- Scroll spy ---------- */
  const sections = $$("main section[id]").filter((s) => $$(`.nav-link[href="#${s.id}"]`).length);
  const links = $$(".nav-link");
  let spyTick = false;
  const spy = () => {
    spyTick = false;
    const y = window.scrollY + 140;
    let current = sections[0]?.id;
    sections.forEach((sec) => { if (sec.offsetTop <= y) current = sec.id; });
    links.forEach((a) => {
      const on = a.getAttribute("href") === "#" + current;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  };
  window.addEventListener("scroll", () => { if (!spyTick) { spyTick = true; requestAnimationFrame(spy); } }, { passive: true });
  spy();

  /* ---------- Filters ---------- */
  const bindFilter = (bar, cardsSel, attr, dataKey) => {
    if (!bar) return;
    const chips = $$(".chip", bar);
    chips.forEach((chip) => chip.addEventListener("click", () => {
      chips.forEach((c) => { c.classList.toggle("is-on", c === chip); c.setAttribute("aria-pressed", String(c === chip)); });
      const f = chip.dataset[dataKey];
      let i = 0;
      $$(cardsSel).forEach((card) => {
        const show = f === "all" || card.dataset[attr] === f;
        card.style.display = show ? "" : "none";
        if (!show) return;
        card.classList.add("is-in");
        if (reduceMotion) return;
        card.style.setProperty("--card-idx", i++);
        card.classList.remove("card-cascade");
        void card.offsetWidth;
        card.classList.add("card-cascade");
      });
    }));
  };
  bindFilter($("#project-filters"), "#project-grid .project-card", "cat", "filter");
  bindFilter($("#gallery-filters"), "#gallery-grid .media-card", "gtype", "gfilter");

  /* ---------- Forms & toast ---------- */
  const toast = $("#toast");
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  };
  $("#contact-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.reset();
    showToast("شكراً لتواصلك، تم استلام رسالتك بنجاح.");
  });
  $("#news-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.reset();
    showToast("تم تأكيد اشتراكك في النشرة البريدية.");
  });
})();
