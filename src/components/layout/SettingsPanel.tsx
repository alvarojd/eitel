import React, { useState, useEffect } from 'react';
import { Database, PlayCircle, ShieldCheck, Users, UserPlus, Trash2, Loader2, Shield, Key, FileText, Clock, RefreshCw } from 'lucide-react';
import { isLocalEnvironment } from '../../utils/environment';
import { useAuth } from '../auth/AuthContext';

interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'VIEWER';
  created_at: string;
}

interface AuditLog {
  id: string;
  username: string;
  action: string;
  details: string;
  created_at: string;
}

const SettingsPanel: React.FC = () => {
    const isLocal = isLocalEnvironment();
    const { token, isAdmin, user: currentUser } = useAuth();
    
    const [users, setUsers] = useState<User[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [activeSection, setActiveSection] = useState<'users' | 'logs'>('users');
    
    // New user form
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState<'ADMIN' | 'VIEWER'>('VIEWER');
    
    // Password update state
    const [updatingPasswordUserId, setUpdatingPasswordUserId] = useState<string | null>(null);
    const [updatePassword, setUpdatePassword] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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

    const fetchAuditLogs = async () => {
        if (!token || !isAdmin) return;
        setIsLoadingLogs(true);
        try {
            const res = await fetch('/api/audit-logs', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAuditLogs(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingLogs(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        if (isAdmin) fetchAuditLogs();
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
                fetchAuditLogs();
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

    const handleUpdatePassword = async (userId: string) => {
        if (!updatePassword) return;
        setIsSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const res = await fetch('/api/users', {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ id: userId, password: updatePassword })
            });
            if (res.ok) {
                setUpdatePassword('');
                setUpdatingPasswordUserId(null);
                setSuccess('Contraseña actualizada');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const data = await res.json();
                setError(data.error || 'Error al actualizar');
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
                fetchAuditLogs();
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
                {/* Tab switcher for Admin */}
                {isAdmin && (
                    <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-700">
                        <button 
                            onClick={() => setActiveSection('users')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${activeSection === 'users' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Users size={14} /> Usuarios
                        </button>
                        <button 
                            onClick={() => setActiveSection('logs')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${activeSection === 'logs' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <FileText size={14} /> Auditoría
                        </button>
                    </div>
                )}

                {/* My Account Section */}
                <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Shield size={14} /> Mi Cuenta ({currentUser?.username})
                    </h3>
                    <div className="p-4 rounded-xl border bg-slate-900/50 border-slate-700 shadow-inner">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2 text-xs text-white">
                               <Shield size={14} className={isAdmin ? 'text-amber-500' : 'text-sky-400'} />
                               Rol: <span className="font-bold">{currentUser?.role === 'ADMIN' ? 'Administrador' : 'Visualizador'}</span>
                           </div>
                           <button 
                                onClick={() => {
                                    setUpdatingPasswordUserId(updatingPasswordUserId === currentUser?.id ? null : currentUser?.id || null);
                                    setUpdatePassword('');
                                }}
                                className="flex items-center gap-2 text-xs text-sky-400 hover:text-sky-300 transition-colors font-medium bg-sky-400/10 px-3 py-1.5 rounded-lg"
                            >
                                <Key size={14} /> {updatingPasswordUserId === currentUser?.id ? 'Cancelar' : 'Cambiar mi contraseña'}
                            </button>
                        </div>

                        {updatingPasswordUserId === currentUser?.id && (
                            <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 border-t border-slate-700 pt-4">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Nueva Contraseña</label>
                                <input 
                                    type="password"
                                    value={updatePassword}
                                    onChange={e => setUpdatePassword(e.target.value)}
                                    placeholder="Min. 8 caracteres"
                                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:border-sky-500 outline-none"
                                />
                                <button 
                                    onClick={() => handleUpdatePassword(currentUser?.id || '')}
                                    disabled={isSubmitting || !updatePassword}
                                    className="w-full bg-sky-600 py-2 rounded text-xs font-bold text-white hover:bg-sky-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
                                    Actualizar Contraseña
                                </button>
                            </div>
                        )}
                        {success && <p className="text-[10px] text-emerald-400 mt-2 font-medium">{success}</p>}
                        {error && <p className="text-[10px] text-rose-500 mt-2 font-medium">{error}</p>}
                    </div>
                </div>

                {/* User Management Section */}
                {isAdmin && activeSection === 'users' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Users size={14} /> Gestión de Usuarios
                            </h3>
                            <button 
                                onClick={() => setIsAdding(!isAdding)}
                                className="text-[10px] font-bold bg-sky-500 hover:bg-sky-400 text-white px-2 py-1 rounded transition-all flex items-center gap-1 shadow-lg"
                            >
                                <UserPlus size={12} /> {isAdding ? 'Cerrar' : 'Agregar'}
                            </button>
                        </div>

                        {isAdding && (
                            <form onSubmit={handleAddUser} className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 shadow-xl">
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
                                    className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-2 rounded text-xs transition-all flex items-center justify-center gap-1 shadow-lg"
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
                                    <div key={user.id} className="group">
                                        <div className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-700/50 rounded-lg group-hover:border-slate-600 transition-all">
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
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    onClick={() => {
                                                        setUpdatingPasswordUserId(updatingPasswordUserId === user.id ? null : user.id);
                                                        setUpdatePassword('');
                                                    }}
                                                    className={`p-1.5 rounded transition-all ${updatingPasswordUserId === user.id ? 'text-sky-400 bg-sky-400/10' : 'text-slate-600 hover:text-sky-400 hover:bg-sky-400/10'}`}
                                                    title="Cambiar contraseña"
                                                >
                                                    <Key size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(user.id, user.username)}
                                                    className="p-1.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                                                    title="Eliminar usuario"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        {updatingPasswordUserId === user.id && (
                                            <div className="mt-2 pl-12 pr-3 pb-3 animate-in fade-in slide-in-from-top-1 bg-slate-900/20 rounded-b-lg border-x border-b border-slate-700/30">
                                                <div className="flex gap-2 items-center">
                                                    <input 
                                                        type="password"
                                                        value={updatePassword}
                                                        onChange={e => setUpdatePassword(e.target.value)}
                                                        placeholder="Nueva contraseña"
                                                        className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:border-sky-500 outline-none"
                                                    />
                                                    <button 
                                                        onClick={() => handleUpdatePassword(user.id)}
                                                        disabled={isSubmitting || !updatePassword}
                                                        className="bg-sky-600 px-3 py-1 rounded text-[10px] font-bold text-white hover:bg-sky-500 disabled:opacity-50"
                                                    >
                                                        {isSubmitting ? <Loader2 size={10} className="animate-spin" /> : 'OK'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Audit Logs Section */}
                {isAdmin && activeSection === 'logs' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Clock size={14} /> Registros de Actividad
                            </h3>
                            <button 
                                onClick={fetchAuditLogs}
                                className="text-slate-500 hover:text-sky-400 transition-colors bg-slate-900/50 p-1.5 rounded-lg border border-slate-800"
                                title="Refrescar"
                            >
                                <RefreshCw size={12} className={isLoadingLogs ? 'animate-spin' : ''} />
                            </button>
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {isLoadingLogs ? (
                                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-500" size={20} /></div>
                            ) : auditLogs.length === 0 ? (
                                <p className="text-center text-slate-500 text-xs py-4 italic">No hay actividad registrada</p>
                            ) : (
                                auditLogs.map(log => (
                                    <div key={log.id} className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg space-y-1 hover:border-slate-700 transition-all">
                                        <div className="flex justify-between items-start">
                                            <span className={`text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded border ${
                                                log.action.includes('DELETE') ? 'text-rose-400 bg-rose-400/5 border-rose-400/10' :
                                                log.action.includes('CREATE') ? 'text-emerald-400 bg-emerald-400/5 border-emerald-400/10' :
                                                'text-sky-400 bg-sky-400/5 border-sky-400/10'
                                            }`}>
                                                {log.action}
                                            </span>
                                            <span className="text-[9px] text-slate-500 font-mono">
                                                {new Date(log.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-300 leading-tight py-1 font-medium">{log.details}</p>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                                            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest italic">Por: {log.username}</p>
                                        </div>
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
                            <span className="text-slate-300">Postgres (Supabase)</span>
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
