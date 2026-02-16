import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import HexMap from './components/HexMap';
import StatsPanel from './components/StatsPanel';
import SensorDetail from './components/SensorDetail';
import LegendPanel from './components/LegendPanel';
import DeviceList from './components/DeviceList';
import { getStats } from './services/mockDataService';
import { fetchSensorData } from './services/ttnService';
import { SensorData } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('resumen');

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
    const interval = setInterval(loadData, 15000);
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

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      sidebar={
        selectedSensor
          ? <SensorDetail sensor={selectedSensor} onClose={handleCloseDetail} />
          : <LegendPanel />
      }
    >
      <div className="flex flex-col h-full">
        {/* Top Summary Stats */}
        <StatsPanel stats={stats} />

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 relative rounded-2xl border border-slate-700/50 shadow-inner bg-slate-900/40 flex">

          {loading && sensors.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 size={48} className="animate-spin text-sky-500 mx-auto mb-4" />
                <p className="text-slate-400">Conectando a Base de Datos Vercel...</p>
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