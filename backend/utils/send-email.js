import { fallbackTransporter, primaryTransporter } from "../config/mailer.js";

function withTimeout(promise, timeoutMs, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${label} timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    }),
  ]);
}

async function sendWithTransporter(transporter, payload, timeoutMs, label) {
  return withTimeout(transporter.sendMail(payload), timeoutMs, label);
}

export async function sendEmail({ to, subject, text, html }) {
  const timeoutMs = Number(process.env.SMTP_SEND_TIMEOUT_MS || 10_000);

  const payload = {
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
    html,
  };

  try {
    return await sendWithTransporter(primaryTransporter, payload, timeoutMs, "SMTP primary send");
  } catch (primaryError) {
    if (!fallbackTransporter) {
      throw primaryError;
    }

    console.error("Primary SMTP send failed, retrying on fallback SMTP port:", primaryError.message);
    return sendWithTransporter(fallbackTransporter, payload, timeoutMs, "SMTP fallback send");
  }
}