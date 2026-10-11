/* ============================================================
   kazuvate | Der gerissene Faden
   Seit 11.10.2026, nur auf 404.html geladen.

   Die Linie endet lose. Wer das Ende greift (Maus, Stift oder
   Finger), zieht es mit; laesst er es am Ring "Zur Startseite" los,
   knuepft es dort an und die Startseite oeffnet sich. Anderswo
   losgelassen, faellt es zurueck an seinen Platz.

   Mit der Tastatur gibt es nichts zu ziehen. Dafuer knuepft sich der
   Faden an, sobald der Link den Fokus hat, und loest sich wieder,
   wenn er ihn verliert -- dieselbe Antwort, ohne die Seite zu
   wechseln. Gefolgt wird dem Link dann ganz gewoehnlich mit Enter.

   Ohne dieses Skript steht der Faden fertig gezeichnet da und der
   Link funktioniert wie jeder andere.
   ============================================================ */
(function () {
  'use strict';

  var riss = document.querySelector('.riss');
  if (!riss) return;

  var svg = riss.querySelector('.riss-faden');
  var linie = riss.querySelector('.riss-linie');
  var fasern = riss.querySelector('.riss-fasern');
  var griff = riss.querySelector('.riss-griff');
  var ziel = riss.querySelector('.riss-ziel');
  var ring = riss.querySelector('.riss-ring');
  if (!svg || !linie || !fasern || !griff || !ziel || !ring) return;

  var weniger = window.matchMedia('(prefers-reduced-motion: reduce)');

  var breite = 0, hoehe = 0;
  var start, ruhe, anschluss, mitte, radius;
  var ende = null;
  var zieht = false, nah = false, verbunden = false, unterwegs = 0;

  function gerundet(n) { return Math.round(n * 10) / 10; }

  // Alles in echten Pixeln: die viewBox bekommt die Masse des
  // Elements, eine Einheit ist damit ein Pixel und das Ende sitzt
  // genau unter dem Zeiger, egal wie breit die Seite ist.
  function messen() {
    var r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return;
    breite = r.width;
    hoehe = r.height;
    svg.setAttribute('viewBox', '0 0 ' + breite + ' ' + hoehe);

    var k = ring.getBoundingClientRect();
    radius = k.width / 2;
    mitte = { x: k.left - r.left + radius, y: k.top - r.top + radius };
    anschluss = { x: mitte.x - radius, y: mitte.y };
    start = { x: 0, y: hoehe * 0.5 };
    // Das Ende liegt gut vor dem Ring, auf schmalen Schirmen naeher
    // am Anfang, damit zwischen beiden sichtbar Luft bleibt.
    ruhe = { x: Math.min(breite * 0.42, anschluss.x - 64), y: hoehe * 0.62 };
    if (!zieht && !unterwegs) ende = verbunden ? anschluss : ruhe;
    zeichnen();
  }

  function zeichnen() {
    var dx = ende.x - start.x;
    var c1 = { x: start.x + dx * 0.45, y: start.y };
    var c2 = { x: start.x + dx * 0.7, y: ende.y };
    linie.setAttribute('d',
      'M' + gerundet(start.x) + ' ' + gerundet(start.y) +
      ' C' + gerundet(c1.x) + ' ' + gerundet(c1.y) + ' ' +
      gerundet(c2.x) + ' ' + gerundet(c2.y) + ' ' +
      gerundet(ende.x) + ' ' + gerundet(ende.y));

    // Drei kurze Fasern in Laufrichtung: das ausgefranste Ende. Wer
    // angeknuepft hat, hat kein loses Ende mehr.
    if (verbunden) {
      fasern.setAttribute('d', '');
    } else {
      var winkel = Math.atan2(ende.y - c2.y, ende.x - c2.x);
      var d = '';
      [[-0.35, 11], [0.05, 13], [0.55, 9]].forEach(function (f) {
        d += 'M' + gerundet(ende.x) + ' ' + gerundet(ende.y) +
          ' l' + gerundet(Math.cos(winkel + f[0]) * f[1]) +
          ' ' + gerundet(Math.sin(winkel + f[0]) * f[1]) + ' ';
      });
      fasern.setAttribute('d', d);
    }

    griff.setAttribute('cx', gerundet(ende.x));
    griff.setAttribute('cy', gerundet(ende.y));
  }

  function setzeVerbunden(an) {
    verbunden = an;
    ziel.classList.toggle('ist-verbunden', an);
  }

  function setzeNah(an) {
    nah = an;
    ziel.classList.toggle('ist-nah', an);
  }

  // Zurueck an den Ruheplatz. Die Kurve ist ein starkes Ausrollen wie
  // --kurve in tokens.css, die Dauer --kurz. Bei reduzierter Bewegung
  // ohne Weg dazwischen.
  function zurueck() {
    var von = { x: ende.x, y: ende.y };
    if (weniger.matches) { ende = ruhe; zeichnen(); return; }
    var beginn = performance.now();
    var lauf = ++unterwegs;
    function schritt(jetzt) {
      if (lauf !== unterwegs || zieht) return;
      var t = Math.min(1, (jetzt - beginn) / 200);
      var k = 1 - Math.pow(1 - t, 4);
      ende = { x: von.x + (ruhe.x - von.x) * k, y: von.y + (ruhe.y - von.y) * k };
      zeichnen();
      if (t < 1) window.requestAnimationFrame(schritt);
      else unterwegs = 0;
    }
    window.requestAnimationFrame(schritt);
  }

  function ausZeiger(ereignis) {
    var r = svg.getBoundingClientRect();
    ende = {
      x: Math.min(breite, Math.max(0, ereignis.clientX - r.left)),
      y: Math.min(hoehe, Math.max(0, ereignis.clientY - r.top))
    };
    var abstand = Math.hypot(ende.x - mitte.x, ende.y - mitte.y);
    setzeNah(abstand < radius + 18);
    zeichnen();
  }

  griff.addEventListener('pointerdown', function (ereignis) {
    if (ereignis.button !== 0) return;
    ereignis.preventDefault();
    zieht = true;
    unterwegs = 0;
    setzeVerbunden(false);
    riss.classList.add('ist-gezogen');
    griff.setPointerCapture(ereignis.pointerId);
    ausZeiger(ereignis);
  });

  griff.addEventListener('pointermove', function (ereignis) {
    if (zieht) ausZeiger(ereignis);
  });

  function loslassen(abgebrochen) {
    if (!zieht) return;
    zieht = false;
    riss.classList.remove('ist-gezogen');
    if (nah && !abgebrochen) {
      setzeNah(false);
      setzeVerbunden(true);
      ende = anschluss;
      zeichnen();
      // Einen Augenblick angeknuepft stehen lassen, dann dem Link folgen.
      window.setTimeout(function () { window.location.href = ziel.href; }, 260);
    } else {
      setzeNah(false);
      zurueck();
    }
  }

  griff.addEventListener('pointerup', function () { loslassen(false); });
  griff.addEventListener('pointercancel', function () { loslassen(true); });

  ziel.addEventListener('focus', function () {
    if (zieht) return;
    unterwegs = 0;
    setzeVerbunden(true);
    ende = anschluss;
    zeichnen();
  });
  ziel.addEventListener('blur', function () {
    if (zieht) return;
    setzeVerbunden(false);
    ende = ruhe;
    zeichnen();
  });

  if ('ResizeObserver' in window) new ResizeObserver(messen).observe(riss);
  window.addEventListener('resize', messen);
  // Zurueckblaettern aus dem Cache: wieder als loses Ende beginnen.
  window.addEventListener('pageshow', function () {
    setzeVerbunden(false);
    ende = null;
    messen();
  });

  riss.classList.add('ist-bereit');
  messen();
})();
