import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MessageSquare, Sparkles, Plus } from "lucide-react";
import { ChartWidget } from "./chart-widget";
import { apiRequest } from "@/lib/queryClient";
import type { DataSource } from "@shared/schema";

interface NLQResult {
  chartType: string;
  title: string;
  xAxis?: string;
  yAxis?: string;
  explanation?: string;
  data?: any[];
  statValue?: string;
  statLabel?: string;
  error?: string;
}

interface NLQPanelProps {
  dataSources: DataSource[];
  onAddToDashboard?: (result: NLQResult, dataSourceId: number) => void;
}

export function NLQPanel({ dataSources, onAddToDashboard }: NLQPanelProps) {
  const [question, setQuestion] = useState("");
  const [selectedSourceId, setSelectedSourceId] = useState<string>("");
  const [result, setResult] = useState<NLQResult | null>(null);

  const readySources = dataSources.filter(ds => ds.status === "ready");

  const nlqMutation = useMutation({
    mutationFn: async ({ question, dataSourceId }: { question: string; dataSourceId: number }) => {
      const res = await apiRequest("POST", "/api/ai/nlq", { question, dataSourceId });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || "Failed to process question");
      }
      const result = await res.json() as NLQResult;
      if (result.error) throw new Error(result.error);
      if (!result.data || !Array.isArray(result.data)) throw new Error("No chart data returned");
      return result;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleAsk = () => {
    if (!question.trim() || !selectedSourceId) return;
    nlqMutation.mutate({ question: question.trim(), dataSourceId: parseInt(selectedSourceId) });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const suggestions = [
    "What are the top 5 items by value?",
    "Show me the distribution breakdown",
    "What is the total across all categories?",
    "Compare the top and bottom performers",
  ];

  return (
    <div className="space-y-4" data-testid="nlq-panel">
      <div className="flex items-center gap-2 text-sm">
        <MessageSquare className="h-4 w-4 text-primary" />
        <span className="font-medium">Ask Your Data</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Select value={selectedSourceId} onValueChange={setSelectedSourceId}>
          <SelectTrigger className="w-48" data-testid="select-nlq-source">
            <SelectValue placeholder="Select data" />
          </SelectTrigger>
          <SelectContent>
            {readySources.map(ds => (
              <SelectItem key={ds.id} value={ds.id.toString()}>{ds.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Ask a question about your data..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            data-testid="input-nlq-question"
          />
        </div>

        <Button
          onClick={handleAsk}
          disabled={!question.trim() || !selectedSourceId || nlqMutation.isPending}
          data-testid="button-ask-data"
        >
          {nlqMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </Button>
      </div>

      {!result && !nlqMutation.isPending && selectedSourceId && (
        <div className="flex gap-2 flex-wrap">
          {suggestions.map((s) => (
            <Badge
              key={s}
              variant="outline"
              className="cursor-pointer text-xs"
              onClick={() => setQuestion(s)}
              data-testid={`nlq-suggestion-${s.slice(0, 10)}`}
            >
              {s}
            </Badge>
          ))}
        </div>
      )}

      {nlqMutation.isPending && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Analyzing your data...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {result && result.data && (
        <div className="space-y-3">
          {result.explanation && (
            <div className="flex items-start gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-muted-foreground">{result.explanation}</p>
            </div>
          )}
          <div className="h-[300px]">
            <ChartWidget
              id={-1}
              title={result.title || "Query Result"}
              type={result.chartType as any}
              data={result.data}
              config={{
                xAxis: result.xAxis,
                yAxis: result.yAxis,
                statValue: result.statValue,
                statLabel: result.statLabel,
              }}
              enableAITooltips={false}
            />
          </div>
          {onAddToDashboard && selectedSourceId && (
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddToDashboard(result, parseInt(selectedSourceId))}
                data-testid="button-add-nlq-to-dashboard"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add to Dashboard
              </Button>
            </div>
          )}
        </div>
      )}

      {nlqMutation.isError && (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Something went wrong. Try rephrasing your question.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
