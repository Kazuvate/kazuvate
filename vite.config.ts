import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { eingangsliste, QUELLORDNER } from "./werkzeug/seiten.mjs";

// website/ ist die Wurzel von Vite: Seiten, stil/, src/, medien/ und public/. dist/ bleibt im obersten Ordner.
// Die Adressen bleiben gleich: website/kontakt.html wird dist/kontakt.html.
// Aufbau des Projekts: dokumente/aufbau.md.
const wurzel = path.resolve(__dirname, QUELLORDNER);

export default defineConfig({
  root: wurzel,

  plugins: [react(), tailwindcss()],

  envDir: __dirname,

  resolve: {
    alias: {
      "@": path.resolve(wurzel, "src"),
    },
  },

  server: {
    port: 5173,
    open: "/",
    fs: { allow: [__dirname] },
  },

  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,

    // Source Maps bewusst aus: sie wuerden den kommentierten Quelltext ausliefern.
    sourcemap: false,

    rollupOptions: {
      // Die Seitenliste steht in werkzeug/seiten.mjs. Eine Seite, die dort fehlt, landet nicht in dist/.
      input: Object.fromEntries(
        Object.entries(eingangsliste()).map(([name, datei]) => [name, path.resolve(wurzel, datei)]),
      ),
    },
  },
});
