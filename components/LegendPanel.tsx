import React from 'react';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';
import { SensorStatus } from '../types';
import { BatteryWarning } from 'lucide-react';

const LegendItem = ({ color, label, desc }: { color: string, label: string, desc: string }) => (
    <div className="flex items-start mb-3 p-2.5 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer group">
        <div className="mt-1">
             <div className="w-3 h-3 rounded-full shadow-[0_0_8px] shadow-current" style={{ backgroundColor: color }}></div>
        </div>
        <div className="ml-3 flex-1">
            <div className="text-sm font-medium text-slate-200 group-hover:text-white leading-tight">{label}</div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">{desc}</div>
        </div>
    </div>
);

const LegendPanel = () => {
  return (
    <div className="h-full flex flex-col p-4 bg-slate-800 overflow-y-auto custom-scrollbar">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 mt-1">Estados del Sensor</h3>
        
        <div className="mb-6 space-y-1">
            {/* Red Group */}
            <LegendItem 
                color={STATUS_COLORS[SensorStatus.FRIO_SEVERO]} 
                label={STATUS_LABELS[SensorStatus.FRIO_SEVERO]} 
                desc="Temp < 16°C (Riesgo salud)" 
            />
            <LegendItem 
                color={STATUS_COLORS[SensorStatus.CALOR_EXTREMO]} 
                label={STATUS_LABELS[SensorStatus.CALOR_EXTREMO]} 
                desc="Temp > 30°C (Golpe calor)" 
            />

            {/* Orange Group */}
            <LegendItem 
                color={STATUS_COLORS[SensorStatus.RIESGO_MOHO]} 
                label={STATUS_LABELS[SensorStatus.RIESGO_MOHO]} 
                desc="T < 18°C + Hum > 80%" 
            />
            <LegendItem 
                color={STATUS_COLORS[SensorStatus.AIRE_VICIADO]} 
                label={STATUS_LABELS[SensorStatus.AIRE_VICIADO]} 
                desc="CO2 > 1000 ppm" 
            />

            {/* Green Group */}
            <LegendItem 
                color={STATUS_COLORS[SensorStatus.IDEAL]} 
                label={STATUS_LABELS[SensorStatus.IDEAL]} 
                desc="Temp adecuada + CO2 bajo" 
            />

             {/* Gray Group */}
             <LegendItem 
                color={STATUS_COLORS[SensorStatus.DESCONECTADO]} 
                label={STATUS_LABELS[SensorStatus.DESCONECTADO]} 
                desc="Sin señal reciente" 
            />
        </div>

        <div className="border-t border-slate-700 my-4 pt-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Indicadores Superpuestos</h3>
             <div className="flex items-center p-2.5 rounded-lg bg-slate-900/50 border border-slate-700/50">
                  <div className="bg-red-100 p-1 rounded">
                      <BatteryWarning size={16} className="text-red-600"/>
                  </div>
                  <div className="ml-3">
                      <div className="text-sm font-medium text-slate-200">Batería Baja</div>
                      <div className="text-[11px] text-slate-500">Aparece sobre el hexágono si &lt; 20%</div>
                  </div>
             </div>
        </div>

        <div className="border-t border-slate-700 my-2 pt-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Estadísticas Rápidas</h3>
             <div className="text-xs text-slate-400 space-y-2">
                 <p>Total Nodos: <span className="text-white font-mono float-right">156</span></p>
                 <p>Uptime: <span className="text-green-400 font-mono float-right">99.8%</span></p>
                 <p>Temp Prom: <span className="text-white font-mono float-right">21.4°C</span></p>
             </div>
        </div>
    </div>
  );
};

export default LegendPanel;