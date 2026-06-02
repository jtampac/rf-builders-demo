/* ============================================================
   RF BUILDERS & SUPPLY — Site JS
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Image fallback (graceful, branded) ---------- */
  // Any <img data-fallback> that fails to load is hidden and its parent
  // gets a branded gradient + icon so the layout never breaks.
  var FALLBACK_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9h0M9 12h0M9 15h0"/></svg>';
  function failImage(img) {
    var host = img.parentElement;
    if (host) {
      host.classList.add("imgfx");
      if (!host.querySelector(".imgfx-ico")) {
        var s = document.createElement("span");
        s.className = "imgfx-ico";
        s.innerHTML = FALLBACK_SVG;
        host.appendChild(s);
      }
    }
    img.style.display = "none";
  }
  function bindImages() {
    document.querySelectorAll("img[data-fallback]").forEach(function (img) {
      img.addEventListener("error", function () {
        failImage(img);
      });
      // If it already errored before listener attached
      if (img.complete && img.naturalWidth === 0) failImage(img);
    });
  }

  /* ---------- Header scroll state ---------- */
  function header() {
    var h = document.querySelector(".site-header");
    if (!h) return;
    var onScroll = function () {
      h.classList.toggle("scrolled", window.scrollY > 12);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile navigation ---------- */
  function mobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) return;
    var overlay = document.createElement("div");
    overlay.className = "nav-overlay";
    document.body.appendChild(overlay);

    function setOpen(open) {
      toggle.classList.toggle("open", open);
      links.classList.toggle("open", open);
      overlay.classList.toggle("show", open);
      document.body.style.overflow = open ? "hidden" : "";
    }
    toggle.addEventListener("click", function () {
      setOpen(!links.classList.contains("open"));
    });
    overlay.addEventListener("click", function () { setOpen(false); });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
  }

  /* ---------- Scroll reveal ---------- */
  function reveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Count-up numbers ---------- */
  function counters() {
    var nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;
    var run = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var dur = 1400, start = null;
      var step = function (t) {
        if (!start) start = t;
        var p = Math.min((t - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target * eased;
        el.textContent = (target % 1 === 0 ? Math.floor(val) : val.toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) {
      nums.forEach(run); return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---------- Gallery filter + lightbox ---------- */
  function gallery() {
    var filters = document.querySelectorAll(".gal-filters button");
    var items = document.querySelectorAll(".gal-item");
    if (filters.length) {
      filters.forEach(function (b) {
        b.addEventListener("click", function () {
          filters.forEach(function (x) { x.classList.remove("active"); });
          b.classList.add("active");
          var cat = b.getAttribute("data-filter");
          items.forEach(function (it) {
            var show = cat === "all" || it.getAttribute("data-cat") === cat;
            it.classList.toggle("hide", !show);
          });
        });
      });
    }
    var box = document.querySelector(".lightbox");
    if (box && items.length) {
      var bimg = box.querySelector("img");
      items.forEach(function (it) {
        it.addEventListener("click", function () {
          var im = it.querySelector("img");
          if (!im || im.style.display === "none") return;
          bimg.src = im.currentSrc || im.src;
          box.classList.add("show");
          document.body.style.overflow = "hidden";
        });
      });
      var close = function () { box.classList.remove("show"); document.body.style.overflow = ""; };
      box.querySelector(".close").addEventListener("click", close);
      box.addEventListener("click", function (e) { if (e.target === box) close(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    }
  }

  /* ---------- Quotation form ---------- */
  function quoteForm() {
    var form = document.getElementById("quoteForm");
    if (!form) return;
    var success = document.getElementById("formSuccess");

    function fieldOf(input) { return input.closest(".field"); }
    function validateField(input) {
      var val = (input.value || "").trim();
      var ok = true;
      if (input.hasAttribute("required") && !val) ok = false;
      if (ok && input.type === "email" && val) {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      }
      if (ok && input.type === "tel" && val) {
        ok = /[0-9]{7,}/.test(val.replace(/[^0-9]/g, ""));
      }
      var f = fieldOf(input);
      if (f) f.classList.toggle("invalid", !ok);
      return ok;
    }

    form.querySelectorAll("input,textarea,select").forEach(function (el) {
      el.addEventListener("blur", function () { validateField(el); });
      el.addEventListener("input", function () {
        var f = fieldOf(el);
        if (f && f.classList.contains("invalid")) validateField(el);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll("input,textarea,select").forEach(function (el) {
        if (el.hasAttribute("required") || el.value.trim()) {
          if (!validateField(el)) valid = false;
        }
      });
      if (!valid) {
        var firstBad = form.querySelector(".field.invalid");
        if (firstBad) firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      var label = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Sending…";
      // Front-end demo submit (no backend wired). Replace with real handler/email service.
      setTimeout(function () {
        form.reset();
        btn.disabled = false;
        btn.textContent = label;
        if (success) {
          success.classList.add("show");
          success.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(function () { success.classList.remove("show"); }, 9000);
        }
      }, 900);
    });
  }

  /* ---------- Capability bars ---------- */
  function caps() {
    var els = document.querySelectorAll(".cap");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("in"); }); return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Footer year ---------- */
  function year() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    bindImages();
    header();
    mobileNav();
    reveal();
    counters();
    gallery();
    caps();
    quoteForm();
    year();
  });
})();
