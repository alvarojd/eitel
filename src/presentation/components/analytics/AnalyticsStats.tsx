'use client';

import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { AnalyticsDataPoint } from '@/infrastructure/actions/analyticsActions';

interface AnalyticsStatsProps {
  data: AnalyticsDataPoint[];
  unit: string;
}

export function AnalyticsStats({ data, unit }: AnalyticsStatsProps) {
  const stats = React.useMemo(() => {
    if (data.length === 0) return null;
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    return {
      min: min.toFixed(1),
      max: max.toFixed(1),
      avg: avg.toFixed(1)
    };
  }, [data]);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    </div>
  );
}

function StatCard({ label, value, unit, icon, color }: { label: string, value: string, unit: string, icon: React.ReactNode, color: string }) {
  const colorMap: Record<string, string> = {
    rose: 'bg-rose-500/10 border-rose-500/20',
    emerald: 'bg-emerald-500/10 border-emerald-500/20',
    sky: 'bg-sky-500/10 border-sky-500/20',
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
