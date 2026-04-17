'use client';

import React, { useState } from 'react';
import { ReportsContainer } from './ReportsContainer';
import { CronoTimeline } from '../features/CronoTimeline';
import { BarChart3, Clock } from 'lucide-react';
import { SensorState } from '@/core/entities/Sensor';

interface ReportsViewSwitcherProps {
  initialSensors: SensorState[];
  heatmapData: any[]; // Data for CronoTimeline
}

export function ReportsViewSwitcher({ initialSensors, heatmapData }: ReportsViewSwitcherProps) {
  const [viewMode, setViewMode] = useState<'analitica' | 'cronograma'>('analitica');

  return (
    <div className="flex flex-col h-full gap-4">
      {/* View Switcher Tabs - Premium Design */}
      <div className="flex items-center justify-between shrink-0 mb-2">
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl shadow-inner">
          <button
            onClick={() => setViewMode('analitica')}
            className={`flex items-center gap-2.5 px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
              viewMode === 'analitica'
                ? 'bg-sky-600 text-white shadow-xl shadow-sky-900/40 translate-z-0'
                : 'text-white/60 print:text-slate-600 hover:text-white/90'
            }`}
          >
            <BarChart3 size={16} />
            ANÁLISIS DE CONFORT
          </button>
          <button
            onClick={() => setViewMode('cronograma')}
            className={`flex items-center gap-2.5 px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
              viewMode === 'cronograma'
                ? 'bg-sky-600 text-white shadow-xl shadow-sky-900/40 translate-z-0'
                : 'text-white/60 print:text-slate-600 hover:text-white/90'
            }`}
          >
            <Clock size={16} />
            CRONOGRAMA DE ACTIVIDAD
          </button>
        </div>
        
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-900/40 border border-slate-800 rounded-2xl">
          <div className={`w-2 h-2 rounded-full animate-pulse ${viewMode === 'analitica' ? 'bg-sky-500' : 'bg-indigo-500'}`} />
          <span className="text-[10px] font-bold text-white/60 print:text-slate-600  ">
            {viewMode === 'analitica' ? 'Modo: Estadístico' : 'Modo: Temporal'}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 relative animate-in fade-in slide-in-from-bottom-2 duration-500">
        {viewMode === 'analitica' ? (
          <ReportsContainer initialSensors={initialSensors} />
        ) : (
          <div className="h-full bg-slate-900/20 rounded-3xl p-1 border border-slate-800/50 overflow-hidden relative">
            <CronoTimeline heatmapData={heatmapData} />
          </div>
        )}
      </div>
    </div>
  );
}
