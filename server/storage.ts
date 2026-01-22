import { eq, and, desc, or, inArray } from "drizzle-orm";
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
  type Organization,
  type InsertOrganization,
  type OrganizationMember,
  type InsertOrganizationMember,
  dataSources,
  dashboards,
  widgets,
  aiAnalyses,
  organizations,
  organizationMembers,
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

  // Organizations
  getOrganizations(userId: string): Promise<Organization[]>;
  getOrganization(id: number, userId: string): Promise<Organization | undefined>;
  getOrganizationBySlug(slug: string): Promise<Organization | undefined>;
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  updateOrganization(id: number, userId: string, data: Partial<Organization>): Promise<Organization | undefined>;
  deleteOrganization(id: number, userId: string): Promise<boolean>;

  // Organization Members
  getOrganizationMembers(organizationId: number): Promise<OrganizationMember[]>;
  addOrganizationMember(member: InsertOrganizationMember): Promise<OrganizationMember>;
  updateMemberRole(organizationId: number, memberId: number, role: string): Promise<OrganizationMember | undefined>;
  removeOrganizationMember(organizationId: number, memberId: number): Promise<boolean>;
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

  // Organizations
  async getOrganizations(userId: string): Promise<Organization[]> {
    const memberships = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, userId));
    
    if (memberships.length === 0) return [];
    
    const orgIds = memberships.map(m => m.organizationId);
    return db
      .select()
      .from(organizations)
      .where(inArray(organizations.id, orgIds))
      .orderBy(desc(organizations.createdAt));
  }

  async getOrganization(id: number, userId: string): Promise<Organization | undefined> {
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(and(
        eq(organizationMembers.organizationId, id),
        eq(organizationMembers.userId, userId)
      ));
    
    if (!membership) return undefined;
    
    const [result] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id));
    return result;
  }

  async getOrganizationBySlug(slug: string): Promise<Organization | undefined> {
    const [result] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, slug));
    return result;
  }

  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    const [result] = await db.insert(organizations).values(organization).returning();
    
    await db.insert(organizationMembers).values({
      organizationId: result.id,
      userId: organization.ownerId,
      role: "owner",
    });
    
    return result;
  }

  async updateOrganization(id: number, userId: string, data: Partial<Organization>): Promise<Organization | undefined> {
    const org = await this.getOrganization(id, userId);
    if (!org || org.ownerId !== userId) return undefined;
    
    const [result] = await db
      .update(organizations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return result;
  }

  async deleteOrganization(id: number, userId: string): Promise<boolean> {
    const org = await this.getOrganization(id, userId);
    if (!org || org.ownerId !== userId) return false;
    
    const result = await db
      .delete(organizations)
      .where(eq(organizations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Organization Members
  async getOrganizationMembers(organizationId: number): Promise<OrganizationMember[]> {
    return db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, organizationId))
      .orderBy(organizationMembers.createdAt);
  }

  async addOrganizationMember(member: InsertOrganizationMember): Promise<OrganizationMember> {
    const [result] = await db
      .insert(organizationMembers)
      .values(member)
      .returning();
    return result;
  }

  async updateMemberRole(organizationId: number, memberId: number, role: string): Promise<OrganizationMember | undefined> {
    const [result] = await db
      .update(organizationMembers)
      .set({ role })
      .where(and(
        eq(organizationMembers.id, memberId),
        eq(organizationMembers.organizationId, organizationId)
      ))
      .returning();
    return result;
  }

  async removeOrganizationMember(organizationId: number, memberId: number): Promise<boolean> {
    const result = await db
      .delete(organizationMembers)
      .where(and(
        eq(organizationMembers.id, memberId),
        eq(organizationMembers.organizationId, organizationId)
      ));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
