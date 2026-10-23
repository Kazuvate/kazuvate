// KV-Zeichen im Fuss aus Punkten, die der Mauszeiger wegstoesst. Nur mit Maus und ohne reduzierte Bewegung.

const RASTER = 3; // Abstand der Punkte in CSS-Pixeln
const RADIUS = 14; // Reichweite des Zeigers
const STOSS = 8; // weitester Weg eines Punktes
const RAND = RADIUS + STOSS; // so weit reicht die Flaeche um das Zeichen

export function starte(fuss: HTMLElement, svg: SVGSVGElement, pfad: string) {
  const marke = svg.parentElement!;
  const leinwand = document.createElement("canvas");
  leinwand.className = "kv-punkte";
  leinwand.setAttribute("aria-hidden", "true");
  svg.after(leinwand);
  const c = leinwand.getContext("2d")!;

  const tau = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--kurz")) || 200) / 3;

  let punkte: { x: number; y: number; ox: number; oy: number }[] = [];
  let breite = 0, hoehe = 0, zx = -1e4, zy = -1e4, innen = false, laeuft = 0, zuletzt = 0, farbe = "";

  function vermessen() {
    farbe = getComputedStyle(svg).color;
    const b = svg.getBoundingClientRect();
    const m = marke.getBoundingClientRect();
    breite = Math.round(b.width) + 2 * RAND;
    hoehe = Math.round(b.height) + 2 * RAND;
    const dpr = window.devicePixelRatio || 1;
    Object.assign(leinwand.style, {
      left: b.left - m.left - RAND + "px",
      top: b.top - m.top - RAND + "px",
      width: breite + "px",
      height: hoehe + "px",
    });
    leinwand.width = breite * dpr;
    leinwand.height = hoehe * dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    const hilf = document.createElement("canvas");
    hilf.width = Math.ceil(b.width);
    hilf.height = Math.ceil(b.height);
    const h = hilf.getContext("2d")!;
    const vb = svg.viewBox.baseVal;
    h.scale(b.width / vb.width, b.height / vb.height);
    h.fill(new Path2D(pfad), "evenodd");
    const daten = h.getImageData(0, 0, hilf.width, hilf.height).data;
    punkte = [];
    for (let y = RASTER / 2; y < b.height; y += RASTER) {
      for (let x = RASTER / 2; x < b.width; x += RASTER) {
        if (daten[(Math.floor(y) * hilf.width + Math.floor(x)) * 4 + 3] > 127) {
          punkte.push({ x: x + RAND, y: y + RAND, ox: 0, oy: 0 });
        }
      }
    }
  }

  function bild(zeit: number) {
    const dt = Math.min(64, zeit - (zuletzt || zeit));
    zuletzt = zeit;
    const anteil = 1 - Math.exp(-dt / tau);
    c.clearRect(0, 0, breite, hoehe);
    c.fillStyle = farbe;
    c.beginPath();
    let ruhe = true;
    for (const p of punkte) {
      let tx = 0, ty = 0;
      const dx = p.x - zx, dy = p.y - zy, d = Math.hypot(dx, dy);
      if (innen && d < RADIUS && d > 0) {
        const k = (1 - d / RADIUS) ** 2 * STOSS;
        tx = (dx / d) * k;
        ty = (dy / d) * k;
      }
      p.ox += (tx - p.ox) * anteil;
      p.oy += (ty - p.oy) * anteil;
      if (Math.abs(p.ox - tx) > 0.05 || Math.abs(p.oy - ty) > 0.05) ruhe = false;
      c.moveTo(p.x + p.ox + 1, p.y + p.oy);
      c.arc(p.x + p.ox, p.y + p.oy, 1, 0, 7);
    }
    c.fill();
    if (ruhe) {
      laeuft = 0;
      zuletzt = 0;
      if (!innen) marke.classList.remove("kv-aktiv");
      return;
    }
    laeuft = requestAnimationFrame(bild);
  }

  function los() {
    if (!laeuft) laeuft = requestAnimationFrame(bild);
  }

  function bewegt(e: PointerEvent) {
    let r = leinwand.getBoundingClientRect();
    const drin = (x: number, y: number) => x >= 0 && y >= 0 && x <= breite && y <= hoehe;
    if (e.pointerType === "touch") return;
    if (!marke.classList.contains("kv-aktiv")) {
      if (!drin(e.clientX - r.left, e.clientY - r.top)) return;
      vermessen();
      r = leinwand.getBoundingClientRect();
      marke.classList.add("kv-aktiv");
    }
    zx = e.clientX - r.left;
    zy = e.clientY - r.top;
    innen = drin(zx, zy);
    los();
  }

  vermessen();
  window.addEventListener("resize", vermessen);
  fuss.addEventListener("pointermove", bewegt);
  fuss.addEventListener("pointerleave", () => {
    innen = false;
    if (marke.classList.contains("kv-aktiv")) los();
  });
}
