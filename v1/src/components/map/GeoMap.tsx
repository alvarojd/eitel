import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SensorData } from '../../types';
import { STATUS_COLORS } from '../../constants';
import StatusFilterBar from '../common/StatusFilterBar';
import { filterSensors } from '../../utils/sensorFilters';

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
// Cache to store custom icons and avoid re-calculating them on every render
const iconCache = new Map<number, L.DivIcon>();

const getCustomIcon = (estado_id: number) => {
    if (iconCache.has(estado_id)) {
        return iconCache.get(estado_id)!;
    }

    const color = STATUS_COLORS[estado_id] || '#64748b';

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

    const icon = L.divIcon({
        html: svgHtml,
        className: 'custom-sensor-marker',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });

    iconCache.set(estado_id, icon);
    return icon;
};

const GeoMap: React.FC<GeoMapProps> = ({ sensors, onSensorSelect, selectedSensorId }) => {
    const [filter, setFilter] = React.useState<string>('all');

    // Filter sensors with coordinates AND matching the active filter
    const filteredSensors = React.useMemo(() => {
        const withCoords = sensors.filter(s => s.latitude && s.longitude);
        return filterSensors(withCoords, filter);
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
            <StatusFilterBar activeFilter={filter} onFilterChange={setFilter} />

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
                            icon={getCustomIcon(sensor.estado_id)}
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
