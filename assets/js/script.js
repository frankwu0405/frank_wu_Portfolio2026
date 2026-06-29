/* =====================================================================
   FRANK WU — PORTFOLIO INTERACTIONS  ·  BLACKOUT / VERMILION
   Motion engine: Lenis smooth scroll + GSAP, intro curtain, hero line
   reveal, contextual cursor. Base features work without any library;
   everything degrades gracefully and respects prefers-reduced-motion.
   ===================================================================== */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var lenis = null;

  /* ---------- THEME (pre-applied by inline head script too) ---------- */
  var THEME_KEY = "fw-theme";
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
  }
  (function initTheme() {
    var stored;
    try { stored = localStorage.getItem(THEME_KEY); } catch (e) {}
    var sys = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    applyTheme(stored || sys);
  })();

  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }
  function isHome() {
    var p = (location.pathname.split("/").pop() || "index.html");
    return p === "" || p === "index.html";
  }

  /* =================================================================
     BASE FEATURES  (no libraries required)
     ================================================================= */
  onReady(function () {
    /* THEME TOGGLE */
    var toggle = document.querySelector(".theme-toggle");
    if (toggle) toggle.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      applyTheme(cur === "dark" ? "light" : "dark");
    });

    /* NAV stuck + active */
    var nav = document.querySelector(".nav");
    if (nav) {
      var onScroll = function () { nav.classList.toggle("is-stuck", window.scrollY > 8); };
      onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    }
    (function () {
      var path = location.pathname.split("/").pop() || "index.html";
      document.querySelectorAll(".nav__link").forEach(function (a) {
        var href = a.getAttribute("href");
        a.classList.remove("is-active");
        if (href === path) a.classList.add("is-active");
        if ((path.indexOf("project") === 0 || path.indexOf("nitori") === 0) && href === "projects.html") a.classList.add("is-active");
      });
    })();

    /* MOBILE MENU */
    var burger = document.querySelector(".nav__burger");
    var navLinks = document.querySelector(".nav__links");
    if (burger && navLinks) {
      var closeMenu = function () {
        navLinks.classList.remove("is-open"); burger.classList.remove("is-open");
        document.body.classList.remove("menu-open"); if (lenis) lenis.start();
      };
      burger.addEventListener("click", function () {
        var open = navLinks.classList.toggle("is-open");
        burger.classList.toggle("is-open", open);
        document.body.classList.toggle("menu-open", open);
        if (lenis) { open ? lenis.stop() : lenis.start(); }
      });
      navLinks.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
      document.addEventListener("click", function (e) {
        if (navLinks.classList.contains("is-open") && !navLinks.contains(e.target) && !burger.contains(e.target)) closeMenu();
      });
    }

    /* REVEAL ON SCROLL (IntersectionObserver — independent of libs).
       Hero titles are handled by the motion engine, so unhook them here. */
    if (!reduceMotion && !document.documentElement.classList.contains("no-anim")) {
      document.querySelectorAll(".hero__title[data-reveal], .cs-hero__title[data-reveal], .cs2-title[data-reveal]").forEach(function (el) {
        el.removeAttribute("data-reveal");
      });
    }
    var revealEls = document.querySelectorAll("[data-reveal], .fade-in");
    if (revealEls.length) {
      if (reduceMotion || !("IntersectionObserver" in window)) {
        revealEls.forEach(function (el) { el.classList.add("is-revealed", "visible"); });
      } else {
        var io = new IntersectionObserver(function (entries, obs) {
          entries.forEach(function (en) {
            if (en.isIntersecting) { en.target.classList.add("is-revealed", "visible"); obs.unobserve(en.target); }
          });
        }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
        revealEls.forEach(function (el) { io.observe(el); });
      }
    }

    /* HERO WORD ROTATOR */
    var rotator = document.querySelector("[data-rotate]");
    if (rotator && !reduceMotion) {
      var words = [];
      try { words = JSON.parse(rotator.getAttribute("data-rotate")); } catch (e) {}
      if (words.length > 1) {
        var i = 0; rotator.textContent = words[0];
        setInterval(function () {
          i = (i + 1) % words.length;
          rotator.style.transition = "opacity .25s ease, transform .25s ease";
          rotator.style.opacity = "0"; rotator.style.transform = "translateY(0.12em)";
          setTimeout(function () { rotator.textContent = words[i]; rotator.style.opacity = "1"; rotator.style.transform = "none"; }, 250);
        }, 2600);
      }
    }

    /* MARQUEE duplicate for seamless loop */
    document.querySelectorAll(".marquee__track").forEach(function (t) { t.innerHTML += t.innerHTML; });

    /* MAGNETIC BUTTONS */
    if (finePointer && !reduceMotion) {
      document.querySelectorAll("[data-magnetic]").forEach(function (el) {
        el.addEventListener("mousemove", function (e) {
          var r = el.getBoundingClientRect();
          el.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * 0.3 + "px," + (e.clientY - r.top - r.height / 2) * 0.3 + "px)";
        });
        el.addEventListener("mouseleave", function () { el.style.transform = ""; });
      });
    }

    /* CONTEXTUAL CURSOR */
    if (finePointer && !reduceMotion && !document.body.classList.contains("no-cursor")) {
      var dot = document.createElement("div"); dot.className = "cursor-dot";
      var ring = document.createElement("div"); ring.className = "cursor-ring";
      var label = document.createElement("span"); label.className = "cursor-ring__label";
      ring.appendChild(label);
      document.body.append(dot, ring); document.body.classList.add("has-cursor");
      var rx = 0, ry = 0, mx = 0, my = 0, craf = null;
      function ringTick() {
        rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
        ring.style.left = rx + "px"; ring.style.top = ry + "px";
        if (Math.abs(mx - rx) > 0.1 || Math.abs(my - ry) > 0.1) craf = requestAnimationFrame(ringTick); else craf = null;
      }
      window.addEventListener("mousemove", function (e) {
        mx = e.clientX; my = e.clientY; dot.style.left = mx + "px"; dot.style.top = my + "px";
        if (!craf) craf = requestAnimationFrame(ringTick);
      });
      document.querySelectorAll("a, button, [data-magnetic], input, textarea").forEach(function (el) {
        el.addEventListener("mouseenter", function () { ring.classList.add("is-hover"); });
        el.addEventListener("mouseleave", function () { ring.classList.remove("is-hover"); });
      });
      document.querySelectorAll(".work__item, .feature").forEach(function (el) {
        el.addEventListener("mouseenter", function () { label.textContent = "View"; ring.classList.add("is-label"); });
        el.addEventListener("mouseleave", function () { ring.classList.remove("is-label"); });
      });
    }

    /* WORK LIST floating image preview */
    if (finePointer && !reduceMotion) {
      var preview = document.querySelector(".work__preview");
      if (preview) {
        var pimg = preview.querySelector("img");
        document.querySelectorAll(".work__item[data-preview]").forEach(function (item) {
          item.addEventListener("mouseenter", function () { pimg.src = item.getAttribute("data-preview"); preview.classList.add("is-visible"); });
          item.addEventListener("mousemove", function (e) { preview.style.left = e.clientX + "px"; preview.style.top = e.clientY + "px"; });
          item.addEventListener("mouseleave", function () { preview.classList.remove("is-visible"); });
        });
      }
    }

    /* CASE-STUDY sticky sidenav scroll-spy */
    var sideLinks = document.querySelectorAll(".cs-sidenav a");
    if (sideLinks.length && "IntersectionObserver" in window) {
      var map = {};
      sideLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { sideLinks.forEach(function (a) { a.classList.remove("is-active"); }); if (map[en.target.id]) map[en.target.id].classList.add("is-active"); }
        });
      }, { rootMargin: "-30% 0px -60% 0px" });
      document.querySelectorAll(".cs-section[id]").forEach(function (s) { spy.observe(s); });
    }

    /* CASE-STUDY back link reveal on scroll-up */
    var back = document.querySelector(".cs-back");
    if (back) {
      var lastY = window.scrollY;
      window.addEventListener("scroll", function () {
        var y = window.scrollY;
        if (y < 200) back.classList.remove("is-visible");
        else if (y < lastY - 6) back.classList.add("is-visible");
        else if (y > lastY + 6) back.classList.remove("is-visible");
        lastY = y;
      }, { passive: true });
    }

    /* SMOOTH ANCHOR LINKS (use Lenis when present) */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -90 });
        else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      });
    });

    /* TABS */
    document.querySelectorAll(".tab-button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-tab");
        var c = btn.closest(".tab-container") || document;
        c.querySelectorAll(".tab-button").forEach(function (b) { b.classList.remove("active"); });
        c.querySelectorAll(".tab-content").forEach(function (x) { x.classList.remove("active"); });
        btn.classList.add("active");
        var content = document.getElementById(target + "-content");
        if (content) content.classList.add("active");
      });
    });

    /* KEY-POINT CAROUSEL */
    document.querySelectorAll(".key-point-carousel-container").forEach(function (container) {
      var cards = container.querySelectorAll(".key-point-card");
      var prevBtn = container.querySelector("#prev-btn, .kp-prev");
      var nextBtn = container.querySelector("#next-btn, .kp-next");
      var dots = container.querySelector("#dots-container, .dots-container");
      if (!cards.length || !dots) return;
      var idx = 0, timer = null;
      function show(i) { cards.forEach(function (c) { c.classList.remove("active"); }); cards[i].classList.add("active"); dots.querySelectorAll(".key-point-dot").forEach(function (d, di) { d.classList.toggle("active", di === i); }); }
      function start() { if (reduceMotion) return; stop(); timer = setInterval(function () { idx = (idx + 1) % cards.length; show(idx); }, 4200); }
      function stop() { clearInterval(timer); }
      cards.forEach(function (_, i) { var d = document.createElement("div"); d.className = "key-point-dot"; d.addEventListener("click", function () { stop(); idx = i; show(idx); start(); }); dots.appendChild(d); });
      if (prevBtn) prevBtn.addEventListener("click", function () { stop(); idx = (idx - 1 + cards.length) % cards.length; show(idx); start(); });
      if (nextBtn) nextBtn.addEventListener("click", function () { stop(); idx = (idx + 1) % cards.length; show(idx); start(); });
      container.addEventListener("mouseenter", stop); container.addEventListener("mouseleave", start);
      show(0); start();
    });

    /* deep-dive accordions: recalc widget widths when opened */
    document.querySelectorAll("details.dd").forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (d.open) { window.dispatchEvent(new Event("resize")); if (window.ScrollTrigger) window.ScrollTrigger.refresh(); }
      });
    });

    initPageTransitions();
    initChat();
    initPreloader();
    initPortal();
  });

  /* ---------- LANDING PORTAL HERO (scroll + cursor driven) ---------- */
  function initPortal() {
    var stage = document.querySelector(".pt-stage");
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; /* CSS shows a static state */
    var root = document.documentElement;
    var desktop = window.matchMedia("(min-width: 721px)").matches;
    var mx = 0, my = 0, tmx = 0, tmy = 0, raf = null;
    function frame() {
      var max = stage.offsetHeight - window.innerHeight;
      var sp = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      mx += (tmx - mx) * 0.08; my += (tmy - my) * 0.08;
      root.style.setProperty("--pt-p", sp.toFixed(4));
      root.style.setProperty("--pt-mx", mx.toFixed(4));
      root.style.setProperty("--pt-my", my.toFixed(4));
      raf = null;
      if (Math.abs(tmx - mx) > 0.001 || Math.abs(tmy - my) > 0.001) wake();
    }
    function wake() { if (!raf) raf = requestAnimationFrame(frame); }
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    if (desktop) window.addEventListener("mousemove", function (e) {
      tmx = e.clientX / window.innerWidth - 0.5;
      tmy = e.clientY / window.innerHeight - 0.5;
      wake();
    });
    frame();
  }

  /* ---------- FIRST-LOAD SCREEN (once per session) ---------- */
  function initPreloader() {
    var root = document.documentElement;
    if (!root.classList.contains("is-loading")) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var start = Date.now(), MIN = 1150;
    function finish() {
      var wait = Math.max(0, MIN - (Date.now() - start));
      setTimeout(function () {
        if (reduce) { root.classList.remove("is-loading"); return; }
        root.classList.add("nav-enter");      /* hand off to the signature logo-aperture reveal */
        root.classList.remove("is-loading");  /* drop the loader; the veil takes over seamlessly */
      }, wait);
    }
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish);
  }

  /* ---------- INLINE AI BAR (expands in place; glass reply bubbles) ---------- */
  function initChat() {
    var wrap = document.querySelector(".navsearch");
    if (!wrap) return;
    var form = wrap.querySelector(".navsearch__field");
    var input = wrap.querySelector(".navsearch__input");
    var convo = wrap.querySelector(".navsearch__convo");
    if (!form || !input || !convo) return;

    function activate() { wrap.classList.add("is-active"); }
    function collapse() { wrap.classList.remove("is-active"); }
    function addMsg(text, who) {
      var b = document.createElement("div");
      b.className = "aimsg aimsg--" + who;
      b.textContent = text;
      convo.appendChild(b);
      convo.classList.add("has-msgs");
      convo.scrollTop = convo.scrollHeight;
      return b;
    }
    function botReply() {
      var t = document.createElement("div");
      t.className = "aimsg aimsg--bot aithinking";
      t.innerHTML = "<span></span><span></span><span></span>";
      convo.appendChild(t); convo.classList.add("has-msgs"); convo.scrollTop = convo.scrollHeight;
      setTimeout(function () {
        if (t.parentNode) t.remove();
        addMsg("This is a placeholder reply — the assistant isn’t connected to a model yet. Once it is, I’ll answer using Frank’s real work, case studies, and background.", "bot");
      }, 950);
    }

    input.addEventListener("focus", activate);
    form.addEventListener("click", function () { activate(); input.focus(); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = input.value.trim(); if (!v) return;
      addMsg(v, "user"); input.value = ""; botReply(); input.focus();
    });
    document.addEventListener("click", function (e) { if (!wrap.contains(e.target)) collapse(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { collapse(); input.blur(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); activate(); input.focus(); }
    });
  }

  /* =================================================================
     MOTION ENGINE  (Lenis + GSAP, loaded from CDN)
     ================================================================= */
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = src; s.async = true;
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }

  if (!reduceMotion) {
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js")
      .then(function () {
        return Promise.all([
          loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js").catch(function () {}),
          loadScript("https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js").catch(function () {})
        ]);
      })
      .then(function () { onReady(initMotion); })
      .catch(function () { /* libs blocked — base features already cover everything */ });
  }

  function initMotion() {
    if (!window.gsap) return;
    var gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    /* Lenis smooth scroll, synced to GSAP ticker */
    if (window.Lenis) {
      try {
        lenis = new Lenis({ duration: 1.1, smoothWheel: true, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
        lenis.on("scroll", function () { if (window.ScrollTrigger) window.ScrollTrigger.update(); });
        gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
      } catch (e) { lenis = null; }
    }

    var entered = document.documentElement.classList.contains("nav-enter");
    initScenes(gsap);
    if (isHome() && !sessionStorageGet("fw-intro") && !entered) introCurtain(heroReveal);
    else heroReveal();
  }

  /* ---------- SPATIAL 3D: flip-up panels, cover recline ---------- */
  function initThreeD(gsap) {
    if (!window.ScrollTrigger) return;
    document.querySelectorAll(".cs-section__head").forEach(function (h) {
      gsap.from(h, { y: 38, autoAlpha: 0, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: h, start: "top 86%" } });
    });
    var sel = "[data-flip], .cs-section .figure, .cs-section .callout-grid, .cs-section .persona__cols, .cs-section .metric-row, .cs-section .steps, .cs-section .carousel-container, .cs-section .key-point-carousel-container, .cs-section .tab-container, .cs-section table, .cs-section .callout--quote";
    document.querySelectorAll(sel).forEach(function (el) {
      gsap.from(el, { rotationX: 68, y: 48, autoAlpha: 0, transformPerspective: 900, transformOrigin: "top center", duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 84%", toggleActions: "play none none none" } });
    });
    var cover = document.querySelector(".cs-cover");
    if (cover) {
      gsap.to(cover, { rotationX: -15, scale: 0.93, yPercent: 6, transformPerspective: 1200, transformOrigin: "50% 0%", ease: "none",
        scrollTrigger: { trigger: cover, start: "top 14%", end: "+=440", scrub: true } });
    }
  }

  /* ---------- 3D HERO ID-CARD (landing) ---------- */
  function initHero3D(gsap) {
    var hero = document.querySelector(".hero3d");
    var card = document.querySelector(".hero-card");
    var name = document.querySelector(".hero3d .hero__title");
    if (!hero || !card) return;
    if (gsap) gsap.from(card, { rotationY: -42, rotationX: 24, z: -240, autoAlpha: 0, transformPerspective: 1000, transformOrigin: "center", duration: 1.1, ease: "power3.out", delay: 0.25 });
    if (!finePointer || reduceMotion) return;
    setTimeout(function () {
      var raf2 = null, tX = 0, tY = 0, cX = 0, cY = 0;
      function tick() {
        cX += (tX - cX) * 0.12; cY += (tY - cY) * 0.12;
        card.style.transform = "perspective(1000px) rotateY(" + (cX * 20) + "deg) rotateX(" + (-cY * 18) + "deg)";
        if (name) name.style.transform = "translate3d(" + (cX * -22) + "px," + (cY * -12) + "px,0)";
        if (Math.abs(tX - cX) > 0.0008 || Math.abs(tY - cY) > 0.0008) raf2 = requestAnimationFrame(tick); else raf2 = null;
      }
      hero.addEventListener("mousemove", function (e) {
        var r = hero.getBoundingClientRect();
        tX = (e.clientX - r.left) / r.width - 0.5;
        tY = (e.clientY - r.top) / r.height - 0.5;
        if (!raf2) raf2 = requestAnimationFrame(tick);
      });
      hero.addEventListener("mouseleave", function () { tX = 0; tY = 0; if (!raf2) raf2 = requestAnimationFrame(tick); });
    }, 1300);
  }

  function sessionStorageGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sessionStorageSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function sessionStorageRemove(k) { try { sessionStorage.removeItem(k); } catch (e) {} }

  /* ---------- SCENES: parallax, count-up, pinned horizontal ---------- */
  function initScenes(gsap) {
    if (!window.ScrollTrigger) return;
    var ST = window.ScrollTrigger;
    var desktop = window.matchMedia("(min-width: 901px)").matches;

    /* parallax media (desktop only — scroll-linked transforms are costly on mobile) */
    if (desktop) {
      document.querySelectorAll("[data-parallax]").forEach(function (el) {
        var inner = el.querySelector("img, video, .media-ph") || el;
        gsap.fromTo(inner, { yPercent: -9 }, { yPercent: 9, ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      });
    }

    /* count-ups */
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count")) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
      var obj = { v: 0 };
      ST.create({ trigger: el, start: "top 88%", once: true, onEnter: function () {
        gsap.to(obj, { v: target, duration: 1.5, ease: "power2.out", onUpdate: function () { el.textContent = obj.v.toFixed(dec) + suffix; } });
      } });
    });

    /* pinned horizontal scroll — on all widths, so mobile is forced through it too */
    document.querySelectorAll("[data-horizontal]").forEach(function (sec) {
      var track = sec.querySelector(".h-track");
      if (!track) return;
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      gsap.to(track, { x: function () { return -dist(); }, ease: "none",
        scrollTrigger: { trigger: sec, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
    });

    window.addEventListener("load", function () { ST.refresh(); });
    setTimeout(function () { ST.refresh(); }, 600);
  }

  /* ---------- 3D TILT ---------- */
  function initTilt() {
    if (!finePointer || reduceMotion) return;
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      var max = parseFloat(el.getAttribute("data-tilt-max")) || 7;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(1000px) rotateX(" + (-py * max) + "deg) rotateY(" + (px * max) + "deg)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"; });
    });
  }

  /* ---------- PAGE TRANSITIONS (CSS-driven wipe, exit only) ----------
     Entry cover is handled by the inline <head> script (html.nav-enter)
     so it paints before content — no JS/library timing gap. This only
     triggers the exit cover on internal link clicks. */
  function initPageTransitions() {
    var navving = false;
    var root = document.documentElement;

    /* clear the wipe if the page is restored from back/forward cache */
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) { root.classList.remove("nav-leave", "nav-enter"); navving = false; if (lenis) lenis.start(); }
    });

    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest("a") : null;
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href || a.target === "_blank" || a.hasAttribute("download")) return;
      if (href[0] === "#" || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
      if (/^https?:\/\//.test(href)) return;        /* external — open normally */
      if (href.indexOf(".html") === -1) return;
      var dest = (a.pathname ? a.pathname.split("/").pop() : href.split("/").pop().split("#")[0]) || "index.html";
      var here = (location.pathname.split("/").pop()) || "index.html";
      if (dest === here) return;                      /* same page — let it behave */
      e.preventDefault();
      if (navving) return;
      navving = true;
      sessionStorageSet("fw-nav", "1");                /* read by next page's head script */
      if (lenis) lenis.stop();
      var go = function () { window.location.href = href; };
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { go(); return; }
      root.classList.remove("nav-enter");              /* avoid enter/leave clash */
      root.classList.add("nav-leave");                 /* CSS fast swipe-in cover */
      setTimeout(go, 220);                             /* navigate once fully covered */
    });
  }

  /* Split an element's content into masked lines (preserves child nodes) */
  function splitLines(el) {
    var nodes = Array.prototype.slice.call(el.childNodes);
    var groups = [[]];
    nodes.forEach(function (n) { if (n.nodeName === "BR") groups.push([]); else groups[groups.length - 1].push(n); });
    el.innerHTML = "";
    var inners = [];
    groups.forEach(function (g) {
      if (!g.length) return;
      var line = document.createElement("span"); line.className = "reveal-line";
      var inner = document.createElement("span");
      g.forEach(function (n) { inner.appendChild(n); });
      line.appendChild(inner); el.appendChild(line); inners.push(inner);
    });
    return inners;
  }

  function heroReveal() {
    var gsap = window.gsap; if (!gsap) return;
    var titles = document.querySelectorAll(".hero__title, .cs-hero__title, .cs2-title");
    titles.forEach(function (t, ti) {
      var inners = splitLines(t);
      if (!inners.length) return;
      gsap.set(t, { autoAlpha: 1 });
      gsap.from(inners, { yPercent: 116, duration: 0.95, ease: "power3.out", stagger: 0.09, delay: 0.05 + ti * 0.05 });
    });
  }

  function introCurtain(done) {
    var gsap = window.gsap;
    if (!gsap) { if (done) done(); return; }
    sessionStorageSet("fw-intro", "1");
    var curtain = document.createElement("div");
    curtain.className = "intro-curtain";
    curtain.innerHTML = '<span class="intro-curtain__word"><span class="w1">Frank Wu</span><span class="dot">.</span></span>';
    document.body.appendChild(curtain);
    document.body.classList.add("intro-active");
    if (lenis) lenis.stop();
    var word = curtain.querySelectorAll(".intro-curtain__word > span");
    var tl = gsap.timeline({
      onComplete: function () {
        curtain.remove();
        document.body.classList.remove("intro-active");
        if (lenis) lenis.start();
        if (done) done();
      }
    });
    tl.from(word, { yPercent: 120, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.08 })
      .to(word, { yPercent: -120, opacity: 0, duration: 0.5, ease: "power2.in", stagger: 0.05 }, "+=0.35")
      .to(curtain, { yPercent: -100, duration: 0.7, ease: "power4.inOut" }, "-=0.2");
  }

  /* =================================================================
     CAROUSEL + LIGHTBOX  (on load for correct widths)
     ================================================================= */
  function Carousel(el) {
    this.el = el; this.inner = el.querySelector(".carousel-inner");
    this.slides = el.querySelectorAll(".carousel-slide");
    this.prev = el.querySelector(".prev-btn"); this.next = el.querySelector(".next-btn");
    this.i = 0; this.sx = 0; this.ex = 0; this.timer = null;
    this.update = this.update.bind(this); this.add(); this.update(); this.play();
    window.addEventListener("resize", this.update);
  }
  Carousel.prototype.update = function () { if (this.slides.length && this.slides[0].offsetWidth) this.inner.style.transform = "translateX(" + (-this.i * this.slides[0].offsetWidth) + "px)"; };
  Carousel.prototype.play = function () { this.stop(); if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; var self = this; this.timer = setInterval(function () { self.i = (self.i + 1) % self.slides.length; self.update(); }, 4500); };
  Carousel.prototype.stop = function () { clearInterval(this.timer); };
  Carousel.prototype.go = function (d) { this.i = (this.i + d + this.slides.length) % this.slides.length; this.update(); this.play(); };
  Carousel.prototype.add = function () {
    var self = this;
    if (this.next) this.next.addEventListener("click", function () { self.go(1); });
    if (this.prev) this.prev.addEventListener("click", function () { self.go(-1); });
    if (this.inner) {
      this.inner.addEventListener("touchstart", function (e) { self.sx = e.touches[0].clientX; }, { passive: true });
      this.inner.addEventListener("touchmove", function (e) { self.ex = e.touches[0].clientX; }, { passive: true });
      this.inner.addEventListener("touchend", function () { var d = self.sx - self.ex; if (Math.abs(d) > 50) self.go(d > 0 ? 1 : -1); });
      this.el.addEventListener("mouseenter", function () { self.stop(); });
      this.el.addEventListener("mouseleave", function () { self.play(); });
    }
  };

  window.addEventListener("load", function () {
    document.querySelectorAll(".carousel-container").forEach(function (el) { new Carousel(el); });

    var modal = document.getElementById("imageModal");
    if (!modal) return;
    var modalImg = document.getElementById("modalImage");
    var closeBtn = modal.querySelector(".close-btn");
    var zoomIn = document.getElementById("zoomInBtn");
    var zoomOut = document.getElementById("zoomOutBtn");
    var scale = 1, tx = 0, ty = 0, panning = false, lastX = 0, lastY = 0;
    function apply() { modalImg.style.transform = "scale(" + scale + ") translate(" + tx + "px," + ty + "px)"; modalImg.style.cursor = scale > 1 ? "grab" : "default"; }
    function open(src, alt) { modal.style.display = "block"; modalImg.src = src; modalImg.alt = alt || ""; scale = 1; tx = ty = 0; apply(); document.body.style.overflow = "hidden"; if (lenis) lenis.stop(); }
    function close() { modal.style.display = "none"; document.body.style.overflow = ""; if (lenis) lenis.start(); }
    document.querySelectorAll(".gallery-image, .figure img").forEach(function (img) { img.addEventListener("click", function () { open(img.src, img.alt); }); });
    if (closeBtn) closeBtn.addEventListener("click", close);
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    if (zoomIn) zoomIn.addEventListener("click", function () { scale = Math.min(scale + 0.25, 5); apply(); });
    if (zoomOut) zoomOut.addEventListener("click", function () { scale = Math.max(scale - 0.25, 1); if (scale === 1) { tx = ty = 0; } apply(); });
    modalImg.addEventListener("mousedown", function (e) { e.preventDefault(); if (scale <= 1) return; panning = true; lastX = e.clientX; lastY = e.clientY; modalImg.style.cursor = "grabbing"; });
    window.addEventListener("mousemove", function (e) { if (!panning) return; tx += (e.clientX - lastX) / scale; ty += (e.clientY - lastY) / scale; lastX = e.clientX; lastY = e.clientY; apply(); });
    window.addEventListener("mouseup", function () { panning = false; if (scale > 1) modalImg.style.cursor = "grab"; });
  });
})();
