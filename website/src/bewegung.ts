// GSAP-Schicht und Seitenwechsel fuer alle Seiten. Jede Funktion prueft selbst, ob ihre Elemente da sind.
// Bewegung nur ohne reduzierte Bewegung (gsap.matchMedia), sonst steht gleich der Endzustand da.
// Was nur eine Seite oder ein Geraet braucht, laedt src/module/ per import() nach.

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

{
  const wurzel = document.documentElement;
  const linieDa = () => wurzel.classList.add("linie-da");
  if (CSS.supports("selector(:active-view-transition)") && wurzel.matches(":active-view-transition")) {
    linieDa();
  } else {
    window.addEventListener(
      "pagereveal",
      (e) => { if ((e as Event & { viewTransition?: unknown }).viewTransition) linieDa(); },
      { once: true },
    );
  }
}

{
  const fuss = document.querySelector<HTMLElement>(".fuss");
  const zeichen = document.querySelector<SVGSVGElement>(".fuss-zeichen");
  const pfad = document.querySelector("#marke path")?.getAttribute("d");
  const passt = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  if (fuss && zeichen && pfad && passt.matches) {
    fuss.addEventListener(
      "pointerenter",
      () => { import("./module/kv-punkte").then((m) => m.starte(fuss, zeichen, pfad)); },
      { once: true },
    );
  }
}

{
  const feld = document.querySelector<HTMLElement>(".anders-zeilen");
  if (feld) import("./module/zeilen").then((m) => m.starte(feld));
}

{
  const blatt = document.getElementById("fragen");
  if (blatt) import("./module/fragen").then((m) => m.starte(blatt));
}

{
  const kacheln = document.querySelectorAll<HTMLAnchorElement>(".referenz-kachel");
  const passt = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  if (kacheln.length && passt.matches) import("./module/kachel-lauf").then((m) => m.starte(kacheln));
}

function kubischeKurve(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const xBei = (t: number) => ((ax * t + bx) * t + cx) * t;
  const yBei = (t: number) => ((ay * t + by) * t + cy) * t;
  const steigung = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (fortschritt: number): number => {
    if (fortschritt <= 0) return 0;
    if (fortschritt >= 1) return 1;

    let t = fortschritt;
    for (let i = 0; i < 8; i++) {
      const abweichung = xBei(t) - fortschritt;
      if (Math.abs(abweichung) < 1e-7) return yBei(t);
      const m = steigung(t);
      if (Math.abs(m) < 1e-7) break;
      t -= abweichung / m;
    }

    let unten = 0;
    let oben = 1;
    t = fortschritt;
    for (let i = 0; i < 32 && oben - unten > 1e-7; i++) {
      if (xBei(t) < fortschritt) unten = t;
      else oben = t;
      t = (unten + oben) / 2;
    }
    return yBei(t);
  };
}

const KURVE = kubischeKurve(0.22, 1, 0.36, 1);

const DAUER = 0.65; // 650ms, siehe Kazuvate Marke, Tabelle "Bewegung"
const VERSATZ = 16; // 16px, dieselbe Quelle

gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
  function eintritt(selektor: string, start = "top 85%") {
    const elemente = gsap.utils.toArray<HTMLElement>(selektor);
    if (!elemente.length) return;

    elemente.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) return;

      gsap.set(el, { autoAlpha: 0, y: VERSATZ });
      gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        duration: DAUER,
        ease: KURVE,
        scrollTrigger: { trigger: el, start, once: true },
      });
    });
  }

  eintritt("#leistungen .leistungen > li");

  eintritt("#referenz .filmbild");

  eintritt("#ablauf .ablauf > li");

  eintritt(".leistung-gross");

  eintritt(".ablauf-schritt .ablauf-inhalt", "top 78%");

  eintritt(".referenz-galerie .filmbild", "top 95%");

});
