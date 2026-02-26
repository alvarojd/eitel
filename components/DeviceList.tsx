import React from 'react';
import { SensorData, SensorStatus } from '../types';
import { Cpu, Battery, Signal, Clock, Calendar } from 'lucide-react';
import { STATUS_COLORS } from '../constants';

interface DeviceListProps {
    sensors: SensorData[];
    onSensorSelect: (sensor: SensorData) => void;
    activeTab?: string;
}

const DeviceList: React.FC<DeviceListProps> = ({ sensors, onSensorSelect, activeTab }) => {
    const [filter, setFilter] = React.useState<string>('all');
    const isAlertsView = activeTab === 'alertas';

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Desconocido';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusType = (status: SensorStatus, indicators?: any) => {
        if (filter === 'bateria_baja' && indicators?.lowBattery) return 'bateria_baja';
        if (filter === 'ausencia' && indicators?.longTermNoOccupancy) return 'ausencia';

        if ([SensorStatus.FRIO_SEVERO, SensorStatus.CALOR_EXTREMO, SensorStatus.ATMOSFERA_NOCIVA].includes(status)) return 'critico';
        if ([SensorStatus.RIESGO_MOHO, SensorStatus.AIRE_VICIADO, SensorStatus.FRIO_MODERADO, SensorStatus.AIRE_SECO].includes(status)) return 'riesgo';
        if (status === SensorStatus.IDEAL) return 'ideal';
        if (status === SensorStatus.DESCONECTADO) return 'desconectado';
        return 'all';
    };

    const filteredSensors = sensors.filter(sensor => {
        if (filter === 'all') return true;
        if (filter === 'bateria_baja') return sensor.indicators?.lowBattery;
        if (filter === 'ausencia') return sensor.indicators?.longTermNoOccupancy;
        return getStatusType(sensor.status) === filter;
    });

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-700/50 flex gap-2 overflow-x-auto no-scrollbar bg-slate-900/10">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${filter === 'all' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    Todos
                </button>
                <button
                    onClick={() => setFilter('critico')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${filter === 'critico' ? 'bg-rose-600 text-white' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'}`}
                >
                    Crítico
                </button>
                <button
                    onClick={() => setFilter('riesgo')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${filter === 'riesgo' ? 'bg-orange-600 text-white' : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'}`}
                >
                    Riesgo / Aviso
                </button>
                <button
                    onClick={() => setFilter('ideal')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${filter === 'ideal' ? 'bg-emerald-600 text-white' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
                >
                    Situación Ideal
                </button>
                <button
                    onClick={() => setFilter('bateria_baja')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${filter === 'bateria_baja' ? 'bg-blue-600 text-white' : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'}`}
                >
                    Batería Baja
                </button>
                <button
                    onClick={() => setFilter('ausencia')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${filter === 'ausencia' ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    Ausencia Prolongada
                </button>
                <button
                    onClick={() => setFilter('desconectado')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${filter === 'desconectado' ? 'bg-slate-600 text-white' : 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20'}`}
                >
                    Desconectado
                </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSensors.map(sensor => (
                        <div
                            key={sensor.id}
                            onClick={() => onSensorSelect(sensor)}
                            className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl hover:border-sky-500/50 hover:bg-slate-800 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`p-2 rounded-lg shrink-0 ${STATUS_COLORS[sensor.status] === '#22c55e' ? 'bg-emerald-500/10 text-emerald-500' :
                                        STATUS_COLORS[sensor.status] === '#ef4444' ? 'bg-rose-500/10 text-rose-500' :
                                            STATUS_COLORS[sensor.status] === '#f97316' ? 'bg-orange-500/10 text-orange-500' :
                                                'bg-slate-500/10 text-slate-500'
                                        }`}>
                                        <Cpu size={20} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="text-white font-bold group-hover:text-sky-400 transition-colors truncate">
                                            {sensor.name || sensor.id}
                                        </h3>
                                        <p className="text-[10px] text-slate-500 font-mono truncate">
                                            {sensor.devEui || sensor.id}
                                        </p>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase shrink-0 ml-2 ${STATUS_COLORS[sensor.status] === '#22c55e' ? 'bg-emerald-500/20 text-emerald-400' :
                                    STATUS_COLORS[sensor.status] === '#ef4444' ? 'bg-rose-500/20 text-rose-400' :
                                        STATUS_COLORS[sensor.status] === '#f97316' ? 'bg-orange-500/20 text-orange-400' :
                                            'bg-slate-500/20 text-slate-400'
                                    }`}>
                                    {sensor.status.replace(/_/g, ' ')}
                                </div>
                            </div>

                            {!isAlertsView && (
                                <>
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                                            <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                                <Battery size={12} /> Batería
                                            </div>
                                            <div className="text-white font-semibold">{sensor.battery}%</div>
                                        </div>
                                        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                                            <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                                <Signal size={12} /> Señal
                                            </div>
                                            <div className="text-white font-semibold">{sensor.rssi} dBm</div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs">
                                        <div className="text-slate-500 flex items-center gap-1">
                                            <Clock size={12} /> {sensor.lastSeen}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DeviceList;
