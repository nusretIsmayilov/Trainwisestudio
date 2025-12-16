'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { User, Tag, Award, Plus, Trash2, Save, Loader2, Brain, AlertCircle, Camera, Instagram, Linkedin, Youtube, Twitter, Video, Facebook, Globe, Check, X, Lightbulb } from 'lucide-react';
import { CoachProfile, Certification, SocialLink } from '@/hooks/useCoachProfile';
import { SkillsSelector } from '@/components/onboarding/SkillsSelector';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProfileEditModeProps {
  profile: CoachProfile;
  formData: CoachProfile;
  setFormData: React.Dispatch<React.SetStateAction<CoachProfile>>;
  onSave: () => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  validationErrors: Record<string, string>;
  setValidationErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isUploadingImage: boolean;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  socialValidation: Record<string, boolean>;
}

const SOCIAL_PLATFORMS = [
  { value: 'Instagram', icon: Instagram, urlPattern: /^https?:\/\/(www\.)?instagram\.com\/.+/, placeholder: 'https://instagram.com/yourprofile' },
  { value: 'LinkedIn', icon: Linkedin, urlPattern: /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/.+/, placeholder: 'https://linkedin.com/in/yourprofile' },
  { value: 'YouTube', icon: Youtube, urlPattern: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/, placeholder: 'https://youtube.com/@yourchannel' },
  { value: 'Twitter', icon: Twitter, urlPattern: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/, placeholder: 'https://twitter.com/yourhandle' },
  { value: 'TikTok', icon: Video, urlPattern: /^https?:\/\/(www\.)?tiktok\.com\/@.+/, placeholder: 'https://tiktok.com/@yourhandle' },
  { value: 'Facebook', icon: Facebook, urlPattern: /^https?:\/\/(www\.)?facebook\.com\/.+/, placeholder: 'https://facebook.com/yourpage' },
  { value: 'Website', icon: Globe, urlPattern: /^https?:\/\/.+/, placeholder: 'https://yourwebsite.com' },
] as const;

