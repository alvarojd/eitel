import React from 'react';
import { SensorData } from '../../types';
import { Cpu, Battery, Signal, Clock, Calendar } from 'lucide-react';
import { STATUS_COLORS, STATUS_LABELS } from '../../constants';
import StatusFilterBar from '../common/StatusFilterBar';
import { filterSensors } from '../../utils/sensorFilters';

interface DeviceListProps {
    sensors: SensorData[];
    onSensorSelect: (sensor: SensorData) => void;
    activeTab?: string;
}

const DeviceList: React.FC<DeviceListProps> = ({ sensors, onSensorSelect, activeTab }) => {
    const [filter, setFilter] = React.useState<string>('all');
    const isAlertsView = activeTab === 'alertas';

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
                                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase shrink-0 ml-2 ${STATUS_COLORS[sensor.estado_id] === '#22c55e' ? 'bg-emerald-500/20 text-emerald-400' :
                                    STATUS_COLORS[sensor.estado_id] === '#ef4444' ? 'bg-rose-500/20 text-rose-400' :
                                        STATUS_COLORS[sensor.estado_id] === '#f97316' ? 'bg-orange-500/20 text-orange-400' :
                                            'bg-slate-500/20 text-slate-400'
                                    }`}>
                                    {STATUS_LABELS[sensor.estado_id]}
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
