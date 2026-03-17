import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Search } from 'lucide-react';

// Fix for default marker icon in Leaflet + React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onSelect: (lat: number, lng: number) => void;
  onClose: () => void;
}

const LocationMarker = ({ position, onClick }: { position: L.LatLng | null, onClick: (e: L.LeafletMouseEvent) => void }) => {
  useMapEvents({
    click: onClick,
  });

  return position === null ? null : (
    <Marker position={position} />
  );
};

const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

const MapPicker: React.FC<MapPickerProps> = ({ initialLat, initialLng, onSelect, onClose }) => {
  const [position, setPosition] = useState<L.LatLng | null>(
    initialLat && initialLng ? L.latLng(initialLat, initialLng) : null
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    initialLat && initialLng ? [initialLat, initialLng] : [40.4168, -3.7038] // Default to Madrid
  );

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    setPosition(e.latlng);
  };

  const handleConfirm = () => {
    if (position) {
      onSelect(position.lat, position.lng);
      onClose();
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPos = L.latLng(parseFloat(lat), parseFloat(lon));
        setMapCenter([newPos.lat, newPos.lng]);
        setPosition(newPos);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl h-[600px] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <div>
            <h3 className="text-white font-bold">Seleccionar Ubicación</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Haz clic en el mapa para situar el sensor</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-slate-900 border-b border-slate-800">
          <form onSubmit={handleSearch} className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar ciudad, calle o lugar..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
            />
          </form>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <MapContainer 
            center={mapCenter} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeView center={mapCenter} />
            <LocationMarker position={position} onClick={handleMapClick} />
          </MapContainer>

          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
             <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl space-y-2 min-w-[150px]">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Coordenadas</div>
                <div className="text-xs font-mono text-white">
                  Lat: {position?.lat.toFixed(6) || '-'}
                </div>
                <div className="text-xs font-mono text-white">
                  Lng: {position?.lng.toFixed(6) || '-'}
                </div>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button 
            disabled={!position}
            onClick={handleConfirm}
            className="px-8 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-sky-900/20 transition-all disabled:opacity-50 active:scale-95"
          >
            Confirmar Ubicación
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPicker;
