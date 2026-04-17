import pg, { QueryResult, QueryResultRow } from 'pg';

const { Pool } = pg;

// Omitimos rechazo de certificados TLS para permitir uso desde Vercel con supabase/neon
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // ELIMINADO POR SEGURIDAD

const connectionString = 
  process.env.POSTGRES_URL || 
  process.env.DATABASE_URL || 
  process.env.SUPABASE_POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

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

export { QueryResult };
