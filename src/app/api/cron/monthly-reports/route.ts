import { NextResponse } from 'next/server';
import { db } from '../../../../infrastructure/database/db';
import { devices } from '../../../../infrastructure/database/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import { sendEmail } from '../../../../lib/email/mailer';
import { MonthlyReportEmailTemplate } from '../../../../emails/MonthlyReportEmailTemplate';
import React from 'react';
import { getReports } from '../../../../infrastructure/actions/historyActions';
import { calculateReportMetrics, HistoryDataPoint } from '../../../../core/use-cases/reportsEngine';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const manualDevEui = searchParams.get('devEui');

    let eligibleDevices = [];

    if (manualDevEui) {
      eligibleDevices = await db.select().from(devices).where(eq(devices.devEui, manualDevEui));
      if (eligibleDevices.length === 0 || !eligibleDevices[0].notificationEmail) {
        return NextResponse.json({ error: 'Sensor no encontrado o sin email configurado' }, { status: 400 });
      }
    } else {
      const allEnabledDevices = await db.select().from(devices)
        .where(
          and(
            eq(devices.notificationsEnabled, true),
            isNotNull(devices.notificationEmail)
          )
        );

      const now = new Date();
      eligibleDevices = allEnabledDevices.filter(device => {
        if (!device.monthlyReportConfiguredAt) return false;
        
        const configuredAt = new Date(device.monthlyReportConfiguredAt);
        const nextEligibleFromConfig = new Date(configuredAt);
        nextEligibleFromConfig.setMonth(nextEligibleFromConfig.getMonth() + 1);

        if (now < nextEligibleFromConfig) return false;

        if (device.lastMonthlyReportSentAt) {
          const lastSentAt = new Date(device.lastMonthlyReportSentAt);
          const nextEligibleFromLastSent = new Date(lastSentAt);
          nextEligibleFromLastSent.setMonth(nextEligibleFromLastSent.getMonth() + 1);
          
          if (now < nextEligibleFromLastSent) return false;
        }

        return true;
      });
    }

    if (eligibleDevices.length === 0) {
      return NextResponse.json({ message: 'No devices require monthly reports at this time.' });
    }

    const successfulDevices: string[] = [];

    // Process sequentially to avoid collapsing nodemailer or SMTP provider
    for (const device of eligibleDevices) {
      try {
        const reportsRaw = await getReports(30, device.devEui);
        
        const historyData: HistoryDataPoint[] = reportsRaw.map(r => ({
          timestamp: new Date(r.timestamp),
          temperature: r.temperature,
          humidity: r.humidity,
          co2: r.co2,
          presence: r.presence,
          deviceId: r.deviceId
        }));

        const { percentages, totalHours, metrics } = calculateReportMetrics(historyData, 'all');

        if (totalHours > 0 && device.notificationEmail) {
          const red = percentages[2] + percentages[3] + percentages[4];
          const orange = percentages[5] + percentages[6] + percentages[7] + percentages[8];
          const green = percentages[9];
          const gray = percentages[1] + percentages[0];

          const chartConfig = {
            type: 'doughnut',
            data: {
              labels: ['Crítico', 'Riesgo / Aviso', 'Ideal', 'Desconectado'],
              datasets: [{
                data: [red.toFixed(1), orange.toFixed(1), green.toFixed(1), gray.toFixed(1)],
                backgroundColor: ['#ef4444', '#f97316', '#10b981', '#64748b']
              }]
            },
            options: {
              plugins: {
                datalabels: { display: false }
              }
            }
          };

          const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;

          const result = await sendEmail({
            to: [device.notificationEmail],
            subject: `📊 Informe Mensual: ${device.name || device.devEui}`,
            react: React.createElement(MonthlyReportEmailTemplate, {
              sensorName: device.name || device.devEui,
              devEui: device.devEui,
              totalHours,
              metrics,
              percentages: {
                ideal: green,
                warning: orange,
                critical: red,
                offline: gray
              },
              chartUrl,
            }),
          });

          if (result.success) {
            successfulDevices.push(device.devEui);
          }
        }
        
        // Small delay to prevent rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (err) {
        console.error(`Failed to send report for ${device.devEui}:`, err);
      }
    }

    if (successfulDevices.length > 0 && !manualDevEui) {
      const now = new Date();
      // Update one by one or using an inArray. I'll just iterate since it's cleaner to handle array max length issues.
      for(const devEui of successfulDevices) {
         await db.update(devices).set({ lastMonthlyReportSentAt: now }).where(eq(devices.devEui, devEui));
      }
    }

    return NextResponse.json({ 
      success: true, 
      emailsSent: successfulDevices.length, 
      devices: successfulDevices 
    });
  } catch (error) {
    console.error('Error in monthly-reports cron:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
