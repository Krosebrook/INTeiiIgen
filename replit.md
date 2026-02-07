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
│   │   ├── app-sidebar.tsx  # Main navigation sidebar (5 items: Home, Data, Studio, Insights, Organizations)
│   │   ├── chart-widget.tsx # Chart visualization component
│   │   ├── dashboard-grid.tsx
│   │   ├── widget-creator.tsx
│   │   └── file-upload-zone.tsx
│   ├── pages/               # Route pages
│   │   ├── dashboard.tsx    # Home / command center with stats + dashboard list
│   │   ├── dashboard-view.tsx
│   │   ├── data.tsx         # Unified data page (sources + upload + cloud tabs)
│   │   ├── new-dashboard.tsx
│   │   ├── insights.tsx     # AI insights
│   │   └── splash.tsx       # Public landing page
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utilities
├── server/
│   ├── routes.ts            # API endpoints
│   ├── storage.ts           # Database operations
│   └── db.ts                # Database connection
└── shared/
    └── schema.ts            # Drizzle schema + types
```

## User Flow (Primary Path)
1. **Add Data** → Upload files, connect cloud, or import URLs (all in /data)
2. **Create Dashboard** → Select data sources, name dashboard, choose layout (/new)
3. **View & Edit** → Interactive dashboard with widgets, AI tooltips (/dashboard/:id)
4. **Get Insights** → AI-powered analysis and recommendations (/insights)

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

### AI Onboarding Agent
- Comprehensive AI-powered onboarding system with per-page guided tours
- Welcome flow modal for first-time users with goal selection
- Floating assistant widget (bottom-right) with 3 tabs: Setup checklist, Page Tour, AI Chat
- SVG spotlight/mask overlay with tooltip cards for step-by-step tours
- Progress tracking persisted in localStorage (completedTours, completedChecklist, dismissed, welcomed)
- AI-powered contextual tips and conversational chat via OpenAI (POST /api/ai/onboarding-tip, /api/ai/onboarding-chat)
- Auto-completing checklist items on upload, dashboard creation, widget creation, insights visit, cloud visit
- Tour steps defined for: Dashboard, Upload, Cloud, Data Sources, New Dashboard, Dashboard View, Insights, Organizations, Studio
- Components: OnboardingProvider, OnboardingOverlay, OnboardingAssistant, WelcomeFlow
- Files: client/src/lib/onboarding-data.ts, client/src/hooks/use-onboarding.tsx, client/src/components/onboarding-*.tsx, client/src/components/welcome-flow.tsx

## Recent Changes
- February 2026: Cloud connector UX overhaul — fixed provider ID routing, added real-time connection status badges, unconnected provider guidance, file type mapping for Notion databases/pages, error handling with retry, and file size display
- February 2026: Enterprise-grade upgrade — added data profiling/explorer, dashboard global filters, 4 new chart types (donut, gauge, funnel, radar), per-widget CSV/PNG export, and natural language query (Ask Your Data) with OpenAI
- February 2026: UX flow overhaul - consolidated sidebar to 5 items (Home, Data, Studio, Insights, Organizations), unified Upload/Cloud/Sources into single Data page with tabs, redesigned Home as command center with stats and guided getting-started flow, improved empty states with clear next-step CTAs throughout
- February 2026: Added comprehensive AI-powered onboarding agent with per-page tours, welcome flow, floating assistant, AI chat, and auto-completing checklist
- February 2026: Added 5 advanced features (Aurora background, Theme selector, AI tooltips, Data table editor, Layout templates)
- January 2026: Added Dashboard Creator Studio (/studio, /studio/:id) for visually building and editing dashboards with widget templates
- January 2026: Added PWA support with service worker, offline detection, lazy loading, upload progress tracking with XHR timeout protection, and draft recovery
- January 2026: Initial implementation with full multi-tenant schema, file upload, cloud connectors, chart widgets, and AI insights integration
