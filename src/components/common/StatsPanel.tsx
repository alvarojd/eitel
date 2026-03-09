import React from 'react';
import { Stats } from '../../types';
import { STATUS_BG_COLORS } from '../../constants';
import { AlertOctagon, AlertTriangle, CheckCircle, BatteryWarning, WifiOff, UserX } from 'lucide-react';

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
  <div className="flex items-center p-3 lg:p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-lg min-w-[140px] lg:min-w-[200px] flex-1">
    <div className={`p-2 lg:p-3 rounded-md ${bgClass} bg-opacity-20 mr-3 lg:mr-4 ${textClass}`}>
      <div className={`p-1 lg:p-2 rounded ${bgClass}`}>
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      </div>
    </div>
    <div>
      <div className="text-xl lg:text-3xl font-bold text-white leading-none">{count}</div>
      <div className="text-[10px] lg:text-xs font-bold text-slate-100 tracking-wider mt-1">{label}</div>
      <div className="text-[10px] lg:text-xs text-slate-400 mt-0.5 hidden sm:block">{subtext}</div>
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
        bgClass={STATUS_BG_COLORS[9]}
      />
      <StatCard
        label="Riesgo / Aviso"
        count={stats.warning}
        subtext="Moho, Aire o Frío"
        icon={<AlertTriangle size={24} />}
        bgClass={STATUS_BG_COLORS[5]}
      />
      <StatCard
        label="Crítico"
        count={stats.critical}
        subtext="Salud / Emergencia"
        icon={<AlertOctagon size={24} />}
        bgClass={STATUS_BG_COLORS[2]}
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
        label="Ausencia Prolongada"
        count={stats.absenceCount}
        subtext="Sin presencia 48h+"
        icon={<UserX size={24} />}
        bgClass="bg-indigo-500"
        textClass="text-indigo-400"
      />
      <StatCard
        label="Desconectados"
        count={stats.offline}
        subtext="Sin señal 2h+"
        icon={<WifiOff size={24} />}
        bgClass={STATUS_BG_COLORS[1]}
      />
    </div>
  );
};

export default StatsPanel;