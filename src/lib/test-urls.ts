// src/lib/test-urls.ts

const getBaseUrl = () => {
  // Aynı mantık, force-urls.ts ile tamamen aynı
  return import.meta.env.VITE_APP_URL ?? window.location.origin;
};

export const testMagicLinkUrl = () => {
  const base = getBaseUrl();
  const url = `${base}/onboarding/step-1`;

  if (import.meta.env.DEV) {
    console.log('[test] Magic Link expected →', url);
  }

  return url;
};

export const testPasswordResetUrl = () => {
  const base = getBaseUrl();
  const url = `${base}/update-password`;

  if (import.meta.env.DEV) {
    console.log('[test] Password Reset expected →', url);
  }

  return url;
};

// Development ortamında otomatik test
if (import.meta.env.DEV) {
  console.group('🧪 URL Tests (development only)');
  console.log('Magic Link    :', testMagicLinkUrl());
  console.log('Password Reset:', testPasswordResetUrl());
  console.groupEnd();
}