/**
 * zeilen.ts, seit 11.10.2026
 *
 * "Drei Dinge machen wir anders" auf der Startseite: drei <details> mit
 * demselben Namen, von denen der Browser immer nur eines offen haelt.
 * Per Klick, Tippen und Enter geht das ohne dieses Skript. Hier kommt
 * nur dazu, was <details> nicht von selbst kann:
 *
 * - Zeigen oeffnet. Nur mit Maus und erst ab 1000px: dort steht die
 *   Erklaerung neben der Zeile, beim Wechsel aendert sich keine Hoehe.
 *   Darunter wuerde das Oeffnen die Zeilen verschieben, und die naechste
 *   Zeile rutschte unter den Zeiger -- dort bleibt es beim Klick.
 * - Fokus oeffnet, damit die Tastatur dieselbe Reihenfolge erlebt.
 * - Ein Klick auf die offene Zeile schliesst sie nicht, solange Zeigen
 *   oeffnet. Sonst wuerde, wer erst zeigt und dann klickt, genau die
 *   Zeile zuklappen, die er gerade lesen will.
 */
export function starte(feld: HTMLElement) {
  const zeigen = matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1000px)");
  for (const zeile of feld.querySelectorAll<HTMLDetailsElement>("details.zeile")) {
    const kopf = zeile.querySelector("summary");
    if (!kopf) continue;
    kopf.addEventListener("pointerenter", (e) => {
      if (zeigen.matches && e.pointerType === "mouse") zeile.open = true;
    });
    // Nur Tastaturfokus. Ein Tippen oder Klick fokussiert die Zeile auch,
    // aber vor dem Klick -- oeffnete schon der Fokus, klappte der Klick
    // sie gleich wieder zu.
    kopf.addEventListener("focus", () => {
      if (kopf.matches(":focus-visible")) zeile.open = true;
    });
    kopf.addEventListener("click", (e) => {
      if (zeigen.matches && zeile.open) e.preventDefault();
    });
  }
}
