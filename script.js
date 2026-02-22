/**
 * Portfolio - Interactive effects, cursor, scroll reveal, animations
 * Production-ready with error isolation and performance in mind.
 */

(function () {
  'use strict';

  var STORAGE_THEME = 'portfolio-theme';
  var CURSOR_LERP = 0.15;
  var TILT_MAX = 10;
  var HOVER_SELECTORS = 'a, button, .theme-toggle, .project-card, .btn-cta, .skill-card, .nav-link, .navbar-brand, .social-icons a, .timeline-dot, .hire-badge, .card-profile img';

  // ----- Theme -----
  function getPreferredTheme() {
    try {
      var stored = localStorage.getItem(STORAGE_THEME);
      if (stored === 'dark' || stored === 'light') return stored;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch (e) {}
    return 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_THEME, theme);
    } catch (e) {}
    updateThemeToggleIcon(theme);
  }

  function updateThemeToggleIcon(theme) {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    var sun = btn.querySelector('.icon-sun');
    var moon = btn.querySelector('.icon-moon');
    if (sun) sun.style.display = theme === 'dark' ? 'block' : 'none';
    if (moon) moon.style.display = theme === 'light' ? 'block' : 'none';
  }

  function initTheme() {
    var current = document.documentElement.getAttribute('data-theme');
    if (!current) setTheme(getPreferredTheme());
    else updateThemeToggleIcon(current);
    var themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        var cur = document.documentElement.getAttribute('data-theme') || 'light';
        setTheme(cur === 'dark' ? 'light' : 'dark');
      });
    }
  }

  // ----- Loader: always hide smoothly, mark body as loaded -----
  function hideLoader() {
    try {
      var loader = document.getElementById('loader');
      if (loader) {
        loader.classList.add('hidden');
        setTimeout(function () {
          try {
            loader.remove();
            document.body.classList.add('loaded');
          } catch (e) {}
        }, 500);
      } else {
        document.body.classList.add('loaded');
      }
    } catch (e) {
      document.body.classList.add('loaded');
    }
  }

  // ----- Scroll reveal: sections and generic reveal elements -----
  function initReveal() {
    var revealSelector = '.reveal, .reveal-stagger, .section-header';
    var elements = document.querySelectorAll(revealSelector);
    var sectionSelector = 'section[id]';
    var sections = document.querySelectorAll(sectionSelector);
    var opts = { rootMargin: '0px 0px -80px 0px', threshold: 0.08 };

    function onReveal(entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      });
    }

    function onSection(entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else {
          entry.target.classList.remove('in-view');
        }
      });
    }

    var revealObserver = new IntersectionObserver(onReveal, opts);
    elements.forEach(function (el) { revealObserver.observe(el); });

    var sectionObserver = new IntersectionObserver(onSection, { rootMargin: '-10% 0px -10% 0px', threshold: 0 });
    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  // ----- Skill progress bars (animate when visible) -----
  function initSkillBars() {
    var cards = document.querySelectorAll('.skill-card');
    if (!cards.length) return;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -50px 0px', threshold: 0.2 }
    );
    cards.forEach(function (card) { observer.observe(card); });
  }

  // ----- Project card 3D tilt (desktop only, smooth) -----
  function initCardTilt() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    var cards = document.querySelectorAll('.project-card');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', onTiltMove);
      card.addEventListener('mouseleave', onTiltLeave);
    });

    function onTiltMove(e) {
      var card = e.currentTarget;
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      var tiltX = (y - 0.5) * -TILT_MAX;
      var tiltY = (x - 0.5) * TILT_MAX;
      card.style.transform = 'perspective(1000px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) scale3d(1.02, 1.02, 1.02)';
    }

    function onTiltLeave(e) {
      e.currentTarget.style.transform = '';
    }
  }

  // ----- Project card touch: toggle overlay on mobile -----
  function initProjectTouch() {
    document.querySelectorAll('.project-card-wrap').forEach(function (wrap) {
      wrap.addEventListener('click', function (e) {
        if (window.matchMedia('(hover: none)').matches) {
          wrap.classList.toggle('touch-active');
        }
      });
    });
  }

  // ----- Custom cursor: smooth ring + dot, optional on mobile -----
  function initCursor() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    var dot = document.getElementById('cursor-dot');
    var ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    var mouseX = 0, mouseY = 0;
    var dotX = 0, dotY = 0;
    var ringX = 0, ringY = 0;
    var ringSize = 40;
    var ticking = false;

    function updateMouse(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    function tick() {
      dotX += (mouseX - dotX) * 0.35;
      dotY += (mouseY - dotY) * 0.35;
      ringX += (mouseX - ringX) * CURSOR_LERP;
      ringY += (mouseY - ringY) * CURSOR_LERP;

      dot.style.left = dotX + 'px';
      dot.style.top = dotY + 'px';
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';

      ticking = false;
    }

    function requestTick() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(tick);
    }

    document.addEventListener('mousemove', function (e) {
      updateMouse(e);
      requestTick();
    }, { passive: true });

    function setHover(hover) {
      dot.classList.toggle('hover', hover);
      ring.classList.toggle('hover', hover);
    }

    var hoverTargets = document.querySelectorAll(HOVER_SELECTORS);
    hoverTargets.forEach(function (el) {
      el.addEventListener('mouseenter', function () { setHover(true); });
      el.addEventListener('mouseleave', function () { setHover(false); });
    });

    dot.classList.remove('hidden');
    ring.classList.remove('hidden');
    document.body.classList.add('has-cursor');
  }

  // ----- Header scroll state -----
  function initHeaderScroll() {
    var header = document.getElementById('header');
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle('scrolled', window.scrollY > 20);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  // ----- Smooth scroll for in-page links -----
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      var id = anchor.getAttribute('href');
      if (id === '#') return;
      var target = document.querySelector(id);
      if (target) {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    });
  }

  // ----- Hero: subtle parallax on scroll (optional, light) -----
  function initHeroParallax() {
    var hero = document.getElementById('hero');
    var content = hero && hero.querySelector('.hero-content');
    if (!content) return;

    var ticking = false;
    function update() {
      var y = window.scrollY;
      var rate = Math.min(y * 0.15, 80);
      content.style.transform = 'translate3d(0, ' + rate * 0.3 + 'px, 0)';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
  }

  // ----- Run inits with error isolation; always hide loader -----
  function runSafe(fn) {
    try {
      fn();
    } catch (err) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('Portfolio init:', fn.name || 'unknown', err);
      }
    }
  }

  function init() {
    runSafe(initTheme);
    runSafe(initReveal);
    runSafe(initSkillBars);
    runSafe(initCardTilt);
    runSafe(initProjectTouch);
    runSafe(initHeaderScroll);
    runSafe(initSmoothScroll);
    runSafe(initCursor);
    runSafe(initHeroParallax);
    setTimeout(hideLoader, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
