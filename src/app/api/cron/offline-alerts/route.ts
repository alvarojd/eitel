import { NextResponse } from 'next/server';
import { db } from '../../../../infrastructure/database/db';
import { devices } from '../../../../infrastructure/database/schema';
import { lte, and, or, isNull, eq } from 'drizzle-orm';
import { getAlertRecipients, sendEmail } from '../../../../lib/email/mailer';
import { AlertEmailTemplate } from '../../../../emails/AlertEmailTemplate';
import React from 'react';

// Format helper
function formatTimeDifference(lastMeasuredAt: Date): string {
  const diffHours = Math.floor((new Date().getTime() - lastMeasuredAt.getTime()) / (1000 * 60 * 60));
  if (diffHours < 48) return `${diffHours} horas`;
  return `${Math.floor(diffHours / 24)} días`;
}

export async function GET(request: Request) {
  try {
    // Vercel Cron Authentication: Validate the request is from Vercel CRON
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Estrategia: "Si el sensor deja de enviar datos por más de 24 horas, envías un correo semanal"
    // Buscamos dispositivos cuyo lastMeasuredAt sea <= 24 horas atrás
    // Y que lastOfflineAlertSentAt sea null o haya sido hace más de 7 días (es semanal).
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const offlineDevices = await db.select().from(devices)
      .where(
        and(
          lte(devices.lastMeasuredAt, twentyFourHoursAgo),
          or(
            isNull(devices.lastOfflineAlertSentAt),
            lte(devices.lastOfflineAlertSentAt, sevenDaysAgo)
          )
        )
      );

    if (offlineDevices.length === 0) {
      return NextResponse.json({ message: 'No devices require offline alerts at this time.' });
    }

    const recipients = await getAlertRecipients();
    if (recipients.length === 0) {
      return NextResponse.json({ message: 'No recipients configured.' });
    }

    let emailsSent = 0;
    const now = new Date();

    for (const device of offlineDevices) {
      if (!device.lastMeasuredAt) continue; // Safety check

      await sendEmail({
        to: recipients,
        subject: `🔴 Alerta Crítica: Sensor offline - ${device.name || device.devEui}`,
        react: React.createElement(AlertEmailTemplate, {
          type: 'offline',
          devEui: device.devEui,
          name: device.name,
          battery: device.battery,
          latitude: device.latitude ? device.latitude.toString() : null,
          longitude: device.longitude ? device.longitude.toString() : null,
          timeSinceLastMessage: formatTimeDifference(device.lastMeasuredAt),
        }),
      });

      // Update the DB
      await db.update(devices)
        .set({ lastOfflineAlertSentAt: now })
        .where(eq(devices.devEui, device.devEui));
      
      emailsSent++;
    }

    return NextResponse.json({ success: true, emailsSent, devices: offlineDevices.map(d => d.devEui) });
  } catch (error) {
    console.error('Error in offline-alerts cron:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
