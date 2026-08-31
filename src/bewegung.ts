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
 * IntersectionObserver auf jedem Block.
 *
 * **Nachgeschaerft am 31.08.2026.** Der Anspruch "gezielt pro
 * Abschnitt statt blind auf alles" stand hier seit dem 22.08.2026 im
 * Kommentar, eingeloest war er nicht: elf Aufrufe deckten praktisch
 * jeden Block jeder Seite ab, dazu Stagger und Scale. Raus sind der
 * Fortschrittsbalken, der Stagger, das Scale und jeder Eintritt auf
 * Inhalt, der beim Laden ohnehin im Bild steht. Ausfuehrlich beim
 * Aufbau der Funktion weiter unten.
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
  /* --- Eintritt beim Scrollen ------------------------------------
     Ein Element, das noch unter der Falz liegt, blendet beim
     Heraufscrollen einmal ein: Deckkraft 0 auf 1, dazu 16px von unten.
     Danach ist es erledigt (`once: true`), kein Zurueckspulen, kein
     zweites Abspielen.

     ## Was am 31.08.2026 rausgeflogen ist und warum

     Vorher lag derselbe Effekt auf praktisch jedem Block der Website,
     mit drei Zutaten, die einzeln harmlos sind und zusammen das
     bekannteste Erkennungszeichen generisch gebauter Seiten ergeben:

     1. **stagger.** Jedes Element bekam zusaetzlich zu seinem eigenen
        Ausloesepunkt ein `delay` von 70 bis 150ms mal Position. Bei
        drei nebeneinanderliegenden Karten heisst das: Karte 1, kurze
        Pause, Karte 2, kurze Pause, Karte 3. Genau diese Kaskade.
        Jetzt loest jedes Element an seiner eigenen Position aus und
        sonst nichts -- nebeneinanderliegende Karten kommen damit
        zusammen, was auch stimmt: sie werden ja gleichzeitig sichtbar.

     2. **scale.** Vier der Aufrufe starteten zusaetzlich bei 0.97 und
        wuchsen auf 1. Zwei Eigenschaften gleichzeitig zu animieren ist
        laut Markenrichtlinie ohnehin ausgeschlossen ("Nie zwei
        Eigenschaften gleichzeitig animieren"); mit Deckkraft und
        Versatz waren es sogar drei.

     3. **Bloecke, die schon im Bild stehen.** Die drei Ueber-uns-
        Abschnitte der Startseite, der Abschlussblock, die linke und
        rechte Spalte der Kontaktseite und der ganze Inhalt von
        danke.html sind beim Laden bereits sichtbar oder fast. Sie
        einzublenden hat nichts enthuellt, es hat den Aufbau der Seite
        nur verzoegert. Auf der Kontaktseite blendete sogar jeder
        einzelne Absatz der linken Spalte fuer sich ein, Augenbraue,
        Ueberschrift, Vorspann, Telefonnummer, Ortszeile -- fuenf
        Bewegungen, bevor man die Nummer waehlen konnte.

     Uebrig bleibt der Fall, fuer den der Effekt gedacht ist: eine
     Liste oder ein Raster, das beim Herunterscrollen tatsaechlich neu
     ins Bild kommt. Sieben Aufrufe statt elf.

     Die Werte sind unveraendert die aus der Markenrichtlinie: 650ms,
     16px, einmal pro Element, Kurve cubic-bezier(.22,1,.36,1). */
  function eintritt(selektor: string, start = "top 85%") {
    const elemente = gsap.utils.toArray<HTMLElement>(selektor);
    if (!elemente.length) return;

    elemente.forEach((el) => {
      // Wer beim Laden schon im Bild steht, wird nicht angefasst.
      //
      // Das ist die Regel, auf der der ganze Abschnitt steht: eingeblendet
      // wird nur, was tatsaechlich verdeckt ist. Ohne diese Zeile war das
      // Gegenteil der Fall -- auf leistungen.html standen die ersten
      // beiden Bloecke bei 405px und 764px in einem 900px hohen Fenster,
      // auf referenzen/index.html alle drei Kacheln bei 464px, und alle
      // warteten trotzdem unsichtbar auf eine Scrollbewegung. Der
      // Besucher sah eine leere Seite und musste sie erst anstupsen,
      // damit der Inhalt erscheint, fuer den er gekommen ist.
      //
      // Der Test steht hier statt als handgesetzter `start`-Wert pro
      // Seite, weil er sonst bei jeder neuen Sektion und jeder
      // Fenstergroesse neu geraten werden muesste. getBoundingClientRect
      // liest den fertigen Zustand: dieses Modul laedt als type="module"
      // und laeuft damit nach dem Aufbau des Dokuments.
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

  /* --- Startseite ------------------------------------------------
     Die drei Ueber-uns-Abschnitte unter der H1 stehen bewusst nicht
     mehr hier: sie sind der erste Text, den jemand liest, und der
     gehoert beim Laden da. */

  // "Was wir fuer Sie bauen": drei Zeichen-Titel-Text-Bloecke.
  eintritt("#leistungen .leistungen > li");

  // "Warum kazuvate": die drei Bento-Kacheln.
  eintritt("#anders .kachel");

  // Referenz-Kacheln auf der Startseite.
  eintritt("#referenz .referenz-kachel");

  // Die vier Ablauf-Schritte der Kurzfassung.
  eintritt("#ablauf .ablauf > li");

  /* --- leistungen.html --------------------------------------- */
  eintritt(".leistung-gross");

  /* --- ablauf.html ---------------------------------------------
     Der Fortschrittsstrang (src/components/ui/ablauf-strang.tsx)
     fuellt die Kreise bereits scroll-gebunden, siehe dort. Hier kommt
     nur der Text jedes Schritts dazu, mit demselben Ausloeser wie der
     Strang fast erreicht -- beides schaltet im selben Wimpernschlag,
     ohne dass die beiden Systeme voneinander wissen muessen. */
  eintritt(".ablauf-schritt .ablauf-inhalt", "top 78%");

  /* --- referenzen/index.html -----------------------------------
     Die Galerie beginnt unter dem Titelband, die erste Reihe steht
     beim Laden also schon halb im Bild. `top 95%` statt 85%, damit
     sie nicht kuenstlich lange leer bleibt. */
  eintritt(".referenz-galerie .referenz-kachel", "top 95%");

  /* kontakt.html und danke.html haben keinen Eintritt mehr. Beide
     Seiten passen praktisch in einen Bildschirm; was dort eingeblendet
     wurde, war nie verdeckt. */
});
