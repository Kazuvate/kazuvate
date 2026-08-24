/**
 * motive-aufbereiten.mjs
 *
 * Macht aus den vier Lottie-Export-SVGs in werkzeug/vorlagen/
 * Seitenmotive in medien/motive/, die zur Marke gehoeren und ins
 * Gewichtsbudget passen. Die Vorlagen liegen bewusst unter werkzeug/:
 * sie werden nie ausgeliefert, stehen in keiner Eingangsliste in
 * vite.config.ts und sind nur die Quelle fuer diesen Lauf.
 *
 * Warum ueberhaupt ein Skript und nicht von Hand:
 *
 * 1. FARBE. Die Vorlagen kommen in fremden Paletten -- Magenta, Pink,
 *    Marineblau, Orange. Die Regel "fremde Akzentfarbe waere fremde
 *    Marke" hat im Projekt schon dreimal entschieden (Ventriloc-Karten,
 *    Neongruen im Faden, Marineblau im Globus). Das Skript rechnet
 *    jede Vorlagenfarbe auf ihre Helligkeit um und legt sie auf die
 *    naechstgelegene Stufe der Markenleiter. Reihenfolge und Abstaende
 *    der Helligkeiten bleiben erhalten, das Bild behaelt also seine
 *    Tiefe -- nur der Buntton wird olivgruen.
 *
 * 2. GEWICHT. Lottie exportiert mit drei Nachkommastellen. Auf einem
 *    viewBox von 1000 Einheiten ist die dritte Stelle ein Tausendstel
 *    Prozent Bildbreite, also nichts. Runden auf eine Stelle halbiert
 *    die Datei ungefaehr.
 *
 * Die Markenleiter unten ist von Hand aus stil/tokens.css uebernommen.
 * Das ist die einzige Stelle im Projekt, an der Hex-Werte ausserhalb
 * von tokens.css stehen -- eine SVG-Datei, die per <img> eingebunden
 * wird, kennt keine CSS-Variablen der einbindenden Seite. Aendert sich
 * ein Token, muss die Leiter hier mit und das Skript einmal laufen.
 *
 *   node werkzeug/motive-aufbereiten.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUELLE = path.join(wurzel, "werkzeug", "vorlagen");
const ZIEL = path.join(wurzel, "medien", "motive");

/* --- Die Markenleiter, hell nach dunkel sortiert wird unten -----
   Werte aus stil/tokens.css, Stand 25.08.2026. --karte (#FFFFFF)
   ist bewusst nicht dabei: die Seite steht auf --grund, ein reines
   Weiss im Motiv waere ein sichtbarer heller Fleck darauf. */
const LEITER = [
  "#16190F", // --tinte
  "#222A10", // --flaeche-tief
  "#2C3616", // --flaeche
  "#3F5019", // --olive
  "#5E6650", // --still
  "#93AA5E", // --olive-hell
  "#C3CFA8", // --auf-flaeche-still
  "#DCDBD0", // --linie
  "#F5F4EF", // --grund
];

/* --- Welche Vorlage wird welches Motiv -------------------------
   Die Zuordnung steht hier und nicht im HTML, damit Dateiname und
   Verwendungszweck an einer Stelle zusammenstehen. */
const MOTIVE = [
  { quelle: "Website Design Animation.svg",        ziel: "handwerk.svg"     },
  { quelle: "Digital Marketing Lottie Animation.svg", ziel: "sichtbarkeit.svg" },
  { quelle: "Smartphones Applications.svg",        ziel: "rundum.svg"       },
  { quelle: "Ai based chatbot discuss.svg",        ziel: "gespraech.svg"    },
];

/* --- Helligkeit nach WCAG ------------------------------------- */
function kanal(v) {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function helligkeit(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
}

const leiterHell = LEITER.map(helligkeit);

/**
 * Legt die Farben einer Datei auf die Leiter.
 *
 * Nicht jede Farbe einzeln auf "die naechste Stufe": dann landen zwei
 * Vorlagenfarben mit aehnlicher Helligkeit auf derselben Stufe und die
 * Zeichnung verliert genau dort ihre Kante, wo die Vorlage sie ueber
 * den Buntton getragen hat (Orange neben Gruen zum Beispiel). Deshalb
 * erst nach Helligkeit sortieren und dann streng aufsteigend verteilen:
 * jede Farbe bekommt die naechstgelegene freie Stufe, die nicht unter
 * der ihres dunkleren Nachbarn liegt.
 */
function farbplan(farben) {
  const sortiert = [...farben].sort((a, b) => helligkeit(a) - helligkeit(b));
  const plan = new Map();
  let untergrenze = 0;

  sortiert.forEach((farbe, i) => {
    const h = helligkeit(farbe);
    // Wie viele Stufen muessen fuer die noch folgenden Farben frei bleiben
    const rest = sortiert.length - 1 - i;
    const obergrenze = Math.max(untergrenze, LEITER.length - 1 - rest);

    let beste = untergrenze;
    let abstand = Infinity;
    for (let s = untergrenze; s <= obergrenze; s++) {
      const d = Math.abs(leiterHell[s] - h);
      if (d < abstand) { abstand = d; beste = s; }
    }
    plan.set(farbe, LEITER[beste]);
    untergrenze = Math.min(beste + 1, LEITER.length - 1);
  });

  return plan;
}

/* --- Zahlen kuerzen -------------------------------------------
   Nur innerhalb der Attribute, in denen Zahlen stehen, und je
   Attribut mit eigener Genauigkeit. Ein pauschales Runden ueber die
   ganze Datei waere an zwei Stellen ein echter Fehler:

   - transform: die Vorlagen enthalten Matrizen mit Faktoren wie
     0.146 und Skalierungen wie scale(1, 0.824). Auf null Stellen
     gerundet waere aus 0.146 eine 0 geworden und die halbe Zeichnung
     verschwunden.
   - keyTimes/keySplines: das sind Anteile zwischen 0 und 1. Ein
     keyTime von 0.073 auf 0.1 gerundet verschiebt den Takt um drei
     Prozent der Laufzeit.

   Pfaddaten dagegen stehen in viewBox-Einheiten. Bei viewBox 500 und
   340px Anzeigebreite ist eine Einheit 0.68 Pixel, der maximale
   Rundungsfehler auf ganze Zahlen also ein Drittel Pixel. Genau dort
   liegen aber 51 Prozent des Dateigewichts, deshalb wird gerade da
   am haertesten gerundet. Kein Gruppen-Transform in den vier
   Vorlagen vergroessert (groesster Faktor 1.03), der Fehler wird
   also nirgends nach oben durchgereicht. */
const STELLEN = { d: 0, points: 0, values: 2, transform: 2, keyTimes: 3, keySplines: 3 };
const ZAHLIG = /\b(d|points|values|transform|keyTimes|keySplines)="([^"]*)"/g;

