"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
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

  const showLoader = (task: string, state: 'loading' | 'success' | 'error' | 'idle' = 'loading') => {
    setTask(task);
    setState(state);
    setIsLoading(true);
  };

  const hideLoader = () => {
    setIsLoading(false);
  };

  const updateLoader = (task: string, state: 'loading' | 'success' | 'error' | 'idle' = 'loading') => {
    setTask(task);
    setState(state);
  };

  return (
    <LoaderContext.Provider value={{ isLoading, showLoader, hideLoader, updateLoader }}>
      {children}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }} // Further reduced for faster exit
          >
            <UniversalLoader task={task} state={state} size="lg" />
          </motion.div>
        )}
      </AnimatePresence>
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