# DashGen - Enterprise Dashboard Generator

## Overview
DashGen is an enterprise-grade dashboard generator platform that accepts any type of input (files, folders, documents, images, spreadsheets, URLs), integrates with cloud storage services (Google Drive, OneDrive, Notion), and generates AI-infused interactive dashboards with visualizations.

## Architecture

### Tech Stack
- **Frontend**: React + TypeScript, Vite, TanStack Query, Wouter routing
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: shadcn/ui, Tailwind CSS, Recharts
- **Authentication**: Replit Auth

### Multi-Tenant Structure
- Organizations with role-based membership (owner, admin, member, viewer)
- Data sources and dashboards scoped by userId and optional organizationId
- All API routes protected with authentication middleware and ownership verification

## Project Structure
```
├── client/src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui base components
│   │   ├── app-sidebar.tsx  # Main navigation sidebar
│   │   ├── chart-widget.tsx # Chart visualization component
│   │   ├── dashboard-grid.tsx
│   │   ├── widget-creator.tsx
│   │   └── file-upload-zone.tsx
│   ├── pages/               # Route pages
│   │   ├── dashboard.tsx    # Dashboard list
│   │   ├── dashboard-view.tsx
│   │   ├── upload.tsx       # File upload
│   │   ├── cloud.tsx        # Cloud storage connectors
│   │   ├── data-sources.tsx
│   │   ├── insights.tsx     # AI insights
│   │   └── landing.tsx
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utilities
├── server/
│   ├── routes.ts            # API endpoints
│   ├── storage.ts           # Database operations
│   └── db.ts                # Database connection
└── shared/
    └── schema.ts            # Drizzle schema + types
```

## Database Schema
- **organizations**: Multi-tenant organization support
- **organization_members**: User-to-organization membership with roles
- **data_sources**: Uploaded files, URLs, cloud imports
- **dashboards**: User-created dashboards
- **widgets**: Chart/visualization widgets on dashboards
- **ai_analyses**: AI-generated insights

## API Endpoints

### Data Sources
- `GET/POST /api/data-sources` - Data source CRUD
- `POST /api/upload` - File upload (CSV, JSON, Excel)
- `POST /api/data-sources/url` - URL import
- `POST /api/data-sources/cloud` - Cloud storage import

### Dashboards
- `GET/POST /api/dashboards` - Dashboard CRUD
- `PATCH /api/dashboards/:id` - Update dashboard (including isPublic, shareToken)
- `GET/POST/PATCH/DELETE /api/widgets` - Widget CRUD
- `GET /api/share/:token` - Public dashboard view (no auth)

### AI & Analytics
- `GET /api/ai-analyses` - AI analysis results (OpenAI GPT-4.1-mini)
- `POST /api/analyze/:sourceId` - Trigger AI analysis of data source
- `POST /api/ai/generate-data` - AI-powered data generation for charts
- `POST /api/ai/tooltip-insight` - Generate insights for chart tooltips

### Cloud Storage
- `GET /api/cloud/:provider/files` - List files from Google Drive, OneDrive, Notion

### Organizations
- `GET/POST /api/organizations` - List/create organizations
- `GET/PATCH/DELETE /api/organizations/:id` - Organization CRUD
- `GET/POST/PATCH/DELETE /api/organizations/:id/members` - Member management

## Security
- All routes use `isAuthenticated` middleware
- Data sources/dashboards require userId ownership
- Widget operations verify dashboard ownership
- Share tokens for public dashboard access

## Running the Project
```bash
npm run dev        # Start development server (port 5000)
npm run db:push    # Push schema changes to database
```

## Documentation
See `DOCS.md` for complete documentation including:
- Architecture diagrams and tech stack details
- API endpoint reference with examples
- User flows and component documentation
- Security, testing, and deployment guides
- Troubleshooting and style guide

## PWA Support
- Progressive Web App with manifest.json and service worker
- Cache-first strategy for static assets, network-first for API calls
- Offline banner with retry functionality
- LocalStorage draft recovery for interrupted uploads

## API Endpoints

### Health & Monitoring
- `GET /api/health` - Health check endpoint for monitoring

## Advanced Features

### Aurora Background
- Animated gradient background for landing page visual polish
- CSS-based with 4 animated blob layers
- Configurable opacity and animation speed

### Dashboard Theme System
- 5 theme variants: minimal, glass, dark, corporate, colorful
- Per-widget theme application via DashboardThemeSelector
- CSS custom properties for consistent theming

### AI Interactive Tooltips
- On-hover AI insights for chart data points
- Real-time API calls to OpenAI for contextual analysis
- Graceful fallback with mock insights on failure

### Data Table Editor
- Inline cell editing for chart data
- AI-powered data generation with natural language prompts
- CSV export functionality
- Add/delete row operations

### Layout Templates
- 5 pre-built dashboard layouts (Executive Overview, Sales Performance, Analytics, Data Table Focus, Comparison View)
- One-click template application with auto-widget creation
- Default data included for immediate visualization

## Recent Changes
- February 2026: Added 5 advanced features (Aurora background, Theme selector, AI tooltips, Data table editor, Layout templates)
- January 2026: Added Dashboard Creator Studio (/studio, /studio/:id) for visually building and editing dashboards with widget templates
- January 2026: Added PWA support with service worker, offline detection, lazy loading, upload progress tracking with XHR timeout protection, and draft recovery
- January 2026: Initial implementation with full multi-tenant schema, file upload, cloud connectors, chart widgets, and AI insights integration
