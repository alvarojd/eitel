'use client';

import React, { useState } from 'react';
import { Download, Calendar, Filter, FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';
import { useSensor } from '../../context/SensorContext';
import { exportSensorDataCSV } from '@/infrastructure/actions/historyActions';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ReportsToolbar() {
 const { filteredSensors } = useSensor();
 const [startDate, setStartDate] = useState('');
 const [endDate, setEndDate] = useState('');
 const [allData, setAllData] = useState(false);
 const [isExporting, setIsExporting] = useState(false);
 const [showSuccess, setShowSuccess] = useState(false);

 const handleExport = async () => {
 if (filteredSensors.length === 0) return;
 
 setIsExporting(true);
 try {
 const deviceIds = filteredSensors.map(s => s.id);
 const csvData = await exportSensorDataCSV(deviceIds, startDate, endDate, allData);
 
 // Client-side download trigger
 const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.setAttribute('href', url);
 link.setAttribute('download', `reporte_sensores_${new Date().toISOString().split('T')[0]}.csv`);
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
 
 {/* Date Range Section */}
 <div className="flex flex-col md:flex-row gap-4 flex-1 w-full lg:w-auto">
 <div className="space-y-1.5 flex-1">
 <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1 flex items-center gap-1.5">
 <Calendar size={10} /> Inicio del Rango
 </label>
 <input 
 type="date" 
 disabled={allData}
 value={startDate}
 onChange={(e) => setStartDate(e.target.value)}
 className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-sky-500/50 transition-all disabled:opacity-30"
 />
 </div>
 <div className="space-y-1.5 flex-1">
 <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1 flex items-center gap-1.5">
 <Calendar size={10} /> Fin del Rango
 </label>
 <input 
 type="date" 
 disabled={allData}
 value={endDate}
 onChange={(e) => setEndDate(e.target.value)}
 className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-sky-500/50 transition-all disabled:opacity-30"
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
 <span className="text-[10px] font-black text-slate-400 tracking-widest group-hover:text-white transition-colors">Todo el histórico</span>
 </label>

 <div className="w-px h-6 bg-slate-800" />

 <button 
 onClick={handleExport}
 disabled={isExporting || (filteredSensors.length === 0)}
 className={cn(
"h-full px-6 rounded-xl font-black text-[10px] tracking-widest transition-all flex items-center gap-2 shadow-lg",
 isExporting ?"bg-slate-800 text-slate-500 cursor-not-allowed" :"bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/20 active:scale-95"
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
