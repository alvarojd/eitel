import { getHeatmapData } from '@/infrastructure/actions/heatmapActions';
import { getSensors } from '@/infrastructure/actions/sensorActions';
import { getProjectName } from '@/infrastructure/actions/systemActions';
import { DashboardShell } from '@/presentation/components/layout/DashboardShell';
import { SensorProvider } from '@/presentation/context/SensorContext';
import { PageHeader } from '@/presentation/components/layout/PageHeader';
import { CronoTimeline } from '@/presentation/components/features/CronoTimeline';
import { ReportsToolbar } from '@/presentation/components/features/ReportsToolbar';
import { StatusFilterBar } from '@/presentation/components/common/StatusFilterBar';

export const revalidate = 300; // Cache de 5 minutos para informes

export default async function ReportsPage() {
  const [heatmapData, sensors, projectName] = await Promise.all([
    getHeatmapData(),
    getSensors(),
    getProjectName()
  ]);

  return (
    <SensorProvider initialSensors={sensors}>
      <DashboardShell projectName={projectName}>
        <div className="flex flex-col h-full gap-4 animate-in fade-in duration-700">
          <PageHeader projectName={projectName} />
          <div className="bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800 shrink-0">
             <StatusFilterBar />
          </div>
          <div className="flex-1 min-h-0 bg-slate-900/20 rounded-3xl p-1 border border-slate-800/50 overflow-hidden relative">
            <CronoTimeline heatmapData={heatmapData} />
          </div>
        </div>
      </DashboardShell>
    </SensorProvider>
  );
}

function ProgressStat({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-1.5">
       <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
          <span>{label}</span>
          <span className="text-white">{value}%</span>
       </div>
       <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${value}%` }} />
       </div>
    </div>
  );
}
