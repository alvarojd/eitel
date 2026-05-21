import { DashboardShell } from "@/presentation/components/layout/DashboardShell";
import { SettingsContainer } from "@/presentation/components/settings/SettingsContainer";
import { Metadata } from "next";
import { getProjectName } from "@/infrastructure/actions/systemActions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";

export const metadata: Metadata = {
  title: 'Centro de Control | Hexasense',
  description: 'Gestión administrativa y ajustes del sistema',
};

export const revalidate = 0; // Force request-time validation

export default async function SettingsPage() {
  // Server-side session verification before rendering
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const session = token ? verifyToken(token) : null;

  if (!session) {
    redirect('/login');
  }

  const projectName = await getProjectName();

  return (
    <DashboardShell projectName={projectName}>
      <SettingsContainer />
    </DashboardShell>
  );
}
