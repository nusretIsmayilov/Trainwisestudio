// src/pages/onboarding/OnboardingSuccess.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, Download, Loader2 } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWelcomePDF } from '@/hooks/useWelcomePDF';

const OnboardingSuccess = () => {
  const { clearState } = useOnboarding();
  const { refreshProfile } = useAuth();
  const { downloadPDF, saveToProfile, loading: pdfLoading, error: pdfError } = useWelcomePDF();
  const navigate = useNavigate();
  const [pdfGenerated, setPdfGenerated] = useState(false);

  useEffect(() => {
    // Clean up the form state when the user leaves this page.
    return () => {
      clearState();
    };
  }, [clearState]);

  const handleDownloadPDF = async () => {
    try {
      await downloadPDF();
      await saveToProfile();
      setPdfGenerated(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleGoToDashboard = async () => {
    // 1. First, tell the app to get the new profile data (onboarding_complete: true)
    await refreshProfile();
    // 2. Then, navigate. The router will now see the user is fully onboarded.
    navigate('/customer/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <Card className="bg-white/80 backdrop-blur-sm shadow-2xl animate-fade-in-up">
          <CardContent className="p-8 space-y-6">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full animate-pulse-slow" />
              <div className="relative bg-white rounded-full w-full h-full flex items-center justify-center shadow-inner">
                <CheckCircle className="h-12 w-12 text-emerald-500" />
              </div>
              <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-800">You're all set! 🎉</h1>
              <p className="text-gray-600">We've crafted your personalized plan. Your wellness journey starts now.</p>
            </div>

            <div className="space-y-3 text-left pt-4 border-t">
              <FeatureHighlight emoji="💪" title="Custom Workout Plans" subtitle="Tailored to your goals." />
              <FeatureHighlight emoji="🥗" title="Nutrition Guidance" subtitle="Meals that fit your life." />
              <FeatureHighlight emoji="🧘" title="Mindfulness Tools" subtitle="Build mental resilience." />
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleDownloadPDF}
                disabled={pdfLoading || pdfGenerated}
                variant="outline"
                className="w-full text-lg py-4 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-semibold"
              >
                {pdfLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Welcome PDF...
                  </>
                ) : pdfGenerated ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    PDF Downloaded & Saved!
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Download Welcome PDF
                  </>
                )}
              </Button>
              
              {pdfError && (
                <p className="text-sm text-red-600">{pdfError}</p>
              )}

              <Button
                onClick={handleGoToDashboard}
                className="w-full text-lg py-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Go to My Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const FeatureHighlight = ({ emoji, title, subtitle }) => (
  <div className="flex items-center gap-4 p-3 bg-emerald-50/50 rounded-lg">
    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow">
      <span className="text-xl">{emoji}</span>
    </div>
    <div>
      <p className="font-semibold text-gray-800">{title}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  </div>
);

export default OnboardingSuccess;
