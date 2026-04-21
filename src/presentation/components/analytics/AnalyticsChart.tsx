'use client';

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { AnalyticsDataPoint } from '@/infrastructure/actions/analyticsActions';

interface AnalyticsChartProps {
  data: AnalyticsDataPoint[];
  variableLabel: string;
  unit: string;
  color: string;
}

export function AnalyticsChart({ data, variableLabel, unit, color }: AnalyticsChartProps) {
  if (data.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/30 p-20">
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest">Sin datos para el periodo seleccionado</p>
      </div>
    );
  }

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full h-full min-h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#ffffff10" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatXAxis}
            stroke="#ffffff80"
            fontSize={10}
            tickMargin={15}
            minTickGap={60}
            height={60}
            axisLine={{ stroke: '#ffffffa0', strokeWidth: 1 }}
            tick={{ fill: '#ffffffe0' }}
          />
          <YAxis 
            stroke="#ffffff80"
            fontSize={10}
            tickFormatter={(value) => `${value}${unit}`}
            axisLine={{ stroke: '#ffffffa0', strokeWidth: 1 }}
            tick={{ fill: '#ffffffe0' }}
            domain={[0, 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              borderColor: '#1e293b', 
              borderRadius: '16px',
              fontSize: '12px',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)'
            }}
            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
            labelStyle={{ color: '#64748b', marginBottom: '4px' }}
            labelFormatter={(label) => new Date(label).toLocaleString('es-ES')}
            formatter={(value) => [`${value} ${unit}`, variableLabel]}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
