/* RI chrome JS — lang preference + scroll progress only */
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
  function onScroll() {
    if (!progress || reduced) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var p = max > 0 ? doc.scrollTop / max : 0;
    progress.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
