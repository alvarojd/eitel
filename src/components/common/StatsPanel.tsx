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
  <div className="flex items-center p-2 lg:p-3 bg-slate-800 rounded-lg border border-slate-700 shadow-lg min-w-[120px] lg:min-w-[160px] flex-1">
    <div className={`p-1.5 lg:p-2 rounded-md ${bgClass} bg-opacity-20 mr-2 lg:mr-3 ${textClass}`}>
      <div className={`p-1 lg:p-1.5 rounded ${bgClass}`}>
        {React.cloneElement(icon as React.ReactElement, { size: 16 })}
      </div>
    </div>
    <div>
      <div className="text-lg lg:text-2xl font-bold text-white leading-none">{count}</div>
      <div className="text-[9px] lg:text-[11px] font-bold text-slate-100 tracking-wider mt-1 leading-tight">{label}</div>
      <div className="text-[8px] lg:text-[10px] text-slate-400 mt-0.5 hidden sm:block leading-tight">{subtext}</div>
    </div>
  </div>
);

const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  return (
    <div className="flex flex-wrap gap-3 w-full mb-4">
      <StatCard
        label="Situación Ideal"
        count={stats.ideal}
        subtext="Parámetros óptimos"
        icon={<CheckCircle size={20} />}
        bgClass={STATUS_BG_COLORS[9]}
      />
      <StatCard
        label="Riesgo / Aviso"
        count={stats.warning}
        subtext="Moho, Aire o Frío"
        icon={<AlertTriangle size={20} />}
        bgClass={STATUS_BG_COLORS[5]}
      />
      <StatCard
        label="Crítico"
        count={stats.critical}
        subtext="Salud / Emergencia"
        icon={<AlertOctagon size={20} />}
        bgClass={STATUS_BG_COLORS[2]}
      />
      <StatCard
        label="Batería Baja"
        count={stats.lowBattery}
        subtext="Requiere cambio < 20%"
        icon={<BatteryWarning size={20} />}
        bgClass="bg-blue-500"
        textClass="text-blue-500"
      />
      <StatCard
        label="Ausencia Prolongada"
        count={stats.absenceCount}
        subtext="Sin presencia 48h+"
        icon={<UserX size={20} />}
        bgClass="bg-indigo-500"
        textClass="text-indigo-400"
      />
      <StatCard
        label="Desconectados"
        count={stats.offline}
        subtext="Sin señal 2h+"
        icon={<WifiOff size={20} />}
        bgClass={STATUS_BG_COLORS[1]}
      />
    </div>
  );
};

export default StatsPanel;