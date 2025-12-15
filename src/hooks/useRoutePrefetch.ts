import { useEffect } from 'react';

/**
 * Route prefetching for smoother navigation
 * Preloads likely next pages during idle time
 */

const CUSTOMER_PREFETCH_ROUTES = [
  () => import('@/pages/customer/MyProgramsPage'),
  () => import('@/pages/customer/ProgressPage'),
  () => import('@/pages/customer/LibraryPage'),
];

const COACH_PREFETCH_ROUTES = [
  () => import('@/pages/coach/ClientOverviewPage'),
  () => import('@/pages/coach/ProgramsPage'),
  () => import('@/pages/coach/MessagesPage'),
];

export const useRoutePrefetch = (role: 'customer' | 'coach' | null) => {
  useEffect(() => {
    if (!role) return;

    const prefetch = () => {
      const routes = role === 'coach' ? COACH_PREFETCH_ROUTES : CUSTOMER_PREFETCH_ROUTES;
      routes.forEach((route) => {
        try {
          route();
        } catch {
          // Silently fail - prefetch is optional optimization
        }
      });
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    } else {
      const id = setTimeout(prefetch, 2000);
      return () => clearTimeout(id);
    }
  }, [role]);
};
