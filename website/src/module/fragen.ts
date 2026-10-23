// Frageleiste der Startseite: die Frage wechselt still mit dem Abschnitt. Ohne dieses Skript oeffnet der Knopf das Blatt trotzdem.
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
