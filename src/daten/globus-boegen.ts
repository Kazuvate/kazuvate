/**
 * globus-boegen.ts
 *
 * Die Linien, die auf dem Globus neben Leistung 02 laufen.
 *
 * **Warum nicht die Daten aus der Vorlage.** Das Aceternity-Beispiel
 * heisst "We sell soap worldwide" und zieht Boegen von Rio nach
 * Hongkong, von Jakarta nach Amsterdam. Uebernommen haette der Globus
 * behauptet, kazuvate arbeite weltweit -- die Firma ist ein
 * Einzelunternehmen in Basel, das Schweizer KMU bedient. Ein Bild, das
 * etwas anderes verspricht als der Text daneben, ist schlimmer als gar
 * keins.
 *
 * Stattdessen: Basel als Ausgangspunkt, dazu die Schweizer Orte und die
 * Nachbarschaft im Dreilaendereck. Das passt zur Ueberschrift der
 * Sektion -- "Gefunden werden. Dort, wo gesucht wird." -- und zum
 * SEO-Abschnitt der Projektnotiz, wo das Google-Unternehmensprofil und
 * die lokale Auffindbarkeit das Fundament sind, nicht weltweite Reichweite.
 *
 * `order` staffelt den Start: alle Boegen einer Ordnung laufen
 * gemeinsam los, danach die naechste. Ohne die Staffelung zuckt der
 * ganze Globus im Gleichtakt.
 */

import type { Bogen } from "@/components/ui/globus";

/** Orte als [Breite, Laenge]. Basel steht bewusst zuoberst. */
const ORT = {
  basel: [47.56, 7.59],
  zuerich: [47.38, 8.54],
  bern: [46.95, 7.45],
  genf: [46.2, 6.14],
  lausanne: [46.52, 6.63],
  luzern: [47.05, 8.31],
  stGallen: [47.42, 9.38],
  lugano: [46.0, 8.95],
  chur: [46.85, 9.53],
  winterthur: [47.5, 8.75],
  biel: [47.14, 7.25],
  aarau: [47.39, 8.04],
  solothurn: [47.21, 7.53],
  liestal: [47.48, 7.73],
  freiburgBr: [48.0, 7.84],
  mulhouse: [47.75, 7.34],
  strassburg: [48.57, 7.75],
  stuttgart: [48.78, 9.18],
  muenchen: [48.14, 11.58],
  wien: [48.21, 16.37],
  mailand: [45.46, 9.19],
} as const;

type OrtName = keyof typeof ORT;

/**
 * Zwei Toene statt der drei Blautoene der Vorlage. Gelesen wird zur
 * Laufzeit aus stil/tokens.css, damit auch hier kein Hex-Wert im Code
 * steht -- dieselbe Regel wie in globus.tsx.
 */
function markenToene(): [string, string] {
  const wurzel = getComputedStyle(document.documentElement);
  const hell = wurzel.getPropertyValue("--olive-hell").trim() || "#93AA5E";
  const papier = wurzel.getPropertyValue("--auf-flaeche").trim() || "#F7F7F1";
  return [hell, papier];
}

/**
 * Die Streckenliste. Kurze Wege bekommen einen flachen Scheitel, weite
 * einen hohen -- ein Bogen von Basel nach Liestal, der so hoch steigt
 * wie einer nach Wien, sieht aus wie ein Fehler.
 */
const STRECKEN: Array<[OrtName, OrtName, number, number]> = [
  // [von, nach, Ordnung, Scheitelhoehe]
  ["basel", "zuerich", 1, 0.1],
  ["basel", "bern", 1, 0.09],
  ["basel", "liestal", 1, 0.04],

  ["basel", "genf", 2, 0.16],
  ["basel", "stGallen", 2, 0.14],
  ["basel", "luzern", 2, 0.08],

  ["basel", "lugano", 3, 0.2],
  ["basel", "chur", 3, 0.16],
  ["basel", "mulhouse", 3, 0.04],

  ["basel", "freiburgBr", 4, 0.06],
  ["basel", "strassburg", 4, 0.08],
  ["basel", "lausanne", 4, 0.13],

  ["zuerich", "winterthur", 5, 0.05],
  ["bern", "biel", 5, 0.05],
  ["basel", "aarau", 5, 0.06],

  ["basel", "stuttgart", 6, 0.14],
  ["basel", "muenchen", 6, 0.2],
  ["genf", "lausanne", 6, 0.05],

  ["basel", "mailand", 7, 0.19],
  ["basel", "wien", 7, 0.3],
  ["basel", "solothurn", 7, 0.05],
];

export function boegenBauen(): Bogen[] {
  const [hell, papier] = markenToene();

  return STRECKEN.map(([von, nach, order, arcAlt], i) => {
    const [startLat, startLng] = ORT[von];
    const [endLat, endLng] = ORT[nach];

    return {
      order,
      startLat,
      startLng,
      endLat,
      endLng,
      arcAlt,
      // Fest abwechselnd statt gewuerfelt: die Vorlage zieht die Farbe
      // per Math.random(), damit sieht der Globus bei jedem Neuladen
      // anders aus. Zwei von drei Boegen im hellen Oliv, jeder dritte
      // im Papierton -- die gruenen Akzente bleiben die Mehrheit.
      color: i % 3 === 2 ? papier : hell,
    };
  });
}
