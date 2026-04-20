'use client';

import React, { useState, useEffect } from 'react';
import { 
 FileText, 
 Clock, 
 RefreshCw, 
 Search,
 Loader2,
 Calendar,
 User as UserIcon,
 ChevronDown,
 Info
} from 'lucide-react';
import { getAuditLogs } from '@/infrastructure/actions/auditActions';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function AuditLogsTab() {
 const [logs, setLogs] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState('');
 
 const refreshLogs = async () => {
 setIsLoading(true);
 try {
 const data = await getAuditLogs(100);
 setLogs(data);
 } catch (e) {
 console.error(e);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 refreshLogs();
 }, []);

 const filteredLogs = logs.filter(log => 
 log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
 log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
 (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
 );

 const getActionColor = (action: string) => {
 if (action.includes('DELETE')) return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
 if (action.includes('CREATE')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
 if (action.includes('UPDATE')) return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
 if (action === 'LOGIN') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
 return 'text-white/60 bg-white/5 border-white/10';
 };

 return (
 <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h2 className="text-xl font-bold text-white flex items-center gap-3">
 <FileText className="text-rose-400" /> 
 Auditoría del Sistema
 </h2>
 <p className="text-sm text-slate-500 font-medium mt-1">Historial inmutable de las operaciones realizadas en el Dashboard.</p>
 </div>
 <button 
 onClick={refreshLogs}
 disabled={isLoading}
 className="px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-2xl text-sm font-black transition-all flex items-center gap-3 shadow-xl border border-slate-700/50"
 >
 <RefreshCw size={18} className={cn(isLoading &&"animate-spin")} />
 Sincronizar Historial
 </button>
 </div>

 {/* Filter Bar */}
 <div className="flex items-center gap-4 bg-slate-900/40 p-2 rounded-[1.5rem] border border-slate-800/40">
 <div className="flex-1 relative group">
 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
 <input 
 value={searchTerm}
 onChange={e => setSearchTerm(e.target.value)}
 className="w-full bg-transparent py-3 pl-12 pr-4 text-sm text-white placeholder-slate-600 outline-none"
 placeholder="Filtrar por acción, operador o detalles..."
 />
 </div>
 </div>

 {/* Logs Table */}
 <div className="flex-1 bg-slate-950/30 rounded-[2.5rem] border border-slate-800/60 overflow-hidden flex flex-col shadow-inner">
 <div className="overflow-x-auto flex-1 custom-scrollbar">
 <table className="w-full text-left">
 <thead>
 <tr className="bg-slate-900/60 border-b border-slate-800/50 sticky top-0 z-10">
 <th className="px-8 py-5 text-[10px] font-black text-slate-500 tracking-widest">Temporalidad</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-500 tracking-widest">Operación</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-500 tracking-widest px-8">Operador</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-500 tracking-widest">Datos de Trazabilidad</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800/30">
 {isLoading ? (
 <tr>
 <td colSpan={4} className="py-20 text-center">
 <div className="flex flex-col items-center gap-4">
 <Loader2 size={36} className="animate-spin text-rose-500/40" />
 <span className="text-xs font-black text-slate-600 tracking-widest">Cargando Línea de Tiempo...</span>
 </div>
 </td>
 </tr>
 ) : filteredLogs.length === 0 ? (
 <tr>
 <td colSpan={4} className="py-20 text-center text-slate-500 text-sm font-medium italic">
 Sin registros de auditoría que mostrar.
 </td>
 </tr>
 ) : (
 filteredLogs.map((log) => (
 <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors border-b border-slate-900/40 last:border-0">
 <td className="px-8 py-5">
 <div className="flex flex-col">
 <span className="text-xs font-mono text-slate-200">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
 <span className="text-[10px] font-bold text-slate-500 mt-0.5 tracking-tighter">{new Date(log.created_at).toLocaleDateString()}</span>
 </div>
 </td>
 <td className="px-8 py-5">
 <span className={cn(
"text-[10px] font-black tracking-widest px-2.5 py-1.5 rounded-lg border flex items-center gap-2 w-fit",
 getActionColor(log.action)
 )}>
 <Info size={12} className="opacity-70" />
 {log.action}
 </span>
 </td>
 <td className="px-8 py-5">
 <div className="flex items-center gap-3">
 <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">
 {log.username.substring(0,2).toUpperCase()}
 </div>
 <span className="text-sm font-bold text-slate-300">@{log.username}</span>
 </div>
 </td>
 <td className="px-8 py-5">
 <div className="max-w-md">
 <p className="text-sm font-medium text-slate-400 leading-relaxed truncate group-hover:whitespace-normal group-hover:text-white transition-all">
 {log.details || 'Sin detalles adicionales registrados.'}
 </p>
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}
