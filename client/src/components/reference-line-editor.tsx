import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Target } from "lucide-react";
import type { ReferenceLine } from "@shared/schema";

interface ReferenceLineEditorProps {
  referenceLines: ReferenceLine[];
  onChange: (lines: ReferenceLine[]) => void;
}

const LINE_COLORS = [
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Green", value: "#22c55e" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Purple", value: "#8b5cf6" },
];

export function ReferenceLineEditor({ referenceLines, onChange }: ReferenceLineEditorProps) {
  const handleAdd = () => {
    const newLine: ReferenceLine = {
      id: crypto.randomUUID(),
      axis: "y",
      value: 0,
      label: "Target",
      color: "#ef4444",
      style: "dashed",
    };
    onChange([...referenceLines, newLine]);
  };

  const handleRemove = (id: string) => {
    onChange(referenceLines.filter((rl) => rl.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<ReferenceLine>) => {
    onChange(referenceLines.map((rl) => (rl.id === id ? { ...rl, ...updates } : rl)));
  };

  return (
    <div className="space-y-3" data-testid="reference-line-editor">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Reference Lines</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAdd}
          data-testid="button-add-reference-line"
        >
          <Plus className="h-4 w-4" />
          Add Line
        </Button>
      </div>

      {referenceLines.length === 0 && (
        <p className="text-xs text-muted-foreground">Add targets, SLAs, or thresholds as reference lines on your chart.</p>
      )}

      <div className="space-y-2">
        {referenceLines.map((rl) => (
          <div key={rl.id} className="flex items-center gap-2 flex-wrap" data-testid={`ref-line-row-${rl.id}`}>
            <Select
              value={rl.axis}
              onValueChange={(v) => handleUpdate(rl.id, { axis: v as "x" | "y" })}
            >
              <SelectTrigger className="w-[70px] shrink-0" data-testid={`select-ref-axis-${rl.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="x">X</SelectItem>
                <SelectItem value="y">Y</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              value={typeof rl.value === "number" ? rl.value : ""}
              onChange={(e) => handleUpdate(rl.id, { value: parseFloat(e.target.value) || 0 })}
              placeholder="Value"
              className="w-[80px] shrink-0"
              data-testid={`input-ref-value-${rl.id}`}
            />

            <Input
              value={rl.label || ""}
              onChange={(e) => handleUpdate(rl.id, { label: e.target.value })}
              placeholder="Label"
              className="flex-1 min-w-[80px]"
              data-testid={`input-ref-label-${rl.id}`}
            />

            <Select
              value={rl.style || "dashed"}
              onValueChange={(v) => handleUpdate(rl.id, { style: v as "solid" | "dashed" | "dotted" })}
            >
              <SelectTrigger className="w-[90px] shrink-0" data-testid={`select-ref-style-${rl.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={rl.color || "#ef4444"}
              onValueChange={(v) => handleUpdate(rl.id, { color: v })}
            >
              <SelectTrigger className="w-[90px] shrink-0" data-testid={`select-ref-color-${rl.id}`}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: rl.color || "#ef4444" }} />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {LINE_COLORS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.value }} />
                      {c.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(rl.id)}
              data-testid={`button-remove-ref-line-${rl.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
