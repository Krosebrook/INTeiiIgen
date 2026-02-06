import { useState, useMemo } from "react";
import { Plus, LayoutGrid, Sparkles, Share2, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChartWidget } from "./chart-widget";
import type { Widget, Dashboard, DataSource } from "@shared/schema";

function resolveWidgetData(widget: Widget, dataSources?: DataSource[]): any[] {
  const configData = (widget.config as any)?.data;
  if (configData && Array.isArray(configData) && configData.length > 0) {
    return configData;
  }

  if (widget.dataSourceId && dataSources) {
    const source = dataSources.find(ds => ds.id === widget.dataSourceId);
    if (source?.rawData) {
      if (Array.isArray(source.rawData)) {
        return (source.rawData as any[]).slice(0, 100);
      } else if (typeof source.rawData === 'object' && source.rawData !== null) {
        const rawObj = source.rawData as Record<string, unknown>;
        const firstArrayValue = Object.values(rawObj).find(v => Array.isArray(v));
        if (firstArrayValue && Array.isArray(firstArrayValue)) {
          return (firstArrayValue as any[]).slice(0, 100);
        }
        return [rawObj];
      }
    }
  }

  return [];
}

interface DashboardGridProps {
  dashboard: Dashboard;
  widgets: Widget[];
  dataSources?: DataSource[];
  isLoading?: boolean;
  onAddWidget?: () => void;
  onDeleteWidget?: (id: number) => void;
  onShareDashboard?: () => void;
  onGenerateInsights?: () => void;
}

export function DashboardGrid({
  dashboard,
  widgets,
  dataSources,
  isLoading = false,
  onAddWidget,
  onDeleteWidget,
  onShareDashboard,
  onGenerateInsights,
}: DashboardGridProps) {
  const [expandedWidget, setExpandedWidget] = useState<Widget | null>(null);

  const gridLayout = useMemo(() => {
    if (widgets.length === 0) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[minmax(280px,auto)]">
        {widgets.map((widget) => {
          const position = (widget.position as { w?: number; h?: number }) || {};
          const colSpan = position.w && position.w > 1 ? `md:col-span-${Math.min(position.w, 3)}` : "";
          const rowSpan = position.h && position.h > 1 ? `row-span-${Math.min(position.h, 2)}` : "";

          return (
            <div
              key={widget.id}
              className={`${colSpan} ${rowSpan}`.trim() || undefined}
              data-testid={`grid-item-${widget.id}`}
            >
              <ChartWidget
                id={widget.id}
                title={widget.title}
                type={widget.type as any}
                data={resolveWidgetData(widget, dataSources)}
                config={widget.config as any}
                aiInsights={widget.aiInsights || undefined}
                onDelete={() => onDeleteWidget?.(widget.id)}
                onExpand={() => setExpandedWidget(widget)}
              />
            </div>
          );
        })}
      </div>
    );
  }, [widgets, dataSources, onDeleteWidget]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{dashboard.title}</h1>
            {dashboard.isPublic && (
              <Badge variant="secondary">Public</Badge>
            )}
          </div>
          {dashboard.description && (
            <p className="text-muted-foreground mt-1">{dashboard.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerateInsights}
            data-testid="button-generate-insights"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Insights
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onShareDashboard}
            data-testid="button-share-dashboard"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button size="sm" onClick={onAddWidget} data-testid="button-add-widget">
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : widgets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <LayoutGrid className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No widgets yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Add your first widget to start building your dashboard. You can choose from charts, tables, stats, and more.
            </p>
            <Button onClick={onAddWidget} data-testid="button-add-first-widget">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Widget
            </Button>
          </CardContent>
        </Card>
      ) : (
        gridLayout
      )}

      <Dialog open={!!expandedWidget} onOpenChange={() => setExpandedWidget(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{expandedWidget?.title}</DialogTitle>
            {expandedWidget?.aiInsights && (
              <DialogDescription className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                {expandedWidget.aiInsights}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="h-[60vh]">
            {expandedWidget && (
              <ChartWidget
                id={expandedWidget.id}
                title={expandedWidget.title}
                type={expandedWidget.type as any}
                data={resolveWidgetData(expandedWidget, dataSources)}
                config={expandedWidget.config as any}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
