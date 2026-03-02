import { Resend } from "resend";

export async function resendMailer({ to, subject, text, html, from }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing");
  }

  const resend = new Resend(apiKey);
  const sender = process.env.RESEND_EMAIL_FROM || from;
  if (!sender) {
    throw new Error("RESEND_EMAIL_FROM (or MAIL_FROM) is required");
  }

  const { data, error } = await resend.emails.send({
    from: sender,
    to: [to],
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(error.message || "Failed to send email via Resend");
  }

  return data;
}
