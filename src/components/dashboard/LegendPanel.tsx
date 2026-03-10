import { STATUS_LABELS, STATUS_COLORS } from '../../constants';
import { Stats } from '../../types';

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

const LegendPanel = ({ stats }: { stats: Stats }) => {
    return (
        <div className="h-full flex flex-col p-4 bg-slate-800 overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-bold text-slate-400 tracking-widest mb-4 mt-1">Estados del Sensor</h3>

            <div className="mb-6 space-y-1">
                {/* Red Group */}
                <h4 className="text-[10px] font-bold text-rose-500/80 px-2.5 mb-2 mt-4">Crítico (Pobreza/Salud)</h4>
                <LegendItem
                    color={STATUS_COLORS[2]}
                    label={STATUS_LABELS[2]}
                    desc="T < 16°C"
                />
                <LegendItem
                    color={STATUS_COLORS[3]}
                    label={STATUS_LABELS[3]}
                    desc="T > 27°C"
                />
                <LegendItem
                    color={STATUS_COLORS[4]}
                    label={STATUS_LABELS[4]}
                    desc="CO2 > 1500 ppm"
                />

                {/* Orange Group */}
                <h4 className="text-[10px] font-bold text-orange-500/80 px-2.5 mb-2 mt-4">Riesgo / Aviso</h4>
                <LegendItem
                    color={STATUS_COLORS[5]}
                    label={STATUS_LABELS[5]}
                    desc="Hum > 70%"
                />
                <LegendItem
                    color={STATUS_COLORS[6]}
                    label={STATUS_LABELS[6]}
                    desc="CO2 >= 1000 ppm"
                />
                <LegendItem
                    color={STATUS_COLORS[7]}
                    label={STATUS_LABELS[7]}
                    desc="T < 18°C"
                />
                <LegendItem
                    color={STATUS_COLORS[8]}
                    label={STATUS_LABELS[8]}
                    desc="Hum < 30%"
                />

                {/* Green Group */}
                <h4 className="text-[10px] font-bold text-emerald-500/80 px-2.5 mb-2 mt-4">Ideal</h4>
                <LegendItem
                    color={STATUS_COLORS[9]}
                    label={STATUS_LABELS[9]}
                    desc="Condiciones óptimas"
                />

                {/* Gray Group */}
                <LegendItem
                    color={STATUS_COLORS[1]}
                    label={STATUS_LABELS[1]}
                    desc="Sin señal en 2h"
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
                    <p>Nodos Activos: <span className="text-white font-mono float-right">{stats.total - stats.offline}/{stats.total}</span></p>
                    <p>Temp Prom: <span className="text-white font-mono float-right">{stats.avgTemp}°C</span></p>
                </div>
            </div>
        </div>
    );
};

export default LegendPanel;