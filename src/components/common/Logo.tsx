"use client";

import React from 'react';
import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  variant?: 'default' | 'navbar';
}

export const Logo: React.FC<LogoProps> = ({ 
  width = 40, 
  height = 40,
  className = "",
  variant = 'default'
}) => {
  // Adjust size based on variant
  const logoSize = variant === 'navbar' ? { width: 32, height: 32 } : { width, height };
  const containerClass = variant === 'navbar' ? "relative w-8 h-8 xs:w-10 xs:h-10" : "relative w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12";

  return (
    <div className={`flex items-center space-x-1 xs:space-x-2 ${className}`}>
      {/* You can replace this with your custom logo image */}
      <div className={containerClass}>
        <Image 
          src="/assets/logo.png" 
          alt="EV Bunker Logo" 
          width={logoSize.width}
          height={logoSize.height}
          className="object-contain"
        />
      </div>
      
      {/* Text logo - you can remove this if using only image */}
      <span className="text-sm xs:text-base sm:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hidden xs:block">
        EV Bunker
      </span>
    </div>
  );
};

export default Logo;