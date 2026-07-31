/* Scroll-driven tandem lift story — EPIC-style line art */
(function () {
  'use strict';

  var stage = document.getElementById('liftStory');
  if (!stage) return;

  var vessel = document.getElementById('lsVessel');
  var craneL = document.getElementById('lsCraneL');
  var craneR = document.getElementById('lsCraneR');
  var hookL = document.getElementById('lsHookL');
  var hookR = document.getElementById('lsHookR');
  var ropeL = document.getElementById('lsRopeL');
  var ropeR = document.getElementById('lsRopeR');
  var label = document.getElementById('lsLabel');
  var heroText = document.getElementById('heroContent');

  var progress = 0, target = 0;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(t) { return t * t * (3 - 2 * t); }

  function onScroll() {
    var hero = document.getElementById('home');
    if (!hero) return;
    var rect = hero.getBoundingClientRect();
    var h = hero.offsetHeight - window.innerHeight;
    if (h < 1) h = 1;
    target = clamp(-rect.top / h, 0, 1);
  }

  function loop() {
    progress += (target - progress) * 0.06;
    apply(progress);
    requestAnimationFrame(loop);
  }

  /*
    Story timeline (p 0→1):
    0.00–0.25  Both cranes hold horizontal vessel
    0.25–0.45  Right crane releases, moves away
    0.45–0.70  Main (left) crane swings vessel toward vertical
    0.70–1.00  Vessel fully vertical, label visible, text solid
  */
  function apply(p) {
    // --- Phase weights ---
    var phaseHold = clamp(1 - p / 0.25, 0, 1); // early
    var phaseRelease = smooth(clamp((p - 0.22) / 0.28, 0, 1));
    var phaseRotate = smooth(clamp((p - 0.42) / 0.35, 0, 1));
    var phaseDone = smooth(clamp((p - 0.72) / 0.25, 0, 1));

    // Vessel: starts horizontal center, rotates to vertical
    var vRot = lerp(0, -90, phaseRotate); // degrees
    var vX = lerp(200, 160, phaseRotate);
    var vY = lerp(200, 160, phaseRotate);
    var vScale = lerp(1, 0.92, phaseRotate);
    if (vessel) {
      vessel.setAttribute('transform',
        'translate(' + vX + ',' + vY + ') rotate(' + vRot.toFixed(1) + ') scale(' + vScale.toFixed(3) + ')');
    }

    // Left crane (main) — stays, slight boom adjust
    var boomL = lerp(0, -12, phaseRotate);
    if (craneL) {
      craneL.setAttribute('transform', 'translate(40, 40) rotate(' + boomL.toFixed(1) + ' 60 120)');
    }

    // Right crane — slides off to the right and fades
    var rX = lerp(0, 180, phaseRelease);
    var rOp = lerp(1, 0, phaseRelease);
    if (craneR) {
      craneR.setAttribute('transform', 'translate(' + (280 + rX).toFixed(1) + ', 40)');
      craneR.style.opacity = String(rOp);
    }

    // Ropes — left stays connected, right disconnects
    if (ropeR) ropeR.style.opacity = String(lerp(1, 0, phaseRelease));
    if (hookR) hookR.style.opacity = String(lerp(1, 0, phaseRelease));

    // Label on vessel
    if (label) {
      label.style.opacity = String(lerp(0.3, 1, phaseDone));
    }

    // Hero text fade in near end
    if (heroText) {
      var tOp = lerp(0.15, 1, phaseDone);
      heroText.style.opacity = String(tOp);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
  requestAnimationFrame(loop);
})();
