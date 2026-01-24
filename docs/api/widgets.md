# Widgets API

Widgets are visualization components placed on dashboards.

## POST /api/widgets

**Purpose:** Create a new widget on a dashboard.

**Auth Required:** Yes

**Request Body:**
```typescript
{
  dashboardId: number;     // Required
  title: string;           // Required
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'table' | 'metric' | 'text';
  config: {
    dataSourceId?: number;
    xAxis?: string;        // Column name for X axis
    yAxis?: string;        // Column name for Y axis
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
    filters?: object;
    colors?: string[];
  };
  position: {
    x: number;             // Grid column (0-based)
    y: number;             // Grid row (0-based)
    width: number;         // Columns to span
    height: number;        // Rows to span
  };
}
```

**Response (201):** Created Widget object

---

## PATCH /api/widgets/:id

**Purpose:** Update widget properties.

**Request Body:** Partial widget object (title, type, config, position)

**Response (200):** Updated Widget object

---

## DELETE /api/widgets/:id

**Purpose:** Delete a widget.

**Response (200):**
```typescript
{ "message": "Widget deleted" }
```

---

## Widget Types

| Type | Description | Required Config |
|------|-------------|-----------------|
| `bar` | Bar chart | dataSourceId, xAxis, yAxis |
| `line` | Line chart | dataSourceId, xAxis, yAxis |
| `pie` | Pie chart | dataSourceId, xAxis, yAxis |
| `area` | Area chart | dataSourceId, xAxis, yAxis |
| `scatter` | Scatter plot | dataSourceId, xAxis, yAxis |
| `table` | Data table | dataSourceId |
| `metric` | Single value | dataSourceId, yAxis, aggregation |
| `text` | Static text | content (in config) |
