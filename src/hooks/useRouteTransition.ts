import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoader } from '@/lib/LoaderContext';
import Router from 'next/router';

let isInitialLoad = true;

export const useRouteTransition = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    // Handle initial page load
    if (isInitialLoad) {
      isInitialLoad = false;
      // Hide loader after initial load
      hideLoader();
    }
  }, [hideLoader]);

  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      // For dashboard routes, don't show the loader as the page will handle it
      if (!url.includes('/dashboard')) {
        showLoader("Loading...");
      }
    };

    const handleRouteChangeComplete = () => {
      // For non-dashboard routes, hide the loader after a delay
      if (!window.location.pathname.includes('/dashboard')) {
        // Increased delay to ensure smoother transitions
        setTimeout(() => {
          hideLoader();
        }, 500);
      }
    };

    const handleRouteChangeError = () => {
      // Hide loader immediately if there's an error
      hideLoader();
    };

    // Add router event listeners
    Router.events.on('routeChangeStart', handleRouteChangeStart);
    Router.events.on('routeChangeComplete', handleRouteChangeComplete);
    Router.events.on('routeChangeError', handleRouteChangeError);

    // Cleanup event listeners
    return () => {
      Router.events.off('routeChangeStart', handleRouteChangeStart);
      Router.events.off('routeChangeComplete', handleRouteChangeComplete);
      Router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [showLoader, hideLoader]);

  // Handle client-side navigation changes
  useEffect(() => {
    // This will trigger whenever pathname or searchParams change
    // We don't need to do anything here as the router events handle it
    // This is just to ensure the effect runs when route changes
  }, [pathname, searchParams]);
};