# DashGen Documentation

**Enterprise Dashboard Generator Platform**

> Transform any data into intelligent, interactive dashboards with AI-powered insights

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
   - [For End Users](#for-end-users)
   - [For Developers](#for-developers)
   - [For Operators/DevOps](#for-operatorsdevops)
3. [Architecture](#architecture)
4. [Data Models & API Reference](#data-models--api-reference)
5. [Configuration Reference](#configuration-reference)
6. [User Flows](#user-flows)
7. [Code Documentation](#code-documentation)
8. [Testing & Quality](#testing--quality)
9. [Security & Compliance](#security--compliance)
10. [Observability & Operations](#observability--operations)
11. [Examples & Use Cases](#examples--use-cases)
12. [Troubleshooting](#troubleshooting)
13. [Version History & Changelog](#version-history--changelog)
14. [Style Guide Appendix](#style-guide-appendix)

---

## Overview

### Purpose

DashGen is an enterprise-grade dashboard generator platform that enables users to:

- **Import data** from any source (files, URLs, cloud storage)
- **Connect** to Google Drive, OneDrive, and Notion
- **Generate** AI-powered interactive dashboards with visualizations
- **Collaborate** with multi-tenant organization support

### Supported Platforms

| Platform | Version | Status |
|----------|---------|--------|
| Node.js | 20.x+ | ✅ Supported |
| PostgreSQL | 14+ | ✅ Supported |
| Modern Browsers | Chrome, Firefox, Safari, Edge | ✅ Supported |

### Versioning Strategy

DashGen follows [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking API changes
- **MINOR**: New features, backward-compatible
- **PATCH**: Bug fixes, backward-compatible

---

## Getting Started

### For End Users

#### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Replit account for authentication

#### Quick Start

1. **Navigate** to the DashGen landing page
2. **Click** "Get Started" to sign in with Replit
3. **Create** your first dashboard:
   - Click "New Dashboard"
   - Upload data (CSV, JSON, Excel) or connect cloud storage
   - Let AI generate insights automatically

#### First-Run Checklist

- [ ] Sign in with Replit account
- [ ] Upload at least one data source
- [ ] Create your first dashboard
- [ ] Add widgets to visualize your data
- [ ] Explore AI-generated insights

---

### For Developers

#### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20.x+ | JavaScript runtime |
| npm | 10.x+ | Package manager |
| PostgreSQL | 14+ | Database |

#### Installation

```bash
# Clone the repository
git clone <repository-url>
cd dashgen

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Push database schema
npm run db:push

# Start development server
npm run dev
```

#### Project Structure

```
├── client/src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui base components
│   │   ├── app-sidebar.tsx  # Main navigation sidebar
│   │   ├── chart-widget.tsx # Chart visualization component
│   │   ├── kpi-cards.tsx    # KPI metrics display
│   │   ├── smart-assistant.tsx  # AI chat assistant
│   │   ├── visual-widget-builder.tsx  # Chart builder wizard
│   │   └── template-gallery.tsx  # Dashboard templates
│   ├── pages/               # Route pages
│   │   ├── dashboard.tsx    # Dashboard list
│   │   ├── dashboard-view.tsx  # Single dashboard view
│   │   ├── upload.tsx       # File upload
│   │   ├── cloud.tsx        # Cloud storage connectors
│   │   └── landing.tsx      # Public landing page
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utilities and helpers
├── server/
│   ├── routes.ts            # API endpoints
│   ├── storage.ts           # Database operations
│   └── db.ts                # Database connection
└── shared/
    └── schema.ts            # Drizzle schema + types
```

---

### For Operators/DevOps

#### Deployment

DashGen is deployed on Replit with automatic builds:

1. **Push** code to main branch
2. **Replit** automatically builds and deploys
3. **Health checks** verify deployment success

#### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Session encryption key |
| `OPENAI_API_KEY` | No | For AI features (auto-configured) |

#### Monitoring

- **Logs**: Available via Replit console
- **Health**: `GET /api/health` returns server status
- **Metrics**: Database connection pool status in logs

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   React     │  │  TanStack   │  │     Framer Motion       │  │
│  │   + Vite    │  │   Query     │  │      Animations         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express.js Server                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Routes    │  │    Auth     │  │     File Processing     │  │
│  │   (REST)    │  │  Middleware │  │    (CSV/JSON/Excel)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐
│  PostgreSQL   │  │    OpenAI    │  │   Cloud Storage APIs  │
│   (Neon)      │  │   GPT-4.1    │  │  (Drive/OneDrive/     │
│               │  │              │  │   Notion)             │
└───────────────┘  └───────────────┘  └───────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React + TypeScript | UI components |
| Bundler | Vite | Fast development builds |
| Styling | Tailwind CSS + shadcn/ui | Component library |
| Animations | Framer Motion | Page transitions |
| Data Fetching | TanStack Query | Server state management |
| Routing | Wouter | Client-side routing |
| Backend | Express.js | REST API server |
| Database | PostgreSQL (Neon) | Data persistence |
| ORM | Drizzle | Type-safe database queries |
| Authentication | Replit Auth | User identity |
| AI | OpenAI GPT-4.1-mini | Insights generation |
| Charts | Recharts | Data visualization |

### Multi-Tenant Architecture

```
┌─────────────────────────────────────────┐
│              Organization               │
│  ┌─────────────────────────────────┐   │
│  │         Members                  │   │
│  │  ┌─────┐ ┌─────┐ ┌─────┐       │   │
│  │  │Owner│ │Admin│ │Member│       │   │
│  │  └─────┘ └─────┘ └─────┘       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      Data Sources (scoped)      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      Dashboards (scoped)        │   │
│  │  ┌─────────────────────────┐    │   │
│  │  │    Widgets (scoped)     │    │   │
│  │  └─────────────────────────┘    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Data Models & API Reference

### Database Schema

#### Users (managed by Replit Auth)

| Column | Type | Description |
|--------|------|-------------|
| id | varchar | Replit user ID (primary key) |
| email | varchar | User email |
| firstName | varchar | First name |
| lastName | varchar | Last name |
| profileImageUrl | varchar | Avatar URL |

#### Organizations

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| name | varchar(255) | Organization name |
| slug | varchar(100) | URL-safe identifier |
| createdAt | timestamp | Creation time |
| updatedAt | timestamp | Last update time |

#### Data Sources

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | varchar | Owner's user ID |
| organizationId | integer | Optional org scope |
| name | varchar(255) | Display name |
| type | varchar(50) | file, url, cloud |
| source | varchar(50) | Provider (drive, onedrive, notion) |
| status | varchar(20) | pending, processing, ready, error |
| rawData | jsonb | Parsed data content |
| metadata | jsonb | File info, columns, rows |

#### Dashboards

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | varchar | Owner's user ID |
| organizationId | integer | Optional org scope |
| title | varchar(255) | Dashboard title |
| description | text | Optional description |
| isPublic | boolean | Public sharing enabled |
| shareToken | varchar(64) | Unique share URL token |

#### Widgets

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| dashboardId | integer | Parent dashboard |
| dataSourceId | integer | Data source reference |
| type | varchar(50) | bar, line, pie, area, stat, table |
| title | varchar(255) | Widget title |
| config | jsonb | Chart configuration |
| position | jsonb | Grid position {x, y, w, h} |

### API Endpoints

#### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/user` | Get current user |
| GET | `/api/login` | Initiate login |
| GET | `/api/logout` | Log out |

#### Data Sources

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data-sources` | List user's data sources |
| POST | `/api/data-sources` | Create data source |
| DELETE | `/api/data-sources/:id` | Delete data source |
| POST | `/api/upload` | Upload file (multipart) |
| POST | `/api/data-sources/url` | Import from URL |
| POST | `/api/data-sources/cloud` | Import from cloud storage |

**Example: Upload File**

```bash
curl -X POST /api/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@data.csv"
```

**Response:**

```json
{
  "id": 1,
  "name": "data.csv",
  "type": "file",
  "status": "ready",
  "metadata": {
    "rows": 100,
    "columns": ["name", "value", "date"]
  }
}
```

#### Dashboards

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboards` | List user's dashboards |
| POST | `/api/dashboards` | Create dashboard |
| GET | `/api/dashboards/:id` | Get dashboard details |
| PATCH | `/api/dashboards/:id` | Update dashboard |
| DELETE | `/api/dashboards/:id` | Delete dashboard |
| GET | `/api/share/:token` | Public dashboard view |

**Example: Create Dashboard**

```bash
curl -X POST /api/dashboards \
  -H "Content-Type: application/json" \
  -d '{"title": "Sales Dashboard", "description": "Q4 metrics"}'
```

#### Widgets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/widgets?dashboardId=1` | List widgets for dashboard |
| POST | `/api/widgets` | Create widget |
| PATCH | `/api/widgets/:id` | Update widget |
| DELETE | `/api/widgets/:id` | Delete widget |

**Example: Create Widget**

```json
{
  "dashboardId": 1,
  "dataSourceId": 1,
  "type": "bar",
  "title": "Revenue by Month",
  "config": {
    "xAxis": "month",
    "yAxis": "revenue",
    "colors": ["#3b82f6"]
  }
}
```

#### AI Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze/:sourceId` | Trigger AI analysis |
| GET | `/api/ai-analyses` | Get analysis results |
| POST | `/api/assistant/chat` | Chat with AI assistant |

**Example: Chat with Assistant**

```json
// Request
{
  "message": "What trends do you see in my sales data?",
  "context": {
    "dashboardId": 1,
    "dataSourceCount": 3,
    "widgetCount": 5
  }
}

// Response
{
  "response": "Based on your sales data, I can see a 15% increase in Q4..."
}
```

#### Cloud Storage

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cloud/google-drive/files` | List Google Drive files |
| GET | `/api/cloud/onedrive/files` | List OneDrive files |
| GET | `/api/cloud/notion/files` | List Notion databases |

---

## Configuration Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | - | Session encryption key (32+ chars) |
| `REPLIT_DOMAINS` | Auto | - | Allowed domains for auth |
| `OPENAI_API_KEY` | No | - | OpenAI API key for AI features |
| `NODE_ENV` | No | development | Environment mode |

### Port Configuration

| Service | Port | Notes |
|---------|------|-------|
| Frontend + Backend | 5000 | Vite proxies to Express |

### Database Configuration

```typescript
// drizzle.config.ts
export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
};
```

---

## User Flows

### Dashboard Creation Flow

```
┌──────────┐     ┌───────────┐     ┌────────────┐     ┌──────────┐
│  Login   │────▶│  Upload   │────▶│  Create    │────▶│  Add     │
│          │     │  Data     │     │  Dashboard │     │  Widgets │
└──────────┘     └───────────┘     └────────────┘     └──────────┘
                      │                                      │
                      │            ┌────────────┐            │
                      └───────────▶│  AI        │◀───────────┘
                                   │  Insights  │
                                   └────────────┘
```

### Widget Builder Flow

1. **Select Chart Type**: Choose from bar, line, area, pie, scatter, stat, or table
2. **Configure Data**: Select data source, X-axis column, Y-axis column
3. **Customize Style**: Choose colors, toggle legend/grid, set title
4. **Preview**: See live chart preview before saving
5. **Create**: Widget added to dashboard grid

### Cloud Import Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Select     │────▶│  Authorize   │────▶│  Browse     │
│  Provider   │     │  OAuth       │     │  Files      │
└─────────────┘     └──────────────┘     └─────────────┘
                                                │
                    ┌──────────────┐            │
                    │  Process     │◀───────────┘
                    │  & Import    │
                    └──────────────┘
```

---

## Code Documentation

### Coding Standards

#### TypeScript Guidelines

- **Strict mode** enabled for type safety
- **Interface over type** for object shapes
- **Explicit return types** on exported functions
- **No any** unless absolutely necessary

```typescript
// Good
interface User {
  id: string;
  email: string;
  firstName: string | null;
}

export function getUser(id: string): Promise<User | null> {
  return storage.getUser(id);
}

// Avoid
export function getUser(id) {
  return storage.getUser(id);
}
```

#### React Guidelines

- **Functional components** with hooks
- **Named exports** for components
- **Props interface** defined above component
- **data-testid** on interactive elements

```typescript
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "outline";
}

export function ActionButton({ onClick, children, variant = "default" }: ButtonProps) {
  return (
    <Button 
      onClick={onClick} 
      variant={variant}
      data-testid="button-action"
    >
      {children}
    </Button>
  );
}
```

#### API Route Guidelines

- **Zod validation** for request bodies
- **Try-catch** error handling
- **Consistent response format**
- **Authentication middleware** on protected routes

```typescript
const createDashboardSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
});

app.post("/api/dashboards", isAuthenticated, async (req, res) => {
  try {
    const result = createDashboardSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }
    
    const dashboard = await storage.createDashboard({
      ...result.data,
      userId: req.user.claims.sub,
    });
    
    res.status(201).json(dashboard);
  } catch (error) {
    console.error("Failed to create dashboard:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
```

### Component Documentation

#### KpiCards

Displays animated KPI metric cards with auto-detected numeric columns.

```typescript
interface KpiCardsProps {
  dataSources: DataSource[];
  className?: string;
}

// Usage
<KpiCards dataSources={dataSources} className="mb-6" />
```

#### SmartAssistant

Floating AI chat assistant for dashboard insights.

```typescript
interface SmartAssistantProps {
  dashboardId: number;
  dataSources: DataSource[];
  widgets: Widget[];
}

// Usage
<SmartAssistant 
  dashboardId={dashboard.id}
  dataSources={dataSources}
  widgets={widgets}
/>
```

#### VisualWidgetBuilder

3-step wizard for creating chart widgets.

```typescript
interface VisualWidgetBuilderProps {
  dataSources: DataSource[];
  onCreateWidget: (data: WidgetCreateData) => void;
  onCancel: () => void;
}

// Usage
<VisualWidgetBuilder
  dataSources={readyDataSources}
  onCreateWidget={handleCreate}
  onCancel={() => setOpen(false)}
/>
```

---

## Testing & Quality

### Test Coverage

| Area | Target | Current |
|------|--------|---------|
| Unit Tests | 80% | - |
| Integration Tests | 70% | - |
| E2E Tests | Critical paths | ✅ |

### Running Tests

```bash
# Run all tests
npm test

# Run E2E tests (Playwright)
npm run test:e2e

# Run with coverage
npm run test:coverage
```

### E2E Test Patterns

```typescript
// Example test pattern
test("create dashboard flow", async ({ page }) => {
  // Login
  await page.goto("/");
  await page.click('[data-testid="button-get-started"]');
  
  // Create dashboard
  await page.click('[data-testid="button-new-dashboard"]');
  await page.fill('[data-testid="input-title"]', "Test Dashboard");
  await page.click('[data-testid="button-create"]');
  
  // Verify
  await expect(page.locator('[data-testid="dashboard-title"]')).toHaveText("Test Dashboard");
});
```

### Smoke Checks

Before deployment, verify:

- [ ] Landing page loads
- [ ] Login flow works
- [ ] Dashboard creation succeeds
- [ ] File upload processes correctly
- [ ] Widget creation functions

---

## Security & Compliance

### Authentication Flow

```
┌────────┐     ┌─────────────┐     ┌───────────┐
│ Client │────▶│ /api/login  │────▶│ Replit    │
│        │     │             │     │ OIDC      │
└────────┘     └─────────────┘     └───────────┘
                                         │
┌────────┐     ┌─────────────┐           │
│ Client │◀────│ Session     │◀──────────┘
│        │     │ Cookie      │
└────────┘     └─────────────┘
```

### Authorization Model

| Role | Permissions |
|------|-------------|
| Owner | Full control, delete organization |
| Admin | Manage members, all content |
| Member | Create/edit own content |
| Viewer | Read-only access |

### OWASP Considerations

| Risk | Mitigation |
|------|------------|
| XSS | React auto-escaping, CSP headers |
| CSRF | Session cookies with SameSite |
| Injection | Parameterized queries (Drizzle) |
| Auth Bypass | Server-side ownership verification |
| Data Exposure | User-scoped queries |

### Secrets Handling

- **Session secrets**: Environment variables only
- **API keys**: Stored in Replit Secrets
- **Database URL**: Environment variable
- **No secrets in code**: Git-ignored `.env` files

---

## Observability & Operations

### Logging

```typescript
// Server logging pattern
console.log(`[${timestamp}] ${method} ${path} ${status} in ${duration}ms`);

// Example output
3:55:43 PM [express] GET /api/dashboards 200 in 45ms
```

### Health Check

```bash
# Check server health
curl /api/health
# Response: { "status": "ok", "timestamp": "2025-01-22T..." }
```

### Database Operations

```bash
# Push schema changes
npm run db:push

# Force push (use carefully)
npm run db:push --force

# View database in Replit
# Use Database panel in Replit sidebar
```

### Backup/Restore

**Automatic backups** via Neon PostgreSQL:

- Point-in-time recovery available
- Branch-based snapshots for testing
- Production backups retained 30 days

---

## Examples & Use Cases

### Example 1: Sales Dashboard

```typescript
// 1. Upload CSV data
const formData = new FormData();
formData.append("file", salesCsvFile);
await fetch("/api/upload", { method: "POST", body: formData });

// 2. Create dashboard
const dashboard = await apiRequest("POST", "/api/dashboards", {
  title: "Q4 Sales Dashboard",
  description: "Quarterly sales performance metrics",
});

// 3. Add bar chart widget
await apiRequest("POST", "/api/widgets", {
  dashboardId: dashboard.id,
  dataSourceId: 1,
  type: "bar",
  title: "Revenue by Region",
  config: { xAxis: "region", yAxis: "revenue" },
});

// 4. Add trend line widget
await apiRequest("POST", "/api/widgets", {
  dashboardId: dashboard.id,
  dataSourceId: 1,
  type: "line",
  title: "Monthly Sales Trend",
  config: { xAxis: "month", yAxis: "sales" },
});
```

### Example 2: Using Templates

```typescript
// Select a template
const template = templates.find(t => t.id === "sales-analytics");

// Create dashboard from template
const dashboard = await createDashboardFromTemplate(template, {
  title: "My Sales Dashboard",
  dataSourceId: selectedDataSource.id,
});
```

### Example 3: AI Analysis

```typescript
// Trigger AI analysis
await apiRequest("POST", `/api/analyze/${dataSourceId}`);

// Query AI assistant
const response = await apiRequest("POST", "/api/assistant/chat", {
  message: "What are the top performing products?",
  context: {
    dashboardId: dashboard.id,
    dataSourceCount: 3,
  },
});
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Login loop | Session cookie issue | Clear cookies, try incognito |
| File upload fails | File too large (>10MB) | Split file or compress |
| Charts not rendering | Missing data columns | Check data source has required columns |
| AI assistant not responding | API quota exceeded | Wait or check OpenAI status |
| Cloud import stuck | OAuth token expired | Reconnect cloud provider |
| Database connection error | Pool exhausted | Restart application |
| Widgets not saving | Validation error | Check browser console for errors |

### Common Error Messages

| Error | Meaning | Action |
|-------|---------|--------|
| `401 Unauthorized` | Not logged in | Redirect to login |
| `403 Forbidden` | No permission | Check ownership |
| `404 Not Found` | Resource missing | Verify ID exists |
| `422 Validation Error` | Invalid input | Check request body |
| `500 Internal Error` | Server issue | Check logs |

---

## Version History & Changelog

### v1.0.0 (January 2025)

**Initial Release**

- Multi-tenant organization support
- File upload (CSV, JSON, Excel)
- Cloud storage integration (Google Drive, OneDrive, Notion)
- Dashboard and widget management
- Chart types: bar, line, area, pie, scatter, stat, table
- AI-powered insights with GPT-4.1-mini
- Replit Auth integration

### v1.1.0 (January 2025)

**Advanced UX Features**

- KPI Cards with animated counters
- SmartAssistant floating chat
- VisualWidgetBuilder 3-step wizard
- TemplateGallery with 6 industry templates
- Framer Motion animations throughout

---

## Style Guide Appendix

### Terminology

| Term | Definition |
|------|------------|
| Dashboard | Collection of widgets displaying data |
| Widget | Individual chart or visualization |
| Data Source | Imported data (file, URL, or cloud) |
| Organization | Multi-user workspace |
| KPI | Key Performance Indicator metric |

### Formatting Conventions

- **File names**: kebab-case (`visual-widget-builder.tsx`)
- **Component names**: PascalCase (`VisualWidgetBuilder`)
- **Function names**: camelCase (`createDashboard`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_FILE_SIZE`)
- **CSS classes**: Tailwind utilities or kebab-case

### Code Style

```typescript
// Imports order
import { useState } from "react";           // React/library imports
import { Button } from "@/components/ui";   // Internal UI imports
import { apiRequest } from "@/lib/utils";   // Utilities
import type { Dashboard } from "@shared/schema";  // Types last

// Component structure
interface Props { }

export function Component({ prop }: Props) {
  // 1. Hooks
  const [state, setState] = useState();
  
  // 2. Derived values
  const computed = useMemo(() => {}, []);
  
  // 3. Event handlers
  const handleClick = () => {};
  
  // 4. Effects
  useEffect(() => {}, []);
  
  // 5. Render
  return <div></div>;
}
```

### Git Commit Messages

```
feat: add visual widget builder
fix: resolve chart rendering on empty data
docs: update API documentation
refactor: consolidate widget dialogs
test: add E2E tests for dashboard flow
```

---

*Documentation generated for DashGen v1.1.0*
*Last updated: January 2025*
