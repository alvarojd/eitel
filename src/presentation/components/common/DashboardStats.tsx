'use client';

import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  BatteryLow, 
  UserX, 
  WifiOff 
} from 'lucide-react';
import { SensorState } from '@/core/entities/Sensor';

interface DashboardStatsProps {
  sensors: SensorState[];
}

export function DashboardStats({ sensors }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard 
        label="Situación Ideal" 
        value={sensors.filter(s => s.estadoId === 9).length} 
        icon={<CheckCircle2 size={18} />} 
        iconBg="bg-emerald-500/20 text-emerald-500" 
      />
      <StatCard 
        label="Riesgo / Aviso" 
        value={sensors.filter(s => [5,6,7,8].includes(s.estadoId)).length} 
        icon={<AlertTriangle size={18} />} 
        iconBg="bg-orange-500/20 text-orange-500" 
        color="text-orange-500"
      />
      <StatCard 
        label="Crítico" 
        value={sensors.filter(s => [2,3,4].includes(s.estadoId)).length} 
        icon={<AlertCircle size={18} />} 
        iconBg="bg-rose-500/20 text-rose-500" 
        color="text-rose-500"
      />
      <StatCard 
        label="Batería Baja" 
        value={sensors.filter(s => s.indicators?.lowBattery).length} 
        icon={<BatteryLow size={18} />} 
        iconBg="bg-blue-500/20 text-blue-500" 
        color="text-blue-500"
      />
      <StatCard 
        label="Ausencia Prolongada" 
        value={sensors.filter(s => s.indicators?.longTermNoOccupancy).length} 
        icon={<UserX size={18} />} 
        iconBg="bg-indigo-500/20 text-indigo-500" 
        color="text-indigo-500"
      />
      <StatCard 
        label="Desconectado" 
        value={sensors.filter(s => s.estadoId === 1).length} 
        icon={<WifiOff size={18} />} 
        iconBg="bg-slate-500/20 text-white/80" 
        color="text-white/80"
      />
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon, 
  iconBg, 
  color = "text-white" 
}: { 
  label: string, 
  value: string | number, 
  icon: React.ReactNode, 
  iconBg: string, 
  color?: string 
}) {
  return (
    <div className="bg-slate-900/40 border border-slate-800/60 p-3.5 rounded-xl shadow-lg hover:bg-slate-900/60 transition-all duration-300 group flex items-center gap-4 min-w-0">
      <div className={`p-2.5 rounded-lg ${iconBg} transition-transform group-hover:scale-110 duration-300 shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className={`text-2xl font-mono font-bold ${color} `}>
          {value}
        </div>
        <div className="text-[10px] font-bold text-white/80 leading-tight mt-1">
          {label}
        </div>
      </div>
    </div>
  );
}
