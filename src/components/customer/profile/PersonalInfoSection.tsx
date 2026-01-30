import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelectButton } from "@/components/onboarding/MultiSelectButton";
import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileUpdates } from "@/hooks/useProfileUpdates";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Ruler,
  Weight,
  User,
  Flag,
  Heart,
  Activity,
  Brain,
  Mail,
  Phone,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { countries } from "@/data/countries";

interface OnboardingDetails {
  id: string;
  user_id: string;
  weight: number | null;
  height: number | null;
  gender: string | null;
  dob: string | null;
  country: string | null;
  goals: string[];
  allergies: string[];
  training_likes: string[];
  training_dislikes: string[];
  injuries: string[];
  meditation_experience: string | null;
  location: string | null;
}

// Options from onboarding flow
const goals = [
  { id: "get-fit", emoji: "💪", titleKey: "goal.getFit", category: "fitness" },
  {
    id: "build-muscle",
    emoji: "🏋️",
    titleKey: "goal.buildMuscle",
    category: "fitness",
  },
  {
    id: "get-stronger",
    emoji: "💥",
    titleKey: "goal.getStronger",
    category: "fitness",
  },
  {
    id: "burn-fat",
    emoji: "🔥",
    titleKey: "goal.burnFat",
    category: "fitness",
  },
  {
    id: "get-toned",
    emoji: "✨",
    titleKey: "goal.getToned",
    category: "fitness",
  },
  {
    id: "eat-healthier",
    emoji: "🥗",
    titleKey: "goal.eatHealthier",
    category: "nutrition",
  },
  {
    id: "weight-loss",
    emoji: "⚖️",
    titleKey: "goal.weightLoss",
    category: "nutrition",
  },
  {
    id: "improve-habits",
    emoji: "🎯",
    titleKey: "goal.improveHabits",
    category: "nutrition",
  },
  {
    id: "more-energy",
    emoji: "⚡",
    titleKey: "goal.moreEnergy",
    category: "nutrition",
  },
  {
    id: "reduce-cravings",
    emoji: "🍃",
    titleKey: "goal.reduceCravings",
    category: "nutrition",
  },
  {
    id: "reduce-stress",
    emoji: "🧘",
    titleKey: "goal.reduceStress",
    category: "mental",
  },
  {
    id: "improve-sleep",
    emoji: "😴",
    titleKey: "goal.improveSleep",
    category: "mental",
  },
  {
    id: "build-mindfulness",
    emoji: "🌸",
    titleKey: "goal.buildMindfulness",
    category: "mental",
  },
  {
    id: "emotional-balance",
    emoji: "🌈",
    titleKey: "goal.emotionalBalance",
    category: "mental",
  },
  {
    id: "boost-focus",
    emoji: "🎯",
    titleKey: "goal.boostFocus",
    category: "mental",
  },
];

const allergies = [
  { id: "dairy", label: "allergy.dairy", icon: "🥛" },
  { id: "gluten", label: "allergy.gluten", icon: "🍞" },
  { id: "nuts", label: "allergy.nuts", icon: "🥜" },
  { id: "egg", label: "allergy.egg", icon: "🥚" },
  { id: "soy", label: "allergy.soy", icon: "🌱" },
  { id: "fish", label: "allergy.fish", icon: "🐟" },
  { id: "shellfish", label: "allergy.shellfish", icon: "🦞" },
  { id: "lactose", label: "allergy.lactose", icon: "🧀" },
];

const trainingOptions = [
  { id: "strength", label: "training.strength", icon: "💪" },
  { id: "cardio", label: "training.cardio", icon: "🏃‍♂️" },
  { id: "endurance", label: "training.endurance", icon: "🚴‍♀️" },
  { id: "weights", label: "training.weights", icon: "🏋️" },
  { id: "calisthenics", label: "training.calisthenics", icon: "🤸" },
  { id: "hiit", label: "training.hiit", icon: "🔥" },
  { id: "outdoor", label: "training.outdoor", icon: "🌲" },
  { id: "running", label: "training.running", icon: "👟" },
];

const injuries = [
  { id: "lower-back", label: "training.lowerBack", icon: "🤕" },
  { id: "neck", label: "training.neck", icon: "🧣" },
  { id: "knee", label: "training.knee", icon: "🦵" },
  { id: "shoulder", label: "training.shoulder", icon: "🙋‍♂️" },
  { id: "wrist-elbow", label: "training.wristElbow", icon: "💪" },
];

