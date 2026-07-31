/* MU Lifting Engineering - Premium Scroll Crane Animation v2 */
(function () {
  'use strict';

  var canvas = document.getElementById('craneCanvas');
  if (!canvas) return;

  var hookGroup = document.getElementById('hookGroup');
  var sheaves = document.querySelectorAll('.sheave-rot');
  var ropes = document.querySelectorAll('.rope-line');
  var plate = document.getElementById('steelPlate');
  var heroContent = document.getElementById('heroContent');
  var heroScrollHint = document.getElementById('heroScrollHint');
  var ropeGroup = document.getElementById('ropes');

  var progress = 0;
  var targetProgress = 0;
  var swingPhase = 0;
  var introDone = false;

  var SCROLL_RANGE = 0.6;
  var SWING_AMP = 3.2;
  // translate Y values in SVG units (viewBox is 720 tall)
  var Y_LOW = 200;   // lowered position
  var Y_HIGH = 40;   // lifted position (near top)

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function runIntro() {
    var start = performance.now();
    var DUR = 1600;
    function frame(now) {
      var t = Math.min((now - start) / DUR, 1);
      canvas.style.opacity = String(easeOut(t));
      // start at lowered
      applyTransform(0);
      if (t < 1) requestAnimationFrame(frame);
      else {
        introDone = true;
        canvas.style.opacity = '1';
        requestAnimationFrame(loop);
      }
    }
    canvas.style.opacity = '0';
    // ensure text starts hidden
    if (heroContent) {
      heroContent.style.opacity = '0';
      heroContent.style.transform = 'translateY(32px)';
    }
    requestAnimationFrame(frame);
  }

  function loop(now) {
    swingPhase = now * 0.0011;
    progress += (targetProgress - progress) * 0.07;
    if (Math.abs(targetProgress - progress) < 0.0004) progress = targetProgress;
    applyTransform(progress);
    requestAnimationFrame(loop);
  }

  function applyTransform(p) {
    var y = Y_LOW + (Y_HIGH - Y_LOW) * p;
    var swing = Math.sin(swingPhase) * SWING_AMP * (0.35 + 0.65 * (1 - p));

    if (hookGroup) {
      hookGroup.setAttribute(
        'transform',
        'translate(0,' + y.toFixed(1) + ') rotate(' + swing.toFixed(2) + ' 250 0)'
      );
    }

    // Stretch ropes visually by updating end points toward hook block
    if (ropes.length >= 3) {
      var hookTop = y; // approximate
      ropes[0].setAttribute('y2', String(hookTop + 5));
      ropes[1].setAttribute('y2', String(hookTop + 5));
      ropes[2].setAttribute('y2', String(hookTop + 5));
      // slight horizontal sway on outer ropes
      ropes[0].setAttribute('x2', String(220 + Math.sin(swingPhase) * 4));
      ropes[2].setAttribute('x2', String(280 - Math.sin(swingPhase) * 4));
    }

    // Sheave spin
    var angle = p * 900;
    sheaves.forEach(function (s, i) {
      var dir = (i % 2 === 0) ? 1 : -1;
      var cx = s.getAttribute('data-cx') || '0';
      var cy = s.getAttribute('data-cy') || '0';
      s.setAttribute('transform', 'rotate(' + (angle * dir).toFixed(1) + ' ' + cx + ' ' + cy + ')');
    });

    // Steel plate
    if (plate) {
      var op = Math.min(1, Math.max(0, (p - 0.05) * 2.2));
      plate.setAttribute('opacity', op.toFixed(2));
      var sc = 0.75 + p * 0.25;
      // keep translate for centering, add scale
      plate.setAttribute('transform', 'translate(250, 160) scale(' + sc.toFixed(3) + ')');
    }

    // Hero text fade
    if (heroContent) {
      var textOp = Math.max(0, Math.min(1, (p - 0.55) / 0.35));
      heroContent.style.opacity = String(textOp);
      heroContent.style.transform = 'translateY(' + ((1 - textOp) * 32) + 'px)';
      if (textOp > 0.92) heroContent.classList.add('hero-visible');
    }

    if (heroScrollHint) {
      heroScrollHint.style.opacity = String(Math.max(0, 1 - p * 3.5));
    }
  }

  function onScroll() {
    if (!introDone) return;
    var hero = document.getElementById('home');
    if (!hero) return;
    var rect = hero.getBoundingClientRect();
    var scrolled = Math.max(0, -rect.top);
    targetProgress = Math.min(1, scrolled / (hero.offsetHeight * SCROLL_RANGE));
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  if (document.readyState === 'complete') runIntro();
  else window.addEventListener('load', runIntro);
})();
