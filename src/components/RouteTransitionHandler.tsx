"use client";

import React, { Suspense } from 'react';
import { useRouteTransition } from '@/hooks/useRouteTransition';

// Loading component for Suspense
function Loading() {
  return null; // This component doesn't render anything, it just handles transitions
}

function RouteTransitionContent() {
  useRouteTransition();
  return null; // This component doesn't render anything, it just handles transitions
}

export const RouteTransitionHandler = () => {
  return (
    <Suspense fallback={<Loading />}>
      <RouteTransitionContent />
    </Suspense>
  );
};