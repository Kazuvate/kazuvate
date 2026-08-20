# kazuvate

Die Website meiner Webdesign Firma. Basel, Schweiz.

Von Hand geschriebenes HTML und CSS, kein Baukasten, keine Vorlage. Das ist
auch das, was ich verkaufe, deshalb halte ich mich hier selbst daran.

**Das Projekt läuft über Vite.** Jede Seite bleibt eine eigene, von Hand
geschriebene HTML-Datei — Vite serviert sie im Entwicklungsmodus alle unter
einer Adresse und baut sie mit `npm run build` nach `dist/`. React und
framer-motion kommen an genau einer Stelle dazu: dem Faden im Kopfbereich der
Startseite, siehe Abschnitt „Faden". Kundenprojekte bleiben bei HTML, CSS und
JavaScript, ohne Ausnahme.

## Starten

```bash
npm install     # einmalig, holt die Abhängigkeiten
npm run dev     # Entwicklungsserver, öffnet http://localhost:5173
```

`npm run dev` zeigt die komplette Website: `/` ist die Startseite,
`/kontakt.html` die Kontaktseite, und so weiter. Änderungen an HTML, CSS oder
den React-Dateien erscheinen sofort im Browser, ohne Neuladen. Beenden mit
`Strg+C` im Terminal.

| Befehl | Wofür |
|---|---|
| `npm run dev` | Entwickeln, localhost:5173 |
| `npm run build` | Fertige Website nach `dist/` bauen, das ist der Ordner zum Hochladen |
| `npm run preview` | Den gebauten Stand aus `dist/` lokal anschauen, bevor er hochgeht |
| `npm run typecheck` | TypeScript prüfen, ohne etwas zu bauen |

## Stand

Die Startseite ist gebaut: Kopf mit Über uns, Leistungen, Warum kazuvate,
Referenzen, Ablauf. Dazu die Kontaktseite, Impressum, Datenschutz und die
Referenzen-Galerie.

Die Kontaktsektion stand bis zum 19.08.2026 unten auf der Startseite. Sie ist
dort entfernt worden, als `kontakt.html` dazukam: dasselbe Formular zweimal auf
derselben Website ist einmal zu viel. An ihrer Stelle steht jetzt ein
Abschlussblock mit einer Zeile und einem Knopf, sonst hört die Seite nach dem
Ablauf im Nichts auf. Alle Knöpfe und Menüpunkte führen auf die Kontaktseite.

Zwei ursprünglich geplante Sektionen fehlen weiterhin, weil ihnen Material
fehlt: Einzigartigkeit (zwei Screenshots derselben Vorlage) und Ladezeit (eine
echte Vergleichsmessung). Lieber fertige Sektionen als halbe.

Die dritte, „Über mich", steht als drei kurze Abschnitte direkt im Kopfbereich
der Startseite. Ohne Foto, weil das Foto immer noch fehlt, der Text aber auch
ohne trägt.

## Aufbau

```
index.html             Startseite, bindet als einzige auch src/main.tsx ein
leistungen.html        Leistungen: Schnelligkeit, Sichtbarkeit, Rundum, groesser gezeigt
kontakt.html           Kontaktseite mit Formular
impressum.html         Impressum
datenschutz.html       Datenschutzerklärung
referenzen/index.html  Referenzen als Bildergalerie, ein Bild pro Projekt

stil/tokens.css        Farben, Abstände, Rundungen. Die einzige Stelle dafür
stil/basis.css         Grundlagen, Kopf, Titelband, Fuss, Referenz-Kachel, Sektionen
stil/seiten.css        nur impressum.html und datenschutz.html: Fliesstext, Tabellen
stil/kontakt.css       nur kontakt.html: Zweispalter, Anfragekarte, Formular
stil/leistungen.css    nur leistungen.html: grosse Nummern, Hover-Reaktion

src/main.tsx                            haengt den Faden in die Startseite ein
src/components/ui/svg-follow-scroll.tsx die Faden-Komponente (React, framer-motion)
src/lib/utils.ts                        cn()-Helfer (shadcn-Konvention)
src/index.css                           nur Tailwind-Utilities, kein Preflight

public/skript/haupt.js mitlaufender Kopf, Menue-Schublade, Symbolzeichnung, Kachelrahmen
markenlogo/            Logo, Favicons, App Icons, Vorschaubild fürs Teilen
medien/referenzen/     Bildschirmfotos der Kundenprojekte
kazuvate_Logo.jpg      die ursprüngliche Bilddatei, liegt nur noch als Beleg hier

vite.config.ts         Multi-Page-Konfiguration: jede HTML-Datei ein Einstiegspunkt
dist/                  Ergebnis von npm run build, nicht im Repo
```

