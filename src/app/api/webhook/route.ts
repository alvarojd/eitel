import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../infrastructure/database/db';
import { devices, measurements } from '../../../infrastructure/database/schema';
import { sql, eq } from 'drizzle-orm';
import { determineStatus } from '../../../core/use-cases/statusEngine';
import { getAlertRecipients, sendEmail } from '../../../lib/email/mailer';
import { AlertEmailTemplate } from '../../../emails/AlertEmailTemplate';
import { checkRateLimit } from '../../../lib/rate-limit';
import {
  BATTERY_FULL_VOLTAGE,
  BATTERY_PLATEAU_END,
  BATTERY_DROP_START,
  BATTERY_EMPTY_VOLTAGE,
  BATTERY_LOW_PERCENT,
} from '../../../core/constants';
import { systemSettings } from '../../../infrastructure/database/schema';
import { ThresholdSettings } from '../../../core/use-cases/statusEngine';
import React from 'react';

// --- Sanitization Helpers ---
function parseNumeric(value: unknown, fallback: number): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function sanitizeString(value: unknown, maxLength: number = 255): string {
  return String(value ?? '').slice(0, maxLength);
}

/**
 * Calcula el porcentaje de batería mediante interpolación lineal entre umbrales críticos.
 * Calibrado para picos de transmisión LoRaWAN en interiores (Saft LS14500).
 * 
 * @param voltaje Voltaje medido en el instante de la transmisión.
 * @returns Porcentaje de carga estimado entre 0 y 100.
 */
