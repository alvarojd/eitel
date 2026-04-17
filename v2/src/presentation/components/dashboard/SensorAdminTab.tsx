'use client';

import React, { useState } from 'react';
import { 
  Save, 
  Trash2, 
  MapPin, 
  AlertTriangle, 
  Loader2, 
  Check, 
  RefreshCcw,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useSensor } from '../../context/SensorContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { updateSensor, deleteSensorMeasurements, deleteSensor } from '@/infrastructure/actions/sensorActions';
import dynamic from 'next/dynamic';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const MapPicker = dynamic(() => import('../common/MapPicker').then(mod => mod.MapPicker), { 
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-sky-500" size={32} />
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Cargando Mapa...</p>
      </div>
    </div>
  )
});

export function SensorAdminTab() {
  const { selectedSensor, setIsDrawerOpen } = useSensor();
  const { user } = useAuth();
  const router = useRouter();
  
  if (!selectedSensor) return null;

  const [name, setName] = useState(selectedSensor.name);
  const [lat, setLat] = useState(selectedSensor.latitude?.toString() || '');
  const [lng, setLng] = useState(selectedSensor.longitude?.toString() || '');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [deleteHistoryOnly, setDeleteHistoryOnly] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    setSuccessMsg('');
    try {
      await updateSensor(
        user?.id || '',
        user?.username || '',
        selectedSensor.devEui || selectedSensor.id,
        name,
        lat ? parseFloat(lat) : null,
        lng ? parseFloat(lng) : null
      );
      setSuccessMsg('Configuración actualizada con éxito');
      router.refresh();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error(error);
      alert('Error al actualizar el sensor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMeasurements = async () => {
    setIsDeleting(true);
    try {
      await deleteSensorMeasurements(user?.id || '', user?.username || '', selectedSensor.devEui || selectedSensor.id);
      router.refresh();
      setSuccessMsg('Historial eliminado correctamente');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
      setShowHistoryModal(false);
    }
  };

  const handleDeleteDevice = async () => {
    setIsDeleting(true);
    try {
      await deleteSensor(user?.id || '', user?.username || '', selectedSensor.devEui || selectedSensor.id, deleteHistoryOnly);
      router.refresh();
      setIsDrawerOpen(false);
    } catch (error) {
      console.error(error);
      alert('Error al eliminar el dispositivo');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
      {showMap && (
        <MapPicker 
          initialLat={lat ? parseFloat(lat) : undefined}
          initialLng={lng ? parseFloat(lng) : undefined}
          onSelect={(newLat, newLng) => {
            setLat(newLat.toString());
            setLng(newLng.toString());
            setShowMap(false);
          }}
          onClose={() => setShowMap(false)}
        />
      )}

      <ConfirmationModal 
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onConfirm={handleDeleteMeasurements}
        isLoading={isDeleting}
        title="¿Borrar Historial?"
        description={`Estás a punto de eliminar todas las mediciones acumuladas del sensor ${selectedSensor.name}. Esta acción es irreversible y afectará a los reportes históricos.`}
        confirmLabel="Eliminar Datos"
        variant="danger"
      />

      {/* Info Header */}
      <div className="bg-sky-500/5 border border-sky-500/10 p-4 rounded-2xl flex gap-4">
         <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500 shrink-0">
            <Info size={20} />
         </div>
         <div className="space-y-0.5">
            <p className="text-xs font-black text-sky-400 uppercase tracking-widest">Nota Administrativa</p>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
               Los cambios realizados aquí afectan a la visualización global y la integridad de los datos en DB.
            </p>
         </div>
      </div>

      {/* Basic Config */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
          <RefreshCcw size={12} /> Configuración Base
        </h3>
        
        <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-3xl space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Nombre Amigable</label>
            <input 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Nodo Planta 2 - Sur"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-all font-bold"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
               <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Geolocalización</label>
               <button 
                onClick={() => setShowMap(true)}
                className="text-[9px] font-black text-sky-500 hover:text-sky-400 transition-colors flex items-center gap-1.5 uppercase"
               >
                  <MapPin size={12} /> Abrir Selector en Mapa
               </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input 
                value={lat}
                readOnly
                placeholder="Latitud"
                className="bg-slate-950/30 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white/60 font-mono outline-none"
              />
              <input 
                value={lng}
                readOnly
                placeholder="Longitud"
                className="bg-slate-950/30 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white/60 font-mono outline-none"
              />
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-sky-900/10 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {successMsg || 'Guardar Configuración'}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4 pt-4">
        <h3 className="text-[10px] font-black text-rose-500/70 uppercase tracking-widest flex items-center gap-2 ml-1">
          <ShieldAlert size={12} /> Zona de Peligro
        </h3>

        <div className="bg-rose-500/[0.03] border border-rose-500/10 p-6 rounded-[2rem] space-y-6">
          <div className="space-y-3">
             <div className="flex items-start gap-4">
                <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500 shrink-0">
                   <RefreshCcw size={16} />
                </div>
                <div>
                  <p className="text-xs font-black text-rose-500 uppercase">Reiniciar Datos</p>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">Borra permanentemente toda la telemetría histórica. El dispositivo seguirá en el inventario.</p>
                </div>
             </div>
             <button 
              onClick={() => setShowHistoryModal(true)}
              disabled={isDeleting}
              className="w-full py-3 border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all mt-2"
             >
                Limpiar Historial de Mediciones
             </button>
          </div>

          <div className="h-px bg-rose-500/10" />

          <div className="space-y-4">
             <div className="flex items-start gap-4">
                <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500 shrink-0">
                   <Trash2 size={16} />
                </div>
                <div>
                  <p className="text-xs font-black text-rose-500 uppercase">Eliminar Dispositivo</p>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">Elimina el sensor del dashboard. El dispositivo dejará de ser visible y procesado.</p>
                </div>
             </div>

             <div className="flex items-center gap-3 px-4 py-3 bg-slate-950/50 rounded-2xl border border-slate-800">
                <input 
                  type="checkbox" 
                  id="delHistory"
                  checked={deleteHistoryOnly}
                  onChange={e => setDeleteHistoryOnly(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-rose-500/20" 
                />
                <label htmlFor="delHistory" className="text-[10px] font-bold text-slate-400 cursor-pointer">Incluir borrado de datos históricos</label>
             </div>

             {!showDeleteConfirm ? (
               <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
               >
                 Dar de Baja Dispositivo
               </button>
             ) : (
                <div className="space-y-3 animate-in zoom-in-95 duration-200">
                   <button 
                    onClick={handleDeleteDevice}
                    disabled={isDeleting}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                   >
                     {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
                     Confirmar Eliminación Permanente
                   </button>
                   <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="w-full py-2 text-[10px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors"
                   >
                     No, Cancelar
                   </button>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
