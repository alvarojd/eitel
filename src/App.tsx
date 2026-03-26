import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/layout/Layout';
import HexMap from './components/dashboard/HexMap';
import GeoMap from './components/map/GeoMap';
import CronoPanel from './components/dashboard/CronoPanel';
import SensorDetail from './components/dashboard/SensorDetail';
import LegendPanel from './components/dashboard/LegendPanel';
import DeviceList from './components/dashboard/DeviceList';
import DeviceManagementPanel from './components/dashboard/DeviceManagementPanel';
import SettingsPanel from './components/layout/SettingsPanel';
import StatsPanel from './components/common/StatsPanel';
import ReportsPanel from './components/reports/ReportsPanel';
import { fetchSensorData } from './services/ttnService';
import { SensorData, Tab, Stats } from './types';
import { Loader2, Database, ShieldCheck, PlayCircle } from 'lucide-react';
import { useAuth } from './components/auth/AuthContext';
import Login from './components/auth/Login';
import useSWR from 'swr';

const App: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.RESUMEN);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: sensors = [], isLoading: loading, mutate: loadData } = useSWR<SensorData[]>(
    isAuthenticated ? 'sensors' : null, 
    fetchSensorData, 
    { refreshInterval: 300000 } // 5 minutes polling
  );

  const stats = useMemo((): Stats => {
    if (sensors.length === 0) {
      return { total: 0, critical: 0, warning: 0, ideal: 0, offline: 0, lowBattery: 0, absenceCount: 0, avgTemp: 0 };
    }

    const counter = sensors.reduce(
      (acc, s) => {
        acc.total += 1;
        if ([2, 3, 4].includes(s.estado_id)) acc.critical += 1;
        else if ([5, 6, 7, 8].includes(s.estado_id)) acc.warning += 1;
        else if (s.estado_id === 9) acc.ideal += 1;
        else if (s.estado_id === 1) acc.offline += 1;

        if (s.indicators?.lowBattery || (s.estado_id !== 1 && s.battery < 20)) {
          acc.lowBattery += 1;
        }
        if (s.indicators?.longTermNoOccupancy) {
          acc.absenceCount += 1;
        }
        if (s.estado_id !== 1) {
          acc.sumTemp += s.temperature;
          acc.onlineCount += 1;
        }
        return acc;
      },
      { total: 0, critical: 0, warning: 0, ideal: 0, offline: 0, lowBattery: 0, absenceCount: 0, sumTemp: 0, onlineCount: 0 }
    );

    const avgTemp = counter.onlineCount > 0 ? counter.sumTemp / counter.onlineCount : 0;

    return {
      total: counter.total,
      critical: counter.critical,
      warning: counter.warning,
      ideal: counter.ideal,
      offline: counter.offline,
      lowBattery: counter.lowBattery,
      absenceCount: counter.absenceCount,
      avgTemp: parseFloat(avgTemp.toFixed(1))
    };
  }, [sensors]);

  const filteredSensors = useMemo(() => {
    if (!searchTerm) return sensors;
    const lowerSearch = searchTerm.toLowerCase();
    return sensors.filter(s => 
      (s.name || '').toLowerCase().includes(lowerSearch) || 
      (s.devEui || '').toLowerCase().includes(lowerSearch) ||
      (s.id || '').toLowerCase().includes(lowerSearch)
    );
  }, [sensors, searchTerm]);

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
    if (activeTab === Tab.CONFIGURACION) {
      return (
        <SettingsPanel />
      );
    }

    if (activeTab === Tab.DISPOSITIVOS && isAdmin) {
      return <DeviceManagementPanel sensor={selectedSensor} onClose={handleCloseDetail} onRequireUpdate={loadData} />;
    }

    if (selectedSensor) {
      return <SensorDetail sensor={selectedSensor} onClose={handleCloseDetail} />;
    }

    return <LegendPanel stats={stats} />;
  };

  const renderMainContent = () => {
    if (loading && sensors.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-sky-500 mx-auto mb-4" />
            <p className="text-slate-400">
              Conectando a Base de Datos Vercel...
            </p>
          </div>
        </div>
      );
    }

    if (activeTab === Tab.CONFIGURACION) {
      if (!isAdmin) {
        return (
          <div className="flex-1 flex items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="max-w-md">
              <div className="w-20 h-20 bg-sky-500/10 rounded-3xl flex items-center justify-center border border-sky-500/20 shadow-inner mx-auto mb-6">
                <ShieldCheck size={40} className="text-sky-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Gestión de Perfil</h2>
              <p className="text-slate-400 leading-relaxed">
                Has accedido al panel de configuración de tu cuenta. Utiliza el panel lateral derecho para actualizar tus credenciales de acceso y gestionar tu seguridad.
              </p>
              <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700 inline-flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                Sincronizado con la base de datos central
              </div>
            </div>
          </div>
        );
      }

      return (
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
                <h3 className="text-white font-bold text-lg">Conexión a Datos Reales</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                La aplicación está conectada directamente a la infraestructura de producción:
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span><strong>Entorno de Datos:</strong> TTN + Postgres (Supabase).</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span><strong>Endpoints:</strong> /api/sensors, /api/history, /api/reports.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    if (sensors.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-slate-300 font-medium text-lg">Esperando datos...</p>
            <p className="text-slate-500 mt-2 text-sm max-w-md">
              No se han encontrado registros en la base de datos. Asegúrate de configurar el Webhook en TTN apuntando a: <br />
              <code className="bg-slate-800 p-1 rounded text-sky-400 mt-2 block select-all">/api/webhook</code>
            </p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case Tab.MAPA:
        return (
          <GeoMap
            sensors={filteredSensors}
            onSensorSelect={handleSensorSelect}
            selectedSensorId={selectedSensorId}
          />
        );
      case Tab.DISPOSITIVOS:
        return (
          <DeviceList
            sensors={filteredSensors}
            onSensorSelect={handleSensorSelect}
            activeTab={activeTab}
          />
        );
      case Tab.RESUMEN:
        return (
          <HexMap
            sensors={filteredSensors}
            onSensorSelect={handleSensorSelect}
            selectedSensorId={selectedSensorId}
          />
        );
      case Tab.CRONO:
        return <CronoPanel sensors={sensors} onSensorSelect={handleSensorSelect} />;
      case Tab.INFORMES:
        return <ReportsPanel sensors={sensors} />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-400">Página no encontrada</p>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as Tab)}
      sidebar={renderSidebar()}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      <div className="flex flex-col h-full">
        {/* Top Summary Stats - Only show in Resumen and Mapa */}
        {(activeTab === Tab.RESUMEN || activeTab === Tab.MAPA) && (
          <StatsPanel stats={stats} />
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 relative rounded-2xl border border-slate-700/50 shadow-inner bg-slate-900/40 flex flex-col lg:flex-row">
          {renderMainContent()}

          {activeTab === Tab.RESUMEN && (
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