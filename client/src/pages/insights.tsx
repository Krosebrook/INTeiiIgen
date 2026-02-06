import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Loader2, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOnboarding } from "@/hooks/use-onboarding";
import type { AiAnalysis, DataSource } from "@shared/schema";

interface AnalysisWithSource extends AiAnalysis {
  dataSource?: DataSource;
}

export default function InsightsPage() {
  const { completeChecklistItem } = useOnboarding();
  const { data: analyses, isLoading } = useQuery<AnalysisWithSource[]>({
    queryKey: ["/api/ai-analyses"],
  });

  useEffect(() => {
    completeChecklistItem("explore-insights");
  }, [completeChecklistItem]);

  const getIcon = (type: string) => {
    switch (type) {
      case "trends":
        return TrendingUp;
      case "anomalies":
        return AlertTriangle;
      case "recommendations":
        return Lightbulb;
      default:
        return Sparkles;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "trends":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "anomalies":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
      case "recommendations":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      default:
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-insights-heading">AI Insights</h1>
        <p className="text-muted-foreground">
          AI-generated analyses and recommendations from your data sources.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : analyses && analyses.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {analyses.map((analysis) => {
            const Icon = getIcon(analysis.analysisType);
            const result = analysis.result as { title?: string; content?: string; items?: string[] };
            
            return (
              <Card key={analysis.id} className="hover-elevate transition-all" data-testid={`analysis-${analysis.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getTypeColor(analysis.analysisType)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {result.title || `${analysis.analysisType} Analysis`}
                        </CardTitle>
                        {analysis.dataSource && (
                          <CardDescription className="text-xs">
                            {analysis.dataSource.name}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="capitalize text-xs">
                      {analysis.analysisType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {result.content && (
                    <p className="text-sm text-muted-foreground mb-3">{result.content}</p>
                  )}
                  {result.items && result.items.length > 0 && (
                    <ul className="text-sm space-y-1">
                      {result.items.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                      {result.items.length > 3 && (
                        <li className="text-xs text-muted-foreground">
                          +{result.items.length - 3} more insights
                        </li>
                      )}
                    </ul>
                  )}
                  <p className="text-xs text-muted-foreground mt-3">
                    {formatDate(analysis.createdAt)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No insights yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              AI insights are generated when you analyze your data sources.
              Go to Data Sources and click "AI Analysis" on any source.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
