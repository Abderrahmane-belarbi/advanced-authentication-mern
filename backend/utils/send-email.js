import { fallbackTransporter, primaryTransporter } from "../config/mailer.js";

async function withTimeout(promise, timeoutMs, label) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

async function sendWithTransporter(transporter, payload, timeoutMs, label) {
  return withTimeout(transporter.sendMail(payload), timeoutMs, label);
}

function formatSmtpError(error) {
  if (!error) {
    return "Unknown SMTP error";
  }

  const parts = [error.message];
  if (error.code) {
    parts.push(`code=${error.code}`);
  }
  if (error.command) {
    parts.push(`command=${error.command}`);
  }
  if (error.responseCode) {
    parts.push(`responseCode=${error.responseCode}`);
  }

  return parts.join(" | ");
}

export async function sendEmail({ to, subject, text, html }) {
  const timeoutMs = Number(process.env.SMTP_SEND_TIMEOUT_MS || 30_000);

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

    console.error(
      "Primary SMTP send failed, retrying on fallback SMTP port:",
      formatSmtpError(primaryError),
    );

    try {
      return await sendWithTransporter(fallbackTransporter, payload, timeoutMs, "SMTP fallback send");
    } catch (fallbackError) {
      console.error("Fallback SMTP send failed:", formatSmtpError(fallbackError));
      throw fallbackError;
    }
  }
}
