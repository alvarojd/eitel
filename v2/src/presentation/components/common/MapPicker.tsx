'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { X, Search, Crosshair, MapPin, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

// Dynamic import of the entire Map components to ensure they only load on client
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

// Helper components that use Leaflet hooks must be handled carefully
// We'll import the hooks dynamically inside the components themselves or use a wrapper
const MapEvents = ({ onClick }: { onClick: (e: any) => void }) => {
  const [Component, setComponent] = useState<any>(null);

  useEffect(() => {
    import('react-leaflet').then(mod => {
      const { useMapEvents } = mod;
      const InnerComponent = () => {
        useMapEvents({ click: onClick });
        return null;
      };
      setComponent(() => InnerComponent);
    });
  }, [onClick]);

  return Component ? <Component /> : null;
};

const ChangeView = ({ center }: { center: [number, number] }) => {
  const [Component, setComponent] = useState<any>(null);

  useEffect(() => {
    import('react-leaflet').then(mod => {
      const { useMap } = mod;
      const InnerComponent = () => {
        const map = useMap();
        useEffect(() => {
          map.setView(center, map.getZoom());
        }, [center, map]);
        return null;
      };
      setComponent(() => InnerComponent);
    });
  }, [center]);

  return Component ? <Component /> : null;
};

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onSelect: (lat: number, lng: number) => void;
  onClose: () => void;
}

export function MapPicker({ initialLat, initialLng, onSelect, onClose }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    initialLat && initialLng ? [initialLat, initialLng] : [40.4168, -3.7038]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Fix Leaflet icons
    const fixIcons = async () => {
      const L = (await import('leaflet')).default;
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    };
    fixIcons();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setMapCenter(newPos);
        setPosition(newPos);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 w-full max-w-5xl h-[700px] rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
               <MapPin size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Geolocalización Técnica</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">Define la ubicación exacta del sensor en el mapa</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 rounded-2xl transition-all h-12 w-12 flex items-center justify-center">
            <X size={24} />
          </button>
        </div>

        {/* Tools Bar */}
        <div className="p-4 bg-slate-950/20 border-b border-slate-800 flex flex-col md:flex-row gap-4 items-center">
          <form onSubmit={handleSearch} className="relative flex-1 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-500 transition-colors" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar dirección, coordenadas o lugar..."
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/5 transition-all"
            />
            {isSearching && (
               <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 size={16} className="animate-spin text-sky-500" />
               </div>
            )}
          </form>

          <div className="flex gap-3 bg-slate-950/50 p-2 rounded-2xl border border-slate-800">
             <div className="px-4 py-2 text-right border-r border-slate-800">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Latitud</p>
                <p className="text-sm font-mono font-black text-sky-400">{position ? position[0].toFixed(6) : '---'}</p>
             </div>
             <div className="px-4 py-2 text-right">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Longitud</p>
                <p className="text-sm font-mono font-black text-sky-400">{position ? position[1].toFixed(6) : '---'}</p>
             </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative bg-slate-950">
          <MapContainer 
            center={mapCenter} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            />
            <ChangeView center={mapCenter} />
            <MapEvents onClick={(e: any) => setPosition([e.latlng.lat, e.latlng.lng])} />
            {position && (
               <Marker position={position} />
            )}
          </MapContainer>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
             {!position && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-sky-500 text-white px-6 py-3 rounded-full shadow-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 border-2 border-white/20"
                >
                   <Crosshair size={16} className="animate-pulse" />
                   Haz clic en el mapa para situar
                </motion.div>
             )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-end items-center gap-6">
          <button 
            onClick={onClose}
            className="text-sm font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors"
          >
            Descartar
          </button>
          
          <button 
            disabled={!position}
            onClick={() => position && onSelect(position[0], position[1])}
            className="flex items-center gap-3 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-sky-900/20 transition-all active:scale-95 group"
          >
            {position && <Check size={20} className="text-sky-300" />}
            Confirmar Coordenadas
          </button>
        </div>
      </motion.div>
    </div>
  );
}
