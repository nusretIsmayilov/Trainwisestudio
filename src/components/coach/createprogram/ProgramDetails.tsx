'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { MultiSelect } from '@/components/ui/multi-select';
import { Switch } from '@/components/ui/switch';
import { MUSCLE_GROUPS, EQUIPMENT_OPTIONS } from '@/constants/fitness';
import { cn } from '@/lib/utils';
import { ProgramCategory } from '@/mockdata/createprogram/mockExercises';
import { useCoachLibrary } from '@/hooks/useCoachLibrary';
import { useRealTimeClientStatus } from '@/hooks/useRealTimeClientStatus';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Form data structure
interface ProgramDetailsForm {
  category: ProgramCategory;
  title: string;
  description: string;
  muscleGroups?: string[];
  equipment?: string[];
  benefits?: string;
  allergies?: string;
  assignedTo?: string | null;
  scheduledDate?: string | null;
  markActive?: boolean;
}

interface ProgramDetailsProps {
  onNext: (data: ProgramDetailsForm) => void;
  initialData?: Partial<ProgramDetailsForm>;
  isEditing?: boolean;
}

// Categories with emojis
const categoryOptions = [
  { value: 'fitness', label: 'Fitness', emoji: '💪', description: 'Workouts, strength, and cardio plans.' },
  { value: 'nutrition', label: 'Nutrition', emoji: '🥗', description: 'Meal plans and dietary guidance.' },
  { value: 'mental health', label: 'Mental Health', emoji: '🧘‍♂️', description: 'Mindfulness and stress management.' },
];

