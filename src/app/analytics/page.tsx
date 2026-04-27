'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/presentation/components/layout/DashboardShell';
import { PageHeader } from '@/presentation/components/layout/PageHeader';
import { SensorProvider, useSensor } from '@/presentation/context/SensorContext';
import { AnalyticsToolbar, AnalyticsFilters } from '@/presentation/components/analytics/AnalyticsToolbar';
import { AnalyticsChart } from '@/presentation/components/analytics/AnalyticsChart';
import { AnalyticsStats } from '@/presentation/components/analytics/AnalyticsStats';
import { getAnalyticsData, AnalyticsDataPoint } from '@/infrastructure/actions/analyticsActions';
import { getSensors } from '@/infrastructure/actions/sensorActions';
import { getProjectName } from '@/infrastructure/actions/systemActions';
import { LineChart, Layout, Maximize2, Loader2 } from 'lucide-react';

export default function AnalyticsPage() {
  const [sensors, setSensors] = useState<any[]>([]);
  const [projectName, setProjectName] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  useEffect(() => {
    Promise.all([getSensors(), getProjectName()]).then(([s, p]) => {
      setSensors(s);
      setProjectName(p);
      setIsInitialLoading(false);
    });
  }, []);

  if (isInitialLoading) {
    return (
      <DashboardShell projectName={projectName}>
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <Loader2 className="animate-spin text-sky-500" size={40} />
        </div>
      </DashboardShell>
    );
  }

  return (
    <SensorProvider initialSensors={sensors}>
      <AnalyticsContent projectName={projectName} />
    </SensorProvider>
  );
}

const VARIABLE_CONFIG = {
  temperature: { label: 'Temperatura', unit: '°C', color: '#0ea5e9' },
  humidity: { label: 'Humedad', unit: '%', color: '#10b981' },
  co2: { label: 'CO2', unit: 'ppm', color: '#f59e0b' },
};

function AnalyticsContent({ projectName }: { projectName: string }) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const [filters, setFilters] = useState<AnalyticsFilters>({
    deviceId: '',
    startDate: yesterday,
    endDate: today,
    variable: 'temperature'
  });

  const [data, setData] = useState<AnalyticsDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (filters.deviceId) {
      setIsLoading(true);
      getAnalyticsData(filters.deviceId, filters.startDate, filters.endDate, filters.variable)
        .then(setData)
        .finally(() => setIsLoading(false));
    }
  }, [filters]);

  const variableInfo = VARIABLE_CONFIG[filters.variable as keyof typeof VARIABLE_CONFIG] || { label: '', unit: '', color: '#fff' };

  return (
    <DashboardShell projectName={projectName}>
      <div className="flex flex-col h-full gap-5 animate-in fade-in duration-700">
        <PageHeader projectName={projectName} />

        <AnalyticsToolbar 
          filters={filters} 
          setFilters={setFilters} 
          isLoading={isLoading} 
        />

        <div className="flex-1 flex flex-col gap-5 min-h-0">
          {/* Main Chart Card */}
          <div className="flex-1 bg-slate-900/20 border border-slate-800/50 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden group">
            {/* Decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <LineChart size={120} />
            </div>

            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                  <Layout className="text-sky-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Tendencia de {variableInfo.label}</h2>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-0.5">Visualización de Datos Históricos</p>
                </div>
              </div>
              <button className="p-3 bg-slate-950 border border-white/5 rounded-2xl text-white/40 hover:text-white transition-all hover:scale-110 active:scale-95 shadow-xl">
                <Maximize2 size={18} />
              </button>
            </div>

            <div className="flex-1 min-h-0 relative z-10">
              <AnalyticsChart 
                data={data} 
                variableLabel={variableInfo.label} 
                unit={variableInfo.unit} 
                color={variableInfo.color} 
              />
            </div>
          </div>

          {/* Stats Section */}
          <AnalyticsStats data={data} unit={variableInfo.unit} />
        </div>
      </div>
    </DashboardShell>
  );
}
