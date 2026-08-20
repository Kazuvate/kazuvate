import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { AblaufStrang } from "@/components/ui/ablauf-strang";
import "./index.css";

/**
 * Einhaenge-Punkt fuer die React-Insel auf ablauf.html, Gegenstueck zu
 * src/main.tsx auf der Startseite. Zweite Insel statt eines gemeinsamen
 * Skripts: die Startseite soll den Strang nicht laden und die
 * Ablauf-Seite nicht den Faden. Vite baut aus jeder HTML-Datei ohnehin
 * ein eigenes Bundle.
 *
 * Gesucht werden zwei bestehende Elemente in ablauf.html:
 *
 * - #ablauf-schritte: die <ol> mit den vier Schritten. Aus ihr liest
 *   die Komponente, wo die Knoten sitzen.
 * - #strang-root: die leere Flaeche, in die React zeichnet. Sie liegt
 *   im selben, auf position:relative gesetzten Wrapper wie die Liste,
 *   damit gemessene und gezeichnete Koordinaten dasselbe meinen.
 *
 * Fehlt eines von beiden, passiert nichts: keine Fehlermeldung, kein
 * kaputter Zustand. Uebrig bleibt die blasse Grundspur aus
 * stil/ablauf.css, und die Seite ist vollstaendig lesbar.
 */
const liste = document.getElementById("ablauf-schritte");
const mountElement = document.getElementById("strang-root");

if (liste && mountElement) {
  createRoot(mountElement).render(
    <StrictMode>
      <AblaufStrang liste={liste} />
    </StrictMode>,
  );
}
