// Muster: die helle Platte unter jedem Zeichen laeuft dem Zeiger nach. Bei reduzierter Bewegung passiert nichts.
(function () {
  'use strict';

  var weniger = window.matchMedia('(prefers-reduced-motion: reduce)');
  var felder = document.querySelectorAll('.iso-leistungen > li');

  Array.prototype.forEach.call(felder, function (feld) {
    var zeichen = feld.querySelector('.iso-zeichen');
    if (!zeichen) return;

    function folgen(ereignis) {
      if (weniger.matches) return;
      var r = zeichen.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var x = (ereignis.clientX - (r.left + r.width / 2)) / (r.width / 2);
      var y = (ereignis.clientY - (r.top + r.height / 2)) / (r.height / 2);
      x = Math.max(-1, Math.min(1, x));
      y = Math.max(-1, Math.min(1, y));
      zeichen.style.setProperty('--px', (x * 14).toFixed(1) + 'px');
      zeichen.style.setProperty('--py', (y * 9).toFixed(1) + 'px');
    }

    function zurueck() {
      zeichen.style.removeProperty('--px');
      zeichen.style.removeProperty('--py');
    }

    feld.addEventListener('pointermove', function (ereignis) {
      if (ereignis.pointerType === 'touch' && !ereignis.isPrimary) return;
      folgen(ereignis);
    });
    feld.addEventListener('pointerdown', folgen);
    feld.addEventListener('pointerleave', zurueck);
    feld.addEventListener('pointerup', function (ereignis) {
      if (ereignis.pointerType !== 'mouse') zurueck();
    });
    feld.addEventListener('pointercancel', zurueck);
  });
})();
