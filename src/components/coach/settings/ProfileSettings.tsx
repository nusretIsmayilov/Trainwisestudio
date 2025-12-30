"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useCoachProfile, CoachProfile } from "@/hooks/useCoachProfile";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import imageCompression from "browser-image-compression";
import { ProfileCompleteness } from "./ProfileCompleteness";
import { ProfileViewMode } from "./ProfileViewMode";
import { ProfileEditMode } from "./ProfileEditMode";

/* ===========================
   🔥 SADECE GEREKLİ NORMALIZER
   =========================== */
const normalizeSocials = (socials: any): CoachProfile["socials"] => {
  if (!socials) return [];

  if (Array.isArray(socials)) return socials;

  if (typeof socials === "object") {
    return Object.entries(socials)
      .filter(([, url]) => typeof url === "string" && url.trim() !== "")
      .map(([platform, url], index) => ({
        id: `${platform}-${index}`,
        platform,
        url,
      }));
  }

  return [];
};
/* =========================== */

const SOCIAL_PLATFORMS = [
  { value: "Instagram", urlPattern: /^https?:\/\/(www\.)?instagram\.com\/.+/ },
  {
    value: "LinkedIn",
    urlPattern: /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/.+/,
  },
  {
    value: "YouTube",
    urlPattern: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
  },
  {
    value: "Twitter",
    urlPattern: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/,
  },
  { value: "TikTok", urlPattern: /^https?:\/\/(www\.)?tiktok\.com\/@.+/ },
  { value: "Facebook", urlPattern: /^https?:\/\/(www\.)?facebook\.com\/.+/ },
  { value: "Website", urlPattern: /^https?:\/\/.+/ },
] as const;

const profileSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  tagline: z.string().trim().max(150).optional(),
  bio: z.string().trim().max(2000).optional(),
  skills: z.array(z.string()).min(1).max(8),
  certifications: z.array(
    z.object({
      id: z.string(),
      name: z.string().trim().min(1).max(200),
      issuer: z.string().trim().max(200).optional(),
      year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    })
  ),
  price_min_cents: z.number().int().min(0).optional(),
  price_max_cents: z.number().int().min(0).optional(),
});

interface ProfileSettingsProps {
  onUpdate?: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onUpdate }) => {
  const { profile, loading, error, updateProfile } = useCoachProfile();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<CoachProfile>({
    full_name: "",
    tagline: "",
    bio: "",
    avatar_url: "",
    skills: [],
    certifications: [],
    socials: [],
    price_min_cents: null,
    price_max_cents: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>(
    {}
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [socialValidation, setSocialValidation] = useState<Record<string, boolean>>(
    {}
  );

  /* ===========================
     🔥 PROFILE LOAD FIX
     =========================== */
  useEffect(() => {
    if (!profile) return;

    const socials = normalizeSocials(profile.socials);

    setFormData({
      ...profile,
      socials,
    });

    const validation: Record<string, boolean> = {};
    socials.forEach((social) => {
      const platformConfig = SOCIAL_PLATFORMS.find(
        (p) => p.value === social.platform
      );
      validation[social.id] = platformConfig
        ? platformConfig.urlPattern.test(social.url)
        : true;
    });

    setSocialValidation(validation);
  }, [profile]);
  /* =========================== */

  useEffect(() => {
    const validation: Record<string, boolean> = {};
    formData.socials.forEach((social) => {
      if (!social.url.trim()) {
        validation[social.id] = true;
      } else {
        const platformConfig = SOCIAL_PLATFORMS.find(
          (p) => p.value === social.platform
        );
        validation[social.id] = platformConfig
          ? platformConfig.urlPattern.test(social.url.trim())
          : true;
      }
    });
    setSocialValidation(validation);
  }, [formData.socials]);

  /* ===========================
     ✅ DOĞRU YERDE TANIMLI
     =========================== */
  const handleSave = async (): Promise<void> => {
    const invalidSocials = formData.socials.filter(
      (s) => s.url.trim() && socialValidation[s.id] === false
    );

    if (invalidSocials.length > 0) {
      toast.error("Please fix invalid social media URLs");
      return;
    }

    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        errors[err.path.join(".")] = err.message;
      });
      setValidationErrors(errors);
      toast.error("Please fix the validation errors");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await updateProfile(formData);
      if (success) {
        toast.success("Profile updated successfully");
        setIsEditMode(false);
        onUpdate?.();
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (
  event: React.ChangeEvent<HTMLInputElement>
): Promise<void> => {
  const file = event.target.files?.[0];
  if (!file || !profile) return;

  if (!file.type.startsWith("image/")) {
    toast.error("Please select a valid image file");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error("Image size must be less than 5MB");
    return;
  }

  setIsUploadingImage(true);
  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 500,
      useWebWorker: true,
    });

    const fileExt = compressedFile.name.split(".").pop();
    const filePath = `${profile.id}/${Date.now()}.${fileExt}`;

    await supabase.storage
      .from("avatars")
      .upload(filePath, compressedFile, { upsert: true });

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    setFormData((prev) => ({ ...prev, avatar_url: publicUrl }));
    toast.success("Image uploaded successfully!");
  } catch (error) {
    console.error("Image upload error:", error);
    toast.error("Failed to upload image. Please try again.");
  } finally {
    setIsUploadingImage(false);
  }
};


  const handleCancel = (): void => {
    if (profile) {
      setFormData({
        ...profile,
        socials: normalizeSocials(profile.socials),
      });
    }
    setValidationErrors({});
    setIsEditMode(false);
  };
  /* =========================== */

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
      <ProfileCompleteness profile={isEditMode ? formData : profile} />

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
        <ProfileViewMode profile={profile} onEdit={() => setIsEditMode(true)} />
      )}
    </div>
  );
};

export default ProfileSettings;
