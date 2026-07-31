/* Crane image lift + rope stretch + sheave rotation */
(function () {
  'use strict';
  var stage = document.getElementById('craneCanvas');
  var assembly = document.getElementById('craneAssembly');
  if (!stage || !assembly) return;

  var sheaves = document.querySelectorAll('.sheave-rot');
  var ropes = document.querySelectorAll('.rope-line');
  var progress = 0, target = 0, phase = 0, ready = false;

  function intro() {
    var t0 = performance.now();
    function f(now) {
      var t = Math.min((now - t0) / 1000, 1);
      stage.style.opacity = String(1 - Math.pow(1 - t, 3));
      apply(0);
      if (t < 1) requestAnimationFrame(f);
      else { ready = true; stage.style.opacity = '1'; requestAnimationFrame(loop); }
    }
    stage.style.opacity = '0';
    requestAnimationFrame(f);
  }

  function loop(now) {
    phase = now * 0.0012;
    progress += (target - progress) * 0.09;
    apply(progress);
    requestAnimationFrame(loop);
  }

  function apply(p) {
    // Lift assembly upward (negative Y)
    var liftPx = p * 120; // max lift distance
    var swing = Math.sin(phase) * 2.2 * (1 - p * 0.4);
    assembly.style.transform =
      'translateY(' + (-liftPx).toFixed(1) + 'px) rotate(' + swing.toFixed(2) + 'deg)';

    // Rope length shortens as hook rises (visual: reduce height via scaleY)
    var ropeSvg = document.querySelector('.crane-ropes');
    if (ropeSvg) {
      var ropeScale = 1 - p * 0.55;
      ropeSvg.style.transform = 'scaleY(' + ropeScale.toFixed(3) + ')';
      ropeSvg.style.transformOrigin = 'top center';
    }

    // Sheaves rotate with lift progress + continuous spin feel
    var ang = p * 980 + phase * 40;
    sheaves.forEach(function (s, i) {
      var dir = (i % 2 === 0) ? 1 : -1;
      var cx = s.getAttribute('data-cx') || '0';
      var cy = s.getAttribute('data-cy') || '0';
      s.setAttribute('transform', 'rotate(' + (ang * dir).toFixed(1) + ' ' + cx + ' ' + cy + ')');
    });
  }

  function onScroll() {
    if (!ready) return;
    var hero = document.getElementById('home');
    if (!hero) return;
    var sc = Math.max(0, -hero.getBoundingClientRect().top);
    target = Math.min(1, sc / (hero.offsetHeight * 0.45));
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  if (document.readyState === 'complete') intro();
  else window.addEventListener('load', intro);
})();
