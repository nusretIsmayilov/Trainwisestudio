// Centralized route access configuration
// Access levels: 'full' (trial/subscription), 'coach_only' (coach contract only), 'minimal' (no access requirements)

export type AccessLevel = 'full' | 'coach_only' | 'minimal' | 'none';

export interface RouteAccessConfig {
  requiredLevel: AccessLevel;
  allowPartialAccess?: boolean; // For library - coach_only gets limited access
}

// Customer route access rules
export const CUSTOMER_ROUTE_ACCESS: Record<string, RouteAccessConfig> = {
  // Always accessible (minimal)
  '/customer/dashboard': { requiredLevel: 'minimal' },
  '/customer/my-coach': { requiredLevel: 'minimal' },
  '/customer/settings': { requiredLevel: 'minimal' },
  '/customer/payment/update-plan': { requiredLevel: 'minimal' },
  '/customer/payment/cancel-subscription': { requiredLevel: 'minimal' },
  '/customer/messages': { requiredLevel: 'minimal' }, // Navigation allowed, chat requires coach
  
  // Coach contract OR subscription required
  '/customer/programs': { requiredLevel: 'coach_only' },
  '/customer/library': { requiredLevel: 'coach_only', allowPartialAccess: true },
  '/program': { requiredLevel: 'coach_only' },
  
  // Full access only (subscription/trial required)
  '/customer/progress': { requiredLevel: 'full' },
  '/customer/history': { requiredLevel: 'full' },
  '/customer/blog': { requiredLevel: 'full' },
};

// Helper to get route config with path matching
export const getRouteAccess = (path: string): RouteAccessConfig => {
  // Exact match first
  if (CUSTOMER_ROUTE_ACCESS[path]) {
    return CUSTOMER_ROUTE_ACCESS[path];
  }
  
  // Prefix match for dynamic routes
  for (const [route, config] of Object.entries(CUSTOMER_ROUTE_ACCESS)) {
    if (path.startsWith(route)) {
      return config;
    }
  }
  
  // Default to minimal access for unknown routes
  return { requiredLevel: 'minimal' };
};
