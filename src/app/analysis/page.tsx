import { getSensors } from '@/infrastructure/actions/sensorActions';
import { getProjectName } from '@/infrastructure/actions/systemActions';
import { DashboardShell } from '@/presentation/components/layout/DashboardShell';
import { SensorProvider } from '@/presentation/context/SensorContext';
import { ReportsContainer } from '@/presentation/components/reports/ReportsContainer';

import { PageHeader } from '@/presentation/components/layout/PageHeader';

export const revalidate = 300; // Cache de 5 minutos para informes

export default async function AnalysisPage() {
  const [sensors, projectName] = await Promise.all([
    getSensors(),
    getProjectName()
  ]);

  return (
    <SensorProvider initialSensors={sensors}>
      <DashboardShell>
        <div className="flex flex-col h-full gap-4 animate-in fade-in duration-700">
          <PageHeader projectName={projectName} />
          <div className="flex-1 min-h-0">
             <ReportsContainer initialSensors={sensors} />
          </div>
        </div>
      </DashboardShell>
    </SensorProvider>
  );
}
