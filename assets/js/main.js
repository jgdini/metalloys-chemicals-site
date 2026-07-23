(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  if (navToggle && header) {
    navToggle.addEventListener("click", function () {
      var open = header.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Institutional video: click-to-play facade (thumbnail -> real embed) ---- */
  var videoFacades = document.querySelectorAll("[data-yt-facade]");
  videoFacades.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var figure = btn.closest(".about-teaser__figure") || btn.parentNode;
      var iframe = document.createElement("iframe");
      iframe.src = btn.getAttribute("data-yt-embed");
      iframe.title = btn.getAttribute("aria-label") || "YouTube video";
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute(
        "allow",
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      );
      iframe.setAttribute("allowfullscreen", "");
      iframe.style.position = "absolute";
      iframe.style.inset = "0";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "0";
      figure.innerHTML = "";
      figure.appendChild(iframe);
    });
  });

  /* ---- Sitewide atom cursor ---- */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    var cursorEl = document.createElement("div");
    cursorEl.className = "atom-cursor";
    cursorEl.setAttribute("aria-hidden", "true");
    cursorEl.innerHTML =
      '<div class="atom-cursor__inner">' +
      '<svg viewBox="0 0 32 32" width="26" height="26">' +
      '<g transform="rotate(0 16 16)"><ellipse class="atom-cursor__orbit atom-cursor__spin-a" cx="16" cy="16" rx="14" ry="6" /></g>' +
      '<g transform="rotate(60 16 16)"><ellipse class="atom-cursor__orbit atom-cursor__spin-b" cx="16" cy="16" rx="14" ry="6" /></g>' +
      '<g transform="rotate(-60 16 16)"><ellipse class="atom-cursor__orbit atom-cursor__spin-c" cx="16" cy="16" rx="14" ry="6" /></g>' +
      '<circle class="atom-cursor__nucleus" cx="16" cy="16" r="3" />' +
      "</svg></div>";
    document.body.appendChild(cursorEl);
    var cursorInner = cursorEl.querySelector(".atom-cursor__inner");

    var atomX = window.innerWidth / 2;
    var atomY = window.innerHeight / 2;
    var targetX = atomX;
    var targetY = atomY;
    var cursorShown = false;
    var cursorRafId = null;

    document.addEventListener("mousemove", function (e) {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!cursorShown) {
        cursorShown = true;
        atomX = targetX;
        atomY = targetY;
        cursorEl.classList.add("is-visible");
      }
    });
    document.documentElement.addEventListener("mouseleave", function () {
      cursorEl.classList.remove("is-visible");
    });

    var hoverSelector = "a, button, .btn, input, textarea, [role='button']";
    document.addEventListener(
      "mouseover",
      function (e) {
        if (e.target.closest && e.target.closest(hoverSelector)) {
          cursorInner.classList.add("is-pointer");
        }
      },
      true
    );
    document.addEventListener(
      "mouseout",
      function (e) {
        if (e.target.closest && e.target.closest(hoverSelector)) {
          cursorInner.classList.remove("is-pointer");
        }
      },
      true
    );

    function cursorTick() {
      atomX += (targetX - atomX) * 0.2;
      atomY += (targetY - atomY) * 0.2;
      cursorEl.style.transform = "translate(" + atomX.toFixed(1) + "px, " + atomY.toFixed(1) + "px)";
      cursorRafId = requestAnimationFrame(cursorTick);
    }
    cursorRafId = requestAnimationFrame(cursorTick);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (cursorRafId) cancelAnimationFrame(cursorRafId);
        cursorRafId = null;
      } else if (!cursorRafId) {
        cursorRafId = requestAnimationFrame(cursorTick);
      }
    });
  }

  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var isYear = el.getAttribute("data-format") === "year";
      if (reduceMotion) {
        el.textContent = (isYear ? target : target) + suffix;
        return;
      }
      var start = null;
      var duration = 1400;
      var from = isYear ? target - 30 : 0;
      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.round(from + (target - from) * eased);
        el.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              cio.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(animateCount);
    }
  }

  var contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = contactForm.querySelector(".form-note");
      if (note) {
        note.textContent = contactForm.getAttribute("data-success-message") || "Message ready.";
      }
    });
  }

  /* ---- Cursor spotlight: hero, page-hero, cta-band ---- */
  if (!reduceMotion) {
    var glowHosts = document.querySelectorAll(".hero, .page-hero, .cta-band");
    glowHosts.forEach(function (host) {
      host.addEventListener("mousemove", function (e) {
        var r = host.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var x = ((e.clientX - r.left) / r.width) * 100;
        var y = ((e.clientY - r.top) / r.height) * 100;
        host.style.setProperty("--mx", x + "%");
        host.style.setProperty("--my", y + "%");
        host.classList.add("is-glow-active");
      });
      host.addEventListener("mouseleave", function () {
        host.classList.remove("is-glow-active");
      });
    });
  }

  /* ---- Magnetic pull on primary CTAs ---- */
  if (!reduceMotion) {
    var magneticEls = document.querySelectorAll(".hero__actions .btn, .cta-band .btn");
    magneticEls.forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + (x * 0.22).toFixed(1) + "px, " + (y * 0.35).toFixed(1) + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "translate(0, 0)";
      });
    });
  }

  /* ---- Cursor-tracked shine on division tiles ---- */
  if (!reduceMotion) {
    var tiles = document.querySelectorAll(".element");
    tiles.forEach(function (tile) {
      tile.addEventListener("mousemove", function (e) {
        var r = tile.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var x = ((e.clientX - r.left) / r.width) * 100;
        var y = ((e.clientY - r.top) / r.height) * 100;
        tile.style.setProperty("--tx", x + "%");
        tile.style.setProperty("--ty", y + "%");
      });
    });
  }

  /* ---- Molecular network canvas (home hero signature) ---- */
  var networkHost = document.querySelector("[data-network]");
  if (networkHost && !reduceMotion && "requestAnimationFrame" in window) {
    initNetwork(networkHost);
  }

  function initNetwork(host) {
    var canvas = document.createElement("canvas");
    canvas.className = "hero-canvas";
    canvas.setAttribute("aria-hidden", "true");
    var field = host.querySelector(".hero__field");
    if (field && field.nextSibling) {
      host.insertBefore(canvas, field.nextSibling);
    } else {
      host.appendChild(canvas);
    }

    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, particles = [];
    var mouse = { x: 0, y: 0, active: false };
    var rafId = null;
    var COUNT = 42;
    var LINK_DIST = 130;
    var MOUSE_DIST = 170;

    function resize() {
      var prevW = w, prevH = h;
      w = host.clientWidth;
      h = host.clientHeight;
      if (!w || !h) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!particles.length || !prevW || !prevH) seed();
    }

    function seed() {
      particles = [];
      for (var i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.26,
          vy: (Math.random() - 0.5) * 0.26,
          r: Math.random() * 1.5 + 0.7
        });
      }
    }

    resize();

    if ("ResizeObserver" in window) {
      var ro = new ResizeObserver(function () { resize(); });
      ro.observe(host);
    } else {
      var resizeTimer;
      window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 200);
      });
    }

    host.addEventListener("mousemove", function (e) {
      var r = host.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = true;
    });
    host.addEventListener("mouseleave", function () { mouse.active = false; });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!rafId) {
        rafId = requestAnimationFrame(step);
      }
    });

    function step() {
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }

      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var a = particles[i], b = particles[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = "rgba(124, 147, 172, " + (0.32 * (1 - dist / LINK_DIST)).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        if (mouse.active) {
          var p2 = particles[i];
          var mdx = p2.x - mouse.x, mdy = p2.y - mouse.y;
          var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < MOUSE_DIST) {
            ctx.strokeStyle = "rgba(196, 112, 59, " + (0.55 * (1 - mdist / MOUSE_DIST)).toFixed(3) + ")";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(p2.x, p2.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      for (var i = 0; i < particles.length; i++) {
        var p3 = particles[i];
        ctx.beginPath();
        ctx.arc(p3.x, p3.y, p3.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(168, 184, 203, 0.8)";
        ctx.fill();
      }

      if (mouse.active) {
        var grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 16);
        grd.addColorStop(0, "rgba(218, 139, 87, 0.85)");
        grd.addColorStop(1, "rgba(218, 139, 87, 0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 16, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(step);
    }

    rafId = requestAnimationFrame(step);
  }
})();
