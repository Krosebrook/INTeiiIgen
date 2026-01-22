import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LayoutTemplate,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Briefcase,
  Zap,
} from "lucide-react";
import { fadeInUp, staggerContainer, smoothTransition } from "@/lib/animations";

interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  preview: {
    widgets: { type: string; title: string }[];
    kpis: string[];
  };
}

const templates: DashboardTemplate[] = [
  {
    id: "sales-overview",
    name: "Sales Overview",
    description: "Track revenue, deals, and sales performance metrics",
    category: "Sales",
    icon: DollarSign,
    preview: {
      widgets: [
        { type: "line", title: "Revenue Trend" },
        { type: "bar", title: "Sales by Region" },
        { type: "pie", title: "Product Mix" },
        { type: "stat", title: "Conversion Rate" },
      ],
      kpis: ["Total Revenue", "Deals Closed", "Avg Deal Size", "Win Rate"],
    },
  },
  {
    id: "marketing-analytics",
    name: "Marketing Analytics",
    description: "Monitor campaigns, leads, and marketing ROI",
    category: "Marketing",
    icon: Target,
    preview: {
      widgets: [
        { type: "area", title: "Campaign Performance" },
        { type: "bar", title: "Channel Attribution" },
        { type: "pie", title: "Lead Sources" },
        { type: "line", title: "Cost per Lead" },
      ],
      kpis: ["Total Leads", "CAC", "ROAS", "Conversion Rate"],
    },
  },
  {
    id: "customer-insights",
    name: "Customer Insights",
    description: "Understand customer behavior and satisfaction",
    category: "Customer Success",
    icon: Users,
    preview: {
      widgets: [
        { type: "line", title: "Customer Growth" },
        { type: "pie", title: "Segment Distribution" },
        { type: "bar", title: "NPS by Product" },
        { type: "area", title: "Churn Trend" },
      ],
      kpis: ["Total Customers", "NPS Score", "Churn Rate", "LTV"],
    },
  },
  {
    id: "ecommerce-dashboard",
    name: "E-commerce Dashboard",
    description: "Track orders, inventory, and customer metrics",
    category: "E-commerce",
    icon: ShoppingCart,
    preview: {
      widgets: [
        { type: "line", title: "Daily Orders" },
        { type: "bar", title: "Top Products" },
        { type: "pie", title: "Category Sales" },
        { type: "area", title: "Revenue Trend" },
      ],
      kpis: ["Orders Today", "Revenue", "AOV", "Cart Abandonment"],
    },
  },
  {
    id: "operations-kpi",
    name: "Operations KPI",
    description: "Monitor operational efficiency and performance",
    category: "Operations",
    icon: Activity,
    preview: {
      widgets: [
        { type: "bar", title: "Throughput by Team" },
        { type: "line", title: "Processing Time" },
        { type: "pie", title: "Resource Allocation" },
        { type: "stat", title: "Uptime" },
      ],
      kpis: ["Throughput", "Efficiency", "SLA Compliance", "Utilization"],
    },
  },
  {
    id: "executive-summary",
    name: "Executive Summary",
    description: "High-level business metrics for leadership",
    category: "Executive",
    icon: Briefcase,
    preview: {
      widgets: [
        { type: "area", title: "Revenue & Profit" },
        { type: "bar", title: "Department Performance" },
        { type: "pie", title: "Cost Breakdown" },
        { type: "line", title: "Growth Trend" },
      ],
      kpis: ["Revenue", "Profit Margin", "Headcount", "YoY Growth"],
    },
  },
];

const widgetIcons: Record<string, any> = {
  line: LineChart,
  bar: BarChart3,
  pie: PieChart,
  area: TrendingUp,
  stat: Zap,
};

interface TemplateGalleryProps {
  onSelectTemplate: (template: DashboardTemplate) => void;
}

export function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" data-testid="button-open-templates">
          <LayoutTemplate className="h-4 w-4" />
          Browse Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-template-gallery">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" data-testid="title-template-gallery">
            <LayoutTemplate className="h-5 w-5" />
            Dashboard Templates
          </DialogTitle>
          <DialogDescription data-testid="description-template-gallery">
            Choose a pre-built template to quickly create a dashboard tailored to your needs
          </DialogDescription>
        </DialogHeader>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
        >
          {templates.map((template) => {
            const TemplateIcon = template.icon;
            return (
              <motion.div key={template.id} variants={fadeInUp}>
                <Card
                  className="hover-elevate cursor-pointer transition-all"
                  onClick={() => onSelectTemplate(template)}
                  data-testid={`template-${template.id}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <TemplateIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base" data-testid={`text-template-name-${template.id}`}>{template.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1 text-xs" data-testid={`badge-category-${template.id}`}>
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="mt-2">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">KPIs included:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.preview.kpis.map((kpi) => (
                            <Badge key={kpi} variant="outline" className="text-xs">
                              {kpi}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Widgets:</p>
                        <div className="flex gap-2">
                          {template.preview.widgets.map((widget, index) => {
                            const WidgetIcon = widgetIcons[widget.type] || BarChart3;
                            return (
                              <div
                                key={index}
                                className="p-1.5 rounded bg-muted"
                                title={widget.title}
                              >
                                <WidgetIcon className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

export { templates };
export type { DashboardTemplate };
