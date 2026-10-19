# Markenlogo kazuvate

Die Dateien selbst liegen in `public/markenlogo/` und werden mit der Website
ausgeliefert. Diese Beschreibung liegt bewusst nicht dort: bis zum 31.08.2026
stand sie als `README.md` zwischen den Bildern und war damit unter
`https://kazuvate.ch/markenlogo/README.md` oeffentlich abrufbar. Vite reicht
alles aus `public/` unveraendert durch, es gibt dort keine Ausnahmeliste.

Vektorisiert aus [`kazuvate_Logo.jpg`](kazuvate_Logo.jpg) am 19.08.2026. Ab
jetzt ist **`logo.svg` das Master-Asset**. Die JPG wird nicht ausgeliefert und
liegt hier nur als Herkunftsnachweis.

## Markenton

| | Wert | Einsatz |
|---|---|---|
| Oliv | `#3F5019` | Marke, Buttons, Links, Text |
| Papier | `#F5F4EF` | Grundflaeche, Icon-Hintergruende |

Kontrast Oliv auf Weiss: 9.0:1. Reicht auch fuer Fliesstext, nicht nur fuer Flaechen.

## Dateien

In `public/markenlogo/`:

| Datei | Groesse | Wofuer |
|---|---|---|
| `logo.svg` | 411 B | Standard. Ueberall im hellen Umfeld |
| `logo-weiss.svg` | 411 B | Auf dunklem Grund und auf Fotos |
| `logo-currentcolor.svg` | 416 B | Inline im HTML, erbt die Textfarbe |
| `favicon-16/32/48.png` | < 2.2 kB | Einzelgroessen, falls gebraucht |
| `apple-touch-icon.png` | 4.8 kB | 180x180, iOS-Startbildschirm |
| `icon-192.png` `icon-512.png` | 5 / 15 kB | Android, Web-App-Manifest |
| `icon-maskable-512.png` | 11 kB | Android adaptive Icons, Marke im sicheren Bereich |
| `og.png` | 19 kB | 1200x630, Vorschaubild fuer Link-Freigaben |
| `site.webmanifest` | | Manifest, Pfade ggf. anpassen |

Direkt in `public/`, nicht in `markenlogo/`:

| Datei | Groesse | Wofuer |
|---|---|---|
| `favicon.svg` | 482 B | Browser-Tab, schaltet bei Dunkelmodus auf helles Oliv |
| `favicon.ico` | 5.6 kB | 16/32/48 in einer Datei, fuer alte Browser |

Die zwei Favicons liegen an der Wurzel, weil Browser `/favicon.ico` von sich aus
anfragen und alle Seiten auf diese Adressen verweisen. Bis zum 19.10.2026 gab es
beide Dateien zusaetzlich unveraendert in `markenlogo/`, ohne dass jemand darauf
zeigte. Die Kopien sind entfernt.

Das Zeichen steht auf hellen Icons **oliv auf transparent**, auf Startbildschirm-Icons
**hell auf oliv**. Grund: Tabs sind meist hell, Startbildschirme liegen auf einem
beliebigen Hintergrundbild und brauchen eine eigene Kante.

## Einbindung

So steht es im Kopf jeder Seite:

```html
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/markenlogo/apple-touch-icon.png">
<link rel="manifest" href="/markenlogo/site.webmanifest">
<meta property="og:image" content="https://kazuvate.ch/markenlogo/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
```

## Regeln

- **Schutzraum:** rundherum mindestens 25 Prozent der Markenhoehe freilassen.
- **Kleinstgroesse:** 16 px digital, 8 mm im Druck. Darunter verschmelzen die
  Innenkanten von K und V.
- **Nicht veraendern:** nicht verzerren, nicht drehen, keinen Schatten, keinen Verlauf,
  keine Kontur. Die Form lebt von den harten Kanten.
- **Auf Fotos** nur `logo-weiss.svg` und nur auf ruhigen, dunklen Bildstellen.

## Herkunft

Nachgezeichnet aus dem Pixelbild: Kanten vierfach ueberabgetastet, Kontur als Kantenzug
verfolgt, Geraden per Ausgleichsrechnung gefittet, Ecken als deren Schnittpunkte
berechnet. Ergebnis sind **20 Punkte in 2 Konturen** bei **99.63 Prozent Deckung** mit
dem Original. Der Pfad nutzt `fill-rule="evenodd"`, weil die innere Flaeche zwischen
K und V eine echte Aussparung ist.

Wenn du das Zeichen spaeter in Figma nachbaust, ist `logo.svg` die richtige
Importvorlage, nicht die JPG.