const meditationOptions = [
  { value: "never", labelKey: "profile.neverTried", emoji: "🤔" },
  { value: "beginner", labelKey: "profile.justStarted", emoji: "🌱" },
  { value: "sometimes", labelKey: "profile.practiceSometimes", emoji: "🧘" },
  { value: "regular", labelKey: "profile.regularPractice", emoji: "🧠" },
  { value: "experienced", labelKey: "profile.veryExperienced", emoji: "🕉️" },
];

interface PersonalInfoSectionProps {
  isGlobalEditing?: boolean;
}

export interface PersonalInfoSectionRef {
  save: () => Promise<void>;
  cancel: () => void;
}

const PHONE_MIN_DIGITS = 7;
const PHONE_MAX_DIGITS = 15;
const MIN_WEIGHT = 20; // kg
const MAX_WEIGHT = 400;
const MIN_HEIGHT = 50; // cm
const MAX_HEIGHT = 250;
const MIN_AGE = 10;
const MAX_AGE = 120;

const PersonalInfoSection = forwardRef<
  PersonalInfoSectionRef,
  PersonalInfoSectionProps
>(({ isGlobalEditing = false }, ref) => {
  const { user, profile } = useAuth();
  const { updateOnboarding, updateProfile, loading } = useProfileUpdates();
  const { t } = useTranslation();
  const [onboardingData, setOnboardingData] =
    useState<OnboardingDetails | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState<Partial<OnboardingDetails>>({});
  const [profileFormData, setProfileFormData] = useState({
    phone: "",
    email: "",
  });
  const [newItem, setNewItem] = useState({ type: "", value: "" });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    phone?: string;
    weight?: string;
    height?: string;
    dob?: string;
  }>({});
  const [phoneError, setPhoneError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("email, phone, created_at")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        if (profileData) {
          setProfileData(profileData);
          setProfileFormData({
            phone: profileData.phone || "",
            email: profileData.email || "",
          });
        }

        // Fetch onboarding data
        const { data: onboardingData, error: onboardingError } = await supabase
          .from("onboarding_details")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (onboardingError && onboardingError.code !== "PGRST116") {
          throw onboardingError;
        }

        if (onboardingData) {
          setOnboardingData(onboardingData);
          setFormData(onboardingData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load profile data");
      }
    };

    fetchData();
  }, [user]);

  // Sync form data when switching to edit mode
  useEffect(() => {
    if (isGlobalEditing && onboardingData) {
      setFormData(onboardingData);
    }
    if (isGlobalEditing && profileData) {
      setProfileFormData({
        phone: profileData.phone || "",
        email: profileData.email || "",
      });
    }
  }, [isGlobalEditing, onboardingData, profileData]);

  const digitsOnly = (value: string) => value.replace(/\D/g, "");

  const sanitizePhoneInput = (value: string) => {
    if (!value) return "";
    const hasPlus = value.trim().startsWith("+");
    const digits = digitsOnly(value);
    const limitedDigits = digits.slice(0, PHONE_MAX_DIGITS);
    return hasPlus ? `+${limitedDigits}` : limitedDigits;
  };

  const validatePhone = (value: string) => {
    const digits = digitsOnly(value);
    if (!digits) {
      setPhoneError("");
      return true;
    }
    if (digits.length < PHONE_MIN_DIGITS) {
      setPhoneError(
        `Phone number must include at least ${PHONE_MIN_DIGITS} digits.`,
      );
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handlePhoneChange = (value: string) => {
    const sanitized = sanitizePhoneInput(value);
    setProfileFormData({ ...profileFormData, phone: sanitized });
    const digits = digitsOnly(sanitized);
    if (digits.length > PHONE_MAX_DIGITS) {
      setPhoneError(`Phone number cannot exceed ${PHONE_MAX_DIGITS} digits.`);
    } else {
      setPhoneError("");
    }
    setHasUnsavedChanges(true);
  };

  const validateProfileFields = () => {
    const errors: typeof formErrors = {};
    if (!validatePhone(profileFormData.phone)) {
      errors.phone = `Phone number must be between ${PHONE_MIN_DIGITS} and ${PHONE_MAX_DIGITS} digits when provided.`;
    }
    if (formData.weight) {
      if (formData.weight < MIN_WEIGHT || formData.weight > MAX_WEIGHT) {
        errors.weight = `Weight must be between ${MIN_WEIGHT}kg and ${MAX_WEIGHT}kg.`;
      }
    }
    if (formData.height) {
      if (formData.height < MIN_HEIGHT || formData.height > MAX_HEIGHT) {
        errors.height = `Height must be between ${MIN_HEIGHT}cm and ${MAX_HEIGHT}cm.`;
      }
    }
    if (formData.dob) {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      if (dobDate > today) {
        errors.dob = "Date of birth cannot be in the future.";
      } else {
        const age = calculateAge(formData.dob);
        if (age && (age < MIN_AGE || age > MAX_AGE)) {
          errors.dob = "Please enter a realistic date of birth.";
        }
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    try {
      if (!validateProfileFields()) {
        toast.error("Please fix the highlighted fields before saving.");
        return;
      }
      // Update profile data (phone)
      await updateProfile({ phone: profileFormData.phone });

      // Update onboarding data
      const onboardingData = await updateOnboarding(formData);

      // Update local state with the returned data
      setOnboardingData(onboardingData as OnboardingDetails);
      setProfileData({ ...profileData, phone: profileFormData.phone });
      setHasUnsavedChanges(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Profile update error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      toast.error(`Failed to update profile: ${errorMessage}`);
    }
  };

  const handleCancel = () => {
    setFormData(onboardingData || {});
    setProfileFormData({
      phone: profileData?.phone || "",
      email: profileData?.email || "",
    });
    setHasUnsavedChanges(false);
  };

  // Expose save and cancel functions to parent component
  useImperativeHandle(ref, () => ({
    save: handleSave,
    cancel: handleCancel,
  }));

  const handleMultiSelect = (field: keyof OnboardingDetails, value: string) => {
    const currentArray = (formData[field] as string[]) || [];

    // Special handling for goals - limit to 8 maximum
    if (field === "goals") {
      if (currentArray.includes(value)) {
        // Remove if already selected
        const newArray = currentArray.filter((item) => item !== value);
        setFormData({ ...formData, [field]: newArray });
      } else if (currentArray.length < 8) {
        // Add if under limit
        const newArray = [...currentArray, value];
        setFormData({ ...formData, [field]: newArray });
      } else {
        // Show warning if trying to exceed limit
        toast.warning("You can select a maximum of 8 goals");
        return;
      }
    } else {
      // Default behavior for other fields
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];
      setFormData({ ...formData, [field]: newArray });
    }

    setHasUnsavedChanges(true);
  };

  const addArrayItem = (field: keyof OnboardingDetails, value: string) => {
    if (!value.trim()) return;

    const currentArray = (formData[field] as string[]) || [];
    setFormData({
      ...formData,
      [field]: [...currentArray, value.trim()],
    });
    setNewItem({ type: "", value: "" });
  };

  const removeArrayItem = (field: keyof OnboardingDetails, index: number) => {
    const currentArray = (formData[field] as string[]) || [];
    setFormData({
      ...formData,
      [field]: currentArray.filter((_, i) => i !== index),
    });
  };

  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  if (!onboardingData && !profileData && !isGlobalEditing) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No personal information available. Complete your onboarding to see
            your details here.
          </p>
          <Button className="w-full">Add Personal Information</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contact & Personal Information */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("profile.contactPersonalInfo")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t("contact.details")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <p className="text-sm text-muted-foreground py-2">
                  {profileData?.email || "Not provided"}
                </p>
              </div>
              <div>
                <Label htmlFor="phone">{t("phone")}</Label>
                {isGlobalEditing ? (
                  <>
                    <Input
                      id="phone"
                      value={profileFormData.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      onBlur={(e) => validatePhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      maxLength={PHONE_MAX_DIGITS + 2}
                    />
                    {phoneError && (
                      <p className="text-xs text-red-600 mt-1">{phoneError}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    {profileData?.phone || "Not provided"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-4 w-4" />
              {t("personal.details")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">{t("weight.kg")}</Label>
                {isGlobalEditing ? (
                  <>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight || ""}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseFloat(e.target.value)
                          : null;
                        setFormData({ ...formData, weight: value });
                        setHasUnsavedChanges(true);
                        if (value === null) {
                          setFormErrors((prev) => ({
                            ...prev,
                            weight: undefined,
                          }));
                        } else if (value < MIN_WEIGHT || value > MAX_WEIGHT) {
                          setFormErrors((prev) => ({
                            ...prev,
                            weight: `Weight must be between ${MIN_WEIGHT}kg and ${MAX_WEIGHT}kg.`,
                          }));
                        } else {
                          setFormErrors((prev) => ({
                            ...prev,
                            weight: undefined,
                          }));
                        }
                      }}
                      placeholder="70.0"
                    />
                    {formErrors.weight && (
                      <p className="text-xs text-red-600 mt-1">
                        {formErrors.weight}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    {onboardingData?.weight
                      ? `${onboardingData.weight} kg`
                      : "Not provided"}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="height">{t("height.cm")}</Label>
                {isGlobalEditing ? (
                  <>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      value={formData.height || ""}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseFloat(e.target.value)
                          : null;
                        setFormData({ ...formData, height: value });
                        setHasUnsavedChanges(true);
                        if (value === null) {
                          setFormErrors((prev) => ({
                            ...prev,
                            height: undefined,
                          }));
                        } else if (value < MIN_HEIGHT || value > MAX_HEIGHT) {
                          setFormErrors((prev) => ({
                            ...prev,
                            height: `Height must be between ${MIN_HEIGHT}cm and ${MAX_HEIGHT}cm.`,
                          }));
                        } else {
                          setFormErrors((prev) => ({
                            ...prev,
                            height: undefined,
                          }));
                        }
                      }}
                      placeholder="175.0"
                    />
                    {formErrors.height && (
                      <p className="text-xs text-red-600 mt-1">
                        {formErrors.height}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    {onboardingData?.height
                      ? `${onboardingData.height} cm`
                      : "Not provided"}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="gender">{t("profile.gender")}</Label>
                {isGlobalEditing ? (
                  <Select
                    value={formData.gender || ""}
                    onValueChange={(value) => {
                      setFormData({ ...formData, gender: value });
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    {onboardingData?.gender || "Not provided"}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="age">{t("profile.age")}</Label>
                <p className="text-sm text-muted-foreground py-2">
                  {calculateAge(formData.dob || onboardingData?.dob || null) ||
                    "Not provided"}
                </p>
              </div>

              <div>
                <Label htmlFor="dob">{t("profile.dateOfBirth")}</Label>
                {isGlobalEditing ? (
                  <>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dob || ""}
                      onChange={(e) => {
                        setFormData({ ...formData, dob: e.target.value });
                        setHasUnsavedChanges(true);
                        if (e.target.value) {
                          const age = calculateAge(e.target.value);
                          if (age && (age < 10 || age > 120)) {
                            setFormErrors((prev) => ({
                              ...prev,
                              dob: "Please enter a realistic date of birth.",
                            }));
                          } else {
                            setFormErrors((prev) => ({
                              ...prev,
                              dob: undefined,
                            }));
                          }
                        } else {
                          setFormErrors((prev) => ({
                            ...prev,
                            dob: undefined,
                          }));
                        }
                      }}
                    />
                    {formErrors.dob && (
                      <p className="text-xs text-red-600 mt-1">
                        {formErrors.dob}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    {onboardingData?.dob
                      ? new Date(onboardingData.dob).toLocaleDateString()
                      : "Not provided"}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="country">{t("profile.country")}</Label>
                {isGlobalEditing ? (
                  <Select
                    value={formData.country || ""}
                    onValueChange={(value) => {
                      setFormData({ ...formData, country: value });
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.name}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    {onboardingData?.country || "Not provided"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              {t("profile.goals")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isGlobalEditing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Select up to 8 goals that matter most to you
                </p>
                <div className="text-sm text-muted-foreground">
                  {(formData.goals || []).length}/8 selected
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {goals.map((goal) => (
                  <MultiSelectButton
                    key={goal.id}
                    selected={(formData.goals || []).includes(goal.id)}
                    onClick={() => handleMultiSelect("goals", goal.id)}
                  >
                    <span className="mr-2">{goal.emoji}</span>
                    {t(goal.titleKey)}
                  </MultiSelectButton>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(onboardingData?.goals || []).length > 0 ? (
                (onboardingData?.goals || []).map((goalId) => {
                  const goal = goals.find((g) => g.id === goalId);
                  return goal ? (
                    <Badge
                      key={goalId}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <span>{goal.emoji}</span>
                      {t(goal.titleKey)}
                    </Badge>
                  ) : null;
                })
              ) : (
                <p className="text-sm text-muted-foreground">No goals set</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Information */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t("profile.healthInformation")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Allergies */}
          <div>
            <Label>{t("profile.allergies")}</Label>
            {isGlobalEditing ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                {allergies.map((allergy) => (
                  <MultiSelectButton
                    key={allergy.id}
                    selected={(formData.allergies || []).includes(allergy.id)}
                    onClick={() => handleMultiSelect("allergies", allergy.id)}
                  >
                    <span className="mr-2">{allergy.icon}</span>
                    {t(allergy.label)}
                  </MultiSelectButton>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                {(onboardingData?.allergies || []).length > 0 ? (
                  (onboardingData?.allergies || []).map((allergyId) => {
                    const allergy = allergies.find((a) => a.id === allergyId);
                    return allergy ? (
                      <Badge
                        key={allergyId}
                        variant="destructive"
                        className="flex items-center gap-1"
                      >
                        <span>{allergy.icon}</span>
                        {t(allergy.label)}
                      </Badge>
                    ) : null;
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t('health.noAllergies')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Injuries */}
          <div>
            <Label>{t("profile.pastInjuries")}</Label>
            {isGlobalEditing ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                {injuries.map((injury) => (
                  <MultiSelectButton
                    key={injury.id}
                    selected={(formData.injuries || []).includes(injury.id)}
                    onClick={() => handleMultiSelect("injuries", injury.id)}
                  >
                    <span className="mr-2">{injury.icon}</span>
                    {t(injury.label)}
                  </MultiSelectButton>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                {(onboardingData?.injuries || []).length > 0 ? (
                  (onboardingData?.injuries || []).map((injuryId) => {
                    const injury = injuries.find((i) => i.id === injuryId);
                    return injury ? (
                      <Badge
                        key={injuryId}
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <span>{injury.icon}</span>
                        {t(injury.label)}
                      </Badge>
                    ) : null;
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No injuries recorded
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Training Preferences */}
          <div>
            <Label>{t("profile.trainingLikes")}</Label>
            {isGlobalEditing ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                {trainingOptions.map((option) => (
                  <MultiSelectButton
                    key={option.id}
                    selected={(formData.training_likes || []).includes(
                      option.id,
                    )}
                    onClick={() =>
                      handleMultiSelect("training_likes", option.id)
                    }
                  >
                    <span className="mr-2">{option.icon}</span>
                    {t(option.label)}
                  </MultiSelectButton>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                {(onboardingData?.training_likes || []).length > 0 ? (
                  (onboardingData?.training_likes || []).map((likeId) => {
                    const like = trainingOptions.find((t) => t.id === likeId);
                    return like ? (
                      <Badge
                        key={likeId}
                        variant="default"
                        className="flex items-center gap-1"
                      >
                        <span>{like.icon}</span>
                        {t(like.label)}
                      </Badge>
                    ) : null;
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t('training.noPreferences')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Training Dislikes */}
          <div>
            <Label>{t("profile.trainingDislikes")}</Label>
            {isGlobalEditing ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                {trainingOptions.map((option) => (
                  <MultiSelectButton
                    key={option.id}
                    selected={(formData.training_dislikes || []).includes(
                      option.id,
                    )}
                    onClick={() =>
                      handleMultiSelect("training_dislikes", option.id)
                    }
                  >
                    <span className="mr-2">{option.icon}</span>
                    {t(option.label)}
                  </MultiSelectButton>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                {(onboardingData?.training_dislikes || []).length > 0 ? (
                  (onboardingData?.training_dislikes || []).map((dislikeId) => {
                    const dislike = trainingOptions.find(
                      (t) => t.id === dislikeId,
                    );
                    return dislike ? (
                      <Badge
                        key={dislikeId}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <span>{dislike.icon}</span>
                        {t(dislike.label)}
                      </Badge>
                    ) : null;
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t('training.noDislikes')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Meditation Experience */}
          <div>
            <Label htmlFor="meditation">
              {t("profile.meditationExperience")}
            </Label>
            {isGlobalEditing ? (
              <RadioGroup
                value={formData.meditation_experience || ""}
                onValueChange={(value) => {
                  setFormData({ ...formData, meditation_experience: value });
                  setHasUnsavedChanges(true);
                }}
                className="mt-2"
              >
                {meditationOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label
                      htmlFor={option.value}
                      className="flex items-center gap-2"
                    >
                      <span>{option.emoji}</span>
                      {t(option.labelKey)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <p className="text-sm text-muted-foreground py-2">
                {onboardingData?.meditation_experience
                  ? t(
                      meditationOptions.find(
                        (opt) =>
                          opt.value === onboardingData.meditation_experience,
                      )?.labelKey || t('common.notSpecified'),
                    )
                  : t('common.notSpecified')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default PersonalInfoSection;
