// Eigenes Skript fuer alle Seiten: Menue, mitlaufender Kopf, Sprachwahl, Zeitstempel des Formulars.
// Faellt es aus, bleibt die Seite lesbar und bedienbar: ohne die Klasse js greift keine Regel, die etwas versteckt.

(function () {
  'use strict';

  var kopf = document.querySelector('.kopf');
  if (!kopf) return;

  var schwelle = 40;

  function pruefen() {
    kopf.classList.toggle('gescrollt', window.scrollY > schwelle);
  }

  window.addEventListener('scroll', pruefen, { passive: true });

  pruefen();
})();

(function () {
  'use strict';

  var knopf = document.querySelector('.menue-knopf');
  var kopf = document.querySelector('.kopf');
  if (!knopf || !kopf) return;

  var texte = {
    de: ['Menü öffnen', 'Menü schliessen'],
    en: ['Open menu', 'Close menu'],
    fr: ['Ouvrir le menu', 'Fermer le menu']
  }[document.documentElement.lang.slice(0, 2)] || ['Menü öffnen', 'Menü schliessen'];

  function setzen(offen) {
    knopf.setAttribute('aria-expanded', offen ? 'true' : 'false');
    knopf.setAttribute('aria-label', offen ? texte[1] : texte[0]);
    kopf.classList.toggle('menue-offen', offen);
  }

  knopf.addEventListener('click', function () {
    setzen(knopf.getAttribute('aria-expanded') !== 'true');
  });

  var menue = document.querySelector('.navigation');
  if (menue) {
    menue.addEventListener('click', function (ereignis) {
      if (ereignis.target.closest('a')) setzen(false);
    });
  }

  document.addEventListener('keydown', function (ereignis) {
    if (ereignis.key !== 'Escape') return;
    if (knopf.getAttribute('aria-expanded') !== 'true') return;
    setzen(false);
    knopf.focus();   // sonst haengt der Fokus in der geschlossenen Schublade
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 860) setzen(false);
  });
})();

(function () {
  'use strict';
  var auswahl = document.querySelector('.sprachen details');
  if (!auswahl) return;

  document.addEventListener('click', function (ereignis) {
    if (auswahl.open && !auswahl.contains(ereignis.target)) auswahl.open = false;
  });

  document.addEventListener('keydown', function (ereignis) {
    if (ereignis.key !== 'Escape' || !auswahl.open) return;
    auswahl.open = false;
    auswahl.querySelector('summary').focus();
  });
})();

(function () {
  'use strict';

  var zeichen = document.querySelectorAll('.leistung-zeichen');
  if (!zeichen.length) return;

  Array.prototype.forEach.call(zeichen, function (svg) {
    var formen = svg.querySelectorAll('rect, line, circle, path, polyline');

    Array.prototype.forEach.call(formen, function (form) {
      if (form.classList.contains('punkt')) return;
      if (typeof form.getTotalLength !== 'function') return;

      var laenge = form.getTotalLength();
      if (!laenge) return;

      form.style.setProperty('--laenge', laenge + 'px');
    });

    svg.classList.add('bereit');
  });

  void document.documentElement.offsetHeight;

  window.requestAnimationFrame(function () {
    Array.prototype.forEach.call(zeichen, function (svg) {
      svg.classList.add('gezeichnet');
    });
  });
})();

(function () {
  'use strict';

  var zeit = document.getElementById('kontakt-zeit');
  if (zeit) zeit.value = Date.now();

  var fehler = document.getElementById('formular-fehler');
  if (!fehler) return;

  var art = new URLSearchParams(window.location.search).get('fehler');
  if (!art) return;

  fehler.hidden = false;

  fehler.setAttribute('tabindex', '-1');
  fehler.focus();

  var url = new URL(window.location.href);
  url.searchParams.delete('fehler');
  window.history.replaceState(null, '', url.pathname + url.hash);
})();
