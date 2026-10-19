import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { eingangsliste } from "./werkzeug/seiten.mjs";

/**
 * Die ganze Website laeuft ueber Vite, nicht nur ein einzelnes Bauteil.
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
 * Aufbau des Projekts: docs/aufbau.md.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5173,
    // Beim Start gleich die Startseite oeffnen, nicht nur die URL zeigen.
    open: "/",
  },

  build: {
    outDir: "dist",
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
        Object.entries(eingangsliste()).map(([name, datei]) => [name, path.resolve(__dirname, datei)]),
      ),
    },
  },
});
