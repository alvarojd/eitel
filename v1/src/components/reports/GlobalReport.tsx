import React, { useMemo } from 'react';
import { SensorData } from '../../types';
import { HistoryDataPoint, PresenceFilterType, calculateStatePercentages } from '../../utils/reportUtils';
import { STATUS_LABELS, STATUS_COLORS } from '../../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Thermometer, Droplets, Wind, Activity } from 'lucide-react';

interface GlobalReportProps {
  sensors: SensorData[];
  data: HistoryDataPoint[];
  presenceFilter: PresenceFilterType;
}

const GlobalReport: React.FC<GlobalReportProps> = ({ sensors, data, presenceFilter }) => {
  const { percentages, totalHours } = useMemo(() => calculateStatePercentages(data, presenceFilter), [data, presenceFilter]);

  const metrics = useMemo(() => {
    const filteredForMetrics = data.filter(d => {
      if (presenceFilter === 'with-presence') return d.presence === true;
      if (presenceFilter === 'without-presence') return d.presence === false;
      return true;
    });

    if (filteredForMetrics.length === 0) return { avgTemp: 0, maxTemp: 0, minTemp: 0, avgHum: 0, maxHum: 0, minHum: 0, avgCo2: 0, maxCo2: 0, minCo2: 0 };
    
    let sumT = 0, sumH = 0, sumC = 0;
    let maxT = -999, minT = 999;
    let maxH = -999, minH = 999;
    let maxC = -999, minC = 99999;

    filteredForMetrics.forEach(d => {
      sumT += d.temperature;
      sumH += d.humidity;
      sumC += d.co2;
      
      if (d.temperature > maxT) maxT = d.temperature;
      if (d.temperature < minT) minT = d.temperature;
      if (d.humidity > maxH) maxH = d.humidity;
      if (d.humidity < minH) minH = d.humidity;
      if (d.co2 > maxC) maxC = d.co2;
      if (d.co2 < minC) minC = d.co2;
    });

    const count = filteredForMetrics.length;
    const avgT = sumT / count;
    const avgH = sumH / count;
    const avgC = sumC / count;

    let sumSqDiffT = 0, sumSqDiffH = 0, sumSqDiffC = 0;
    filteredForMetrics.forEach(d => {
      sumSqDiffT += Math.pow(d.temperature - avgT, 2);
      sumSqDiffH += Math.pow(d.humidity - avgH, 2);
      sumSqDiffC += Math.pow(d.co2 - avgC, 2);
    });

    return {
      avgTemp: avgT, maxTemp: maxT, minTemp: minT, stdDevTemp: Math.sqrt(sumSqDiffT / count),
      avgHum: avgH, maxHum: maxH, minHum: minH, stdDevHum: Math.sqrt(sumSqDiffH / count),
      avgCo2: avgC, maxCo2: maxC, minCo2: minC, stdDevCo2: Math.sqrt(sumSqDiffC / count)
    };
  }, [data, presenceFilter]);

  // Group percentages for Pie Chart
  const pieData = useMemo(() => {
    const red = percentages[2] + percentages[3] + percentages[4];
    const orange = percentages[5] + percentages[6] + percentages[7] + percentages[8];
    const green = percentages[9];
    const gray = percentages[1] + percentages[0];
    
    return [
      { name: 'Crítico', value: red, color: '#ef4444' },
      { name: 'Riesgo / Aviso', value: orange, color: '#f97316' },
      { name: 'Situación Ideal', value: green, color: '#22c55e' },
      { name: 'Desconectado', value: gray, color: '#64748b' }
    ].filter(d => d.value > 0);
  }, [percentages]);

  const barData = Object.entries(percentages)
    .filter(([id, val]) => (val as number) > 0 && id !== '0')
    .sort((a, b) => (b[1] as number) - (a[1] as number)) // Sort by percentage descending
    .map(([id, val]) => ({
      id: parseInt(id),
      label: STATUS_LABELS[parseInt(id)],
      color: STATUS_COLORS[parseInt(id)],
      value: val as number
    }));

  if (totalHours === 0) {
    return (
      <div className="flex justify-center items-center h-48 text-slate-500">
        No hay datos suficientes para el filtro seleccionado.
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm print:border-black print:bg-white">
           <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
             <Activity size={18} />
             <span className="font-semibold text-sm">Dispositivos Analizados</span>
           </div>
           <p className="text-3xl font-bold text-slate-800 dark:text-white">{sensors.length}</p>
           <p className="text-xs text-slate-500 mt-1">Horas procesadas: {totalHours}</p>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm print:border-black print:bg-white text-center">
           <div className="flex items-center justify-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
             <Thermometer size={18} />
             <span className="font-semibold text-sm">Temperatura</span>
           </div>
           <p className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{metrics.avgTemp.toFixed(1)}°C</p>
           <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] border-t border-slate-200 dark:border-slate-700 pt-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Media:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{metrics.avgTemp.toFixed(1)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DE (σ):</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{metrics.stdDevTemp.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sky-500">Min:</span>
                <span className="font-semibold text-sky-500">{metrics.minTemp.toFixed(1)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-500">Max:</span>
                <span className="font-semibold text-rose-500">{metrics.maxTemp.toFixed(1)}°</span>
              </div>
           </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm print:border-black print:bg-white text-center">
           <div className="flex items-center justify-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
             <Droplets size={18} />
             <span className="font-semibold text-sm">Humedad</span>
           </div>
           <p className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{metrics.avgHum.toFixed(1)}%</p>
           <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] border-t border-slate-200 dark:border-slate-700 pt-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Media:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{metrics.avgHum.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DE (σ):</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{metrics.stdDevHum.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sky-500">Min:</span>
                <span className="font-semibold text-sky-500">{metrics.minHum.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sky-500">Max:</span>
                <span className="font-semibold text-sky-500">{metrics.maxHum.toFixed(1)}%</span>
              </div>
           </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm print:border-black print:bg-white text-center">
           <div className="flex items-center justify-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
             <Wind size={18} />
             <span className="font-semibold text-sm">CO2</span>
           </div>
           <p className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{metrics.avgCo2.toFixed(0)} ppm</p>
           <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] border-t border-slate-200 dark:border-slate-700 pt-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Media:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{metrics.avgCo2.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DE (σ):</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{metrics.stdDevCo2.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-500">Min:</span>
                <span className="font-semibold text-emerald-500">{metrics.minCo2.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-500">Max:</span>
                <span className="font-semibold text-rose-500">{metrics.maxCo2.toFixed(0)}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm print:border-black print:bg-white">
          <h3 className="font-bold text-lg mb-6 text-slate-800 dark:text-white text-center">Distribución General (Semáforo)</h3>
          <div className="h-64 relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={pieData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={100}
                   paddingAngle={2}
                   dataKey="value"
                 >
                   {pieData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip formatter={(value: any) => `${Number(value).toFixed(1)}%`} />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center">
                    <span className="block text-3xl font-bold text-slate-800 dark:text-white">{Number(percentages[9]).toFixed(0)}%</span>
                    <span className="text-xs text-slate-500">Ideal</span>
                 </div>
             </div>
          </div>
          <div className="flex justify-center flex-wrap gap-4 mt-4">
             {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                   {d.name}: <span className="font-bold">{d.value.toFixed(1)}%</span>
                </div>
             ))}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm print:border-black print:bg-white flex flex-col">
          <h3 className="font-bold text-lg mb-6 text-slate-800 dark:text-white flex-shrink-0">Detalle de Estados y Riesgos</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {barData.map((item, i) => (
               <div key={i} className="w-full">
                  <div className="flex justify-between text-sm mb-1">
                     <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                     <span className="font-bold text-slate-800 dark:text-white">{item.value.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden print:bg-slate-200 print:border print:border-slate-300">
                     <div 
                        className="h-2.5 rounded-full" 
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
};

export default GlobalReport;
