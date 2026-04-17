import { NextResponse } from 'next/server';
import { sql } from '@/infrastructure/database/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check DB connection
    const start = Date.now();
    await sql`SELECT 1`;
    const latency = Date.now() - start;

    return NextResponse.json({
      status: 'healthy',
      version: '2.0.0',
      database: 'connected',
      latency: `${latency}ms`,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    console.error('Health Check Failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
