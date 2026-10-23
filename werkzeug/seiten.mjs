/**
 * seiten.mjs
 *
 * Die eine Liste aller Seiten der Website. Zwei Stellen lesen sie:
 *
 *   vite.config.ts            baut daraus die Eingangsliste. Eine Seite,
 *                             die hier fehlt, landet nicht in dist/ --
 *                             samt aller Links, die auf sie zeigen.
 *   werkzeug/sitemap-bauen.mjs  schreibt daraus public/sitemap.xml.
 *
 * Bis zum 19.10.2026 stand dieselbe Liste doppelt, einmal in der
 * Vite-Konfiguration und einmal im Sitemap-Skript, mit dem Kommentar
 * "muss zueinander passen". Jetzt gibt es nichts mehr abzugleichen.
 *
 * Eine neue Seite braucht hier genau einen Eintrag. Ausserhalb dieser
 * Datei bleiben nur die Handgriffe, die ein Werkzeug nicht erledigen
 * kann: die HTML-Dateien selbst, die hreflang-Zeilen in ihrem Kopf und
 * die Weiterleitungen in vercel.json.
 *
 * Aufbau eines Eintrags
 *
 *   schluessel  Name der Seite in der Eingangsliste. Rollup benutzt ihn
 *               als Namen des erzeugten Bundles, deshalb ein gueltiger
 *               Bezeichner. Englisch und Franzoesisch bekommen die
 *               Vorsilbe en_ bzw. fr_.
 *   rang        Priority fuer die Sitemap. Reine Hausnummer fuer
 *               Suchmaschinen, die Rangfolge innerhalb der eigenen
 *               Domain, kein Ranking-Faktor. Fehlt sie, steht die
 *               Seite nicht in der Sitemap.
 *   de/en/fr    [Quelldatei in website/, Adresse auf der Website]. Die Datei
 *               liefert das Aenderungsdatum, die Adresse muss
 *               zeichengleich mit dem <link rel="canonical"> der Seite
 *               sein.
 *
 * Die Reihenfolge ist die der Sitemap.
 */

export const SEITEN = [
  {
    schluessel: "start",
    rang: "1.0",
    de: ["index.html", "/"],
    en: ["en/index.html", "/en/"],
    fr: ["fr/index.html", "/fr/"],
  },
  {
    schluessel: "leistungen",
    rang: "0.9",
    de: ["leistungen.html", "/leistungen.html"],
    en: ["en/services.html", "/en/services.html"],
    fr: ["fr/prestations.html", "/fr/prestations.html"],
  },
  {
    schluessel: "ablauf",
    rang: "0.9",
    de: ["ablauf.html", "/ablauf.html"],
    en: ["en/process.html", "/en/process.html"],
    fr: ["fr/deroulement.html", "/fr/deroulement.html"],
  },
  {
    schluessel: "referenzen",
    rang: "0.8",
    de: ["referenzen/index.html", "/referenzen/"],
    en: ["en/portfolio/index.html", "/en/portfolio/"],
    fr: ["fr/references/index.html", "/fr/references/"],
  },
  {
    schluessel: "kontakt",
    rang: "0.8",
    de: ["kontakt.html", "/kontakt.html"],
    en: ["en/contact.html", "/en/contact.html"],
    fr: ["fr/contact.html", "/fr/contact.html"],
  },
  {
    schluessel: "impressum",
    rang: "0.3",
    de: ["impressum.html", "/impressum.html"],
    en: ["en/legal-notice.html", "/en/legal-notice.html"],
    fr: ["fr/mentions-legales.html", "/fr/mentions-legales.html"],
  },
  {
    schluessel: "datenschutz",
    rang: "0.3",
    de: ["datenschutz.html", "/datenschutz.html"],
    en: ["en/privacy.html", "/en/privacy.html"],
    fr: ["fr/protection-des-donnees.html", "/fr/protection-des-donnees.html"],
  },
  // Ohne rang, also ohne Sitemap-Eintrag: die Danke-Seiten tragen
  // noindex. Eine Seite in die Sitemap zu schreiben und ihr gleichzeitig
  // das Indexieren zu verbieten, sind zwei widerspruechliche Signale.
  {
    schluessel: "danke",
    de: ["danke.html", "/danke.html"],
    en: ["en/thank-you.html", "/en/thank-you.html"],
    fr: ["fr/merci.html", "/fr/merci.html"],
  },
];

/**
 * Die Fehlerseite, eine Datei fuer alle Sprachen. Sie hat keine feste
 * Adresse (Vercel liefert sie mit Status 404 unter jedem unbekannten
 * Pfad aus) und gehoert deshalb nicht in SEITEN und nicht in die
 * Sitemap. Der Dateiname 404.html ist der, den Vercel ohne weitere
 * Konfiguration erkennt.
 *
 * Der Schluessel in der Eingangsliste heisst "fehler" und nicht "404":
 * Rollup benutzt ihn als Namen des Bundles, und ein Name, der mit einer
 * Ziffer beginnt, ist kein gueltiger JavaScript-Bezeichner.
 */
export const FEHLERSEITE = { schluessel: "fehler", datei: "404.html" };

export const SPRACHEN = ["de", "en", "fr"];

/**
 * Der Ordner mit allem, was der Browser sieht: Seiten, stil/, src/,
 * medien/ und public/. Er ist die Wurzel von Vite (vite.config.ts), und
 * alle Dateipfade in dieser Datei sind relativ zu ihm. Die Adresse einer
 * Seite bleibt dadurch, was sie war: website/kontakt.html ist
 * kazuvate.ch/kontakt.html.
 */
export const QUELLORDNER = "website";

/**
 * Die Eingangsliste fuer Vite: Schluessel -> Quelldatei. Erst alle
 * deutschen Seiten, dann Englisch, dann Franzoesisch, zuletzt die
 * Fehlerseite.
 */
export function eingangsliste() {
  const eintraege = SPRACHEN.flatMap((sprache) =>
    SEITEN.map((seite) => [
      sprache === "de" ? seite.schluessel : `${sprache}_${seite.schluessel}`,
      seite[sprache][0],
    ]),
  );
  eintraege.push([FEHLERSEITE.schluessel, FEHLERSEITE.datei]);
  return Object.fromEntries(eintraege);
}
