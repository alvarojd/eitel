import { Pool } from 'pg';

async function migrateAndBackfill(connectionString: string) {
  let safeConnectionString = connectionString;
  if (safeConnectionString.includes('sslmode=require') && !safeConnectionString.includes('uselibpqcompat')) {
    safeConnectionString = safeConnectionString.replace('sslmode=require', 'sslmode=require&uselibpqcompat=true');
  }

  const pool = new Pool({
    connectionString: safeConnectionString,
    ssl: safeConnectionString.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  try {
    console.log('⏳ Conectando a la base de datos...');
    
    // 1. Añadir columnas
    console.log('🛠️ Añadiendo nuevas columnas a la tabla devices (si no existen)...');
    await pool.query(`
      ALTER TABLE devices 
      ADD COLUMN IF NOT EXISTS temperature NUMERIC,
      ADD COLUMN IF NOT EXISTS humidity NUMERIC,
      ADD COLUMN IF NOT EXISTS co2 NUMERIC,
      ADD COLUMN IF NOT EXISTS estado_id INTEGER,
      ADD COLUMN IF NOT EXISTS presence BOOLEAN,
      ADD COLUMN IF NOT EXISTS last_measured_at TIMESTAMPTZ;
    `);
    console.log('✅ Columnas añadidas.');

    // 2. Hacer backfill de los datos históricos
    console.log('🔄 Sincronizando último estado conocido desde la tabla measurements...');
    const result = await pool.query(`
      UPDATE devices d
      SET 
        temperature = m.temperature,
        humidity = m.humidity,
        co2 = m.co2,
        estado_id = m.estado_id,
        presence = m.presence,
        last_measured_at = m.created_at
      FROM (
        SELECT DISTINCT ON (dev_eui) 
          dev_eui, temperature, humidity, co2, estado_id, presence, created_at
        FROM measurements
        ORDER BY dev_eui, created_at DESC
      ) m
      WHERE d.dev_eui = m.dev_eui;
    `);
    console.log(`✅ Sincronización completada. Sensores actualizados: ${result.rowCount}`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await pool.end();
  }
}

const url = process.argv[2] || process.env.POSTGRES_URL;
if (!url) {
  console.error('❌ Debes proveer una URL de base de datos como argumento o establecer POSTGRES_URL.');
  process.exit(1);
}

migrateAndBackfill(url);
