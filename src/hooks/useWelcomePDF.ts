import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { downloadWelcomePDF, getWelcomePDFBlob, WelcomePDFData } from '@/lib/pdf/welcome-pdf';
import { supabase } from '@/integrations/supabase/client';

export const useWelcomePDF = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWelcomeData = (): WelcomePDFData => {
    const onboardingDetails = ((profile as any)?.onboarding_details as any) || {};
    return {
      userName: profile?.full_name || user?.email?.split('@')[0] || 'User',
      userEmail: user?.email || '',
      goals: onboardingDetails.goals || [],
      startDate: new Date().toLocaleDateString(),
      platformName: 'Harmony Stride'
    };
  };

  const downloadPDF = async () => {
    if (!user || !profile) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = generateWelcomeData();
      downloadWelcomePDF(data);
    } catch (err) {
      console.error('Error generating welcome PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  const uploadToStorage = async (): Promise<string | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = generateWelcomeData();
      const pdfBlob = getWelcomePDFBlob(data);
      
      // Upload to Supabase Storage
      const fileName = `welcome-${user.id}-${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('welcome-pdfs')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('welcome-pdfs')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Error uploading welcome PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload PDF');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveToProfile = async (): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const pdfUrl = await uploadToStorage();
      if (!pdfUrl) {
        return false;
      }

      // Save PDF URL to user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ welcome_pdf_url: pdfUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      return true;
    } catch (err) {
      console.error('Error saving welcome PDF to profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save PDF to profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    downloadPDF,
    uploadToStorage,
    saveToProfile,
    loading,
    error,
    hasWelcomePDF: Boolean((profile as any)?.welcome_pdf_url)
  };
};
