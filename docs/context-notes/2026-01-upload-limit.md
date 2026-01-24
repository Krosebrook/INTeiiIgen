# context-notes/2026-01-upload-limit.md

**Date:** 2026-01-24
**Author:** Replit Agent
**Type:** Constraint

## The Rule
Individual file uploads are currently limited by the server's payload capacity and the 30-second XHR timeout on the frontend.

## Why This Matters
Large files (>50MB) may exceed the 30-second timeout implemented in `client/src/pages/upload.tsx`, leading to client-side failures even if the server is still processing.

## The Right Way
For files larger than 10MB, it is recommended to use cloud storage connectors (Google Drive/OneDrive) instead of direct upload.

## Related
- ADR-003: Deployment & Infrastructure
- [Upload Logic Source](@/pages/upload.tsx)
