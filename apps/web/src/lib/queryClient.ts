import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes before marking it stale
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Only retry once on network errors (not on 4xx responses)
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 1;
      },
      // Don't refetch when window regains focus in dev
      refetchOnWindowFocus: import.meta.env.PROD,
    },
    mutations: {
      // Retry mutations once on network failure
      retry: 1,
    },
  },
});
