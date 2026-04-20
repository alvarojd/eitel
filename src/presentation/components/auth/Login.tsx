'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ShieldCheck, Lock, User, Hexagon } from 'lucide-react';
import { getProjectName } from '@/infrastructure/actions/systemActions';
import { motion } from 'framer-motion';

export function LoginComponent() {
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [projectName, setProjectName] = useState('HexaSense');
 const { login } = useAuth();

 useEffect(() => {
 // We use a simplified way to fetch project name on mount
 getProjectName().then(setProjectName).catch(() => {});
 }, []);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');

 try {
 // In V2 we will implement this as a Server Action or API Route
 // For now, let's call the API (we need to create it)
 const response = await fetch('/api/login', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ username, password }),
 });

 const data = await response.json();

 if (response.ok) {
 login(data.token, data.user);
 } else {
 setError(data.error || 'Credenciales inválidas');
 }
 } catch (err) {
 setError('Error de conexión con el servidor');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-sky-500/30">
 {/* Dynamic Background Elements */}
 <div className="fixed inset-0 overflow-hidden pointer-events-none">
 <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[120px]" />
 <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/5 rounded-full blur-[120px]" />
 </div>

 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="max-w-md w-full relative z-10"
 >
 <div className="text-center mb-10">
 <motion.div 
 initial={{ scale: 0.8 }}
 animate={{ scale: 1 }}
 className="inline-flex items-center justify-center p-5 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl mb-6 group"
 >
 <div className="w-16 h-16 border-2 border-sky-500 rounded-2xl flex items-center justify-center -rotate-12 bg-sky-500/10 group-hover:rotate-0 transition-transform duration-500">
 <Hexagon className="text-sky-500 w-10 h-10 fill-sky-500/20" />
 </div>
 </motion.div>
 <h1 className="text-4xl font-black text-white tracking-tight">Acceso {projectName}</h1>
 <p className="text-slate-400 mt-3 font-medium">Dashboard de Monitoreo IoT V2</p>
 </div>

 <div className="bg-slate-900/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-slate-800/50 shadow-2xl relative overflow-hidden group">
 {/* Subtle Glass Highlight */}
 <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
 
 <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
 <div className="space-y-2">
 <label className="block text-xs font-bold text-slate-500 tracking-widest ml-1">Usuario</label>
 <div className="relative group/input">
 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-sky-400 transition-colors">
 <User size={18} />
 </span>
 <input
 type="text"
 required
 value={username}
 onChange={(e) => setUsername(e.target.value)}
 className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all font-medium"
 placeholder="Tu nombre de usuario"
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="block text-xs font-bold text-slate-500 tracking-widest ml-1">Contraseña</label>
 <div className="relative group/input">
 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-sky-400 transition-colors">
 <Lock size={18} />
 </span>
 <input
 type="password"
 required
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all font-medium"
 placeholder="••••••••"
 />
 </div>
 </div>

 {error && (
 <motion.div 
 initial={{ opacity: 0, x: -10 }}
 animate={{ opacity: 1, x: 0 }}
 className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm font-bold flex items-center gap-2"
 >
 <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
 {error}
 </motion.div>
 )}

 <button
 type="submit"
 disabled={loading}
 className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-sky-600/50 text-white font-black py-4 rounded-2xl shadow-xl shadow-sky-900/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] group/btn"
 >
 {loading ? (
 <>
 <Loader2 className="animate-spin" size={20} />
 <span>Autenticando...</span>
 </>
 ) : (
 <>
 <span>Entrar al Dashboard</span>
 <div className="w-6 h-px bg-white/20 group-hover:w-10 transition-all" />
 </>
 )}
 </button>
 </form>
 </div>

 <p className="text-center mt-10 text-slate-500 text-xs font-bold tracking-widest">
 Sistema de gestión {projectName} &copy; 2026
 </p>
 </motion.div>
 </div>
 );
}
