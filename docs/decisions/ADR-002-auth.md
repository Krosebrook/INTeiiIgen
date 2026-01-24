# [ADR-002] Use Replit Auth for Authentication

## Status
Accepted | 2026-01-24

## Context and Problem Statement
DashGen requires user authentication to protect data sources, dashboards, and organization data. We need a solution that integrates seamlessly with the Replit hosting environment and requires minimal configuration.

## Decision Drivers
- Zero-configuration authentication
- Secure session management
- Works out-of-the-box on Replit
- No need to manage OAuth credentials

## Considered Options
1. Replit Auth (built-in)
2. Auth0 / Clerk (third-party)
3. Custom JWT implementation

## Decision Outcome
**Chosen:** Replit Auth

**Rationale:**
- Native integration with Replit environment - no setup required
- Handles session cookies automatically via `SESSION_SECRET`
- User claims available via `req.user.claims` in Express middleware
- Supports Google login out-of-the-box

## Consequences

### Positive
- Zero OAuth configuration required
- Secure session management handled by platform
- `isAuthenticated` middleware protects all routes uniformly
- User ID (`claims.sub`) serves as foreign key for all user data

### Negative
- Tied to Replit platform (mitigation: standard session patterns are portable)
- Limited customization of login UI

## Implementation Details
```typescript
// Middleware usage
app.get("/api/protected", isAuthenticated, (req, res) => {
  const userId = req.user?.claims?.sub;
  // ...
});
```

## Security Notes
- SESSION_SECRET must be a strong random string (min 32 chars)
- All API routes except `/api/health` and `/api/share/:token` require authentication

## Links
- Replit Auth Docs: https://docs.replit.com/category/authentication
- Middleware: `server/replitAuth.ts`
