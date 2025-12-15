// src/pages/coach/CoachDashboard.tsx
import CoachHeader from '@/components/coach/dashboard/CoachHeader';
import ClientOverview from '@/components/coach/dashboard/ClientOverview';
import TaskBoard from '@/components/coach/dashboard/TaskBoard';

const CoachDashboard = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Header with Welcome and key metrics */}
      <CoachHeader />

      {/* Main content area */}
      <div className="space-y-8">
        <TaskBoard />
        <ClientOverview />
      </div>
    </div>
  );
};

export default CoachDashboard;
