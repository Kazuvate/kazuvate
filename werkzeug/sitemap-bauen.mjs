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
 * Welche Seiten es gibt, steht in werkzeug/seiten.mjs, derselben Liste,
 * aus der auch vite.config.ts seine Eingangsliste baut. Seiten ohne
 * `rang` (die Danke-Seiten, sie tragen noindex) lassen wir hier aus.
 *
 * Jede Seite steht in drei Sprachen, als eine Zeile mit drei Fassungen.
 * Jede Fassung bekommt einen eigenen <url>-Eintrag, und jeder davon
 * nennt per xhtml:link alle drei plus x-default. Das ist dieselbe
 * Zuordnung wie die hreflang-Zeilen im Kopf jeder Seite -- Google nimmt
 * beide Wege, und zwei Angaben, die sich widersprechen, sind schlechter
 * als eine. Die Liste in seiten.mjs ist damit auch die Stelle, an der
 * man nachsieht, welche englische und franzoesische Datei zu welcher
 * deutschen gehoert.
 *
 *   node werkzeug/sitemap-bauen.mjs
 */

import { writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SEITEN, SPRACHEN } from "./seiten.mjs";

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HERKUNFT = "https://kazuvate.ch";

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

const eintraege = SEITEN.filter((seite) => seite.rang).flatMap((seite) => {
  const fehlt = SPRACHEN.filter((s) => !existsSync(path.join(wurzel, seite[s][0])));
  if (fehlt.length) {
    console.warn(`  Achtung: ${fehlt.map((s) => seite[s][0]).join(", ")} gibt es nicht, Seite nicht in der Sitemap`);
    return [];
  }
  const verweise = [
    ...SPRACHEN.map((s) => `    <xhtml:link rel="alternate" hreflang="${s}" href="${HERKUNFT}${seite[s][1]}"/>`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${HERKUNFT}${seite.de[1]}"/>`,
  ].join("\n");
  return SPRACHEN.map((s) => {
    const [datei, pfad] = seite[s];
    return `  <url>
    <loc>${HERKUNFT}${pfad}</loc>
    <lastmod>${letzteAenderung(datei)}</lastmod>
    <priority>${seite.rang}</priority>
${verweise}
  </url>`;
  });
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Erzeugt von werkzeug/sitemap-bauen.mjs, nicht von Hand aendern.
     Laeuft als prebuild bei jedem npm run build. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${eintraege.join("\n")}
</urlset>
`;

const ziel = path.join(wurzel, "public", "sitemap.xml");
writeFileSync(ziel, xml);
console.log(`sitemap.xml: ${eintraege.length} Adressen -> ${path.relative(wurzel, ziel)}`);
