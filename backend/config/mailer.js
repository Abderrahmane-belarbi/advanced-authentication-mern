import nodemailer from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT || 465);

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 10_000,
  debug: process.env.NODE_ENV === "development",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function verifyMailerConnection() {
  try {
    await transporter.verify();
    console.log("SMTP server is reachable and ready to send emails");
  } catch (error) {
    console.error("SMTP verification failed. Signup may work but email delivery will fail on this deployment:", error.message);
  }
}
