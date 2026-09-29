/* =========================================================
   SITE_CONTENT — PLACEHOLDER: replace with real content.
   Everything below is SAMPLE text/numbers (shown on the page with a
   "محتوى تجريبي" badge). Edit these values to update:
     • stories        → "قصص من الميدان" carousel
     • governorates   → "خريطة الأثر" stats panel
   Ticker items and FAQ answers are edited directly in index.html.
   ========================================================= */
const SITE_CONTENT = {
  stories: [
    {
      name: "أم محمد",
      location: "نازحة من جباليا إلى دير البلح",
      tag: "السلال الغذائية",
      icon: "shopping_basket",
      image: "img/gallery-children.jpg",
      alt: "أطفال يبتسمون في أحد مراكز الإيواء",
      quote: "وصلتنا السلة في يوم لم يكن في الخيمة ما يكفي لعشاء الأطفال. شعرت أن أحداً ما زال يتذكرنا.",
    },
    {
      name: "أبو يوسف",
      location: "متطوع توزيع — خان يونس",
      tag: "فرق التطوع",
      icon: "diversity_3",
      image: "img/project-relief.jpg",
      alt: "متطوعون يجهزون طرود المساعدات",
      quote: "نبدأ قبل الفجر لتجهيز الطرود، وأجمل ما في يومنا أن نرى كل سلة تُسلَّم باليد وتوثَّق بالصورة.",
    },
    {
      name: "سارة، 11 عاماً",
      location: "مدرسة إيواء — مدينة غزة",
      tag: "التعليم المؤقت",
      icon: "menu_book",
      image: "img/project-orphan.jpg",
      alt: "كتب وأدوات مدرسية على طاولة",
      quote: "صار عندنا صف في المدرسة التي نسكنها. أحب حصة القراءة، وأحلم أن أصبح معلّمة.",
    },
    {
      name: "الممرضة ريم",
      location: "نقطة طبية — رفح",
      tag: "الرعاية الصحية",
      icon: "medical_services",
      image: "img/activity-medical.jpg",
      alt: "كادر طبي في نقطة رعاية صحية",
      quote: "الدواء الذي يصلنا يعني أن مريض السكري لن ينتظر أسبوعاً آخر. كل شحنة تصنع فرقاً حقيقياً.",
    },
  ],
  defaultGovernorate: "gaza",
  governorates: {
    north: { name: "شمال غزة", note: "سلال غذائية وصهاريج مياه لمراكز الإيواء في جباليا وبيت لاهيا وبيت حانون.", beneficiaries: 38000, meals: 52000, tents: 900, water: 14 },
    gaza:  { name: "غزة", note: "مطابخ ميدانية وتعليم مؤقت للأطفال في مدارس الإيواء بمدينة غزة.", beneficiaries: 42000, meals: 61000, tents: 1100, water: 18 },
    deir:  { name: "دير البلح", note: "استقبال العائلات النازحة وتوزيع الخيام والأغطية في مخيمات المحافظة الوسطى.", beneficiaries: 30000, meals: 44000, tents: 1400, water: 12 },
    khan:  { name: "خان يونس", note: "نقاط طبية متنقلة وتوزيع مياه الشرب في مناطق النزوح بخان يونس.", beneficiaries: 40000, meals: 57000, tents: 1700, water: 16 },
    rafah: { name: "رفح", note: "دعم الأسر النازحة بالخيام والسلال الغذائية في المناطق الجنوبية.", beneficiaries: 30000, meals: 39000, tents: 1300, water: 10 },
  },
};

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
        /* progress bars are scaleX(0) (zero-area), so their track is observed instead */
        const el = entry.target.__bar || entry.target;
        el.classList.add("is-in");
        if (el.matches("[data-count]")) animateCount(el);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    targets.forEach((el) => {
      if (el.classList.contains("bar-fill") && el.parentElement) { el.parentElement.__bar = el; io.observe(el.parentElement); }
      else io.observe(el);
    });
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

  /* ---------- Announcements ticker ---------- */
  const ticker = $("#announcements");
  if (ticker) {
    const track = $(".ticker-track", ticker);
    const list = $(".ticker-list", ticker);
    const clone = list.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    $$("a", clone).forEach((a) => a.setAttribute("tabindex", "-1"));
    track.appendChild(clone);
    const setSpeed = () => track.style.setProperty("--ticker-dur", Math.max(20, list.scrollWidth / 55) + "s");
    setSpeed();
    window.addEventListener("resize", setSpeed);
    const tBtn = $(".ticker-toggle", ticker);
    tBtn?.addEventListener("click", () => {
      const paused = ticker.classList.toggle("is-paused");
      tBtn.setAttribute("aria-pressed", String(paused));
      tBtn.setAttribute("aria-label", paused ? "تشغيل حركة الشريط" : "إيقاف حركة الشريط");
      tBtn.querySelector(".material-symbols-outlined").textContent = paused ? "play_arrow" : "pause";
    });
  }

  /* ---------- Stories carousel ---------- */
  const storiesTrack = $("#stories-track");
  if (storiesTrack && SITE_CONTENT.stories.length) {
    const data = SITE_CONTENT.stories;
    const carousel = storiesTrack.closest(".stories-carousel");
    const dotsWrap = $(".stories-dots", carousel);
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const pad = (n) => String(n).padStart(2, "0");
    storiesTrack.innerHTML = data.map((s, i) => `
      <article class="story" role="group" aria-roledescription="قصة" aria-label="${i + 1} من ${data.length}: ${esc(s.name)}">
        <div class="story-body">
          <span class="story-qmark" aria-hidden="true"><span class="material-symbols-outlined">format_quote</span></span>
          <blockquote class="story-quote"><p>${esc(s.quote)}</p></blockquote>
          <div class="story-person">
            <img class="story-avatar" src="${esc(s.image)}" alt="" loading="lazy">
            <div><p class="story-name">${esc(s.name)}</p><p class="story-loc"><span class="material-symbols-outlined" aria-hidden="true">location_on</span>${esc(s.location)}</p></div>
          </div>
        </div>
        <figure class="story-media">
          <img src="${esc(s.image)}" alt="${esc(s.alt || "")}" loading="lazy">
          <figcaption class="story-tag"><span class="material-symbols-outlined" aria-hidden="true">${esc(s.icon || "favorite")}</span>${esc(s.tag)}</figcaption>
        </figure>
      </article>`).join("");
    dotsWrap.innerHTML = data.map((s, i) => `<button type="button" class="story-dot" aria-label="القصة ${i + 1}: ${esc(s.name)}"></button>`).join("");
    const slides = $$(".story", storiesTrack);
    const dots = $$(".story-dot", dotsWrap);
    const countI = $("[data-story-i]", carousel);
    $("[data-story-n]", carousel).textContent = pad(data.length);
    const playBtn = $(".stories-play", carousel);
    let cur = -1, timer = null, userPaused = reduceMotion, hovering = false, inView = false;
    const show = (i, announce) => {
      i = (i + slides.length) % slides.length;
      if (i === cur) return;
      slides.forEach((sl, k) => {
        const on = k === i;
        sl.classList.toggle("is-leaving", k === cur && !on);
        sl.classList.toggle("is-active", on);
        sl.setAttribute("aria-hidden", String(!on));
        sl.inert = !on;
      });
      dots.forEach((d, k) => d.setAttribute("aria-current", String(k === i)));
      countI.textContent = pad(i + 1);
      storiesTrack.setAttribute("aria-live", announce ? "polite" : "off");
      cur = i;
    };
    const stop = () => { clearInterval(timer); timer = null; };
    const sync = () => {
      stop();
      if (!userPaused && !hovering && inView) timer = setInterval(() => show(cur + 1, false), 7000);
    };
    const go = (i) => { show(i, true); sync(); };
    $$(".snav-btn").forEach((b) => b.addEventListener("click", () => go(cur + (b.dataset.dir === "next" ? 1 : -1))));
    dots.forEach((d, k) => d.addEventListener("click", () => go(k)));
    carousel.addEventListener("keydown", (e) => {
      const map = { ArrowLeft: 1, ArrowRight: -1 };
      if (e.key in map) { e.preventDefault(); go(cur + map[e.key]); }
      else if (e.key === "Home") { e.preventDefault(); go(0); }
      else if (e.key === "End") { e.preventDefault(); go(slides.length - 1); }
    });
    const setPlayUI = () => {
      playBtn.setAttribute("aria-pressed", String(userPaused));
      playBtn.setAttribute("aria-label", userPaused ? "تشغيل التبديل التلقائي" : "إيقاف التشغيل التلقائي");
      playBtn.querySelector(".material-symbols-outlined").textContent = userPaused ? "play_arrow" : "pause";
    };
    playBtn.addEventListener("click", () => { userPaused = !userPaused; setPlayUI(); sync(); });
    const section = carousel.closest("section");
    section.addEventListener("mouseenter", () => { hovering = true; sync(); });
    section.addEventListener("mouseleave", () => { hovering = false; sync(); });
    section.addEventListener("focusin", () => { hovering = true; sync(); });
    section.addEventListener("focusout", (e) => { if (!section.contains(e.relatedTarget)) { hovering = false; sync(); } });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([en]) => { inView = en.isIntersecting; sync(); }, { threshold: 0.3 }).observe(carousel);
    }
    show(0, false);
    setPlayUI();
  }

  /* ---------- Impact map ---------- */
  const mapSec = $("#impact-map");
  if (mapSec) {
    const govs = SITE_CONTENT.governorates;
    const paths = $$(".gov", mapSec);
    const btns = $$(".gov-btn", mapSec);
    const labels = $$("[data-gov-label]", mapSec);
    const mdots = $$("[data-gov-dot]", mapSec);
    const o = (k) => $(`[data-map-out="${k}"]`, mapSec);
    let selected = govs[SITE_CONTENT.defaultGovernorate] ? SITE_CONTENT.defaultGovernorate : Object.keys(govs)[0];
    let shown = null;
    const countTo = (el, end) => {
      const fmtN = (v) => Math.round(v).toLocaleString("en-US");
      if (reduceMotion) { el.textContent = fmtN(end); return; }
      const start = parseFloat(el.textContent.replace(/,/g, "")) || 0;
      const t0 = performance.now();
      cancelAnimationFrame(el._raf);
      const step = (now) => {
        const t = Math.min(1, (now - t0) / 700), e = 1 - Math.pow(1 - t, 3);
        el.textContent = fmtN(start + (end - start) * e);
        if (t < 1) el._raf = requestAnimationFrame(step);
      };
      el._raf = requestAnimationFrame(step);
    };
    const render = (id) => {
      const g = govs[id];
      if (!g || id === shown) return;
      shown = id;
      o("name").textContent = g.name;
      o("note").textContent = g.note;
      ["beneficiaries", "meals", "tents", "water"].forEach((k) => countTo(o(k), g[k]));
      paths.forEach((p) => p.classList.toggle("is-active", p.dataset.gov === id));
      labels.forEach((l) => l.classList.toggle("is-active", l.dataset.govLabel === id));
      mdots.forEach((d) => d.classList.toggle("is-active", d.dataset.govDot === id));
    };
    const select = (id) => {
      selected = id;
      paths.forEach((p) => p.setAttribute("aria-pressed", String(p.dataset.gov === id)));
      btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.gov === id)));
      render(id);
    };
    const preview = (id) => {
      paths.forEach((p) => p.classList.toggle("is-hover", p.dataset.gov === id));
      btns.forEach((b) => b.classList.toggle("is-hover", b.dataset.gov === id));
      render(id || selected);
    };
    [...paths, ...btns].forEach((el) => {
      const id = el.dataset.gov;
      el.addEventListener("mouseenter", () => preview(id));
      el.addEventListener("mouseleave", () => preview(null));
      el.addEventListener("click", () => select(id));
      el.addEventListener("focus", () => select(id));
    });
    paths.forEach((p) => p.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(p.dataset.gov); }
    }));
    select(selected);
  }

  /* ---------- FAQ accordion ---------- */
  const faq = $("[data-faq]");
  if (faq) {
    const qBtns = $$(".faq-q button", faq);
    qBtns.forEach((b, i) => {
      b.addEventListener("click", () => {
        const item = b.closest(".faq-item");
        const open = !item.classList.contains("is-open");
        item.classList.toggle("is-open", open);
        b.setAttribute("aria-expanded", String(open));
      });
      b.addEventListener("keydown", (e) => {
        const k = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: qBtns.length - 1 }[e.key];
        if (k === undefined) return;
        e.preventDefault();
        qBtns[(k + qBtns.length) % qBtns.length].focus();
      });
    });
  }

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
  // Inner pages have no in-page nav sections: keep their server-rendered current-page highlight.
  if (sections.length) {
    window.addEventListener("scroll", () => { if (!spyTick) { spyTick = true; requestAnimationFrame(spy); } }, { passive: true });
    spy();
  }

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


