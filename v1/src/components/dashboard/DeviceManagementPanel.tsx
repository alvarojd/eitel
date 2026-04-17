import React from 'react';
import { SensorData } from '../../types';
import { X, MapPin, Save, Trash2, AlertTriangle, ShieldAlert, Loader2, Info } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

import MapPicker from '../common/MapPicker';

interface DeviceManagementPanelProps {
  sensor: SensorData | null;
  onClose: () => void;
  onRequireUpdate?: () => void;
}

const DeviceManagementPanel: React.FC<DeviceManagementPanelProps> = ({ sensor, onClose, onRequireUpdate }) => {
  const { token } = useAuth();
  
  // Form state
  const [editName, setEditName] = React.useState('');
  const [editLat, setEditLat] = React.useState('');
  const [editLng, setEditLng] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [deleteHistoryOnly, setDeleteHistoryOnly] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showMapPicker, setShowMapPicker] = React.useState(false);

  React.useEffect(() => {
    if (sensor) {
      setEditName(sensor.name || sensor.id);
      setEditLat(sensor.latitude?.toString() || '');
      setEditLng(sensor.longitude?.toString() || '');
      setShowDeleteConfirm(false);
      setDeleteHistoryOnly(false);
    }
  }, [sensor]);

  if (!sensor) {
    return (
      <div className="h-full bg-slate-800 flex flex-col items-center justify-center p-8 text-center border-l border-slate-700">
        <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mb-4 border border-slate-700">
          <Info size={24} className="text-slate-500" />
        </div>
        <h3 className="text-white font-bold mb-2">Gestión de Dispositivos</h3>
        <p className="text-sm text-slate-400">Selecciona un sensor de la lista para gestionar su configuración, ubicación o historial.</p>
      </div>
    );
  }

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
        // We close the panel to force a refresh on the main list
        if (onRequireUpdate) onRequireUpdate();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setEditLat(lat.toFixed(6));
    setEditLng(lng.toFixed(6));
  };

  const handleDelete = async (onlyHistory: boolean) => {
    if (!window.confirm(onlyHistory ? '¿Borrar historial de mediciones?' : '¿Eliminar dispositivo permanentemente del sistema?')) return;
    
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
        if (onRequireUpdate) onRequireUpdate();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full bg-slate-800 flex flex-col shadow-2xl w-full border-l border-slate-700">
      {showMapPicker && (
        <MapPicker 
          initialLat={editLat ? parseFloat(editLat) : undefined}
          initialLng={editLng ? parseFloat(editLng) : undefined}
          onSelect={handleLocationSelect}
          onClose={() => setShowMapPicker(false)}
        />
      )}
      {/* Header */}
      <div className="p-6 border-b border-slate-700 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert size={20} className="text-rose-500" />
            Gestión
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Administración de Sensor</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-8">
        {/* Device ID Info */}
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Device ID / EUI</label>
           <p className="text-white font-mono text-sm">{sensor.devEui || sensor.id}</p>
        </div>

        {/* Edit Configuration */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-2">
              <MapPin size={14} /> Configuración y Ubicación
            </h3>
            <button 
              onClick={() => setShowMapPicker(true)}
              className="text-[10px] font-bold text-sky-400 hover:text-sky-300 transition-colors uppercase flex items-center gap-1.5 bg-sky-400/5 px-2 py-1 rounded border border-sky-400/20"
            >
              <MapPin size={12} /> Seleccionar en Mapa
            </button>
          </div>
          
          <div className="space-y-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-700/40">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5 ml-1">Nombre del Sensor</label>
              <input 
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-inner"
                placeholder="Ej: Sensor Aula 102"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative group cursor-pointer" onClick={() => setShowMapPicker(true)}>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5 ml-1 cursor-pointer group-hover:text-sky-400 transition-colors">Latitud</label>
                <input 
                  value={editLat}
                  readOnly
                  onClick={() => setShowMapPicker(true)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white cursor-pointer group-hover:border-sky-500/50 transition-all outline-none"
                  placeholder="40.315..."
                />
              </div>
              <div className="relative group cursor-pointer" onClick={() => setShowMapPicker(true)}>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5 ml-1 cursor-pointer group-hover:text-sky-400 transition-colors">Longitud</label>
                <input 
                  value={editLng}
                  readOnly
                  onClick={() => setShowMapPicker(true)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white cursor-pointer group-hover:border-sky-500/50 transition-all outline-none"
                  placeholder="-3.720..."
                />
              </div>
            </div>

            <button 
              onClick={handleUpdate}
              disabled={isSaving}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Guardar Cambios
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 space-y-4">
          <h3 className="text-xs font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2">
            <Trash2 size={14} /> Zona de Peligro
          </h3>
          
          <div className="space-y-3 bg-rose-500/5 border border-rose-500/10 p-5 rounded-2xl shadow-inner">
            <button 
              onClick={() => handleDelete(true)}
              className="flex items-center justify-center gap-2 w-full py-2.5 border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-bold transition-all"
            >
              <Trash2 size={14} /> Borrar Historial de Mediciones
            </button>

            <div className="pt-4 border-t border-rose-500/10">
              <p className="text-[10px] text-rose-400/70 mb-4 leading-relaxed flex items-start gap-2 italic">
                <AlertTriangle size={12} className="shrink-0 text-rose-500" />
                <span>Para desactivar completamente, recuerda eliminar el dispositivo también en la Consola de TTN.</span>
              </p>

              <div className="flex items-center gap-2 mb-4 bg-slate-900/50 p-2 rounded-lg border border-slate-700">
                <input 
                  type="checkbox" 
                  id="delHistConfirm" 
                  checked={deleteHistoryOnly}
                  onChange={e => setDeleteHistoryOnly(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-rose-500/50 h-3 w-3"
                />
                <label htmlFor="delHistConfirm" className="text-[9px] text-slate-400 cursor-pointer font-bold">Incluir datos históricos en la eliminación</label>
              </div>

              {!showDeleteConfirm ? (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-xs border border-rose-500/30 transition-all font-bold"
                >
                  Eliminar Dispositivo
                </button>
              ) : (
                <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                   <button 
                    onClick={() => handleDelete(false)}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xl transition-all active:scale-95"
                  >
                    Confirmar Eliminación Permanente
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="w-full py-2 text-slate-500 text-[10px] font-bold"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceManagementPanel;
