/* ============================================================
   kazuvate | Passt es zu Ihnen?
   Wertet die drei Fragen auf leistungen.html (und den beiden
   Uebersetzungen) aus. Eigene kleine Datei statt eines Blocks in
   haupt.js, damit die sieben anderen Seiten sie nicht mitladen.

   Rein im Browser: kein Absenden, kein Speicher, kein Netz. Die
   Antworttexte stehen als <template> im HTML der jeweiligen Sprache,
   hier steht nur die Regel aus "Kazuvate Angebot":
   dreimal Nein heisst passendes Projekt. Ein Ja gewinnt in dieser
   Reihenfolge: Zahlungen oder Lager vor Login oder Daten vor
   haeufigen Aenderungen -- ein Shopsystem bringt Kundenkonten
   ohnehin mit, und eine Anwendung braucht kein zusaetzliches CMS.

   Ohne dieses Skript fehlt nur die Auswertung, die Regel steht dann
   als Satz unter den Fragen (stil/leistungen.css, .passt-regel).
   ============================================================ */
(function () {
  'use strict';

  var bereich = document.querySelector('.passt');
  if (!bereich) return;

  var ergebnis = bereich.querySelector('.passt-ergebnis');
  var namen = ['passt-inhalt', 'passt-login', 'passt-shop'];
  var angezeigt = null;

  function antwort(name) {
    var gewaehlt = bereich.querySelector('input[name="' + name + '"]:checked');
    return gewaehlt ? gewaehlt.value : null;
  }

  function auswerten() {
    var werte = namen.map(antwort);
    // Erst urteilen, wenn alle drei beantwortet sind. Ein halbes
    // Ergebnis waere eines, das sich beim naechsten Klick widerruft.
    if (werte.indexOf(null) !== -1) return;

    var art = werte[2] === 'ja' ? 'shop'
      : werte[1] === 'ja' ? 'anwendung'
      : werte[0] === 'ja' ? 'cms'
      : 'reden';

    // Gleiches Ergebnis nicht noch einmal einsetzen: die Live-Region
    // wuerde es sonst bei jedem Klick erneut vorlesen.
    if (art === angezeigt) return;

    var vorlage = bereich.querySelector('template[data-ergebnis="' + art + '"]');
    if (!vorlage) return;

    angezeigt = art;
    ergebnis.replaceChildren(vorlage.content.cloneNode(true));
  }

  bereich.addEventListener('change', auswerten);

  // Beim Zurueckblaettern stellt der Browser die gewaehlten Antworten
  // wieder her. Das Ergebnis soll dann dazu passen, nicht leer stehen.
  auswerten();
  window.addEventListener('pageshow', auswerten);
})();
