import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SystemMetric } from '../types';

interface ChartWidgetProps {
  data: SystemMetric[];
}

const ChartWidget: React.FC<ChartWidgetProps> = ({ data }) => {
  return (
    <div className="w-full h-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="timestamp" 
            tick={{fontSize: 10, fill: '#64748b', fontFamily: 'monospace'}}
            tickFormatter={(tick) => tick.split(':').slice(0,2).join(':')}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{fontSize: 10, fill: '#64748b', fontFamily: 'monospace'}}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              borderColor: '#334155',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Area 
            type="monotone" 
            dataKey="cpuLoad" 
            stroke="#06b6d4" 
            fillOpacity={1} 
            fill="url(#colorCpu)" 
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Area 
            type="monotone" 
            dataKey="memoryUsage" 
            stroke="#8b5cf6" 
            fillOpacity={1} 
            fill="url(#colorMem)" 
            strokeWidth={2}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartWidget;
