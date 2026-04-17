'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { SensorState } from '@/core/entities/Sensor';
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
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isStatusInfoOpen, setIsStatusInfoOpen] = useState(false);

  const filteredSensors = useMemo(() => {
    return filterSensors(initialSensors, activeFilter, searchTerm);
  }, [initialSensors, activeFilter, searchTerm]);

  const selectedSensor = useMemo(() => {
    return initialSensors.find(s => s.id === selectedSensorId) || null;
  }, [selectedSensorId, initialSensors]);

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
    sensors: initialSensors,
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
