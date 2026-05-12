import nodemailer from 'nodemailer';
import { db } from '../../infrastructure/database/db';
import { alertEmails } from '../../infrastructure/database/schema';
import { render } from '@react-email/components';

// Helper to check if SMTP is configured
const isSmtpConfigured = () => {
  return process.env.SMTP_USER && process.env.SMTP_PASS;
};

// Create a nodemailer transporter using Gmail by default,
// or falling back to environment variables.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

/**
 * Helper function to retrieve all configured alert emails from the database.
 */
export async function getAlertRecipients(): Promise<string[]> {
  try {
    const records = await db.select({ email: alertEmails.email }).from(alertEmails);
    return records.map(r => r.email);
  } catch (error) {
    console.error("Error fetching alert recipients:", error);
    return [];
  }
}

/**
 * Sends an email using Nodemailer.
 */
export async function sendEmail({
  to,
  subject,
  react
}: {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
}) {
  if (!isSmtpConfigured()) {
    console.warn("SMTP_USER or SMTP_PASS is not defined. Email would have been sent to:", to, "with subject:", subject);
    return { success: true, dummy: true };
  }

  // Si no hay destinatarios, no hacemos nada
  if (!to || (Array.isArray(to) && to.length === 0)) {
    return { success: false, error: 'No recipients provided' };
  }

  try {
    // Render the React component to an HTML string
    const html = await render(react);
    const recipients = Array.isArray(to) ? to.join(', ') : to;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL || `"Alertas Hexasense" <${process.env.SMTP_USER}>`,
      to: recipients,
      subject,
      html,
    });

    return { success: true, data: info };
  } catch (error) {
    console.error("Nodemailer API Error:", error);
    return { success: false, error };
  }
}
