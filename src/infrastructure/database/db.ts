import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import * as relations from './relations';

const { Pool } = pg;

let connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.SUPABASE_POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

// Suppress pg-connection-string SSL mode deprecation warning
if (connectionString && !connectionString.includes('uselibpqcompat')) {
  const sslModeMatch = connectionString.match(/sslmode=(prefer|require|verify-ca)/);
  if (sslModeMatch) {
    connectionString = connectionString.replace(
      sslModeMatch[0],
      `${sslModeMatch[0]}&uselibpqcompat=true`
    );
  }
}

let sslConfig: any = { rejectUnauthorized: process.env.NODE_ENV === 'production' };
if (connectionString?.includes('localhost') || connectionString?.includes('127.0.0.1')) {
  sslConfig = false;
}
if (process.env.DB_CA_CERT) {
  sslConfig = { ...sslConfig, ca: process.env.DB_CA_CERT };
}

const pool = new Pool({
  connectionString,
  ssl: sslConfig,
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const db = drizzle(pool, { schema: { ...schema, ...relations } });

