import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChartWidget } from "@/components/chart-widget";
import { VisualWidgetBuilder } from "@/components/visual-widget-builder";
import { DashboardThemeSelector, type DashboardTheme, getThemeClasses } from "@/components/dashboard-theme-selector";
import { LayoutTemplatesDialog, type LayoutTemplateConfig } from "@/components/layout-templates";
import {
  Plus,
  ArrowLeft,
  Settings,
  LayoutGrid,
  Wand2,
  Eye,
  Copy,
  Check,
  Share2,
  Sparkles,
  BarChart3,
  LineChart,
  PieChart,
  AreaChart,
  Table2,
  Hash,
  Loader2,
  X,
  LayoutTemplate,
} from "lucide-react";
import { fadeInUp, staggerContainer, smoothTransition } from "@/lib/animations";
import type { Dashboard, Widget, DataSource } from "@shared/schema";

const widgetTemplates = [
  { type: "bar", label: "Bar Chart", icon: BarChart3, description: "Compare categories" },
  { type: "line", label: "Line Chart", icon: LineChart, description: "Show trends" },
  { type: "area", label: "Area Chart", icon: AreaChart, description: "Filled trends" },
  { type: "pie", label: "Pie Chart", icon: PieChart, description: "Show proportions" },
  { type: "table", label: "Data Table", icon: Table2, description: "Display raw data" },
  { type: "stat", label: "Stat Card", icon: Hash, description: "Single metric" },
];

