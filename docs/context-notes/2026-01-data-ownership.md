# context-notes/2026-01-data-ownership.md

**Date:** 2026-01-24
**Author:** Replit Agent
**Type:** Security Invariant

## The Rule
ALL database queries for user data MUST filter by `userId` to ensure data isolation between users.

## Why This Matters
Without userId filtering, users could access other users' data sources, dashboards, and organizations through enumerable IDs.

## The Right Way
```typescript
// CORRECT: Always filter by userId
const sources = await storage.getDataSources(userId);
const dashboard = await storage.getDashboard(dashboardId, userId);

// Storage implementation
async getDataSources(userId: string) {
  return db.select()
    .from(dataSources)
    .where(eq(dataSources.userId, userId));
}
```

## What Could Break
```typescript
// WRONG: No userId filter - exposes all data
async getDataSource(id: number) {
  return db.select()
    .from(dataSources)
    .where(eq(dataSources.id, id)); // Anyone could access!
}
```

## How to Verify
1. Review all storage methods in `server/storage.ts`
2. Ensure every query includes userId filter
3. Check for IDOR vulnerabilities in API routes

## Related
- ADR-001: Database Design
- Storage Layer: `server/storage.ts`
