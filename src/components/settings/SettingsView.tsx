import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, Users, UserPlus, Trash2, Loader2, Shield, Key, FileText, Clock, RefreshCw, Lock, Server } from 'lucide-react';
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

const SettingsView: React.FC = () => {
    const { token, isAdmin, user: currentUser } = useAuth();
    
    const [users, setUsers] = useState<User[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    
    const [activeSection, setActiveSection] = useState<'perfil' | 'usuarios' | 'logs' | 'sistema'>('perfil');
    
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
        if (isAdmin && activeSection === 'usuarios' && users.length === 0) fetchUsers();
        if (isAdmin && activeSection === 'logs' && auditLogs.length === 0) fetchAuditLogs();
    }, [token, isAdmin, activeSection]);

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
                if (auditLogs.length > 0) fetchAuditLogs();
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
                setSuccess('Contraseña actualizada con éxito');
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
        setError('');
        try {
            const res = await fetch(`/api/users?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchUsers();
                if (auditLogs.length > 0) fetchAuditLogs();
            } else {
                const data = await res.json();
                alert(data.error || 'Error al eliminar usuario');
            }
        } catch (e) {
            alert('Error de conexión al eliminar');
        }
    };

    const isProtectedUser = (u: User) => {
        return u.id === currentUser?.id || u.username === 'admin';
    };

    const navItems = [
        { id: 'perfil', label: 'Mi Perfil', icon: <Shield size={16} /> },
        ...(isAdmin ? [
            { id: 'usuarios', label: 'Gestión de Usuarios', icon: <Users size={16} /> },
            { id: 'logs', label: 'Auditoría', icon: <FileText size={16} /> }
        ] : []),
        { id: 'sistema', label: 'Sistema', icon: <Server size={16} /> }
    ];

    return (
        <div className="h-full w-full flex flex-col bg-slate-900/40 p-6 lg:p-10 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shadow-lg">
                    <Database size={28} className="text-sky-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Centro de Control</h1>
                    <p className="text-slate-400 mt-1">Configuración del sistema y gestión de accesos</p>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
                
                {/* Vertical Tabs / Sidebar inside the View */}
                <div className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id as any)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium border
                                ${activeSection === item.id 
                                    ? 'bg-sky-600/20 border-sky-500/30 text-sky-400 shadow-md view-tab-active' 
                                    : 'bg-slate-800/30 border-transparent text-slate-400 hover:bg-slate-800 hover:text-white'
                                }
                            `}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Content Panel */}
                <div className="flex-1 bg-slate-800/60 rounded-2xl border border-slate-700/50 shadow-xl overflow-y-auto custom-scrollbar p-6">
                    
                    {/* --- TAB: MI PERFIL --- */}
                    {activeSection === 'perfil' && (
                        <div className="max-w-xl animate-in fade-in zoom-in-95 duration-300">
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <ShieldCheck className="text-emerald-400" /> 
                                Seguridad de la Cuenta
                            </h2>
                            
                            <div className="mb-8 p-5 bg-slate-900/60 rounded-xl border border-slate-700/50">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-400">Usuario actual</p>
                                        <p className="text-xl font-bold text-white">{currentUser?.username}</p>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider
                                        ${isAdmin ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-sky-500/10 border-sky-500/20 text-sky-400'}
                                    `}>
                                        Rol: {currentUser?.role === 'ADMIN' ? 'Administrador' : 'Visualizador'}
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Esta cuenta representa tu acceso personal al Dashboard de HexaSense. Para garantizar la seguridad del sistema, se recomienda utilizar contraseñas seguras y actualizarlas periódicamente.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-white">Actualizar Contraseña</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nueva Contraseña</label>
                                        <input 
                                            type="password"
                                            value={updatePassword}
                                            onChange={e => setUpdatePassword(e.target.value)}
                                            placeholder="Introduce un mínimo de 8 caracteres"
                                            className="w-full bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg px-4 py-2.5 text-white outline-none transition-all"
                                        />
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleUpdatePassword(currentUser?.id || '')}
                                        disabled={isSubmitting || updatePassword.length < 8}
                                        className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
                                        Guardar Nueva Contraseña
                                    </button>
                                    
                                    {success && <p className="text-sm text-emerald-400 font-medium animate-in fade-in">{success}</p>}
                                    {error && <p className="text-sm text-rose-500 font-medium animate-in fade-in">{error}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: USUARIOS --- */}
                    {activeSection === 'usuarios' && isAdmin && (
                        <div className="h-full flex flex-col animate-in fade-in duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Users className="text-indigo-400" /> 
                                        Gestión de Usuarios
                                    </h2>
                                    <p className="text-sm text-slate-400 mt-1">Administra quién tiene acceso y modifica permisos.</p>
                                </div>
                                <button 
                                    onClick={() => setIsAdding(!isAdding)}
                                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2
                                        ${isAdding 
                                            ? 'bg-slate-700 text-white hover:bg-slate-600' 
                                            : 'bg-sky-600 text-white hover:bg-sky-500 shadow-lg'
                                        }`}
                                >
                                    {isAdding ? 'Cancelar Creación' : <><UserPlus size={16} /> Nuevo Usuario</>}
                                </button>
                            </div>

                            {isAdding && (
                                <form onSubmit={handleAddUser} className="mb-6 bg-slate-900/80 p-5 rounded-xl border border-slate-700 shadow-xl animate-in slide-in-from-top-2">
                                    <h3 className="text-sm font-bold text-white mb-4">Añadir Nuevo Acceso</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Usuario</label>
                                            <input 
                                                required
                                                value={newUsername}
                                                onChange={e => setNewUsername(e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                                                placeholder="Ej: nuevo_admin"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Contraseña</label>
                                            <input 
                                                required
                                                type="password"
                                                value={newPassword}
                                                onChange={e => setNewPassword(e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                                                placeholder="Min. 8 caracteres"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Privilegios (Rol)</label>
                                            <select 
                                                value={newRole}
                                                onChange={e => setNewRole(e.target.value as 'ADMIN' | 'VIEWER')}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                                            >
                                                <option value="VIEWER">Visualizador (Solo Lectura)</option>
                                                <option value="ADMIN">Administrador (Total)</option>
                                            </select>
                                        </div>
                                    </div>
                                    {error && <p className="text-sm text-rose-500 mb-3 font-medium">{error}</p>}
                                    <button 
                                        disabled={isSubmitting || newPassword.length < 8}
                                        className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg text-sm transition-all"
                                    >
                                        {isSubmitting ? 'Procediendo...' : 'Crear Usuario'}
                                    </button>
                                </form>
                            )}

                            <div className="flex-1 overflow-hidden border border-slate-700/50 rounded-xl bg-slate-900/40 flex flex-col">
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left text-sm text-slate-400">
                                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/80 sticky top-0 z-10 border-b border-slate-700/50">
                                            <tr>
                                                <th className="px-6 py-4 font-bold">Usuario</th>
                                                <th className="px-6 py-4 font-bold">Rol de Acceso</th>
                                                <th className="px-6 py-4 font-bold hidden sm:table-cell">Registrado el</th>
                                                <th className="px-6 py-4 font-bold text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={4} className="text-center py-12">
                                                        <Loader2 className="animate-spin text-sky-500 mx-auto mb-2" size={32} />
                                                        <span className="text-sm">Cargando usuarios...</span>
                                                    </td>
                                                </tr>
                                            ) : users.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="text-center py-12 italic">
                                                        No hay usuarios registrados aparte del administrador inicial.
                                                    </td>
                                                </tr>
                                            ) : (
                                                users.map(user => (
                                                    <React.Fragment key={user.id}>
                                                        <tr className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                                                            <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                                                <div className={`p-1.5 rounded-md ${user.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-400'}`}>
                                                                    <Shield size={16} />
                                                                </div>
                                                                {user.username}
                                                                {user.id === currentUser?.id && (
                                                                    <span className="bg-sky-600 text-white text-[10px] px-1.5 py-0.5 rounded ml-2 uppercase font-bold tracking-wider">Tú</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {user.role === 'ADMIN' ? 'Administrador' : 'Visualizador'}
                                                            </td>
                                                            <td className="px-6 py-4 hidden sm:table-cell font-mono text-xs">
                                                                {new Date(user.created_at).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-6 py-4 text-right space-x-2">
                                                                {user.id !== currentUser?.id && (
                                                                    <button 
                                                                        onClick={() => {
                                                                            setUpdatingPasswordUserId(updatingPasswordUserId === user.id ? null : user.id);
                                                                            setUpdatePassword('');
                                                                        }}
                                                                        className={`p-2 rounded transition-all ${updatingPasswordUserId === user.id ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-sky-400 hover:bg-slate-700'}`}
                                                                        title="Cambiar contraseña de este usuario"
                                                                    >
                                                                        <Key size={16} />
                                                                    </button>
                                                                )}
                                                                {isProtectedUser(user) ? (
                                                                    <button
                                                                        disabled
                                                                        className="p-2 text-slate-600 bg-slate-800/50 rounded cursor-not-allowed inline-flex"
                                                                        title={user.username === 'admin' ? 'El usuario admin está protegido de eliminación' : 'No puedes eliminar tu propio usuario'}
                                                                    >
                                                                        <Lock size={16} />
                                                                    </button>
                                                                ) : (
                                                                    <button 
                                                                        onClick={() => handleDeleteUser(user.id, user.username)}
                                                                        className="p-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-500 rounded transition-all inline-flex"
                                                                        title="Eliminar usuario definitivamente"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                        {updatingPasswordUserId === user.id && (
                                                            <tr className="bg-slate-900/60 border-b border-sky-900/30">
                                                                <td colSpan={4} className="px-6 py-4">
                                                                    <div className="flex items-center gap-3 animate-in fade-in max-w-lg ml-auto">
                                                                        <Key className="text-sky-500" size={16} />
                                                                        <input 
                                                                            type="password"
                                                                            value={updatePassword}
                                                                            onChange={e => setUpdatePassword(e.target.value)}
                                                                            placeholder={`Nueva contraseña para ${user.username}...`}
                                                                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-sky-500 outline-none"
                                                                        />
                                                                        <button 
                                                                            onClick={() => handleUpdatePassword(user.id)}
                                                                            disabled={isSubmitting || updatePassword.length < 8}
                                                                            className="bg-sky-600 px-4 py-2 rounded-lg text-sm font-bold text-white hover:bg-sky-500 disabled:opacity-50 transition-all"
                                                                        >
                                                                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Confirmar Cambio'}
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: AUDITORÍA --- */}
                    {activeSection === 'logs' && isAdmin && (
                        <div className="h-full flex flex-col animate-in fade-in duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Clock className="text-rose-400" /> 
                                        Registros de Auditoría
                                    </h2>
                                    <p className="text-sm text-slate-400 mt-1">Historial inmutable de acciones críticas del sistema.</p>
                                </div>
                                <button 
                                    onClick={fetchAuditLogs}
                                    className="px-4 py-2 text-sm font-bold bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all flex items-center gap-2 border border-slate-700"
                                    title="Sincronizar logs"
                                >
                                    <RefreshCw size={16} className={isLoadingLogs ? 'animate-spin' : ''} />
                                    Refrescar
                                </button>
                            </div>

                            <div className="flex-1 overflow-hidden border border-slate-700/50 rounded-xl bg-slate-900/40 flex flex-col">
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left text-sm text-slate-400">
                                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/80 sticky top-0 z-10 border-b border-slate-700/50">
                                            <tr>
                                                <th className="px-6 py-4 font-bold">Fecha / Hora</th>
                                                <th className="px-6 py-4 font-bold">Acción</th>
                                                <th className="px-6 py-4 font-bold">Operador</th>
                                                <th className="px-6 py-4 font-bold">Detalles de Operación</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoadingLogs ? (
                                                <tr>
                                                    <td colSpan={4} className="text-center py-12">
                                                        <Loader2 className="animate-spin text-slate-500 mx-auto mb-2" size={32} />
                                                        <span className="text-sm">Recuperando historial...</span>
                                                    </td>
                                                </tr>
                                            ) : auditLogs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="text-center py-12 italic text-slate-500">
                                                        No se ha registrado ninguna auditoría todavía.
                                                    </td>
                                                </tr>
                                            ) : (
                                                auditLogs.map(log => (
                                                    <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                                        <td className="px-6 py-4 font-mono text-xs text-slate-300">
                                                            {new Date(log.created_at).toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded inline-block border ${
                                                                log.action.includes('DELETE') ? 'text-rose-400 bg-rose-400/5 border-rose-400/20' :
                                                                log.action.includes('CREATE') ? 'text-emerald-400 bg-emerald-400/5 border-emerald-400/20' :
                                                                'text-sky-400 bg-sky-400/5 border-sky-400/20'
                                                            }`}>
                                                                {log.action}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 font-medium text-slate-300">
                                                            @{log.username}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-300">
                                                            {log.details}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: SISTEMA --- */}
                    {activeSection === 'sistema' && (
                        <div className="max-w-2xl animate-in fade-in zoom-in-95 duration-300">
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Database className="text-sky-400" /> 
                                Información del Entorno
                            </h2>
                            
                            <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-700/50 space-y-6">
                                
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Gateway y Middleware</h4>
                                    <div className="flex justify-between items-center py-2 px-3 bg-slate-800 rounded text-sm">
                                        <span className="text-slate-400">Plataforma Host</span>
                                        <span className="text-white font-mono bg-slate-950 px-2 py-0.5 rounded">Vercel Serverless Platform</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 px-3 mt-1 text-sm">
                                        <span className="text-slate-400">Entorno Operativo</span>
                                        <span className="text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded">Producción Segura</span>
                                    </div>
                                </div>

                                <div className="border-t border-slate-800 pt-6">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Persistencia de Datos</h4>
                                    <div className="flex justify-between items-center py-2 px-3 bg-slate-800 rounded text-sm">
                                        <span className="text-slate-400">Base de Datos Principal</span>
                                        <span className="text-white font-mono bg-slate-950 px-2 py-0.5 rounded">PostgreSQL ver @15</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 px-3 mt-1 text-sm">
                                        <span className="text-slate-400">Proveedor DBaaS</span>
                                        <span className="text-white font-medium">Supabase / Vercel Edge</span>
                                    </div>
                                </div>

                                <div className="border-t border-slate-800 pt-6">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Red de Sensores (LNS)</h4>
                                    <div className="flex justify-between items-center py-2 px-3 bg-slate-800 rounded text-sm">
                                        <span className="text-slate-400">Topología</span>
                                        <span className="text-white font-medium">LoRaWAN®</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 px-3 mt-1 text-sm">
                                        <span className="text-slate-400">Network Server</span>
                                        <span className="text-white font-bold text-sky-400">The Things Network (TTN)</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 px-3 mt-1 text-sm">
                                        <span className="text-slate-400">Webhook Sync</span>
                                        <span className="text-white font-mono bg-slate-950 px-2 py-0.5 rounded text-xs select-all">/api/webhook</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default SettingsView;
