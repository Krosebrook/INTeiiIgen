import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { DashboardGrid } from "@/components/dashboard-grid";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { VisualWidgetBuilder } from "@/components/visual-widget-builder";
import { KpiCards } from "@/components/kpi-cards";
import { SmartAssistant } from "@/components/smart-assistant";
import { TemplateGallery, type DashboardTemplate } from "@/components/template-gallery";
import { NLQPanel } from "@/components/nlq-panel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useOnboarding } from "@/hooks/use-onboarding";
import { apiRequest } from "@/lib/queryClient";
import { CloneDashboardDialog } from "@/components/clone-dashboard-dialog";
import { Loader2, ArrowLeft, Copy, Check, Wand2 } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { fadeInUp, staggerContainer, smoothTransition } from "@/lib/animations";
import type { Dashboard, Widget, DataSource } from "@shared/schema";
import { Link } from "wouter";

export default function DashboardViewPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { completeChecklistItem } = useOnboarding();
  const [showWidgetCreator, setShowWidgetCreator] = useState(false);
  const [showVisualBuilder, setShowVisualBuilder] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deletingWidgetId, setDeletingWidgetId] = useState<number | null>(null);

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
        dashboardId: parseInt(id!),
        type: data.type,
        title: data.title,
        dataSourceId: data.dataSourceId,
        config: data.config,
        position: { x: 0, y: 0, w: 1, h: 1 },
        layers: data.layers || null,
        referenceLines: data.referenceLines || null,
        annotations: data.annotations || null,
      });
      return res.json();
    },
    onSuccess: () => {
      completeChecklistItem("add-widget");
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards", id, "widgets"] });
      setShowWidgetCreator(false);
      setShowVisualBuilder(false);
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

  const handleTemplateSelect = async (template: DashboardTemplate) => {
    toast({
      title: "Template applied",
      description: `${template.name} template structure will be used for new widgets.`,
    });
  };

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

  const readyDataSources = dataSources?.filter((s) => s.status === "ready") || [];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="p-6"
    >
      <motion.div variants={fadeInUp} transition={smoothTransition} className="mb-4 flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" data-testid="breadcrumb-home">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage data-testid="breadcrumb-dashboard-name">{dashboard.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-2">
          <TemplateGallery onSelectTemplate={handleTemplateSelect} />
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowCloneDialog(true)}
            data-testid="button-clone-dashboard"
          >
            <Copy className="h-4 w-4" />
            Clone
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowVisualBuilder(true)}
            data-testid="button-visual-builder"
          >
            <Wand2 className="h-4 w-4" />
            Visual Builder
          </Button>
        </div>
      </motion.div>

      {readyDataSources.length > 0 && (
        <motion.div variants={fadeInUp} transition={{ ...smoothTransition, delay: 0.1 }} className="mb-6">
          <KpiCards dataSources={readyDataSources} />
        </motion.div>
      )}

      {readyDataSources.length > 0 && (
        <motion.div variants={fadeInUp} transition={{ ...smoothTransition, delay: 0.15 }} className="mb-6">
          <NLQPanel
            dataSources={readyDataSources}
            onAddToDashboard={(result, dataSourceId) => {
              createWidgetMutation.mutate({
                type: result.chartType,
                title: result.title || "Query Result",
                dataSourceId,
                config: {
                  data: result.data,
                  xAxis: result.xAxis,
                  yAxis: result.yAxis,
                  statValue: result.statValue,
                  statLabel: result.statLabel,
                },
              });
            }}
          />
        </motion.div>
      )}

      <motion.div variants={fadeInUp} transition={{ ...smoothTransition, delay: 0.2 }}>
        <DashboardGrid
          dashboard={dashboard}
          widgets={widgets || []}
          dataSources={dataSources}
          isLoading={widgetsLoading}
          onAddWidget={() => setShowWidgetCreator(true)}
          onDeleteWidget={(widgetId) => setDeletingWidgetId(widgetId)}
          onShareDashboard={() => setShowShareDialog(true)}
          onGenerateInsights={() => generateInsightsMutation.mutate()}
        />
      </motion.div>

      <SmartAssistant
        dashboardId={dashboard.id}
        dataSources={dataSources || []}
        widgets={widgets || []}
      />

      <Dialog open={showWidgetCreator || showVisualBuilder} onOpenChange={(open) => {
        setShowWidgetCreator(false);
        setShowVisualBuilder(open);
      }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" data-testid="dialog-widget-builder">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" data-testid="title-widget-builder">
              <Wand2 className="h-5 w-5" />
              Visual Widget Builder
            </DialogTitle>
            <DialogDescription data-testid="description-widget-builder">
              Build charts visually with live preview
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {readyDataSources.length > 0 ? (
              <VisualWidgetBuilder
                dataSources={readyDataSources}
                onCreateWidget={(data) => createWidgetMutation.mutate(data)}
                onCancel={() => {
                  setShowWidgetCreator(false);
                  setShowVisualBuilder(false);
                }}
              />
            ) : (
              <div className="text-center py-8" data-testid="empty-data-sources">
                <p className="text-muted-foreground mb-4">No data sources available. Upload data first to create widgets.</p>
                <Link href="/data">
                  <Button data-testid="button-upload-data">Add Data</Button>
                </Link>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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

      <ConfirmDialog
        open={deletingWidgetId !== null}
        onOpenChange={(open) => !open && setDeletingWidgetId(null)}
        title="Delete widget"
        description="This will permanently remove this widget from your dashboard. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deletingWidgetId !== null) {
            deleteWidgetMutation.mutate(deletingWidgetId);
            setDeletingWidgetId(null);
          }
        }}
      />

      {dashboard && (
        <CloneDashboardDialog
          open={showCloneDialog}
          onOpenChange={setShowCloneDialog}
          dashboard={dashboard}
          widgets={widgets || []}
        />
      )}
    </motion.div>
  );
}
