import { SystemRepository } from '../../../core/repositories/SystemRepository';
import { sql } from '../db';

export class PgSystemRepository implements SystemRepository {
  async getSystemSettings(): Promise<Record<string, string>> {
    const { rows } = await sql<{ key: string, value: string }>`SELECT key, value FROM system_settings`.catch(() => ({ rows: [] }));
    return rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, string>);
  }

  async updateProjectName(newName: string): Promise<void> {
    await sql`
      INSERT INTO system_settings (key, value) 
      VALUES ('project_name', ${newName})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
  }
}
