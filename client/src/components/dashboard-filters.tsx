import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, X, CalendarDays, Plus } from "lucide-react";
import type { Widget, DataSource } from "@shared/schema";

export interface DashboardFilter {
  field: string;
  operator: "equals" | "contains" | "gt" | "lt" | "between";
  value: string;
  value2?: string;
}

interface DashboardFiltersProps {
  dataSources?: DataSource[];
  widgets: Widget[];
  filters: DashboardFilter[];
  onFiltersChange: (filters: DashboardFilter[]) => void;
}

function getAvailableFields(widgets: Widget[], dataSources?: DataSource[]): string[] {
  const fields = new Set<string>();
  widgets.forEach(w => {
    const cfg = w.config as any;
    if (cfg?.xAxis) fields.add(cfg.xAxis);
    if (cfg?.yAxis) fields.add(cfg.yAxis);
    const dataArr = cfg?.data;
    if (Array.isArray(dataArr) && dataArr.length > 0) {
      Object.keys(dataArr[0]).forEach(k => fields.add(k));
    }
  });
  if (dataSources) {
    dataSources.forEach(ds => {
      if (Array.isArray(ds.rawData) && (ds.rawData as any[]).length > 0) {
        Object.keys((ds.rawData as any[])[0]).forEach(k => fields.add(k));
      }
    });
  }
  return Array.from(fields).sort();
}

export function applyFilters(data: any[], filters: DashboardFilter[]): any[] {
  if (!filters || filters.length === 0 || !data || data.length === 0) return data;
  const applicableFilters = filters.filter(f => {
    return data.some(row => f.field in row);
  });
  if (applicableFilters.length === 0) return data;
  return data.filter(row => {
    return applicableFilters.every(f => {
      if (!(f.field in row)) return true;
      const val = row[f.field];
      if (val === undefined || val === null) return false;
      const strVal = String(val).toLowerCase();
      const filterVal = f.value.toLowerCase();
      switch (f.operator) {
        case "equals":
          return strVal === filterVal;
        case "contains":
          return strVal.includes(filterVal);
        case "gt":
          return parseFloat(String(val)) > parseFloat(f.value);
        case "lt":
          return parseFloat(String(val)) < parseFloat(f.value);
        case "between": {
          const num = parseFloat(String(val));
          return num >= parseFloat(f.value) && num <= parseFloat(f.value2 || f.value);
        }
        default:
          return true;
      }
    });
  });
}

export function DashboardFilters({
  dataSources,
  widgets,
  filters,
  onFiltersChange,
}: DashboardFiltersProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newField, setNewField] = useState("");
  const [newOp, setNewOp] = useState<DashboardFilter["operator"]>("contains");
  const [newValue, setNewValue] = useState("");
  const [newValue2, setNewValue2] = useState("");

  const fields = useMemo(() => getAvailableFields(widgets, dataSources), [widgets, dataSources]);

  const addFilter = () => {
    if (!newField || !newValue) return;
    const filter: DashboardFilter = {
      field: newField,
      operator: newOp,
      value: newValue,
    };
    if (newOp === "between") filter.value2 = newValue2;
    onFiltersChange([...filters, filter]);
    setNewField("");
    setNewValue("");
    setNewValue2("");
    setIsAdding(false);
  };

  const removeFilter = (index: number) => {
    onFiltersChange(filters.filter((_, i) => i !== index));
  };

  const clearAll = () => onFiltersChange([]);

  const operatorLabels: Record<string, string> = {
    equals: "=",
    contains: "contains",
    gt: ">",
    lt: "<",
    between: "between",
  };

  return (
    <div className="flex items-center gap-2 flex-wrap" data-testid="dashboard-filters">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
        <Filter className="h-3.5 w-3.5" />
        <span>Filters</span>
      </div>

      {filters.map((f, i) => (
        <Badge key={i} variant="secondary" className="gap-1 pr-1" data-testid={`filter-badge-${i}`}>
          <span className="font-medium">{f.field}</span>
          <span className="text-muted-foreground">{operatorLabels[f.operator]}</span>
          <span>{f.value}{f.operator === "between" && f.value2 ? ` - ${f.value2}` : ""}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 ml-1 no-default-hover-elevate no-default-active-elevate"
            onClick={() => removeFilter(i)}
            data-testid={`button-remove-filter-${i}`}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      <Popover open={isAdding} onOpenChange={setIsAdding}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1" data-testid="button-add-filter">
            <Plus className="h-3 w-3" />
            {filters.length === 0 ? "Add Filter" : ""}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 space-y-3" align="start">
          <div className="space-y-2">
            <Select value={newField} onValueChange={setNewField}>
              <SelectTrigger data-testid="select-filter-field">
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {fields.map(f => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={newOp} onValueChange={(v) => setNewOp(v as DashboardFilter["operator"])}>
              <SelectTrigger data-testid="select-filter-op">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="gt">Greater than</SelectItem>
                <SelectItem value="lt">Less than</SelectItem>
                <SelectItem value="between">Between</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Value"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              data-testid="input-filter-value"
            />

            {newOp === "between" && (
              <Input
                placeholder="Max value"
                value={newValue2}
                onChange={e => setNewValue2(e.target.value)}
                data-testid="input-filter-value2"
              />
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={addFilter} disabled={!newField || !newValue} data-testid="button-apply-filter">
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {filters.length > 0 && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground" data-testid="button-clear-filters">
          Clear all
        </Button>
      )}
    </div>
  );
}
