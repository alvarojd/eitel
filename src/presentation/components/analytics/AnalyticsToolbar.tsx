'use client';

import React from 'react';
import { Calendar, Filter, Activity, Loader2 } from 'lucide-react';
import { useSensor } from '../../context/SensorContext';
import { cn } from '@/lib/utils';

export interface AnalyticsFilters {
  deviceId: string;
  startDate: string;
  endDate: string;
  variable: string;
}

interface AnalyticsToolbarProps {
  filters: AnalyticsFilters;
  setFilters: (filters: AnalyticsFilters) => void;
  isLoading: boolean;
}

const VARIABLES = [
  { id: 'temperature', label: 'Temperatura', unit: '°C' },
  { id: 'humidity', label: 'Humedad', unit: '%' },
  { id: 'co2', label: 'CO2', unit: 'ppm' },
];

export function AnalyticsToolbar({ filters, setFilters, isLoading }: AnalyticsToolbarProps) {
  const { sensors } = useSensor();

  // Set default device if none selected and sensors are loaded
  React.useEffect(() => {
    if (!filters.deviceId && sensors.length > 0) {
      setFilters({ ...filters, deviceId: sensors[0].id });
    }
  }, [sensors, filters, setFilters]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl flex flex-col lg:flex-row gap-6 items-end lg:items-center animate-in fade-in slide-in-from-top-4 duration-500">
      
      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
        
        {/* Device Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-white/50 flex items-center gap-1.5 uppercase tracking-wider">
            <Filter size={10} className="text-sky-500" /> Dispositivo
          </label>
          <select
            name="deviceId"
            value={filters.deviceId}
            onChange={handleChange}
            className="bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 w-full transition-all appearance-none cursor-pointer hover:bg-slate-900"
          >
            {sensors.map(sensor => (
              <option key={sensor.id} value={sensor.id}>
                {sensor.name}
              </option>
            ))}
          </select>
        </div>

        {/* Variable Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-white/50 flex items-center gap-1.5 uppercase tracking-wider">
            <Activity size={10} className="text-sky-500" /> Variable
          </label>
          <select
            name="variable"
            value={filters.variable}
            onChange={handleChange}
            className="bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 w-full transition-all appearance-none cursor-pointer hover:bg-slate-900"
          >
            {VARIABLES.map(v => (
              <option key={v.id} value={v.id}>
                {v.label} ({v.unit})
              </option>
            ))}
          </select>
        </div>

        {/* Date Start */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-white/50 flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar size={10} className="text-sky-500" /> Fecha Inicio
          </label>
          <input 
            type="date" 
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
            onClick={(e) => (e.target as any).showPicker?.()}
            className="bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 w-full transition-all cursor-pointer hover:bg-slate-900"
          />
        </div>

        {/* Date End */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-white/50 flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar size={10} className="text-sky-500" /> Fecha Fin
          </label>
          <input 
            type="date" 
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
            onClick={(e) => (e.target as any).showPicker?.()}
            className="bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 w-full transition-all cursor-pointer hover:bg-slate-900"
          />
        </div>

      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 rounded-full border border-sky-500/20 text-sky-400">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-[10px] font-bold uppercase">Procesando</span>
        </div>
      )}
    </div>
  );
}
