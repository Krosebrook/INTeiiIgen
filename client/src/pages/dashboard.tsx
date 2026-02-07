import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Plus,
  LayoutDashboard,
  Clock,
  BarChart3,
  Wand2,
  Database,
  Upload,
  Sparkles,
  ArrowRight,
  FolderOpen,
  Search,
} from "lucide-react";
import { DashboardListSkeleton } from "@/components/page-skeletons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import type { Dashboard, DataSource } from "@shared/schema";

interface DashboardWithWidgets extends Dashboard {
  widgetCount?: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: dashboards, isLoading: dashboardsLoading } = useQuery<DashboardWithWidgets[]>({
    queryKey: ["/api/dashboards"],
  });

  const { data: dataSources } = useQuery<DataSource[]>({
    queryKey: ["/api/data-sources"],
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const readySources = dataSources?.filter((s) => s.status === "ready").length || 0;
  const totalSources = dataSources?.length || 0;
  const totalDashboards = dashboards?.length || 0;
  const publicDashboards = dashboards?.filter((d) => d.isPublic).length || 0;

  const filteredDashboards = dashboards?.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const hasData = totalSources > 0;
  const hasDashboards = totalDashboards > 0;

  if (dashboardsLoading) {
    return (
      <div className="p-6">
        <DashboardListSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-dashboards-heading">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="text-muted-foreground">
            {hasDashboards
              ? "Here's an overview of your workspace"
              : "Let's get started building your first dashboard"}
          </p>
        </div>
        {hasDashboards && (
          <Link href="/new">
            <Button data-testid="button-new-dashboard-header">
              <Plus className="h-4 w-4 mr-2" />
              New Dashboard
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="stat-dashboards">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDashboards}</p>
                <p className="text-xs text-muted-foreground">Dashboards</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="stat-sources">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSources}</p>
                <p className="text-xs text-muted-foreground">Data Sources</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="stat-ready">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 shrink-0">
                <FolderOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{readySources}</p>
                <p className="text-xs text-muted-foreground">Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="stat-public">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 shrink-0">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{publicDashboards}</p>
                <p className="text-xs text-muted-foreground">Shared</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!hasData && !hasDashboards && (
        <Card data-testid="card-getting-started">
          <CardHeader>
            <CardTitle className="text-lg">Getting Started</CardTitle>
            <CardDescription>
              Follow these steps to create your first dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/data" className="flex-1">
                <Card className="h-full cursor-pointer hover-elevate border-dashed">
                  <CardContent className="flex flex-col items-center text-center pt-6 pb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-medium text-sm mb-1">1. Add Your Data</p>
                    <p className="text-xs text-muted-foreground">
                      Upload files or connect cloud storage
                    </p>
                  </CardContent>
                </Card>
              </Link>
              <div className="hidden sm:flex items-center">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <Link href="/new" className="flex-1">
                <Card className="h-full cursor-pointer hover-elevate border-dashed">
                  <CardContent className="flex flex-col items-center text-center pt-6 pb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-medium text-sm mb-1">2. Create Dashboard</p>
                    <p className="text-xs text-muted-foreground">
                      Build visualizations from your data
                    </p>
                  </CardContent>
                </Card>
              </Link>
              <div className="hidden sm:flex items-center">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <Link href="/insights" className="flex-1">
                <Card className="h-full cursor-pointer hover-elevate border-dashed">
                  <CardContent className="flex flex-col items-center text-center pt-6 pb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-medium text-sm mb-1">3. Get Insights</p>
                    <p className="text-xs text-muted-foreground">
                      AI analyzes your data automatically
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {hasData && !hasDashboards && (
        <Card className="bg-primary/5 border-primary/20" data-testid="card-next-step">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Ready to visualize</p>
                <p className="text-xs text-muted-foreground">
                  You have {readySources} data source{readySources !== 1 ? "s" : ""} ready. Create your first dashboard now.
                </p>
              </div>
            </div>
            <Link href="/new">
              <Button data-testid="button-create-first-dashboard">
                <Plus className="h-4 w-4 mr-2" />
                Create Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {hasDashboards && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" data-testid="text-your-dashboards">
              Your Dashboards
            </h2>
          </div>
          {dashboards && dashboards.length > 3 && (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search dashboards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-dashboards"
              />
            </div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDashboards!.map((dashboard) => (
              <Link key={dashboard.id} href={`/dashboard/${dashboard.id}`}>
                <Card
                  className="h-full cursor-pointer hover-elevate transition-all"
                  data-testid={`card-dashboard-${dashboard.id}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      {dashboard.isPublic && (
                        <Badge variant="secondary">Public</Badge>
                      )}
                    </div>
                    <CardTitle className="text-base mt-3">
                      {dashboard.title}
                    </CardTitle>
                    {dashboard.description && (
                      <CardDescription className="line-clamp-2">
                        {dashboard.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <LayoutDashboard className="h-3 w-3" />
                          {dashboard.widgetCount || 0} widgets
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(dashboard.createdAt)}
                        </div>
                      </div>
                      <Link
                        href={`/studio/${dashboard.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          data-testid={`button-studio-${dashboard.id}`}
                        >
                          <Wand2 className="h-3 w-3" />
                          Studio
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {filteredDashboards && filteredDashboards.length === 0 && searchQuery && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No dashboards match your search.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
