import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Hash,
  Type,
  Calendar,
  Loader2,
  BarChart3,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";
import type { DataSource } from "@shared/schema";

interface ColumnProfile {
  name: string;
  type: "number" | "text" | "date";
  nullCount: number;
  nullPct: number;
  uniqueCount: number;
  totalCount: number;
  min?: number;
  max?: number;
  avg?: number;
  sum?: number;
  topValues?: { value: string; count: number }[];
}

interface DataProfile {
  columns: ColumnProfile[];
  rowCount: number;
  sampleRows: Record<string, any>[];
}

const typeIcons = {
  number: Hash,
  text: Type,
  date: Calendar,
};

const typeColors = {
  number: "text-blue-600 dark:text-blue-400",
  text: "text-emerald-600 dark:text-emerald-400",
  date: "text-orange-600 dark:text-orange-400",
};

interface DataExplorerProps {
  dataSource: DataSource;
  onCreateWidget?: () => void;
}

export function DataExplorer({ dataSource, onCreateWidget }: DataExplorerProps) {
  const [expandedCol, setExpandedCol] = useState<string | null>(null);
  const [showAllRows, setShowAllRows] = useState(false);

  const { data: profile, isLoading } = useQuery<DataProfile>({
    queryKey: ["/api/data-sources", dataSource.id, "profile"],
    queryFn: async () => {
      const res = await fetch(`/api/data-sources/${dataSource.id}/profile`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load profile");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile || profile.columns.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Eye className="h-8 w-8 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No structured data available to explore.</p>
        </CardContent>
      </Card>
    );
  }

  const numericCols = profile.columns.filter(c => c.type === "number");
  const textCols = profile.columns.filter(c => c.type === "text");
  const dateCols = profile.columns.filter(c => c.type === "date");
  const rawData = dataSource.rawData as Record<string, any>[] | undefined;
  const displayRows = showAllRows ? rawData?.slice(0, 100) : rawData?.slice(0, 20);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card data-testid="stat-rows">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold">{profile.rowCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Rows</p>
          </CardContent>
        </Card>
        <Card data-testid="stat-columns">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold">{profile.columns.length}</p>
            <p className="text-xs text-muted-foreground">Columns</p>
          </CardContent>
        </Card>
        <Card data-testid="stat-numeric-cols">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold">{numericCols.length}</p>
            <p className="text-xs text-muted-foreground">Numeric</p>
          </CardContent>
        </Card>
        <Card data-testid="stat-text-cols">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold">{textCols.length + dateCols.length}</p>
            <p className="text-xs text-muted-foreground">Text / Date</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Column Profiles</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {profile.columns.map(col => {
            const Icon = typeIcons[col.type];
            const colorClass = typeColors[col.type];
            const isExpanded = expandedCol === col.name;
            const completeness = 100 - col.nullPct;

            return (
              <Card
                key={col.name}
                className="cursor-pointer"
                onClick={() => setExpandedCol(isExpanded ? null : col.name)}
                data-testid={`col-profile-${col.name}`}
              >
                <CardContent className="pt-4 pb-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className={`h-4 w-4 shrink-0 ${colorClass}`} />
                      <span className="text-sm font-medium truncate">{col.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        {col.type}
                      </Badge>
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Completeness</span>
                      <span>{completeness}%</span>
                    </div>
                    <Progress value={completeness} className="h-1.5" />
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{col.uniqueCount} unique</span>
                    <span>{col.nullCount} missing</span>
                  </div>

                  {isExpanded && (
                    <div className="pt-2 border-t space-y-2 text-xs">
                      {col.type === "number" && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-muted-foreground">Min</span>
                            <p className="font-mono font-medium">{col.min?.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Max</span>
                            <p className="font-mono font-medium">{col.max?.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg</span>
                            <p className="font-mono font-medium">{col.avg?.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Sum</span>
                            <p className="font-mono font-medium">{col.sum?.toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                      {col.topValues && col.topValues.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Top Values</span>
                          <div className="mt-1 space-y-1">
                            {col.topValues.slice(0, 5).map(tv => (
                              <div key={tv.value} className="flex justify-between items-center">
                                <span className="truncate max-w-[60%]">{tv.value}</span>
                                <span className="text-muted-foreground">{tv.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {rawData && rawData.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <h3 className="text-sm font-semibold">Data Preview</h3>
            <div className="flex items-center gap-2">
              {rawData.length > 20 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); setShowAllRows(!showAllRows); }}
                  data-testid="button-toggle-rows"
                >
                  {showAllRows ? "Show Less" : `Show More (${Math.min(rawData.length, 100)} rows)`}
                </Button>
              )}
              {onCreateWidget && (
                <Button
                  size="sm"
                  onClick={onCreateWidget}
                  data-testid="button-create-widget-from-explorer"
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Create Chart
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {profile.columns.map(col => {
                      const Icon = typeIcons[col.type];
                      return (
                        <TableHead key={col.name} className="whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Icon className={`h-3 w-3 ${typeColors[col.type]}`} />
                            {col.name}
                          </div>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayRows?.map((row, i) => (
                    <TableRow key={i}>
                      {profile.columns.map(col => (
                        <TableCell key={col.name} className="whitespace-nowrap max-w-[200px] truncate font-mono text-xs">
                          {row[col.name] !== null && row[col.name] !== undefined ? String(row[col.name]) : "—"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