export const ProfileEditMode: React.FC<ProfileEditModeProps> = ({
  profile,
  formData,
  setFormData,
  onSave,
  onCancel,
  isSubmitting,
  validationErrors,
  setValidationErrors,
  isUploadingImage,
  handleImageUpload,
  socialValidation,
}) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const hasUnsavedChanges = JSON.stringify(profile) !== JSON.stringify(formData);

  const handleCancelClick = () => {
    if (hasUnsavedChanges) {
      setShowCancelDialog(true);
    } else {
      onCancel();
    }
  };

  const handleCertChange = (id: string, field: keyof Certification, value: any) => {
    const newCerts = formData.certifications.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    );
    setFormData({ ...formData, certifications: newCerts });
  };
  

  
  const addCert = () => {
    setFormData({ 
      ...formData, 
      certifications: [...formData.certifications, { id: `new-${Date.now()}`, name: '', issuer: '', year: new Date().getFullYear() }] 
    });
  };
  
  const removeCert = (id: string) => {
    setFormData({ ...formData, certifications: formData.certifications.filter(c => c.id !== id) });
  };

  const handleSocialChange = (id: string, field: keyof SocialLink, value: any) => {
    const newSocials = formData.socials.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    );
    setFormData({ ...formData, socials: newSocials });
  };

  const addSocial = () => {
    setFormData({ 
      ...formData, 
      socials: [...formData.socials, { id: `new-${Date.now()}`, platform: 'Instagram', url: '' }] 
    });
  };

  const removeSocial = (id: string) => {
    setFormData({ ...formData, socials: formData.socials.filter(s => s.id !== id) });
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Guidance Banner */}
      <Alert className="border-primary/50 bg-primary/5">
        <Lightbulb className="h-5 w-5 text-primary" />
        <AlertDescription className="text-base">
          <strong>This is your professional storefront.</strong> Showcase your expertise and unique value to stand out and attract the right clients!
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end sticky top-4 z-10 bg-background/95 backdrop-blur-sm p-4 rounded-lg border shadow-md">
        <Button onClick={handleCancelClick} variant="outline" size="lg" disabled={isSubmitting} className="order-2 sm:order-1">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={onSave} size="lg" disabled={isSubmitting} className="gap-2 order-1 sm:order-2">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Basic Info & Profile Image */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5" /> Public Identity
          </CardTitle>
          <CardDescription>This information is visible to potential clients.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img 
                src={formData.avatar_url || 'https://placehold.co/100x100/A0E7E5/030712?text=CP'} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
              />
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={triggerImageUpload}
                disabled={isUploadingImage}
              >
                <Camera className="h-4 w-4" /> 
                {isUploadingImage ? 'Uploading...' : 'Change Photo'}
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG up to 5MB
              </p>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input 
              id="name" 
              value={formData.full_name} 
              onChange={e => {
                setFormData({ ...formData, full_name: e.target.value });
                setValidationErrors({ ...validationErrors, full_name: '' });
              }}
              maxLength={100}
              className={validationErrors.full_name ? 'border-destructive' : ''}
              placeholder="Your full name"
            />
            <div className="flex justify-between items-center mt-1">
              {validationErrors.full_name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.full_name}
                </p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {formData.full_name.length}/100
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="tagline">Tagline</Label>
            <Input 
              id="tagline" 
              value={formData.tagline} 
              onChange={e => {
                setFormData({ ...formData, tagline: e.target.value });
                setValidationErrors({ ...validationErrors, tagline: '' });
              }}
              placeholder="e.g., Elite Fitness Coach & Nutritionist" 
              maxLength={150}
              className={validationErrors.tagline ? 'border-destructive' : ''}
            />
            <div className="flex justify-between items-center mt-1">
              {validationErrors.tagline && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.tagline}
                </p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {formData.tagline.length}/150
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Professional Bio *</Label>
            <Textarea 
              id="bio" 
              value={formData.bio} 
              onChange={e => {
                setFormData({ ...formData, bio: e.target.value });
                setValidationErrors({ ...validationErrors, bio: '' });
              }}
              rows={6} 
              placeholder="Tell potential clients about your coaching philosophy, experience, and what makes you unique..." 
              maxLength={2000}
              className={validationErrors.bio ? 'border-destructive' : ''}
            />
            <div className="flex justify-between items-center mt-1">
              {validationErrors.bio && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.bio}
                </p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {formData.bio.length}/2000 {formData.bio.length < 100 && '(min 100 recommended)'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Tag className="h-5 w-5" /> Price Range (USD)
          </CardTitle>
          <CardDescription>Let customers know your typical coaching package prices.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>Minimum (per package)</Label>
            <Input 
              type="number" 
              value={(formData.price_min_cents ?? 0) / 100}
              onChange={e => setFormData({ ...formData, price_min_cents: Math.round((Number(e.target.value) || 0) * 100) })}
              placeholder="99.00" 
            />
          </div>
          <div>
            <Label>Maximum (per package)</Label>
            <Input 
              type="number" 
              value={(formData.price_max_cents ?? 0) / 100}
              onChange={e => setFormData({ ...formData, price_max_cents: Math.round((Number(e.target.value) || 0) * 100) })}
              placeholder="499.00" 
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Skills */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-5 w-5" /> Skills & Specialties *
          </CardTitle>
          <CardDescription>Select at least 3 areas of expertise to help clients find you.</CardDescription>
        </CardHeader>
        <CardContent>
          <SkillsSelector 
            selectedSkills={formData.skills}
            onSkillsChange={(skills) => {
              setFormData({ ...formData, skills });
              setValidationErrors({ ...validationErrors, skills: '' });
            }}
          />
          {validationErrors.skills && (
            <p className="text-sm text-destructive mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {validationErrors.skills}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Award className="h-5 w-5" /> Certifications & Credentials
          </CardTitle>
          <CardDescription>Build trust by showcasing your professional certifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.certifications.map(cert => (
            <div key={cert.id} className="p-3 border rounded-lg flex items-end gap-3 bg-muted/20">
              <div className="flex-1 space-y-2">
                <Label className="text-xs text-muted-foreground">Certification Name</Label>
                <Input 
                  value={cert.name} 
                  onChange={e => handleCertChange(cert.id, 'name', e.target.value)} 
                  placeholder="e.g., NASM Certified Personal Trainer"
                />
              </div>
              <div className="w-24 space-y-2">
                <Label className="text-xs text-muted-foreground">Year</Label>
                <Input 
                  type="number" 
                  value={cert.year} 
                  onChange={e => handleCertChange(cert.id, 'year', parseInt(e.target.value) || new Date().getFullYear())} 
                />
              </div>
              <Button variant="destructive" size="icon" onClick={() => removeCert(cert.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="secondary" onClick={addCert} className="w-full gap-2 mt-4 border-dashed border-2">
            <Plus className="h-4 w-4" /> Add Certification
          </Button>
        </CardContent>
      </Card>
      
      {/* Socials */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Globe className="h-5 w-5" /> Social Media & Online Presence
          </CardTitle>
          <CardDescription>Help clients connect with you and see your content across platforms.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.socials.map(social => {
            const platformConfig = SOCIAL_PLATFORMS.find(p => p.value === social.platform);
            const IconComponent = platformConfig?.icon || Globe;
            const isValidUrl = socialValidation[social.id] !== false;
            const hasUrl = social.url.trim().length > 0;
            
            return (
              <div key={social.id} className="p-3 border rounded-lg flex items-start gap-3 bg-muted/20">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Platform</Label>
                      <Select 
                        value={social.platform} 
                        onValueChange={(value: any) => handleSocialChange(social.id, 'platform', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SOCIAL_PLATFORMS.map(platform => (
                            <SelectItem key={platform.value} value={platform.value}>
                              <div className="flex items-center gap-2">
                                <platform.icon className="h-4 w-4" />
                                {platform.value}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <Label className="text-xs text-muted-foreground flex items-center gap-2">
                        URL
                        {hasUrl && (isValidUrl ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-destructive" />
                        ))}
                      </Label>
                      <div className="relative">
                        <IconComponent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          value={social.url} 
                          onChange={e => handleSocialChange(social.id, 'url', e.target.value)}
                          placeholder={platformConfig?.placeholder}
                          className={cn(
                            "pl-10",
                            hasUrl && !isValidUrl && "border-destructive"
                          )}
                        />
                      </div>
                      {hasUrl && !isValidUrl && (
                        <p className="text-xs text-destructive">Invalid URL format for {social.platform}</p>
                      )}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeSocial(social.id)}
                  className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
          <Button variant="secondary" onClick={addSocial} className="w-full gap-2 mt-4 border-dashed border-2">
            <Plus className="h-4 w-4" /> Add Social Link
          </Button>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them and exit edit mode?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction onClick={onCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
