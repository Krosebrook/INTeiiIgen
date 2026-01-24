# Error Catalog

Common errors in DashGen with causes, fixes, and retry guidance.

---

## Error: UNAUTHORIZED (401)

### Cause
Request made without valid session cookie or session has expired.

### Fix
**User:** Re-login by clicking "Login with Replit"

**Developer:** Ensure `isAuthenticated` middleware is applied and `SESSION_SECRET` is configured.

### Retry
Yes - after re-authentication.

---

## Error: DATA_SOURCE_NOT_FOUND (404)

### Cause
Requested data source ID doesn't exist or belongs to another user.

### Fix
1. Verify the data source ID is correct
2. Check ownership - users can only access their own data sources
3. If deleted, re-upload the file

### Retry
No - unless data source is recreated.

---

## Error: UPLOAD_TIMEOUT

### Cause
File upload exceeded 30-second timeout limit.

### Fix
**Immediate:**
- Use smaller file (<10MB recommended)
- Use cloud storage import instead (Google Drive, OneDrive)

**Long-term:**
- Split large datasets into chunks
- Pre-process on client before upload

### Retry
Yes - with smaller file or via cloud import.

---

## Error: NO_ANALYZABLE_DATA (400)

### Cause
Data source has no parseable data for AI analysis.

### Fix
1. Verify file was parsed correctly (check Data Sources page)
2. Ensure file contains valid CSV/JSON/Excel data
3. Re-upload with proper formatting

### Retry
No - fix data format first.

---

## Error: DATABASE_CONNECTION_FAILED

### Cause
PostgreSQL connection pool exhausted or database unreachable.

### Fix
**Immediate:**
1. Check Replit database status
2. Restart the application workflow

**Long-term:**
- Reduce connection pool size in high-concurrency scenarios
- Implement connection retry logic

### Retry
Yes - with exponential backoff (1s → 2s → 4s → max 16s).

---

## Error: CLOUD_PROVIDER_NOT_CONNECTED (400)

### Cause
Attempted to access files from a cloud provider without OAuth authorization.

### Fix
1. Go to **Cloud** page in DashGen
2. Click **Connect** for the desired provider
3. Complete OAuth authorization
4. Retry file listing

### Retry
Yes - after completing OAuth flow.

---

## Error: DASHBOARD_NOT_PUBLIC (404)

### Cause
Attempted to access a dashboard via share link but public sharing is disabled.

### Fix
Dashboard owner must:
1. Open the dashboard
2. Click **Share**
3. Enable **Public** toggle

### Retry
Yes - after owner enables public sharing.

---

## Error: ORGANIZATION_ACCESS_DENIED (403)

### Cause
User attempted an action requiring higher permissions (admin/owner).

### Fix
Request role upgrade from organization owner:
- `admin`: Can manage members
- `owner`: Full control

### Retry
No - requires permission change.

---

## Error: NETWORK_ERROR

### Cause
Client-side network connectivity issue.

### Fix
1. Check internet connection
2. Retry with the **Retry** button in offline banner
3. Check if service worker needs update

### Retry
Yes - automatically when connection restored.

---

## Related
- [Getting Started](../tutorials/getting-started.md)
- [API Reference](../api/)
