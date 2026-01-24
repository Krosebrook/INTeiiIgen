# [ADR-004] Integrate Google Drive, OneDrive, and Notion

## Status
Accepted | 2026-01-24

## Context and Problem Statement
Users want to import data from their existing cloud storage providers rather than uploading files manually. We need OAuth-based integrations that respect user permissions.

## Decision Drivers
- Support enterprise cloud storage (Google Workspace, Microsoft 365)
- OAuth 2.0 for secure authorization
- Read-only access to user files
- Support for structured data (Notion databases)

## Considered Options
1. Native OAuth integrations (Google Drive, OneDrive, Notion)
2. Third-party aggregator (Rclone, Filepicker.io)
3. Manual file upload only

## Decision Outcome
**Chosen:** Native OAuth integrations via Replit connectors

**Rationale:**
- Replit provides pre-built connectors with secret management
- Each provider's API accessed directly for maximum flexibility
- User authorizes specific scopes (read-only file access)
- Token refresh handled automatically

## Implementation Details

### Supported Providers
| Provider | Data Types | API |
|----------|------------|-----|
| Google Drive | CSV, JSON, Excel, Sheets | Google Drive API v3 |
| OneDrive | CSV, JSON, Excel | Microsoft Graph API |
| Notion | Databases, Pages | Notion API |

### File Listing Endpoint
```
GET /api/cloud/:provider/files?folderId=optional
```

### Import Endpoint
```
POST /api/data-sources/cloud
Body: { provider, fileId, fileName }
```

## Consequences

### Positive
- Users can import data without downloading/uploading
- OAuth tokens managed securely in Replit secrets
- Folder navigation supported for Google Drive and OneDrive

### Negative
- Each provider requires separate OAuth configuration
- Notion structure differs from file-based providers

## Security Notes
- OAuth tokens stored as secrets, never in database
- Minimal scopes requested (read-only file access)
- Connection status checked before listing files

## Links
- Google Drive API: https://developers.google.com/drive/api
- Microsoft Graph: https://docs.microsoft.com/graph
- Notion API: https://developers.notion.com
