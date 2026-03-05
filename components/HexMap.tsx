import React, { useMemo, useState } from 'react';
import { SensorData } from '../types';
import { HEX_SIZE, STATUS_COLORS } from '../constants';

interface HexMapProps {
  sensors: SensorData[];
  onSensorSelect: (sensor: SensorData) => void;
  selectedSensorId: string | null;
}

const HexMap: React.FC<HexMapProps> = ({ sensors, onSensorSelect, selectedSensorId }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Math for Hexagon Pointy-topped
  const hexWidth = Math.sqrt(3) * HEX_SIZE;
  const hexHeight = 2 * HEX_SIZE;

  // Calculate pixel coordinates from axial (q, r)
  const hexToPixel = (q: number, r: number) => {
    const x = HEX_SIZE * Math.sqrt(3) * (q + r / 2);
    const y = HEX_SIZE * 3 / 2 * r;
    return { x, y };
  };

  // Generate the polygon points for a single hex centered at 0,0
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const angle_deg = 60 * i - 30;
      const angle_rad = Math.PI / 180 * angle_deg;
      pts.push(`${HEX_SIZE * Math.cos(angle_rad)},${HEX_SIZE * Math.sin(angle_rad)}`);
    }
    return pts.join(' ');
  }, []);

  // Calculate ViewBox
  const { minX, maxX, minY, maxY } = useMemo(() => {
    if (sensors.length === 0) return { minX: 0, maxX: 100, minY: 0, maxY: 100 };
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    sensors.forEach(s => {
      const { x, y } = hexToPixel(s.q, s.r);
      minX = Math.min(minX, x - hexWidth);
      maxX = Math.max(maxX, x + hexWidth);
      minY = Math.min(minY, y - hexHeight);
      maxY = Math.max(maxY, y + hexHeight);
    });

    // Add padding
    const padding = 40;
    return { minX: minX - padding, maxX: maxX + padding, minY: minY - padding, maxY: maxY + padding };
  }, [sensors, hexWidth, hexHeight]);

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden bg-slate-900/50 rounded-xl relative">
      {/* Background Grid Pattern for texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      <svg
        viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
        className="w-full h-full max-h-[50vh] lg:max-h-[80vh] select-none filter drop-shadow-2xl"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {sensors.map((sensor) => {
          const { x, y } = hexToPixel(sensor.q, sensor.r);
          const isSelected = selectedSensorId === sensor.id;
          const isHovered = hoveredId === sensor.id;
          const color = STATUS_COLORS[sensor.estado_id] || '#3b82f6';
          const isLowBattery = sensor.indicators?.lowBattery || (sensor.battery < 20 && sensor.estado_id !== 1);
          const isNoOccupancy = sensor.indicators?.longTermNoOccupancy;

          return (
            <g
              key={sensor.id}
              transform={`translate(${x},${y})`}
              onMouseEnter={() => setHoveredId(sensor.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSensorSelect(sensor)}
              className="cursor-pointer transition-all duration-300"
              style={{ opacity: (selectedSensorId && !isSelected) ? 0.4 : 1 }}
            >
              {/* Hexagon Shape */}
              <polygon
                points={points}
                fill={color}
                fillOpacity={isSelected || isHovered ? 1 : 0.8}
                stroke={isSelected ? '#fff' : '#0f172a'}
                strokeWidth={isSelected ? 3 : 1.5}
                strokeLinejoin="round"
                className="transition-all duration-300 ease-out"
                filter={isSelected || isHovered ? "url(#glow)" : undefined}
                transform={isHovered ? 'scale(1.1)' : 'scale(1)'}
              />

              {/* Icons Overlay Container */}
              <g transform="translate(0, 0)">
                {/* Low Battery Overlay Icon (Top Left) */}
                {isLowBattery && (
                  <g transform="translate(-10, -10) scale(0.6)">
                    <rect x="2" y="6" width="12" height="6" rx="1" fill="#fee2e2" stroke="#b91c1c" strokeWidth="2" />
                    <line x1="16" y1="8" x2="16" y2="10" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" />
                    <rect x="4" y="7" width="3" height="4" fill="#ef4444" />
                  </g>
                )}

                {/* No Occupancy 48h Overlay Icon (Top Right) */}
                {isNoOccupancy && (
                  <g transform="translate(2, -10) scale(0.6)">
                    <circle cx="8" cy="8" r="7" fill="#f1f5f9" stroke="#475569" strokeWidth="1.5" />
                    <path d="M5 11.5a4 4 0 0 1 6 0" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="8" cy="6" r="2" stroke="#475569" strokeWidth="1.5" />
                    <line x1="4" y1="4" x2="12" y2="12" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                  </g>
                )}
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default HexMap;