**Warum `public/skript/` und nicht `skript/`:** Vite verarbeitet alles, was es
im HTML findet, und benennt es beim Bauen um (Hash im Dateinamen). Bei einem
klassischen `<script src>` ohne `type="module"` kann es das nicht — die Datei
wäre beim `npm run build` einfach nicht im `dist/` gelandet und der mitlaufende
Kopf hätte auf der gebauten Seite gefehlt. Alles in `public/` wird dagegen
unverändert durchgereicht. Genau dafür ist der Ordner da.

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

## Leistungen

Drei Spalten nebeneinander, getrennt durch senkrechte Haarlinien im Markenton,
Aufbau wie bei portdigitalco.com: Nummer, Zeichen, Titel, Text.

Die drei Zeichen sind aus Rechtecken, Linien und Kreisen zusammengesetzt und
stehen direkt im HTML — Fenster für den One-Pager, zwei versetzte Fenster für
die mehrseitige Website, eine Uhr für Wartung und Textpflege. Keine
Icon-Bibliothek: das wäre eine Fremddatei für drei Symbole, und Fremddateien
sind hier das, was wir gerade nicht wollen.

Bis zum 20.08.2026 standen die Leistungen als dreispaltige Zeilen untereinander,
mit der Begründung, dass Karten gleich lange Texte erzwingen. Das gilt weiter:
die drei Texte sind bewusst ähnlich lang. Kommt eine vierte Leistung dazu,
bricht das Raster auf zwei Zeilen um und die Texte müssen nochmal angeglichen
werden.

## Leistungen-Seite

`leistungen.html` zeigt dieselben drei Punkte wie die Bento-Kacheln unter
"Warum kazuvate" auf der Startseite - Schnelligkeit, Sichtbarkeit, Rundum -,
hier groesser und einzeln durchgezogen statt als Kachel-Trio: eine Liste mit
grosser Nummer links, Titel und Text rechts, getrennt durch Haarlinien im
Markenton.

Entstanden am 20.08.2026, weil der Menuepunkt "Leistungen" bis dahin auf einen
Anker zeigte, der zwischenzeitlich aus Versehen aus der Seite gefallen war
(siehe Bewegung unten fuer den Zusammenhang) - und weil Kasum diese drei Punkte
als "die drei Leistungen" bezeichnet, nicht die Sektion `#leistungen` mit
One-Pager, Mehrseitiger Website und Wartung. Beide Abschnitte heissen jetzt
"Leistungen", meinen aber unterschiedliche Dinge: die Sektion auf der
Startseite beschreibt, welche Art Website wir bauen, die eigene Seite, warum
man sie bei uns bauen laesst. Nur die eigene Seite ist von der Navigation aus
erreichbar, die Sektion bleibt als Ankerziel bestehen, ohne Link darauf.

Keine Icons: die sind auf der Startseite fuers Leistungen-Trio schon vergeben,
hier soll die Zahl selbst der Blickfang sein. Die einzige Bewegung ist eine
kleine Reaktion beim Zeigen - Nummer wird oliv und rueckt 6 Pixel nach rechts -,
keine beim Scrollen, siehe Bewegung.

## Über uns

Über uns ist **keine eigene Seite**, sondern steht im Kopfbereich der
Startseite, direkt unter der H1: drei Abschnitte — Wer wir sind, Was uns
antreibt, Mit wem wir arbeiten. Der Menüpunkt springt auf den Anker
`#ueber-uns`. Eine eigene Seite dafür gab es am 20.08.2026 für ein paar
Stunden, sie ist wieder aufgelöst worden: eine Seite statt zwei.

Aufbau wie auf portdigitalco.com/about: alles linksbündig untereinander,
getrennt nur durch Haarlinien. Bei kazuvate laufen die Linien im Markenton
(`--linie-marke`, Oliv mit 28 % Deckkraft) statt in Grau.

