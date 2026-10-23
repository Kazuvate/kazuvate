/**
 * fragen.ts, seit 11.10.2026
 *
 * Die Frageleiste auf der Startseite (Markup am Ende von <main>, Stil in
 * stil/basis.css). Ohne dieses Skript funktioniert sie schon: der Knopf
 * oeffnet das Blatt als Popover, Esc und ein Klick daneben schliessen es,
 * offen ist die erste Frage. Das Skript fuegt zwei Dinge hinzu:
 *
 * 1. Die Frage in der Leiste wechselt mit dem Abschnitt im Bild. Jeder
 *    Abschnitt traegt dafuer data-frage. Gewechselt wird still: nur der
 *    Text wird ausgetauscht, ohne Animation und ohne Ansage fuer den
 *    Screenreader -- es ist ein Angebot, keine Meldung.
 * 2. Beim Oeffnen ist genau die Frage aufgeklappt, die in der Leiste
 *    stand, und der Fokus steht auf ihr. Beim Schliessen gibt der Browser
 *    ihn an den Knopf zurueck, von dem aus geoeffnet wurde.
 */
export function starte(blatt: HTMLElement) {
  const knopf = document.querySelector<HTMLButtonElement>(".frageleiste-knopf");
  const frage = (id: string) => blatt.querySelector<HTMLDetailsElement>(`#frage-${id}`);
  let aktuell = "";

  function setze(id: string) {
    const d = frage(id);
    if (!d || id === aktuell) return;
    aktuell = id;
    if (knopf) knopf.textContent = d.querySelector("summary")?.textContent ?? "";
  }

  // Ein Abschnitt gilt, sobald er die Mitte des Fensters kreuzt.
  const beobachter = new IntersectionObserver(
    (eintraege) => {
      for (const e of eintraege) if (e.isIntersecting) setze((e.target as HTMLElement).dataset.frage ?? "");
    },
    { rootMargin: "-50% 0px -50% 0px" },
  );
  document.querySelectorAll<HTMLElement>("main [data-frage]").forEach((a) => beobachter.observe(a));

  blatt.addEventListener("beforetoggle", (e) => {
    if ((e as ToggleEvent).newState === "open" && aktuell) {
      const d = frage(aktuell);
      if (d) d.open = true;
    }
  });
  blatt.addEventListener("toggle", (e) => {
    if ((e as ToggleEvent).newState !== "open") return;
    blatt.querySelector<HTMLElement>("details[open] summary")?.focus();
  });
}
