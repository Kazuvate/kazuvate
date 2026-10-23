/* ============================================================
   kazuvate | Mitlaufende Uebersicht
   Seit 11.10.2026, nur auf den drei Datenschutz-Seiten geladen.

   Ab 1000px steht die Uebersicht rechts neben dem Text und laeuft mit
   (position: sticky in stil/seiten.css). Dieses Skript sagt ihr, in
   welchem Abschnitt der Leser gerade ist: der Link dazu bekommt
   aria-current und damit den Textmarker-Balken. Reiner Zustand,
   nichts blendet ein, nichts scrollt von selbst.

   Ermittelt ueber IntersectionObserver: er meldet sich, sobald ein
   Block des Texts das Leseband unter dem mitlaufenden Kopf betritt
   oder verlaesst. Erst dann wird nachgesehen, welche
   Abschnittsueberschrift zuletzt ueber der Leselinie liegt. Kein
   scroll-Ereignis, keine Rechnung pro Bildschirmbild.

   Unter 1000px steht die Uebersicht im Fluss oben im Text, dort ist
   sie beim Lesen nicht zu sehen. Das Skript haengt sich dann ab und
   nimmt jede Markierung wieder weg.

   Nichts davon wird gespeichert, weder Cookie noch Local Storage --
   die Seite, auf der das laeuft, verspricht genau das.
   ============================================================ */
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
  // Unterkante des mitlaufenden Kopfs plus Luft. Derselbe Wert wie
  // scroll-padding-top in basis.css: wer ueber die Uebersicht springt,
  // landet mit der Ueberschrift genau auf dieser Linie.
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
    // Ganz unten erreichen die letzten, kurzen Abschnitte die Linie
    // nie. Ist das Textende im Bild, gilt der letzte Abschnitt.
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
    // Beobachtet wird jeder Block des Texts, nicht nur die
    // Ueberschriften. Springt die Seite, statt zu gleiten -- bei
    // reduzierter Bewegung, ueber einen Anker, mit Ende oder Bild ab --,
    // landet eine Ueberschrift von unterhalb der Leselinie direkt
    // darueber, ohne je darin gewesen zu sein, und der Beobachter
    // schweigt. Irgendein Absatz liegt nach dem Sprung aber immer neu
    // auf der Linie und meldet sich. Nachgemessen am 11.10.2026 in
    // Chromium mit emulierter reduzierter Bewegung: vorher blieb die
    // Markierung nach einem Sprung auf 2000px leer.
    Array.prototype.forEach.call(lauf.children, function (block) {
      beobachter.observe(block);
    });
    // Das Textende meldet ueber das ganze Fenster, nicht ueber die
    // Leselinie, wann der Boden erreicht ist.
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
