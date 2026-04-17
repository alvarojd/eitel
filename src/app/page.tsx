import { getSensors } from '@/infrastructure/actions/sensorActions';
import { DashboardShell } from '@/presentation/components/layout/DashboardShell';
import { DashboardContent } from '@/presentation/components/dashboard/DashboardContent';
import { SensorDrawer } from '@/presentation/components/dashboard/SensorDrawer';
import { SensorProvider } from '@/presentation/context/SensorContext';
import { DashboardStats } from '@/presentation/components/common/DashboardStats';
import { StatusFilterBar } from '@/presentation/components/common/StatusFilterBar';
import { PageHeader } from '@/presentation/components/layout/PageHeader';

import { getProjectName } from '@/infrastructure/actions/systemActions';

export const revalidate = 60;

export default async function DashboardPage() {
  const [sensors, projectName] = await Promise.all([
    getSensors(),
    getProjectName()
  ]);

  return (
    <SensorProvider initialSensors={sensors}>
      <DashboardShell projectName={projectName}>
        <div className="flex flex-col h-full gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          
          <PageHeader projectName={projectName} />

          {/* Global Filter Bar */}
          <div className="bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800">
             <StatusFilterBar />
          </div>

          {/* Stats Glance */}
          <DashboardStats sensors={sensors} />

          {/* Main Visual/Technical Content Switcher */}
          <DashboardContent />
        </div>
      </DashboardShell>
    </SensorProvider>
  );
}
