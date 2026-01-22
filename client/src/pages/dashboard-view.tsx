import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { DashboardGrid } from "@/components/dashboard-grid";
import { WidgetCreator } from "@/components/widget-creator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, ArrowLeft, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Dashboard, Widget, DataSource } from "@shared/schema";
import { Link } from "wouter";

export default function DashboardViewPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showWidgetCreator, setShowWidgetCreator] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: dashboard, isLoading: dashboardLoading } = useQuery<Dashboard>({
    queryKey: ["/api/dashboards", id],
  });

  const { data: widgets, isLoading: widgetsLoading } = useQuery<Widget[]>({
    queryKey: ["/api/dashboards", id, "widgets"],
    enabled: !!id,
  });

  const { data: dataSources } = useQuery<DataSource[]>({
    queryKey: ["/api/data-sources"],
  });

  const deleteWidgetMutation = useMutation({
    mutationFn: async (widgetId: number) => {
      const res = await apiRequest("DELETE", `/api/widgets/${widgetId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards", id, "widgets"] });
      toast({
        title: "Widget deleted",
        description: "The widget has been removed from your dashboard.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createWidgetMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/widgets", {
        ...data,
        dashboardId: parseInt(id!),
        position: { x: 0, y: 0, w: 1, h: 1 },
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards", id, "widgets"] });
      setShowWidgetCreator(false);
      toast({
        title: "Widget created",
        description: "Your new widget has been added to the dashboard.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/dashboards/${id}/insights`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards", id, "widgets"] });
      toast({
        title: "Insights generated",
        description: "AI has analyzed your data and updated widget insights.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const shareUrl = dashboard?.shareToken
    ? `${window.location.origin}/share/${dashboard.shareToken}`
    : null;

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">Dashboard not found.</p>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboards
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link href="/">
          <Button variant="ghost" size="sm" data-testid="button-back-to-dashboards">
            <ArrowLeft className="h-4 w-4 mr-2" />
            All Dashboards
          </Button>
        </Link>
      </div>

      <DashboardGrid
        dashboard={dashboard}
        widgets={widgets || []}
        isLoading={widgetsLoading}
        onAddWidget={() => setShowWidgetCreator(true)}
        onDeleteWidget={(widgetId) => deleteWidgetMutation.mutate(widgetId)}
        onShareDashboard={() => setShowShareDialog(true)}
        onGenerateInsights={() => generateInsightsMutation.mutate()}
      />

      <Sheet open={showWidgetCreator} onOpenChange={setShowWidgetCreator}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Widget</SheetTitle>
            <SheetDescription>
              Choose a chart type and configure your widget.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <WidgetCreator
              dataSources={dataSources?.filter((s) => s.status === "ready") || []}
              onCreateWidget={(data) => createWidgetMutation.mutate(data)}
              onCancel={() => setShowWidgetCreator(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Dashboard</DialogTitle>
            <DialogDescription>
              {dashboard.isPublic
                ? "Anyone with this link can view your dashboard."
                : "Make your dashboard public to share it with others."}
            </DialogDescription>
          </DialogHeader>
          {dashboard.isPublic && shareUrl ? (
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly data-testid="input-share-url" />
              <Button size="icon" onClick={copyShareLink} data-testid="button-copy-link">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Edit your dashboard settings to make it public before sharing.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
