/* Group Mediterráneo Tarraconense — main.js */

(function () {
  'use strict';

  /* ── Mobile nav burger ── */
  var burger  = document.getElementById('burger');
  var navLinks = document.getElementById('navlinks');

  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    /* Close on link click */
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });

    /* Close on outside click */
    document.addEventListener('click', function (e) {
      if (!burger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Nav shadow on scroll ── */
  var nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.style.boxShadow = window.scrollY > 10
        ? '0 1px 12px rgba(0,0,0,0.07)'
        : 'none';
    }, { passive: true });
  }

})();
