import React, { useState, useEffect, useRef } from 'react';
import { HeatmapDeviceRow, HeatmapDataPoint } from '../../types';
import { fetchHeatmapData } from '../../services/ttnService';
import { STATUS_BG_COLORS, STATUS_LABELS } from '../../constants';
import { Loader2, X } from 'lucide-react';

const CronoPanel: React.FC = () => {
  const [data, setData] = useState<HeatmapDeviceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<{
    point: HeatmapDataPoint;
    deviceName: string;
    x: number;
    y: number;
  } | null>(null);
  
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchHeatmapData();
        setData(result);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // Refresh heatmap every 5 minutes
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, []);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setSelectedPoint(null);
      }
    };

    if (selectedPoint) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedPoint]);

  if (loading && data.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-sky-500 mx-auto mb-4" />
          <p className="text-slate-400">Cargando mapa temporal...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-400">Sin datos de las últimas 24 horas</p>
      </div>
    );
  }

  const handlePointClick = (e: React.MouseEvent, point: HeatmapDataPoint, deviceName: string) => {
    e.stopPropagation();
    
    // Toggle if same point clicked
    if (selectedPoint?.point.timestamp === point.timestamp && selectedPoint?.deviceName === deviceName) {
      setSelectedPoint(null);
      return;
    }

    setSelectedPoint({
      point,
      deviceName,
      x: e.clientX,
      y: e.clientY
    });
  };

  return (
    <div className="flex-1 overflow-auto h-full p-6 text-white bg-slate-900 rounded-2xl shadow-inner border border-slate-700/50 relative">
      <h2 className="text-xl lg:text-3xl font-bold mb-4 lg:mb-8 text-white tracking-tight flex items-center gap-3">
         Crono <span className="text-sm font-normal text-slate-400">(Últimas 24h)</span>
      </h2>

      <div className="min-w-[800px]">
        {/* Header simple para indicar el rango. Idealmente podríamos poner la hora exacta en cada columna. */}
        <div className="flex mb-2">
           <div className="w-48 flex-shrink-0 text-sm font-medium text-slate-400 pr-4">Sensor</div>
           <div className="flex-1 flex justify-between text-xs text-slate-500">
              <span>Hace 24h</span>
              <span>Ahora</span>
           </div>
        </div>

        <div className="space-y-1">
          {data.map((row) => (
            <div key={row.deviceId} className="flex h-10 group">
              {/* Device Label */}
              <div className="w-48 flex-shrink-0 flex items-center pr-4 border-r border-slate-800">
                <span className="text-sm font-medium text-slate-300 truncate group-hover:text-white transition-colors" title={row.name}>
                  {row.name}
                </span>
              </div>
              
              {/* Heatmap Blocks */}
              <div className="flex-1 flex gap-px pl-1">
                {row.data.map((point, index) => {
                  let bgColorClass = 'bg-slate-800/50'; // default/unknown/no-data
                  
                  if (point.hasData) {
                      bgColorClass = STATUS_BG_COLORS[point.estado_id] || bgColorClass;
                  }

                  // Determine if "Sin presencia"
                  const noPresence = point.hasData && !point.presence;
                  const isSelected = selectedPoint?.point.timestamp === point.timestamp && selectedPoint?.deviceName === row.name;

                  return (
                     <div 
                       key={index} 
                       className={`flex-1 relative rounded-sm ${bgColorClass} transition-all hover:brightness-125 cursor-pointer ${isSelected ? 'ring-2 ring-sky-400 ring-inset z-10 scale-110 shadow-lg' : ''}`}
                       onClick={(e) => handlePointClick(e, point, row.name)}
                       title={`Hora: ${new Date(point.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                     >
                       {noPresence && (
                           // Superposición "sin presencia" (icono o marca). Por ejemplo un punto gris oscuro.
                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-900/60" title="Sin presencia" />
                           </div>
                       )}
                     </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Leyenda local para el heatmap */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center gap-6 text-sm text-slate-400">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-slate-800/50" />
              <span>Sin Datos</span>
           </div>
           <div className="flex items-center gap-2 relative">
              <div className="w-6 h-6 rounded bg-emerald-500 relative">
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900/60" />
                 </div>
              </div>
              <span>Sin Presencia (punto oscuro)</span>
           </div>
        </div>
      </div>

      {/* Floating Tooltip Window */}
      {selectedPoint && (
        <div 
          ref={tooltipRef}
          className="fixed z-[100] bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-4 min-w-[200px] animate-in fade-in zoom-in duration-200"
          style={{ 
            left: `${Math.min(window.innerWidth - 220, selectedPoint.x + 10)}px`, 
            top: `${Math.min(window.innerHeight - 150, selectedPoint.y + 10)}px` 
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-bold text-sky-400 text-sm truncate max-w-[140px]">{selectedPoint.deviceName}</h4>
              <p className="text-[10px] text-slate-400 font-mono">
                {new Date(selectedPoint.point.timestamp).toLocaleDateString()}
              </p>
            </div>
            <button 
              onClick={() => setSelectedPoint(null)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Hora:</span>
              <span className="text-white font-bold">
                {new Date(selectedPoint.point.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Estado:</span>
              <span className={`font-bold ${selectedPoint.point.hasData ? (selectedPoint.point.estado_id === 9 ? 'text-emerald-400' : [2,3,4].includes(selectedPoint.point.estado_id) ? 'text-rose-400' : 'text-orange-400') : 'text-slate-500'}`}>
                {STATUS_LABELS[selectedPoint.point.estado_id] || 'Sin datos'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Presencia:</span>
              <span className="text-white">
                {selectedPoint.point.hasData ? (selectedPoint.point.presence ? 'Sí' : 'No') : '-'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CronoPanel;
