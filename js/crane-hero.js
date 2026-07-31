/* Crane continuous up-down lift like video + sheave spin + rope stretch */
(function () {
  'use strict';

  var stage = document.getElementById('craneCanvas');
  var assembly = document.getElementById('craneAssembly');
  if (!stage || !assembly) return;

  var sheaves = document.querySelectorAll('.sheave-rot');
  var ropeSvg = document.querySelector('.crane-ropes');
  var ready = false;

  // Motion config — dramatic video-like travel
  var AMP = 110;          // px travel distance (bottom <-> top)
  var PERIOD = 4200;      // ms for one full up+down cycle
  var startTime = 0;

  function easeInOut(t) {
    // smooth cosine ease for natural crane motion
    return 0.5 - 0.5 * Math.cos(Math.PI * t);
  }

  function intro() {
    var t0 = performance.now();
    function f(now) {
      var t = Math.min((now - t0) / 800, 1);
      stage.style.opacity = String(1 - Math.pow(1 - t, 3));
      if (t < 1) requestAnimationFrame(f);
      else {
        ready = true;
        stage.style.opacity = '1';
        startTime = performance.now();
        requestAnimationFrame(loop);
      }
    }
    stage.style.opacity = '0';
    // start at bottom position
    apply(0);
    requestAnimationFrame(f);
  }

  function loop(now) {
    if (!ready) return;
    var elapsed = now - startTime;
    // 0 → 1 → 0 continuous cycle (up then down)
    var cycle = (elapsed % PERIOD) / PERIOD;
    var goingUp = cycle < 0.5;
    var localT = goingUp ? (cycle * 2) : ((cycle - 0.5) * 2);
    var p = goingUp ? easeInOut(localT) : easeInOut(1 - localT);
    // p=0 bottom, p=1 top
    apply(p, elapsed);
    requestAnimationFrame(loop);
  }

  function apply(p, elapsed) {
    elapsed = elapsed || 0;

    // Vertical position: 0 = low, 1 = high
    var y = AMP * (1 - p); // at p=1 (top) y is smaller (higher on screen)
    // tiny sway
    var sway = Math.sin(elapsed * 0.002) * 1.8 * (0.5 + 0.5 * (1 - p));

    assembly.style.transform =
      'translateY(' + y.toFixed(1) + 'px) rotate(' + sway.toFixed(2) + 'deg)';

    // Ropes shrink when hook rises
    if (ropeSvg) {
      var ropeScale = 0.35 + (1 - p) * 0.65; // short at top, long at bottom
      ropeSvg.style.transform = 'scaleY(' + ropeScale.toFixed(3) + ')';
      ropeSvg.style.transformOrigin = 'top center';
    }

    // Sheaves spin proportional to motion speed + direction
    // Use derivative-ish: spin faster mid-travel
    var spinSpeed = Math.sin(p * Math.PI); // max at mid
    var dir = (elapsed % PERIOD) < PERIOD / 2 ? 1 : -1; // reverse when going down
    var angle = elapsed * 0.15 * dir + p * 360;

    sheaves.forEach(function (s, i) {
      var d = (i % 2 === 0) ? 1 : -1;
      var cx = s.getAttribute('data-cx') || '0';
      var cy = s.getAttribute('data-cy') || '0';
      s.setAttribute(
        'transform',
        'rotate(' + (angle * d * (0.6 + spinSpeed * 0.8)).toFixed(1) + ' ' + cx + ' ' + cy + ')'
      );
    });
  }

  if (document.readyState === 'complete') intro();
  else window.addEventListener('load', intro);
})();
