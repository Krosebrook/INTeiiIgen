import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LayoutTemplate, Check, BarChart3, PieChart, TrendingUp, Table2, Activity } from "lucide-react";
import { useState } from "react";

export interface LayoutTemplateConfig {
  id: string;
  name: string;
  description: string;
  icon: typeof BarChart3;
  widgets: {
    type: 'bar' | 'line' | 'pie' | 'area' | 'stat' | 'table';
    title: string;
    gridColumn?: string;
    gridRow?: string;
    defaultData?: Array<{ name: string; value: number }>;
  }[];
  gridColumns: number;
}

export const layoutTemplates: LayoutTemplateConfig[] = [
  {
    id: 'executive-overview',
    name: 'Executive Overview',
    description: 'High-level KPIs with trends and a summary table',
    icon: TrendingUp,
    gridColumns: 4,
    widgets: [
      { type: 'stat', title: 'Total Revenue', gridColumn: 'span 1', defaultData: [{ name: 'Revenue', value: 125000 }] },
      { type: 'stat', title: 'Active Users', gridColumn: 'span 1', defaultData: [{ name: 'Users', value: 8420 }] },
      { type: 'stat', title: 'Conversion Rate', gridColumn: 'span 1', defaultData: [{ name: 'Rate', value: 4.2 }] },
      { type: 'stat', title: 'Avg Order Value', gridColumn: 'span 1', defaultData: [{ name: 'AOV', value: 89 }] },
      { type: 'line', title: 'Revenue Trend', gridColumn: 'span 2', defaultData: [
        { name: 'Jan', value: 65000 }, { name: 'Feb', value: 72000 }, { name: 'Mar', value: 81000 },
        { name: 'Apr', value: 78000 }, { name: 'May', value: 92000 }, { name: 'Jun', value: 105000 }
      ]},
      { type: 'bar', title: 'Sales by Region', gridColumn: 'span 2', defaultData: [
        { name: 'North', value: 42000 }, { name: 'South', value: 31000 }, { name: 'East', value: 28000 }, { name: 'West', value: 24000 }
      ]},
    ],
  },
  {
    id: 'sales-performance',
    name: 'Sales Performance',
    description: 'Track sales metrics with breakdowns by category',
    icon: BarChart3,
    gridColumns: 3,
    widgets: [
      { type: 'bar', title: 'Monthly Sales', gridColumn: 'span 2', defaultData: [
        { name: 'Jan', value: 45000 }, { name: 'Feb', value: 52000 }, { name: 'Mar', value: 48000 },
        { name: 'Apr', value: 61000 }, { name: 'May', value: 55000 }, { name: 'Jun', value: 67000 }
      ]},
      { type: 'pie', title: 'Sales by Category', gridColumn: 'span 1', defaultData: [
        { name: 'Electronics', value: 35 }, { name: 'Clothing', value: 28 }, { name: 'Home', value: 22 }, { name: 'Other', value: 15 }
      ]},
      { type: 'stat', title: 'Total Sales', gridColumn: 'span 1', defaultData: [{ name: 'Sales', value: 328000 }] },
      { type: 'area', title: 'Daily Revenue', gridColumn: 'span 2', defaultData: [
        { name: 'Mon', value: 4200 }, { name: 'Tue', value: 5100 }, { name: 'Wed', value: 4800 },
        { name: 'Thu', value: 6200 }, { name: 'Fri', value: 5800 }, { name: 'Sat', value: 7100 }, { name: 'Sun', value: 4500 }
      ]},
    ],
  },
  {
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    description: 'Website and user analytics with engagement metrics',
    icon: Activity,
    gridColumns: 3,
    widgets: [
      { type: 'stat', title: 'Page Views', gridColumn: 'span 1', defaultData: [{ name: 'Views', value: 142500 }] },
      { type: 'stat', title: 'Bounce Rate', gridColumn: 'span 1', defaultData: [{ name: 'Bounce', value: 32 }] },
      { type: 'stat', title: 'Session Duration', gridColumn: 'span 1', defaultData: [{ name: 'Duration', value: 245 }] },
      { type: 'line', title: 'Traffic Over Time', gridColumn: 'span 2', defaultData: [
        { name: 'Week 1', value: 12000 }, { name: 'Week 2', value: 15000 }, { name: 'Week 3', value: 18000 },
        { name: 'Week 4', value: 22000 }
      ]},
      { type: 'pie', title: 'Traffic Sources', gridColumn: 'span 1', defaultData: [
        { name: 'Organic', value: 45 }, { name: 'Direct', value: 25 }, { name: 'Referral', value: 18 }, { name: 'Social', value: 12 }
      ]},
    ],
  },
  {
    id: 'data-table-focus',
    name: 'Data Table Focus',
    description: 'Detailed data view with supporting charts',
    icon: Table2,
    gridColumns: 2,
    widgets: [
      { type: 'table', title: 'Recent Transactions', gridColumn: 'span 2', defaultData: [
        { name: 'Order #1001', value: 125 }, { name: 'Order #1002', value: 89 }, { name: 'Order #1003', value: 234 },
        { name: 'Order #1004', value: 156 }, { name: 'Order #1005', value: 78 }
      ]},
      { type: 'bar', title: 'Transaction Volume', gridColumn: 'span 1', defaultData: [
        { name: 'Mon', value: 42 }, { name: 'Tue', value: 38 }, { name: 'Wed', value: 55 }, { name: 'Thu', value: 48 }, { name: 'Fri', value: 62 }
      ]},
      { type: 'stat', title: 'Total Value', gridColumn: 'span 1', defaultData: [{ name: 'Value', value: 45280 }] },
    ],
  },
  {
    id: 'comparison-view',
    name: 'Comparison View',
    description: 'Compare metrics side by side with pie breakdowns',
    icon: PieChart,
    gridColumns: 2,
    widgets: [
      { type: 'bar', title: 'This Month vs Last Month', gridColumn: 'span 2', defaultData: [
        { name: 'Revenue', value: 92000 }, { name: 'Expenses', value: 45000 }, { name: 'Profit', value: 47000 }
      ]},
      { type: 'pie', title: 'Expense Breakdown', gridColumn: 'span 1', defaultData: [
        { name: 'Operations', value: 40 }, { name: 'Marketing', value: 25 }, { name: 'Salaries', value: 30 }, { name: 'Other', value: 5 }
      ]},
      { type: 'pie', title: 'Revenue Sources', gridColumn: 'span 1', defaultData: [
        { name: 'Product A', value: 45 }, { name: 'Product B', value: 30 }, { name: 'Services', value: 25 }
      ]},
    ],
  },
];

interface LayoutTemplatesDialogProps {
  onSelectTemplate: (template: LayoutTemplateConfig) => void;
  trigger?: React.ReactNode;
}

export function LayoutTemplatesDialog({ onSelectTemplate, trigger }: LayoutTemplatesDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (template: LayoutTemplateConfig) => {
    setSelectedId(template.id);
    onSelectTemplate(template);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2" data-testid="button-layout-templates">
            <LayoutTemplate className="h-4 w-4" />
            Templates
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dashboard Templates</DialogTitle>
          <DialogDescription>
            Choose a pre-built layout to get started quickly. You can customize it after applying.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {layoutTemplates.map((template) => {
            const Icon = template.icon;
            const isSelected = selectedId === template.id;
            return (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all hover-elevate ${isSelected ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleSelect(template)}
                data-testid={`card-template-${template.id}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription className="text-xs">{template.widgets.length} widgets</CardDescription>
                      </div>
                    </div>
                    {isSelected && <Check className="h-5 w-5 text-primary" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {template.widgets.slice(0, 4).map((w, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-muted rounded-full capitalize">
                        {w.type}
                      </span>
                    ))}
                    {template.widgets.length > 4 && (
                      <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full">
                        +{template.widgets.length - 4} more
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
