import { ReactNode, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { theme } from '@/lib/theme';
import useMediaQuery from '@/hooks/use-media-query';

interface OnboardingContainerProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  currentStep?: number;
  totalSteps?: number;
  showBack?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLoading?: boolean;
  forceLightMode?: boolean;
}

export const OnboardingContainer = ({
  children,
  title,
  subtitle,
  currentStep,
  totalSteps = 4,
  showBack = true,
  onBack,
  onNext,
  nextLabel = "Next",
  nextDisabled = false,
  isLoading = false,
  forceLightMode = false,
}: OnboardingContainerProps) => {
  const systemPrefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const prefersDark = forceLightMode ? false : systemPrefersDark;
  const surfaces = prefersDark ? theme.colors.surfaces.dark : theme.colors.surfaces.light;
  const typography = prefersDark ? theme.colors.typography.dark : theme.colors.typography.light;

  const footerStyle = useMemo(() => ({
    backgroundColor: surfaces.card,
    borderTop: `1px solid ${surfaces.border}`,
  }), [surfaces.card, surfaces.border]);

  const nextButtonStyle = useMemo(() => ({
    backgroundColor: theme.colors.buttons.primary,
    boxShadow: 'none',
  }), []);

  return (
    <div
      className="min-h-[100svh] flex flex-col"
      style={{ backgroundColor: surfaces.background }}
    >
      {/* Progress Bar */}
      {currentStep && (
        <div
          className="w-full h-1.5"
          style={{ backgroundColor: surfaces.border }}
        >
          <div 
            className="h-full transition-all duration-500 ease-out rounded-r-full"
            style={{
              backgroundColor: theme.colors.buttons.primary,
              width: `${(currentStep / totalSteps) * 100}%`,
            }}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 sm:p-6">
        <div className="w-full max-w-4xl mx-auto flex flex-col flex-1">
          <header className="text-center mb-8 mt-4 sm:mt-8">
            <h1
              className="text-3xl sm:text-4xl font-bold mb-2"
              style={{ color: typography.heading }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="text-base sm:text-lg max-w-xl mx-auto"
                style={{ color: typography.body }}
              >
                {subtitle}
              </p>
            )}
          </header>

          <div className="flex-1 mb-8">
            {children}
          </div>

          {/* Navigation Footer */}
          <footer className="sticky bottom-0 pt-8 pb-4">
            <div className="max-w-md mx-auto flex flex-col gap-3">
              <Button
                onClick={onNext}
                disabled={nextDisabled || isLoading}
                className="w-full text-base py-6 text-white font-bold hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 shadow-none border-0 rounded-full"
                style={nextButtonStyle}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : nextLabel}
              </Button>
              
              {showBack && onBack && (
                <Button
                  onClick={onBack}
                  variant="ghost"
                  className="w-full text-gray-600 hover:text-gray-900"
                  size="lg"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};
