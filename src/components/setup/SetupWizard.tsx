import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  MapPin, 
  Lock, 
  Rocket, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface SetupWizardProps {
  onComplete: () => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    projectName: 'HexaSense IoT Dashboard',
    ttnAppId: '',
    ttnApiKey: '',
    defaultLat: '40.4168',
    defaultLng: '-3.7038',
    adminPassword: '',
    confirmPassword: ''
  });

  const totalSteps = 5;

  const handleNext = () => {
    if (step === 4) {
      if (formData.adminPassword !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      if (formData.adminPassword.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }
    setError(null);
    setStep(s => Math.min(s + 1, totalSteps));
  };

  const handleBack = () => {
    setError(null);
    setStep(s => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error en la configuración');

      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-sky-500/20 text-sky-400 rounded-xl">
                <Settings size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Identidad del Proyecto</h2>
                <p className="text-slate-400 text-sm">Define cómo se verá tu dashboard</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Nombre del Proyecto</label>
              <input 
                type="text"
                value={formData.projectName}
                onChange={e => setFormData({...formData, projectName: e.target.value})}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-medium"
                placeholder="Ej: HexaSense Madrid Center"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                <Cpu size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Conectividad IoT</h2>
                <p className="text-slate-400 text-sm">Configura tu aplicación de The Things Network</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">TTN Application ID</label>
                <input 
                  type="text"
                  value={formData.ttnAppId}
                  onChange={e => setFormData({...formData, ttnAppId: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  placeholder="hexasense-v3-app"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">TTN API Key (Opcional)</label>
                <input 
                  type="password"
                  value={formData.ttnApiKey}
                  onChange={e => setFormData({...formData, ttnApiKey: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  placeholder="NNSXS.KEY..."
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <MapPin size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Geolocalización</h2>
                <p className="text-slate-400 text-sm">Ubicación predeterminada para el mapa</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Latitud</label>
                <input 
                  type="text"
                  value={formData.defaultLat}
                  onChange={e => setFormData({...formData, defaultLat: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Longitud</label>
                <input 
                  type="text"
                  value={formData.defaultLng}
                  onChange={e => setFormData({...formData, defaultLng: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl">
                <Lock size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Seguridad</h2>
                <p className="text-slate-400 text-sm">Contraseña para el usuario 'admin'</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Contraseña Administrador</label>
                <input 
                  type="password"
                  value={formData.adminPassword}
                  onChange={e => setFormData({...formData, adminPassword: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Confirmar Contraseña</label>
                <input 
                  type="password"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
            <div className="flex flex-col items-center gap-4">
              {success ? (
                <div className="bg-emerald-500/20 text-emerald-400 p-6 rounded-full animate-bounce">
                  <CheckCircle2 size={64} />
                </div>
              ) : (
                <div className="bg-sky-500/20 text-sky-400 p-6 rounded-full">
                  <Rocket size={64} className={loading ? "animate-pulse" : "animate-bounce"} />
                </div>
              )}
              <h2 className="text-2xl font-bold text-white">
                {success ? '¡Configuración Lista!' : 'Resumen de Configuración'}
              </h2>
              <p className="text-slate-400 max-w-sm mx-auto">
                {success 
                  ? 'El sistema ha sido inicializado correctamente. Serás redirigido al panel de inicio de sesión.'
                  : 'Revisa que todo esté correcto antes de finalizar la instalación.'}
              </p>
            </div>

            {!success && (
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 text-left space-y-3">
                <div className="flex justify-between border-bottom border-slate-700 pb-2">
                  <span className="text-slate-500">Proyecto:</span>
                  <span className="text-white font-medium">{formData.projectName}</span>
                </div>
                <div className="flex justify-between border-bottom border-slate-700 pb-2">
                  <span className="text-slate-500">TTN App:</span>
                  <span className="text-white font-medium">{formData.ttnAppId || 'No configurada'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ubicación:</span>
                  <span className="text-white font-medium">{formData.defaultLat}, {formData.defaultLng}</span>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 z-50">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header / Progress */}
        <div className="p-8 pb-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-black bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              HexaSense <span className="text-slate-500 font-light">| Setup</span>
            </h1>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(i => (
                <div 
                  key={i} 
                  className={`h-1.5 w-10 rounded-full transition-all duration-300 ${
                    i === step ? 'bg-sky-500 w-16' : i < step ? 'bg-sky-500/40' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 pt-4 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}
          
          {renderStep()}
        </div>

        {/* Footer Actions */}
        <div className="p-8 pt-0 flex gap-4">
          {step > 1 && step < 5 && !success && (
            <button 
              onClick={handleBack}
              disabled={loading}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-4 rounded-2xl border border-slate-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <ChevronLeft size={20} /> Atrás
            </button>
          )}

          {step < totalSteps && (
            <button 
              onClick={handleNext}
              className="flex-[2] bg-sky-600 hover:bg-sky-500 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-sky-900/20 flex items-center justify-center gap-2 transition-all group"
            >
              Siguiente <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          {step === totalSteps && !success && (
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : 'Finalizar Instalación'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
