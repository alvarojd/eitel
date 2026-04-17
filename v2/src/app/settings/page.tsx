import { DashboardShell } from "@/presentation/components/layout/DashboardShell";
import { SettingsContainer } from "@/presentation/components/settings/SettingsContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Centro de Control | Hexasense',
  description: 'Gestión administrativa y ajustes del sistema',
};

import { getProjectName } from "@/infrastructure/actions/systemActions";

export default async function SettingsPage() {
  const projectName = await getProjectName();

  return (
    <DashboardShell projectName={projectName}>
      <SettingsContainer />
    </DashboardShell>
  );
}
