'use client';

import { useMemo } from 'react';

interface ChartData {
  date: string;
  users: number;
}

interface AnalyticsChartProps {
  data: ChartData[];
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  const { maxValue, points } = useMemo(() => {
    if (!data.length) return { maxValue: 0, points: '' };
    
    const maxValue = Math.max(...data.map(d => d.users));
    const width = 300;
    const height = 200;
    const padding = 20;
    
    const points = data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((point.users / maxValue) * (height - 2 * padding));
      return `${x},${y}`;
    }).join(' ');
    
    return { maxValue, points };
  }, [data]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <svg width="100%" height="200" viewBox="0 0 300 200" className="border rounded">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="30" height="20" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Chart line */}
        <polyline
          fill="none"
          stroke="#4369B2"
          strokeWidth="2"
          points={points}
        />
        
        {/* Data points */}
        {data.map((point, index) => {
          const x = 20 + (index / (data.length - 1)) * 260;
          const y = 180 - ((point.users / maxValue) * 160);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="#4369B2"
              className="hover:r-6 transition-all cursor-pointer"
            >
              <title>{`${point.date}: ${point.users} users`}</title>
            </circle>
          );
        })}
        
        {/* Y-axis labels */}
        <text x="10" y="25" fontSize="10" fill="#666">
          {maxValue}
        </text>
        <text x="10" y="105" fontSize="10" fill="#666">
          {Math.round(maxValue / 2)}
        </text>
        <text x="10" y="185" fontSize="10" fill="#666">
          0
        </text>
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-gray-500 px-5">
        <span>{data[0]?.date}</span>
        <span>{data[Math.floor(data.length / 2)]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}