Der Text bricht bei 56 Zeichen um, und die Linien enden seit dem 20.08.2026
genau dort mit (`max-width: 56ch` auf `.hero-abschnitte`, gleiche Schriftgrösse
also gleiche Kante). Vorher liefen sie über die volle Breite bis an den rechten
Rand — eine Linie, die weit über ihren Text hinausschiesst, trennt nichts mehr,
sie zeigt nur ins Leere. Ab 1150 Pixel trägt die rechte Hälfte einen Faden,
siehe unten; darunter bleibt sie leer.

Die Texte sind nicht übersetzt, sondern auf kazuvate umgeschrieben: Schweizer
KMU statt US-Trades, und ohne Behauptungen über Dutzende gebaute Seiten, die
heute noch nicht stimmen würden.

## Faden

Rechts im Kopfbereich läuft ab 1150 Pixel Breite eine Linie, die sich beim
Scrollen weiterzeichnet: ein kurzer Anfang beim Laden, fertig gezogen, wenn die
Unterkante des Bereichs das obere Viertel des Fensters erreicht. Der Bereich,
den sie begleitet (`#hero-faden-bereich`), reicht von der H1 bis zum Ende der
drei Über-uns-Abschnitte. Die Spalte ist 460 Pixel breit.

**Das einzige Stück React auf der ganzen Website.** Die Komponente ist die aus
der Vorlage (Skiper UI, „svg-follow-scroll", framer-motion) und liegt nach
shadcn-Konvention unter `src/components/ui/`. `src/main.tsx` hängt sie in die
bestehende Startseite ein — es gibt kein React-Layout, keine Router, keine
umgebauten Seiten. Die anderen fünf Seiten laden React gar nicht erst.

Angepasst gegenüber der Vorlage, jeweils im Quelltext kommentiert:

- **Scroll-Ziel von aussen:** `#hero-faden-bereich` in `index.html` statt der
  künstlich 350vh hohen Sektion, die die Vorlage sich selbst baut.
- **Farbe** `var(--olive)` statt des Neongrüns `#C2F84F` der Vorlage.
- **`offset: ["start 20%", "end 25%"]`**, siehe „Der Faden stand praktisch
  still".
- **Strichbreite** 5 statt 20 der Vorlage (und statt der 3, die hier zuerst
  standen): `vector-effect="non-scaling-stroke"` rechnet in echten
  Bildschirmpixeln, nicht im viewBox-Massstab.
- **viewBox-Höhe** 2690 statt 2319 und **`preserveAspectRatio="xMidYMid meet"`**
  statt `"none"`, siehe unten.

Die Pfaddaten sind unverändert aus der Vorlage.

### Der Faden stand praktisch still

Am 20.08.2026 nachgemessen und behoben. Vier Ursachen, die sich gegenseitig
verdeckt haben:

- **Gequetscht.** Mit `preserveAspectRatio="none"` wird die Zeichnung auf die
  Kastenform gezerrt. Der Pfad ist 1278:2690 proportioniert, der Kasten war
  220 × 1084 — die Breite also um Faktor 2.7 zusammengedrückt. Jetzt `meet`
  (Seitenverhältnis bleibt) und 460 Pixel Spaltenbreite; die Zeichnung ist
  damit 460 × 968 statt 220 × 1084.
- **Unten abgeschnitten.** Die viewBox der Vorlage endet bei y = 2319, der Pfad
  läuft aber bis y = 2669 (`getBBox()` im Browser). Die letzten gut 13 Prozent
  wurden ausserhalb gezeichnet und weggeschnitten: unsichtbar, obwohl der
  Fortschritt lief.
- **Falsche Kennlinie.** Die ersten 55 Prozent der Pfadlänge stecken im Knäuel
  ganz oben, das nur ein Fünftel der Höhe einnimmt. Linear abgebildet
  (`[0, 1] → [0.5, 1]` in der Vorlage) stand die Spitze über die halbe
  Scrollstrecke fast still und schoss danach nach unten weg — und mit dem
  Startwert 0.5 war das Knäuel vor dem ersten Scrollen ohnehin schon fertig.
  Jetzt fünf Stützpunkte: das Knäuel wird zuerst geschrieben, danach folgt die
  Spitze der Leserichtung. Nachgemessen bei 1440 × 900 bleibt sie dabei
  durchgehend zwischen 165 und 386 Pixeln unter der Fensteroberkante.

  Der erste Wurf gab dem Knäuel nur die ersten 14 Prozent des Scrollwegs
  (`[0, 0.14, 0.4, 0.7, 1]`) — fast die halbe Zeichnung lief in einem
  Siebtel der Strecke ab, das Knäuel schien einzuschnappen statt sich zu
  zeichnen. Kasum hat das am 20.08.2026 abends nochmal gemeldet. Jetzt
  bekommt das Knäuel die ersten 35 Prozent (`[0, 0.35, 0.6, 0.82, 1]`),
  gut zweieinhalb Mal so viel Scrollweg für dieselbe Strecke.
- **Zu spät gestartet.** `offset: ["start end", "end start"]` liess den
  Fortschritt schon laufen, bevor überhaupt gescrollt werden konnte — der
  Bereich steht ganz oben auf der Seite und ist beim ersten Bild bereits da.
  Jetzt `["start 20%", "end 25%"]`: der Faden legt mit der ersten
  Mausraddrehung los und ist fertig, wenn die Unterkante des Bereichs das obere
  Viertel des Fensters erreicht.

Ausserdem entfernt: das `strokeDashoffset: useTransform(pathLength, v => 1 - v)`
der Vorlage. framer-motion baut aus `pathLength` selbst `stroke-dasharray` und
`stroke-dashoffset` als Attribute; der Wert kam dort nie an (im Browser
gemessen: dashoffset bleibt 0px), war also wirkungslos.

### Zwei Fehler auf dem Weg dahin

**`process is not defined`.** Eine frühere Fassung baute die Komponente als
eigenes Bundle im Vite-Library-Modus. Dabei ersetzt Vite `process.env.NODE_ENV`
nicht automatisch, anders als bei einem normalen Seiten-Build — im Browser gibt
es kein `process`, das Skript brach beim Start ab, React mountete nie.
`vite build` meldete dabei nie einen Fehler. Mit dem Umbau auf das
Multi-Page-Setup ist das Problem strukturell weg: die Startseite ist jetzt ein
normaler Vite-Einstiegspunkt, keine Bibliothek.

**Eigenbau statt Bibliothek.** Zwischendurch war `<motion.path>` durch ein
normales `<path>` plus `useMotionValueEvent` ersetzt, um Bundle-Größe zu
sparen. Wieder verworfen: das ist Handarbeit an genau der Stelle, an der
framer-motion selbst am besten weiss, wann es schreibt — und die Vorlage sollte
Vorlage bleiben.

**Lehre aus beidem:** ein fehlerfrei durchlaufender Build beweist nicht, dass
der Code läuft. Einmal echt im Browser öffnen, nicht nur Dateigröße und
Quelltext prüfen.

### Größe

Das Startseiten-Bundle wiegt rund 93 kB komprimiert — das ist React, ReactDOM
und framer-motion. Die anderen fünf Seiten laden davon nichts, sie liegen
weiterhin bei wenigen Kilobyte. Das ursprüngliche Performance-Budget von 150 kB
galt für eine Seite ganz ohne Bibliothek; für die Startseite ist es damit
bewusst überschritten, für alle anderen Seiten gilt es unverändert.

Bewusst nicht gemacht: React von einem CDN laden, um die Datei kleiner zu
halten — das wäre ein echter Request an einen fremden Server, genau das, was
die Datenschutzerklärung ausschliesst. Die Meta-Beschreibung der Startseite
verspricht deshalb nicht mehr „keine fremden Skripte"; Datenschutzerklärung und
Impressum bleiben unverändert wahr, denn das selbst gehostete Bundle stellt
keine Anfrage an Dritte, setzt keine Cookies und misst nichts.

Ohne JavaScript bleibt `#faden-root` leer — kein Fehler, keine Lücke im Layout.

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

## Bewegung

Kein GSAP, kein anime.js. Beide waren am 20.08.2026 kurz installiert und sind
wieder raus: GSAP kostet komprimiert rund 28 kB, mit ScrollTrigger eher 40 —
zu schwer für einen sitegweiten Einsatz auf einer Seite, die „von Hand
geschrieben, kein Ballast" verkauft.

**Eine Ausnahme gibt es seit demselben Tag noch:** der Faden im Kopfbereich
läuft auf echtem React plus framer-motion, siehe unten. Kasum wollte dort
ausdrücklich die echte Bibliothek statt einer Nachbildung — der Unterschied
zu GSAP/anime.js ist, dass dieser Baustein isoliert bleibt (eigenes
Teilprojekt, eigenes kompiliertes Bundle, nur auf `index.html` geladen)
statt sitegweit eingebunden zu sein.

**Kein Scroll-Reveal.** Bis zum 20.08.2026 blendeten Blöcke beim Runterscrollen
nacheinander ein (IntersectionObserver, Klasse `.auftritt`/`.sichtbar`). Kasum
hat das an diesem Tag verworfen — für ihn ist genau dieses „man scrollt runter
und Dinge tauchen auf" das Erkennungszeichen einer Vibe-Coding-Seite. Der Block
ist ersatzlos aus `skript/haupt.js` raus, keine Klassen `auftritt*`/`sichtbar`
mehr irgendwo im HTML. Alle Blöcke stehen von Anfang an da.

**Wobei dieser Umbau eine Weile lang etwas kaputt gemacht hat:** eine frühere
Fassung des Auftritt-Umbaus hat aus Versehen die ganze Leistungen-Sektion
(One-Pager, Mehrseitige Website, Wartung) mitgelöscht, weil ein Textersatz eine
grössere Textspanne traf als beabsichtigt. Deshalb lief der Menüpunkt
„Leistungen" damals ins Leere. Per `git checkout` auf den letzten Commit
zurückgeholt, dann sauber neu aufgebaut — daraus ist bei der Gelegenheit auch
`leistungen.html` entstanden, siehe oben.

Was an Bewegung bleibt, steckt in `skript/haupt.js` (rund 9 kB roh, komprimiert
unter 3) und in CSS-Übergängen:

- **Strichzeichnung**: Die drei Symbole bei den Leistungen zeichnen sich einmal
  selbst, kurz nachdem die Seite geladen ist — dieselbe Technik wie beim
  Kachelrahmen: JavaScript misst die Länge jeder Form, CSS lässt den Versatz
  auf null laufen. Gebunden ans Laden, nicht ans Scrollen.
- **Kopf**: läuft mit, Schriftzug fährt beim Scrollen zusammen.
- **Schublade**: die Navigation auf dem Handy, siehe unten.
- **Leistungen-Seite**: Nummer wird beim Zeigen oliv und rückt 6 Pixel nach
  rechts, reine Hover-Reaktion, siehe oben.
- **Kachelrahmen** und **Referenz-Kachel**: zeichnen sich beziehungsweise
  blenden ein, wenn man mit der Maus darüberfährt — auch das reine
  Hover-Reaktion, kein Auto-Play.

Der erste Bildschirm bewegt sich ohnehin nicht. H1 und die drei
Über-uns-Abschnitte stehen sofort da — die Markenrichtung verbietet
Ladeanimationen, und der erste Eindruck soll fertig sein, nicht im Aufbau.

`prefers-reduced-motion` schaltet an, was an Übergängen übrig ist: dann steht
auch die Symbolzeichnung sofort fertig da statt langsam zu zeichnen.

**Ohne JavaScript** bleibt alles sichtbar und bedienbar. Eine Zeile im Kopf
jeder Seite setzt die Klasse `js` am Wurzelelement; jede Regel, die etwas
versteckt, hängt daran. Fällt das Skript aus, fehlt die Klasse und die Seite
steht wie ein Dokument da.

## Menü auf dem Handy

Unter 860 Pixel liegt die Navigation in einer Schublade unter dem Kopf, der
Knopf sitzt rechts neben „Unverbindlich anfragen". Fünf Punkte passen nicht
mehr in eine Zeile, ohne dass Kontakt aus dem Bild läuft.

Die Höhe animiert über `grid-template-rows` von `0fr` auf `1fr` — der einzige
Weg, eine unbekannte Höhe zu animieren, ohne sie vorher zu kennen. Geschlossen
ist die Schublade auch für die Tabulatortaste zu (`visibility: hidden`), sonst
wandert der Fokus in etwas Unsichtbares. Escape schliesst, ein Klick auf einen
Punkt ebenfalls.

Ohne JavaScript erscheint der Knopf gar nicht erst und die Navigation steht
wie früher als Zeile unter dem Kopf.

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

`npm run dev` und dann http://localhost:5173 öffnen — siehe „Starten" ganz oben.

Ein direkter Doppelklick auf `index.html` funktioniert seit dem Umbau auf Vite
nicht mehr vollständig: der Faden im Kopfbereich braucht den Entwicklungsserver
(oder einen `npm run build`), weil die React-Datei erst übersetzt werden muss.
Der Rest der Seite ist auch so lesbar.

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
