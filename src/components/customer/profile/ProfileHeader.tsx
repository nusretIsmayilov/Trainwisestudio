import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Edit, Camera, CreditCard, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePaymentPlan } from '@/hooks/usePaymentPlan';
import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { useProfileUpdates } from '@/hooks/useProfileUpdates';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import imageCompression from 'browser-image-compression';
import { useTranslation } from 'react-i18next';

interface ProfileHeaderProps {
  isGlobalEditing?: boolean;
}

export interface ProfileHeaderRef {
  save: () => Promise<void>;
  cancel: () => void;
}

const ProfileHeader = forwardRef<ProfileHeaderRef, ProfileHeaderProps>(({ isGlobalEditing = false }, ref) => {
  const { profile } = useAuth();
  const { planStatus, startTrial } = usePaymentPlan();
  const { updateProfile, loading } = useProfileUpdates();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [editName, setEditName] = useState(profile?.full_name || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync edit name when switching to edit mode or when profile changes
  React.useEffect(() => {
    if (isGlobalEditing && profile?.full_name) {
      setEditName(profile.full_name);
    }
  }, [isGlobalEditing, profile?.full_name]);
  
  const avatar = profile?.avatar_url || 'https://placehold.co/256x256/6b7280/fff?text=Avatar';
  const fullName = profile?.full_name || profile?.email || 'Your Profile';
  const role = profile?.role === 'coach' ? t('common.coach') : t('common.customer');

  const handleSaveName = async () => {
    if (!editName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    
    try {
      const success = await updateProfile({ full_name: editName.trim() });
      if (success) {
        setHasUnsavedChanges(false);
        toast.success('Name updated successfully');
      } else {
        toast.error('Failed to update name');
      }
    } catch (error) {
      console.error('Name update error:', error);
      toast.error('Failed to update name');
    }
  };

  const handleCancel = () => {
    setEditName(profile?.full_name || '');
    setHasUnsavedChanges(false);
  };

  // Expose save and cancel functions to parent component
  useImperativeHandle(ref, () => ({
    save: handleSaveName,
    cancel: handleCancel
  }));

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    try {
      // Compress the image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 500,
        useWebWorker: true
      };
      const compressedFile = await imageCompression(file, options);

      // Create file path with user ID as first folder (required by RLS policy)
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${profile?.id}-${Date.now()}.${fileExt}`;
      const filePath = `${profile?.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, compressedFile, { upsert: true });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const success = await updateProfile({ avatar_url: publicUrl });
      if (success) {
        toast.success('Profile image updated successfully');
        setHasUnsavedChanges(true);
      } else {
        toast.error('Failed to update profile image');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleStartTrial = async () => {
    setIsStartingTrial(true);
    try {
      const result = await startTrial();
      if (result?.error) {
        const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to start trial';
        toast.error(errorMessage);
      } else {
        toast.success('7-day free trial started! Enjoy your premium features.');
      }
    } catch (error) {
      console.error('Trial start error:', error);
      toast.error('Failed to start trial');
    } finally {
      setIsStartingTrial(false);
    }
  };

  const handleManageBilling = () => {
    navigate('/customer/payment/update-plan');
  };

  const handleCancelSubscription = () => {
    navigate('/customer/payment/cancel-subscription');
  };
  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl w-full">
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-r from-purple-500 to-pink-500 z-0" />
      <div className="relative p-6 sm:p-8 z-10 flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-900 mb-4 shadow-lg group">
          <img src={avatar} alt={fullName} className="w-full h-full object-cover" />
          {isGlobalEditing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={triggerImageUpload}>
              <Camera className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        {isGlobalEditing && (
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={triggerImageUpload}
              disabled={isUploadingImage}
              className="flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              {isUploadingImage ? 'Uploading...' : 'Change Photo'}
            </Button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        {isGlobalEditing ? (
          <div className="flex items-center gap-2 mb-4">
            <Input
              value={editName}
              onChange={(e) => {
                setEditName(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="text-2xl font-bold text-center bg-background/90 border-2 border-primary/50 text-foreground"
              placeholder="Enter your name"
            />
          </div>
        ) : (
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 mb-1">
            {fullName}
            <CheckCircle className="w-5 h-5 text-primary-500" />
          </h2>
        )}
        <p className="text-sm text-muted-foreground mb-4">
          {role} • {planStatus.hasActivePlan ? t('profile.premiumMember') : t('profile.freeMember')}
        </p>
        <div className="flex gap-2 flex-wrap justify-center">
          {!planStatus.hasActivePlan ? (
            // No active plan - show trial or subscribe options
            <>
              {!planStatus.hasUsedTrial && (
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleStartTrial}
                  disabled={isStartingTrial}
                >
                  {isStartingTrial ? t('profile.starting') : t('profile.startTrial')}
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleManageBilling}
                className="flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Subscribe
              </Button>
            </>
          ) : (
            // Has active plan - show manage billing and cancel options
            <>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleManageBilling}
                className="flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                {t('profile.manageBilling')}
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={handleCancelSubscription}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                {t('common.cancel')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default ProfileHeader;
