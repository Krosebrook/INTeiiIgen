# Cloud Storage API

Connect to external cloud storage providers to import data.

## GET /api/cloud/status

**Purpose:** Check connection status for all cloud providers.

**Response (200):**
```typescript
{
  "google-drive": { connected: boolean },
  "onedrive": { connected: boolean },
  "notion": { connected: boolean }
}
```

---

## GET /api/cloud/:provider/files

**Purpose:** List files from a connected cloud provider.

**Path Parameters:**
- `provider`: `google-drive` | `onedrive` | `notion`

**Query Parameters:**
- `folderId`: (optional) Folder ID to browse into

**Response (200):**
```typescript
interface CloudFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  modifiedTime?: string;
  isFolder: boolean;
}
```

**Response (400):**
```typescript
{ "error": "Provider not connected" }
```

---

## POST /api/data-sources/cloud

**Purpose:** Import a file from cloud storage as a data source.

**Request Body:**
```typescript
{
  provider: 'google-drive' | 'onedrive' | 'notion';
  fileId: string;
  fileName: string;
}
```

**Response (201):** Created DataSource object

---

## Supported File Types

| Provider | Supported Formats |
|----------|-------------------|
| Google Drive | CSV, JSON, XLSX, Google Sheets |
| OneDrive | CSV, JSON, XLSX |
| Notion | Databases, Pages (as JSON) |

---

## OAuth Flow

1. User clicks "Connect" for a provider
2. Redirected to provider's OAuth consent screen
3. After approval, tokens stored securely in Replit secrets
4. Status endpoint returns `connected: true`

**Note:** OAuth configuration is managed via Replit integrations. No manual credential setup required.
