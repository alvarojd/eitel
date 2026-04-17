'use client';

import React from 'react';
import { HexGrid } from './HexGrid';

export function DashboardContent() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Main Content Area */}
      <div className="flex-1 min-h-0 relative bg-slate-900/20 rounded-3xl p-1 border border-slate-800/50">
        <HexGrid />
      </div>
    </div>
  );
}
