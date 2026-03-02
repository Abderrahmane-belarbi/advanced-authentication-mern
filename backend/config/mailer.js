import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpFallbackPort = Number(process.env.SMTP_FALLBACK_PORT || 587);

function buildTransporter(port) {
  return nodemailer.createTransport({
    host: smtpHost,
    port,
    // 465 expects implicit TLS, while 587 typically upgrades via STARTTLS.
    secure: port === 465,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
    debug: process.env.NODE_ENV === "development",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export const primaryTransporter = buildTransporter(smtpPort);

const shouldUseFallbackTransport = smtpFallbackPort !== smtpPort;
export const fallbackTransporter = shouldUseFallbackTransport
  ? buildTransporter(smtpFallbackPort)
  : null;

export async function verifyMailerConnection() {
  try {
    await primaryTransporter.verify();
    console.log(`SMTP primary connection OK (${smtpHost}:${smtpPort})`);
  } catch (primaryError) {
    console.error(`SMTP primary connection failed (${smtpHost}:${smtpPort}):`, primaryError.message);

    if (!fallbackTransporter) {
      return;
    }

    try {
      await fallbackTransporter.verify();
      console.log(`SMTP fallback connection OK (${smtpHost}:${smtpFallbackPort})`);
    } catch (fallbackError) {
      console.error(`SMTP fallback connection failed (${smtpHost}:${smtpFallbackPort}):`, fallbackError.message);
    }
  }
}