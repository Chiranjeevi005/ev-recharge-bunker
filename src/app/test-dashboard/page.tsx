"use client";

import React, { useState, useEffect } from 'react';
import { useLoader } from '@/lib/LoaderContext';
import { Button } from '@/components/ui/Button';

export default function TestDashboardLoading() {
  const { showLoader, hideLoader } = useLoader();
  const [testStatus, setTestStatus] = useState('idle');

  const simulateAdminDashboardLoad = () => {
    setTestStatus('loading');
    showLoader("Loading admin dashboard...");
    
    // Simulate API calls
    setTimeout(() => {
      showLoader("Fetching user data...", "loading");
    }, 800);
    
    setTimeout(() => {
      showLoader("Fetching station data...", "loading");
    }, 1600);
    
    setTimeout(() => {
      showLoader("Fetching session data...", "loading");
    }, 2400);
    
    setTimeout(() => {
      hideLoader();
      setTestStatus('loaded');
    }, 3200);
  };

  const simulateClientDashboardLoad = () => {
    setTestStatus('loading');
    showLoader("Loading client dashboard...");
    
    // Simulate API calls
    setTimeout(() => {
      showLoader("Fetching charging session...", "loading");
    }, 600);
    
    setTimeout(() => {
      showLoader("Fetching payment history...", "loading");
    }, 1200);
    
    setTimeout(() => {
      showLoader("Fetching slot availability...", "loading");
    }, 1800);
    
    setTimeout(() => {
      hideLoader();
      setTestStatus('loaded');
    }, 2400);
  };

  const simulateError = () => {
    setTestStatus('loading');
    showLoader("Loading dashboard...", "loading");
    
    setTimeout(() => {
      showLoader("Connection failed!", "error");
    }, 1000);
    
    setTimeout(() => {
      hideLoader();
      setTestStatus('error');
    }, 2500);
  };

  const simulateSuccess = () => {
    setTestStatus('loading');
    showLoader("Processing payment...", "loading");
    
    setTimeout(() => {
      showLoader("Payment successful!", "success");
    }, 1000);
    
    setTimeout(() => {
      hideLoader();
      setTestStatus('success');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#1E293B] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard Loading Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#334155] p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Admin Dashboard Simulation</h2>
            <Button 
              onClick={simulateAdminDashboardLoad}
              className="w-full mb-3 bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white"
              disabled={testStatus === 'loading'}
            >
              {testStatus === 'loading' ? 'Loading...' : 'Load Admin Dashboard'}
            </Button>
          </div>
          
          <div className="bg-[#334155] p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Client Dashboard Simulation</h2>
            <Button 
              onClick={simulateClientDashboardLoad}
              className="w-full mb-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              disabled={testStatus === 'loading'}
            >
              {testStatus === 'loading' ? 'Loading...' : 'Load Client Dashboard'}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#334155] p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Error Simulation</h2>
            <Button 
              onClick={simulateError}
              className="w-full mb-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
              disabled={testStatus === 'loading'}
            >
              {testStatus === 'loading' ? 'Loading...' : 'Simulate Error'}
            </Button>
          </div>
          
          <div className="bg-[#334155] p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Success Simulation</h2>
            <Button 
              onClick={simulateSuccess}
              className="w-full mb-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              disabled={testStatus === 'loading'}
            >
              {testStatus === 'loading' ? 'Loading...' : 'Simulate Success'}
            </Button>
          </div>
        </div>
        
        <div className="mt-8 bg-[#334155] p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Test Status</h2>
          <div className="text-[#CBD5E1]">
            <p>Current Status: <span className="font-mono text-white">{testStatus}</span></p>
            <p className="mt-2">This test page simulates the loading behavior of both admin and client dashboards to verify that:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Loading animations appear smoothly without flickering</li>
              <li>Data fetching simulations work correctly</li>
              <li>Error states are handled properly</li>
              <li>Success states are displayed appropriately</li>
              <li>Loaders are hidden after operations complete</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}