'use client';

import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useSensor } from '../../context/SensorContext';
import { useFilter } from '../../context/FilterContext';

interface PageHeaderProps {
  projectName: string;
}

export function PageHeader({ projectName }: PageHeaderProps) {
  const { setIsStatusInfoOpen } = useSensor();
  const { searchTerm, setSearchTerm } = useFilter();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0 mb-4 print:hidden">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">{projectName}</h1>
      </div>

      <div className="flex items-center gap-3">
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar sensor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 w-64 transition-all"
            />
         </div>

         <button 
           onClick={() => setIsStatusInfoOpen(true)}
           className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors relative"
         >
            <Bell size={20} />
            <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900" />
         </button>
      </div>
    </div>
  );
}
