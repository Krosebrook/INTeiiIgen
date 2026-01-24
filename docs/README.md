# DashGen Documentation

Welcome to the DashGen documentation hub. This documentation follows the Diátaxis framework to provide comprehensive coverage for developers and operators.

**Last Updated:** January 24, 2026

---

## TL;DR

DashGen is an enterprise dashboard generator that accepts files, URLs, or cloud storage imports, visualizes data with interactive charts, and provides AI-powered insights. It supports multi-tenant organizations with role-based access control.

---

## 📚 Documentation Map

### 🚀 Tutorials (Learning-Oriented)
Step-by-step guides for beginners:
- [Getting Started](./tutorials/getting-started.md) - Create your first dashboard

### 🛠️ How-To Guides (Task-Oriented)
Solve specific problems:
- [Deploy to Production](./how-to-guides/deploy.md)
- [Add New API Endpoint](./how-to-guides/add-endpoint.md)

### 📖 Reference (Information-Oriented)
Technical specifications:

**API Documentation:**
- [Data Sources API](./api/data-sources.md) - Upload and manage data
- [Dashboards API](./api/dashboards.md) - Create and share dashboards
- [Widgets API](./api/widgets.md) - Chart configurations
- [Organizations API](./api/organizations.md) - Multi-tenant management
- [AI & Assistant API](./api/ai-assistant.md) - AI analysis and chat
- [Cloud Storage API](./api/cloud-storage.md) - External imports

**Configuration:**
- [Environment Variables](./reference/env-vars.md)

### 💡 Explanation (Understanding-Oriented)
Concepts and background:
- [Architecture Overview](./explanation/architecture-overview.md)

---

## 🏗️ Architecture Decisions (ADRs)
Why we made key technical choices:
- [ADR-001: PostgreSQL + Drizzle ORM](./decisions/ADR-001-database.md)
- [ADR-002: Replit Authentication](./decisions/ADR-002-auth.md)
- [ADR-003: Replit Deployment](./decisions/ADR-003-deployment.md)
- [ADR-004: Cloud Storage Integration](./decisions/ADR-004-cloud-storage.md)

---

## 📝 Engineering Context Notes
Important invariants and constraints:
- [Auth Middleware Invariant](./context-notes/2026-01-auth-middleware.md)
- [Data Ownership Security](./context-notes/2026-01-data-ownership.md)
- [Upload Size Limits](./context-notes/2026-01-upload-limit.md)
- [Rate Limits](./context-notes/2026-01-rate-limits.md)

---

## 📊 Diagrams
Visual system documentation:
- [System Context (C4 Level 1)](./diagrams/system-context.mmd)
- [Container View (C4 Level 2)](./diagrams/container-view.mmd)
- [Auth Flow](./diagrams/auth-flow.mmd)

---

## ❌ Error Catalog
Common errors with fixes:
- [Error Reference](./errors/common-errors.md)

---

## Quick Links

| Resource | Location |
|----------|----------|
| Main codebase | `client/`, `server/`, `shared/` |
| Database schema | `shared/schema.ts` |
| API routes | `server/routes.ts` |
| Storage layer | `server/storage.ts` |
| UI components | `client/src/components/` |

---

## Contributing to Docs

When updating documentation:
1. **ADRs:** Create new ADR for architectural changes
2. **API docs:** Update when endpoints change
3. **Context notes:** Add for new invariants/constraints
4. **Diagrams:** Update when services change

### PR Checklist
- [ ] Updated ADR if architecture changed
- [ ] Updated API docs if endpoints changed
- [ ] Updated diagram if services changed
- [ ] Added context note if adding invariant/constraint
- [ ] Updated error catalog if new error type
