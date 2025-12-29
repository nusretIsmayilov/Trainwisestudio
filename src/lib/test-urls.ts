// src/lib/test-urls.ts
// Test utility to verify magic link URLs

export const testMagicLinkUrl = () => {
  const isProduction = import.meta.env.PROD;
  const expectedUrl = isProduction 
    ? 'https://www.trainwisestudio.com/onboarding/step-1'
    : `${window.location.origin}/onboarding/step-1`;
  
  return expectedUrl;
};

export const testPasswordResetUrl = () => {
  const isProduction = import.meta.env.PROD;
  const expectedUrl = isProduction 
    ? 'https://www.trainwisestudio.com/update-password'
    : `${window.location.origin}/update-password`;  
  return expectedUrl;
};

// Auto-test in development
if (import.meta.env.DEV) {
  testMagicLinkUrl();
  testPasswordResetUrl();
}
