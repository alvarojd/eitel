
import pg from 'pg';
const { Pool } = pg;

// Use POSTGRES_URL for Supabase connection
const connectionString = process.env.POSTGRES_URL;

// Bypass for "self-signed certificate" in serverless environments
if (connectionString) {
  process.env.PGSSLMODE = 'no-verify';
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Internal function to handle the tagged template literal
async function sqlTag(strings: TemplateStringsArray, ...values: any[]) {
  // Convert template literal to standard postgres query
  let text = strings[0];
  for (let i = 1; i < strings.length; i++) {
    text += `$${i}${strings[i]}`;
  }
  return pool.query(text, values);
}

/**
 * Compatibility layer for @vercel/postgres
 * This allows us to keep using the `sql` tagged template literal syntax
 */
export const sql: any = sqlTag;

// Attach helper methods to the sql function
sql.query = (text: string, values?: any[]) => pool.query(text, values);
sql.connect = async () => pool.connect();

// Re-export type for consistency
export type { QueryResult } from 'pg';
