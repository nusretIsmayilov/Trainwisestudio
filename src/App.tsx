import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { queryClient } from "@/lib/query-config";
import { useAuth, AuthProvider } from "./contexts/AuthContext";
import { AccessLevelProvider } from "./contexts/AccessLevelContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import RoleSelectionStep from "./pages/onboarding/RoleSelectionStep";
import { RefreshProvider } from "./contexts/RefreshContext";
import { ThemeProvider } from "next-themes";
import { Loader2 } from "lucide-react";
import StripeSyncHandler from "@/components/system/StripeSyncHandler";
import OfflineBanner from "@/components/system/OfflineBanner";
import CoachProfileStep from "./pages/onboarding/CoachProfileStep";
import AuthLinkHandler from "@/components/system/AuthLinkHandler";
import { DiagnosticPanel } from "@/components/system/DiagnosticPanel";
import { validateEnvironment } from "@/lib/env";
import "@/lib/debug";
import "@/lib/test-urls";
import "@/lib/i18n";

// --- LAYOUTS ---
import AppShell from "@/components/layouts/AppShell";
import RoleGate from "@/components/routing/RoleGate";
import CustomerRouteGuard from "@/components/routing/CustomerRouteGuard";

// --- PAGES (Lazy Loaded) ---
import LandingPage from "./pages/public/LandingPage";
import { lazy, Suspense } from "react";
import CoachProfileStep2 from "./pages/onboarding/CoachProfileStep2";
import CoachProfileStep3 from "./pages/onboarding/CoachProfileStep3";

// Legal pages
const TermsPage = lazy(() => import("./pages/legal/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/legal/PrivacyPage"));

