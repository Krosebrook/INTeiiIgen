import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, LayoutDashboard, Share2 } from "lucide-react";
import { ChartWidget } from "@/components/chart-widget";
import { ThemeToggle } from "@/components/theme-toggle";

interface Widget {
  id: number;
  dashboardId: number;
  type: string;
  title: string;
  config: any;
  position: { x: number; y: number; w: number; h: number };
}

interface Dashboard {
  id: number;
  title: string;
  description?: string;
  isPublic: boolean;
}

export default function SharedDashboard() {
  const params = useParams();
  const token = params.token;

  const { data, isLoading, error } = useQuery<{ dashboard: Dashboard; widgets: Widget[] }>({
    queryKey: ["/api/share", token],
    queryFn: async () => {
      const response = await fetch(`/api/share/${token}`);
      if (!response.ok) {
        throw new Error("Dashboard not found or not public");
      }
      return response.json();
    },
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
        <Share2 className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-semibold">Dashboard Not Found</h1>
        <p className="text-muted-foreground">
          This dashboard doesn't exist or is not publicly shared.
        </p>
      </div>
    );
  }

  const { dashboard, widgets } = data;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-semibold">{dashboard.title}</h1>
            {dashboard.description && (
              <p className="text-sm text-muted-foreground">{dashboard.description}</p>
            )}
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="p-6">
        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <LayoutDashboard className="h-12 w-12 mb-4" />
            <p>This dashboard has no widgets yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {widgets.map((widget) => (
              <ChartWidget
                key={widget.id}
                id={widget.id}
                title={widget.title}
                type={widget.type as any}
                data={widget.config?.data || []}
                config={{
                  xAxis: widget.config?.xAxis,
                  yAxis: widget.config?.yAxis,
                  colors: widget.config?.colors,
                  showLegend: widget.config?.showLegend,
                  showGrid: widget.config?.showGrid,
                  statValue: widget.config?.statValue,
                  statLabel: widget.config?.statLabel,
                }}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t px-6 py-4 text-center text-sm text-muted-foreground">
        Powered by DashGen
      </footer>
    </div>
  );
}
