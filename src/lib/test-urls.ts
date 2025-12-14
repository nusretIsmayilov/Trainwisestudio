// src/lib/test-urls.ts
// Test utility to verify magic link URLs

export const testMagicLinkUrl = () => {
  const isProduction = import.meta.env.PROD;
  const expectedUrl = isProduction 
    ? 'https://www.trainwisestudio.com/onboarding/step-1'
    : `${window.location.origin}/onboarding/step-1`;
  
  console.group('🧪 Magic Link URL Test');
  console.log('Environment:', isProduction ? 'Production' : 'Development');
  console.log('Expected URL:', expectedUrl);
  console.log('Current origin:', window.location.origin);
  
  if (isProduction && !expectedUrl.includes('www.trainwisestudio.com')) {
    console.error('❌ Production build is not using www.trainwisestudio.com!');
  } else if (isProduction && expectedUrl.includes('www.trainwisestudio.com')) {
    console.log('✅ Production build correctly using www.trainwisestudio.com');
  } else {
    console.log('ℹ️ Development mode - using current origin');
  }
  
  console.groupEnd();
  
  return expectedUrl;
};

export const testPasswordResetUrl = () => {
  const isProduction = import.meta.env.PROD;
  const expectedUrl = isProduction 
    ? 'https://www.trainwisestudio.com/update-password'
    : `${window.location.origin}/update-password`;
  
  console.group('🧪 Password Reset URL Test');
  console.log('Environment:', isProduction ? 'Production' : 'Development');
  console.log('Expected URL:', expectedUrl);
  
  if (isProduction && !expectedUrl.includes('www.trainwisestudio.com')) {
    console.error('❌ Production build is not using www.trainwisestudio.com!');
  } else if (isProduction && expectedUrl.includes('www.trainwisestudio.com')) {
    console.log('✅ Production build correctly using www.trainwisestudio.com');
  } else {
    console.log('ℹ️ Development mode - using current origin');
  }
  
  console.groupEnd();
  
  return expectedUrl;
};

// Auto-test in development
if (import.meta.env.DEV) {
  console.log('🔍 Running URL tests...');
  testMagicLinkUrl();
  testPasswordResetUrl();
}
