# context-notes/2026-01-rate-limits.md

**Date:** 2026-01-24
**Author:** Replit Agent
**Type:** Constraint

## The Rule
The following rate limits and constraints apply to DashGen:

| Resource | Limit | Reason |
|----------|-------|--------|
| File upload size | ~10MB recommended | 30s XHR timeout |
| Files per upload | 10 | Multer configuration |
| AI analysis sample | 20 rows | Token optimization |
| Chat message | 2000 chars | Input validation |

## Why This Matters
- Large uploads may timeout before completing (30s XHR limit)
- AI token costs scale with data size
- Prevents abuse of OpenAI API

## Workarounds
- **Large files**: Use cloud storage import instead of direct upload
- **Full dataset analysis**: Export sample, analyze, then apply to full data
- **Long messages**: Break into multiple shorter messages

## How to Verify
Check configuration in:
- `client/src/pages/upload.tsx` (UPLOAD_TIMEOUT_MS)
- `server/routes.ts` (multer limits, chat schema)

## Related
- ADR-004: Cloud Storage Integration
- Upload timeout context note
