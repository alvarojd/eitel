import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../infrastructure/database/db';
import { devices, measurements } from '../../../infrastructure/database/schema';
import { sql } from 'drizzle-orm';
import { determineStatus } from '../../../core/use-cases/statusEngine';

import { z } from 'zod';

const TTNPayloadSchema = z.object({
  end_device_ids: z.object({
    dev_eui: z.string().optional(),
    device_id: z.string().optional(),
  }),
  uplink_message: z.object({
    received_at: z.string().optional(),
    decoded_payload: z.object({
      temperature: z.number().optional(),
      humidity: z.number().optional(),
      CO2: z.number().optional(),
      presence: z.boolean().optional(),
      battery_voltage: z.number().optional(),
      battery: z.number().optional(),
      dev_eui: z.string().optional(),
      device_id: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }),
    rx_metadata: z.array(z.object({
      gateway_ids: z.object({
        gateway_id: z.string().optional(),
      }).optional(),
      packet_id: z.string().optional(),
      rssi: z.number().optional(),
      snr: z.number().optional(),
      location: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }).optional(),
    })).optional(),
  }),
});

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

    // 2. Parse & Validate TTN Payload
    const bodyText = await req.text();
    let rawData: any;
    try {
      rawData = JSON.parse(bodyText);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const validation = TTNPayloadSchema.safeParse(rawData);
    if (!validation.success) {
      console.warn('Webhook received invalid payload structure:', validation.error.format());
      return NextResponse.json({ error: 'Invalid payload structure', details: validation.error.format() }, { status: 400 });
    }

    const { end_device_ids, uplink_message } = validation.data;
    const payload = uplink_message.decoded_payload;
    const rx_metadata = uplink_message.rx_metadata;
    const received_at = uplink_message.received_at || new Date().toISOString();

    const dev_eui = (end_device_ids?.dev_eui || payload?.dev_eui || '').toUpperCase();
    const device_id = (end_device_ids?.device_id || payload?.device_id || dev_eui).toLowerCase();
    const name = end_device_ids?.device_id || device_id;

    if (!dev_eui || dev_eui === 'UNDEFINED') {
      return NextResponse.json({ error: 'Invalid payload: missing dev_eui' }, { status: 400 });
    }

    // Extracted and Clamped variables
    const temperature = Math.max(-40, Math.min(80, payload.temperature ?? 0));
    const humidity    = Math.max(0, Math.min(100, payload.humidity ?? 0));
    const co2         = Math.max(0, Math.min(10000, Math.round(payload.CO2 ?? 0)));
    const presence    = payload.presence === true;

    // Handle Coordinates
    let latitude = payload.latitude;
    let longitude = payload.longitude;

    // Gateway and Quality
    let gateway_id = null;
    let rssi = -100;
    let snr = 0;
    if (rx_metadata && rx_metadata.length > 0) {
      const bestGw = rx_metadata.reduce((prev: any, curr: any) =>
        ((prev.rssi || -200) > (curr.rssi || -200)) ? prev : curr
      );
      gateway_id = bestGw.gateway_ids?.gateway_id || bestGw.packet_id || null;
      rssi = bestGw.rssi ?? -100;
      snr = bestGw.snr ?? 0;

      if (!latitude && bestGw.location) {
        latitude = bestGw.location.latitude;
        longitude = bestGw.location.longitude;
      }
    }

    // Battery calculation
    let battery = 100;
    if (typeof payload.battery_voltage === 'number') {
      const minV = 3.0, maxV = 3.6;
      const pct = ((payload.battery_voltage - minV) / (maxV - minV)) * 100;
      battery = Math.min(100, Math.max(0, Math.round(pct)));
    } else if (typeof payload.battery === 'number') {
      battery = Math.min(100, Math.max(0, Math.round(payload.battery)));
    }

    // Determine status (Domain Logic)
    const estado_id = determineStatus({ temperature, humidity, co2 });

    // Database Updates using Drizzle ORM
    await db.insert(devices)
      .values({
        devEui: dev_eui,
        deviceId: device_id,
        name: name,
        battery,
        rssi,
        snr: snr.toString(),
        latitude: latitude ? latitude.toString() : null,
        longitude: longitude ? longitude.toString() : null,
        gatewayId: gateway_id,
        createdAt: new Date(received_at),
        temperature: temperature.toString(),
        humidity: humidity.toString(),
        co2: co2.toString(),
        estadoId: estado_id,
        presence,
        lastMeasuredAt: new Date(received_at)
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
          lastMeasuredAt: sql`EXCLUDED.last_measured_at`
        }
      });

    await db.insert(measurements)
      .values({
        devEui: dev_eui,
        temperature: temperature.toString(),
        humidity: humidity.toString(),
        co2: co2,
        presence,
        estadoId: estado_id,
        createdAt: new Date(received_at)
      });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
