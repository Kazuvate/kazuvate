/* ============================================================
   kazuvate | Haupt
   Eigenes Skript, keine Bibliothek, kein fremder Server. Die
   Aussage "keine fremden Skripte" bleibt damit unberuehrt.

   Vier Aufgaben, jede in einem eigenen Block, damit die eine
   nicht die andere mitreisst:
   1. Kopf: Klasse setzen, sobald gescrollt wird.
   2. Menue: die Schublade auf dem Handy oeffnen und schliessen.
   3. Zeichen: die Strichlaengen der Leistungs-Symbole messen.
   4. Kacheln: den Umfang des Rahmens messen.
   5. Formular: Zeitstempel gegen Spam setzen, Fehlermeldung nach
      einem gescheiterten Versand einblenden. Nur auf kontakt.html.

   Bis zum 20.08.2026 gab es an dieser Stelle einen fuenften Block:
   Bloecke, die beim Scrollen ins Bild kommen, blendeten sich
   einmalig nacheinander ein. Kasum wollte das nicht mehr — genau
   dieses "man scrollt runter und Dinge tauchen auf" ist fuer ihn
   das Erkennungszeichen von Vibe-Coding-Seiten. Der Block ist
   ersatzlos raus, keine IntersectionObserver mehr in dieser Datei.

   **Der Faden neben "Wer wir sind" ist seit dem 20.08.2026 kein
   Vanilla-Block mehr.** Erste Fassung war Vanilla-CSS/JS wie der
   Rest dieser Datei, Kasum wollte danach ausdruecklich die echte
   React-Komponente aus seiner Vorlage. Er lebt jetzt als eigene
   React-Insel in `faden/`, kompiliert nach `skript/faden/faden.js`
   und `.css`, in `index.html` per eigenem `<script type="module">`
   eingebunden. Siehe `faden/README.md` und den README-Abschnitt
   "Faden" fuer Aufbau und Begruendung.

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

  // Beschriftung in der Sprache der Seite, seit 25.09.2026. Das
  // Startlabel steht ohnehin im HTML; hier kommt nur der Wechsel
  // dazu. Unbekannte Sprache faellt auf Deutsch zurueck.
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

      // Nur die Laenge weitergeben, Strichmuster und Versatz setzt das
      // CSS daraus. Bis zum 21.08.2026 schrieb dieser Block beides
      // direkt als Inline-Stil -- der schlaegt jede Stylesheet-Regel,
      // weshalb im CSS ein !important stehen musste, und !important
      // schlaegt wiederum jede @keyframes-Animation. Damit war jede
      // weitere Bewegung an diesen Formen blockiert. Ueber eine
      // Custom Property greift die normale Kaskade, und das Zeichen
      // kann sich beim Zeigen ein zweites Mal schreiben.
      form.style.setProperty('--laenge', laenge + 'px');
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

/* Hier lag bis zum 02.09.2026 der Messblock fuer den Kachelrahmen:
   ein SVG-Rechteck ueber jeder Kachel, dessen Umriss beim Zeigen
   einmal herumgezeichnet wurde. Die Umfangslaenge musste JavaScript
   liefern, weil CSS die Pixelmasse eines Elements nicht kennt, dazu
   kam ein ResizeObserver, der nach jeder Breitenaenderung neu mass.

   Mit dem Umbau der Sektion "Warum kazuvate" auf drei Register
   (Label, Aussage, Erklaerung, getrennt durch Haarlinien) gibt es
   keine Karte mehr, ueber der ein Rahmen liegen koennte. Der Block
   ist damit ersatzlos raus, zusammen mit .rahmen und den vier
   .kachel-Regeln in stil/basis.css und den drei <svg class="rahmen">
   in index.html.

   Das ist die Lehre vom 31.08.2026 angewandt: als der Globus ging,
   ueberlebte sein Token --olive-hell noch zwei Wochen, weil niemand
   beim Loeschen des Bauteils nachgesehen hat, was nur dafuer
   existierte. Hier ist gleich mitgegangen, was nur hier hing. */

/* --- Formular --------------------------------------------------
   Zwei Dinge fuers Kontaktformular auf kontakt.html, beide im
   Datenschutz-Abschnitt "Kontaktformular" angekuendigt: ein
   Zeitstempel gegen Bots, die ein Formular in Millisekunden statt
   in Sekunden ausfuellen (api/kontakt.js prueft ihn), und das
   Einblenden der Fehlermeldung nach einem gescheiterten Versand.

   Beide Elemente gibt es nur auf kontakt.html, deshalb die fruehen
   Ausstiege -- auf jeder anderen Seite endet der Block sofort.
   ------------------------------------------------------------ */
(function () {
  'use strict';

  var zeit = document.getElementById('kontakt-zeit');
  if (zeit) zeit.value = Date.now();

  var fehler = document.getElementById('formular-fehler');
  if (!fehler) return;

  var art = new URLSearchParams(window.location.search).get('fehler');
  if (!art) return;

  fehler.hidden = false;

  // Die Adresse wieder sauber machen: ohne das bliebe ?fehler=...
  // in der URL stehen, und ein Neuladen der Seite wuerde die
  // Meldung erneut zeigen, obwohl langst nichts mehr fehlgeschlagen
  // ist.
  var url = new URL(window.location.href);
  url.searchParams.delete('fehler');
  window.history.replaceState(null, '', url.pathname + url.hash);
})();

