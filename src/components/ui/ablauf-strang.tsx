"use client";

/**
 * ablauf-strang.tsx
 *
 * Der Fortschrittsstrang auf ablauf.html: eine Linie, die sich beim
 * Runterscrollen von Schritt 01 bis Schritt 04 fuellt, mit einem Punkt
 * an ihrer Spitze und einem Ring, der an jedem erreichten Knoten
 * aufleuchtet.
 *
 * Vorbild ist notemage.app, von Kasum als Referenz geschickt. Dort
 * heisst der Bereich `.pl-track` und besteht aus zwei deckungsgleichen
 * SVG-Pfaden: `.pl-base` blass im Hintergrund, `.pl-fill` in der
 * Markenfarbe darueber, dessen `stroke-dashoffset` am Scrollfortschritt
 * haengt; die erreichten Knoten bekommen eine Klasse `.pl-lit`.
 *
 * Uebernommen ist das Prinzip, nicht die Technik. Bei notemage ist der
 * Pfad geschwungen, deshalb braucht es dort ein SVG und die Rechnung
 * ueber die Pfadlaenge. Der Strang hier ist kerzengerade -- eine Linie
 * mit `scaleY` erledigt dasselbe, laeuft auf der Grafikkarte und
 * braucht kein Vermessen von Pfaden.
 *
 * **Das ist kein Scroll-Reveal.** Kasum hat am 20.08.2026 alle Bloecke
 * abgelehnt, die beim Runterscrollen einblenden; dieser Strang blendet
 * nichts ein. Jeder Schritt steht von Anfang an vollstaendig da, mit
 * Kreis, Nummer, Text und Fakten. Bewegt wird nur die Anzeige, wie weit
 * man selbst gekommen ist.
 *
 * Ohne JavaScript passiert nichts: dann bleibt die blasse Grundspur aus
 * stil/ablauf.css stehen, genau wie vor dem 21.08.2026.
 */

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";

interface StrangProps {
  /** Die <ol> mit den Schritten. Liefert Position und Groesse der Knoten. */
  liste: HTMLElement;
}

/** Was gemessen werden muss, bevor gezeichnet werden kann. Alles in
 *  Pixeln, relativ zur Oberkante der Liste. */
interface Mass {
  /** Mitte des ersten Knotens. Dort beginnt die Spur. */
  start: number;
  /** Von der Mitte des ersten bis zur Mitte des letzten Knotens. */
  laenge: number;
  /** Waagrechte Mitte der Knotenspalte. */
  mitteX: number;
  /** Durchmesser eines Knotens, fuer die Ringe. */
  knotenGroesse: number;
  /** Anteil an der Spurlaenge, an dem jeder Knoten sitzt (0 bis 1). */
  knoten: number[];
}

export function AblaufStrang({ liste }: StrangProps) {
  const [mass, setMass] = useState<Mass | null>(null);

  useLayoutEffect(() => {
    const messen = () => {
      const kreise = Array.from(
        liste.querySelectorAll<HTMLElement>(".ablauf-zahl"),
      );

      // Unter 760px steht die Nummer ueber dem Text statt in einer
      // eigenen Spalte, dort gibt es gar keinen Strang -- siehe
      // stil/ablauf.css. Zwei Knoten braucht es mindestens, sonst
      // hat eine Verbindungslinie nichts zu verbinden.
      if (kreise.length < 2 || !window.matchMedia("(min-width: 760px)").matches) {
        setMass(null);
        return;
      }

      const listeOben = liste.getBoundingClientRect().top;
      const mitten = kreise.map((k) => {
        const r = k.getBoundingClientRect();
        return { y: r.top - listeOben + r.height / 2, x: r.left, d: r.width };
      });

      const start = mitten[0].y;
      const laenge = mitten[mitten.length - 1].y - start;
      if (laenge <= 0) {
        setMass(null);
        return;
      }

      setMass({
        start,
        laenge,
        mitteX: mitten[0].x - liste.getBoundingClientRect().left + mitten[0].d / 2,
        knotenGroesse: mitten[0].d,
        knoten: mitten.map((m) => (m.y - start) / laenge),
      });
    };

    messen();

    // Die Schritte sind unterschiedlich hoch, sobald ein Text anders
    // umbricht -- bei jeder Breitenaenderung stimmen die gemessenen
    // Abstaende also nicht mehr. ResizeObserver statt eines
    // resize-Listeners am Fenster, weil sich die Liste auch ohne
    // Fensteraenderung verschieben kann, etwa wenn eine Schrift
    // nachlaedt.
    const beobachter = new ResizeObserver(messen);
    beobachter.observe(liste);
    return () => beobachter.disconnect();
  }, [liste]);

  // Erst zeichnen, wenn gemessen ist. Die Spur muss beim ersten Rendern
  // schon an ihrem Platz stehen, sonst misst useScroll darunter eine
  // Geometrie, die es so nie gab.
  if (!mass) return null;

  return <Spur mass={mass} />;
}