const GetStartedPage = lazy(() => import("./pages/auth/GetStartedPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const ForgotPasswordPage = lazy(
  () => import("./pages/auth/ForgotPasswordPage")
);
const UpdatePasswordPage = lazy(
  () => import("./pages/auth/UpdatePasswordPage")
);
const RecoveryExpiredPage = lazy(
  () => import("./pages/auth/RecoveryExpiredPage")
);
const NotFound = lazy(() => import("./pages/NotFound"));
const GoalSelectionStep = lazy(
  () => import("./pages/onboarding/GoalSelectionStep")
);
const PersonalInfoStep = lazy(
  () => import("./pages/onboarding/PersonalInfoStep")
);
const PreferencesStep = lazy(
  () => import("./pages/onboarding/PreferencesStep")
);
const ContactStep = lazy(() => import("./pages/onboarding/ContactStep"));
const OnboardingSuccess = lazy(
  () => import("./pages/onboarding/OnboardingSuccess")
);
const CustomerDashboardPage = lazy(
  () => import("./pages/customer/CustomerDashboard")
);
const TestOfferSyncPage = lazy(() => import("./pages/customer/TestOfferSync"));
const CoachDashboardPage = lazy(() => import("./pages/coach/CoachDashboard"));
const ClientOverviewPage = lazy(
  () => import("./pages/coach/ClientOverviewPage")
);
const ClientCard = lazy(() => import("./pages/coach/ClientCard"));
const CoachProgramsPage = lazy(() => import("./pages/coach/ProgramsPage"));
const ProgramBuilder = lazy(() => import("./pages/coach/ProgramBuilder"));
const ProgramViewPage = lazy(() => import("./pages/coach/ProgramViewPage"));
const CoachLibraryPage = lazy(() => import("./pages/coach/LibraryPage"));
const CoachBlogPage = lazy(() => import("./pages/coach/BlogPage"));
const IncomePage = lazy(() => import("./pages/coach/IncomePage"));
const CoachSettingsPage = lazy(() => import("./pages/coach/SettingsPage"));
const CoachMessagesPage = lazy(() => import("./pages/coach/MessagesPage"));

const MyProgramsPage = lazy(() => import("./pages/customer/MyProgramsPage"));
const ViewProgramPage = lazy(() => import("./pages/customer/ViewProgramPage"));
const LibraryPage = lazy(() => import("./pages/customer/LibraryPage"));
const ProgressPage = lazy(() => import("./pages/customer/ProgressPage"));
const ProgramHistoryPage = lazy(
  () => import("./pages/customer/ProgramHistoryPage")
);
const MyCoachPage = lazy(() => import("./pages/customer/MyCoach"));
const BlogPage = lazy(() => import("./pages/customer/BlogPage"));
const ProfilePage = lazy(() => import("./pages/customer/Profile"));
const CustomerMessagesPage = lazy(
  () => import("./pages/customer/MessagesPage")
);
const UpdatePaymentPlanPage = lazy(
  () => import("./pages/customer/UpdatePaymentPlanPage")
);
const CancelSubscriptionPage = lazy(
  () => import("./pages/customer/CancelSubscriptionPage")
);

// Namespace error pages
const CustomerErrorPage = lazy(() => import("./pages/customer/ErrorPage"));
const CoachErrorPage = lazy(() => import("./pages/coach/ErrorPage"));

const LoadingScreen = () => (
  <div className="flex h-screen w-full items-center justify-center bg-emerald-50">
    <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
  </div>
);

const PublicRoutesLayout = () => {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  // If we're in a password recovery flow, never auto-redirect from public routes
  try {
    if (sessionStorage.getItem("recoveryFlow") === "1") {
      return <Outlet />;
    }
  } catch {}

  // Allow staying on update-password even if authenticated (recovery flow)
  if (
    location.pathname === "/update-password" ||
    location.pathname.startsWith("/update-password")
  ) {
    return <Outlet />;
  }

  // Only redirect to dashboard if user is on a public route (not already on a protected route)
  if (profile) {
    const publicRoutes = [
      "/",
      "/login",
      "/get-started",
      "/forgot-password",
      "/terms",
      "/privacy",
    ];
    const isOnPublicRoute = publicRoutes.includes(location.pathname);

    if (isOnPublicRoute) {
      if (profile.role === "coach" && profile.onboarding_complete) {
        return <Navigate to="/coach/dashboard" replace />;
      }

      if (profile.role === "customer" && profile.onboarding_complete) {
        return <Navigate to="/customer/dashboard" replace />;
      }

      return <Navigate to="/onboarding/step-0" replace />;
    }
  }

  return <Outlet />;
};

const ProtectedRoutesLayout = () => {
  const { profile, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!profile) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const OnboardingGate = () => {
  const { profile, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!profile) return <Navigate to="/login" replace />;
  if (profile.role !== "customer" && profile.role !== "coach") {
    return <Navigate to="/login" replace />;
  }
  if (profile.onboarding_complete)
    return <Navigate to="/customer/dashboard" replace />;
  return (
    <OnboardingProvider>
      <Outlet />
    </OnboardingProvider>
  );
};

// Customer layout with AppShell
const CustomerLayout = () => (
  <RoleGate allowedRole="customer">
    <AppShell />
  </RoleGate>
);

// Coach layout with AppShell
const CoachLayout = () => (
  <RoleGate allowedRole="coach">
    <AppShell />
  </RoleGate>
);

// Main routes wrapped with AuthProvider
const AuthenticatedRoutes = () => {
  return (
    <AuthProvider>
      <AccessLevelProvider>
        <RefreshProvider>
          <Routes>
            {/* Authentication Routes */}
            <Route element={<PublicRoutesLayout />}>
              <Route
                path="/get-started"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <GetStartedPage />
                  </Suspense>
                }
              />
              <Route
                path="/login"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <LoginPage />
                  </Suspense>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <ForgotPasswordPage />
                  </Suspense>
                }
              />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoutesLayout />}>
              {/* Coach Routes */}
              <Route element={<CoachLayout />}>
                {/* Home alias */}
                <Route
                  path="/coach/home"
                  element={<Navigate to="/coach/dashboard" replace />}
                />
                <Route
                  path="/coach/dashboard"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <CoachDashboardPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/coach/settings"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <CoachSettingsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/coach/clients"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <ClientOverviewPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/coach/clients/:clientId"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <ClientCard />
                    </Suspense>
                  }
                />
                <Route
                  path="/coach/programs"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <CoachProgramsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/coach/programs/create"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <ProgramBuilder />
                    </Suspense>
                  }
                />
                <Route
                  path="/coach/programs/edit/:id"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <ProgramBuilder />
                    </Suspense>
                  }
                />
                <Route
                  path="/coach/programs/view/:id"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <ProgramViewPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/coach/library"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <CoachLibraryPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/coach/messages"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <CoachMessagesPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/coach/messages/:conversationId"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <CoachMessagesPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/coach/blog"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <CoachBlogPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/coach/income"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <IncomePage />
                    </Suspense>
                  }
                />
                {/* Coach namespace catch-all - must be last */}
                <Route
                  path="/coach/*"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <CoachErrorPage />
                    </Suspense>
                  }
                />
              </Route>

              {/* Customer Routes */}
              <Route element={<CustomerLayout />}>
                {/* Home alias */}
                <Route
                  path="/customer/home"
                  element={<Navigate to="/customer/dashboard" replace />}
                />
                {/* Always accessible routes */}
                <Route
                  path="/customer/dashboard"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <CustomerDashboardPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/customer/my-coach"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <MyCoachPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/customer/settings"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <ProfilePage />
                    </Suspense>
                  }
                />
                <Route
                  path="/customer/payment/update-plan"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <UpdatePaymentPlanPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/customer/payment/cancel-subscription"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <CancelSubscriptionPage />
                    </Suspense>
                  }
                />

                {/* Messages - minimal access (nav works, chat needs coach) */}
                <Route
                  path="/customer/messages"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <CustomerMessagesPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/customer/messages/:conversationId"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <CustomerMessagesPage />
                    </Suspense>
                  }
                />

                {/* Coach contract OR subscription required */}
                <Route
                  path="/customer/programs"
                  element={
                    <CustomerRouteGuard skeletonType="programs">
                      <Suspense fallback={<LoadingScreen />}>
                        <MyProgramsPage />
                      </Suspense>
                    </CustomerRouteGuard>
                  }
                />
                <Route
                  path="/customer/library"
                  element={
                    <CustomerRouteGuard skeletonType="library">
                      <Suspense fallback={<LoadingScreen />}>
                        <LibraryPage />
                      </Suspense>
                    </CustomerRouteGuard>
                  }
                />
                <Route
                  path="/program/:type/:id"
                  element={
                    <CustomerRouteGuard skeletonType="programs">
                      <Suspense fallback={<LoadingScreen />}>
                        <ViewProgramPage />
                      </Suspense>
                    </CustomerRouteGuard>
                  }
                />
                <Route
                  path="/program/:id"
                  element={
                    <CustomerRouteGuard skeletonType="programs">
                      <Suspense fallback={<LoadingScreen />}>
                        <ViewProgramPage />
                      </Suspense>
                    </CustomerRouteGuard>
                  }
                />

                {/* Full access only (subscription/trial required) */}
                <Route
                  path="/customer/progress"
                  element={
                    <CustomerRouteGuard skeletonType="progress">
                      <Suspense fallback={<LoadingScreen />}>
                        <ProgressPage />
                      </Suspense>
                    </CustomerRouteGuard>
                  }
                />
                <Route
                  path="/customer/history"
                  element={
                    <CustomerRouteGuard skeletonType="programs">
                      <Suspense fallback={<LoadingScreen />}>
                        <ProgramHistoryPage />
                      </Suspense>
                    </CustomerRouteGuard>
                  }
                />
                <Route
                  path="/customer/blog"
                  element={
                    <CustomerRouteGuard skeletonType="library">
                      <Suspense fallback={<LoadingScreen />}>
                        <BlogPage />
                      </Suspense>
                    </CustomerRouteGuard>
                  }
                />

                {/* Test page */}
                <Route
                  path="/customer/test-offer-sync"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <TestOfferSyncPage />
                    </Suspense>
                  }
                />
                {/* Customer namespace catch-all - must be last */}
                <Route
                  path="/customer/*"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <CustomerErrorPage />
                    </Suspense>
                  }
                />
              </Route>

              {/* Onboarding Routes */}
              <Route path="/onboarding" element={<OnboardingGate />}>
                <Route
                  path="step-0"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <RoleSelectionStep />
                    </Suspense>
                  }
                />
                <Route
                  path="step-1"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <GoalSelectionStep />
                    </Suspense>
                  }
                />
                <Route
                  path="step-2"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <PersonalInfoStep />
                    </Suspense>
                  }
                />
                <Route
                  path="step-3"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <PreferencesStep />
                    </Suspense>
                  }
                />
                <Route
                  path="step-4"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <ContactStep />
                    </Suspense>
                  }
                />
                <Route
                  path="coach-step-1"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <CoachProfileStep />
                    </Suspense>
                  }
                />
                <Route
                  path="coach-step-2"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <CoachProfileStep2 />
                    </Suspense>
                  }
                />
                <Route
                  path="coach-step-3"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <CoachProfileStep3 />
                    </Suspense>
                  }
                />
                <Route
                  path="success"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <OnboardingSuccess />
                    </Suspense>
                  }
                />
              </Route>
            </Route>

            {/* Catch all */}
            <Route
              path="*"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <NotFound />
                </Suspense>
              }
            />
          </Routes>
        </RefreshProvider>
      </AccessLevelProvider>
    </AuthProvider>
  );
};

