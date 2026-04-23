'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
 X, 
 Thermometer, 
 Droplets, 
 Wind, 
 Signal, 
 Battery, 
 MapPin, 
 Clock,
 ExternalLink,
 Loader2,
 UserCheck,
 Settings
} from 'lucide-react';
import { useSensor } from '../../context/SensorContext';
import { useAuth } from '../../context/AuthContext';
import { SensorAdminTab } from './SensorAdminTab';
import { STATUS_TEXT_COLORS, STATUS_BG_COLORS, STATUS_LABELS } from '@/core/constants';
import { calculateLinkQuality, LinkQualityLevel } from '@/core/use-cases/linkQuality';
import { getSensorHistory } from '@/infrastructure/actions/historyActions';
import { cn, formatTimeAgo } from '@/lib/utils';
import { 
 AreaChart, 
 Area, 
 XAxis, 
 YAxis, 
 CartesianGrid, 
 Tooltip, 
 ResponsiveContainer,
 ReferenceArea
} from 'recharts';

interface HistoryItem {
 time: string;
 value: number;
 humidity: number;
 co2: number;
 timestamp: string;
}

export function SensorDrawer() {
 const { selectedSensor, isDrawerOpen, setIsDrawerOpen } = useSensor();
 const { user } = useAuth();
 const [activeTab, setActiveTab] = useState<'details' | 'admin'>('details');
 const [history, setHistory] = useState<HistoryItem[]>([]);
 const [loading, setLoading] = useState(false);
 const [timeAgo, setTimeAgo] = useState('');

 const isAdmin = user?.role === 'ADMIN';

 // Update time ago string
 useEffect(() => {
   if (!selectedSensor?.lastSeen) {
     setTimeAgo('Nunca');
     return;
   }

   const update = () => setTimeAgo(formatTimeAgo(selectedSensor.lastSeen));
   update();

   const interval = setInterval(update, 60000);
   return () => clearInterval(interval);
 }, [selectedSensor?.lastSeen]);

 // Reset tab to details when opening a new sensor
 useEffect(() => {
 if (isDrawerOpen) setActiveTab('details');
 }, [selectedSensor?.id, isDrawerOpen]);

 useEffect(() => {
 if (selectedSensor && isDrawerOpen) {
 setLoading(true);
 getSensorHistory(selectedSensor.id).then(data => {
 setHistory(data);
 setLoading(false);
 });
 }
 }, [selectedSensor, isDrawerOpen]);

 if (!selectedSensor) return null;

 const lq = calculateLinkQuality(selectedSensor.latestMeasurement?.rssi || 0, selectedSensor.latestMeasurement?.snr || 0);

 return (
 <AnimatePresence>
 {isDrawerOpen && (
 <>
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setIsDrawerOpen(false)}
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
 <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
 <div>
 <h2 className="text-xl font-bold text-white flex items-center gap-2">
 <MapPin size={18} className="text-sky-500" />
 {selectedSensor.name}
 </h2>
 <div className="flex items-center gap-2 mt-1">
 <span className="text-xs font-mono text-white/90">{selectedSensor.devEui || selectedSensor.id}</span>
 <div className="w-1 h-1 rounded-full bg-slate-400" />
 <span className="text-[10px] text-slate-200 flex items-center gap-1">
 <Clock size={10} /> {timeAgo}
 </span>
 </div>
 </div>
 <button 
 onClick={() => setIsDrawerOpen(false)}
 className="p-2 rounded-full hover:bg-slate-800 text-white/80 transition-colors"
 >
 <X size={20} />
 </button>
 </div>

 {/* Tabs Navigation (Admin only) */}
 {isAdmin && (
 <div className="flex px-6 pt-2 border-b border-slate-800 bg-slate-900 sticky top-[77px] z-10 shadow-lg">
 <button
 onClick={() => setActiveTab('details')}
 className={cn(
"px-4 py-3 text-xs font-black tracking-widest transition-all relative",
 activeTab === 'details' ?"text-sky-500" :"text-slate-500 hover:text-slate-300"
 )}
 >
 Detalles
 {activeTab === 'details' && (
 <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
 )}
 </button>
 <button
 onClick={() => setActiveTab('admin')}
 className={cn(
"px-4 py-3 text-xs font-black tracking-widest transition-all relative flex items-center gap-2",
 activeTab === 'admin' ?"text-rose-500" :"text-slate-500 hover:text-slate-300"
 )}
 >
 <Settings size={14} />
 Administración
 {activeTab === 'admin' && (
 <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500" />
 )}
 </button>
 </div>
 )}

 {/* Content Container */}
 <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
 {activeTab === 'details' ? (
 <SensorDetailsContent 
 selectedSensor={selectedSensor} 
 history={history} 
 loading={loading} 
 lq={lq} 
 />
 ) : (
 <SensorAdminTab />
 )}
 </div>
 </motion.aside>
 </>
 )}
 </AnimatePresence>
 );
}

