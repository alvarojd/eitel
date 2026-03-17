
import pg from 'pg';
const { Pool } = pg;

// CRITICAL: Bypass for self-signed certificates in serverless environments
// This is necessary for some Supabase connections on Vercel
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = 
  process.env.POSTGRES_URL || 
  process.env.DATABASE_URL || 
  process.env.SUPABASE_POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 1 // Optimal for serverless functions
});

// Internal function to handle the tagged template literal
async function sqlTag(strings: TemplateStringsArray, ...values: any[]) {
  // Convert template literal to standard postgres query ($1, $2, etc.)
  const text = strings.reduce((acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ""), "");
  return pool.query(text, values);
}

/**
 * Compatibility layer for @vercel/postgres
 */
export const sql: any = sqlTag;

// Attach helper methods to the sql function
sql.query = (text: string, values?: any[]) => pool.query(text, values);
sql.connect = async () => pool.connect();

// Re-export type for consistency
export type { QueryResult } from 'pg';