// Themed App wrapper that forces light theme on specific pages
const ThemedApp = () => {
  const location = useLocation();

  // Pages that should always use light theme
  const lightThemePages = [
    "/",
    "/login",
    "/get-started",
    "/forgot-password",
    "/update-password",
  ];
  const shouldForceLightTheme = lightThemePages.includes(location.pathname);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      forcedTheme={shouldForceLightTheme ? "light" : undefined}
    >
      <OfflineBanner />
      <Toaster richColors position="top-right" />
      <StripeSyncHandler />
      <AuthLinkHandler />
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Diagnostic page */}
        <Route path="/diagnostic" element={<DiagnosticPanel />} />

        {/* Legal pages */}
        <Route
          path="/terms"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <TermsPage />
            </Suspense>
          }
        />
        <Route
          path="/privacy"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PrivacyPage />
            </Suspense>
          }
        />

        {/* Password recovery */}
        <Route
          path="/update-password"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <UpdatePasswordPage />
            </Suspense>
          }
        />
        <Route
          path="/recovery-expired"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <RecoveryExpiredPage />
            </Suspense>
          }
        />

        {/* All authenticated routes */}
        <Route path="/*" element={<AuthenticatedRoutes />} />
      </Routes>
    </ThemeProvider>
  );
};

// --- MAIN APP COMPONENT ---
const App = () => {
  // Validate environment variables in development
  if (import.meta.env.DEV && !validateEnvironment()) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-red-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Configuration Error
          </h1>
          <p className="text-red-500">
            Missing required environment variables. Check the console for
            details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter
          future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        >
          <ThemedApp />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
