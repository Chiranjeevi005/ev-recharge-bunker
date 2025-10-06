"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Loading component for Suspense
function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center">
      <div className="text-[#F1F5F9] text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B5CF6] mb-4"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
}

function NotFoundContent() {
  const searchParams = useSearchParams();
  const from = searchParams?.get('from') || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <svg className="w-24 h-24 mx-auto text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-[#F1F5F9] mb-4">Page Not Found</h2>
        <p className="text-[#94A3B8] mb-8">
          {from 
            ? `The page you're looking for (${from}) doesn't exist or has been moved.`
            : "The page you're looking for doesn't exist or has been moved."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/dashboard" 
            className="px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white font-medium rounded-lg hover:from-[#7C3AED] hover:to-[#059669] transition-all duration-300"
          >
            Go to Dashboard
          </Link>
          <Link 
            href="/" 
            className="px-6 py-3 border border-[#475569] text-[#F1F5F9] font-medium rounded-lg hover:bg-[#334155] transition-all duration-300"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<Loading />}>
      <NotFoundContent />
    </Suspense>
  );
}