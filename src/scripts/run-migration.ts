import { sql } from '../infrastructure/database/db';

async function main() {
  console.log('Iniciando migración de la tabla devices...');
  try {
    await sql`
      ALTER TABLE devices 
      ADD COLUMN IF NOT EXISTS temperature NUMERIC,
      ADD COLUMN IF NOT EXISTS humidity NUMERIC,
      ADD COLUMN IF NOT EXISTS co2 NUMERIC,
      ADD COLUMN IF NOT EXISTS estado_id INTEGER,
      ADD COLUMN IF NOT EXISTS presence BOOLEAN,
      ADD COLUMN IF NOT EXISTS last_measured_at TIMESTAMPTZ;
    `;
    console.log('Migración completada exitosamente.');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    process.exit(0);
  }
}

main();
