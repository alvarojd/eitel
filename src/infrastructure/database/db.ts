import pg, { QueryResult, QueryResultRow } from 'pg';

const { Pool } = pg;

// La conexión a la base de datos maneja certificados autofirmados a nivel de Pool en su lugar.

let connectionString = 
  process.env.POSTGRES_URL || 
  process.env.DATABASE_URL || 
  process.env.SUPABASE_POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

// Evitar el warning "SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'."
if (connectionString && connectionString.includes('sslmode=require') && !connectionString.includes('uselibpqcompat')) {
  connectionString = connectionString.replace('sslmode=require', 'sslmode=require&uselibpqcompat=true');
}

const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes('localhost') || connectionString?.includes('127.0.0.1') 
    ? false 
    : { rejectUnauthorized: false },
  max: 20
});

// Helper para emular la sintaxis sql`SELECT * ...` limpia y prevenida contra inyecciones SQL
async function sqlTag<T extends QueryResultRow = any>(strings: TemplateStringsArray, ...values: any[]): Promise<QueryResult<T>> {
  const text = strings.reduce((acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ""), "");
  return pool.query(text, values);
}

// Exportamos interfaz tipada pero compatible
export const sql = sqlTag as {
  <T extends QueryResultRow = any>(strings: TemplateStringsArray, ...values: any[]): Promise<QueryResult<T>>;
  query: <T extends QueryResultRow = any>(text: string, values?: any[]) => Promise<QueryResult<T>>;
};

sql.query = (text: string, values?: any[]) => pool.query(text, values);

export type { QueryResult };

import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import * as relations from './relations';

export const db = drizzle(pool, { schema: { ...schema, ...relations } });

