'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Key, 
  Loader2, 
  Shield, 
  MoreVertical, 
  Search,
  Filter,
  X,
  Check,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  getUsers, 
  createUser, 
  updateUserPassword, 
  deleteUser 
} from '@/infrastructure/actions/userActions';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { UserRole } from '@/core/entities/User';

interface UserData {
  id: string;
  username: string;
  role: UserRole;
  created_at: string;
}

export function UsersTab() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create state
  const [isAdding, setIsAdding] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('VIEWER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Update password state
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [updatePassword, setUpdatePassword] = useState('');

  const refreshUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data as UserData[]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await createUser(
        currentUser?.id || '',
        currentUser?.username || '',
        newUsername,
        newPassword,
        newRole
      );
      setNewUsername('');
      setNewPassword('');
      setIsAdding(false);
      refreshUsers();
    } catch (e: any) {
      setError(e.message || 'Error al crear usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: string, username: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar al usuario @${username}?`)) return;
    try {
      await deleteUser(currentUser?.id || '', currentUser?.username || '', userId);
      refreshUsers();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleUpdatePassword = async (userId: string) => {
    if (updatePassword.length < 8) return;
    setIsSubmitting(true);
    try {
      await updateUserPassword(
        currentUser?.id || '',
        currentUser?.username || '',
        userId,
        updatePassword
      );
      setUpdatePassword('');
      setUpdatingUserId(null);
      alert('Contraseña actualizada con éxito');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Tab Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Users className="text-indigo-400" /> 
            Gestión de Usuarios
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Control de accesos y administración de privilegios.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95",
            isAdding 
              ? "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700" 
              : "bg-sky-600 text-white hover:bg-sky-500 shadow-sky-900/20"
          )}
        >
          {isAdding ? <X size={18} /> : <UserPlus size={18} />}
          {isAdding ? 'Cancelar' : 'Nuevo Usuario'}
        </button>
      </div>

      {/* Creation Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleCreate}
            className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800/60 shadow-inner overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre de Usuario</label>
                <input 
                  required
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-sky-500 transition-colors outline-none"
                  placeholder="Ej: juan_perez"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña Inicial</label>
                <input 
                  required
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-sky-500 transition-colors outline-none"
                  placeholder="Min. 8 caracteres"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nivel de Acceso</label>
                <select 
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-sky-500 transition-colors outline-none appearance-none cursor-pointer"
                >
                  <option value="VIEWER">Visualizador (Solo Lectura)</option>
                  <option value="ADMIN">Administrador (Total)</option>
                </select>
              </div>
            </div>
            {error && <p className="text-xs text-rose-500 font-bold mb-4 ml-1">{error}</p>}
            <button 
              disabled={isSubmitting || newPassword.length < 8}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-3 px-8 rounded-xl text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/10"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Confirmar y Crear Acceso
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* List Search & Filter */}
      <div className="flex items-center gap-4 bg-slate-900/40 p-2 rounded-[1.5rem] border border-slate-800/40">
        <div className="flex-1 relative group">
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
           <input 
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
             className="w-full bg-transparent py-3 pl-12 pr-4 text-sm text-white placeholder-slate-600 outline-none"
             placeholder="Buscar por usuario o ID..."
           />
        </div>
        <div className="h-8 w-px bg-slate-800" />
        <button className="p-3 text-slate-500 hover:text-white transition-colors">
          <Filter size={18} />
        </button>
      </div>

      {/* Users Table */}
      <div className="flex-1 bg-slate-950/30 rounded-[2rem] border border-slate-800/60 overflow-hidden flex flex-col shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identidad</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Rol</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest hidden lg:table-cell">Antigüedad</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {isLoading ? (
                <tr>
                   <td colSpan={4} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 size={32} className="animate-spin text-sky-500 opacity-50" />
                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Recuperando Directorio...</span>
                      </div>
                   </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-500 text-sm font-medium">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <React.Fragment key={u.id}>
                    <tr className="group hover:bg-white/[0.02] transition-colors relative">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl border flex items-center justify-center font-black text-xs relative overflow-hidden",
                            u.role === 'ADMIN' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-slate-800/40 border-slate-700/50 text-slate-500"
                          )}>
                            {u.role === 'ADMIN' && <div className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-bl-sm" />}
                            {u.username.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">@{u.username}</span>
                              {u.id === currentUser?.id && (
                                <span className="bg-sky-500 text-white text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider">Tú</span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-600 block mt-0.5">{u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                         <span className={cn(
                           "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border",
                           u.role === 'ADMIN' ? "bg-amber-500/5 text-amber-500 border-amber-500/10" : "bg-slate-800/30 text-slate-500 border-slate-700/30"
                         )}>
                           {u.role === 'ADMIN' ? 'Administrador' : 'Visualizador'}
                         </span>
                      </td>
                      <td className="px-8 py-4 hidden lg:table-cell">
                        <span className="text-xs font-medium text-slate-500">
                          {new Date(u.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                            disabled={u.id === currentUser?.id}
                            onClick={() => setUpdatingUserId(updatingUserId === u.id ? null : u.id)}
                            className={cn(
                              "p-2 rounded-xl border transition-all",
                              u.id === currentUser?.id ? "opacity-0 pointer-events-none" : 
                              updatingUserId === u.id 
                                ? "bg-sky-500 border-sky-400 text-white shadow-lg" 
                                : "bg-slate-900/50 border-slate-800 text-slate-500 hover:text-sky-400 hover:border-sky-500/30"
                            )}
                            title="Cambiar contraseña"
                           >
                             <Key size={16} />
                           </button>

                           {u.id === currentUser?.id || u.username === 'admin' ? (
                             <div className="p-2 text-slate-700 bg-slate-950/50 rounded-xl border border-slate-900 shadow-inner group-hover:scale-110 transition-transform cursor-help" title="Sistema Protegido">
                               <Lock size={16} />
                             </div>
                           ) : (
                             <button 
                               onClick={() => handleDelete(u.id, u.username)}
                               className="p-2 bg-slate-900/50 border border-slate-800 text-slate-500 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-500 rounded-xl transition-all active:scale-90"
                               title="Eliminar permanentemente"
                             >
                               <Trash2 size={16} />
                             </button>
                           )}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Inline Password Reset Overlay */}
                    <AnimatePresence>
                      {updatingUserId === u.id && (
                        <motion.tr 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-sky-500/5"
                        >
                          <td colSpan={4} className="px-8 py-4 border-b border-sky-500/20">
                            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                               <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400">
                                 <Lock size={16} />
                               </div>
                               <div className="flex-1">
                                 <input 
                                   type="password"
                                   value={updatePassword}
                                   onChange={e => setUpdatePassword(e.target.value)}
                                   placeholder={`Nueva clave para @${u.username}...`}
                                   className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-sky-500 outline-none font-mono"
                                 />
                               </div>
                               <button 
                                onClick={() => handleUpdatePassword(u.id)}
                                disabled={isSubmitting || updatePassword.length < 8}
                                className="bg-sky-600 px-6 py-2.5 rounded-xl text-xs font-black text-white hover:bg-sky-500 disabled:opacity-50 transition-all shadow-lg active:scale-95"
                               >
                                 {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : 'Confirmar Cambio'}
                               </button>
                               <button 
                                onClick={() => setUpdatingUserId(null)}
                                className="p-2 text-slate-500 hover:text-white transition-colors"
                               >
                                 <X size={18} />
                               </button>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
