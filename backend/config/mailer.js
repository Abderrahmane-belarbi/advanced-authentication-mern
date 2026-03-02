import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpFallbackPort = Number(process.env.SMTP_FALLBACK_PORT || 587);
const smtpConnectionTimeout = Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 30_000);
const smtpGreetingTimeout = Number(process.env.SMTP_GREETING_TIMEOUT_MS || 30_000);
const smtpSocketTimeout = Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 30_000);
const smtpDnsTimeout = Number(process.env.SMTP_DNS_TIMEOUT_MS || 15_000);
const smtpAllowSelfSigned = process.env.SMTP_TLS_REJECT_UNAUTHORIZED === "false";

function buildTransporter(port) {
  const secure = port === 465;
  return nodemailer.createTransport({
    host: smtpHost,
    port,
    // 465 expects implicit TLS, while 587 typically upgrades via STARTTLS.
    secure,
    requireTLS: !secure,
    connectionTimeout: smtpConnectionTimeout,
    greetingTimeout: smtpGreetingTimeout,
    socketTimeout: smtpSocketTimeout,
    dnsTimeout: smtpDnsTimeout,
    debug: process.env.NODE_ENV === "development",
    logger: process.env.NODE_ENV === "development",
    tls: {
      servername: smtpHost,
      minVersion: "TLSv1.2",
      rejectUnauthorized: !smtpAllowSelfSigned,
    },
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
