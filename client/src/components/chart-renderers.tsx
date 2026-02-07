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
import { AIInteractiveTooltip } from "@/components/ai-interactive-tooltip";

export function renderChart(params: {
  type: string;
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
  colors: string[];
  themeVariant: string;
  enableAITooltips: boolean;
  title: string;
}): JSX.Element | null {
  const { type, data, config, colors, themeVariant, enableAITooltips, title } = params;

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
}
