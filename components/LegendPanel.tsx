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
            <h3 className="text-xs font-bold text-slate-400 tracking-widest mb-4 mt-1">Estados del Sensor</h3>

            <div className="mb-6 space-y-1">
                {/* Red Group */}
                <h4 className="text-[10px] font-bold text-rose-500/80 px-2.5 mb-2 mt-4">Crítico (Pobreza/Salud)</h4>
                <LegendItem
                    color={STATUS_COLORS[SensorStatus.FRIO_SEVERO]}
                    label={STATUS_LABELS[SensorStatus.FRIO_SEVERO]}
                    desc="T < 16°C + Presencia 1h"
                />
                <LegendItem
                    color={STATUS_COLORS[SensorStatus.CALOR_EXTREMO]}
                    label={STATUS_LABELS[SensorStatus.CALOR_EXTREMO]}
                    desc="T > 27°C + Presencia 1h"
                />
                <LegendItem
                    color={STATUS_COLORS[SensorStatus.ATMOSFERA_NOCIVA]}
                    label={STATUS_LABELS[SensorStatus.ATMOSFERA_NOCIVA]}
                    desc="CO2 > 1500 ppm + Presencia 2h"
                />

                {/* Orange Group */}
                <h4 className="text-[10px] font-bold text-orange-500/80 px-2.5 mb-2 mt-4">Riesgo / Aviso</h4>
                <LegendItem
                    color={STATUS_COLORS[SensorStatus.RIESGO_MOHO]}
                    label={STATUS_LABELS[SensorStatus.RIESGO_MOHO]}
                    desc="Hum > 70% por 24h continuas"
                />
                <LegendItem
                    color={STATUS_COLORS[SensorStatus.AIRE_VICIADO]}
                    label={STATUS_LABELS[SensorStatus.AIRE_VICIADO]}
                    desc="CO2 > 1000 + T < 18 + Presencia 2h"
                />
                <LegendItem
                    color={STATUS_COLORS[SensorStatus.FRIO_MODERADO]}
                    label={STATUS_LABELS[SensorStatus.FRIO_MODERADO]}
                    desc="T < 18°C (Pobreza leve)"
                />
                <LegendItem
                    color={STATUS_COLORS[SensorStatus.AIRE_SECO]}
                    label={STATUS_LABELS[SensorStatus.AIRE_SECO]}
                    desc="Hum < 30% + Presencia 1h"
                />

                {/* Green Group */}
                <h4 className="text-[10px] font-bold text-emerald-500/80 px-2.5 mb-2 mt-4">Ideal</h4>
                <LegendItem
                    color={STATUS_COLORS[SensorStatus.IDEAL]}
                    label={STATUS_LABELS[SensorStatus.IDEAL]}
                    desc="Condiciones óptimas"
                />

                {/* Gray Group */}
                <LegendItem
                    color={STATUS_COLORS[SensorStatus.DESCONECTADO]}
                    label={STATUS_LABELS[SensorStatus.DESCONECTADO]}
                    desc="Sin señal reciente"
                />
            </div>

            <div className="border-t border-slate-700 my-4 pt-4">
                <h3 className="text-xs font-bold text-slate-400 tracking-widest mb-3">Indicadores Superpuestos</h3>
                <div className="space-y-3">
                    <div className="flex items-center p-2.5 rounded-lg bg-slate-900/50 border border-slate-700/50">
                        <div className="bg-red-100 p-1 rounded">
                            <BatteryWarning size={16} className="text-red-600" />
                        </div>
                        <div className="ml-3">
                            <div className="text-sm font-medium text-slate-200">Batería Baja</div>
                            <div className="text-[11px] text-slate-500">Aparece si la carga es &lt; 20%</div>
                        </div>
                    </div>
                    <div className="flex items-center p-2.5 rounded-lg bg-slate-900/50 border border-slate-700/50">
                        <div className="bg-slate-100 p-1 rounded">
                            <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center relative overflow-hidden">
                                <div className="w-2 h-2 rounded-full bg-slate-400 absolute top-0.5"></div>
                                <div className="w-3 h-2 rounded-t-full bg-slate-400 absolute bottom-0"></div>
                                <div className="w-4 h-0.5 bg-red-500 rotate-45"></div>
                            </div>
                        </div>
                        <div className="ml-3">
                            <div className="text-sm font-medium text-slate-200">Ausencia Prolongada</div>
                            <div className="text-[11px] text-slate-500">Sin presencia por 48 horas</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-700 my-2 pt-4">
                <h3 className="text-xs font-bold text-slate-400 tracking-widest mb-3">Estadísticas Rápidas</h3>
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