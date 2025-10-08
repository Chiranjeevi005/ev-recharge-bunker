"use client";

import React from 'react';
import { Card } from '@/components/common/Card';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';

interface Report {
  id: string;
  name: string;
  dateRange: string;
  status: 'completed' | 'processing' | 'failed';
  generated: string;
  data: any;
}

interface ReportsManagementProps {
  reports: Report[];
  reportsSubTab: string;
  setReportsSubTab: (subTab: string) => void;
  updateUrl: (tab: string, subTab: string) => void;
  usageByCityData: any[];
  userGrowthData: any[];
  revenueByCityData: any[];
}

export function ReportsManagement({ 
  reports, 
  reportsSubTab, 
  setReportsSubTab, 
  updateUrl,
  usageByCityData,
  userGrowthData,
  revenueByCityData
}: ReportsManagementProps) {
  return (
    <div className="w-full">
      {/* Sub-tabs for Reports - Mobile-first responsive design */}
      <div className="mb-6 border-b border-[#334155] overflow-x-auto">
        <nav className="flex space-x-4 md:space-x-6 min-w-max md:min-w-0">
          <button
            onClick={() => {
              setReportsSubTab('usage');
              updateUrl('reports', 'usage');
            }}
            className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
              reportsSubTab === 'usage'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
            }`}
          >
            Usage Reports
          </button>
          <button
            onClick={() => {
              setReportsSubTab('financial');
              updateUrl('reports', 'financial');
            }}
            className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
              reportsSubTab === 'financial'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
            }`}
          >
            Financial Reports
          </button>
          <button
            onClick={() => {
              setReportsSubTab('performance');
              updateUrl('reports', 'performance');
            }}
            className={`py-2 px-1 text-sm font-medium whitespace-nowrap ${
              reportsSubTab === 'performance'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
            }`}
          >
            Performance Reports
          </button>
        </nav>
      </div>

      {/* Reports content based on sub-tab */}
      {reportsSubTab === 'usage' && (
        <div className="w-full">
          <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-4 md:p-6 mb-6">
            <h3 className="text-lg font-bold text-[#F1F5F9] mb-4">Usage Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <AnalyticsChart 
                  type="bar" 
                  data={usageByCityData}
                  dataKey="chargingSessions"
                  title="Charging Sessions by City"
                />
              </div>
              <div>
                <AnalyticsChart 
                  type="line" 
                  data={userGrowthData}
                  dataKey="value"
                  title="User Growth Trend"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {reportsSubTab === 'financial' && (
        <div className="w-full">
          <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-4 md:p-6 mb-6">
            <h3 className="text-lg font-bold text-[#F1F5F9] mb-4">Financial Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <AnalyticsChart 
                  type="bar" 
                  data={revenueByCityData}
                  dataKey="value"
                  title="Revenue by City"
                />
              </div>
              <div>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 bg-[#334155]/50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-[#F1F5F9]">{report.name}</h4>
                        <p className="text-sm text-[#CBD5E1]">{report.dateRange}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        report.status === 'completed' 
                          ? 'bg-green-900/30 text-green-400' 
                          : report.status === 'processing'
                            ? 'bg-yellow-900/30 text-yellow-400'
                            : 'bg-red-900/30 text-red-400'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {reportsSubTab === 'performance' && (
        <div className="w-full">
          <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-bold text-[#F1F5F9] mb-4">Performance Metrics</h3>
            <div className="space-y-6">
              <div>
                <AnalyticsChart 
                  type="line" 
                  data={userGrowthData}
                  dataKey="value"
                  title="System Performance Trend"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#334155]/50 p-4">
                  <h4 className="font-medium text-[#F1F5F9] mb-2">Response Time</h4>
                  <p className="text-2xl font-bold text-[#8B5CF6]">128ms</p>
                  <p className="text-xs text-green-400">↓ 12% from last week</p>
                </Card>
                <Card className="bg-[#334155]/50 p-4">
                  <h4 className="font-medium text-[#F1F5F9] mb-2">Uptime</h4>
                  <p className="text-2xl font-bold text-[#10B981]">99.98%</p>
                  <p className="text-xs text-green-400">↑ 0.02% from last week</p>
                </Card>
                <Card className="bg-[#334155]/50 p-4">
                  <h4 className="font-medium text-[#F1F5F9] mb-2">Error Rate</h4>
                  <p className="text-2xl font-bold text-[#EF4444]">0.02%</p>
                  <p className="text-xs text-green-400">↓ 0.01% from last week</p>
                </Card>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}