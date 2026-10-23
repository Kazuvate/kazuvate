// Mitlaufende Uebersicht der Datenschutz-Seiten: markiert den Abschnitt im Lesebereich per aria-current.
(function () {
  'use strict';

  var nav = document.querySelector('.lauf-raster .uebersicht');
  var lauf = document.querySelector('.lauf-raster .lauf');
  if (!nav || !lauf || !('IntersectionObserver' in window)) return;

  var paare = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'))
    .map(function (a) {
      return { link: a, ziel: document.getElementById(decodeURIComponent(a.hash.slice(1))) };
    })
    .filter(function (p) { return p.ziel; });
  if (!paare.length) return;

  var breit = window.matchMedia('(min-width: 1000px)');
  var KOPF = 86;
  var aktiv = null;
  var beobachter = null;
  var endeBeobachter = null;

  function setzen(paar) {
    if (paar === aktiv) return;
    if (aktiv) aktiv.link.removeAttribute('aria-current');
    aktiv = paar;
    if (paar) paar.link.setAttribute('aria-current', 'true');
  }

  function bestimmen() {
    var linie = KOPF + window.innerHeight * 0.2;
    var gefunden = null;
    paare.forEach(function (p) {
      if (p.ziel.getBoundingClientRect().top <= linie) gefunden = p;
    });
    if (lauf.getBoundingClientRect().bottom <= window.innerHeight) {
      gefunden = paare[paare.length - 1];
    }
    setzen(gefunden);
  }

  function starten() {
    if (beobachter) return;
    beobachter = new IntersectionObserver(bestimmen, {
      rootMargin: '-' + KOPF + 'px 0px -60% 0px'
    });
    Array.prototype.forEach.call(lauf.children, function (block) {
      beobachter.observe(block);
    });
    if (lauf.lastElementChild) {
      endeBeobachter = new IntersectionObserver(bestimmen);
      endeBeobachter.observe(lauf.lastElementChild);
    }
    bestimmen();
  }

  function stoppen() {
    if (beobachter) { beobachter.disconnect(); beobachter = null; }
    if (endeBeobachter) { endeBeobachter.disconnect(); endeBeobachter = null; }
    setzen(null);
  }

  function pruefen() {
    if (breit.matches) starten();
    else stoppen();
  }

  if (breit.addEventListener) breit.addEventListener('change', pruefen);
  else if (breit.addListener) breit.addListener(pruefen);
  pruefen();
})();
