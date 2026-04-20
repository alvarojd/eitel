'use client';

import React, { useState } from 'react';
import { Download, Calendar, Filter, FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';
import { useSensor } from '../../context/SensorContext';
import { exportSensorDataCSV } from '@/infrastructure/actions/historyActions';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ReportsToolbar() {
  const { sensors } = useSensor();
 const [startDate, setStartDate] = useState('');
 const [endDate, setEndDate] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState('all');
  const [allData, setAllData] = useState(false);
 const [isExporting, setIsExporting] = useState(false);
 const [showSuccess, setShowSuccess] = useState(false);

  const handleExport = async () => {
    if (sensors.length === 0) return;
    
    setIsExporting(true);
    try {
      const deviceIds = selectedDeviceId === 'all' 
        ? sensors.map(s => s.id) 
        : [selectedDeviceId];

      const csvData = await exportSensorDataCSV(deviceIds, startDate, endDate, allData);
      
      // Client-side download trigger
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const filename = selectedDeviceId === 'all' ? 'reporte_todos' : `reporte_${selectedDeviceId}`;
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Error al generar el reporte. Por favor, inténtalo de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

 return (
 <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-3xl flex flex-col lg:flex-row gap-6 items-end lg:items-center">
 
      {/* Device & Date Range Section */}
      <div className="flex flex-col md:flex-row gap-4 flex-1 w-full lg:w-auto">
        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold text-white/50 flex items-center gap-1.5">
            <Filter size={10} /> Dispositivos
          </label>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 w-full transition-all appearance-none cursor-pointer"
          >
            <option value="all">Todos los dispositivos (Resumen)</option>
            {sensors.map(sensor => (
              <option key={sensor.id} value={sensor.id}>
                {sensor.name} ({sensor.id})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-[150px]">
          <label className="text-[10px] font-bold text-white/50 flex items-center gap-1.5">
            <Calendar size={10} /> Inicio del Rango
          </label>
          <input 
            type="date" 
            disabled={allData}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            onClick={(e) => (e.target as any).showPicker?.()}
            className="bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 w-full transition-all disabled:opacity-30 cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-[150px]">
          <label className="text-[10px] font-bold text-white/50 flex items-center gap-1.5">
            <Calendar size={10} /> Fin del Rango
          </label>
          <input 
            type="date" 
            disabled={allData}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            onClick={(e) => (e.target as any).showPicker?.()}
            className="bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 w-full transition-all disabled:opacity-30 cursor-pointer"
          />
        </div>
      </div>

 {/* Options Section */}
 <div className="flex items-center gap-6 shrink-0 h-10">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center">
            <input 
              type="checkbox" 
              checked={allData}
              onChange={(e) => setAllData(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:bg-sky-600 transition-colors" />
            <div className="absolute left-1 w-3 h-3 bg-white rounded-full transition-all peer-checked:left-6" />
          </div>
          <span className="text-[10px] font-bold text-white/50 group-hover:text-white transition-colors">Todo el histórico</span>
        </label>

        <div className="w-px h-6 bg-slate-800" />

        <button 
          onClick={handleExport}
          disabled={isExporting || (sensors.length === 0)}
          className={cn(
            "h-full px-6 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg",
            isExporting ?"bg-slate-800 text-slate-500 cursor-not-allowed" :"bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/30 active:scale-95"
          )}
        >
 {isExporting ? (
 <Loader2 size={14} className="animate-spin" />
 ) : (
 <>
 <FileSpreadsheet size={14} />
 Exportar CSV
 </>
 )}
 </button>
 </div>

 <AnimatePresence>
 {showSuccess && (
 <motion.div 
 initial={{ opacity: 0, scale: 0.9, x: 20 }}
 animate={{ opacity: 1, scale: 1, x: 0 }}
 exit={{ opacity: 0, scale: 0.9, x: 20 }}
 className="fixed bottom-8 right-8 bg-emerald-600 text-white p-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-emerald-500"
 >
 <CheckCircle2 size={20} />
 <div className="flex flex-col">
 <span className="text-sm font-black tracking-tight">¡Reporte Generado!</span>
 <span className="text-[10px] font-bold opacity-80">La descarga comenzará en breve.</span>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
