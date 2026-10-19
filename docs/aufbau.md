# Aufbau des Projekts

Die Karte für alle, die das Repository zum ersten Mal öffnen, oder nach drei
Wochen wieder. Warum etwas so gebaut ist, steht im Kommentar am Anfang der
jeweiligen Datei. Hier steht, wo was liegt und was zusammengehört.

## Befehle

```bash
npm install         # einmalig, holt die Abhängigkeiten
npm run dev         # Entwicklungsserver auf http://localhost:5173
npm run build       # fertige Website nach dist/
npm run preview     # den gebauten Stand aus dist/ anschauen
npm run typecheck   # TypeScript prüfen, ohne etwas zu bauen
npm run indexnow    # nach einem Deploy: Adressen an Bing und Co. melden
```

`npm run build` schreibt vorher `public/sitemap.xml` neu (`prebuild`). Die Datei
ist eingecheckt. Wer nur lokal gebaut hat, setzt sie vor dem Commit mit
`git checkout -- public/sitemap.xml` zurück, sonst landet ein zufälliges
`lastmod`-Datum im Commit.

## Ordnerkarte

```
kazuvate/
│
├─ index.html  leistungen.html  ablauf.html  kontakt.html  danke.html
│  impressum.html  datenschutz.html  404.html  referenzen/index.html
│                       Die deutschen Seiten. Deutsch ist die Wurzel der Website.
├─ en/   fr/            Dieselben Seiten auf Englisch und Französisch
│
├─ stil/                CSS
│  ├─ tokens.css           Farben, Abstände, Zeiten: die einzige Quelle
│  ├─ basis.css            Inhaltsverzeichnis des Basis-CSS (nur @import)
│  ├─ basis/               Das Basis-CSS, ein Abschnitt je Datei
│  └─ kontakt.css  leistungen.css  ablauf.css  seiten.css  danke.css
│     titelmotive.css      CSS, das nur einzelne Seiten laden
│
├─ src/                 TypeScript und React, von Vite gebündelt
│  ├─ bewegung.ts          Einstieg für alle Seiten (GSAP, Seitenwechsel)
│  ├─ startseite.tsx       Einstieg nur Startseite: React-Insel "Faden"
│  ├─ ablauf.tsx           Einstieg nur Ablauf: React-Insel "Strang"
│  ├─ module/              Kleine Module, die bewegung.ts und ablauf.tsx bei Bedarf nachladen
│  ├─ components/ui/       React-Bauteile
│  ├─ lib/utils.ts         cn() für eingefügte shadcn-Bauteile
│  └─ index.css            Tailwind-Utilities, zurzeit von keiner Seite geladen
│
├─ public/              Wird unverändert nach dist/ kopiert und ausgeliefert
│  ├─ skript/              Handgeschriebenes JavaScript ohne Build
│  ├─ schriften/           General Sans
│  ├─ markenlogo/          Logo, Icons, Vorschaubild
│  ├─ favicon.ico  favicon.svg  robots.txt  llms.txt
│  ├─ sitemap.xml          Wird von werkzeug/sitemap-bauen.mjs erzeugt
│  └─ <32 Zeichen>.txt     Schlüssel für IndexNow
│
├─ medien/referenzen/   Bilder der Referenz-Kacheln (webp)
├─ api/kontakt.js       Vercel Function des Kontaktformulars
├─ werkzeug/            Skripte für Build und Veröffentlichung
├─ muster/              Entwürfe zum Ansehen, werden nicht ausgeliefert
├─ docs/                Diese Doku und die Herkunft des Logos
│
└─ package.json  vite.config.ts  vercel.json  tsconfig.json  components.json
   .env.example  PRODUCT.md  README.md  LICENSE
```

**Warum liegen die deutschen Seiten im Wurzelordner?** Die Adressen der Website
folgen den Dateipfaden eins zu eins (`kazuvate.ch/kontakt.html`), und sie sind
indexiert und verlinkt. Eine verschobene Datei ist eine andere Adresse.

**Warum gibt es zwei Orte für JavaScript?** `public/skript/` ist Code, den
niemand bündeln soll: klein, handgeschrieben, pro Seite eine Datei. `src/` ist
alles, was Vite braucht, also TypeScript, React und Bibliotheken.

## Die Seiten

