'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Dashboard Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-red-500/20 rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="text-red-500" size={32} />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Algo salió mal</h2>
        <p className="text-slate-400 mb-8">
          Ha ocurrido un error inesperado en el panel. Por favor, intenta recargar la página o volver al inicio.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            <RefreshCcw size={18} />
            Reintentar
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            <Home size={18} />
            Volver al Inicio
          </Link>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-black/50 rounded-lg text-left overflow-auto max-h-32 text-xs font-mono text-red-400">
            {error.message}
          </div>
        )}
      </div>
    </div>
  );
}
