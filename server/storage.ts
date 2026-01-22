import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import {
  type User,
  type UpsertUser,
  type DataSource,
  type InsertDataSource,
  type Dashboard,
  type InsertDashboard,
  type Widget,
  type InsertWidget,
  type AiAnalysis,
  type InsertAiAnalysis,
  dataSources,
  dashboards,
  widgets,
  aiAnalyses,
} from "@shared/schema";

export interface IStorage {
  // Data Sources
  getDataSources(userId: string): Promise<DataSource[]>;
  getDataSource(id: number, userId: string): Promise<DataSource | undefined>;
  createDataSource(dataSource: InsertDataSource): Promise<DataSource>;
  updateDataSource(id: number, userId: string, data: Partial<DataSource>): Promise<DataSource | undefined>;
  deleteDataSource(id: number, userId: string): Promise<boolean>;

  // Dashboards
  getDashboards(userId: string): Promise<Dashboard[]>;
  getDashboard(id: number, userId: string): Promise<Dashboard | undefined>;
  getDashboardByShareToken(shareToken: string): Promise<Dashboard | undefined>;
  createDashboard(dashboard: InsertDashboard): Promise<Dashboard>;
  updateDashboard(id: number, userId: string, data: Partial<Dashboard>): Promise<Dashboard | undefined>;
  deleteDashboard(id: number, userId: string): Promise<boolean>;

  // Widgets
  getWidgets(dashboardId: number): Promise<Widget[]>;
  getWidget(id: number): Promise<Widget | undefined>;
  createWidget(widget: InsertWidget): Promise<Widget>;
  updateWidget(id: number, data: Partial<Widget>): Promise<Widget | undefined>;
  deleteWidget(id: number): Promise<boolean>;

  // AI Analyses
  getAiAnalyses(userId: string): Promise<AiAnalysis[]>;
  getAiAnalysesByDataSource(dataSourceId: number): Promise<AiAnalysis[]>;
  createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis>;
}

export class DatabaseStorage implements IStorage {
  // Data Sources
  async getDataSources(userId: string): Promise<DataSource[]> {
    return db
      .select()
      .from(dataSources)
      .where(eq(dataSources.userId, userId))
      .orderBy(desc(dataSources.createdAt));
  }

  async getDataSource(id: number, userId: string): Promise<DataSource | undefined> {
    const [result] = await db
      .select()
      .from(dataSources)
      .where(and(eq(dataSources.id, id), eq(dataSources.userId, userId)));
    return result;
  }

  async createDataSource(dataSource: InsertDataSource): Promise<DataSource> {
    const [result] = await db.insert(dataSources).values(dataSource).returning();
    return result;
  }

  async updateDataSource(id: number, userId: string, data: Partial<DataSource>): Promise<DataSource | undefined> {
    const [result] = await db
      .update(dataSources)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(dataSources.id, id), eq(dataSources.userId, userId)))
      .returning();
    return result;
  }

  async deleteDataSource(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(dataSources)
      .where(and(eq(dataSources.id, id), eq(dataSources.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Dashboards
  async getDashboards(userId: string): Promise<Dashboard[]> {
    return db
      .select()
      .from(dashboards)
      .where(eq(dashboards.userId, userId))
      .orderBy(desc(dashboards.createdAt));
  }

  async getDashboard(id: number, userId: string): Promise<Dashboard | undefined> {
    const [result] = await db
      .select()
      .from(dashboards)
      .where(and(eq(dashboards.id, id), eq(dashboards.userId, userId)));
    return result;
  }

  async getDashboardByShareToken(shareToken: string): Promise<Dashboard | undefined> {
    const [result] = await db
      .select()
      .from(dashboards)
      .where(eq(dashboards.shareToken, shareToken));
    return result;
  }

  async createDashboard(dashboard: InsertDashboard): Promise<Dashboard> {
    const [result] = await db.insert(dashboards).values(dashboard).returning();
    return result;
  }

  async updateDashboard(id: number, userId: string, data: Partial<Dashboard>): Promise<Dashboard | undefined> {
    const [result] = await db
      .update(dashboards)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(dashboards.id, id), eq(dashboards.userId, userId)))
      .returning();
    return result;
  }

  async deleteDashboard(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(dashboards)
      .where(and(eq(dashboards.id, id), eq(dashboards.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Widgets
  async getWidgets(dashboardId: number): Promise<Widget[]> {
    return db
      .select()
      .from(widgets)
      .where(eq(widgets.dashboardId, dashboardId))
      .orderBy(widgets.createdAt);
  }

  async getWidget(id: number): Promise<Widget | undefined> {
    const [result] = await db.select().from(widgets).where(eq(widgets.id, id));
    return result;
  }

  async createWidget(widget: InsertWidget): Promise<Widget> {
    const [result] = await db.insert(widgets).values(widget).returning();
    return result;
  }

  async updateWidget(id: number, data: Partial<Widget>): Promise<Widget | undefined> {
    const [result] = await db
      .update(widgets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(widgets.id, id))
      .returning();
    return result;
  }

  async deleteWidget(id: number): Promise<boolean> {
    const result = await db.delete(widgets).where(eq(widgets.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // AI Analyses
  async getAiAnalyses(userId: string): Promise<AiAnalysis[]> {
    const userSources = await this.getDataSources(userId);
    const sourceIds = userSources.map((s) => s.id);
    
    if (sourceIds.length === 0) return [];

    const results: AiAnalysis[] = [];
    for (const sourceId of sourceIds) {
      const analyses = await db
        .select()
        .from(aiAnalyses)
        .where(eq(aiAnalyses.dataSourceId, sourceId))
        .orderBy(desc(aiAnalyses.createdAt));
      results.push(...analyses);
    }
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAiAnalysesByDataSource(dataSourceId: number): Promise<AiAnalysis[]> {
    return db
      .select()
      .from(aiAnalyses)
      .where(eq(aiAnalyses.dataSourceId, dataSourceId))
      .orderBy(desc(aiAnalyses.createdAt));
  }

  async createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis> {
    const [result] = await db.insert(aiAnalyses).values(analysis).returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
