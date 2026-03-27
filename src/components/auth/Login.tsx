import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Loader2, ShieldCheck, Lock, User } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projectName, setProjectName] = useState('HexaSense');
  const { login } = useAuth();

  React.useEffect(() => {
    fetch('/api/system?action=getSettings')
      .then(res => res.json())
      .then(data => {
        if (data.project_name) setProjectName(data.project_name);
      })
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-sky-500/10 rounded-3xl border border-sky-500/20 shadow-inner mb-6">
            <ShieldCheck size={48} className="text-sky-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Acceso {projectName}</h1>
          <p className="text-slate-400 mt-2">Dashboard de Monitoreo IoT</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Usuario</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-slate-500">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all"
                  placeholder="Introduce tu usuario"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Contraseña</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-slate-500">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm animate-pulse">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-sky-500/50 text-white font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                'Entrar al Panel'
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-slate-500 text-sm">
          Sistema de gestión de sensores {projectName} &copy; 2026
        </p>
      </div>
    </div>
  );
};

export default Login;
