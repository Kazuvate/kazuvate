/**
 * regler.ts
 *
 * Der Skizze-zu-Seite-Regler in Schritt 03 auf ablauf.html: links die
 * Skizze aus dem Entwurf, rechts dieselbe Seite gebaut, dazwischen ein
 * Griff. Seit 11.10.2026 gebaut, aber noch nicht zu sehen -- es gibt
 * bisher keine echte Skizze eines echten Projekts, siehe den Kommentar
 * am Regler in ablauf.html.
 *
 * Geladen wird diese Datei von src/ablauf.tsx, und zwar nur, wenn der
 * Regler auf der Seite sichtbar ist. Solange er `hidden` traegt, holt
 * der Browser sie gar nicht erst.
 *
 * Bedienung wie bei einem nativen Schieberegler (ARIA-Muster "slider"):
 * Pfeiltasten um fuenf, Bild auf und ab um ein Viertel, Pos1 und Ende an
 * die Raender. Die Tasten gelten nur, solange der Griff den Fokus hat;
 * an keiner anderen Stelle der Seite wird eine Taste umbelegt, das
 * Scrollen mit der Tastatur bleibt unberuehrt. Mit Maus oder Finger
 * genuegt ein Druck irgendwo auf das Bild, gezogen wird von dort aus.
 */

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

  // Der vorgelesene Wert steht in der Sprache der Seite im HTML,
  // {wert} wird ersetzt. Hier steht nur der Rueckfall.
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
