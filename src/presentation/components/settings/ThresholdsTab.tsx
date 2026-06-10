'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save,
  Loader2,
  Check,
  AlertCircle,
  Sliders,
  ThermometerSnowflake,
  Wind,
  Droplets,
  RotateCcw
} from 'lucide-react';
import { getSystemSettings, updateSystemSettingsAction } from '@/infrastructure/actions/systemActions';
import { logAction } from '@/infrastructure/actions/auditActions';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  TEMP_CRITICAL_LOW,
  TEMP_CRITICAL_HIGH,
  TEMP_WARNING_LOW,
  CO2_CRITICAL,
  CO2_WARNING,
  HUM_WARNING_HIGH,
  HUM_WARNING_LOW,
} from '@/core/constants';

export function ThresholdsTab() {
  const { user, isAdmin } = useAuth();
  
  const defaultThresholds = {
    threshold_temp_critical_low: TEMP_CRITICAL_LOW.toString(),
    threshold_temp_warning_low: TEMP_WARNING_LOW.toString(),
    threshold_temp_critical_high: TEMP_CRITICAL_HIGH.toString(),
    threshold_co2_warning: CO2_WARNING.toString(),
    threshold_co2_critical: CO2_CRITICAL.toString(),
    threshold_hum_warning_low: HUM_WARNING_LOW.toString(),
    threshold_hum_warning_high: HUM_WARNING_HIGH.toString(),
  };

  const [thresholds, setThresholds] = useState<Record<string, string>>(defaultThresholds);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await getSystemSettings();
      setThresholds({
        threshold_temp_critical_low: data.threshold_temp_critical_low || defaultThresholds.threshold_temp_critical_low,
        threshold_temp_warning_low: data.threshold_temp_warning_low || defaultThresholds.threshold_temp_warning_low,
        threshold_temp_critical_high: data.threshold_temp_critical_high || defaultThresholds.threshold_temp_critical_high,
        threshold_co2_warning: data.threshold_co2_warning || defaultThresholds.threshold_co2_warning,
        threshold_co2_critical: data.threshold_co2_critical || defaultThresholds.threshold_co2_critical,
        threshold_hum_warning_low: data.threshold_hum_warning_low || defaultThresholds.threshold_hum_warning_low,
        threshold_hum_warning_high: data.threshold_hum_warning_high || defaultThresholds.threshold_hum_warning_high,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setThresholds(prev => ({ ...prev, [key]: value }));
  };

  const handleRestoreDefaults = () => {
    setThresholds(defaultThresholds);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    
    try {
      // Basic validation
      const tCL = parseFloat(thresholds.threshold_temp_critical_low);
      const tWL = parseFloat(thresholds.threshold_temp_warning_low);
      const tCH = parseFloat(thresholds.threshold_temp_critical_high);

      if (tCL >= tWL) throw new Error('El Frío Crítico debe ser menor que el Frío Moderado');
      if (tWL >= tCH) throw new Error('El Frío Moderado debe ser menor que el Calor Crítico');

      await updateSystemSettingsAction(thresholds);
      await logAction(user?.id || '', user?.username || '', 'UPDATE_THRESHOLDS', 'Actualizó umbrales de sensores');
      setMessage({ text: 'Umbrales actualizados correctamente.', type: 'success' });
      
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
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
        <span className="text-xs font-black text-slate-600 tracking-widest">Cargando Umbrales...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-10 animate-in fade-in duration-500">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-2">
          <Sliders size={24} className="text-sky-400" /> 
          Configuración de Umbrales
        </h2>
        <p className="text-slate-500 text-sm font-medium">Define los límites para calcular el estado de los sensores (Ideal, Crítico, Advertencia).</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8 pb-10">
        
        {/* TEMPERATURA */}
        <div className="bg-slate-950/40 p-6 rounded-[2rem] border border-slate-800/60 shadow-inner">
          <h3 className="text-sm font-black text-white tracking-wider mb-6 flex items-center gap-2">
            <ThermometerSnowflake size={16} className="text-sky-400" />
            Umbrales de Temperatura (°C)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1 text-blue-400">FRÍO SEVERO (CRÍTICO) {'<'} </label>
              <input 
                type="number"
                step="0.1"
                disabled={!isAdmin}
                value={thresholds.threshold_temp_critical_low}
                onChange={e => handleChange('threshold_temp_critical_low', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white outline-none focus:border-blue-500/50 transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1 text-sky-400">FRÍO MODERADO (ADV) {'<'}</label>
              <input 
                type="number"
                step="0.1"
                disabled={!isAdmin}
                value={thresholds.threshold_temp_warning_low}
                onChange={e => handleChange('threshold_temp_warning_low', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white outline-none focus:border-sky-500/50 transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1 text-rose-500">CALOR EXTREMO (CRÍTICO) {'>'}</label>
              <input 
                type="number"
                step="0.1"
                disabled={!isAdmin}
                value={thresholds.threshold_temp_critical_high}
                onChange={e => handleChange('threshold_temp_critical_high', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white outline-none focus:border-rose-500/50 transition-all font-bold"
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-4 ml-1">Rango Ideal resultante: Entre el Frío Moderado y el Calor Extremo.</p>
        </div>

        {/* CO2 */}
        <div className="bg-slate-950/40 p-6 rounded-[2rem] border border-slate-800/60 shadow-inner">
          <h3 className="text-sm font-black text-white tracking-wider mb-6 flex items-center gap-2">
            <Wind size={16} className="text-emerald-400" />
            Umbrales de Calidad de Aire - CO2 (ppm)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1 text-amber-500">AIRE VICIADO (ADV) {'>='}</label>
              <input 
                type="number"
                disabled={!isAdmin}
                value={thresholds.threshold_co2_warning}
                onChange={e => handleChange('threshold_co2_warning', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white outline-none focus:border-amber-500/50 transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1 text-rose-500">ATMÓSFERA NOCIVA (CRÍTICA) {'>'}</label>
              <input 
                type="number"
                disabled={!isAdmin}
                value={thresholds.threshold_co2_critical}
                onChange={e => handleChange('threshold_co2_critical', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white outline-none focus:border-rose-500/50 transition-all font-bold"
              />
            </div>
          </div>
        </div>

        {/* HUMEDAD */}
        <div className="bg-slate-950/40 p-6 rounded-[2rem] border border-slate-800/60 shadow-inner">
          <h3 className="text-sm font-black text-white tracking-wider mb-6 flex items-center gap-2">
            <Droplets size={16} className="text-blue-400" />
            Umbrales de Humedad Relativa (%)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1 text-sky-400">AIRE SECO (ADV) {'<'}</label>
              <input 
                type="number"
                disabled={!isAdmin}
                value={thresholds.threshold_hum_warning_low}
                onChange={e => handleChange('threshold_hum_warning_low', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white outline-none focus:border-sky-500/50 transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1 text-indigo-400">RIESGO BIOLÓGICO/MOHO (ADV) {'>'}</label>
              <input 
                type="number"
                disabled={!isAdmin}
                value={thresholds.threshold_hum_warning_high}
                onChange={e => handleChange('threshold_hum_warning_high', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white outline-none focus:border-indigo-500/50 transition-all font-bold"
              />
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        {isAdmin && (
          <div className="flex items-center gap-4">
            <button 
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-black py-4 px-6 rounded-2xl text-sm transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Guardar Umbrales
            </button>
            <button 
              type="button"
              onClick={handleRestoreDefaults}
              disabled={isSaving}
              className="px-6 py-4 rounded-2xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-sm transition-all flex items-center gap-2"
              title="Restaurar valores de fábrica"
            >
              <RotateCcw size={18} />
              <span className="hidden sm:inline">Restaurar</span>
            </button>
          </div>
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
  );
}
