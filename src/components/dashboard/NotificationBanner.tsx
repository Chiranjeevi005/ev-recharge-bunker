import React from 'react';

interface NotificationBannerProps {
  message: string;
  type: string;
  onClose: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ message, type, onClose }) => {
  const getTypeStyles = () => {
    switch (type.toLowerCase()) {
      case 'success':
        return 'bg-green-900/50 border-green-800/50 text-green-400 backdrop-blur-sm';
      case 'warning':
        return 'bg-yellow-900/50 border-yellow-800/50 text-yellow-400 backdrop-blur-sm';
      case 'error':
        return 'bg-red-900/50 border-red-800/50 text-red-400 backdrop-blur-sm';
      case 'info':
      default:
        return 'bg-blue-900/50 border-blue-800/50 text-blue-400 backdrop-blur-sm';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getTypeStyles()} flex justify-between items-center`}>
      <div className="flex items-center">
        <svg 
          className="w-5 h-5 mr-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {type.toLowerCase() === 'success' && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          )}
          {type.toLowerCase() === 'warning' && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          )}
          {type.toLowerCase() === 'error' && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          )}
          {type.toLowerCase() === 'info' && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          )}
        </svg>
        <span>{message}</span>
      </div>
      <button 
        onClick={onClose}
        className="text-current hover:text-opacity-70 focus:outline-none"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
};

export default NotificationBanner;