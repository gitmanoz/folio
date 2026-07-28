/* RI chrome JS — lang preference, scroll progress, surface-aware lang contrast */
(function () {
  "use strict";
  var STORAGE_KEY = "lucas-pe-lang";
  document.querySelectorAll(".ri-lang a").forEach(function (a) {
    a.addEventListener("click", function () {
      var lang = a.getAttribute("data-ri-lang");
      if (lang === "en" || lang === "pt-BR") {
        try {
          localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) {}
      }
    });
  });

  var progress = document.querySelector(".ri-progress");
  var reduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function onScrollProgress() {
    if (!progress || reduced) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var p = max > 0 ? doc.scrollTop / max : 0;
    progress.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
  }

  /** Match EN/PT chrome to the frame under the fixed control (center of chip). */
  function updateLangTheme() {
    var lang = document.querySelector(".ri-lang");
    var y = 56;
    if (lang) {
      var lr = lang.getBoundingClientRect();
      y = lr.top + lr.height / 2;
    }
    var surface = "light";
    var frames = document.querySelectorAll(".frame[data-surface]");
    for (var i = 0; i < frames.length; i++) {
      var r = frames[i].getBoundingClientRect();
      if (r.top <= y && r.bottom >= y) {
        surface = frames[i].getAttribute("data-surface") || "light";
        break;
      }
    }
    var onLight = surface !== "ink";
    document.body.classList.toggle("ri-on-light", onLight);
    document.body.classList.toggle("ri-on-dark", !onLight);
  }

  function onScroll() {
    onScrollProgress();
    updateLangTheme();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateLangTheme, { passive: true });
  onScroll();
})();
