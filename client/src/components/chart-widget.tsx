import { useMemo, useRef } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  FunnelChart,
  Funnel,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Maximize2, Trash2, Sparkles, Download, Image as ImageIcon, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AIInteractiveTooltip } from "@/components/ai-interactive-tooltip";
import { getThemeClasses, type DashboardTheme } from "@/components/dashboard-theme-selector";

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

function exportWidgetAsCSV(title: string, data: any[]) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];
  data.forEach(row => {
    csvRows.push(headers.map(h => {
      const val = row[h];
      const str = val === null || val === undefined ? "" : String(val);
      return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(","));
  });
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function exportWidgetAsPNG(chartRef: HTMLDivElement | null, title: string) {
  if (!chartRef) return;
  try {
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(chartRef, { backgroundColor: "#ffffff", pixelRatio: 2 });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${title.replace(/[^a-z0-9]/gi, "_")}.png`;
    a.click();
  } catch (e) {
    console.error("PNG export failed", e);
  }
}

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

  const renderTooltip = () => {
    if (enableAITooltips) {
      return (
        <Tooltip 
          content={(props: any) => (
            <AIInteractiveTooltip 
              {...props} 
              widgetTitle={title} 
              enableAI={true} 
            />
          )}
          wrapperStyle={{ zIndex: 100, pointerEvents: 'auto' }}
        />
      );
    }
    return (
      <Tooltip
        contentStyle={{
          backgroundColor: "hsl(var(--popover))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius)",
        }}
        labelStyle={{ color: "hsl(var(--foreground))" }}
      />
    );
  };

  const chartContent = useMemo(() => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No data available
        </div>
      );
    }

    const xKey = config.xAxis || Object.keys(data[0])[0];
    const yKey = config.yAxis || Object.keys(data[0])[1];
    const gridColor = themeVariant === 'dark' ? '#334155' : undefined;

    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              {config.showGrid !== false && (
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" stroke={gridColor} />
              )}
              <XAxis dataKey={xKey} tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              {renderTooltip()}
              {config.showLegend && <Legend />}
              <Bar dataKey={yKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              {config.showGrid !== false && (
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" stroke={gridColor} />
              )}
              <XAxis dataKey={xKey} tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              {renderTooltip()}
              {config.showLegend && <Legend />}
              <Line
                type="monotone"
                dataKey={yKey}
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ fill: colors[0], strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              {config.showGrid !== false && (
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" stroke={gridColor} />
              )}
              <XAxis dataKey={xKey} tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              {renderTooltip()}
              {config.showLegend && <Legend />}
              <Area
                type="monotone"
                dataKey={yKey}
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                dataKey={yKey}
                nameKey={xKey}
                paddingAngle={2}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              {renderTooltip()}
              {config.showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case "donut":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="80%"
                dataKey={yKey}
                nameKey={xKey}
                paddingAngle={3}
                cornerRadius={4}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              {renderTooltip()}
              {config.showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case "gauge": {
        const numValue = parseFloat(config.statValue || String(data[0]?.[yKey] ?? 0));
        const gaugeMin = config.gaugeMin ?? 0;
        const gaugeMax = config.gaugeMax ?? 100;
        const pct = Math.min(100, Math.max(0, ((numValue - gaugeMin) / (gaugeMax - gaugeMin)) * 100));
        const gaugeData = [
          { name: "value", value: pct },
          { name: "remaining", value: 100 - pct },
        ];
        const gaugeColor = pct < 33 ? "#ef4444" : pct < 66 ? "#f59e0b" : "#22c55e";
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="70%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius="60%"
                  outerRadius="90%"
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={gaugeColor} />
                  <Cell fill="hsl(var(--muted))" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center -mt-4">
              <p className="text-3xl font-bold">{numValue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {config.statLabel || xKey} ({gaugeMin} - {gaugeMax})
              </p>
            </div>
          </div>
        );
      }

      case "funnel": {
        const funnelData = data.map((d, i) => ({
          ...d,
          fill: colors[i % colors.length],
        }));
        return (
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Funnel
                dataKey={yKey}
                data={funnelData}
                isAnimationActive
                nameKey={xKey}
              >
                <LabelList position="right" fill="#888" fontSize={12} dataKey={xKey} />
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Funnel>
              {renderTooltip()}
            </FunnelChart>
          </ResponsiveContainer>
        );
      }

      case "radar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey={xKey} tick={{ fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fontSize: 10 }} />
              {renderTooltip()}
              <Radar
                dataKey={yKey}
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        );

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              {config.showGrid !== false && (
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" stroke={gridColor} />
              )}
              <XAxis dataKey={xKey} tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis dataKey={yKey} tick={{ fontSize: 12 }} className="text-muted-foreground" />
              {renderTooltip()}
              {config.showLegend && <Legend />}
              <Scatter data={data} fill={colors[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case "stat":
        const value = String(config.statValue || Object.values(data[0] || {})[0] || "");
        const label = String(config.statLabel || Object.keys(data[0] || {})[0] || "");
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-4xl font-bold tracking-tight">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
          </div>
        );

      case "table":
        if (!data[0]) return null;
        const columns = Object.keys(data[0]);
        return (
          <div className="overflow-auto h-full">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {columns.map((col) => (
                    <th key={col} className="text-left p-2 font-medium text-muted-foreground">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    {columns.map((col) => (
                      <td key={col} className="p-2">
                        {String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
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
