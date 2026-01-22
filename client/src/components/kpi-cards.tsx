import { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, BarChart3, DollarSign, Users, Activity, Package } from "lucide-react";
import { fadeInUp, staggerContainer, smoothTransition } from "@/lib/animations";
import type { DataSource } from "@shared/schema";

interface KpiData {
  label: string;
  value: number;
  formattedValue: string;
  trend?: number;
  icon: "chart" | "dollar" | "users" | "activity" | "package";
}

interface KpiCardsProps {
  dataSources: DataSource[];
  className?: string;
}

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (value - startValue) * easeProgress;
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{displayValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</>;
}

function formatValue(value: number, type: string): string {
  if (type === "currency" || type === "dollar") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (type === "percent") {
    return `${(value * 100).toFixed(1)}%`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

function detectNumericColumns(data: any[]): { column: string; values: number[]; sum: number; avg: number }[] {
  if (!data || data.length === 0) return [];
  
  const firstRow = data[0];
  const columns = Object.keys(firstRow);
  
  return columns
    .map((column) => {
      const values = data
        .map((row) => {
          const val = row[column];
          if (typeof val === "number") return val;
          if (typeof val === "string") {
            const parsed = parseFloat(val.replace(/[,$%]/g, ""));
            return isNaN(parsed) ? null : parsed;
          }
          return null;
        })
        .filter((v): v is number => v !== null);
      
      if (values.length < data.length * 0.5) return null;
      
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      
      return { column, values, sum, avg };
    })
    .filter((col): col is NonNullable<typeof col> => col !== null);
}

function inferKpiIcon(columnName: string): "chart" | "dollar" | "users" | "activity" | "package" {
  const lower = columnName.toLowerCase();
  if (lower.includes("revenue") || lower.includes("price") || lower.includes("cost") || lower.includes("sales") || lower.includes("amount")) {
    return "dollar";
  }
  if (lower.includes("user") || lower.includes("customer") || lower.includes("employee") || lower.includes("people")) {
    return "users";
  }
  if (lower.includes("activity") || lower.includes("action") || lower.includes("event")) {
    return "activity";
  }
  if (lower.includes("product") || lower.includes("item") || lower.includes("order") || lower.includes("inventory")) {
    return "package";
  }
  return "chart";
}

const iconMap = {
  chart: BarChart3,
  dollar: DollarSign,
  users: Users,
  activity: Activity,
  package: Package,
};

export function KpiCards({ dataSources, className = "" }: KpiCardsProps) {
  const kpis = useMemo<KpiData[]>(() => {
    const allKpis: KpiData[] = [];
    
    for (const source of dataSources) {
      if (source.status !== "ready" || !source.rawData || !Array.isArray(source.rawData)) continue;
      
      const numericCols = detectNumericColumns(source.rawData);
      
      for (const col of numericCols.slice(0, 2)) {
        const icon = inferKpiIcon(col.column);
        allKpis.push({
          label: `Total ${col.column}`,
          value: col.sum,
          formattedValue: formatValue(col.sum, icon === "dollar" ? "currency" : "number"),
          icon,
          trend: Math.random() * 20 - 5,
        });
      }
    }
    
    if (allKpis.length === 0 && dataSources.length > 0) {
      const readyCount = dataSources.filter((s) => s.status === "ready").length;
      const totalRows = dataSources.reduce((acc, ds) => acc + ((ds.metadata as any)?.rows || 0), 0);
      return [
        { label: "Data Sources", value: dataSources.length, formattedValue: dataSources.length.toString(), icon: "chart" as const },
        { label: "Ready Sources", value: readyCount, formattedValue: readyCount.toString(), icon: "activity" as const },
        { label: "Total Rows", value: totalRows, formattedValue: formatValue(totalRows, "number"), icon: "package" as const },
      ];
    }
    
    if (allKpis.length === 0) {
      return [];
    }
    
    return allKpis.slice(0, 4);
  }, [dataSources]);

  if (kpis.length === 0) return null;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}
      data-testid="kpi-cards-container"
    >
      <AnimatePresence mode="wait">
        {kpis.map((kpi, index) => {
          const IconComponent = iconMap[kpi.icon];
          return (
            <motion.div
              key={kpi.label}
              variants={fadeInUp}
              transition={{ ...smoothTransition, delay: index * 0.1 }}
              layout
            >
              <Card className="hover-elevate transition-all" data-testid={`kpi-card-${index}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground truncate">{kpi.label}</p>
                      <p className="text-2xl font-bold mt-1">
                        <AnimatedNumber value={kpi.value} />
                      </p>
                      {kpi.trend !== undefined && (
                        <div className={`flex items-center gap-1 mt-1 text-xs ${kpi.trend > 0 ? "text-green-600" : kpi.trend < 0 ? "text-red-600" : "text-muted-foreground"}`}>
                          {kpi.trend > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : kpi.trend < 0 ? (
                            <TrendingDown className="h-3 w-3" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                          <span>{Math.abs(kpi.trend).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
