import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SensorData, SensorStatus } from '../types';
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
const createCustomIcon = (status: SensorStatus) => {
    const color = STATUS_COLORS[status] || '#64748b';

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
    // Filter sensors with coordinates
    const geolocatedSensors = sensors.filter(s => s.latitude && s.longitude);

    // Default center (e.g., Madrid) if no sensors present
    const defaultCenter: [number, number] = [40.4168, -3.7038];
    const initialCenter: [number, number] = geolocatedSensors.length > 0
        ? [geolocatedSensors[0].latitude!, geolocatedSensors[0].longitude!]
        : defaultCenter;

    return (
        <div className="flex-1 w-full h-full rounded-2xl overflow-hidden border border-slate-700/50 shadow-inner z-0">
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

                {geolocatedSensors.map(sensor => (
                    <Marker
                        key={sensor.id}
                        position={[sensor.latitude!, sensor.longitude!]}
                        icon={createCustomIcon(sensor.status)}
                        eventHandlers={{
                            click: () => onSensorSelect(sensor)
                        }}
                    >
                        <Popup className="custom-popup">
                            <div className="bg-slate-900 text-white p-2 text-xs font-sans">
                                <h3 className="font-bold">{sensor.name}</h3>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <MapSetter center={initialCenter} sensors={geolocatedSensors} />
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

            <style dangerouslySetInnerHTML={{
                __html: `
                .leaflet-popup-content-wrapper, .leaflet-popup-tip {
                    background: #0f172a !important;
                    color: white !important;
                    border: 1px solid #334155;
                }
                .leaflet-popup-content {
                    margin: 0 !important;
                    width: auto !important;
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
