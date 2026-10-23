// "Drei Dinge machen wir anders": oeffnet beim Zeigen die Zeile (details). Klick, Tippen und Enter gehen auch ohne dieses Skript.
export function starte(feld: HTMLElement) {
  const zeigen = matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1000px)");
  for (const zeile of feld.querySelectorAll<HTMLDetailsElement>("details.zeile")) {
    const kopf = zeile.querySelector("summary");
    if (!kopf) continue;
    kopf.addEventListener("pointerenter", (e) => {
      if (zeigen.matches && e.pointerType === "mouse") zeile.open = true;
    });
    kopf.addEventListener("focus", () => {
      if (kopf.matches(":focus-visible")) zeile.open = true;
    });
    kopf.addEventListener("click", (e) => {
      if (zeigen.matches && zeile.open) e.preventDefault();
    });
  }
}
