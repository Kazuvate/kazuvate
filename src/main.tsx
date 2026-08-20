import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { Faden } from "@/components/ui/svg-follow-scroll";
import "./index.css";

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
