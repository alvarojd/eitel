export interface SystemRepository {
  getSystemSettings(): Promise<Record<string, string>>;
  updateProjectName(newName: string): Promise<void>;
  updateSystemSettings(settings: Record<string, string>): Promise<void>;
}
