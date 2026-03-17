
import pg from 'pg';
const { Pool } = pg;

// Use POSTGRES_URL for Supabase connection (it's the same environmental variable name we will use in Vercel)
const connectionString = process.env.POSTGRES_URL;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

/**
 * Compatibility layer for @vercel/postgres
 * This allows us to keep using the `sql` tagged template literal syntax
 */
export const sql = {
  query: (text: string, values?: any[]) => pool.query(text, values),
  async connect() {
    return pool.connect();
  }
};

// Internal function to handle the tagged template literal
async function sqlTag(strings: TemplateStringsArray, ...values: any[]) {
  // Convert template literal to standard postgres query
  let text = strings[0];
  for (let i = 1; i < strings.length; i++) {
    text += `$${i}${strings[i]}`;
  }
  return pool.query(text, values);
}

// Attach the tag function to the sql object
Object.assign(sql, sqlTag);

// Re-export type for consistency
export type { QueryResult } from 'pg';
