import { FileSpreadsheet, FileText, Image, Globe, Database, Cloud, MoreHorizontal, Trash2, Eye, Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DataSource } from "@shared/schema";

interface DataSourceCardProps {
  dataSource: DataSource;
  onView?: () => void;
  onDelete?: () => void;
  onAnalyze?: () => void;
}

const getIcon = (type: string, fileType?: string | null) => {
  if (type === "url") return Globe;
  if (type === "database") return Database;
  if (type === "google_drive" || type === "onedrive" || type === "notion") return Cloud;
  
  if (fileType === "csv" || fileType === "xlsx" || fileType === "xls") return FileSpreadsheet;
  if (fileType === "png" || fileType === "jpg" || fileType === "jpeg") return Image;
  return FileText;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "ready":
      return "bg-green-500/10 text-green-600 dark:text-green-400";
    case "processing":
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
    case "error":
      return "bg-red-500/10 text-red-600 dark:text-red-400";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
};

export function DataSourceCard({
  dataSource,
  onView,
  onDelete,
  onAnalyze,
}: DataSourceCardProps) {
  const Icon = getIcon(dataSource.type, dataSource.fileType);
  const metadata = dataSource.metadata as { rows?: number; columns?: number; size?: number } | null;

  return (
    <Card className="hover-elevate transition-all" data-testid={`data-source-${dataSource.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{dataSource.name}</CardTitle>
              <CardDescription className="text-xs">
                {formatDate(dataSource.createdAt)}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-source-menu-${dataSource.id}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={onView}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Data
                </DropdownMenuItem>
              )}
              {onAnalyze && (
                <DropdownMenuItem onClick={onAnalyze}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Analysis
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-xs capitalize">
            {dataSource.type.replace("_", " ")}
          </Badge>
          {dataSource.fileType && (
            <Badge variant="outline" className="text-xs uppercase">
              {dataSource.fileType}
            </Badge>
          )}
          <Badge className={`text-xs ${getStatusColor(dataSource.status)}`}>
            {dataSource.status === "processing" && (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            )}
            {dataSource.status}
          </Badge>
        </div>
        {metadata && (
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            {metadata.rows !== undefined && (
              <span>{metadata.rows.toLocaleString()} rows</span>
            )}
            {metadata.columns !== undefined && (
              <span>{metadata.columns} columns</span>
            )}
            {metadata.size !== undefined && (
              <span>{(metadata.size / 1024).toFixed(1)} KB</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
