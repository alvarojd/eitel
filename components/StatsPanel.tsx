import React from 'react';
import { Stats, SensorStatus } from '../types';
import { STATUS_BG_COLORS } from '../constants';
import { AlertOctagon, AlertTriangle, CheckCircle, BatteryWarning, WifiOff } from 'lucide-react';

interface StatsPanelProps {
  stats: Stats;
}

const StatCard: React.FC<{
  label: string;
  count: number;
  subtext: string;
  icon: React.ReactNode;
  bgClass: string;
  textClass?: string;
}> = ({ label, count, subtext, icon, bgClass, textClass = "text-white" }) => (
  <div className="flex items-center p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-lg min-w-[200px] flex-1">
    <div className={`p-3 rounded-md ${bgClass} bg-opacity-20 mr-4 ${textClass}`}>
      <div className={`p-2 rounded ${bgClass}`}>
         {icon}
      </div>
    </div>
    <div>
      <div className="text-3xl font-bold text-white leading-none">{count}</div>
      <div className="text-xs font-bold text-slate-100 uppercase tracking-wider mt-1">{label}</div>
      <div className="text-xs text-slate-400 mt-0.5">{subtext}</div>
    </div>
  </div>
);

const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  return (
    <div className="flex flex-wrap gap-4 w-full mb-6">
      <StatCard 
        label="Situación Ideal" 
        count={stats.ideal} 
        subtext="Parámetros óptimos"
        icon={<CheckCircle size={24} />}
        bgClass={STATUS_BG_COLORS[SensorStatus.IDEAL]}
      />
      <StatCard 
        label="Riesgo / Aviso" 
        count={stats.warning} 
        subtext="Moho o Aire Viciado"
        icon={<AlertTriangle size={24} />}
        bgClass={STATUS_BG_COLORS[SensorStatus.AIRE_VICIADO]}
      />
      <StatCard 
        label="Crítico" 
        count={stats.critical} 
        subtext="Frío/Calor Extremo"
        icon={<AlertOctagon size={24} />}
        bgClass={STATUS_BG_COLORS[SensorStatus.CALOR_EXTREMO]}
      />
      <StatCard 
        label="Batería Baja" 
        count={stats.lowBattery} 
        subtext="Requiere cambio < 20%"
        icon={<BatteryWarning size={24} />}
        bgClass="bg-blue-500"
        textClass="text-blue-500"
      />
      <StatCard 
        label="Desconectados" 
        count={stats.offline} 
        subtext="Sin señal"
        icon={<WifiOff size={24} />}
        bgClass={STATUS_BG_COLORS[SensorStatus.DESCONECTADO]}
      />
    </div>
  );
};

export default StatsPanel;