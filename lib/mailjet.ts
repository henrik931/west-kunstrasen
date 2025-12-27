import Mailjet from "node-mailjet";
import { Reservation, getParcelById } from "./kv";
import { formatEuro } from "./utils";

function getMailjetClient() {
  return new Mailjet({
    apiKey: process.env.MAILJET_API_KEY,
    apiSecret: process.env.MAILJET_SECRET_KEY,
  });
}

interface ParcelSummary {
  type: string;
  count: number;
  totalPrice: number;
}

function groupParcelsByType(parcelIds: string[]): ParcelSummary[] {
  const groups: Record<string, ParcelSummary> = {};

  const typeNames: Record<string, string> = {
    goal: "Tor-Parzelle",
    penalty: "Elfmeterpunkt",
    kickoff: "Anstoßpunkt",
    field: "Feld-Parzelle",
  };

  for (const id of parcelIds) {
    const parcel = getParcelById(id);
    if (!parcel) continue;

    const typeName = typeNames[parcel.type] || parcel.type;

    if (!groups[parcel.type]) {
      groups[parcel.type] = {
        type: typeName,
        count: 0,
        totalPrice: 0,
      };
    }

    groups[parcel.type].count++;
    groups[parcel.type].totalPrice += parcel.price;
  }

  return Object.values(groups);
}

function generateEmailHtml(reservation: Reservation): string {
  const parcelSummary = groupParcelsByType(reservation.parcels);

  const parcelRows = parcelSummary
    .map(
      (p) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5ed;">${
            p.type
          }</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5ed; text-align: center;">${
            p.count
          }</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5ed; text-align: right;">${formatEuro(
            p.totalPrice
          )}</td>
        </tr>
      `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f8;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #262667; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: #F7E816; margin: 0; font-size: 28px;">SC West Köln</h1>
      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Tradition. Veedel. Verein.</p>
    </div>
    
    <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #262667; margin: 0 0 20px 0;">Vielen Dank für Ihre Reservierung!</h2>
      
      <p style="color: #64648a; line-height: 1.6;">
        Liebe/r ${reservation.buyerName},<br><br>
        vielen Dank für Ihre Unterstützung des SC West Köln 1900/11 e.V.! Ihre Reservierung wurde erfolgreich aufgenommen.
      </p>
      
      <div style="background-color: #f8f8fc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #262667; margin: 0 0 15px 0; font-size: 16px;">Reservierungsdetails</h3>
        <p style="margin: 0; color: #64648a;"><strong>Reservierungsnummer:</strong> ${
          reservation.id
        }</p>
        <p style="margin: 5px 0 0 0; color: #64648a;"><strong>Datum:</strong> ${new Date(
          reservation.createdAt
        ).toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}</p>
      </div>
      
      <h3 style="color: #262667; margin: 20px 0 15px 0; font-size: 16px;">Ihre Parzellen</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #262667; color: #ffffff;">
            <th style="padding: 12px; text-align: left; border-radius: 4px 0 0 0;">Typ</th>
            <th style="padding: 12px; text-align: center;">Anzahl</th>
            <th style="padding: 12px; text-align: right; border-radius: 0 4px 0 0;">Preis</th>
          </tr>
        </thead>
        <tbody>
          ${parcelRows}
          <tr style="background-color: #F7E816;">
            <td style="padding: 12px; font-weight: bold; color: #262667;" colspan="2">Gesamtbetrag</td>
            <td style="padding: 12px; text-align: right; font-weight: bold; color: #262667;">${formatEuro(
              reservation.totalAmount
            )}</td>
          </tr>
        </tbody>
      </table>
      
      <div style="background-color: #262667; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h3 style="color: #F7E816; margin: 0 0 15px 0; font-size: 16px;">Zahlungsinformationen</h3>
        <p style="color: #ffffff; margin: 0; line-height: 1.8;">
          <strong>Empfänger:</strong> SC West Köln 1900/11 e.V.<br>
          <strong>IBAN:</strong> DE XX XXXX XXXX XXXX XXXX XX<br>
          <strong>BIC:</strong> XXXXXXXX<br>
          <strong>Verwendungszweck:</strong> Kunstrasen ${reservation.id}<br>
          <strong>Betrag:</strong> ${formatEuro(reservation.totalAmount)}
        </p>
      </div>
      
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #F7E816;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          <strong>Wichtig:</strong> Bitte überweisen Sie den Betrag innerhalb von 14 Tagen. Nach Zahlungseingang werden Ihre Parzellen als verkauft markiert und Sie erhalten eine Bestätigung.
        </p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e5e5ed; margin: 25px 0;">
      
      <p style="color: #64648a; font-size: 12px; line-height: 1.6;">
        Bei Fragen wenden Sie sich bitte an:<br>
        <a href="mailto:kontakt@sc-west-koeln.de" style="color: #262667;">kontakt@sc-west-koeln.de</a><br><br>
        SC West Köln 1900/11 e.V.<br>
        Apenrader Str. 42<br>
        50825 Köln
      </p>
    </div>
    
    <div style="text-align: center; padding: 20px;">
      <a href="https://www.sc-west-koeln.de/" style="color: #262667; text-decoration: none; font-size: 12px;">www.sc-west-koeln.de</a>
    </div>
  </div>
</body>
</html>
  `;
}

