"use client";

import React, { useEffect } from 'react';
import { useLoader } from '@/lib/LoaderContext';
import { Button } from '@/components/ui/Button';

export default function TestLoaderPage() {
  const { showLoader, hideLoader } = useLoader();

  const handleShowLoader = () => {
    showLoader("Testing loader...");
    setTimeout(() => {
      hideLoader();
    }, 2000);
  };

  const handleShowSuccess = () => {
    showLoader("Operation successful!", "success");
    setTimeout(() => {
      hideLoader();
    }, 2000);
  };

  const handleShowError = () => {
    showLoader("Operation failed!", "error");
    setTimeout(() => {
      hideLoader();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#1E293B] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Loader Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#334155] p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Loading State</h2>
            <Button 
              onClick={handleShowLoader}
              className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hover:from-[#7C3AED] hover:to-[#059669] text-white"
            >
              Show Loader
            </Button>
          </div>
          
          <div className="bg-[#334155] p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Success State</h2>
            <Button 
              onClick={handleShowSuccess}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              Show Success
            </Button>
          </div>
          
          <div className="bg-[#334155] p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Error State</h2>
            <Button 
              onClick={handleShowError}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
            >
              Show Error
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}