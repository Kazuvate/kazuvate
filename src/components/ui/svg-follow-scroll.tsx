"use client";

/**
 * svg-follow-scroll.tsx
 *
 * Herkunft: Skiper UI, Komponente "Skiper19" (skiperui.com), von Kasum
 * als vollstaendiger Code eingeschickt. Das Original ist eine eigene
 * 350vh-Marketingsektion mit eigener Ueberschrift, eigenem Scroll-Ziel
 * und einem "skiperui.com"-Abspann -- nichts davon gehoert auf
 * kazuvate.ch. Uebernommen ist der eigentliche Mechanismus, und zwar
 * bewusst so nah an der Vorlage wie moeglich: `useScroll` liefert
 * `scrollYProgress`, `useTransform` macht daraus `pathLength`, und ein
 * `<motion.path>` schreibt beides selbst ins SVG.
 *
 * Es gab zwischendurch eine Fassung, die `<motion.path>` durch ein
 * normales `<path>` plus `useMotionValueEvent` ersetzt hat, um Bundle-
 * Groesse zu sparen. Wieder verworfen: das ist Eigenbau an der Stelle,
 * an der framer-motion selbst am besten weiss, wie und wann es schreibt,
 * und Kasum wollte ausdruecklich die Komponente aus seiner Vorlage, nicht
 * eine optimierte Umdeutung davon.
 *
 * Angepasst gegenueber der Vorlage sind:
 * - **Scroll-Ziel von aussen** (`zielElement`) statt einer eigenen,
 *   kuenstlich 350vh hohen Sektion. Ziel ist `#hero-faden-bereich` in
 *   index.html: der Bereich von der H1 bis zum Ende von "Mit wem wir
 *   arbeiten" -- Kasums Vorgabe, wo die Linie beginnen und enden soll.
 * - **Farbe** `var(--olive)` aus stil/tokens.css statt des Neongruens
 *   `#C2F84F`. Eine fremde Akzentfarbe waere eine fremde Marke.
 * - **`offset`**, **Strichbreite**, **viewBox-Hoehe**,
 *   **preserveAspectRatio** und die **Kennlinie von Scroll zu
 *   pathLength** -- alle am 20.08.2026 korrigiert, weil der Faden zu
 *   duenn war, gequetscht aussah und beim Scrollen praktisch stillstand.
 *   Begruendung jeweils an der Stelle selbst.
 *
 * Die Pfaddaten sind unveraendert aus der Vorlage.
 */

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

import { cn } from "@/lib/utils";

interface FadenProps {
  /** DOM-Element, dessen Durchlauf die Linie zeichnet. */
  zielElement: HTMLElement;
  className?: string;
}

/** Rendert die Vorlage-Sektion nach, jetzt an einen echten Inhaltsbereich
 *  der Seite gebunden statt an eine eigene 350vh-Sektion. */
export function Faden({ zielElement, className }: FadenProps) {
  const zielRef = useRef<HTMLElement>(zielElement);

  const { scrollYProgress } = useScroll({
    target: zielRef,
    // Frueher stand hier ["start end", "end start"], der volle Durchlauf
    // des Bereichs durch das Fenster. Das ist zwar viel Scrollweg, aber
    // der falsche: "start end" laesst den Fortschritt beginnen, sobald der
    // Bereich von unten ins Bild kaeme. Der Bereich steht aber ganz oben
    // auf der Seite und ist beim ersten Bild schon da -- ein guter Teil
    // der Zeichnung war damit vor dem ersten Scrollen erledigt, und der
    // Rest lief weiter, als der Bereich oben schon aus dem Bild war.
    //
    // Jetzt: 0, sobald die Oberkante des Bereichs im obersten Fuenftel
    // des Fensters steht -- das ist genau dort, wo sie beim Laden schon
    // steht, der Faden legt also mit der ersten Mausraddrehung los.
    // ("start start" waere hier zu spaet: der Bereich beginnt 170px unter
    // der Fensteroberkante, die ersten 170px Scrollen passierte nichts,
    // und das Knaeuel oben war beim Fertigzeichnen schon halb aus dem
    // Bild geschoben.) 1, sobald die Unterkante des Bereichs im oberen
    // Viertel des Fensters steht. Bei 1440x900 rund 1040px Scrollweg.
    offset: ["start 20%", "end 25%"],
  });

  return (
    <LinePath
      className={cn("h-full w-full", className)}
      scrollYProgress={scrollYProgress}
    />
  );
}

