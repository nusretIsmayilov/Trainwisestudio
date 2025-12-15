/**
 * React Query Configuration
 * Optimized for 1M+ daily users with proper caching and stale time management
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      // Retry failed queries up to 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus in production (helps with stale data)
      refetchOnWindowFocus: import.meta.env.PROD,
      // Don't refetch on reconnect if data is still fresh
      refetchOnReconnect: true,
      // Refetch on mount if data is stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      retryDelay: 1000,
    },
  },
});

/**
 * Query key factories for consistent cache invalidation
 */
export const queryKeys = {
  // Profile queries
  profile: (userId?: string) => ['profile', userId] as const,
  profiles: () => ['profiles'] as const,
  
  // Program queries
  programs: (filters?: Record<string, any>) => ['programs', filters] as const,
  program: (id: string) => ['program', id] as const,
  programEntries: (programId?: string, userId?: string) => 
    ['program-entries', programId, userId] as const,
  
  // Coach queries
  coachClients: (coachId?: string) => ['coach-clients', coachId] as const,
  coachPrograms: (coachId?: string) => ['coach-programs', coachId] as const,
  coachLibrary: (coachId?: string) => ['coach-library', coachId] as const,
  coachBlog: (coachId?: string) => ['coach-blog', coachId] as const,
  
  // Message queries
  conversations: (userId?: string) => ['conversations', userId] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
  
  // Payment queries
  paymentPlan: (userId?: string) => ['payment-plan', userId] as const,
  paymentInfo: (userId?: string) => ['payment-info', userId] as const,
  
  // Check-in queries
  dailyCheckins: (userId?: string, date?: string) => 
    ['daily-checkins', userId, date] as const,
  
  // Blog queries
  blogPosts: (filters?: Record<string, any>) => ['blog-posts', filters] as const,
  blogPost: (id: string) => ['blog-post', id] as const,
};

