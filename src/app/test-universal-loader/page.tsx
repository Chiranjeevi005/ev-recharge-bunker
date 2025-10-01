"use client";

import React, { useState, useEffect } from 'react';
import { UniversalLoader } from '@/components/ui';

export default function TestUniversalLoaderPage() {
  const [currentTask, setCurrentTask] = useState("Initializing System...");
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
  
  const tasks = [
    "Initializing System...",
    "Finding Nearby Stations...",
    "Processing Payment...",
    "Booking Slot...",
    "Fetching Data...",
    "Syncing Dashboard...",
    "Loading Modules...",
    "Connecting to Grid...",
    "Verifying Credentials...",
    "Optimizing Performance..."
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTask(tasks[Math.floor(Math.random() * tasks.length)]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#F1F5F9] mb-8 text-center">
          Universal Loader Test
        </h1>
        
        <div className="bg-[#334155] rounded-xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-[#F1F5F9] mb-4">Loader Preview</h2>
          
          <div className="flex justify-center items-center h-80 bg-[#1E293B] rounded-lg mb-6 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] to-[#0F172A] opacity-50"></div>
            <UniversalLoader 
              task={currentTask} 
              size={size}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-[#F1F5F9] mb-3">Current Task</h3>
              <div className="bg-[#475569] p-4 rounded-lg">
                <p className="text-[#F1F5F9] font-mono">{currentTask}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-[#F1F5F9] mb-3">Size Options</h3>
              <div className="flex flex-wrap gap-2">
                {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSize(sz)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      size === sz
                        ? 'bg-[#10B981] text-white'
                        : 'bg-[#475569] text-[#F1F5F9] hover:bg-[#5A6B8C]'
                    }`}
                  >
                    {sz.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#334155] rounded-xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-[#F1F5F9] mb-4">Usage Examples</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-[#F1F5F9] mb-2">Basic Usage</h3>
              <pre className="bg-[#1E293B] text-[#F1F5F9] p-4 rounded-lg overflow-x-auto">
                {`<UniversalLoader task="Loading..." />`}
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-[#F1F5F9] mb-2">With Custom Task</h3>
              <pre className="bg-[#1E293B] text-[#F1F5F9] p-4 rounded-lg overflow-x-auto">
                {`<UniversalLoader task="Finding Nearby Stations..." size="lg" />`}
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-[#F1F5F9] mb-2">Small Size</h3>
              <pre className="bg-[#1E293B] text-[#F1F5F9] p-4 rounded-lg overflow-x-auto">
                {`<UniversalLoader task="Syncing..." size="sm" />`}
              </pre>
            </div>
          </div>
        </div>
        
        <div className="bg-[#334155] rounded-xl p-8">
          <h2 className="text-xl font-semibold text-[#F1F5F9] mb-4">Component Features</h2>
          
          <ul className="list-disc pl-6 space-y-2 text-[#F1F5F9]">
            <li><strong>Logo-Centric:</strong> Animates only using the edges and paths of the logo</li>
            <li><strong>Futuristic Energy Flow:</strong> Glowing strokes, electric pulses, and spark effects</li>
            <li><strong>Dynamic Text:</strong> Task text changes dynamically with smooth transitions</li>
            <li><strong>Universal Loop:</strong> Breathing glow animation after initial charging</li>
            <li><strong>Responsive Sizes:</strong> sm, md, lg, xl size options</li>
            <li><strong>GSAP Powered:</strong> Smooth 60fps animations with proper cleanup</li>
            <li><strong>Theme Consistent:</strong> Matches EV Bunker color scheme (purple, emerald, teal)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}