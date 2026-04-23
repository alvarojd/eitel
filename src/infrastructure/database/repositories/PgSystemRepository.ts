import { SystemRepository } from '../../../core/repositories/SystemRepository';
import { db } from '../db';
import { systemSettings } from '../schema';

export class PgSystemRepository implements SystemRepository {
  async getSystemSettings(): Promise<Record<string, string>> {
    try {
      const rows = await db.select({ key: systemSettings.key, value: systemSettings.value }).from(systemSettings);
      return rows.reduce((acc, row) => {
        acc[row.key] = row.value || '';
        return acc;
      }, {} as Record<string, string>);
    } catch {
      return {};
    }
  }

  async updateProjectName(newName: string): Promise<void> {
    await db.insert(systemSettings)
      .values({ key: 'project_name', value: newName })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: { value: newName },
      });
  }
}
