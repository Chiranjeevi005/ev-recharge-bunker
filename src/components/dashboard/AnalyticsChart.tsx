"use client";

import React from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface ChartData {
  name: string;
  value?: number;
  [key: string]: any;
}

interface AnalyticsChartProps {
  type: 'bar' | 'line';
  data: ChartData[];
  dataKey: string;
  title: string;
  colors?: string[];
  // For multiple data series in bar charts
  dataKeys?: string[];
  seriesNames?: string[];
}

export default function AnalyticsChart({ 
  type, 
  data, 
  dataKey, 
  title,
  colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'],
  dataKeys,
  seriesNames
}: AnalyticsChartProps) {
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 15,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1E293B', 
                borderColor: '#334155', 
                color: 'white' 
              }} 
            />
            <Legend />
            {dataKeys && dataKeys.length > 0 ? (
              dataKeys.map((key, index) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={colors[index % colors.length]} 
                  name={seriesNames && seriesNames[index] ? seriesNames[index] : key} 
                />
              ))
            ) : (
              <Bar dataKey={dataKey} fill={colors[0]} name={title} />
            )}
          </BarChart>
        );
      
      case 'line':
        return (
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 15,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1E293B', 
                borderColor: '#334155', 
                color: 'white' 
              }} 
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={colors[0]} 
              activeDot={{ r: 8 }} 
              name={title} 
            />
          </LineChart>
        );
      
      default:
        // Return a default empty chart to satisfy TypeScript
        return (
          <BarChart
            data={[]}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1E293B', 
                borderColor: '#334155', 
                color: 'white' 
              }} 
            />
          </BarChart>
        );
    }
  };

  return (
    <div className="w-full h-full min-h-[250px]">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      <div className="w-full h-[calc(100%-2rem)]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}