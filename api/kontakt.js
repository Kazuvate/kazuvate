/**
 * Vercel Serverless Function fuer das Kontaktformular auf kontakt.html.
 *
 * Nimmt die POST-Daten des Formulars entgegen -- der Browser schickt sie bei
 * <form method="post"> ohne eigenes enctype als
 * application/x-www-form-urlencoded, Vercels Node-Laufzeit parst das
 * normalerweise von selbst in req.body -- und schickt sie per Resend als
 * E-Mail an kasumbajrami7@gmail.com. reply_to ist die Adresse der
 * anfragenden Person, damit eine Antwort im Mailprogramm direkt bei ihr
 * landet statt bei Resend.
 *
 * ABSENDER: "onboarding@resend.dev" ist Resends Test-Absender. Er
 * funktioniert ohne eigene Domain, verschickt aber nur an die E-Mail, mit
 * der das Resend-Konto erstellt wurde. Das reicht hier: das Konto laeuft auf
 * kasumbajrami7@gmail.com, genau der Adresse, an die das Formular ohnehin
 * gehen soll. Sobald kazuvate.ch gekauft und bei Resend als Domain
 * verifiziert ist (SPF/DKIM-Eintraege), kann ABSENDER auf
 * "Kazuvate <kontakt@kazuvate.ch>" wechseln -- erst dann kommt Mail auch bei
 * anderen Empfaengern als dieser einen Testadresse an.
 *
 * RESEND_API_KEY muss in Vercel unter Project Settings -> Environment
 * Variables gesetzt sein (Resend-Konto -> API Keys). Ohne den Schluessel
 * schlaegt jeder Versand fehl.
 *
 * Spamschutz ohne Captcha, wie im Datenschutz-Abschnitt "Kontaktformular"
 * angekuendigt: ein fuer Menschen unsichtbares Feld (siehe .fangfeld in
 * stil/kontakt.css) und eine Zeitpruefung -- schneller als zwei Sekunden
 * zwischen Laden und Absenden schafft kein Mensch, der vier Felder ausfuellt
 * und eine Nachricht schreibt (siehe skript/haupt.js fuer den Zeitstempel).
 * Beide Treffer bekommen dieselbe Antwort wie ein echter Erfolg: eine
 * Weiterleitung auf die Danke-Seite der jeweiligen Sprache, ohne
 * Fehlermeldung. Das kostet nichts (es
 * wird ja nichts verschickt) und verraet einem Bot nicht, dass er
 * aufgeflogen ist -- ein Bot, der eine Fehlermeldung sieht, passt seinen
 * naechsten Versuch an, einer, der eine Erfolgsseite sieht, nicht.
 */

const EMPFAENGER = "kasumbajrami7@gmail.com";
const ABSENDER = "Kazuvate Website <onboarding@resend.dev>";
const PFLICHTFELDER = ["vorname", "name", "email", "nachricht"];

/** Seit 25.09.2026 gibt es das Formular auf Deutsch, Englisch und
 *  Franzoesisch. Jede Fassung schickt ihre Sprache im versteckten Feld
 *  "sprache" mit, damit Erfolg und Fehler auf der Seite in derselben
 *  Sprache landen. Fehlt das Feld oder steht etwas Unbekanntes drin,
 *  gilt Deutsch -- so bleibt eine alte, noch zwischengespeicherte
 *  Kontaktseite ohne das Feld weiterhin funktionsfaehig. */
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

/** req.body ist auf Vercel normalerweise schon geparst. Der Rueckfallpfad
 *  liest den rohen Stream selbst, falls eine Laufzeit das mal nicht tut --
 *  ohne das wuerde jede Anfrage still verpuffen, statt eine Mail zu
 *  verschicken, und das waere ohne Deploy schwer zu bemerken. */
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

/** Nicht-deutsche Anfragen tragen die Sprache schon im Betreff, damit
 *  in der Mailbox sofort sichtbar ist, in welcher Sprache zu antworten
 *  ist. */
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
