import { createRoot } from "react-dom/client";
import { StrictMode, Suspense, lazy, useEffect, useState } from "react";

import { boegenBauen } from "@/daten/globus-boegen";
import "./index.css";

/**
 * Einhaenge-Punkt fuer die React-Insel auf leistungen.html, dritte nach
 * dem Faden (index.html) und dem Fortschrittsstrang (ablauf.html).
 *
 * **Die Insel ist teuer, deshalb wird sie zweimal abgesichert:**
 *
 * 1. `lazy()` holt den Globus-Code erst nach, wenn die Seite schon
 *    steht. Der Rest von leistungen.html -- Text, Kopf, Fuss -- wartet
 *    also nicht auf three.js. Bewusst *nicht* an die Scrollposition
 *    gebunden: was beim Vorbeiscrollen auftaucht, hat Kasum am
 *    20.08.2026 abgelehnt. Der Nachschub startet sofort beim Laden.
 *
 * 2. `matchMedia` haelt schmale Geraete ganz davon ab. Unter 1100px ist
 *    die Globus-Spalte per CSS ohnehin ausgeblendet (siehe
 *    stil/leistungen.css) -- ohne diese Pruefung wuerden Handys knapp
 *    300 kB three.js fuer etwas laden, das sie nie zu sehen bekommen.
 *    Wird das Fenster breiter gezogen, laedt es nach.
 *
 * Fehlt #globus-root, passiert nichts. Auf den anderen sieben Seiten
 * ist dieses Skript ohnehin nicht eingebunden.
 */
const Globus = lazy(() =>
  import("@/components/ui/globus").then((m) => ({ default: m.Globus })),
);

/** Dieselbe Grenze wie `.leistung-globus` in stil/leistungen.css. */
const AB_BREITE = "(min-width: 1100px)";

function GlobusInsel() {
  const [breitGenug, setBreitGenug] = useState(
    () => window.matchMedia(AB_BREITE).matches,
  );

  useEffect(() => {
    const abfrage = window.matchMedia(AB_BREITE);
    const merken = () => setBreitGenug(abfrage.matches);
    abfrage.addEventListener("change", merken);
    return () => abfrage.removeEventListener("change", merken);
  }, []);

  if (!breitGenug) return null;

  return (
    // Kein Ladebalken im Fallback: die Flaeche ist per CSS schon
    // reserviert und traegt einen ruhigen Kreis. Ein Spinner waere
    // Bewegung, die etwas ankuendigt, das vielleicht nie kommt.
    <Suspense fallback={null}>
      <Globus bogen={boegenBauen()} />
    </Suspense>
  );
}

const mountElement = document.getElementById("globus-root");

if (mountElement) {
  createRoot(mountElement).render(
    <StrictMode>
      <GlobusInsel />
    </StrictMode>,
  );
}
