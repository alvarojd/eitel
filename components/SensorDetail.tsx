import React from 'react';
import { SensorData } from '../types';
import { STATUS_TEXT_COLORS, STATUS_BG_COLORS, STATUS_LABELS } from '../constants';
import { Thermometer, Droplets, UserCheck, Signal, Wind, X, MapPin, Clock, BatteryWarning } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SensorDetailProps {
  sensor: SensorData | null;
  onClose: () => void;
}

const generateHistory = (baseTemp: number) => {
  const data = [];
  for (let i = 0; i < 12; i++) {
    // Generate values close to the actual base temperature
    data.push({
      time: `${i * 2}:00`,
      value: parseFloat((baseTemp + (Math.random() * 2 - 1)).toFixed(1))
    });
  }
  return data;
};

const SensorDetail: React.FC<SensorDetailProps> = ({ sensor, onClose }) => {
  if (!sensor) return null;

  const data = generateHistory(sensor.temperature);

  return (
    <div className="h-full bg-slate-800 flex flex-col border-l border-slate-700 shadow-2xl w-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin size={18} className="text-slate-400" />
            {sensor.name}
          </h2>
          <p className="text-sm text-slate-400 mt-1">{sensor.id}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        {/* Status Badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-900 border ${STATUS_TEXT_COLORS[sensor.status]} border-opacity-30`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${STATUS_BG_COLORS[sensor.status]}`}></span>
            {STATUS_LABELS[sensor.status]}
          </span>
          <div className="flex items-center mt-3 text-xs text-slate-500">
            <Clock size={12} className="mr-1" /> Visto: {sensor.lastSeen}
          </div>
        </div>


        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Thermometer size={16} />
              <span className="text-xs uppercase">Temp</span>
            </div>
            <div className="text-2xl font-mono text-white">{sensor.temperature}°C</div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Droplets size={16} />
              <span className="text-xs uppercase">Humedad</span>
            </div>
            <div className="text-2xl font-mono text-white">{sensor.humidity}%</div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Wind size={16} />
              <span className="text-xs uppercase">CO2</span>
            </div>
            <div className="text-2xl font-mono text-white">{sensor.co2} ppm</div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <UserCheck size={16} />
              <span className="text-xs uppercase">Presencia</span>
            </div>
            <div className="text-2xl font-mono text-white">{sensor.presence ? 'Si' : 'No'}</div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Tendencia Temperatura (24h)</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-slate-900/80 rounded-lg p-4 text-xs font-mono text-slate-400 border border-slate-700">
          <div className="flex justify-between mb-2">
            <span>RSSI (Señal)</span>
            <span className={sensor.rssi > -80 ? "text-green-400" : "text-yellow-400"}>
              {sensor.rssi} dBm <Signal size={10} className="inline ml-1" />
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Ubicación</span>
            <span className="text-slate-200">{sensor.location}</span>
          </div>
          <div className="flex justify-between">
            <span>Gateway</span>
            <span className="text-sky-400">TTN Gateway</span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition text-sm font-medium">
            Ver dispositivo en consola TTN
          </button>
        </div>
      </div>
    </div>
  );
};

export default SensorDetail;