// Die eine Liste aller Seiten. vite.config.ts baut daraus die Eingangsliste, sitemap-bauen.mjs die Sitemap.
// Pfade sind relativ zu website/, die Adressen muessen zeichengleich mit dem canonical der Seite sein.
// Eine Seite ohne rang steht nicht in der Sitemap (noindex).

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
  {
    schluessel: "danke",
    de: ["danke.html", "/danke.html"],
    en: ["en/thank-you.html", "/en/thank-you.html"],
    fr: ["fr/merci.html", "/fr/merci.html"],
  },
];

// 404.html: eine Datei fuer alle Sprachen, ohne feste Adresse, nicht in der Sitemap.
// Der Schluessel heisst "fehler", weil ein Name mit Ziffer kein gueltiger Bezeichner ist.
export const FEHLERSEITE = { schluessel: "fehler", datei: "404.html" };

export const SPRACHEN = ["de", "en", "fr"];

// Wurzel von Vite. Alle Pfade in dieser Datei sind relativ dazu.
export const QUELLORDNER = "website";

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
