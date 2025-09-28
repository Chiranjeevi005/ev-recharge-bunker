"use client";

import React from 'react';
import { FuturisticMap } from '@/components/landing/FuturisticMap';

interface MapSectionProps {
  onBookPay: () => void;
}

export const MapSection: React.FC<MapSectionProps> = ({ onBookPay }) => {
  return (
    <div className="px-4 py-6">
      <FuturisticMap />
    </div>
  );
};
