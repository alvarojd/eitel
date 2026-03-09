import React from 'react';
import { Database, PlayCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { isLocalEnvironment } from '../../utils/environment';

const SettingsPanel: React.FC = () => {
    const isLocal = isLocalEnvironment();

    return (
        <div className="h-full bg-slate-800 flex flex-col border-l border-slate-700 shadow-2xl w-full">
            <div className="p-6 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Database size={18} className="text-sky-500" />
                    Estado del Sistema
                </h2>
                <p className="text-sm text-slate-400 mt-1">Conexión y Origen de Datos</p>
            </div>

            <div className="p-6 space-y-6">
                <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Entorno de Ejecución</h3>

                    <div className="p-4 rounded-xl border bg-slate-900/50 border-slate-700 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-white font-medium">
                                {isLocal ? (
                                    <PlayCircle size={18} className="text-amber-400" />
                                ) : (
                                    <ShieldCheck size={18} className="text-emerald-400" />
                                )}
                                {isLocal ? 'Modo Desarrollo' : 'Modo Producción'}
                            </div>
                            <div className={`w-2 h-2 rounded-full animate-pulse ${isLocal ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                            {isLocal
                                ? 'Ejecución en entorno local detectada. Mostrando flujo de datos simulado para pruebas de desarrollo.'
                                : 'Conexión activa con Base de Datos Vercel y red TTN. Mostrando telemetría real de sensores.'}
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-700 space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase">Información de Conexión</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">API Gateway:</span>
                            <span className="text-slate-300">Vercel Serverless</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Database:</span>
                            <span className="text-slate-300">Postgres (Neon)</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Red:</span>
                            <span className="text-slate-300">The Things Network</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
