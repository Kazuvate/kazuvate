// Meldet alle Adressen der Sitemap an IndexNow (Bing, Yandex, ...). Von Hand nach einem Deploy: npm run indexnow.
// Der Schluessel liegt oeffentlich in website/public/, das ist bei IndexNow so gewollt.

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "kazuvate.ch";

const datei = readdirSync(path.join(wurzel, "website", "public")).find((name) =>
  /^[0-9a-f]{32}\.txt$/.test(name),
);
if (!datei) {
  console.error("Keine Schluesseldatei <32 Hex-Zeichen>.txt in website/public/ gefunden.");
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

const sitemap = readFileSync(path.join(wurzel, "website", "public", "sitemap.xml"), "utf8");
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

if (antwort.status === 200 || antwort.status === 202) {
  console.log(`IndexNow: ${adressen.length} Adressen gemeldet (Status ${antwort.status}).`);
} else {
  console.error(`IndexNow lehnt ab: Status ${antwort.status} ${await antwort.text()}`);
  process.exit(1);
}
