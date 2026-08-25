/**
 * sitemap-bauen.mjs
 *
 * Schreibt public/sitemap.xml. Laeuft automatisch als `prebuild`, also
 * bei jedem `npm run build` -- eine Sitemap, die man von Hand pflegen
 * muss, ist nach der dritten Aenderung falsch.
 *
 * `lastmod` kommt aus dem Datum des letzten Commits, der die jeweilige
 * HTML-Datei angefasst hat, nicht aus der Dateizeit im Dateisystem.
 * Grund: nach jedem `git clone` oder `git checkout` stehen alle
 * Dateizeiten auf "jetzt". Eine Sitemap, die behauptet, alle acht
 * Seiten seien heute geaendert worden, ist nicht nur falsch, sie ist
 * schaedlich -- Google ignoriert `lastmod` einer Domain dauerhaft,
 * sobald es ihm einmal unglaubwuerdig vorkam. Fuer noch nicht
 * eingecheckte Dateien gibt es kein Commit-Datum, dort steht das
 * heutige.
 *
 * Die Liste unten muss zur Eingangsliste in vite.config.ts passen.
 * Kommt eine Seite dazu, gehoert sie an beide Stellen.
 *
 *   node werkzeug/sitemap-bauen.mjs
 */

import { writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HERKUNFT = "https://kazuvate.ch";

/**
 * datei   Quelldatei im Repo, liefert das Aenderungsdatum
 * pfad    die Adresse, unter der die Seite steht. Muss zeichengleich
 *         mit dem <link rel="canonical"> der Seite sein -- zwei
 *         Angaben, die sich widersprechen, sind schlechter als eine.
 * rang    Priority. Reine Hausnummer fuer Suchmaschinen, die
 *         Rangfolge innerhalb der eigenen Domain, kein Ranking-Faktor.
 */
const SEITEN = [
  { datei: "index.html",            pfad: "/",                 rang: "1.0" },
  { datei: "leistungen.html",       pfad: "/leistungen.html",  rang: "0.9" },
  { datei: "ablauf.html",           pfad: "/ablauf.html",      rang: "0.9" },
  { datei: "referenzen/index.html", pfad: "/referenzen/",      rang: "0.8" },
  { datei: "kontakt.html",          pfad: "/kontakt.html",     rang: "0.8" },
  { datei: "impressum.html",        pfad: "/impressum.html",   rang: "0.3" },
  { datei: "datenschutz.html",      pfad: "/datenschutz.html", rang: "0.3" },
  // danke.html fehlt hier mit Absicht: die Seite traegt noindex. Eine
  // Seite in die Sitemap zu schreiben und ihr gleichzeitig das
  // Indexieren zu verbieten, sind zwei widerspruechliche Signale.
];

const heute = new Date().toISOString().slice(0, 10);

function letzteAenderung(datei) {
  try {
    const aus = execFileSync("git", ["log", "-1", "--format=%cs", "--", datei], {
      cwd: wurzel,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(aus) ? aus : heute;
  } catch {
    // Kein Git im Pfad oder kein Repo -- dann eben heute.
    return heute;
  }
}

const eintraege = SEITEN.filter(({ datei }) => {
  const da = existsSync(path.join(wurzel, datei));
  if (!da) console.warn(`  Achtung: ${datei} gibt es nicht, nicht in der Sitemap`);
  return da;
}).map(({ datei, pfad, rang }) => {
  const stand = letzteAenderung(datei);
  return `  <url>
    <loc>${HERKUNFT}${pfad}</loc>
    <lastmod>${stand}</lastmod>
    <priority>${rang}</priority>
  </url>`;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Erzeugt von werkzeug/sitemap-bauen.mjs, nicht von Hand aendern.
     Laeuft als prebuild bei jedem npm run build. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${eintraege.join("\n")}
</urlset>
`;

const ziel = path.join(wurzel, "public", "sitemap.xml");
writeFileSync(ziel, xml);
console.log(`sitemap.xml: ${eintraege.length} Adressen -> ${path.relative(wurzel, ziel)}`);
