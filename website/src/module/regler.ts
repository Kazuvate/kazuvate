// Skizze-zu-Seite-Regler (Ablauf, Schritt 03) als ARIA-Slider. Noch versteckt, es fehlt eine echte Skizze.

const TASTEN: Record<string, number> = {
  ArrowLeft: -5,
  ArrowDown: -5,
  ArrowRight: 5,
  ArrowUp: 5,
  PageDown: -25,
  PageUp: 25,
};

export function reglerStarten(regler: HTMLElement) {
  const buehne = regler.querySelector<HTMLElement>(".regler-buehne");
  const griff = regler.querySelector<HTMLElement>(".regler-griff");
  if (!buehne || !griff) return;

  const vorlage = griff.dataset.wertText ?? "{wert} %";
  let wert = Number(griff.getAttribute("aria-valuenow")) || 50;

  const setzen = (neu: number) => {
    wert = Math.min(100, Math.max(0, Math.round(neu)));
    buehne.style.setProperty("--teilung", `${wert}%`);
    griff.setAttribute("aria-valuenow", String(wert));
    griff.setAttribute("aria-valuetext", vorlage.replace("{wert}", String(wert)));
  };

  const ausZeiger = (ereignis: PointerEvent) => {
    const r = buehne.getBoundingClientRect();
    if (r.width > 0) setzen(((ereignis.clientX - r.left) / r.width) * 100);
  };

  buehne.addEventListener("pointerdown", (ereignis) => {
    if (ereignis.button !== 0) return;
    buehne.setPointerCapture(ereignis.pointerId);
    ausZeiger(ereignis);
  });

  buehne.addEventListener("pointermove", (ereignis) => {
    if (buehne.hasPointerCapture(ereignis.pointerId)) ausZeiger(ereignis);
  });

  griff.addEventListener("keydown", (ereignis) => {
    if (ereignis.key === "Home") setzen(0);
    else if (ereignis.key === "End") setzen(100);
    else if (ereignis.key in TASTEN) setzen(wert + TASTEN[ereignis.key]);
    else return;
    ereignis.preventDefault();
  });

  setzen(wert);
}