export default function DashboardStudio() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showWidgetBuilder, setShowWidgetBuilder] = useState(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [dashboardTheme, setDashboardTheme] = useState<DashboardTheme>('minimal');

  const { data: dashboard, isLoading: dashboardLoading } = useQuery<Dashboard>({
    queryKey: ["/api/dashboards", id],
  });

  const { data: widgets = [], isLoading: widgetsLoading } = useQuery<Widget[]>({
    queryKey: ["/api/dashboards", id, "widgets"],
    enabled: !!id,
  });

  const { data: dataSources = [] } = useQuery<DataSource[]>({
    queryKey: ["/api/data-sources"],
  });

  const createWidgetMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/widgets", {
        ...data,
        dashboardId: parseInt(id!),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards", id, "widgets"] });
      setShowWidgetBuilder(false);
      setSelectedWidgetType(null);
      toast({
        title: "Widget created",
        description: "Your widget has been added to the dashboard.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create widget",
        description: error.message,
        variant: "destructive",
      });
    },
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
        description: "The widget has been removed.",
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
        title: "AI Insights Generated",
        description: "Charts have been enhanced with AI analysis.",
      });
    },
  });

  const readyDataSources = dataSources.filter((s) => s.status === "ready");
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

  const handleQuickAdd = (type: string) => {
    setSelectedWidgetType(type);
    setShowWidgetBuilder(true);
  };

  const handleApplyTemplate = async (template: LayoutTemplateConfig) => {
    for (let i = 0; i < template.widgets.length; i++) {
      const widget = template.widgets[i];
      await createWidgetMutation.mutateAsync({
        title: widget.title,
        type: widget.type,
        config: {
          data: widget.defaultData || [],
          xAxis: 'name',
          yAxis: 'value',
          showGrid: true,
          showLegend: widget.type === 'pie',
        },
        position: {
          gridColumn: widget.gridColumn || 'span 1',
          gridRow: widget.gridRow || 'span 1',
          order: i,
        },
      });
    }
    toast({
      title: "Template Applied",
      description: `Added ${template.widgets.length} widgets from "${template.name}" template.`,
    });
  };

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    <div className="flex h-full">
      <Sheet>
        <div className="flex-1 flex flex-col overflow-hidden">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          >
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold" data-testid="text-dashboard-title">
                  {dashboard.title}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {widgets.length} widget{widgets.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DashboardThemeSelector 
                theme={dashboardTheme} 
                onThemeChange={setDashboardTheme} 
              />
              <LayoutTemplatesDialog 
                onSelectTemplate={handleApplyTemplate}
                trigger={
                  <Button variant="outline" size="sm" className="gap-2" data-testid="button-layout-templates">
                    <LayoutTemplate className="h-4 w-4" />
                    <span className="hidden sm:inline">Templates</span>
                  </Button>
                }
              />
              <Button
                variant={previewMode ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                data-testid="button-preview-toggle"
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? "Exit Preview" : "Preview"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateInsightsMutation.mutate()}
                disabled={generateInsightsMutation.isPending || widgets.length === 0}
                data-testid="button-ai-insights"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Insights
              </Button>
              {dashboard.isPublic && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShareDialog(true)}
                  data-testid="button-share"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" data-testid="button-settings">
                  <Settings className="h-4 w-4" />
                </Button>
              </SheetTrigger>
            </div>
          </motion.header>

          <div className="flex-1 flex overflow-hidden">
            {!previewMode && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-64 border-r bg-muted/30 p-4 overflow-auto"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Widgets
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {widgetTemplates.map((template) => {
                        const Icon = template.icon;
                        return (
                          <Card
                            key={template.type}
                            className="cursor-pointer hover-elevate transition-all"
                            onClick={() => handleQuickAdd(template.type)}
                            data-testid={`button-add-${template.type}`}
                          >
                            <CardContent className="p-3 flex flex-col items-center gap-1 text-center">
                              <Icon className="h-6 w-6 text-muted-foreground" />
                              <span className="text-xs font-medium">{template.label}</span>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Wand2 className="h-4 w-4" />
                      Quick Actions
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setShowWidgetBuilder(true)}
                        data-testid="button-visual-builder"
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        Visual Builder
                      </Button>
                    </div>
                  </div>

                  {readyDataSources.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-3">Data Sources</h3>
                      <ScrollArea className="h-32">
                        <div className="space-y-1">
                          {readyDataSources.map((ds) => (
                            <div
                              key={ds.id}
                              className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-xs"
                            >
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              <span className="truncate">{ds.name}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </motion.aside>
            )}

            <main className="flex-1 overflow-auto p-6">
              <AnimatePresence mode="wait">
                {widgetsLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center h-64"
                  >
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </motion.div>
                ) : widgets.length === 0 ? (
                  <motion.div
                    key="empty"
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="flex flex-col items-center justify-center h-64 text-center"
                  >
                    <div className="rounded-full bg-muted p-6 mb-4">
                      <LayoutGrid className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Start Building Your Dashboard</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                      Add widgets from the sidebar or use the Visual Builder to create interactive charts and visualizations.
                    </p>
                    {readyDataSources.length > 0 ? (
                      <Button onClick={() => setShowWidgetBuilder(true)} data-testid="button-add-first-widget">
                        <Wand2 className="h-4 w-4 mr-2" />
                        Create Your First Widget
                      </Button>
                    ) : (
                      <Link href="/upload">
                        <Button data-testid="button-upload-data">
                          <Plus className="h-4 w-4 mr-2" />
                          Upload Data First
                        </Button>
                      </Link>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="grid"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {widgets.map((widget, index) => (
                      <motion.div
                        key={widget.id}
                        variants={fadeInUp}
                        transition={{ ...smoothTransition, delay: index * 0.05 }}
                        className="relative group"
                        data-testid={`widget-container-${widget.id}`}
                      >
                        {!previewMode && (
                          <div className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-6 w-6 rounded-full shadow-lg"
                              onClick={() => deleteWidgetMutation.mutate(widget.id)}
                              data-testid={`button-delete-widget-${widget.id}`}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        <ChartWidget
                          id={widget.id}
                          title={widget.title}
                          type={widget.type as any}
                          data={(widget.config as any)?.data || []}
                          config={widget.config as any}
                          aiInsights={widget.aiInsights || undefined}
                          onDelete={previewMode ? undefined : () => deleteWidgetMutation.mutate(widget.id)}
                          themeVariant={dashboardTheme}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>
        </div>

        <SheetContent>
          <SheetHeader>
            <SheetTitle>Dashboard Settings</SheetTitle>
            <SheetDescription>Configure your dashboard appearance and sharing options.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dashboard Name</label>
              <Input value={dashboard.title} readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input value={dashboard.description || "No description"} readOnly />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Public Dashboard</p>
                <p className="text-xs text-muted-foreground">Anyone with the link can view</p>
              </div>
              <Badge variant={dashboard.isPublic ? "default" : "secondary"}>
                {dashboard.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
            <div className="pt-4 border-t">
              <Link href={`/dashboard/${id}`}>
                <Button variant="outline" className="w-full">
                  View Full Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showWidgetBuilder} onOpenChange={setShowWidgetBuilder}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" data-testid="dialog-widget-builder">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Create Widget
            </DialogTitle>
            <DialogDescription>
              Build a visualization for your dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {readyDataSources.length > 0 ? (
              <VisualWidgetBuilder
                dataSources={readyDataSources}
                onCreateWidget={(data) => createWidgetMutation.mutate(data)}
                onCancel={() => {
                  setShowWidgetBuilder(false);
                  setSelectedWidgetType(null);
                }}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No data sources available. Upload data first to create widgets.
                </p>
                <Link href="/upload">
                  <Button data-testid="button-go-upload">Upload Data</Button>
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
              Anyone with this link can view your dashboard.
            </DialogDescription>
          </DialogHeader>
          {shareUrl && (
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly data-testid="input-share-url" />
              <Button size="icon" onClick={copyShareLink} data-testid="button-copy-link">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
