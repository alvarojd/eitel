'use client';

import React from 'react';
import { ArrowUp, ArrowDown, Minus, Sigma, BarChart } from 'lucide-react';
import { AnalyticsDataPoint } from '@/infrastructure/actions/analyticsActions';

interface AnalyticsStatsProps {
  data: AnalyticsDataPoint[];
  unit: string;
}

export function AnalyticsStats({ data, unit }: AnalyticsStatsProps) {
  const stats = React.useMemo(() => {
    if (data.length === 0) return null;
    const values = [...data.map(d => d.value)].sort((a, b) => a - b);
    const min = values[0];
    const max = values[values.length - 1];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    // Mediana
    const mid = Math.floor(values.length / 2);
    const median = values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;

    // Desviación Estándar
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return {
      min: min.toFixed(1),
      max: max.toFixed(1),
      avg: avg.toFixed(1),
      median: median.toFixed(1),
      stdDev: stdDev.toFixed(1)
    };
  }, [data]);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard 
        label="Valor Máximo" 
        value={stats.max} 
        unit={unit} 
        icon={<ArrowUp className="text-rose-500" size={16} />} 
        color="rose"
      />
      <StatCard 
        label="Valor Mínimo" 
        value={stats.min} 
        unit={unit} 
        icon={<ArrowDown className="text-emerald-500" size={16} />} 
        color="emerald"
      />
      <StatCard 
        label="Valor Promedio" 
        value={stats.avg} 
        unit={unit} 
        icon={<Minus className="text-sky-500" size={16} />} 
        color="sky"
      />
      <StatCard 
        label="Mediana" 
        value={stats.median} 
        unit={unit} 
        icon={<BarChart className="text-amber-500" size={16} />} 
        color="amber"
      />
      <StatCard 
        label="Desv. Estándar" 
        value={stats.stdDev} 
        unit={unit} 
        icon={<Sigma className="text-purple-500" size={16} />} 
        color="purple"
      />
    </div>
  );
}

function StatCard({ label, value, unit, icon, color }: { label: string, value: string, unit: string, icon: React.ReactNode, color: string }) {
  const colorMap: Record<string, string> = {
    rose: 'bg-rose-500/10 border-rose-500/20',
    emerald: 'bg-emerald-500/10 border-emerald-500/20',
    sky: 'bg-sky-500/10 border-sky-500/20',
    amber: 'bg-amber-500/10 border-amber-500/20',
    purple: 'bg-purple-500/10 border-purple-500/20',
  };

  return (
    <div className={`p-5 rounded-3xl border ${colorMap[color]} flex items-center justify-between group hover:scale-[1.02] transition-all`}>
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-white tracking-tighter">{value}</span>
          <span className="text-sm font-bold text-white/40">{unit}</span>
        </div>
      </div>
      <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center shadow-xl border border-white/5 group-hover:rotate-12 transition-transform">
        {icon}
      </div>
    </div>
  );
}
