import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, jsonb, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";
export * from "./models/chat";

// Dashboard Generator Schema

// Organizations - multi-tenant support
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  ownerId: varchar("owner_id").notNull(), // Creator/owner of the org
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Organization members - user-to-org mapping
export const organizationMembers = pgTable("organization_members", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(),
  role: text("role").default("member").notNull(), // 'owner', 'admin', 'member', 'viewer'
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index("idx_org_member_user").on(table.userId),
  index("idx_org_member_org").on(table.organizationId),
]);

// Data sources - files, URLs, cloud storage references
export const dataSources = pgTable("data_sources", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'file', 'url', 'google_drive', 'onedrive', 'notion', 'database'
  fileType: text("file_type"), // 'csv', 'json', 'xlsx', 'image', 'pdf', 'markdown'
  sourceUrl: text("source_url"), // URL or cloud reference
  rawData: jsonb("raw_data"), // Parsed data
  metadata: jsonb("metadata"), // File size, rows, columns, etc.
  status: text("status").default("pending").notNull(), // 'pending', 'processing', 'ready', 'error'
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index("idx_data_source_user").on(table.userId),
  index("idx_data_source_org").on(table.organizationId),
]);

// Dashboards - collections of widgets
export const dashboards = pgTable("dashboards", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false).notNull(),
  shareToken: varchar("share_token").unique(),
  layout: jsonb("layout"), // Grid layout configuration
  theme: text("theme").default("default"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index("idx_dashboard_user").on(table.userId),
  index("idx_dashboard_org").on(table.organizationId),
]);

// Widgets - individual chart/data components within a dashboard
export const widgets = pgTable("widgets", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id").notNull().references(() => dashboards.id, { onDelete: "cascade" }),
  dataSourceId: integer("data_source_id").references(() => dataSources.id, { onDelete: "set null" }),
  type: text("type").notNull(), // 'bar', 'line', 'pie', 'scatter', 'area', 'table', 'stat', 'text'
  title: text("title").notNull(),
  config: jsonb("config").notNull(), // Chart configuration: axes, colors, filters, etc.
  position: jsonb("position").notNull(), // {x, y, w, h} for grid layout
  layers: jsonb("layers"), // Additional visualization layers [{type, config, label}]
  referenceLines: jsonb("reference_lines"), // [{axis, value, label, color, style}]
  annotations: jsonb("annotations"), // [{dataIndex, label, description}]
  aiInsights: text("ai_insights"), // AI-generated insights about the data
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// AI Analysis results - cached insights
export const aiAnalyses = pgTable("ai_analyses", {
  id: serial("id").primaryKey(),
  dataSourceId: integer("data_source_id").notNull().references(() => dataSources.id, { onDelete: "cascade" }),
  analysisType: text("analysis_type").notNull(), // 'summary', 'trends', 'anomalies', 'recommendations'
  result: jsonb("result").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  dataSources: many(dataSources),
  dashboards: many(dashboards),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
}));

export const dataSourcesRelations = relations(dataSources, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [dataSources.organizationId],
    references: [organizations.id],
  }),
  widgets: many(widgets),
  aiAnalyses: many(aiAnalyses),
}));

export const dashboardsRelations = relations(dashboards, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [dashboards.organizationId],
    references: [organizations.id],
  }),
  widgets: many(widgets),
}));

export const widgetsRelations = relations(widgets, ({ one }) => ({
  dashboard: one(dashboards, {
    fields: [widgets.dashboardId],
    references: [dashboards.id],
  }),
  dataSource: one(dataSources, {
    fields: [widgets.dataSourceId],
    references: [dataSources.id],
  }),
}));

export const aiAnalysesRelations = relations(aiAnalyses, ({ one }) => ({
  dataSource: one(dataSources, {
    fields: [aiAnalyses.dataSourceId],
    references: [dataSources.id],
  }),
}));

// Insert schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrganizationMemberSchema = createInsertSchema(organizationMembers).omit({
  id: true,
  createdAt: true,
});

export const insertDataSourceSchema = createInsertSchema(dataSources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDashboardSchema = createInsertSchema(dashboards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWidgetSchema = createInsertSchema(widgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiAnalysisSchema = createInsertSchema(aiAnalyses).omit({
  id: true,
  createdAt: true,
});

// Types
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type InsertOrganizationMember = z.infer<typeof insertOrganizationMemberSchema>;
export type DataSource = typeof dataSources.$inferSelect;
export type InsertDataSource = z.infer<typeof insertDataSourceSchema>;
export type Dashboard = typeof dashboards.$inferSelect;
export type InsertDashboard = z.infer<typeof insertDashboardSchema>;
export type Widget = typeof widgets.$inferSelect;
export type InsertWidget = z.infer<typeof insertWidgetSchema>;
export type AiAnalysis = typeof aiAnalyses.$inferSelect;
export type InsertAiAnalysis = z.infer<typeof insertAiAnalysisSchema>;

// Widget configuration types
export const widgetConfigSchema = z.object({
  xAxis: z.string().optional(),
  yAxis: z.string().optional(),
  groupBy: z.string().optional(),
  aggregation: z.enum(["sum", "avg", "count", "min", "max"]).optional(),
  colors: z.array(z.string()).optional(),
  showLegend: z.boolean().optional(),
  showGrid: z.boolean().optional(),
  dateRange: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }).optional(),
  filters: z.array(z.object({
    field: z.string(),
    operator: z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "contains"]),
    value: z.union([z.string(), z.number()]),
  })).optional(),
  statValue: z.string().optional(),
  statLabel: z.string().optional(),
  textContent: z.string().optional(),
});

export type WidgetConfig = z.infer<typeof widgetConfigSchema>;

export const visualizationLayerSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string().optional(),
  config: widgetConfigSchema.optional(),
});

export type VisualizationLayer = z.infer<typeof visualizationLayerSchema>;

export const referenceLineSchema = z.object({
  id: z.string(),
  axis: z.enum(["x", "y"]),
  value: z.union([z.string(), z.number()]),
  label: z.string().optional(),
  color: z.string().optional(),
  style: z.enum(["solid", "dashed", "dotted"]).optional(),
});

export type ReferenceLine = z.infer<typeof referenceLineSchema>;

export const annotationSchema = z.object({
  id: z.string(),
  dataIndex: z.number(),
  label: z.string(),
  description: z.string().optional(),
});

export type Annotation = z.infer<typeof annotationSchema>;

// Position schema for grid layout
export const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
});

export type Position = z.infer<typeof positionSchema>;
