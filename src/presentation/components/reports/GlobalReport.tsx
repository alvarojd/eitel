'use client';

import React, { useMemo } from 'react';
import { SensorState } from '@/core/entities/Sensor';
import { HistoryDataPoint, calculateReportMetrics, PresenceFilterType } from '@/core/use-cases/reportsEngine';
import { STATUS_LABELS, STATUS_COLORS } from '@/core/constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Thermometer, Droplets, Wind, Activity } from 'lucide-react';

interface GlobalReportProps {
  sensors: SensorState[];
  data: HistoryDataPoint[];
  presenceFilter: PresenceFilterType;
}

export function GlobalReport({ sensors, data, presenceFilter }: GlobalReportProps) {
  const { percentages, totalHours, metrics } = useMemo(() => calculateReportMetrics(data, presenceFilter), [data, presenceFilter]);

  const pieData = useMemo(() => {
    // Red: Frío Severo(2), Calor Extremo(3), Atmósfera Nociva(4)
    const red = percentages[2] + percentages[3] + percentages[4];
    // Orange: Riesgo Moho(5), Aire Viciado(6), Frío Moderado(7), Aire Seco(8)
    const orange = percentages[5] + percentages[6] + percentages[7] + percentages[8];
    // Green: Ideal(9)
    const green = percentages[9];
    // Gray: Desconectado(1) + Desconocido(0)
    const gray = percentages[1] + percentages[0];
    
    return [
      { name: 'Crítico', value: red, color: '#ef4444' }, // rose-500
      { name: 'Riesgo / Aviso', value: orange, color: '#f97316' }, // orange-500
      { name: 'Situación Ideal', value: green, color: '#10b981' }, // emerald-500
      { name: 'Desconectado', value: gray, color: '#64748b' } // slate-500
    ].filter(d => d.value > 0);
  }, [percentages]);

  const barData = Object.entries(percentages)
    .filter(([id, val]) => (val as number) > 0 && id !== '0')
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .map(([id, val]) => ({
      id: parseInt(id),
      label: STATUS_LABELS[parseInt(id)],
      color: STATUS_COLORS[parseInt(id)],
      value: val as number
    }));

  if (totalHours === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/60 print:text-slate-600 print:text-slate-600 bg-slate-900/20 rounded-2xl border border-slate-800/50">
        <Activity size={32} className="opacity-20 mb-3" />
        <p className="text-sm font-medium">No hay datos suficientes para el filtro seleccionado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Devices Card */}
        <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl shadow-xl flex flex-col justify-center print:bg-white print:border-slate-300">
           <div className="flex items-center gap-2 mb-3 text-white/80">
             <Activity size={18} />
             <span className="font-bold text-xs print:text-slate-700">Dispositivos Analizados</span>
           </div>
           <p className="text-4xl font-mono font-bold text-white mb-1 print:text-black">{sensors.length}</p>
           <p className="text-[11px] text-white/60 print:text-slate-600 print:text-slate-600 font-bold  ">Horas procesadas: {totalHours}</p>
        </div>
        
        {/* Temperature Card */}
        <MetricCard 
          icon={<Thermometer size={18} />} 
          title="Temperatura (Media)" 
          avg={`${metrics.avgTemp.toFixed(1)}°C`}
          median={`${metrics.medTemp.toFixed(1)}°`}
          stdDev={metrics.stdDevTemp.toFixed(2)}
          min={`${metrics.minTemp.toFixed(1)}°`}
          max={`${metrics.maxTemp.toFixed(1)}°`}
        />

        {/* Humidity Card */}
        <MetricCard 
          icon={<Droplets size={18} />} 
          title="Humedad (Media)" 
          avg={`${metrics.avgHum.toFixed(1)}%`}
          median={`${metrics.medHum.toFixed(1)}%`}
          stdDev={metrics.stdDevHum.toFixed(2)}
          min={`${metrics.minHum.toFixed(1)}%`}
          max={`${metrics.maxHum.toFixed(1)}%`}
        />

        {/* CO2 Card */}
        <MetricCard 
          icon={<Wind size={18} />} 
          title="CO2 (Media)" 
          avg={`${metrics.avgCo2.toFixed(0)} ppm`}
          median={metrics.medCo2.toFixed(0)}
          stdDev={metrics.stdDevCo2.toFixed(1)}
          min={metrics.minCo2.toFixed(0)}
          max={metrics.maxCo2.toFixed(0)}
        />
      </div>

      {/* Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/60 shadow-xl print:bg-white print:border-slate-300">
          <h3 className="font-bold text-sm text-white/90 print:text-slate-700   mb-6 text-center print:text-black">Distribución General (Semáforo)</h3>
          <div className="h-64 relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={pieData}
                   cx="50%"
                   cy="50%"
                   innerRadius={70}
                   outerRadius={100}
                   paddingAngle={3}
                   dataKey="value"
                   stroke="none"
                 >
                   {pieData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip 
                   formatter={(value: any) => `${Number(value).toFixed(1)}%`} 
                   contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc', fontWeight: 'bold' }}
                 />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center">
                    <span className="block text-4xl font-mono font-bold text-white print:text-black">{Number(percentages[9]).toFixed(0)}%</span>
                    <span className="text-[10px] font-bold text-white/60 print:text-slate-600 print:text-slate-600  ">Ideal</span>
                 </div>
             </div>
          </div>
          <div className="flex justify-center flex-wrap gap-4 mt-6">
             {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-white/80 print:text-slate-700  ">
                   <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: d.color }}></div>
                   {d.name}: <span className="text-slate-200 print:text-black">{d.value.toFixed(1)}%</span>
                </div>
             ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/60 shadow-xl flex flex-col print:bg-white print:border-slate-300">
          <h3 className="font-bold text-sm text-white/90 print:text-slate-700   mb-6 print:text-black flex-shrink-0">Detalle de Estados y Riesgos</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {barData.map((item, i) => (
               <div key={i} className="w-full">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                     <span className="text-white/90 print:text-slate-700   print:text-slate-700">{item.label}</span>
                     <span className="text-white font-mono print:text-black">{item.value.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden print:bg-slate-200">
                     <div 
                        className="h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                     ></div>
                  </div>
               </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, title, avg, median, stdDev, min, max }: { icon: React.ReactNode, title: string, avg: string, median: string, stdDev: string, min: string, max: string }) {
  return (
    <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl shadow-xl flex flex-col text-center print:bg-white print:border-slate-300">
       <div className="flex items-center justify-center gap-2 mb-3 text-white/40 print:text-slate-500 print:text-slate-500">
         {icon}
         <span className="font-bold text-xs print:text-slate-700">{title}</span>
       </div>
       <p className="text-3xl font-mono font-bold text-white mb-4 print:text-black">{avg}</p>
       <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]  font-bold  border-t border-slate-800/60 pt-3 text-left">
          <div className="flex justify-between">
            <span className="text-white/60 print:text-slate-600">Mediana:</span>
            <span className="text-white/90 print:text-slate-700 print:text-black">{median}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60 print:text-slate-600">DE (σ):</span>
            <span className="text-white/90 print:text-slate-700 print:text-black">{stdDev}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sky-500">Min:</span>
            <span className="text-sky-400">{min}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-rose-500">Max:</span>
            <span className="text-rose-400">{max}</span>
          </div>
       </div>
    </div>
  );
}
