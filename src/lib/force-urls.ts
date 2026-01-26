// src/lib/force-urls.ts

const getBaseUrl = () => {
  // 1. Most reliable: Custom VITE_APP_URL set in Vercel dashboard (for production)
  if (import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL;
  }

  // 2. Fallback for local dev + previews (uses the actual running domain)
  return window.location.origin;
  // Alternative static fallback: return 'http://localhost:8080';
};

export const FORCE_PRODUCTION_URLS = {
  DOMAIN: getBaseUrl(),

  MAGIC_LINK: `${getBaseUrl()}/onboarding/step-1`,
  PASSWORD_RESET: `${getBaseUrl()}/update-password`,

  CUSTOMER_DASHBOARD: `${getBaseUrl()}/customer/dashboard`,
  COACH_DASHBOARD: `${getBaseUrl()}/coach/dashboard`,

  PAYMENT_SUCCESS: `${getBaseUrl()}/customer/dashboard?status=success`,
  PAYMENT_CANCEL: `${getBaseUrl()}/customer/settings?status=cancel`,
  OFFER_SUCCESS: `${getBaseUrl()}/customer/messages?offer_status=paid`,
  OFFER_CANCEL: `${getBaseUrl()}/customer/messages?offer_status=cancel`,
} as const;

export const getProductionUrl = (path: string) => {
  const base = getBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

export const logUrlUsage = (type: string, url: string) => {
  console.log(`🔗 ${type} URL:`, url);

  if (import.meta.env.PROD) {
    const base = getBaseUrl();
    if (!url.startsWith(base)) {
      console.warn(`⚠️ WARNING: ${type} is not using the expected domain! Expected: ${base}`);
    } else {
      console.log(`✅ SUCCESS: ${type} is using the correct domain`);
    }
  } else if (import.meta.env.DEV) {
    console.log(`ℹ️ Dev mode: Using local/origin URL → ${getBaseUrl()}`);
  }
};