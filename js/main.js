/* Group Mediterráneo Tarraconense — main.js v3.0 dark futurista */
'use strict';

/* ── Mobile nav ── */
(function () {
  var burger   = document.getElementById('burger');
  var navLinks = document.getElementById('navlinks');
  if (!burger || !navLinks) return;
  burger.addEventListener('click', function () {
    var open = navLinks.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
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
})();

/* ── Nav glassmorphism on scroll ── */
(function () {
  var nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', function () {
    nav.classList.toggle('is-scrolled', window.scrollY > 20);
  }, { passive: true });
})();

/* ── Scroll reveal ── */
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    els.forEach(function (el) { obs.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();

/* ── Stats counter ── */
(function () {
  var nums = document.querySelectorAll('.stats__num');
  if (!nums.length) return;
  function animateCounter(el) {
    var text   = el.textContent.trim();
    var prefix = text.match(/^\+/) ? '+' : '';
    var num    = parseFloat(text.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return;
    var start = null;
    var dur   = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p  = Math.min((ts - start) / dur, 1);
      var ep = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(ep * num);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = text;
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { obs.observe(el); });
  }
})();

/* ── Three.js Hero Logo 3D ── */
(function () {
  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  /* Respeta prefers-reduced-motion */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    var fb = document.querySelector('.hero__logo-fallback');
    if (fb) fb.style.display = 'block';
    return;
  }

  /* Carga Three.js desde CDN si no está ya cargado */
  function initScene() {
    var THREE = window.THREE;
    if (!THREE) return;

    var hero = document.getElementById('inicio');
    var W    = canvas.offsetWidth  || window.innerWidth;
    var H    = canvas.offsetHeight || window.innerHeight;

    /* Renderer */
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (e) {
      canvas.style.display = 'none';
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);

    /* Escena y cámara */
    var scene  = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 100);
    camera.position.z = 5.5;

    /* ── Partículas ── */
    var count = window.innerWidth < 768 ? 450 : 900;
    var pos   = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.022, transparent: true, opacity: 0.35, sizeAttenuation: true });
    var particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    /* ── Logo 3D ── */
    var logoGroup = new THREE.Group();
    logoGroup.position.y = 1.2;  /* logo en la mitad superior del hero */
    scene.add(logoGroup);

    var pieces = [];
    var isHovered = false;
    var explodeT  = 0;  /* 0 = ensamblado, 1 = separado */

    /* Quitar fondo blanco del PNG */
    function removeWhite(img) {
      var c   = document.createElement('canvas');
      c.width  = img.naturalWidth;
      c.height = img.naturalHeight;
      var ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      var d = ctx.getImageData(0, 0, c.width, c.height);
      for (var i = 0; i < d.data.length; i += 4) {
        if (d.data[i] > 235 && d.data[i + 1] > 235 && d.data[i + 2] > 235) {
          d.data[i + 3] = 0;
        }
      }
      ctx.putImageData(d, 0, 0);
      return c;
    }

    /* Extraer cuadrante como canvas */
    function quadrantCanvas(full, col, row) {
      var half = Math.floor(full.width / 2);
      var c    = document.createElement('canvas');
      c.width  = half;
      c.height = half;
      c.getContext('2d').drawImage(full, col * half, row * half, half, half, 0, 0, half, half);
      return c;
    }

    /* Cuadrantes: [col, row, posX, posY, explodeDX, explodeDY, explodeDZ, rotDir] */
    var QUADS = [
      [0, 0, -0.75,  0.75, -1.4,  1.4,  0.6, -1],  /* TL */
      [1, 0,  0.75,  0.75,  1.4,  1.4, -0.6,  1],  /* TR */
      [0, 1, -0.75, -0.75, -1.4, -1.4, -0.6,  1],  /* BL */
      [1, 1,  0.75, -0.75,  1.4, -1.4,  0.6, -1],  /* BR */
    ];

    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      var cleanCanvas = removeWhite(img);

      QUADS.forEach(function (q) {
        var qCanvas = quadrantCanvas(cleanCanvas, q[0], q[1]);
        var tex     = new THREE.CanvasTexture(qCanvas);
        var geo     = new THREE.PlaneGeometry(1.5, 1.5);
        var mat     = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, alphaTest: 0.02 });
        var mesh    = new THREE.Mesh(geo, mat);
        mesh.position.set(q[2], q[3], 0);
        mesh.userData = {
          homeX: q[2], homeY: q[3], homeZ: 0,
          dx: q[4], dy: q[5], dz: q[6],
          rotDir: q[7],
        };
        logoGroup.add(mesh);
        pieces.push(mesh);
      });
    };
    img.onerror = function () { canvas.style.display = 'none'; };
    img.src = 'assets/img/logo.png';

    /* ── Raycaster para hover ── */
    var raycaster  = new THREE.Raycaster();
    var mouseNDC   = new THREE.Vector2(9, 9);
    var targetTiltX = 0, targetTiltY = 0;
    var currentTiltX = 0, currentTiltY = 0;

    function onMouseMove(e) {
      var r  = canvas.getBoundingClientRect();
      mouseNDC.x =  ((e.clientX - r.left) / r.width)  * 2 - 1;
      mouseNDC.y = -((e.clientY - r.top)  / r.height) * 2 + 1;
      targetTiltY =  mouseNDC.x * 0.28;
      targetTiltX = -mouseNDC.y * 0.18;
    }
    function onMouseLeave() {
      mouseNDC.set(9, 9);
      targetTiltX = 0;
      targetTiltY = 0;
      isHovered = false;
    }

    if (hero) {
      hero.addEventListener('mousemove', onMouseMove, { passive: true });
      hero.addEventListener('mouseleave', onMouseLeave, { passive: true });
    }

    /* Lerp helper */
    function lerp(a, b, t) { return a + (b - a) * t; }

    /* ── Loop ── */
    var raf  = null;
    var time = 0;
    var lastTs = 0;

    function animate(ts) {
      raf = requestAnimationFrame(animate);
      if (document.hidden) return;

      var dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      time  += dt;

      /* Partículas drift lento */
      particles.rotation.y = time * 0.018;
      particles.rotation.x = time * 0.009;

      /* Tilt suave con mouse */
      currentTiltX = lerp(currentTiltX, targetTiltX, 0.07);
      currentTiltY = lerp(currentTiltY, targetTiltY, 0.07);
      logoGroup.rotation.x = currentTiltX;
      logoGroup.rotation.y = currentTiltY;

      /* Bob idle */
      logoGroup.position.y = 1.2 + Math.sin(time * 0.75) * 0.04;

      /* Raycaster: detectar hover sobre piezas */
      if (pieces.length > 0) {
        raycaster.setFromCamera(mouseNDC, camera);
        var hits = raycaster.intersectObjects(pieces);
        isHovered = hits.length > 0;
      }

      /* Animar explode */
      var targetT = isHovered ? 1 : 0;
      explodeT = lerp(explodeT, targetT, 0.09);

      pieces.forEach(function (p) {
        var u = p.userData;
        p.position.x = lerp(u.homeX, u.homeX + u.dx, explodeT);
        p.position.y = lerp(u.homeY, u.homeY + u.dy, explodeT);
        p.position.z = lerp(u.homeZ, u.homeZ + u.dz, explodeT);
        p.rotation.z = lerp(0, u.rotDir * 0.35, explodeT);
      });

      renderer.render(scene, camera);
    }

    raf = requestAnimationFrame(animate);

    /* Pausa cuando la pestaña no está visible */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        lastTs = performance.now();
        raf = requestAnimationFrame(animate);
      }
    });

    /* Resize */
    window.addEventListener('resize', function () {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    }, { passive: true });
  }

  /* Espera a que Three.js cargue desde CDN */
  if (window.THREE) {
    initScene();
  } else {
    var script = document.querySelector('script[src*="three"]');
    if (script) {
      script.addEventListener('load', initScene);
    }
  }
})();
