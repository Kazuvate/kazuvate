// Referenz-Kachel: beim Zeigen laeuft die Langaufnahme der Kundenseite durch den Rahmen. Das Bild laedt erst beim ersten Zeigen.
const AUFNAHMEN: Record<string, string> = {
  "www.prometizekiri.com": new URL("../../medien/referenzen/prometi-lang.webp", import.meta.url).href,
  "promptprinter.app": new URL("../../medien/referenzen/promptprinter-lang.webp", import.meta.url).href,
  "herzumschlag.artemishebammen.ch": new URL("../../medien/referenzen/herzumschlag-lang.webp", import.meta.url).href,
};

export function starte(kacheln: NodeListOf<HTMLAnchorElement>) {
  for (const kachel of kacheln) {
    const url = AUFNAHMEN[new URL(kachel.href).host];
    const foto = kachel.querySelector("img");
    if (!url || !foto) continue;
    const laden = () => {
      if (kachel.querySelector(".lauf")) return;
      const bild = new Image();
      bild.className = "lauf";
      bild.alt = "";
      bild.decoding = "async";
      bild.setAttribute("aria-hidden", "true");
      bild.addEventListener("load", () => kachel.classList.add("lauf-bereit"), { once: true });
      bild.src = url;
      foto.after(bild);
    };
    kachel.addEventListener("pointerenter", laden);
    kachel.addEventListener("focus", laden);
  }
}
