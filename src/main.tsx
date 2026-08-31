import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { Faden } from "@/components/ui/svg-follow-scroll";

/**
 * `import "./index.css"` stand hier bis zum 31.08.2026 und hat Tailwinds
 * Utility-Ebene in das Bundle der Startseite gezogen. Gebraucht wurden
 * davon genau zwei Klassen am Faden-SVG; die stehen jetzt als
 * `#faden-root svg` in stil/basis.css. Die Datei src/index.css bleibt
 * liegen, weil components.json darauf zeigt: sobald wieder ein
 * shadcn-Bauteil eingefuegt wird, das Tailwind-Klassen mitbringt,
 * gehoert der Import hier zurueck.
 */

/**
 * Einhaenge-Punkt fuer die React-Insel. Kein Router, keine App-Struktur
 * mit mehreren Seiten -- die restliche kazuvate-Website bleibt fuenf
 * statische HTML-Dateien. Dieses Skript sucht sich in index.html zwei
 * bestehende Elemente:
 *
 * - #hero-faden-bereich: der Inhaltsbereich von der H1 bis zum Ende von
 *   "Mit wem wir arbeiten". Wird der Faden-Komponente als Scroll-Ziel
 *   uebergeben.
 * - #faden-root: die leere, per CSS absolut positionierte Flaeche
 *   rechts in diesem Bereich, in die React rendert.
 *
 * Fehlt eines der beiden -- etwa auf einer anderen Seite, die dieses
 * Skript gar nicht einbindet -- passiert nichts. Keine Fehlermeldung,
 * kein kaputter Zustand, die restliche Seite bleibt unberuehrt.
 */
const zielElement = document.getElementById("hero-faden-bereich");
const mountElement = document.getElementById("faden-root");

if (zielElement && mountElement) {
  createRoot(mountElement).render(
    <StrictMode>
      <Faden zielElement={zielElement} />
    </StrictMode>,
  );
}