function SensorDetailsContent({ selectedSensor, history, loading, lq }: { 
 selectedSensor: any, 
 history: HistoryItem[], 
 loading: boolean, 
 lq: any 
}) {
 return (
 <div className="space-y-8 animate-in fade-in duration-500">
 {/* Status Badge */}
 <div className={cn(
"p-4 rounded-2xl border flex items-center justify-between",
 STATUS_TEXT_COLORS[selectedSensor.estadoId],
"bg-slate-950/50 border-white/5"
 )}>
 <div className="flex items-center gap-3">
 <div className={cn("w-3 h-3 rounded-full animate-pulse", STATUS_BG_COLORS[selectedSensor.estadoId])} />
 <span className="text-sm font-bold">{STATUS_LABELS[selectedSensor.estadoId]}</span>
 </div>
 <div className="text-[10px] font-bold opacity-60">Estado Actual</div>
 </div>

 {/* Major Metrics Grid */}
 <div className="grid grid-cols-2 gap-4">
 <MetricCard 
 icon={<Thermometer size={16} className="text-rose-400" />} 
 label="Temperatura" 
 value={`${selectedSensor.latestMeasurement?.temperature || 0}°C`} 
 />
 <MetricCard 
 icon={<Droplets size={16} className="text-sky-400" />} 
 label="Humedad" 
 value={`${selectedSensor.latestMeasurement?.humidity || 0}%`} 
 />
 <MetricCard 
 icon={<Wind size={16} className="text-emerald-400" />} 
 label="CO2" 
 value={`${selectedSensor.latestMeasurement?.co2 || 0} ppm`} 
 />
 <MetricCard 
 icon={<UserCheck size={16} className={cn(selectedSensor.latestMeasurement?.presence ?"text-sky-400" :"text-white/60")} />} 
 label="Presencia" 
 value={selectedSensor.latestMeasurement?.presence ?"Si" :"No"} 
 />
 </div>

 {/* Chart Section */}
 <div className="space-y-4 pt-4 border-t border-slate-800">
 <div className="text-center mb-6">
 <h3 className="text-[10px] font-bold text-white mb-3">
 VARIACIÓN DE TEMPERATURA AMBIENTE
 </h3>
 <div className="flex justify-center flex-wrap gap-4 text-[9px] font-bold text-white">
 <div className="flex items-center gap-1.5">
 <div className="w-4 h-2 rounded-sm bg-[#526d82]"></div>
 <span>FRIO &lt;18°C</span>
 </div>
 <div className="flex items-center gap-1.5">
 <div className="w-4 h-2 rounded-sm bg-[#4a7c59]"></div>
 <span>CONFORT 18-27°C</span>
 </div>
 <div className="flex items-center gap-1.5">
 <div className="w-4 h-2 rounded-sm bg-[#9a4545]"></div>
 <span>CALOR &gt;27°C</span>
 </div>
 </div>
 </div>
 
 <div className="h-64 bg-slate-950/50 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center p-2">
 {loading ? (
 <Loader2 size={24} className="animate-spin text-slate-700" />
 ) : history.length > 0 ? (() => {
 const dataValues = history.map((h: HistoryItem) => h.value).filter(v => v !== null && v !== undefined);
 const currentMax = Math.max(...dataValues, 30) + 2;
 const currentMin = Math.min(...dataValues, 15) - 2;

 return (
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#ffffff" strokeOpacity={0.1} />
 <XAxis 
 dataKey="time" 
 fontSize={9} 
 tick={{fill: '#ffffff'}} 
 axisLine={{stroke: '#ffffff', strokeOpacity: 0.3}} 
 tickLine={{stroke: '#ffffff', strokeOpacity: 0.3}}
 />
 <YAxis 
 fontSize={9} 
 tick={{fill: '#ffffff'}}
 axisLine={{stroke: '#ffffff', strokeOpacity: 0.3}} 
 tickLine={{stroke: '#ffffff', strokeOpacity: 0.3}}
 domain={[currentMin, currentMax]}
 />
 <Tooltip 
 contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px', color: '#f8fafc'}}
 itemStyle={{color: '#fff'}}
 />

 <ReferenceArea y1={27} y2={currentMax} fill="#9a4545" fillOpacity={0.6} />
 <ReferenceArea y1={18} y2={27} fill="#4a7c59" fillOpacity={0.4} />
 <ReferenceArea y1={currentMin} y2={18} fill="#526d82" fillOpacity={0.6} />

 <Area 
 type="monotone" 
 dataKey="value" 
 stroke="#ffffff" 
 strokeWidth={2}
 fill="transparent" 
 dot={false}
 activeDot={{ r: 4, fill: '#ffffff', strokeWidth: 0 }}
 />
 </AreaChart>
 </ResponsiveContainer>
 );
 })() : (
 <div className="text-[10px] text-white/40 font-mono">SIN DATOS SUFICIENTES (24H)</div>
 )}
 </div>
 </div>

 {/* Technical Details */}
 <div className="space-y-3">
 <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-white font-bold text-[10px]">
                  <Signal size={14} className={cn(
                    lq.level === 'EXCELENTE' ? 'text-emerald-500' :
                    lq.level === 'BUENA' ? 'text-sky-500' :
                    lq.level === 'REGULAR' ? 'text-amber-500' :
                    'text-rose-500'
                  )} />
                  Calidad del Enlace
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border",
                  lq.level === 'EXCELENTE' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' :
                  lq.level === 'BUENA' ? 'text-sky-500 border-sky-500/20 bg-sky-500/10' :
                  lq.level === 'REGULAR' ? 'text-amber-500 border-amber-500/20 bg-amber-500/10' :
                  'text-rose-500 border-rose-500/20 bg-rose-500/10'
                )}>
                  {lq.score}% — {lq.level.charAt(0).toUpperCase() + lq.level.slice(1).toLowerCase()}
                </div>
              </div>
 <div className="flex justify-between items-center text-[11px]">
 <span className="text-white/60 font-medium tracking-wide">Identificador (DevEUI)</span>
 <span className="text-sky-400 font-mono font-bold">{selectedSensor.devEui ||"N/A"}</span>
 </div>
 <div className="flex justify-between items-center text-[11px]">
 <span className="text-white/60 font-medium tracking-wide">Gateway</span>
 <span className="text-white/80 font-mono font-bold">{selectedSensor.gatewayId ||"N/A"}</span>
 </div>
 </div>

 <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 flex justify-between items-center">
 <div className="flex items-center gap-2 text-white font-bold text-[10px]">
 <Battery size={14} className="text-emerald-500" />
 Batería
 </div>
 <div className="text-emerald-500 font-mono font-bold text-xs">
 {selectedSensor.latestMeasurement?.battery || 0}%
 </div>
 </div>
 </div>

 {selectedSensor.latitude && selectedSensor.longitude && (
 <a 
 href={`https://maps.google.com/?q=${selectedSensor.latitude},${selectedSensor.longitude}`}
 target="_blank"
 className="flex items-center justify-center gap-2 p-4 w-full bg-slate-950 border border-slate-800 hover:bg-slate-800 rounded-2xl transition-all group font-bold text-xs text-sky-400 mt-2"
 >
 <ExternalLink size={14} className="group-hover:rotate-12 transition-transform" />
 UBICACIÓN EXACTA (GOOGLE MAPS)
 </a>
 )}
 </div>
 );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
 return (
 <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 group hover:border-sky-500/30 transition-colors">
 <div className="flex items-center gap-2 text-slate-200 mb-2">
 {icon}
 <span className="text-[10px] font-bold">{label}</span>
 </div>
 <div className="text-xl font-mono text-white group-hover:text-sky-400 transition-colors">{value}</div>
 </div>
 );
}
