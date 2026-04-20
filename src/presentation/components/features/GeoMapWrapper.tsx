'use client';

import dynamic from 'next/dynamic';
import { useSensor } from '@/presentation/context/SensorContext';
import { Loader2 } from 'lucide-react';

const GeoMap = dynamic(() => import('@/presentation/components/features/GeoMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[600px] bg-slate-900/50 flex flex-col items-center justify-center gap-4">
       <Loader2 className="animate-spin text-sky-500" size={32} />
       <p className="text-white/60 font-bold text-xs">Iniciando motor cartográfico...</p>
    </div>
  )
});

export function GeoMapWrapper() {
  const { filteredSensors, setSelectedSensorId } = useSensor();
  
  return (
    <GeoMap 
      sensors={filteredSensors} 
      onSensorSelect={setSelectedSensorId} 
    />
  );
}
