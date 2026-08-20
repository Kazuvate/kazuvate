/* ============================================================
   kazuvate | Haupt
   Eigenes Skript, keine Bibliothek, kein fremder Server. Die
   Aussage "keine fremden Skripte" bleibt damit unberuehrt.

   Fuenf Aufgaben, jede in einem eigenen Block, damit die eine
   nicht die andere mitreisst:
   1. Kopf: Klasse setzen, sobald gescrollt wird.
   2. Menue: die Schublade auf dem Handy oeffnen und schliessen.
   3. Faden: der Strich neben "Wer wir sind" folgt dem Scrollen.
   4. Zeichen: die Strichlaengen der Leistungs-Symbole messen.
   5. Kacheln: den Umfang des Rahmens messen.

   Bis zum 20.08.2026 gab es an dieser Stelle einen anderen Block:
   Bloecke, die beim Scrollen ins Bild kommen, blendeten sich
   einmalig nacheinander ein. Kasum wollte das nicht mehr — genau
   dieses "man scrollt runter und Dinge tauchen auf" ist fuer ihn
   das Erkennungszeichen von Vibe-Coding-Seiten. Der Block ist
   ersatzlos raus, keine IntersectionObserver mehr in dieser Datei.

   Der Faden weiter unten ist etwas anderes: keine einmalige
   Reaktion auf "im Bild angekommen", sondern eine durchgehende
   Kopplung an die Scrollposition selbst, die sich staendig
   veraendert, waehrend man liest. Kasum hat das am 20.08.2026
   ausdruecklich so angefragt, als Ersatz fuer eine urspruenglich
   mit Framer Motion/React gebaute Vorlage.

   Alles hier ist Zugabe. Faellt das Skript aus, bleibt die Seite
   vollstaendig lesbar und bedienbar: die Klasse `js` am
   Wurzelelement fehlt dann, und ohne sie greift keine der Regeln,
   die etwas versteckt. Die Navigation steht wieder als Zeile im
   Kopf.

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

/* --- Faden ----------------------------------------------------
   Der Faden neben den drei Ueber-uns-Bloecken zeichnet sich weiter,
   waehrend man durch den Bereich scrollt: halb gezeichnet, sobald
   "Wer wir sind" von unten ins Bild kommt, ganz gezeichnet, sobald
   "Mit wem wir arbeiten" oben aus dem Bild laeuft.

   `pathLength="1"` steht direkt auf dem <path> im HTML und normiert
   dessen geometrische Laenge auf 1. Dadurch reicht hier ein
   Anteilswert zwischen 0 und 1, kein gemessener Pixelwert wie beim
   Kachelrahmen weiter unten.
   ------------------------------------------------------------ */
(function () {
  'use strict';

  var pfad = document.querySelector('.hero-faden path');
  var bereich = document.querySelector('.hero-abschnitte');
  if (!pfad || !bereich) return;

  function fortschritt() {
    var rechteck = bereich.getBoundingClientRect();
    var vh = window.innerHeight;
    // 0, sobald die Oberkante des Bereichs von unten ins Bild
    // kommt; 1, sobald die Unterkante oben aus dem Bild laeuft.
    // Dieselbe Spanne wie ein Scroll-Ziel ohne eigene Grenzen in
    // Framer Motion (Standard dort: "start end" bis "end start").
    var wert = (vh - rechteck.top) / (vh + rechteck.height);
    return Math.min(1, Math.max(0, wert));
  }

  function zeichnen() {
    // Startet halb gezeichnet statt bei null: ein Faden, der schon
    // da ist und sich fortsetzt, nicht einer, der aus dem Nichts
    // entsteht.
    var gezeichneterAnteil = 0.5 + fortschritt() * 0.5;
    pfad.style.strokeDashoffset = String(1 - gezeichneterAnteil);
  }

  window.addEventListener('scroll', zeichnen, { passive: true });
  window.addEventListener('resize', zeichnen);

  // Beim Laden mitten auf der Seite ist schon ein Teil "gescrollt".
  zeichnen();
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

/* --- Zeichen ------------------------------------------------
   Die Leistungs-Symbole zeichnen sich einmal selbst, kurz nachdem
   die Seite geladen ist: nicht beim Scrollen, nur beim Laden.
   Jede Form wird zur gestrichelten Linie, deren Luecke so lang
   ist wie die Form selbst, und der Versatz wandert per CSS auf
   null. Die Laengen muss JavaScript liefern, CSS kennt sie nicht.
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

    svg.classList.add('bereit');
  });

  // Layout einmal erzwingen: damit ist der Ausgangswert (Luecke so
  // lang wie die Form) festgeschrieben, bevor die Transition auf
  // .bereit dazukommt. Ohne das wuerde das Zeichnen selbst zur
  // ersten, sichtbar rueckwaerts laufenden Transition.
  void document.documentElement.offsetHeight;

  // Einen Wimpernschlag spaeter tatsaechlich zeichnen. Bewusst kein
  // Scroll-Bezug: das Symbol erscheint dort, wo es auf der Seite
  // steht, egal ob das beim Laden im Bild ist oder nicht.
  window.requestAnimationFrame(function () {
    Array.prototype.forEach.call(zeichen, function (svg) {
      svg.classList.add('gezeichnet');
    });
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
