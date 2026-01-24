# AI & Assistant API

## GET /api/ai-analyses

**Purpose:** Retrieve all AI analyses for the authenticated user.

**Response (200):**
```typescript
interface AiAnalysis {
  id: number;
  dataSourceId: number;
  userId: string;
  analysis: string;        // AI-generated insights text
  createdAt: string;
}
```

---

## POST /api/data-sources/:id/analyze

**Purpose:** Trigger AI analysis on a data source.

**How it works:**
1. Samples first 20 rows of data
2. Sends to OpenAI GPT-4.1-mini
3. Returns structured insights about patterns, anomalies, and recommendations

**Response (200):**
```typescript
{
  analysis: AiAnalysis;
}
```

**Response (400):**
```typescript
{ "error": "Data source has no analyzable data" }
```

---

## POST /api/assistant/chat

**Purpose:** Chat with the smart dashboard assistant.

**Request Body:**
```typescript
{
  message: string;         // User's message (1-2000 chars)
  context?: {
    dashboardId?: number;
    dataSourceCount?: number;
    widgetCount?: number;
    dataSources?: Array<{
      name: string;
      type: string;
      status: string;
      rowCount?: number;
      columns?: string[];
    }>;
    widgets?: Array<{
      title: string;
      type: string;
    }>;
  };
}
```

**Response (200):**
```typescript
{
  reply: string;           // Assistant's response
  suggestions?: string[];  // Optional follow-up suggestions
}
```

---

## AI Model Configuration

| Setting | Value |
|---------|-------|
| Model | GPT-4.1-mini |
| Max Tokens | 1000 |
| Temperature | 0.7 |

**Required Secret:** `OPENAI_API_KEY` (via Replit AI integration)

---

## Example Analysis Prompt

The AI receives context like:
```
Analyze this dataset and provide insights.
Data source: "Sales Q4 2025"
Rows: 1500, Columns: 8

Sample data:
[first 20 rows as JSON]

Provide: key patterns, anomalies, correlations, recommendations.
```
