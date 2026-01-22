import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { insertDataSourceSchema, insertDashboardSchema, insertWidgetSchema } from "@shared/schema";
import { randomBytes } from "crypto";
import multer from "multer";
import * as XLSX from "xlsx";
import OpenAI from "openai";
import {
  listGoogleDriveFiles,
  downloadGoogleDriveFile,
  isGoogleDriveConnected,
  listOneDriveFiles,
  downloadOneDriveFile,
  isOneDriveConnected,
  listNotionPages,
  listNotionDatabases,
  getNotionDatabaseRows,
  getNotionPageContent,
  isNotionConnected,
} from "./cloud-providers";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

function parseExcel(buffer: Buffer): { data: Record<string, any>[]; headers: string[] } | null {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return null;
    
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    
    if (!Array.isArray(jsonData) || jsonData.length === 0) return null;
    
    const headers = Object.keys(jsonData[0] as object);
    return {
      data: jsonData as Record<string, any>[],
      headers,
    };
  } catch (error) {
    console.error("Excel parse error:", error);
    return null;
  }
}

function parseCsv(content: string): { data: Record<string, string>[]; headers: string[] } | null {
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length === 0) return null;
  
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || "";
    });
    return row;
  });
  
  return { data: rows, headers };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  // Data Sources API
  app.get("/api/data-sources", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const sources = await storage.getDataSources(userId);
      res.json(sources);
    } catch (error) {
      console.error("Error fetching data sources:", error);
      res.status(500).json({ error: "Failed to fetch data sources" });
    }
  });

  app.get("/api/data-sources/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const source = await storage.getDataSource(parseInt(req.params.id), userId);
      if (!source) return res.status(404).json({ error: "Data source not found" });
      
      res.json(source);
    } catch (error) {
      console.error("Error fetching data source:", error);
      res.status(500).json({ error: "Failed to fetch data source" });
    }
  });

  app.post("/api/upload", isAuthenticated, upload.array("files", 10), async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const createdSources = [];
      for (const file of files) {
        const fileType = file.originalname.split(".").pop()?.toLowerCase() || "unknown";
        let rawData: any = null;
        let metadata: { rows?: number; columns?: number; size: number; headers?: string[] } = { size: file.size };

        if (fileType === "csv") {
          const content = file.buffer.toString("utf-8");
          const parsed = parseCsv(content);
          if (parsed) {
            rawData = parsed.data;
            metadata.rows = parsed.data.length;
            metadata.columns = parsed.headers.length;
            metadata.headers = parsed.headers;
          }
        } else if (fileType === "json") {
          try {
            const content = file.buffer.toString("utf-8");
            rawData = JSON.parse(content);
            if (Array.isArray(rawData)) {
              metadata.rows = rawData.length;
              metadata.columns = Object.keys(rawData[0] || {}).length;
              metadata.headers = Object.keys(rawData[0] || {});
            }
          } catch {
            rawData = null;
          }
        } else if (fileType === "xlsx" || fileType === "xls") {
          const parsed = parseExcel(file.buffer);
          if (parsed) {
            rawData = parsed.data;
            metadata.rows = parsed.data.length;
            metadata.columns = parsed.headers.length;
            metadata.headers = parsed.headers;
          }
        }

        const source = await storage.createDataSource({
          userId,
          name: file.originalname,
          type: "file",
          fileType,
          rawData,
          metadata,
          status: rawData ? "ready" : "pending",
        });
        createdSources.push(source);
      }

      res.json({ count: createdSources.length, sources: createdSources });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ error: "Failed to upload files" });
    }
  });

  app.post("/api/data-sources/url", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: "URL is required" });

      const source = await storage.createDataSource({
        userId,
        name: new URL(url).hostname,
        type: "url",
        sourceUrl: url,
        status: "pending",
      });

      res.json(source);
    } catch (error) {
      console.error("Error creating URL source:", error);
      res.status(500).json({ error: "Failed to create URL source" });
    }
  });

  app.post("/api/data-sources/cloud", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { provider, fileId, fileName, fileType } = req.body;
      if (!provider || !fileId) {
        return res.status(400).json({ error: "Provider and file ID are required" });
      }

      let rawData: any = null;
      let metadata: { rows?: number; columns?: number; headers?: string[] } = {};
      let status = "pending";
      let actualFileType = fileType || "unknown";

      try {
        if (provider === "google-drive") {
          const file = await downloadGoogleDriveFile(fileId);
          const ext = file.name.split(".").pop()?.toLowerCase() || "";
          actualFileType = ext;
          
          if (ext === "csv" || file.mimeType === "text/csv") {
            const parsed = parseCsv(file.content.toString("utf-8"));
            if (parsed) {
              rawData = parsed.data;
              metadata = { rows: parsed.data.length, columns: parsed.headers.length, headers: parsed.headers };
              status = "ready";
            }
          } else if (ext === "json") {
            rawData = JSON.parse(file.content.toString("utf-8"));
            if (Array.isArray(rawData)) {
              metadata = { rows: rawData.length, columns: Object.keys(rawData[0] || {}).length, headers: Object.keys(rawData[0] || {}) };
              status = "ready";
            }
          } else if (ext === "xlsx" || ext === "xls") {
            const parsed = parseExcel(file.content);
            if (parsed) {
              rawData = parsed.data;
              metadata = { rows: parsed.data.length, columns: parsed.headers.length, headers: parsed.headers };
              status = "ready";
            }
          }
        } else if (provider === "onedrive") {
          const file = await downloadOneDriveFile(fileId);
          const ext = file.name.split(".").pop()?.toLowerCase() || "";
          actualFileType = ext;
          
          if (ext === "csv") {
            const parsed = parseCsv(file.content.toString("utf-8"));
            if (parsed) {
              rawData = parsed.data;
              metadata = { rows: parsed.data.length, columns: parsed.headers.length, headers: parsed.headers };
              status = "ready";
            }
          } else if (ext === "json") {
            rawData = JSON.parse(file.content.toString("utf-8"));
            if (Array.isArray(rawData)) {
              metadata = { rows: rawData.length, columns: Object.keys(rawData[0] || {}).length, headers: Object.keys(rawData[0] || {}) };
              status = "ready";
            }
          } else if (ext === "xlsx" || ext === "xls") {
            const parsed = parseExcel(file.content);
            if (parsed) {
              rawData = parsed.data;
              metadata = { rows: parsed.data.length, columns: parsed.headers.length, headers: parsed.headers };
              status = "ready";
            }
          }
        } else if (provider === "notion") {
          const rows = await getNotionDatabaseRows(fileId);
          if (rows.length > 0) {
            rawData = rows;
            const headers = Object.keys(rows[0]);
            metadata = { rows: rows.length, columns: headers.length, headers };
            status = "ready";
            actualFileType = "notion-database";
          }
        }
      } catch (cloudError) {
        console.error("Cloud download error:", cloudError);
      }

      const source = await storage.createDataSource({
        userId,
        name: fileName || `Cloud file ${fileId}`,
        type: provider,
        sourceUrl: fileId,
        fileType: actualFileType,
        rawData,
        metadata,
        status,
      });

      res.json(source);
    } catch (error) {
      console.error("Error creating cloud source:", error);
      res.status(500).json({ error: "Failed to create cloud source" });
    }
  });

  app.delete("/api/data-sources/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const deleted = await storage.deleteDataSource(parseInt(req.params.id), userId);
      if (!deleted) return res.status(404).json({ error: "Data source not found" });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting data source:", error);
      res.status(500).json({ error: "Failed to delete data source" });
    }
  });

  app.post("/api/data-sources/:id/analyze", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const source = await storage.getDataSource(parseInt(req.params.id), userId);
      if (!source) return res.status(404).json({ error: "Data source not found" });

      if (!source.rawData || !Array.isArray(source.rawData) || source.rawData.length === 0) {
        return res.status(400).json({ error: "Data source has no analyzable data" });
      }

      const sampleData = source.rawData.slice(0, 20);
      const dataPreview = JSON.stringify(sampleData, null, 2);
      
      const prompt = `Analyze this dataset and provide insights. The data source is "${source.name}" with ${(source.metadata as any)?.rows || "unknown"} rows and ${(source.metadata as any)?.columns || "unknown"} columns.

Sample data (first 20 rows):
${dataPreview}

Provide a structured analysis with:
1. A brief title summarizing what this data represents
2. A 2-3 sentence summary of the data
3. 5-7 key insights or observations about patterns, trends, or notable features
4. Suggested chart types for visualization (e.g., bar, line, pie)
5. Potential data quality issues if any

Respond in JSON format:
{
  "title": "string",
  "summary": "string",
  "insights": ["string", "string", ...],
  "suggestedCharts": ["string", "string", ...],
  "dataQualityNotes": ["string", ...]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 2048,
      });

      const analysisResult = JSON.parse(response.choices[0]?.message?.content || "{}");

      const analysis = await storage.createAiAnalysis({
        dataSourceId: source.id,
        analysisType: "summary",
        result: {
          title: analysisResult.title || `Analysis of ${source.name}`,
          content: analysisResult.summary || "Analysis completed.",
          items: analysisResult.insights || [],
          suggestedCharts: analysisResult.suggestedCharts || [],
          dataQualityNotes: analysisResult.dataQualityNotes || [],
        },
      });

      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing data source:", error);
      res.status(500).json({ error: "Failed to analyze data source" });
    }
  });

  // Dashboards API
  app.get("/api/dashboards", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const userDashboards = await storage.getDashboards(userId);
      res.json(userDashboards);
    } catch (error) {
      console.error("Error fetching dashboards:", error);
      res.status(500).json({ error: "Failed to fetch dashboards" });
    }
  });

  app.get("/api/dashboards/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const dashboard = await storage.getDashboard(parseInt(req.params.id), userId);
      if (!dashboard) return res.status(404).json({ error: "Dashboard not found" });
      
      res.json(dashboard);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res.status(500).json({ error: "Failed to fetch dashboard" });
    }
  });

  app.post("/api/dashboards", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { title, description, isPublic } = req.body;
      
      const shareToken = isPublic ? randomBytes(16).toString("hex") : null;
      
      const dashboard = await storage.createDashboard({
        userId,
        title,
        description,
        isPublic: isPublic || false,
        shareToken,
      });

      res.json(dashboard);
    } catch (error) {
      console.error("Error creating dashboard:", error);
      res.status(500).json({ error: "Failed to create dashboard" });
    }
  });

  app.patch("/api/dashboards/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const dashboard = await storage.updateDashboard(parseInt(req.params.id), userId, req.body);
      if (!dashboard) return res.status(404).json({ error: "Dashboard not found" });
      
      res.json(dashboard);
    } catch (error) {
      console.error("Error updating dashboard:", error);
      res.status(500).json({ error: "Failed to update dashboard" });
    }
  });

  app.delete("/api/dashboards/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const deleted = await storage.deleteDashboard(parseInt(req.params.id), userId);
      if (!deleted) return res.status(404).json({ error: "Dashboard not found" });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting dashboard:", error);
      res.status(500).json({ error: "Failed to delete dashboard" });
    }
  });

  app.post("/api/dashboards/:id/insights", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const dashboard = await storage.getDashboard(parseInt(req.params.id), userId);
      if (!dashboard) return res.status(404).json({ error: "Dashboard not found" });

      res.json({ success: true, message: "Insights generation started" });
    } catch (error) {
      console.error("Error generating insights:", error);
      res.status(500).json({ error: "Failed to generate insights" });
    }
  });

  // Widgets API
  app.get("/api/dashboards/:id/widgets", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const dashboard = await storage.getDashboard(parseInt(req.params.id), userId);
      if (!dashboard) return res.status(404).json({ error: "Dashboard not found" });
      
      const dashboardWidgets = await storage.getWidgets(dashboard.id);
      res.json(dashboardWidgets);
    } catch (error) {
      console.error("Error fetching widgets:", error);
      res.status(500).json({ error: "Failed to fetch widgets" });
    }
  });

  app.post("/api/widgets", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { dashboardId, type, title, config, position, dataSourceId } = req.body;
      
      const dashboard = await storage.getDashboard(dashboardId, userId);
      if (!dashboard) return res.status(404).json({ error: "Dashboard not found" });

      let widgetData: any[] = [];
      if (dataSourceId) {
        const source = await storage.getDataSource(dataSourceId, userId);
        if (source?.rawData && Array.isArray(source.rawData)) {
          widgetData = source.rawData.slice(0, 100);
        }
      }

      const widget = await storage.createWidget({
        dashboardId,
        dataSourceId: dataSourceId || null,
        type,
        title,
        config: { ...config, data: widgetData },
        position: position || { x: 0, y: 0, w: 1, h: 1 },
      });

      res.json(widget);
    } catch (error) {
      console.error("Error creating widget:", error);
      res.status(500).json({ error: "Failed to create widget" });
    }
  });

  app.patch("/api/widgets/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const widget = await storage.getWidget(parseInt(req.params.id));
      if (!widget) return res.status(404).json({ error: "Widget not found" });

      const dashboard = await storage.getDashboard(widget.dashboardId, userId);
      if (!dashboard) return res.status(403).json({ error: "Forbidden" });

      const updated = await storage.updateWidget(widget.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating widget:", error);
      res.status(500).json({ error: "Failed to update widget" });
    }
  });

  app.delete("/api/widgets/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const widget = await storage.getWidget(parseInt(req.params.id));
      if (!widget) return res.status(404).json({ error: "Widget not found" });

      const dashboard = await storage.getDashboard(widget.dashboardId, userId);
      if (!dashboard) return res.status(403).json({ error: "Forbidden" });

      const deleted = await storage.deleteWidget(widget.id);
      if (!deleted) return res.status(404).json({ error: "Widget not found" });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting widget:", error);
      res.status(500).json({ error: "Failed to delete widget" });
    }
  });

  // AI Analyses API
  app.get("/api/ai-analyses", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const analyses = await storage.getAiAnalyses(userId);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      res.status(500).json({ error: "Failed to fetch analyses" });
    }
  });

  // Cloud storage APIs
  app.get("/api/cloud/status", isAuthenticated, async (req, res) => {
    try {
      const [googleDrive, oneDrive, notion] = await Promise.all([
        isGoogleDriveConnected(),
        isOneDriveConnected(),
        isNotionConnected(),
      ]);
      
      res.json({
        "google-drive": googleDrive,
        onedrive: oneDrive,
        notion: notion,
      });
    } catch (error) {
      console.error("Error checking cloud status:", error);
      res.status(500).json({ error: "Failed to check cloud status" });
    }
  });

  app.get("/api/cloud/:provider/files", isAuthenticated, async (req, res) => {
    try {
      const { provider } = req.params;
      const { folderId } = req.query;
      
      let files: any[] = [];
      
      if (provider === "google-drive") {
        const rawFiles = await listGoogleDriveFiles(folderId as string | undefined);
        files = rawFiles.map((f: any) => ({
          id: f.id,
          name: f.name,
          mimeType: f.mimeType,
          size: f.size,
          modifiedTime: f.modifiedTime,
          isFolder: f.mimeType === "application/vnd.google-apps.folder",
        }));
      } else if (provider === "onedrive") {
        files = await listOneDriveFiles(folderId as string | undefined);
      } else if (provider === "notion") {
        const [pages, databases] = await Promise.all([
          listNotionPages(),
          listNotionDatabases(),
        ]);
        files = [
          ...databases.map((d) => ({ ...d, isDatabase: true })),
          ...pages.map((p) => ({ ...p, isDatabase: false })),
        ];
      } else {
        return res.status(400).json({ error: "Unknown provider" });
      }
      
      res.json({ files });
    } catch (error: any) {
      console.error("Error fetching cloud files:", error);
      if (error.message?.includes("not connected")) {
        return res.status(401).json({ error: "Cloud provider not connected" });
      }
      res.status(500).json({ error: "Failed to fetch cloud files" });
    }
  });

  // Public dashboard view (no auth required)
  app.get("/api/share/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      const dashboard = await storage.getDashboardByShareToken(token);
      if (!dashboard || !dashboard.isPublic) {
        return res.status(404).json({ error: "Dashboard not found or not public" });
      }
      
      const widgets = await storage.getWidgets(dashboard.id);
      
      res.json({ dashboard, widgets });
    } catch (error) {
      console.error("Error fetching shared dashboard:", error);
      res.status(500).json({ error: "Failed to fetch shared dashboard" });
    }
  });

  // Organizations API
  app.get("/api/organizations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const orgs = await storage.getOrganizations(userId);
      res.json(orgs);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      res.status(500).json({ error: "Failed to fetch organizations" });
    }
  });

  app.get("/api/organizations/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const org = await storage.getOrganization(parseInt(req.params.id), userId);
      if (!org) return res.status(404).json({ error: "Organization not found" });
      
      res.json(org);
    } catch (error) {
      console.error("Error fetching organization:", error);
      res.status(500).json({ error: "Failed to fetch organization" });
    }
  });

  app.post("/api/organizations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const { name, slug } = req.body;
      if (!name || !slug) {
        return res.status(400).json({ error: "Name and slug are required" });
      }

      const existing = await storage.getOrganizationBySlug(slug);
      if (existing) {
        return res.status(400).json({ error: "Slug already taken" });
      }

      const org = await storage.createOrganization({
        name,
        slug,
        ownerId: userId,
      });

      res.json(org);
    } catch (error) {
      console.error("Error creating organization:", error);
      res.status(500).json({ error: "Failed to create organization" });
    }
  });

  app.patch("/api/organizations/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const org = await storage.updateOrganization(parseInt(req.params.id), userId, req.body);
      if (!org) return res.status(404).json({ error: "Organization not found or you're not the owner" });
      
      res.json(org);
    } catch (error) {
      console.error("Error updating organization:", error);
      res.status(500).json({ error: "Failed to update organization" });
    }
  });

  app.delete("/api/organizations/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const deleted = await storage.deleteOrganization(parseInt(req.params.id), userId);
      if (!deleted) return res.status(404).json({ error: "Organization not found or you're not the owner" });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting organization:", error);
      res.status(500).json({ error: "Failed to delete organization" });
    }
  });

  // Organization Members API
  app.get("/api/organizations/:id/members", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const org = await storage.getOrganization(parseInt(req.params.id), userId);
      if (!org) return res.status(404).json({ error: "Organization not found" });
      
      const members = await storage.getOrganizationMembers(org.id);
      res.json(members);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ error: "Failed to fetch members" });
    }
  });

  app.post("/api/organizations/:id/members", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const org = await storage.getOrganization(parseInt(req.params.id), userId);
      if (!org) return res.status(404).json({ error: "Organization not found" });
      if (org.ownerId !== userId) return res.status(403).json({ error: "Only the owner can add members" });
      
      const { memberUserId, role } = req.body;
      if (!memberUserId) return res.status(400).json({ error: "Member user ID is required" });

      const member = await storage.addOrganizationMember({
        organizationId: org.id,
        userId: memberUserId,
        role: role || "member",
      });

      res.json(member);
    } catch (error) {
      console.error("Error adding member:", error);
      res.status(500).json({ error: "Failed to add member" });
    }
  });

  app.patch("/api/organizations/:id/members/:memberId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const org = await storage.getOrganization(parseInt(req.params.id), userId);
      if (!org) return res.status(404).json({ error: "Organization not found" });
      if (org.ownerId !== userId) return res.status(403).json({ error: "Only the owner can update members" });
      
      const { role } = req.body;
      if (!role) return res.status(400).json({ error: "Role is required" });

      const member = await storage.updateMemberRole(org.id, parseInt(req.params.memberId), role);
      if (!member) return res.status(404).json({ error: "Member not found" });
      
      res.json(member);
    } catch (error) {
      console.error("Error updating member:", error);
      res.status(500).json({ error: "Failed to update member" });
    }
  });

  app.delete("/api/organizations/:id/members/:memberId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const org = await storage.getOrganization(parseInt(req.params.id), userId);
      if (!org) return res.status(404).json({ error: "Organization not found" });
      if (org.ownerId !== userId) return res.status(403).json({ error: "Only the owner can remove members" });
      
      const deleted = await storage.removeOrganizationMember(org.id, parseInt(req.params.memberId));
      if (!deleted) return res.status(404).json({ error: "Member not found" });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing member:", error);
      res.status(500).json({ error: "Failed to remove member" });
    }
  });

  return httpServer;
}
