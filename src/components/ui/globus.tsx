"use client";

/**
 * globus.tsx
 *
 * Der sich drehende 3D-Globus neben Leistung 02 ("Sichtbarkeit") auf
 * leistungen.html. Angepasste Fassung des Aceternity-Bauteils
 * `ui/globe` (three-globe + react-three-fiber), das Kasum am
 * 21.08.2026 geschickt hat.
 *
 * Was gegenueber der Vorlage anders ist und warum:
 *
 * 1. **Kein Next.js.** Die Vorlage laedt `World` per `next/dynamic` mit
 *    `ssr:false`. Dieses Projekt ist Vite ohne Server-Rendering, es gibt
 *    also gar kein SSR abzuschalten. Das Nachladen uebernimmt
 *    `React.lazy` in src/leistungen.tsx.
 *
 * 2. **Kein `@react-three/drei`.** Die Vorlage holt sich OrbitControls
 *    nur fuer `autoRotate`. Eine ganze Bibliothek fuer eine Drehung ist
 *    zu teuer, wenn das Budget ohnehin reisst -- die Drehung sind hier
 *    drei Zeilen in `useFrame`. Nebeneffekt: der Globus laesst sich
 *    nicht mit der Maus drehen. Gefordert war "dreht sich selber",
 *    nicht "zum Anfassen".
 *
 * 3. **Keine Tailwind-Klassen, keine Hex-Werte.** Die Farben kommen zur
 *    Laufzeit aus stil/tokens.css (siehe `token()` weiter unten), damit
 *    die Regel "tokens.css ist die einzige Farbquelle" auch fuer den
 *    Globus gilt. Aendert jemand dort das Oliv, dreht sich hier ein
 *    anderes Oliv.
 *
 * 4. **`prefers-reduced-motion` schaltet alles ab**, wie ueberall sonst
 *    auf der Seite: keine Eigendrehung, keine wandernden Boegen, keine
 *    Ringe. Der Globus steht dann einfach da. Zusaetzlich laeuft die
 *    Render-Schleife in dem Fall nur auf Anforderung (`frameloop`),
 *    statt 60-mal pro Sekunde ein unveraendertes Bild zu zeichnen.
 *
 * **Kein Scroll-Reveal.** Der Globus haengt an keiner Scrollposition.
 * Er beginnt sich zu drehen, sobald er da ist, und hoert nicht wieder
 * auf -- dieselbe Sorte Bewegung wie die Strichzeichnung der
 * Leistungs-Symbole auf der Startseite, die an das Laden gebunden ist.
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Color,
  Fog,
  type Mesh,
  type MeshPhongMaterial,
  type Material,
} from "three";
import ThreeGlobe from "three-globe";

/** Ein Bogen von Ort zu Ort. Gleiche Felder wie in der Vorlage. */
export interface Bogen {
  /** Staffelung: Boegen derselben Ordnung starten gemeinsam. */
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  /** Scheitelhoehe, 0 = am Boden, 1 = ein Erdradius darueber. */
  arcAlt: number;
  color: string;
}

export interface GlobusConfig {
  globeColor: string;
  emissive: string;
  emissiveIntensity: number;
  shininess: number;
  polygonColor: string;
  showAtmosphere: boolean;
  atmosphereColor: string;
  atmosphereAltitude: number;
  ambientLight: string;
  directionalLeftLight: string;
  directionalTopLight: string;
  pointLight: string;
  nebelFarbe: string;
  /** Laufzeit eines Bogens in Millisekunden. */
  arcTime: number;
  /** Anteil des Bogens, der gleichzeitig sichtbar ist (0 bis 1). */
  arcLength: number;
  maxRings: number;
  /** Grad pro Sekunde. */
  autoRotateSpeed: number;
  /** Laengengrad, der beim Start vorne steht. */
  startLng: number;
}

interface GeoJson {
  /* `object[]` und nicht `unknown[]`: three-globe erwartet in allen
     *Data()-Methoden Objekte, weil es die Eintraege selbst als Schluessel
     in Maps benutzt. */
  features: object[];
}

/**
 * Liest einen Wert aus stil/tokens.css. Der zweite Parameter ist kein
 * Ersatzwert im Sinne von "Farbe ausgedacht", sondern die Notbremse,
 * falls das Stylesheet noch nicht da ist -- dann steht ein neutrales
 * Grau statt eines leeren Strings, der three.js zum Absturz braechte.
 */
function token(name: string, notfall: string): string {
  if (typeof window === "undefined") return notfall;
  const wert = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return wert || notfall;
}

