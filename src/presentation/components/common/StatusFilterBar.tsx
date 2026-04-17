'use client';

import React from 'react';
import { useFilter } from '../../context/FilterContext';
import { cn } from '@/lib/utils';

const FILTERS = [
  { key: 'all',          label: 'Todos',               activeClass: 'bg-sky-600 text-white shadow-lg shadow-sky-900/40',     inactiveClass: 'bg-slate-900 text-white/60 hover:bg-slate-800' },
  { key: 'critico',      label: 'Crítico',             activeClass: 'bg-rose-600 text-white shadow-lg shadow-rose-900/40',    inactiveClass: 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' },
  { key: 'riesgo',       label: 'Riesgo / Aviso',      activeClass: 'bg-orange-600 text-white shadow-lg shadow-orange-900/40',  inactiveClass: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' },
  { key: 'ideal',        label: 'Situación Ideal',     activeClass: 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40', inactiveClass: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' },
  { key: 'bateria_baja', label: 'Batería Baja',        activeClass: 'bg-blue-600 text-white shadow-lg shadow-blue-900/40',    inactiveClass: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' },
  { key: 'ausencia',     label: 'Ausencia Prolongada', activeClass: 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40',   inactiveClass: 'bg-slate-900 text-white/60 hover:bg-slate-800' },
  { key: 'desconectado', label: 'Desconectado',        activeClass: 'bg-slate-600 text-white',   inactiveClass: 'bg-slate-500/10 text-white/60 hover:bg-slate-500/20' },
] as const;

export function StatusFilterBar() {
  const { activeFilter, setActiveFilter } = useFilter();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
      {FILTERS.map(f => (
        <button
          key={f.key}
          onClick={() => setActiveFilter(f.key)}
          className={cn(
            "px-4 py-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap border border-transparent",
            activeFilter === f.key ? f.activeClass : f.inactiveClass,
            activeFilter === f.key ? "scale-105 border-white/10" : "border-slate-800"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
