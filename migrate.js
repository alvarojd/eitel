import fs from 'fs';

// Manually parse .env.local BEFORE importing the DB client
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    process.env[key] = val;
  }
});

async function migrate() {
  const { db } = await import('@vercel/postgres');
  const client = await db.connect();

  try {
    console.log("Dropping existing measurements table...");
    await client.query(`DROP TABLE IF EXISTS measurements CASCADE;`);

    console.log("Creating devices table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS devices (
        dev_eui VARCHAR(255) PRIMARY KEY,
        device_id VARCHAR(255),
        name VARCHAR(255),
        battery INTEGER,
        rssi INTEGER,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        gateway_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Creating new measurements table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS measurements (
        id SERIAL PRIMARY KEY,
        dev_eui VARCHAR(255) REFERENCES devices(dev_eui),
        temperature DECIMAL(5,2),
        humidity DECIMAL(5,2),
        co2 INTEGER,
        presence BOOLEAN,
        estado_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Migration successfully complete.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    client.release();
  }
}

migrate();
