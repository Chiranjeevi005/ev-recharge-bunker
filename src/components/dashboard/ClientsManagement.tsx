"use client";

import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

interface Client {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
  totalChargingSessions?: number;
  totalAmountSpent?: number;
  co2Saved?: number;
}

interface ClientsManagementProps {
  clients: Client[];
  clientsSubTab: string;
  setClientsSubTab: (subTab: string) => void;
  updateUrl: (tab: string, subTab: string) => void;
}

export function ClientsManagement({ clients, clientsSubTab, setClientsSubTab, updateUrl }: ClientsManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter clients based on the active sub-tab and search term
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (clientsSubTab === 'all') return matchesSearch;
    return client.status === clientsSubTab && matchesSearch;
  });

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#F1F5F9] mb-1">Client Management</h2>
          <p className="text-[#CBD5E1] text-xs sm:text-sm">Manage all client accounts in the system</p>
        </div>
        <Button className="bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white text-xs sm:text-sm">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add Client
        </Button>
      </div>
      
      {/* Sub-tabs for Clients - Mobile-first responsive design */}
      <div className="mb-4 sm:mb-6 border-b border-[#334155] overflow-x-auto">
        <nav className="flex space-x-3 sm:space-x-4 md:space-x-6 min-w-max">
          <button
            onClick={() => {
              setClientsSubTab('all');
              updateUrl('clients', 'all');
            }}
            className={`py-2 px-1 text-xs sm:text-sm font-medium whitespace-nowrap ${
              clientsSubTab === 'all'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
            }`}
          >
            All Clients
          </button>
          <button
            onClick={() => {
              setClientsSubTab('active');
              updateUrl('clients', 'active');
            }}
            className={`py-2 px-1 text-xs sm:text-sm font-medium whitespace-nowrap ${
              clientsSubTab === 'active'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => {
              setClientsSubTab('inactive');
              updateUrl('clients', 'inactive');
            }}
            className={`py-2 px-1 text-xs sm:text-sm font-medium whitespace-nowrap ${
              clientsSubTab === 'inactive'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
            }`}
          >
            Inactive
          </button>
          <button
            onClick={() => {
              setClientsSubTab('suspended');
              updateUrl('clients', 'suspended');
            }}
            className={`py-2 px-1 text-xs sm:text-sm font-medium whitespace-nowrap ${
              clientsSubTab === 'suspended'
                ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
            }`}
          >
            Suspended
          </button>
        </nav>
      </div>

      <Card className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-[#334155] text-[#1E293B] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent text-xs sm:text-sm"
            />
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
              </svg>
              <span className="hidden sm:inline ml-1">Filter</span>
            </Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              <span className="hidden sm:inline ml-1">Export</span>
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="py-2 text-left text-[#CBD5E1] font-medium text-xs">Client</th>
                <th className="py-2 text-left text-[#CBD5E1] font-medium text-xs hidden sm:table-cell">Email</th>
                <th className="py-2 text-left text-[#CBD5E1] font-medium text-xs">Role</th>
                <th className="py-2 text-left text-[#CBD5E1] font-medium text-xs">Status</th>
                <th className="py-2 text-left text-[#CBD5E1] font-medium text-xs hidden md:table-cell">Last Login</th>
                <th className="py-2 text-left text-[#CBD5E1] font-medium text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client._id} className="border-b border-[#334155] hover:bg-[#F1F5F9]/30">
                  <td className="py-3">
                    <div className="flex items-center">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] flex items-center justify-center text-white text-xs font-medium mr-2">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-[#F1F5F9] text-xs sm:text-sm block">{client.name}</span>
                        <span className="text-[#CBD5E1] text-xs sm:hidden">{client.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-[#CBD5E1] text-xs hidden sm:table-cell">{client.email}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-900/30 text-blue-400">
                      {client.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      client.status === 'active' 
                        ? 'bg-green-900/30 text-green-400' 
                        : client.status === 'suspended'
                          ? 'bg-red-900/30 text-red-400'
                          : 'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="py-3 text-[#CBD5E1] text-xs hidden md:table-cell">
                    {client.lastLogin ? new Date(client.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-3">
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" className="p-1">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      </Button>
                      <Button variant="outline" size="sm" className="p-1">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredClients.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#CBD5E1]">No clients found matching your criteria.</p>
          </div>
        )}
      </Card>
    </div>
  );
}