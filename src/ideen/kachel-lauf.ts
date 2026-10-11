/**
 * kachel-lauf.ts, seit 11.10.2026
 *
 * Beim Zeigen oder Fokussieren laeuft in der Referenz-Kachel die echte
 * Kundenseite als Langaufnahme durch den Rahmen. Geladen von
 * src/bewegung.ts, nur mit Maus und ohne reduzierte Bewegung.
 *
 * Jede Aufnahme kommt erst beim ersten Zeigen oder Fokussieren ihrer
 * Kachel: wer nie darauf zeigt, laedt keine. Die Bilder sind
 * Bildschirmfotos der ganzen Seite bei 1280px Breite, aufgenommen ueber
 * das DevTools-Protokoll nach einem Durchscrollen in 400px-Schritten
 * (damit Einblendungen echt ausgeloest sind), als webp mit 640px Breite
 * und Qualitaet 70. Stand der Aufnahmen: 11.10.2026.
 *
 * Bewegt wird in CSS (stil/basis.css, "Die Seite laeuft"); hier faellt
 * nur die Entscheidung, wann das Bild da ist.
 */
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
