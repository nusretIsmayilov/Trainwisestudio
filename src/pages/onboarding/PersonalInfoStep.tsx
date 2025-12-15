// src/pages/onboarding/PersonalInfoStep.tsx

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { countries } from '@/data/countries';

const validateField = (name: string, value: any, allValues: any = {}) => {
  switch (name) {
    case 'name':
      return /^[a-zA-Z\s-]*$/.test(value) ? '' : 'Only letters and spaces are allowed.';
    case 'country':
      return value ? '' : 'Please select a country.';
    case 'weight_kg':
      return value >= 30 && value <= 300 ? '' : 'Enter a valid weight (30-300 kg).';
    case 'weight_lbs':
      return value >= 66 && value <= 661 ? '' : 'Enter a valid weight (66-661 lbs).';
    case 'height_cm':
      return value >= 100 && value <= 250 ? '' : 'Enter a valid height (100-250 cm).';
    case 'height_ft':
        return value >= 3 && value <= 8 ? '' : 'Invalid feet value.';
    case 'height_in':
        return value >= 0 && value < 12 ? '' : 'Invalid inches value.';
    case 'dob':
        const { year, month, day } = allValues;
        if (!year || !month || !day) return 'Please select a full date.';
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const today = new Date();
        today.setHours(0,0,0,0);
        if (date >= today) return 'Date must be in the past.';
        if (date.getFullYear() !== parseInt(year) || date.getMonth() !== parseInt(month) - 1 || date.getDate() !== parseInt(day)) {
            return 'Please select a valid date.';
        }
        return '';
    default:
      return '';
  }
};

