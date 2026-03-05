import { google } from "googleapis";

export async function sendMail({ to, subject, text }) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.MODE === "development"
      ? process.env.LOCAL_GOOGLE_REDIRECT_URI
      : process.env.PUBLIC_GOOGLE_REDIRECT_URI
  );

  // Set the refresh token
  oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  // Encode message
  const raw = Buffer.from(
    `From: "CrewAuth" <${process.env.EMAIL_FROM}>\r\n` +
    `To: ${to}\r\n` +
    `Subject: ${subject}\r\n\r\n` +
    `${text}`
  )
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
}