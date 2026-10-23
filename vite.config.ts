import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { eingangsliste, QUELLORDNER } from "./werkzeug/seiten.mjs";

/**
 * Die Website liegt komplett in website/. Dieser Ordner ist die Wurzel von
 * Vite: dort stehen die Seiten, stil/, src/, medien/ und public/, und
 * Adressen wie /stil/basis.css oder /src/bewegung.ts in den HTML-Dateien
 * meinen Dateien darin. Alles ausserhalb (api/, werkzeug/, dokumente/,
 * diese Konfiguration) gehoert nicht zur ausgelieferten Seite.
 *
 * Die Adressen der Seiten aendert das nicht: Vite gibt eine Datei unter
 * ihrem Pfad relativ zur Wurzel aus, website/kontakt.html wird also
 * dist/kontakt.html und damit kazuvate.ch/kontakt.html. Wuerden die Seiten
 * in einem Unterordner einer Wurzel liegen, die weiter oben sitzt, bekaeme
 * jede Seite ein Praefix in der Adresse.
 *
 * Multi-Page-Modus: jede HTML-Datei ist ein eigener Einstiegspunkt. Vite
 * serviert sie im Dev-Modus unter ihrem Pfad (localhost:5173/ zeigt
 * index.html, /kontakt.html die Kontaktseite, usw.) und baut sie beim
 * `npm run build` alle nach dist/. Die Seiten selbst bleiben genau das,
 * was sie vorher waren: handgeschriebenes HTML mit eigenem CSS. React
 * kommt nur an den zwei Stellen dazu, wo es gebraucht wird -- dem Faden
 * im Kopfbereich der Startseite (src/startseite.tsx) und dem Strang auf
 * der Ablauf-Seite (src/ablauf.tsx).
 *
 * Warum ueberhaupt Vite fuer eine statische Seite: Kasum will die Seite
 * mit React/TypeScript hosten, und ein einziger Dev-Server, unter dem die
 * komplette Website liegt, ist einfacher zu bedienen als "HTML-Datei
 * doppelklicken, ausser fuer das eine React-Teil".
 *
 * Aufbau des Projekts: dokumente/aufbau.md.
 */
const wurzel = path.resolve(__dirname, QUELLORDNER);

export default defineConfig({
  root: wurzel,

  plugins: [react(), tailwindcss()],

  // Umgebungsvariablen (.env.local fuer `vercel dev`) bleiben im obersten
  // Ordner, wo api/ sie braucht, nicht in website/.
  envDir: __dirname,

  resolve: {
    alias: {
      "@": path.resolve(wurzel, "src"),
    },
  },

  server: {
    port: 5173,
    // Beim Start gleich die Startseite oeffnen, nicht nur die URL zeigen.
    open: "/",
    // node_modules liegt ein Ordner ueber der Wurzel. Ohne diese Freigabe
    // verweigert der Dev-Server die gebuendelten Bibliotheken.
    fs: { allow: [__dirname] },
  },

  build: {
    // dist/ bleibt im obersten Ordner, wo Vercel es erwartet.
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,

    // Ausdruecklich aus, obwohl es Vites Standard ist. Eine Source Map
    // im Produktionsordner liefert den kompletten unminifizierten
    // Quelltext samt Kommentaren aus und ist auf einer Seite, die
    // handgebauten Code verkauft, das genaue Gegenteil von
    // Aufgeraeumtsein. Als Zeile hier steht die Entscheidung schwarz
    // auf weiss und faellt jedem auf, der sie umdrehen will.
    sourcemap: false,

    rollupOptions: {
      // Ohne diese Liste baut Vite nur index.html und die anderen Seiten
      // fehlen im dist/-Ordner -- inklusive aller Links, die auf sie
      // zeigen. Die Liste selbst steht in werkzeug/seiten.mjs, dort
      // gehoert eine neue Seite hin. Dieselbe Datei speist die Sitemap.
      input: Object.fromEntries(
        Object.entries(eingangsliste()).map(([name, datei]) => [name, path.resolve(wurzel, datei)]),
      ),
    },
  },
});