/* ---------- "Show more" for long sections (one-page layout) ---------- */
(() => {
  document.querySelectorAll("[data-more]").forEach((box) => {
    const n = parseInt(box.dataset.more, 10) || 3;
    const items = Array.from(box.children);
    if (items.length <= n) { const b0 = document.querySelector(`[data-more-btn="#${box.id}"]`); if (b0) b0.hidden = true; return; }
    let open = false;
    const apply = () => items.forEach((el, i) => el.classList.toggle("more-hidden", !open && i >= n));
    let btn = box.id ? document.querySelector(`[data-more-btn="#${box.id}"]`) : null;
    let label;
    if (!btn) {
      const wrap = document.createElement("div");
      wrap.className = "more-wrap";
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-outline more-btn h-12 px-6 text-[15px]";
      btn.innerHTML = '<span data-more-label>مشاهدة المزيد</span><span class="material-symbols-outlined more-ico" aria-hidden="true">expand_more</span>';
      wrap.appendChild(btn);
      box.insertAdjacentElement("afterend", wrap);
    }
    label = btn.querySelector("[data-more-label]");
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", () => {
      open = !open;
      apply();
      btn.setAttribute("aria-expanded", String(open));
      btn.classList.toggle("is-open", open);
      if (label) label.textContent = open ? "عرض أقل" : "مشاهدة المزيد";
      if (open) items.forEach((el) => el.classList.add("is-in"));
      else box.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    apply();
  });
})();
