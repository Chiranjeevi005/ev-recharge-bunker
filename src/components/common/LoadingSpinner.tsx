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
    sm: 'w-3 h-3 border-2 xs:w-4 xs:h-4',
    md: 'w-6 h-6 border-3 xs:w-8 xs:h-8 border-4',
    lg: 'w-8 h-8 border-4 xs:w-10 xs:h-10 md:w-12 md:h-12 md:border-4'
  };
  
  const currentSize = sizeClasses[size];
  
  return (
    <div className={`inline-block ${currentSize} rounded-full border-t-transparent border-[#8B5CF6] animate-spin ${className}`} />
  );
};