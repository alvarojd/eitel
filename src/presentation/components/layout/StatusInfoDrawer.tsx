'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, ShieldAlert, AlertTriangle, CheckCircle2, WifiOff, BatteryWarning, UserX } from 'lucide-react';
import { useSensor } from '../../context/SensorContext';
import { STATUS_COLORS } from '@/core/constants';

export function StatusInfoDrawer() {
  const { isStatusInfoOpen, setIsStatusInfoOpen } = useSensor();

  return (
    <AnimatePresence>
      {isStatusInfoOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsStatusInfoOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60]"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-500/10 rounded-lg text-sky-500">
                   <Info size={20} />
                </div>
                <h2 className="text-xl font-bold text-white">Estados del Sensor</h2>
              </div>
              <button 
                onClick={() => setIsStatusInfoOpen(false)}
                className="p-2 rounded-full hover:bg-slate-800 text-white/80 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              
              {/* Crítico Section */}
              <section className="space-y-4">
                 <h3 className="text-xs font-bold text-rose-500 flex items-center gap-2">
                    <ShieldAlert size={14} /> CRÍTICO (POBREZA / SALUD)
                 </h3>
                 <div className="space-y-5 pl-1">
                    <StatusDetail 
                       color={STATUS_COLORS[2]} 
                       title="Frío Severo (Pobreza Energética)"
                       desc="T < 16°C"
                    />
                    <StatusDetail 
                       color={STATUS_COLORS[3]} 
                       title="Calor Extremo"
                       desc="T > 27°C"
                    />
                    <StatusDetail 
                       color={STATUS_COLORS[4]} 
                       title="Atmósfera Nociva"
                       desc="CO2 > 1500 ppm"
                    />
                 </div>
              </section>

              {/* Riesgo Section */}
              <section className="space-y-4">
                 <h3 className="text-xs font-bold text-orange-500 flex items-center gap-2">
                    <AlertTriangle size={14} /> RIESGO / AVISO
                 </h3>
                 <div className="space-y-5 pl-1">
                    <StatusDetail 
                       color={STATUS_COLORS[5]} 
                       title="Riesgo Biológico (Moho)"
                       desc="Hum > 70%"
                    />
                    <StatusDetail 
                       color={STATUS_COLORS[6]} 
                       title="Aire Viciado (Confinamiento)"
                       desc="CO2 >= 1000 ppm"
                    />
                    <StatusDetail 
                       color={STATUS_COLORS[7]} 
                       title="Frío Moderado (Pobreza Leve)"
                       desc="T < 18°C"
                    />
                    <StatusDetail 
                       color={STATUS_COLORS[8]} 
                       title="Aire Seco (Irritación)"
                       desc="Hum < 30%"
                    />
                 </div>
              </section>

              {/* Ideal & Offline Section */}
              <section className="space-y-4">
                 <h3 className="text-xs font-bold text-emerald-500 flex items-center gap-2">
                    <CheckCircle2 size={14} /> IDEAL Y ESTADO DE RED
                 </h3>
                 <div className="space-y-5 pl-1 pb-4">
                    <StatusDetail 
                       color={STATUS_COLORS[9]} 
                       title="Situación Ideal"
                       desc="Condiciones óptimas de confort"
                    />
                    <StatusDetail 
                       color={STATUS_COLORS[1]} 
                       title="Desconectado"
                       desc="Sin señal reportada en las últimas 2 horas"
                       iconOverride={<WifiOff size={16} className="text-white/40" />}
                    />
                 </div>
              </section>

              <div className="pt-2 border-t border-slate-800" />

              {/* Indicadores Superpuestos Section */}
              <section className="space-y-4">
                 <h3 className="text-xs font-bold text-slate-400 flex items-center gap-2">
                    INDICADORES SUPERPUESTOS
                 </h3>
                 <div className="space-y-3">
                    <OverlayIndicator 
                       icon={<BatteryWarning className="text-rose-500" size={18} />}
                       bgColor="bg-rose-500/10"
                       title="Batería Baja"
                       desc="Aparece si la carga es < 20%"
                    />
                    <OverlayIndicator 
                       icon={<UserX className="text-slate-400" size={18} />}
                       bgColor="bg-slate-800"
                       title="Ausencia Prolongada"
                       desc="Sin presencia por 48 horas"
                    />
                 </div>
              </section>

              <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl text-[11px] text-white/50 leading-relaxed">
                 <p>Estos niveles están basados en los estándares internacionales de confort térmico y calidad del aire interior para garantizar la salud de los ocupantes.</p>
              </div>

            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function StatusDetail({ color, title, desc, iconOverride }: { color: string, title: string, desc: string, iconOverride?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 group">
       <div className="mt-1 relative shrink-0">
          {iconOverride ? (
             <div className="w-4 h-4 flex items-center justify-center">
                {iconOverride}
             </div>
          ) : (
             <>
               <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: color }} />
               <div className="absolute inset-0 w-3 h-3 rounded-full blur-[4px] opacity-70 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: color }} />
             </>
          )}
       </div>
       <div>
          <div className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">{title}</div>
          <div className="text-[11px] font-mono text-white/40 mt-0.5">{desc}</div>
       </div>
    </div>
  );
}

function OverlayIndicator({ icon, bgColor, title, desc }: { icon: React.ReactNode, bgColor: string, title: string, desc: string }) {
  return (
    <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl flex items-center gap-4 group hover:border-slate-700 transition-colors">
       <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center shrink-0`}>
          {icon}
       </div>
       <div>
          <div className="text-sm font-bold text-white group-hover:text-white/90 transition-colors">{title}</div>
          <div className="text-[11px] text-white/40 mt-0.5">{desc}</div>
       </div>
    </div>
  );
}
