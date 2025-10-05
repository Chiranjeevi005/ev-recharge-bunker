import React from 'react';

export const FetchingAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-[#8B5CF6] border-t-transparent animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-[#10B981] border-t-transparent animate-spin animate-reverse"></div>
      </div>
      <p className="text-[#CBD5E1] text-lg font-medium">Fetching your data...</p>
      <p className="text-[#94A3B8] text-sm mt-1">This may take a moment</p>
    </div>
  );
};