import React, { useState, useEffect } from 'react';
import { Database, PlayCircle, ShieldCheck, Users, UserPlus, Trash2, Loader2, Shield } from 'lucide-react';
import { isLocalEnvironment } from '../../utils/environment';
import { useAuth } from '../auth/AuthContext';

interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'VIEWER';
  created_at: string;
}

const SettingsPanel: React.FC = () => {
    const isLocal = isLocalEnvironment();
    const { token, isAdmin } = useAuth();
    
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    
    // New user form
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState<'ADMIN' | 'VIEWER'>('VIEWER');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        if (!token || !isAdmin) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token, isAdmin]);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    username: newUsername,
                    password: newPassword,
                    role: newRole
                })
            });
            if (res.ok) {
                setNewUsername('');
                setNewPassword('');
                setIsAdding(false);
                fetchUsers();
            } else {
                const data = await res.json();
                setError(data.error || 'Error al crear usuario');
            }
        } catch (e) {
            setError('Error de conexión');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (id: string, username: string) => {
        if (!window.confirm(`¿Seguro que deseas eliminar al usuario "${username}"?`)) return;
        try {
            const res = await fetch(`/api/users?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="h-full bg-slate-800 flex flex-col border-l border-slate-700 shadow-2xl w-full">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Database size={18} className="text-sky-500" />
                        Configuración
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">Gestión de sistema y usuarios</p>
                </div>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                {/* Entorno Section */}
                <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Database size={14} /> Entorno de Ejecución
                    </h3>

                    <div className="p-4 rounded-xl border bg-slate-900/50 border-slate-700 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-white font-medium">
                                {isLocal ? (
                                    <PlayCircle size={18} className="text-amber-400" />
                                ) : (
                                    <ShieldCheck size={18} className="text-emerald-400" />
                                )}
                                {isLocal ? 'Modo Desarrollo' : 'Modo Producción'}
                            </div>
                            <div className={`w-2 h-2 rounded-full animate-pulse ${isLocal ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                            {isLocal
                                ? 'Mostrando flujo de datos simulado para pruebas de desarrollo.'
                                : 'Conexión activa con Base de Datos Vercel y red TTN real.'}
                        </p>
                    </div>
                </div>

                {/* User Management Section */}
                {isAdmin && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Users size={14} /> Gestión de Usuarios
                            </h3>
                            <button 
                                onClick={() => setIsAdding(!isAdding)}
                                className="text-[10px] font-bold bg-sky-500 hover:bg-sky-400 text-white px-2 py-1 rounded transition-all flex items-center gap-1"
                            >
                                <UserPlus size={12} /> {isAdding ? 'Cerrar' : 'Agregar'}
                            </button>
                        </div>

                        {isAdding && (
                            <form onSubmit={handleAddUser} className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Usuario</label>
                                    <input 
                                        required
                                        value={newUsername}
                                        onChange={e => setNewUsername(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500"
                                        placeholder="Ej: juan_admin"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Contraseña</label>
                                    <input 
                                        required
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500"
                                        placeholder="********"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Rol</label>
                                    <select 
                                        value={newRole}
                                        onChange={e => setNewRole(e.target.value as 'ADMIN' | 'VIEWER')}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500"
                                    >
                                        <option value="VIEWER">Visualizador</option>
                                        <option value="ADMIN">Administrador</option>
                                    </select>
                                </div>
                                {error && <p className="text-[10px] text-rose-500">{error}</p>}
                                <button 
                                    disabled={isSubmitting}
                                    className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-2 rounded text-xs transition-all flex items-center justify-center gap-1"
                                >
                                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                                    Crear Usuario
                                </button>
                            </form>
                        )}

                        <div className="space-y-2">
                            {isLoading ? (
                                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-500" size={20} /></div>
                            ) : users.length === 0 ? (
                                <p className="text-center text-slate-500 text-xs py-4 italic">No hay otros usuarios registrados</p>
                            ) : (
                                users.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-700/50 rounded-lg group hover:border-slate-600 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-md ${user.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-400'}`}>
                                                <Shield size={14} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white">{user.username}</div>
                                                <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                                                    {user.role === 'ADMIN' ? 'Administrador' : 'Visualizador'}
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteUser(user.id, user.username)}
                                            className="p-1.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-700 space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Información de Conexión</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">API Gateway:</span>
                            <span className="text-slate-300">Vercel Serverless</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Database:</span>
                            <span className="text-slate-300">Postgres (Neon)</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Red:</span>
                            <span className="text-slate-300">The Things Network</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
