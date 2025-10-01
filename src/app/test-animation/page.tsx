"use client";

import React, { useState } from 'react';
import { LogoAnimation } from '@/components/ui';

export default function TestAnimationPage() {
  const [animationState, setAnimationState] = useState<'loading' | 'success' | 'idle' | 'transition'>('idle');
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
  const [showText, setShowText] = useState(true);
  const [disableGlow, setDisableGlow] = useState(false);
  const [disableParticles, setDisableParticles] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#334155] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#F1F5F9] mb-8 text-center">
          EV Bunker Advanced Logo Animation
        </h1>
        
        <div className="bg-[#334155] rounded-xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-[#F1F5F9] mb-4">Animation Preview</h2>
          
          <div className="flex justify-center items-center h-80 bg-[#1E293B] rounded-lg mb-6 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] to-[#0F172A] opacity-50"></div>
            <LogoAnimation 
              state={animationState} 
              size={size}
              showText={showText}
              disableGlow={disableGlow}
              disableParticles={disableParticles}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-[#F1F5F9] mb-3">Animation State</h3>
              <div className="flex flex-wrap gap-2">
                {(['idle', 'loading', 'success', 'transition'] as const).map((state) => (
                  <button
                    key={state}
                    onClick={() => setAnimationState(state)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      animationState === state
                        ? 'bg-[#8B5CF6] text-white'
                        : 'bg-[#475569] text-[#F1F5F9] hover:bg-[#5A6B8C]'
                    }`}
                  >
                    {state.charAt(0).toUpperCase() + state.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-[#F1F5F9] mb-3">Options</h3>
              <div className="space-y-4">
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
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowText(!showText)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      showText
                        ? 'bg-[#10B981] text-white'
                        : 'bg-[#475569] text-[#F1F5F9] hover:bg-[#5A6B8C]'
                    }`}
                  >
                    {showText ? 'Hide Text' : 'Show Text'}
                  </button>
                  
                  <button
                    onClick={() => setDisableGlow(!disableGlow)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      disableGlow
                        ? 'bg-[#F59E0B] text-white'
                        : 'bg-[#475569] text-[#F1F5F9] hover:bg-[#5A6B8C]'
                    }`}
                  >
                    {disableGlow ? 'Enable Glow' : 'Disable Glow'}
                  </button>
                  
                  <button
                    onClick={() => setDisableParticles(!disableParticles)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      disableParticles
                        ? 'bg-[#F59E0B] text-white'
                        : 'bg-[#475569] text-[#F1F5F9] hover:bg-[#5A6B8C]'
                    }`}
                  >
                    {disableParticles ? 'Enable Particles' : 'Disable Particles'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#334155] rounded-xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-[#F1F5F9] mb-4">Usage Examples</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-[#F1F5F9] mb-2">Initial Loader</h3>
              <pre className="bg-[#1E293B] text-[#F1F5F9] p-4 rounded-lg overflow-x-auto">
                {`<LogoAnimation state="loading" size="lg" showText />`}
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-[#F1F5F9] mb-2">API Fetching/Loading</h3>
              <pre className="bg-[#1E293B] text-[#F1F5F9] p-4 rounded-lg overflow-x-auto">
                {`<LogoAnimation state="idle" size="md" />`}
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-[#F1F5F9] mb-2">Payment Success / Booking Confirmed</h3>
              <pre className="bg-[#1E293B] text-[#F1F5F9] p-4 rounded-lg overflow-x-auto">
                {`<LogoAnimation state="success" size="lg" showText />`}
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-[#F1F5F9] mb-2">Dashboard Refresh</h3>
              <pre className="bg-[#1E293B] text-[#F1F5F9] p-4 rounded-lg overflow-x-auto">
                {`<LogoAnimation state="transition" size="md" />`}
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-[#F1F5F9] mb-2">Minimal Version</h3>
              <pre className="bg-[#1E293B] text-[#F1F5F9] p-4 rounded-lg overflow-x-auto">
                {`<LogoAnimation state="idle" size="md" disableGlow disableParticles />`}
              </pre>
            </div>
          </div>
        </div>
        
        <div className="bg-[#334155] rounded-xl p-8">
          <h2 className="text-xl font-semibold text-[#F1F5F9] mb-4">Component Features</h2>
          
          <ul className="list-disc pl-6 space-y-2 text-[#F1F5F9]">
            <li><strong>Brand Consistent:</strong> Uses your actual EV Bunker logo and brand colors</li>
            <li><strong>Advanced GSAP Animations:</strong> Complex animations with rotation, scaling, and particle effects</li>
            <li><strong>Multiple States:</strong> Loading, Success, Idle, and Transition animations</li>
            <li><strong>Customizable:</strong> Toggle glow effects, particles, and text display</li>
            <li><strong>Responsive Sizing:</strong> sm, md, lg, xl size options</li>
            <li><strong>Theme Aligned:</strong> Matches your color scheme (purple, emerald, teal)</li>
            <li><strong>Performance Optimized:</strong> Smooth animations at 60fps with proper cleanup</li>
          </ul>
        </div>
      </div>
    </div>
  );
}