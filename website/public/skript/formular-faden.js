// Faden im Kontaktformular: zieht sich mit jedem gueltigen Pflichtfeld weiter. Reine Zierde (aria-hidden), der Knopf bleibt aktiv.
(function () {
  'use strict';

  var karte = document.querySelector('.anfrage-karte');
  var formular = karte && karte.querySelector('.formular');
  if (!formular) return;

  var felder = Array.prototype.slice.call(
    formular.querySelectorAll('input[required], textarea[required]')
  );
  var knopf = formular.querySelector('button[type="submit"]');
  if (!felder.length || !knopf) return;

  var faden = document.createElement('div');
  faden.className = 'formular-faden';
  faden.setAttribute('aria-hidden', 'true');
  var fuellung = document.createElement('span');
  fuellung.className = 'formular-faden-fuellung';
  faden.appendChild(fuellung);
  karte.appendChild(faden);

  function erledigt(feld) {
    return feld.value.trim() !== '' && feld.validity.valid;
  }

  function zeichnen() {
    var anzahl = felder.filter(erledigt).length;
    faden.style.setProperty('--anteil', String(anzahl / felder.length));
    faden.classList.toggle('ist-fertig', anzahl === felder.length);
  }

  function messen() {
    var oben = karte.getBoundingClientRect().top;
    var erstes = felder[0].closest('.feld') || felder[0];
    var start = erstes.getBoundingClientRect().top - oben;
    var k = knopf.getBoundingClientRect();
    var ende = k.top + k.height / 2 - oben;
    faden.style.top = start + 'px';
    faden.style.height = Math.max(0, ende - start) + 'px';
  }

  formular.addEventListener('input', zeichnen);
  formular.addEventListener('reset', function () { window.setTimeout(zeichnen, 0); });

  if ('ResizeObserver' in window) new ResizeObserver(messen).observe(karte);
  window.addEventListener('resize', messen);

  messen();
  zeichnen();
  window.addEventListener('pageshow', zeichnen);
})();