Jede Seite gibt es dreimal. Die Zuordnung steht in **`werkzeug/seiten.mjs`**, und
nur dort: `vite.config.ts` baut daraus die Eingangsliste, das Sitemap-Skript die
Sitemap.

| Deutsch | Englisch | Französisch |
|---|---|---|
| `index.html` | `en/index.html` | `fr/index.html` |
| `leistungen.html` | `en/services.html` | `fr/prestations.html` |
| `ablauf.html` | `en/process.html` | `fr/deroulement.html` |
| `referenzen/index.html` | `en/portfolio/index.html` | `fr/references/index.html` |
| `kontakt.html` | `en/contact.html` | `fr/contact.html` |
| `impressum.html` | `en/legal-notice.html` | `fr/mentions-legales.html` |
| `datenschutz.html` | `en/privacy.html` | `fr/protection-des-donnees.html` |
| `danke.html` | `en/thank-you.html` | `fr/merci.html` |
| `404.html` | | |

Die Fehlerseite gibt es nur einmal, sie zeigt je eine Zeile in drei Sprachen.

Es gibt keine Vorlagen und kein Include: Kopf und Fuss stehen in jeder Datei
einzeln. Eine Änderung daran gilt für alle 25 Dateien.

**Eine neue Seite braucht:**

1. die drei HTML-Dateien (Deutsch, Englisch, Französisch)
2. einen Eintrag in `werkzeug/seiten.mjs`
3. die `hreflang`-Zeilen und das `canonical` im Kopf jeder Fassung. Die Adresse
   muss zeichengleich mit der in `seiten.mjs` sein.
4. bei Bedarf Weiterleitungen in `vercel.json`

## CSS

Jede Seite lädt `tokens.css` und `basis.css` und dazu höchstens ihre eigenen
Dateien. Ob Deutsch, Englisch oder Französisch: die Dateien sind dieselben.

| Seite | Eigenes CSS | Eigenes JavaScript |
|---|---|---|
| Startseite | | `src/startseite.tsx` (React) |
| Leistungen | `leistungen.css`, `titelmotive.css` | `skript/passt.js` |
| Ablauf | `ablauf.css`, `titelmotive.css` | `src/ablauf.tsx` (React) |
| Referenzen | `titelmotive.css` | |
| Kontakt | `kontakt.css` | `skript/formular-faden.js` |
| Impressum | `seiten.css`, `titelmotive.css` | |
| Datenschutz | `seiten.css`, `titelmotive.css` | `skript/uebersicht.js` |
| Danke | `danke.css` | |
| 404 | `seiten.css` | `skript/riss.js` |

Auf jeder Seite zusätzlich: `skript/haupt.js` und `src/bewegung.ts`.

**Farben stehen ausschliesslich in `tokens.css`**, kein Hex-Wert sonst irgendwo.

**`basis.css` ist ein Inhaltsverzeichnis.** Der Code liegt in `stil/basis/`, ein
Abschnitt je Datei (`kopf.css`, `fuss.css`, `frageleiste.css`, ...). Die
Reihenfolge der `@import`-Zeilen ist die Reihenfolge in der Kaskade und zählt.
Die Seiten laden weiterhin nur `basis.css`; Vite setzt die Teile beim Bauen zu
einer Datei zusammen, der Browser braucht keine zusätzliche Anfrage.

## JavaScript

Drei Wege, je nachdem, was gebraucht wird:

1. **`public/skript/*.js`**: handgeschrieben, ohne Build, per `<script defer>`.
   `haupt.js` läuft auf jeder Seite (Menü, Kopf, Sprachwahl, Zeitstempel des
   Formulars). Die übrigen gehören je einer Seite, damit keine Seite Code lädt,
   den sie nie braucht. Fällt das Skript aus, bleibt die Seite lesbar und
   bedienbar.
2. **`src/bewegung.ts`**: TypeScript, von Vite gebündelt, auf jeder Seite. Es
   prüft selbst, ob seine Ziel-Elemente da sind. Was nur eine Seite oder nur
   ein Gerät braucht, lädt es aus **`src/module/`** per dynamischem `import()`
   nach, zum Beispiel `kv-punkte.ts` erst, wenn der Zeiger den Fuss betritt.
