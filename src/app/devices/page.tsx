import { getSensors } from '@/infrastructure/actions/sensorActions';
import { DashboardShell } from '@/presentation/components/layout/DashboardShell';
import { SensorProvider } from '@/presentation/context/SensorContext';
import { SensorDrawer } from '@/presentation/components/dashboard/SensorDrawer';
import { StatusFilterBar } from '@/presentation/components/common/StatusFilterBar';
import { DashboardStats } from '@/presentation/components/common/DashboardStats';
import { DeviceList } from '@/presentation/components/dashboard/DeviceList';

import { PageHeader } from '@/presentation/components/layout/PageHeader';


import { getProjectName } from '@/infrastructure/actions/systemActions';

export const revalidate = 60;

export default async function DevicesPage() {
  const [sensors, projectName] = await Promise.all([
    getSensors(),
    getProjectName()
  ]);

  return (
    <SensorProvider initialSensors={sensors}>
      <DashboardShell projectName={projectName}>
        <div className="flex flex-col h-full gap-5 animate-in fade-in duration-1000">
          <PageHeader projectName={projectName} />
          
          <div className="bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <StatusFilterBar />
          </div>

          <DashboardStats sensors={sensors} />

          <div className="flex-1 min-h-0 bg-slate-900/20 rounded-3xl p-1 border border-slate-800/50 overflow-hidden relative">
             <DeviceList />
          </div>
        </div>
      </DashboardShell>
    </SensorProvider>
  );
}
