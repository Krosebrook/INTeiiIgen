import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, StickyNote } from "lucide-react";
import type { Annotation } from "@shared/schema";

interface AnnotationEditorProps {
  annotations: Annotation[];
  onChange: (annotations: Annotation[]) => void;
  dataLength: number;
}

export function AnnotationEditor({ annotations, onChange, dataLength }: AnnotationEditorProps) {
  const handleAdd = () => {
    const newAnnotation: Annotation = {
      id: crypto.randomUUID(),
      dataIndex: 0,
      label: "",
      description: "",
    };
    onChange([...annotations, newAnnotation]);
  };

  const handleRemove = (id: string) => {
    onChange(annotations.filter((a) => a.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<Annotation>) => {
    onChange(annotations.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  return (
    <div className="space-y-3" data-testid="annotation-editor">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Annotations</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAdd}
          data-testid="button-add-annotation"
        >
          <Plus className="h-4 w-4" />
          Add Note
        </Button>
      </div>

      {annotations.length === 0 && (
        <p className="text-xs text-muted-foreground">Annotate specific data points with notes visible on the chart.</p>
      )}

      <div className="space-y-2">
        {annotations.map((ann) => (
          <div key={ann.id} className="flex items-center gap-2 flex-wrap" data-testid={`annotation-row-${ann.id}`}>
            <Input
              type="number"
              min={0}
              max={Math.max(0, dataLength - 1)}
              value={ann.dataIndex}
              onChange={(e) => handleUpdate(ann.id, { dataIndex: Math.max(0, Math.min(dataLength - 1, parseInt(e.target.value) || 0)) })}
              placeholder="Index"
              className="w-[70px] shrink-0"
              data-testid={`input-annotation-index-${ann.id}`}
            />
            <Input
              value={ann.label}
              onChange={(e) => handleUpdate(ann.id, { label: e.target.value })}
              placeholder="Label (shown on chart)"
              className="flex-1 min-w-[100px]"
              data-testid={`input-annotation-label-${ann.id}`}
            />
            <Input
              value={ann.description || ""}
              onChange={(e) => handleUpdate(ann.id, { description: e.target.value })}
              placeholder="Description (optional)"
              className="flex-1 min-w-[100px]"
              data-testid={`input-annotation-desc-${ann.id}`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(ann.id)}
              data-testid={`button-remove-annotation-${ann.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
