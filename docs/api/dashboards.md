# Dashboards API

## GET /api/dashboards

**Purpose:** Retrieve all dashboards owned by the authenticated user.

**Auth Required:** Yes (Replit Auth)

**Response (200):**
```typescript
Dashboard[]
```

---

## GET /api/dashboards/:id

**Purpose:** Retrieve a specific dashboard by ID.

**Response (200):**
```typescript
interface Dashboard {
  id: number;
  userId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
}
```

**Response (404):**
```typescript
{ "error": "Dashboard not found" }
```

---

## POST /api/dashboards

**Purpose:** Create a new dashboard.

**Request Body:**
```typescript
{
  name: string;          // Required
  description?: string;  // Optional
}
```

**Response (201):** Created Dashboard object

---

## PATCH /api/dashboards/:id

**Purpose:** Update dashboard properties (name, description, public sharing).

**Request Body:**
```typescript
{
  name?: string;
  description?: string;
  isPublic?: boolean;    // Enable/disable public sharing
  shareToken?: string;   // Set custom share token
}
```

**Response (200):** Updated Dashboard object

---

## DELETE /api/dashboards/:id

**Purpose:** Delete a dashboard and all its widgets.

**Response (200):**
```typescript
{ "message": "Dashboard deleted" }
```

---

## POST /api/dashboards/:id/insights

**Purpose:** Generate AI insights for the dashboard.

**Response (200):**
```typescript
{ "message": "Dashboard insights generated" }
```

---

## GET /api/dashboards/:id/widgets

**Purpose:** Retrieve all widgets for a specific dashboard.

**Response (200):** `Widget[]`

---

## GET /api/share/:token

**Purpose:** Retrieve a public dashboard by its share token (no auth required).

**Response (200):**
```typescript
{
  dashboard: Dashboard;
  widgets: Widget[];
}
```

**Response (404):**
```typescript
{ "error": "Dashboard not found or not public" }
```