function Spur({ mass }: { mass: Mass }) {
  const spurRef = useRef<HTMLDivElement>(null);
  const wenigerBewegung = useReducedMotion();

  // Ziel ist die Spur selbst, nicht die Liste: die Spur reicht genau
  // von der Mitte des ersten bis zur Mitte des letzten Knotens. Mit
  // ["start center", "end center"] steht die Spitze damit immer auf
  // Fenstermitte -- man scrollt, und der Punkt bleibt dort, wo man
  // gerade liest. Waere das Ziel die ganze Liste, liefe die Spitze der
  // Leserichtung voraus oder hinterher.
  const { scrollYProgress } = useScroll({
    target: spurRef,
    offset: ["start center", "end center"],
  });

  return (
    <div
      className="strang"
      ref={spurRef}
      style={{
        top: mass.start,
        height: mass.laenge,
        left: mass.mitteX,
      }}
    >
      {/* Die Fuellung. transform-origin: top steht im CSS, damit sie
          von oben nach unten waechst statt aus der Mitte.
          scaleY statt height: height laesst den Browser bei jedem
          Scrollschritt neu umbrechen, scaleY nicht. */}
      <motion.div
        className="strang-fuellung"
        style={{ scaleY: wenigerBewegung ? 1 : scrollYProgress }}
      />

      {/* Die Spitze. Liegt bewusst hinter den Knoten (z-index im CSS):
          so verschwindet sie in einem Kreis und kommt darunter wieder
          heraus, statt ueber der Nummer zu kleben. */}
      {!wenigerBewegung && (
        <Spitze scrollYProgress={scrollYProgress} laenge={mass.laenge} />
      )}

      {/* Ein Ring je Knoten, der aufleuchtet sobald die Spitze ihn
          erreicht. Nur Kontur, keine Fuellung -- ein gefuellter Kreis
          wuerde die Nummer darunter verdecken. */}
      {mass.knoten.map((anteil, i) => (
        <Ring
          key={i}
          anteil={anteil}
          groesse={mass.knotenGroesse}
          oben={anteil * mass.laenge}
          scrollYProgress={scrollYProgress}
          immerAn={Boolean(wenigerBewegung)}
        />
      ))}
    </div>
  );
}

function Spitze({
  scrollYProgress,
  laenge,
}: {
  scrollYProgress: MotionValue<number>;
  laenge: number;
}) {
  const y = useTransform(scrollYProgress, [0, 1], [0, laenge]);
  return <motion.span className="strang-spitze" style={{ y }} aria-hidden="true" />;
}

function Ring({
  anteil,
  groesse,
  oben,
  scrollYProgress,
  immerAn,
}: {
  anteil: number;
  groesse: number;
  oben: number;
  scrollYProgress: MotionValue<number>;
  immerAn: boolean;
}) {
  // Der Ring geht auf, kurz bevor die Spitze den Knoten erreicht, und
  // bleibt danach an. Die 0.04 sind rund vier Prozent der Spurlaenge:
  // genug, dass der Wechsel weich wirkt, zu wenig, dass zwei Knoten
  // gleichzeitig angingen -- vier Knoten liegen 0.33 auseinander.
  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, anteil - 0.04), anteil],
    [0, 1],
  );

  return (
    <motion.span
      className="strang-ring"
      aria-hidden="true"
      style={{
        top: oben,
        width: groesse,
        height: groesse,
        opacity: immerAn ? 1 : opacity,
      }}
    />
  );
}
