'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSensor } from '../../context/SensorContext';
import { STATUS_BG_COLORS, STATUS_LABELS } from '@/core/constants';
import { Info, Clock, User, ShieldCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CronoPoint {
  timestamp: string;
  estadoId: number;
  hasData: boolean;
  presence: boolean;
}

interface CronoRow {
  deviceId: string;
  name: string;
  data: CronoPoint[];
}

export function CronoTimeline({ heatmapData }: { heatmapData: CronoRow[] }) {
  const { filteredSensors } = useSensor();
  const [hoveredPoint, setHoveredPoint] = useState<{ row: CronoRow, point: CronoPoint } | null>(null);

  const visibleHeatmapData = useMemo(() => {
    const filteredIds = new Set(filteredSensors.map(s => s.id));
    return heatmapData.filter(row => filteredIds.has(row.deviceId));
  }, [heatmapData, filteredSensors]);

  if (visibleHeatmapData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
        <Clock className="text-slate-700 mb-4" size={48} />
        <p className="text-white/60 font-bold   text-xs">Sin registros para el filtro seleccionado</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900/30 border border-slate-800 rounded-3xl p-6 lg:p-8 overflow-hidden relative group">
      <div className="flex justify-between items-center mb-10">
         <div>
            <h2 className="text-xl font-bold text-white ">Análisis Temporal</h2>
            <p className="text-white/70 text-xs mt-1 font-bold">Últimas 24 horas de actividad</p>
         </div>

      </div>

      <div className="overflow-x-auto overflow-y-scroll max-h-[400px] custom-scrollbar pr-4 pb-4">
        <div className="min-w-[900px]">
          {/* Time scale headers */}
          <div className="flex mb-4 items-end">
             <div className="w-48 shrink-0 text-[10px] font-bold text-white/40 px-2">Dispositivo</div>
             <div className="flex-1 flex justify-between px-2 text-[10px] font-bold text-white/40">
                <span>Hace 24h</span>
                <span>Hace 12h</span>
                <span>Ahora</span>
             </div>
          </div>

          <div className="space-y-3">
            {visibleHeatmapData.map((row) => (
              <div key={row.deviceId} className="flex group/row items-center">
                <div className="w-48 shrink-0 px-2 py-1 pr-4 border-r border-slate-800 group-hover/row:border-sky-500/50 transition-colors">
                   <div className="text-xs font-bold text-white/90 truncate group-hover/row:text-white transition-colors">{row.name}</div>
                   <div className="text-[9px] font-mono text-white/40   mt-0.5">{row.deviceId}</div>
                </div>

                <div className="flex-1 flex gap-1 pl-4 items-center h-8">
                  {row.data.map((point, i) => {
                    const colorClass = point.hasData ? STATUS_BG_COLORS[point.estadoId] : 'bg-slate-800/30';
                    const isSelected = hoveredPoint?.point.timestamp === point.timestamp && hoveredPoint?.row.deviceId === row.deviceId;

                    return (
                      <motion.div
                        key={i}
                        whileHover={{ scaleY: 1.4, scaleX: 1.1, zIndex: 10 }}
                        onMouseEnter={() => setHoveredPoint({ row, point })}
                        onMouseLeave={() => setHoveredPoint(null)}
                        className={cn(
                          "flex-1 h-5 rounded-[4px] relative cursor-pointer outline outline-offset-1 outline-transparent hover:outline-sky-500/50 transition-all shadow-sm",
                          colorClass,
                          isSelected && "ring-2 ring-white scale-y-125 z-10"
                        )}
                      >
                         {point.hasData && !point.presence && (
                            <div className="absolute inset-x-0 bottom-0.5 flex justify-center pointer-events-none">
                               <div className="w-1 h-1 rounded-full bg-slate-900/60" />
                            </div>
                         )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Tooltip Detail (Pop-over) */}
      <AnimatePresence>
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl flex items-center justify-between z-50 pointer-events-none w-[90%] lg:w-fit lg:min-w-[450px]"
          >
             <div className="flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", STATUS_BG_COLORS[hoveredPoint.point.estadoId] || 'bg-slate-800')}>
                   <Clock size={20} className="text-white opacity-80" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{hoveredPoint.row.name}</div>
                  <div className="text-[10px] font-bold text-white/80   mt-0.5">
                    {new Date(hoveredPoint.point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} — {STATUS_LABELS[hoveredPoint.point.estadoId] || 'Desconocido'}
                  </div>
                </div>
             </div>
             <div className="flex gap-8">
                <DetailBadge icon={<User size={12} />} label="Presencia" value={hoveredPoint.point.presence ? "SI" : "NO"} active={hoveredPoint.point.presence} />
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailBadge({ icon, label, value, active }: { icon: React.ReactNode, label: string, value: string, active: boolean }) {
  return (
    <div className="flex flex-col items-end">
       <span className="text-[9px] font-bold text-white/60   flex items-center gap-1">
          {icon} {label}
       </span>
       <span className={cn("text-xs font-mono font-bold mt-1", active ? "text-sky-400" : "text-white/40")}>
          {value}
       </span>
    </div>
  );
}
