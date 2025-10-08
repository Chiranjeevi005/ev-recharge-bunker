"use client";

import React from 'react';
import { Card } from '@/components/common/Card';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';

interface Stat {
  id: string;
  name: string;
  value: number;
  change: number;
  color: string;
  icon: string;
}

interface DashboardOverviewProps {
  stats: Stat[];
  userGrowthData: any[];
  revenueByCityData: any[];
}

// Helper function to render icons based on icon name
const renderIcon = (iconName: string) => {
  switch (iconName) {
    case 'user-group':
      return (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      );
    case 'lightning-bolt':
      return (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      );
    case 'clock':
      return (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
    case 'currency-rupee':
      return (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
    case 'tree':
      return (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      );
  }
};

export function DashboardOverview({ stats, userGrowthData, revenueByCityData }: DashboardOverviewProps) {
  return (
    <div className="w-full">
      {/* Stats cards - Updated to show Users, Stations, Locations, Revenue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        {stats.map((stat) => (
          <Card key={stat.id} className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-3 sm:p-4 md:p-6 hover:border-[#8B5CF6] transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-[#CBD5E1]">{stat.name}</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#F1F5F9] mt-1">{stat.value.toLocaleString()}</p>
                <p className={`text-xs mt-1 ${stat.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}% from last month
                </p>
              </div>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center text-white`}>
                {renderIcon(stat.icon)}
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Charts and reports - Mobile-first responsive design */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-3 sm:p-4 md:p-6">
          <AnalyticsChart 
            type="line" 
            data={userGrowthData}
            dataKey="value" 
            title="User Growth Trends"
          />
        </Card>
        
        <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-3 sm:p-4 md:p-6">
          <AnalyticsChart 
            type="bar" 
            data={revenueByCityData}
            dataKey="value"
            dataKeys={["value", "growth"]}
            seriesNames={["Revenue", "Growth Rate"]}
            title="Revenue and Growth by City"
          />
        </Card>
      </div>
    </div>
  );
}