function calcularPorcentajeLineal(voltaje: number): number {
  if (voltaje >= BATTERY_FULL_VOLTAGE) return 100;
  if (voltaje <= BATTERY_EMPTY_VOLTAGE) return 0;

  let porcentaje = 0;

  if (voltaje > BATTERY_PLATEAU_END) {
    porcentaje = 15 + ((voltaje - BATTERY_PLATEAU_END) * 85) / (BATTERY_FULL_VOLTAGE - BATTERY_PLATEAU_END);
  } else if (voltaje > BATTERY_DROP_START) {
    porcentaje = 5 + ((voltaje - BATTERY_DROP_START) * 10) / (BATTERY_PLATEAU_END - BATTERY_DROP_START);
  } else {
    porcentaje = ((voltaje - BATTERY_EMPTY_VOLTAGE) * 5) / (BATTERY_DROP_START - BATTERY_EMPTY_VOLTAGE);
  }

  return Math.max(0, Math.min(100, Math.round(porcentaje)));
}

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.TTN_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error('FATAL: TTN_WEBHOOK_SECRET environment variable is required for webhook security');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

  try {
    // 1. Authentication
    const authHeader = req.headers.get('x-downlink-apikey') || req.headers.get('authorization');
    if (authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      console.warn(`Unauthorized webhook attempt from IP: ${ip}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (ip) {
      const allowed = await checkRateLimit(ip, 60, 60_000);
      if (!allowed) {
        return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
      }
    }

    // 2. Parse TTN Payload
    const bodyText = await req.text();
    let bodyData: any = {};
    try {
      bodyData = JSON.parse(bodyText);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { end_device_ids, uplink_message } = bodyData;
    const payload = uplink_message?.decoded_payload;
    const rx_metadata = uplink_message?.rx_metadata;
    const received_at = uplink_message?.received_at || new Date().toISOString();

    if (!payload) {
      console.warn('Webhook received without decoded_payload. Check TTN Formatter.');
      return NextResponse.json({ error: 'Invalid payload: missing decoded_payload' }, { status: 400 });
    }

    const dev_eui = sanitizeString(end_device_ids?.dev_eui || payload?.dev_eui).toUpperCase();
    const device_id = sanitizeString(end_device_ids?.device_id || payload?.device_id || dev_eui).toLowerCase();
    const name = sanitizeString(end_device_ids?.device_id || device_id);

    if (!dev_eui || dev_eui === 'UNDEFINED') {
      return NextResponse.json({ error: 'Invalid payload: missing dev_eui' }, { status: 400 });
    }

    // Sanitized variables - FIXED: Proper commas
    const temperature = clamp(parseNumeric(payload.temperature, 0), -40, 80);
    const humidity    = clamp(parseNumeric(payload.humidity, 0), 0, 100);
    const co2         = clamp(Math.round(parseNumeric(payload.CO2, 0)), 0, 10000);
    const presence    = payload.presence === true;

    // Handle Coordinates safely across all fallback options for both organizations
    let latitude = payload.latitude || payload.lat || payload.gps_lat;
    let longitude = payload.longitude || payload.lon || payload.lng || payload.gps_lng;

    const locations = uplink_message?.locations;
    if (!latitude && locations) {
      const locSource = locations.user || locations['frm-payload'] || Object.values(locations)[0];
      if (locSource) {
        latitude = (locSource as any).latitude;
        longitude = (locSource as any).longitude;
      }
    }

    // Gateway and Quality
    let gateway_id = null;
    let rssi = -100;
    let snr = 0;
    if (rx_metadata && rx_metadata.length > 0) {
      const bestGw = rx_metadata.reduce((prev: any, curr: any) =>
        ((prev.rssi || -200) > (curr.rssi || -200)) ? prev : curr
      );
      gateway_id = bestGw.gateway_ids?.gateway_id || bestGw.packet_id;
      rssi = bestGw.rssi || -100;
      snr = bestGw.snr || 0;

      if (!latitude && bestGw.location) {
        latitude = bestGw.location.latitude;
        longitude = bestGw.location.longitude;
      }
    }

    const parsedLat = (latitude !== undefined && latitude !== null) ? clamp(parseNumeric(latitude, 0), -90, 90) : null;
    const parsedLng = (longitude !== undefined && longitude !== null) ? clamp(parseNumeric(longitude, 0), -180, 180) : null;

    const [existingDevice] = await db.select().from(devices).where(eq(devices.devEui, dev_eui));
    
    // Battery calculation - FIXED: Proper commas
    let battery = existingDevice?.battery ?? 100;
    if (typeof payload.battery_voltage === 'number') {
      battery = calcularPorcentajeLineal(payload.battery_voltage);
    } else if (typeof payload.battery === 'number') {
      battery = Math.min(100, Math.max(0, Math.round(payload.battery)));
    }

    // Fetch dynamic thresholds directly from DB (avoid 'use server' module import)
    let thresholds: ThresholdSettings | undefined;
    try {
      const rows = await db.select({ key: systemSettings.key, value: systemSettings.value }).from(systemSettings);
      const settingsMap: Record<string, string> = {};
      for (const row of rows) {
        if (row.key && row.value) settingsMap[row.key] = row.value;
      }
      const parse = (k: string) => { const v = settingsMap[k]; return v ? parseFloat(v) : undefined; };
      thresholds = {
        TEMP_CRITICAL_LOW: parse('threshold_temp_critical_low'),
        TEMP_CRITICAL_HIGH: parse('threshold_temp_critical_high'),
        TEMP_WARNING_LOW: parse('threshold_temp_warning_low'),
        CO2_CRITICAL: parse('threshold_co2_critical'),
        CO2_WARNING: parse('threshold_co2_warning'),
        HUM_WARNING_HIGH: parse('threshold_hum_warning_high'),
        HUM_WARNING_LOW: parse('threshold_hum_warning_low'),
      };
    } catch (e) {
      console.warn('Could not load custom thresholds, using defaults:', e);
      thresholds = undefined; // determineStatus will use hardcoded defaults
    }

    // Determine status (Domain Logic)
    const estado_id = determineStatus({ temperature, humidity, co2 }, thresholds);

    // --- Alerta Inmediata en Segundo Plano (Fire-and-Forget) ---
    let alertSentAt: Date | null = existingDevice?.lastBatteryAlertSentAt || null;

    // Si la batería se recupera por encima del 50%, reseteamos la fecha de la alerta
    // para que si en un futuro vuelve a bajar, se envíe de nuevo la alerta inicial.
    if (battery >= 50) {
      alertSentAt = null;
    }

    // Solo enviar si nunca se ha enviado una alerta de batería (o si se reseteó tras recuperación)
    const isFirstTimeLow = alertSentAt === null;

    if (battery < BATTERY_LOW_PERCENT && isFirstTimeLow) {
      alertSentAt = new Date();
      
      // Lanzamos la promesa sin await para liberar la petición HTTP del webhook inmediatamente
      getAlertRecipients()
        .then((recipients) => {
          if (recipients.length > 0) {
            return sendEmail({
              to: recipients,
              subject: `⚠️ Alerta Crítica: Batería baja en ${existingDevice?.name || name || dev_eui}`,
              react: React.createElement(AlertEmailTemplate, {
                type: 'battery',
                devEui: dev_eui,
                name: existingDevice?.name || name,
                battery: battery,
                latitude: parsedLat ? parsedLat.toString() : null,
                longitude: parsedLng ? parsedLng.toString() : null,
              }),
            });
          }
        })
        .catch((emailErr) => {
          // Logueamos pero no tumbamos la ingesta del sensor
          console.error('Error enviando alerta de batería baja en background:', emailErr);
        });
    }

    // Database Updates using Drizzle ORM wrapped in a safe Transaction
    await db.transaction(async (tx) => {
      await tx.insert(devices)
        .values({
          devEui: dev_eui,
          deviceId: device_id,
          name: name,
          battery,
          rssi,
          snr: snr,
          latitude: parsedLat,
          longitude: parsedLng,
          gatewayId: gateway_id,
          createdAt: new Date(received_at),
          temperature: temperature,
          humidity: humidity,
          co2: co2,
          estadoId: estado_id,
          presence,
          lastMeasuredAt: new Date(received_at),
          lastBatteryAlertSentAt: alertSentAt,
        })
        .onConflictDoUpdate({
          target: devices.devEui,
          set: {
            name: sql`COALESCE(devices.name, EXCLUDED.name)`,
            battery: sql`EXCLUDED.battery`,
            rssi: sql`EXCLUDED.rssi`,
            snr: sql`EXCLUDED.snr`,
            latitude: sql`COALESCE(devices.latitude, EXCLUDED.latitude)`,
            longitude: sql`COALESCE(devices.longitude, EXCLUDED.longitude)`,
            gatewayId: sql`EXCLUDED.gateway_id`,
            temperature: sql`EXCLUDED.temperature`,
            humidity: sql`EXCLUDED.humidity`,
            co2: sql`EXCLUDED.co2`,
            estadoId: sql`EXCLUDED.estado_id`,
            presence: sql`EXCLUDED.presence`,
            lastMeasuredAt: sql`EXCLUDED.last_measured_at`,
            lastBatteryAlertSentAt: alertSentAt
          }
        });

      await tx.insert(measurements)
        .values({
          devEui: dev_eui,
          temperature: temperature,
          humidity: humidity,
          co2: co2,
          presence,
          estadoId: estado_id,
          createdAt: new Date(received_at)
        });
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