const LinePath = ({
  className,
  scrollYProgress,
}: {
  className?: string;
  scrollYProgress: MotionValue<number>;
}) => {
  // Vorlage: [0, 1] -> [0.5, 1], linear von halb gezeichnet nach ganz.
  // Zwei Probleme damit, beide im Browser nachgemessen:
  //
  // 1. Der Pfad ist kein gleichmaessiger Strich. Die ersten 55 Prozent
  //    seiner Laenge (10919 Einheiten insgesamt) stecken im Knaeuel ganz
  //    oben, das nur ein Fuenftel der Hoehe einnimmt; die restlichen 45
  //    Prozent legen die ganze lange Fahrt nach unten zurueck. Linear
  //    abgebildet steht die Spitze also ueber die halbe Scrollstrecke
  //    fast still und schiesst danach nach unten weg.
  // 2. Mit Startwert 0.5 war das Knaeuel vor dem ersten Scrollen schon
  //    fertig -- genau der Teil, an dem Bewegung ueberhaupt auffaellt.
  //
  // Diese Stuetzpunkte biegen das gerade: das Knaeuel wird im ersten
  // Siebtel des Scrollwegs geschrieben, danach folgt die Spitze der
  // Leserichtung nach unten. Nachgemessen bei 1440x900 bleibt sie dabei
  // durchgehend zwischen 87px und 213px unter der Fensteroberkante, also
  // immer im Bild. Die Zahlen sind an diese Geometrie angepasst, sie sind
  // eine Gestaltungsentscheidung und keine Formel.
  const pathLength = useTransform(
    scrollYProgress,
    [0, 0.14, 0.4, 0.7, 1],
    [0.08, 0.56, 0.72, 0.88, 1],
  );

  return (
    <svg
      // Vorlage: "0 0 1278 2319". Der Pfad selbst reicht aber bis y=2669
      // (getBBox im Browser: 10.05/10.45 bis 1264.27/2668.89). Die letzten
      // gut 13 Prozent wurden also ausserhalb der viewBox gezeichnet und
      // vom SVG weggeschnitten: unsichtbar, obwohl der Fortschritt lief.
      // 2690 nimmt den ganzen Pfad auf, halbe Strichbreite eingerechnet.
      viewBox="0 0 1278 2690"
      fill="none"
      // Vorlage: "none". Das zerrt die Zeichnung auf die Kastenform -- bei
      // 220x1084 wurde die Breite gegenueber der Hoehe um Faktor 2.7
      // zusammengedrueckt, daher der gequetschte Eindruck. "meet" behaelt
      // das Seitenverhaeltnis des Pfads (1278:2690) und passt die Zeichnung
      // mittig in den Kasten ein. Die Groesse regelt jetzt allein die
      // Spaltenbreite in stil/basis.css (#faden-root).
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <motion.path
        d="M876.605 394.131C788.982 335.917 696.198 358.139 691.836 416.303C685.453 501.424 853.722 498.43 941.95 409.714C1016.1 335.156 1008.64 186.907 906.167 142.846C807.014 100.212 712.699 198.494 789.049 245.127C889.053 306.207 986.062 116.979 840.548 43.3233C743.932 -5.58141 678.027 57.1682 672.279 112.188C666.53 167.208 712.538 172.943 736.353 163.088C760.167 153.234 764.14 120.924 746.651 93.3868C717.461 47.4252 638.894 77.8642 601.018 116.979C568.164 150.908 557 201.079 576.467 246.924C593.342 286.664 630.24 310.55 671.68 302.614C756.114 286.446 729.747 206.546 681.86 186.442C630.54 164.898 492 209.318 495.026 287.644C496.837 334.494 518.402 366.466 582.455 367.287C680.013 368.538 771.538 299.456 898.634 292.434C1007.02 286.446 1192.67 309.384 1242.36 382.258C1266.99 418.39 1273.65 443.108 1247.75 474.477C1217.32 511.33 1149.4 511.259 1096.84 466.093C1044.29 420.928 1029.14 380.576 1033.97 324.172C1038.31 273.428 1069.55 228.986 1117.2 216.384C1152.2 207.128 1188.29 213.629 1194.45 245.127C1201.49 281.062 1132.22 280.104 1100.44 272.673C1065.32 264.464 1044.22 234.837 1032.77 201.413C1019.29 162.061 1029.71 131.126 1056.44 100.965C1086.19 67.4032 1143.96 54.5526 1175.78 86.1513C1207.02 117.17 1186.81 143.379 1156.22 166.691C1112.57 199.959 1052.57 186.238 999.784 155.164C957.312 130.164 899.171 63.7054 931.284 26.3214C952.068 2.12513 996.288 3.87363 1007.22 43.58C1018.15 83.2749 1003.56 122.644 975.969 163.376C948.377 204.107 907.272 255.122 913.558 321.045C919.727 385.734 990.968 497.068 1063.84 503.35C1111.46 507.456 1166.79 511.984 1175.68 464.527C1191.52 379.956 1101.26 334.985 1030.29 377.017C971.109 412.064 956.297 483.647 953.797 561.655C947.587 755.413 1197.56 941.828 936.039 1140.66C745.771 1285.32 321.926 950.737 134.536 1202.19C-6.68295 1391.68 -53.4837 1655.38 131.935 1760.5C478.381 1956.91 1124.19 1515 1201.28 1997.83C1273.66 2451.23 100.805 1864.7 303.794 2668.89"
        stroke="var(--olive)"
        // Vorlage: 20, davor hier 3. `vector-effect="non-scaling-stroke"`
        // rechnet in echten Bildschirmpixeln, nicht im viewBox-Massstab --
        // 3 war die Staerke der Haarlinien der Seite und damit auf einer
        // Zeichnung dieser Groesse zu duenn, um als Faden zu lesen. 5 ist
        // sichtbar ein Strich und bleibt weit weg vom Balken der Vorlage.
        strokeWidth="5"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        // Die Vorlage setzt hier zusaetzlich
        // `strokeDashoffset: useTransform(pathLength, (v) => 1 - v)`.
        // Im Browser nachgesehen: framer-motion baut aus `pathLength`
        // selbst `stroke-dasharray` und `stroke-dashoffset` als Attribute,
        // und dieser Wert kam dort nie an (gemessen: dashoffset bleibt
        // 0px). Die Zeile war wirkungslos -- und mit der Kennlinie oben
        // waere `1 - pathLength` ohnehin nicht mehr der passende Versatz.
        // Deshalb raus statt mitgeschleppt.
        style={{ pathLength }}
      />
    </svg>
  );
};
