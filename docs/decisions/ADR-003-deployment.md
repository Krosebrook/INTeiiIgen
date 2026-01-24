# [ADR-003] Deploy on Replit with Autoscale

## Status
Accepted | 2026-01-24

## Context and Problem Statement
DashGen needs a deployment platform that supports Node.js, PostgreSQL, and handles scaling automatically. Team wants to minimize DevOps overhead.

## Decision Drivers
- Integrated PostgreSQL database
- Zero-config deployments
- Automatic HTTPS and domain management
- Cost-effective for MVP stage

## Considered Options
1. Replit Autoscale Deployments
2. Vercel + External PostgreSQL
3. Railway
4. Self-hosted VPS

## Decision Outcome
**Chosen:** Replit Autoscale Deployments

**Rationale:**
- Native PostgreSQL integration (Neon-backed)
- Development and production in same environment
- Automatic SSL/TLS certificates
- Built-in secrets management
- Instant rollback via checkpoints

## Consequences

### Positive
- Database URL auto-configured via `DATABASE_URL` env var
- Same codebase runs in dev and prod
- Health checks supported via `/api/health`
- PWA manifest and service worker deploy automatically

### Negative
- Limited to Replit's infrastructure regions
- Always-on pricing may be higher than serverless for low traffic

## Deployment Notes
- Frontend: Vite builds to `dist/public/`
- Backend: Express serves on port 5000
- Database: PostgreSQL (Neon) with automatic connection pooling

## Links
- Replit Deployments: https://docs.replit.com/hosting/deployments
- Health endpoint: `GET /api/health`
