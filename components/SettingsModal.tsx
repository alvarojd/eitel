import React, { useState, useEffect } from 'react';
import { X, Cloud, Save, AlertTriangle, PlayCircle, Loader2, CheckCircle2, AlertOctagon } from 'lucide-react';
import { TTNConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: TTNConfig) => void;
  currentConfig: TTNConfig | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentConfig }) => {
  const [appId, setAppId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [region, setRegion] = useState('eu1');

  // Error and Loading states
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen && currentConfig) {
      setAppId(currentConfig.appId);
      setApiKey(currentConfig.apiKey);
      setRegion(currentConfig.region);
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ appId, apiKey, region });
    onClose();
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 rounded-lg text-sky-500">
              <Cloud size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">The Things Network</h2>
              <p className="text-xs text-slate-400">Configuración de Conexión</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">


          <hr className="border-slate-700 my-4" />

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Región</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:border-sky-500 focus:outline-none text-sm"
            >
              <option value="eu1">Europa 1 (eu1)</option>
              <option value="nam1">Norteamérica 1 (nam1)</option>
              <option value="au1">Australia 1 (au1)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">ID de Aplicación</label>
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="ej., mi-app-ciudad-inteligente"
              required
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:border-sky-500 focus:outline-none text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Clave API</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="NNSXS. ...."
              required
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:border-sky-500 focus:outline-none text-sm font-mono"
            />
            <p className="text-[10px] text-slate-500 mt-1">Requiere permisos 'View devices'.</p>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 shadow-lg shadow-sky-900/20"
            >
              <Save size={16} /> Guardar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SettingsModal;