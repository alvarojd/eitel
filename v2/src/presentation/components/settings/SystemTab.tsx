'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Server, 
  Globe, 
  Cpu, 
  Settings as SettingsIcon, 
  Save,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';
import { getSystemSettings, updateProjectName } from '@/infrastructure/actions/systemActions';
import { logAction } from '@/infrastructure/actions/auditActions';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function SystemTab() {
  const { user, isAdmin } = useAuth();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [projectName, setProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await getSystemSettings();
      setSettings(data);
      setProjectName(data.project_name || '');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateProjectName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    
    try {
      await updateProjectName(projectName);
      await logAction(user?.id || '', user?.username || '', 'UPDATE_SETTINGS', `Cambiado nombre del proyecto a: ${projectName}`);
      setMessage({ text: 'Configuración guardada correctamente.', type: 'success' });
      
      // Update local storage or trigger a refresh if needed
      // For now, just a visual feedback
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (e: any) {
      setMessage({ text: e.message || 'Error al guardar', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="animate-spin text-sky-500 opacity-50" />
        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Recuperando Configuración...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-10 animate-in fade-in duration-500">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-2">
          <Server size={24} className="text-sky-400" /> 
          Configuración Global del Sistema
        </h2>
        <p className="text-slate-500 text-sm font-medium">Parámetros operativos y del entorno técnico.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Project Identity Section */}
        <div className="space-y-6">
           <div className="bg-slate-950/40 p-1.5 rounded-[2rem] border border-slate-800/60 shadow-inner">
             <div className="bg-slate-900/60 p-6 rounded-[1.75rem] border border-slate-800/40">
               <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                 <Globe size={16} className="text-sky-500" />
                 Identidad del Proyecto
               </h3>

               <form onSubmit={handleUpdateProjectName} className="space-y-5">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Comercial / Título</label>
                   <div className="relative group">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-500 transition-colors">
                       <SettingsIcon size={18} />
                     </span>
                     <input 
                       disabled={!isAdmin}
                       value={projectName}
                       onChange={e => setProjectName(e.target.value)}
                       className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-700 outline-none focus:border-sky-500/50 transition-all font-bold disabled:opacity-50"
                       placeholder="Ej: Dashboard Ayto. Madrid"
                     />
                   </div>
                 </div>

                 {isAdmin && (
                   <button 
                    disabled={isSaving || projectName === settings.project_name}
                    className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:bg-slate-800 text-white font-black py-4 px-6 rounded-2xl text-sm transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                   >
                     {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                     Guardar Cambios
                   </button>
                 )}

                 {message.text && (
                   <motion.div 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className={cn(
                      "p-4 rounded-2xl flex items-center gap-3 border",
                      message.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                    )}
                   >
                     {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                     <span className="text-sm font-bold">{message.text}</span>
                   </motion.div>
                 )}
               </form>
             </div>
           </div>

           <div className="p-6 bg-slate-900/20 rounded-[2rem] border border-slate-800/30">
              <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                    <AlertCircle size={24} />
                 </div>
                 <div className="flex-1">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">Nota de Seguridad</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      El nombre configurado aquí se utilizará en todo el Dashboard, correos electrónicos y reportes PDF generados por el sistema.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* Technical Stack Section */}
        <div className="space-y-6">
           <div className="bg-slate-950/40 p-6 rounded-[2rem] border border-slate-800/60 shadow-inner">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                 <Cpu size={16} className="text-rose-500" />
                 Arquitectura del Entorno
               </h3>

               <div className="space-y-4">
                  {[
                    { label: 'Host Operativo', value: 'Vercel Serverless', sub: 'Region: Fra1 (Edge)' },
                    { label: 'Base de Datos', value: 'PostgreSQL v15', sub: 'Supabase / Neon DB' },
                    { label: 'Entorno Node', value: process.env.NODE_VERSION || 'v18.x LTS', sub: 'React 18 / Next.js 15' },
                    { label: 'Network Server', value: 'The Things Network', sub: 'Stack V3 (LoRaWAN)' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/60 rounded-2xl border border-slate-800/40 group hover:border-slate-700 transition-colors">
                       <div className="space-y-0.5">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                          <p className="text-sm font-bold text-white">{item.value}</p>
                       </div>
                       <span className="text-[10px] font-mono text-slate-600 bg-slate-950 px-2 py-1 rounded-md">{item.sub}</span>
                    </div>
                  ))}
               </div>
           </div>

           {/* TTN Quick Link */}
           <div className="bg-sky-600/5 border border-sky-500/10 p-6 rounded-[2rem] flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                    <Database size={20} className="text-sky-400" />
                 </div>
                 <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest">LoRaWAN Webhook</p>
                    <p className="text-[10px] font-mono text-sky-400 mt-0.5">/api/webhook</p>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Activo</span>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
