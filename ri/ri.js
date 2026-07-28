/* RI enhancement slice 3+ — Lucas Professional Experience
 * Architectural Living Tech — Reference Implementation only.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "lucas-pe-lang";
  var LINKEDIN = "https://www.linkedin.com/in/lucas-neukirchen-b7987218b/";
  var reduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.setAttribute(
    "data-ri-reduced",
    reduced ? "true" : "false",
  );
  document.body.classList.add("ri-enhanced");

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qsa(sel, root) {
    return Array.prototype.slice.call(
      (root || document).querySelectorAll(sel),
    );
  }

  qsa(".ri-lang a").forEach(function (a) {
    a.addEventListener("click", function () {
      var lang = a.getAttribute("data-ri-lang");
      if (lang === "en" || lang === "pt-BR") {
        try {
          localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) {}
      }
    });
  });

  var progress = qs(".ri-progress");
  function onScrollProgress() {
    if (!progress || reduced) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var p = max > 0 ? doc.scrollTop / max : 0;
    progress.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
  }

  var hero = qs("#f-hero");
  function onScrollParallax() {
    if (!hero || reduced) return;
    var y = Math.min(40, window.scrollY * 0.06);
    hero.style.setProperty("--ri-parallax-y", y + "px");
  }

  var lightIds = {
    "f-hero": 1,
    "f-philosophy": 1,
    "f-profile": 1,
    "f-timeline": 1,
    "f-mobs-state": 1,
    "f-caps": 1,
    "f-principles": 1,
  };
  var frames = qsa(".frame");

  function updateShellTheme() {
    var mid = window.innerHeight * 0.4;
    var onLight = false;
    frames.forEach(function (frame) {
      var r = frame.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid && lightIds[frame.id]) onLight = true;
    });
    document.body.classList.toggle("ri-on-light", onLight);
    document.body.classList.toggle("ri-on-dark", !onLight);
  }

  frames.forEach(function (frame) {
    frame.setAttribute("data-ri-observe", "true");
  });

  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("ri-inview");
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
    );
    frames.forEach(function (f) {
      io.observe(f);
    });
  } else {
    frames.forEach(function (f) {
      f.classList.add("ri-inview");
    });
  }

  /* ---- Timeline with fade ---- */
  var timeline = qs("[data-ri-timeline]");
  if (timeline) {
    var nodes = qsa(".ri-tl-node", timeline);
    var panelsRoot = qs(".ri-tl-panels", timeline) || timeline;
    var fading = false;

    function showPanel(panel, btn) {
      nodes.forEach(function (other) {
        other.setAttribute("aria-expanded", "false");
        other.classList.remove("ri-tl-active");
      });
      qsa(".ri-tl-panel", panelsRoot).forEach(function (op) {
        op.hidden = true;
        op.classList.remove("ri-panel-in");
      });
      btn.setAttribute("aria-expanded", "true");
      btn.classList.add("ri-tl-active");
      panel.hidden = false;
      // force reflow for transition
      void panel.offsetWidth;
      panel.classList.add("ri-panel-in");
      fading = false;
    }

    nodes.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-ri-stage");
        var panel = qs("#ri-tl-panel-" + id, timeline);
        if (!panel) return;
        var open = btn.getAttribute("aria-expanded") === "true";
        if (open) {
          panel.classList.remove("ri-panel-in");
          btn.setAttribute("aria-expanded", "false");
          btn.classList.remove("ri-tl-active");
          window.setTimeout(
            function () {
              panel.hidden = true;
            },
            reduced ? 0 : 220,
          );
          return;
        }
        if (fading) return;
        var current = qs(".ri-tl-panel.ri-panel-in", timeline);
        if (current && !reduced) {
          fading = true;
          current.classList.remove("ri-panel-in");
          window.setTimeout(function () {
            current.hidden = true;
            showPanel(panel, btn);
          }, 220);
        } else {
          showPanel(panel, btn);
        }
      });
    });
  }

  /* ---- Capabilities summary panel ---- */
  var capPanel = qs("#ri-cap-panel");
  var capTitle = qs(".ri-cap-panel-title", capPanel);
  var capBody = qs(".ri-cap-panel-body", capPanel);
  qsa(".ri-cap").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      qsa(".ri-cap").forEach(function (b) {
        b.setAttribute("aria-expanded", "false");
        b.classList.remove("ri-cap-active");
      });
      if (expanded) {
        if (capPanel) {
          capPanel.classList.remove("ri-panel-in");
          window.setTimeout(
            function () {
              capPanel.hidden = true;
            },
            reduced ? 0 : 200,
          );
        }
        return;
      }
      btn.setAttribute("aria-expanded", "true");
      btn.classList.add("ri-cap-active");
      if (capPanel && capTitle && capBody) {
        capTitle.textContent =
          (qs(".ri-cap-title", btn) || btn).textContent.trim();
        capBody.textContent = btn.getAttribute("data-ri-summary") || "";
        capPanel.hidden = false;
        void capPanel.offsetWidth;
        capPanel.classList.add("ri-panel-in");
        capPanel.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
      }
    });
  });

  /* ---- How MOBS Works — Blizzard-like banner carousel ---- */
  var howStage = qs("[data-ri-how-banners]");
  if (howStage) {
    var banners = qsa(".ri-how-banner", howStage);
    var dots = qsa(".ri-how-dot", howStage);
    var prevBtn = qs(".ri-how-prev", howStage);
    var nextBtn = qs(".ri-how-next", howStage);
    var howIndex = 0;

    function showHowBanner(index) {
      if (!banners.length) return;
      howIndex = ((index % banners.length) + banners.length) % banners.length;
      banners.forEach(function (slide, i) {
        var on = i === howIndex;
        slide.classList.toggle("ri-banner-active", on);
        slide.hidden = !on;
      });
      dots.forEach(function (dot, i) {
        var on = i === howIndex;
        dot.classList.toggle("ri-how-dot-active", on);
        dot.setAttribute("aria-current", on ? "true" : "false");
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        showHowBanner(howIndex - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        showHowBanner(howIndex + 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var n = parseInt(dot.getAttribute("data-ri-banner"), 10);
        if (!isNaN(n)) showHowBanner(n - 1);
      });
    });

    howStage.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        showHowBanner(howIndex - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        showHowBanner(howIndex + 1);
      }
    });

    showHowBanner(0);
  }

  window.addEventListener(
    "scroll",
    function () {
      onScrollProgress();
      onScrollParallax();
      updateShellTheme();
    },
    { passive: true },
  );

  onScrollProgress();
  onScrollParallax();
  updateShellTheme();

  window.__RI_LUCAS = {
    slice: 3,
    linkedIn: LINKEDIN,
    reduced: reduced,
    frameCount: frames.length,
  };
})();
