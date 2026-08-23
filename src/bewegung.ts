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
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(ScrollTrigger, CustomEase);

// Deckt sich mit --kurve in stil/tokens.css: cubic-bezier(.22,1,.36,1).
// Eine einzige Kurve fuer CSS und GSAP, damit sich keine Bewegung auf
// der Seite anders anfuehlt als der Rest.
CustomEase.create("kazuvate", "0.22, 1, 0.36, 1");

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
        ease: "kazuvate",
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
      ease: "kazuvate",
      stagger: 0.08,
      delay: 0.1,
    });
  }
});