/** Die Farbtafel des Globus, komplett aus den Tokens der Marke. */
export function globusConfigAusTokens(): GlobusConfig {
  return {
    // Die Kugel selbst traegt denselben dunklen Oliv-Ton wie Kopf und
    // Fuss. Damit ist der Globus erkennbar dieselbe Flaeche wie der
    // Rest der Marke und nicht ein blaues Fremdteil (die Vorlage hatte
    // #062056, ein Marineblau).
    globeColor: token("--flaeche", "#2C3616"),
    emissive: token("--flaeche-tief", "#222A10"),
    emissiveIntensity: 0.12,
    shininess: 0.85,
    // Die Laendermasken als Punktraster. Heller Oliv, sonst waeren sie
    // auf der dunklen Kugel nicht zu sehen.
    polygonColor: token("--olive-hell", "#93AA5E"),
    showAtmosphere: true,
    atmosphereColor: token("--olive-hell", "#93AA5E"),
    atmosphereAltitude: 0.13,
    ambientLight: token("--olive-hell", "#93AA5E"),
    directionalLeftLight: token("--auf-flaeche", "#F7F7F1"),
    directionalTopLight: token("--auf-flaeche", "#F7F7F1"),
    pointLight: token("--auf-flaeche", "#F7F7F1"),
    // Der Nebel traegt den Papierton der Seite: die Rueckseite der
    // Kugel verliert sich damit in den Seitenhintergrund statt in ein
    // Grau, das dort nicht hingehoert.
    nebelFarbe: token("--grund", "#F5F4EF"),
    arcTime: 2600,
    arcLength: 0.85,
    maxRings: 3,
    autoRotateSpeed: 5.5,
    startLng: 7.59, // Basel
  };
}

/**
 * Der Koerper selbst. Steckt in einem eigenen Bauteil, weil er die
 * three.js-Szene aus dem Canvas-Kontext braucht -- `useThree` gibt es
 * nur innerhalb von `<Canvas>`.
 */
