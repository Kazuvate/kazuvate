/* ============================================================
   kazuvate | Haupt
   Eigenes Skript, keine Bibliothek, kein fremder Server. Die
   Aussage "keine fremden Skripte" bleibt damit unberuehrt.

   Aufgabe: den Umfang des Kachelrahmens messen. Mehr nicht.
   Gezeichnet wird per CSS-Transition.

   Alles hier ist Zugabe. Faellt das Skript aus, bleibt die Seite
   vollstaendig lesbar: der Rahmen ist dann einfach nicht da, die
   Karten funktionieren unveraendert.
   ============================================================ */
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
