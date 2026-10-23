// Schreibt website/public/sitemap.xml, laeuft als prebuild.
// lastmod kommt aus git log --follow, nicht aus der Dateizeit. --follow, damit ein reiner Umzug nicht als Aenderung zaehlt.

import { writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SEITEN, SPRACHEN, QUELLORDNER } from "./seiten.mjs";

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HERKUNFT = "https://kazuvate.ch";

const heute = new Date().toISOString().slice(0, 10);

function letzteAenderung(datei) {
  try {
    const aus = execFileSync("git", ["log", "--follow", "--diff-filter=AM", "-1", "--format=%cs", "--", `${QUELLORDNER}/${datei}`], {
      cwd: wurzel,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(aus) ? aus : heute;
  } catch {
    return heute;
  }
}

const eintraege = SEITEN.filter((seite) => seite.rang).flatMap((seite) => {
  const fehlt = SPRACHEN.filter((s) => !existsSync(path.join(wurzel, QUELLORDNER, seite[s][0])));
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

const ziel = path.join(wurzel, QUELLORDNER, "public", "sitemap.xml");
writeFileSync(ziel, xml);
console.log(`sitemap.xml: ${eintraege.length} Adressen -> ${path.relative(wurzel, ziel)}`);
