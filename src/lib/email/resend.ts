import { Resend } from 'resend';
import { db } from '../../infrastructure/database/db';
import { alertEmails } from '../../infrastructure/database/schema';

// Initialize the Resend client. 
// It will gracefully fail or do nothing if the API key is not provided yet.
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

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
 * Sends an email using Resend.
 */
export async function sendEmail({
  to,
  subject,
  react
}: {
  to: string | string[];
  subject: string;
  react: React.ReactElement | React.ReactNode | null;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not defined. Email would have been sent to:", to, "with subject:", subject);
    return { success: true, dummy: true };
  }

  // Si no hay destinatarios, no hacemos nada
  if (!to || (Array.isArray(to) && to.length === 0)) {
    return { success: false, error: 'No recipients provided' };
  }

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Hexasense Alertas <onboarding@resend.dev>',
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Resend API Error:", error);
    return { success: false, error };
  }
}
