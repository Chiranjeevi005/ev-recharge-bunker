"use client";

import React, { useState } from 'react';
import { ApiLoadingIndicator } from '@/components/ui/ApiLoadingIndicator';
import { Button } from '@/components/ui/Button';

export default function TestLoadingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);

  const simulateApiCall = (withOverlay = false) => {
    if (withOverlay) {
      setIsLoadingOverlay(true);
    } else {
      setIsLoading(true);
    }

    // Simulate API call
    setTimeout(() => {
      if (withOverlay) {
        setIsLoadingOverlay(false);
      } else {
        setIsLoading(false);
      }
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#1E293B] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">API Loading Indicator Demo</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Inline loading indicator */}
          <div className="bg-[#334155] p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Inline Loading</h2>
            <p className="text-[#CBD5E1] mb-4">This loading indicator appears inline within the content.</p>
            
            <Button 
              onClick={() => simulateApiCall(false)}
              className="mb-4"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Simulate API Call'}
            </Button>
            
            {isLoading && (
              <div className="flex justify-center my-4">
                <ApiLoadingIndicator size="md" message="Fetching data..." />
              </div>
            )}
          </div>
          
          {/* Overlay loading indicator */}
          <div className="bg-[#334155] p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Overlay Loading</h2>
            <p className="text-[#CBD5E1] mb-4">This loading indicator appears as an overlay over the entire page.</p>
            
            <Button 
              onClick={() => simulateApiCall(true)}
              className="mb-4"
              disabled={isLoadingOverlay}
            >
              {isLoadingOverlay ? 'Loading...' : 'Simulate API Call with Overlay'}
            </Button>
          </div>
        </div>
        
        {/* Size variations */}
        <div className="mt-12 bg-[#334155] p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Size Variations</h2>
          <div className="flex flex-wrap gap-8 items-center justify-center">
            <div className="text-center">
              <ApiLoadingIndicator size="sm" message="Small" />
            </div>
            <div className="text-center">
              <ApiLoadingIndicator size="md" message="Medium" />
            </div>
            <div className="text-center">
              <ApiLoadingIndicator size="lg" message="Large" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay loading indicator */}
      {isLoadingOverlay && (
        <ApiLoadingIndicator 
          overlay={true} 
          size="lg" 
          message="Processing your request..." 
        />
      )}
    </div>
  );
}