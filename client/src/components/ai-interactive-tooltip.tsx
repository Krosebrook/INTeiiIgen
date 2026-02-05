import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, X, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

interface AIInteractiveTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
    fill?: string;
  }>;
  label?: string;
  widgetTitle?: string;
  enableAI?: boolean;
}

export function AIInteractiveTooltip({ 
  active, 
  payload, 
  label, 
  widgetTitle,
  enableAI = true 
}: AIInteractiveTooltipProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const getDeepInsight = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!payload || payload.length === 0) return;
    setLoadingInsight(true);
    
    try {
      const response = await apiRequest('/api/ai/tooltip-insight', 'POST', {
        label,
        value: payload[0].value,
        widgetTitle,
        dataName: payload[0].name,
      });
      const result = await response.json();
      setInsight(result.insight || "Interesting data point worth investigating.");
    } catch {
      const value = payload[0].value;
      const trend = value > 50 ? "above average" : "below average";
      setInsight(`This ${label} value of ${value.toLocaleString()} is ${trend}. Consider analyzing seasonal patterns and external factors that may influence this metric.`);
    } finally {
      setLoadingInsight(false);
    }
  };

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const mainValue = payload[0].value;
  const isPositive = mainValue > 0;

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className="bg-popover p-4 rounded-xl shadow-xl border border-border min-w-[220px] z-50"
      style={{ pointerEvents: enableAI ? 'auto' : 'none' }}
    >
      <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {widgetTitle || 'Data Point'}
          </span>
          {enableAI && (
            <span className="bg-primary text-[8px] text-primary-foreground px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tight">
              AI
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="w-3 h-3 text-green-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-500" />
          )}
        </div>
      </div>

      <p className="text-sm font-bold text-foreground mb-2">{label}</p>
      
      <div className="space-y-2 mb-3">
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: item.color || item.fill || 'hsl(var(--primary))' }} 
              />
              <span className="text-xs font-medium text-muted-foreground">{item.name}</span>
            </div>
            <span className="text-sm font-bold text-primary">
              {item.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {enableAI && (
        <div className="mt-3 pt-3 border-t border-border">
          <AnimatePresence mode="wait">
            {insight ? (
              <motion.div 
                key="insight"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs leading-relaxed text-muted-foreground italic font-medium bg-muted/50 p-3 rounded-lg relative"
              >
                <button 
                  onClick={() => setInsight(null)} 
                  className="absolute -top-1 -right-1 p-1 bg-background rounded-full shadow-sm border"
                >
                  <X className="w-2 h-2" />
                </button>
                <Sparkles className="w-3 h-3 text-primary inline mr-1" />
                {insight}
              </motion.div>
            ) : (
              <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button 
                  onClick={getDeepInsight}
                  disabled={loadingInsight}
                  size="sm"
                  className="w-full gap-2"
                  data-testid="button-explore-insight"
                >
                  {loadingInsight ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  Explore AI Insight
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
