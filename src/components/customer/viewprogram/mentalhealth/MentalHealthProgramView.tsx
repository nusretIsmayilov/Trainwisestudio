// src/components/customer/viewprogram/mentalhealth/MentalHealthProgramView.tsx

import { useState, useEffect } from "react";
import { DetailedMentalHealthTask } from "@/mockdata/viewprograms/mockmentalhealthprograms";
import { findMentalHealthGuideById } from "@/mockdata/library/mockmentalexercises";
import ActivityCarousel from "./ActivityCarousel";
import ActivityDetails from "./ActivityDetails";
import MentalHealthGuide from "@/components/customer/library/mentalexercise/MentalHealthGuide";
import GuideDrawer from "../shared/GuideDrawer";

interface MentalHealthProgramViewProps {
  initialData: DetailedMentalHealthTask;
}

export default function MentalHealthProgramView({ initialData }: MentalHealthProgramViewProps) {
  const [programData, setProgramData] = useState(initialData);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    programData.activities.length > 0 ? programData.activities[0].id : null
  );
  // ✅ UPDATED breakpoint to 768px
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    // ✅ UPDATED breakpoint to 768px
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleActivityToggle = (activityId: string, isCompleted: boolean) => {
    setProgramData(prevData => {
      const newActivities = prevData.activities.map(act => 
        act.id === activityId ? { ...act, isCompleted } : act
      );
      return { ...prevData, activities: newActivities };
    });
  };

  const selectedActivity = programData.activities.find(a => a.id === selectedActivityId);
  const activityGuide = selectedActivity ? findMentalHealthGuideById(selectedActivity.libraryActivityId) : null;

  return (
    <main className="space-y-8">
      <ActivityCarousel
        activities={programData.activities}
        selectedActivityId={selectedActivityId!}
        onSelectActivity={setSelectedActivityId}
      />
      {selectedActivity && (
        <ActivityDetails
          activity={selectedActivity}
          onActivityToggle={handleActivityToggle}
        />
      )}
      
      <GuideDrawer
        guideData={activityGuide}
        isMobile={isMobile}
        triggerText="View Guide:"
      >
        {activityGuide && <MentalHealthGuide guide={activityGuide} />}
      </GuideDrawer>
    </main>
  );
}
