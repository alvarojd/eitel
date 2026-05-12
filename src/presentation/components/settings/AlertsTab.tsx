'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Plus, Trash2, BellRing, Loader2 } from 'lucide-react';
import { getAlertEmails, addAlertEmail, removeAlertEmail } from '@/infrastructure/actions/alertActions';

export function AlertsTab() {
  const [emails, setEmails] = useState<{id: string, email: string}[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    setIsLoading(true);
    try {
      const data = await getAlertEmails();
      setEmails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    setIsSubmitting(true);
    setError(null);

    const result = await addAlertEmail(newEmail);
    
    if (result.success) {
      setNewEmail('');
      await loadEmails();
    } else {
      setError(result.error || 'Error desconocido');
    }
    
    setIsSubmitting(false);
  };

  const handleRemoveEmail = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este correo de la lista de alertas?')) return;
    
    const result = await removeAlertEmail(id);
    if (result.success) {
      await loadEmails();
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <BellRing className="text-amber-400" size={24} />
          Configuración de Alertas
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          Gestiona las direcciones de correo electrónico que recibirán notificaciones críticas del sistema, 
          como alertas de batería baja (&lt;20%) o pérdida de conexión prolongada.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lista de Correos */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Mail size={18} className="text-slate-400" />
            Destinatarios Actuales
          </h3>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-slate-500" size={24} />
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
              <p className="text-slate-500 text-sm">No hay correos configurados.</p>
              <p className="text-slate-600 text-xs mt-1">Añade uno para empezar a recibir alertas.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {emails.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl group hover:border-slate-600 transition-colors">
                  <span className="text-slate-300 text-sm font-medium">{item.email}</span>
                  <button 
                    onClick={() => handleRemoveEmail(item.id)}
                    className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Eliminar correo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Añadir Nuevo Correo */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-fit"
        >
          <h3 className="text-white font-semibold mb-4">Añadir Nuevo Destinatario</h3>
          
          <form onSubmit={handleAddEmail} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-1.5">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="ejemplo@hexasense.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
              />
            </div>
            
            {error && (
              <p className="text-red-400 text-xs font-medium bg-red-400/10 p-2 rounded border border-red-400/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !newEmail}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold py-2.5 rounded-xl transition-colors text-sm"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Plus size={18} />
              )}
              {isSubmitting ? 'Añadiendo...' : 'Añadir Correo'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Estrategia de Notificación</h4>
            <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
              <li><strong>Alerta Inmediata:</strong> Al caer por debajo del 20% de batería.</li>
              <li><strong>Recordatorio:</strong> Semanalmente (Lunes 8am) si sigue &lt;20%.</li>
              <li><strong>Pérdida de Datos:</strong> Semanalmente (Lunes 8am) si no hay datos por &gt;24h.</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
