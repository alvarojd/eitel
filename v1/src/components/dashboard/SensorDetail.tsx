import React from 'react';
import { SensorData, HistoryDataPoint } from '../../types';
import { STATUS_TEXT_COLORS, STATUS_BG_COLORS, STATUS_LABELS } from '../../constants';
import { Thermometer, Droplets, UserCheck, Signal, Battery, Wind, X, MapPin, Clock, Loader2, ExternalLink, Save, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { fetchSensorHistory } from '../../services/ttnService';
import { useAuth } from '../auth/AuthContext';
import { calculateLinkQuality } from '../../utils/linkQuality';

interface SensorDetailProps {
  sensor: SensorData | null;
  onClose: () => void;
}

const SensorDetail: React.FC<SensorDetailProps> = ({ sensor, onClose }) => {
  const [historyData, setHistoryData] = React.useState<HistoryDataPoint[]>([]);
  const [loadingHistory, setLoadingHistory] = React.useState(false);

  React.useEffect(() => {
    if (sensor) {
      const loadHistory = async () => {
        setLoadingHistory(true);
        try {
          const history = await fetchSensorHistory(sensor.id);
          const formattedHistory = Array.isArray(history) ? history.map((item: any) => ({
            ...item,
            time: item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : item.time
          })) : [];
          setHistoryData(formattedHistory);
        } catch (error) {
          console.error("Error loading history:", error);
          setHistoryData([]);
        } finally {
          setLoadingHistory(false);
        }
      };
      loadHistory();
    } else {
      setHistoryData([]);
    }
  }, [sensor]);

  if (!sensor) return null;

  return (
    <div className="h-full bg-slate-800 flex flex-col shadow-2xl w-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 flex justify-between items-start">
        <div className="flex-1 mr-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin size={18} className="text-slate-400" />
            {sensor.name}
          </h2>
          <p className="text-sm text-slate-400 mt-1">{sensor.devEui || sensor.id}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors border border-slate-700 p-1.5 rounded-lg hover:bg-slate-700">
          <X size={24} />
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        {/* Status Badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-slate-900 border ${STATUS_TEXT_COLORS[sensor.estado_id]} border-opacity-30`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${STATUS_BG_COLORS[sensor.estado_id]}`}></span>
            {STATUS_LABELS[sensor.estado_id]}
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
              <span className="text-xs">Temp</span>
            </div>
            <div className="text-2xl font-mono text-white">{sensor.temperature}°C</div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Droplets size={16} />
              <span className="text-xs">Humedad</span>
            </div>
            <div className="text-2xl font-mono text-white">{sensor.humidity}%</div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Wind size={16} />
              <span className="text-xs">CO2</span>
            </div>
            <div className="text-2xl font-mono text-white">{sensor.co2} ppm</div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <UserCheck size={16} />
              <span className="text-xs">Presencia</span>
            </div>
            <div className="text-2xl font-mono text-white">{sensor.presence ? 'Si' : 'No'}</div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="mb-6">
          <div className="text-center mb-6">
            <h3 className="text-sm font-semibold text-slate-100 mb-3 tracking-widest uppercase">
              VARIACIÓN DE TEMPERATURA AMBIENTE
            </h3>
            <div className="flex justify-center flex-wrap gap-4 text-[10px] font-medium text-slate-300">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-2 rounded-sm bg-[#526d82]"></div>
                <span>FRIO &lt;18°C</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-2 rounded-sm bg-[#4a7c59]"></div>
                <span>CONFORT 18-27°C</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-2 rounded-sm bg-[#9a4545]"></div>
                <span>CALOR &gt;27°C</span>
              </div>
            </div>
          </div>

          <div
            className="h-64 w-full rounded-xl border border-slate-700/50 flex items-center justify-center overflow-hidden bg-slate-800"
          >
            {loadingHistory ? (
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs">Cargando historial...</span>
              </div>
            ) : historyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" vertical={true} strokeOpacity={0.15} />
                  <XAxis
                    dataKey="time"
                    stroke="#ffffff"
                    fontSize={10}
                    tickLine={true}
                    axisLine={true}
                    label={{ value: 'Eje del Tiempo', position: 'bottom', offset: 0, fill: '#ffffff', fontSize: 10, opacity: 0.8 }}
                  />
                  <YAxis
                    stroke="#ffffff"
                    fontSize={10}
                    tickLine={true}
                    axisLine={true}
                    domain={[15, 30]}
                    label={{ value: 'Temperatura °C', angle: -90, position: 'insideLeft', fill: '#ffffff', fontSize: 10, opacity: 0.8 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#ffffff' }}
                  />

                  <ReferenceArea y2={27} fill="#9a4545" fillOpacity={0.8} ifOverflow="extendDomain" />
                  <ReferenceArea y1={18} y2={27} fill="#4a7c59" fillOpacity={0.8} ifOverflow="extendDomain" />
                  <ReferenceArea y1={18} fill="#526d82" fillOpacity={0.8} ifOverflow="extendDomain" />


                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={2}
                    fill="none"
                    fillOpacity={0}
                    dot={false}
                    activeDot={{ r: 4, fill: '#ffffff', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-xs text-center px-4">
                Sin datos registrados en las últ. 24h
              </div>
            )}
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-slate-900/80 rounded-lg p-4 text-xs font-mono text-slate-400 border border-slate-700">
          {(() => {
            const lq = calculateLinkQuality(sensor.rssi, sensor.snr);
            return (
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 font-sans tracking-wide uppercase font-bold text-[10px] flex items-center gap-1.5"><Signal size={12} className={lq.textColor} /> Calidad del Enlace</span>
                <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold tracking-wider bg-slate-800 ${lq.textColor}`}>
                  {lq.score}% - {lq.label}
                </span>
              </div>
            );
          })()}
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
          <div className="flex justify-between mb-2">
            <span>Gateway</span>
            <span className="text-sky-400">{sensor.gatewayId || 'Desconocido'}</span>
          </div>
          <div className="border-t border-slate-700/50 my-2" />
          <div className="flex justify-between mb-2">
            <span>Latitud</span>
            <span className="text-slate-200">{sensor.latitude || '-'}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Longitud</span>
            <span className="text-slate-200">{sensor.longitude || '-'}</span>
          </div>

          {sensor.latitude && sensor.longitude && (
            <div className="mt-2">
              <a
                href={`https://www.google.com/maps?q=${sensor.latitude},${sensor.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded border border-sky-500/20 transition-colors text-[10px] font-bold tracking-wider"
              >
                <ExternalLink size={12} />
                Ver en Google Maps
              </a>
            </div>
          )}
          <div className="border-t border-slate-700/50 my-2" />
          <div className="flex justify-between">
            <span className="flex items-center gap-1"><Battery size={12} className="text-slate-500" /> Batería</span>
            <span className={sensor.battery > 20 ? "text-emerald-400" : "text-rose-400"}>
              {sensor.battery}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorDetail;
