'use client';

import React, { useMemo } from 'react';
import { useSensor } from '../../context/SensorContext';
import { getHexPositions } from '@/core/utils/hexagons';
import { HEX_SIZE, HEX_GAP, STATUS_COLORS } from '@/core/constants';
import { HexagonComponent } from './Hexagon';

// Math for Hexagon Pointy-topped
const hexWidth = Math.sqrt(3) * HEX_SIZE;
const hexHeight = 2 * HEX_SIZE;

const hexToPixel = (q: number, r: number) => {
  const sizeWithGap = HEX_SIZE + (HEX_GAP / 2);
  const x = sizeWithGap * Math.sqrt(3) * (q + r / 2);
  const y = sizeWithGap * 3 / 2 * r;
  return { x, y };
};

export function HexGrid() {
  const { filteredSensors, selectedSensorId, setSelectedSensorId } = useSensor();

  // Generamos posiciones para todos los sensores recibidos (solo los filtrados)
  const sensorsWithCoords = useMemo(() => {
    const coords = getHexPositions(filteredSensors.length);
    return filteredSensors.map((s, i) => ({
      ...s,
      q: coords[i]?.q || 0,
      r: coords[i]?.r || 0,
    }));
  }, [filteredSensors]);

  // Cálculo dinámico del ViewBox para centrar la grilla
  const viewBox = useMemo(() => {
    if (sensorsWithCoords.length === 0) return "0 0 100 100";
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    sensorsWithCoords.forEach(s => {
      const { x, y } = hexToPixel(s.q, s.r);
      minX = Math.min(minX, x - hexWidth);
      maxX = Math.max(maxX, x + hexWidth);
      minY = Math.min(minY, y - hexHeight);
      maxY = Math.max(maxY, y + hexHeight);
    });

    const padding = 15;
    return `${minX - padding} ${minY - padding} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`;
  }, [sensorsWithCoords]);

  return (
       <div className="w-full h-full relative overflow-hidden group">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      <svg
        viewBox={viewBox}
        className="w-full h-full select-none cursor-grab active:cursor-grabbing p-4"
        preserveAspectRatio="xMidYMid meet"
      >
        {sensorsWithCoords.map((sensor) => {
          const { x, y } = hexToPixel(sensor.q, sensor.r);
          return (
            <HexagonComponent
              key={sensor.id}
              sensor={sensor}
              x={x}
              y={y}
              isSelected={selectedSensorId === sensor.id}
              onSelect={setSelectedSensorId}
            />
          );
        })}
      </svg>
      
      {/* Modern Overlay Legend */}
      <div className="absolute top-6 right-6 bg-slate-900/40 backdrop-blur-xl p-4 rounded-2xl border border-white/5 space-y-3 z-10 pointer-events-none hidden lg:block shadow-2xl">
         <div className="text-[10px] font-bold text-white/60 mb-2 border-b border-white/5 pb-2">Leyenda de Estados</div>
         <LegendItem color={STATUS_COLORS[9]} label="Situación Ideal" />
         <LegendItem color={STATUS_COLORS[2]} label="Alerta Crítica" />
         <LegendItem color={STATUS_COLORS[5]} label="Riesgo / Aviso" />
         <LegendItem color={STATUS_COLORS[1]} label="Sin Conexión" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
      <span className="text-[10px] font-bold text-white/90">{label}</span>
    </div>
  );
}
