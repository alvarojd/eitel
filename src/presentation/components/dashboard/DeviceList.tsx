'use client';

import React from 'react';
import { useSensor } from '../../context/SensorContext';
import { calculateLinkQuality } from '@/core/use-cases/linkQuality';
import { Signal, Battery, Cpu, Clock, MapPin, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { STATUS_TEXT_COLORS, STATUS_BG_COLORS, STATUS_LABELS } from '@/core/constants';

export function DeviceList() {
 const { filteredSensors, setSelectedSensorId } = useSensor();

 if (filteredSensors.length === 0) {
 return (
 <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 p-12">
 <div className="w-20 h-20 bg-slate-900/50 rounded-full border border-slate-800 flex items-center justify-center">
 <Cpu size={40} className="opacity-20 translate-y-1" />
 </div>
 <div className="text-center">
 <p className="text-base font-bold text-white/80">Sin coincidencias térmicas</p>
 <p className="text-xs font-medium mt-1">No se encontraron sensores activos con los filtros actuales.</p>
 </div>
 </div>
 );
 }

 return (
 <div className="h-full overflow-y-auto custom-scrollbar p-1 px-2">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-10">
 <AnimatePresence mode="popLayout">
 {filteredSensors.map((sensor, idx) => {
 const lq = calculateLinkQuality(sensor.latestMeasurement?.rssi || 0, sensor.latestMeasurement?.snr || 0);
 
 return (
 <motion.div
 layout
 initial={{ opacity: 0, scale: 0.9, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.9, y: 20 }}
 transition={{ duration: 0.3, delay: idx * 0.05 }}
 key={sensor.id}
 onClick={() => setSelectedSensorId(sensor.id)}
 className="group relative bg-slate-900/40 border border-slate-800/60 p-5 rounded-[2rem] hover:bg-slate-900/80 hover:border-sky-500/30 transition-all cursor-pointer shadow-2xl overflow-hidden"
 >
 {/* Visual Accent Decoration */}
 <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-[64px] group-hover:bg-sky-500/10 transition-colors" />
 
 {/* Header: Identity & Status */}
        <div className="flex items-start justify-between gap-4 mb-6 relative">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative">
              <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform shadow-lg">
                <Cpu size={22} />
              </div>
              <div className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center",
                STATUS_BG_COLORS[sensor.estadoId]
              )}>
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-white truncate group-hover:text-sky-400 transition-colors tracking-tight">
                {sensor.name}
              </h3>
              <div className="flex flex-col gap-1.5 mt-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 tracking-tighter truncate">
                  {sensor.devEui || sensor.id}
                </span>
                <div className={cn(
                  "text-[9px] font-black tracking-widest px-2 py-0.5 rounded-lg border flex items-center gap-1.5 w-fit",
                  STATUS_TEXT_COLORS[sensor.estadoId],
                  "bg-slate-950/40 border-white/5"
                )}>
                  {STATUS_LABELS[sensor.estadoId]}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Cluster Unification */}
        <div className="bg-slate-950/80 rounded-[1.5rem] p-4 border border-slate-800/50 space-y-4 shadow-inner relative z-10">
          
          {/* Link Quality Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black tracking-widest">
              <span className="text-slate-500 flex items-center gap-2">
                <Signal size={12} className={cn(
                  lq.level === 'EXCELENTE' ? 'text-emerald-500' :
                  lq.level === 'BUENA' ? 'text-sky-500' :
                  lq.level === 'REGULAR' ? 'text-amber-500' :
                  'text-rose-500'
                )} />
                Calidad del enlace
              </span>
              <span className={cn(
                "font-mono",
                lq.level === 'EXCELENTE' ? 'text-emerald-500' :
                lq.level === 'BUENA' ? 'text-sky-500' :
                lq.level === 'REGULAR' ? 'text-amber-500' :
                'text-rose-500'
              )}>
                {lq.score}% — {lq.level.charAt(0).toUpperCase() + lq.level.slice(1).toLowerCase()}
              </span>
            </div>
            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${lq.score}%` }}
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  lq.level === 'EXCELENTE' ? 'bg-emerald-500' :
                  lq.level === 'BUENA' ? 'bg-sky-500' :
                  lq.level === 'REGULAR' ? 'bg-amber-500' :
                  'bg-rose-500'
                )}
              />
            </div>
 </div>

 {/* Radio Detailed Grid */}
 <div className="grid grid-cols-2 gap-3">
 <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40 flex flex-col gap-1">
 <span className="text-[9px] font-black text-slate-600 tracking-widest">RSSI</span>
 <span className="text-xs font-mono font-bold text-sky-400">{sensor.latestMeasurement?.rssi || 0} <span className="text-[8px] text-slate-500">dBm</span></span>
 </div>
 <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40 flex flex-col gap-1">
 <span className="text-[9px] font-black text-slate-600 tracking-widest">SNR</span>
 <span className="text-xs font-mono font-bold text-emerald-400">{sensor.latestMeasurement?.snr || 0} <span className="text-[8px] text-slate-500">dB</span></span>
 </div>
 </div>

 {/* Gateway & Network Info */}
 <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-800/40">
 <div className="flex items-center gap-2">
 <MapPin size={12} />
 <span className="tracking-widest">Gateway</span>
 </div>
 <span className="text-white/80 font-mono truncate max-w-[120px]">{sensor.gatewayId || 'LoRaWAN_GW_01'}</span>
 </div>
 </div>

 {/* Footer: Health & Vitality */}
 <div className="mt-6 flex items-center justify-between px-1">
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-2">
 <Battery size={16} className={cn(
 (sensor.latestMeasurement?.battery || 0) > 30 ?"text-emerald-500" :"text-rose-500",
"transition-colors"
 )} />
 <div className="flex flex-col">
 <span className="text-xs font-black text-white leading-none">{(sensor.latestMeasurement?.battery || 0)}%</span>
 <span className="text-[8px] font-bold text-slate-600 mt-0.5">Batería</span>
 </div>
 </div>
 
 <div className="w-px h-6 bg-slate-800" />

 <div className="flex items-center gap-2">
 <Activity size={16} className="text-sky-500" />
 <div className="flex flex-col">
 <span className="text-xs font-black text-white leading-none">{sensor.lastSeen ? "Conectado" : "Desconectado"}</span>
 <span className="text-[8px] font-bold text-slate-600 mt-0.5">Estado</span>
 </div>
 </div>
 </div>

 <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-600 group-hover:bg-sky-500 group-hover:text-white transition-all transform group-hover:translate-x-1 shadow-lg">
 <ChevronRight size={16} />
 </div>
 </div>
 </motion.div>
 );
 })}
 </AnimatePresence>
 </div>
 </div>
 );
}
