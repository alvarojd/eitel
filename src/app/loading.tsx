import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={32} className="text-sky-500 animate-pulse" />
        </div>
      </div>
      
      <div className="mt-8 text-center space-y-2">
        <h2 className="text-xl font-semibold text-white tracking-tight">Sincronizando Sensores</h2>
        <p className="text-slate-500 text-sm animate-pulse">Conectando con la red IoT...</p>
      </div>

      {/* Skeleton Mockup for the background */}
      <div className="mt-12 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 opacity-20 pointer-events-none">
          {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-800 rounded-2xl animate-pulse"></div>
          ))}
          <div className="md:col-span-3 h-64 bg-slate-800 rounded-2xl animate-pulse"></div>
      </div>
    </div>
  );
}
