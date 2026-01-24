# Organizations API

Multi-tenant organization management for team collaboration.

## GET /api/organizations

**Purpose:** List all organizations the user belongs to.

**Response (200):** `Organization[]`

---

## GET /api/organizations/:id

**Purpose:** Retrieve a specific organization.

**Response (200):**
```typescript
interface Organization {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## POST /api/organizations

**Purpose:** Create a new organization (user becomes owner).

**Request Body:**
```typescript
{
  name: string;
  slug: string;  // URL-friendly identifier
}
```

**Response (201):** Created Organization object

---

## PATCH /api/organizations/:id

**Purpose:** Update organization details (owner/admin only).

**Request Body:**
```typescript
{
  name?: string;
  slug?: string;
}
```

---

## DELETE /api/organizations/:id

**Purpose:** Delete an organization (owner only).

**Response (200):**
```typescript
{ "message": "Organization deleted" }
```

---

# Organization Members API

## GET /api/organizations/:id/members

**Purpose:** List all members of an organization.

**Response (200):**
```typescript
interface OrganizationMember {
  id: number;
  userId: string;
  organizationId: number;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  createdAt: string;
}
```

---

## POST /api/organizations/:id/members

**Purpose:** Add a member to the organization (admin/owner only).

**Request Body:**
```typescript
{
  userId: string;
  role: 'admin' | 'member' | 'viewer';
}
```

---

## PATCH /api/organizations/:id/members/:memberId

**Purpose:** Update a member's role.

**Request Body:**
```typescript
{
  role: 'admin' | 'member' | 'viewer';
}
```

---

## DELETE /api/organizations/:id/members/:memberId

**Purpose:** Remove a member from the organization.

**Response (200):**
```typescript
{ "message": "Member removed" }
```

---

## Role Permissions

| Role | View | Edit | Manage Members | Delete Org |
|------|------|------|----------------|------------|
| viewer | ✅ | ❌ | ❌ | ❌ |
| member | ✅ | ✅ | ❌ | ❌ |
| admin | ✅ | ✅ | ✅ | ❌ |
| owner | ✅ | ✅ | ✅ | ✅ |