const PersonalInfoStep = () => {
  const { state, updateState, loading } = useOnboarding();
  const navigate = useNavigate();
  const { personalInfo } = state;

  const [units, setUnits] = useState('metric');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setErrors(prev => {
      const newErrors = { ...prev };
      if (units === 'metric') {
        delete newErrors.weight_lbs;
        delete newErrors.height_ft;
        delete newErrors.height_in;
      } else {
        delete newErrors.weight_kg;
        delete newErrors.height_cm;
      }
      return newErrors;
    });
  }, [units]);

  const handleInputChange = (field: string, value: any) => {
    let newPersonalInfo = { ...personalInfo };
    let newErrors = { ...errors };

    if (field === 'name' || field === 'country' || field === 'gender') {
        newPersonalInfo[field] = value;
        newErrors[field] = validateField(field, value);
    } else if (field === 'dob') {
        const { part, val } = value;
        const dobParts = { year: personalInfo.year || '', month: personalInfo.month || '', day: personalInfo.day || '', [part]: val };
        newErrors.dob = validateField('dob', null, dobParts);
        const { year, month, day } = dobParts;
        const dobString = (year && month && day) ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
        newPersonalInfo = { ...newPersonalInfo, ...dobParts, dob: dobString };
    } else {
        // Store the string value for display
        newPersonalInfo[field] = value;
        
        // Only validate if there's a value
        if (value && value.trim() !== '') {
            const numValue = Number(value);
            if (!isNaN(numValue) && numValue > 0) {
                newErrors[field] = validateField(field, numValue);
                
                // Convert to base units for storage
                if (units === 'metric') {
                    if (field === 'weight_kg') {
                        newPersonalInfo.weight = numValue;
                    } else if (field === 'height_cm') {
                        newPersonalInfo.height = numValue;
                    }
                } else {
                    if (field === 'weight_lbs') {
                        newPersonalInfo.weight = Math.round(numValue * 0.453592);
                    } else if (field === 'height_ft' || field === 'height_in') {
                        const feet = field === 'height_ft' ? numValue : Number(personalInfo.height_ft || 0);
                        const inches = field === 'height_in' ? numValue : Number(personalInfo.height_in || 0);
                        newPersonalInfo.height = Math.round((feet * 30.48) + (inches * 2.54));
                    }
                }
            } else {
                newErrors[field] = 'Please enter a valid number';
            }
        } else {
            // Clear errors for empty fields
            newErrors[field] = '';
        }
    }
    
    setErrors(newErrors);
    updateState('personalInfo', newPersonalInfo);
  };

  const isFormValid = useMemo(() => {
    const hasNoErrors = Object.values(errors).every(e => e === '');
    const fieldsFilled = personalInfo.name && personalInfo.weight > 0 && personalInfo.height > 0 &&
                         personalInfo.gender && personalInfo.dob && personalInfo.country;
    
    // Additional validation for date of birth
    const dobValid = personalInfo.dob && personalInfo.year && personalInfo.month && personalInfo.day;
    
    return hasNoErrors && fieldsFilled && dobValid;
  }, [personalInfo, errors]);

  return (
    <OnboardingContainer
      title="About You"
      subtitle="This baseline information helps us tailor your experience."
      currentStep={2} totalSteps={5}
      onBack={() => navigate('/onboarding/step-1')}
      onNext={() => navigate('/onboarding/step-3')}
      nextDisabled={!isFormValid || loading} isLoading={loading}
      forceLightMode={true}
    >
      <div className="max-w-md mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <FormField label="Full Name" htmlFor="name" error={errors.name || ''}>
              <Input id="name" type="text" placeholder="e.g., Alex Doe" value={personalInfo.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} />
            </FormField>
            
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <Label className="font-semibold text-gray-700">Measurements</Label>
                <ToggleGroup type="single" value={units} onValueChange={setUnits} size="sm" className="border rounded-full p-0.5 bg-gray-200">
                  <ToggleGroupItem value="metric" className="rounded-full data-[state=on]:bg-emerald-500 data-[state=on]:text-white px-3">Metric</ToggleGroupItem>
                  <ToggleGroupItem value="imperial" className="rounded-full data-[state=on]:bg-emerald-500 data-[state=on]:text-white px-3">Imperial</ToggleGroupItem>
                </ToggleGroup>
              </div>
              {units === 'metric' ? (
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Height (cm)" htmlFor="height_cm" error={errors.height_cm || ''}>
                    <Input id="height_cm" type="number" placeholder="175" value={personalInfo.height_cm || ''} onChange={(e) => handleInputChange('height_cm', e.target.value)} />
                  </FormField>
                  <FormField label="Weight (kg)" htmlFor="weight_kg" error={errors.weight_kg || ''}>
                    <Input id="weight_kg" type="number" placeholder="70" value={personalInfo.weight_kg || ''} onChange={(e) => handleInputChange('weight_kg', e.target.value)} />
                  </FormField>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                   <FormField label="Height (ft & in)" htmlFor="height_ft" error={errors.height_ft || errors.height_in || ''}>
                      <div className="flex gap-2">
                          <Input id="height_ft" type="number" placeholder="ft" value={personalInfo.height_ft || ''} onChange={(e) => handleInputChange('height_ft', e.target.value)} />
                          <Input id="height_in" type="number" placeholder="in" value={personalInfo.height_in || ''} onChange={(e) => handleInputChange('height_in', e.target.value)} />
                      </div>
                   </FormField>
                  <FormField label="Weight (lbs)" htmlFor="weight_lbs" error={errors.weight_lbs || ''}>
                    <Input id="weight_lbs" type="number" placeholder="154" value={personalInfo.weight_lbs || ''} onChange={(e) => handleInputChange('weight_lbs', e.target.value)} />
                  </FormField>
                </div>
              )}
            </div>
            
            <FormField label="Date of Birth" htmlFor="dob" error={errors.dob || ''}>
              <DateSelector
                value={{ day: personalInfo.day || '', month: personalInfo.month || '', year: personalInfo.year || '' }}
                onChange={(part, val) => handleInputChange('dob', { part, val })}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Gender" htmlFor="gender" error="">
                 <Select value={personalInfo.gender || ''} onValueChange={(value) => handleInputChange('gender', value)}>
                   <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="male">Male</SelectItem>
                     <SelectItem value="female">Female</SelectItem>
                     <SelectItem value="non-binary">Non-binary</SelectItem>
                     <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                   </SelectContent>
                 </Select>
              </FormField>
              <FormField label="Country" htmlFor="country" error={errors.country || ''}>
                <Select value={personalInfo.country || ''} onValueChange={(value) => handleInputChange('country', value)}>
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
              </FormField>
            </div>
          </CardContent>
        </Card>
      </div>
    </OnboardingContainer>
  );
};

const FormField = ({ label, htmlFor, children, error }) => (
  <div className="space-y-1">
    <Label htmlFor={htmlFor} className="font-semibold text-gray-700">{label}</Label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const DateSelector = ({ value, onChange }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - 16 - i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

  return (
    <div className="grid grid-cols-3 gap-2">
      <Select value={value.day} onValueChange={(val) => onChange('day', val)}>
        <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
        <SelectContent>{days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={value.month} onValueChange={(val) => onChange('month', val)}>
        <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
        <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={value.year} onValueChange={(val) => onChange('year', val)}>
        <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
        <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
};

export default PersonalInfoStep;