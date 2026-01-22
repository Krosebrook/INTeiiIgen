import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { insertDataSourceSchema, insertDashboardSchema, insertWidgetSchema } from "@shared/schema";
import { randomBytes } from "crypto";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup auth
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
        let rawData = null;
        let metadata: { rows?: number; columns?: number; size: number } = { size: file.size };

        // Parse CSV and JSON files
        if (fileType === "csv") {
          const content = file.buffer.toString("utf-8");
          const lines = content.split("\n").filter((l) => l.trim());
          if (lines.length > 0) {
            const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
            const rows = lines.slice(1).map((line) => {
              const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
              const row: Record<string, string> = {};
              headers.forEach((h, i) => {
                row[h] = values[i] || "";
              });
              return row;
            });
            rawData = rows;
            metadata.rows = rows.length;
            metadata.columns = headers.length;
          }
        } else if (fileType === "json") {
          try {
            const content = file.buffer.toString("utf-8");
            rawData = JSON.parse(content);
            if (Array.isArray(rawData)) {
              metadata.rows = rawData.length;
              metadata.columns = Object.keys(rawData[0] || {}).length;
            }
          } catch {
            rawData = null;
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
      
      const { provider, fileId, fileName } = req.body;
      if (!provider || !fileId) {
        return res.status(400).json({ error: "Provider and file ID are required" });
      }

      const source = await storage.createDataSource({
        userId,
        name: fileName || `Cloud file ${fileId}`,
        type: provider,
        sourceUrl: fileId,
        status: "pending",
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

      // Create a sample analysis (would integrate with OpenAI in production)
      const analysis = await storage.createAiAnalysis({
        dataSourceId: source.id,
        analysisType: "summary",
        result: {
          title: `Analysis of ${source.name}`,
          content: "AI analysis would appear here with insights about your data.",
          items: [
            "Data appears to have consistent formatting",
            "No major anomalies detected",
            "Consider visualizing key metrics",
          ],
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

      // Would integrate with OpenAI to generate insights for all widgets
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
      
      // Verify dashboard ownership
      const dashboard = await storage.getDashboard(dashboardId, userId);
      if (!dashboard) return res.status(404).json({ error: "Dashboard not found" });

      // Get data source if specified
      let widgetData: any[] = [];
      if (dataSourceId) {
        const source = await storage.getDataSource(dataSourceId, userId);
        if (source?.rawData && Array.isArray(source.rawData)) {
          widgetData = source.rawData.slice(0, 100); // Limit to 100 rows
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

  // Cloud storage API (placeholder for actual integrations)
  app.get("/api/cloud/:provider/files", isAuthenticated, async (req, res) => {
    try {
      // Placeholder - would integrate with actual cloud APIs
      res.json({ files: [] });
    } catch (error) {
      console.error("Error fetching cloud files:", error);
      res.status(500).json({ error: "Failed to fetch cloud files" });
    }
  });

  return httpServer;
}
