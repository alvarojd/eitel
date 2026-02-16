import React from 'react';
import { Database, PlayCircle, ShieldCheck, AlertCircle } from 'lucide-react';

interface SettingsPanelProps {
    useSimulatedData: boolean;
    onToggleSimulatedData: (value: boolean) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ useSimulatedData, onToggleSimulatedData }) => {
    return (
        <div className="h-full bg-slate-800 flex flex-col border-l border-slate-700 shadow-2xl w-full">
            <div className="p-6 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Database size={18} className="text-sky-500" />
                    Configuración Global
                </h2>
                <p className="text-sm text-slate-400 mt-1">Gestión de origen de datos</p>
            </div>

            <div className="p-6 space-y-6">
                <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Modo de Operación</h3>

                    <div
                        onClick={() => onToggleSimulatedData(false)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${!useSimulatedData
                                ? 'bg-sky-500/10 border-sky-500 shadow-lg shadow-sky-900/20'
                                : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-white font-medium">
                                <ShieldCheck size={18} className={!useSimulatedData ? 'text-sky-400' : 'text-slate-500'} />
                                Datos Reales
                            </div>
                            {!useSimulatedData && <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></div>}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Conexión directa a la Base de Datos Vercel y TTN. Muestra información real de los sensores desplegados.
                        </p>
                    </div>

                    <div
                        onClick={() => onToggleSimulatedData(true)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${useSimulatedData
                                ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-900/20'
                                : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-white font-medium">
                                <PlayCircle size={18} className={useSimulatedData ? 'text-amber-400' : 'text-slate-500'} />
                                Simulación
                            </div>
                            {useSimulatedData && <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Genera datos ambientales aleatorios para pruebas de interfaz y demostraciones sin hardware real.
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-700 space-y-3">
                    <div className="flex items-start gap-2 text-xs text-slate-400 italic">
                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                        <span>El cambio de origen de datos reiniciará la visualización del mapa.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
