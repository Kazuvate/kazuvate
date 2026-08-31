/**
 * bewegung.ts
 *
 * Die GSAP-Schicht der Website. Ein einziges Modul, auf allen acht
 * Seiten per <script type="module" src="/src/bewegung.ts"> eingebunden.
 * Jede Funktion prueft selbst, ob ihre Ziel-Elemente auf der aktuellen
 * Seite existieren -- eine Datei fuer alle Seiten statt acht kleiner.
 *
 * Entscheidung vom 22.08.2026: Kasum wollte die Startseite "sehr
 * animiert" mit GSAP, mo.js und anime.js. Ruecksprache ergab: mo.js und
 * anime.js wieder raus (waren schon einmal installiert und am
 * 20.08.2026 auf sein eigenes Urteil hin wieder entfernt, siehe
 * Projektnotiz "Bewegung: eigener Code, ohne Scroll-Reveal" --
 * Begruendung damals: "das zeigt viel, das ist vom Vibe Coding").
 * GSAP bleibt, gezielt eingesetzt, "professionell" statt ueberladen.
 *
 * Das kehrt "kein Scroll-Reveal" bewusst teilweise um. Damit es nicht
 * nach generischem AOS.js aussieht, benutzt jede Animation hier exakt
 * die Werte, die schon vorher als Zielgroesse in der Markenrichtlinie
 * standen (00 Kontext/Kazuvate Marke, Tabelle "Bewegung"):
 * "Einblenden beim Scrollen: 650ms, 16px Versatz, einmal pro Element."
 * Diese Zahlen waren nie verworfen, nur die pauschale Umsetzung als
 * IntersectionObserver auf jedem Block. Hier laeuft dieselbe Absicht
 * ueber ScrollTrigger, gezielt pro Abschnitt statt blind auf alles.
 *
 * prefers-reduced-motion: alles unten steht in einer einzigen
 * gsap.matchMedia()-Bedingung. Trifft sie nicht zu, laufen weder Setup
 * (das Elemente unsichtbar macht) noch Animation -- der Besucher sieht
 * sofort den fertigen Zustand, nie einen Zwischenschritt.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Die Marken-Kurve, deckungsgleich mit --kurve in stil/tokens.css:
 * cubic-bezier(.22, 1, .36, 1). Eine einzige Kurve fuer CSS und GSAP,
 * damit sich keine Bewegung auf der Seite anders anfuehlt als der Rest.
 *
 * Bis zum 31.08.2026 kam sie aus GSAPs CustomEase-Plugin
 * (`CustomEase.create("kazuvate", "0.22, 1, 0.36, 1")`). Das Plugin
 * kann beliebige Pfade als Kurve lesen, gebraucht wurde davon ein
 * einziger cubic-bezier mit vier festen Zahlen. Dafuer lag es auf
 * jeder der acht Seiten im Bundle. Ersetzt durch die Rechnung, die
 * jeder Browser fuer `cubic-bezier()` ohnehin selbst macht.
 *
 * Verfahren: Newton-Raphson auf der x-Achse, um zum gesuchten
 * Fortschritt den Kurvenparameter t zu finden, dann y an dieser
 * Stelle. Konvergiert bei einer monotonen Kurve wie dieser in zwei
 * bis drei Schritten; die Bisektion danach ist der Rueckfall fuer den
 * Fall, dass die Ableitung zu flach wird. Beide Schleifen haben eine
 * feste Obergrenze, eine Animationsschleife darf nirgends haengen
 * bleiben koennen.
 *
 * Dreimal nachgemessen, jeweils ueber 1001 Stuetzstellen von 0 bis 1:
 *
 * 1. Gegen eine hochgenaue Bisektion derselben Bezier-Kurve (200
 *    Halbierungen, am Ende der Aufloesung eines double): groesste
 *    Abweichung 2.9e-7, bei 16px Versatz also 4.6e-6 Pixel. f(0) ist
 *    exakt 0, f(1) exakt 1, der Verlauf dazwischen monoton steigend.
 * 2. Gegen die abgeloeste CustomEase: groesste Abweichung 6.5e-4, das
 *    sind 0.01 Pixel. Die Abweichung liegt auf deren Seite -- das
 *    Plugin tastet die Kurve in Segmente ab, hier wird sie gerechnet.
 *    Die Bewegung fuehlt sich damit an wie vorher.
 * 3. In GSAP selbst, ueber einen pausierten Tween und .progress():
 *    GSAP nimmt die Funktion als ease an und rechnet daraus dieselben
 *    Werte, Abweichung 4.8e-7.
 */
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
  /* --- Scroll-Fortschritt -------------------------------------
     Ein 3px hoher Strich am oberen Bildrand, der sich mit dem
     Lesefortschritt fuellt. Markup und Grundfarbe stehen als
     .scroll-balken in jeder Seite, siehe stil/basis.css. Bewusst kein
     eigenes Icon oder Prozent-Text -- die Flaeche selbst traegt die
     Aussage, mehr waere auf dieser schmalen Zeile schon zu viel. */
  const balken = document.querySelector<HTMLElement>(".scroll-balken");
  if (balken) {
    gsap.set(balken, { scaleX: 0 });
    ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      onUpdate: (self) => gsap.set(balken, { scaleX: self.progress }),
    });
  }

  /* --- Genereller Eintritt --------------------------------------
     Jedes Element bekommt eine eigene ScrollTrigger-Instanz mit
     once:true -- sie zeichnet sich einmal und ist danach erledigt,
     kein Zurueckspulen beim Hochscrollen, kein zweites Abspielen.
     `stagger` ist hier keine echte GSAP-Stagger-Option, sondern ein
     Versatz in Sekunden zwischen den delay-Werten der Elemente: bei
     vertikal gestapelten Bloecken (die Ueber-uns-Abschnitte etwa)
     erreicht jedes seinen eigenen Ausloesepunkt ohnehin einzeln: der
     zusaetzliche delay macht daraus ein kurzes Nachziehen statt eines
     ruckartigen Auftauchens, auch wenn zwei Elemente zufaellig
     gleichzeitig in den Ausloesebereich kommen. */
  function eintritt(
    selektor: string,
    optionen: { stagger?: number; start?: string; scale?: boolean } = {},
  ) {
    const elemente = gsap.utils.toArray<HTMLElement>(selektor);
    if (!elemente.length) return;

    const stagger = optionen.stagger ?? 0;
    const start = optionen.start ?? "top 85%";

    elemente.forEach((el, i) => {
      gsap.set(el, {
        autoAlpha: 0,
        y: VERSATZ,
        ...(optionen.scale ? { scale: 0.97 } : {}),
      });
      gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: DAUER,
        ease: KURVE,
        delay: i * stagger,
        scrollTrigger: { trigger: el, start, once: true },
      });
    });
  }

  /* --- Startseite ------------------------------------------------ */
  // Die drei Ueber-uns-Abschnitte unter der H1. transform/opacity
  // beeinflussen keine Layout-Groesse, die Messung des Fadens daneben
  // (framer-motion, misst die Hoehe von #hero-faden-bereich) bleibt
  // davon unberuehrt.
  eintritt(".hero-abschnitt", { stagger: 0.12 });

  // "Was wir fuer Sie bauen": drei Zeichen-Titel-Text-Bloecke.
  eintritt("#leistungen .leistungen > li", { stagger: 0.1, scale: true });

  // "Warum kazuvate": die drei Bento-Kacheln.
  eintritt("#anders .kachel", { stagger: 0.12, scale: true });

  // Referenz-Kacheln auf der Startseite.
  eintritt("#referenz .referenz-kachel", { stagger: 0.12, scale: true });

  // Die vier Ablauf-Schritte der Kurzfassung.
  eintritt("#ablauf .ablauf > li", { stagger: 0.1 });

  // Der Abschluss-Block ganz unten (Zeile + Knopf).
  eintritt(".abschluss .wrap > *", { stagger: 0.08 });

  /* --- leistungen.html --------------------------------------- */
  eintritt(".leistung-gross", { stagger: 0.15 });

  /* --- ablauf.html ---------------------------------------------
     Der Fortschrittsstrang (src/components/ui/ablauf-strang.tsx)
     fuellt die Kreise bereits scroll-gebunden, siehe dort. Hier kommt
     nur der Text jedes Schritts dazu, mit demselben Ausloeser wie der
     Strang fast erreicht -- beides schaltet im selben Wimpernschlag,
     ohne dass die beiden Systeme voneinander wissen muessen. */
  eintritt(".ablauf-schritt .ablauf-inhalt", { start: "top 78%" });

  /* --- referenzen/index.html ----------------------------------- */
  eintritt(".referenz-galerie .referenz-kachel", { stagger: 0.12, scale: true });

  /* --- kontakt.html -----------------------------------------------
     Kurzer Ausloeser (95% statt 85%): die Seite hat kein langes
     Vorspiel, Formular und Kontaktdaten stehen praktisch sofort im
     Bild. Ein spaeter Ausloeser wuerde das Formular kuenstlich laenger
     unbenutzbar wirken lassen, als es tatsaechlich ist. */
  eintritt(".kontakt-links > *", { stagger: 0.07, start: "top 95%" });
  eintritt(".kontakt-rechts", { start: "top 95%" });

  /* --- danke.html -------------------------------------------------
     Einzige Seite ohne Scroll-Bezug: alles steht ohnehin im ersten
     Bildschirm, es gibt nichts zum Herunterscrollen. Der Eintritt
     laeuft deshalb sofort beim Laden, nicht ueber ScrollTrigger. */
  const danke = document.querySelector<HTMLElement>(".danke-inhalt");
  if (danke && danke.children.length) {
    const kinder = Array.from(danke.children) as HTMLElement[];
    gsap.set(kinder, { autoAlpha: 0, y: VERSATZ });
    gsap.to(kinder, {
      autoAlpha: 1,
      y: 0,
      duration: DAUER,
      ease: KURVE,
      stagger: 0.08,
      delay: 0.1,
    });
  }
});
