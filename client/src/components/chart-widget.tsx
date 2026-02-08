import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Maximize2, Trash2, Sparkles, Download, Image as ImageIcon, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getThemeClasses, type DashboardTheme } from "@/components/dashboard-theme-selector";
import { renderChart } from "@/components/chart-renderers";
import { exportWidgetAsCSV, exportWidgetAsPNG } from "@/lib/chart-export";
import type { VisualizationLayer, ReferenceLine, Annotation } from "@shared/schema";

interface ChartWidgetProps {
  id: number;
  title: string;
  type: "bar" | "line" | "pie" | "area" | "scatter" | "stat" | "table" | "donut" | "gauge" | "funnel" | "radar";
  data: any[];
  config: {
    xAxis?: string;
    yAxis?: string;
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
    statValue?: string;
    statLabel?: string;
    gaugeMin?: number;
    gaugeMax?: number;
  };
  layers?: VisualizationLayer[];
  referenceLines?: ReferenceLine[];
  annotations?: Annotation[];
  aiInsights?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onExpand?: () => void;
  themeVariant?: DashboardTheme;
  enableAITooltips?: boolean;
}

const defaultColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function ChartWidget({
  id,
  title,
  type,
  data,
  config,
  layers,
  referenceLines,
  annotations,
  aiInsights,
  onEdit,
  onDelete,
  onExpand,
  themeVariant = 'minimal',
  enableAITooltips = true,
}: ChartWidgetProps) {
  const colors = config.colors || defaultColors;
  const themeClasses = getThemeClasses(themeVariant);
  const chartRef = useRef<HTMLDivElement>(null);

  const allLayers = useMemo(() => {
    const primary: VisualizationLayer = {
      id: "primary",
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      config: config as any,
    };
    if (layers && layers.length > 0) {
      return [primary, ...layers];
    }
    return [primary];
  }, [type, config, layers]);

  const [activeLayerIndex, setActiveLayerIndex] = useState(0);

  const safeIndex = Math.min(activeLayerIndex, allLayers.length - 1);
  const activeLayer = allLayers[safeIndex];

  const chartContent = useMemo(() => {
    const layerConfig = safeIndex === 0 ? config : { ...config, ...(activeLayer.config || {}) };
    const layerType = activeLayer.type;

    return renderChart({
      type: layerType,
      data,
      config: layerConfig,
      colors,
      themeVariant,
      enableAITooltips,
      title,
      referenceLines: referenceLines || [],
      annotations: annotations || [],
    });
  }, [activeLayer, safeIndex, config, data, colors, themeVariant, enableAITooltips, title, referenceLines, annotations]);

  const hasMultipleLayers = allLayers.length > 1;

  return (
    <Card className={`h-full flex flex-col chart-container ${themeClasses}`} data-testid={`widget-${id}`}>
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className={`text-base truncate ${themeVariant === 'dark' ? 'text-white' : ''}`}>
              {title}
            </CardTitle>
            {aiInsights && (
              <CardDescription className="flex items-center gap-1 mt-1">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="truncate">{aiInsights}</span>
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-1">
            {hasMultipleLayers && (
              <Badge variant="outline" className="text-xs gap-1 no-default-hover-elevate no-default-active-elevate">
                <Layers className="h-3 w-3" />
                {allLayers.length}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs capitalize">
              {activeLayer.type}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid={`button-widget-menu-${id}`}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onExpand && (
                  <DropdownMenuItem onClick={onExpand}>
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Expand
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => exportWidgetAsCSV(title, data)} data-testid={`button-export-csv-${id}`}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportWidgetAsPNG(chartRef.current, title)} data-testid={`button-export-png-${id}`}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Export PNG
                </DropdownMenuItem>
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {hasMultipleLayers && (
          <div className="flex items-center gap-1 mt-2 overflow-x-auto" data-testid={`layer-tabs-${id}`}>
            {allLayers.map((layer, idx) => (
              <Button
                key={layer.id}
                variant={idx === safeIndex ? "default" : "ghost"}
                size="sm"
                className={`text-xs shrink-0 toggle-elevate ${idx === safeIndex ? "toggle-elevated" : ""}`}
                onClick={() => setActiveLayerIndex(idx)}
                data-testid={`button-layer-tab-${id}-${idx}`}
              >
                {layer.label || `${layer.type.charAt(0).toUpperCase() + layer.type.slice(1)}`}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-4 pt-0">
        <div ref={chartRef} className="h-full min-h-[200px]">{chartContent}</div>
      </CardContent>
    </Card>
  );
}
