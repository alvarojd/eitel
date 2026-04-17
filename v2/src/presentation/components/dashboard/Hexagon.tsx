'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SensorState } from '@/core/entities/Sensor';
import { HEX_SIZE, STATUS_COLORS } from '@/core/constants';
import { Battery, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HexagonProps {
  sensor: SensorState;
  x: number;
  y: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

// Generate the polygon points for a pointy-topped hex
const getHexPoints = () => {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i - 30;
    const angle_rad = Math.PI / 180 * angle_deg;
    pts.push(`${HEX_SIZE * Math.cos(angle_rad)},${HEX_SIZE * Math.sin(angle_rad)}`);
  }
  return pts.join(' ');
};

const HEX_POINTS = getHexPoints();

export function HexagonComponent({ sensor, x, y, isSelected, onSelect }: HexagonProps) {
  const color = STATUS_COLORS[sensor.estadoId] || '#3b82f6';
  const isLowBattery = sensor.indicators?.lowBattery;
  const isNoOccupancy = sensor.indicators?.longTermNoOccupancy;

  return (
    <motion.g
      initial={{ scale: 0, opacity: 0, x, y }}
      animate={{ scale: 1, opacity: 1, x, y }}
      transition={{ 
        type: 'spring', 
        stiffness: 260, 
        damping: 20,
        delay: Math.random() * 0.5 
      }}
      onClick={() => onSelect(sensor.id)}
      className="cursor-pointer"
    >
      {/* Hexagon shape with glow effect on selection/hover */}
      <motion.polygon
        points={HEX_POINTS}
        fill={color}
        fillOpacity={isSelected ? 1 : 0.8}
        stroke={isSelected ? '#fff' : '#0f172a'}
        strokeWidth={isSelected ? 3 : 1.5}
        whileHover={{ scale: 1.1, fillOpacity: 1 }}
        className="transition-colors duration-300"
        style={{
          filter: isSelected ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' : 'none'
        }}
      />

      {/* Numerical Indicator (Temp simplified) */}
      <text
        y={4}
        textAnchor="middle"
        className="fill-white text-[8px] font-bold pointer-events-none select-none"
      >
        {Math.round(sensor.latestMeasurement?.temperature || 0)}°
      </text>

      {/* Micro-icons Overlays */}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {isLowBattery && (
          <g transform="translate(-8, -10) scale(0.4)">
             <Battery className="text-white fill-rose-500" />
          </g>
        )}
        {isNoOccupancy && (
          <g transform="translate(4, -10) scale(0.4)">
             <Users className="text-white fill-amber-500" />
          </g>
        )}
      </motion.g>
    </motion.g>
  );
}
