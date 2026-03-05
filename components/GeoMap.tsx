import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SensorData } from '../types';
import { STATUS_COLORS } from '../constants';

// Fix Leaflet marker icons which are often broken in React setups
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface GeoMapProps {
    sensors: SensorData[];
    onSensorSelect: (sensor: SensorData) => void;
    selectedSensorId: string | null;
}

// Function to create custom colored icons based on sensor status
const createCustomIcon = (estado_id: number) => {
    const color = STATUS_COLORS[estado_id] || '#64748b';

    // Create an SVG-based icon for the status
    const svgHtml = `
        <div style="
            background-color: ${color};
            width: 14px;
            height: 14px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
        "></div>
    `;

    return L.divIcon({
        html: svgHtml,
        className: 'custom-sensor-marker',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });
};

const GeoMap: React.FC<GeoMapProps> = ({ sensors, onSensorSelect, selectedSensorId }) => {
    const [filter, setFilter] = React.useState<string>('all');

    const getStatusType = (estado_id: number, indicators?: any) => {
        if (filter === 'bateria_baja' && indicators?.lowBattery) return 'bateria_baja';
        if (filter === 'ausencia' && indicators?.longTermNoOccupancy) return 'ausencia';

        if ([2, 3, 4].includes(estado_id)) return 'critico';
        if ([5, 6, 7, 8].includes(estado_id)) return 'riesgo';
        if (estado_id === 9) return 'ideal';
        if (estado_id === 1) return 'desconectado';
        return 'all';
    };

    // Filter sensors with coordinates AND matching the active filter
    const filteredSensors = React.useMemo(() => {
        return sensors.filter(sensor => {
            if (!sensor.latitude || !sensor.longitude) return false;
            if (filter === 'all') return true;
            if (filter === 'bateria_baja') return sensor.indicators?.lowBattery;
            if (filter === 'ausencia') return sensor.indicators?.longTermNoOccupancy;
            return getStatusType(sensor.estado_id) === filter;
        });
    }, [sensors, filter]);

    // Default center (e.g., Madrid) if no sensors present
    const defaultCenter: [number, number] = [40.4168, -3.7038];
    const initialCenter = React.useMemo<[number, number]>(() => {
        return filteredSensors.length > 0
            ? [filteredSensors[0].latitude!, filteredSensors[0].longitude!]
            : defaultCenter;
    }, [filteredSensors]);

    return (
        <div className="flex-1 w-full h-full flex flex-col rounded-2xl overflow-hidden border border-slate-700/50 shadow-inner z-0">
            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-700/50 flex gap-2 overflow-x-auto no-scrollbar bg-slate-900/40 shrink-0">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all whitespace-nowrap ${filter === 'all' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    Todos
                </button>
                <button
                    onClick={() => setFilter('critico')}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all whitespace-nowrap ${filter === 'critico' ? 'bg-rose-600 text-white' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'}`}
                >
                    Crítico
                </button>
                <button
                    onClick={() => setFilter('riesgo')}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all whitespace-nowrap ${filter === 'riesgo' ? 'bg-orange-600 text-white' : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'}`}
                >
                    Riesgo / Aviso
                </button>
                <button
                    onClick={() => setFilter('ideal')}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all whitespace-nowrap ${filter === 'ideal' ? 'bg-emerald-600 text-white' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
                >
                    Situación Ideal
                </button>
                <button
                    onClick={() => setFilter('bateria_baja')}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all whitespace-nowrap ${filter === 'bateria_baja' ? 'bg-blue-600 text-white' : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'}`}
                >
                    Batería Baja
                </button>
                <button
                    onClick={() => setFilter('ausencia')}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all whitespace-nowrap ${filter === 'ausencia' ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    Ausencia Prolongada
                </button>
                <button
                    onClick={() => setFilter('desconectado')}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all whitespace-nowrap ${filter === 'desconectado' ? 'bg-slate-600 text-white' : 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20'}`}
                >
                    Desconectado
                </button>
            </div>

            <div className="flex-1 relative">
                <MapContainer
                    center={initialCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%', background: '#0f172a' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {filteredSensors.map(sensor => (
                        <Marker
                            key={sensor.id}
                            position={[sensor.latitude!, sensor.longitude!]}
                            icon={createCustomIcon(sensor.status)}
                            eventHandlers={{
                                click: () => onSensorSelect(sensor)
                            }}
                        >
                            <Popup className="custom-popup">
                                <div className="bg-slate-900 text-white p-2 text-xs font-sans max-w-[140px] break-words">
                                    <h3 className="font-bold leading-tight">{sensor.name}</h3>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    <MapSetter center={initialCenter} sensors={filteredSensors} />
                </MapContainer>

                {/* Legend Overlay */}
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md p-3 rounded-lg border border-slate-700 text-[10px] text-slate-400 z-[1000] pointer-events-none">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div> <span>Ideal / Estable</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div> <span>Crítico / Alerta</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div> <span>Riesgo / Aviso</span>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .leaflet-popup-content-wrapper, .leaflet-popup-tip {
                    background: #0f172a !important;
                    color: white !important;
                    border: 1px solid #334155;
                    padding: 0 !important;
                }
                .leaflet-popup-content {
                    margin: 0 !important;
                    width: auto !important;
                    max-width: 150px !important;
                    white-space: normal !important;
                    word-wrap: break-word !important;
                }
                .leaflet-container {
                    font-family: inherit;
                }
            `}} />
        </div>
    );
};

// Helper component to auto-pan map when sensors change (optional but nice)
const MapSetter = ({ center, sensors }: { center: [number, number], sensors: SensorData[] }) => {
    const map = useMap();

    React.useEffect(() => {
        if (sensors.length > 0) {
            const bounds = L.latLngBounds(sensors.map(s => [s.latitude!, s.longitude!]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [sensors, map]);

    return null;
};

export default GeoMap;
