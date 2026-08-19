# kazuvate

Die Website meiner Webdesign Firma. Basel, Schweiz.

Von Hand gebaut mit HTML und CSS. Kein Framework, kein Baukasten, keine fremden
Skripte. Das ist auch das, was ich verkaufe, deshalb halte ich mich hier selbst
daran.

## Stand

Die Startseite ist gebaut: Kopf, Leistungen, Warum kazuvate, Referenzen,
Ablauf. Dazu die Kontaktseite, Impressum, Datenschutz und die
Referenzen-Galerie.

Die Kontaktsektion stand bis zum 19.08.2026 unten auf der Startseite. Sie ist
dort entfernt worden, als `kontakt.html` dazukam: dasselbe Formular zweimal auf
derselben Website ist einmal zu viel. An ihrer Stelle steht jetzt ein
Abschlussblock mit einer Zeile und einem Knopf, sonst hört die Seite nach dem
Ablauf im Nichts auf. Alle Knöpfe und Menüpunkte führen auf die Kontaktseite.

Drei ursprünglich geplante Sektionen fehlen bewusst, weil ihnen Material fehlt:
Einzigartigkeit (zwei Screenshots derselben Vorlage), Ladezeit (eine echte
Vergleichsmessung) und Über mich (ein Foto). Lieber fünf fertige Sektionen als
acht halbe.

## Aufbau

```
index.html            Startseite
kontakt.html          Kontaktseite mit Formular
impressum.html        Impressum
datenschutz.html      Datenschutzerklärung
referenzen/index.html Referenzen als Bildergalerie, ein Bild pro Projekt
stil/tokens.css       Farben, Abstände, Rundungen. Die einzige Stelle dafür
stil/basis.css        Grundlagen, Kopf, Titelband, Fuss, Referenz-Kachel, Sektionen
stil/seiten.css       nur impressum.html und datenschutz.html: Fliesstext, Tabellen
stil/kontakt.css      nur kontakt.html: Zweispalter, Anfragekarte, Formular
skript/haupt.js       mitlaufender Kopf und der gezeichnete Rahmen der Kacheln
markenlogo/           Logo, Favicons, App Icons, Vorschaubild fürs Teilen
medien/referenzen/    Bildschirmfotos der Kundenprojekte
kazuvate_Logo.jpg     die ursprüngliche Bilddatei, liegt nur noch als Beleg hier
```

Das Logo steht einmal als `symbol` im HTML und wird oben und unten per `use`
eingesetzt. So gibt es den Pfad nur einmal und keine zusätzliche Datei zu laden.

## Fuss

Unter der Zeile „Handgebaute Frontend-Websites für KMU in der Schweiz." stehen
zwei runde Knöpfe, Bauart wie die Kreise im Fuss von prometizekiri.com:

- **KB** führt auf `kasumbajrami.dev`, meine persönliche Seite
- das **LinkedIn**-Zeichen führt auf mein Profil

Beide öffnen in einem neuen Tab, damit kazuvate.ch offen bleibt. Es sind reine
Links, keine eingebetteten Widgets — LinkedIn bekommt also erst dann etwas mit,
wenn jemand wirklich klickt, und die Aussage „keine fremden Skripte" bleibt
stehen.

Das Monogramm ist dasselbe Zeichen wie auf `kasumbajrami.dev`, hier aber als
Schrift statt als Bild: spart eine Datei und bleibt in jeder Grösse scharf.

Zwei Stolpersteine, die im CSS als Kommentar stehen: `.fuss svg` gibt jedem SVG
im Fuss 16 Pixel Abstand nach unten, deshalb braucht das LinkedIn-Zeichen
ausdrücklich `margin: 0`. Und die geerbte Zeilenhöhe von 1.7 schiebt den Inhalt
im Kreis nach oben, deshalb `line-height: 1` auf dem Knopf.

## Ansprache

Alle Kundentexte stehen in der **Wir-Form**, auch wenn hier vorerst nur einer
sitzt. Ein KMU soll nicht das Gefühl haben, sein Auftritt hänge an einer
einzelnen Person. Umgestellt am 19.08.2026, betrifft Startseite, Kontaktseite,
Referenzen und Datenschutzerklärung.

Zwei Ausnahmen: das Impressum, wo die rechtlich haftende Person steht, und
dieser README, der meine eigene Notiz ist.

## Kontakt

`kontakt.html` ist zweispaltig aufgebaut, nach dem Vorbild von
portdigitalco.com/contact: links `Reden wir.` gross, Telefon, Mail und drei
Zeilen dazu, was nach der Anfrage passiert, rechts das Formular in einer Karte.
Unter 940 Pixel wird daraus eine Spalte.

Fünf Felder. Vorname, Name, E-Mail und Nachricht sind Pflicht, Organisation ist
freiwillig und mit einem Wort markiert statt mit einem Sternchen. Das
Nachrichtenfeld fragt nach dem Betrieb, nicht nach einer Nachricht: was jemand
macht und was die Website leisten soll, ist die Angabe, mit der sich eine
Antwort schreiben lässt.

**Das Formular sendet noch nirgendwohin.** `action="/api/kontakt"` zeigt auf
eine Vercel Function, die es noch nicht gibt. Bis dahin sind Telefon und Mail
der einzige Weg, der wirklich ankommt. Die HTML5-Prüfung (`required`,
`type=email`) greift schon jetzt.

## Kopf

Der Kopf läuft beim Scrollen mit (`position: sticky`). Sobald die Seite 40
Pixel weit gescrollt ist, setzt `skript/haupt.js` die Klasse `.gescrollt`: der
Schriftzug `kazuvate` fährt auf Breite null zusammen und wird durchsichtig,
das Zeichen bleibt an genau derselben Stelle stehen, der Balken wird von 74 auf
60 Pixel flacher und bekommt einen Schatten. Den Übergang zeichnet CSS, das
Skript entscheidet nur wann.

Ohne JavaScript läuft der Kopf trotzdem mit und behält seinen Schriftzug. Das
ist der Zustand, mit dem die Seite ohnehin lädt, es geht also nichts kaputt.

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
