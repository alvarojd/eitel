import { NextResponse } from 'next/server';
import { db } from '../../../../infrastructure/database/db';
import { devices } from '../../../../infrastructure/database/schema';
import { lte, and, or, isNull, inArray } from 'drizzle-orm';
import { getAlertRecipients, sendEmail } from '../../../../lib/email/mailer';
import { AlertEmailTemplate } from '../../../../emails/AlertEmailTemplate';
import { CRON_REMINDER_DAYS, OFFLINE_ALERT_HOURS } from '../../../../core/constants';
import React from 'react';

function formatTimeDifference(lastMeasuredAt: Date): string {
  const diffHours = Math.floor((new Date().getTime() - lastMeasuredAt.getTime()) / (1000 * 60 * 60));
  if (diffHours < OFFLINE_ALERT_HOURS * 2) return `${diffHours} horas`;
  return `${Math.floor(diffHours / 24)} días`;
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - OFFLINE_ALERT_HOURS);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - CRON_REMINDER_DAYS);

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

    const now = new Date();

    const emailPromises = offlineDevices.map(device => {
      if (!device.lastMeasuredAt) return Promise.resolve();
      return sendEmail({
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
    });

    await Promise.allSettled(emailPromises);

    await db.update(devices)
      .set({ lastOfflineAlertSentAt: now })
      .where(
        inArray(devices.devEui, offlineDevices.map(d => d.devEui))
      );

    return NextResponse.json({ success: true, emailsSent: offlineDevices.length, devices: offlineDevices.map(d => d.devEui) });
  } catch (error) {
    console.error('Error in offline-alerts cron:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
