import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, RefreshCw, Check, Lightbulb, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";

interface AISuggestion {
  id: string;
  title: string;
  description?: string;
  value: any;
  confidence?: 'high' | 'medium' | 'low';
}

interface AISuggestionsProps {
  type: 'dashboard' | 'widget' | 'upload' | 'chart-type' | 'field-mapping';
  context?: {
    dataSourceNames?: string[];
    columns?: string[];
    dataPreview?: any[];
    existingTitle?: string;
    chartType?: string;
  };
  onSelectSuggestion: (suggestion: AISuggestion) => void;
  compact?: boolean;
}

export function AISuggestions({ type, context, onSelectSuggestion, compact = false }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/ai/suggestions', {
        type,
        context,
      });
      const result = await response.json();
      if (result.suggestions && Array.isArray(result.suggestions)) {
        setSuggestions(result.suggestions);
      } else {
        setSuggestions(getFallbackSuggestions(type, context));
      }
    } catch {
      setSuggestions(getFallbackSuggestions(type, context));
    } finally {
      setLoading(false);
      setHasGenerated(true);
    }
  };

  const handleSelect = (suggestion: AISuggestion) => {
    onSelectSuggestion(suggestion);
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {!hasGenerated ? (
          <Button
            variant="outline"
            size="sm"
            onClick={generateSuggestions}
            disabled={loading}
            className="w-full gap-2 border-dashed"
            data-testid="button-ai-suggest"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Get AI Suggestions
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                AI Suggestions
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={generateSuggestions}
                disabled={loading}
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2"
              >
                {suggestions.map((suggestion) => (
                  <Badge
                    key={suggestion.id}
                    variant="secondary"
                    className="cursor-pointer hover-elevate gap-1 pr-1"
                    onClick={() => handleSelect(suggestion)}
                    data-testid={`badge-suggestion-${suggestion.id}`}
                  >
                    {suggestion.title}
                    <ChevronRight className="h-3 w-3" />
                  </Badge>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm">AI Suggestions</CardTitle>
              <CardDescription className="text-xs">Best practices based on your data</CardDescription>
            </div>
          </div>
          {hasGenerated && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={generateSuggestions}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasGenerated ? (
          <Button
            onClick={generateSuggestions}
            disabled={loading}
            className="w-full gap-2"
            data-testid="button-generate-suggestions"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate AI Suggestions
          </Button>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              {suggestions.map((suggestion, idx) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg bg-background border hover-elevate cursor-pointer group"
                  onClick={() => handleSelect(suggestion)}
                  data-testid={`card-suggestion-${suggestion.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{suggestion.title}</span>
                      {suggestion.confidence && (
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] ${
                            suggestion.confidence === 'high' ? 'border-green-500 text-green-600' :
                            suggestion.confidence === 'medium' ? 'border-yellow-500 text-yellow-600' :
                            'border-muted text-muted-foreground'
                          }`}
                        >
                          {suggestion.confidence}
                        </Badge>
                      )}
                    </div>
                    {suggestion.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {suggestion.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}

function getFallbackSuggestions(type: string, context?: AISuggestionsProps['context']): AISuggestion[] {
  switch (type) {
    case 'dashboard':
      const dataNames = context?.dataSourceNames?.join(', ') || 'Data';
      return [
        { 
          id: 'exec-overview', 
          title: `${dataNames} Executive Overview`, 
          description: 'High-level KPIs and trends for executive reporting',
          value: { title: `${dataNames} Executive Overview`, description: 'Executive dashboard with key metrics and trends' },
          confidence: 'high'
        },
        { 
          id: 'performance', 
          title: `${dataNames} Performance Dashboard`, 
          description: 'Track performance metrics and identify areas for improvement',
          value: { title: `${dataNames} Performance Dashboard`, description: 'Monitor key performance indicators' },
          confidence: 'high'
        },
        { 
          id: 'analytics', 
          title: `${dataNames} Analytics Hub`, 
          description: 'Deep dive into data patterns and insights',
          value: { title: `${dataNames} Analytics Hub`, description: 'Comprehensive analytics and reporting' },
          confidence: 'medium'
        },
      ];

    case 'widget':
    case 'chart-type':
      const cols = context?.columns || [];
      const hasNumeric = cols.some(c => ['value', 'amount', 'count', 'total', 'price', 'revenue', 'sales'].some(n => c.toLowerCase().includes(n)));
      const hasTime = cols.some(c => ['date', 'time', 'month', 'year', 'day', 'week'].some(n => c.toLowerCase().includes(n)));
      
      const suggestions: AISuggestion[] = [];
      if (hasTime && hasNumeric) {
        suggestions.push({
          id: 'line-trend',
          title: 'Line Chart - Trend Over Time',
          description: 'Best for showing how values change over time periods',
          value: { type: 'line', title: 'Trend Analysis' },
          confidence: 'high'
        });
        suggestions.push({
          id: 'area-trend',
          title: 'Area Chart - Cumulative View',
          description: 'Shows volume and trends with filled areas',
          value: { type: 'area', title: 'Volume Over Time' },
          confidence: 'medium'
        });
      }
      if (hasNumeric) {
        suggestions.push({
          id: 'bar-compare',
          title: 'Bar Chart - Compare Categories',
          description: 'Perfect for comparing values across categories',
          value: { type: 'bar', title: 'Comparison View' },
          confidence: 'high'
        });
      }
      if (cols.length <= 5) {
        suggestions.push({
          id: 'pie-dist',
          title: 'Pie Chart - Distribution',
          description: 'Show how parts relate to the whole',
          value: { type: 'pie', title: 'Distribution Breakdown' },
          confidence: cols.length <= 3 ? 'high' : 'medium'
        });
      }
      return suggestions.length > 0 ? suggestions : [
        { id: 'bar', title: 'Bar Chart', description: 'Versatile chart for most data types', value: { type: 'bar' }, confidence: 'medium' },
        { id: 'line', title: 'Line Chart', description: 'Great for trends and sequences', value: { type: 'line' }, confidence: 'medium' },
      ];

    case 'field-mapping':
      const columns = context?.columns || [];
      const xCandidates = columns.filter(c => 
        ['name', 'category', 'date', 'month', 'label', 'type'].some(n => c.toLowerCase().includes(n))
      );
      const yCandidates = columns.filter(c => 
        ['value', 'amount', 'count', 'total', 'price', 'revenue', 'sales', 'quantity'].some(n => c.toLowerCase().includes(n))
      );
      return [
        {
          id: 'auto-mapping',
          title: 'Smart Mapping',
          description: `X: ${xCandidates[0] || columns[0] || 'name'} → Y: ${yCandidates[0] || columns[1] || 'value'}`,
          value: { xAxis: xCandidates[0] || columns[0], yAxis: yCandidates[0] || columns[1] },
          confidence: 'high'
        }
      ];

    case 'upload':
      return [
        { 
          id: 'create-dashboard', 
          title: 'Create Dashboard', 
          description: 'Build an interactive dashboard from your data',
          value: { action: 'dashboard' },
          confidence: 'high'
        },
        { 
          id: 'analyze', 
          title: 'AI Analysis', 
          description: 'Get AI-powered insights and patterns',
          value: { action: 'analyze' },
          confidence: 'high'
        },
        { 
          id: 'visualize', 
          title: 'Quick Visualization', 
          description: 'Create a single chart from your data',
          value: { action: 'visualize' },
          confidence: 'medium'
        },
      ];

    default:
      return [];
  }
}
