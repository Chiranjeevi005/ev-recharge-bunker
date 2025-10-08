import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4'
  };
  
  const currentSize = sizeClasses[size];
  
  return (
    <div className={`inline-block ${currentSize} rounded-full border-t-transparent border-[#8B5CF6] animate-spin ${className}`} />
  );
};