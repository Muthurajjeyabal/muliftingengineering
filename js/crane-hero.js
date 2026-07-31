/* Continuous up/down — ropes always connected, sheaves spin */
(function () {
  'use strict';
  var stage = document.getElementById('craneCanvas');
  var assembly = document.getElementById('craneAssembly');
  var ropesWrap = document.getElementById('ropesWrap');
  if (!stage || !assembly) return;

  var sheaves = document.querySelectorAll('.sheave-rot');
  var ready = false;
  var AMP = 95;
  var PERIOD = 4000;
  var ROPE_MAX = 72;
  var ROPE_MIN = 22;
  var t0 = 0;

  function ease(t) { return 0.5 - 0.5 * Math.cos(Math.PI * t); }

  function intro() {
    var s = performance.now();
    function f(now) {
      var t = Math.min((now - s) / 700, 1);
      stage.style.opacity = String(1 - Math.pow(1 - t, 3));
      apply(0, now);
      if (t < 1) requestAnimationFrame(f);
      else { ready = true; stage.style.opacity = '1'; t0 = performance.now(); requestAnimationFrame(loop); }
    }
    stage.style.opacity = '0';
    requestAnimationFrame(f);
  }

  function loop(now) {
    var elapsed = now - t0;
    var cycle = (elapsed % PERIOD) / PERIOD;
    var up = cycle < 0.5;
    var local = up ? cycle * 2 : (cycle - 0.5) * 2;
    var p = up ? ease(local) : ease(1 - local); // 0 bottom, 1 top
    apply(p, now);
    requestAnimationFrame(loop);
  }

  function apply(p, now) {
    // Move whole assembly: when at top (p=1) translate up less from bottom start
    // Start low: translateY large; at top: translateY small
    var y = AMP * (1 - p);
    var sway = Math.sin((now || 0) * 0.0018) * 1.5;
    assembly.style.transform = 'translateY(' + y.toFixed(1) + 'px) rotate(' + sway.toFixed(2) + 'deg)';

    // Rope height: long at bottom, short at top — always attached
    if (ropesWrap) {
      var h = ROPE_MIN + (ROPE_MAX - ROPE_MIN) * (1 - p);
      ropesWrap.style.height = h.toFixed(1) + 'px';
    }

    // Sheaves rotate
    var dir = ((now - t0) % PERIOD) < PERIOD / 2 ? 1 : -1;
    var ang = (now || 0) * 0.18 * dir;
    sheaves.forEach(function (s, i) {
      var d = i % 2 ? -1 : 1;
      var cx = s.getAttribute('data-cx') || '0';
      var cy = s.getAttribute('data-cy') || '0';
      s.setAttribute('transform', 'rotate(' + (ang * d).toFixed(1) + ' ' + cx + ' ' + cy + ')');
    });
  }

  if (document.readyState === 'complete') intro();
  else window.addEventListener('load', intro);
})();
