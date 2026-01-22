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
import { Loader2 } from "lucide-react";

import SplashPage from "@/pages/splash";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Upload from "@/pages/upload";
import CloudPage from "@/pages/cloud";
import DataSources from "@/pages/data-sources";
import NewDashboard from "@/pages/new-dashboard";
import DashboardView from "@/pages/dashboard-view";
import InsightsPage from "@/pages/insights";
import SharedDashboard from "@/pages/shared-dashboard";
import OrganizationsPage from "@/pages/organizations";
import NotFound from "@/pages/not-found";

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
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AuthenticatedRouter() {
  return (
    <AuthenticatedLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/sources" component={DataSources} />
        <Route path="/upload" component={Upload} />
        <Route path="/cloud" component={CloudPage} />
        <Route path="/new" component={NewDashboard} />
        <Route path="/dashboard/:id" component={DashboardView} />
        <Route path="/insights" component={InsightsPage} />
        <Route path="/reports" component={InsightsPage} />
        <Route path="/analytics" component={InsightsPage} />
        <Route path="/organizations" component={OrganizationsPage} />
        <Route component={NotFound} />
      </Switch>
    </AuthenticatedLayout>
  );
}

function Router() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  // Public share route - doesn't require authentication
  if (location.startsWith("/share/")) {
    return <SharedDashboard />;
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
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
