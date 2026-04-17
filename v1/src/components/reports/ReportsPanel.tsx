import React, { useState, useEffect, useMemo } from 'react';
import { SensorData } from '../../types';
import { HistoryDataPoint } from '../../utils/reportUtils';
import { fetchReportData } from '../../services/ttnService';
import GlobalReport from './GlobalReport';
import DeviceReport from './DeviceReport';
import { Printer, Loader2, FileText } from 'lucide-react';

interface ReportsPanelProps {
  sensors: SensorData[];
}

const ReportsPanel: React.FC<ReportsPanelProps> = ({ sensors }) => {
  const [reportType, setReportType] = useState<'global' | 'device'>('global');
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [presenceFilter, setPresenceFilter] = useState<'all' | 'with-presence' | 'without-presence'>('all');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  const [reportData, setReportData] = useState<HistoryDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (sensors.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(sensors[0].id);
    }
  }, [sensors, selectedDeviceId]);

  // Fetch data when filters change
  useEffect(() => {
    if (sensors.length === 0) return;
    
    const loadReport = async () => {
      setIsLoading(true);
      const days = timeRange === 'week' ? 7 : 30;
      
      const devEui = reportType === 'device' && selectedDeviceId 
        ? sensors.find(s => s.id === selectedDeviceId)?.devEui 
        : undefined;

      try {
        const data = await fetchReportData(days, devEui);
        setReportData(data);
      } catch (error) {
        console.error("Error loading report data:", error);
        setReportData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [sensors, reportType, timeRange, selectedDeviceId]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    
    if (reportType === 'device' && selectedDeviceId) {
      const sensor = sensors.find(s => s.id === selectedDeviceId);
      if (sensor?.devEui) {
        params.append('devEui', sensor.devEui);
      }
    }

    if (timeRange === 'week') {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      params.append('startDate', weekAgo.toISOString());
      params.append('endDate', now.toISOString());
    } else if (timeRange === 'month') {
      const now = new Date();
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      params.append('startDate', monthAgo.toISOString());
      params.append('endDate', now.toISOString());
    }

    window.open(`/api/export-csv?${params.toString()}`, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 lg:rounded-2xl lg:overflow-hidden border border-slate-700/50 print:border-none print:h-auto print:bg-white print:overflow-visible">
      {/* Header & Controls (Hidden when printing) */}
      <div className="p-6 border-b border-slate-800 bg-slate-800/50 print:hidden flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Análisis de Confort
          </h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg transition-colors border border-sky-500/50 shadow-sm shadow-sky-900/20"
            >
              <FileText size={18} />
              <span className="text-sm font-medium">Exportar CSV</span>
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors border border-slate-600 shadow-sm"
            >
              <Printer size={18} />
              <span className="text-sm font-medium">Imprimir / PDF</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipo de Informe</label>
            <select 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value as 'global' | 'device')}
              className="bg-slate-900 text-white border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 w-full"
            >
              <option value="global">Resumen Global</option>
              <option value="device">Detalle por Dispositivo</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rango Temporal</label>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'custom')}
              className="bg-slate-900 text-white border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 w-full"
            >
              <option value="week">Última Semana</option>
              <option value="month">Último Mes</option>
              {/* <option value="custom">Rango Personalizado</option> */}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filtro de Presencia</label>
            <select 
              value={presenceFilter} 
              onChange={(e) => setPresenceFilter(e.target.value as 'all' | 'with-presence' | 'without-presence')}
              className="bg-slate-900 text-white border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 w-full"
            >
              <option value="all">Sin considerar presencia</option>
              <option value="with-presence">Con presencia</option>
              <option value="without-presence">Sin presencia</option>
            </select>
          </div>

          {reportType === 'device' && (
             <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
               <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dispositivo</label>
               <select 
                 value={selectedDeviceId} 
                 onChange={(e) => setSelectedDeviceId(e.target.value)}
                 className="bg-slate-900 text-white border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 w-full"
               >
                 {sensors.map(s => (
                   <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                 ))}
               </select>
             </div>
          )}
        </div>
      </div>

      {/* Main Report Content */}
      <div className="flex-1 overflow-y-auto p-6 relative bg-white dark:bg-slate-900 custom-scrollbar report-container print:overflow-visible print:block print:h-auto print:p-0">
        {/* Print Only Header */}
        <div className="hidden print:block mb-8 text-slate-900">
           <div className="flex items-center justify-end border-b-2 border-slate-200 pb-4 mb-6">
             <div className="text-right">
                <p className="text-sm text-slate-500">{new Date().toLocaleDateString()}</p>
                <p className="text-xs text-slate-400 mt-1">Informe generado automáticamente</p>
             </div>
           </div>
           
           <h2 className="text-3xl font-bold text-slate-900 mb-2">
             {reportType === 'global' ? 'Informe General - Análisis de Confort' : `Análisis de Confort - ID: ${selectedDeviceId}`}
           </h2>
           <p className="text-slate-600 mb-8">
             Periodo evaluado: <span className="font-semibold">{timeRange === 'week' ? 'Última Semana' : 'Último Mes'}</span> | 
             Filtro: <span className="font-semibold">{presenceFilter === 'with-presence' ? 'Solo horas con detección de presencia' : presenceFilter === 'without-presence' ? 'Solo horas sin detección de presencia' : 'Todas las horas computables'}</span>
           </p>
        </div>

        {isLoading ? (
           <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="animate-spin text-sky-500 mb-4" size={32} />
              <p className="text-slate-500">Procesando datos del reporte...</p>
           </div>
        ) : reportType === 'global' ? (
           <GlobalReport 
              sensors={sensors} 
              data={reportData} 
              presenceFilter={presenceFilter} 
           />
        ) : (
           <DeviceReport 
              sensor={sensors.find(s => s.id === selectedDeviceId) || null} 
              data={reportData} 
              presenceFilter={presenceFilter} 
           />
        )}
        
      </div>
    </div>
  );
};

export default ReportsPanel;
