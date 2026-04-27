'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { SensorState } from '@/core/entities/Sensor';
import { getSensors } from '@/infrastructure/actions/sensorActions';
import { filterSensors } from '@/core/utils/filters';
import { useFilter } from './FilterContext';

interface SensorContextType {
  sensors: SensorState[];
  selectedSensorId: string | null;
  setSelectedSensorId: (id: string | null) => void;
  selectedSensor: SensorState | null;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  isStatusInfoOpen: boolean;
  setIsStatusInfoOpen: (open: boolean) => void;
  activeFilter: string;
  filteredSensors: SensorState[];
}

const SensorContext = createContext<SensorContextType | undefined>(undefined);

export function SensorProvider({ 
  children, 
  initialSensors = []
}: { 
  children: React.ReactNode;
  initialSensors?: SensorState[];
}) {
  const { activeFilter, searchTerm } = useFilter();
  const [sensors, setSensors] = useState<SensorState[]>(initialSensors);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isStatusInfoOpen, setIsStatusInfoOpen] = useState(false);

  // Sincronizar el estado interno si el prop initialSensors cambia (útil para páginas del lado del cliente)
  useEffect(() => {
    if (initialSensors && initialSensors.length > 0) {
      setSensors(initialSensors);
    }
  }, [initialSensors]);

  // Polling para mantener los datos frescos
  useEffect(() => {
    const poll = async () => {
      try {
        const freshSensors = await getSensors();
        if (freshSensors && freshSensors.length > 0) {
          setSensors(freshSensors);
        }
      } catch (error) {
        console.error('Error polling sensors:', error);
      }
    };

    const interval = setInterval(poll, 30000); // Cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const filteredSensors = useMemo(() => {
    return filterSensors(sensors, activeFilter, searchTerm);
  }, [sensors, activeFilter, searchTerm]);

  const selectedSensor = useMemo(() => {
    return sensors.find(s => s.id === selectedSensorId) || null;
  }, [selectedSensorId, sensors]);

  // Si seleccionamos un sensor, abrimos el Drawer automáticamente
  const handleSetSelectedSensorId = (id: string | null) => {
    setSelectedSensorId(id);
    if (id) setIsDrawerOpen(true);
  };

  const handleSetIsDrawerOpen = (open: boolean) => {
    setIsDrawerOpen(open);
    if (!open) setSelectedSensorId(null);
  };

  const value = {
    sensors,
    selectedSensorId,
    setSelectedSensorId: handleSetSelectedSensorId,
    selectedSensor,
    isDrawerOpen,
    setIsDrawerOpen: handleSetIsDrawerOpen,
    isStatusInfoOpen,
    setIsStatusInfoOpen,
    activeFilter,
    filteredSensors
  };

  return (
    <SensorContext.Provider value={value}>
      {children}
    </SensorContext.Provider>
  );
}

export function useSensor() {
  const context = useContext(SensorContext);
  if (context === undefined) {
    throw new Error('useSensor must be used within a SensorProvider');
  }
  return context;
}