function GlobusKoerper({
  config,
  bogen,
  laender,
  ruhig,
}: {
  config: GlobusConfig;
  bogen: Bogen[];
  laender: GeoJson;
  ruhig: boolean;
}) {
  const { scene } = useThree();

  // Genau einmal erzeugen. `animateIn` laesst die Kugel beim ersten
  // Erscheinen aufziehen -- an das Laden gebunden, nicht ans Scrollen.
  const globus = useMemo(
    () => new ThreeGlobe({ waitForGlobeReady: true, animateIn: !ruhig }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    scene.add(globus);
    scene.fog = new Fog(new Color(config.nebelFarbe).getHex(), 400, 2000);

    return () => {
      scene.remove(globus);
      // three.js raeumt WebGL-Speicher nicht von selbst auf. Ohne das
      // haelt jeder Wechsel (im Entwicklungsmodus mountet StrictMode
      // absichtlich zweimal) Geometrien und Texturen fest.
      globus.traverse((teil) => {
        const mesh = teil as Mesh;
        mesh.geometry?.dispose?.();
        const material = mesh.material as Material | Material[] | undefined;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose?.();
      });
    };
  }, [scene, globus, config.nebelFarbe]);

  // --- Kugel, Laender, Atmosphaere ---
  useEffect(() => {
    globus
      .hexPolygonsData(laender.features)
      // 3 statt der Vorlagen-Aufloesung: der Globus ist hier rund
      // 380 statt 1000 Pixel breit, feinere Raster verpuffen und
      // kosten nur Dreiecke.
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.72)
      .hexPolygonColor(() => config.polygonColor)
      .showAtmosphere(config.showAtmosphere)
      .atmosphereColor(config.atmosphereColor)
      .atmosphereAltitude(config.atmosphereAltitude);

    const material = globus.globeMaterial() as MeshPhongMaterial;
    material.color = new Color(config.globeColor);
    material.emissive = new Color(config.emissive);
    material.emissiveIntensity = config.emissiveIntensity;
    material.shininess = config.shininess;

    // Ausrichtung: `rotation.y` dreht den gewuenschten Laengengrad nach
    // vorne (siehe Herleitung -- three-globe legt lat/lng 0 auf +Z, die
    // Kamera steht ebenfalls auf +Z). `rotation.x` kippt die Achse wie
    // bei einem Globus auf einem Stativ, sonst schaut man dauerhaft auf
    // den Aequator und die Schweiz bliebe am oberen Rand.
    // Reihenfolge XYZ heisst: erst drehen, dann kippen -- genau richtig,
    // die Kippung soll sich nicht mitdrehen.
    globus.rotation.y = (-config.startLng * Math.PI) / 180;
    globus.rotation.x = 0.38;
  }, [globus, laender, config]);

  // --- Boegen und Ortspunkte ---
  useEffect(() => {
    globus
      .arcsData(bogen)
      // Die Parameter stehen ausgeschrieben da, weil three-globe fuer
      // diese Methoden ueberladene Signaturen hat (Wert *oder* Funktion)
      // und TypeScript den Typ deshalb nicht selbst herleitet.
      .arcStartLat((d: object) => (d as Bogen).startLat)
      .arcStartLng((d: object) => (d as Bogen).startLng)
      .arcEndLat((d: object) => (d as Bogen).endLat)
      .arcEndLng((d: object) => (d as Bogen).endLng)
      .arcColor((d: object) => (d as Bogen).color)
      .arcAltitude((d: object) => (d as Bogen).arcAlt)
      .arcStroke(0.35)
      .arcDashLength(config.arcLength)
      .arcDashInitialGap((d) => (d as Bogen).order)
      .arcDashGap(14)
      // 0 heisst: der Bogen steht fertig gezeichnet da und wandert
      // nicht. Das ist der Zustand fuer prefers-reduced-motion.
      .arcDashAnimateTime(ruhig ? 0 : config.arcTime);

    // Ein Punkt je Ort. Aus den Boegen abgeleitet statt zweimal
    // gepflegt: sonst hat man irgendwann einen Bogen ohne Punkt.
    const orte = new Map<string, { lat: number; lng: number }>();
    for (const b of bogen) {
      orte.set(`${b.startLat},${b.startLng}`, { lat: b.startLat, lng: b.startLng });
      orte.set(`${b.endLat},${b.endLng}`, { lat: b.endLat, lng: b.endLng });
    }

    globus
      .pointsData([...orte.values()])
      .pointColor(() => config.atmosphereColor)
      .pointsMerge(true)
      .pointAltitude(0)
      .pointRadius(0.55);
  }, [globus, bogen, config, ruhig]);

  // --- Ringe ---
  // Alle paar Sekunden pulsiert eine Handvoll Orte. In der Vorlage
  // wuerfelt das aus allen Punkten; hier ist Basel immer dabei, weil
  // die Sektion "gefunden werden" heisst und Basel der Ort ist, an dem
  // gefunden werden soll.
  useEffect(() => {
    if (ruhig) {
      globus.ringsData([]);
      return;
    }

    globus
      .ringColor(() => (t: number) => {
        const c = new Color(config.atmosphereColor);
        return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(
          c.b * 255,
        )},${1 - t})`;
      })
      .ringMaxRadius(config.maxRings)
      .ringPropagationSpeed(2.6)
      .ringRepeatPeriod((config.arcTime * config.arcLength) / config.maxRings);

    const setzen = () => {
      const gewuerfelt = bogen
        .filter(() => Math.random() > 0.6)
        .slice(0, 4)
        .map((b) => ({ lat: b.endLat, lng: b.endLng }));

      globus.ringsData([
        { lat: bogen[0]?.startLat ?? 47.56, lng: bogen[0]?.startLng ?? 7.59 },
        ...gewuerfelt,
      ]);
    };

    setzen();
    const uhr = window.setInterval(setzen, 2000);
    return () => window.clearInterval(uhr);
  }, [globus, bogen, config, ruhig]);

  // --- Eigendrehung ---
  // delta statt eines festen Werts pro Bild: auf einem 120-Hz-Schirm
  // drehte sich die Kugel sonst doppelt so schnell wie auf einem mit 60.
  useFrame((_, delta) => {
    if (ruhig) return;
    globus.rotation.y += (delta * config.autoRotateSpeed * Math.PI) / 180;
  });

  return null;
}

export function Globus({ bogen }: { bogen: Bogen[] }) {
  const [laender, setLaender] = useState<GeoJson | null>(null);
  const config = useMemo(globusConfigAusTokens, []);
  const abbruch = useRef(false);

  const ruhig =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Die Laenderumrisse liegen als Datei in public/daten/ und nicht als
  // Import im Bundle: 168 kB GeoJSON gehoeren nicht in eine
  // JavaScript-Datei, die der Browser parsen muss. So sind es zwei
  // Anfragen, die parallel laufen und einzeln im Cache landen.
  useEffect(() => {
    abbruch.current = false;

    fetch("/daten/laender.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: GeoJson) => {
        if (!abbruch.current) setLaender(d);
      })
      .catch(() => {
        // Kein Globus ist besser als eine Fehlermeldung neben einem
        // Verkaufstext. Es bleibt die ruhige Grundflaeche aus
        // stil/leistungen.css stehen.
      });

    return () => {
      abbruch.current = true;
    };
  }, []);

  if (!laender) return null;

  return (
    <Canvas
      className="globus-canvas"
      // alpha, damit der Papierton der Seite durchscheint statt eines
      // schwarzen Kastens. dpr gedeckelt: auf einem Retina-Schirm waeren
      // es sonst 3x so viele Bildpunkte fuer eine Deko-Grafik.
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      dpr={[1, 1.75]}
      camera={{ fov: 50, near: 180, far: 1800, position: [0, 0, 300] }}
      frameloop={ruhig ? "demand" : "always"}
    >
      <ambientLight color={config.ambientLight} intensity={0.7} />
      <directionalLight color={config.directionalLeftLight} position={[-400, 100, 400]} />
      <directionalLight color={config.directionalTopLight} position={[-200, 500, 200]} />
      <pointLight color={config.pointLight} position={[-200, 500, 200]} intensity={0.8} />
      <GlobusKoerper config={config} bogen={bogen} laender={laender} ruhig={ruhig} />
    </Canvas>
  );
}
