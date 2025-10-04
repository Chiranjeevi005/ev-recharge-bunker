"use client";

import { useRouteTransition } from '@/hooks/useRouteTransition';

export const RouteTransitionHandler = () => {
  useRouteTransition();
  return null; // This component doesn't render anything, it just handles transitions
};