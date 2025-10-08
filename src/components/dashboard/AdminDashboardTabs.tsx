"use client";

import React from 'react';
import { Button } from '@/components/common/Button';

interface AdminDashboardTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dashboardSubTab: string;
  setDashboardSubTab: (subTab: string) => void;
  clientsSubTab: string;
  setClientsSubTab: (subTab: string) => void;
  stationsSubTab: string;
  setStationsSubTab: (subTab: string) => void;
  paymentsSubTab: string;
  setPaymentsSubTab: (subTab: string) => void;
  reportsSubTab: string;
  setReportsSubTab: (subTab: string) => void;
  settingsSubTab: string;
  setSettingsSubTab: (subTab: string) => void;
  updateUrl: (tab: string, subTab: string) => void;
}

export function AdminDashboardTabs({
  activeTab,
  setActiveTab,
  dashboardSubTab,
  setDashboardSubTab,
  clientsSubTab,
  setClientsSubTab,
  stationsSubTab,
  setStationsSubTab,
  paymentsSubTab,
  setPaymentsSubTab,
  reportsSubTab,
  setReportsSubTab,
  settingsSubTab,
  setSettingsSubTab,
  updateUrl
}: AdminDashboardTabsProps) {
  return (
    <div className="border-b border-[#334155]">
      <nav className="flex space-x-2 sm:space-x-4 md:space-x-8 overflow-x-auto pb-2">
        <button
          onClick={() => {
            setActiveTab('dashboard');
            updateUrl('dashboard', dashboardSubTab);
          }}
          className={`py-2 px-1 sm:px-2 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
              : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => {
            setActiveTab('clients');
            updateUrl('clients', clientsSubTab);
          }}
          className={`py-2 px-1 sm:px-2 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap ${
            activeTab === 'clients'
              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
              : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
          }`}
        >
          Clients
        </button>
        <button
          onClick={() => {
            setActiveTab('stations');
            updateUrl('stations', stationsSubTab);
          }}
          className={`py-2 px-1 sm:px-2 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap ${
            activeTab === 'stations'
              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
              : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
          }`}
        >
          Stations
        </button>
        <button
          onClick={() => {
            setActiveTab('payments');
            updateUrl('payments', paymentsSubTab);
          }}
          className={`py-2 px-1 sm:px-2 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap ${
            activeTab === 'payments'
              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
              : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
          }`}
        >
          Payments
        </button>
        <button
          onClick={() => {
            setActiveTab('reports');
            updateUrl('reports', reportsSubTab);
          }}
          className={`py-2 px-1 sm:px-2 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap ${
            activeTab === 'reports'
              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
              : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
          }`}
        >
          Reports
        </button>
        <button
          onClick={() => {
            setActiveTab('settings');
            updateUrl('settings', settingsSubTab);
          }}
          className={`py-2 px-1 sm:px-2 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap ${
            activeTab === 'settings'
              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
              : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
          }`}
        >
          Settings
        </button>
      </nav>
    </div>
  );
}