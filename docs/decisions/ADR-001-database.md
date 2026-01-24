# [ADR-001] Use PostgreSQL with Drizzle ORM

## Status
Accepted | 2026-01-24

## Context and Problem Statement
DashGen requires a robust relational database to handle multi-tenant organization structures, user ownership of data sources, and complex dashboard configurations. We need a solution that is type-safe and integrates well with the Replit environment.

## Decision Drivers
- Type safety across frontend and backend (TypeScript)
- Ease of schema migrations
- Built-in support within Replit
- Performance for analytical queries

## Considered Options
1. PostgreSQL + Drizzle ORM
2. PostgreSQL + Prisma
3. MongoDB (NoSQL)

## Decision Outcome
**Chosen:** PostgreSQL + Drizzle ORM

**Rationale:**
- Drizzle provides a "closer-to-SQL" experience while maintaining full TypeScript type safety.
- Extremely lightweight compared to Prisma (no heavy engine binary).
- Native support for Replit's Postgres integration.
- Schema defined in TypeScript serves as the single source of truth for the entire stack.

## Consequences

### Positive
- Unified types between database and frontend (via `shared/schema.ts`).
- Fast development cycle with `db:push`.
- SQL-like flexibility for complex dashboard queries.

### Negative
- Manual control over joins required (compared to Prisma's nested includes).

## Links
- Drizzle Docs: https://orm.drizzle.team
- Schema: `shared/schema.ts`
