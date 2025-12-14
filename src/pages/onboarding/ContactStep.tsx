// src/pages/onboarding/ContactStep.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';
import { AvatarUploadCompressed } from '@/components/onboarding/AvatarUploadCompressed';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

const validatePhone = (phone: string) => {
    if (!phone) return ''; // Optional field
    return /^[0-9+\-()\s]*$/.test(phone) ? '' : 'Invalid characters in phone number.';
};

const ContactStep = () => {
  const { state, updateState, completeOnboarding, loading } = useOnboarding();
  const navigate = useNavigate();
  const { contactInfo } = state;
  const [showPass, setShowPass] = useState(false);
  const [confirmPass, setConfirmPass] = useState('');
  const [errors, setErrors] = useState<{ phone?: string }>({});

  const handleInputChange = (field: string, value: string) => {
    if (field === 'phone') {
        const error = validatePhone(value);
        setErrors(prev => ({ ...prev, phone: error }));
    }
    updateState('contactInfo', { ...contactInfo, [field]: value });
  };

  const handlePhotoChange = (file: File | null) => {
    updateState('contactInfo', {
      ...contactInfo,
      avatarFile: file,
      avatarPreview: file ? URL.createObjectURL(file) : null
    });
  };

  const handleNext = async () => {
    try {
      await completeOnboarding();
      navigate('/onboarding/success');
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  };

  // Password is required - validate it
  const passwordError = !contactInfo.password
    ? 'Password is required'
    : contactInfo.password.length < 6 
    ? 'Password must be at least 6 characters' 
    : '';
  
  const confirmPasswordError = !confirmPass && contactInfo.password
    ? 'Please confirm your password'
    : confirmPass && contactInfo.password && contactInfo.password !== confirmPass 
    ? 'Passwords do not match' 
    : '';
  
  const isPasswordValid = contactInfo.password && contactInfo.password.length >= 6 && contactInfo.password === confirmPass;
  const isFormValid = isPasswordValid && !errors.phone;

  return (
    <OnboardingContainer
      title="Secure Your Account"
      subtitle="Add a photo and set a strong password to secure your account."
      currentStep={4} totalSteps={5}
      onBack={() => navigate('/onboarding/step-3')}
      onNext={handleNext}
      nextDisabled={!isFormValid || loading}
      isLoading={loading}
      nextLabel="Finish Setup"
      forceLightMode={true}
    >
      <div className="max-w-md mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
          <CardContent className="p-6 sm:p-8 space-y-8">
            <div className="flex flex-col items-center text-center space-y-2">
              <Label className="text-lg font-bold text-gray-800">Profile Photo (Optional)</Label>
              <AvatarUploadCompressed 
                preview={contactInfo.avatarPreview} 
                onChange={handlePhotoChange}
              />
            </div>
            
            <FormField label="Phone (Optional)" htmlFor="phone" error={errors.phone || ''}>
              <Input id="phone" type="tel" placeholder="+1 555 123 4567" value={contactInfo.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
            </FormField>

            <FormField label={<span>New Password <span className="text-red-500">*</span> (min. 6 characters)</span>} htmlFor="password" error={passwordError}>
              <div className="relative">
                <Input id="password" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={contactInfo.password || ''} onChange={(e) => handleInputChange('password', e.target.value)} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-800">
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </FormField>

            <FormField label={<span>Confirm Password <span className="text-red-500">*</span></span>} htmlFor="confirm-password" error={confirmPasswordError}>
              <Input id="confirm-password" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
            </FormField>
          </CardContent>
        </Card>
      </div>
    </OnboardingContainer>
  );
};

const FormField = ({ label, htmlFor, children, error }) => (
  <div className="space-y-2">
    <Label htmlFor={htmlFor} className="font-semibold text-gray-700">{label}</Label>
    {children}
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

export default ContactStep;