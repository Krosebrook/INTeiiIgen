# Data Sources API

## POST /api/upload

**Purpose:** Upload files (CSV, JSON, Excel) to be used as dashboard data sources.

**Auth Required:** Yes (Replit Auth)

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:** `files` (one or more files)

**Response (200):**
```typescript
{
  "message": "Upload successful",
  "count": number
}
```

**Response (400):**
```typescript
{
  "error": "No files uploaded"
}
```

## GET /api/data-sources

**Purpose:** Retrieve all data sources owned by the authenticated user or their organization.

**Response (200):** `DataSource[]` (See shared/schema.ts)
