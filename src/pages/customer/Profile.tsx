import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import ProfileHeader, { ProfileHeaderRef } from '@/components/customer/profile/ProfileHeader';
import PersonalInfoSection, { PersonalInfoSectionRef } from '@/components/customer/profile/PersonalInfoSection';
import PaymentAndLegal from '@/components/customer/profile/PaymentAndLegal';
import PaymentHistoryTable from '@/components/customer/profile/PaymentHistoryTable';
import ProfileFAB from '@/components/customer/profile/ProfileFAB';
import { useProfileUpdates } from '@/hooks/useProfileUpdates';
import { useAuth } from '@/contexts/AuthContext';
import { useRefresh } from '@/contexts/RefreshContext';
import { useTranslation } from 'react-i18next';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { updateProfile, updateOnboarding, loading } = useProfileUpdates();
  const { t } = useTranslation();
  const { refreshProfile } = useAuth();
  const { refreshProfile: smartRefreshProfile } = useRefresh();
  
  // Refs to child components
  const profileHeaderRef = useRef<ProfileHeaderRef>(null);
  const personalInfoRef = useRef<PersonalInfoSectionRef>(null);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      console.log('Starting global save...');
      
      // Call save functions from child components
      const savePromises = [];
      
      if (profileHeaderRef.current) {
        console.log('Saving profile header...');
        savePromises.push(profileHeaderRef.current.save());
      }
      
      if (personalInfoRef.current) {
        console.log('Saving personal info...');
        savePromises.push(personalInfoRef.current.save());
      }
      
      // Wait for all saves to complete
      await Promise.all(savePromises);
      
      console.log('All saves completed successfully');
      toast.success('Profile updated successfully');
      setIsEditing(false);
      
      // Use smart refresh to update profile data
      await smartRefreshProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelAll = () => {
    // Call cancel functions from child components
    if (profileHeaderRef.current) {
      profileHeaderRef.current.cancel();
    }
    
    if (personalInfoRef.current) {
      personalInfoRef.current.cancel();
    }
    
    // Reset any unsaved changes
    setIsEditing(false);
    toast.info('Changes cancelled');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="px-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('profile.title')}</h1>
            <p className="mt-1 text-lg text-muted-foreground">{t('profile.description')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProfileHeader ref={profileHeaderRef} isGlobalEditing={isEditing} />
          <PersonalInfoSection ref={personalInfoRef} isGlobalEditing={isEditing} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <PaymentAndLegal />
          <PaymentHistoryTable />
        </div>
      </div>

      {/* Floating Action Button */}
      <ProfileFAB
        isEditing={isEditing}
        isSaving={isSaving}
        onEdit={() => setIsEditing(true)}
        onSave={handleSaveAll}
        onCancel={() => {
          handleCancelAll();
          setIsEditing(false);
        }}
      />
    </div>
  );
};

export default ProfilePage;
