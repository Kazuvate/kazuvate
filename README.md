# kazuvate

Die Website meiner Webdesign Firma. Basel, Schweiz.

Von Hand gebaut mit HTML und CSS. Kein Framework, kein Baukasten, keine fremden
Skripte. Das ist auch das, was ich verkaufe, deshalb halte ich mich hier selbst
daran.

## Stand

Kopf und Fuss sind fertig, Impressum und Datenschutz stehen. Dazwischen ist
auf der Startseite noch Platzhalter. Die acht Kästchen zeigen, welche Sektion
an welchen Platz kommt und was sie leisten soll.

## Aufbau

```
index.html          Startseite
impressum.html      Impressum
datenschutz.html    Datenschutzerklärung
stil/tokens.css     Farben, Abstände, Rundungen. Die einzige Stelle dafür
stil/basis.css      Grundlagen, Kopf, Fuss, Platzhalter
stil/rechtliches.css  nur für die zwei Rechtsseiten
markenlogo/         Logo, Favicons, App Icons, Vorschaubild fürs Teilen
kazuvate_Logo.jpg   die ursprüngliche Bilddatei, liegt nur noch als Beleg hier
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
Startseite und laden zusätzlich `stil/rechtliches.css`. Eigene Datei, damit
die Startseite kein CSS lädt, das nur zwei Unterseiten brauchen.

Die Texte beschreiben den Zustand, den die Seite beim Livegang haben soll,
nicht den heutigen. Vercel und Resend stehen als Auftragsbearbeiter drin und
das Kontaktformular ist beschrieben, obwohl es beides noch nicht gibt. Vor dem
Livegang gegenlesen. Die vollständige Liste der offenen Punkte steht im Second
Brain unter `02 Projekte/Kazuvate/Kazuvate Website.md`.

## Was noch kommt

1. Texte für die acht Sektionen schreiben
2. Die Sektionen bauen
3. Kontaktformular
4. Domain kazuvate.ch, dann live

Mehr zum Hintergrund steht im Second Brain unter `02 Projekte/Kazuvate`.
