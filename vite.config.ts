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
      // zeigen. Kommt eine Seite dazu, muss sie hier mit rein.
      //
      // Die Liste muss ausserdem zu SEITEN in werkzeug/sitemap-bauen.mjs
      // passen. Nicht eins zu eins: danke.html und 404.html stehen hier,
      // aber nicht in der Sitemap, beide tragen noindex.
      input: {
        start: path.resolve(__dirname, "index.html"),
        leistungen: path.resolve(__dirname, "leistungen.html"),
        ablauf: path.resolve(__dirname, "ablauf.html"),
        kontakt: path.resolve(__dirname, "kontakt.html"),
        danke: path.resolve(__dirname, "danke.html"),
        impressum: path.resolve(__dirname, "impressum.html"),
        datenschutz: path.resolve(__dirname, "datenschutz.html"),
        referenzen: path.resolve(__dirname, "referenzen/index.html"),

        // Englisch und Franzoesisch, seit 25.09.2026. Dieselben acht
        // Seiten wie oben, je in en/ und fr/ mit uebersetzten
        // Dateinamen. Welche Datei zu welcher gehoert, steht in
        // werkzeug/sitemap-bauen.mjs.
        en_start: path.resolve(__dirname, "en/index.html"),
        en_leistungen: path.resolve(__dirname, "en/services.html"),
        en_ablauf: path.resolve(__dirname, "en/process.html"),
        en_kontakt: path.resolve(__dirname, "en/contact.html"),
        en_danke: path.resolve(__dirname, "en/thank-you.html"),
        en_impressum: path.resolve(__dirname, "en/legal-notice.html"),
        en_datenschutz: path.resolve(__dirname, "en/privacy.html"),
        en_referenzen: path.resolve(__dirname, "en/portfolio/index.html"),
        fr_start: path.resolve(__dirname, "fr/index.html"),
        fr_leistungen: path.resolve(__dirname, "fr/prestations.html"),
        fr_ablauf: path.resolve(__dirname, "fr/deroulement.html"),
        fr_kontakt: path.resolve(__dirname, "fr/contact.html"),
        fr_danke: path.resolve(__dirname, "fr/merci.html"),
        fr_impressum: path.resolve(__dirname, "fr/mentions-legales.html"),
        fr_datenschutz: path.resolve(__dirname, "fr/protection-des-donnees.html"),
        fr_referenzen: path.resolve(__dirname, "fr/references/index.html"),

        // Die Fehlerseite. Der Schluessel heisst absichtlich "fehler"
        // und nicht "404": Rollup benutzt den Schluessel als Namen des
        // erzeugten Bundles, und ein Dateiname, der mit einer Ziffer
        // beginnt, ist kein gueltiger JavaScript-Bezeichner. Die
        // ausgelieferte Datei heisst trotzdem dist/404.html, das
        // richtet sich nach dem Pfad, nicht nach dem Schluessel -- und
        // genau dieser Name ist es, den Vercel ohne weitere
        // Konfiguration mit Status 404 ausliefert.
        fehler: path.resolve(__dirname, "404.html"),
      },
    },
  },
});
