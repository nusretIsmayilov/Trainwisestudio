import { MentalHealthActivity } from "@/mockdata/viewprograms/mockmentalhealthprograms";
// ✅ FIXED: Corrected import path to point to the 'components' directory
import ItemCarousel, { CarouselItem } from '@/components/customer/viewprogram/shared/ItemCarousel';

interface ActivityCarouselProps {
  activities: MentalHealthActivity[];
  selectedActivityId: string;
  onSelectActivity: (id: string) => void;
}

export default function ActivityCarousel({ activities, selectedActivityId, onSelectActivity }: ActivityCarouselProps) {
  const carouselItems: CarouselItem[] = activities.map(activity => ({
    id: activity.id,
    imageUrl: activity.imageUrl,
    label: activity.timeOfDay,
    isCompleted: activity.isCompleted,
  }));
  
  return (
    <ItemCarousel 
      items={carouselItems}
      selectedItemId={selectedActivityId}
      onSelectItem={onSelectActivity}
    />
  );
}
