# Architecture Overview

DashGen is an enterprise dashboard generator built on a modern full-stack architecture optimized for the Replit platform.

---

## TL;DR

DashGen accepts data from files, URLs, or cloud storage, stores it in PostgreSQL, and renders interactive visualizations with AI-powered insights. It supports multi-tenant organizations with role-based access control.

**Target audience:** Developers joining the project who need to understand the system architecture quickly.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User's Browser                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  React SPA (Vite) + Service Worker (PWA)            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (Port 5000)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Replit Container                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Express.js API Server                              │   │
│  │  - REST endpoints                                   │   │
│  │  - Replit Auth middleware                           │   │
│  │  - Multer file uploads                              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  PostgreSQL   │   │   OpenAI API    │   │  Cloud Storage  │
│  (Neon)       │   │   GPT-4.1-mini  │   │  GDrive/OneDrive│
│  Drizzle ORM  │   │   AI Insights   │   │  Notion         │
└───────────────┘   └─────────────────┘   └─────────────────┘
```

---

## Core Components

### Frontend (client/)
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Routing:** Wouter (lightweight)
- **State:** TanStack Query (server state)
- **UI:** shadcn/ui + Tailwind CSS
- **Charts:** Recharts
- **PWA:** Service worker with cache-first strategy

### Backend (server/)
- **Framework:** Express.js
- **ORM:** Drizzle (type-safe SQL)
- **Auth:** Replit Auth (session-based)
- **File Handling:** Multer (in-memory)
- **AI:** OpenAI SDK

### Database (PostgreSQL)
- **Provider:** Neon (Replit-managed)
- **Schema:** Drizzle with zod validation
- **Tables:** organizations, members, data_sources, dashboards, widgets, ai_analyses

---

## Data Flow

### Upload Flow
```
User → FileUploadZone → XHR POST /api/upload → Multer → Parse CSV/JSON/Excel → PostgreSQL
```

### Dashboard Rendering
```
React Query → GET /api/dashboards/:id → Storage Layer → PostgreSQL → Widgets → Recharts
```

### AI Analysis
```
POST /api/data-sources/:id/analyze → Sample 20 rows → OpenAI API → Store analysis → Return
```

---

## Multi-Tenancy Model

```
Organization (1) ──────< OrganizationMember (n) >────── User (1)
      │                         │
      │                    role: owner|admin|member|viewer
      │
      └──────< Dashboard (n)
      └──────< DataSource (n)
```

- **Users** can belong to multiple organizations
- **Data isolation** enforced via userId filtering
- **Role-based access** for organization operations

---

## Security Model

1. **Authentication:** Replit Auth (session cookies)
2. **Authorization:** Middleware + ownership verification
3. **Data Isolation:** All queries filter by userId
4. **Public Sharing:** Opt-in via share tokens

See: [ADR-002: Authentication](../decisions/ADR-002-auth.md)

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | PostgreSQL + Drizzle | Type-safety, Replit integration |
| Auth | Replit Auth | Zero-config, secure |
| Hosting | Replit Autoscale | Integrated, simple deployments |
| Cloud Storage | OAuth integrations | Enterprise compatibility |
| AI | OpenAI GPT-4.1-mini | Cost-effective, capable |

---

## Related Documentation
- [System Context Diagram](../diagrams/system-context.mmd)
- [Container Diagram](../diagrams/container-view.mmd)
- [All ADRs](../decisions/)
