'use client';

import React, { useState, useEffect } from 'react';
import { SensorState } from '@/core/entities/Sensor';
import { HistoryDataPoint, PresenceFilterType } from '@/core/use-cases/reportsEngine';
import { GlobalReport } from './GlobalReport';
import { DeviceReport } from './DeviceReport';
import { getReports } from '@/infrastructure/actions/historyActions';
import { FileText, Printer, Loader2 } from 'lucide-react';

interface ReportsContainerProps {
  initialSensors: SensorState[];
}

export function ReportsContainer({ initialSensors }: ReportsContainerProps) {
  const [reportType, setReportType] = useState<'global' | 'device'>('global');
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [presenceFilter, setPresenceFilter] = useState<PresenceFilterType>('all');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  const [reportData, setReportData] = useState<HistoryDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialSensors.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(initialSensors[0].id);
    }
  }, [initialSensors, selectedDeviceId]);

  useEffect(() => {
    if (initialSensors.length === 0) return;
    
    const loadReport = async () => {
      setIsLoading(true);
      const days = timeRange === 'week' ? 7 : 30;
      
      const devEui = reportType === 'device' && selectedDeviceId 
        ? initialSensors.find(s => s.id === selectedDeviceId)?.devEui 
        : undefined;

      try {
        const data = await getReports(days, devEui);
        // Cast server data to Date objects to fit HistoryDataPoint signature
        const formattedData = data.map(d => ({
          ...d,
          timestamp: new Date(d.timestamp)
        }));
        setReportData(formattedData);
      } catch (error) {
        console.error("Error loading report data:", error);
        setReportData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [initialSensors, reportType, timeRange, selectedDeviceId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden rounded-3xl border border-slate-800/50 print:border-none print:h-auto print:bg-white print:overflow-visible shadow-2xl">
      {/* Header & Controls (Hidden when printing) */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md print:hidden flex flex-col gap-6 shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white print:text-slate-900 print:text-slate-900 ">Análisis de Confort</h2>
            <p className="text-sm font-bold text-white/60 print:text-slate-600 print:text-slate-600 mt-1">Exportación y auditoría de datos</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white print:text-slate-900 px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-sky-900/30 font-bold text-xs"
            >
              <Printer size={16} />
              Imprimir / PDF
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
             <label className="text-[10px] font-bold text-white/50 print:text-slate-500">Tipo de Informe</label>
             <select 
               value={reportType} 
               onChange={(e) => setReportType(e.target.value as 'global' | 'device')}
               className="bg-slate-950 text-white print:text-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 w-full transition-all"
             >
               <option value="global">Resumen Global (Todos los nodos)</option>
               <option value="device">Detalle por Dispositivo</option>
             </select>
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
             <label className="text-[10px] font-bold text-white/50 print:text-slate-500">Rango Temporal</label>
             <select 
               value={timeRange} 
               onChange={(e) => setTimeRange(e.target.value as 'week' | 'month')}
               className="bg-slate-950 text-white print:text-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 w-full transition-all"
             >
               <option value="week">Última Semana</option>
               <option value="month">Último Mes</option>
             </select>
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
             <label className="text-[10px] font-bold text-white/50 print:text-slate-500">Filtro de Presencia</label>
             <select 
               value={presenceFilter} 
               onChange={(e) => setPresenceFilter(e.target.value as PresenceFilterType)}
               className="bg-slate-950 text-white print:text-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 w-full transition-all"
             >
               <option value="all">Todas las horas (Ignorar presencia)</option>
               <option value="with-presence">Hábiles (Con Presencia Detectada)</option>
               <option value="without-presence">Inhábiles (Sin Presencia)</option>
             </select>
          </div>

          {reportType === 'device' && (
             <div className="flex flex-col gap-2 flex-1 min-w-[200px] animate-in fade-in slide-in-from-right-4">
                <label className="text-[10px] font-bold text-sky-500">Dispositivo Específico</label>
                <select 
                  value={selectedDeviceId} 
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="bg-slate-950 text-sky-400 border border-sky-900/50 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 w-full transition-all"
                >
                  {initialSensors.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                  ))}
                </select>
             </div>
          )}
        </div>
      </div>

      {/* Main Report Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-950/50 print:overflow-visible print:block print:h-auto print:p-0 print:bg-white custom-scrollbar">
        {/* Print Only Header */}
        <div className="hidden print:block mb-8 text-black">
           <div className="flex items-center justify-end border-b-2 border-slate-200 pb-4 mb-6">
             <div className="text-right">
                <p className="text-sm font-mono text-white/60 print:text-slate-600 print:text-slate-600">{new Date().toLocaleDateString()}</p>

             </div>
           </div>
           
           <h2 className="text-3xl font-bold text-black mb-2 ">
             {reportType === 'global' ? 'Informe General - Análisis de Confort' : `Análisis Específico de Confort`}
           </h2>
           <p className="text-white/40 print:text-slate-500 mb-8 text-sm">
             Periodo evaluado: <span className="font-bold">{timeRange === 'week' ? 'Última Semana (7 días)' : 'Último Mes (30 días)'}</span> | 
             Filtro: <span className="font-bold bg-slate-100 px-2 py-0.5 rounded">{presenceFilter === 'with-presence' ? 'Solo horas HABITADAS (Con Presencia)' : presenceFilter === 'without-presence' ? 'Solo horas DESHABITADAS (Sin Presencia)' : 'Todas las horas registradas'}</span>
           </p>
        </div>

        {isLoading ? (
           <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
              <Loader2 className="animate-spin text-sky-500 mb-4" size={32} />
              <p className="text-sm font-bold text-white/50 print:text-slate-500 animate-pulse">Analizando serie temporal...</p>
           </div>
        ) : reportType === 'global' ? (
           <GlobalReport 
              sensors={initialSensors} 
              data={reportData} 
              presenceFilter={presenceFilter} 
           />
        ) : (
           <DeviceReport 
              sensor={initialSensors.find(s => s.id === selectedDeviceId) || null} 
              data={reportData} 
              presenceFilter={presenceFilter} 
           />
        )}
      </div>
    </div>
  );
}
