'use client';

import React, { useState } from 'react';
import { ShieldCheck, Key, Shield, Loader2, Lock, Fingerprint } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateUserPassword } from '@/infrastructure/actions/userActions';
import { motion } from 'framer-motion';

export function ProfileTab() {
 const { user } = useAuth();
 const [newPassword, setNewPassword] = useState('');
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');

 const handleUpdate = async (e: React.FormEvent) => {
 e.preventDefault();
 if (newPassword.length < 8) return;
 
 setIsSubmitting(true);
 setError('');
 setSuccess('');
 
 try {
 await updateUserPassword(
 user?.id || '',
 user?.username || '',
 user?.id || '',
 newPassword
 );
 setSuccess('Tu contraseña ha sido actualizada correctamente.');
 setNewPassword('');
 } catch (e: any) {
 setError(e.message || 'Error al actualizar la contraseña');
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <div className="max-w-xl space-y-10">
 <div>
 <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-2">
 <ShieldCheck size={24} className="text-emerald-500" /> 
 Seguridad de la Cuenta
 </h2>
 <p className="text-slate-500 text-sm font-medium">Gestiona tu acceso personal y protege tu cuenta.</p>
 </div>
 
 {/* User Info Card */}
 <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800/60 shadow-inner relative overflow-hidden">
 <div className="absolute top-0 right-0 p-8 opacity-5">
 <Fingerprint size={120} className="text-white" />
 </div>
 
 <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
 <div className="flex items-center gap-5">
 <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl font-black text-sky-500 shadow-2xl">
 {user?.username.substring(0,2).toUpperCase()}
 </div>
 <div>
 <p className="text-xs font-black text-slate-600 tracking-widest mb-1">Usuario en Sesión</p>
 <p className="text-2xl font-black text-white">@{user?.username}</p>
 </div>
 </div>
 <div className="px-5 py-2.5 rounded-2xl border bg-slate-900 shadow-xl flex items-center gap-3">
 <div className={`w-2 h-2 rounded-full animate-pulse ${user?.role === 'ADMIN' ? 'bg-amber-500' : 'bg-sky-500'}`} />
 <span className={user?.role === 'ADMIN' ? 'text-amber-500 font-black text-xs tracking-widest' : 'text-sky-400 font-black text-xs tracking-widest'}>
 {user?.role === 'ADMIN' ? 'Control Total (Admin)' : 'Solo Visualización'}
 </span>
 </div>
 </div>
 </div>

 {/* Password Form */}
 <form onSubmit={handleUpdate} className="space-y-6">
 <div className="space-y-3">
 <h3 className="text-sm font-black text-white tracking-wider flex items-center gap-2">
 <Lock size={16} className="text-sky-500" />
 Actualizar Credenciales
 </h3>
 <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md">
 Por seguridad, usa una combinación de letras, números y símbolos. Mínimo 8 caracteres.
 </p>
 </div>

 <div className="space-y-4">
 <div className="space-y-2">
 <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1">Nueva Contraseña</label>
 <div className="relative group">
 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors">
 <Key size={18} />
 </span>
 <input 
 type="password"
 required
 value={newPassword}
 onChange={e => setNewPassword(e.target.value)}
 autoComplete="new-password"
 placeholder="Introduce tu clave secreta..."
 className="w-full bg-slate-950/50 border border-slate-800 focus:border-sky-500/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-700 outline-none focus:ring-4 focus:ring-sky-500/5 transition-all font-mono"
 />
 </div>
 </div>
 
 <button 
 type="submit"
 disabled={isSubmitting || newPassword.length < 8}
 className="bg-sky-600 hover:bg-sky-500 disabled:bg-sky-900 disabled:text-slate-500 disabled:opacity-50 text-white font-black py-4 px-8 rounded-2xl text-sm transition-all flex items-center justify-center gap-3 shadow-xl shadow-sky-900/10 active:scale-95 group"
 >
 {isSubmitting ? (
 <Loader2 size={18} className="animate-spin" />
 ) : (
 <>
 <Shield size={18} />
 Confirmar Nuevo Acceso
 <div className="w-4 h-px bg-white/30 group-hover:w-8 transition-all" />
 </>
 )}
 </button>
 
 {success && (
 <motion.div initial={{opacity: 0, y: 5}} animate={{opacity: 1, y: 0}} className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
 <p className="text-sm text-emerald-500 font-bold">{success}</p>
 </motion.div>
 )}
 {error && (
 <motion.div initial={{opacity: 0, y: 5}} animate={{opacity: 1, y: 0}} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3">
 <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" />
 <p className="text-sm text-rose-500 font-bold">{error}</p>
 </motion.div>
 )}
 </div>
 </form>
 </div>
 );
}
