"use client";

import React from 'react';
import { Card } from '@/components/common/Card';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';

interface DashboardAnalyticsProps {
  revenueByCityData: any[];
  usageByCityData: any[];
}

export function DashboardAnalytics({ revenueByCityData, usageByCityData }: DashboardAnalyticsProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-4 md:p-6">
          <AnalyticsChart 
            type="line" 
            data={revenueByCityData}
            dataKey="value" 
            title="Revenue Trends by City"
          />
        </Card>
        <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-4 md:p-6">
          <AnalyticsChart 
            type="bar" 
            data={usageByCityData}
            dataKey="users"
            dataKeys={["users", "chargingSessions"]}
            seriesNames={["Active Users", "Charging Sessions"]}
            title="User Engagement and Usage by City"
          />
        </Card>
      </div>
    </div>
  );
}