function generateEmailText(reservation: Reservation): string {
  const parcelSummary = groupParcelsByType(reservation.parcels);

  const parcelList = parcelSummary
    .map((p) => `- ${p.count}x ${p.type}: ${formatEuro(p.totalPrice)}`)
    .join("\n");

  return `
SC West Köln - Reservierungsbestätigung
========================================

Vielen Dank für Ihre Reservierung!

Liebe/r ${reservation.buyerName},

vielen Dank für Ihre Unterstützung des SC West Köln 1900/11 e.V.!

RESERVIERUNGSDETAILS
--------------------
Reservierungsnummer: ${reservation.id}
Datum: ${new Date(reservation.createdAt).toLocaleDateString("de-DE")}

IHRE PARZELLEN
--------------
${parcelList}

Gesamtbetrag: ${formatEuro(reservation.totalAmount)}

ZAHLUNGSINFORMATIONEN
---------------------
Empfänger: SC West Köln 1900/11 e.V.
IBAN: DE XX XXXX XXXX XXXX XXXX XX
BIC: XXXXXXXX
Verwendungszweck: Kunstrasen ${reservation.id}
Betrag: ${formatEuro(reservation.totalAmount)}

WICHTIG: Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.
Nach Zahlungseingang werden Ihre Parzellen als verkauft markiert.

Bei Fragen: kontakt@sc-west-koeln.de

SC West Köln 1900/11 e.V.
Apenrader Str. 42
50825 Köln
www.sc-west-koeln.de
  `.trim();
}

export async function sendReservationEmail(
  reservation: Reservation
): Promise<boolean> {
  // Mock mode: log email instead of sending
if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
    console.log("\n[MOCK EMAIL] ========================================");
    console.log(`To: ${reservation.buyerName} <${reservation.buyerEmail}>`);
    console.log(
      `Subject: Reservierungsbestätigung - Kunstrasen Aktion (${reservation.id})`
    );
    console.log("----------------------------------------");
    console.log(generateEmailText(reservation));
    console.log("========================================\n");
    return true;
  }

  try {
    const mailjet = getMailjetClient();
    await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_FROM_EMAIL || "noreply@sc-west-koeln.de",
            Name: "SC West Köln",
          },
          To: [
            {
              Email: reservation.buyerEmail,
              Name: reservation.buyerName,
            },
          ],
          Subject: `Reservierungsbestätigung - Kunstrasen Aktion (${reservation.id})`,
          TextPart: generateEmailText(reservation),
          HTMLPart: generateEmailHtml(reservation),
        },
      ],
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}
