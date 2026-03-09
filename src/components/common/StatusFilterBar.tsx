import React from 'react';

interface StatusFilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const FILTERS = [
  { key: 'all',          label: 'Todos',               activeClass: 'bg-sky-600 text-white',     inactiveClass: 'bg-slate-800 text-slate-400 hover:bg-slate-700' },
  { key: 'critico',      label: 'Crítico',             activeClass: 'bg-rose-600 text-white',    inactiveClass: 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' },
  { key: 'riesgo',       label: 'Riesgo / Aviso',      activeClass: 'bg-orange-600 text-white',  inactiveClass: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' },
  { key: 'ideal',        label: 'Situación Ideal',     activeClass: 'bg-emerald-600 text-white', inactiveClass: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' },
  { key: 'bateria_baja', label: 'Batería Baja',        activeClass: 'bg-blue-600 text-white',    inactiveClass: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' },
  { key: 'ausencia',     label: 'Ausencia Prolongada', activeClass: 'bg-slate-600 text-white',   inactiveClass: 'bg-slate-800 text-slate-400 hover:bg-slate-700' },
  { key: 'desconectado', label: 'Desconectado',        activeClass: 'bg-slate-600 text-white',   inactiveClass: 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20' },
] as const;

const StatusFilterBar: React.FC<StatusFilterBarProps> = ({ activeFilter, onFilterChange }) => (
  <div className="p-4 border-b border-slate-700/50 flex gap-2 overflow-x-auto no-scrollbar bg-slate-900/10">
    {FILTERS.map(f => (
      <button
        key={f.key}
        onClick={() => onFilterChange(f.key)}
        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
          activeFilter === f.key ? f.activeClass : f.inactiveClass
        }`}
      >
        {f.label}
      </button>
    ))}
  </div>
);

export default StatusFilterBar;
