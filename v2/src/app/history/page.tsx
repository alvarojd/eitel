import { getSensors } from '@/infrastructure/actions/sensorActions';
import { getProjectName } from '@/infrastructure/actions/systemActions';
import { DashboardShell } from '@/presentation/components/layout/DashboardShell';
import { SensorProvider } from '@/presentation/context/SensorContext';
import { ReportsToolbar } from '@/presentation/components/features/ReportsToolbar';
import { PageHeader } from '@/presentation/components/layout/PageHeader';
import { FileSpreadsheet, Info } from 'lucide-react';

export const revalidate = 300;

export default async function HistoryPage() {
  const [sensors, projectName] = await Promise.all([
    getSensors(),
    getProjectName()
  ]);

  return (
    <SensorProvider initialSensors={sensors}>
      <DashboardShell projectName={projectName}>
        <div className="flex flex-col h-full gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <PageHeader projectName={projectName} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                      <FileSpreadsheet size={160} className="text-sky-500" />
                   </div>
                   
                   <div className="relative z-10 space-y-6">
                      <div>
                         <h2 className="text-2xl font-black text-white mb-2">Centro de Descargas</h2>
                         <p className="text-slate-500 text-sm font-medium max-w-lg leading-relaxed">
                            Desde esta sección puedes exportar las lecturas de telemetría de todos tus dispositivos. utiliza los filtros de tiempo y selección para generar archivos CSV compatibles con Excel.
                         </p>
                      </div>

                      <div className="w-full h-px bg-slate-800/50" />

                      <ReportsToolbar />
                   </div>
                </div>

                <div className="bg-slate-950/40 border border-dashed border-slate-800 p-6 rounded-3xl flex items-start gap-4">
                   <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400 shrink-0">
                      <Info size={20} />
                   </div>
                   <div className="space-y-1">
                      <p className="text-sm font-bold text-white/80">Consideraciones para la exportación</p>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                         Las exportaciones de "Todo el histórico" pueden tardar varios segundos dependiendo del volumen de datos acumulado. Se recomienda usar rangos específicos para mayor agilidad.
                      </p>
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-3xl">
                   <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Formato de Salida</h3>
                   <div className="space-y-3">
                      <FormatFeature label="Idioma" value="Español (ES)" />
                      <FormatFeature label="Separador" value="Punto y coma (;)" />
                      <FormatFeature label="Columnas" value="7 (Fecha, ID, Nombre...)" />
                      <FormatFeature label="Codificación" value="UTF-8" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </DashboardShell>
    </SensorProvider>
  );
}

function FormatFeature({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-slate-800/40">
       <span className="text-[10px] font-bold text-slate-400">{label}</span>
       <span className="text-[10px] font-mono font-bold text-sky-400">{value}</span>
    </div>
  );
}
