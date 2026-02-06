import { Suspense, lazy } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { OfflineBanner } from "@/components/offline-banner";
import { OnboardingProvider } from "@/hooks/use-onboarding";
import { OnboardingOverlay } from "@/components/onboarding-overlay";
import { OnboardingAssistant } from "@/components/onboarding-assistant";
import { WelcomeFlow } from "@/components/welcome-flow";
import { Loader2 } from "lucide-react";

// Eagerly loaded pages (critical path)
import SplashPage from "@/pages/splash";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";

// Lazy loaded pages (non-critical, loaded on demand)
const Upload = lazy(() => import("@/pages/upload"));
const CloudPage = lazy(() => import("@/pages/cloud"));
const DataSources = lazy(() => import("@/pages/data-sources"));
const NewDashboard = lazy(() => import("@/pages/new-dashboard"));
const DashboardView = lazy(() => import("@/pages/dashboard-view"));
const InsightsPage = lazy(() => import("@/pages/insights"));
const SharedDashboard = lazy(() => import("@/pages/shared-dashboard"));
const OrganizationsPage = lazy(() => import("@/pages/organizations"));
const DashboardStudio = lazy(() => import("@/pages/dashboard-studio"));
const StudioIndex = lazy(() => import("@/pages/studio"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between p-3 border-b gap-2 flex-shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto custom-scrollbar">
            <Suspense fallback={<PageLoader />}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AuthenticatedRouter() {
  return (
    <OnboardingProvider>
      <AuthenticatedLayout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/sources" component={DataSources} />
          <Route path="/upload" component={Upload} />
          <Route path="/cloud" component={CloudPage} />
          <Route path="/new" component={NewDashboard} />
          <Route path="/dashboard/:id" component={DashboardView} />
          <Route path="/studio/:id" component={DashboardStudio} />
          <Route path="/studio" component={StudioIndex} />
          <Route path="/insights" component={InsightsPage} />
          <Route path="/reports" component={InsightsPage} />
          <Route path="/analytics" component={InsightsPage} />
          <Route path="/organizations" component={OrganizationsPage} />
          <Route component={NotFound} />
        </Switch>
      </AuthenticatedLayout>
      <WelcomeFlow />
      <OnboardingOverlay />
      <OnboardingAssistant />
    </OnboardingProvider>
  );
}

function Router() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  // Public share route - doesn't require authentication
  if (location.startsWith("/share/")) {
    return (
      <Suspense fallback={<PageLoader />}>
        <SharedDashboard />
      </Suspense>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Show auth page for /auth route, splash page for everything else
    if (location === "/auth" || location === "/signup" || location === "/login") {
      return <AuthPage />;
    }
    return <SplashPage />;
  }

  return <AuthenticatedRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
          <OfflineBanner />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
