/* Group Mediterráneo Tarraconense — main.js v2.0 */

(function () {
  'use strict';

  /* ── Mobile nav burger ── */
  var burger   = document.getElementById('burger');
  var navLinks = document.getElementById('navlinks');

  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', function (e) {
      if (!burger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Nav: shrink + shadow on scroll ── */
  var nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 20) {
        nav.classList.add('is-scrolled');
      } else {
        nav.classList.remove('is-scrolled');
      }
    }, { passive: true });
  }

  /* ── Scroll reveal ── */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ── Stats counter animation ── */
  function animateCounter(el) {
    var text = el.textContent.trim();
    var prefix = text.match(/^[+]/) ? '+' : '';
    var num = parseFloat(text.replace(/[^0-9]/g, ''));
    if (isNaN(num)) return;

    var duration = 1200;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = prefix + Math.round(eased * num);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = text;
    }
    requestAnimationFrame(step);
  }

  var statsNums = document.querySelectorAll('.stats__num');
  if ('IntersectionObserver' in window && statsNums.length) {
    var statsObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statsObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statsNums.forEach(function (el) { statsObs.observe(el); });
  }

})();

/* ── 3D Logo ── */
(function () {
  var logo3d  = document.getElementById('logo3d');
  var scene   = document.getElementById('logo3dScene');
  var canvas  = document.getElementById('logo3dCanvas');
  var hero    = document.querySelector('.hero');
  if (!logo3d || !scene || !canvas || !hero) return;

  var ctx       = canvas.getContext('2d');
  var isHovered = false;
  var progress  = 0;
  var pulses    = [];
  var lastTime  = 0;

  function resizeCanvas() {
    canvas.width  = canvas.offsetWidth  || 480;
    canvas.height = canvas.offsetHeight || 480;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  /* Circuit network — coords relative to canvas center */
  var nodes = [
    { x: -60, y: -60 }, { x:  60, y: -60 },
    { x: -60, y:  60 }, { x:  60, y:  60 },
    { x:   0, y: -95 }, { x:  95, y:   0 },
    { x:   0, y:  95 }, { x: -95, y:   0 },
    { x:-135, y: -55 }, { x: 135, y: -55 },
    { x:-135, y:  55 }, { x: 135, y:  55 },
    { x:  -55, y:-135 }, { x:  55, y:-135 },
    { x:  -55, y: 135 }, { x:  55, y: 135 },
  ];

  var conns = [
    [0,4],[1,4],[0,7],[2,7],[1,5],[3,5],[2,6],[3,6],
    [8,7],[8,10],[9,5],[9,11],[12,4],[13,4],[14,6],[15,6],
    [8,12],[9,13],[10,14],[11,15],
    [0,1],[0,2],[1,3],[2,3],
  ];

  function drawCircuit(p) {
    var W = canvas.width, H = canvas.height;
    var cx = W / 2, cy = H / 2;
    ctx.clearRect(0, 0, W, H);

    /* connections */
    conns.forEach(function (c, i) {
      var delay = (i / conns.length) * 0.45;
      var lp = Math.min(1, Math.max(0, (p - delay) / 0.6));
      if (lp <= 0) return;
      var a = nodes[c[0]], b = nodes[c[1]];
      ctx.beginPath();
      ctx.moveTo(cx + a.x, cy + a.y);
      ctx.lineTo(cx + a.x + (b.x - a.x) * lp, cy + a.y + (b.y - a.y) * lp);
      ctx.strokeStyle = 'rgba(26,58,92,' + (p * 0.45) + ')';
      ctx.lineWidth = 0.9;
      ctx.stroke();
    });

    /* nodes */
    nodes.forEach(function (n, i) {
      var np = Math.min(1, Math.max(0, p * 3.5 - (i / nodes.length) * 1.5));
      if (np <= 0) return;
      ctx.beginPath();
      ctx.arc(cx + n.x, cy + n.y, 5.5 * np, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(201,168,76,' + (np * 0.13) + ')';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + n.x, cy + n.y, 2.2 * np, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(201,168,76,' + (np * 0.9) + ')';
      ctx.fill();
    });

    /* pulse dots travelling along connections */
    pulses.forEach(function (pulse) {
      var c = conns[pulse.ci];
      if (!c) return;
      var a = nodes[c[0]], b = nodes[c[1]];
      var px = cx + a.x + (b.x - a.x) * pulse.t;
      var py = cy + a.y + (b.y - a.y) * pulse.t;
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15,110,86,0.95)';
      ctx.fill();
    });
  }

  function tick(ts) {
    var dt = Math.min(ts - lastTime, 50);
    lastTime = ts;

    if (isHovered) {
      progress = Math.min(1, progress + dt * 0.0022);
      if (Math.random() < 0.07) pulses.push({ ci: Math.floor(Math.random() * conns.length), t: 0 });
      pulses.forEach(function (p) { p.t += 0.02; });
      pulses = pulses.filter(function (p) { return p.t < 1; });
    } else {
      progress = Math.max(0, progress - dt * 0.004);
      if (!isHovered) pulses = [];
    }

    if (progress > 0.01) drawCircuit(progress);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* Mouse: 3D tilt + hover detection */
  hero.addEventListener('mousemove', function (e) {
    var hr = hero.getBoundingClientRect();
    var mx = (e.clientX - hr.left) / hr.width  - 0.5;
    var my = (e.clientY - hr.top)  / hr.height - 0.5;
    scene.style.transform = 'rotateX(' + (-my * 22) + 'deg) rotateY(' + (mx * 22) + 'deg)';

    var lr  = logo3d.getBoundingClientRect();
    var over = e.clientX >= lr.left && e.clientX <= lr.right &&
               e.clientY >= lr.top  && e.clientY <= lr.bottom;
    if (over !== isHovered) {
      isHovered = over;
      logo3d.classList.toggle('is-hovered', over);
    }
  });

  hero.addEventListener('mouseleave', function () {
    scene.style.transform = 'rotateX(0deg) rotateY(0deg)';
    isHovered = false;
    logo3d.classList.remove('is-hovered');
  });
})();
