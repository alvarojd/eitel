import React from 'react';
import { SensorData } from '../types';
import { STATUS_TEXT_COLORS, STATUS_BG_COLORS, STATUS_LABELS } from '../constants';
import { Thermometer, Droplets, UserCheck, Signal, Wind, X, MapPin, Clock, Loader2, ExternalLink } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchSensorHistory } from '../services/ttnService';

interface SensorDetailProps {
  sensor: SensorData | null;
  isSimulated: boolean;
  onClose: () => void;
}

const generateHistory = (baseTemp: number) => {
  const data = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() - (23 - i) * 3600000);
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: parseFloat((baseTemp + (Math.random() * 2 - 1)).toFixed(1))
    });
  }
  return data;
};

const SensorDetail: React.FC<SensorDetailProps> = ({ sensor, isSimulated, onClose }) => {
  const [historyData, setHistoryData] = React.useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = React.useState(false);

  React.useEffect(() => {
    if (sensor) {
      if (isSimulated) {
        setHistoryData(generateHistory(sensor.temperature));
      } else {
        const loadHistory = async () => {
          setLoadingHistory(true);
          try {
            const history = await fetchSensorHistory(sensor.id);
            setHistoryData(Array.isArray(history) ? history : []);
          } catch (error) {
            console.error("Error loading history:", error);
            setHistoryData([]);
          } finally {
            setLoadingHistory(false);
          }
        };
        loadHistory();
      }
    } else {
      setHistoryData([]);
    }
  }, [sensor, isSimulated]);

  if (!sensor) return null;

  return (
    <div className="h-full bg-slate-800 flex flex-col shadow-2xl w-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin size={18} className="text-slate-400" />
            {sensor.name}
          </h2>
          <p className="text-sm text-slate-400 mt-1">{sensor.devEui || sensor.id}</p>
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
          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Temperatura (24h)</h3>
          <div className="h-48 w-full bg-slate-900/30 rounded-xl border border-slate-700/30 flex items-center justify-center overflow-hidden">
            {loadingHistory ? (
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs">Cargando historial...</span>
              </div>
            ) : historyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    dot={{ r: 3, fill: '#0ea5e9', strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-xs text-center px-4">
                {isSimulated ? 'Generando datos...' : 'Sin datos registrados en las últ. 24h'}
              </div>
            )}
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
            <span>Gateway</span>
            <span className="text-sky-400">{sensor.gatewayId || 'Desconocido'}</span>
          </div>
          {sensor.latitude && sensor.longitude && (
            <>
              <div className="flex justify-between mb-2">
                <span>Latitud</span>
                <span className="text-slate-200">{sensor.latitude}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Longitud</span>
                <span className="text-slate-200">{sensor.longitude}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <a
                  href={`https://www.google.com/maps?q=${sensor.latitude},${sensor.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded border border-sky-500/20 transition-colors text-[10px] uppercase font-bold tracking-wider"
                >
                  <ExternalLink size={12} />
                  Ver en Google Maps
                </a>
              </div>
            </>
          )}
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