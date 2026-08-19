# Markenlogo kazuvate

Vektorisiert aus `../kazuvate_Logo.jpg` am 19.08.2026. Ab jetzt ist **`logo.svg` das
Master-Asset** — die JPG wird nicht mehr ausgeliefert und nur noch als Herkunftsnachweis
aufbewahrt.

## Markenton

| | Wert | Einsatz |
|---|---|---|
| Oliv | `#3F5019` | Marke, Buttons, Links, Text |
| Papier | `#F5F4EF` | Grundflaeche, Icon-Hintergruende |

Kontrast Oliv auf Weiss: 9.0:1. Reicht auch fuer Fliesstext, nicht nur fuer Flaechen.

## Dateien

| Datei | Groesse | Wofuer |
|---|---|---|
| `logo.svg` | 411 B | Standard. Ueberall im hellen Umfeld |
| `logo-weiss.svg` | 411 B | Auf dunklem Grund und auf Fotos |
| `logo-currentcolor.svg` | 416 B | Inline im HTML, erbt die Textfarbe |
| `favicon.svg` | 482 B | Browser-Tab, schaltet bei Dunkelmodus auf helles Oliv |
| `favicon.ico` | 5.6 kB | 16/32/48 in einer Datei, fuer alte Browser |
| `favicon-16/32/48.png` | < 2.2 kB | Einzelgroessen, falls gebraucht |
| `apple-touch-icon.png` | 4.8 kB | 180x180, iOS-Startbildschirm |
| `icon-192.png` `icon-512.png` | 5 / 15 kB | Android, Web-App-Manifest |
| `icon-maskable-512.png` | 11 kB | Android adaptive Icons, Marke im sicheren Bereich |
| `og.png` | 19 kB | 1200x630, Vorschaubild fuer Link-Freigaben |
| `site.webmanifest` | | Manifest, Pfade ggf. anpassen |

Das Zeichen steht auf hellen Icons **oliv auf transparent**, auf Startbildschirm-Icons
**hell auf oliv**. Grund: Tabs sind meist hell, Startbildschirme liegen auf einem
beliebigen Hintergrundbild und brauchen eine eigene Kante.

## Einbindung

```html
<link rel="icon" href="/markenlogo/favicon.ico" sizes="32x32">
<link rel="icon" href="/markenlogo/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/markenlogo/apple-touch-icon.png">
<link rel="manifest" href="/markenlogo/site.webmanifest">
<meta name="theme-color" content="#3F5019">
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
Importvorlage — nicht die JPG.
