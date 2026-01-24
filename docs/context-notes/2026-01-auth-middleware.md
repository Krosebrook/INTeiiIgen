# context-notes/2026-01-auth-middleware.md

**Date:** 2026-01-24
**Author:** Replit Agent
**Type:** Security Invariant

## The Rule
ALL API routes MUST use the `isAuthenticated` middleware EXCEPT:
- `GET /api/health` (monitoring)
- `GET /api/share/:token` (public dashboard viewing)

## Why This Matters
Unauthenticated access to data endpoints would expose user data sources, dashboards, and organization information. The middleware ensures `req.user.claims.sub` is always available for ownership verification.

## The Right Way
```typescript
// CORRECT: Protected endpoint
app.get("/api/data-sources", isAuthenticated, async (req, res) => {
  const userId = req.user?.claims?.sub;
  // Query scoped to userId
});

// CORRECT: Public endpoint (explicitly documented)
app.get("/api/share/:token", async (req, res) => {
  // No auth required - uses share token instead
});
```

## What Could Break
```typescript
// WRONG: Missing isAuthenticated
app.get("/api/dashboards", async (req, res) => {
  // userId would be undefined!
});
```

## How to Verify
1. Check all routes in `server/routes.ts` have `isAuthenticated` middleware
2. Run security audit: `grep -n "app\.\(get\|post\|patch\|delete\)" server/routes.ts`
3. Verify only whitelisted routes lack middleware

## Related
- ADR-002: Authentication Strategy
- Middleware: `server/replitAuth.ts`
