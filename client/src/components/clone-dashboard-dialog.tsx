import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Copy, ArrowRight, Loader2 } from "lucide-react";
import type { Dashboard, Widget, DataSource } from "@shared/schema";

interface CloneDashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboard: Dashboard;
  widgets: Widget[];
}

export function CloneDashboardDialog({
  open,
  onOpenChange,
  dashboard,
  widgets,
}: CloneDashboardDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [cloneTitle, setCloneTitle] = useState(`${dashboard.title} (Copy)`);

  const { data: dataSources } = useQuery<DataSource[]>({
    queryKey: ["/api/data-sources"],
  });

  const usedDataSourceIds = [...new Set(widgets.filter((w) => w.dataSourceId).map((w) => w.dataSourceId!))];

  const [mapping, setMapping] = useState<Record<string, string>>({});

  const cloneMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/dashboards/${dashboard.id}/clone`, {
        title: cloneTitle,
        dataSourceMapping: Object.keys(mapping).length > 0 ? mapping : undefined,
      });
      return res.json();
    },
    onSuccess: (newDashboard: Dashboard) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
      toast({
        title: "Dashboard cloned",
        description: `"${cloneTitle}" has been created with ${widgets.length} widget(s).`,
      });
      onOpenChange(false);
      navigate(`/dashboard/${newDashboard.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Clone failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const readySources = dataSources?.filter((ds) => ds.status === "ready") || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="dialog-clone-dashboard">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Clone Dashboard
          </DialogTitle>
          <DialogDescription>
            Create a copy of this dashboard with all its widgets. Optionally remap data sources.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="clone-title">Dashboard Name</Label>
            <Input
              id="clone-title"
              value={cloneTitle}
              onChange={(e) => setCloneTitle(e.target.value)}
              placeholder="Enter name for the clone"
              data-testid="input-clone-title"
            />
          </div>

          {usedDataSourceIds.length > 0 && (
            <div className="space-y-3">
              <div>
                <Label>Data Source Mapping</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Keep the same data sources or remap widgets to use different ones.
                </p>
              </div>
              <div className="space-y-2">
                {usedDataSourceIds.map((srcId) => {
                  const source = dataSources?.find((ds) => ds.id === srcId);
                  const widgetCount = widgets.filter((w) => w.dataSourceId === srcId).length;
                  return (
                    <div key={srcId} className="flex items-center gap-2" data-testid={`mapping-row-${srcId}`}>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-sm truncate">{source?.name || `Source #${srcId}`}</span>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {widgetCount} widget{widgetCount !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Select
                        value={mapping[srcId.toString()] || srcId.toString()}
                        onValueChange={(v) => {
                          setMapping((prev) => {
                            const next = { ...prev };
                            if (v === srcId.toString()) {
                              delete next[srcId.toString()];
                            } else {
                              next[srcId.toString()] = v;
                            }
                            return next;
                          });
                        }}
                      >
                        <SelectTrigger className="w-[180px] shrink-0" data-testid={`select-mapping-${srcId}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={srcId.toString()}>
                            {source?.name || `Source #${srcId}`} (same)
                          </SelectItem>
                          {readySources
                            .filter((ds) => ds.id !== srcId)
                            .map((ds) => (
                              <SelectItem key={ds.id} value={ds.id.toString()}>
                                {ds.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-clone">
            Cancel
          </Button>
          <Button
            onClick={() => cloneMutation.mutate()}
            disabled={!cloneTitle.trim() || cloneMutation.isPending}
            data-testid="button-confirm-clone"
          >
            {cloneMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Clone Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
