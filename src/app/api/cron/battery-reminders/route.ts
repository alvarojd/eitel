import { NextResponse } from 'next/server';
import { db } from '../../../../infrastructure/database/db';
import { devices } from '../../../../infrastructure/database/schema';
import { lt, and, or, isNull, lte, eq } from 'drizzle-orm';
import { getAlertRecipients, sendEmail } from '../../../../lib/email/resend';
import { AlertEmailTemplate } from '../../../../emails/AlertEmailTemplate';
import React from 'react';

export async function GET(request: Request) {
  try {
    // Vercel Cron Authentication: Validate the request is from Vercel CRON
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Estrategia: "Si el sensor sigue por debajo del 20%, envías un recordatorio cada 7 días"
    // Buscamos dispositivos con battery < 20 donde lastBatteryAlertSentAt es null o fue hace más de 7 días.
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const lowBatteryDevices = await db.select().from(devices)
      .where(
        and(
          lt(devices.battery, 20),
          or(
            isNull(devices.lastBatteryAlertSentAt),
            lte(devices.lastBatteryAlertSentAt, sevenDaysAgo)
          )
        )
      );

    if (lowBatteryDevices.length === 0) {
      return NextResponse.json({ message: 'No devices require battery reminders at this time.' });
    }

    const recipients = await getAlertRecipients();
    if (recipients.length === 0) {
      return NextResponse.json({ message: 'No recipients configured.' });
    }

    let emailsSent = 0;
    const now = new Date();

    for (const device of lowBatteryDevices) {
      await sendEmail({
        to: recipients,
        subject: `⚠️ Recordatorio Semanal: Batería baja en ${device.name || device.devEui}`,
        react: React.createElement(AlertEmailTemplate, {
          type: 'battery',
          devEui: device.devEui,
          name: device.name,
          battery: device.battery,
          latitude: device.latitude ? device.latitude.toString() : null,
          longitude: device.longitude ? device.longitude.toString() : null,
        }),
      });

      // Update the DB to record that we just sent a reminder
      await db.update(devices)
        .set({ lastBatteryAlertSentAt: now })
        .where(eq(devices.devEui, device.devEui));
      
      emailsSent++;
    }

    return NextResponse.json({ success: true, emailsSent, devices: lowBatteryDevices.map(d => d.devEui) });
  } catch (error) {
    console.error('Error in battery-reminders cron:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
