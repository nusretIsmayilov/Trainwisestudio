import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePaymentPlan } from "@/hooks/usePaymentPlan";

/**
 * Unified Access Level State Interface
 * Single source of truth for all access control in the application
 */
export interface AccessLevelState {
  // User role
  role: "customer" | "coach" | null;

  // Core access flags
  hasCoach: boolean;
  hasTrial: boolean;
  hasSubscription: boolean;
  hasPaymentPlan: boolean; // = hasTrial || hasSubscription
  hasCoachContract: boolean; // Alias for hasCoach

  // Derived access case from getCustomerAccessState
  accessLevel: "A" | "B" | "C";
  allowedRoutes: string[];
  deniedRoutes: string[];

  // Helper functions
  canAccessRoute: (path: string) => boolean;
  getAccessDenialReason: (path: string) => string | null;

  // Loading & auth state
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
}

/**
 * Normalize a path to its route key
 * '/customer/programs/123' → 'programs'
 * '/customer/progress/chart/weekly' → 'progress'
 */
const normalizePathToRoute = (path: string): string => {
  // Remove leading customer namespace
  const cleanPath = path.replace(/^\/customer\//, "");
  const segments = cleanPath.split("/");

  const routeMap: Record<string, string> = {
    dashboard: "home",
    home: "home",
    programs: "programs",
    program: "programs",
    progress: "progress",
    library: "library",
    messages: "messages",
    history: "history",
    "my-coach": "my-coach",
    blog: "blog",
    settings: "settings",
    payment: "settings", // Payment is part of settings
    "today-task": "home",
  };

  return routeMap[segments[0]] || segments[0];
};

/**
 * Get customer access state based on trial/subscription/coach status
 *
 * Case A — No trial, no subscription, no coach:
 *   ALLOW: home, messages, my-coach, settings
 *   DENY: programs, library, progress, blog
 *
 * Case B — Trial OR subscription:
 *   ALLOW: all customer routes
 *   DENY: none
 *
 * Case C — Private coach contract only:
 *   ALLOW: home, programs, library, messages, my-coach, settings
 *   DENY: progress, blog
 */
const getCustomerAccessState = (
  hasTrial: boolean,
  hasSubscription: boolean,
  hasCoachContract: boolean
): {
  accessLevel: "A" | "B" | "C";
  allowedRoutes: string[];
  deniedRoutes: string[];
} => {
  // Case B: Trial OR subscription - all routes allowed
  if (hasTrial || hasSubscription) {
    return {
      accessLevel: "B",
      allowedRoutes: [
        "home",
        "programs",
        "progress",
        "library",
        "messages",
        "my-coach",
        "blog",
        "settings",
        "history",
      ],
      deniedRoutes: [],
    };
  }

  // Case C: Private coach contract only
  if (hasCoachContract) {
    return {
      accessLevel: "C",
      allowedRoutes: [
        "home",
        "programs",
        "library",
        "messages",
        "my-coach",
        "settings",
      ],
      deniedRoutes: ["progress", "blog"],
    };
  }

  // Case A: No trial, no subscription, no coach
  return {
    accessLevel: "A",
    allowedRoutes: ["home", "messages", "my-coach", "settings", "history"],
    deniedRoutes: ["programs", "library", "progress", "blog"],
  };
};

const AccessLevelContext = createContext<AccessLevelState | undefined>(
  undefined
);

interface AccessLevelProviderProps {
  children: ReactNode;
}

export const AccessLevelProvider: React.FC<AccessLevelProviderProps> = ({
  children,
}) => {
  const { profile, loading: authLoading } = useAuth();
  const { planStatus } = usePaymentPlan();

  const value = useMemo((): AccessLevelState => {
    const isLoading = authLoading || planStatus.loading;
    const isAuthenticated = !!profile;
    const isOnboardingComplete = profile?.onboarding_complete ?? false;
    const role = (profile?.role as "customer" | "coach") ?? null;

    // Core flags
    const hasCoach = Boolean(profile?.coach_id);
    const hasTrial = planStatus.hasActiveTrial;
    const hasSubscription = planStatus.hasActiveSubscription;
    const hasPaymentPlan = planStatus.hasActivePlan;
    const hasCoachContract = hasCoach; // Alias

    // Get access state for customers
    const { accessLevel, allowedRoutes, deniedRoutes } = getCustomerAccessState(
      hasTrial,
      hasSubscription,
      hasCoachContract
    );

    // Helper: Check if user can access a specific route
    const canAccessRoute = (path: string): boolean => {
      // Coach can access all coach routes, no customer routes
      if (role === "coach") {
        return path.startsWith("/coach");
      }

      // Customer namespace check
      if (path.startsWith("/coach")) {
        return false; // Customers cannot access coach routes
      }

      // Normalize and check against allowed routes
      const normalizedRoute = normalizePathToRoute(path);
      return allowedRoutes.includes(normalizedRoute);
    };

    // Helper: Get human-friendly denial reason
    const getAccessDenialReason = (path: string): string | null => {
      if (canAccessRoute(path)) return null;

      const normalizedRoute = normalizePathToRoute(path);

      // Cross-namespace denial
      if (role === "coach" && path.startsWith("/customer")) {
        return "Coaches cannot access customer pages.";
      }
      if (role === "customer" && path.startsWith("/coach")) {
        return "Customers cannot access coach pages.";
      }

      // Route-specific denial messages
      if (["progress", "blog"].includes(normalizedRoute)) {
        return "This feature requires an active subscription or trial.";
      }
      if (["programs", "library"].includes(normalizedRoute)) {
        return "Connect with a coach or subscribe to access this feature.";
      }

      return "You do not have access to this page.";
    };

    return {
      role,
      hasCoach,
      hasTrial,
      hasSubscription,
      hasPaymentPlan,
      hasCoachContract,
      accessLevel,
      allowedRoutes,
      deniedRoutes,
      canAccessRoute,
      getAccessDenialReason,
      isLoading,
      isAuthenticated,
      isOnboardingComplete,
    };
  }, [profile, authLoading, planStatus]);

  return (
    <AccessLevelContext.Provider value={value}>
      {children}
    </AccessLevelContext.Provider>
  );
};

export const useAccessLevel = (): AccessLevelState => {
  const context = useContext(AccessLevelContext);
  if (context === undefined) {
    throw new Error(
      "useAccessLevel must be used within an AccessLevelProvider"
    );
  }
  return context;
};
