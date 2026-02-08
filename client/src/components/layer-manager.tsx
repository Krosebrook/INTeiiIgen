import { type VisualizationLayer } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ArrowUp, ArrowDown, Layers, BarChart3 } from "lucide-react";

const CHART_TYPES = ["bar", "line", "pie", "area", "scatter", "stat", "table", "donut", "gauge", "funnel", "radar"] as const;

interface LayerManagerProps {
  layers: VisualizationLayer[];
  onChange: (layers: VisualizationLayer[]) => void;
  primaryType: string;
}

export function LayerManager({ layers, onChange, primaryType }: LayerManagerProps) {
  const handleAddLayer = () => {
    const newLayer: VisualizationLayer = {
      id: crypto.randomUUID(),
      type: "bar",
      label: `Layer ${layers.length + 1}`,
    };
    onChange([...layers, newLayer]);
  };

  const handleRemoveLayer = (id: string) => {
    if (layers.length <= 1) return;
    onChange(layers.filter((l) => l.id !== id));
  };

  const handleTypeChange = (id: string, type: string) => {
    onChange(layers.map((l) => (l.id === id ? { ...l, type } : l)));
  };

  const handleLabelChange = (id: string, label: string) => {
    onChange(layers.map((l) => (l.id === id ? { ...l, label } : l)));
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...layers];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index >= layers.length - 1) return;
    const updated = [...layers];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-3" data-testid="layer-manager">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Visualization Layers</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddLayer}
          data-testid="button-add-layer"
        >
          <Plus className="h-4 w-4" />
          Add Layer
        </Button>
      </div>

      <div className="space-y-2">
        {layers.map((layer, index) => {
          const isPrimary = index === 0;

          return (
            <div
              key={layer.id}
              className="flex items-center gap-2 flex-wrap"
              data-testid={`layer-row-${layer.id}`}
            >
              <BarChart3 className="h-4 w-4 text-muted-foreground shrink-0" />

              {isPrimary ? (
                <Badge variant="secondary" className="shrink-0 no-default-hover-elevate">
                  Primary
                </Badge>
              ) : null}

              <Select
                value={layer.type}
                onValueChange={(value) => handleTypeChange(layer.id, value)}
              >
                <SelectTrigger
                  className="w-[120px] shrink-0"
                  data-testid={`select-layer-type-${layer.id}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHART_TYPES.map((ct) => (
                    <SelectItem key={ct} value={ct}>
                      {ct.charAt(0).toUpperCase() + ct.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                value={layer.label ?? ""}
                onChange={(e) => handleLabelChange(layer.id, e.target.value)}
                placeholder="Label"
                className="flex-1 min-w-[100px]"
                data-testid={`input-layer-label-${layer.id}`}
              />

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  data-testid={`button-move-up-${layer.id}`}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === layers.length - 1}
                  data-testid={`button-move-down-${layer.id}`}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                {!isPrimary && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveLayer(layer.id)}
                    data-testid={`button-remove-layer-${layer.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
