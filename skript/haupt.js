/* ============================================================
   kazuvate | Haupt
   Eigenes Skript, keine Bibliothek, kein fremder Server. Die
   Aussage "keine fremden Skripte" bleibt damit unberuehrt.

   Fuenf Aufgaben, jede in einem eigenen Block, damit die eine
   nicht die andere mitreisst:
   1. Kopf: Klasse setzen, sobald gescrollt wird.
   2. Menue: die Schublade auf dem Handy oeffnen und schliessen.
   3. Auftritt: Klasse setzen, sobald ein Block ins Bild kommt.
   4. Zeichen: die Strichlaengen der Leistungs-Symbole messen.
   5. Kacheln: den Umfang des Rahmens messen.

   Alles hier ist Zugabe. Faellt das Skript aus, bleibt die Seite
   vollstaendig lesbar und bedienbar: die Klasse `js` am
   Wurzelelement fehlt dann, und ohne sie greift keine der Regeln,
   die etwas versteckt. Die Navigation steht wieder als Zeile im
   Kopf, alle Bloecke stehen sichtbar da.

   Die Klasse `js` setzt eine einzige Zeile im Kopf jeder Seite,
   nicht diese Datei: die laedt mit defer und kaeme zu spaet. Die
   Bloecke waeren dann einen Wimpernschlag sichtbar, bevor sie
   sich verstecken, und das sieht nach Fehler aus.
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

/* --- Menue --------------------------------------------------
   Unter 860px liegt die Navigation in einer Schublade unter dem
   Kopf. Fuenf Punkte passen dort nicht mehr nebeneinander, ohne
   dass Kontakt aus dem Bild laeuft.

   Der Knopf traegt aria-expanded, damit ein Screenreader den
   Zustand ansagt. Sichtbar gemacht wird die Schublade per CSS,
   hier faellt nur die Entscheidung offen oder zu.
   ------------------------------------------------------------ */
(function () {
  'use strict';

  var knopf = document.querySelector('.menue-knopf');
  var kopf = document.querySelector('.kopf');
  if (!knopf || !kopf) return;

  function setzen(offen) {
    knopf.setAttribute('aria-expanded', offen ? 'true' : 'false');
    knopf.setAttribute('aria-label', offen ? 'Menü schliessen' : 'Menü öffnen');
    kopf.classList.toggle('menue-offen', offen);
  }

  knopf.addEventListener('click', function () {
    setzen(knopf.getAttribute('aria-expanded') !== 'true');
  });

  // Ein Klick auf einen Punkt schliesst die Schublade. Ohne das
  // bleibt sie bei einem Sprung auf einen Anker offen stehen und
  // verdeckt genau die Stelle, zu der gesprungen wurde.
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

  // Wird das Fenster breit, verschwindet die Schublade per CSS.
  // Der Zustand muss mit, sonst kommt sie beim Verkleinern offen
  // zurueck.
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 860) setzen(false);
  });
})();

/* --- Auftritt -----------------------------------------------
   Bloecke mit der Klasse .auftritt stehen leicht versetzt und
   durchsichtig da, bis sie ins Bild kommen. Dann setzt der
   Beobachter .sichtbar und CSS blendet sie ein.

   Bewusst nur einmal: einmal gesehen, bleibt sichtbar. Ein Block,
   der beim Zurueckscrollen wieder verschwindet, wirkt wie ein
   Fehler, nicht wie eine Absicht.
   ------------------------------------------------------------ */
(function () {
  'use strict';

  var bloecke = document.querySelectorAll('.auftritt');
  if (!bloecke.length) return;

  function zeigen(element) {
    element.classList.add('sichtbar');
  }

  // Aeltere Browser ohne IntersectionObserver bekommen alles
  // sofort zu sehen. Lieber ohne Effekt als ohne Inhalt.
  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(bloecke, zeigen);
    return;
  }

  var beobachter = new IntersectionObserver(function (eintraege, selbst) {
    eintraege.forEach(function (eintrag) {
      if (!eintrag.isIntersecting) return;
      zeigen(eintrag.target);
      selbst.unobserve(eintrag.target);
    });
  }, {
    // Erst ausloesen, wenn der Block ein Stueck weit im Bild ist,
    // sonst ist die Bewegung am unteren Rand schon vorbei, bevor
    // man hinschaut.
    rootMargin: '0px 0px -12% 0px'
  });

  Array.prototype.forEach.call(bloecke, function (block) {
    beobachter.observe(block);
  });
})();

/* --- Zeichen ------------------------------------------------
   Die drei Symbole bei den Leistungen zeichnen sich selbst, wenn
   ihre Spalte ins Bild kommt: dieselbe Technik wie beim
   Kachelrahmen weiter unten. Jede Form wird zur gestrichelten
   Linie, deren Luecke so lang ist wie die Form selbst, und der
   Versatz wandert per CSS auf null.

   Die Laengen muss JavaScript liefern, CSS kennt sie nicht.
   ------------------------------------------------------------ */
(function () {
  'use strict';

  var zeichen = document.querySelectorAll('.leistung-zeichen');
  if (!zeichen.length) return;

  Array.prototype.forEach.call(zeichen, function (svg) {
    var formen = svg.querySelectorAll('rect, line, circle, path, polyline');

    Array.prototype.forEach.call(formen, function (form) {
      // Der gefuellte Punkt im Fensterbalken hat keine Kontur,
      // an ihm gibt es nichts zu zeichnen.
      if (form.classList.contains('punkt')) return;
      if (typeof form.getTotalLength !== 'function') return;

      var laenge = form.getTotalLength();
      if (!laenge) return;

      form.style.strokeDasharray = laenge + 'px';
      form.style.strokeDashoffset = laenge + 'px';
    });

    // Erst jetzt die Transition zulassen, sonst zeichnet sich das
    // Symbol beim Laden einmal sichtbar rueckwaerts weg.
    void svg.getBoundingClientRect().width;
    svg.classList.add('bereit');
  });
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
