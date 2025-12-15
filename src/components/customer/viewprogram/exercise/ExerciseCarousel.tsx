import { WorkoutExercise } from "@/mockdata/viewprograms/mockexerciseprograms";
// ✅ FIXED: Corrected import path to point to the 'components' directory
import ItemCarousel, { CarouselItem } from '@/components/customer/viewprogram/shared/ItemCarousel';

interface ExerciseCarouselProps {
  exercises: WorkoutExercise[];
  selectedExerciseId: string;
  onSelectExercise: (id: string) => void;
}

export default function ExerciseCarousel({ exercises, selectedExerciseId, onSelectExercise }: ExerciseCarouselProps) {
  const carouselItems: CarouselItem[] = exercises.map(exercise => ({
    id: exercise.id,
    imageUrl: exercise.imageUrl,
    label: exercise.name,
    isCompleted: exercise.sets.every(set => set.completed),
  }));

  return (
    <ItemCarousel 
      items={carouselItems}
      selectedItemId={selectedExerciseId}
      onSelectItem={onSelectExercise}
    />
  );
}
