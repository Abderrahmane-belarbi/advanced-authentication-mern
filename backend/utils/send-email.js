import { fallbackTransporter, primaryTransporter } from "../config/mailer.js";
import { resendMailer } from "../config/resend-mailer.js";

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
  if (!transporter) {
    throw new Error(`${label} unavailable: SMTP transporter is not configured`);
  }

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
  return withTimeout(resendMailer(payload), timeoutMs, "Resend API send");
}

export async function sendEmail({ to, subject, text, html }) {
  const timeoutMs = Number(process.env.SMTP_SEND_TIMEOUT_MS || 30_000);
  const emailTransport = (process.env.EMAIL_TRANSPORT || "auto").toLowerCase();
  const shouldTryResend =
    emailTransport === "resend" || (emailTransport === "auto" && Boolean(process.env.RESEND_API_KEY));
  const shouldTrySmtp = emailTransport === "smtp" || emailTransport === "auto";

  const payload = {
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
    html,
  };

  if (shouldTryResend) {
    try {
      return await sendWithResendApi(payload, timeoutMs);
    } catch (resendError) {
      if (!shouldTrySmtp) {
        throw resendError;
      }
      console.error("Resend API send failed, retrying on SMTP:", resendError.message);
    }
  }

  if (!shouldTrySmtp) {
    throw new Error(`EMAIL_TRANSPORT is set to '${emailTransport}' but no valid sender is configured`);
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
