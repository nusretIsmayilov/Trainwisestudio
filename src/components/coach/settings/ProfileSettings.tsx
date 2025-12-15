'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useCoachProfile, CoachProfile } from '@/hooks/useCoachProfile';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import imageCompression from 'browser-image-compression';
import { ProfileCompleteness } from './ProfileCompleteness';
import { ProfileViewMode } from './ProfileViewMode';
import { ProfileEditMode } from './ProfileEditMode';

const SOCIAL_PLATFORMS = [
  { value: 'Instagram', urlPattern: /^https?:\/\/(www\.)?instagram\.com\/.+/ },
  { value: 'LinkedIn', urlPattern: /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/.+/ },
  { value: 'YouTube', urlPattern: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/ },
  { value: 'Twitter', urlPattern: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/ },
  { value: 'TikTok', urlPattern: /^https?:\/\/(www\.)?tiktok\.com\/@.+/ },
  { value: 'Facebook', urlPattern: /^https?:\/\/(www\.)?facebook\.com\/.+/ },
  { value: 'Website', urlPattern: /^https?:\/\/.+/ },
] as const;

const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  tagline: z.string().trim().max(150, 'Tagline cannot exceed 150 characters').optional(),
  bio: z.string().trim().max(2000, 'Bio cannot exceed 2000 characters').optional(),
  skills: z.array(z.string()).min(1, 'Select at least one skill').max(8, 'Maximum 8 skills allowed'),
  certifications: z.array(z.object({
    id: z.string(),
    name: z.string().trim().min(1, 'Certification name required').max(200, 'Name too long'),
    issuer: z.string().trim().max(200, 'Issuer name too long').optional(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1, 'Invalid year')
  })),
  price_min_cents: z.number().int().min(0).max(10000000).optional(),
  price_max_cents: z.number().int().min(0).max(10000000).optional(),
});

interface ProfileSettingsProps {
  onUpdate?: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onUpdate }) => {
  const { profile, loading, error, updateProfile } = useCoachProfile();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<CoachProfile>({
    full_name: '',
    tagline: '',
    bio: '',
    avatar_url: '',
    skills: [],
    certifications: [],
    socials: [],
    price_min_cents: null,
    price_max_cents: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [socialValidation, setSocialValidation] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (profile) {
      setFormData(profile);
      // Validate existing socials
      const validation: Record<string, boolean> = {};
      profile.socials.forEach(social => {
        const platformConfig = SOCIAL_PLATFORMS.find(p => p.value === social.platform);
        validation[social.id] = platformConfig ? platformConfig.urlPattern.test(social.url) : true;
      });
      setSocialValidation(validation);
    }
  }, [profile]);

  // Validate social URLs in real-time when formData changes
  useEffect(() => {
    const validation: Record<string, boolean> = {};
    formData.socials.forEach(social => {
      if (!social.url.trim()) {
        // Empty URLs are valid (optional field)
        validation[social.id] = true;
      } else {
        const platformConfig = SOCIAL_PLATFORMS.find(p => p.value === social.platform);
        validation[social.id] = platformConfig ? platformConfig.urlPattern.test(social.url.trim()) : true;
      }
    });
    setSocialValidation(validation);
  }, [formData.socials]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 500,
        useWebWorker: true
      };
      const compressedFile = await imageCompression(file, options);

      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${profile?.id}-${Date.now()}.${fileExt}`;
      const filePath = `${profile?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, compressedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData({ ...formData, avatar_url: publicUrl });
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    // Validate social URLs
    const invalidSocials = formData.socials.filter(social => {
      if (!social.url.trim()) return false; // Empty URLs are ok (optional)
      return socialValidation[social.id] === false;
    });

    if (invalidSocials.length > 0) {
      toast.error('Please fix invalid social media URLs before saving');
      return;
    }

    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path.join('.');
        errors[field] = err.message;
      });
      setValidationErrors(errors);
      toast.error('Please fix the validation errors');
      return;
    }

    setValidationErrors({});
    setIsSubmitting(true);
    try {
      const success = await updateProfile(formData);
      if (success) {
        toast.success("Profile Updated! Clients can now see your changes.");
        setIsEditMode(false);
        onUpdate?.();
      }
    } catch (err) {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset to original profile data
    if (profile) {
      setFormData(profile);
    }
    setValidationErrors({});
    setIsEditMode(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive">Error loading profile: {error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Completeness - Always visible */}
      <ProfileCompleteness profile={isEditMode ? formData : profile} />

      {/* Conditional Rendering: View or Edit Mode */}
      {isEditMode ? (
        <ProfileEditMode
          profile={profile}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSave}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          validationErrors={validationErrors}
          setValidationErrors={setValidationErrors}
          isUploadingImage={isUploadingImage}
          handleImageUpload={handleImageUpload}
          socialValidation={socialValidation}
        />
      ) : (
        <ProfileViewMode
          profile={profile}
          onEdit={() => setIsEditMode(true)}
        />
      )}
    </div>
  );
};

export default ProfileSettings;
