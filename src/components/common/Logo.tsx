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
  const logoSize = variant === 'navbar' ? { width: 48, height: 48 } : { width, height };
  const containerClass = variant === 'navbar' ? "relative w-12 h-12" : "relative w-10 h-10";

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
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
      <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] to-[#10B981] hidden sm:block">
        EV Bunker
      </span>
    </div>
  );
};

export default Logo;