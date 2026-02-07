import { useMemo, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Maximize2, Trash2, Sparkles, Download, Image as ImageIcon } from "lucide-react";
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

  const chartContent = useMemo(() => {
    return renderChart({
      type,
      data,
      config,
      colors,
      themeVariant,
      enableAITooltips,
      title,
    });
  }, [type, data, config, colors, themeVariant, enableAITooltips, title]);

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
            <Badge variant="secondary" className="text-xs capitalize">
              {type}
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
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-4 pt-0">
        <div ref={chartRef} className="h-full min-h-[200px]">{chartContent}</div>
      </CardContent>
    </Card>
  );
}
