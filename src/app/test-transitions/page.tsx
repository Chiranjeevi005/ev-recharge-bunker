"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useRouteTransition } from '@/hooks/useRouteTransition';
import { useLoader } from '@/lib/LoaderContext';

export default function TestTransitionsPage() {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  
  // Initialize route transition handler
  useRouteTransition();

  const handleNavigateHome = () => {
    showLoader("Navigating to home...");
    setTimeout(() => {
      router.push("/");
    }, 500);
  };

  const handleNavigateDashboard = () => {
    showLoader("Loading your dashboard...");
    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  };

  const handleNavigateLogin = () => {
    showLoader("Redirecting to login...");
    setTimeout(() => {
      router.push("/login");
    }, 500);
  };

  const handleSimulateDataLoad = () => {
    showLoader("Loading data...");
    setTimeout(() => {
      hideLoader();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155] flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#F1F5F9] mb-4">Transition Test Page</h1>
          <p className="text-[#94A3B8]">
            Test smooth page transitions and loader animations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1E3A5F]/50 rounded-2xl p-6 border border-[#475569]/50">
            <h2 className="text-xl font-bold text-[#F1F5F9] mb-4">Navigation Tests</h2>
            <p className="text-[#94A3B8] mb-6">
              Test smooth transitions between pages
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={handleNavigateHome}
                className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white"
              >
                Go to Home
              </Button>
              
              <Button 
                onClick={handleNavigateDashboard}
                className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white"
              >
                Go to Dashboard
              </Button>
              
              <Button 
                onClick={handleNavigateLogin}
                className="w-full bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-white"
              >
                Go to Login
              </Button>
            </div>
          </div>

          <div className="bg-[#1E3A5F]/50 rounded-2xl p-6 border border-[#475569]/50">
            <h2 className="text-xl font-bold text-[#F1F5F9] mb-4">Loader Tests</h2>
            <p className="text-[#94A3B8] mb-6">
              Test loader animations without navigation
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={handleSimulateDataLoad}
                className="w-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white"
              >
                Simulate Data Load (2s)
              </Button>
              
              <Button 
                onClick={() => showLoader("Processing...")}
                className="w-full bg-gradient-to-r from-[#EF4444] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white"
              >
                Show Loader
              </Button>
              
              <Button 
                onClick={hideLoader}
                className="w-full bg-gradient-to-r from-[#6B7280] to-[#4B5563] hover:from-[#4B5563] hover:to-[#374151] text-white"
              >
                Hide Loader
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-[#94A3B8] text-sm">
          <p>All transitions should be smooth with no flickering or white flashes</p>
        </div>
      </div>
    </div>
  );
}