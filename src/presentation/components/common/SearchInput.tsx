'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { useFilter } from '../../context/FilterContext';

export function SearchInput() {
  const { searchTerm, setSearchTerm } = useFilter();

  return (
    <div className="relative group w-full max-w-sm">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-500 transition-colors pointer-events-none">
        <Search size={18} />
      </div>
      <input 
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar por nombre o DevEui..."
        className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2 pl-12 pr-10 text-sm text-white placeholder-slate-600 outline-none focus:border-sky-500/50 transition-all font-medium"
      />
      {searchTerm && (
        <button 
          onClick={() => setSearchTerm('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-800 text-slate-500 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
