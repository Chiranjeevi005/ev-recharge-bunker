"use client";

import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UniversalLoader } from '@/components/ui/UniversalLoader';

interface LoaderContextType {
  isLoading: boolean;
  showLoader: (task: string, state?: 'loading' | 'success' | 'error' | 'idle') => void;
  hideLoader: () => void;
  updateLoader: (task: string, state?: 'loading' | 'success' | 'error' | 'idle') => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [task, setTask] = useState("Loading...");
  const [state, setState] = useState<'loading' | 'success' | 'error' | 'idle'>('loading');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showLoader = useCallback((task: string, state: 'loading' | 'success' | 'error' | 'idle' = 'loading') => {
    // Clear any existing timeout to prevent race conditions
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setTask(task);
    setState(state);
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    // Add a small delay to ensure smooth transitions and prevent flickering
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      timeoutRef.current = null;
    }, 500); // Increased delay for smoother transitions
  }, []);

  const updateLoader = useCallback((task: string, state: 'loading' | 'success' | 'error' | 'idle' = 'loading') => {
    setTask(task);
    setState(state);
  }, []);

  return (
    <LoaderContext.Provider value={{ isLoading, showLoader, hideLoader, updateLoader }}>
      {children}
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B] backdrop-blur-sm pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          visibility: isLoading ? 'visible' : 'hidden',
          pointerEvents: isLoading ? 'auto' : 'none'
        }}
      >
        <UniversalLoader task={task} state={state} size="lg" />
      </motion.div>
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (context === undefined) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
};