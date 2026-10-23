// "Passt es zu Ihnen?" auf der Leistungen-Seite: rein im Browser, nichts wird gespeichert oder gesendet.
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
    if (werte.indexOf(null) !== -1) return;

    var art = werte[2] === 'ja' ? 'shop'
      : werte[1] === 'ja' ? 'anwendung'
      : werte[0] === 'ja' ? 'cms'
      : 'reden';

    if (art === angezeigt) return;

    var vorlage = bereich.querySelector('template[data-ergebnis="' + art + '"]');
    if (!vorlage) return;

    angezeigt = art;
    ergebnis.replaceChildren(vorlage.content.cloneNode(true));
  }

  bereich.addEventListener('change', auswerten);

  auswerten();
  window.addEventListener('pageshow', auswerten);
})();
