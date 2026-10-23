import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { AblaufStrang } from "@/components/ui/ablauf-strang";

// Einstieg der React-Insel "Strang" auf ablauf.html. Laedt src/module/regler.ts nur, wenn der Regler sichtbar ist.
const liste = document.getElementById("ablauf-schritte");
const mountElement = document.getElementById("strang-root");

if (liste && mountElement) {
  createRoot(mountElement).render(
    <StrictMode>
      <AblaufStrang liste={liste} />
    </StrictMode>,
  );
}

const regler = document.querySelector<HTMLElement>(".regler:not([hidden])");
if (regler) {
  import("@/module/regler").then(({ reglerStarten }) => reglerStarten(regler));
}
