/* ============================================================
   kazuvate | Haupt
   Eigenes Skript, keine Bibliothek, kein fremder Server. Die
   Aussage "keine fremden Skripte" bleibt damit unberuehrt.

   Zwei Aufgaben, jede in einem eigenen Block, damit die eine
   nicht die andere mitreisst:
   1. Kopf: Klasse setzen, sobald gescrollt wird.
   2. Kacheln: den Umfang des Rahmens messen.

   Alles hier ist Zugabe. Faellt das Skript aus, bleibt die Seite
   vollstaendig lesbar: der Kopf laeuft weiter mit und behaelt
   seinen Schriftzug, der Kachelrahmen ist einfach nicht da.
   ============================================================ */

/* --- Kopf ---------------------------------------------------
   Der Kopf klebt per CSS oben fest. Sobald die Seite ein Stueck
   gescrollt ist, bekommt er die Klasse .gescrollt: der Schriftzug
   "kazuvate" faehrt weg, das Zeichen bleibt an Ort und Stelle,
   der Balken wird flacher. Den Uebergang zeichnet CSS, hier faellt
   nur die Entscheidung wann.
   ------------------------------------------------------------ */
(function () {
  'use strict';

  var kopf = document.querySelector('.kopf');
  if (!kopf) return;

  // Erst ab einem klaren Stueck Weg, sonst flackert die Klasse
  // bei jedem Wackeln am Seitenanfang hin und her.
  var schwelle = 40;

  function pruefen() {
    // toggle mit zweitem Argument setzt nur um, wenn sich der
    // Zustand wirklich aendert. Bei jedem anderen Scrollschritt
    // passiert damit gar nichts.
    kopf.classList.toggle('gescrollt', window.scrollY > schwelle);
  }

  // passive sagt dem Browser, dass hier nichts abgefangen wird,
  // damit muss er auf den Handler nicht warten und scrollt fluessig
  // weiter. Bewusst ohne requestAnimationFrame, wie beim
  // Kachelrahmen weiter unten: rAF feuert in einem Tab, der gerade
  // nicht gezeichnet wird, gar nicht, und der Kopf bliebe dann im
  // falschen Zustand stehen.
  window.addEventListener('scroll', pruefen, { passive: true });

  // Beim Laden mitten auf der Seite, etwa nach einem Sprung auf
  // einen Anker oder beim Zurueckblaettern, ist schon gescrollt.
  pruefen();
})();

/* --- Kacheln ------------------------------------------------ */
(function () {
  'use strict';

  var kacheln = document.querySelectorAll('.kachel');
  if (!kacheln.length) return;

  /* Ein SVG-Rechteck liegt ueber der Kachel. Sein Umriss wird als
     gestrichelte Linie gezeichnet, deren Luecke genau so lang ist
     wie der Umriss selbst: dadurch ist sie unsichtbar. Beim Hover
     wandert der Versatz auf null und die Linie laeuft von oben
     links einmal herum.

     Die Laenge muss JavaScript liefern, weil CSS die Pixelmasse
     eines Elements nicht kennt. */
  function rahmenMessen(kachel) {
    var rechteck = kachel.querySelector('.rahmen rect');
    if (!rechteck) return;

    var breite = kachel.offsetWidth;
    var hoehe = kachel.offsetHeight;
    if (!breite || !hoehe) return;

    // Ein Pixel Rand, damit die Linie nicht halb abgeschnitten wird
    rechteck.setAttribute('x', 1);
    rechteck.setAttribute('y', 1);
    rechteck.setAttribute('width', breite - 2);
    rechteck.setAttribute('height', hoehe - 2);

    // Einheit muss mit: CSS verwirft eine einheitenlose Zahl bei
    // stroke-dashoffset und faellt auf 0 zurueck, der Rahmen waere
    // dann dauerhaft sichtbar statt gezeichnet.
    kachel.style.setProperty('--umfang', rechteck.getTotalLength() + 'px');
  }

  Array.prototype.forEach.call(kacheln, function (kachel) {
    rahmenMessen(kachel);
  });

  // Layout einmal erzwingen: damit ist der Ausgangswert des Rahmens
  // festgeschrieben, bevor die Transition dazukommt, und das Setzen
  // selbst wird nicht animiert.
  // Bewusst kein requestAnimationFrame: das feuert in einem Tab, der
  // gerade nicht gezeichnet wird, gar nicht, und die Klasse bliebe
  // dauerhaft aus.
  void document.documentElement.offsetHeight;

  Array.prototype.forEach.call(kacheln, function (kachel) {
    kachel.classList.add('bereit');
  });

  // Nach einer Drehung des Geraets oder einer Breitenaenderung passt
  // der alte Umriss nicht mehr, also neu messen.
  if (window.ResizeObserver) {
    var beobachter = new ResizeObserver(function (eintraege) {
      eintraege.forEach(function (eintrag) {
        rahmenMessen(eintrag.target);
      });
    });
    Array.prototype.forEach.call(kacheln, function (kachel) {
      beobachter.observe(kachel);
    });
  }
})();
