import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BarChart3,
  LineChart,
  PieChart,
  AreaChart,
  ScatterChart,
  Table,
  Hash,
  FileText,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { DataSource } from "@shared/schema";

const widgetTypes = [
  { id: "bar", name: "Bar Chart", icon: BarChart3, description: "Compare values across categories" },
  { id: "line", name: "Line Chart", icon: LineChart, description: "Show trends over time" },
  { id: "area", name: "Area Chart", icon: AreaChart, description: "Display cumulative trends" },
  { id: "pie", name: "Pie Chart", icon: PieChart, description: "Show proportions of a whole" },
  { id: "scatter", name: "Scatter Plot", icon: ScatterChart, description: "Visualize correlations" },
  { id: "table", name: "Data Table", icon: Table, description: "Display raw data in rows" },
  { id: "stat", name: "Stat Card", icon: Hash, description: "Highlight a single metric" },
];

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Chart type is required"),
  dataSourceId: z.number().optional(),
  xAxis: z.string().optional(),
  yAxis: z.string().optional(),
  aggregation: z.enum(["sum", "avg", "count", "min", "max"]).optional(),
  showLegend: z.boolean().default(true),
  showGrid: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface WidgetCreatorProps {
  dataSources: DataSource[];
  onCreateWidget: (data: FormValues) => void;
  onCancel: () => void;
}

export function WidgetCreator({ dataSources, onCreateWidget, onCancel }: WidgetCreatorProps) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "",
      showLegend: true,
      showGrid: true,
    },
  });

  const selectedDataSource = dataSources.find(
    (ds) => ds.id === form.watch("dataSourceId")
  );
  const columns = selectedDataSource?.rawData
    ? Object.keys((selectedDataSource.rawData as any[])[0] || {})
    : [];

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    form.setValue("type", typeId);
    setStep(2);
  };

  const handleSubmit = (data: FormValues) => {
    onCreateWidget(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            1
          </div>
          <span className={step >= 1 ? "font-medium" : "text-muted-foreground"}>Type</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            2
          </div>
          <span className={step >= 2 ? "font-medium" : "text-muted-foreground"}>Configure</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            3
          </div>
          <span className={step >= 3 ? "font-medium" : "text-muted-foreground"}>Style</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {step === 1 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {widgetTypes.map((type) => (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedType === type.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleTypeSelect(type.id)}
                  data-testid={`widget-type-${type.id}`}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="mb-3 rounded-lg bg-muted p-3">
                      <type.icon className="h-6 w-6" />
                    </div>
                    <p className="font-medium text-sm">{type.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Widget Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Sales Overview" {...field} data-testid="input-widget-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataSourceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Source</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(parseInt(val))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-data-source">
                          <SelectValue placeholder="Select a data source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dataSources.map((ds) => (
                          <SelectItem key={ds.id} value={ds.id.toString()}>
                            {ds.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {columns.length > 0 && selectedType !== "stat" && selectedType !== "table" && (
                <>
                  <FormField
                    control={form.control}
                    name="xAxis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>X-Axis (Category)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-x-axis">
                              <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {columns.map((col) => (
                              <SelectItem key={col} value={col}>
                                {col}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yAxis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Y-Axis (Value)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-y-axis">
                              <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {columns.map((col) => (
                              <SelectItem key={col} value={col}>
                                {col}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aggregation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aggregation</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-aggregation">
                              <SelectValue placeholder="Select aggregation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sum">Sum</SelectItem>
                            <SelectItem value="avg">Average</SelectItem>
                            <SelectItem value="count">Count</SelectItem>
                            <SelectItem value="min">Minimum</SelectItem>
                            <SelectItem value="max">Maximum</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(1)} data-testid="button-back-step">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button type="button" onClick={() => setStep(3)} data-testid="button-next-step">
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="showLegend"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Show Legend</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Display chart legend below the visualization
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-show-legend"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="showGrid"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Show Grid Lines</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Display background grid lines
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-show-grid"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(2)} data-testid="button-back-step-2">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button type="submit" data-testid="button-create-widget">
                    Create Widget
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
