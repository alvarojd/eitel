import React from 'react';
import { SensorData, HistoryDataPoint } from '../../types';
import { STATUS_TEXT_COLORS, STATUS_BG_COLORS, STATUS_LABELS } from '../../constants';
import { Thermometer, Droplets, UserCheck, Signal, Wind, X, MapPin, Clock, Loader2, ExternalLink, Save, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchSensorHistory } from '../../services/ttnService';
import { useAuth } from '../auth/AuthContext';

interface SensorDetailProps {
  sensor: SensorData | null;
  onClose: () => void;
}

const SensorDetail: React.FC<SensorDetailProps> = ({ sensor, onClose }) => {
  const [historyData, setHistoryData] = React.useState<HistoryDataPoint[]>([]);
  const [loadingHistory, setLoadingHistory] = React.useState(false);
  const { isAdmin, token } = useAuth();
  
  // Admin form state
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [editLat, setEditLat] = React.useState('');
  const [editLng, setEditLng] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [deleteHistoryOnly, setDeleteHistoryOnly] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  React.useEffect(() => {
    if (sensor) {
      setEditName(sensor.name);
      setEditLat(sensor.latitude?.toString() || '');
      setEditLng(sensor.longitude?.toString() || '');
      
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
    } else {
      setHistoryData([]);
    }
  }, [sensor]);

  if (!sensor) return null;

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/sensors', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          devEui: sensor.devEui,
          name: editName,
          latitude: editLat ? parseFloat(editLat) : null,
          longitude: editLng ? parseFloat(editLng) : null
        })
      });
      if (res.ok) {
        setIsEditing(false);
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (onlyHistory: boolean) => {
    if (!window.confirm(onlyHistory ? '¿Borrar historial?' : '¿Eliminar dispositivo permanentemente?')) return;
    
    setIsSaving(true);
    try {
      const res = await fetch(`/api/sensors?devEui=${encodeURIComponent(sensor.devEui || sensor.id)}&deleteHistoryOnly=${onlyHistory}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          devEui: sensor.devEui,
          deleteHistoryOnly: onlyHistory
        })
      });
      if (res.ok) {
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full bg-slate-800 flex flex-col shadow-2xl w-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 flex justify-between items-start">
        <div className="flex-1 mr-4">
          {isEditing ? (
            <input 
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold w-full focus:outline-none focus:border-sky-500"
            />
          ) : (
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin size={18} className="text-slate-400" />
              {sensor.name}
            </h2>
          )}
          <p className="text-sm text-slate-400 mt-1">{sensor.devEui || sensor.id}</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`p-1.5 rounded transition-colors ${isEditing ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              title="Editar dispositivo"
            >
              <Save size={18} />
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
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
          <h3 className="text-sm font-semibold text-slate-300 mb-4 tracking-wider">Temperatura (24h)</h3>
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
                Sin datos registrados en las últ. 24h
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
          <div className="flex justify-between mb-2">
             <span>Latitud</span>
             {isEditing ? (
               <input 
                 value={editLat}
                 onChange={e => setEditLat(e.target.value)}
                 className="bg-slate-800 border-none rounded px-1 text-slate-200 text-right w-24 focus:ring-1 focus:ring-sky-500"
               />
             ) : (
               <span className="text-slate-200">{sensor.latitude || '-'}</span>
             )}
          </div>
          <div className="flex justify-between mb-2">
             <span>Longitud</span>
             {isEditing ? (
               <input 
                 value={editLng}
                 onChange={e => setEditLng(e.target.value)}
                 className="bg-slate-800 border-none rounded px-1 text-slate-200 text-right w-24 focus:ring-1 focus:ring-sky-500"
               />
             ) : (
               <span className="text-slate-200">{sensor.longitude || '-'}</span>
             )}
          </div>
          
          {sensor.latitude && sensor.longitude && !isEditing && (
            <div className="mt-3 pt-3 border-t border-slate-700/50">
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

          {isEditing && (
             <button 
               onClick={handleUpdate}
               disabled={isSaving}
               className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold transition-all disabled:opacity-50"
             >
               {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
               Guardar Cambios
             </button>
          )}
        </div>

        {/* Admin Danger Zone */}
        {isAdmin && (
           <div className="mt-8 border-t border-slate-700 pt-6">
              <h3 className="text-xs font-bold text-red-500 tracking-widest mb-4 flex items-center gap-2">
                 <ShieldAlert size={14} /> Gestión de Dispositivo
              </h3>
              
              <div className="space-y-3">
                 <button 
                   onClick={() => handleDelete(true)}
                   className="flex items-center justify-center gap-2 w-full py-2 border border-slate-700 text-slate-300 hover:bg-slate-700/50 rounded text-xs transition-colors"
                 >
                    <Trash2 size={12} /> Borrar Historial de Mediciones
                 </button>

                 <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <p className="text-[10px] text-red-400/80 mb-3 leading-relaxed flex items-start gap-2">
                       <AlertTriangle size={14} className="shrink-0 text-red-500" />
                       <span>
                         <strong>Importante:</strong> Para evitar que el dispositivo se vuelva a registrar, debe ser eliminado también en la <a href="https://eu1.cloud.thethings.network/" target="_blank" rel="noreferrer" className="underline font-bold">Consola de TTN</a>.
                       </span>
                    </p>
                    
                    <div className="flex items-center gap-2 mb-3">
                       <input 
                         type="checkbox" 
                         id="delHist" 
                         checked={deleteHistoryOnly}
                         onChange={e => setDeleteHistoryOnly(e.target.checked)}
                         className="rounded bg-slate-900 border-slate-700 text-red-500 focus:ring-red-500/50"
                       />
                       <label htmlFor="delHist" className="text-[10px] text-slate-400 cursor-pointer">Borrar también datos históricos</label>
                    </div>

                    <button 
                      onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                      className="flex items-center justify-center gap-2 w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-xs border border-red-500/30 transition-all font-bold"
                    >
                       Eliminar Dispositivo
                    </button>
                    
                    {showDeleteConfirm && (
                       <button 
                         onClick={() => handleDelete(false)}
                         className="mt-2 w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold transition-all active:scale-95"
                       >
                          Confirmar Eliminación Permanente
                       </button>
                    )}
                 </div>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default SensorDetail;