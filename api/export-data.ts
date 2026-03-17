
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    const tables = ['users', 'devices', 'measurements', 'audit_logs'];
    let fullDump = `-- Data Export from Neon to Supabase\n\n`;

    for (const table of tables) {
      const { rows } = await sql.query(`SELECT * FROM ${table}`);
      if (rows.length === 0) continue;

      fullDump += `-- Table: ${table}\n`;
      const columns = Object.keys(rows[0]).join(', ');
      
      rows.forEach(row => {
        const values = Object.values(row).map(val => {
          if (val === null) return 'NULL';
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
          if (val instanceof Date) return `'${val.toISOString()}'`;
          if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
          return val;
        }).join(', ');
        fullDump += `INSERT INTO ${table} (${columns}) VALUES (${values});\n`;
      });
      fullDump += `\n`;
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=neon_backup.sql');
    return res.status(200).send(fullDump);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
