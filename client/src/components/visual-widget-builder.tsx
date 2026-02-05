import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  BarChart3,
  LineChart,
  PieChart,
  AreaChart,
  ScatterChartIcon,
  Table2,
  Hash,
  Palette,
  Sliders,
  ChevronRight,
} from "lucide-react";
import { AISuggestions } from "@/components/ai-suggestions";
import {
  BarChart,
  Bar,
  LineChart as ReLineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { fadeInUp, staggerContainer, smoothTransition } from "@/lib/animations";
import type { DataSource } from "@shared/schema";

interface VisualWidgetBuilderProps {
  dataSources: DataSource[];
  onCreateWidget: (data: {
    type: string;
    title: string;
    dataSourceId: number;
    config: any;
  }) => void;
  onCancel: () => void;
}

const chartTypes = [
  { id: "bar", label: "Bar Chart", icon: BarChart3 },
  { id: "line", label: "Line Chart", icon: LineChart },
  { id: "area", label: "Area Chart", icon: AreaChart },
  { id: "pie", label: "Pie Chart", icon: PieChart },
  { id: "scatter", label: "Scatter Plot", icon: ScatterChartIcon },
  { id: "stat", label: "Stat Card", icon: Hash },
  { id: "table", label: "Data Table", icon: Table2 },
];

const colorPresets = [
  { name: "Default", colors: ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"] },
  { name: "Blue", colors: ["#3b82f6", "#60a5fa", "#93c5fd"] },
  { name: "Green", colors: ["#22c55e", "#4ade80", "#86efac"] },
  { name: "Purple", colors: ["#8b5cf6", "#a78bfa", "#c4b5fd"] },
  { name: "Orange", colors: ["#f97316", "#fb923c", "#fdba74"] },
];

export function VisualWidgetBuilder({
  dataSources,
  onCreateWidget,
  onCancel,
}: VisualWidgetBuilderProps) {
  const [step, setStep] = useState<"type" | "data" | "style">("type");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedDataSource, setSelectedDataSource] = useState<string>("");
  const [title, setTitle] = useState("");
  const [xAxis, setXAxis] = useState<string>("");
  const [yAxis, setYAxis] = useState<string>("");
  const [colorPreset, setColorPreset] = useState(0);
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  const selectedSource = useMemo(() => {
    return dataSources.find((ds) => ds.id.toString() === selectedDataSource);
  }, [dataSources, selectedDataSource]);

  const columns = useMemo(() => {
    if (!selectedSource?.rawData || !Array.isArray(selectedSource.rawData)) return [];
    const firstRow = selectedSource.rawData[0];
    return firstRow ? Object.keys(firstRow) : [];
  }, [selectedSource]);

  const previewData = useMemo(() => {
    if (!selectedSource?.rawData || !Array.isArray(selectedSource.rawData)) return [];
    return selectedSource.rawData.slice(0, 10);
  }, [selectedSource]);

  const canProceedToData = selectedType !== "";
  const canProceedToStyle = selectedDataSource !== "" && title.trim() !== "";
  const canCreate = canProceedToStyle && (selectedType === "table" || selectedType === "stat" || (xAxis && yAxis));

  const handleCreate = () => {
    if (!canCreate || !selectedDataSource) return;

    onCreateWidget({
      type: selectedType,
      title,
      dataSourceId: parseInt(selectedDataSource),
      config: {
        xAxis: xAxis || undefined,
        yAxis: yAxis || undefined,
        colors: colorPresets[colorPreset].colors,
        showLegend,
        showGrid,
      },
    });
  };

  const renderPreview = () => {
    if (!previewData.length || !xAxis || !yAxis) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Configure data to see preview
        </div>
      );
    }

    const colors = colorPresets[colorPreset].colors;

    switch (selectedType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={previewData}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
              <XAxis dataKey={xAxis} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey={yAxis} fill={colors[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={previewData}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
              <XAxis dataKey={xAxis} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey={yAxis} stroke={colors[0]} strokeWidth={2} />
            </ReLineChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ReAreaChart data={previewData}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
              <XAxis dataKey={xAxis} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey={yAxis} stroke={colors[0]} fill={colors[0]} fillOpacity={0.2} />
            </ReAreaChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={previewData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                dataKey={yAxis}
                nameKey={xAxis}
              >
                {previewData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Preview not available for this chart type
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        {["type", "data", "style"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s
                  ? "bg-primary text-primary-foreground"
                  : i < ["type", "data", "style"].indexOf(step)
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-sm ${step === s ? "font-medium" : "text-muted-foreground"}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
            {i < 2 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {step === "type" && (
            <motion.div
              key="type"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={smoothTransition}
              className="h-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Choose Chart Type</h3>
                <AISuggestions
                  type="chart-type"
                  context={{ columns }}
                  onSelectSuggestion={(s) => {
                    if (s.value?.type) setSelectedType(s.value.type);
                    if (s.value?.title) setTitle(s.value.title);
                  }}
                  compact
                />
              </div>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-3"
              >
                {chartTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <motion.div key={type.id} variants={fadeInUp}>
                      <Card
                        className={`cursor-pointer transition-all hover-elevate ${
                          selectedType === type.id ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setSelectedType(type.id)}
                        data-testid={`chart-type-${type.id}`}
                      >
                        <CardContent className="p-4 flex flex-col items-center gap-2">
                          <Icon className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm font-medium">{type.label}</span>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          )}

          {step === "data" && (
            <motion.div
              key="data"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={smoothTransition}
              className="h-full"
            >
              <div className="grid grid-cols-2 gap-6 h-full">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Widget Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter widget title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      data-testid="input-widget-title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data Source</Label>
                    <Select value={selectedDataSource} onValueChange={setSelectedDataSource}>
                      <SelectTrigger data-testid="select-data-source">
                        <SelectValue placeholder="Select a data source" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataSources
                          .filter((ds) => ds.status === "ready")
                          .map((ds) => (
                            <SelectItem key={ds.id} value={ds.id.toString()}>
                              {ds.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {columns.length > 0 && selectedType !== "table" && selectedType !== "stat" && (
                    <>
                      <AISuggestions
                        type="field-mapping"
                        context={{ columns }}
                        onSelectSuggestion={(s) => {
                          if (s.value?.xAxis) setXAxis(s.value.xAxis);
                          if (s.value?.yAxis) setYAxis(s.value.yAxis);
                        }}
                        compact
                      />
                      <div className="space-y-2">
                        <Label>X Axis (Category)</Label>
                        <Select value={xAxis} onValueChange={setXAxis}>
                          <SelectTrigger data-testid="select-x-axis">
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            {columns.map((col) => (
                              <SelectItem key={col} value={col}>
                                {col}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Y Axis (Value)</Label>
                        <Select value={yAxis} onValueChange={setYAxis}>
                          <SelectTrigger data-testid="select-y-axis">
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            {columns.map((col) => (
                              <SelectItem key={col} value={col}>
                                {col}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>

                <div className="border rounded-lg p-4 bg-muted/30">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Live Preview
                  </h4>
                  <div className="h-48">{renderPreview()}</div>
                </div>
              </div>
            </motion.div>
          )}

          {step === "style" && (
            <motion.div
              key="style"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={smoothTransition}
              className="h-full"
            >
              <div className="grid grid-cols-2 gap-6 h-full">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Color Scheme
                    </Label>
                    <div className="flex gap-2 flex-wrap">
                      {colorPresets.map((preset, index) => (
                        <button
                          key={preset.name}
                          onClick={() => setColorPreset(index)}
                          className={`p-2 rounded-md border flex gap-1 ${
                            colorPreset === index ? "ring-2 ring-primary" : ""
                          }`}
                          data-testid={`color-preset-${index}`}
                        >
                          {preset.colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <Label className="flex items-center gap-2">
                      <Sliders className="h-4 w-4" />
                      Chart Options
                    </Label>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="legend" className="text-sm">
                        Show Legend
                      </Label>
                      <Switch
                        id="legend"
                        checked={showLegend}
                        onCheckedChange={setShowLegend}
                        data-testid="switch-legend"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="grid" className="text-sm">
                        Show Grid Lines
                      </Label>
                      <Switch
                        id="grid"
                        checked={showGrid}
                        onCheckedChange={setShowGrid}
                        data-testid="switch-grid"
                      />
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-muted/30">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Final Preview
                  </h4>
                  <div className="h-48">{renderPreview()}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-between pt-6 border-t mt-6">
        <Button variant="outline" onClick={step === "type" ? onCancel : () => setStep(step === "style" ? "data" : "type")} data-testid="button-back">
          {step === "type" ? "Cancel" : "Back"}
        </Button>
        
        {step !== "style" ? (
          <Button
            onClick={() => setStep(step === "type" ? "data" : "style")}
            disabled={step === "type" ? !canProceedToData : !canProceedToStyle}
            data-testid="button-next"
          >
            Next
          </Button>
        ) : (
          <Button onClick={handleCreate} disabled={!canCreate} data-testid="button-create-widget">
            Create Widget
          </Button>
        )}
      </div>
    </div>
  );
}
