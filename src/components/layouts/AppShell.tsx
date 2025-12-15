import AnimatedOutlet from '@/components/routing/AnimatedOutlet';
import { SidebarProvider } from '@/components/ui/sidebar';
import TopNav from './TopNav';
import SideNav from './SideNav';
import ErrorBoundary from '@/components/system/ErrorBoundary';
import CoachProfileBanner from '@/components/coach/CoachProfileBanner';
import { 
  NavItem, 
  coachNavItems, 
  customerNavItems, 
  getCustomerNavItems
} from '@/lib/navItems';
import { useAuth } from '@/contexts/AuthContext';
import { useLibraryAccess } from '@/hooks/useLibraryAccess';
import { AccessLevelProvider } from '@/contexts/AccessLevelContext';
import { useRoutePrefetch } from '@/hooks/useRoutePrefetch';
import { useNavDebug } from '@/hooks/useNavDebug';

const AppShell = () => {
  const { profile, loading } = useAuth();
  const { shouldShowLink } = useLibraryAccess();

  // Route prefetching for smoother navigation
  useRoutePrefetch(profile?.role as 'customer' | 'coach' | null);
  
  // Dev-only navigation debug logging
  useNavDebug();

  if (loading) return <div>Loading...</div>;
  if (!profile) return null;

  const navByRole = {
    coach: { main: coachNavItems },
    customer: { main: getCustomerNavItems(shouldShowLink, true) },
  };

  const navConfig = navByRole[profile.role as keyof typeof navByRole];
  const navItems: NavItem[] = navConfig.main;

  const isCoach = profile.role === 'coach';

  return (
    <AccessLevelProvider>
      <SidebarProvider defaultOpen={false}>
        <div className="theme-dashboard min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-stone-100 dark:from-black dark:to-gray-900">
          <SideNav navItems={navItems} />
          <div className="flex-1 flex flex-col min-w-0">
            <TopNav />
            {/* Non-blocking coach profile banner */}
            {isCoach && <CoachProfileBanner />}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
              <ErrorBoundary>
                <AnimatedOutlet />
              </ErrorBoundary>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AccessLevelProvider>
  );
};

export default AppShell;
