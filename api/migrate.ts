import { sql } from '@vercel/postgres';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use POST to execute.' });
    }

    // Simple security phrase to prevent accidental execution if found by web crawlers
    if (req.headers.authorization !== 'Bearer perform-hexasense-migration') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        console.log("Starting DB Migration via API Route...");

        console.log("Dropping existing measurements table...");
        await sql`DROP TABLE IF EXISTS measurements CASCADE;`;

        console.log("Creating devices table...");
        await sql`
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
        `;

        console.log("Creating new measurements table...");
        await sql`
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
        `;

        console.log("Migration successfully complete.");
        return res.status(200).json({ success: true, message: 'Schema migration complete: 2 tables created.' });
    } catch (error: any) {
        console.error("Migration failed:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