3. **React-Inseln**: `src/startseite.tsx` (Faden) und `src/ablauf.tsx` (Strang).
   Jede hängt sich an ein vorhandenes Element der eigenen Seite und tut sonst
   nichts. Die Bauteile liegen in `src/components/ui/`. React ist die Ausnahme,
   nicht die Regel: neue Insel nur auf ausdrückliche Entscheidung.

`src/lib/utils.ts` (`cn()`), die Pakete `clsx` und `tailwind-merge` und
`components.json` gehören zusammen: sie halten die Umgebung bereit, in die sich
ein neues, aus einer Bibliothek kopiertes shadcn-Bauteil einfügt. Ohne
`cn()` bräche der Import in solchen Bauteilen.

## Kontaktformular

`kontakt.html` schickt per POST an `/api/kontakt`, die Vercel Function
`api/kontakt.js`. Sie verschickt die Anfrage über Resend. Dafür braucht sie
`RESEND_API_KEY`: in Vercel unter *Project Settings, Environment Variables*,
lokal in `.env.local` (Vorlage: `.env.example`). Den Schlüssel nie in den Code
schreiben, auch nicht als Rückfallwert. Spamschutz ohne Captcha (verstecktes
Feld und Zeitprüfung) und die Antworten bei Fehlern sind im Kopfkommentar von
`api/kontakt.js` beschrieben.

## Adressen und Weiterleitungen

`vercel.json` kennt keine Kommentare, deshalb steht die Begründung hier.

- **Weiterleitungen.** `/index.html` und `/referenzen/index.html` lieferten
  dieselbe Seite wie `/` und `/referenzen/`. Das `canonical` löst das schon auf,
  eine Weiterleitung ist aber das stärkere Signal. Adressen ohne `.html`
  (`/kontakt`, `/ablauf`, ...) sind sonst 404. Alle permanent (308).
- **Der Schrägstrich zählt.** Vercel vergleicht ihn strikt: `/referenzen` wird
  auf `/referenzen/` geleitet, aber `/leistungen/` bleibt 404, obwohl es eine
  Regel für `/leistungen` gibt. Träfe die Quelle `/referenzen` auch
  `/referenzen/`, drehte sich die Seite im Kreis.
- **Cache.** Dateien unter `/assets/` tragen einen Inhalts-Hash im Namen und
  gelten ein Jahr als `immutable`. Dasselbe gilt für `/schriften/`. Die Schrift
  hat keinen Hash im Namen: **wer sie austauscht, gibt ihr einen neuen
  Dateinamen** und passt `@font-face` und das `preload` in allen Seiten an.
- **Interne Links** zeigen auf die kanonischen Adressen (`/`, `/#ueber-uns`,
  `/referenzen/`), absolut ab der Wurzel. Ein relatives `index.html` zeigte auf
  der Referenzenseite je nach Aufruf auf eine andere Seite.
- **Sitemap und Canonical müssen zeichengleich sein.** Zwei Angaben, die sich
  widersprechen, sind schlechter als eine. Beide stammen aus
  `werkzeug/seiten.mjs`, das Canonical in den HTML-Dateien steht von Hand.
- **IndexNow.** `npm run indexnow` nach einem Deploy mit neuen oder geänderten
  Seiten. Der Schlüssel liegt öffentlich in `public/`, das ist bei IndexNow so
  gewollt. Genaueres im Kopf von `werkzeug/indexnow.mjs`.

## Nicht ausgeliefert

- **`muster/`**: Entwürfe zum Ansehen (zurzeit die isometrischen Leistungs-Zeichen).
  Die Dateien stehen nicht in der Eingangsliste und kommen deshalb nicht nach
  `dist/`. Im Entwicklungsserver sind sie unter `/muster/iso-zeichen.html` offen.
- **`docs/`**, **`werkzeug/`**, **`.claude/`**: Doku, Skripte und Vorschau-Konfiguration.
  Aus `public/` dagegen wird alles ausgeliefert. Was nicht öffentlich sein darf,
  gehört nie dorthin.

## Weiter lesen

- `PRODUCT.md`: für wen die Seite ist und welche Gestaltungsprinzipien gelten
- `docs/markenlogo.md`: Logo, Markenton, Dateien, Regeln
- `git show f329556:README.md`: die ausführliche Fassung dieser Doku bis zum
  02.10.2026, mit der Geschichte der einzelnen Bauteile
