"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useLoader } from '@/lib/LoaderContext'; // Added import

export default function TestLoadingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);
  const { showLoader, hideLoader, updateLoader } = useLoader(); // Added loader context

  const simulateApiCall = (withOverlay = false) => {
    if (withOverlay) {
      setIsLoadingOverlay(true);
      showLoader("Processing your request..."); // Show global loader
    } else {
      setIsLoading(true);
      showLoader("Fetching data..."); // Show global loader
    }

    // Simulate API call
    setTimeout(() => {
      if (withOverlay) {
        setIsLoadingOverlay(false);
        hideLoader(); // Hide global loader
      } else {
        setIsLoading(false);
        hideLoader(); // Hide global loader
      }
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#1E293B] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Universal Loader Demo</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Inline loading indicator */}
          <div className="bg-[#334155] p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Inline Loading</h2>
            <p className="text-[#CBD5E1] mb-4">This loading indicator uses the global UniversalLoader.</p>
            
            <Button 
              onClick={() => simulateApiCall(false)}
              className="mb-4"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Simulate API Call'}
            </Button>
          </div>
          
          {/* Overlay loading indicator */}
          <div className="bg-[#334155] p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Overlay Loading</h2>
            <p className="text-[#CBD5E1] mb-4">This loading indicator appears as an overlay using the global UniversalLoader.</p>
            
            <Button 
              onClick={() => simulateApiCall(true)}
              className="mb-4"
              disabled={isLoadingOverlay}
            >
              {isLoadingOverlay ? 'Processing...' : 'Simulate API Call with Overlay'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}