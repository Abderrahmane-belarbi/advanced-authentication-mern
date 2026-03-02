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

async function sendWithResendApi(payload, timeoutMs) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }

  const request = fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: payload.from,
      to: [payload.to],
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    }),
  });

  const response = await withTimeout(request, timeoutMs, "Resend API send");
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const apiMessage = body?.message || body?.error || response.statusText || "Unknown error";
    throw new Error(`Resend API error ${response.status}: ${apiMessage}`);
  }

  return body;
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

  if (process.env.RESEND_API_KEY) {
    try {
      return await sendWithResendApi(payload, timeoutMs);
    } catch (resendError) {
      console.error("Resend API send failed, retrying on SMTP:", resendError.message);
    }
  }

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
