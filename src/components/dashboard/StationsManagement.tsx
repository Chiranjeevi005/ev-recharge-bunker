"use client";

import React from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

interface Station {
  _id: string;
  name: string;
  address: string;
  city: string;
  status: 'active' | 'maintenance' | 'inactive';
  totalSlots: number;
  availableSlots: number;
  createdAt: string;
}

interface StationsManagementProps {
  stations: Station[];
  stationsSubTab: string;
  setStationsSubTab: (subTab: string) => void;
  updateUrl: (tab: string, subTab: string) => void;
}

export function StationsManagement({ stations, stationsSubTab, setStationsSubTab, updateUrl }: StationsManagementProps) {
  // Filter stations based on the active sub-tab
  const filteredStations = stationsSubTab === 'all' 
    ? stations 
    : stations.filter(station => station.status === stationsSubTab);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#F1F5F9] mb-1">Station Management</h2>
          <p className="text-[#CBD5E1] text-xs sm:text-sm">Manage all charging stations in the network</p>
        </div>
        <Button className="bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white text-xs sm:text-sm">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add Station
        </Button>
      </div>
      
      {/* Sub-tabs for Stations - Mobile-first responsive design */}
      <div className="mb-4 sm:mb-6 border-b border-[#334155] overflow-x-auto">
        <nav className="flex space-x-3 sm:space-x-4 md:space-x-6 min-w-max">
          <button
            onClick={() => {
              setStationsSubTab('all');
              updateUrl('stations', 'all');
            }}
            className={`py-2 px-1 text-xs sm:text-sm font-medium whitespace-nowrap ${
              stationsSubTab === 'all'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
            }`}
          >
            All Stations
          </button>
          <button
            onClick={() => {
              setStationsSubTab('active');
              updateUrl('stations', 'active');
            }}
            className={`py-2 px-1 text-xs sm:text-sm font-medium whitespace-nowrap ${
              stationsSubTab === 'active'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => {
              setStationsSubTab('maintenance');
              updateUrl('stations', 'maintenance');
            }}
            className={`py-2 px-1 text-xs sm:text-sm font-medium whitespace-nowrap ${
              stationsSubTab === 'maintenance'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
            }`}
          >
            Maintenance
          </button>
          <button
            onClick={() => {
              setStationsSubTab('inactive');
              updateUrl('stations', 'inactive');
            }}
            className={`py-2 px-1 text-xs sm:text-sm font-medium whitespace-nowrap ${
              stationsSubTab === 'inactive'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
            }`}
          >
            Inactive
          </button>
        </nav>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
        {filteredStations.map((station) => (
          <Card key={station._id} className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-3 sm:p-4 md:p-6 hover:border-[#8B5CF6] transition-colors duration-200">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#F1F5F9] truncate">{station.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                station.status === 'active' 
                  ? 'bg-green-900/30 text-green-400' 
                  : station.status === 'maintenance'
                    ? 'bg-yellow-900/30 text-yellow-400'
                    : 'bg-red-900/30 text-red-400'
              }`}>
                {station.status}
              </span>
            </div>
            <p className="text-[#CBD5E1] text-xs sm:text-sm mb-2">{station.address}</p>
            <p className="text-[#CBD5E1] text-xs mb-2 sm:mb-3">{station.city}</p>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div>
                <p className="text-xs text-[#CBD5E1]">Slots</p>
                <p className="text-[#F1F5F9] font-medium text-xs sm:text-sm">{station.totalSlots}</p>
              </div>
              <div>
                <p className="text-xs text-[#CBD5E1]">Available</p>
                <p className="text-[#F1F5F9] font-medium text-xs sm:text-sm">{station.availableSlots}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-red-400 hover:text-red-300 text-xs">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Remove
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}