import React from 'react';
import { SensorData } from '../../types';
import { Cpu, Battery, Signal, Clock } from 'lucide-react';
import { STATUS_COLORS, STATUS_LABELS } from '../../constants';
import StatusFilterBar from '../common/StatusFilterBar';
import { filterSensors } from '../../utils/sensorFilters';
import { calculateLinkQuality } from '../../utils/linkQuality';

interface DeviceListProps {
    sensors: SensorData[];
    onSensorSelect: (sensor: SensorData) => void;
    activeTab?: string;
}

const DeviceList: React.FC<DeviceListProps> = ({ sensors, onSensorSelect }) => {
    const [filter, setFilter] = React.useState<string>('all');

    const filteredSensors = filterSensors(sensors, filter);

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <StatusFilterBar activeFilter={filter} onFilterChange={setFilter} />

            <div className="flex-1 overflow-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSensors.map(sensor => (
                        <div
                            key={sensor.id}
                            onClick={() => onSensorSelect(sensor)}
                            className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl hover:border-sky-500/50 hover:bg-slate-800 transition-all cursor-pointer group"
                        >
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`p-2 rounded-lg shrink-0 ${STATUS_COLORS[sensor.estado_id] === '#22c55e' ? 'bg-emerald-500/10 text-emerald-500' :
                                            STATUS_COLORS[sensor.estado_id] === '#ef4444' ? 'bg-rose-500/10 text-rose-500' :
                                                STATUS_COLORS[sensor.estado_id] === '#f97316' ? 'bg-orange-500/10 text-orange-500' :
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
                                </div>
                                <div className={`inline-flex self-start px-2.5 py-1 rounded text-[10px] font-bold uppercase ${STATUS_COLORS[sensor.estado_id] === '#22c55e' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                                    STATUS_COLORS[sensor.estado_id] === '#ef4444' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' :
                                        STATUS_COLORS[sensor.estado_id] === '#f97316' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' :
                                            'bg-slate-500/20 text-slate-400 border border-slate-500/20'
                                    }`}>
                                    {STATUS_LABELS[sensor.estado_id]}
                                </div>
                            </div>
                            
                            {/* Technical Details */}
                            <div className="mt-4 bg-slate-900/80 rounded-lg p-3 text-xs font-mono text-slate-400 border border-slate-700 shadow-inner">
                                {(() => {
                                    const lq = calculateLinkQuality(sensor.rssi, sensor.snr);
                                    return (
                                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-700/50">
                                            <span className="text-slate-300 font-sans tracking-wide uppercase font-bold text-[10px] flex items-center gap-1.5"><Signal size={12} className={lq.textColor}/> Calidad Enlace</span>
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-slate-800 border overflow-hidden whitespace-nowrap overflow-ellipsis ${lq.textColor} border-[currentColor] border-opacity-30`}>
                                                {lq.score}% - {lq.label}
                                            </span>
                                        </div>
                                    );
                                })()}
                                <div className="flex justify-between mb-2">
                                    <span className="flex items-center gap-1"><Battery size={12} className="text-slate-500" /> Batería</span>
                                    <span className={sensor.battery > 20 ? "text-emerald-400" : "text-rose-400"}>
                                        {sensor.battery}%
                                    </span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span>RSSI (Señal)</span>
                                    <span className={sensor.rssi > -80 ? "text-emerald-400" : "text-yellow-400"}>
                                        {sensor.rssi} dBm
                                    </span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span>SNR (Ruido)</span>
                                    <span className={(sensor.snr || 0) > 0 ? "text-emerald-400" : "text-rose-400"}>
                                        {sensor.snr || 0} dB
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Gateway</span>
                                    <span className="text-sky-400 truncate max-w-[100px]" title={sensor.gatewayId || 'Desconocido'}>{sensor.gatewayId || 'Desconocido'}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs">
                                <div className="text-slate-500 flex items-center gap-1">
                                    <Clock size={12} /> {sensor.lastSeen}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DeviceList;
