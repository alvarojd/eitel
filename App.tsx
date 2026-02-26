import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import HexMap from './components/HexMap';
import StatsPanel from './components/StatsPanel';
import SensorDetail from './components/SensorDetail';
import LegendPanel from './components/LegendPanel';
import DeviceList from './components/DeviceList';
import SettingsPanel from './components/SettingsPanel';
import { getStats } from './services/mockDataService';
import { fetchSensorData } from './services/ttnService';
import { SensorData } from './types';
import { Loader2, Database, ShieldCheck, PlayCircle } from 'lucide-react';

const App: React.FC = () => {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('resumen');

  // Environment detection helper
  const isLocal = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '0.0.0.0' ||
      window.location.hostname.includes('192.168.'));

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSensorData();
        setSensors(data);
      } catch (error) {
        console.error("Error polling data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => getStats(sensors), [sensors]);

  const selectedSensor = useMemo(() =>
    sensors.find(s => s.id === selectedSensorId) || null,
    [sensors, selectedSensorId]);

  const handleSensorSelect = (sensor: SensorData) => {
    setSelectedSensorId(sensor.id === selectedSensorId ? null : sensor.id);
  };

  const handleCloseDetail = () => {
    setSelectedSensorId(null);
  };

  const renderSidebar = () => {
    if (activeTab === 'configuracion') {
      return (
        <SettingsPanel />
      );
    }

    if (selectedSensor) {
      return <SensorDetail sensor={selectedSensor} isSimulated={isLocal} onClose={handleCloseDetail} />;
    }

    return <LegendPanel />;
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      sidebar={renderSidebar()}
    >
      <div className="flex flex-col h-full">
        {/* Top Summary Stats */}
        <StatsPanel stats={stats} />

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 relative rounded-2xl border border-slate-700/50 shadow-inner bg-slate-900/40 flex flex-col lg:flex-row">

          {loading && sensors.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 size={48} className="animate-spin text-sky-500 mx-auto mb-4" />
                <p className="text-slate-400">
                  {isLocal ? 'Generando simulación local...' : 'Conectando a Base de Datos Vercel...'}
                </p>
              </div>
            </div>
          ) : activeTab === 'configuracion' ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-2xl w-full text-center">
                <div className="mb-8 flex justify-center">
                  <div className="w-20 h-20 bg-sky-500/10 rounded-3xl flex items-center justify-center border border-sky-500/20 shadow-inner">
                    <Database size={40} className="text-sky-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Panel de Herramientas y Datos</h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  Utiliza el panel derecho para alternar entre el flujo de datos real de TTN o la generación de datos simulados para pruebas de despliegue.
                </p>

                <div className="bg-slate-800/80 p-6 rounded-2xl border border-sky-500/30 text-left shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="text-sky-400" size={24} />
                    <h3 className="text-white font-bold text-lg">Modo Automático Activo</h3>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    La aplicación ahora detecta automáticamente el entorno de ejecución:
                  </p>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2 text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span><strong>Local:</strong> Datos simulados para pruebas rápidas.</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span><strong>Vercel / Producción:</strong> Datos reales vía TTN + Postgres.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : sensors.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-8">
                <p className="text-slate-300 font-medium text-lg">Esperando datos...</p>
                <p className="text-slate-500 mt-2 text-sm max-w-md">
                  No se han encontrado registros en la base de datos. Asegúrate de configurar el Webhook en TTN apuntando a: <br />
                  <code className="bg-slate-800 p-1 rounded text-sky-400 mt-2 block select-all">/api/webhook</code>
                </p>
              </div>
            </div>
          ) : (
            activeTab === 'resumen' ? (
              <HexMap
                sensors={sensors}
                onSensorSelect={handleSensorSelect}
                selectedSensorId={selectedSensorId}
              />
            ) : (
              <DeviceList
                sensors={sensors}
                onSensorSelect={handleSensorSelect}
                activeTab={activeTab}
              />
            )
          )}

          {activeTab === 'resumen' && (
            <div className="absolute bottom-6 right-6 flex flex-col gap-2">
              <button className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white hover:bg-slate-700 border border-slate-600 shadow-lg font-bold text-xl transition-colors">+</button>
              <button className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white hover:bg-slate-700 border border-slate-600 shadow-lg font-bold text-xl transition-colors">-</button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default App;