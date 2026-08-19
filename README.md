# kazuvate

Die Website meiner Webdesign Firma. Basel, Schweiz.

Von Hand gebaut mit HTML und CSS. Kein Framework, kein Baukasten, keine fremden
Skripte. Das ist auch das, was ich verkaufe, deshalb halte ich mich hier selbst
daran.

## Stand

Die Startseite ist gebaut: Kopf, Leistungen, Referenzen, Ablauf, Kontakt.
Dazu Impressum, Datenschutz und die Referenzen-Galerie.

Drei ursprünglich geplante Sektionen fehlen bewusst, weil ihnen Material fehlt:
Einzigartigkeit (zwei Screenshots derselben Vorlage), Ladezeit (eine echte
Vergleichsmessung) und Über mich (ein Foto). Lieber fünf fertige Sektionen als
acht halbe.

## Aufbau

```
index.html            Startseite
impressum.html        Impressum
datenschutz.html      Datenschutzerklärung
referenzen/index.html Referenzen als Bildergalerie, ein Bild pro Projekt
stil/tokens.css       Farben, Abstände, Rundungen. Die einzige Stelle dafür
stil/basis.css        Grundlagen, Kopf, Titelband, Fuss, Referenz-Kachel, Platzhalter
stil/seiten.css       nur impressum.html und datenschutz.html: Fliesstext, Tabellen
markenlogo/           Logo, Favicons, App Icons, Vorschaubild fürs Teilen
medien/referenzen/    Bildschirmfotos der Kundenprojekte
kazuvate_Logo.jpg     die ursprüngliche Bilddatei, liegt nur noch als Beleg hier
```

Das Logo steht einmal als `symbol` im HTML und wird oben und unten per `use`
eingesetzt. So gibt es den Pfad nur einmal und keine zusätzliche Datei zu laden.

## Farben

Beide Töne sind aus dem Logo gemessen, nicht ausgesucht.

```
#3F5019   Oliv      Logo, Links, kleine Akzente
#2C3616   Fläche    Kopf, Fuss, Knöpfe
#F5F4EF   Papier    Hintergrund
```

Grosse Flächen sind dunkler als das Logo, weil der helle Ton über die volle
Breite in den Augen sticht. Kleine Sachen bleiben beim helleren Oliv, sonst
erkennt man Links nicht mehr vom normalen Text.

Wenn eine Farbe geändert wird, dann in `stil/tokens.css`. Sonst nirgends.

## Anschauen

`index.html` im Browser öffnen. Es braucht keinen Server und keinen Build.

## Rechtsseiten

`impressum.html` und `datenschutz.html` teilen sich Kopf und Fuss mit der
Startseite und laden zusätzlich `stil/seiten.css`. Eigene Datei, damit die
Startseite kein CSS lädt, das sie nie braucht.

Die Texte beschreiben den Zustand, den die Seite beim Livegang haben soll,
nicht den heutigen. Vercel und Resend stehen als Auftragsbearbeiter drin und
das Kontaktformular ist beschrieben, obwohl es beides noch nicht gibt. Vor dem
Livegang gegenlesen. Die vollständige Liste der offenen Punkte steht im Second
Brain unter `02 Projekte/Kazuvate/Kazuvate Website.md`.

## Referenzen

`referenzen/index.html` ist eine Bildergalerie, keine Fallstudien-Unterseite.
Pro Projekt eine Kachel: Bildschirmfoto, beim Hover oder Fokus erscheint der
Name, ein Klick auf die Kachel führt direkt auf die echte Live-Website,
in einem neuen Tab, damit kazuvate.ch offen bleibt. Keine Texte, die ohnehin
niemand liest, kein Zwischenschritt über eine eigene Fallstudien-Seite.

Dieselbe Kachel erscheint auch als Sektion 04 auf der Startseite (`#referenz`),
deshalb steht ihr CSS in `stil/basis.css` und nicht in `stil/seiten.css`,
denn die Startseite lädt `seiten.css` nicht.

Bisher eine Referenz: ProMeti Facility Services Zekiri in Basel. Das
Bildschirmfoto liegt als WebP in `medien/referenzen/` in zwei Breiten (1280 und
760) und wird über `srcset` ausgeliefert. Auf dem Handy lädt die
42-kB-Fassung statt der 77-kB-Fassung.

## Was noch kommt

1. Foto, Vergleichs-Screenshots und Ladezeitmessung besorgen
2. Die drei fehlenden Sektionen bauen
3. Kontaktformular, sobald das Backend steht
4. Domain kazuvate.ch, dann live

Mehr zum Hintergrund steht im Second Brain unter `02 Projekte/Kazuvate`.
