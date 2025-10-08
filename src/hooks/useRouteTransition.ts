import { useEffect, useCallback, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoader } from '@/context/LoaderContext';
import Router from 'next/router';

let isInitialLoad = true;

export const useRouteTransition = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showLoader, hideLoader } = useLoader();
  const routeChangeTimer = useRef<NodeJS.Timeout | null>(null);

  // Handle initial page load
  useEffect(() => {
    if (isInitialLoad) {
      isInitialLoad = false;
      // For dashboard routes, don't show the loader as the page will handle it
      if (!window.location.pathname.includes('/dashboard')) {
        // Hide loader after initial load for non-dashboard routes
        hideLoader();
      }
    }
  }, [hideLoader]);

  const handleRouteChangeStart = useCallback((url: string) => {
    // Clear any existing timer
    if (routeChangeTimer.current) {
      clearTimeout(routeChangeTimer.current);
    }
    
    // For dashboard routes, don't show the loader as the page will handle it
    if (!url.includes('/dashboard')) {
      showLoader("Loading...");
    }
  }, [showLoader]);

  const handleRouteChangeComplete = useCallback(() => {
    // Clear any existing timer
    if (routeChangeTimer.current) {
      clearTimeout(routeChangeTimer.current);
    }
    
    // For non-dashboard routes, hide the loader after a delay
    if (!window.location.pathname.includes('/dashboard')) {
      // Use a timer to ensure smooth transitions
      routeChangeTimer.current = setTimeout(() => {
        hideLoader();
      }, 250); // Optimized delay for smoother transitions
    }
  }, [hideLoader]);

  const handleRouteChangeError = useCallback(() => {
    // Clear any existing timer
    if (routeChangeTimer.current) {
      clearTimeout(routeChangeTimer.current);
    }
    
    // Hide loader immediately if there's an error
    hideLoader();
  }, [hideLoader]);

  useEffect(() => {
    // Add router event listeners
    Router.events.on('routeChangeStart', handleRouteChangeStart);
    Router.events.on('routeChangeComplete', handleRouteChangeComplete);
    Router.events.on('routeChangeError', handleRouteChangeError);

    // Cleanup event listeners
    return () => {
      Router.events.off('routeChangeStart', handleRouteChangeStart);
      Router.events.off('routeChangeComplete', handleRouteChangeComplete);
      Router.events.off('routeChangeError', handleRouteChangeError);
      
      // Clear timer on unmount
      if (routeChangeTimer.current) {
        clearTimeout(routeChangeTimer.current);
      }
    };
  }, [handleRouteChangeStart, handleRouteChangeComplete, handleRouteChangeError]);

  // Handle client-side navigation changes
  useEffect(() => {
    // This will trigger whenever pathname or searchParams change
    // We don't need to do anything here as the router events handle it
    // This is just to ensure the effect runs when route changes
  }, [pathname, searchParams]);
};