'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers } from 'lucide-react';
import { SensorState } from '@/core/entities/Sensor';
import { STATUS_COLORS } from '@/core/constants';
import { cn } from '@/lib/utils';

// Helper component to auto-pan map
const MapSetter = ({ sensors }: { sensors: SensorState[] }) => {
  const map = useMap();

  useEffect(() => {
    if (sensors.length > 0) {
      const validSensors = sensors.filter(s => s.latitude && s.longitude);
      if (validSensors.length > 0) {
        const bounds = L.latLngBounds(validSensors.map(s => [s.latitude!, s.longitude!]));
        map.fitBounds(bounds, { padding: [100, 100], maxZoom: 15 });
      }
    }
  }, [sensors, map]);

  return null;
};

// Helper component for Heatmap
const HeatmapLayer = ({ sensors }: { sensors: SensorState[] }) => {
  const map = useMap();

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    const L = require('leaflet');
    require('leaflet.heat');

    // Filter valid sensors and calculate intensity based on SNR
    const points: [number, number, number][] = sensors
      .filter(s => s.latitude && s.longitude && s.latestMeasurement?.snr !== undefined)
      .map(s => {
        const snr = s.latestMeasurement!.snr!;
        // LoRa SNR typically ranges from -20 to +10. Normalizing to 0.0 - 1.0
        const minSNR = -20;
        const maxSNR = 10;
        const clamped = Math.max(minSNR, Math.min(maxSNR, snr));
        const intensity = (clamped - minSNR) / (maxSNR - minSNR);
        return [s.latitude!, s.longitude!, intensity];
      });

    if (points.length === 0) return;

    // @ts-ignore - heatLayer is added to L by the plugin
    const heatLayer = L.heatLayer(points, {
      radius: 45,
      blur: 30,
      maxZoom: 15,
      max: 1.0,
      gradient: {
        0.2: '#ef4444', // Red for low SNR (weak signal)
        0.5: '#eab308', // Yellow for medium
        0.8: '#22c55e', // Green for good
        1.0: '#3b82f6'  // Blue for excellent
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, sensors]);

  return null;
};

// Icon caching logic
const iconCache = new Map<number, L.DivIcon>();
const getCustomIcon = (estadoId: number) => {
  if (iconCache.has(estadoId)) return iconCache.get(estadoId)!;

  const color = STATUS_COLORS[estadoId] || '#64748b';
  const svgHtml = `
    <div style="
        background-color: ${color};
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 15px ${color}88;
    "></div>
  `;

  const icon = L.divIcon({
    html: svgHtml,
    className: 'custom-sensor-marker',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  iconCache.set(estadoId, icon);
  return icon;
};

interface GeoMapProps {
  sensors: SensorState[];
  onSensorSelect: (id: string) => void;
}

export default function GeoMap({ sensors, onSensorSelect }: GeoMapProps) {
  const [showHeatmap, setShowHeatmap] = useState(false);

  const filteredSensors = useMemo(() => 
    sensors.filter(s => s.latitude && s.longitude), 
  [sensors]);

  const defaultCenter: [number, number] = [40.4168, -3.7038];

  return (
       <div className="w-full h-full relative z-0">
      {/* Toggle Button */}
      <button 
        onClick={() => setShowHeatmap(!showHeatmap)}
        className={cn(
          "absolute top-6 left-16 md:left-24 z-[1000] p-3 rounded-xl border shadow-2xl flex items-center gap-2 transition-all font-semibold text-xs md:text-sm",
          showHeatmap 
            ? "bg-sky-500/90 text-white border-sky-400 backdrop-blur-md" 
            : "bg-slate-900/80 text-white/80 border-white/10 hover:bg-slate-800 backdrop-blur-md"
        )}
      >
        <Layers className="w-4 h-4" />
        {showHeatmap ? 'Ocultar Cobertura LoRa' : 'Ver Cobertura LoRa'}
      </button>

      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%', background: '#0f172a' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {showHeatmap && <HeatmapLayer sensors={filteredSensors} />}

        {!showHeatmap && filteredSensors.map(sensor => (
          <Marker
            key={sensor.id}
            position={[sensor.latitude!, sensor.longitude!]}
            icon={getCustomIcon(sensor.estadoId)}
            eventHandlers={{
              click: () => onSensorSelect(sensor.id)
            }}
          >
            <Popup className="custom-popup">
              <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-700 min-w-[120px]">
                <h3 className="font-bold text-xs">{sensor.name}</h3>
                <p className="text-[10px] text-white/60 mt-1 font-mono ">{sensor.devEui}</p>
                <div className="mt-2 text-[10px] text-sky-400 font-bold">
                   {sensor.latestMeasurement?.temperature}°C | {sensor.latestMeasurement?.humidity}%
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapSetter sensors={filteredSensors} />
      </MapContainer>

      {/* Modern Overlay Legend */}
      <div className="absolute top-6 right-6 bg-slate-900/40 backdrop-blur-xl p-4 rounded-2xl border border-white/5 space-y-3 z-[1000] pointer-events-none hidden lg:block shadow-2xl">
        {!showHeatmap ? (
          <>
            <div className="text-[10px] font-bold text-white/60 mb-2 border-b border-white/5 pb-2">Leyenda de Estados</div>
            <LegendItem color={STATUS_COLORS[9]} label="Situación Ideal" />
            <LegendItem color={STATUS_COLORS[2]} label="Alerta Crítica" />
            <LegendItem color={STATUS_COLORS[5]} label="Riesgo / Aviso" />
            <LegendItem color={STATUS_COLORS[1]} label="Sin Conexión" />
          </>
        ) : (
          <>
            <div className="text-[10px] font-bold text-white/60 mb-2 border-b border-white/5 pb-2">Calidad Cobertura (SNR)</div>
            <LegendItem color="#3b82f6" label="Excelente (0 a 10 dB)" />
            <LegendItem color="#22c55e" label="Buena (-10 a 0 dB)" />
            <LegendItem color="#eab308" label="Regular (-15 a -10 dB)" />
            <LegendItem color="#ef4444" label="Débil (-20 a -15 dB)" />
          </>
        )}
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
      <span className="text-[10px] font-bold text-white/90  ">{label}</span>
    </div>
  );
}
