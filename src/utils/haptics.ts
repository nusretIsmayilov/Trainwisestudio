/**
 * Haptic feedback utility for mobile devices
 * Provides tactile feedback on supported devices with safe fallback
 */

type HapticIntensity = 'light' | 'medium' | 'heavy';

const VIBRATION_DURATION: Record<HapticIntensity, number> = {
  light: 10,
  medium: 20,
  heavy: 30,
};

/**
 * Check if we're on a mobile device
 */
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Trigger haptic feedback on mobile devices
 * Safely fails on unsupported devices
 */
export const triggerHaptic = (intensity: HapticIntensity = 'light'): void => {
  try {
    // Only trigger on mobile devices
    if (!isMobileDevice()) return;

    if ('vibrate' in navigator) {
      navigator.vibrate(VIBRATION_DURATION[intensity]);
    }
  } catch {
    // Silently fail - haptics are optional UX enhancement
  }
};

/**
 * Trigger haptic on navigation
 */
export const triggerNavHaptic = (): void => {
  triggerHaptic('light');
};

/**
 * Trigger haptic on drawer toggle
 */
export const triggerDrawerHaptic = (): void => {
  triggerHaptic('medium');
};