// Nur transform und values koennen Faktoren tragen, bei denen eine
// gerundete Null das Element verschwinden laesst (scale, matrix). Bei
// Pfadkoordinaten ist eine 0 dagegen die richtige Antwort.
const NIE_NULL = new Set(["transform", "values"]);

function zahlenKuerzen(text) {
  return text.replace(ZAHLIG, (ganz, attr, wert) => {
    // values traegt bei attributeName="visibility" Woerter statt Zahlen
    // ("visible; hidden; hidden") -- die bleiben unangetastet.
    if (attr === "values" && /[a-df-zA-DF-Z]/.test(wert)) return ganz;

    const stellen = STELLEN[attr];
    const neu = wert.replace(/-?\d+\.\d+/g, (z) => {
      const zahl = Number(z);
      let g = Number(zahl.toFixed(stellen));
      if (g === 0 && zahl !== 0 && NIE_NULL.has(attr)) {
        g = Number((Math.sign(zahl) * Math.pow(10, -stellen)).toFixed(stellen));
      }
      return String(g);
    });
    return `${attr}="${neu}"`;
  });
}

/* --- Lauf ------------------------------------------------------ */
mkdirSync(ZIEL, { recursive: true });

const bericht = [];

for (const { quelle, ziel } of MOTIVE) {
  const pfad = path.join(QUELLE, quelle);
  let svg = readFileSync(pfad, "utf8");
  const vorher = { roh: Buffer.byteLength(svg), gz: gzipSync(svg).length };

  // 1. Farben einsammeln und umlegen. Sechsstellige Hexwerte reichen:
  //    die Lottie-Exporte schreiben ausschliesslich #rrggbb.
  const gefunden = [...new Set(svg.match(/#[0-9a-fA-F]{6}/g) ?? [])].map((f) => f.toLowerCase());
  svg = svg.replace(/#[0-9a-fA-F]{6}/g, (f) => f.toLowerCase());
  const plan = farbplan(gefunden);
  svg = svg.replace(/#[0-9a-fA-F]{6}/g, (f) => plan.get(f) ?? f);

  // 2. Zahlen kuerzen
  svg = zahlenKuerzen(svg);

  // 3. Leerraum zwischen Tags weg, mehrfache Leerzeichen zusammen
  svg = svg.replace(/>\s+</g, "><").replace(/\s{2,}/g, " ").trim();

  // 4. xlink raus, wo es nichts referenziert. Die Vorlagen deklarieren
  //    den Namensraum im Kopf, benutzen ihn aber in keiner der vier
  //    Dateien -- die Verweise laufen ueber href ohne Praefix.
  if (!svg.includes("xlink:")) {
    svg = svg.replace(/\s*xmlns:xlink="[^"]*"/, "");
  }

  const nachher = { roh: Buffer.byteLength(svg), gz: gzipSync(svg).length };
  writeFileSync(path.join(ZIEL, ziel), svg);

  bericht.push({
    Motiv: ziel,
    Farben: gefunden.length,
    "roh vorher": (vorher.roh / 1024).toFixed(1) + " kB",
    "roh nachher": (nachher.roh / 1024).toFixed(1) + " kB",
    "gzip vorher": (vorher.gz / 1024).toFixed(1) + " kB",
    "gzip nachher": (nachher.gz / 1024).toFixed(1) + " kB",
  });
}

console.table(bericht);
console.log("\nGeschrieben nach", path.relative(wurzel, ZIEL));
for (const d of readdirSync(ZIEL)) {
  const p = path.join(ZIEL, d);
  console.log("  " + d.padEnd(20), (statSync(p).size / 1024).toFixed(1) + " kB");
}
