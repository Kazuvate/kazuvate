/**
 * indexnow.mjs
 *
 * Meldet alle Adressen aus public/sitemap.xml ueber IndexNow. Das ist
 * das Protokoll, ueber das Bing, Yandex, Seznam und Naver neue und
 * geaenderte Seiten sofort erfahren, statt auf den naechsten Besuch
 * ihres Crawlers zu warten. Eine Meldung an api.indexnow.org geht an
 * alle teilnehmenden Suchmaschinen.
 *
 * Warum sich das fuer kazuvate lohnt: Bings Index speist nicht nur
 * Bing selbst, sondern auch Microsoft Copilot und die Websuche in
 * ChatGPT. Eine Seite, die Bing nicht kennt, kann dort nicht zitiert
 * werden. Google nimmt an IndexNow nicht teil, dafuer ist die
 * Search Console da.
 *
 * Der Schluessel liegt als <schluessel>.txt in public/ und ist damit
 * unter https://kazuvate.ch/<schluessel>.txt abrufbar. Er ist kein
 * Geheimnis: IndexNow prueft mit genau dieser oeffentlichen Datei,
 * dass die Meldung vom Besitzer der Domain kommt. Das Skript sucht
 * die Datei selbst, der Schluessel steht also nur an einer Stelle.
 *
 * Laeuft von Hand, nach einem Deploy mit neuen oder geaenderten
 * Seiten, nicht bei jedem Build: ein Build laeuft auch fuer Vorschau-
 * Deploys, und eine Meldung vor dem Livegang zeigt auf den alten
 * Stand. Vorher prueft das Skript, dass die Schluesseldatei live
 * erreichbar ist, sonst lehnt IndexNow die Meldung ohnehin ab.
 *
 *   npm run indexnow
 */

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "kazuvate.ch";

const datei = readdirSync(path.join(wurzel, "public")).find((name) =>
  /^[0-9a-f]{32}\.txt$/.test(name),
);
if (!datei) {
  console.error("Keine Schluesseldatei <32 Hex-Zeichen>.txt in public/ gefunden.");
  process.exit(1);
}
const schluessel = datei.slice(0, -4);
const ablage = `https://${HOST}/${datei}`;

const live = await fetch(ablage).then(
  async (antwort) => (antwort.ok ? (await antwort.text()).trim() : null),
  () => null,
);
if (live !== schluessel) {
  console.error(`${ablage} liefert nicht den Schluessel. Erst deployen, dann melden.`);
  process.exit(1);
}

const sitemap = readFileSync(path.join(wurzel, "public", "sitemap.xml"), "utf8");
const adressen = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((t) => t[1]);

const antwort = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key: schluessel,
    keyLocation: ablage,
    urlList: adressen,
  }),
});

// 200 heisst angenommen, 202 heisst angenommen und der Schluessel wird
// noch geprueft. Alles andere ist ein Fehler, der Text sagt welcher.
if (antwort.status === 200 || antwort.status === 202) {
  console.log(`IndexNow: ${adressen.length} Adressen gemeldet (Status ${antwort.status}).`);
} else {
  console.error(`IndexNow lehnt ab: Status ${antwort.status} ${await antwort.text()}`);
  process.exit(1);
}
