"use client";

// Fortschrittsstrang auf ablauf.html: fuellt sich beim Scrollen, ein Ring leuchtet an jedem erreichten Knoten auf.

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";

interface StrangProps {
  liste: HTMLElement;
}

interface Mass {
  start: number;
  laenge: number;
  mitteX: number;
  knotenGroesse: number;
  knoten: number[];
}

export function AblaufStrang({ liste }: StrangProps) {
  const [mass, setMass] = useState<Mass | null>(null);

  useLayoutEffect(() => {
    const messen = () => {
      const kreise = Array.from(
        liste.querySelectorAll<HTMLElement>(".ablauf-zahl"),
      );

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

    const beobachter = new ResizeObserver(messen);
    beobachter.observe(liste);
    return () => beobachter.disconnect();
  }, [liste]);

  if (!mass) return null;

  return <Spur mass={mass} liste={liste} />;
}

function Spur({ mass, liste }: { mass: Mass; liste: HTMLElement }) {
  const spurRef = useRef<HTMLDivElement>(null);
  const wenigerBewegung = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: spurRef,
    offset: ["start center", "end center"],
  });

  const zahlen = useRef<HTMLElement[]>([]);

  const anwenden = (wert: number) => {
    zahlen.current.forEach((z, i) => {
      const anteil = mass.knoten[i];
      if (anteil === undefined) return;
      z.classList.toggle("ist-erreicht", wert >= anteil - 0.04);
    });
  };

  useLayoutEffect(() => {
    zahlen.current = Array.from(
      liste.querySelectorAll<HTMLElement>(".ablauf-zahl"),
    );

    if (wenigerBewegung) {
      zahlen.current.forEach((z) => z.classList.add("ist-erreicht"));
    } else {
      anwenden(scrollYProgress.get());
    }

    const beimVerlassen = zahlen.current;
    return () => beimVerlassen.forEach((z) => z.classList.remove("ist-erreicht"));
  }, [liste, wenigerBewegung, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", (wert) => {
    if (wenigerBewegung) return;
    anwenden(wert);
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
      <motion.div
        className="strang-fuellung"
        style={{ scaleY: wenigerBewegung ? 1 : scrollYProgress }}
      />

      {!wenigerBewegung && (
        <Spitze scrollYProgress={scrollYProgress} laenge={mass.laenge} />
      )}

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
