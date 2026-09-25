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
 * Seit 25.09.2026 steht jede Seite in drei Sprachen hier, als eine
 * Zeile mit drei Fassungen. Jede Fassung bekommt einen eigenen
 * <url>-Eintrag, und jeder davon nennt per xhtml:link alle drei plus
 * x-default. Das ist dieselbe Zuordnung wie die hreflang-Zeilen im
 * Kopf jeder Seite -- Google nimmt beide Wege, und zwei Angaben, die
 * sich widersprechen, sind schlechter als eine. Die Liste hier ist
 * damit auch die Stelle, an der man nachsieht, welche englische und
 * franzoesische Datei zu welcher deutschen gehoert.
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
 * rang    Priority. Reine Hausnummer fuer Suchmaschinen, die
 *         Rangfolge innerhalb der eigenen Domain, kein Ranking-Faktor.
 * de/en/fr  [Quelldatei im Repo, Adresse auf der Website]. Die Datei
 *         liefert das Aenderungsdatum, die Adresse muss zeichengleich
 *         mit dem <link rel="canonical"> der Seite sein.
 */
const SEITEN = [
  { rang: "1.0", de: ["index.html", "/"], en: ["en/index.html", "/en/"], fr: ["fr/index.html", "/fr/"] },
  { rang: "0.9", de: ["leistungen.html", "/leistungen.html"], en: ["en/services.html", "/en/services.html"], fr: ["fr/prestations.html", "/fr/prestations.html"] },
  { rang: "0.9", de: ["ablauf.html", "/ablauf.html"], en: ["en/process.html", "/en/process.html"], fr: ["fr/deroulement.html", "/fr/deroulement.html"] },
  { rang: "0.8", de: ["referenzen/index.html", "/referenzen/"], en: ["en/portfolio/index.html", "/en/portfolio/"], fr: ["fr/references/index.html", "/fr/references/"] },
  { rang: "0.8", de: ["kontakt.html", "/kontakt.html"], en: ["en/contact.html", "/en/contact.html"], fr: ["fr/contact.html", "/fr/contact.html"] },
  { rang: "0.3", de: ["impressum.html", "/impressum.html"], en: ["en/legal-notice.html", "/en/legal-notice.html"], fr: ["fr/mentions-legales.html", "/fr/mentions-legales.html"] },
  { rang: "0.3", de: ["datenschutz.html", "/datenschutz.html"], en: ["en/privacy.html", "/en/privacy.html"], fr: ["fr/protection-des-donnees.html", "/fr/protection-des-donnees.html"] },
  // danke.html und 404.html fehlen hier mit Absicht, ebenso ihre
  // Uebersetzungen: alle tragen noindex. Eine Seite in die Sitemap zu
  // schreiben und ihr gleichzeitig das Indexieren zu verbieten, sind
  // zwei widerspruechliche Signale. Die Fehlerseite waere zusaetzlich
  // sinnlos, weil sie unter keiner festen Adresse steht.
];

const SPRACHEN = ["de", "en", "fr"];

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

const eintraege = SEITEN.flatMap((seite) => {
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
