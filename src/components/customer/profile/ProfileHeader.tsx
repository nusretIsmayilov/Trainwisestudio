import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Edit, Camera, CreditCard, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePaymentPlan } from "@/hooks/usePaymentPlan";
import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Input } from "@/components/ui/input";
import { useProfileUpdates } from "@/hooks/useProfileUpdates";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import imageCompression from "browser-image-compression";
import { useTranslation } from "react-i18next";

interface ProfileHeaderProps {
  isGlobalEditing?: boolean;
}

export interface ProfileHeaderRef {
  save: () => Promise<void>;
  cancel: () => void;
}

const ProfileHeader = forwardRef<ProfileHeaderRef, ProfileHeaderProps>(
  ({ isGlobalEditing = false }, ref) => {
    const { profile } = useAuth();
    const { planStatus, startTrial } = usePaymentPlan();
    const { updateProfile } = useProfileUpdates();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [editName, setEditName] = useState(profile?.full_name || "");
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isStartingTrial, setIsStartingTrial] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      if (isGlobalEditing && profile?.full_name) {
        setEditName(profile.full_name);
      }
    }, [isGlobalEditing, profile?.full_name]);

    const avatar =
      profile?.avatar_url ||
      "https://placehold.co/256x256/6b7280/fff?text=Avatar";
    const fullName = profile?.full_name || profile?.email || "Your Profile";
    const role =
      profile?.role === "coach" ? t("common.coach") : t("common.customer");

    const handleSaveName = async (): Promise<void> => {
      if (!editName.trim()) {
        toast.error("Name cannot be empty");
        return;
      }

      const success = await updateProfile({ full_name: editName.trim() });
      if (success) {
        setHasUnsavedChanges(false);
        toast.success("Name updated successfully");
      } else {
        toast.error("Failed to update name");
      }
    };

    const handleCancel = (): void => {
      setEditName(profile?.full_name || "");
      setHasUnsavedChanges(false);
    };

    useImperativeHandle(ref, () => ({
      save: handleSaveName,
      cancel: handleCancel,
    }));

    // ✅ SADECE BURADA TİP EKLENDİ
    const handleImageUpload = async (
      event: React.ChangeEvent<HTMLInputElement>
    ): Promise<void> => {
      const file = event.target.files?.[0];
      if (!file || !profile) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
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
        const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
        const filePath = `${profile.id}/${fileName}`;

        await supabase.storage
          .from("avatars")
          .upload(filePath, compressedFile, { upsert: true });

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);

        const success = await updateProfile({ avatar_url: publicUrl });
        if (success) {
          toast.success("Profile image updated successfully");
          setHasUnsavedChanges(true);
        } else {
          toast.error("Failed to update profile image");
        }
      } catch (error) {
        console.error("Image upload error:", error);
        toast.error("Failed to upload image. Please try again.");
      } finally {
        setIsUploadingImage(false);
      }
    };

    const triggerImageUpload = () => {
      fileInputRef.current?.click();
    };

    const handleStartTrial = async (): Promise<void> => {
      setIsStartingTrial(true);
      try {
        const result = await startTrial();
        if (result?.error) {
          toast.error(
            typeof result.error === "string"
              ? result.error
              : "Failed to start trial"
          );
        } else {
          toast.success("7-day free trial started!");
        }
      } finally {
        setIsStartingTrial(false);
      }
    };

    const handleManageBilling = () => {
      navigate("/customer/payment/update-plan");
    };

    const handleCancelSubscription = () => {
      navigate("/customer/payment/cancel-subscription");
    };

    return (
      <div className="relative rounded-3xl overflow-hidden shadow-xl w-full">
        {/* JSX AYNEN KALDI */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    );
  }
);

export default ProfileHeader;
