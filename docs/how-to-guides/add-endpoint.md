# How to Add a New API Endpoint

This guide shows how to add a new REST endpoint to DashGen.

---

## Step 1: Define the Schema (if needed)

If your endpoint requires new data types, add them to `shared/schema.ts`:

```typescript
// shared/schema.ts
export const myNewTable = pgTable("my_new_table", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMyNewSchema = createInsertSchema(myNewTable).omit({
  id: true,
  createdAt: true,
});

export type InsertMyNew = z.infer<typeof insertMyNewSchema>;
export type MyNew = typeof myNewTable.$inferSelect;
```

Push schema changes:
```bash
npm run db:push
```

---

## Step 2: Add Storage Methods

Add CRUD operations to `server/storage.ts`:

```typescript
// server/storage.ts
async getMyNewItems(userId: string): Promise<MyNew[]> {
  return db.select()
    .from(myNewTable)
    .where(eq(myNewTable.userId, userId));
}

async createMyNewItem(data: InsertMyNew): Promise<MyNew> {
  const [item] = await db.insert(myNewTable)
    .values(data)
    .returning();
  return item;
}
```

---

## Step 3: Create the Route

Add the endpoint to `server/routes.ts`:

```typescript
// server/routes.ts

// GET - List items
app.get("/api/my-new", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    
    const items = await storage.getMyNewItems(userId);
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// POST - Create item
app.post("/api/my-new", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    
    const parsed = insertMyNewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    
    const item = await storage.createMyNewItem({
      ...parsed.data,
      userId,
    });
    res.status(201).json(item);
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ error: "Failed to create item" });
  }
});
```

---

## Step 4: Document the Endpoint

Create `docs/api/my-new.md`:

```markdown
# My New API

## GET /api/my-new

**Purpose:** List all items for the authenticated user.

**Response (200):** `MyNew[]`

## POST /api/my-new

**Purpose:** Create a new item.

**Request Body:**
\`\`\`typescript
{ name: string }
\`\`\`

**Response (201):** Created item
```

---

## Step 5: Test

1. Restart the dev server: `npm run dev`
2. Test with curl or the frontend
3. Verify error handling works

---

## Checklist

- [ ] Schema added to `shared/schema.ts`
- [ ] Storage methods in `server/storage.ts`
- [ ] Route with `isAuthenticated` middleware
- [ ] userId filtering for data isolation
- [ ] Zod validation for POST/PATCH bodies
- [ ] API documentation created
- [ ] Error handling with appropriate status codes
