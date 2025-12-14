import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExerciseItem } from '@/mockdata/library/mockLibrary';
import { Lightbulb, AlertTriangle } from 'lucide-react';
import ContentUploadSection from './ContentUploadSection';

interface ExerciseFormProps {
  formData: Partial<ExerciseItem>;
  onFormChange: (field: keyof ExerciseItem, value: any) => void;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({ formData, onFormChange }) => {
  const muscleGroups = [
    'Chest',
    'Back',
    'Shoulders',
    'Biceps',
    'Triceps',
    'Forearms',
    'Abs',
    'Obliques',
    'Lower Back',
    'Glutes',
    'Quadriceps',
    'Hamstrings',
    'Calves',
    'Full Body',
    'Cardio',
    'Core',
    'Upper Body',
    'Lower Body'
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Exercise Details</h2>

      {/* Core Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Exercise Name</Label>
          <Input id="name" value={formData.name || ''} onChange={(e) => onFormChange('name', e.target.value)} placeholder="e.g., Dumbbell Bench Press" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="muscleGroup">Muscle Group Target</Label>
          <Select value={formData.muscleGroup || ''} onValueChange={(value) => onFormChange('muscleGroup', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select muscle group" />
            </SelectTrigger>
            <SelectContent>
              {muscleGroups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      
      <div className="space-y-2">
        <Label htmlFor="introduction">Introduction / Purpose</Label>
        <Textarea id="introduction" value={formData.introduction || ''} onChange={(e) => onFormChange('introduction', e.target.value)} placeholder="Brief overview of the movement, its goal, and benefits." />
      </div>

      {/* Dynamic Content Uploads */}
      <ContentUploadSection
        content={formData.howTo || []}
        onContentChange={(value) => onFormChange('howTo', value)}
        allowedTypes={['image', 'video', 'step']}
      />

      {/* Pro Tip Section */}
      <div className="space-y-2 p-4 rounded-xl border-l-4 border-yellow-500 bg-yellow-500/10">
        <Label htmlFor="proTip" className="flex items-center text-yellow-600 font-semibold">
          <Lightbulb className="w-5 h-5 mr-2" /> Pro Tip
        </Label>
        <Textarea id="proTip" value={formData.proTip || ''} onChange={(e) => onFormChange('proTip', e.target.value)} placeholder="Expert advice to maximize results, e.g., 'Focus on a slow eccentric phase.'" />
      </div>
      
      {/* What to Avoid Section */}
      <div className="space-y-2 p-4 rounded-xl border-l-4 border-red-500 bg-red-500/10">
        <Label htmlFor="avoid" className="flex items-center text-red-600 font-semibold">
          <AlertTriangle className="w-5 h-5 mr-2" /> What to Avoid
        </Label>
        <Textarea id="avoid" value={formData.whatToAvoid || ''} onChange={(e) => onFormChange('whatToAvoid', e.target.value)} placeholder="Common mistakes or injury risks, e.g., 'Do not let your knees collapse inward.'" />
      </div>
    </div>
  );
};

export default ExerciseForm;
