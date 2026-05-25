import { NextResponse } from 'next/server';
import { db } from '../../../../infrastructure/database/db';
import { devices } from '../../../../infrastructure/database/schema';
import { lt, and, or, isNull, lte, inArray } from 'drizzle-orm';
import { getAlertRecipients, sendEmail } from '../../../../lib/email/mailer';
import { AlertEmailTemplate } from '../../../../emails/AlertEmailTemplate';
import { BATTERY_LOW_PERCENT, CRON_REMINDER_DAYS } from '../../../../core/constants';
import React from 'react';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reminderThreshold = new Date();
    reminderThreshold.setDate(reminderThreshold.getDate() - CRON_REMINDER_DAYS);

    const lowBatteryDevices = await db.select().from(devices)
      .where(
        and(
          lt(devices.battery, BATTERY_LOW_PERCENT),
          or(
            isNull(devices.lastBatteryAlertSentAt),
            lte(devices.lastBatteryAlertSentAt, reminderThreshold)
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

    const now = new Date();

    const emailPromises = lowBatteryDevices.map(device =>
      sendEmail({
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
      })
    );

    await Promise.allSettled(emailPromises);

    await db.update(devices)
      .set({ lastBatteryAlertSentAt: now })
      .where(
        inArray(devices.devEui, lowBatteryDevices.map(d => d.devEui))
      );

    return NextResponse.json({ success: true, emailsSent: lowBatteryDevices.length, devices: lowBatteryDevices.map(d => d.devEui) });
  } catch (error) {
    console.error('Error in battery-reminders cron:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
