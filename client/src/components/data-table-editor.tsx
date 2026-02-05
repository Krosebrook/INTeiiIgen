import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Download, Wand2, Loader2, Check } from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";

interface ChartDataItem {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface DataTableEditorProps {
  data: ChartDataItem[];
  onChange: (newData: ChartDataItem[]) => void;
  widgetTitle?: string;
}

export function DataTableEditor({ data, onChange, widgetTitle }: DataTableEditorProps) {
  const [columns, setColumns] = useState<string[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);

  useEffect(() => {
    if (data.length > 0) {
      const keys = new Set<string>();
      if (data.some(d => d.name !== undefined)) keys.add('name');
      data.forEach(item => Object.keys(item).forEach(k => keys.add(k)));
      const orderedKeys = Array.from(keys).sort((a, b) => {
        const priority = ['name', 'category', 'value', 'x', 'y', 'z'];
        const idxA = priority.indexOf(a);
        const idxB = priority.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
      });
      setColumns(orderedKeys);
    } else {
      setColumns(['name', 'value']);
    }
  }, [data]);

  const handleCellChange = (rowIndex: number, key: string, value: string) => {
    const newData = [...data];
    const originalValue = newData[rowIndex][key];
    const isNumber = typeof originalValue === 'number' || (key !== 'name' && key !== 'category' && !isNaN(Number(value)) && value.trim() !== '');
    newData[rowIndex] = { ...newData[rowIndex], [key]: isNumber ? (value === '' ? 0 : Number(value)) : value };
    onChange(newData);
  };

  const handleAddRow = () => {
    const newRow: ChartDataItem = { name: 'New Item', value: 0 };
    columns.forEach(col => {
      if (col !== 'name' && col !== 'value') {
        if (['x', 'y', 'z'].includes(col)) newRow[col] = 0;
        else newRow[col] = '';
      }
    });
    onChange([...data, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleAiRefill = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const response = await apiRequest('/api/ai/generate-data', 'POST', {
        prompt: aiPrompt,
        columns,
        widgetTitle,
        count: Math.max(data.length, 6),
      });
      const result = await response.json();
      if (result.data && Array.isArray(result.data)) {
        onChange(result.data);
        setShowAiInput(false);
        setAiPrompt('');
      } else {
        throw new Error('Invalid response');
      }
    } catch {
      const mockData = generateMockData(columns, aiPrompt);
      onChange(mockData);
      setShowAiInput(false);
      setAiPrompt('');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCSV = () => {
    if (data.length === 0) return;
    const headers = columns.join(',');
    const rows = data.map(row => columns.map(col => {
      const val = row[col] ?? '';
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
    }).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "chart_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 bg-muted/50 p-4 rounded-xl border">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {data.length} Data Points
          </span>
          <div className="flex gap-2">
            <Button 
              variant={showAiInput ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAiInput(!showAiInput)}
              className="gap-2"
              data-testid="button-ai-refill"
            >
              <Wand2 className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating...' : 'AI Generate'}
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={downloadCSV}
              className="gap-2"
              data-testid="button-download-csv"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </div>
        </div>
        
        {showAiInput && (
          <div className="flex gap-2 animate-in slide-in-from-top-2">
            <Input 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiRefill()}
              placeholder="e.g., 12 months of increasing sales data..."
              className="flex-1"
              data-testid="input-ai-prompt"
            />
            <Button 
              onClick={handleAiRefill}
              disabled={isGenerating || !aiPrompt.trim()}
              size="icon"
              data-testid="button-generate"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card max-h-[400px]">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/30 sticky top-0 backdrop-blur z-10 border-b">
            <tr>
              {columns.map(col => (
                <th key={col} className="px-4 py-3 font-semibold tracking-wider text-left">
                  {col}
                </th>
              ))}
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="group hover:bg-muted/20 transition-colors">
                {columns.map(col => (
                  <td key={`${rowIndex}-${col}`} className="p-1">
                    <Input
                      value={row[col] ?? ''}
                      onChange={(e) => handleCellChange(rowIndex, col, e.target.value)}
                      className="h-9 bg-transparent border-transparent focus:border-primary transition-all"
                      data-testid={`input-cell-${rowIndex}-${col}`}
                    />
                  </td>
                ))}
                <td className="px-2">
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRow(rowIndex)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid={`button-delete-row-${rowIndex}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button 
        variant="outline"
        onClick={handleAddRow}
        className="w-full border-dashed gap-2"
        data-testid="button-add-row"
      >
        <Plus className="h-4 w-4" />
        Add Row
      </Button>
    </div>
  );
}

function generateMockData(columns: string[], prompt: string): ChartDataItem[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const isIncreasing = prompt.toLowerCase().includes('increas');
  const isDecreasing = prompt.toLowerCase().includes('decreas');
  const isSales = prompt.toLowerCase().includes('sales') || prompt.toLowerCase().includes('revenue');
  
  return months.slice(0, 8).map((name, i) => {
    let baseValue = isSales ? 50000 : 100;
    if (isIncreasing) baseValue += i * (isSales ? 5000 : 15);
    else if (isDecreasing) baseValue -= i * (isSales ? 3000 : 10);
    else baseValue += (Math.random() - 0.5) * (isSales ? 10000 : 30);
    
    const row: ChartDataItem = { name, value: Math.round(baseValue) };
    columns.forEach(col => {
      if (col !== 'name' && col !== 'value' && !row[col]) {
        row[col] = Math.round(Math.random() * 100);
      }
    });
    return row;
  });
}
