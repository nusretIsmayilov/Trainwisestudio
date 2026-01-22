// src/lib/test-urls.ts
// Test utility to verify magic link URLs

export const testMagicLinkUrl = () => {
  const isProduction = import.meta.env.PROD;
  const expectedUrl = isProduction 
    ? 'https://trainwisestudio-ten.vercel.app/onboarding/step-1'
    : `${window.location.origin}/onboarding/step-1`;
  console.groupEnd();
  
  return expectedUrl;
};

export const testPasswordResetUrl = () => {
  const isProduction = import.meta.env.PROD;
  const expectedUrl = isProduction 
    ? 'https://trainwisestudio-ten.vercel.app/update-password'
    : `${window.location.origin}/update-password`;
  
  console.groupEnd();
  
  return expectedUrl;
};

// Auto-test in development
if (import.meta.env.DEV) {
  testMagicLinkUrl();
  testPasswordResetUrl();
}
