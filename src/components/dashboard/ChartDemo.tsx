"use client";

import React from 'react';
import { Card } from '@/components/common/Card';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';

// Sample data for demonstration
const barChartData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 200 },
  { name: 'Apr', value: 278 },
  { name: 'May', value: 189 },
];

const lineChartData = [
  { name: 'Week 1', value: 4000 },
  { name: 'Week 2', value: 3000 },
  { name: 'Week 3', value: 2000 },
  { name: 'Week 4', value: 2780 },
  { name: 'Week 5', value: 1890 },
];

const pieChartData = [
  { name: 'Electricity', value: 400 },
  { name: 'Water', value: 300 },
  { name: 'Gas', value: 300 },
  { name: 'Other', value: 200 },
];

export function ChartDemo() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#F1F5F9] mb-6">Chart Types Demo</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-6">
          <AnalyticsChart 
            type="bar" 
            data={barChartData}
            dataKey="value" 
            title="Bar Chart Example"
          />
        </Card>
        
        <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-6">
          <AnalyticsChart 
            type="line" 
            data={lineChartData}
            dataKey="value" 
            title="Line Chart Example"
          />
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-6">
          <AnalyticsChart 
            type="pie" 
            data={pieChartData}
            dataKey="value" 
            title="Pie Chart Example"
          />
        </Card>
      </div>
    </div>
  );
}