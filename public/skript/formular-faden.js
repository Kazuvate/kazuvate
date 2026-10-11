/* ============================================================
   kazuvate | Faden im Formular
   Seit 11.10.2026, nur auf den drei Kontaktseiten geladen.

   Links neben den Feldern laeuft eine blasse Linie vom ersten Feld
   bis zum Absenden-Knopf. Mit jedem Pflichtfeld, das ausgefuellt und
   gueltig ist, zieht sie sich ein Viertel weiter, beim letzten
   erreicht sie den Knopf. Dieselbe Bildsprache wie der Faden auf der
   Startseite und der Strang auf ablauf.html: eine Linie, die
   entsteht -- hier nicht beim Scrollen, sondern beim Ausfuellen.

   Reiner Zustand, reine Zierde: das Element ist aria-hidden, der
   Knopf bleibt immer aktiv, die Pruefung beim Absenden macht weiter
   der Browser (required, type=email). Ohne Skript gibt es die Linie
   nicht, das Formular ist unveraendert.

   Gleiche Schritte statt Schritte bis zum jeweiligen Feld: Vorname
   und Name stehen ab 1120px nebeneinander, die Linie stuende dort
   nach dem zweiten Feld still. So bewegt sie sich bei jedem Feld.
   ============================================================ */
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

  // Von der Oberkante des ersten Felds bis zur Mitte des Knopfs. Neu
  // gemessen, sobald sich die Karte veraendert: Umbruch bei anderer
  // Breite, die Fehlermeldung nach einem gescheiterten Versand oder
  // ein von Hand groesser gezogenes Nachrichtenfeld.
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
  // Zuruecksetzen leert die Felder ohne input-Ereignis.
  formular.addEventListener('reset', function () { window.setTimeout(zeichnen, 0); });

  if ('ResizeObserver' in window) new ResizeObserver(messen).observe(karte);
  window.addEventListener('resize', messen);

  messen();
  zeichnen();
  // Beim Zurueckblaettern fuellt der Browser die Felder wieder aus.
  window.addEventListener('pageshow', zeichnen);
})();
