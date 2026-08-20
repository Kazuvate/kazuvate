import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

/**
 * Die ganze Website laeuft ueber Vite, nicht nur ein einzelnes Bauteil.
 *
 * Multi-Page-Modus: jede HTML-Datei ist ein eigener Einstiegspunkt. Vite
 * serviert sie im Dev-Modus unter ihrem Pfad (localhost:5173/ zeigt
 * index.html, /kontakt.html die Kontaktseite, usw.) und baut sie beim
 * `npm run build` alle nach dist/. Die Seiten selbst bleiben genau das,
 * was sie vorher waren: handgeschriebenes HTML mit eigenem CSS. React
 * kommt nur an der einen Stelle dazu, wo es gebraucht wird -- dem Faden
 * im Kopfbereich der Startseite, eingehaengt ueber src/main.tsx.
 *
 * Warum ueberhaupt Vite fuer eine statische Seite: Kasum will die Seite
 * mit React/TypeScript hosten, und ein einziger Dev-Server, unter dem die
 * komplette Website liegt, ist einfacher zu bedienen als "HTML-Datei
 * doppelklicken, ausser fuer das eine React-Teil".
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
    rollupOptions: {
      // Ohne diese Liste baut Vite nur index.html und die anderen Seiten
      // fehlen im dist/-Ordner -- inklusive aller Links, die auf sie
      // zeigen. Kommt eine Seite dazu, muss sie hier mit rein.
      input: {
        start: path.resolve(__dirname, "index.html"),
        leistungen: path.resolve(__dirname, "leistungen.html"),
        ablauf: path.resolve(__dirname, "ablauf.html"),
        kontakt: path.resolve(__dirname, "kontakt.html"),
        impressum: path.resolve(__dirname, "impressum.html"),
        datenschutz: path.resolve(__dirname, "datenschutz.html"),
        referenzen: path.resolve(__dirname, "referenzen/index.html"),
      },
    },
  },
});