const ProgramDetails: React.FC<ProgramDetailsProps> = ({ onNext, initialData, isEditing = false }) => {
  const { register, handleSubmit, setValue, watch, reset, control, formState: { errors } } = useForm<ProgramDetailsForm>({
    defaultValues: {
      ...initialData,
      muscleGroups: initialData?.muscleGroups || [],
      equipment: initialData?.equipment || [],
      assignedTo: (initialData as any)?.assignedTo ?? null,
      scheduledDate: (initialData as any)?.scheduledDate ?? null,
      markActive: (initialData as any)?.markActive ?? false,
    },
  });

  // When editing, initialData arrives asynchronously. Only reset once when it first becomes available
  const didInitialResetRef = useRef(false);
  useEffect(() => {
    if (didInitialResetRef.current) return;
    if (initialData && Object.keys(initialData).length > 0) {
      reset({
        category: initialData.category as any,
        title: (initialData as any).title,
        description: (initialData as any).description,
        muscleGroups: initialData.muscleGroups || [],
        equipment: initialData.equipment || [],
        benefits: (initialData as any).benefits,
        allergies: (initialData as any).allergies,
        assignedTo: (initialData as any).assignedTo ?? null,
        scheduledDate: (initialData as any).scheduledDate ?? null,
        markActive: (initialData as any)?.markActive ?? false,
      });
      didInitialResetRef.current = true;
    }
  }, [initialData, reset]);

  const selectedCategory = watch('category');
  const muscleGroups = watch('muscleGroups') || [];
  const equipment = watch('equipment') || [];
  const { items: libraryItems, loading: libraryLoading } = useCoachLibrary();
  const { clients, loading: clientsLoading } = useRealTimeClientStatus();
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<string[]>([]);

  // Filter clients with "Missing Program" status
  const missingProgramClients = clients.filter(client => client.status === 'missing_program');

  const filteredLibrary = useMemo(() => {
    if (!selectedCategory) return libraryItems;
    return libraryItems.filter(i =>
      (selectedCategory === 'fitness' && i.category === 'exercise') ||
      (selectedCategory === 'nutrition' && i.category === 'recipe') ||
      (selectedCategory === 'mental health' && i.category === 'mental health')
    );
  }, [libraryItems, selectedCategory]);

  const toggleLibrarySelect = (id: string) => {
    setSelectedLibraryIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const submitWithLibrary = (data: ProgramDetailsForm) => {
    const attached = filteredLibrary.filter(i => selectedLibraryIds.includes(i.id));
    const merged: any = { ...data };
    if (attached.length > 0) {
      merged.plan = {
        ...(initialData as any)?.plan,
        libraryItems: attached.map(i => ({ id: i.id, name: i.name, category: i.category, details: i.details })),
      };
    }
    // Ensure allergies and other details persist inside plan for nutrition
    if (data.allergies) {
      merged.plan = {
        ...(merged.plan || (initialData as any)?.plan || {}),
        allergies: data.allergies,
      };
    }
    onNext(merged);
  };

  const handleCategorySelect = (category: ProgramCategory) => {
    setValue('category', category);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Category Selection */}
      <div className="space-y-2">
        <Label className="text-lg">Select Program Category</Label>
        <p className="text-muted-foreground text-sm">
          {isEditing ? 'Program category cannot be changed when editing.' : 'Choose the primary focus of your new program.'}
        </p>
        <div className="flex gap-3 flex-wrap justify-start">
          {categoryOptions.map(option => (
            <motion.div
              key={option.value}
              whileHover={isEditing ? {} : { scale: 1.05 }}
              whileTap={isEditing ? {} : { scale: 0.95 }}
              className={isEditing ? "cursor-not-allowed" : "cursor-pointer"}
              onClick={isEditing ? undefined : () => handleCategorySelect(option.value as ProgramCategory)}
            >
              <Card
                className={cn(
                  "flex flex-col items-center justify-center gap-1 p-3 w-20 h-20 text-center transition-all duration-200",
                  selectedCategory === option.value
                    ? "border-primary ring-2 ring-primary/50"
                    : isEditing 
                    ? "border-border opacity-50"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="text-2xl">{option.emoji}</div>
                <h3 className="font-semibold text-xs">{option.label}</h3>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Program Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Program Title</Label>
        <Input
          id="title"
          placeholder="e.g., 30-Day Strength Builder"
          {...register('title', { required: 'Title is required' })}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      {/* Program Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Program Description</Label>
        <Textarea
          id="description"
          placeholder="A comprehensive plan..."
          {...register('description')}
        />
      </div>

      {/* Dynamic Fields based on Category */}
      {selectedCategory === 'fitness' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="muscleGroups">Muscle Groups</Label>
            <MultiSelect
              options={MUSCLE_GROUPS}
              selected={muscleGroups}
              onChange={(selected) => setValue('muscleGroups', selected)}
              placeholder="Select muscle groups..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="equipment">Equipment Needed</Label>
            <MultiSelect
              options={EQUIPMENT_OPTIONS}
              selected={equipment}
              onChange={(selected) => setValue('equipment', selected)}
              placeholder="Select equipment..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits</Label>
            <Textarea
              id="benefits"
              placeholder="e.g., Strength, endurance..."
              {...register('benefits')}
            />
          </div>
        </>
      )}

      {selectedCategory === 'nutrition' && (
        <div className="space-y-2">
          <Label htmlFor="allergies">Allergies / Restrictions</Label>
          <Input
            id="allergies"
            placeholder="e.g., Gluten, Dairy"
            {...register('allergies')}
          />
        </div>
      )}

      {selectedCategory === 'mental health' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="equipment">Equipment Needed</Label>
            <MultiSelect
              options={EQUIPMENT_OPTIONS}
              selected={equipment}
              onChange={(selected) => setValue('equipment', selected)}
              placeholder="Select equipment..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits</Label>
            <Textarea
              id="benefits"
              placeholder="e.g., Mindfulness, relaxation"
              {...register('benefits')}
            />
          </div>
        </>
      )}

      {/* Inline Next Button (kept) */}
      {/* Assignment and Scheduling (optional) */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="assignedTo">Assign to Client (optional)</Label>
          <Controller
            name="assignedTo"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client with missing program" />
                </SelectTrigger>
                <SelectContent>
                  {clientsLoading ? (
                    <SelectItem value="loading" disabled>Loading clients...</SelectItem>
                  ) : missingProgramClients.length > 0 ? (
                    missingProgramClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center gap-2">
                          <img 
                            src={client.avatar_url} 
                            alt={client.full_name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span>{client.full_name}</span>
                          <span className="text-xs text-muted-foreground">({client.email})</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-clients" disabled>No clients with missing programs</SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-muted-foreground">Select a client who needs a program assigned.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduledDate">Schedule Date (optional)</Label>
          <Input
            id="scheduledDate"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            {...register('scheduledDate', {
              validate: (value) => {
                if (!value) return true; // Optional field
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return selectedDate >= today || 'Cannot schedule a program in the past';
              }
            })}
          />
          {errors.scheduledDate && (
            <p className="text-sm text-destructive">{errors.scheduledDate.message}</p>
          )}
        </div>
      </div>


      {/* Inline Next Button (kept) */}
      <Button
        onClick={handleSubmit(submitWithLibrary)}
        className="w-full md:w-fit"
        disabled={!selectedCategory || !!errors.title}
      >
        Next: Start Building
      </Button>
    </motion.div>
  );
};

export default ProgramDetails;
