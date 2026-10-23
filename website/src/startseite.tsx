import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { Faden } from "@/components/ui/svg-follow-scroll";

// Kein import "./index.css": das zoege Tailwinds Utilities ins Bundle. Kommt ein Bauteil mit Tailwind-Klassen, gehoert er hierher zurueck.

// Einstieg der React-Insel "Faden" auf der Startseite: haengt sich an #hero-faden-bereich und #faden-root, fehlen sie, passiert nichts.
const zielElement = document.getElementById("hero-faden-bereich");
const mountElement = document.getElementById("faden-root");

if (zielElement && mountElement) {
  createRoot(mountElement).render(
    <StrictMode>
      <Faden zielElement={zielElement} />
    </StrictMode>,
  );
}
