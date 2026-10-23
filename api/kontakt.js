// Vercel Function des Kontaktformulars: schickt die Anfrage per Resend an Kasum, reply_to ist die anfragende Person.
// RESEND_API_KEY kommt aus den Environment Variables, nie aus dem Code.
// onboarding@resend.dev sendet nur an die Adresse des Resend-Kontos, bis kazuvate.ch dort verifiziert ist.
// Fangfeld und Zeitpruefung (unter 2 s) bekommen dieselbe Erfolgsantwort wie ein echter Versand, damit ein Bot nichts merkt.

const EMPFAENGER = "kasumbajrami7@gmail.com";
const ABSENDER = "Kazuvate Website <onboarding@resend.dev>";
const PFLICHTFELDER = ["vorname", "name", "email", "nachricht"];

const ZIELE = {
  de: { danke: "/danke.html", kontakt: "/kontakt.html", name: "Deutsch" },
  en: { danke: "/en/thank-you.html", kontakt: "/en/contact.html", name: "Englisch" },
  fr: { danke: "/fr/merci.html", kontakt: "/fr/contact.html", name: "Franzoesisch" },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end("Method Not Allowed");
    return;
  }

  const daten = await formularDaten(req);
  const ziel = ZIELE[daten.sprache] ?? ZIELE.de;

  if (istSpam(daten)) {
    weiterleiten(res, ziel.danke);
    return;
  }

  if (PFLICHTFELDER.some((feld) => !String(daten[feld] ?? "").trim())) {
    weiterleiten(res, `${ziel.kontakt}?fehler=eingabe#anfrage`);
    return;
  }

  try {
    await mailSenden(daten, ziel);
    weiterleiten(res, ziel.danke);
  } catch (fehler) {
    console.error("Resend-Versand fehlgeschlagen:", fehler);
    weiterleiten(res, `${ziel.kontakt}?fehler=versand#anfrage`);
  }
}

async function formularDaten(req) {
  if (req.body && typeof req.body === "object") return req.body;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const roh = Buffer.concat(chunks).toString("utf-8");
  return Object.fromEntries(new URLSearchParams(roh));
}

function istSpam(daten) {
  if (String(daten.webseite ?? "").trim()) return true;

  const start = Number(daten.zeit);
  if (start && Date.now() - start < 2000) return true;

  return false;
}

async function mailSenden(daten, ziel) {
  const betreff =
    (ziel === ZIELE.de ? "" : `[${ziel.name}] `) +
    `Anfrage von ${daten.vorname} ${daten.name}` +
    (daten.organisation ? ` (${daten.organisation})` : "");

  const text = [
    `Vorname: ${daten.vorname}`,
    `Name: ${daten.name}`,
    daten.organisation ? `Organisation: ${daten.organisation}` : null,
    `E-Mail: ${daten.email}`,
    `Sprache der Seite: ${ziel.name}`,
    "",
    "Nachricht:",
    daten.nachricht,
  ]
    .filter((zeile) => zeile !== null)
    .join("\n");

  const antwort = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: ABSENDER,
      to: EMPFAENGER,
      reply_to: daten.email,
      subject: betreff,
      text,
    }),
  });

  if (!antwort.ok) {
    throw new Error(`Resend antwortete mit ${antwort.status}: ${await antwort.text()}`);
  }
}

function weiterleiten(res, pfad) {
  res.statusCode = 302;
  res.setHeader("Location", pfad);
  res.end();
}
